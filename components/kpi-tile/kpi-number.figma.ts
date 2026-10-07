// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40017333-37612
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-number-trend.jsx
// component=KpiNumber

import figma from "figma"

// A BUILDING BLOCK: mapped, no Storybook page. It appears only inside a
// KPI Number & Trend, which itself appears only inside a KPI Tile or a Widget.

const numberStyle = figma.selectedInstance.getEnum("Style", {
  Tall: "tall",
  Wide: "wide",
})

// All three of Figma's layouts. "toolbar" is not the same as having no filter:
// the control exists, it just lives on the widget's toolbar, so the label is
// still needed by whoever renders that.
const filterLayout = figma.selectedInstance.getEnum("Trend Filter Layout", {
  "Stacked with KPI Number": "stacked",
  "Inline with KPI number": "inline",
  "On Filter Toolbar": "toolbar",
})

// `filter` takes the LABEL, so Yes emits a placeholder rather than `true`.
const filter = figma.selectedInstance.getEnum("Show Trend Filter", {
  Yes: "Period",
  No: undefined,
})

const eyebrow = figma.selectedInstance.getString("Eyebrow")
const showEyebrow = figma.selectedInstance.getBoolean("Show Eyebrow")

export default {
  id: "KpiNumber",
  imports: ['import { KpiNumber, Change } from "./kpi-number-trend.jsx";'],
  example: figma.code`<KpiNumber${figma.helpers.react.renderProp(
    "eyebrow",
    showEyebrow ? eyebrow : undefined,
  )}
  value="2,000"${figma.helpers.react.renderProp("numberStyle", numberStyle)}${figma.helpers.react.renderProp(
    "filterLayout",
    filterLayout,
  )}${figma.helpers.react.renderProp("filter", filter)}
  change={<Change value="100%" direction="up" note="vs last month" />}
/>`,
}
