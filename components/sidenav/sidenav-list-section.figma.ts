// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40007332-8034
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=SideNavListSection

import figma from "figma"

export default {
  id: "SideNavListSection",
  imports: ['import { SideNavListSection } from "./sidenav.jsx";'],
  example: figma.code`<SideNavListSection label="Recent" items={[{ id: "first-timers", label: "First timers" }]} activeId="first-timers" onNavigate={(id) => console.log(id)}/>`,
}
