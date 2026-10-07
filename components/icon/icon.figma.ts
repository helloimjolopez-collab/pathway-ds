// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=48-1153
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/icon/icon.jsx
// component=Icon

import figma from "figma"

// THE ICON PRIMITIVE. Mapped to the Iconography page rather than to a single
// glyph component, because there is no per-glyph code to map: every icon in
// Pathway is the same component with a different name.
//
// WHAT AN ICON IS, since Code Connect listed every icon component in this file
// with no path and no link:
//
//   font        Material Symbols Rounded, ONE variable font for every glyph
//   stylesheet  https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded
//                 :opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
//   catalogue   https://fonts.google.com/icons   (set Style = Rounded)
//   source      https://github.com/google/material-design-icons
//   web symbols https://github.com/google/material-design-icons/tree/master/symbols/web
//   one icon    <span class="material-symbols-rounded">arrow_forward</span>
//
// The name you write is the folder name in that repo and the name in that
// catalogue. Nothing is fetched per icon; the font carries all of them.
//
// THE AXES are variable-font axes: FILL 0 outlined / 1 solid, READ FROM FIGMA
// per component and never assumed; wght 400 and GRAD 0 everywhere in Pathway;
// opsz matched to the font size, because an icon rendered at 16 with opsz 20
// draws visibly too light.
//
// SIZE IS THE FRAME, NEVER THE VECTOR. Figma nests a wrapper (24), an icon
// frame (16) and the drawn vector (~12). `size` is the FRAME. Passing the
// vector's ~12 ships an icon a third too small.
//
// ON LIGHT AND MIDNIGHT: an Icon takes no colour of its own by default, it
// INHERITS, so it follows whatever text it sits beside and switches with the
// mode for free. Pass `color` only with a semantic token's var(), never a hex.

export default {
  id: "Icon",
  imports: ['import { Icon } from "./icon.jsx";'],
  example: figma.code`{/* One variable font, Material Symbols Rounded. The name is
    the glyph: browse them at https://fonts.google.com/icons with Style=Rounded.
    size is the FRAME (16 = Figma's 16), not the drawn vector (~12). */}
<Icon name="arrow_forward" size="M" fill={0} />`,
  metadata: { nestable: true },
}
