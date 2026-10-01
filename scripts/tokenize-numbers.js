/**
 * tokenize-numbers.js — replace hardcoded numeric design values with the token
 * that holds exactly that value.
 *
 * PROPERTY DECIDES THE FAMILY, exactly as in tokenize-chrome.js and for the
 * same reason: a number carries none of the information a token name encodes.
 * `16` is a padding, a gap, a font size and a corner radius all at once, and
 * matching on the value alone would put a gap token on a padding. So the CSS
 * property selects which family is eligible, and only then is an exact value
 * match looked for inside it.
 *
 * EXACT MATCHES ONLY. No nearest-rung snapping here, unlike the colour pass.
 * A colour that shifts 2 dE is invisible; a padding that shifts 2px moves
 * everything next to it. If no token holds the value exactly, the number stays
 * and is reported.
 *
 * WHAT IS DELIBERATELY NOT TOUCHED
 *   width, height, min/max, top, left, right, bottom, margin
 *     These are layout maths, not design values. A width of 44 is a touch
 *     target; a width of 243 is whatever made the panel fit. There is no
 *     family to match them against and guessing would be worse than leaving
 *     them legible.
 *   0, 1 and 100
 *     Zero, hairlines and percentages are not design decisions.
 *   SVG geometry and path data
 *     viewBox coordinates are not spacing.
 *
 * Ambiguity is REPORTED, never resolved by picking the first. If two tokens in
 * one family hold the same value, which one is meant is a real question and
 * this script is not entitled to answer it.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PRE = {
  "--semantic-layout-units-": "src/tokens/layout.css",
  "--semantic-type-": "src/tokens/type.css",
  "--contextual-layout-units-": "src/tokens/layout-contextual.css",
};
const vars = {};
for (const [pre, file] of Object.entries(PRE)) {
  const css = readFileSync(file, "utf8");
  for (const m of css.matchAll(new RegExp(`(${pre}[a-z0-9-]+)\\s*:\\s*([^;]+);`, "g"))) {
    vars[m[1]] = m[2].trim();
  }
}

/** Which token families a CSS property may draw from, in preference order. */
const FAMILIES = {
  padding: ["semantic-layout-units-padding-"],
  gap: ["semantic-layout-units-gap-"],
  borderRadius: ["semantic-layout-units-cornerradius-"],
  borderWidth: ["semantic-layout-units-borderwidth-"],
  fontSize: ["semantic-type-font-size-"],
  lineHeight: ["semantic-type-line-height-"],
  letterSpacing: ["semantic-type-letter-spacing-"],
};
// camelCase and kebab spell the same property; normalise before lookup.
const ALIASES = {
  "padding-top": "padding", "padding-bottom": "padding", "padding-left": "padding", "padding-right": "padding",
  paddingTop: "padding", paddingBottom: "padding", paddingLeft: "padding", paddingRight: "padding",
  "border-radius": "borderRadius", "border-width": "borderWidth",
  "font-size": "fontSize", "line-height": "lineHeight", "letter-spacing": "letterSpacing",
  rowGap: "gap", columnGap: "gap", "row-gap": "gap", "column-gap": "gap",
};

/** value (in px) -> [token names], per family prefix. */
const byFamily = {};
for (const [name, raw] of Object.entries(vars)) {
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(raw);
  if (!m) continue;
  const v = parseFloat(m[1]);
  const short = name.replace(/^--/, "");
  for (const fams of Object.values(FAMILIES)) {
    for (const f of fams) {
      if (short.startsWith(f)) {
        byFamily[f] ??= {};
        (byFamily[f][v] ??= []).push(name);
      }
    }
  }
}

