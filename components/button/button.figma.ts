// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40003293-93741
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/button/button.jsx
// component=Button

import figma from "figma"

// The PW_Button set has 258 variants across four axes, and three of those axes
// carry a stray value that belongs to a different axis: Style has "PW_Button",
// Size has "Naked", Type has "XS", State has "Primary". Those are left UNMAPPED
// on purpose. An unmapped enum value yields undefined, renderProp then omits the
// prop, and the snippet falls back to the component's own default rather than
// emitting a prop value that does not exist in button.jsx. Cleaning them up is a
// Figma-side fix; see the note in button-spec.md.
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
const buttonStyle = figma.selectedInstance.getEnum("Style", {
  Fill: "Fill",
  Outlined: "Outlined",
  Naked: "Naked",
})

const size = figma.selectedInstance.getEnum("Size", {
  L: "L",
  M: "M",
  S: "S",
  XS: "XS",
})

const type = figma.selectedInstance.getEnum("Type", {
  Primary: "Primary",
  Secondary: "Secondary",
  Tertiary: "Tertiary",
  Negative: "Negative",
})

// State is a RUNTIME concern, not a prop, so Hover/Focused/Pressed/Active map to
// nothing. Only Disabled and Loading are real props on the React component, and
// each gets its own boolean so a Disabled variant does not also read as loading.
const disabled = figma.selectedInstance.getEnum("State", {
  Active: false,
  Hover: false,
  Focused: false,
  Pressed: false,
  Loading: false,
  Disabled: true,
})

const loading = figma.selectedInstance.getEnum("State", {
  Active: false,
  Hover: false,
  Focused: false,
  Pressed: false,
  Disabled: false,
  Loading: true,
})

const text = figma.selectedInstance.getString("✏️ Text")
const showText = figma.selectedInstance.getBoolean("Show Text")
const showLeadingIcon = figma.selectedInstance.getBoolean("👈🏼 Show Leading Icon")
const showTrailingIcon = figma.selectedInstance.getBoolean("👉🏼 Show Trailing Icon")

// The LeadingIcon / TrailingIcon instance swaps are deliberately not mapped.
// button.jsx takes a Material Symbols LIGATURE STRING, while an instance swap
// hands back a component reference, and there is no reliable way to derive the
// ligature from it. Mapping it would emit a plausible-looking icon name that is
// not the one on the canvas. Set leadingIcon / trailingIcon by hand.
export default {
  id: "Button",
  imports: ['import { Button } from "./button.jsx";'],
  example: figma.code`<Button${figma.helpers.react.renderProp(
    "buttonStyle",
    buttonStyle,
  )}${figma.helpers.react.renderProp("size", size)}${figma.helpers.react.renderProp(
    "type",
    type,
  )}${figma.helpers.react.renderProp("text", text)}${figma.helpers.react.renderProp(
    "showText",
    showText,
  )}${figma.helpers.react.renderProp(
    "showLeadingIcon",
    showLeadingIcon,
  )}${figma.helpers.react.renderProp(
    "showTrailingIcon",
    showTrailingIcon,
  )}${figma.helpers.react.renderProp(
    "disabled",
    disabled,
  )}${figma.helpers.react.renderProp("loading", loading)} onClick={() => {}}/>`,
}
