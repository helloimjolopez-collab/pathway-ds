// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009415-27750
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-tile.jsx
// component=KpiTile

import figma from "figma"

// Nine Types collapse to three SHAPES, because the numbered suffixes vary the
// sample glyph or the sample line rather than the layout. Both are props, so
// they do not need a variant each.
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
const type = figma.selectedInstance.getEnum("Type", {
  Simple: "simple",
  "Icon 01": "icon",
  "Icon 02": "icon",
  "Icon 03": "icon",
  "Icon 04": "icon",
  "Chart 01": "chart",
  "Chart 02": "chart",
  "Chart 03": "chart",
  "Chart 04": "chart",
})

// Breakpoint is a WIDTH, 388 desktop and 343 mobile, and the tile is fluid: it
// fills the column it is given. Mapping it would hardcode a width and stop it
// being responsive. Both numbers are in kpi-tile-spec.md §4 for hand layout.

export default {
  id: "KpiTile",
  imports: [
    'import { KpiTile, ChangeChip } from "./kpi-tile.jsx";',
    'import { MiniChart } from "./mini-chart.jsx";',
  ],
  example: figma.code`<KpiTile${figma.helpers.react.renderProp("type", type)}
  heading="Views 24 hours"
  value="2,000"
  change={<ChangeChip value="100%" direction="up" />}
  chart={<MiniChart direction="up" />}
  onMenu={() => {}}
/>`,
}
