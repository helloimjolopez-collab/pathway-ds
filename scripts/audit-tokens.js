#!/usr/bin/env node

/**
 * audit-tokens.js
 *
 * Analyzes tokens/pathway-design-tokens.json and reports:
 *   - Token counts by collection
 *   - Broken alias references
 *   - Unused primitive tokens
 *   - Naming inconsistencies
 *   - Missing descriptions
 *   - Multi-mode parity
 *   - Duplicate values
 *
 * Usage:  npm run audit-tokens
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_PATH = resolve(__dirname, "..", "tokens", "pathway-design-tokens.json");

// ---------------------------------------------------------------------------
// Collect all tokens and aliases
// ---------------------------------------------------------------------------
function collectTokens(obj, path = []) {
  const results = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const currentPath = [...path, key];
    if (val && typeof val === "object" && "$type" in val && "$value" in val) {
      results.push({
        path: currentPath,
        pathStr: currentPath.join("."),
        type: val.$type,
        value: val.$value,
        hasDescription: !!val.$description,
      });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      results.push(...collectTokens(val, currentPath));
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Analysis functions
// ---------------------------------------------------------------------------
function countByCollection(tokens) {
  const counts = {};
  for (const t of tokens) {
    const coll = t.path[0];
    counts[coll] = (counts[coll] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function findBrokenAliases(tokens) {
  const allPaths = new Set(tokens.map((t) => t.pathStr));
  const broken = [];
  for (const t of tokens) {
    if (typeof t.value === "string" && /^\{.+\}$/.test(t.value)) {
      const ref = t.value.slice(1, -1);
      if (!allPaths.has(ref)) {
        broken.push({ token: t.pathStr, references: t.value });
      }
    }
  }
  return broken;
}

function findUnusedPrimitives(tokens) {
  // Collect all alias targets
  const referenced = new Set();
  for (const t of tokens) {
    if (typeof t.value === "string" && /^\{.+\}$/.test(t.value)) {
      referenced.add(t.value.slice(1, -1));
    }
  }

  const primitiveCollections = [
    "primitive-color",
    "primitive-unit",
    "primitive-border",
    "primitive-spacing",
    "primitive-type",
  ];

  const unused = [];
  for (const t of tokens) {
    if (primitiveCollections.includes(t.path[0]) && !referenced.has(t.pathStr)) {
      unused.push(t.pathStr);
    }
  }
  return unused;
}

function findNamingIssues(tokens) {
  const issues = [];

  // Check for underscore vs hyphen inconsistency
  const withUnderscores = tokens.filter((t) =>
    t.path.some((p) => p.includes("_"))
  );
  const withHyphens = tokens.filter((t) =>
    t.path.some((p) => p.includes("-"))
  );
  if (withUnderscores.length > 0 && withHyphens.length > 0) {
    const underscoreExamples = [
      ...new Set(
        withUnderscores.slice(0, 5).map((t) => t.path.find((p) => p.includes("_")))
      ),
    ];
    issues.push({
      type: "Mixed separators",
      detail: `${withUnderscores.length} tokens use underscores, ${withHyphens.length} use hyphens.`,
      examples: underscoreExamples,
    });
  }

  return issues;
}

function findDuplicateValues(tokens) {
  const valueMap = {};
  for (const t of tokens) {
    // Only check concrete values, not aliases
    if (typeof t.value === "string" && /^\{.+\}$/.test(t.value)) continue;
    const key = `${t.type}:${JSON.stringify(t.value)}`;
    if (!valueMap[key]) valueMap[key] = [];
    valueMap[key].push(t.pathStr);
  }

  return Object.entries(valueMap)
    .filter(([, paths]) => paths.length >= 3)
    .map(([key, paths]) => ({
      value: key.split(":").slice(1).join(":"),
      type: key.split(":")[0],
      count: paths.length,
      examples: paths.slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count);
}

function checkModeParity(data, collectionName) {
  const collection = data[collectionName];
  if (!collection) return null;

  const modes = Object.keys(collection);
  if (modes.length < 2) return null;

  function getLeafPaths(obj, path = []) {
    const paths = [];
    for (const [key, val] of Object.entries(obj)) {
      if (key.startsWith("$")) continue;
      const cur = [...path, key];
      if (val && typeof val === "object" && "$type" in val) {
        paths.push(cur.join("."));
      } else if (val && typeof val === "object") {
        paths.push(...getLeafPaths(val, cur));
      }
    }
    return paths;
  }

  const modePaths = {};
  for (const mode of modes) {
    modePaths[mode] = new Set(getLeafPaths(collection[mode]));
  }

  const results = { modes, counts: {}, mismatches: [] };
  for (const mode of modes) {
    results.counts[mode] = modePaths[mode].size;
  }

  // Find tokens in one mode but not others
  for (const modeA of modes) {
    for (const modeB of modes) {
      if (modeA >= modeB) continue;
      for (const path of modePaths[modeA]) {
        if (!modePaths[modeB].has(path)) {
          results.mismatches.push(`"${path}" exists in ${modeA} but not ${modeB}`);
        }
      }
      for (const path of modePaths[modeB]) {
        if (!modePaths[modeA].has(path)) {
          results.mismatches.push(`"${path}" exists in ${modeB} but not ${modeA}`);
        }
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function main() {
  if (!existsSync(TOKEN_PATH)) {
    console.error(`Token file not found: ${TOKEN_PATH}`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(TOKEN_PATH, "utf-8"));
  const tokens = collectTokens(data);

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║       PATHWAY DESIGN TOKENS AUDIT REPORT      ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // --- Token counts ---
  const counts = countByCollection(tokens);
  console.log(`TOTAL TOKENS: ${tokens.length}\n`);
  console.log("Tokens by collection:");
  const maxNameLen = Math.max(...counts.map(([n]) => n.length));
  for (const [name, count] of counts) {
    const pct = ((count / tokens.length) * 100).toFixed(0);
    console.log(`  ${name.padEnd(maxNameLen + 2)} ${String(count).padStart(5)}  (${pct}%)`);
  }

  // --- Broken aliases ---
  const broken = findBrokenAliases(tokens);
  console.log(`\n${"─".repeat(50)}`);
  if (broken.length === 0) {
    console.log("\n✓ BROKEN ALIASES: None found");
  } else {
    console.log(`\n✗ BROKEN ALIASES: ${broken.length} found\n`);
    for (const b of broken) {
      console.log(`  ${b.token}`);
      console.log(`    → references ${b.references} (DOES NOT EXIST)\n`);
    }
  }

  // --- Unused primitives ---
  const unused = findUnusedPrimitives(tokens);
  const totalPrimitives = tokens.filter((t) => t.path[0].startsWith("primitive")).length;
  console.log(`${"─".repeat(50)}`);
  if (unused.length === 0) {
    console.log("\n✓ UNUSED PRIMITIVES: None found");
  } else {
    console.log(`\n✗ UNUSED PRIMITIVES: ${unused.length} of ${totalPrimitives} (${((unused.length / totalPrimitives) * 100).toFixed(0)}%)\n`);

    // Group by collection
    const byCollection = {};
    for (const u of unused) {
      const coll = u.split(".")[0];
      if (!byCollection[coll]) byCollection[coll] = [];
      byCollection[coll].push(u);
    }
    for (const [coll, paths] of Object.entries(byCollection)) {
      console.log(`  ${coll}: ${paths.length} unused`);
      // Show first 5 examples
      for (const p of paths.slice(0, 5)) {
        console.log(`    - ${p}`);
      }
      if (paths.length > 5) {
        console.log(`    ... and ${paths.length - 5} more`);
      }
    }
  }

  // --- Naming issues ---
  const naming = findNamingIssues(tokens);
  console.log(`\n${"─".repeat(50)}`);
  if (naming.length === 0) {
    console.log("\n✓ NAMING: Consistent");
  } else {
    console.log(`\n✗ NAMING ISSUES: ${naming.length} found\n`);
    for (const issue of naming) {
      console.log(`  ${issue.type}: ${issue.detail}`);
      if (issue.examples.length > 0) {
        console.log(`    Examples: ${issue.examples.join(", ")}`);
      }
    }
  }

  // --- Missing descriptions ---
  const withDesc = tokens.filter((t) => t.hasDescription).length;
  const descPct = ((withDesc / tokens.length) * 100).toFixed(0);
  console.log(`\n${"─".repeat(50)}`);
  if (withDesc === tokens.length) {
    console.log("\n✓ DESCRIPTIONS: All tokens documented");
  } else {
    console.log(`\n✗ DESCRIPTIONS: ${withDesc} of ${tokens.length} tokens have descriptions (${descPct}%)`);
    if (withDesc === 0) {
      console.log("  No tokens have descriptions. Consider adding $description to at least semantic tokens.");
    }
  }

  // --- Multi-mode parity ---
  console.log(`\n${"─".repeat(50)}`);
  console.log("\nMULTI-MODE PARITY:");
  const multiModeCollections = [
    ["semantic-color", "Semantic Color (Light/Dark)"],
    ["semantic-type", "Semantic Type (Desktop/Mobile)"],
  ];
  for (const [coll, label] of multiModeCollections) {
    const parity = checkModeParity(data, coll);
    if (!parity) {
      console.log(`  ${label}: not found or single-mode`);
      continue;
    }
    const countsStr = parity.modes.map((m) => `${m}: ${parity.counts[m]}`).join(", ");
    if (parity.mismatches.length === 0) {
      console.log(`  ✓ ${label}: ${countsStr} — perfectly matched`);
    } else {
      console.log(`  ✗ ${label}: ${countsStr} — ${parity.mismatches.length} mismatches:`);
      for (const m of parity.mismatches.slice(0, 5)) {
        console.log(`      ${m}`);
      }
      if (parity.mismatches.length > 5) {
        console.log(`      ... and ${parity.mismatches.length - 5} more`);
      }
    }
  }

  // --- Duplicate values ---
  const dupes = findDuplicateValues(tokens);
  console.log(`\n${"─".repeat(50)}`);
  if (dupes.length === 0) {
    console.log("\n✓ DUPLICATE VALUES: None found");
  } else {
    console.log(`\n⚠ DUPLICATE VALUES: ${dupes.length} values repeated 3+ times\n`);
    for (const d of dupes.slice(0, 10)) {
      console.log(`  ${d.type} = ${d.value}  (used ${d.count}x)`);
      console.log(`    e.g. ${d.examples[0]}`);
    }
    if (dupes.length > 10) {
      console.log(`  ... and ${dupes.length - 10} more`);
    }
  }

  // --- Summary ---
  const issueCount = broken.length + (unused.length > 0 ? 1 : 0) + naming.length + (withDesc === 0 ? 1 : 0);
  console.log(`\n${"═".repeat(50)}`);
  console.log(`SUMMARY: ${issueCount} issue(s) to address`);
  if (broken.length > 0) console.log(`  • Fix ${broken.length} broken alias reference(s)`);
  if (unused.length > 0) console.log(`  • Review ${unused.length} unused primitive tokens`);
  if (naming.length > 0) console.log(`  • Fix naming inconsistencies`);
  if (withDesc === 0) console.log(`  • Add descriptions to tokens`);
  console.log("");
}

main();
