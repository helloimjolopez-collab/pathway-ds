// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40011003-15892
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/badge/badge.jsx
// component=Badge

import figma from "figma"

// NODE CHOICE: 40011003:15892 is the clean 96-variant Badge inside SECTION
// "Amplify". The page carries four OTHER 63-variant sets that still report
// variant conflicts, plus the other brand's mirror, so the node id is the only
// thing that picks the right one. The other brand is not named here: Storybook
// publishes components/ to public GitHub Pages, so this file is served.

// Accent 2 is Jade and Accent 3 is Mauve, which is what those variants bind.
// The props are named for the colour rather than the number, because a number
// that only means "the next accent we added" tells a consumer nothing. There is
// no Accent 1: Info already resolves to the Amethyst ramp.
const status = figma.selectedInstance.getEnum("Status", {
  Neutral: "neutral",
  Info: "info",
  Positive: "positive",
  Attention: "attention",
  Negative: "negative",
  Severe: "severe",
  "Accent 2": "jade",
  "Accent 3": "mauve",
})

const size = figma.selectedInstance.getEnum("Size", {
  Small: "small",
  Medium: "medium",
  Large: "large",
})

// NAKED IS MAPPED, BUT THE COMPONENT RENDERS IT DIFFERENTLY FROM FIGMA.
//
// Across Figma's eight Naked variants there is a fill on five, a border on
// three, four different text colours, and one raw primitive (Mauve/25) where a
// semantic belongs. Five of the eight lose their status colour entirely. By
// name, and by the Button precedent where Naked is the quietest style, Naked
// means no fill and no border carrying only the status foreground, and that is
// what the component renders for all eight.
//
// The enum still maps it, because a Naked instance in a design is asking for
// the quiet badge and the snippet should say so. The divergence is recorded in
// the manifest and shown side by side in the Storybook story, rather than
// silently reproduced here.
const badgeStyle = figma.selectedInstance.getEnum("Style", {
  "Outline & Fill": "outline-fill",
  Fill: "fill",
  Outline: "outline",
  Naked: "naked",
})

const label = figma.selectedInstance.getString("Label")
const showLeading = figma.selectedInstance.getBoolean("Show Leading Icon")
const showTrailing = figma.selectedInstance.getBoolean("Show Trailing Icon")

// Show Label is not emitted as a boolean: a badge with no label is a dot, and
// omitting the children is how you get one.
export default {
  id: "Badge",
  imports: ['import { Badge } from "./badge.jsx";'],
  example: figma.code`<Badge${figma.helpers.react.renderProp(
    "status",
    status,
  )}${figma.helpers.react.renderProp("size", size)}${figma.helpers.react.renderProp(
    "badgeStyle",
    badgeStyle,
  )}${showLeading ? " leadingIcon={<Icon name=\"circle\" />}" : ""}${
    showTrailing ? " trailingIcon={<Icon name=\"close\" />}" : ""
  }>${label || "Label"}</Badge>`,
}
