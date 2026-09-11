# Pathway design tokens — the CSS

**You are in the right place.** These are the stylesheets to consume. GitHub renders
this file automatically when you browse into this folder, so start here.

Every file below is generated. Never hand-edit one — run `npm run build-tokens`.

## The short version

**The colour contract is 358 names.** Not 1,202, which is what you get if you add up
every declaration in this folder, and not 2,338, which is what the retired `tokens.css`
used to emit. The difference is explained below, and it is the whole reason this folder
is split the way it is.

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
error** — which is a genuinely nasty way to lose an afternoon.

## The files

| File | Names | Status | Name these? |
|---|---|---|---|
| `primitives.css` | 350 | **Infrastructure** | **No** — but you must load it |
| `themes/light.css` | 358 | **Contract** | Yes |
| `themes/midnight.css` | 358 | **Contract** (same names as light) | Yes |
| `type.css` | 41 | **Contract** | Yes |
| `layout.css` | 39 | **Contract** | Yes |
| `layout-contextual.css` | 34 | Component internals | Prefer `layout.css` |
| `motion.css` | 17 | **Contract** | Yes |
| `breakpoints.css` | 5 | **Contract** | Yes |

**Your working vocabulary is 460 names** — 358 colour + 41 type + 39 layout + 17 motion
+ 5 breakpoints. The 350 primitives are not part of it, and the 34 component metrics are
this repo's own business.

Each file repeats its status in its own header, with the count computed at build time so
it cannot drift.

## Why primitives ship but are not counted

Three separate questions that are easy to conflate:

1. **Are they private in Figma?** No. That setting only controls whether designers are
   *offered* a variable in the styling picker. It says nothing about CSS.
2. **Are they in the CSS?** Yes, and they have to be. All 358 semantics resolve via
   `var(--primitive-*)`. Delete the file and every colour breaks.
3. **Are they part of the contract?** No. They are infrastructure, the same way the
   glyphs inside Red Hat Text are not part of the type scale.

## Can I just use a primitive?

**Yes. Nothing stops you, and nothing should.** They are ordinary custom properties in a
stylesheet you loaded.

But know what you are trading away, because it is a consequence rather than a rule:
`Primitive: Color` has exactly **one mode**, and `themes/midnight.css` declares **zero**
primitives. So a primitive holds one value forever.

```css
color: var(--primitive-color-brand-400);              /* stays this blue in Midnight */
color: var(--semantic-color-fill-action-primary-rest); /* flips with the theme */
```

Reach for a primitive when you specifically want a value that does **not** respond to
the theme. That is a legitimate need and this is the escape hatch for it.

The rule in `CLAUDE.md` §6 that forbids primitives applies to **this repo's own
components and specs**, not to consumers. A design system that names its own primitives
cannot retune a ramp without breaking itself.

## Theming

One name, two values, resolved by selector:

```css
/* themes/light.css  */  :root, [data-theme="light"]              { --semantic-color-…: … }
/* themes/midnight.css */ [data-theme="midnight"], [data-theme="dark"] { --semantic-color-…: … }
```

So a component writes the name once:

```css
color: var(--semantic-color-foreground-static-neutral-bold);
```

Set `data-theme="midnight"` on `<html>` to flip the page, or on any element to flip just
that subtree. It composes both ways — a light island can sit inside a dark island, which
is what a dark top bar with white dropdown panels needs.

**Never put a mode in a property name.** `--semantic-color-light-mode-*` came from
`tokens.css`, retired 2026-09-03, and resolves to nothing.
`scripts/check-token-refs.js` fails the build on one.

## Composing type

There are no composite text styles and no `.pw-type-*` classes — both retired
2026-09-03. Name five properties:

```css
.card__title {
  font-family:    var(--semantic-type-family-brand);
  font-size:      var(--semantic-type-font-size-m);
  font-weight:    var(--semantic-type-weight-semibold);
  line-height:    var(--semantic-type-line-height-m-single);
  letter-spacing: var(--semantic-type-letter-spacing-compact);
}
```

The 111 named styles still exist as Figma text styles, which is where a designer applies
them. They are not tokens because as variables they were 554 of them, duplicating the
scale five times over.

## A trap in `layout.css`

The values already carry their unit. Use them directly:

```css
border-radius: var(--semantic-layout-units-cornerradius-small);          /* correct */
border-radius: calc(var(--semantic-layout-units-cornerradius-small) * 1px); /* WRONG */
```

The second computes `calc(4px * 1px)`. Multiplying two lengths is not a length, so the
browser drops the declaration and you get square corners with no error. This shipped in
the checkbox for a while.

## Motion is not in Figma

The Variables panel has **zero** motion variables. The source of truth is
`docs/design-system-spec.md` §2, and `scripts/sync-motion-tokens.js` generates
`motion.css` from it.

Worth knowing if you are tempted to rebuild tokens from a Figma export: you would get
no motion at all, and no warning. Consume the package.

## Installing instead of copying

```bash
npm install @helloimjolopez-pathway/pathway-tokens
```

NuGet: `Pathway.DesignTokens`. Both ship exactly these files plus `tokens.json`.

Full pipeline and governance: [`docs/token-pipeline.md`](../../docs/token-pipeline.md),
[`docs/governance.md`](../../docs/governance.md),
[`docs/consuming-from-any-stack.md`](../../docs/consuming-from-any-stack.md).
