// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=1884-5171
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/button/button.jsx
// component=ButtonIcon

import figma from "figma"

// `Button Icon` 1884:5171, the icon-only button. 38 variants, unmapped until
// 2026-10-07, and nested inside TopNav.Search.
//
// IT IS THE SAME COMPONENT AS Button, with its label hidden. Figma's `Type`
// axis folds style and type together, so it maps onto TWO of Button's props:
//
//   Figma Type            Button props
//   Primary               buttonStyle="Fill"     type="Primary"
//   Secondary             buttonStyle="Fill"     type="Secondary"
//   Primary Outline       buttonStyle="Outlined" type="Primary"
//   Secondary Outline     buttonStyle="Outlined" type="Secondary"
//   Primary-Naked         buttonStyle="Naked"    type="Primary"
//   Secondary Naked       buttonStyle="Naked"    type="Secondary"
//
// `Size` is L | S and `State` is Base | Hover | Pressed | Focused, which is
// runtime. `showText={false}` is what makes it icon-only, and `ariaLabel` is
// then REQUIRED: an icon-only button with no accessible name has no name at
// all, which is why Button enforces it rather than defaulting it.
//
// MEASURED, and the measurement found Figma defects worth naming rather than
// reproducing. The box is 48x48 on every variant, which is the touch target.
// `Container.Icon` is 36x36 at Size=L and 24x24 at Size=S. But on every Size=S
// variant the nested glyph measures 1x1, and the three `Secondary Naked`
// variants measure frame 48 with a 36 glyph. Those are collapsed instances in
// the file, not a design: a 1px glyph is not a size and 36 is not the Size=S
// frame. The code follows L's proportions scaled to S rather than copying a
// collapsed instance.
//
// ON LIGHT AND MIDNIGHT: a snippet is code, not a render, so the mode toggle
// cannot change it. Every fill, stroke and foreground resolves through a
// MODE-AGNOSTIC token switched by a `data-theme` ancestor. Note that Primary
// and Negative labels take Foreground/Action/Primary/On Strong and NOT the mono
// anchor: mono measured 3.04:1 and 2.85:1 on those fills in Midnight.

const buttonStyle = figma.selectedInstance.getEnum("Type", {
  "Primary": "Fill",
  "Secondary": "Fill",
  "Primary Outline": "Outlined",
  "Secondary Outline": "Outlined",
  "Primary-Naked": "Naked",
  "Secondary Naked": "Naked",
})
const type = figma.selectedInstance.getEnum("Type", {
  "Primary": "Primary",
  "Secondary": "Secondary",
  "Primary Outline": "Primary",
  "Secondary Outline": "Secondary",
  "Primary-Naked": "Primary",
  "Secondary Naked": "Secondary",
})
const size = figma.selectedInstance.getEnum("Size", { L: "L", S: "S" })

export default {
  id: "ButtonIcon",
  imports: ['import { Button } from "./button.jsx";'],
  example: figma.code`{/* Icon-only is Button with showText false. ariaLabel is required:
    without it the button has no accessible name at all. */}
<Button${figma.helpers.react.renderProp("buttonStyle", buttonStyle)}${figma.helpers.react.renderProp("type", type)}${figma.helpers.react.renderProp("size", size)}
  showText={false}
  leadingIcon="search"
  ariaLabel="Search"
  onClick={() => {}}
/>`,
  metadata: { nestable: true },
}
