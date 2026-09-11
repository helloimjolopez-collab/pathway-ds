/**
 * check-story-yield.js — fail the build when a token docs page renders NOTHING.
 *
 * WHY THIS EXISTS:
 *
 * On 2026-09-09 the user found three of the token documentation pages in the
 * deployed Storybook rendering blank. The cause was not a stale token name —
 * it was a stale token SHAPE:
 *
 *   - SemanticTypography.js filtered on `token.props.fontsize`. Semantic Type
 *     went from 554 composite variables to a flat 41-token scale on
 *     2026-09-03, so no token has `.props` any more. The filter matched zero
 *     rows.
 *   - SemanticColors.js was called with mode "dark-mode". The mode was renamed
 *     to "midnight-mode" on 2026-08-28. Zero rows.
 *
 * None of the three existing checkers could see this, and that is the point
 * worth remembering:
 *
 *   check-demo-tokens.js   greps HTML demos for literal var(--name)
 *   check-token-refs.js    expands helper templates in code, checks the names
 *   check-token-names.js   checks token names written as prose
 *
 * All three verify that a token NAME resolves. These generator files name no
 * tokens at all — they ITERATE the token set and filter it. A filter that
 * matches nothing produces an empty container, which is valid JS, valid DOM,
 * and a clean Storybook build. The failure was invisible from the inside and
 * obvious from the outside, which is the worst combination: the user found it,
 * not CI.
 *
 * So this check renders each generator for real, under jsdom, and asserts a
 * minimum row count. It does NOT check that the content is correct — it checks
 * that content exists at all. That is a low bar deliberately: a low bar that
 * runs beats a high bar that does not.
 *
 * Adding a docs generator? Add it to PAGES. A generator with no entry here is
 * unguarded, and the whole reason this file exists is that unguarded
 * generators fail silently for weeks.
 *
 * Usage:  node scripts/check-story-yield.js [--verbose]
 * Exit 1 if any page yields fewer rows than its floor.
 */

import { JSDOM } from "jsdom";

const verbose = process.argv.includes("--verbose");

// Install a DOM before importing the generators: they call document.createElement
// at module scope in some cases, and always inside the exported factory.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Deliberately NOT assigning globalThis.navigator: it is a getter-only global
// from Node 21 onward and assigning it throws. None of these generators touch
// navigator, so shimming it would only add a failure mode.

const { createSemanticTypography } = await import("../src/stories/components/SemanticTypography.js");
const { createSemanticColors } = await import("../src/stories/components/SemanticColors.js");
const { createPrimitiveColors } = await import("../src/stories/components/PrimitiveColors.js");
const { createPrimitiveTypography } = await import("../src/stories/components/PrimitiveTypography.js");
const { createPrimitiveUnits } = await import("../src/stories/components/PrimitiveUnits.js");
const { createSemanticLayout } = await import("../src/stories/components/SemanticLayout.js");

/**
 * Each page declares the floor it must clear. The floors are set well below the
 * real counts so a legitimate token deletion does not trip them, but far above
 * zero so a shape change does. The comment records the count observed when the
 * floor was set, which is what makes a later drop legible.
 */
const PAGES = [
  {
    title: "Tokens/Semantics/Typography",
    render: () => createSemanticTypography(),
    floor: 120, // observed 188 elements for 41 tokens across 5 axes
  },
  {
    title: "Tokens/Semantics/Color (Light Mode)",
    render: () => createSemanticColors("light-mode"),
    floor: 2400, // observed 3749 elements for 358 rows
  },
  {
    title: "Tokens/Semantics/Color (Midnight Mode)",
    render: () => createSemanticColors("midnight-mode"),
    floor: 2400, // observed 3749 elements for 358 rows
  },
  {
    title: "Tokens/Primitives/Color",
    render: () => createPrimitiveColors(),
    floor: 650, // observed 992 for 239 swatches
  },
  {
    title: "Tokens/Primitives/Typography",
    render: () => createPrimitiveTypography(),
    floor: 220, // observed 337 for 79 tokens
  },
  {
    title: "Tokens/Primitives/Units",
    render: () => createPrimitiveUnits(),
    floor: 100, // observed 160 for 32 tokens
  },
  {
    title: "Tokens/Semantics/Layout",
    render: () => createSemanticLayout(),
    floor: 400, // observed 606 for 117 rows
  },
];

/**
 * Measure yield two ways, because neither alone is honest.
 *
 * `elements` is the structural measure and the one the floor is set against: a
 * generator whose filter matches nothing returns a container with a handful of
 * children at most, while a working page returns hundreds. It is
 * shape-independent, which matters — the whole failure being guarded against
 * was a token SHAPE change, so a measure that assumes a shape is the wrong
 * tool.
 *
 * `names` counts distinct CSS custom properties printed. It is reported but
 * NOT used as a floor, because zero is the correct answer for the primitive
 * pages: product code must never name a `--primitive-*` (CLAUDE.md §6), so
 * those pages deliberately print the ramp step rather than a copyable property.
 * An earlier version of this check floored on `names` and reported all three
 * primitive pages as broken when they were fine. Reporting it keeps the number
 * visible without letting it fail a page for doing the right thing.
 */
