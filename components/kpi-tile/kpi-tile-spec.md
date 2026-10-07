# KPI Tile — Pathway Design System Component Spec

Status: REVIEWED
Reviewed: 2026-10-07, measured against Figma

## Links

| What | Where |
|---|---|
| Figma page | `3sw45aVcngFAmpbP6cfrXP` node `40009862:10309`, "↳ Mini Charts & KPI Tiles" |
| KPI Number & Trend | `40017320:247` |
| KPI Tiles | `40009415:27750` |
| _Change | `40009415:28112` |
| _Chart mini | `40009415:27919` |
| KPI Number | `40017333:37612` |
| Widget.Heading | `40017333:34481` |
| Storybook | `Library/KPI Tile` |
| Modules | `kpi-tile.jsx`, `kpi-card.jsx`, `mini-chart.jsx` |
| Widget spec | `components/widget/widget-spec.md` |

## 1. Component Overview

**There are two KPI tiles and they are not interchangeable.**

| Component | Figma | What it is |
|---|---|---|
| `KpiTile` | `KPI Number & Trend` `40017320:247` | Goes INSIDE a Widget. No card of its own, because the Widget is the card. |
| `KpiCard` | `KPI Tiles` `40009415:27750` | IS a card. Own surface, border, radius, padding. Used outside the grid. |

They look alike. Putting the wrong one inside a Widget gives a card inside a
card inside a card; putting the wrong one on a page gives a tile with no edges.
Separate files, so the import says which you meant.

Supporting parts: `Change` and `ChangeChip` for the trend, `MiniChart` for the
sparkline.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Anatomy, type sizes, variants | Design | Figma, the sets above |
| Token bindings | Design | Figma Variables and paint styles |
| Which tile goes where | Engineering | the import |
| Trend sentiment rules | Engineering | `favourable`, see §9 |
| Chart data | Consumer | the `series` prop |

## 2. Component Anatomy

### KpiTile, in-widget

```
root              VERTICAL, pad 0,12,0,12
  Chart & Trend   HORIZONTAL gap 24
    KPI Number    eyebrow, number, change
    Chart.Container  VERTICAL pad 8,0,8,4, FILLs
```

### KpiCard, standalone

```
root              r=16, Fill/Surface/Elevated, Stroke/Static/Neutral/Base
  Dropdown        20x20 dots-vertical, top right, absolutely placed
  Featured icon   48x48 r=28, Icon types only
  Heading         fs 14
  Number row      HORIZONTAL gap 16: number + change
  Chart           Chart types only, beside the number
```

## 3. Design Tokens

### 3.1 Surface

| Element | Token |
|---|---|
| KpiCard root | `Fill/Surface/Elevated` |
| KpiCard border | `Stroke/Static/Neutral/Base` |
| Featured icon, up | `Fill/Static/Positive/Subtle` |
| Featured icon, down | `Fill/Static/Negative/Subtle` |
| Mini chart dot | `Fill/Surface/Elevated` |

### 3.3 Text

| Element | Token |
|---|---|
| Eyebrow | `Foreground/Static/Neutral/Subtle` |
| Heading, Simple and Icon | `Foreground/Static/Neutral/Base` |
| Heading, Chart | `Foreground/Static/Neutral/Strong` |
| Number | `Foreground/Static/Neutral/Strong` |
| Change, in-widget, favourable | `Foreground/Static/Positive/On Subtle` |
| Change, in-widget, unfavourable | `Foreground/Static/Negative/On Subtle` |
| ChangeChip, standalone | `Foreground/Static/Neutral/Strong` |

The heading really is a different token on Chart than on the other two, and the
trend really is neutral on the standalone card and coloured in the widget.
Measured, not inferred, and reproduced rather than unified, because unifying
them is a design decision.

> **Fixed in Figma, 2026-10-07.** `_Change` bound
> `Stroke/Static/{Positive,Negative}/Strong` as its TEXT fill. That is a tier
> violation and it failed contrast: `#358d4b` on the white card is 4.15:1
> against a 4.5 floor for 14px text. Ten fills across the eight variants moved
> to the Foreground tier, measuring 13.62:1 and 10.74:1. The mini chart's Line
> vectors genuinely stroke with that token and were left alone.

### 3.5 Geometry

| Property | Token | Value |
|---|---|---|
| Card radius | `CornerRadius/XLarge` | 16 |
| Root pad, in-widget | `Padding/Tight` | 12 |
| Chart & Trend gap | `Gap/Relaxed` | 24 |
| Number row gap | `Gap/Base` | 16 |
| Change outer gap | `Gap/XTight` | 6 |
| Change inner gap | `Gap/XXXTight` | 2 |

