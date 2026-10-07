// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009417-13729
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/bar-chart.jsx
// component=BarChartLegend

import figma from "figma"

// `_Legend` 40009417:13729, two variants on `Orientation`: Vertical | Horizontal.
// Nested once inside the Widget set and unmapped until 2026-10-07.
//
// It has NO component of its own in code, and that is deliberate rather than a
// gap: a legend is only meaningful beside the chart whose series it names, and
// a standalone one would have to be handed the same colours twice. It is drawn
// by BarChart when `axes` is set, from `seriesNames`, taking its swatches from
// the same chart ramp the bars use, so the two cannot disagree.
//
// Figma draws it horizontal and right-aligned above the plot, which is what
// BarChart reproduces. The Vertical variant has no consumer in this repo yet.
//
// ON LIGHT AND MIDNIGHT: a snippet is code, not a render, so the mode toggle
// cannot change it. Every colour here resolves through a MODE-AGNOSTIC token
// name switched by a `data-theme` ancestor, so the same markup renders both:
//   <div data-theme="midnight">  ...same markup, Midnight values...

export default {
  id: "BarChartLegend",
  imports: ['import { BarChart } from "./bar-chart.jsx";'],
  example: figma.code`{/* The legend is not a separate component: BarChart draws it from
    seriesNames, using the same ramp as the bars so the two cannot drift. */}
<BarChart axes seriesNames={["Series 1", "Series 2", "Series 3"]} />`,
  metadata: { nestable: true },
}
