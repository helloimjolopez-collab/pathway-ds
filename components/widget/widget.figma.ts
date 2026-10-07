// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009622-39702
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/widget/widget.jsx
// component=Widget

import figma from "figma"

// Size is the only axis that describes the CONTAINER, so it is the only one
// mapped to a prop. Figma's three values are the three in SIZES.
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
const size = figma.selectedInstance.getEnum("Size", {
  Glance: "glance",
  Detail: "detail",
  Explore: "explore",
})

// CONFIGURATION IS DELIBERATELY UNMAPPED, and it is not an oversight.
//
// Read on 2026-10-07: Configuration does not change the widget at all. Every
// variant has the identical container and differs only in the variant of the
// nested `KPI Number & Trend` instance:
//
//   Configuration=01  KPI Type=01 Chart Right, filters No
//   Configuration=02  KPI Type=02 Chart Bottom, filters Yes
//   Configuration=03  identical to 01
//   Configuration=04  identical to 01
//
// In code that content is `children`, so the axis has no prop to map to: a
// consumer picks a configuration by choosing what to put inside. Mapping it
// would emit a prop widget.jsx does not have.
//
// Worth a look in the file: three of the four options currently render
// identically, so the axis offers choices that make no difference.

export default {
  id: "Widget",
  imports: ['import { Widget } from "./widget.jsx";'],
  example: figma.code`<Widget title="Widget title"${figma.helpers.react.renderProp(
    "size",
    size,
  )} onInfo={() => {}} onGoTo={() => {}} onRefresh={() => {}} onMenu={() => {}}>
  {/* Configuration is content: a KPI tile, a chart, a table. */}
</Widget>`,
}
