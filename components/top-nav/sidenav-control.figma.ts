// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40007082-7703
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/icon/action-icon.jsx
// component=SideNavControl

import figma from "figma"

// The TopNav's control for opening the SideNav on mobile. Nested once inside
// TopNav.Global and unmapped until 2026-10-07.
//
// Set 40007082:7703, three variants on State: Base | Hover | Pressed. Walking
// the Base variant shows it is NOT its own drawing: it is one `Action Icon` at
// Size=Large holding the `menu` glyph. So 48x48 target, a 32x32 state layer and
// a 16px glyph.
//
// A DEFECT THIS MAPPING FOUND. top-nav.jsx drew this as a hand-rolled button
// with a 22px glyph and NO state layer: 6px too large, with nothing to hover
// and no pressed state at all, against a design that has three. It now renders
// the shared ActionIcon, so all three states come from the component the design
// actually nests. Fixed 2026-10-07.
//
// ON LIGHT AND MIDNIGHT: a snippet is code, not a render, so the mode toggle
// cannot change it. The `color` here is the TopNav's own Ghost foreground,
// which is near-white in BOTH modes by design, because the bar is an on-brand
// surface. Everything else resolves through a `data-theme` ancestor.

export default {
  id: "SideNavControl",
  imports: ['import { ActionIcon } from "../icon/action-icon.jsx";'],
  example: figma.code`{/* Figma's SideNav.Control is an Action Icon at Size=Large, not its
    own drawing, so there is no separate component: 48 target, 32 layer, 16 glyph. */}
<ActionIcon
  name="menu"
  size="Large"
  label="Open navigation menu"
  onClick={onSideNavToggle}
/>`,
  metadata: { nestable: true },
}
