# ModuleIcon: Pathway Design System Component Spec

**Status:** `PENDING HUMAN REVIEW`
**Reviewed:** not yet

## Links

| Artefact | URL |
|---|---|
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006876-42134 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-moduleicon--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/module-icon/module-icon.html |
| GitHub source | https://github.com/helloimjolopez-collab/pathway-ds/tree/main/components/module-icon |
| NPM package | `@helloimjolopez-pathway/pathway-tokens` (tokens only; this component is repo-side) |
| Component module | `components/module-icon/module-icon.jsx` |
| Tokens (CSS) | `src/tokens/primitives.css` plus the eight-file contract |

## 1. Component Overview

The twelve Amplify module marks. A module mark identifies which product area the
user is in: it appears in the TopNav bar for the active module, in the module
switcher panel for every module, and beside module names wherever a list of
modules is shown.

### Figma source

Component set `Module.Icon`, node `40006876:42134`. Three properties:

| Property | Values |
|---|---|
| Module | People, Giving, Service Planning, Streaming, Safety, Mobile, Accounting, Communications, Home, Websites, Media, Equip |
| Style | Base, Rippled |
| Color | Full, Mono |

36 variants. `Style=Rippled` exists only in `Color=Full`.

**This module implements `Style=Base` in both colours. Rippled is not built.**
See §17.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| the artwork itself | Design | Figma `Module.Icon`, then re-export |
| which modules exist | Design | Figma's Module property; `MODULES` follows it |
| the identity colour of a module | Design | the `Module/*` paint styles, then `MODULE_IDENTITY` |
| whether a mark is Full or Mono at a call site | Engineering | the consuming component |
| accessible naming | Engineering | the `title` prop at the call site |

**Rule:** the geometry and the identity palette come from Figma. Everything about
*where and how* a mark is used is the caller's decision.

## 2. Component Anatomy

A single `<svg>` with a 24×24 viewBox. Inside it:

- one `<g>` holding the paths, clipped to the 24×24 frame
- a `<defs>` block carrying that clip path, and for Equip a `<linearGradient>`

There are no sub-components and no text.

## 3. Design Tokens

### 3.1 Surface
None. The mark is transparent; it takes whatever is behind it.

### 3.2 Fill
Every fill is a module identity colour, declared by this component as a custom
property and resolved through a primitive. Full uses the palette; Mono redefines
every one of those properties to `currentColor`.

| Property | Resolves through | Module |
|---|---|---|
| `--module-people-base` / `-subtle` | `brand-300` / `brand-150` | People |
| `--module-giving-base` / `-subtle` | `seabreeze-350` / `seabreeze-150` | Giving |
| `--module-service-planning-base` / `-subtle` | `lagoon-400` / `lagoon-200` | Service Planning |
| `--module-streaming-base` / `-subtle` | `orange-200` / `orange-100` | Streaming |
| `--module-safety-base` / `-subtle` | `red-300` / `red-150` | Safety |
| `--module-mobile-base` / `-subtle` | `jade-200` / `jade-100` | Mobile |
| `--module-accounting-base` / `-subtle` | `saffron-200` / `saffron-100` | Accounting |
| `--module-communications-base` / `-subtle` | `green-300` / `green-150` | Communications |
| `--module-home-base` | `brand-550` | Amplify Home |
| `--module-websites-base` / `-subtle` | `mauve-300` / `mauve-150` | Websites |
| `--module-media-base` / `-subtle` | `jade-300` / `jade-150` | Media |
| `--module-equip-from` / `-to` | `brand-200` / `lagoon-150` | Equip (gradient) |

**Why these are primitives, and why that is correct here.** Module identity is
not a semantic. Nothing in the system means "people are blue"; it is a brand
axis, like a logo, and it does not change with the theme. A semantic token would
flip in Midnight and break the mark. This is the one place in the repo where
naming a primitive is the right answer, and `dist/README.md` documents the
general case under "Can I use a primitive?".

**Why they are not Variables.** They would add 23 names to a panel whose size is
already the main adoption complaint, to express something no other component
needs. Contextual values belong on the component that knows the context.

### 3.3 Text
None.

### 3.4 Icon
The component *is* the icon. It does not compose `Icon`.

### 3.5 Geometry
No radii, borders or shadows. `flexShrink: 0` and `display: block` so it does
not collapse inside a flex row.

### 3.6 Typography
None.

## 4. Layout & Spacing

The mark has no internal spacing. `size` sets both width and height; the 24×24
viewBox scales cleanly to any value. Spacing around it belongs to the caller.

## 5. Item / Variant Structure

### Full
The identity palette. Use on a light or neutral surface where the module's
colour is the thing that makes it recognisable: the switcher panel, a module
list, a card header.

