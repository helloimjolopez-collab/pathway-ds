// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006793-3783
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=CollapseButton

import figma from "figma"

// The SideNav's expand and collapse control. Nested six times inside
// SideNav.Container and unmapped until 2026-10-07, despite being the single
// most argued-over node in this system.
//
// Set 40006793:3783, two variants on `Type`: Collapsed | Expanded. Also carries
// `Slot.RowStart`, `Slot.RowEnd`, `Show RowEnd`, `Show Slot.RowStart` and a
// `HeaderIcon` INSTANCE_SWAP, which are the header's composition rather than
// this control's own API.
//
// HISTORY WORTH KNOWING BEFORE CHANGING THIS. The icon on this node was changed
// in Figma after the repo pulled it on 2026-05-12, and that change was rejected
// for the repo, Storybook and `<pathway-sidenav>`. From 2026-09-07 to
// 2026-09-17 SideNav was formally exempt from Figma overrides for that reason.
// The exemption was lifted; the judgement behind it was not. Read CLAUDE.md
// §1.1 before re-pulling this node.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it. What responds at runtime is that every colour
// resolves through a MODE-AGNOSTIC token name, switched by a `data-theme`
// ancestor rather than by a different token:
//
//   <div data-theme="midnight">  ...same markup, Midnight values...
//
// No component names a mode. See src/tokens/themes/light.css and midnight.css.

const type = figma.selectedInstance.getEnum("Type", {
  Collapsed: true,
  Expanded: false,
})

export default {
  id: "CollapseButton",
  imports: ['import { CollapseButton } from "./sidenav.jsx";'],
  example: figma.code`<CollapseButton${figma.helpers.react.renderProp("isSidebarCollapsed", type)}
  onToggle={() => {}}
/>`,
  metadata: { nestable: true },
}
