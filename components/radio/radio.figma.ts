// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40002974-83004
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/radio/radio.jsx
// component=Radio

import figma from "figma"

// Figma's Type axis is four values; in code it is two booleans, because
// Selected and Error Selected are the same selection in different validity.
// Mapping it to a four-value enum would make `checked` unreachable from a
// design and would mean a consumer could ask for a combination that is really
// two independent facts.
const type = figma.selectedInstance.getEnum("Type", {
  Selected: "checked",
  Unselected: "unchecked",
  "Error Selected": "error-checked",
  "Error Unselected": "error-unchecked",
})

const size = figma.selectedInstance.getEnum("Size", {
  Base: "base",
  Large: "large",
})

// Figma's State axis is NOT mapped, deliberately.
//
// Hover, Focused and Pressed are things the browser already knows, and
// Disabled is a prop. A snippet that pinned the state would produce a radio
// that never responds, which is the same mistake as emitting Card's
// forceState. The component derives all four and exposes forceState for the
// Storybook matrix only.
//
// Two Figma defects this mapping does not hide, both recorded in the manifest:
// Size=Large exists for Unselected only, five variants of a possible twenty,
// so a Large Selected instance cannot be made in Figma at all; and the label
// binds foreground-static-neutral-base in all twenty variants including
// Disabled, so a disabled radio's label does not dim there. The component
// renders Large for every combination and does dim the label.
const checked = type === "checked" || type === "error-checked"
const error = type === "error-checked" || type === "error-unchecked"

// A lone Radio is emitted here because that is what the Figma component is,
// but the import line names RadioGroup too: a radio needs a group for its
// name, its arrow keys and its single tab stop.
export default {
  id: "Radio",
  imports: ['import { Radio, RadioGroup } from "./radio.jsx";'],
  example: figma.code`<Radio value="general" name="fund"${
    checked ? " checked" : ""
  }${error ? " error" : ""}${figma.helpers.react.renderProp(
    "size",
    size,
  )} onChange={(v) => setValue(v)}>General fund</Radio>`,
}
