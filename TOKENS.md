# Pathway tokens — start here

**The colour contract is 358 names. Your full working vocabulary is 460.**

This file exists at the repo root because the previous arrangement failed a real test: a
developer went looking for "the token CSS", could not find it, and had no way to tell
which names he was allowed to use. Everything he needed existed — three directories
down. That is the same as not existing.

## Where the CSS is

**[`src/tokens/`](src/tokens/)** — and that folder has [its own
README](src/tokens/README.md) covering load order, theming, the primitives question and
the traps. GitHub renders it inline when you browse in.

There is **no `tokens.css`**. A single combined file was retired on 2026-09-03 because it
emitted every token times every mode with the mode baked into the property name — 2,338
custom properties — and that is the number that made this system look unadoptable. It is
not coming back.

## What to link, in this order

```html
<link rel="stylesheet" href="primitives.css">      <!-- REQUIRED, never named -->
<link rel="stylesheet" href="themes/light.css">
<link rel="stylesheet" href="themes/midnight.css">
<link rel="stylesheet" href="type.css">
<link rel="stylesheet" href="layout.css">
<link rel="stylesheet" href="motion.css">
<link rel="stylesheet" href="breakpoints.css">
```

`primitives.css` must come first. Every semantic token resolves through it, so if it is
missing all colour resolves to nothing and the page renders unstyled **with no console
error**.

## Which names may I use?

| File | Names | May I name these? |
|---|---|---|
| `themes/light.css` | **358** | **Yes** — this is the colour contract |
| `themes/midnight.css` | 358 | Yes — the *same* names, different values |
| `type.css` | 41 | Yes |
| `layout.css` | 39 | Yes |
| `motion.css` | 17 | Yes |
| `breakpoints.css` | 5 | Yes |
| **Working vocabulary** | **460** | |
| `primitives.css` | 350 | **No** — but you must load it |
| `layout-contextual.css` | 34 | This repo's own components |

Every file repeats this in **its own header**, with the count computed at build time so
it cannot drift from the file it describes. Open any of them and the first thing you read
is whether its properties are yours to use.

The published package also ships `README.md` and `contract.json` — the latter listing
every consumable name machine-readably, if you want to lint against it. Those are
generated into `dist/`, which is not committed, so you will see them after
`npm run build-dist` or inside the installed package.

## Why 358 and not 1,198

If you add up every declaration across the token folder you get 1,198. That number is
real and it is not the contract:

- **The two theme files declare the same 358 names**, once each. One name, two values,
  chosen by selector. So they count once, not twice.
- **350 of them are primitives** — infrastructure you load and never name, the same way
  the glyphs inside a font file are not part of your type scale.
- **34 are component metrics** used by this repo's own components.

## Can I use a primitive?

**Yes. Nothing stops you and nothing should.** They are ordinary custom properties in a
stylesheet you loaded.

Know the trade, because it is a consequence rather than a rule: `Primitive: Color` has
exactly **one mode**, and `themes/midnight.css` declares **zero** primitives. So a
primitive holds one value forever.

```css
color: var(--primitive-color-brand-400);               /* stays this blue in Midnight */
color: var(--semantic-color-fill-action-primary-rest);  /* flips with the theme */
```

Reach for a primitive when you specifically want a value that does **not** respond to
the theme. The rule in [`CLAUDE.md`](CLAUDE.md) §6 that forbids primitives applies to
*this repo's own components*, because a design system that names its own primitives
cannot retune a ramp without breaking itself. It was never a rule for consumers.

## Install rather than copy

```bash
npm install @helloimjolopez-pathway/pathway-tokens
```

NuGet: `Pathway.DesignTokens`. Each stylesheet is a named subpath export — see the
[root README](README.md#using-the-tokens) for the exact import lines.

**Do not rebuild tokens from the Figma export.** You would get **no motion at all and no
warning**: the Figma Variables panel has zero motion variables, and `motion.css` is
generated from [`docs/design-system-spec.md`](docs/design-system-spec.md) §2 instead. You
would also lose theming by selector and any version you could pin.

## Going deeper

| | |
|---|---|
| The CSS, with per-file guidance | [`src/tokens/README.md`](src/tokens/README.md) |
| System-wide rules — colour, type, motion, spacing, a11y | [`docs/design-system-spec.md`](docs/design-system-spec.md) |
| How Figma flows into this repo | [`docs/token-pipeline.md`](docs/token-pipeline.md) |
| Who owns what, and the approval gates | [`docs/governance.md`](docs/governance.md) |
| Adopting from Radzen, Blazor, Angular, older libraries | [`docs/consuming-from-any-stack.md`](docs/consuming-from-any-stack.md) |
| Live token reference | [Storybook](https://helloimjolopez-collab.github.io/pathway-ds/storybook/) |
