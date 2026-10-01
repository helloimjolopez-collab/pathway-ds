// PageTemplate — Storybook stories (React framework)
//
// The screen template every Amplify page is built on. In Figma the component
// set is ScreenTemplate (Amplify 40009709:26016). The module is
// components/page-template/page-template.jsx; nothing is redefined here.
//
// The slots are filled with the components that actually exist in this repo:
// TopNav, SideNav, and the Widget. Card, Input, FilterChip, Heading and Button
// are separate library components that have not been built yet, so where they
// belong the stories use the smallest token-pure stand-in and the docs say so.

import React, { useState } from "react";
import {
  PageTemplate, PageHeading, PageTabs, PageToolbar, PageSection,
  PageTemplateKeyframes, BREAKPOINTS,
} from "../../../../components/page-template/page-template.jsx";
import { TopNav } from "../../../../components/top-nav/top-nav.jsx";
import { SideNav } from "../../../../components/sidenav/sidenav.jsx";
import { Widget, WidgetKeyframes, WidgetToolbar, Metric, DeltaPill } from "../../../../components/widget/widget.jsx";
import { SkeletonKeyframes } from "../../../../components/skeleton/skeleton.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;

const SECTIONS = [
  {
    section: "Giving",
    items: [
      { id: "giving-overview", label: "Overview", icon: "dashboard" },
      { id: "giving-donations", label: "Donations", icon: "volunteer_activism",
        children: [{ id: "giving-batches", label: "Batches" }, { id: "giving-pledges", label: "Pledges" }] },
      { id: "giving-funds", label: "Funds", icon: "savings" },
    ],
  },
  {
    section: "Accounting",
    items: [
      { id: "acct-ledger", label: "General ledger", icon: "receipt_long" },
      { id: "acct-payables", label: "Payables", icon: "payments" },
      { id: "acct-reports", label: "Reports", icon: "bar_chart" },
    ],
  },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "batches", label: "Batches", badge: 4 },
  { id: "pledges", label: "Pledges" },
  { id: "settings", label: "Settings", disabled: true },
];

/* Stand-ins, not components. Button, Input and FilterChip are separate library
   components that do not exist in this repo yet; these exist only so the slots
   are not empty in the story, and they are deliberately plain. */
function StandInButton({ children, primary }) {
  return (
    <span style={{
      fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
      fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
      display: "inline-flex", alignItems: "center",
      minHeight: SU("accessibility-touch-target-desktop-only-height"),
      padding: `0 ${SU("padding-tight")}`,
      borderRadius: "var(--contextual-layout-units-button-cornerradius)",
      background: primary ? SC("fill-action-primary-strong-rest") : "transparent",
      color: primary ? SC("foreground-action-primary-on-strong") : SC("foreground-action-secondary-rest"),
      border: primary ? "none" : `var(--contextual-layout-units-button-borderwidth-rest) solid ${SC("stroke-static-neutral-base")}`,
    }}>{children}</span>
  );
}

function StandInField({ placeholder }) {
  return (
    <span style={{
      fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
      fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
      display: "inline-flex", alignItems: "center",
      minHeight: SU("accessibility-touch-target-desktop-only-height"),
      padding: `0 ${SU("padding-tight")}`, minWidth: 220,
      borderRadius: "var(--contextual-layout-units-field-cornerradius)",
      border: `var(--contextual-layout-units-field-borderwidth) solid ${SC("stroke-action-field-rest")}`,
      background: SC("fill-surface-elevated"),
      color: SC("foreground-static-neutral-faint"),
    }}>{placeholder}</span>
  );
}

function GlanceRow() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: SU("gap-base"),
    }}>
      <Widget title="Given this month" size="glance" updatedLabel="Updated just now">
        <Metric value="$48,210" delta="12.4%" deltaDirection="up" deltaNote="vs last month" />
      </Widget>
      <Widget title="Active donors" size="glance">
        <Metric value="1,284" delta="38" deltaDirection="up" deltaNote="new this month" />
      </Widget>
      <Widget title="Pending deposits" size="glance">
        <Metric value="$3,940" delta="2 days" deltaDirection="down" deltaNote="oldest" />
      </Widget>
    </div>
  );
}

