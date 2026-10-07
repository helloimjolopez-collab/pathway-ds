// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40016590-37966
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/top-nav/top-nav.jsx
// component=TopNavProfile

import figma from "figma"

// Nested three times inside TopNav.Global and unmapped until 2026-10-07.
// Set 40016590:37966, 186x90, three variants on one axis literally named
// `Property 1` with values Base / Hover / Pressed. That is state, so it is
// runtime here and not a prop.
//
// The avatar is the one part of the TopNav on Action/Primary/Subtle rather than
// Ghost, which is measured and deliberate.
//
// ON LIGHT AND MIDNIGHT: this is a code snippet, not a render, so flipping the
// mode in Figma cannot change it. What responds at runtime is that every colour
// resolves through a MODE-AGNOSTIC token name, switched by a `data-theme`
// ancestor rather than by a different token:
//
//   <div data-theme="midnight">  ...same markup, Midnight values...
//
// No component names a mode. See src/tokens/themes/light.css and midnight.css.

export default {
  id: "TopNavProfile",
  imports: ['import { TopNavProfile } from "./top-nav.jsx";'],
  example: figma.code`<TopNavProfile
  user={{ name: "Jo Lopez", initials: "JL" }}
  open={false}
  onToggle={() => {}}
/>`,
  metadata: { nestable: true },
}
