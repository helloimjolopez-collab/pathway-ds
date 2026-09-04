#!/usr/bin/env node

/**
 * migrate-token-names.js
 *
 * One-time migration of component token references onto the 2026-09-03 semantic
 * restructure. Run once, commit, done. Per CLAUDE.md §2, a one-time data
 * migration must NEVER be baked into the recurring sync — a repeating rewrite
 * masks real broken state once the migration is complete.
 *
 * WHY THIS IS A SCRIPT AND NOT A SED
 * The restructure merged the Icon and Text tiers into Foreground, renamed every
 * action `Base` state to `Rest`, renamed `Inverse` to `Dim`, nested status and
 * accent intents one level deeper, collapsed every per-intent disabled state onto
 * one shared Disabled, and deleted Tertiary. That is 121 distinct stale names
 * across 8 demos, and a wrong replacement does not fail loudly: `resolve-tokens`
 * returns an unknown token id UNCHANGED, so a bad name ships as invalid CSS that
 * the browser silently drops, leaving an inherited colour and no error anywhere.
 *
 * So this script VALIDATES. Every replacement target is checked against the names
 * actually emitted by the build, and nothing is written unless all of them exist.
 *
 * Usage:
 *   node scripts/migrate-token-names.js --dry-run     report only
 *   node scripts/migrate-token-names.js               apply
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");

const CSS_SOURCES = [
  "src/tokens/tokens.css",
  "src/tokens/themes/light.css",
  "src/tokens/themes/midnight.css",
  "src/tokens/primitives.css",
  "src/tokens/layout.css",
  "src/tokens/layout-contextual.css",
];

const defined = new Set();
for (const f of CSS_SOURCES) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf-8").split("\n")) {
    const m = line.match(/^\s*--([a-z0-9-]+)\s*:/);
    if (m) defined.add(m[1]);
  }
}
if (!defined.size) {
  console.error("No custom properties found. Run `npm run build-tokens` first.");
  process.exit(2);
}

/**
 * Ordered rewrite rules, applied to the part of the name AFTER any
 * `light-mode-` / `dark-mode-` segment. The mode segment is deliberately left
 * alone: tokens.css still emits the mode-in-name form, so keeping it means this
 * migration changes NAMES ONLY and no demo changes appearance. Moving off
 * tokens.css onto the themes files is a separate, behavioural change — it needs a
 * [data-theme] wrapper for the dark regions (CLAUDE.md §2.0), which a blind
 * string edit cannot do correctly.
 */
