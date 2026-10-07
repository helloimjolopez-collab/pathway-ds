/**
 * NavShell - Storybook stories
 *
 * ══════════════════════════════════════════════════════════════════════
 * WHY THIS FILE EXISTS AND WHY IT IMPORTS FROM .jsx
 * ══════════════════════════════════════════════════════════════════════
 *
 * The NavShell is a composite component - it composes TopNav, SideNav,
 * and a content area. For composite components, the Storybook story is
 * the CANONICAL demo, not the HTML file. Here's why:
 *
 * - The Storybook story imports TopNav from top-nav.jsx and SideNav from
 *   sidenav.jsx. Any change to either component is immediately reflected
 *   here - no manual sync needed.
 *
 * - The nav-shell.html demo is a SECONDARY artifact. It reimplements
 *   TopNav and SideNav CSS inline, which means it can drift. Treat it as
 *   a convenience for sharing links; do not treat it as a source of truth.
 *
 * - When an agent (Figma Make, Claude, Cursor, etc.) reads this story, it
 *   sees the real validated implementations of TopNav and SideNav being
 *   composed together. It cannot copy wrong token values or wrong hover
 *   states because there are none - it's reading the actual components.
 *
 * ══════════════════════════════════════════════════════════════════════
 * HOW TO CUSTOMISE THE SHELL (for agents reading this)
 * ══════════════════════════════════════════════════════════════════════
 *
 * Everything that makes this shell specific to a module is in the story
 * args below. To implement a different module (e.g. "Amplify Giving" for
 * NorthPoint Church with nav items Home + Teams + Projects), change:
 *
 *   module: { id: "giving", label: "Amplify Giving", icon: "volunteer_activism" }
 *   org:    { name: "NorthPoint Church", campus: "" }
 *   navItems: [ { id: "home", label: "Home", icon: "home", active: true }, ... ]
 *   page:   { title: "Teams", subtitle: "Manage ministry teams", tabs: [...] }
 *
 * Do not change TopNav.jsx or sidenav.jsx for content customisation.
 * Change only the SHELL_CONFIG / story args.
 *
 * Spec: components/nav-shell/nav-shell-spec.md
 * HTML demo: components/nav-shell/nav-shell.html
 * Figma (ScreenTemplate): https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006538-43236
 */

import React, { useState, useEffect } from "react";

// ── REAL COMPONENT IMPORTS ─────────────────────────────────────────────────
// These are the validated, Figma-accurate implementations.
// If you are an agent reading this: use these imports. Do not reimplement.
import { TopNav, DEFAULT_MODULES } from "../../../../components/top-nav/top-nav.jsx";
import { SideNav } from "../../../../components/sidenav/sidenav.jsx";
// Canonical SideNav demo data: the SAME sections (real icons, groupers,
// children) the SideNav's own stories use. NavShell must render the real
// SideNav, not a hand-rolled flat list, so it imports this directly.
import { NAV_SECTIONS } from "../SideNav/sidenavDemoData.jsx";
// NOTE: SideNav lives in sidenav.jsx - NOT top-nav.jsx. Importing it from
// top-nav.jsx returns undefined and crashes the story canvas (was the cause
// of the NavShell "404"/blank render). Always import each component from its
// own module.

// Note: TopNav exports its own internal OrgSwitcher. The standalone OrgSwitcher
// component (components/org-switcher/) is for use outside TopNav. Inside TopNav,
// the OrgSwitcher is managed by TopNav itself via the `org` prop.

export default {
  title: "Library/NavShell",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**The application shell.** Every page in Amplify lives inside NavShell. " +
          "It composes TopNav + SideNav + a scrollable content area. " +
          "This story imports TopNav and SideNav from their .jsx modules - " +
          "it cannot drift from the validated implementations. " +
          "Customise via the args below (module, org, nav items, page content). " +
          "Spec: `components/nav-shell/nav-shell-spec.md`.",
      },
    },
  },
  argTypes: {
    moduleName:  { control: "text",    name: "Module name",   description: "Display name in TopNav ModuleSwitcher" },
    moduleIcon:  { control: "text",    name: "Module icon",   description: "Material Symbols Rounded ligature for module icon" },
    orgName:     { control: "text",    name: "Org name",      description: "Organisation name shown in OrgSwitcher trigger" },
    orgCampus:   { control: "text",    name: "Campus",        description: "Campus name (empty = no campus)" },
    pageTitle:   { control: "text",    name: "Page title",    description: "H1 in the content area" },
    pageSubtitle:{ control: "text",    name: "Page subtitle", description: "Subtitle below the H1" },
    breakpoint:  {
      control: { type: "radio" },
      options: ["desktop", "tablet", "mobile"],
      name: "Breakpoint",
      description: "Simulates the responsive layout. Desktop = SideNav push. Tablet = 72px rail. Mobile = SideNav hidden.",
    },
  },
};

