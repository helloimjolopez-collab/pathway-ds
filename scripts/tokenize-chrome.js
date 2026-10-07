/**
 * tokenize-chrome.js, replace raw colour values in demo and story CHROME with
 * semantic tokens, choosing the token by ROLE and then snapping to the nearest
 * rung of the ladder that role selects.
 *
 * WHY THE EARLIER ATTEMPT WAS REVERTED
 * The first pass matched on resolved value: take a hex, find every token that
 * resolves to it, pick one. That cannot work, because a colour does not carry
 * the information a token name encodes. #ffffff on a docs panel and #ffffff on
 * a button rest state are the same three bytes, so the matcher was answering a
 * question its input could not answer. It put
 * foreground-action-status-info-on-strong on static text, and the 127
 * replacements were reverted with `git checkout -- components/`.
 *
 * HOW THIS ONE DECIDES, IN TWO INDEPENDENT STEPS
 *   1. LADDER, from the CSS property and the saturation. The property says
 *      which tier applies (background -> Fill/Surface, border -> Stroke,
 *      color -> Foreground); saturation separates brand from neutral, because
 *      Pathway's blues sit at 0.50+ (#2d4889, #3555a0, #eef2fb) while the
 *      grey-blue chrome captions sit at 0.15-0.26 (#8890b0, #f0f1f4, #c4c8d8).
 *      Nothing about the hex chooses the ladder.
 *   2. RUNG, by nearest measured value within that ladder, in CIELAB dE. The
 *      rungs ARE the ladder, so once the ladder is fixed, picking the closest
 *      rung is the correct operation rather than a guess. Ladder values are
 *      read from the BUILT CSS, so this cannot drift from the token set.
 *
 * A candidate further than DE_MAX from every rung is REPORTED, never forced.
 *
 * WHAT THIS DELIBERATELY CHANGES ON SCREEN
 * The chrome was eyeballed over time: six different hexes were in use as a
 * docs-table divider (#f0f1f4 #f0f0f0 #f5f5f5 #e5e7eb #ededed #f6f6f6) and
 * seven as caption text. Snapping collapses each set onto one rung, so those
 * near-duplicates converge. That is the point, not a side effect.
 *
 * The caption greys move most. The foreground ladder's lightest usable rung is
 * #484848, and it offers nothing lighter because #888 (3.54:1), #aaa (2.32:1),
 * #8890b0 (3.15:1), #999 (2.85:1), #777 (4.48:1) and #c4c8d8 (1.67:1) all FAIL
 * WCAG AA on white. The absent token is a deliberate refusal, not a gap, so
 * these snap up and the captions get darker and pass. AA_FLOOR asserts it.
 *
 * KNOWN GAP, REPORTED NOT INVENTED: there is no stroke-static-brand-* ladder,
 * so brand-tinted borders (#edf0f9, #d8dce8, #6e8bd4) have no token and are
 * reported for a decision.
 *
 * SCOPE. Skips comments including block-comment bodies (they are documentation;
 * staleness there is fix-stale-doc-hex.js's job), SVG artwork (the Chrome
 * logo's #4285F4 is Google's brand colour and correctly not a Pathway token),
 * and token-table rows (those carry a token name, so they resolve live).
 * Skips *-figmamake.html, which is DERIVED from <name>.html by
 * build-component.py and must never be hand-edited.
 *
 * Run with --check in CI to fail on regressions, --dry to preview.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["components", "src/stories"];
const EXTS = [".html", ".jsx", ".css", ".mdx"];
const HEXG = () => /#[0-9a-fA-F]{3,8}\b/g;
const TOKEN_NAME =
  /(["'])(?:Fill|Foreground|Stroke|Scrim|Elevation)\/[^"']+\1|\b(?:fill|foreground|stroke|scrim)\.[a-z0-9.\-]+/;
const DE_MAX = 14;       // beyond this the rung is not the same colour; report
const AA_FLOOR = 4.5;    // no foreground rung may be chosen below AA on white

// ── colour maths ────────────────────────────────────────────────────────────
function rgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
const lin = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
function lum(hex) {
  const c = rgb(hex).map((x) => lin(x / 255));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const crWhite = (hex) => 1.05 / (lum(hex) + 0.05);
// Reported for triage only. HSL saturation is NOT used to classify: it is
// unstable near white (#fdf7f7 reads 0.60 while its Lab chroma is 2.1), which
// is what made an earlier revision file pink-white panels as brand blue.
function chroma(hex) { const [, a, b] = lab(hex); return Math.hypot(a, b); }
function lab(hex) {
  const [r, g, b] = rgb(hex).map((x) => lin(x / 255));
  let X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  let Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  let Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  [X, Y, Z] = [f(X), f(Y), f(Z)];
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
const dE = (a, b) => {
  const [l1, a1, b1] = lab(a), [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

// ── ladders, read from the BUILT css so they cannot drift ───────────────────
const primCss = readFileSync("src/tokens/primitives.css", "utf8");
const lightCss = readFileSync("src/tokens/themes/light.css", "utf8");
const grab = (css, pre) => {
  const m = {};
  for (const [, k, v] of css.matchAll(new RegExp(`(${pre}[a-z0-9-]+)\\s*:\\s*([^;]+);`, "g"))) m[k] = v.trim();
  return m;
};
const PRIM = grab(primCss, "--primitive-color-");
const SEM = grab(lightCss, "--semantic-color-");
function resolve(v, d = 0) {
  v = (v || "").trim();
  const m = v.match(/^var\((--[a-z0-9-]+)\)$/);
  if (m && d < 8) return resolve(PRIM[m[1]] ?? SEM[m[1]] ?? "", d + 1);
  return v;
}
function ladderByPattern(re_, prefer = []) {
  const rows = [];
  for (const k of Object.keys(SEM)) {
    const n = k.replace("--semantic-color-", "");
    if (!re_.test(n)) continue;
    const value = resolve(SEM[k]);
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) continue;
    rows.push({ name: n, value });
  }
  // Declared preference only breaks EXACT TIES in dE; it never overrides distance.
  // Backgrounds prefer Fill/Surface over Fill/Static so that #2d4889, which is
  // both fill-surface-chrome and fill-static-brand-strong, reads as the app
  // chrome it actually is.
  const rank = (n) => { const i = prefer.findIndex((p) => n.startsWith(p)); return i === -1 ? prefer.length : i; };
  return rows.sort((a, b) => rank(a.name) - rank(b.name));
}

// Ladders are built by PATTERN from the built CSS, never hand-listed, so this
// can only ever emit a token that exists. foreground-static-neutral-faint is
// dropped because it duplicates -subtle (#484848) and would make the choice
// between two identical names arbitrary.
const L = {
  background: ladderByPattern(/^fill-(surface|static)-/, ["fill-surface-", "fill-static-neutral-", "fill-static-brand-"]),
  border: ladderByPattern(/^stroke-static-/, ["stroke-static-neutral-"]),
  color: ladderByPattern(/^foreground-static-(?!neutral-faint$)/, ["foreground-static-neutral-", "foreground-static-brand-"]),
};

// Large areas show a shift most, so they get the tightest tolerance.
const DE_CAP = { background: 10, border: 12, color: 14 };

// Within PREF_BAND the two candidates are the same colour to the eye, so the
// SEMANTIC FAMILY decides rather than the last decimal of distance. Without
// this, near-white chrome text picked foreground-static-negative-on-strong
// (#fdfafa, dE 1.1) over foreground-static-neutral-mono (#ffffff, dE 1.4):
// visually identical, semantically nonsense.
const PREF_BAND = 2.5;

function snap(tier, hex) {
  const rungs = L[tier];
  if (!rungs) return null;
  const scored = [];
  // WHITE IS NEVER THE CANVAS. fill-surface-canvas is #fafafa and
  // fill-surface-elevated is #ffffff, roughly 2 dE apart, which put them inside
  // PREF_BAND together; 44 pure-white card and panel surfaces across fifteen
  // demo and story files came out as canvas, so a raised surface ended up the
  // same colour as the page behind it and stopped reading as a surface at all.
  // A near-white source can only be an elevated, overlay or mono surface.
  const nearWhite = tier === "background" && lum(hex) > 0.93;
  for (let i = 0; i < rungs.length; i++) {
    const r = rungs[i];
    // A foreground rung below AA on white is never a legal target for text.
    if (tier === "color" && crWhite(r.value) < AA_FLOOR && crWhite(r.value) > 1.2) continue;
    if (nearWhite && !/(elevated|overlay|mono)$/.test(r.name)) continue;
    scored.push({ ...r, d: dE(r.value, hex), rank: i });
  }
  if (!scored.length) return null;
  const min = Math.min(...scored.map((r) => r.d));
  if (min > DE_CAP[tier]) return null;
  // Of everything indistinguishable from the closest match, take the most
  // preferred family; ties inside that fall back to the closest.
  const band = scored.filter((r) => r.d <= min + PREF_BAND);
  band.sort((a, b) => a.rank - b.rank || a.d - b.d);
  return band[0];
}

const BG = /^(background|background-color|bg)$/;
const BORDER = /^(border|border-color|border-top|border-bottom|border-left|border-right|outline|outline-color)$/;

function choose(prop, hex) {
  if (BG.test(prop)) return snap("background", hex);
  if (BORDER.test(prop)) return snap("border", hex);
  if (prop === "color" || prop === "fill" || prop === "stroke") return snap("color", hex);
  return null;
}

// ── file walk ───────────────────────────────────────────────────────────────
function files(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) files(p, out);
    else if (EXTS.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

const CHECK = process.argv.includes("--check");
const DRY = process.argv.includes("--dry") || CHECK;

let changed = 0, touched = 0;
const unknown = [];
const applied = new Map();

for (const root of ROOTS) {
  for (const p of files(root)) {
    if (p.includes("figmamake")) continue;
    const lines = readFileSync(p, "utf8").split("\n");
    let fileChanged = false;
    let inBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const t = line.trim();
      const low = t.toLowerCase();

      // Track block comments across lines, so prose inside them is not rewritten.
      const opens = (line.match(/\/\*|<!--/g) || []).length;
      const closes = (line.match(/\*\/|-->/g) || []).length;
      const startedInBlock = inBlock;
      if (opens > closes) inBlock = true;
      else if (closes > opens) inBlock = false;

      if (!HEXG().test(line)) continue;
      if (startedInBlock || inBlock) continue;
      if (low.startsWith("*") || low.startsWith("//") || low.startsWith("/*") || low.startsWith("<!--")) continue;
      if (/(fill|stroke|stop-color)\s*=\s*"#/.test(low)) continue;
      if (/^<(path|circle|rect|svg|polygon|ellipse|line)\b/.test(low)) continue;
      if (TOKEN_NAME.test(t) || /\b(value|hex)\s*:/.test(low)) continue;

      lines[i] = line.replace(HEXG(), (hex, off) => {
        if (!rgb(hex)) return hex;
        const pre = line.slice(0, off);
        // The governing property: nearest `name:` to the left of the value.
        // Quoted custom-property keys ("--item-text": "#484848") name their own
        // role, so the suffix stands in for the property.
        const pm = [...pre.matchAll(/(--)?([A-Za-z][A-Za-z-]*)\s*"?'?\s*:\s*[^:;,]*$/g)];
        if (!pm.length) { unknown.push(`${p}:${i + 1}  (no property) ${t.slice(0, 92)}`); return hex; }
        const raw = pm[pm.length - 1][2].replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        let prop = raw;
        if (!BG.test(raw) && !BORDER.test(raw) && raw !== "color") {
          if (/(^|-)(bg|background|surface|fill)$/.test(raw)) prop = "background";
          else if (/(^|-)(border|divider|stroke|outline)$/.test(raw)) prop = "border";
          else if (/(^|-)(text|label|name|heading|icon|chevron|meta|fg|foreground)$/.test(raw)) prop = "color";
        }
        const pick = choose(prop, hex);
        if (!pick) { unknown.push(`${p}:${i + 1}  [${raw}] ${hex} chroma=${chroma(hex).toFixed(1)}`); return hex; }
        changed++; fileChanged = true;
        const k = `${prop.padEnd(10)} ${hex.padEnd(8)} -> ${pick.name}  (dE ${pick.d.toFixed(1)})`;
        applied.set(k, (applied.get(k) || 0) + 1);
        return `var(--semantic-color-${pick.name})`;
      });
    }
    if (fileChanged) { touched++; if (!DRY) writeFileSync(p, lines.join("\n")); }
  }
}

console.log(`tokenize-chrome: ${changed} values in ${touched} files${DRY ? " (dry run)" : ""}`);
console.log(`\nladders (measured from built css):`);
for (const [k, v] of Object.entries(L)) console.log(`  ${k.padEnd(11)} ${v.length} rungs, cap dE ${DE_CAP[k]}`);
console.log(`\nmappings applied (${applied.size} distinct):`);
for (const [k, n] of [...applied].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log(`\nREPORTED, not guessed: ${unknown.length}`);
const grouped = new Map();
for (const u of unknown) { const k = u.replace(/^[^ ]+  /, ""); grouped.set(k, (grouped.get(k) || 0) + 1); }
for (const [k, n] of [...grouped].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${String(n).padStart(4)}  ${k}`);
if (CHECK && changed > 0) { console.error(`\ncheck failed: ${changed} raw chrome values could be tokens.`); process.exit(1); }
