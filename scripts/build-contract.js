/**
 * build-contract.js: emit dist/contract.json and dist/README.md.
 *
 * WHY THIS EXISTS:
 *
 * A developer installs the package, opens node_modules, and sees eleven files
 * with no indication which of them he is supposed to name. The only statement
 * of the boundary lived in CLAUDE.md §6, which never ships. So the boundary was
 * real to us and invisible to him, and the observed result is that teams either
 * refuse the package as too granular, or rebuild the token set from a Figma
 * export and lose motion, theming and versioning in the process.
 *
 * Two outputs, for two audiences:
 *
 *   dist/README.md    for a human opening node_modules. States the count, the
 *                       load order, and which files are safe to name.
 *   dist/contract.json for a machine. The list of consumable names, so a team
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
// file where the answers differ, which is precisely why it needed labelling.
const FILES = [
  { file: "primitives.css",        contract: false, load: true,  role: "Raw colour ramps. Load it; do not name it." },
  { file: "themes/light.css",      contract: true,  load: true,  role: "Colour contract, Light Mode." },
  { file: "themes/midnight.css",   contract: true,  load: true,  role: "Colour contract, Midnight Mode. Same names as light." },
  { file: "type.css",              contract: true,  load: true,  role: "Type scale. Compose from these." },
  { file: "layout.css",            contract: true,  load: true,  role: "Spacing, radii, border widths." },
  { file: "layout-contextual.css", contract: false, load: false, role: "Per-component metrics. This repo's components use these." },
  { file: "motion.css",            contract: true,  load: true,  role: "Durations and easings." },
  { file: "layout-responsive.css", contract: true,  load: true,  role: "Sheet and TopNav padding. The only layout tokens with media queries." },
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
        "scripts/build-contract.js, do not hand-edit. Lint against `contract` " +
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
      // Structured form of the "How to choose a token" and "What the names do
      // not promise" sections of README.md. Emitted for tools that resolve a
      // design onto these names without a human in the loop: they read the
      // package before they read any prose we write elsewhere.
      guidance: {
        why:
          "One token library skins several codebases, products and UI libraries, and there is no " +
          "shared component library yet. The names must be legible enough to assist mapping " +
          "without being so granular that the set bloats and adoption fails. Every other choice " +
          "below follows from that constraint.",
        decide: {
          question:
            "Does this element's colour change because of something the user does to it?",
          yes: "Action. Take the whole state set: -rest, -hover, -pressed, plus -disabled.",
          no: "Static. Pick one emphasis rung and stop.",
          note:
            "Not how many values exist. Static has six rungs and is still single-valued per " +
            "element: the rungs are a menu you choose from once, the states are a sequence one " +
            "element walks through.",
        },
        axes: {
          tier: { fill: "a background", foreground: "text or an icon", stroke: "a border or outline" },
          family: ["neutral", "brand", "negative", "positive", "info", "attention", "severe", "accent"],
          emphasisQuietestFirst: ["faint", "subtle", "base", "bold", "strong"],
          stateOnlyOnAction: ["rest", "hover", "pressed", "disabled"],
        },
        doesNotPromise: [
          "`primary` means A primary action, not your primary button. This package ships no components.",
          "A component-shaped name such as fill-action-field-* describes a surface, not a component contract.",
          "Two names sharing a value today are not interchangeable and may diverge in the next release.",
          "`-on-strong` and `-on-subtle` are contrast pairing constraints, not lightness variants. The prefix names what must be behind the foreground.",
          "No foreground rung is lighter than #484848 because everything lighter fails WCAG AA on white. A missing grey is a refusal, not a gap.",
        ],
        modes:
          "One name resolves per brand theme (Amplify, NewCo) and per mode (Light, Dark). Never put " +
          "a brand or a mode in a property name; --semantic-color-light-mode-* is retired and " +
          "resolves to nothing.",
        primitives:
          "Published so that bindings resolve, not so that they get applied. Every primitive carries " +
          "\"Do not apply directly\" in its own description.",
        ifAmbiguous:
          "If two names look equally right, that is a defect here rather than in your understanding. " +
          "Report which two: a consumer's mapping is invisible from this side until someone says so.",
      },
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
${rows.reduce((n, r) => n + r.names.length, 0)}. That number is not the contract, and the table below says why.

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
color: var(--semantic-color-fill-action-primary-strong-rest);  /* flips with the theme */
\`\`\`

Use one when you specifically want a value that does not respond to the theme.

## Theming

One name, two values, resolved by selector. Set \`data-theme="midnight"\` on \`<html>\`
to flip the page, or on any element to flip just that subtree. It composes both ways,
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
letter-spacing: var(--semantic-type-letter-spacing-wide);
\`\`\`

## Layout units carry their unit

\`\`\`css
border-radius: var(--semantic-layout-units-cornerradius-small);             /* correct */
border-radius: calc(var(--semantic-layout-units-cornerradius-small) * 1px);  /* WRONG */
\`\`\`

The second is \`calc(4px * 1px)\`, which is not a length, so the browser drops it silently.

## How to choose a token

Most of the cost of adopting this package is not installing it. It is deciding
which of the colour names belongs on something you already built. This is the
rule.

Both tiers carry a family (\`neutral\`, \`brand\`, \`negative\`) and an emphasis rung
(\`faint\`, \`subtle\`, \`base\`, \`bold\`, \`strong\`). Only one of them carries state.

| | what it means | example |
|---|---|---|
| Emphasis | how loud this element is. Chosen once, never changes. | a divider is \`stroke-static-neutral-faint\`, permanently |
| State | where an element is in an interaction right now. One element moves through all of them. | a button is \`rest\`, then \`hover\`, then \`pressed\` |

So the question is not how many values exist. \`Static\` has six rungs and is
still single-valued per element. The question is:

> Does this element's colour change because of something the user does to it?

Yes means **Action**, and you need its whole state set. No means **Static**, and
you pick one emphasis rung and stop.

As a procedure:

1. Interactive? Action. Otherwise Static.
2. Tier: a background is \`fill\`, text or an icon is \`foreground\`, a border or
   outline is \`stroke\`.
3. Family: \`neutral\`, \`brand\`, \`negative\`, \`positive\`, \`info\`, \`attention\`,
   \`severe\`, or an \`accent\` hue.
4. Emphasis rung, quietest to loudest: \`faint\`, \`subtle\`, \`base\`, \`bold\`,
   \`strong\`.
5. If Action, take \`-rest\`, \`-hover\`, \`-pressed\` together, plus \`-disabled\`.

## What the names do not promise

The names are deliberately legible so they can assist mapping. The cost of that
legibility is that a name can read like a promise it is not making.

- **\`primary\` is not your primary button.** It means *a* primary action. This
  package ships no button and has no opinion about yours. If your main call to
  action is visually quiet, the loud primary token is the wrong one for it
  however well the words line up.
- **A component-shaped name is not a component contract.** \`fill-action-field-*\`
  describes a field-like surface. Nothing here constrains component anatomy.
- **Two names resolving to the same value are not interchangeable.** Some pairs
  currently share a value in some themes. They mean different things and are
  free to diverge in the next release. Choose by the rule above, not by which
  value looks right today.
- **\`-on-strong\` and \`-on-subtle\` are pairing constraints, not shades.**
  \`foreground-static-brand-on-strong\` means the foreground to use ON a strong
  fill. It is a contrast guarantee about a combination. Using it on a light
  surface is an accessibility failure, not a quiet variant.
- **Absence is sometimes deliberate.** There is no foreground rung lighter than
  \`#484848\`, because everything lighter fails WCAG AA on white. A missing grey
  is a refusal, not a gap. Report it rather than reaching for a primitive.

## Why the architecture is shaped this way

Worth knowing, because it explains the shape rather than just stating it.

**One token library skins several codebases, products and UI libraries, and
there is no shared component library yet.** That single constraint sets the
whole design. The names have to be self-explanatory enough to help a developer
map an existing product onto them, without being so granular that the set
bloats and nobody adopts it. Everything below follows from that.

**Action and Static are separate tiers because state is the only axis Action
adds.** Both carry family and emphasis. When a component library exists, the
component will carry the context and this fork will stop being something anyone
picks by hand. Until then, the tier is what tells you whether a value has to
respond to a pointer.

**Modes live on the semantic tier, never in a name.** One name resolves to a
different value per brand theme (Amplify, NewCo) and per mode (Light, Dark), so
the colour contract is a few hundred names carrying several times that many
values. A brand or a mode in a property name means something has gone wrong;
\`--semantic-color-light-mode-*\` is retired and resolves to nothing.

**Primitives are published so that bindings resolve, not so that they get
applied.** Every primitive carries "Do not apply directly" in its own
description. If you find yourself naming a \`--primitive-color-*\`, the token you
want either exists under a semantic name or does not exist yet.

**If two names still look equally right, say which two.** A name that cannot be
chosen between is a defect here, not in your understanding. It is also the most
useful feedback a consuming team can send, because a mapping is invisible from
this side until someone reports it.

## Machine-readable

\`contract.json\` lists every consumable name plus the per-file counts, so you can lint
against it if you want the boundary enforced. It also carries a \`guidance\` block with
the choosing rule above in structured form, for a tool resolving a design onto these
names without a human in the loop.

## Motion is not in Figma

The Variables panel has zero motion variables; \`motion.css\` is generated from
\`docs/design-system-spec.md\` §2. Anyone rebuilding tokens from a Figma export gets no
motion at all and no warning, so consume the package instead.

---

Repo: https://github.com/helloimjolopez-collab/pathway-ds
`
);

console.log(
  `dist/contract.json: ${contractNames.length} consumable names ` +
    `(${rows.filter((r) => !r.contract).reduce((n, r) => n + r.names.length, 0)} infrastructure, not counted)`
);
console.log("dist/README.md written");
