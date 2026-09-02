// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40004059-1375
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=SideNav

import figma from "figma"

const collapsed = figma.selectedInstance.getEnum("Mode", {
  Base: false,
  Stroked: false,
  "Mobile.Base": false,
  "Mobile.Stroked": false,
  Collapsed: true,
  "Collapsed.Stroked": true,
})

export default {
  id: "SideNav",
  imports: ['import { SideNav } from "./sidenav.jsx";'],
  example: figma.code`<SideNav${figma.helpers.react.renderProp(
    "collapsed",
    collapsed,
  )} activeId="giving-overview" onNavigate={(id) => console.log(id)} sections={[
        {
            section: "Giving",
            items: [
                { id: "giving-overview", label: "Overview", icon: "dashboard" },
                {
                    id: "giving-donations",
                    label: "Donations",
                    icon: "volunteer_activism",
                    children: [
                        { id: "giving-batches", label: "Batches" },
                        { id: "giving-pledges", label: "Pledges" },
                    ],
                },
                {
                    id: "giving-archive",
                    label: "Archive",
                    icon: "inventory_2",
                    disabled: true,
                },
            ],
        },
    ]}/>`,
  metadata: { nestable: true },
}
