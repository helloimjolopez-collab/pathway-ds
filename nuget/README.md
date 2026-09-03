# Pathway Design Tokens

Design tokens for the Pathway design system, generated from the Figma Variables
panel. This is the same generated output the npm package `pathway-tokens` ships,
so a Blazor or Razor app renders identical values to a React app instead of a
hand-copied fork that drifts.

There is no C# in this package. It is CSS and JSON.

## Install

```
dotnet add package Pathway.DesignTokens
```

## Use

The files are static web assets, served at `_content/Pathway.DesignTokens/`.
Reference them from your host page (`App.razor`, `_Host.cshtml`, or `index.html`):

```html
<link rel="stylesheet" href="_content/Pathway.DesignTokens/themes/light.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/themes/midnight.css" />
<link rel="stylesheet" href="_content/Pathway.DesignTokens/type-classes.css" />
```

Then use the custom properties:

```css
.card {
  background: var(--semantic-color-surface-sheet);
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
| `type-classes.css` | One `.pw-type-*` class per text style, with a mobile media query |
| `primitives.css` | Raw ramp values. Building blocks, not a contract — do not reference these directly |
| `tokens.css` | Legacy output with the mode baked into each name. Being retired; do not write new code against it |
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