// ── SHELL WRAPPER CSS ──────────────────────────────────────────────────────
// Positioning only - colours, tokens, and interactions come from TopNav/SideNav
const SHELL_STYLE = {
  display: "flex",
  height: "100vh",
  flexDirection: "column",
  background: "var(--semantic-color-fill-surface-canvas)",
  fontFamily: "'Red Hat Text', sans-serif",
  overflow: "hidden",
};

const BODY_STYLE = {
  display: "flex",
  flex: 1,
  overflow: "hidden",
  position: "relative",
};

const MAIN_STYLE = (marginLeft) => ({
  flex: 1,
  minWidth: 0,
  overflowY: "auto",
  overflowX: "hidden",
  marginLeft,
  transition: "margin-left var(--motion-duration-6) var(--motion-easing-emphasized)",
  padding: "12px 36px 56px",
  background: "var(--semantic-color-fill-surface-canvas)",
});

// ── MINIMAL SCREEN TEMPLATE (page content placeholder) ────────────────────
// A stripped-down content area. The real ScreenTemplate sub-components
// (PageHeading, ToolBar, FilterChip, Card) are future standalone DS components.
// This shows the layout only - replace with real content in production.
function ScreenContent({ title, subtitle }) {
  return (
    <div>
      <div style={{ paddingTop: 8, paddingBottom: 16 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 600, lineHeight: "30px", letterSpacing: "0.1px",
          color: "var(--semantic-color-foreground-static-neutral-bold)",
          margin: 0,
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            marginTop: 8,
            fontSize: 16, fontWeight: 400, lineHeight: "22px", letterSpacing: "0.1px",
            color: "var(--semantic-color-foreground-static-neutral-base)",
          }}>{subtitle}</p>
        )}
      </div>
      {/* WHAT THE SHELL IS FOR: holding a page. This slot used to contain the
          sentence "Page content area - replace with real ScreenTemplate
          content", plus a pointer to a spec section, rendered into the story
          itself. A note-to-self is not page content, and it made the shell look
          like it had nothing in it. Reported 2026-10-02.

          What replaces it is deliberately plain. The shell's job is the frame:
          the top nav, the side nav, the page inset and the scroll boundary.
          Inventing a dashboard in here is what produced content in other
          stories that did not exist in the design, so this is a few rows of
          ordinary page furniture and nothing more. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
        {[
          ["Weekly giving", "$48,210", "Processed through Sunday"],
          ["New households", "38", "Added this month"],
          ["Open approvals", "4", "Waiting on you"],
        ].map(([label, value, note]) => (
          <div key={label} style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            gap: 16, padding: "12px 14px",
            background: "var(--semantic-color-fill-static-neutral-faint)",
            border: "1px solid var(--semantic-color-stroke-static-neutral-faint)",
            borderRadius: "var(--semantic-layout-units-cornerradius-base)",
          }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600,
                color: "var(--semantic-color-foreground-static-neutral-bold)" }}>{label}</span>
              <span style={{ fontSize: 12,
                color: "var(--semantic-color-foreground-static-neutral-base)" }}>{note}</span>
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, whiteSpace: "nowrap",
              color: "var(--semantic-color-foreground-static-neutral-bold)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN STORY RENDER ──────────────────────────────────────────────────────
function NavShellRender({
  moduleName  = "Amplify Home",
  moduleIcon  = "home",
  orgName     = "Grace Community Church",
  orgCampus   = "Knoxville",
  pageTitle   = "Dashboard",
  pageSubtitle = "Welcome back. Here's what's happening today.",
  breakpoint  = "desktop",
}) {
  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";

  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // THE WIDTHS COME FROM THE TOKENS, not from numbers typed here. They were
  // hard-coded 220 expanded and 72 collapsed while SideNav/Width/Expanded is
  // 256 and SideNav/Width/Collapsed is 84, so the shell squeezed the side nav
  // 36px narrower than it is built for. Because .pds-scrollable__view clips
  // horizontally, the result was a rail with its active item's rounded right
  // edge and every chevron sliced off. Reported 2026-10-02.
  //
  // sidenav.jsx's own comment already recorded that these numbers had moved
  // ("collapsed one is 84. Was 240, which no longer matched the component"),
  // which is exactly the drift a hard-coded copy produces: the component moved
  // and the shell did not.
  const NAV_W = {
    expanded:  "var(--contextual-layout-units-sidenav-width-expanded)",
    collapsed: "var(--contextual-layout-units-sidenav-width-collapsed)",
  };
  const sideNavWidth = isMobile
    ? (mobileNavOpen ? NAV_W.expanded : 0)
    : isTablet
    ? NAV_W.collapsed
    : sideNavCollapsed ? NAV_W.collapsed : NAV_W.expanded;

  // Mobile overlays the nav rather than insetting the page, so the page keeps
  // the full width there and matches the nav's own width everywhere else.
  const mainMarginLeft = isMobile ? 0 : sideNavWidth;

  const modules = DEFAULT_MODULES.map(m =>
    m.id === "home"
      ? { ...m, label: moduleName, icon: moduleIcon === "home" ? m.icon : moduleIcon }
      : m
  );

  const org = {
    id: "current", name: orgName, campus: orgCampus,
    initials: orgName.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase(),
  };

  const user = { name: "Jo Lopez", initials: "JL", email: "jo@example.org" };

  return (
    <div style={SHELL_STYLE}>
      {/* TopNav - importing the validated component directly */}
      <TopNav
        modules={modules}
        activeModuleId="home"
        org={org}
        user={user}
        breakpoint={breakpoint}
        onSideNavToggle={() => {
          if (isMobile) setMobileNavOpen(p => !p);
          else setSideNavCollapsed(p => !p);
        }}
      />

      <div style={{ ...BODY_STYLE, paddingTop: 56 }}>
        {/* Mobile overlay */}
        {isMobile && mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{
              position: "fixed", inset: "56px 0 0 0", zIndex: 49,
              background: "rgba(0,0,0,0.32)",
            }}
            aria-hidden="true"
          />
        )}

        {/* SideNav - importing the validated component directly */}
        {/* Was `sideNavWidth > 0`, which only worked while the width was a
            number. It is a CSS length now, so the test is on the state that
            decides it: on mobile the nav exists only while the drawer is open. */}
        {(!isMobile || mobileNavOpen) && (
          <div style={{
            position: "fixed", top: 56, left: 0, bottom: 0,
            width: sideNavWidth, zIndex: 50, flexShrink: 0,
            transition: "width var(--motion-duration-6) var(--motion-easing-emphasized)",
            overflow: "hidden",
          }}>
            <SideNav
              sections={NAV_SECTIONS}
              activeId={NAV_SECTIONS[0]?.items?.[0]?.id}
              onNavigate={() => {}}
              collapsed={isTablet || sideNavCollapsed}
              onCollapseChange={!isTablet ? setSideNavCollapsed : undefined}
              hideCollapseButton={isMobile}
            />
          </div>
        )}

        {/* Content area */}
        <main style={MAIN_STYLE(mainMarginLeft)} id="main-content">
          <ScreenContent title={pageTitle} subtitle={pageSubtitle} />
        </main>
      </div>
    </div>
  );
}

