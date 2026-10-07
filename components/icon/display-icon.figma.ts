// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006522-26547
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/icon/display-icon.jsx
// component=DisplayIcon

import figma from "figma"

// MEASURED 2026-10-07 off set 40006522:26547, 21 variants on Size x Color plus
// an INSTANCE_SWAP for the glyph:
//
//   Small 24x24 / glyph 12,  Medium 32x32 / 16,  Large 40x40 / 20
//   Color  Accent | Positive | Negative | Danger | Neutral | Info | Alert
//
// THE COLOUR AXIS MAPS ONTO MEANING-NAMED TONES, never hue names. `Danger` and
// `Negative` are both in the axis and are different tones: Negative is Red,
// Severe is Orange, so Danger takes Severe. Each tone draws its SUBTLE fill
// with its ON SUBTLE foreground, the pairing the token set guarantees.
//
// ONE MEASURED FIGMA GAP, recorded rather than papered over: the variant binds
// no fill and the nested glyph's fill is unbound, so the Color axis has NO
// token behind it in the file. The mapping in display-icon.jsx is this repo's,
// derived from the tone names. The Figma side needs binding before the two can
// be said to agree.
//
// The glyph is a Material Symbols ligature; see icon.figma.ts for the font.
// Mode switching comes from a `data-theme` ancestor, not from these names.
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

const size = figma.selectedInstance.getEnum("Size", {
  Small: "Small", Medium: "Medium", Large: "Large",
})
const color = figma.selectedInstance.getEnum("Color", {
  Accent: "Accent", Positive: "Positive", Negative: "Negative",
  Danger: "Danger", Neutral: "Neutral", Info: "Info", Alert: "Alert",
})

export default {
  id: "DisplayIcon",
  imports: ['import { DisplayIcon } from "./display-icon.jsx";'],
  example: figma.code`<DisplayIcon
  name="info"${figma.helpers.react.renderProp("size", size)}${figma.helpers.react.renderProp("color", color)}
/>`,
  metadata: { nestable: true },
}
