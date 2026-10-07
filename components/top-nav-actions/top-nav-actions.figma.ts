// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40007082-7313
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/top-nav/top-nav.jsx
// component=TopNavActions

import figma from "figma"

// A BUILDING BLOCK: mapped because it is a Figma component, with no Storybook
// page because it only ever appears nested inside a TopNav. The rule is the
// same one WidgetHeading follows.
//
// READ FROM FIGMA on 2026-10-07. Node 40007082:7313 is a single COMPONENT, not
// a set: 132x48, with exactly one property, a SLOT named `Slot.Actions`. It has
// no variant axis at all, which matters for what this file can honestly claim.
//
// SO THE COLLAPSE IS NOT A VARIANT HERE. Figma draws the inline form in this
// component and the collapsed `more_vert` form in the mobile TopNav variant, a
// different node. In code both come from the one `TopNavActions` with a
// `breakpoint` prop, because the trigger is available width rather than a
// choice the consumer makes. The example therefore emits the desktop form,
// which is what this node renders; the tablet and mobile forms are shown by
// the TopNav Tablet and Mobile stories.
//
// The slot's contents are structure rather than a prop: which icons appear is
// decided by the module, so top-nav.jsx takes handlers and not a children
// array. Nothing is read off the instance because there is nothing to read.
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

export default {
  id: "TopNavActions",
  imports: ['import { TopNavActions } from "../top-nav/top-nav.jsx";'],
  example: () => figma.code`<TopNavActions
  breakpoint="desktop"
  onNotifications={() => {}}
  onMore={() => {}}
/>`,
  metadata: { nestable: true },
}
