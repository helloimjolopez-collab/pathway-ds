// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006819-14583
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher.jsx
// component=OrgSwitcher

import figma from "figma"

// State is mostly RUNTIME. Hover and Pressed are internal useState in the
// component, not props, so they map to nothing; only Open is a real prop.
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
const open = figma.selectedInstance.getEnum("State", {
  Base: false,
  Hover: false,
  Pressed: false,
  Open: true,
})

// `mobile` is a TRISTATE in the component: true forces mobile, false forces
// desktop, undefined auto-detects from a media query. Figma's Type axis is a
// deliberate choice of one or the other, so it maps to the explicit booleans
// and never to undefined.
const mobile = figma.selectedInstance.getEnum("Type", {
  Desktop: false,
  Mobile: true,
})

const orgName = figma.selectedInstance.getString("OrgName")
const cityName = figma.selectedInstance.getString("CityName")

// NOT MAPPED, and each for a reason:
//
//   Show RowEnd, Show Trailing Icon, Show Label, Show Org Avatar
//     No matching props. The component derives the trailing chevron from `open`
//     and the avatar from whether `logoUrl` is set, so a boolean here would
//     emit a prop that does not exist.
//
//   Label-Mobile
//     The component shortens the org name itself via abbreviateOrg(), so a
//     separate mobile label would be a second source of truth for one string.
//
//   Show CityName (Catholic)
//     The component expresses this as orgType="catholic", not as a visibility
//     flag. Mapping the boolean would lose which denomination it means, so
//     orgType is set by hand.
export default {
  id: "OrgSwitcher",
  imports: ['import { OrgSwitcher } from "./org-switcher.jsx";'],
  example: figma.code`<OrgSwitcher${figma.helpers.react.renderProp(
    "orgName",
    orgName,
  )}${figma.helpers.react.renderProp("cityName", cityName)}${figma.helpers.react.renderProp(
    "open",
    open,
  )}${figma.helpers.react.renderProp("mobile", mobile)} onClick={() => {}}/>`,
}
