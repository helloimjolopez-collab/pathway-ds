// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40005568-4191
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/dropdown/dropdown.jsx
// component=PopoverMenuItem

import figma from "figma"

// `PopoverMenu.Item` 40005568:4191, three variants on State: Base | Hover |
// Active. State is RUNTIME, so it is not a prop.
//
// MEASURED 2026-10-08: 200x40, HORIZONTAL, pad 6,14,6,14, r=8, label fs 14.
// Its Label Wrapper is gap 4 with an 8px inset, and Container.LeadingIcon is a
// 20 box holding a 14 glyph.
//
// THE LABEL IS AN ACTION FOREGROUND, NOT A STATIC ONE, and that is the detail
// worth carrying: State=Base takes Foreground/Action/Secondary/Rest and
// State=Hover moves it to /Hover, while the fill moves from
// Fill/Surface/Elevated to Fill/Action/SELECTION/Hover. Selection, not
// Secondary: a menu row is a selection surface. A static foreground here would
// leave the label unchanged while the row lit up.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it. Every colour resolves through a MODE-AGNOSTIC
// token switched by a `data-theme` ancestor:
//   <div data-theme="midnight">  ...same markup, Midnight values...

const icon = figma.selectedInstance.getBoolean("Show Leading Icon")
const label = figma.selectedInstance.getString("Popover Menu Label")

export default {
  id: "PopoverMenuItem",
  imports: ['import { DropdownItem } from "./dropdown.jsx";'],
  example: figma.code`<DropdownItem${figma.helpers.react.renderProp("label", label)}${icon ? ' icon="settings"' : ""}
  onSelect={() => {}}
/>`,
  metadata: { nestable: true },
}
