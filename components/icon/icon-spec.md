# Icon: Pathway Design System Component Spec

Status: REVIEWED
Reviewed: 2026-10-07, measured against Figma

The one place Pathway renders an icon, plus the two wrappers Figma nests around
it. Created 2026-10-07 because **every Figma icon component in this system had
no code to point at**: Code Connect listed them with no path and no link, and
six components each carried a private `Icon` or `Glyph` helper that nothing
could import.

## Links

| What | Where |
|---|---|
| Figma, Iconography | `3sw45aVcngFAmpbP6cfrXP` node `48:1153` |
| Figma, Action Icon | `40006794:19891`, 9 variants, State x Size |
| Figma, DisplayIcon | `40006522:26547`, 21 variants, Size x Color |
| Figma, Button Icon | `1884:5171`, 38 variants. Maps onto Button, see below |
| Storybook | [Library/Icon](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-icon--docs) |
| Modules | `icon.jsx` the primitive, `action-icon.jsx`, `display-icon.jsx` |
| Code Connect | `icon.figma.ts`, `action-icon.figma.ts`, `display-icon.figma.ts` |
| Coverage report | `components/code-connect-coverage.md` |
| System rule | `docs/design-system-spec.md` §7.2, and CLAUDE.md §12 |

## 1. Component Overview

### What a Pathway icon actually is

**A font, not a file.** There is no per-icon asset, no SVG to import, no sprite
sheet. Material Symbols Rounded is a single variable font, and an icon is its
NAME written as text inside an element carrying that font. Ligature
substitution turns the text `arrow_forward` into the arrow.

| What | Where |
|---|---|
| Font | Material Symbols **Rounded**. Never Outlined, never Sharp |
| Stylesheet | `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200` |
| Name catalogue | https://fonts.google.com/icons, set Style = Rounded |
| Source repo | https://github.com/google/material-design-icons |
| Web symbols | https://github.com/google/material-design-icons/tree/master/symbols/web |
| One icon | `<Icon name="arrow_forward" size="M" />` |

The name you write is the folder name in that repo and the name shown in that
catalogue. Nothing is fetched per icon, which is the appeal: the font carries
every glyph, so adding an icon costs nothing.

### The three components

| Component | Figma | What it is |
|---|---|---|
| `Icon` | the Iconography page | The primitive. A glyph, a size, a FILL. No box, no background, no interaction |
| `ActionIcon` | `Action Icon` | An icon-only CONTROL with a state layer. Nested 30x in the Widget set |
| `DisplayIcon` | `DisplayIcon` | A decorative icon in a tinted circle, for alerts and empty states |

`IconBox` also exists, which is `Icon` inside Figma's alignment wrapper. Most
layouts want the bare `Icon`.

### What is not here

A per-glyph component. There is nothing to build: every icon is the same
component with a different `name`, which is why `icon.figma.ts` maps the
Iconography page rather than any single glyph. The glyph components nested in
Pathway components (`add`, `search`, `expand_more`, `expand_less`, `moving`) are
remote library components, and in code they are a string.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Which glyph a component uses | Design | Figma, read the layer name |
| The FILL axis per component | Design | Figma. **Never assumed in code** |
| The size ladder | Design | `docs/design-system-spec.md` §7.2 |
| The font, the axes, the loading | Engineering | `components/icon/icon.jsx` |
| Colour | Consumer | inherited by default, see §3 |

Rule: Figma owns which glyph and which FILL, the system spec owns the sizes,
and this repo owns how a glyph becomes pixels.

## 2. Component Anatomy

Figma nests three boxes and the one that matters is the middle one:

```
Container.LeadingIcon   24x24   the wrapper. Alignment or touch box
  Icon.Leading          16x16   the FRAME. This is `size`
    _shape              ~12x12  the drawn vector. NEVER the number you pass
```

**Size is the FRAME, never the vector.** The Material grid has about 2px of
built-in padding, so `size={16}` reproduces Figma's 16 and lands the visible
glyph near 12 on its own. Passing the vector's ~12 ships an icon a third too
small.

### ActionIcon, measured 2026-10-07

| Size | box, the target | `Container.Icon`, the state layer | glyph |
|---|---|---|---|
| Small | 36x36 | 24x24 | 12 |
| Base | 44x44 | 28x28 | 14 |
| Large | 48x48 | 32x32 | 16 |

**The state layer is smaller than the target, and the fill belongs on the
layer.** Painting the target gives a hover area visibly larger than the design.
That bug shipped in the Widget header once and again in the TopNav's
`SideNav.Control`, which had no state layer at all.

### DisplayIcon, measured 2026-10-07

| Size | box | glyph |
|---|---|---|
| Small | 24x24 | 12 |
| Medium | 32x32 | 16 |
| Large | 40x40 | 20 |

## 3. Design Tokens

### 3.1 Icon colour is INHERITED by default

`Icon` sets no colour unless given one. That is deliberate: an icon beside a
label should be the label's colour, and it then follows Light and Midnight for
free with nothing to keep in step. Pass `color` only when the icon is on its own,
and only a semantic token's `var()`.

### 3.2 ActionIcon

| Element | Token |
|---|---|
| Glyph, rest | `Foreground/Action/Secondary/Rest` |
| Glyph, hover | `Foreground/Action/Secondary/Hover` |
| Glyph, pressed | `Foreground/Action/Secondary/Pressed` |
| State layer, hover | `Fill/Action/Secondary/Hover` |
| State layer, pressed | `Fill/Action/Secondary/Pressed` |
| Layer radius | `CornerRadius/Base` |

