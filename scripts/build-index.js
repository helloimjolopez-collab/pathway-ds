/**
 * build-index.js, write a single CSS entry point per brand.
 *
 * WHY THIS EXISTS
 * The contract is nine files that must load in a specific order, and the first
 * one is load-bearing in a way nothing detects: every semantic token resolves
 * through primitives.css via var(), and an unresolved var() paints NOTHING and
 * raises NO console error. Omit it and the page renders unstyled while the build
 * stays green. Today that is guarded only by prose in CLAUDE.md plus a nine-line
 * <link> list hand-maintained in every demo, every story and .storybook/preview.js.
 *
 * On 2026-09-29 a subtler version of the same bug shipped: primitives.css emitted
 * --primitive-color-PATHWAY-brand-75-16 while themes/light.css still referenced
 * --primitive-color-brand-75-16, so the file was present, correctly ordered, and
 * still resolved to nothing. An entry point would not have caught that one, but
 * it removes the whole class of "wrong file, wrong order, missing file" errors
 * from every consumer, which is the part a consumer can actually get wrong.
 *
 * Ported from newco-ds, which has had scripts/build-index.js and
 * src/tokens/index.css since its token pipeline was reworked for adoption. Keep
 * the two in step: same ORDER, same "primitives first" comment, so a developer
 * moving between the two systems reads the same file.
 *
 * NEWCO IS A SEPARATE ENTRY POINT ON PURPOSE. It is emitted under brands/newco/
 * and is NOT imported by the Pathway index, because Storybook deploys to public
 * GitHub Pages and a single index would publish the brand by accident. A consumer
 * opts in with a second import plus data-brand="newco".
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";

// Order matters: primitives must load before the themes that reference them.
const PATHWAY_ORDER = [
  "primitives.css",
  "themes/light.css",
  "themes/midnight.css",
  "layout.css",
  "layout-contextual.css",
  "layout-responsive.css",
  "type.css",
  "motion.css",
  "breakpoints.css",
];

// Same shape, brand-scoped. These redefine the SAME property names under
// [data-brand="newco"], so they layer on top of the Pathway contract rather
// than replacing it: which is why primitives comes first here too.
const NEWCO_ORDER = [
  "primitives.css",
  "themes/light.css",
  "themes/dark.css",
  "layout-contextual.css",
];

function render(title, order) {
  return (
    `/*\n` +
    ` ${title}\n` +
    ` @imports every token file in load order (primitives first, so the themes that\n` +
    ` reference it resolve). Generated: do not edit. Run \`npm run build-dist\`.\n` +
    `*/\n` +
    order.map((f) => `@import "./${f}";`).join("\n") +
    "\n"
  );
}

const targets = [
  ["src/tokens/index.css", "Pathway design tokens, single entry point.", PATHWAY_ORDER],
  ["dist/index.css", "Pathway design tokens, single entry point.", PATHWAY_ORDER],
  [
    "dist/brands/newco/index.css",
    "NewCo brand layer, single entry point. Load AFTER the Pathway index and set data-brand=\"newco\".",
    NEWCO_ORDER,
  ],
];

let written = 0;
for (const [path, title, order] of targets) {
  const dir = path.slice(0, path.lastIndexOf("/"));
  // dist/ only exists once build-dist.js has run; src/ always does.
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, render(title, order));
  written++;
}
console.log(
  `index.css: ${written} entry points written ` +
    `(pathway ${PATHWAY_ORDER.length} files, newco ${NEWCO_ORDER.length} files, primitives first).`
);
