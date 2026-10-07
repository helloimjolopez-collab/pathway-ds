// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40017320-361
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-number-trend.jsx
// component=TrendComparisonControl

import figma from "figma"

// A BUILDING BLOCK: mapped, no Storybook page.
//
// The Figma component has NO properties: it is the arrow-plus-percentage unit
// that sits inside _Change, and everything about it is fixed structure. In code
// it is not a separate export, because a component with no props and no
// behaviour is a shape rather than a part. It maps to <Change>, which is the
// smallest real thing that contains it.
//
// Mapping it to Change rather than leaving it unmapped means a designer who
// selects this in the dev panel gets the code that produces it, instead of
// nothing.
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
  id: "TrendComparisonControl",
  imports: ['import { Change } from "./kpi-number-trend.jsx";'],
  example: figma.code`<Change value="100%" direction="up" note="vs last month" />`,
}
