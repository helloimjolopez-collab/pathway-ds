// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006794-5975
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=SectionLabel

import figma from "figma"

const label = figma.selectedInstance.getString("Label")

export default {
  id: "SectionLabel",
  imports: ['import { SectionLabel } from "./sidenav.jsx";'],
  example: figma.code`<SectionLabel${figma.helpers.react.renderProp(
    "label",
    label,
  )}/>`,
  metadata: { nestable: true },
}
