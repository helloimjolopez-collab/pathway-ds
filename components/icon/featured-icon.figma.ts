// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40017444-140408
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/icon/featured-icon.jsx
// component=FeaturedIcon

import figma from "figma"

// A PATHWAY COMPONENT THAT REPLACES A FOREIGN ONE. The KPI Tiles set nested
// `Featured icon` 40003806:3550 ten times: a remote third-party component,
// eighty-four variants, none of it ours and none of it mappable from this repo,
// because a Code Connect mapping publishes into the file that OWNS the
// component. A tenth of what that tile is made of was unreachable.
//
// `FeaturedIcon` 40017444:140408 was built in the Pathway file on 2026-10-08
// and this maps to it. Sixteen variants:
//
//   Type    Outline | Modern
//   Size    lg 48 with a 24 glyph | md 40 with a 20
//   Color   the seven tone groups, on Outline only
//
// EVERY COLOUR WAS ALREADY A PATHWAY COLOUR, which is the finding that made
// this safe. All seven raw hexes in the four variants the KPI Tile used match
// an existing semantic token EXACTLY, distance 0 in RGB: #dff6e2 is
// Fill/Static/Positive/Subtle, #dcd9ef is Fill/Static/Info/Subtle, #e6e2dc is
// Stroke/Static/Neutral/Base, and so on. So this is the same drawing on the
// tokens it was already the colour of, not a redesign.
//
// TWO DELIBERATE DEPARTURES, both recorded in the spec:
//   - The Positive glyph takes On Subtle rather than the On Strong the foreign
//     component used. On Strong is the foreground for a SOLID fill and this
//     glyph sits on a Subtle one, so the exact-hex match would have been a
//     pairing violation. 11.94:1 against 15.4:1, both AAA.
//   - Modern's shadow uses --elevation-widget, the nearest Pathway token to
//     Figma's 0 1 2. Its two inner shadows are dropped: an Untitled UI
//     flourish, not a Pathway treatment.
//
// Type=Modern is NOT tone-coloured, so it exists only at Color=Neutral rather
// than as seven identical variants.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it. Every colour resolves through a MODE-AGNOSTIC
// token switched by a `data-theme` ancestor:
//   <div data-theme="midnight">  ...same markup, Midnight values...

const type = figma.selectedInstance.getEnum("Type", { Outline: "outline", Modern: "modern" })
const size = figma.selectedInstance.getEnum("Size", { lg: "lg", md: "md" })
const color = figma.selectedInstance.getEnum("Color", {
  Accent: "Accent", Positive: "Positive", Negative: "Negative", Danger: "Danger",
  Alert: "Alert", Neutral: "Neutral", Info: "Info",
})

export default {
  id: "FeaturedIcon",
  imports: ['import { FeaturedIcon } from "./featured-icon.jsx";'],
  example: figma.code`<FeaturedIcon
  name="trending_up"${figma.helpers.react.renderProp("size", size)}${figma.helpers.react.renderProp("type", type)}${figma.helpers.react.renderProp("color", color)}
/>`,
  metadata: { nestable: true },
}
