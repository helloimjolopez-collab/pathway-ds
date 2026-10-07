// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009415-28112
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-number-trend.jsx
// component=Change

import figma from "figma"

// Trend picks the ARROW. It does not pick the colour, and that separation is
// the point of the component: `favourable` does. A rising figure is good for
// income and bad for expenses, so collapsing the two would paint rising costs
// green. Trend therefore maps to `direction` only, and `favourable` is left for
// the consumer to state.
const direction = figma.selectedInstance.getEnum("Trend", {
  Positive: "up",
  Negative: "down",
})

// Figma's Type axis is which glyph is used. 01 is the arrows, 02 is `moving`.
// 03 and 04 exist on the axis and are not distinguishable in the read, so they
// fall back to the arrows rather than guessing at a third glyph.
const glyphType = figma.selectedInstance.getEnum("Type", {
  "01": "arrow",
  "02": "moving",
  "03": "arrow",
  "04": "arrow",
})

export default {
  id: "Change",
  imports: ['import { Change } from "./kpi-number-trend.jsx";'],
  example: figma.code`<Change
  value="100%"${figma.helpers.react.renderProp("direction", direction)}${figma.helpers.react.renderProp(
    "glyphType",
    glyphType,
  )}
  {/* favourable defaults to up-is-good; set it false for costs. */}
  note="vs previous yr"
/>`,
}
