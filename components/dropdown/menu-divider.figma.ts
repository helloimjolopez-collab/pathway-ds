// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006377-69269
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/dropdown/dropdown.jsx
// component=MenuDivider

import figma from "figma"

// `Menu.Divider` 40006377:69269. A line on Stroke/Static/Neutral/Base with 6px
// above and below, measured 2026-10-08.
//
// It strokes with the BASE neutral, not the faint one. The first version of
// dropdown.jsx used Faint, which is the rung for a divider INSIDE a surface;
// a menu rule separates groups of actions and takes Base.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it. Every colour resolves through a MODE-AGNOSTIC
// token switched by a `data-theme` ancestor:
//   <div data-theme="midnight">  ...same markup, Midnight values...

export default {
  id: "MenuDivider",
  imports: ['import { DropdownDivider } from "./dropdown.jsx";'],
  example: figma.code`<DropdownDivider />`,
  metadata: { nestable: true },
}
