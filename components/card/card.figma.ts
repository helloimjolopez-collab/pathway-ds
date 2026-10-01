// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006608-49667
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/card/card.jsx
// component=Card

import figma from "figma"

// NODE CHOICE: 40006608:49667 is the Card inside SECTION "Amplify". An
// identical set exists in the other brand's section at 40016724:103731, plus
// two further duplicates on the same page. Same name, same props, so the
// section is the only thing that tells them apart. This mapping is the Amplify
// one on purpose, and the other brand is NOT named in this file: Storybook
// publishes components/ to public GitHub Pages, so this file is served.

// Figma's State axis. Only an INTERACTIVE card can reach hover, active or
// focus, and in code that is decided by passing onClick rather than by a prop,
// so the snippet includes onClick for any state other than Default and
// Disabled. Default is ambiguous by nature: a default card may or may not be a
// target, so the snippet leaves it as a plain container and the designer's
// intent decides.
const state = figma.selectedInstance.getEnum("State", {
  Default: "default",
  Hover: "hover",
  Focus: "focus",
  Active: "active",
  Disabled: "disabled",
})

// The content toggles. Each one collapses into the presence of its content
// prop, because a boolean that only means "is the next prop set" is a Figma
// limitation rather than an API.
const showHeading = figma.selectedInstance.getBoolean("ShowHeading")
const showSubtitle = figma.selectedInstance.getBoolean("Show CardSubtitle")
const showBody = figma.selectedInstance.getBoolean("ShowCardBody")
const showIcon = figma.selectedInstance.getBoolean("ShowIconLeading")
const showSupporting = figma.selectedInstance.getBoolean(
  "ShowCardSupportingContent",
)
const title = figma.selectedInstance.getString("CardTitle")
const body = figma.selectedInstance.getString("CardBody")

// forceState is NOT emitted. It exists for the Storybook matrix only; a real
// card derives its state from interaction, and a snippet that pinned the state
// would produce a card that never responds.
export default {
  id: "Card",
  imports: ['import { Card } from "./card.jsx";'],
  example: figma.code`<Card${
    showIcon ? " icon={<Icon name=\"receipt_long\" />}" : ""
  }${showHeading && title ? ` title="${title}"` : ""}${
    showSubtitle ? ' subtitle="Accounts payable"' : ""
  }${showBody && body ? ` body="${body}"` : ""}${
    state === "disabled" ? " disabled" : ""
  }${state !== "default" ? " onClick={() => {}}" : ""}>${
    showSupporting ? "\n  {supportingContent}\n" : ""
  }</Card>`,
}
