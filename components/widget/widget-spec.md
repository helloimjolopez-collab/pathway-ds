# Widget: Pathway Design System Component Spec

Status: REVIEWED
Reviewed: 2026-10-07, measured against Figma and the canonical demo

## Links

| What | Where |
|---|---|
| Figma source | `3sw45aVcngFAmpbP6cfrXP` node `40009622:39702`, Amplify section of page `40009415:21911` |
| NewCo mirror | `40016737:144022`, read-only, values flow NewCo to Pathway only |
| Canonical demo | https://helloimjolopez-collab.github.io/design-sandbox/phase-2/Widget%20Container%20Demo/ |
| Storybook | [Library/Widget](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-widget--docs) |
| Code Connect | `components/widget/widget.figma.ts`, `components/widget/widget-heading.figma.ts` |
| Component module | `components/widget/widget.jsx` |
| Dashboard spec | `components/dashboard/dashboard-spec.md` |
| KPI tile spec | `components/kpi-tile/kpi-tile-spec.md` |

## 1. Component Overview

A Widget is the dashboard's container: a card with a heading, a set of hover
actions, and one slot for content. It does not know what it holds. A KPI tile, a
chart, a table and an empty state are all just children.

**Size is depth, not scale.** Choosing a bigger size does not enlarge the same
content, it asks for more of it. This is the single most important thing about
the component and the thing most often got wrong.

### Figma source

Set `40009622:39702`, six variants on two axes, `Size` and `Configuration`.

> **Resolved 2026-10-07.** The set briefly reported errors: two variants were
> both named `Size=Glance, Configuration=01`, and Figma refuses to return
> `componentPropertyDefinitions` for a set in that state. The duplicate was
> removed in the file. Re-read the same day: six variants, no duplicates, and
> the properties read cleanly, so `Configuration` is now legible.
>
> | Axis | Values |
> |---|---|
> | `Size` | Glance, Detail, Explore |
> | `Configuration` | 01, 02, 03, 04 |
>
> `Configuration` still takes no prop, and that is a decision rather than a
> gap: it varies the CONTENT (whether there is a filter control, whether the
> number is tall or wide, which sample line is drawn), and the content is
> `children`. See the Glance configurations story.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Visual design, anatomy, variants | Design | Figma `40009622:39702` |
| Token values | Design | Figma Variables panel |
| Size ladder and min widths | Design | Figma, mirrored in `SIZE_GRID` and the Contextual tokens |
| Grid spans and flow | Design | The canonical demo, mirrored in `SIZE_GRID` |
| State logic, slots, a11y | Engineering | `components/widget/widget.jsx` |
| Content inside a widget | Consumer | passed as `children` |

Rule: Figma owns what a widget looks like, the demo owns how the board behaves,
and this repo owns neither. Where they disagree, the disagreement is recorded
here rather than resolved silently.

## 2. Component Anatomy

```
root                        r=16, stroke Stroke/Static/Neutral/Base, VERTICAL
  Container.WidgetHeading   44 tall, HORIZONTAL, gap 2
    Container.RowStart      109x20
      Heading               the title, 20 tall
      Slot.HoverIcons       72x36, HIDDEN, TWO Action.Icon 36x36
    Slot.RowEnd             433x36, THREE Action.Icon 36x36, VISIBLE at rest
  content
    Glance                  direct child, inset 0,12,0,12, no inner card
    Detail / Explore        MainContent.Slot, VERTICAL gap 8, pad 12,16,12,16,
                            with its OWN fill and stroke
```

**There are TWO icon slots and they are not the same thing.** `Slot.RowEnd`
holds the three icons a reader sees at rest. `Slot.HoverIcons` is a separate
72x36 slot inside `Container.RowStart`, beside the title, holding TWO more
icons, hidden, gated by the set's `Show Hover Actions` boolean whose default is
false. Measured by walking the tree on 2026-10-07.

**Detail and Explore are a card inside a card.** `MainContent.Slot` carries a
fill and a stroke of its own inside a root that already has both. Glance has no
inner card, and that is what "flat at Glance" means.

## 3. Design Tokens

### 3.1 Surface

| Element | Token | Value |
|---|---|---|
| Root, Glance | `Fill/Surface/Elevated` | `#ffffff` |
| Root, Detail and Explore | `Fill/Static/Neutral/Faint` | `#fefefd` |
| Inner card | `Fill/Surface/Elevated` | `#ffffff` |
| Page behind the board | `Fill/Surface/Canvas` | `#fafafa` |

