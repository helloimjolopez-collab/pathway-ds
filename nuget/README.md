# Pathway Design Tokens

Design tokens for the Pathway design system, generated from the Figma Variables
panel. This is the same generated output the npm package `pathway-tokens` ships,
so a Blazor or Razor app renders identical values to a React app instead of a
hand-copied fork that drifts.

There is no C# in this package. It is CSS and JSON.

**The colour contract is 358 names; the full working vocabulary is 460.** Adding up
every declaration in the package gives ~1,200 — that is not the contract. The
difference is that `primitives.css` ships but is never named, and the two themes share
one name set rather than each having their own. `contract.json` lists every consumable
name if you want to check against it.

## Install

```
dotnet add package Pathway.DesignTokens
```

## Use

The files are static web assets, served at `_content/Pathway.DesignTokens/`.
Reference them from your host page (`App.razor`, `_Host.cshtml`, or `index.html`):

```html
<!-- primitives.css MUST come first and MUST be present. Every semantic token
     resolves through it via var(), so without it all colour resolves to nothing
     and the page renders unstyled with NO console error. This block previously
     omitted it, which is a silent, confusing failure. -->
<link rel="stylesheet" href="_content/Pathway.DesignTokens/primitives.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/themes/light.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/themes/midnight.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/type.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/layout.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/motion.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/breakpoints.css" />
```

You load `primitives.css` but never write a `--primitive-*` name yourself: it has one
value per token and does not respond to `data-theme`, so naming one opts that element
out of theming. Nothing blocks you if you specifically want a fixed value.

Then use the custom properties:

```css
.card {
  background: var(--semantic-color-fill-surface-sheet);
  color: var(--semantic-color-foreground-static-neutral-bold);
  border: 1px solid var(--semantic-color-stroke-static-neutral-subtle);
  border-radius: var(--semantic-layout-units-cornerradius-medium);
}
```

And type as a class, never as five separate properties:

```html
<span class="pw-type-label-menu-base-medium">Donations</span>
```

## Midnight Mode

Set `data-theme` on `<html>` or any wrapper element. Every
`--semantic-color-*` name resolves to its Midnight value inside that subtree:

```html
<html data-theme="midnight">
```

`data-theme="dark"` works too, so a consuming team does not have to adopt
Pathway's vocabulary to switch themes.

Because theming is done by selector rather than by name, a single element can
opt into the opposite theme — useful for a dark top bar on an otherwise light
page:

```html
<header data-theme="midnight"> … </header>
```

## What is in the package

| File | Contains |
|---|---|
| `themes/light.css`, `themes/midnight.css` | Every semantic colour, one name per token, resolved by selector. **This is the colour contract.** |
| `type.css` | The 41-token type scale. Compose font-family, size, weight, line-height and tracking at the call site |
| `primitives.css` | Raw ramp values. Building blocks, not a contract — do not reference these directly |
| ~~`tokens.css`~~ | Removed 2026-09-03. Load `primitives.css` plus one theme file instead |
| `tokens.json` | DTCG JSON, for tooling |

## Which names are safe to depend on

Only the semantic ones: `--semantic-color-*`, `--semantic-layout-units-*`, and
the `.pw-type-*` classes. Primitive names such as
`--primitive-color-brand-450` are internal and their slot numbers move when a
ramp is retuned.

## Versioning

The NuGet and npm packages are published in lockstep from the same commit and
carry the same version, so `Pathway.DesignTokens 5.4.0` and
`pathway-tokens@5.4.0` contain byte-identical CSS.