// ── STORIES ────────────────────────────────────────────────────────────────

export const Desktop = {
  args: {
    moduleName:   "Amplify Home",
    moduleIcon:   "home",
    orgName:      "Grace Community Church",
    orgCampus:    "Knoxville",
    pageTitle:    "Dashboard",
    pageSubtitle: "Welcome back. Here's what's happening today.",
    breakpoint:   "desktop",
  },
  render: (args) => <NavShellRender {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Desktop (≥1024px): SideNav 220px push layout. " +
          "Click the collapse button in the NavHeader to toggle 220px ↔ 72px rail.",
      },
    },
  },
};

export const Tablet = {
  args: { ...Desktop.args, breakpoint: "tablet" },
  render: (args) => <NavShellRender {...args} />,
  parameters: {
    viewport: { defaultViewport: "tablet" },
    docs: {
      description: {
        story:
          "Tablet (768 to 1023px): SideNav always 72px icon-only rail. " +
          "Module label hidden, action buttons collapse to more_vert.",
      },
    },
  },
};

export const Mobile = {
  args: { ...Desktop.args, breakpoint: "mobile" },
  render: (args) => <NavShellRender {...args} />,
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Mobile (<768px): SideNav hidden by default. " +
          "Tap the hamburger button in TopNav to reveal the SideNav as an overlay. " +
          "This is the ONLY way to access navigation on mobile.",
      },
    },
  },
  tags: ["!dev"],
};

export const CustomModule = {
  args: {
    ...Desktop.args,
    moduleName:   "Amplify Giving",
    moduleIcon:   "volunteer_activism",
    orgName:      "NorthPoint Church",
    orgCampus:    "",
    pageTitle:    "Giving Overview",
    pageSubtitle: "Track donations and campaigns across your organisation.",
    breakpoint:   "desktop",
  },
  render: (args) => <NavShellRender {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Example of a different module configuration - Amplify Giving for NorthPoint Church. " +
          "Change the args to see any module in context instantly.",
      },
    },
  },
  tags: ["!dev"],
};
