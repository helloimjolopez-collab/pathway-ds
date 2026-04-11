#!/usr/bin/env node

/**
 * fix-tokens.js
 *
 * Automatically fixes safe-to-fix issues in tokens/pathway-design-tokens.json:
 *
 *   --fix-names      Normalize underscores to hyphens in token keys
 *   --fix-aliases    Fix broken aliases by finding the closest matching token
 *   --list-unused    Print unused primitives (does NOT delete -- for your review)
 *   --all            Run all fixes + list unused
 *   --dry-run        Show what would change without writing the file
 *
 * Usage:
 *   npm run fix-tokens             # runs all fixes
 *   npm run fix-tokens -- --dry-run  # preview changes without saving
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_PATH = resolve(__dirname, "..", "tokens", "pathway-design-tokens.json");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const nonFlagArgs = args.filter((a) => !["--dry-run"].includes(a));
const fixAll = nonFlagArgs.includes("--all") || nonFlagArgs.length === 0;
const fixNames = fixAll || args.includes("--fix-names");
const fixAliases = fixAll || args.includes("--fix-aliases");
const listUnused = fixAll || args.includes("--list-unused");

// ---------------------------------------------------------------------------
// Load tokens
// ---------------------------------------------------------------------------
if (!existsSync(TOKEN_PATH)) {
  console.error(`Token file not found: ${TOKEN_PATH}`);
  process.exit(1);
}

const raw = readFileSync(TOKEN_PATH, "utf-8");
let data = JSON.parse(raw);
let changeCount = 0;

// ---------------------------------------------------------------------------
// Fix 1: Normalize underscores to hyphens in all keys
// ---------------------------------------------------------------------------
function normalizeKeys(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;

  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const newKey = key.includes("_") ? key.replace(/_/g, "-") : key;
    if (newKey !== key) {
      changeCount++;
      if (dryRun) {
        console.log(`  rename: "${key}" → "${newKey}"`);
      }
    }
    result[newKey] = normalizeKeys(val);
  }
  return result;
}

// Also fix underscore references inside alias $values
function normalizeAliasValues(obj) {
  if (!obj || typeof obj !== "object") return obj;

  for (const [key, val] of Object.entries(obj)) {
    if (key === "$value" && typeof val === "string" && /^\{.+\}$/.test(val)) {
      const inner = val.slice(1, -1);
      if (inner.includes("_")) {
        const fixed = `{${inner.replace(/_/g, "-")}}`;
        changeCount++;
        obj[key] = fixed;
        if (dryRun) {
          console.log(`  alias: "${val}" → "${fixed}"`);
        }
      }
    } else if (typeof val === "object" && !Array.isArray(val)) {
      normalizeAliasValues(val);
    }
  }
  return obj;
}

if (fixNames) {
  console.log(dryRun ? "PREVIEW — Naming fixes:" : "Fixing naming inconsistencies…");
  const before = changeCount;
  data = normalizeKeys(data);
  normalizeAliasValues(data);
  const fixed = changeCount - before;
  console.log(`  ${fixed} rename(s)${dryRun ? " would be made" : " applied"}\n`);
}

// ---------------------------------------------------------------------------
// Fix 2: Repair broken aliases by finding closest match
// ---------------------------------------------------------------------------
function collectAllPaths(obj, path = []) {
  const paths = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const cur = [...path, key];
    if (val && typeof val === "object" && "$type" in val && "$value" in val) {
      paths.push(cur.join("."));
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      paths.push(...collectAllPaths(val, cur));
    }
  }
  return paths;
}

function findClosestMatch(brokenRef, allPaths) {
  // Strategy: try progressively looser matches
  const parts = brokenRef.split(".");

  // 1. Try removing the last segment and finding siblings
  //    e.g., "primitive-color.blue.400" → look for "primitive-color.blue.*"
  const parent = parts.slice(0, -1).join(".");
  const lastPart = parts[parts.length - 1];
  const siblings = allPaths.filter((p) => p.startsWith(parent + ".") && p.split(".").length === parts.length);

  if (siblings.length > 0) {
    // Find the closest sibling by name similarity
    // For numeric tokens like "400", find the highest available
    const numMatch = lastPart.match(/^(\d+)/);
    if (numMatch) {
      const target = parseInt(numMatch[1]);
      let closest = null;
      let closestDist = Infinity;
      for (const s of siblings) {
        const sLast = s.split(".").pop();
        const sNum = parseInt(sLast);
        if (!isNaN(sNum) && Math.abs(sNum - target) < closestDist) {
          closestDist = Math.abs(sNum - target);
          closest = s;
        }
      }
      if (closest) return closest;
    }

    // Otherwise return the first sibling as a suggestion
    return siblings[0];
  }

  // 2. Try matching just the last 2 segments against all paths
  const tail = parts.slice(-2).join(".");
  const tailMatches = allPaths.filter((p) => p.endsWith(tail));
  if (tailMatches.length === 1) return tailMatches[0];

  return null;
}

function fixBrokenAliases(obj, allPaths) {
  if (!obj || typeof obj !== "object") return;

  for (const [key, val] of Object.entries(obj)) {
    if (key === "$value" && typeof val === "string" && /^\{.+\}$/.test(val)) {
      const ref = val.slice(1, -1);
      if (!allPaths.includes(ref)) {
        const match = findClosestMatch(ref, allPaths);
        if (match) {
          changeCount++;
          if (dryRun) {
            console.log(`  broken: {${ref}}`);
            console.log(`  fix to: {${match}}\n`);
          } else {
            obj[key] = `{${match}}`;
          }
        } else {
          console.log(`  ⚠ Cannot auto-fix: {${ref}} — no close match found. Needs manual review.`);
        }
      }
    } else if (typeof val === "object" && !Array.isArray(val)) {
      fixBrokenAliases(val, allPaths);
    }
  }
}

if (fixAliases) {
  console.log(dryRun ? "PREVIEW — Alias fixes:" : "Fixing broken aliases…");
  const allPaths = collectAllPaths(data);
  const before = changeCount;
  fixBrokenAliases(data, allPaths);
  const fixed = changeCount - before;
  console.log(`  ${fixed} alias(es)${dryRun ? " would be fixed" : " fixed"}\n`);
}

// ---------------------------------------------------------------------------
// List unused primitives (informational only — does not delete)
// ---------------------------------------------------------------------------
if (listUnused) {
  console.log("Unused primitives (for your review — not auto-deleted):\n");

  const allPaths = collectAllPaths(data);
  const referenced = new Set();
  function findRefs(obj) {
    if (!obj || typeof obj !== "object") return;
    for (const [key, val] of Object.entries(obj)) {
      if (key === "$value" && typeof val === "string" && /^\{.+\}$/.test(val)) {
        referenced.add(val.slice(1, -1));
      } else if (typeof val === "object") {
        findRefs(val);
      }
    }
  }
  findRefs(data);

  const primCollections = ["primitive-color", "primitive-unit", "primitive-border", "primitive-spacing", "primitive-type"];
  const unused = allPaths.filter((p) => primCollections.includes(p.split(".")[0]) && !referenced.has(p));

  if (unused.length === 0) {
    console.log("  None — all primitives are in use.\n");
  } else {
    const byCollection = {};
    for (const u of unused) {
      const coll = u.split(".")[0];
      if (!byCollection[coll]) byCollection[coll] = [];
      byCollection[coll].push(u);
    }

    let totalPrims = allPaths.filter((p) => primCollections.includes(p.split(".")[0])).length;
    console.log(`  ${unused.length} of ${totalPrims} primitives are unreferenced.\n`);

    for (const [coll, paths] of Object.entries(byCollection)) {
      console.log(`  ${coll} (${paths.length} unused):`);
      for (const p of paths) {
        console.log(`    - ${p}`);
      }
      console.log("");
    }

    console.log("  To remove unused primitives, review the list above and delete them");
    console.log("  in Figma, then re-export. Deleting from the JSON alone won't persist");
    console.log("  because the next Figma export will bring them back.\n");
  }
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
if (!dryRun && changeCount > 0) {
  const output = JSON.stringify(data, null, 2) + "\n";
  writeFileSync(TOKEN_PATH, output, "utf-8");
  console.log(`Done — ${changeCount} change(s) written to ${TOKEN_PATH}`);
} else if (dryRun) {
  console.log(`Dry run complete — ${changeCount} change(s) would be made. Run without --dry-run to apply.`);
} else {
  console.log("No changes needed.");
}
