// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009417-12966
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/bar-chart.jsx
// component=BarChartAxes

import figma from "figma"

// The chart's axis furniture. Four Figma components, all nested in the Widget
// set and all unmapped until 2026-10-07:
//
//   _X-axis        40009417:12966   Data: 12 months | 30 days | 7 days
//                                   Breakpoint: Desktop | Mobile
//   _X-axis label  40009417:12962   the axis TITLE, sample text "Month"
//   _Y-axis label  40009417:12964   the rotated title, sample "Active users"
//   _Y-axis/True   40009417:13788   the gridlines with their value labels
//
// All four are drawn by BarChart when `axes` is set. They have no components of
// their own because an axis cannot be positioned without the plot it belongs
// to: its ticks come from the same rounded maximum the bars are scaled by, so
// a separate component would need that number passed in and could still
// disagree with the chart beside it.
//
// THE AXIS TITLES WERE MISSING FROM THE CODE until 2026-10-07. Figma draws both
// and BarChart drew neither, so the chart said what the numbers were and never
// what they measured. `yTitle` and `xTitle` are those two components.
//
// ON LIGHT AND MIDNIGHT: a snippet is code, not a render, so the mode toggle
// cannot change it. Every colour here resolves through a MODE-AGNOSTIC token
// name switched by a `data-theme` ancestor, so the same markup renders both:
//   <div data-theme="midnight">  ...same markup, Midnight values...

const data = figma.selectedInstance.getEnum("Data", {
  "12 months": "12 months",
  "30 days": "30 days",
  "7 days": "7 days",
})

export default {
  id: "BarChartAxes",
  imports: ['import { BarChart } from "./bar-chart.jsx";'],
  example: figma.code`{/* Axis furniture is drawn by the chart, not composed beside it.
    This variant's Data axis is ${data}; one stack per period. */}
<BarChart axes yTitle="Active users" xTitle="Month" label="Active users by month" />`,
  metadata: { nestable: true },
}
