#!/usr/bin/env node
/**
 * fix-stale-doc-hex.js, correct hex values quoted in prose that no longer match
 * the token they claim to document.
 *
 * WHY THIS EXISTS
 * Specs and docs quote resolved values next to token names, which is genuinely
 * useful: a reader wants to know what Fill/Static/Brand/Base actually looks like.
 * But those hexes are hand-copied, so every token value change silently rots
 * them, and nothing in the build notices. After the brand-axis migration 86 of
 * them were wrong, some badly: nav-shell-spec claimed Fill/Static/Brand/Base was
 * #ccd7f2, a pale blue, when it is #4b6ec3, a mid blue.
 *
 * Stale documentation is worse than none. A developer who trusts it builds
 * against a colour the system does not have.
 *
 * SAFETY RULES
 *   - Only rewrites a line naming EXACTLY ONE token. A line naming two (a
 *     semantic and the primitive behind it, say) is ambiguous about which one
 *     the hex describes, so it is reported instead.
 *   - A hex matching EITHER the light or the midnight value is left alone: docs
 *     legitimately quote both.
 *   - Comments and prose are rewritten; nothing executable is touched.
 *
 *   node scripts/fix-stale-doc-hex.js            report
 *   node scripts/fix-stale-doc-hex.js --apply    rewrite
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const decls = (f) => {
  const m = new Map();
  if (!existsSync(f)) return m;
  for (const x of readFileSync(f, "utf8").matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) m.set(x[1], x[2].trim());
  return m;
};
const P = decls("src/tokens/primitives.css");
const LIGHT = decls("src/tokens/themes/light.css");
const DARK = decls("src/tokens/themes/midnight.css");
const resolve = (v, t) => {
  let x = v, g = 0;
  while (/^var\(/.test(x) && g++ < 6) {
    const m = x.match(/^var\(\s*(--[a-z0-9-]+)/); if (!m) break;
    const n = t.get(m[1]) ?? P.get(m[1]); if (!n || n === x) break; x = n;
  }
  return x;
};
const VAL = new Map();
for (const [k, v] of LIGHT) {
  if (!/^--(semantic|primitive|motion)/.test(k)) continue;
  VAL.set(k, { light: resolve(v, LIGHT).toLowerCase(), dark: DARK.has(k) ? resolve(DARK.get(k), DARK).toLowerCase() : null });
}
for (const [k, v] of P) if (!VAL.has(k)) { const l = resolve(v, LIGHT).toLowerCase(); VAL.set(k, { light: l, dark: l }); }

const apply = process.argv.includes("--apply");
// --check makes this a GATE. Without it, docs rot again the next time a token
// value moves, and nothing notices until a developer builds against a colour
// the system does not have.
const check = process.argv.includes("--check");
const files = execSync('git ls-files "*.md" "*.mdx"', { encoding: "utf8" }).trim().split("\n").filter(Boolean);

let fixed = 0, ambiguous = [], okCount = 0;
for (const f of files) {
  if (!existsSync(f)) continue;
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  let touched = false;
  lines.forEach((ln, i) => {
    const hexes = ln.match(/#[0-9a-fA-F]{6}\b/g);
    if (!hexes) return;
    // Specs name tokens two ways: the emitted CSS property, and the Figma path
    // (Fill/Static/Brand/Base). Both have to be recognised or half the docs stay
    // stale, and the Figma path is the form a designer reads.
    const css = ln.match(/--(?:semantic|primitive|motion)-[a-z0-9-]+/g) || [];
    const paths = (ln.match(/\b(?:Fill|Foreground|Stroke|Scrim)\/[A-Za-z][A-Za-z0-9\/ ]*/g) || [])
      .map((p) => "--semantic-color-" + p.trim().toLowerCase().replace(/\s*\/\s*/g, "-").replace(/\s+/g, "-"));
    const named = [...new Set([...css, ...paths])].filter((n) => VAL.has(n));
    if (!named.length) return;
    if (named.length > 1) {
      // a semantic plus the primitive behind it: which does the hex describe?
      const anyMatch = named.some((n) => hexes.some((h) => [VAL.get(n).light, VAL.get(n).dark].includes(h.toLowerCase())));
      if (!anyMatch) ambiguous.push(`${f}:${i + 1}  names ${named.join(" and ")}  doc says ${hexes.join(",")}`);
      else okCount++;
      return;
    }
    const rec = VAL.get(named[0]);
    const want = rec.light;
    if (!/^#[0-9a-f]{6}$/.test(want)) return;
    const stale = hexes.filter((h) => ![rec.light, rec.dark].includes(h.toLowerCase()));
    if (!stale.length) { okCount++; return; }
    let out = ln;
    for (const h of stale) out = out.split(h).join(want);
    if (out !== ln) { lines[i] = out; touched = true; fixed += stale.length; }
  });
  if (touched && apply) writeFileSync(f, lines.join("\n"));
}
console.log(`${apply ? "rewrote" : "would rewrite"}: ${fixed} stale hex value(s)`);
console.log(`already correct: ${okCount} line(s)`);
if (check && fixed > 0) {
  console.error(
    `\n${fixed} documented hex value(s) no longer match the token they name.\n` +
    `Stale documentation is worse than none: a reader who trusts it builds against a colour that does not exist.\n` +
    `Fix with:  node scripts/fix-stale-doc-hex.js --apply`,
  );
  process.exitCode = 1;
}
if (ambiguous.length) {
  console.log(`\nNOT TOUCHED, line names more than one token, so which the hex describes is ambiguous (${ambiguous.length}):`);
  for (const a of ambiguous.slice(0, 12)) console.log("  " + a);
  if (ambiguous.length > 12) console.log(`  … ${ambiguous.length - 12} more`);
}
