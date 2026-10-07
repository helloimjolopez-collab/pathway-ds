// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40006819-14578
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/top-nav/top-nav.jsx
// component=ModuleSwitcher

import figma from "figma"

// Nested three times inside TopNav.Global and unmapped until 2026-10-07.
// Set 40006819:14578, eight variants. Read 2026-10-07:
//
//   Type         Interactive | Static
//   Breakpoint   Mobile | Desktop
//   State        Base | Hover | Pressed | Open | Static (No state variants)
//   Label        TEXT
//   Show TrailingIcon  BOOLEAN
//
// `Static` is a real axis rather than a state: a module with nowhere to switch
// to draws no chevron and no hover fill. `State` itself is runtime.
//
// AT REST IT HAS NO FILL. The switcher and the org switcher both take their
// fill only on hover and pressed, which is why nothing is passed for it here.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it. What responds at runtime is that every colour
// resolves through a MODE-AGNOSTIC token name, switched by a `data-theme`
// ancestor rather than by a different token:
//
//   <div data-theme="midnight">  ...same markup, Midnight values...
//
// No component names a mode. See src/tokens/themes/light.css and midnight.css.

const type = figma.selectedInstance.getEnum("Type", {
  Interactive: "interactive",
  Static: "static",
})
const breakpoint = figma.selectedInstance.getEnum("Breakpoint", {
  Desktop: "desktop",
  Mobile: "mobile",
})
// `Show TrailingIcon` has no prop: the chevron follows `type`, because a Static
// module has nowhere to switch to and so must not offer one. A boolean that can
// contradict the type would let a caller draw a chevron on a dead control.

export default {
  id: "ModuleSwitcher",
  imports: ['import { ModuleSwitcher } from "./top-nav.jsx";'],
  example: figma.code`<ModuleSwitcher${figma.helpers.react.renderProp("type", type)}${figma.helpers.react.renderProp("breakpoint", breakpoint)}
  modules={DEFAULT_MODULES}
  activeId="accounting"
  open={false}
  onToggle={() => {}}
/>`,
  metadata: { nestable: true },
}
