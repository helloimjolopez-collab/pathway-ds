#!/usr/bin/env node

/**
 * sync-tokens.js
 *
 * Reads the Figma variable export from tokens/figma-export/pathwaytokens.json
 * and transforms it into W3C DTCG format, writing the result to
 * tokens/pathway-design-tokens.json.
 *
 * Expected input format (from "Variables Import Export" plugin by Piccia Neri):
 *   [
 *     { "Collection Name": { "modes": { "Mode Name": { ...tokens... } } } },
 *     ...
 *   ]
 *
 * Rules this script enforces (see CLAUDE.md §2):
 *   1. The Figma export is authoritative. Whatever ships in the export is the
 *      truth; this script mirrors it. No merging with stale previous runs.
 *   2. Dark-mode tokens are currently filtered out (see §2.1). Pathway is not
 *      shipping dark mode yet. To re-enable, clear `EXCLUDED_MODE_SLUGS` below
 *      and delete the TEMPORARILY EXCLUDED notice near the top of the output
 *      when it prints.
 *   3. Tokens whose alias target doesn't exist (e.g. a semantic pointing at a
 *      primitive that was deleted in Figma) are dropped from the output with
 *      a warning. Never ask the user to fix broken aliases — the script heals
 *      them by dropping the orphan.
 *
 * Usage:  npm run sync-tokens
 */

// Modes whose slugified name matches any of these are dropped entirely from
// the derived output. Slug form — lowercase, dots/spaces → hyphens.
// Dark mode is now included. See CLAUDE.md §2.1 for the full policy.
const EXCLUDED_MODE_SLUGS = new Set([]);

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPORT_FILE = resolve(__dirname, "..", "tokens", "figma-export", "pathwaytokens.json");
const OUTPUT_PATH = resolve(__dirname, "..", "tokens", "pathway-design-tokens.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")               // normalise underscores → hyphens before anything else
    .replace(/[^a-z0-9/.-]+/g, "-")  // replace remaining non-kebab chars (note: _ no longer allowed)
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const FIGMA_TYPE_MAP = {
  color: "color",
  float: "number",
  string: "string",
  boolean: "boolean",
};

function setNestedValue(obj, pathParts, value) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    if (!(key in current) || (current[key] && current[key].$type)) {
      current[key] = {};
    }
    current = current[key];
  }
  current[pathParts[pathParts.length - 1]] = value;
}

// ---------------------------------------------------------------------------
// Process the plugin export format
// ---------------------------------------------------------------------------
function processExport(data) {
  // data is an array: [ { "Collection Name": { modes: { ... } } }, ... ]
  if (!Array.isArray(data)) {
    console.warn("Warning: Export file is not an array — skipping.");
    return null;
  }

  const tokens = {};

  for (const entry of data) {
    // Each entry has one key: the collection name
    for (const [collectionName, collectionData] of Object.entries(entry)) {
      const collSlug = slugify(collectionName);
      const modes = collectionData.modes;

      if (!modes || typeof modes !== "object") {
        console.warn(`Warning: Collection "${collectionName}" has no modes — skipping.`);
        continue;
      }

      const modeNames = Object.keys(modes);
      // isMultiMode is determined by the ORIGINAL export, not by the filtered
      // set. This keeps CSS variable names stable — if Figma exports a
      // "Light Mode" + "Dark Mode" pair and we filter one out, the remaining
      // tokens still carry the mode segment (e.g. "light-mode") so downstream
      // consumers don't need to change their variable references depending on
      // whether dark mode happens to be excluded at build time.
      const isMultiMode = modeNames.length > 1;

      for (const [modeName, modeTokens] of Object.entries(modes)) {
        const modeSlug = slugify(modeName);

        // Dark mode (and anything else in EXCLUDED_MODE_SLUGS) is dropped
        // wholesale. See CLAUDE.md §2.1.
        if (EXCLUDED_MODE_SLUGS.has(modeSlug)) {
          console.warn(`  Skipping excluded mode: ${collectionName} / ${modeName}`);
          continue;
        }

        processTokenGroup(modeTokens, [], (path, leaf) => {
          const fullPath = isMultiMode
            ? [collSlug, modeSlug, ...path]
            : [collSlug, ...path];
          setNestedValue(tokens, fullPath, leaf);
        });
      }
    }
  }

  return Object.keys(tokens).length > 0 ? tokens : null;
}

