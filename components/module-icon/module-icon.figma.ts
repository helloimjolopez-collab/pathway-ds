// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006876-42134
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/module-icon/module-icon.jsx
// component=ModuleIcon

import figma from "figma"

// The twelve Amplify module marks. One component set, three variant axes:
// Module, Style and Color.

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

// The Color axis changed shape on 2026-10-01. What used to be a single `Full`
// value is now `Two Color` and `One Color`: same geometry, but One Color draws
// the whole mark in the module's base colour rather than base plus subtle, so
// it is its own variant and not a tint. `full` survives in the component as a
// deprecated alias for `two-color`, but it is NOT mapped here, because the
// Figma value no longer exists and mapping a dead name would produce snippets
// naming a prop value the design does not have.
const color = figma.selectedInstance.getEnum("Color", {
  "Two Color": "two-color",
  "One Color": "one-color",
  Mono: "mono",
})

// Style=Rippled is NOT mapped, deliberately.
//
// Rippled is a second, genuinely different artwork set, not a modifier: 7 to 10
// paths per module against Base's 1 to 8, and it exists in Two Color and Mono
// only. module-icon.jsx implements Style=Base, so a Rippled instance yields
// undefined here, renderProp omits the prop, and the snippet falls back to the
// Base artwork rather than naming a variant the code does not have. Tracked as
// a gap in the manifest.
//
// SIZE: the canvas moved from 24x24 to 16x16 on 2026-10-01 and every path
// coordinate is re-exported, not rescaled. The default size follows the canvas,
// so the snippet no longer passes size at all; a consumer who wants the old
// rendered size passes it explicitly.
export default {
  id: "ModuleIcon",
  imports: ['import { ModuleIcon } from "./module-icon.jsx";'],
  example: figma.code`<ModuleIcon${figma.helpers.react.renderProp(
    "module",
    module_,
  )}${figma.helpers.react.renderProp("color", color)}/>`,
}
