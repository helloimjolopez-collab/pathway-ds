// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40005568-4207
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/dropdown/dropdown.jsx
// component=PopoverMenu

import figma from "figma"

// PATHWAY ALREADY HAD THIS AND NOTHING HAD EVER IMPLEMENTED IT, which is the
// point of this mapping. The `↳ ❇️ Menu` page carries a complete Pathway menu:
//
//   PopoverMenu              40005568:4207   the panel
//   PopoverMenu.Item         40005568:4191   3 variants on State
//   PopoverMenu.SectionLabel 40005748:20503
//   Menu.Divider             40006377:69269
//
// Meanwhile `dashboard.jsx` grew a private `WidgetMenu`, the KPI Tiles nested a
// FOREIGN `Dropdown` 40003188:9930 eighteen times for its `Open=True` half, and
// the first version of dropdown.jsx invented a third panel. Three
// implementations of a component the design system already owned.
//
// MEASURED 2026-10-08: the panel is 212 wide, VERTICAL, pad 8, r=8, on
// Fill/Surface/Elevated with Stroke/Static/Neutral/Base and a 0 4 16 -2 shadow
// at a0.08. Its inner Menu slot is VERTICAL, gap 8, pad 6.
//
// ONE GAP: that shadow has no exact Pathway token. --elevation-sheet is
// 0 4 32 -8, the same offset with a softer blur, and is the nearest that
// exists. Used rather than inventing one.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it. Every colour resolves through a MODE-AGNOSTIC
// token switched by a `data-theme` ancestor:
//   <div data-theme="midnight">  ...same markup, Midnight values...

export default {
  id: "PopoverMenu",
  imports: ['import { Dropdown, DropdownItem, DropdownDivider } from "./dropdown.jsx";'],
  example: figma.code`{/* The panel is not placed by hand: a Dropdown owns its trigger and
    its menu together, so the two cannot drift apart and Escape, click-outside
    and aria-expanded are wired once. */}
<Dropdown type="icon" label="More actions">
  <DropdownItem label="Open the full view" onSelect={() => {}} />
  <DropdownDivider />
  <DropdownItem label="Remove" danger onSelect={() => {}} />
</Dropdown>`,
  metadata: { nestable: true },
}
