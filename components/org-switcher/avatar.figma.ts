// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=68-659
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher.jsx
// component=TriggerAvatar

import figma from "figma"

// `Avatar` 68:659, nested eight times inside the Org Switcher set and unmapped
// until 2026-10-07. A big set: 26 variants on four axes, plus text and two
// instance swaps.
//
//   Size     XL | L | M | S | XS | XXS | XXXS
//   Content  Text | Image | Image Group | Icon
//   Shape    Circle | Square
//   Style    Fill | Stroke
//   plus     Text, Icon 24 and Icon 16 swaps, Show Badge
//
// WHAT THIS REPO IMPLEMENTS IS ONE CORNER OF IT, and saying so is the point of
// this mapping. `TriggerAvatar` is the org logo inside the OrgSwitcher trigger:
// Shape=Square, Style=Stroke, Content=Image falling back to a placeholder when
// there is no logo on file. The other axes have no consumer here.
//
// So this is a PARTIAL mapping, deliberately. The honest alternative was to
// leave the set unmapped, which tells a developer nothing at all; this tells
// them which corner exists and that the rest does not. A general Avatar
// component covering all 26 variants is a separate piece of work, and building
// one to satisfy a coverage count would be the same mistake as the Badge and
// PageTemplate implementations that had to be deleted.
//
// The avatar is the one element in the TopNav on Action/Primary/Subtle rather
// than Ghost. That is measured, not a slip.
//
// ON LIGHT AND MIDNIGHT: a snippet is code, not a render, so the mode toggle
// cannot change it. The placeholder fill resolves through a MODE-AGNOSTIC token
// switched by a `data-theme` ancestor.

export default {
  id: "TriggerAvatar",
  imports: ['import { OrgSwitcher } from "./org-switcher.jsx";'],
  example: figma.code`{/* This repo implements ONE corner of the Avatar set: the org logo in
    the OrgSwitcher trigger, Shape=Square + Style=Stroke + Content=Image, with a
    placeholder when there is no logo. The other 25 variants have no consumer. */}
<OrgSwitcher
  orgName="Grace Community"
  logoUrl={null}
  onClick={() => {}}
/>`,
  metadata: { nestable: true },
}
