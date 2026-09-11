# Pathway

Design system for Ministry Brands Amplify. Tokens + components + specifications, all versioned in one place, with Storybook deployed from `main`.

> **Looking for the tokens?** → **[TOKENS.md](TOKENS.md)** — where the CSS lives, which
> of the 460 names you may use, and what to link in what order.

## Using the tokens

**The colour contract is 358 names. Your full working vocabulary is 460.**

That is the number worth knowing, because adding up every declaration in the token
folder gives 1,202 and the retired `tokens.css` used to emit 2,338. Neither is the
contract. The difference is that primitives ship but are not named, and the modes share
one name set rather than each having their own.

| | Count | Name these? |
|---|---|---|
| Colour (`themes/light.css`, `themes/midnight.css` — same names) | **358** | Yes |
| Type scale (`type.css`) | 41 | Yes |
| Spacing, radii, borders (`layout.css`) | 39 | Yes |
| Motion (`motion.css`) | 17 | Yes |
| Breakpoints (`breakpoints.css`) | 5 | Yes |
| **Working vocabulary** | **460** | |
| Raw ramps (`primitives.css`) | 350 | **No** — but you must load it |
| Component metrics (`layout-contextual.css`) | 34 | This repo's components |

**The CSS lives in [`src/tokens/`](src/tokens/), and that folder has its own README**
covering load order, theming, the primitives question and the traps. Read it before
wiring anything up. The published package carries the same guidance in `dist/README.md`,
plus `dist/contract.json` listing every consumable name if you want to lint against it.

### Install

```bash
npm install @helloimjolopez-pathway/pathway-tokens
```

NuGet: `Pathway.DesignTokens`.

```js
// Every stylesheet is a named subpath export. primitives.css MUST come first —
// the themes resolve through it, so without it all colour resolves to nothing
// and the page renders unstyled with no console error.
import "@helloimjolopez-pathway/pathway-tokens/primitives.css";
import "@helloimjolopez-pathway/pathway-tokens/themes/light.css";
import "@helloimjolopez-pathway/pathway-tokens/themes/midnight.css";
import "@helloimjolopez-pathway/pathway-tokens/type.css";
import "@helloimjolopez-pathway/pathway-tokens/layout.css";
import "@helloimjolopez-pathway/pathway-tokens/motion.css";
import "@helloimjolopez-pathway/pathway-tokens/breakpoints.css";

// JS token object, and the raw DTCG JSON for tooling
import tokens from "@helloimjolopez-pathway/pathway-tokens";
import tokenJson from "@helloimjolopez-pathway/pathway-tokens/json";
import contract from "@helloimjolopez-pathway/pathway-tokens/contract.json";
```

There is deliberately no single `/css` entry point. One combined file was what
`tokens.css` used to be: it emitted every token times every mode with the mode baked
into the property name, 2,338 custom properties, and it is the reason this system read
as too granular to adopt. Retired 2026-09-03 and not coming back.

### Without a bundler

```html
<!-- primitives first: the themes reference these via var(), so this must load -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/primitives.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/themes/light.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/themes/midnight.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/type.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/layout.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/motion.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/breakpoints.css" />
```

`@main` tracks the latest. Pin a tag instead if you need a fixed version.

### Using a token

```css
.card {
  background: var(--semantic-color-fill-surface-sheet);
  color:      var(--semantic-color-foreground-static-neutral-bold);
  border:     var(--semantic-layout-units-borderwidth-base) solid
              var(--semantic-color-stroke-static-neutral-subtle);
  border-radius: var(--semantic-layout-units-cornerradius-medium);
}
```

One name carries both modes. Set `data-theme="midnight"` on `<html>` to flip the page,
or on any element to flip just that subtree. Never write a mode into a property name —
`--semantic-color-light-mode-*` resolves to nothing.

### Can I use a primitive?

Yes, and nothing stops you. But `Primitive: Color` has exactly one mode, so a primitive
holds one value forever and will **not** respond to `data-theme`. Reach for one only
when you specifically want a fixed value. Full reasoning in
[`src/tokens/README.md`](src/tokens/README.md).