Component metrics, not tokens: featured icon 48 at glyph 24, menu icon 20,
change arrow 12 and 16, mini chart ring 19 and dot 11, line weight 2.

## 4. Layout & Spacing

### KpiCard, by Type

| Type | Width, desktop | Width, mobile | Height | Gap | Padding |
|---|---|---|---|---|---|
| Simple | 388 | 343 | 90 | 2 | 16 |
| Icon 01 to 04 | 388 | 343 | 158 | 24 | 16 |
| Chart 01 to 04 | 388 | 343 | 144 | 8 | 24 |

Chart is the only Type with the larger padding, and Icon the only one with the
larger gap. The dropdown is absolutely placed so it never joins the stack and
the heights stay as measured.

> **Fixed in Figma, 2026-10-07.** Both of those read 20 at first, and 20 is not
> a rung: the semantic ladder goes 16 then 24. Nineteen bindings across the set
> pointed a gap or a padding straight at the `Unit/20` PRIMITIVE, the same
> defect as the `Unit/10` bindings cleared earlier. All nineteen were rebound to
> `Padding/Relaxed` and `Gap/Relaxed`, both 24, the nearest rung that keeps
> Chart visibly roomier than the other two Types. Chart is therefore 144 tall
> rather than 136. Zero gap or padding bindings remain on `Unit/20`.

### KpiTile, in-widget

Fills its Widget. Figma's Type axis is four layouts and reduces in code to
where the chart goes:

| Figma Type | `layout` |
|---|---|
| 01 Chart Right | `right` |
| 03 Chart Right | `right` |
| 02 Chart Bottom | `bottom` |
| 04 No Chart | omit `chart` |

01 and 03 differ in the number's own size, not in the layout.

## 5. Item / Variant Structure

`_Change`, 8 variants on Type x Trend. Type picks the glyph: 01 the arrows, 02
`moving`. 03 and 04 are on the axis and are not distinguishable in the read, so
they fall back to the arrows.

`_Chart mini`, 24 variants on Type x Trend. The twelve Types are twelve
hand-drawn line shapes: Wavy 01 to 07, Realistic 01 to 03, Straight and Layers.
**They are sample data, not an API.** Every variant has the identical structure
and differs only in one vector's path, so `MiniChart` renders from a `series`
and the variants become what they are: proof the container works across a range
of shapes. Straight carries two markers, one at each end.

## 6. State Matrix

No interactive states on the tiles themselves. The menu control and the period
filter are buttons and take the standard Pathway states.

## 9. Interaction / Behaviour

### 9.1 Favourable is not the same as up

`direction` picks the arrow. `favourable` picks the colour. They are separate
props and must stay separate: a rising figure is good for income and bad for
expenses, so collapsing them paints rising costs green. `favourable` defaults
to up-is-good, which is right for most metrics and wrong for every cost.

### 9.2 The marker is not drawn inside the SVG

A sparkline fills its box, so the viewBox scales non-uniformly and any circle
inside it stretches. Figma's 19px ring came out a wide ellipse in a 700px
widget. The marker is an HTML element positioned by percentage and sized in
pixels, so it stays circular at Figma's own 19 and 11 whatever the box does.

## 11. Iconography

Material Symbols Rounded, `FILL 0`, `wght 400`, `opsz` matched to size.

| Use | Ligature |
|---|---|
| Trend up, Type 01 | `arrow_upward` |
| Trend down, Type 01 | `arrow_downward` |
| Trend, Type 02 | `moving` |
| Flat | `remove` |
| Chip, up | `north_east` |
| Chip, down | `south_east` |
| Featured icon, default | `trending_up` |
| Menu | `more_vert` |

## 13. Accessibility

- A mini chart with a `label` is `role="img"` with that label; without one it is
  `aria-hidden`, because an unlabelled sparkline beside its own figure is
  decoration and announcing it twice is worse than silence.
- Trend is never colour-only: the arrow carries the direction, so the meaning
  survives for a reader who cannot separate the greens from the reds.
- Markers are `aria-hidden` and `pointer-events: none`.
- The menu control and the period filter are real buttons with labels.

## 14. Storybook

Sidebar-visible: `Playground`, `Card types`, `Trend: direction vs sentiment`,
`Chart shapes`.

No `StandaloneDemo` story.
