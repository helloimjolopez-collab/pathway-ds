/**
 * NavShell — Storybook stories
 *
 * ══════════════════════════════════════════════════════════════════════
 * WHY THIS FILE EXISTS AND WHY IT IMPORTS FROM .jsx
 * ══════════════════════════════════════════════════════════════════════
 *
 * The NavShell is a composite component — it composes TopNav, SideNav,
 * and a content area. For composite components, the Storybook story is
 * the CANONICAL demo, not the HTML file. Here's why:
 *
 * - The Storybook story imports TopNav from top-nav.jsx and SideNav from
 *   sidenav.jsx. Any change to either component is immediately reflected
 *   here — no manual sync needed.
 *
 * - The nav-shell.html demo is a SECONDARY artifact. It reimplements
 *   TopNav and SideNav CSS inline, which means it can drift. Treat it as
 *   a convenience for sharing links; do not treat it as a source of truth.
 *
 * - When an agent (Figma Make, Claude, Cursor, etc.) reads this story, it
 *   sees the real validated implementations of TopNav and SideNav being
 *   composed together. It cannot copy wrong token values or wrong hover
 *   states because there are none — it's reading the actual components.
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
// NOTE: SideNav lives in sidenav.jsx — NOT top-nav.jsx. Importing it from
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
          "This story imports TopNav and SideNav from their .jsx modules — " +
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
// Positioning only — colours, tokens, and interactions come from TopNav/SideNav
const SHELL_STYLE = {
  display: "flex",
  height: "100vh",
  flexDirection: "column",
  background: "var(--semantic-color-light-mode-surface-canvas-light, #fafafa)",
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
  background: "var(--semantic-color-light-mode-surface-canvas-light, #fafafa)",
});

// ── MINIMAL SCREEN TEMPLATE (page content placeholder) ────────────────────
// A stripped-down content area. The real ScreenTemplate sub-components
// (PageHeading, ToolBar, FilterChip, Card) are future standalone DS components.
// This shows the layout only — replace with real content in production.
function ScreenContent({ title, subtitle }) {
  return (
    <div>
      <div style={{ paddingTop: 8, paddingBottom: 16 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 600, lineHeight: "30px", letterSpacing: "0.1px",
          color: "var(--semantic-color-light-mode-text-static-primary-base, #202020)",
          margin: 0,
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            marginTop: 8,
            fontSize: 16, fontWeight: 400, lineHeight: "22px", letterSpacing: "0.1px",
            color: "var(--semantic-color-light-mode-text-static-secondary-base, #484848)",
          }}>{subtitle}</p>
        )}
      </div>
      <div style={{
        padding: "8px 0",
        borderTop: "1px solid var(--semantic-color-light-mode-stroke-static-neutral-light, #f6f6f6)",
        marginTop: 16,
        color: "var(--semantic-color-light-mode-text-static-secondary-subtle, #606060)",
        fontSize: 13, lineHeight: "20px",
      }}>
        Page content area — replace with real ScreenTemplate content.
        See <code>components/nav-shell/nav-shell-spec.md §7</code> for the full layout spec.
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

  // SideNav width: 220px expanded, 72px collapsed rail, 0 hidden (mobile)
  const sideNavWidth = isMobile
    ? (mobileNavOpen ? 220 : 0)
    : isTablet
    ? 72
    : sideNavCollapsed ? 72 : 220;

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
      {/* TopNav — importing the validated component directly */}
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

        {/* SideNav — importing the validated component directly */}
        {(sideNavWidth > 0 || !isMobile) && (
          <div style={{
            position: "fixed", top: 56, left: 0, bottom: 0,
            width: sideNavWidth, zIndex: 50, flexShrink: 0,
            transition: "width var(--motion-duration-6) var(--motion-easing-emphasized)",
            overflow: "hidden",
          }}>
            <SideNav
              items={[
                { id: "home",    label: "Home",          icon: "home",              active: true },
                { id: "people",  label: "People",         icon: "group" },
                { id: "giving",  label: "Giving",         icon: "volunteer_activism" },
                { id: "events",  label: "Events",         icon: "event" },
                { id: "comms",   label: "Communications", icon: "mail" },
                { id: "settings",label: "Settings",       icon: "settings" },
              ]}
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
          "Tablet (768–1023px): SideNav always 72px icon-only rail. " +
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
          "Example of a different module configuration — Amplify Giving for NorthPoint Church. " +
          "Change the args to see any module in context instantly.",
      },
    },
  },
  tags: ["!dev"],
};