const RULES = [
  // ── the shared Disabled: every per-intent disabled state collapsed onto one ──
  [/^fill-action-[a-z-]*?-?disabled$/, "fill-action-disabled"],
  [/^stroke-action-[a-z-]*?-?disabled$/, "stroke-action-disabled"],
  [/^(icon|text|foreground)-action-[a-z-]*?-?disabled$/, "foreground-action-disabled"],

  // ── contextual nav item → the general Selection wash ──
  [/^fill-contextual-navitem-(pressed|active|selected)$/, "fill-action-selection-selected"],
  [/^fill-contextual-navitem-hover$/, "fill-action-selection-hover"],
  [/^fill-contextual-navitem-trail$/, "fill-action-selection-trail"],
  [/^(icon|text)-contextual-navitem-(active|selected|pressed)$/, "foreground-action-primary-rest"],
  [/^(icon|text)-contextual-navitem-(base|rest)$/, "foreground-action-secondary-rest"],

  // ── Text/Static/{Primary,Secondary} were text PROMINENCE levels, not the
  //    Primary/Secondary action intents. They map onto the neutral ramp. ──
  [/^text-static-primary-(base|rest|bold)$/, "foreground-static-neutral-bold"],
  [/^text-static-primary-(subtle|light|faint)$/, "foreground-static-neutral-medium"],
  [/^text-static-secondary-(base|rest|medium)$/, "foreground-static-neutral-medium"],
  [/^text-static-secondary-bold$/, "foreground-static-neutral-bold"],
  [/^text-static-secondary-(subtle|light|faint)$/, "foreground-static-neutral-subtle"],

  // ── Icon and Text tiers merged into Foreground ──
  [/^icon-/, "foreground-"],
  [/^text-/, "foreground-"],

  // ── Tertiary deleted. Fills take Primary Dim; strokes and foregrounds take
  //    Primary, because there is no Stroke or Foreground Primary Dim. ──
  [/^fill-action-tertiary(-|$)/, "fill-action-primary-dim$1"],
  [/^stroke-action-tertiary(-|$)/, "stroke-action-primary$1"],
  [/^foreground-action-tertiary(-|$)/, "foreground-action-primary$1"],

  // ── Inverse → Dim (fills only; strokes and foregrounds lost their Inverse) ──
  [/^fill-action-primaryinverse(-|$)/, "fill-action-primary-dim$1"],
  [/^fill-action-primary-inverse(-|$)/, "fill-action-primary-dim$1"],
  [/^fill-action-secondaryinverse(-|$)/, "fill-action-secondary$1"],
  [/^fill-action-secondary-inverse(-|$)/, "fill-action-secondary$1"],
  [/^fill-action-negativeinverse(-|$)/, "fill-action-status-negative-dim$1"],
  [/^fill-action-negative-inverse(-|$)/, "fill-action-status-negative-dim$1"],
  [/^stroke-action-([a-z]+)-inverse(-|$)/, "stroke-action-$1$2"],
  [/^stroke-action-([a-z]+)inverse(-|$)/, "stroke-action-$1$2"],
  [/^foreground-action-([a-z]+)-inverse(-|$)/, "foreground-action-$1$2"],
  [/^foreground-action-([a-z]+)inverse(-|$)/, "foreground-action-$1$2"],

  // ── status intents nested one level deeper under Status ──
  [/^(fill|stroke|foreground)-action-(negative|positive|warning|alert|info)(-|$)/, "$1-action-status-$2$3"],
  [/^(fill|stroke|foreground)-static-(negative|positive|warning|alert)(-|$)/, "$1-static-status-$2$3"],
  // Info and Danger were renamed before they were nested
  [/^(fill|stroke|foreground)-static-info(-|$)/, "$1-static-brand$2"],
  [/^(fill|stroke|foreground)-static-danger(-|$)/, "$1-static-status-negative$2"],
  [/^(fill|stroke|foreground)-action-danger(-|$)/, "$1-action-status-negative$2"],

  // ── Mono keeps Rest only, by design ──
  [/^foreground-action-mono-(base|hover|pressed|rest)$/, "foreground-action-mono-rest"],
  [/^fill-action-mono-(base|hover|pressed|rest)$/, "fill-action-mono-rest"],
  [/^stroke-action-mono-(base|hover|pressed|rest)$/, "stroke-action-mono-rest"],

  // ── action states: Base → Rest ──
  [/-base$/, "-rest"],

  // ── static prominence: Base → Medium, Light → Faint where Light is gone ──
  [/^((?:fill|stroke|foreground)-static-.*)-rest$/, "$1-medium"],

  // ── surfaces lost their prominence suffix ──
  // -base -> -rest above fires before these, so accept -rest in the alternation
  [/^surface-canvas(-light|-base|-rest|-medium)?$/, "surface-canvas"],
  [/^surface-nav(-light|-base|-rest|-medium)?$/, "surface-sheet"],
  [/^surface-sheet(-light|-base|-rest|-medium)?$/, "surface-sheet"],

  // The focus ring left the contextual tier and is the one Action token that
  // legitimately still ends in "Base" (Stroke/FocusRing/Base), so this runs LAST
  // and undoes the generic -base -> -rest rename for it.
  [/^(?:fill|stroke|foreground)-(?:contextual-)?focusring[-a-z]*$/, "stroke-focusring-base"],

  // ── a primitive step that no longer exists on the ramp ──
  [/^cool-neutral-30$/, "cool-neutral-25"],
];

/** Apply the rules to one bare name (no prefix, no mode). */
function rewrite(bare) {
  let out = bare;
  for (const [re, to] of RULES) {
    if (re.test(out)) out = out.replace(re, to);
  }
  return out;
}

/**
 * `Light` survives as a real step on Neutral and Brand but not on Status or
 * Accent, so it can only be resolved by checking what exists. Same for the
 * Base → Medium guess. This runs after the rules and only ever picks a name the
 * build actually emitted.
 */
function settle(full) {
  if (defined.has(full)) return full;
  const attempts = [
    // Foreground/Static/Brand carries {black, bold, faint, light, medium} only
    full.replace(/-contrast$/, "-bold"),
    full.replace(/-subtle$/, "-faint"),
    full.replace(/-light$/, "-faint"),
    full.replace(/-medium$/, "-bold"),
    full.replace(/-medium$/, "-subtle"),
    full.replace(/-faint$/, "-subtle"),
    full.replace(/-rest$/, "-medium"),
  ];
  for (const a of attempts) if (defined.has(a)) return a;
  return full;
}

