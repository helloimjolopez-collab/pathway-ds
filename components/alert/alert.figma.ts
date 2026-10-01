// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40002171-5031
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/alert/alert.jsx
// component=Alert

import figma from "figma"

// NODE CHOICE: 40002171:5031 is the Alert on the Amplify side. The page carries
// three further identical sets (40016675:78998, 40016675:81150,
// 40016675:81254), so the node id is the only thing that picks the right one.
// The other brand is not named here: Storybook publishes components/ to public
// GitHub Pages, so this file is served.

// Figma's Type names and the token families they resolve to disagree, and the
// props keep Figma's names so a designer and a developer are talking about the
// same thing. The component records the real family in TYPE_FAMILY:
//   Success -> positive, Alert -> severe, Warning -> attention,
//   Error -> negative, Tertiary -> info, Neutral -> neutral.
// `Alert` as a Type inside a component called Alert means the severe level.
const type = figma.selectedInstance.getEnum("Type", {
  Success: "success",
  Alert: "alert",
  Warning: "warning",
  Error: "error",
  Neutral: "neutral",
  Tertiary: "tertiary",
})

// The content toggles. Each collapses into the presence of its content prop,
// the same call as Card and Badge: a boolean that only means "is the next prop
// set" is a Figma limitation rather than an API.
const heading = figma.selectedInstance.getString("Heading")
const body = figma.selectedInstance.getString("Body")
const showHeading = figma.selectedInstance.getBoolean("Show Heading")
const showBody = figma.selectedInstance.getBoolean("Show Body")
const showIcon = figma.selectedInstance.getBoolean("Show Heading Icon")
const showButton = figma.selectedInstance.getBoolean("Show Button")
const showTrailing = figma.selectedInstance.getBoolean("Show Trailing Icon")

// `role` is NOT emitted. The component picks it from the type, because error
// and alert interrupt and the other four do not, and that is an accessibility
// decision rather than a design one: a screen reader should not be made to
// announce a success message over whatever the user is doing.
export default {
  id: "Alert",
  imports: ['import { Alert } from "./alert.jsx";'],
  example: figma.code`<Alert${figma.helpers.react.renderProp("type", type)}${
    showIcon ? " icon={<Icon name=\"info\" />}" : ""
  }${showHeading && heading ? ` heading="${heading}"` : ""}${
    showButton ? " action={<Button>Learn more</Button>}" : ""
  }${showTrailing ? " onDismiss={() => {}}" : ""}>${
    showBody && body ? `\n  ${body}\n` : ""
  }</Alert>`,
}
