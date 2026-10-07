// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40017333-34481
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/widget/widget.jsx
// component=WidgetHeading

import figma from "figma"

// A BUILDING BLOCK: mapped because it is a Figma component, with no Storybook
// page because it only ever appears nested inside a Widget.
//
// The Figma component carries one property, the heading text. Everything else
// about it, the 44px height, the gap of 2, the per-size padding and the three
// action icons, is structure rather than a prop and lives in widget.jsx.
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
const title = figma.selectedInstance.getString("Heading")

export default {
  id: "WidgetHeading",
  imports: ['import { WidgetHeading } from "./widget.jsx";'],
  example: figma.code`<WidgetHeading${figma.helpers.react.renderProp("title", title)}
  size="detail"
  actions={[
    { name: "refresh", label: "Refresh", onClick: () => {} },
    { name: "open_in_full", label: "Open the full view", onClick: () => {} },
    { name: "more_vert", label: "More actions", onClick: () => {} },
  ]}
/>`,
}
