/**
 * check-token-names.js — validate token names written as PROSE.
 *
 * WHY THIS EXISTS, separately from the other two checkers:
 *
 *   check-demo-tokens.js   scans HTML demos for literal var(--name)
 *   check-token-refs.js    expands helper templates in code and checks the names
 *   check-token-names.js   this one: names written as text, e.g. a spec table
 *                          saying "Fill/Contextual/NavItem/Base"
 *
 * The third case is the one that survives longest, because prose does not run.
 * A spec, an MDX docs page, or an agent brief can name a token that was deleted
 * a year ago and nothing complains — but a developer reading it, or an agent
 * generating code from it, will faithfully reproduce a name that resolves to
 * nothing. That is worse than a broken build.
 *
 * Validity rules:
 *   - A full name must match a live semantic token (case- and space-insensitive).
 *   - A GROUP name is valid if it is a proper prefix of a live token, so a spec
 *     can legitimately write "Fill/Action/Selection" when discussing the group.
 *   - Type styles (Heading/*, Label/*, Text/Body|Supporting|Dense/*) are Figma
 *     TEXT STYLES, not colour tokens. They are matched by the same shape and
 *     must be skipped or every typography table reports as broken.
 *   - Anything listed in ALLOW is a known non-token phrase.
 *
 * Usage:  node scripts/check-token-names.js [--verbose] [--json]
 * Exit 1 if any stale name is found.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const TOKENS_JSON = "dist/tokens.json";

const SKIP = [
  "node_modules", "storybook", "storybook-static", "dist", ".git",
  ".figma-dump", "components-sandbox",
];
const EXTS = [".md", ".mdx", ".jsx", ".html", ".css", ".json"];

// Names that share the slash shape but are not colour tokens. Each one is
// listed with what it actually is, so this list stays a set of decisions
// rather than a place to bury failures.
const ALLOW = new Set([
  "Icon/Leading/Size",   // anatomy: the icon FRAME, see design-system-spec 7.2
  "Icon/Trailing/Size",
  "Text/Label",          // generic prose
  // Button writes its variants as style/type. "Fill/Primary" is the Fill style
  // in the Primary type, not a token called Fill/Primary.
  "Fill/Primary",
  "Fill/Secondary",
  "Fill/Negative",
  "Fill/Tertiary",
  "Fill/Outlined/Naked", // shorthand for "the Outlined and Naked styles"
  // Ordinary English that happens to sit either side of a slash.
  "Icon/Base",
  "Text/Active",
  "Text/Icon",
  "Text/Interactive",
]);

// Files that document the migration itself, and so must keep naming what was
// retired. Rewriting these would turn accurate history into nonsense: a line
// saying "Fill/Action/Tertiary was deleted" cannot have Tertiary renamed.
const HISTORICAL = new Set([
  "docs/migration-handover.md",
]);

// Type styles share the slash shape but live in a different collection.
const TYPE_STYLE = /^(?:Heading\/|Label\/|Text\/(?:Body|Supporting|Dense)\/)/;

const TIERS = "Fill|Foreground|Stroke|Scrim|Text|Icon|Surface";
// A segment is one TitleCase word, optionally a second TitleCase word after a
// SINGLE space ("Primary Dim", "Secondary Inverse"). Requiring the second word
// to be capitalised is what stops the pattern swallowing ordinary prose like
// "Fill/Primary label on blue background", and the single space stops it
// gluing markdown table columns together ("Fill/Action        Primary").
const SEG = "[A-Z][A-Za-z0-9-]*(?: [A-Z][A-Za-z0-9-]*)?";
const NAME_RE = new RegExp(
  "\\b(?:" + TIERS + ")(?:\\/" + SEG + "){1,4}", "g"
);

function liveNames() {
  if (!existsSync(TOKENS_JSON)) {
    console.error(`${TOKENS_JSON} not found. Run \`npm run build-dist\` first.`);
    process.exit(2);
  }
  const raw = JSON.parse(readFileSync(TOKENS_JSON, "utf8"));
  const flat = [];
  (function walk(o, p = []) {
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === "object") {
        if ("value" in v || "$value" in v) flat.push(p.concat(k).join("-"));
        else walk(v, p.concat(k));
      }
    }
  })(raw);

  const full = new Set();
  for (const f of flat) {
    const m = /^semantic-color-(?:light|midnight|dark)-mode-(.+)$/.exec(f);
    if (m) full.add(m[1].replace(/-/g, "/"));
  }
  // every proper prefix is a legitimate group reference
  const groups = new Set();
  for (const n of full) {
    const parts = n.split("/");
    for (let i = 1; i < parts.length; i++) groups.add(parts.slice(0, i).join("/"));
  }
  return { full, groups };
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

const { full, groups } = liveNames();

// "Primary Dim" in prose is the token whose CSS name is primary-dim, which in
// slash form is Primary/Dim. So a spaced segment has to be tried BOTH ways:
// joined ("primarydim") and split ("primary/dim"). Checking only one of them
// reports a perfectly good name as stale, which is how a checker loses trust.
const variants = (n) => {
  const base = n.trim().toLowerCase();
  return new Set([
    base.replace(/ /g, ""),
    base.replace(/ /g, "/"),
    base.replace(/ /g, "-"),
  ]);
};
const norm = (n) => n.trim().toLowerCase().replace(/ /g, "");
const liveFull = new Set();
const liveGroup = new Set();
for (const n of full) for (const v of variants(n)) liveFull.add(v);
for (const n of groups) for (const v of variants(n)) liveGroup.add(v);
const isLive = (name) => {
  for (const v of variants(name)) if (liveFull.has(v) || liveGroup.has(v)) return true;
  return false;
};

const verbose = process.argv.includes("--verbose");
const asJson = process.argv.includes("--json");
const files = walk(".");

const stale = new Map();   // file -> Map(name -> count)
let scanned = 0, valid = 0, skipped = 0, historical = 0;

for (const file of files) {
  if (HISTORICAL.has(file)) { historical++; continue; }
  const txt = readFileSync(file, "utf8");
  for (const m of txt.matchAll(NAME_RE)) {
    const name = m[0].replace(/[\s-]+$/, "");
    if (TYPE_STYLE.test(name) || ALLOW.has(name)) { skipped++; continue; }
    scanned++;
    if (isLive(name)) { valid++; continue; }
    if (!stale.has(file)) stale.set(file, new Map());
    stale.get(file).set(name, (stale.get(file).get(name) || 0) + 1);
  }
}

if (asJson) {
  const out = {};
  for (const [f, names] of stale) out[f] = Object.fromEntries(names);
  console.log(JSON.stringify({ scanned, valid, skipped, stale: out }, null, 2));
  process.exit(stale.size ? 1 : 0);
}

console.log(`live semantic names: ${full.size} tokens, ${groups.size} group prefixes`);
console.log(`scanned ${files.length} files, ${scanned} prose token names`);
console.log(`valid:   ${valid}`);
console.log(`skipped: ${skipped} type styles and known non-token phrases`);
if (historical) console.log(`exempt:  ${historical} historical file(s) that document the migration`);

if (!stale.size) {
  console.log("\nNo document names a token that does not exist.");
  process.exit(0);
}

let total = 0, distinct = new Set();
console.log("\nSTALE TOKEN NAMES IN PROSE\n");
for (const [file, names] of [...stale.entries()].sort((a, b) => {
  const sa = [...a[1].values()].reduce((x, y) => x + y, 0);
  const sb = [...b[1].values()].reduce((x, y) => x + y, 0);
  return sb - sa;
})) {
  const n = [...names.values()].reduce((x, y) => x + y, 0);
  total += n;
  for (const k of names.keys()) distinct.add(k);
  console.log(`  ${file}   ${n} mentions, ${names.size} distinct`);
  if (verbose) for (const [name, c] of [...names.entries()].sort()) {
    console.log(`      ${name}${c > 1 ? "  x" + c : ""}`);
  }
}
console.log(`\n${total} stale mentions, ${distinct.size} distinct names, ${stale.size} files.`);
if (!verbose) console.log("Re-run with --verbose to list every name.");
process.exit(1);