/**
 * Recursively walk the token tree. When we find a leaf (has $type and $value),
 * call the callback with the path and the DTCG token object.
 */
function processTokenGroup(obj, pathSoFar, callback) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("$")) continue; // skip metadata keys at group level

    const currentPath = [...pathSoFar, slugify(key)];

    if (val && typeof val === "object" && "$type" in val && "$value" in val) {
      // This is a token leaf
      const dtcgType = FIGMA_TYPE_MAP[val.$type];
      if (!dtcgType) {
        console.warn(`Warning: Skipping "${currentPath.join("/")}" — unsupported type "${val.$type}"`);
        continue;
      }

      const tokenLeaf = {
        $type: dtcgType,
        $value: formatValue(val.$value, dtcgType, val.$collectionName),
      };

      if (val.$description) {
        tokenLeaf.$description = val.$description;
      }

      callback(currentPath, tokenLeaf);
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      // Nested group — recurse
      processTokenGroup(val, currentPath, callback);
    }
  }
}

/**
 * Format a token value for DTCG output.
 * - Aliases like "{Brand.300}" are preserved as references,
 *   prefixed with the source collection name if available.
 * - Color hex strings are lowercased.
 * - Everything else is passed through as-is.
 */
function formatValue(raw, dtcgType, collectionName) {
  // Alias reference: "{Something.something}"
  if (typeof raw === "string" && /^\{.+\}$/.test(raw)) {
    const inner = raw.slice(1, -1);
    if (collectionName) {
      // Prefix with collection slug so the reference is fully qualified
      return `{${slugify(collectionName)}.${inner.split(".").map(slugify).join(".")}}`;
    }
    return `{${inner.split(".").map(slugify).join(".")}}`;
  }

  // Color hex string
  if (dtcgType === "color" && typeof raw === "string") {
    return raw.toLowerCase();
  }

  // Color RGBA object (just in case)
  if (dtcgType === "color" && raw && typeof raw === "object" && "r" in raw) {
    const normalize = (v) => (v <= 1 ? Math.round(v * 255) : Math.round(v));
    const hex = (v) => normalize(v).toString(16).padStart(2, "0");
    const base = `#${hex(raw.r)}${hex(raw.g)}${hex(raw.b)}`;
    return raw.a !== undefined && raw.a < 1 ? `${base}${hex(raw.a)}` : base;
  }

  return raw;
}

// ---------------------------------------------------------------------------
// Read the export file
// ---------------------------------------------------------------------------
function readExportFile() {
  if (!existsSync(EXPORT_FILE)) {
    console.error(
      `Export file not found: ${EXPORT_FILE}\n\n` +
      `To use this script:\n` +
      `  1. In Figma, run the "Variables Import Export" plugin\n` +
      `  2. Export your variables as JSON\n` +
      `  3. Save the file as: tokens/figma-export/pathwaytokens.json\n` +
      `  4. Run this script again: npm run sync-tokens\n`
    );
    process.exit(1);
  }

  console.log(`Reading pathwaytokens.json…`);

  let data;
  try {
    data = JSON.parse(readFileSync(EXPORT_FILE, "utf-8"));
  } catch (err) {
    console.error(`Could not parse pathwaytokens.json: ${err.message}`);
    process.exit(1);
  }

  const tokens = processExport(data);
  if (!tokens) {
    console.error("No tokens found in pathwaytokens.json.");
    process.exit(1);
  }

  console.log(`  Processed successfully.`);
  return tokens;
}

// ---------------------------------------------------------------------------
// Merge with existing output file
// ---------------------------------------------------------------------------
function readExistingTokens() {
  if (!existsSync(OUTPUT_PATH)) return {};
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    return {};
  }
}

/**
 * Produce the output tree from the incoming (Figma) tokens.
 *
 * Principle: the Figma export is the source of truth. Anything not in the
 * incoming tree does not exist. We only preserve DTCG metadata ($themes,
 * $metadata) from the existing file — never token data. Deleting a variable
 * in Figma removes it from the derived output on the next sync.
 */
