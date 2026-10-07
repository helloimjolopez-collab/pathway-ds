// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006876-42134
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/module-icon/module-icon.jsx
// component=ModuleIcon

import figma from "figma"

// The twelve Amplify module marks. One component set, three variant axes:
// Module, Style and Color.
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

// Figma's Style axis maps onto the prop `treatment`, NOT `style`.
//
// `style` is already the CSS style object on every React component and cannot
// be taken, so the component renames the axis rather than shadowing a DOM prop.
// Both treatments now have artwork: Base is 1 to 8 paths per module, Rippled is
// 1 to 10, and they are genuinely different geometry rather than a modifier.
//
// Rippled exists in Two Color and Mono only, with no One Color. Asking the
// component for rippled plus one-color gets Two Color back rather than a flat
// Rippled the design does not define, so no Figma instance can produce a
// snippet the component would render differently.
const treatment = figma.selectedInstance.getEnum("Style", {
  Base: "base",
  Rippled: "rippled",
})

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
  )}${figma.helpers.react.renderProp(
    "color",
    color,
  )}${figma.helpers.react.renderProp("treatment", treatment)}/>`,
}