## Layout

```
pathway-ds/
├── docs/                        Cross-component design-system docs
├── components/                  One folder per component
│   ├── sidenav/
│   │   ├── sidenav.html         Live React demo + annotated spec panel
│   │   ├── sidenav-figmamake.html  AI-codegen-friendly demo (auto-synced)
│   │   └── sidenav-spec.md      Authoritative specification
│   └── spinner/
│       ├── spinner.html
│       └── spinner-spec.md
├── tokens/                      Source-of-truth token JSON
│   ├── figma-export/            Raw Figma export (sync target)
│   └── pathway-design-tokens.json   W3C DTCG format
├── src/
│   ├── tokens/                  Built output (the 8-file contract + tokens.js)
│   └── stories/                 Storybook sources
│       ├── Primitives/          Token primitives (Color, Typography, Units)
│       ├── Semantics/           Semantic tokens (light/dark, layout, typography)
│       └── Library/             Component stories (one folder per component)
├── .storybook/
├── .github/workflows/           Token sync · component sync · Storybook deploy
├── scripts/                     Token sync/audit/fix + component build scripts
```

## Governance — where things live

| To change… | Where |
|---|---|
| Published token package | [`@helloimjolopez-pathway/pathway-tokens`](https://www.npmjs.com/package/@helloimjolopez-pathway/pathway-tokens) |
| Token values | [`tokens/pathway-design-tokens.json`](tokens/pathway-design-tokens.json) (source-of-truth, synced from Figma) |
| Built CSS consumed by Storybook | the eight files in [`src/tokens/`](src/tokens/) (auto-regenerated by Style Dictionary) |
| Component geometry, tokens, accessibility rules | [`components/<name>/<name>-spec.md`](components/) |
| Component reference implementation | [`components/<name>/<name>.html`](components/) |
| How a component appears in Storybook | [`src/stories/Library/<Name>/`](src/stories/Library/) |
| Storybook chrome / addons | [`.storybook/main.js`](.storybook/main.js) · [`.storybook/preview.js`](.storybook/preview.js) |
| CI behaviour | [`.github/workflows/`](.github/workflows/) |

## CI

Three workflows in `.github/workflows/`:

1. **`sync-tokens.yml`** — fires when `tokens/figma-export/**` changes. Normalises the Figma export into the W3C DTCG JSON and commits `tokens/pathway-design-tokens.json`.
2. **`sync-component.yml`** — fires when `components/sidenav/sidenav.html` changes. Regenerates the `sidenav-figmamake.html` variant and commits it.
3. **`deploy-pages.yml`** — fires on every push to `main`. Builds Style Dictionary and Storybook fresh and deploys a clean `_site` artifact through the official Pages actions. Nothing is committed back to `main`. (`deploy-storybook.yml` is the retired predecessor, kept manual-only; it committed 14MB of build output per push.)

Source of truth is always the repo on `main`; Storybook is a downstream artifact.

## Typography (brand fonts)

Pathway uses **Red Hat Text** (all UI text) and **Red Hat Display** (headings H1–H3 only). Both are open-source Google Fonts.

**Load via CDN (web/prototypes):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@600&family=Red+Hat+Text:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**Download font files (for Claude Design, Figma, or offline tools):**
- Red Hat Text: https://fonts.google.com/specimen/Red+Hat+Text → click **Download family**
- Red Hat Display: https://fonts.google.com/specimen/Red+Hat+Display → click **Download family**

Licensed under the [SIL Open Font License](https://scripts.sil.org/OFL). Free for any use.

## Component-to-token map

`tokens/component-token-map.json` maps every component element to its CSS variable. Use this file to answer "which token does X use?" without reading specs.

## Known token gaps

| Gap | Fix needed |
|---|---|
| Font-size tokens are unitless numbers | Use `calc(var(--...-fontsize) * 1px)` in CSS |
| No `Red Hat Display` token | Add `family-display: Red Hat Display` in Figma Variables, re-export |
