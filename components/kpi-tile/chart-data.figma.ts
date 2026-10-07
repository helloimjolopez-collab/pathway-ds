// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009417-13029
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/bar-chart.jsx
// component=BarChart

import figma from "figma"

// `_Chart data` 40009417:13029, nested three times inside the Widget set and
// unmapped until 2026-10-07. Eighteen variants on one axis:
//
//   Chart type  Line gradual 01-04 | Line wavy 01-04 | Line volatile 01-04
//               Bar 01/02/03 desktop | Bar 01/02/03 mobile
//   booleans    Series 2, Series 3, Gradient background, Lines background,
//               Line border
//
// TWO COMPONENTS IMPLEMENT THIS ONE SET, because it is two different drawings
// behind one axis: the Line types are a sparkline and the Bar types are a
// stacked bar chart. They have different APIs and nothing is shared, so
// collapsing them into one component with a `chartType` prop would make every
// prop conditional on it. The Bar types map here; the Line types map in
// mini-chart.figma.ts.
//
// MEASURED: the Detail variant's `Bar 01 desktop` draws FIFTEEN bars at 27x286,
// and the bars bind Fill/Chart/Sequential/09 and /11, the dedicated fifteen-step
// violet chart ramp. Not the blue brand ramp: the bars are categories, so
// nothing in them is good or bad.
//
// ON LIGHT AND MIDNIGHT: a snippet is code, not a render, so the mode toggle
// cannot change it. Every colour here resolves through a MODE-AGNOSTIC token
// name switched by a `data-theme` ancestor, so the same markup renders both:
//   <div data-theme="midnight">  ...same markup, Midnight values...

const series2 = figma.selectedInstance.getBoolean("Series 2")
const series3 = figma.selectedInstance.getBoolean("Series 3")

export default {
  id: "BarChart",
  imports: ['import { BarChart, SAMPLE_STACKS } from "./bar-chart.jsx";'],
  example: figma.code`{/* One array per column, one value per series. Series 2 is ${series2}
    and Series 3 is ${series3} on this variant; a stack's length IS its series count. */}
<BarChart
  stacks={SAMPLE_STACKS}
  axes
  yTitle="Active users"
  xTitle="Month"
  label="Active users by month and series"
/>`,
  metadata: { nestable: true },
}
