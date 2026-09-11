/**
 * stamp-headers.js — give every emitted stylesheet a header that says whether
 * a developer may name the properties inside it.
 *
 * WHY THIS EXISTS:
 *
 * Style Dictionary stamps every file it writes with the same four lines:
 *
 *     Do not edit directly, this file was auto-generated.
 *
 * So `primitives.css` and `themes/light.css` introduced themselves identically.
 * One is a 350-value internal ramp that product code must never name; the other
 * is the 358-name colour contract. A developer opening either file had no way
 * to tell which was which, and the only place the distinction was written down
 * was CLAUDE.md §6 — a file no consumer will ever read.
 *
 * That is the whole adoption problem in miniature. A developer judges a design
 * system by the first stylesheet he opens and the number of lines in it. If the
 * first file is 356 lines of raw ramp values with no explanation, the honest
 * conclusion is "this is too granular" — and he is right, because nothing told
 * him those 350 lines are infrastructure he never touches.
 *
 * So each file now states three things: whether it is CONTRACT or
 * INFRASTRUCTURE, how many names it declares, and what happens if you get it
 * wrong. The counts are computed here rather than typed, so they cannot drift
 * from the file they describe.
 *
 * Runs after style-dictionary and before build-dist, so dist/ inherits the
 * headers by plain file copy.
 *
 * Usage:  node scripts/stamp-headers.js [--check]
 *   --check  verify every file carries a header and exit 1 if not, without
 *            writing. Use in CI so a new emitted file cannot ship unlabelled.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = "src/tokens";

// The load-order sentence appears on the infrastructure file and on the first
// contract file, because getting it wrong is the single most common failure: if
// primitives.css is missing, every semantic resolves to nothing and the page
// renders unstyled with no error in the console.
const LOAD_ORDER = "Load primitives.css FIRST; every file below resolves through it.";

const FILES = [
  {
    path: `${SRC}/primitives.css`,
    kind: "INFRASTRUCTURE",
    lines: [
      "The raw colour ramps. NOT part of the token contract.",
      "",
      "You must LOAD this file — every semantic token resolves through it, so",
      "without it all colour resolves to nothing and the page renders unstyled",
      "with no console error. But product code should not NAME these.",
      "",
      "The reason is a consequence, not a rule: Primitive: Color has exactly ONE",
      "mode, and themes/midnight.css declares zero primitives. So a primitive",
      "holds one value forever. `var(--primitive-color-brand-400)` stays that",
      "blue in Midnight Mode; `var(--semantic-color-fill-action-primary-rest)`",
      "flips. Reach for a primitive only when you specifically want a value that",
      "does NOT respond to the theme.",
      "",
      "Nothing blocks you. It is an escape hatch with a stated cost.",
    ],
  },
  {
    path: `${SRC}/themes/light.css`,
    kind: "CONTRACT",
    lines: [
      "The colour contract, Light Mode. Name these freely.",
      "",
      LOAD_ORDER,
      "",
      "themes/midnight.css declares the SAME names with inverted values, so a",
      "component names a colour once and both modes resolve by selector. Never",
      "put a mode in a property name — that form came from tokens.css, retired",
      "2026-09-03, and resolves to nothing.",
    ],
  },
  {
    path: `${SRC}/themes/midnight.css`,
    kind: "CONTRACT",
    lines: [
      "The colour contract, Midnight Mode. Identical names to themes/light.css.",
      "",
      "Pathway's dark mode is called Midnight Mode. Both selectors are emitted:",
      '[data-theme="midnight"] is the Pathway name, [data-theme="dark"] is what',
      "every framework and prefers-color-scheme uses, so a consumer does not have",
      "to learn our vocabulary to switch themes.",
      "",
      "On the graded ladder the VALUES invert while the NAMES hold: Faint is",
      "still the lightest-touch step even though here it is a dark near-ground.",
      "White, XLight and Black are inversion anchors and keep their value.",
    ],
  },
  {
    path: `${SRC}/type.css`,
    kind: "CONTRACT",
    lines: [
      "The type SCALE. Name these freely.",
      "",
      "There are no composite text styles here and no .pw-type-* classes; both",
      "were retired 2026-09-03. Compose five properties at the call site:",
      "",
      "  font-family:    var(--semantic-type-family-brand);",
      "  font-size:      var(--semantic-type-font-size-m);",
      "  font-weight:    var(--semantic-type-weight-semibold);",
      "  line-height:    var(--semantic-type-line-height-m-single);",
      "  letter-spacing: var(--semantic-type-letter-spacing-compact);",
      "",
      "The 111 named styles still exist as Figma text styles, which is where a",
      "designer applies them.",
    ],
  },
  {
    path: `${SRC}/layout.css`,
    kind: "CONTRACT",
    lines: [
      "Spacing, radii and border widths. Name these freely.",
      "",
      "Values already carry their unit, so use them directly — do NOT wrap in",
      "calc(... * 1px). That produces calc(4px * 1px), which is not a length, so",
      "the browser silently drops the declaration.",
      "",
      "Breakpoints are handled by media query inside this file rather than by",
      "putting the breakpoint in the property name, so one name works responsively.",
    ],
  },
  {
    path: `${SRC}/layout-contextual.css`,
    kind: "COMPONENT INTERNALS",
    lines: [
      "Per-component metrics (Button, Card, NavItem, Page, focus ring).",
      "",
      "This repo's own components use these. Product code generally should not —",
      "prefer layout.css, which is the general spacing contract. These exist so a",
      "component's geometry can be tuned without moving the whole scale.",
    ],
  },
  {
    path: `${SRC}/motion.css`,
    kind: "CONTRACT",
    lines: [
      "Durations and easings. Name these freely.",
      "",
      "These are NOT in the Figma Variables panel — the panel has zero motion",
      "variables. Their source of truth is docs/design-system-spec.md §2, and",
      "scripts/sync-motion-tokens.js generates this file from it.",
      "",
      "Consequence worth knowing: anyone rebuilding tokens from a Figma export",
      "alone gets no motion at all, and no warning. Consume the package.",
    ],
  },
  {
    path: `${SRC}/breakpoints.css`,
    kind: "CONTRACT",
    lines: ["The breakpoint values. Name these freely."],
  },
];

const COUNT_RE = /^\s*--[a-z0-9-]+\s*:/gim;
const MARKER = "PATHWAY DESIGN TOKENS";

function build(file, count) {
  const bar = "=".repeat(74);
  const out = [
    "/*",
    ` ${bar}`,
    ` ${MARKER} — ${file.kind}`,
    ` ${bar}`,
    "",
    ...file.lines.map((l) => (l ? ` ${l}` : "")),
    "",
    ` Declares ${count} custom ${count === 1 ? "property" : "properties"}.`,
    " Generated — do not edit. Run `npm run build-tokens`.",
    ` ${bar}`,
    "*/",
    "",
  ];
  return out.join("\n");
}

