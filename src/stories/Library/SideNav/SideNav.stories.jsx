/**
 * SideNav — Storybook stories (React framework)
 *
 * Interactive stories with controls for the SideNav component.
 * Spec: components/sidenav/sidenav-spec.md
 */
import React, { useState } from "react";
import { SideNav, T } from "../../../../components/sidenav/sidenav.jsx";
import { NAV_ITEMS, ALL_ITEM_IDS } from "./sidenavDemoData.jsx";

// ─── Popover animation keyframes (needed for collapsed tooltips/popovers) ────
// These are normally in the HTML demo's <style> block; for Storybook we inject
// them once via a <style> tag in the document head.
if (typeof document !== "undefined" && !document.getElementById("pds-sidenav-keyframes")) {
  const style = document.createElement("style");
  style.id = "pds-sidenav-keyframes";
  style.textContent = `
    @keyframes popoverIn {
      from { opacity: 0; transform: translateX(-4px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes popoverInCentered {
      from { opacity: 0; transform: translateX(-4px) translateY(-50%); }
      to   { opacity: 1; transform: translateX(0)    translateY(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes popoverIn {
        from { opacity: 0; } to { opacity: 1; }
      }
      @keyframes popoverInCentered {
        from { opacity: 0; transform: translateY(-50%); }
        to   { opacity: 1; transform: translateY(-50%); }
      }
    }
  `;
  document.head.appendChild(style);
}

// ─── Wrapper that manages activeId state (since SideNav is controlled) ───────
function SideNavDemo({ initialActiveId = "balance_sheet", collapsed: initialCollapsed = false, hideCollapseButton = false }) {
  const [activeId, setActiveId] = useState(initialActiveId);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fafafa",
      fontFamily: "'Red Hat Text', sans-serif" }}>
      <SideNav
        items={NAV_ITEMS}
        activeId={activeId}
        onNavigate={setActiveId}
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
        hideCollapseButton={hideCollapseButton}
        defaultExpanded={{ view: true }}
      />
      <div style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(53,85,160,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={16} height={16} viewBox="0 0 14 14" fill={T.icon.navActive}>
              <rect width={14} height={14} rx={3} opacity={0.2} />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#02060d", margin: 0 }}>
            {activeId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {["Summary", "Details", "History"].map(label => (
            <div key={label} style={{ flex: 1, background: "#fff", borderRadius: 10,
              border: "1px dashed #d8dce8", padding: "24px 20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: 80 }}>
              <span style={{ fontSize: 11, color: "#c4c8d8" }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px dashed #d8dce8",
          padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 72 }}>
          <span style={{ fontSize: 12, color: "#c4c8d8" }}>Content area</span>
        </div>
      </div>
    </div>
  );
}

// ─── Storybook metadata ──────────────────────────────────────────────────────
export default {
  title: "Components/SideNav",
  component: SideNav,
  argTypes: {
    activeId: {
      control: { type: "select" },
      options: ALL_ITEM_IDS,
      description: "ID of the currently active nav item",
    },
    collapsed: {
      control: { type: "boolean" },
      description: "72px icon rail (true) vs 250px expanded (false)",
    },
    hideCollapseButton: {
      control: { type: "boolean" },
      description: "Hides the collapse/expand control (mobile viewport)",
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Persistent vertical navigation panel for Ministry Brands Amplify modules. " +
          "Supports expanded (250px) and collapsed (72px) states, two levels of depth, " +
          "and the full state matrix (base, hover, active, trail-expanded, trail-collapsed). " +
          "See `components/sidenav/sidenav-spec.md` for the full specification.",
      },
    },
  },
};

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Default = (args) => (
  <SideNavDemo
    initialActiveId={args.activeId}
    collapsed={args.collapsed}
    hideCollapseButton={args.hideCollapseButton}
  />
);
Default.args = {
  activeId: "balance_sheet",
  collapsed: false,
  hideCollapseButton: false,
};
Default.parameters = {
  docs: {
    description: {
      story:
        "Interactive SideNav with the Accounting module data. Use the controls panel " +
        "to change the active item, toggle collapsed state, or hide the collapse button. " +
        "Click items directly in the demo to navigate.",
    },
  },
};

export const Collapsed = (args) => (
  <SideNavDemo
    initialActiveId={args.activeId}
    collapsed={true}
    hideCollapseButton={false}
  />
);
Collapsed.args = { activeId: "balance_sheet" };
Collapsed.parameters = {
  docs: {
    description: {
      story:
        "72px icon-only rail. Hover over items to see tooltips (destinations) " +
        "and flyout popovers (groupers with children).",
    },
  },
};

export const TrailState = () => {
  const [activeId, setActiveId] = useState("balance_sheet");
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: "flex", gap: 24, height: "100vh", background: "#fafafa", padding: 24 }}>
      <div>
        <p style={{ fontFamily: "'Red Hat Text', sans-serif", fontSize: 12, color: "#8890b0",
          margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Expanded — "View" grouper shows Trail-expanded
        </p>
        <div style={{ height: "calc(100vh - 80px)", border: "1px solid #edf0f9", borderRadius: 12, overflow: "hidden" }}>
          <SideNav items={NAV_ITEMS} activeId={activeId} onNavigate={setActiveId}
            collapsed={false} onCollapseChange={() => {}} defaultExpanded={{ view: true }} />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: "'Red Hat Text', sans-serif", fontSize: 12, color: "#8890b0",
          margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Collapsed — "View" shows Trail-collapsed (same as Active)
        </p>
        <div style={{ height: "calc(100vh - 80px)", border: "1px solid #edf0f9", borderRadius: 12, overflow: "hidden" }}>
          <SideNav items={NAV_ITEMS} activeId={activeId} onNavigate={setActiveId}
            collapsed={true} onCollapseChange={() => {}} defaultExpanded={{ view: true }} />
        </div>
      </div>
    </div>
  );
};
TrailState.parameters = {
  docs: {
    description: {
      story:
        "Side-by-side comparison of Trail-expanded (left: grouper is open, children visible) " +
        "vs Trail-collapsed (right: grouper closed or sidebar collapsed, active child hidden). " +
        "Both use the same `activeId`.",
    },
  },
};

export const StandaloneDemo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px",
      fontFamily: "'Red Hat Text', sans-serif", fontSize: 12, color: "#8890b0" }}>
      <span>Full reference demo (sidenav.html) — includes responsive breakpoints + spec panel</span>
      <a href="./components/sidenav/sidenav.html" target="_blank" rel="noopener"
        style={{ color: "#3555a0", textDecoration: "none", fontWeight: 500 }}>
        Open in new tab
      </a>
    </div>
    <iframe
      src="./components/sidenav/sidenav.html"
      title="SideNav reference demo"
      style={{ width: "100%", height: 900, border: "1px solid #edf0f9", borderRadius: 12, background: "#fafafa" }}
    />
  </div>
);
StandaloneDemo.parameters = {
  layout: "fullscreen",
  docs: {
    description: {
      story:
        "The original standalone demo (sidenav.html) iframed. This version includes " +
        "responsive breakpoints (resize the iframe) and the spec annotations panel below " +
        "the component. Use the 'Open in new tab' link for full-width testing.",
    },
  },
};
