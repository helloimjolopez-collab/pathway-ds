// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40002324-54532
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/checkbox/checkbox.jsx
// component=Checkbox

import figma from "figma"

// PW_Checkbox has 62 variants over three axes, and the Type axis is doing the
// work of FIVE separate booleans in checkbox.jsx: checked, indeterminate,
// error, highlight and secondary. So Type is read five times, once per boolean,
// and every Type value is listed in every map. Leaving a value out would yield
// undefined, renderProp would omit the prop, and the snippet would silently
// fall back to the component default instead of saying false.
//
// Two Type values also bake a STATE into the Type axis: "Highlight Hovered" and
// "Hhighlight Focused" (Figma's typo, matched verbatim because that string IS
// the variant value). Those are mapped as highlight=true, and their hover and
// focus aspects are dropped on purpose: hover and focus are runtime states in
// the React component, not props, exactly as with Button's State axis.
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
const ALL_TYPES = [
  "Unselected",
  "Selected",
  "Indeterminate",
  "Error Unselected",
  "Error Selected",
  "Error Indeterminate",
  "Highlight Unselected",
  "Highlight Hovered",
  "Hhighlight Focused",
  "Secondary Indeterminate",
] as const

/** Build a full Type map, true for the named values and false for every other. */
const typeFlag = (truthy: readonly string[]) =>
  Object.fromEntries(ALL_TYPES.map((t) => [t, truthy.includes(t)])) as Record<
    (typeof ALL_TYPES)[number],
    boolean
  >

const checked = figma.selectedInstance.getEnum(
  "Type",
  typeFlag(["Selected", "Error Selected"]),
)

// Indeterminate is its own prop rather than a third checked value, because the
// DOM only accepts it via the element, not via markup. See the useEffect in
// checkbox.jsx.
const indeterminate = figma.selectedInstance.getEnum(
  "Type",
  typeFlag(["Indeterminate", "Error Indeterminate", "Secondary Indeterminate"]),
)

const error = figma.selectedInstance.getEnum(
  "Type",
  typeFlag(["Error Unselected", "Error Selected", "Error Indeterminate"]),
)

const highlight = figma.selectedInstance.getEnum(
  "Type",
  typeFlag(["Highlight Unselected", "Highlight Hovered", "Hhighlight Focused"]),
)

const secondary = figma.selectedInstance.getEnum(
  "Type",
  typeFlag(["Secondary Indeterminate"]),
)

// State is a RUNTIME concern. Only Disabled is a real prop, so Focused, Hovered
// and Active map to false rather than to nothing.
const disabled = figma.selectedInstance.getEnum("State", {
  Active: false,
  Hovered: false,
  Focused: false,
  Disabled: true,
})

const size = figma.selectedInstance.getEnum("Size", {
  Default: "default",
  S: "s",
})

const label = figma.selectedInstance.getString("Text")

// "Show Label" and "Show Helper Text" are deliberately unmapped. checkbox.jsx
// has no showLabel or helperText prop: a checkbox with no label is expressed by
// omitting `label`, and helper text is not built. Mapping them would emit props
// that do not exist. Both are listed as gaps in checkbox-spec.md.
export default {
  id: "Checkbox",
  imports: ['import { Checkbox } from "./checkbox.jsx";'],
  example: figma.code`<Checkbox${figma.helpers.react.renderProp(
    "checked",
    checked,
  )}${figma.helpers.react.renderProp(
    "indeterminate",
    indeterminate,
  )}${figma.helpers.react.renderProp("error", error)}${figma.helpers.react.renderProp(
    "highlight",
    highlight,
  )}${figma.helpers.react.renderProp(
    "secondary",
    secondary,
  )}${figma.helpers.react.renderProp("disabled", disabled)}${figma.helpers.react.renderProp(
    "size",
    size,
  )}${figma.helpers.react.renderProp("label", label)} onChange={() => {}}/>`,
}
