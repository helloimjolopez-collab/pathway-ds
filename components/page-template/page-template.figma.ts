// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009709-26016
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/page-template/page-template.jsx
// component=PageTemplate

import figma from "figma"

// SCOPE: this maps the SCREEN SHELL and nothing else.
//
// ScreenTemplate owns three regions and a sheet. What goes in the regions does
// not belong to this mapping: TopNav and SideNav are their own components with
// their own mappings, and Card, Input, FilterChip, Heading, Button and the Tabs
// atoms are separate library components that do not exist in the repo yet. Do
// not absorb any of them here, and do not map Container.ScreenContent or
// Slot.PageNavigation to them.
//
// The four page-level compositions in the module (PageHeading, PageTabs,
// PageToolbar, PageSection) are exported but are not mapped here, because in
// Figma they are separate components (Page Heading, Tabs, ToolBar, Page
// Section) and will get their own mappings when those components are built in
// the repo. Mapping them from inside this file would claim nodes this component
// does not own.
//
// NODE CHOICE: 40009709-26016 is the ScreenTemplate inside SECTION "Amplify".
// A second identical set exists in the other brand's section at
// 40016724-105674, and a third and fourth at 40016724-105003 and
// 40016724-105715. Same name, same props, different brand or duplicate frame,
// so the section is the only thing that tells them apart. This mapping is the
// Amplify one on purpose.
//
// The other brand is NOT named here. Storybook publishes components/ to public
// GitHub Pages, so this file is served; the unannounced brand must not appear
// in it. See .storybook/preview.js for the same rule on token imports.

// Figma's third breakpoint value is literally "Breakpoint3", not "Mobile". That
// is the real variant value, so it has to be matched verbatim or the enum
// silently misses and breakpoint comes back undefined for every mobile
// instance. Worth renaming in Figma; until then, match what is there.
const breakpoint = figma.selectedInstance.getEnum("Breakpoint", {
  Desktop: "desktop",
  Tablet: "tablet",
  Breakpoint3: "mobile",
})

const showTopNav = figma.selectedInstance.getBoolean(
  "Show PageTopNavigation",
)

export default {
  id: "PageTemplate",
  imports: ['import { PageTemplate } from "./page-template.jsx";'],
  example: figma.code`<PageTemplate${figma.helpers.react.renderProp(
    "breakpoint",
    breakpoint,
  )}${figma.helpers.react.renderProp(
    "showTopNav",
    showTopNav,
  )} topNav={<TopNav breakpoint="desktop" />} navigation={<SideNav sections={sections} activeId={activeId} onNavigate={setActive} />} heading={<PageHeading title="Donations" subtitle="Every gift recorded against this organisation." trailing={<Button>Record a gift</Button>} />} tabs={<PageTabs tabs={tabs} activeId={tab} onSelect={setTab} />} toolbar={<PageToolbar leading={<Input placeholder="Search donations" />} />}>
  <PageSection id="at-a-glance" heading="At a glance">{content}</PageSection>
</PageTemplate>`,
}
