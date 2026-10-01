// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006876-42134
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/module-icon/module-icon.jsx
// component=ModuleIcon

import figma from "figma"

// Module.Icon is the cleanest set in the file to map: one variant axis per prop,
// no axis doing two jobs. Module -> module, Color -> color. Figma's labels are
// title case and the prop takes the kebab id, so the map does that conversion
// rather than the caller.
const module_ = figma.selectedInstance.getEnum("Module", {
  People: "people",
  Giving: "giving",
  "Service Planning": "service-planning",
  Streaming: "streaming",
  Safety: "safety",
  Mobile: "mobile",
  Accounting: "accounting",
  Communications: "communications",
  Home: "home",
  Websites: "websites",
  Media: "media",
  Equip: "equip",
})

const color = figma.selectedInstance.getEnum("Color", {
  Full: "full",
  Mono: "mono",
})

// Style=Rippled is NOT mapped. module-icon.jsx implements Style=Base only, so a
// Rippled instance yields undefined here, renderProp omits the prop, and the
// snippet falls back to the Base artwork rather than naming a variant the code
// does not have. Listed as a gap in module-icon-spec.md section 17.
export default {
  id: "ModuleIcon",
  imports: ['import { ModuleIcon } from "./module-icon.jsx";'],
  example: figma.code`<ModuleIcon${figma.helpers.react.renderProp(
    "module",
    module_,
  )}${figma.helpers.react.renderProp("color", color)} size={24}/>`,
}
