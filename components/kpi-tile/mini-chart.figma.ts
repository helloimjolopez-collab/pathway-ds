// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009415-27919
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/mini-chart.jsx
// component=MiniChart

import figma from "figma"

// A BUILDING BLOCK: mapped, no Storybook page.
//
// Trend picks the colour here rather than an arrow, because a sparkline has no
// arrow. `favourable` still exists on the component for the same reason it does
// on Change: a rising line is good for income and bad for costs.
const direction = figma.selectedInstance.getEnum("Trend", {
  Positive: "up",
  Negative: "down",
})

// THE TWELVE TYPES ARE SAMPLE DATA, NOT AN API. Every variant has the identical
// structure and differs only in one vector's path, so they map to the named
// sample series rather than to a `type` prop the component does not have.
// Straight is the one that carries a marker at both ends.
const series = figma.selectedInstance.getEnum("Type", {
  "Realistic 01": 'SAMPLE_SERIES["realistic-01"]',
  "Realistic 02": 'SAMPLE_SERIES["realistic-01"]',
  "Realistic 03": 'SAMPLE_SERIES["realistic-03"]',
  "Wavy 01": 'SAMPLE_SERIES["wavy-01"]',
  "Wavy 02": 'SAMPLE_SERIES["wavy-02"]',
  "Wavy 03": 'SAMPLE_SERIES["wavy-01"]',
  "Wavy 04": 'SAMPLE_SERIES["wavy-02"]',
  "Wavy 05": 'SAMPLE_SERIES["wavy-01"]',
  "Wavy 06": 'SAMPLE_SERIES["wavy-02"]',
  "Wavy 07": 'SAMPLE_SERIES["wavy-01"]',
  Straight: 'SAMPLE_SERIES["straight"]',
  Layers: 'SAMPLE_SERIES["layers"]',
})

const markerBothEnds = figma.selectedInstance.getEnum("Type", {
  Straight: true,
})

const markers = figma.selectedInstance.getBoolean("Marker(s)")
const area = figma.selectedInstance.getBoolean("Background")

export default {
  id: "MiniChart",
  imports: ['import { MiniChart, SAMPLE_SERIES } from "./mini-chart.jsx";'],
  example: figma.code`<MiniChart
  series={${series}}${figma.helpers.react.renderProp("direction", direction)}${figma.helpers.react.renderProp(
    "markers",
    markers,
  )}${figma.helpers.react.renderProp("markerBothEnds", markerBothEnds)}${figma.helpers.react.renderProp(
    "area",
    area,
  )}
/>`,
}
