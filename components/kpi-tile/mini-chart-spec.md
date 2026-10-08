# Mini Chart: Pathway Design System Component Spec

Status: REVIEWED
Reviewed: 2026-10-08, measured against Figma

The sparkline. Given its own spec and its own Storybook page on 2026-10-08,
because it was only visible inside the KPI Tile page: a consumer could not
find it, drive it or compose with it, even though Figma nests it in the KPI
Tiles set, the Widget set and the KPI Number & Trend block.

## Links

| What | Where |
|---|---|
| Figma | `3sw45aVcngFAmpbP6cfrXP` node `40009415:27919`, `_Chart mini`, 24 variants |
| Storybook | [Library/Mini Chart](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-mini-chart--docs) |
| Module | `components/kpi-tile/mini-chart.jsx` |
| Code Connect | `components/kpi-tile/mini-chart.figma.ts` |
| Bar Chart, the other half of `_Chart data` | `components/kpi-tile/bar-chart-spec.md` |
| KPI Tile, its main consumer | `components/kpi-tile/kpi-tile-spec.md` |

## 1. Component Overview

A line, an area under it, and a marker. 112x56 at its Figma size, and it fills
whatever box it is given.

### The twelve shapes are the real Figma vectors

`SAMPLE_SERIES` is not approximate data. Each of the twelve arrays is that
variant's `Chart.Line` path, flattened and sampled at 40 x positions in its own
112x56 space, extracted by parsing `vectorPaths[0].data`.

It held eight hand-written points per shape until 2026-10-08, so every chart
was a blocky stand-in of a line that has 83 points in Realistic 01 and 133 in
Wavy 03.

### What it is not

The bar half of `_Chart data`. That is `bar-chart.jsx`: one Figma set, two
components, because the Line types and the Bar types are two different drawings
with different APIs.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| The shapes and the marker positions | Design | Figma `_Chart mini` |
| The line weight, the area opacity | Design | Figma, mirrored in `L` |
| Which shape a consumer plots | Consumer | the `series` prop |
| Scaling, sampling, the marker's geometry | Engineering | `mini-chart.jsx` |

## 2. Component Anatomy

```
wrap                    position: relative, fills its box
  svg                   viewBox 0 0 112 56, preserveAspectRatio NONE
    area                the line's path closed to the baseline, 0.10, faded
    line                2px, round cap, non-scaling stroke
  ring                  19x19, 0.20. HTML, not SVG
  dot                   11x11, Fill/Surface/Elevated, full opacity. HTML
```

**The marker is HTML, not SVG, and that is the whole point.** A sparkline has
to fill its box, which means `preserveAspectRatio="none"` and a non-uniform
scale. Any `<circle>` inside that viewBox is stretched by it, so Figma's 19px
ring came out a wide ellipse in a 700px widget. The marker is positioned by
PERCENTAGE and sized in PIXELS so it stays a circle at any box size.

## 3. Design Tokens

| Element | Token |
|---|---|
| Line, favourable | `Stroke/Static/Positive/Strong` |
| Line, unfavourable | `Stroke/Static/Negative/Strong` |
| Line, flat | `Stroke/Static/Neutral/Base` |
| Area | the same token at `0.10`, masked by a vertical fade |
| Ring | the same token at `0.20` |
| Dot fill | `Fill/Surface/Elevated` |

The area and the ring are the line's own colour at different opacities, so
there is one token per state rather than three that can drift.

> A stroke token on a stroke is correct. The area vector in Figma FILLS with
> the same stroke token, which is a tier oddity; it is there to match the
> line's colour exactly and no Fill token shares that value, so changing it
> would alter the design rather than fix a mapping.

## 4. Layout & Spacing

| Property | Value |
|---|---|
| Figma box | 112x56, and 128x56 for Layers |
| Line weight | 2, round cap, non-scaling |
| Ring | 19x19 at weight 2 |
| Dot | 11x11 at weight 2 |