const SKIP_VALUES = new Set([0, 1, 100]);
const EXTS = [".jsx", ".html", ".css", ".mdx"];
function files(d, out = []) {
  for (const e of readdirSync(d)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(d, e);
    if (statSync(p).isDirectory()) files(p, out);
    else if (EXTS.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

const CHECK = process.argv.includes("--check");
const DRY = process.argv.includes("--dry") || CHECK;
const ONLY_JSX = process.argv.includes("--jsx-only");
const roots = process.argv.includes("--stories") ? ["components", "src/stories"] : ["components"];

let changed = 0, touched = 0;
const applied = new Map(), ambiguous = new Map(), unmatched = new Map();
// Capture the property, the WHOLE value, and the terminator. Matching just the
// first number inside the value turned `padding: "4px 0"` into
// `padding: "var(...)" 0"`, because a CSS shorthand takes several values and
// only the first was replaced. So the value is captured up to its terminator
// and only substituted when the ENTIRE value is one number.
//
// The terminator also decides quoting. A declaration ending in `;` is CSS and
// takes a bare var(); anything else is a JS style object, where var() has to be
// a string. Emitting it bare there produced `gap: var(--x)`, which is a syntax
// error, and esbuild caught it.
const PROP_RE = new RegExp(
  `\\b(${[...Object.keys(FAMILIES), ...Object.keys(ALIASES)].join("|")})\\s*:\\s*([^,;}\\n]+?)\\s*([,;}]|$)`,
  "g"
);
/** Is this value a single number, optionally quoted and optionally with px? */
const SOLE_NUMBER = /^(["']?)(-?\d+(?:\.\d+)?)(px)?\1$/;

for (const root of roots) {
  for (const p of files(root)) {
    if (p.includes("figmamake")) continue;
    if (ONLY_JSX && !p.endsWith(".jsx")) continue;
    const lines = readFileSync(p, "utf8").split("\n");
    let fileChanged = false, inBlock = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i], t = line.trim(), low = t.toLowerCase();
      const opens = (line.match(/\/\*|<!--/g) || []).length;
      const closes = (line.match(/\*\/|-->/g) || []).length;
      const started = inBlock;
      if (opens > closes) inBlock = true; else if (closes > opens) inBlock = false;
      if (started || inBlock) continue;
      if (low.startsWith("*") || low.startsWith("//") || low.startsWith("/*") || low.startsWith("<!--")) continue;
      if (/^<(path|circle|rect|svg|polygon|ellipse|line)\b/.test(low) || / d="/.test(low)) continue;

      lines[i] = line.replace(PROP_RE, (whole, rawProp, rawVal, term) => {
        const prop = ALIASES[rawProp] ?? rawProp;
        const fams = FAMILIES[prop];
        if (!fams) return whole;
        const sole = SOLE_NUMBER.exec(rawVal.trim());
        if (!sole) return whole;          // a shorthand, a calc(), a var(), a keyword
        const v = parseFloat(sole[2]);
        if (SKIP_VALUES.has(v)) return whole;
        for (const f of fams) {
          const hits = byFamily[f]?.[v];
          if (!hits) continue;
          if (hits.length > 1) {
            const k = `${prop} ${v} -> ${hits.join(" OR ")}`;
            ambiguous.set(k, (ambiguous.get(k) || 0) + 1);
            return whole;
          }
          changed++; fileChanged = true;
          const k = `${prop.padEnd(14)} ${String(v).padEnd(5)} -> ${hits[0]}`;
          applied.set(k, (applied.get(k) || 0) + 1);
          // `;` means CSS, where a bare var() is right. Anything else is a JS
          // style object, where it must be a string.
          const q = term === ";" ? "" : '"';
          return `${rawProp}: ${q}var(${hits[0]})${q}${term}`;
        }
        const k = `${prop} ${v}`;
        unmatched.set(k, (unmatched.get(k) || 0) + 1);
        return whole;
      });
    }
    if (fileChanged) { touched++; if (!DRY) writeFileSync(p, lines.join("\n")); }
  }
}
console.log(`tokenize-numbers: ${changed} values in ${touched} files${DRY ? " (dry run)" : ""}  roots=${roots.join(",")}${ONLY_JSX ? " jsx only" : ""}`);
console.log(`\napplied (${applied.size} distinct):`);
for (const [k, n] of [...applied].sort((a, b) => b[1] - a[1]).slice(0, 24)) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log(`\nAMBIGUOUS, left alone (two tokens share the value): ${[...ambiguous.values()].reduce((a, b) => a + b, 0)}`);
for (const [k, n] of [...ambiguous].sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log(`\nNO TOKEN HOLDS THIS VALUE, left alone: ${[...unmatched.values()].reduce((a, b) => a + b, 0)}`);
for (const [k, n] of [...unmatched].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`  ${String(n).padStart(4)}  ${k}`);
if (CHECK && changed > 0) { console.error(`\ncheck failed: ${changed} numbers have an exact token.`); process.exit(1); }
