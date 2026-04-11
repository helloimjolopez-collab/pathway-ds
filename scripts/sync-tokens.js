#!/usr/bin/env node

/**
 * sync-tokens.js
 *
 * Reads Figma variable export JSON files from tokens/figma-export/
 * and transforms them into W3C DTCG format, writing the result to
 * tokens/pathway-design-tokens.json.
 *
 * Expected input format (from "Variables Import Export" plugin by Piccia Neri):
 *   [
 *     { "Collection Name": { "modes": { "Mode Name": { ...tokens... } } } },
 *     ...
 *   ]
 *
 * Usage:  npm run sync-tokens
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = resolve(__dirname, "..", "tokens", "figma-export");
const OUTPUT_PATH = resolve(__dirname, "..", "tokens", "pathway-design-tokens.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_.-]+/gi, "-")
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
      const isMultiMode = modeNames.length > 1;

      for (const [modeName, modeTokens] of Object.entries(modes)) {
        const modeSlug = slugify(modeName);
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
// Read all JSON files from the export folder
// ---------------------------------------------------------------------------
function readExportFiles() {
  if (!existsSync(EXPORT_DIR)) {
    console.error(
      `Export folder not found: ${EXPORT_DIR}\n\n` +
      `To use this script:\n` +
      `  1. In Figma, run the "Variables Import Export" plugin\n` +
      `  2. Export your variables as JSON\n` +
      `  3. Save the JSON file into: tokens/figma-export/\n` +
      `  4. Run this script again: npm run sync-tokens\n`
    );
    process.exit(1);
  }

  const files = readdirSync(EXPORT_DIR).filter(
    (f) => extname(f).toLowerCase() === ".json"
  );

  if (files.length === 0) {
    console.error(
      `No JSON files found in ${EXPORT_DIR}\n` +
      `Export your Figma variables as JSON and save them in that folder.`
    );
    process.exit(1);
  }

  let allTokens = {};

  for (const file of files) {
    const filePath = resolve(EXPORT_DIR, file);
    console.log(`Reading ${file}…`);

    let data;
    try {
      data = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.warn(`Warning: Could not parse ${file} — skipping. (${err.message})`);
      continue;
    }

    const tokens = processExport(data);
    if (!tokens) {
      console.warn(`Warning: No tokens found in ${file} — skipping.`);
      continue;
    }

    Object.assign(allTokens, tokens);
    console.log(`  Processed successfully.`);
  }

  return allTokens;
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

function mergeTokens(existing, incoming) {
  const result = {};

  // Preserve metadata from existing file
  if (existing.$themes) result.$themes = existing.$themes;
  if (existing.$metadata) result.$metadata = existing.$metadata;

  // Add incoming tokens
  for (const [key, value] of Object.entries(incoming)) {
    result[key] = value;
  }

  // Keep existing non-metadata keys not overwritten by incoming
  for (const [key, value] of Object.entries(existing)) {
    if (key.startsWith("$")) continue;
    if (key === "global" && typeof value === "object" && Object.keys(value).length === 0) continue;
    if (!(key in result)) {
      result[key] = value;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log("Reading Figma export files…\n");
  const tokens = readExportFiles();

  if (Object.keys(tokens).length === 0) {
    console.error("No tokens found in any export file.");
    process.exit(1);
  }

  console.log(`\nTransforming to W3C DTCG format…`);
  const existing = readExistingTokens();
  const merged = mergeTokens(existing, tokens);

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