The sizes its consumers ask for: 112x56 (KPI Tile Chart 01, Widget Glance),
128x56 (Chart 02 Layers), 100x52 (Chart 03 Layers), 308x56 (Chart 04), and
84x108 in the Widget's Glance, which stretches it tall.

## 5. Item / Variant Structure

Figma's axes are `Type`, twelve shapes, and `Trend`, Positive or Negative.

| Figma Type | `series` | `curve` |
|---|---|---|
| Wavy 01 to 07 | `wavy-01` to `wavy-07` | smooth |
| Realistic 01 | `realistic-01` | **smooth** |
| Realistic 02, 03 | `realistic-02`, `realistic-03` | **linear** |
| Straight | `straight` | linear |
| Layers | the `layers` prop | its own drawing |

**The curve does not follow the family name.** Realistic 01 is a bezier while
Realistic 02 and 03 are polylines, so `SMOOTH_TYPES` is read from whether the
path uses `C` commands. Guessing from the name gets one of the three wrong.

**`Layers` is a different drawing.** 128x56 with TWO vectors, both FILLED at
0.10, no stroke at all and no marker: two translucent areas overlapping.
`SAMPLE_LAYERS` holds both edges and the `layers` prop draws them.

## 6. State Matrix

| | `direction="up"` | `"down"` | `"flat"` |
|---|---|---|---|
| `favourable` unset | positive | negative | neutral |
| `favourable={true}` | positive | positive | neutral |
| `favourable={false}` | negative | negative | neutral |

The ARROW follows direction and the COLOUR follows whether the move is
favourable. Collapsing them into one prop paints rising costs green.

## 7. Sub-components / Decorations

None. The ring and the dot are internal.

## 8. Container / Surface

No surface of its own. It fills its parent, and the dot's fill is the only
place it assumes what is behind it: `Fill/Surface/Elevated`, so on a non
elevated surface the dot needs overriding.

## 9. Interaction / Behaviour

None. It is a static drawing. `role="img"` with `aria-label` when `label` is
given, `aria-hidden` otherwise, because a sparkline beside a number it is
illustrating should not be announced twice.

## 10. Collapsed / Compact / Variant-specific State

None.

## 11. Iconography

None.

## 12. Interaction Patterns

None.

## 13. Accessibility

- Decorative by default, `aria-hidden`. Pass `label` when the chart is the only
  thing carrying the information.
- Colour is not the only signal: the figure beside it and the `_Change` arrow
  both say which way it moved.
- No motion, so nothing to suppress under `prefers-reduced-motion`.

### Gaps

| Gap | Detail |
|---|---|
| The stroke does not scale | `vectorEffect="non-scaling-stroke"` keeps it 2px at any box size. Figma's 2 is relative to a 112x56 artboard and would scale to 4 at double that, which is too heavy for a sparkline. A deliberate departure |
| Trend=Negative shapes are not separately sampled | The negative variants' own paths were not extracted; the positive series are drawn in the negative colour. Figma's negative shapes are different lines |

## 14. Storybook

Sidebar-visible, matching the untagged exports in `MiniChart.stories.jsx` exactly:

| Export | Name |
|---|---|
| `Playground` | Element explorer |
| `ElementExplorer` | Element explorer |
| `StateMatrix` | State matrix |
| `Shapes` | All twelve Figma shapes |
| `InContext` | The sizes its consumers use |

Reference, `!dev`-tagged:

| Export | Name |
|---|---|
| `TokensFill` | Tokens: fill |
| `TokensStroke` | Tokens: stroke |

Every token row resolves its name against the live document rather than
restating a hex, so a row reads `unresolved` only when the token itself is
wrong.

No `StandaloneDemo` story: a sparkline is judged at the sizes it ships at, which
is what `InContext` renders.

The `.mdx` page follows `docs/storybook-authoring.md` and was added 2026-10-08,
with `TokensColour` split into `TokensFill` and `TokensStroke`.
