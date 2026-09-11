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

// Read the live names from the THEME CSS, not from dist/. This check runs inside
// build-dist BEFORE build-dist.js writes dist/, so depending on dist/tokens.json
// meant the check passed locally (where a previous dist/ lingered) and failed on
// a clean CI checkout with "dist/tokens.json not found". The theme files are
// written by style-dictionary, which runs first in the same chain.
const THEME_CSS = "src/tokens/themes/light.css";

const SKIP = [
  "node_modules", "storybook", "storybook-static", "dist", ".git",
  ".figma-dump", "components-sandbox",
];
// .ts is here for the Code Connect templates (components/**/*.figma.ts). They
// were unscanned until 2026-09-10, which mattered because those templates are
// the code Figma Dev Mode SHOWS a developer: a stale token name in one gets
// copied straight out of the design tool into a product.
const EXTS = [".md", ".mdx", ".jsx", ".ts", ".html", ".css", ".json"];

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
  if (!existsSync(THEME_CSS)) {
    console.error(`${THEME_CSS} not found. Run \`node style-dictionary.config.js\` first.`);
    process.exit(2);
  }
  const css = readFileSync(THEME_CSS, "utf8");
  const full = new Set();
  for (const m of css.matchAll(/^\s*--semantic-color-([a-z0-9-]+)\s*:/gim)) {
    // --semantic-color-fill-action-primary-dim-rest -> fill/action/primary/dim/rest
    full.add(m[1].replace(/-/g, "/"));
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

// ─── Dash-form pass ──────────────────────────────────────────────────────────
//
// The pass above checks names written in Figma's SLASH form
// ("Fill/Action/Selection/Hover"). This one checks names written as the CSS
// custom property a developer actually copies ("--semantic-color-fill-action-
// selection-hover").
//
// WHY IT WAS ADDED (2026-09-10): a sweep found 165 distinct dash-form names in
// .md and .mdx that no longer resolve, including a line in
// docs/design-system-spec.md §4.2 instructing every component to target
// `--semantic-color-light-mode-*` — a form retired on 2026-09-03 that resolves
// to nothing. That is the overarching spec every component spec inherits from,
// so the single worst place for it to be wrong, and nothing was looking:
//   check-demo-tokens  scans HTML demos only
//   check-token-refs   scans .jsx/.mdx/.ts/.html/.css, not .md
//   this file          understood slash-form only
//
// The contract is read from the eight emitted CSS files rather than from one
// theme, because a doc can legitimately name a layout, type, motion or
// breakpoint property too.
const CONTRACT_FILES = [
  "src/tokens/primitives.css",
  "src/tokens/themes/light.css",
  "src/tokens/themes/midnight.css",
  "src/tokens/type.css",
  "src/tokens/layout.css",
  "src/tokens/layout-contextual.css",
  "src/tokens/motion.css",
  "src/tokens/breakpoints.css",
];

function liveProperties() {
  const live = new Set();
  for (const f of CONTRACT_FILES) {
    if (!existsSync(f)) {
      console.error(`${f} not found. Run \`node style-dictionary.config.js\` first.`);
      process.exit(2);
    }
    const css = readFileSync(f, "utf8");
    for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)) live.add(m[1]);
  }
  return live;
}

// Only these prefixes are ours to validate. A doc may name --my-app-thing or a
// component's own private property, and that is not this checker's business.
const OWNED_PREFIX = /^--(semantic|contextual|primitive|motion|breakpoints)-/;

const liveProps = liveProperties();

// ─── Dot-form pass ───────────────────────────────────────────────────────────
//
// The third and last name shape: "fill.action.selection.hover", which is how
// pathway-design-tokens.json keys its tree and how every spec table writes its
// first column. 183 stale ones were found on 2026-09-10, after the slash and
// dash passes were already clean.
//
// This one needs a tighter rule than the others, because dot-form is
// indistinguishable from JavaScript member access: `T.fill.navHover` and
// `T.icon.actionSecondary` look exactly like token paths. The rule that
// separates them is that segment 2 of a real token path is always a colour
// GROUP. No component's token object happens to use one of those words at that
// position, and checking it drops 31 false positives.
//
// That ambiguity is not hypothetical. The migration that cleared these
// initially rewrote `T.icon.actionSecondary` to `T.foreground.actionSecondary`
// in four files — a runtime TypeError, because the object has no `foreground`
// key — by matching `icon.action` inside it. Hence the word boundary at the end
// of the segment as well as the start.
const DOT_GROUPS = new Set(["static", "action", "surface", "focusring", "contextual"]);
const DOT_RE = /\b(?:fill|foreground|stroke|scrim|text|icon|surface)\.[a-z0-9-]+(?:\.[a-z0-9-]+)*\b/g;

