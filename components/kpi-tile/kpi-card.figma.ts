// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009415-27750
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/kpi-tile/kpi-card.jsx
// component=KpiCard

import figma from "figma"

// Figma's nine Types collapse to three SHAPES in code, because the numbered
// suffixes vary the sample content and not the layout. Icon 01 to 04 are the
// same card with a different featured glyph, and Chart 01 to 04 the same card
// with a different sample line. The glyph and the line are props, so they do
// not need a variant each.
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

// Breakpoint is a WIDTH, 388 on desktop and 343 on mobile, and the component is
// fluid: it fills whatever column it is given. So the axis maps to nothing
// rather than to a hardcoded width, which would stop it being responsive. The
// two numbers are recorded in kpi-tile-spec.md §4 for anyone laying one out by
// hand.

export default {
  id: "KpiCard",
  imports: [
    'import { KpiCard, ChangeChip } from "./kpi-card.jsx";',
    'import { MiniChart } from "./mini-chart.jsx";',
  ],
  example: figma.code`<KpiCard${figma.helpers.react.renderProp("type", type)}
  heading="Views 24 hours"
  value="2,000"
  change={<ChangeChip value="100%" direction="up" />}
  chart={<MiniChart direction="up" />}
  onMenu={() => {}}
/>`,
}