function measure(node) {
  const elements = node.querySelectorAll("*").length;
  const text = node.textContent || "";
  const printed = text.match(/--[a-z][a-z0-9-]*/g) || [];
  const names = new Set(printed).size;

  // Any custom property a docs page PRINTS must be one a reader can copy and
  // have resolve. A mode-in-name property cannot: those came from tokens.css,
  // retired 2026-09-03, and the emitted themes declare only the modeless name
  // with the selector choosing the value.
  //
  // This caught a bug in the rewrite of SemanticColors.js on the day it was
  // written. The generator printed `token.name` straight from tokens.js, whose
  // KEY does carry the mode, so the Midnight page published 326 names that all
  // resolved to nothing - on the page whose job is to give a reader the right
  // name. The element-count floor passed happily; only this check sees it.
  const modeInName = [...new Set(printed.filter((n) => /-(light|midnight|dark)-mode-/.test(n)))];

  return { elements, names, modeInName };
}

/**
 * Assert the graded ladder renders in ladder order rather than alphabetically.
 *
 * The Figma panel cannot be sorted, so ordering is imposed downstream by
 * tokenOrder.js. That makes it a piece of LOGIC, and logic that nothing checks
 * silently stops working: the first version ordered
 * Foreground/Static/Neutral as bold, contrast, faint, light - alphabetical -
 * because each vocabulary in the comparator answered alphabetically for
 * segments it did not recognise, so the ladder was never reached.
 *
 * Checking one well-populated ladder is enough. If the comparator regresses it
 * regresses for all of them.
 */
const LADDER_EXPECTED = ["white", "xlight", "faint", "subtle", "light", "medium", "contrast", "bold"];

function checkLadderOrder(node) {
  const printed = (node.textContent || "").match(/--semantic-color-[a-z0-9-]+/g) || [];
  const prefix = "--semantic-color-foreground-static-neutral-";
  const seen = [];
  for (const n of printed) {
    if (!n.startsWith(prefix)) continue;
    const step = n.slice(prefix.length);
    if (!seen.includes(step)) seen.push(step);
  }
  if (seen.length < 4) return null; // not enough rungs to judge
  const expected = LADDER_EXPECTED.filter((s) => seen.includes(s));
  const ok = seen.join(">") === expected.join(">");
  return ok ? null : `ladder out of order: got ${seen.join(" > ")}, expected ${expected.join(" > ")}`;
}

let failed = 0;
const results = [];

for (const page of PAGES) {
  let m = { elements: 0, names: 0, modeInName: [] };
  let error = null;
  let ladderIssue = null;
  try {
    const node = page.render();
    m = measure(node);
    ladderIssue = checkLadderOrder(node);
  } catch (e) {
    error = e;
  }

  const ok =
    !error && m.elements >= page.floor && m.modeInName.length === 0 && !ladderIssue;
  if (!ok) failed++;
  results.push({ ...page, ...m, error, ladderIssue, ok });
}

const width = Math.max(...PAGES.map((p) => p.title.length));
for (const r of results) {
  const status = r.ok ? "ok  " : "FAIL";
  const detail = r.error
    ? `threw ${r.error.constructor.name}: ${r.error.message}`
    : `${String(r.elements).padStart(5)} elements (floor ${r.floor}), ${r.names} custom properties named`;
  console.log(`  ${status}  ${r.title.padEnd(width)}   ${detail}`);
  if (r.modeInName && r.modeInName.length) {
    console.log(
      `        ${r.modeInName.length} mode-in-name propert${r.modeInName.length === 1 ? "y" : "ies"} printed, ` +
        `which resolve to nothing. First: ${r.modeInName[0]}`
    );
  }
  if (r.ladderIssue) console.log(`        ${r.ladderIssue}`);
  if (verbose && r.error) console.log(r.error.stack);
}

if (failed) {
  console.error(
    `\n${failed} of ${PAGES.length} token docs page(s) rendered less than expected.\n` +
      "A page that renders nothing still builds cleanly, so this is the only check that catches it.\n" +
      "Most likely a token SHAPE or a mode name changed and the generator's filter no longer matches.\n" +
      "Inspect the generator's filter against the real token paths:\n" +
      `  node -e "const t=require('./src/tokens/tokens.js');const x=t.default||t;console.log(Object.values(x)[0].path)"`
  );
  process.exit(1);
}

console.log(`\nAll ${PAGES.length} token docs pages render content.`);
