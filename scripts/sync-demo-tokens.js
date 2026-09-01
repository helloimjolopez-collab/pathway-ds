#!/usr/bin/env node

/**
 * sync-demo-tokens.js
 *
 * The standalone demos in components/<name>/<name>.html are self-contained by
 * design (CLAUDE.md §4, docs/component-pipeline.md) — they inline a copy of the
 * token layer so the file opens with no build step and no npm install. Each one
 * carries a block like:
 *
 *   --semantic-color-light-mode-fill-action-primary-base: var(--primitive-color-brand-300);
 *
 * That block is a hand-maintained duplicate of generated data, so it drifts.
 * When this script was written, 63 declarations across three demos resolved to
 * a different colour than src/tokens/tokens.css, meaning those demos were
 * rendering colours that are not in the design system.
 *
 * This script rewrites the VALUE of every inlined semantic/motion declaration
 * to match tokens.css. It never adds, removes, renames or reorders anything, so
 * a demo that deliberately inlines only a subset keeps exactly that subset.
 *
 * It preserves each demo's existing notation: a declaration written as a var()
 * chain stays a var() chain, and one written as a resolved literal (#hex or
 * rgba) stays resolved. Demos that inline literals do not necessarily define
 * the primitives they would otherwise reference, so switching notation would
 * break them.
 *
 * Usage:
 *   node scripts/sync-demo-tokens.js --check    report drift, exit 1 if any
 *   node scripts/sync-demo-tokens.js            rewrite the drifted values
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CHECK = process.argv.includes("--check");
const TOKENS_CSS = "src/tokens/tokens.css";

// ─── authoritative values ─────────────────────────────────────────────────────
const defs = new Map();
for (const line of readFileSync(TOKENS_CSS, "utf-8").split("\n")) {
  const m = line.match(/^\s*--([a-z0-9-]+)\s*:\s*(.+?);/);
  if (m) defs.set(m[1], m[2].trim());
}
if (!defs.size) {
  console.error(`No custom properties found in ${TOKENS_CSS}. Run build-tokens first.`);
  process.exit(2);
}

const resolve = (v, depth = 0) => {
  if (depth > 12) return v;
  const m = v.trim().match(/^var\(--([a-z0-9-]+)\)$/);
  if (m && defs.has(m[1])) return resolve(defs.get(m[1]), depth + 1);
  return v.trim();
};

// Compare by resolved value so notation alone never counts as drift.
//
// Two normalisations exist specifically so this script cannot downgrade a demo.
// tokens.css carries two defects that some demos have already corrected by hand:
// Figma's 32-bit floats arrive as "0.30000001192092896px", and font families are
// emitted unquoted with no fallback stack. A demo holding "0.3px" or
// '"Red Hat Text", sans-serif' is MORE correct than the build, so px is rounded
// to 4dp and font families compare on the first family name alone.
const norm = (v) => {
  let s = resolve(v).toLowerCase().replace(/\s+/g, "");
  let m = s.match(/^#([0-9a-f]{6})$/);
  if (m) {
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
    return `rgba(${r},${g},${b},1)`;
  }
  m = s.match(/^rgba?\(([^)]*)\)$/);
  if (m) {
    const p = m[1].split(",").map((x) => x.trim());
    if (p.length === 3) p.push("1");
    const [r, g, b] = p.slice(0, 3).map((x) => Math.round(parseFloat(x)));
    return `rgba(${r},${g},${b},${Math.round(parseFloat(p[3]) * 100) / 100})`;
  }
  m = s.match(/^(-?[\d.]+)px$/);
  if (m) return `${Math.round(parseFloat(m[1]) * 1e4) / 1e4}px`;
  // font stacks: compare the first family, unquoted
  if (s.includes(",") || s.includes('"') || s.includes("'")) {
    const first = s.split(",")[0].replace(/^["']|["']$/g, "");
    if (/^[a-z0-9-]+$/.test(first)) return first;
  }
  return s;
};

// ─── find the demos ───────────────────────────────────────────────────────────
const demos = [];
for (const dir of readdirSync("components", { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const f = join("components", dir.name, `${dir.name}.html`);
  if (existsSync(f)) demos.push(f);
}

let totalDrift = 0;
let totalOk = 0;
const changedFiles = [];

for (const file of demos) {
  const src = readFileSync(file, "utf-8");
  const lines = src.split("\n");
  let drift = 0;
  let ok = 0;
  const notes = [];

  const out = lines.map((line) => {
    const m = line.match(/^(\s*--((?:semantic|motion)-[a-z0-9-]+)\s*:\s*)(.+?)(;.*)$/);
    if (!m) return line;
    const [, head, name, value, tail] = m;
    if (!defs.has(name)) return line; // token no longer exists; leave it, don't invent
    const real = defs.get(name);
    if (norm(value) === norm(real)) { ok++; return line; }

    drift++;
    // Preserve notation: var() chain stays a chain, literal stays resolved.
    const replacement = /^var\(/.test(value.trim()) ? real : resolve(real);
    notes.push(`    --${name}\n      was: ${value}\n      now: ${replacement}`);
    return `${head}${replacement}${tail}`;
  });

  totalDrift += drift;
  totalOk += ok;

  if (drift) {
    console.log(`${file}  —  ${ok} correct, ${drift} drifted`);
    for (const n of notes.slice(0, 4)) console.log(n);
    if (notes.length > 4) console.log(`    ... and ${notes.length - 4} more`);
    if (!CHECK) {
      writeFileSync(file, out.join("\n"));
      changedFiles.push(file);
    }
  }
}

console.log("");
console.log(`${totalOk} declarations already matched, ${totalDrift} drifted.`);

if (CHECK) {
  if (totalDrift) {
    console.log("Run `node scripts/sync-demo-tokens.js` to fix.");
    process.exit(1);
  }
  console.log("All demo token blocks match tokens.css.");
} else if (changedFiles.length) {
  console.log(`Rewrote: ${changedFiles.join(", ")}`);
} else {
  console.log("Nothing to rewrite.");
}
