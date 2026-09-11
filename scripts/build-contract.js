/**
 * build-contract.js — emit dist/contract.json and dist/README.md.
 *
 * WHY THIS EXISTS:
 *
 * A developer installs the package, opens node_modules, and sees eleven files
 * with no indication which of them he is supposed to name. The only statement
 * of the boundary lived in CLAUDE.md §6, which never ships. So the boundary was
 * real to us and invisible to him — and the observed result is that teams either
 * refuse the package as too granular, or rebuild the token set from a Figma
 * export and lose motion, theming and versioning in the process.
 *
 * Two outputs, for two audiences:
 *
 *   dist/README.md    — for a human opening node_modules. States the count, the
 *                       load order, and which files are safe to name.
 *   dist/contract.json — for a machine. The list of consumable names, so a team
 *                       that WANTS enforcement can lint against it. Opt-in by
 *                       design: nothing here blocks anyone from using a
 *                       primitive, it just makes the boundary checkable.
 *
 * Both are generated from the emitted CSS rather than hand-maintained, so the
 * numbers cannot drift from the files they describe. A hand-typed count is a
 * count that will be wrong within a month.
 *
 * Runs inside build-dist, after the stylesheets are copied into dist/.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DECL = /^\s*(--[a-z0-9-]+)\s*:/gim;

// `contract` is the answer to "may I name this?". `load` is the answer to "must
// I include this file?". They are different questions and primitives.css is the
// file where the answers differ — which is precisely why it needed labelling.
const FILES = [
  { file: "primitives.css",        contract: false, load: true,  role: "Raw colour ramps. Load it; do not name it." },
  { file: "themes/light.css",      contract: true,  load: true,  role: "Colour contract, Light Mode." },
  { file: "themes/midnight.css",   contract: true,  load: true,  role: "Colour contract, Midnight Mode. Same names as light." },
  { file: "type.css",              contract: true,  load: true,  role: "Type scale. Compose from these." },
  { file: "layout.css",            contract: true,  load: true,  role: "Spacing, radii, border widths." },
  { file: "layout-contextual.css", contract: false, load: false, role: "Per-component metrics. This repo's components use these." },
  { file: "motion.css",            contract: true,  load: true,  role: "Durations and easings." },
  { file: "breakpoints.css",       contract: true,  load: true,  role: "Breakpoint values." },
];

const rows = [];
for (const f of FILES) {
  const path = `dist/${f.file}`;
  if (!existsSync(path)) {
    console.error(`build-contract: ${path} missing. Run build-dist first.`);
    process.exit(1);
  }
  const css = readFileSync(path, "utf8");
  const names = [...new Set([...css.matchAll(DECL)].map((m) => m[1]))].sort();
  rows.push({ ...f, names });
}

const contractRows = rows.filter((r) => r.contract);
const contractNames = [...new Set(contractRows.flatMap((r) => r.names))].sort();

// A zero count means a filter broke upstream and every file emitted nothing.
// That builds cleanly and ships an empty contract, so it has to stop the build.
if (!contractNames.length) {
  console.error("build-contract: the contract is empty. Refusing to write.");
  process.exit(1);
}

writeFileSync(
  "dist/contract.json",
  JSON.stringify(
    {
      $comment:
        "The names a consumer may use. Generated from the emitted CSS by " +
        "scripts/build-contract.js — do not hand-edit. Lint against `contract` " +
        "if you want the boundary enforced; nothing here blocks a primitive.",
      version: JSON.parse(readFileSync("package.json", "utf8")).version,
      generated: new Date().toISOString().slice(0, 10),
      counts: {
        contract: contractNames.length,
        infrastructure: rows.filter((r) => !r.contract).reduce((n, r) => n + r.names.length, 0),
        declarationsAcrossAllFiles: rows.reduce((n, r) => n + r.names.length, 0),
      },
      loadOrder: rows.filter((r) => r.load).map((r) => r.file),
      files: Object.fromEntries(
        rows.map((r) => [r.file, { contract: r.contract, mustLoad: r.load, count: r.names.length, role: r.role }])
      ),
      contract: contractNames,
    },
    null,
    2
  ) + "\n"
);

const tick = (b) => (b ? "yes" : "**no**");
const table = rows
  .map((r) => `| \`${r.file}\` | ${r.names.length} | ${tick(r.contract)} | ${tick(r.load)} | ${r.role} |`)
  .join("\n");

const loadBlock = rows
  .filter((r) => r.load)
  .map((r) => `<link rel="stylesheet" href="${r.file}">`)
  .join("\n");

writeFileSync(
  "dist/README.md",
  `# Pathway design tokens

**The colour contract is ${rows.find((r) => r.file === "themes/light.css").names.length} names.** Your full working vocabulary is
**${contractNames.length}**. If you add up every declaration in this folder you get
${rows.reduce((n, r) => n + r.names.length, 0)} — that number is not the contract, and the table below says why.

## Link these, in this order

\`\`\`html
${loadBlock}
\`\`\`

\`primitives.css\` must come first. Every semantic token resolves through it, so if it is
missing all colour resolves to nothing and the page renders unstyled **with no console
error**.

## The files

| File | Names | Safe to name? | Must load? | What it is |
|---|---|---|---|---|
${table}

Each file repeats this in its own header.

## Can I use a primitive?

Yes. Nothing stops you and nothing should. But \`Primitive: Color\` has exactly **one
mode** and \`themes/midnight.css\` declares **zero** primitives, so a primitive holds one
value forever:

\`\`\`css
color: var(--primitive-color-brand-400);               /* stays this blue in Midnight */
color: var(--semantic-color-fill-action-primary-rest);  /* flips with the theme */
\`\`\`

Use one when you specifically want a value that does not respond to the theme.

## Theming

One name, two values, resolved by selector. Set \`data-theme="midnight"\` on \`<html>\`
to flip the page, or on any element to flip just that subtree — it composes both ways,
so a light island can sit inside a dark island.

Never put a mode in a property name. \`--semantic-color-light-mode-*\` came from
\`tokens.css\`, retired 2026-09-03, and resolves to nothing.

## Type

No composite styles and no \`.pw-type-*\` classes. Name five properties:

\`\`\`css
font-family:    var(--semantic-type-family-brand);
font-size:      var(--semantic-type-font-size-m);
font-weight:    var(--semantic-type-weight-semibold);
line-height:    var(--semantic-type-line-height-m-single);
letter-spacing: var(--semantic-type-letter-spacing-compact);
\`\`\`

## Layout units carry their unit

\`\`\`css
border-radius: var(--semantic-layout-units-cornerradius-small);             /* correct */
border-radius: calc(var(--semantic-layout-units-cornerradius-small) * 1px);  /* WRONG */
\`\`\`

The second is \`calc(4px * 1px)\`, which is not a length, so the browser drops it silently.

## Machine-readable

\`contract.json\` lists every consumable name plus the per-file counts, so you can lint
against it if you want the boundary enforced.

## Motion is not in Figma

The Variables panel has zero motion variables; \`motion.css\` is generated from
\`docs/design-system-spec.md\` §2. Anyone rebuilding tokens from a Figma export gets no
motion at all and no warning — consume the package instead.

---

Repo: https://github.com/helloimjolopez-collab/pathway-ds
`
);

console.log(
  `dist/contract.json: ${contractNames.length} consumable names ` +
    `(${rows.filter((r) => !r.contract).reduce((n, r) => n + r.names.length, 0)} infrastructure, not counted)`
);
console.log("dist/README.md written");
