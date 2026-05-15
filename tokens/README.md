# Token architecture

Design tokens are named design decisions stored as data. Instead of `color: #4b6ec3` scattered across dozens of components, you write `color: var(--semantic-color-light-mode-text-action-brand-default)`. The name carries the intent; the value is managed in one place.

Pathway tokens have two layers: **primitive** and **semantic**.

---

## Primitive tokens — the palette

Primitives are raw values. They define the full range of what's available: every shade of every colour, every spacing step, every type size. A primitive token doesn't say _when_ to use it; it says _what it is_.

```css
--primitive-color-brand-100: #4b6ec3
--primitive-color-brand-50:  #a0b5e6
--primitive-color-cool-neutral-0:   #ffffff
--primitive-color-cool-neutral-100: #1a1a1a
--primitive-color-red-100:   #d32f2f
```

**Naming pattern:** `--primitive-[category]-[family]-[step]`

| Segment | Example values |
|---------|---------------|
| `category` | `color` |
| `family` | `brand`, `cool-neutral`, `warm-neutral`, `red`, `orange`, `green`… |
| `step` | `0`, `10`, `50`, `100`, `200`… (higher = darker) |

**Primitives are never used directly in components.** They exist to build the semantic layer — nothing else.

---

## Semantic tokens — the contract

Semantic tokens alias a primitive and give it a _purpose_. The name tells you the role, context, and state where it belongs. Semantic tokens are what every component consumes.

```css
/* aliasing the primitive */
--semantic-color-light-mode-fill-contextual-navitem-base:
    var(--primitive-color-cool-neutral-10)

--semantic-color-light-mode-icon-static-neutral-base:
    var(--primitive-color-cool-neutral-100)

--semantic-color-light-mode-text-action-brand-default:
    var(--primitive-color-brand-100)
```

**Naming pattern:** `--semantic-color-[mode]-[role]-[context]-[element]-[state]`

| Segment | Example values |
|---------|---------------|
| `mode` | `light-mode`, `dark-mode` |
| `role` | `fill`, `icon`, `text`, `stroke`, `surface` |
| `context` | `static`, `action`, `contextual` |
| `element` | `navitem`, `brand`, `neutral`, `destructive`… |
| `state` | `base`, `hover`, `active`, `disabled`, `default` |

Not every token uses all five segments — the path is as long as it needs to be to be unambiguous.

---

## Why the two-layer separation matters

If primitives change (e.g. the brand blue shifts one shade), you update the alias in Figma. Every semantic token that references that primitive updates automatically. Components don't touch.

If a semantic token is renamed or removed, CI flags it during reconciliation. The component is updated in one commit. The primitive palette didn't change.

This is the alias chain doing its job:

```
Figma variable value   →   Primitive token   →   Semantic token   →   Component CSS
     #4b6ec3           →   brand-100         →   text-action-brand-default   →   var(...)
```

---

## The six Figma variable collections

Pathway organises all variables into six collections in Figma. Understanding them tells you exactly what exists and where to look.

| Collection | Layer | What it contains |
|-----------|-------|-----------------|
| **Primitive: Color** | Primitive | 12 named colour palettes (Cool Neutral, Warm Neutral, Brand, Red, Orange, Green, Seabreeze, Lagoon, Jade, Amethyst, Saffron, Mauve). Each has a numbered step scale; higher = darker. |
| **Primitive: Type** | Primitive | Raw font settings: family, weight, size, line-height, letter-spacing. |
| **Primitive: Unit** | Primitive | Raw numeric values (1–120, plus sub-pixel steps) used as the spacing base. |
| **Semantic: Color** | Semantic | Purpose-named colour tokens in Light Mode and Dark Mode. Path: `Role / Scope / Variant / State`. Roles: Text, Fill, Icon, Stroke, Surface, Scrim. |
| **Semantic: Layout & Units** | Semantic | Global spacing contracts (BorderWidth, CornerRadius, Gap, Padding) plus contextual component-specific layout values. |
| **Semantic: Type** | Semantic | Named type styles in Desktop and Mobile modes. Path: `Category / Subcategory / Size / Weight`. Categories: Heading, Text, Label. |

## Hierarchy at a glance

