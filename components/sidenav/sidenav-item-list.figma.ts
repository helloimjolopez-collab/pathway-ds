// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40007332-6995
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=SideNavListSection

import figma from "figma"

const activeId = figma.selectedInstance.getEnum("State", {
  Rest: undefined,
  Hover: undefined,
  Active: "first-timers",
})

export default {
  id: "SideNavListSection",
  imports: ['import { SideNavListSection } from "./sidenav.jsx";'],
  example: figma.code`<SideNavListSection label="Recent" items={[
        { id: "first-timers", label: "First timers" },
        { id: "volunteers", label: "Volunteers" },
    ]}${figma.helpers.react.renderProp(
      "activeId",
      activeId,
    )} onNavigate={(id) => console.log(id)}/>`,
  metadata: { nestable: true },
}
