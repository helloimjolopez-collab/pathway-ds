#!/usr/bin/env node

/**
 * retire-tokens-css.js
 *
 * One-time migration off src/tokens/tokens.css. Run once, commit, done.
 *
 * WHY
 * tokens.css emits every variable times every mode, with the mode baked into the
 * property name. That is 2,338 custom properties, and it is the file every demo,
 * Storybook and the npm package actually loaded. A developer opening it sees 2,338
 * tokens and reasonably concludes the system is too granular to adopt. The
 * restructure cut the CONTRACT to 329 colour names, but left the 2,338-property
 * file wired up, so nobody could see the benefit.
 *
 * The replacement set, all modeless, mode and breakpoint resolved by selector or
 * media query:
 *
 *   themes/light.css + themes/midnight.css   329 colour names (self-contained)
 *   layout.css                                39 spacing names
 *   layout-contextual.css                     34 component metrics
 *   type-classes.css                         111 .pw-type-* classes
 *   motion.css                                17 motion names
 *   breakpoints.css                            5 breakpoint names
 *
 * WHAT THIS SCRIPT DOES
 *   1. Strips the `light-mode-` segment from literal colour references, since the
 *      themes files carry the same name without it.
 *   2. Rewrites the <link>/import lists so every demo and Storybook load the
 *      replacement set instead of tokens.css.
 *
 * WHAT IT REFUSES TO DO
 *   - `dark-mode-` / `midnight-mode-` references. Under selector-based theming one
 *     name resolves to one value, so a component that styles a permanently dark
 *     region by reaching for the dark name needs a [data-theme="midnight"] WRAPPER
 *     instead. That is a behavioural change per component; a string edit would
 *     silently make those regions light.
 *   - `semantic-type-*` custom properties. Type is consumed as a class now, so
 *     these need the declaration block restructured, not renamed.
 *   Both are reported for hand work.
 *
 * Usage:
 *   node scripts/retire-tokens-css.js --dry-run
 *   node scripts/retire-tokens-css.js
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");

// The replacement set, in load order. primitives.css is deliberately absent:
// the themes are self-contained now, so a consumer never needs it.
const REPLACEMENT_CSS = [
  "themes/light.css",
  "themes/midnight.css",
  "layout.css",
  "layout-contextual.css",
  "type-classes.css",
  "motion.css",
  "breakpoints.css",
];

const defined = new Set();
for (const f of REPLACEMENT_CSS) {
  const p = `src/tokens/${f}`;
  if (!existsSync(p)) { console.error(`missing replacement output: ${p} — run the build first`); process.exit(2); }
  for (const line of readFileSync(p, "utf-8").split("\n")) {
    const m = line.match(/^\s*--([a-z0-9-]+)\s*:/);
    if (m) defined.add(m[1]);
  }
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|jsx?|mdx|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = [...walk("components"), ...walk("src/stories"), ...walk(".storybook")];

let stripped = 0, relinked = 0;
const needsHand = { dark: new Map(), type: new Map(), unresolved: new Map() };

for (const file of files) {
  const src = readFileSync(file, "utf-8");
  let out = src;

  // ── 1. light-mode literals become the modeless name ──
  out = out.replace(/--semantic-color-light-mode-([a-z0-9-]+)/g, (whole, tail) => {
    const to = `--semantic-color-${tail}`;
    if (!defined.has(to.slice(2))) {
      if (!needsHand.unresolved.has(whole)) needsHand.unresolved.set(whole, new Set());
      needsHand.unresolved.get(whole).add(file);
      return whole;
    }
    stripped++;
    return to;
  });

  // ── 2. report, never rewrite, the two behavioural classes ──
  for (const m of src.matchAll(/--semantic-color-(?:dark|midnight)-mode-[a-z0-9-]+/g)) {
    if (!needsHand.dark.has(file)) needsHand.dark.set(file, 0);
    needsHand.dark.set(file, needsHand.dark.get(file) + 1);
  }
  for (const m of src.matchAll(/--semantic-type-[a-z0-9-]+/g)) {
    if (m[0].endsWith("-")) continue;               // runtime-built prefix
    if (!needsHand.type.has(file)) needsHand.type.set(file, 0);
    needsHand.type.set(file, needsHand.type.get(file) + 1);
  }

  // ── 3. swap the stylesheet links ──
  // A demo links ../../src/tokens/tokens.css; Storybook imports it. Replace the
  // single reference with the replacement set, preserving the relative prefix.
  const linkRe = /(\s*)<link[^>]*href=(["'])([^"']*?)src\/tokens\/tokens\.css\2[^>]*>/g;
  out = out.replace(linkRe, (whole, indent, q, prefix) => {
    relinked++;
    return REPLACEMENT_CSS.map(
      (f) => `${indent}<link rel="stylesheet" href=${q}${prefix}src/tokens/${f}${q} />`
    ).join("");
  });
  const importRe = /^(\s*)import\s+(["'])([^"']*?)tokens\/tokens\.css\2;?\s*$/gm;
  out = out.replace(importRe, (whole, indent, q, prefix) => {
    relinked++;
    return REPLACEMENT_CSS.map((f) => `${indent}import ${q}${prefix}tokens/${f}${q};`).join("\n");
  });

  if (out !== src && !DRY) writeFileSync(file, out, "utf-8");
}

console.log(`light-mode segments stripped : ${stripped}`);
console.log(`stylesheet references swapped: ${relinked}${DRY ? "  (dry run, nothing written)" : ""}`);

const section = (label, map, note) => {
  if (!map.size) return;
  console.log(`\n${label} (${[...map.values()].reduce((a, b) => a + (typeof b === "number" ? b : b.size), 0)} across ${map.size} file(s))`);
  for (const [k, v] of [...map].sort()) console.log(`    ${typeof v === "number" ? String(v).padStart(4) : ""}  ${k}`);
  console.log(`    ${note}`);
};
section("NEEDS HAND WORK — dark-region styling by name", needsHand.dark,
  "Wrap the region in [data-theme=\"midnight\"] and use the modeless name.");
section("NEEDS HAND WORK — type as custom properties", needsHand.type,
  "Replace the five declarations with one .pw-type-* class.");
section("UNRESOLVED — no modeless equivalent exists", needsHand.unresolved,
  "These are genuinely missing from the contract; do not invent a replacement.");

if (needsHand.dark.size || needsHand.type.size || needsHand.unresolved.size) {
  console.log("\ntokens.css cannot be dropped until the hand-work items above are cleared.");
  process.exitCode = 1;
}
