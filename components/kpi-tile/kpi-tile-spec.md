# KPI Tile: Pathway Design System Component Spec

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
| Storybook | [Library/KPI Tile](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-kpi-tile--docs) |
| Code Connect | 6 files in `components/kpi-tile/`: `kpi-tile`, `kpi-number-trend`, `kpi-number`, `change`, `mini-chart`, `trend-comparison` |
| Modules | `kpi-tile.jsx` the card, `kpi-number-trend.jsx` the block, `mini-chart.jsx`, `bar-chart.jsx` |
| Widget spec | `components/widget/widget-spec.md` |

## 1. Component Overview

**A KPI Tile is a card.** All 18 Figma variants have their own surface, border,
radius and padding. It is a component in its own right, with a Storybook page.

**The cardless thing is a building block, not a tile.** `KPI Number & Trend` is
the eyebrow, the figure, its trend and optionally a sparkline. It has no card
and it is nested inside things that do:

| Nested in | What that is |
|---|---|
| KPI Tile | the card, this spec |
| Widget | the dashboard container, `widget-spec.md` |

A KPI Tile and a Widget are two different components that happen to share that
block. They are not two framings of one thing.

> **Corrected 2026-10-07.** An earlier version of this had the building block
> named `KpiTile` and described as "the KPI tile that goes inside a widget,
> which has no card because the widget is the card". Both halves were wrong. The
> files are now `kpi-tile.jsx` for the card and `kpi-number-trend.jsx` for the
> block.

### Which things get a Storybook page

| Figma component | Repo | Page | Mapped |
|---|---|---|---|
| KPI Tiles `40009415:27750` | `KpiTile` | yes | yes |
| KPI Number & Trend `40017320:247` | `KpiNumberAndTrend` | no | yes |
| KPI Number `40017333:37612` | `KpiNumber` | no | yes |
| _Change `40009415:28112` | `Change` | no | yes |
| _Chart mini `40009415:27919` | `MiniChart` | no | yes |
| trend.comparisoncontrol `40017320:361` | maps to `Change` | no | yes |
| Widget.Heading `40017333:34481` | `WidgetHeading` | no | yes |

Anything that is a component in Figma gets a Code Connect mapping. A building
block does not earn a page of its own, because it only ever appears as a nested
instance.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Anatomy, type sizes, variants | Design | Figma, the sets above |
| Token bindings | Design | Figma Variables and paint styles |
| Which tile goes where | Engineering | the import |
| Trend sentiment rules | Engineering | `favourable`, see §9 |
| Chart data | Consumer | the `series` prop |

## 2. Component Anatomy

### KpiNumberAndTrend, the nested block

```
root              VERTICAL, pad 0,12,0,12
  Chart & Trend   HORIZONTAL gap 24
    KPI Number    eyebrow, number, change
    Chart.Container  VERTICAL pad 8,0,8,4, FILLs
```

### KpiTile, the card

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
| KpiTile root | `Fill/Surface/Elevated` |
| KpiTile border | `Stroke/Static/Neutral/Base` |
| Featured icon, up | `Fill/Static/Positive/Subtle` |
| Featured icon, down | `Fill/Static/Negative/Subtle` |
| Mini chart dot | `Fill/Surface/Elevated` |
| Bar chart series | `Fill/Chart/Sequential/07`, `/09`, `/11` |

Charts use the dedicated `Fill/Chart/Sequential/01` to `/15` ramp, a
fifteen-step violet scale, not the brand ramp. Figma's Widget bars bind `/09`
(`#a198d4`) and `/11` (`#b9b3e0`). The first implementation used
`Fill/Static/Brand/*`, which is the blue brand, so the bars came out navy where
the design is violet.

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

### KpiTile, by Type

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

### KpiNumberAndTrend, the nested block

Fills its Widget. Figma's Type axis is four layouts and reduces in code to
where the chart goes:

| Figma Type | `layout` | `numberStyle` |
|---|---|---|
| 01 Chart Right | `right` | `tall` |
| 03 Chart Right | `right` | `tall` |
| 02 Chart Bottom | `bottom` | `wide` |
| 04 No Chart | omit `chart` | `tall` |

`Trend Filter Layout` has THREE options, not two: `Stacked with KPI Number`,
`Inline with KPI number` and `On Filter Toolbar`, mapping to `stacked`,
`inline` and `toolbar`.

**The three differ in WHICH control sits on the row, not in whether one does.**
`stacked` and `inline` draw the trend-filter pill, above the number and on its
row respectively. `toolbar` draws a BUTTON, `PW_Button` at Style=Outlined,
Size=XS, Type=Secondary, which is `FilterToolbarButton` in code.