// Strip whatever header is currently on the file: either Style Dictionary's
// own, or a previous run of this script. Matching only a leading block comment
// keeps this idempotent and means a re-run never stacks headers.
const stripHeader = (css) => css.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "");

const check = process.argv.includes("--check");
let changed = 0, missing = [];

for (const file of FILES) {
  if (!existsSync(file.path)) {
    missing.push(`${file.path} does not exist`);
    continue;
  }
  const raw = readFileSync(file.path, "utf8");
  if (check) {
    if (!raw.includes(MARKER)) missing.push(`${file.path} has no Pathway header`);
    continue;
  }
  const body = stripHeader(raw);
  const count = (body.match(COUNT_RE) || []).length;
  writeFileSync(file.path, build(file, count) + body);
  changed++;
  console.log(`  ${file.kind.padEnd(20)} ${file.path.replace(SRC + "/", "").padEnd(24)} ${count}`);
}

if (missing.length) {
  console.error(
    (check ? "Header check failed:\n" : "stamp-headers could not run:\n") +
      missing.map((m) => "  " + m).join("\n") +
      "\n\nEvery emitted stylesheet must say whether its properties are safe to\n" +
      "name. An unlabelled file is indistinguishable from the internal ramp,\n" +
      "which is how a developer concludes the system is too granular to adopt."
  );
  process.exit(1);
}

console.log(check ? "All stylesheets carry a Pathway header." : `Stamped ${changed} stylesheets.`);
