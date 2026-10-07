#!/usr/bin/env node
/**
 * suggest-tokens.js, map a hard-coded colour back to the token that already
 * holds that value.
 *
 * WHY THIS EXISTS
 * The repo accumulated roughly 1,700 hard-coded colours. Replacing them by hand
 * invites two mistakes that are worse than the original problem: picking a token
 * whose LIGHT value happens to match while its dark value is wrong, and picking
 * a token whose NAME sounds right while its value is something else. Both
 * produce a file that looks tokenised and renders incorrectly.
 *
 * So the match is made on the RESOLVED value, in CIELAB, and only an exact or
 * near-exact hit is ever offered for automatic replacement. Anything further
 * away is a design decision and is reported, not applied.
 *
 * It reads the emitted contract rather than Figma, so it always reflects what
 * the CSS actually declares.
 *
 *   node scripts/suggest-tokens.js <file...>        report
 *   node scripts/suggest-tokens.js --apply <file...>  rewrite exact matches only
 *   node scripts/suggest-tokens.js --max-de 2 ...    widen what counts as exact
 */
import { readFileSync, writeFileSync } from "node:fs";

const LIGHT = "src/tokens/themes/light.css";
const DARK = "src/tokens/themes/midnight.css";
const PRIMS = "src/tokens/primitives.css";

const decls = (file) => {
  const out = new Map();
  for (const m of readFileSync(file, "utf8").matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim))
    out.set(m[1], m[2].trim());
  return out;
};
const prims = decls(PRIMS);
const light = decls(LIGHT);
const dark = decls(DARK);