function Frame({ breakpoint, showTopNav = true, withTabs = true, withToolbar = true, collapsed = false }) {
  const [tab, setTab] = useState("overview");
  const [nav, setNav] = useState("giving-overview");
  return (
    <>
      <PageTemplateKeyframes />
      <WidgetKeyframes />
      <SkeletonKeyframes />
      <PageTemplate
        breakpoint={breakpoint}
        showTopNav={showTopNav}
        topNav={<TopNav breakpoint={breakpoint} activeModuleId="giving" />}
        navigation={<SideNav sections={SECTIONS} activeId={nav} onNavigate={setNav} collapsed={collapsed} />}
        heading={
          <PageHeading
            title="Donations"
            subtitle="Every gift recorded against this organisation."
            trailing={<><StandInButton>Export</StandInButton><StandInButton primary>Record a gift</StandInButton></>}
          />
        }
        tabs={withTabs ? <PageTabs tabs={TABS} activeId={tab} onSelect={setTab} /> : undefined}
        toolbar={withToolbar ? (
          <PageToolbar
            leading={<StandInField placeholder="Search donations" />}
            trailing={<><StandInButton>All funds</StandInButton><StandInButton>This month</StandInButton></>}
          />
        ) : undefined}
      >
        <PageSection id="at-a-glance" heading="At a glance">
          <GlanceRow />
        </PageSection>
        <PageSection id="by-fund" heading="By fund"
          trailing={<StandInButton>View report</StandInButton>}>
          <Widget
            title="Giving by fund"
            size="detail"
            toolbar={<WidgetToolbar identity={<StandInButton>All funds</StandInButton>} />}
          >
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              padding: SU("padding-medium"),
              fontFamily: ST("family-brand"), fontSize: ST("font-size-s"),
              color: SC("foreground-static-neutral-faint"),
            }}>
              Chart content slot
            </div>
          </Widget>
        </PageSection>
      </PageTemplate>
    </>
  );
}

export default {
  title: "Library/PageTemplate",
  component: PageTemplate,
  argTypes: {
    breakpoint: {
      name: "Breakpoint",
      description:
        "Mirrors the Figma variant. The sheet's own padding and corner radius come from " +
        "Responsive: Layout and resolve by media query, so this prop drives layout decisions " +
        "only, never the sheet's metrics.",
      control: { type: "inline-radio" }, options: BREAKPOINTS,
    },
    showTopNav: {
      name: "Show top navigation",
      description: "The Figma boolean `Show PageTopNavigation`.",
      control: { type: "boolean" },
    },
    withTabs: { name: "Show tabs", control: { type: "boolean" } },
    withToolbar: { name: "Show toolbar", control: { type: "boolean" } },
    collapsed: { name: "Side nav collapsed", control: { type: "boolean" } },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The screen template every Amplify page is built on. Figma component set " +
          "`ScreenTemplate` (Amplify `40009709:26016`, NewCo mirror `40016724:105674`). " +
          "It owns the top-navigation region, the page-navigation region, the responsive " +
          "sheet, and the four page-level compositions that only ever appear inside a page: " +
          "PageHeading, PageTabs, PageToolbar and PageSection. It does not own what goes in " +
          "the slots. " +
          "A token gap worth naming: the Figma component binds six contextual gaps " +
          "(Page, Page Heading, Section and ToolBar) that resolve through a published " +
          "library rather than locally, so they are absent from the Variables panel and from " +
          "the export. Each resolves to a semantic gap that does exist, and the module binds " +
          "those rather than inventing six contextual names the panel would not recognise.",
      },
    },
  },
};

export const Playground = (args) => <Frame {...args} />;
Playground.args = {
  breakpoint: "desktop", showTopNav: true, withTabs: true, withToolbar: true, collapsed: false,
};

export const Breakpoints = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: SU("gap-relaxed") }}>
    {BREAKPOINTS.map((bp) => (
      <div key={bp}>
        <p style={{
          fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
          fontSize: ST("font-size-xs"), letterSpacing: ST("letter-spacing-extraspacious"),
          textTransform: "uppercase", color: SC("foreground-static-neutral-faint"),
          margin: `0 0 ${SU("gap-tight")}`,
        }}>{bp}</p>
        <div style={{ height: 620, overflow: "hidden", border: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-base")}`, borderRadius: SU("cornerradius-large") }}>
          <Frame breakpoint={bp} collapsed={bp === "tablet"} />
        </div>
      </div>
    ))}
  </div>
);
Breakpoints.parameters = {
  docs: { description: { story: "The three Figma variants side by side. On mobile the page-navigation region is not rendered: navigation is a TopNav takeover there, not a rail." } },
};

export const WithoutTabsOrToolbar = () => <Frame breakpoint="desktop" withTabs={false} withToolbar={false} />;
WithoutTabsOrToolbar.parameters = {
  docs: { description: { story: "Tabs and toolbar are both optional. A page with neither is the common case for a single-purpose screen." } },
};

export const NoTopNavigation = () => <Frame breakpoint="desktop" showTopNav={false} />;
NoTopNavigation.parameters = {
  docs: { description: { story: "`Show PageTopNavigation` off, which is how the template is used inside an embedded or kiosk context." } },
};
