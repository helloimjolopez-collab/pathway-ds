// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006794-19891
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/icon/action-icon.jsx
// component=ActionIcon

import figma from "figma"

// ICONS HAD NO CODE TO POINT AT until 2026-10-07, and this is one of the three
// files that fixes it. `Action Icon` is nested 30 times inside the Widget set
// and twice inside KPI Tiles, so it was the most-used unmapped component in
// the system.
//
// A PATHWAY ICON IS A FONT, NOT A FILE. There is no per-icon asset to import.
// Material Symbols Rounded is one variable font, and an icon is its NAME
// written as text inside an element carrying that font:
//
//   font        Material Symbols Rounded (Google Fonts)
//   stylesheet  https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded
//                 :opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
//   names       https://fonts.google.com/icons  (set Style = Rounded)
//   source      https://github.com/google/material-design-icons
//
// So Figma's `Icon` INSTANCE_SWAP becomes the `name` string, and nothing is
// imported per icon.
//
// MEASURED per Size on 2026-10-07: Small 36x36 box / 24 state layer / 12 glyph,
// Base 44 / 28 / 14, Large 48 / 32 / 16. `State` is runtime, not a prop.
//
// ON LIGHT AND MIDNIGHT. This snippet is code, not a render, so it cannot
// change when you flip the mode in Figma. What makes it respond at runtime is
// that every colour it resolves is a MODE-AGNOSTIC token name, switched by a
// `data-theme` ancestor rather than by a different token:
//
//   <div data-theme="midnight">   ...the same markup, Midnight values...
//
// Nothing on the component itself names a mode. See src/tokens/themes/.

const size = figma.selectedInstance.getEnum("Size", {
  Small: "Small",
  Base: "Base",
  Large: "Large",
})

export default {
  id: "ActionIcon",
  imports: ['import { ActionIcon } from "./action-icon.jsx";'],
  example: figma.code`<ActionIcon
  name="more_vert"${figma.helpers.react.renderProp("size", size)}
  label="More actions"
  onClick={() => {}}
/>`,
  metadata: { nestable: true },
}