function mirrorTokens(existing, incoming) {
  const result = {};
  if (existing.$themes) result.$themes = existing.$themes;
  if (existing.$metadata) result.$metadata = existing.$metadata;
  for (const [key, value] of Object.entries(incoming)) {
    result[key] = value;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Alias validation — drop tokens that reference non-existent targets
// ---------------------------------------------------------------------------

/** Resolve a dot-separated token path within the tree. Returns the node or undefined. */
function resolvePath(tree, dotted) {
  const parts = dotted.split(".");
  let cur = tree;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object" || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}

/** Is this node a DTCG token leaf (has $type + $value)? */
function isTokenLeaf(node) {
  return node && typeof node === "object" && "$type" in node && "$value" in node;
}

/**
 * Walk the tree, yielding [pathArray, leafNode] for every DTCG leaf.
 * pathArray excludes root, e.g. ["semantic-color", "light-mode", "text", …]
 */
function* iterateLeaves(tree, pathSoFar = []) {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    const here = [...pathSoFar, key];
    if (isTokenLeaf(value)) {
      yield [here, value];
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      yield* iterateLeaves(value, here);
    }
  }
}

/** Delete a token at a given path, then prune now-empty parent groups. */
function deletePath(tree, pathArray) {
  if (pathArray.length === 0) return;
  let parents = [tree];
  for (let i = 0; i < pathArray.length - 1; i++) parents.push(parents[i][pathArray[i]]);
  delete parents[parents.length - 1][pathArray[pathArray.length - 1]];
  // Walk back up pruning empty groups
  for (let i = pathArray.length - 2; i >= 0; i--) {
    const node = parents[i][pathArray[i]];
    if (node && typeof node === "object" && Object.keys(node).length === 0) {
      delete parents[i][pathArray[i]];
    } else {
      break;
    }
  }
}

/**
 * Iteratively drop any token whose $value is an alias to a path that doesn't
 * exist in the tree. Repeats until the tree is stable, so chained references
 * (A → B → C, where C is missing) cascade-drop correctly.
 *
 * Returns the list of paths that were dropped, so we can log them.
 */
function pruneBrokenAliases(tree) {
  const dropped = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const [path, leaf] of iterateLeaves(tree)) {
      const raw = leaf.$value;
      if (typeof raw !== "string" || !/^\{.+\}$/.test(raw)) continue;
      const target = raw.slice(1, -1);
      const resolved = resolvePath(tree, target);
      if (!isTokenLeaf(resolved)) {
        dropped.push({ path: path.join("."), target });
        deletePath(tree, path);
        changed = true;
      }
    }
  }
  return dropped;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log("Reading Figma export file…\n");
  const tokens = readExportFile();

  console.log(`\nTransforming to W3C DTCG format…`);
  const existing = readExistingTokens();
  const merged = mirrorTokens(existing, tokens);

  // Drop any tokens whose alias target doesn't exist in the tree. The Figma
  // export is authoritative: if you delete a primitive, any semantic that
  // pointed at it simply disappears from the derived file. This keeps Style
  // Dictionary (downstream) from failing on unresolved references.
  const dropped = pruneBrokenAliases(merged);
  if (dropped.length) {
    console.warn(`\n⚠  Dropped ${dropped.length} token${dropped.length === 1 ? "" : "s"} with unresolvable aliases:`);
    for (const { path, target } of dropped) {
      console.warn(`     ${path}  →  {${target}}  (target missing in Figma export)`);
    }
  }

  const outDir = dirname(OUTPUT_PATH);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const output = JSON.stringify(merged, null, 2) + "\n";

  // Check if content is identical
  let unchanged = false;
  if (existsSync(OUTPUT_PATH)) {
    const current = readFileSync(OUTPUT_PATH, "utf-8");
    if (current === output) {
      unchanged = true;
    }
  }

  if (unchanged) {
    console.log("No changes detected — tokens file is already up to date.");
  } else {
    writeFileSync(OUTPUT_PATH, output, "utf-8");
    console.log(`\nTokens written to ${OUTPUT_PATH}`);
  }

  const topLevelKeys = Object.keys(merged).filter((k) => !k.startsWith("$"));
  console.log(`\nCollections: ${topLevelKeys.join(", ")}`);
  console.log("Done.");
}

main();