```
Figma Variables (source of truth for all token values)
  │
  ├── Primitive: Color       ← raw palettes: Cool Neutral, Brand, Red…
  ├── Primitive: Type        ← raw font settings: size, weight, line-height…
  ├── Primitive: Unit        ← raw numbers: 4, 8, 12, 16…
  │         (never consumed directly — only aliased by semantics)
  │
  ├── Semantic: Color        ← Role / Scope / Variant / State
  │     └── e.g. Fill / Static / Brand / Base → {Brand.500}
  ├── Semantic: Layout & Units ← BorderWidth / Base, CornerRadius / Medium…
  └── Semantic: Type         ← Heading / Display / XL / Bold, Label / Button / Base…
            │
            │ emitted as CSS custom properties by Style Dictionary
            ▼
      src/tokens/tokens.css  ← var(--semantic-color-light-mode-fill-static-brand-base)
            │
            ▼
      Component styles
```

---

## The rule

**Always semantic. Never primitive. Never raw hex.**

```css
/* correct */
color: var(--semantic-color-light-mode-text-action-brand-default);

/* wrong — breaks the alias contract; components shouldn't know about the palette */
color: var(--primitive-color-brand-100);

/* wrong — hardcoded, won't update when the palette changes */
color: #4b6ec3;
```

If you're writing a component and reaching for a primitive, pause — there's almost certainly a semantic token that expresses the intent you need. If there isn't, the gap belongs in Figma as a new semantic token, not in the component as a primitive reference.

---

## Light and dark mode

Semantic tokens exist in two mode variants:

```css
--semantic-color-light-mode-fill-contextual-navitem-base: ...
--semantic-color-dark-mode-fill-contextual-navitem-base:  ...
```

Both are emitted into `src/tokens/tokens.css`. Your layout layer decides which to activate — typically by scoping a `[data-theme="dark"]` attribute on a parent element that swaps the dark-mode vars in.

---

## Resolving tokens by display name

For readable lookups in component demos and scripts, use the resolver utility:

```js
import { t } from "../../tokens/resolve-tokens.js";

const fill = t("Fill/Contextual/NavItem/Base");          // light mode
const dark = t("Fill/Contextual/NavItem/Base", "dark");  // dark mode
```

`t()` converts the Figma display-path format (`"Fill/Contextual/NavItem/Base"`) into the resolved CSS variable value. It handles both modes and caches lookups.

---

## Using tokens in a project

### npm (recommended)

```bash
npm install @helloimjolopez-pathway/pathway-tokens
```

Then import what you need:

```js
// CSS custom properties — add to your app entry point
import "@helloimjolopez-pathway/pathway-tokens/css";

// JS token object (for JS-driven theming, token lookups, etc.)
import tokens from "@helloimjolopez-pathway/pathway-tokens";

// Raw DTCG JSON (for tooling that reads token definitions)
import tokenJson from "@helloimjolopez-pathway/pathway-tokens/json";
```

In plain HTML or a project without a bundler, link the CSS directly:

```html
<link rel="stylesheet"
  href="https://helloimjolopez-collab.github.io/pathway-ds/storybook/tokens.css" />
```

Once the CSS is loaded, all custom properties are available:

```css
.my-component {
  background: var(--semantic-color-light-mode-fill-static-brand-base);
  color: var(--semantic-color-light-mode-text-static-primary-inverse);
}
```

### When moving to the Ministry Brands org repo

Republish under `@ministry-brands/pathway-tokens` and update the package name in `package.json`. All import paths change from `@helloimjolopez-pathway/pathway-tokens` to `@ministry-brands/pathway-tokens`.

---

## Files in this folder

| File | What it is | Edit? |
|------|-----------|-------|
| `figma-export/pathwaytokens.json` | Raw export from Figma — the upstream source of truth | Never (Figma owns this) |
| `pathway-design-tokens.json` | All tokens in DTCG format, fully resolved | Never (auto-generated by CI on every sync) |
| `resolve-tokens.js` | Lookup utility — converts display names to resolved values | Yes — the only hand-edited file here |

Tokens flow one way: **Figma → this folder → `src/tokens/tokens.css` + `tokens.js`**. See the repo `CLAUDE.md` §2 for the full pipeline.