The Figma component binds NO fill in any of its nine variants and the glyph's
fill is unbound too, so the design expresses "whatever the context is". On a
dark or on-brand surface pass a Ghost foreground instead; see CLAUDE.md on why
Ghost is dark-surface only.

### 3.3 DisplayIcon

Figma's `Color` axis onto the meaning-named tone groups. Each tone draws its
SUBTLE fill with its ON SUBTLE foreground, the pairing the token set guarantees
and `check-fill-foreground-pairs` asserts.

| Figma Color | Fill | Foreground |
|---|---|---|
| Accent | `Fill/Static/Brand/Subtle` | `Foreground/Static/Brand/On Subtle` |
| Positive | `Fill/Static/Positive/Subtle` | `Foreground/Static/Positive/On Subtle` |
| Negative | `Fill/Static/Negative/Subtle` | `Foreground/Static/Negative/On Subtle` |
| Danger | `Fill/Static/Severe/Subtle` | `Foreground/Static/Severe/On Subtle` |
| Neutral | `Fill/Static/Neutral/Subtle` | `Foreground/Static/Neutral/Base` |
| Info | `Fill/Static/Info/Subtle` | `Foreground/Static/Info/On Subtle` |
| Alert | `Fill/Static/Attention/Subtle` | `Foreground/Static/Attention/On Subtle` |

`Danger` and `Negative` are both in the Figma axis and are different tones:
Negative is Red, Severe is Orange, so Danger takes Severe.

> **Open Figma gap, 2026-10-07.** The DisplayIcon variant binds no fill and the
> nested glyph's fill is unbound, so **the Color axis has no token behind it in
> the file**. The table above is this repo's mapping, derived from the tone
> names. The Figma side needs binding before the two can be said to agree.

## 4. Layout & Spacing

See §2. The per-size table for the system as a whole, L=18 / M=16 / S=14 inside
26 / 24 / 20 wrappers, is in `docs/design-system-spec.md` §7.2.

## 5. Item / Variant Structure

`Icon` has no variants: a glyph, a size, a FILL. `ActionIcon` has Size, and
State at runtime. `DisplayIcon` has Size and Color.

## 6. State Matrix

| State | `Icon` | `ActionIcon` | `DisplayIcon` |
|---|---|---|---|
| Rest | glyph only | transparent layer, Rest glyph | tinted circle |
| Hover | nothing: it is not interactive | layer takes Hover fill, glyph Hover | nothing |
| Pressed | nothing | layer takes Pressed fill, glyph Pressed | nothing |
| Disabled | nothing | 50% opacity, no pointer | nothing |

`Icon` and `DisplayIcon` have no states because neither is a control. An icon
that needs a state is an `ActionIcon` or a `Button`.

## 7. Sub-components / Decorations

`IconBox` wraps `Icon` in Figma's alignment box. `IconFont` drops the stylesheet
in for a consumer who has not loaded it in their own head.

## 8. Container / Surface

`Icon` has no surface. `ActionIcon`'s surface is its state layer. `DisplayIcon`'s
is a full circle in the tone's Subtle fill.

## 9. Interaction / Behaviour

`ActionIcon` is a `<button>` and `label` is **required**, not optional: an
icon-only control with no accessible name has no name at all.

## 10. Collapsed / Compact / Variant-specific State

None.

## 11. Iconography

This component IS the iconography. The axes:

| Axis | Value | Why |
|---|---|---|
| `FILL` | 0 outlined, 1 solid | **Read from Figma per component.** SideNav is 1 throughout, the Widget header is 0. Assuming it is the most common icon bug in this system |
| `wght` | 400 | Everywhere in Pathway |
| `GRAD` | 0 | Everywhere in Pathway |
| `opsz` | matched to the font size | A 16px glyph at `opsz 20` draws visibly too light. That shipped in the collapsed SideNav rail |

If you see `material-symbols-outlined` or `material-symbols-sharp` anywhere,
it is a bug.

### For a team that cannot use a font

Keep the un-cropped SVG on its full grid, `viewBox="0 0 24 24"` or
`0 -960 960 960`, never trimmed to content. Render it at the FRAME size, bake
in Rounded, wght 400, opsz 20 and the correct FILL at export, and centre it in
the same wrapper. Handing a team the cropped ~12px vector ships it too small.

## 12. Interaction Patterns

Standard Pathway patterns only.

## 13. Accessibility

- An icon is **decorative by default**: `aria-hidden`, no role. Most icons sit
  beside their own text, and announcing both reads it twice.
- `label` makes it `role="img"` with that accessible name.
- `ActionIcon` requires `label`.
- A missing font shows the LIGATURE NAME as text rather than failing, so
  `arrow_forward` appears mid-button. `IconFont` exists for that.
- Colour contrast is the consumer's: an inherited colour is whatever the text
  beside it already cleared.

## 14. Storybook

Sidebar-visible, matching the untagged exports in `Icon.stories.jsx` exactly:

| Export | Name |
|---|---|
| `Playground` | Playground |
| `TheFillAxis` | The FILL axis |
| `SizeIsTheFrame` | Size is the frame, not the vector |
| `ActionIcons` | ActionIcon: the three sizes and their states |
| `DisplayIcons` | DisplayIcon: every size and colour |

Reference, `!dev`-tagged: `TokensColour` (Tokens: colour).

No `StandaloneDemo` story and no `icon.html`: an icon on its own page proves
nothing a story does not, and a fourth copy of the font link is a fourth thing
to keep in step.
