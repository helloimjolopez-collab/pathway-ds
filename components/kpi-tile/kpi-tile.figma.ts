// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40017320-247
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-tile.jsx
// component=KpiTile

import figma from "figma"

// Figma's Type axis is four LAYOUTS, and the only thing that varies in code is
// where the chart goes. "04 No Chart" is expressed by omitting the chart rather
// than by a layout value, so it maps to the same "bottom" the component falls
// back to when there is nothing to place beside the number.
//
// Note 01 and 03 are both named "Chart Right": they differ in the number's own
// size inside the tile, not in the layout, so both map to "right".
const layout = figma.selectedInstance.getEnum("Type", {
  "01 Chart Right": "right",
  "03 Chart Right": "right",
  "02 Chart Bottom": "bottom",
  "04 No Chart": "bottom",
})

// The filter control is a real prop, but it carries a LABEL rather than a
// boolean, so the snippet emits a placeholder the consumer replaces. Mapping
// the boolean straight to `filter` would emit `filter={true}`, which is not the
// prop's type.
const hasFilter = figma.selectedInstance.getEnum("With Filter Controls?", {
  Yes: "Period",
  No: undefined,
})

export default {
  id: "KpiTile",
  imports: [
    'import { KpiTile, Change } from "./kpi-tile.jsx";',
    'import { MiniChart } from "./mini-chart.jsx";',
  ],
  example: figma.code`<KpiTile
  eyebrow="Views per month"
  value="2,000"${figma.helpers.react.renderProp("layout", layout)}${figma.helpers.react.renderProp(
    "filter",
    hasFilter,
  )}
  change={<Change value="100%" direction="up" note="vs previous yr" />}
  chart={<MiniChart direction="up" />}
/>`,
}