> The root fill on Detail and Explore was an unbound `#fefefd` in Figma. Bound
> to `Fill/Static/Neutral/Faint` on 2026-10-07.

### 3.2 Fill

| Element | Token |
|---|---|
| Action icon, hover | `Fill/Action/Secondary/Hover` |

### 3.3 Text

| Element | Token |
|---|---|
| Heading | `Foreground/Static/Neutral/Bold` |
| Caption, meta | `Foreground/Static/Neutral/Base` |

### 3.4 Icon

| Element | Token |
|---|---|
| Action icon, rest | `Foreground/Action/Secondary/Rest` |
| Action icon, hover | `Foreground/Action/Secondary/Hover` |

### 3.5 Geometry

| Property | Token | Value |
|---|---|---|
| Root radius | `CornerRadius/XLarge` | 16 |
| Border | `BorderWidth/Base` | 1 |
| Header gap | `Gap/XXXTight` | 2 |
| Inner gap | `Gap/Tight` | 8 |
| Inner padding | `Padding/Tight` and `Padding/Base` | 12 and 16 |
| Min width, Glance | `Widget/MinWidth/Glance` | 275 |
| Min width, Detail | `Widget/MinWidth/Detail` | 515 |
| Min width, Explore | `Widget/MinWidth/Explore` | 1050 |

Header height 44, title height 20, Action.Icon 36, hover-icon slot 72x36. These
are not tokenised: they are component metrics and live in `L`.

## 4. Layout & Spacing

| Size | Figma box | Min width | Min height | Root padding | Header padding |
|---|---|---|---|---|---|
| Glance | 275x176 | 275 | 176 | 0,0,8,0 | 0,8,0,12 |
| Detail | 566x416 | 515 | none | 0 | 0,6,0,16 |
| Explore | 1148x416 | 1050 | none | 0 | 0,6,0,16 |

**Detail and Explore are the same height and differ only in width.** Depth here
is horizontal. An implementation that gives them the same width and separates
them by height renders Explore, the widest size in the design, narrower than
the board.

### The flex grid

Measured off the demo at 1600px and again at 800px.

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Columns | 12 | 8 | 4 |
| Breakpoint | ≥1024 | ≥768 | <768 |

Auto-rows 48px, gap 16px, `grid-auto-flow: row`.

| Size | Demo name | Desktop cols | Tablet cols | Mobile cols | Rows |
|---|---|---|---|---|---|
| glance | kpi | 3 | 4 | 4 | 3 |
| detail | wide | 6 | 8 | 4 | 8 |
| explore | xwide | 12 | 8 | 4 | 9 |
| band | band | 12 | 8 | 4 | 3 |

**`row`, not `row dense`.** Dense backfills holes by pulling later widgets up
into them, so the board silently reorders itself and a widget placed third can
end up first. The demo keeps authored order.

**`band`** is the demo's full-width strip at 3 rows: one heading over a row of
KPI tiles, like Financial KPIs at the top of the demo. It is not a Figma widget
size, so it is absent from `SIZES` and a consumer opts into it through
`supportedSizes`.

Column spans are emitted as `--pw-widget-cols-<size>` on `.pw-dashboard-grid`,
generated from `SIZE_GRID` rather than hand-listed. A hand-listed version
silently gave any newly added size a one-column span.

## 5. Item / Variant Structure

### Glance

Flat. No inner card. Content sits on the root with a 12px horizontal inset and
the root's only padding is 8 at the bottom. Holds one KPI tile.

### Detail

Layered. Holds a KPI tile and a chart, or a table.

### Explore

Layered, same height as Detail, twice the width. Holds a KPI tile beside a
larger chart, or a wide table.

## 6. State Matrix

| State | Root | `Slot.RowEnd` (3 icons) | `Slot.HoverIcons` (2 icons) |
|---|---|---|---|
| Rest | as above | **visible** | hidden, `pointer-events: none` |
| Hover | unchanged | visible | **visible** |
| Focus within | unchanged | visible | **visible** |
| Manage | dashed outline, grab cursor | menu suppressed | hidden |
| Dragging | 50% opacity | visible | hidden |

### State logic rules

**The three row-end icons are visible at rest. The two hover icons are not.**

This took two corrections to get right, so both are recorded.

1. The first implementation read the name `Slot.HoverIcons` as the behaviour of
   the three visible icons and hid them until hover.
2. The correction over-swung: it claimed the slot simply held those three and
   that its name described position rather than timing.

