// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40017333-37612
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-number-trend.jsx
// component=KpiNumber

import figma from "figma"

// A BUILDING BLOCK: mapped, no Storybook page. It appears only inside a
// KPI Number & Trend, which itself appears only inside a KPI Tile or a Widget.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it, and nothing is wrong when it does not. What
// responds at runtime is that every colour resolves through a MODE-AGNOSTIC
// token name, switched by a `data-theme` ancestor rather than by a different
// token:
//
//   <div data-theme="midnight">  ...the same markup, Midnight values...
//
// No component names a mode. `--semantic-color-light-mode-*` is the retired
// form and resolves to nothing. See src/tokens/themes/.

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