### Mono
Every identity property becomes `currentColor`, so the mark takes the colour of
its surrounding text. Use on a coloured or dark surface, or anywhere the mark
must sit in a run of text and match it.

Both variants are the **same geometry**. In Figma they are the same paths too:
People is 5,615 bytes as Full and 5,600 as Mono, and Home is byte-identical.
Shipping two copies would be shipping the same artwork twice and inviting drift.

## 6. State Matrix

None. A module mark is static: it does not respond to hover, focus or press. A
mark inside an interactive control inherits that control's states, and the
control owns them.

### State logic rules
If a caller needs the mark to change on hover, it changes `color` on the parent
and uses `color="mono"`. The mark itself gains no state tokens.

## 7. Sub-components / Decorations
None.

## 8. Container / Surface

### 8.1 Surface
Transparent.

### 8.2 Dimensions & Padding
`size` × `size`, default 24. No padding.

### 8.3 Transition
None. See §14.

## 9. Interaction / Behaviour

Not interactive. No pointer handlers, no focus, `focusable="false"` so IE-era
SVG focus behaviour cannot put it in the tab order.

## 10. Collapsed / Compact / Variant-specific State

None. At small sizes the artwork simply scales; there is no simplified
small-size drawing. Below roughly 16px the multi-path marks lose legibility, so
prefer 20px or above in dense UI.

## 11. Iconography

This is the iconography. Module marks are **not** Material Symbols and must
never be substituted with one. TopNav previously named `home`, `group`,
`volunteer_activism`, `event` and `mail` for five modules; that is what this
component replaces.

## 12. Interaction Patterns

None of its own. It is a leaf.

## 13. Accessibility

### 13.0 ARIA pattern
Image, or presentational. Decided by whether `title` is passed.

### 13.1 Touch & pointer targets
Not applicable. Target sizing belongs to whatever control wraps it.

### 13.2 ARIA markup
With `title`: `role="img"` plus `aria-label` and a `<title>` child.
Without `title`: `aria-hidden="true"`.

The default is decorative, because the common case is a mark beside a visible
module name, where announcing it would read the module twice.

### 13.3 Keyboard interaction
None. Never focusable.

### 13.4 Focus styles
None.

### 13.5 Screen reader announcements
Only the `title` string, when given.

### 13.6 Colour contrast
Not text, so WCAG 1.4.3 does not apply. WCAG 1.4.11 (non-text contrast, 3:1)
applies only where a mark is the sole indicator of state or identity. The Full
palette is not guaranteed to clear 3:1 on every surface: several marks are light
tints intended for a white or near-white background. **A mark on a coloured or
dark surface should use `color="mono"`** so it inherits a foreground that has
already been chosen against that surface.

## 14. Motion

### 14.1 Transitions
None.

| Element/Property | Duration | Easing | Token | Rationale |
|---|---|---|---|---|
| none | n/a | n/a | n/a | A static identity mark has nothing to animate. Any motion belongs to the control that contains it. |

### 14.2 Reduced motion
Nothing to suppress.

## 15. Responsiveness

No breakpoint behaviour. `size` is set by the caller, which is where the
breakpoint decision lives: TopNav uses 24 in the bar and 18 in the switcher
panel.

| Viewport | Default state | Layout mode | Can be fully hidden |
|---|---|---|---|
| Desktop | as passed | fixed `size` | caller's choice |
| Tablet | as passed | fixed `size` | caller's choice |
| Mobile | as passed | fixed `size` | caller's choice |

## 16. What to pass Claude to implement this component

`components/module-icon/module-icon.jsx` is the source of truth and the artwork
is generated, so do not hand-edit the path data. To regenerate, export
`Style=Base, Color=Full` for each module from `Module.Icon`, strip the Figma page
furniture (the export wraps the mark in a section frame, the component-set dashed
outline and a page background), and map each fill through the `Module/*` paint
styles.

## 17. Gaps & deferred decisions

- **`Style=Rippled` is not built.** Twelve more variants exist in Figma, Full
  only. No consumer needs them yet and the treatment has not been specified.
- **No spec-level decision on Full vs Mono per call site.** Current choices:
  Mono in the TopNav bar (dark chrome), Full in the switcher panel (light
  surface). Those are engineering judgements, not design rulings.
- **Equip's gradient direction** is taken from the export as-is and has not been
  checked against the `Equip` gradient paint style's angle.
- **`Module.Logo` is a separate component set** (`40003212:7241`, with an
  Amplify-logo boolean and XS/M/L sizes) and is not implemented here.

## 18. Storybook

`src/stories/Library/ModuleIcon/ModuleIcon.stories.jsx`

Sidebar-visible: `Playground`, `All twelve`, `Mono follows currentColor`,
`Sizes`.
Tagged `!dev` (reference only): `Identity palette`.
No `StandaloneDemo` story.
