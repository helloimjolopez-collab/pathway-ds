// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40003954-284
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=SideNavItem

import figma from "figma"

const isChild = figma.selectedInstance.getEnum("NestingLevel", {
  "0": false,
  "1": true,
})
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
  example: figma.code`<SideNavItem item={{ id: "donations", label: "Donations", icon: "volunteer_activism" }}${figma.helpers.react.renderProp(
    "isChild",
    isChild,
  )}${figma.helpers.react.renderProp(
    "isActive",
    isActive,
  )}${figma.helpers.react.renderProp(
    "isTrail",
    isTrail,
  )} isExpanded={false} isSidebarCollapsed={false} onClick={(id) => console.log(id)} onToggle={(id) => console.log(id)}/>`,
  metadata: { nestable: true },
}
