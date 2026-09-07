/**
 * check-token-refs.js — validate every token reference in source against the
 * built CSS contract.
 *
 * WHY THIS EXISTS, separately from check-demo-tokens.js:
 *
 * check-demo-tokens.js scans the standalone HTML demos for literal
 * `var(--token-name)` strings. That misses the failure mode that actually bit
 * us. Components build token names by template:
 *
 *     const SC = (p) => `var(--semantic-color-light-mode-${p})`;
 *     ... SC("fill-action-primary-base")
 *
 * A literal scan sees only the prefix `--semantic-color-light-mode-`, so it
 * reported "button.html: 4 tokens, all resolved" while button.jsx carried 121
 * references to token names that no longer existed. Every one resolved to
 * nothing at runtime, and nothing failed, because an unresolved var() is not an
 * error in CSS — it just paints nothing.
 *
 * So this script reads each file's OWN helper definitions, expands the template
 * calls, and checks the resulting names. It does not assume what the prefixes
 * are; a component is free to define its own helper, and renaming a prefix
 * cannot silently opt a file out of the check.
 *
 * Exit code 1 if any reference cannot be resolved, so CI fails loudly.
 *
 * Usage:  node scripts/check-token-refs.js [--verbose]
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const CONTRACT = [
  "src/tokens/primitives.css",
  "src/tokens/themes/light.css",
  "src/tokens/themes/midnight.css",
  "src/tokens/layout.css",
  "src/tokens/layout-contextual.css",
  "src/tokens/type.css",
  "src/tokens/motion.css",
  "src/tokens/breakpoints.css",
];

// Scratch prototypes are deliberately not held to the contract. They live here
// rather than in pathway-sandbox for history; see CLAUDE.md section 8.
const SKIP = [
  "node_modules", "storybook", "storybook-static", "dist", ".git",
  ".figma-dump", "components-sandbox", "src/tokens", "scripts",
];
const EXTS = [".jsx", ".mdx", ".html", ".css"];

function loadContract() {
  const missing = CONTRACT.filter((p) => !existsSync(p));
  if (missing.length) {
    console.error("Contract files not built. Run `npm run build-dist` first.");
    console.error("Missing: " + missing.join(", "));
    process.exit(2);
  }
  const css = CONTRACT.map((p) => readFileSync(p, "utf8")).join("\n");
  return new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry).replace(/^\.\//, "");
    if (SKIP.some((s) => p === s || p.startsWith(s + "/"))) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.includes(extname(p))) out.push(p);
  }
  return out;
}

/**
 * Find helpers of the shape:
 *   const NAME = (arg) => `var(--some-prefix-${arg})`;
 * and return { NAME: "--some-prefix-" }. Reading these per file is the whole
 * point: the check follows a renamed prefix instead of being blinded by it.
 */
function findHelpers(txt) {
  const helpers = {};
  const re = /(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*\(\s*\w+\s*\)\s*=>\s*`var\((--[a-z0-9-]+)\$\{/g;
  for (const m of txt.matchAll(re)) helpers[m[1]] = m[2];
  return helpers;
}

function referencesIn(file, txt) {
  const refs = [];
  const localDefs = new Set([...txt.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));

  // literal var(--name)
  for (const m of txt.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
    const name = m[1];
    // a template-built name shows up as a bare prefix; the helper pass covers it
    if (/-$/.test(name)) continue;
    refs.push({ name, local: localDefs.has(name), how: "literal" });
  }

  // helper("segment") -> prefix + segment
  for (const [helper, prefix] of Object.entries(findHelpers(txt))) {
    const call = new RegExp("\\b" + helper + "\\(\\s*[\"'`]([^\"'`]+)[\"'`]", "g");
    for (const m of txt.matchAll(call)) {
      // A segment carrying ${...} is assembled at runtime, so the name is not
      // knowable here. Counted as skipped rather than reported as broken.
      if (m[1].includes("${")) {
        refs.push({ name: null, local: false, how: helper + "(template)" });
        continue;
      }
      refs.push({ name: prefix + m[1], local: false, how: helper + "()" });
    }
  }
  return refs;
}

const contract = loadContract();
const verbose = process.argv.includes("--verbose");
const files = walk(".");

const broken = new Map();
let checked = 0, ok = 0, dynamic = 0;

for (const file of files) {
  const txt = readFileSync(file, "utf8");
  for (const ref of referencesIn(file, txt)) {
    if (ref.name === null) { dynamic++; continue; }
    if (ref.local) continue;
    checked++;
    if (contract.has(ref.name)) { ok++; continue; }
    if (!broken.has(file)) broken.set(file, new Map());
    broken.get(file).set(ref.name, ref.how);
  }
}

console.log(`contract: ${contract.size} custom properties across ${CONTRACT.length} files`);
console.log(`scanned:  ${files.length} source files, ${checked} resolvable references`);
console.log(`resolved: ${ok}`);
if (dynamic) console.log(`skipped:  ${dynamic} references built from interpolated values (cannot be checked statically)`);

if (!broken.size) {
  console.log("\nEvery token reference resolves against the contract.");
  process.exit(0);
}

let total = 0;
console.log("\nUNRESOLVED REFERENCES\n");
for (const [file, names] of [...broken.entries()].sort()) {
  total += names.size;
  console.log(`  ${file}  (${names.size})`);
  if (verbose) {
    for (const [name, how] of [...names.entries()].sort()) {
      console.log(`      ${name}   via ${how}`);
    }
  }
}
console.log(`\n${total} unresolved token references in ${broken.size} files.`);
console.log("An unresolved var() paints nothing and raises no error, so these fail silently in the browser.");
if (!verbose) console.log("Re-run with --verbose to list every name.");
process.exit(1);
