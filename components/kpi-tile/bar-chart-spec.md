# Bar Chart: Pathway Design System Component Spec

Status: REVIEWED
Reviewed: 2026-10-08, measured against Figma

The stacked bars a Detail or Explore widget fills with. Given its own spec and
Storybook page on 2026-10-08 for the same reason as Mini Chart: it was buried
in the Widget page, so it could not be found, driven or composed with.

## Links

| What | Where |
|---|---|
| Figma | `3sw45aVcngFAmpbP6cfrXP` node `40009417:13029`, `_Chart data`, 18 variants |
| Figma, the legend | `40009417:13729` |
| Figma, the x axis | `40009417:12966`, and its labels `40009417:12962` / `40009417:12964` |
| Storybook | [Library/Bar Chart](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-bar-chart--docs) |
| Module | `components/kpi-tile/bar-chart.jsx` |
| Code Connect | `chart-data.figma.ts`, `legend.figma.ts`, `x-axis.figma.ts` |
| Mini Chart, the other half of the set | `components/kpi-tile/mini-chart-spec.md` |

## 1. Component Overview

### One Figma set, two components

`_Chart data` has eighteen Chart types: twelve Line types and six Bar types.
The Bar types map here and the Line types map to `mini-chart.jsx`, because they
are two different drawings with different APIs. Collapsing them into one
component with a `chartType` prop would make every prop conditional on it.

### Each column is three OVERLAPPING bands

This is the thing to understand. Figma builds a bar from three vectors that
each start lower than the last and run to the baseline, each with a rounded
top, so every band's cap shows above the one below it. Reading one `Bar`:

```
Bar                  27x286   the full-height wrapper
  ContentWrapper.Bar 27x286   Fill/Surface/Elevated
    Bars             27x243   the column's VALUE, at y=43
      Series 1       27x243 at y=0     Fill/Chart/Sequential/09
      Series 2       27x179 at y=64    Fill/Chart/Sequential/11
      Series 3       27x115 at y=128   Fill/Chart/Sequential/09
```

The previous implementation drew three flat boxes end to end with a 2px radius
on the topmost only, which is why the chart looked nothing like the design.

### Two colours, not three

Series 1 and Series 3 bind the SAME step, `/09`, and Series 2 binds `/11`. A
third distinct step was this component's invention and made a two-tone chart
read as three-tone.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Bar width, gap, the cap radius | Design | Figma `_Chart data` |
| The series colours | Design | Figma, the chart ramp |
| The data | Consumer | the `stacks` prop |
| Axis scaling and the rounded maximum | Engineering | `bar-chart.jsx` |

## 2. Component Anatomy

```
root                   flex, fills its box
  legend               only when `axes`. Horizontal, right-aligned, above
  row
    yTitle             only when `yTitle`. Rotated a quarter turn
    ticks              5 values, right-aligned
    plot
      bars             one column per stack, gap 8, baseline below
      months           the x labels
      xTitle           only when `xTitle`. Centred
```

### Measured

| Property | Value |
|---|---|
| Bar width | 27 at Figma's size; the columns flex |
| Bar gap | **8**, the `Chart` frame's itemSpacing |
| Columns | 15 in the Detail variant |
| Cap radius | about 8, a third of the bar width |
| Chart box | 526 wide inside a 566 Detail widget |

Fifteen bars of 27 with a gap of 8 fill 517, which is the 526 chart less its
inset.

## 3. Design Tokens

| Element | Token |
|---|---|
| Series 1 and Series 3 | `Fill/Chart/Sequential/09` |
| Series 2 | `Fill/Chart/Sequential/11` |
| Baseline | `Stroke/Static/Neutral/Faint` |
| Tick values, month labels, axis titles | `Foreground/Static/Neutral/Subtle` |
| Legend labels | `Foreground/Static/Neutral/Base` |
| Cap radius | `CornerRadius/Base` |

**The chart ramp, not the brand ramp.** `Fill/Chart/Sequential/01` to `/15` is
a dedicated fifteen-step violet scale. The bars are CATEGORIES, so nothing in
them is good or bad, and an earlier version bound `Fill/Static/Brand/*` and
came out navy where the design is violet.

## 4. Layout & Spacing

See §2. The columns flex and the gap is held, so the chart fills any box.

## 5. Item / Variant Structure

Figma's `Chart type` axis carries the six Bar values:
`Bar 01 desktop`, `Bar 01 mobile`, `Bar 02 desktop`, `Bar 02 mobile`,
`Bar 03 desktop`, `Bar 03 mobile`. The differences are the DATA and the column
count, both of which are `stacks` here, so they are not props.

`Series 2` and `Series 3` are Figma booleans. In code a stack's LENGTH is its
series count, so a two-series chart is `[[a, b], …]`.

## 6. State Matrix

None. The chart is static.

## 7. Sub-components / Decorations

The legend, the axes and both axis titles are drawn by this component rather
than composed beside it, and that is deliberate: an axis cannot be positioned
without the plot it belongs to, because its ticks come from the same rounded
maximum the bars are scaled by. A separate component would need that number
passed in and could still disagree with the chart beside it.

## 8. Container / Surface

No surface of its own.

## 9. Interaction / Behaviour

None yet. See the gaps.

## 10. Collapsed / Compact / Variant-specific State

`axes` is the closest thing: Figma draws the legend and the axes on Explore's
second panel only, and Detail draws bars alone.

## 11. Iconography

None. The legend's swatches are 8px dots, not icons.

## 12. Interaction Patterns

None.

## 13. Accessibility

- `role="img"` with `aria-label` when `label` is given, `aria-hidden`
  otherwise.
- Bars are `aria-hidden`: the label carries the meaning.
- The legend is real text, so series names are readable rather than
  colour-only.

### Gaps

| Gap | Detail |
|---|---|
| No hover, no tooltip, no value labels | Figma does not draw them either, so there is nothing to implement from. A chart a person cannot read a value off is a real limitation and belongs on the design side first |
| The month labels are hardcoded | Seven names for any column count, so they only line up at 12 to 15 columns. They should come from the data |
| `Bar 02` and `Bar 03` are not distinguished | All six Bar types render the same way; their differences are data |

## 14. Storybook

Sidebar-visible, matching the untagged exports in `BarChart.stories.jsx`
exactly:

| Export | Name |
|---|---|
| `Playground` | Playground |
| `ElementExplorer` | Element explorer |
| `InContext` | The sizes its consumers use |

Reference, `!dev`-tagged: `TokensColour` (Tokens: colour).

The Element explorer's single magnified column is the one to look at: it shows
the three overlapping bands and their caps, which is what a row of fifteen
hides.