Walking the tree settles it. The three are in `Slot.RowEnd` and are visible in
all six variants as drawn. `Slot.HoverIcons` is a different slot, two icons,
beside the title, hidden, gated by a boolean defaulting to false. In code that
is the `hoverActions` prop, which is empty unless a consumer passes it, and
which reveals on `:hover` or `:focus-within` so it is reachable by keyboard.

## 7. Sub-components / Decorations

| Part | Component |
|---|---|
| Heading | internal to `widget.jsx` |
| Action icon | internal, matches Figma's `Action.Icon` at 36x36 |
| Swap picker | `dashboard.jsx`, because it needs the catalogue |
| Content | the consumer's, via `children` |

## 8. Container / Surface

### 8.1 Surface

See §3.1. Glance takes the elevated surface; the layered sizes take the faint
neutral with an elevated inner card.

### 8.2 Dimensions & Padding

See §4.

### 8.3 Transition

Opacity fade in at `--motion-duration-3` with `--motion-easing-standard`.
Suppressed under `prefers-reduced-motion`.

## 9. Interaction / Behaviour

The title is a **swap** control when the consumer provides `swap`: it exchanges
this widget for another in the same slot, keeping its position. It is not a
rename target. A renamed widget shows the same data under a different name,
which is not what clicking a title asks for, and the demo has no widget rename.

Swapping keeps the size when the incoming widget supports it, and otherwise
falls back to that widget's default: a Glance-only widget dropped into a Detail
slot would be asked to render at a size it has no layout for.

## 10. Collapsed / Compact / Variant-specific State

None. The widget has no collapsed state; depth is chosen by size.

## 11. Iconography

Material Symbols Rounded throughout, `FILL 0`, `wght 400`, `opsz` matched to
the font size.

`Slot.RowEnd` draws exactly three actions, in Figma's order, at 12px in 36px boxes.

| Action | Ligature |
|---|---|
| Refresh | `refresh` |
| Open the full view | `open_in_full` |
| More actions | `more_vert` |
| Swap chevron | `expand_more` |

`Slot.HoverIcons` holds two Action.Icons in Figma with no ligature decided, so
the consumer names them. The Header actions story uses `push_pin` and
`download` as an illustration, not as a specification.

There is no `info` icon on the widget; an earlier version invented one, and used
`open_in_new` where Figma has `open_in_full`.

## 12. Interaction Patterns

Standard Pathway patterns only, plus §9.

## 13. Accessibility

- The root carries `aria-label` set to the widget's title.
- Every action icon has an `aria-label` and a matching `title`.
- The swap trigger is a button with `aria-haspopup="listbox"` and
  `aria-expanded`.
- Hover icons are reachable by keyboard: focus within reveals them, and they are
  `pointer-events: none` while invisible so they cannot be clicked blind.
- Minimum widths come from tokens, so a widget cannot be squeezed below the
  width its content needs.

## 14. Storybook

Sidebar-visible, matching the untagged exports in `Widget.stories.jsx` exactly:

| Export | Name |
|---|---|
| `Playground` | Playground |
| `SizeLadder` | Size ladder |
| `GlanceConfigurations` | Glance configurations |
| `TrendDirectionVersusSentiment` | Trend: direction vs sentiment |
| `HeaderActions` | Header actions: two slots |
| `StateMatrix` | State matrix |
| `ElementExplorer` | Element explorer |

Reference, `!dev`-tagged:

| Export | Name |
|---|---|
| `TokensFill` | Tokens: fill |
| `TokensStroke` | Tokens: stroke |
| `TokensText` | Tokens: text |
| `TokensIcon` | Tokens: icon |
| `TokensTypography` | Tokens: typography |
| `TokensSpacing` | Tokens: spacing |
| `TokensRadius` | Tokens: radius |
| `TokensMotion` | Tokens: motion |

Every token row resolves its name against the live document rather than
restating a hex, so a row reads `unresolved` only when the token itself is
wrong.

No `StandaloneDemo` story and no `widget.html`: a Widget is only meaningful on a
board, so the Dashboard page is where it is demonstrated in context.

The `.mdx` page follows `docs/storybook-authoring.md`: Resources, prose, Try it,
Anatomy, States, Explore a single unit, Token mappings, Responsive behaviour,
Accessibility, Full specification. Added 2026-10-08, with the split `Tokens*`
set replacing a lumped `TokensColour` and `TokensGeometry` pair, so this page
carries the same structure as Button and SideNav.
