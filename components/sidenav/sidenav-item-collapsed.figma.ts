// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40005607-25240
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=SideNavItem

import figma from "figma"

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
