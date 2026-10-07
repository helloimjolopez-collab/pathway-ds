// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40007067-6508
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/top-nav/top-nav.jsx
// component=TopNav

import figma from "figma"

// SCOPE: this maps the BAR and nothing else.
//
// The things that open out of the top nav are their own patterns and are NOT
// part of this component: the module switcher open panel, the org switcher open
// panel, the search experience beyond the act of opening it, the avatar, and the
// action icons. Each carries its own definition, responsiveness and docs, and
// they belong to the nav-shell demos and stories. Figma agrees: they are
// separate component sets (TopNav.Actions, TopNav.Profile, TopNav.Search,
// TopNav.AmplifyIntelligence), so they get their own mappings when they are
// built. Do not absorb them here, and do not map Slot.RowStart / Slot.RowEnd to
// them.
//
// NODE CHOICE: 40007067-6508 is the TopNav.Global inside SECTION "Amplify",
// which is the Pathway bar. A second TopNav.Global exists at 40016724-119035
// inside the other brand's section. Same name, same coordinates, different
// brand, so the section is the only thing that tells them apart. This mapping
// is the Pathway one on purpose.
//
// The other brand is NOT named here. Storybook publishes components/ to public
// GitHub Pages, so this file is served; the unannounced brand must not appear
// in it. See .storybook/preview.js for the same rule on token imports.

// Figma spells the desktop value "Destkop". That typo is the real variant value,
// so it has to be matched verbatim or the enum silently misses and breakpoint
// comes back undefined for every desktop instance.
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
const breakpoint = figma.selectedInstance.getEnum("Property 1", {
  Destkop: "desktop",
  Tablet: "tablet",
  Mobile: "mobile",
})

export default {
  id: "TopNav",
  imports: ['import { TopNav } from "./top-nav.jsx";'],
  example: figma.code`<TopNav${figma.helpers.react.renderProp(
    "breakpoint",
    breakpoint,
  )} activeModuleId="home" onModuleSelect={(id) => console.log(id)} onOrgSelect={(id) => console.log(id)} onSearchOpen={() => {}} onSideNavToggle={() => {}}/>`,
}