// Dot-form names that documents legitimately QUOTE as retired. CLAUDE.md §3.5's
// sample reconciliation report is the main case: its whole purpose is to show a
// stale name being surfaced, so a live name there would be self-contradictory.
const RETIRED_DOT_EXAMPLES = new Set([
  "text.contextual.navitem.active",
  "icon.static.brand-warm",
  "icon.static.brand",
  "fill.action.tertiary.base",
  // CLAUDE.md §3.5 quotes this as the example of a token renamed away.
  "icon.static.brand-warm",
  // checkbox-spec.md §5.3 and the Checkbox/Search stories name the families
  // that were DELETED, in order to explain that the gaps they were once
  // reported as are closed. The retired name is the subject of the sentence.
  "fill.action.secondaryinverse",
  "fill.action.secondaryinverse.base",
  "stroke.action.secondaryinverse.base",
  "icon.action.monoinverse.base",
  "stroke.action.secondary.disabled",
  "fill.action.tertiary",
]);

// Valid dot names are exactly the paths in the generated tree. Reading them
// from there rather than deriving from the CSS avoids having to guess where a
// segment boundary falls in a name like primary-dim or secondary-inverse.
function liveDotNames() {
  const TREE = "tokens/pathway-design-tokens.json";
  if (!existsSync(TREE)) return { full: new Set(), groups: new Set() };
  const tree = JSON.parse(readFileSync(TREE, "utf8"));
  const root = tree["semantic-color"] && tree["semantic-color"]["light-mode"];
  if (!root) return { full: new Set(), groups: new Set() };
  const full = new Set();
  (function walk(node, segs) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      const next = [...segs, k];
      if (v && typeof v === "object" && "$value" in v) full.add(next.join("."));
      else if (v && typeof v === "object") walk(v, next);
    }
  })(root, []);
  const groups = new Set();
  for (const n of full) {
    const parts = n.split(".");
    for (let i = 1; i < parts.length; i++) groups.add(parts.slice(0, i).join("."));
  }
  return { full, groups };
}

const { full: liveDots, groups: liveDotGroups } = liveDotNames();

// A name ending in "-" is a PREFIX being discussed in prose ("every
// --semantic-color-* name"), not a token reference. Skipping these is not a
// loophole: a real property name never ends in a hyphen.
const isPrefixFragment = (n) => n.endsWith("-");

// Full retired names that documents legitimately QUOTE in order to say they are
// retired. This is the dash-form twin of HISTORICAL above: a line reading
// "--semantic-layout-units-desktop-1440pt-padding-base breaks every spacing
// reference" is CORRECT prose, and modernising the name would make it false.
//
// Keep this list short and specific. Every entry is a decision, not a place to
// silence a failure - if a name here starts appearing in NEW documents it is
// being used as a reference rather than quoted, and belongs in the migration
// instead.
const RETIRED_EXAMPLES = new Set([
  // CLAUDE.md §2.0 quotes this to explain why the breakpoint was stripped out
  // of layout property names.
  "--semantic-layout-units-desktop-1440pt-padding-base",
  // CLAUDE.md §3.2 and tokens/README.md quote this as the shape of a name to
  // grep for when reconciling, and as the retired mode-in-name form.
  "--semantic-color-light-mode-icon-static-neutral-base",
]);


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

  // Dot-form token paths.
  for (const m of txt.matchAll(DOT_RE)) {
    const name = m[0];
    const seg = name.split(".");
    // Two segments is a JS member access or a group prefix, not a token path.
    if (seg.length < 3) { skipped++; continue; }
    if (!DOT_GROUPS.has(seg[1])) { skipped++; continue; }
    if (RETIRED_DOT_EXAMPLES.has(name)) { skipped++; continue; }
    scanned++;
    if (liveDots.has(name) || liveDotGroups.has(name)) { valid++; continue; }
    if (!stale.has(file)) stale.set(file, new Map());
    stale.get(file).set(name, (stale.get(file).get(name) || 0) + 1);
  }

  // Dash-form custom properties.
  for (const m of txt.matchAll(/--[a-z][a-z0-9-]*/g)) {
    const prop = m[0];
    if (!OWNED_PREFIX.test(prop)) continue;
    if (isPrefixFragment(prop) || RETIRED_EXAMPLES.has(prop)) { skipped++; continue; }
    scanned++;
    if (liveProps.has(prop)) { valid++; continue; }
    if (!stale.has(file)) stale.set(file, new Map());
    stale.get(file).set(prop, (stale.get(file).get(prop) || 0) + 1);
  }

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
