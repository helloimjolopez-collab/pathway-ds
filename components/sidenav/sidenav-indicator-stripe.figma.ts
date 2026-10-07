// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40004035-27057
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav.jsx
// component=IndicatorStripe

import figma from "figma"
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
  id: "IndicatorStripe",
  imports: ['import { IndicatorStripe } from "./sidenav.jsx";'],
  example: figma.code`<IndicatorStripe visible={true}/>`,
}
