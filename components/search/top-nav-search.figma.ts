// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40007095-4048
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/search/search.jsx
// component=TopNavSearch

import figma from "figma"

// THE REPO'S SEARCH COMPONENT IS THIS ONE, the TopNav search bar, and the
// manifest pointed somewhere else until 2026-10-07. Its `nodeId` was
// 40006978:23158, which READ AS a 2594x1680 FRAME named "Frame 633379": a
// layout frame on the `↳ Search` page, not a component at all. Nothing caught
// it, because nothing verifies that a cited node is a component.
//
// The real set is 40007095:4048, `TopNav.Search`, on the Navigation: Top Nav
// page. Three variants on two axes, read 2026-10-07:
//   Platform  Desktop                        (the only value in the set)
//   State     Collapsed | Expanded | Open
//
// THERE IS A SECOND, DIFFERENT SEARCH IN THE FILE. Set 40006978:23446 on the
// `↳ Search` page is a general search field: 11 variants on State
// (Idle/Hover/Focused/with-value/Open/Disabled/Error) and Has Filter (Yes/No),
// with Placeholder and Input text properties. The repo does NOT implement that
// one and must not be mapped to it; it is a different component with its own
// tokens and its own behaviour, and conflating the two is what made this page
// wrong before. `SearchInput` in search.jsx is the TopNav bar's own field, not
// that component.
//
// State is runtime here, not a prop: Collapsed and Expanded are the same
// component before and after the user clicks it, so they map to the `expanded`
// prop, and Open is the results panel, which is `onSearchOpen` firing.
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

const state = figma.selectedInstance.getEnum("State", {
  Collapsed: false,
  Expanded: true,
  Open: true,
})

export default {
  id: "TopNavSearch",
  imports: ['import { TopNavSearch } from "./search.jsx";'],
  example: figma.code`<TopNavSearch${figma.helpers.react.renderProp("expanded", state)}
  breakpoint="desktop"
  searchProps={{ placeholder: "Search" }}
  onSearchOpen={(query) => console.log(query)}
/>`,
}