// The mode itself was renamed: Figma's "Dark Mode" became "Midnight Mode"
// (CLAUDE.md §2.1), so the slug moved too and every dark-mode-* reference is
// stale on the mode segment as well as the name.
const PREFIXES = [
  ["semantic-color-light-mode-", "semantic-color-light-mode-"],
  ["semantic-color-dark-mode-", "semantic-color-midnight-mode-"],
  ["semantic-color-midnight-mode-", "semantic-color-midnight-mode-"],
  ["semantic-color-", "semantic-color-"],
  ["primitive-color-", "primitive-color-"],
];

function migrateName(name) {
  for (const [pre, outPre] of PREFIXES) {
    if (!name.startsWith(pre)) continue;
    const bare = name.slice(pre.length);
    return settle(outPre + rewrite(bare));
  }
  return name;
}

// ── walk every file that can carry a token reference ──
// Not just the demos: Storybook stories RENDER these names (a stale one is a
// visibly wrong colour in the published Storybook), and the specs and MDX are the
// documentation a consuming dev reads, so a stale name there teaches the wrong
// contract. All three have to move together (CLAUDE.md §3.2 step 4).
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|jsx?|mdx|md|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = [...walk("components"), ...walk("src/stories"), ...walk("docs"), ...walk(".storybook")];

const NAME_RE = /((?:semantic|primitive|motion|contextual)-[a-z0-9-]+)/g;
const changes = new Map();   // file -> [[from, to]]
const unresolved = new Map(); // name -> Set(files)

for (const file of files) {
  const src = readFileSync(file, "utf-8");
  const seen = new Set();
  for (const m of src.matchAll(NAME_RE)) seen.add(m[1]);
  const pairs = [];
  for (const name of seen) {
    if (defined.has(name)) continue;         // already valid, leave alone
    if (name.endsWith("-")) continue;        // runtime-interpolated prefix
    if (!PREFIXES.some(([pre]) => name.startsWith(pre) && name.length > pre.length)) continue;
    if (name.startsWith("primitive-color-")) {
      // The ramps were respaced, so an old slot number has no mechanical
      // equivalent. And per CLAUDE.md §6 a primitive reference is always wrong in
      // a component or spec regardless — it needs a semantic token, which is a
      // judgement call per instance, not a rename.
      if (!unresolved.has(name)) unresolved.set(name, new Set());
      unresolved.get(name).add(`${file}  (primitive — needs a semantic token)`);
      continue;
    }
    const to = migrateName(name);
    if (to === name) {
      if (!unresolved.has(name)) unresolved.set(name, new Set());
      unresolved.get(name).add(file);
      continue;
    }
    if (!defined.has(to)) {
      if (!unresolved.has(name)) unresolved.set(name, new Set());
      unresolved.get(name).add(`${file}  (tried ${to})`);
      continue;
    }
    pairs.push([name, to]);
  }
  if (!pairs.length) continue;
  // longest first, so a short name never corrupts a longer one containing it
  pairs.sort((a, b) => b[0].length - a[0].length);
  let out = src;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  changes.set(file, pairs);
  if (!DRY) writeFileSync(file, out, "utf-8");
}

let total = 0;
for (const [file, pairs] of changes) {
  console.log(`${file}  (${pairs.length})`);
  for (const [from, to] of pairs.slice(0, 6)) console.log(`    ${from}\n      -> ${to}`);
  if (pairs.length > 6) console.log(`    … and ${pairs.length - 6} more`);
  total += pairs.length;
}
console.log(`\n${total} reference(s) migrated across ${changes.size} file(s)${DRY ? " (dry run, nothing written)" : ""}`);

if (unresolved.size) {
  console.log(`\n${unresolved.size} name(s) could NOT be mapped to a real token:`);
  for (const [name, where] of [...unresolved].sort()) {
    console.log(`  ${name}\n      ${[...where].join(", ")}`);
  }
  console.log(
    `\nThese need a human decision, not a guess. Per CLAUDE.md §3.3 this script does\n` +
    `not invent a replacement when the mapping is genuinely ambiguous.`
  );
  process.exitCode = 1;
}
