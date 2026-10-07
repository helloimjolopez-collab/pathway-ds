// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40005607-25240
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=SideNavItem

import figma from "figma"
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

const isActive = figma.selectedInstance.getEnum("State", {
  Rest: false,
  Hover: false,
  Active: true,
  Trail: false,
})
const isTrail = figma.selectedInstance.getEnum("State", {
  Rest: false,
  Hover: false,
  Active: false,
  Trail: true,
})

export default {
  id: "SideNavItem",
  imports: ['import { SideNavItem } from "./sidenav.jsx";'],
  example: figma.code`<SideNavItem item={{
        id: "giving",
        label: "Giving",
        icon: "volunteer_activism",
        children: [{ id: "batches", label: "Batches" }],
    }} isChild={false}${figma.helpers.react.renderProp(
      "isActive",
      isActive,
    )}${figma.helpers.react.renderProp(
    "isTrail",
    isTrail,
  )} isExpanded={false} isSidebarCollapsed={true} onClick={(id) => console.log(id)} onToggle={(id) => console.log(id)}/>`,
  metadata: { nestable: true },
}