/** Resolve one var() indirection down to a literal. */
function resolve(value, table) {
  let v = value, guard = 0;
  while (/^var\(/.test(v) && guard++ < 6) {
    const m = v.match(/^var\(\s*(--[a-z0-9-]+)/);
    if (!m) break;
    v = table.get(m[1]) ?? prims.get(m[1]) ?? v;
    if (v === value) break;
  }
  return v;
}

const hexToRgb = (h) => {
  h = h.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, a];
};
const f = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function lab([r, g, b]) {
  const R = f(r), G = f(g), B = f(b);
  let X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  let Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  let Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const k = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  X = k(X); Y = k(Y); Z = k(Z);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
// A translucent colour is compared as it would LOOK on the canvas, because that
// is what the author was matching by eye when they typed the rgba.
const CANVAS = [250 / 255, 250 / 255, 250 / 255, 1];
const flatten = ([r, g, b, a]) =>
  a >= 0.999 ? [r, g, b] : [r * a + CANVAS[0] * (1 - a), g * a + CANVAS[1] * (1 - a), b * a + CANVAS[2] * (1 - a)];

// Build the candidate set: every SEMANTIC name, with its light and dark value.
const candidates = [];
for (const [name, raw] of light) {
  if (!name.startsWith("--semantic-color-")) continue;
  const l = resolve(raw, light);
  if (!/^#[0-9a-fA-F]{3,8}$/.test(l)) continue;
  const d = dark.has(name) ? resolve(dark.get(name), dark) : null;
  candidates.push({ name, light: l, dark: d, lab: lab(flatten(hexToRgb(l))) });
}

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const maxIdx = args.indexOf("--max-de");
const MAX_DE = maxIdx >= 0 ? Number(args[maxIdx + 1]) : 1.0;
const files = args.filter((a, i) => !a.startsWith("--") && !(maxIdx >= 0 && i === maxIdx + 1));

/**
 * Which token TIER may be used, judged from the CSS property (or the JS style
 * key) the colour sits on.
 *
 * Matching on value alone is not good enough and this is not a theoretical
 * risk: a first pass matched #6b6b6b on a `color:` line to
 * stroke-action-field-hover, and #e8e8e8 on a `border:` line to
 * fill-static-neutral-strong. Both are the right value and the wrong meaning,
 * and the result reads as tokenised while saying something false about the
 * design. A foreground is not a stroke.
 */
function tierFor(line) {
  const l = line.toLowerCase();
  if (/box-shadow|boxshadow|text-shadow|textshadow/.test(l)) return "elevation";
  if (/(^|[^-\w])(color|fill)\s*:|\bcolor\s*:/.test(l) && !/background|border|outline|shadow/.test(l))
    return "foreground";
  if (/background(-color)?\s*:|\bbackground\s*:|\bbackgroundcolor\s*:/.test(l)) return "fill";
  if (/border[a-z-]*\s*:|outline[a-z-]*\s*:|\bstroke\s*:/.test(l)) return "stroke";
  if (/\bfill\s*:/.test(l)) return "foreground";   // SVG fill is a foreground
  return null;                                       // unknown: offer nothing
}

const COLOUR = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*[\d.]+)?\s*\)/g;
const parseRgb = (s) => {
  const n = s.match(/[\d.]+/g).map(Number);
  return [n[0] / 255, n[1] / 255, n[2] / 255, n[3] ?? 1];
};

let applied = 0, reported = 0;
for (const file of files) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const edits = [];
  lines.forEach((line, i) => {
    // never touch a comment: those record what a token resolves to, on purpose
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("<!--")) return;
    const bare = line.replace(/var\([^)]*\)/g, (m) => " ".repeat(m.length));
    for (const m of bare.matchAll(COLOUR)) {
      const raw = m[0];
      const rgba = raw.startsWith("#") ? hexToRgb(raw) : parseRgb(raw);
      const L = lab(flatten(rgba));
      const tier = tierFor(line);
      if (!tier) { edits.push({ line: i + 1, raw, token: null, d: Infinity, why: "no CSS property recognised", ctx: t.slice(0, 70) }); continue; }
      if (tier === "elevation") { edits.push({ line: i + 1, raw, token: null, d: Infinity, why: "shadow: use var(--elevation-*)", ctx: t.slice(0, 70) }); continue; }
      const pool = candidates.filter((c) => c.name.startsWith(`--semantic-color-${tier}-`));
      let best = null;
      for (const c of pool) {
        const d = dE(L, c.lab);
        if (!best || d < best.d) best = { ...c, d };
      }
      if (!best) { edits.push({ line: i + 1, raw, token: null, d: Infinity, why: `no ${tier} token`, ctx: t.slice(0, 70) }); continue; }
      edits.push({ line: i + 1, raw, token: best.name, d: best.d, dark: best.dark, tier, ctx: t.slice(0, 70) });
    }
  });
  if (!edits.length) continue;
  const exact = edits.filter((e) => e.token && e.d <= MAX_DE);
  const loose = edits.filter((e) => !e.token || e.d > MAX_DE);
  console.log(`\n${file}, ${exact.length} exact, ${loose.length} need a decision`);
  for (const e of exact) console.log(`   EXACT dE${e.d.toFixed(2)}  ${e.raw.padEnd(24)} -> var(${e.token})`);
  for (const e of loose.slice(0, 8))
    console.log(
      e.token
        ? `   loose dE${e.d.toFixed(1).padStart(5)}  ${e.raw.padEnd(22)} nearest ${e.token}  | ${e.ctx}`
        : `   skip          ${e.raw.padEnd(22)} ${e.why}  | ${e.ctx}`,
    );
  if (loose.length > 8) console.log(`   … ${loose.length - 8} more needing a decision`);
  reported += loose.length;
  if (apply && exact.length) {
    // Line-scoped, because the SAME hex can be a foreground on one line and a
    // background on the next, and those must resolve to different tokens.
    const outLines = lines.slice();
    for (const e of exact) {
      const re = new RegExp(e.raw.replace(/[()[\]\\.*+?^${}|]/g, "\\$&"), "g");
      outLines[e.line - 1] = outLines[e.line - 1].replace(re, `var(${e.token})`);
    }
    writeFileSync(file, outLines.join("\n"));
    applied += exact.length;
  }
}
console.log(`\n${apply ? "applied" : "would apply"}: ${applied} exact replacements; ${reported} need a decision`);