> **Corrected 2026-10-07.** This section said `toolbar` meant the control
> "lives on the widget's toolbar, so the label is still needed by whoever
> renders that", and `KpiNumber` accordingly drew nothing for it. Walking the
> four Glance Configurations disproves it: 02, 03 and 04 all carry
> `Trend Filter Layout=On Filter Toolbar` **and** a `PW_Button` inside the KPI
> Number block, above the eyebrow. The filter toolbar is a row at the top of
> this block, not somewhere else on the widget.

### The Widget's Configuration axis

It resolves entirely to props on the building block, which is why the Widget
takes none of them.

Read per variant on 2026-10-07, rather than inferred.

| Config | KPI N&T Type | `numberStyle` | `Show Trend Filter` | `filterLayout` | Chart |
|---|---|---|---|---|---|
| 01 | 01 Chart Right | tall | **Yes** | `stacked`, a trend-filter pill | Realistic 01 |
| 02 | 02 Chart Bottom | wide | No | `toolbar`, a button | Wavy 01 |
| 03 | 01 Chart Right | tall | No | `toolbar`, a button | Realistic 01 |
| 04 | 01 Chart Right | tall | No | `toolbar`, a button | Wavy 05 |

**01 is the only Configuration with a trend-filter pill.** The other three put
a button on the filter toolbar row. 03 and 04 are structurally identical and
differ only in the sample line drawn, which is why the Widget takes no
`Configuration` prop: both the structure and the sample are props on the block.

01 and 02 are genuinely distinct. 03 and 04 share a structure and differ only
in which sample line the chart draws.

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

## 13.1 The mini chart's sample shapes are the Figma vectors

`SAMPLE_SERIES` in `mini-chart.jsx` is not approximate data. Each of the twelve
arrays is the real `Chart.Line` path of one variant of set `40009415:27919`,
flattened and sampled at 40 x positions in its own 112x56 space, extracted on
2026-10-07 by parsing `vectorPaths[0].data` in the file.

It held EIGHT hand-written points per shape before that, so every chart in
Storybook was a blocky stand-in. Figma's `Realistic 01` has 83 points on its
path and `Wavy 03` has 133; a shape is a specific line, not a direction of
travel, and a fifth of the detail is a different drawing.

Two things came out of reading the paths rather than assuming:

- **The curve does not follow the family name.** `Realistic 01` is a BEZIER and
  `Realistic 02` and `03` are polylines, so `SMOOTH_TYPES` is read from whether
  the path uses `C` commands. Guessing from the name gets one of the three
  wrong.
- **The marker is not at the end.** `SAMPLE_MARKERS` holds each shape's real
  marker index, measured from its `Marker` frame centre: between 50% and 82% of
  the width, with the line carrying on past it to the right edge. `Straight`
  carries TWO markers and `Layers` carries NONE.

The one place the code departs from the file is the line's stroke, which uses
`vectorEffect="non-scaling-stroke"` so it stays 2px at any box size. Figma's 2
is relative to a 112x56 artboard and would scale to 4 in a chart rendered at
double that, which is too heavy for a sparkline. Recorded here because it is a
deliberate departure rather than a mismatch.

## 14. Storybook

Sidebar-visible, matching the untagged exports in `KPITile.stories.jsx` exactly:

| Export | Name |
|---|---|
| `Playground` | Playground |
| `Types` | Types |
| `Breakpoints` | Breakpoints |
| `TheBuildingBlock` | The building block it nests |
| `ChangeTypes` | Change: all four Figma types |
| `ChartShapes` | Mini chart: all twelve Figma shapes |

Reference, `!dev`-tagged: `TokensColour` (Tokens: colour), `TokensGeometry` (Tokens: geometry and type).

`Types` captions every tile with its Type and measured box. `TheBuildingBlock`
is the only place to look at `KpiNumberAndTrend` on its own. `ChangeTypes` and
`ChartShapes` show the two nested sets in full, which nothing did before:
`_Change` was split across two files with Type 04 missing, and `_Chart mini`
drew all twelve of its shapes as polylines when seven of them are beziers.

No `StandaloneDemo` story and no `kpi-tile.html`. Every other component in the
repo carries a standalone React-plus-Babel demo page, and these three do not, so
the absence is stated rather than left as a hole: a KPI Tile, a Widget and a
Dashboard are only meaningful on a board, and a board is what the Dashboard
Storybook page already is. A fourth copy of that board in a static HTML file
would be a second implementation to keep in step, which is how the specs and
stories drifted in the first place.
