// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40017320-247
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-number-trend.jsx
// component=KpiNumberAndTrend

import figma from "figma"

// A BUILDING BLOCK. It is mapped because it is a Figma component, and it has no
// Storybook page because it only ever appears as a nested instance, inside a
// KPI Tile or inside a Widget.

// Four Types, and in code the only thing that varies is where the chart goes.
// "04 No Chart" is expressed by omitting the chart rather than by a layout
// value, so it maps to the same fallback the component uses when there is
// nothing to place beside the number. 01 and 03 are both "Chart Right" and
// differ in the number's own size, not the layout.
const layout = figma.selectedInstance.getEnum("Type", {
  "01 Chart Right": "right",
  "03 Chart Right": "right",
  "02 Chart Bottom": "bottom",
  "04 No Chart": "bottom",
})

// Figma's Chart Bottom variant also sets KPI Number to Style=Wide, so the
// figure and its trend sit in a row and do not eat the chart's height.
const numberStyle = figma.selectedInstance.getEnum("Type", {
  "01 Chart Right": "tall",
  "03 Chart Right": "tall",
  "04 No Chart": "tall",
  "02 Chart Bottom": "wide",
})

// `filter` takes the LABEL, not a boolean, so Yes emits a placeholder the
// consumer replaces. Mapping the boolean straight through would emit
// filter={true}, which is not the prop's type.
const filter = figma.selectedInstance.getEnum("With Filter Controls?", {
  Yes: "Period",
  No: undefined,
})

export default {
  id: "KpiNumberAndTrend",
  imports: [
    'import { KpiNumberAndTrend, Change } from "./kpi-number-trend.jsx";',
    'import { MiniChart } from "./mini-chart.jsx";',
  ],
  example: figma.code`<KpiNumberAndTrend
  eyebrow="Views per month"
  value="2,000"${figma.helpers.react.renderProp("layout", layout)}${figma.helpers.react.renderProp(
    "numberStyle",
    numberStyle,
  )}${figma.helpers.react.renderProp("filter", filter)}
  change={<Change value="100%" direction="up" note="vs last month" />}
  chart={<MiniChart direction="up" />}
/>`,
}
