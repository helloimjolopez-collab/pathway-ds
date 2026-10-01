// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40004024-31157
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/heading/heading.jsx
// component=Heading

import figma from "figma"

// This maps `Heading.Style` (40004024:31157), the APPEARANCE set.
//
// The sibling `Heading` set (40004143:1824) carries Level H1 to H6 and all six
// variants render identically at 24/30 Bold, so it carries no appearance at
// all. It is deliberately NOT mapped: a snippet from it could only ever say
// level={n} with no style, which is less useful than nothing. The component
// takes `level` for the tag and the three axes below for the look, and they do
// not imply each other.
//
// Only 27 of the 72 Context x Size x Weight combinations exist in Figma, so
// every enum value below is one the file actually draws.

const context = figma.selectedInstance.getEnum("Context", {
  Display: "display",
  Page: "page",
  Section: "section",
  Local: "local",
})

const size = figma.selectedInstance.getEnum("Size", {
  XL: "xl",
  L: "l",
  Base: "base",
  Small: "small",
  XSmall: "xsmall",
  XXS: "xxs",
})

// A DEFECT THIS MAPPING PRESERVES RATHER THAN HIDES.
//
// Three Figma variants have their Weight label inverted against what they
// render: Section/XSmall/Medium renders SemiBold, Section/XSmall/Semibold
// renders Medium, and Section/XXS/Medium renders SemiBold.
//
// The enum maps the LABEL, because the label is the contract the name makes:
// weight="medium" has to give 500. So the snippet for those three says what
// the designer asked for, and the component renders what the name promises,
// which is a visible difference from Figma until the file is corrected.
// Recorded in the manifest rather than papered over here.
const weight = figma.selectedInstance.getEnum("Weight", {
  Bold: "bold",
  Semibold: "semibold",
  Medium: "medium",
})

// `level` is NOT emitted from this set, because Heading.Style says nothing
// about the document outline. A consumer picks it, and 2 is the safe default
// for a heading dropped into an existing page.
export default {
  id: "Heading",
  imports: ['import { Heading } from "./heading.jsx";'],
  example: figma.code`<Heading level={2}${figma.helpers.react.renderProp(
    "context",
    context,
  )}${figma.helpers.react.renderProp("size", size)}${figma.helpers.react.renderProp(
    "weight",
    weight,
  )}>Giving overview</Heading>`,
}
