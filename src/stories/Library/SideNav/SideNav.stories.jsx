/**
 * SideNav — Storybook stories (React framework)
 *
 * Stories are organised so the MDX docs page can render specific ones inline
 * via <Canvas of={...}>. Each story has a narrow purpose:
 *
 *   Playground       — the live, fully-interactive demo at the top of the docs
 *   Collapsed        — 72px rail state
 *   StateMatrix      — visual grid of every nav-item state
 *   NavItemExplorer  — one item with controls for state/label/icon/child
 *   TokensFill       — one item showing each fill token with a visible swatch
 *   TokensText       — one item showing each text-colour token
 *   TokensIcon       — one item showing each icon-colour token
 *   TrailState       — expanded vs collapsed trail side-by-side
 *   StandaloneDemo   — iframe to the full responsive HTML demo
 */
import React, { useState } from "react";
import { SideNav, SideNavItem, IndicatorStripe, T, L } from "../../../../components/sidenav/sidenav.jsx";
import { NAV_ITEMS, ALL_ITEM_IDS } from "./sidenavDemoData.jsx";

// ─── Popover-animation keyframes (once per document) ────────────────────────
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
      @keyframes popoverIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes popoverInCentered {
        from { opacity: 0; transform: translateY(-50%); }
        to   { opacity: 1; transform: translateY(-50%); }
      }
    }
  `;
  document.head.appendChild(style);
}

// ─── Shared demo shell (used by Playground + Collapsed) ─────────────────────
function Shell({ initialActiveId = "balance_sheet", collapsed: initialCollapsed = false, hideCollapseButton = false, height = 600 }) {
  const [activeId, setActiveId] = useState(initialActiveId);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <div style={{ display: "flex", height, background: "#fafafa",
      border: "1px solid #edf0f9", borderRadius: 12, overflow: "hidden",
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
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(53,85,160,0.08)" }} />
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#02060d", margin: 0 }}>
            {activeId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          {["Summary", "Details", "History"].map(label => (
            <div key={label} style={{ flex: 1, background: "#fff", borderRadius: 8,
              border: "1px dashed #d8dce8", padding: 18, minHeight: 60,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "#c4c8d8" }}>{label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Simple container for rendering isolated nav items ──────────────────────
function ItemStage({ width = 280, children, caption, tokens }) {
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif",
      display: "flex", flexDirection: "column", gap: 8 }}>
      {caption && (
        <span style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{caption}</span>
      )}
      <div style={{ width, padding: "12px 12px", background: T.surface.navLight,
        border: `0.5px solid ${T.fill.infoSubtle}`, borderRadius: 8 }}>
        {children}
      </div>
      {tokens && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tokens.map(t => (
            <code key={t} style={{ fontSize: 10, color: "#3555a0",
              background: "rgba(53,85,160,0.07)", padding: "2px 6px",
              borderRadius: 3, fontFamily: "monospace" }}>{t}</code>
          ))}
        </div>
      )}
    </div>
  );
}

// Render a single SideNavItem (no popovers, no state wiring) for showcase purposes
function IsolatedItem(props) {
  return (
    <SideNavItem
      item={props.item}
      isActive={!!props.isActive}
      isTrail={!!props.isTrail}
      isExpanded={!!props.isExpanded}
      isSidebarCollapsed={!!props.isSidebarCollapsed}
      isChild={!!props.isChild}
      onClick={() => {}}
      onToggle={() => {}}
      activeId={null}
    />
  );
}

// ─── Storybook metadata ─────────────────────────────────────────────────────
export default {
  title: "Components/SideNav",
  component: SideNav,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Persistent vertical navigation panel for Ministry Brands Amplify modules. Two levels " +
          "of depth, two sidebar widths (250 px expanded, 72 px collapsed), three responsive " +
          "modes (push / overlay / hidden-overlay). See the full specification for every token, " +
          "state rule, and ARIA attribute.",
      },
    },
  },
  argTypes: {
    activeId: {
      name: "Active item",
      control: { type: "select" },
      options: ALL_ITEM_IDS,
      description: "ID of the destination that's currently active (`aria-current=\"page\"`).",
    },
    collapsed: {
      name: "Sidebar collapsed?",
      control: { type: "boolean" },
      description: "Toggle between 250 px expanded and 72 px icon-only rail.",
    },
    hideCollapseButton: {
      name: "Hide the collapse control",
      control: { type: "boolean" },
      description: "Hides the Collapse/Expand button entirely. Used on mobile (<768 px) where there is no 72 px rail state.",
    },
  },
};

// ─── Primary story ──────────────────────────────────────────────────────────
export const Playground = (args) => (
  <Shell
    initialActiveId={args.activeId}
    collapsed={args.collapsed}
    hideCollapseButton={args.hideCollapseButton}
    height={600}
  />
);
Playground.args = {
  activeId: "balance_sheet",
  collapsed: false,
  hideCollapseButton: false,
};
Playground.parameters = {
  docs: {
    description: {
      story:
        "Interactive demo. Click items directly to navigate, or use the controls panel below " +
        "to change the active item, toggle the collapsed state, or hide the collapse button. " +
        "Every interaction you'd do in a real app is wired up here.",
    },
  },
};

// ─── Collapsed rail showcase ────────────────────────────────────────────────
export const Collapsed = () => (
  <Shell initialActiveId="balance_sheet" collapsed={true} height={600} />
);
Collapsed.parameters = {
  docs: {
    description: {
      story:
        "The 72 px icon rail. Hover over items to see tooltips (destinations) or flyout popovers (groupers with children). " +
        "Tap a grouper to navigate — it does not expand in-place at 72 px.",
    },
  },
};

// ─── Visual state matrix ────────────────────────────────────────────────────
export const StateMatrix = () => {
  const sampleDest  = { id: "reports", label: "Reports", icon: NAV_ITEMS[4].icon };
  const sampleGroup = { id: "view",    label: "View",    icon: NAV_ITEMS[3].icon, children: [{}] };

  const rows = [
    {
      name: "Base",
      when: "Resting — not hovered, not active",
      item: <IsolatedItem item={sampleDest} />,
      tokens: ["Fill/NavItem/Base", "Text/NavItem/Base", "Icon/NavItem/Base"],
    },
    {
      name: "Hover",
      when: "Pointer is over the item",
      // We force the hover state by wrapping in a div that simulates :hover via inline style
      item: (
        <div style={{ display: "flex", alignItems: "center", minHeight: L.itemH, width: "100%",
          borderRadius: T.radius, backgroundColor: T.fill.navHover, cursor: "pointer", overflow: "hidden" }}>
          <IndicatorStripe visible={false} />
          <div style={{ width: L.iconWrap, height: L.iconWrap, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
            marginLeft: L.rowPadH, color: T.icon.navHover }}>
            {sampleDest.icon({ size: L.iconInner, color: T.icon.navHover })}
          </div>
          <div style={{ flex: 1, paddingLeft: L.textPad, paddingRight: L.rowPadH, overflow: "hidden" }}>
            <p style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 500, fontSize: 16,
              lineHeight: "22px", color: T.text.navHover, margin: 0, whiteSpace: "nowrap" }}>
              {sampleDest.label}
            </p>
          </div>
        </div>
      ),
      tokens: ["Fill/NavItem/Hover", "Text/NavItem/Hover", "Icon/NavItem/Hover"],
    },
    {
      name: "Active destination",
      when: "The item is the current page — `aria-current=\"page\"`",
      item: <IsolatedItem item={sampleDest} isActive />,
      tokens: ["Fill/NavItem/Active", "Text/NavItem/Active", "Icon/NavItem/Active", "indicator.stripe visible"],
    },
    {
      name: "Trail — expanded",
      when: "A grouper whose children are open. Applies regardless of which child (if any) is active.",
      item: <IsolatedItem item={sampleGroup} isExpanded />,
      tokens: ["Fill/NavItem/Trail", "Text/NavItem/Active", "Icon/NavItem/Base", "(no stripe)"],
    },
    {
      name: "Trail — collapsed",
      when: "A grouper whose child is active, but the children are hidden (grouper closed or sidebar at 72 px). Visually identical to Active.",
      item: <IsolatedItem item={sampleGroup} isTrail />,
      tokens: ["Fill/NavItem/Active", "Text/NavItem/Active", "Icon/NavItem/Active", "indicator.stripe visible"],
    },
  ];

  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
      {rows.map(row => (
        <div key={row.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#02060d", margin: "0 0 3px" }}>{row.name}</p>
            <p style={{ fontSize: 12, color: "#8890b0", margin: 0 }}>{row.when}</p>
          </div>
          <div style={{ padding: "10px 12px", background: T.surface.navLight,
            border: `0.5px solid ${T.fill.infoSubtle}`, borderRadius: 8 }}>
            {row.item}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {row.tokens.map(t => (
              <code key={t} style={{ fontSize: 10, color: "#3555a0",
                background: "rgba(53,85,160,0.07)", padding: "2px 6px", borderRadius: 3,
                fontFamily: "monospace" }}>{t}</code>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
StateMatrix.parameters = {
  docs: {
    description: {
      story:
        "Five states. Each card shows the actual rendered item plus the tokens that drive it. Trail-expanded and Trail-collapsed are the two flavours of \"this grouper has something active inside it\" — expanded is muted (chevron still visible), collapsed is indistinguishable from Active.",
    },
  },
};

// ─── Single-item explorer (interactive per-item) ────────────────────────────
export const NavItemExplorer = (args) => {
  const sample = args.isChild
    ? { id: "child", label: args.label }
    : { id: "demo", label: args.label, icon: NAV_ITEMS[4].icon };
  const groupSample = { ...sample, children: [{ id: "x", label: "Child" }] };
  const item = args.asGrouper ? groupSample : sample;

  return (
    <ItemStage width={280} caption={`${args.state} · ${args.isChild ? "Level 1 child" : args.asGrouper ? "Level 0 grouper" : "Level 0 destination"}`}>
      <SideNavItem
        item={item}
        isActive={args.state === "active"}
        isTrail={args.state === "trail-expanded" || args.state === "trail-collapsed"}
        isExpanded={args.state === "trail-expanded"}
        isSidebarCollapsed={false}
        isChild={!!args.isChild}
        onClick={() => {}}
        onToggle={() => {}}
        activeId={null}
      />
    </ItemStage>
  );
};
NavItemExplorer.args = {
  label: "Balance Sheet",
  state: "active",
  asGrouper: false,
  isChild: false,
};
NavItemExplorer.argTypes = {
  label: { name: "Label", control: { type: "text" } },
  state: {
    name: "State",
    control: { type: "select" },
    options: ["base", "active", "trail-expanded", "trail-collapsed"],
    description: "State to render the item in. `hover` is not a variant — it's triggered by pointer input, so use the Playground story to see it live.",
  },
  asGrouper: {
    name: "Is grouper?",
    control: { type: "boolean" },
    description: "Adds a chevron and makes it a Level 0 parent that can expand.",
  },
  isChild: {
    name: "Is child (Level 1)?",
    control: { type: "boolean" },
    description: "Render as a child destination — no icon, deeper indent, shorter label weight.",
  },
};
NavItemExplorer.parameters = {
  docs: {
    description: {
      story:
        "A single nav item in isolation. Change the state, the label, whether it's a grouper or a child, and watch the tokens repaint. This is the smallest unit you can use to sanity-check a new label's visual weight or an edge-case state.",
    },
  },
};

// ─── Token showcases — each row: token name · swatch · element using it ─────
const FILL_ROWS = [
  { token: "Fill/Contextual/NavItem/Base",   value: T.fill.navBase,   hex: "#fafafa" },
  { token: "Fill/Contextual/NavItem/Hover",  value: T.fill.navHover,  hex: "#1111110a" },
  { token: "Fill/Contextual/NavItem/Active", value: T.fill.navActive, hex: "#3555a014" },
  { token: "Fill/Contextual/NavItem/Trail",  value: T.fill.navTrail,  hex: "#11111105" },
  { token: "Fill/Static/Info/Subtle",        value: T.fill.infoSubtle, hex: "#edf0f9" },
];
const TEXT_ROWS = [
  { token: "Text/Contextual/NavItem/Base",   value: T.text.navBase,   hex: "#363636" },
  { token: "Text/Contextual/NavItem/Hover",  value: T.text.navHover,  hex: "#252525" },
  { token: "Text/Contextual/NavItem/Active", value: T.text.navActive, hex: "#051428" },
];
const ICON_ROWS = [
  { token: "Icon/Contextual/NavItem/Base",   value: T.icon.navBase,   hex: "#4b4b4b" },
  { token: "Icon/Contextual/NavItem/Hover",  value: T.icon.navHover,  hex: "#363636" },
  { token: "Icon/Contextual/NavItem/Active", value: T.icon.navActive, hex: "#3555a0" },
];

function TokenRow({ token, value, hex }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 100px",
      gap: 16, alignItems: "center", padding: "10px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text',sans-serif" }}>
      <code style={{ fontSize: 12, color: "#3555a0", fontFamily: "monospace" }}>{token}</code>
      <div style={{ width: "100%", height: 32, borderRadius: 6,
        background: value, border: "1px solid rgba(0,0,0,0.07)" }} />
      <code style={{ fontSize: 12, color: "#555", fontFamily: "monospace" }}>{hex}</code>
    </div>
  );
}

export const TokensFill = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      The five fill tokens applied to nav items and container surfaces. Trail and Hover look similar but are distinct: Hover is 4% black, Trail is 2% black — kept separate so future tuning doesn't need to choose.
    </p>
    {FILL_ROWS.map(r => <TokenRow key={r.token} {...r} />)}
  </div>
);
TokensFill.parameters = {
  docs: { description: { story: "Fill tokens used by nav items and the container border." } },
};

export const TokensText = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Three text tokens. Active is also used for <em>every</em> trail state — there is no separate trail-text token.
    </p>
    {TEXT_ROWS.map(r => <TokenRow key={r.token} {...r} />)}
  </div>
);

export const TokensIcon = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Three icon tokens. The Active token (#3555a0) is also the colour of the indicator stripe.
    </p>
    {ICON_ROWS.map(r => <TokenRow key={r.token} {...r} />)}
  </div>
);

// ─── Trail comparison ───────────────────────────────────────────────────────
export const TrailComparison = () => {
  const [activeId] = useState("balance_sheet");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
      fontFamily: "'Red Hat Text', sans-serif" }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#4b4b4b",
          margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Expanded — "View" is trail-expanded
        </p>
        <div style={{ height: 480, border: "1px solid #edf0f9", borderRadius: 8, overflow: "hidden" }}>
          <SideNav items={NAV_ITEMS} activeId={activeId} onNavigate={() => {}}
            collapsed={false} onCollapseChange={() => {}} defaultExpanded={{ view: true }} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#4b4b4b",
          margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Collapsed — "View" is trail-collapsed (visually identical to Active)
        </p>
        <div style={{ height: 480, border: "1px solid #edf0f9", borderRadius: 8, overflow: "hidden" }}>
          <SideNav items={NAV_ITEMS} activeId={activeId} onNavigate={() => {}}
            collapsed={true} onCollapseChange={() => {}} defaultExpanded={{ view: true }} />
        </div>
      </div>
    </div>
  );
};
TrailComparison.parameters = {
  docs: {
    description: {
      story:
        "Same `activeId=\"balance_sheet\"` (child of View) in both panels. Left: the grouper shows trail-expanded (muted fill, active-coloured text, grey icon). Right: the grouper shows trail-collapsed — indistinguishable from a regular Active state.",
    },
  },
};

// ─── Responsive iframe to the full demo ─────────────────────────────────────
export const StandaloneDemo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between",
      fontFamily: "'Red Hat Text', sans-serif", fontSize: 12, color: "#8890b0" }}>
      <span>The full reference demo — includes the TopNav, responsive breakpoints, and the spec annotations panel below the component.</span>
      <a href="./components/sidenav/sidenav.html" target="_blank" rel="noopener"
        style={{ color: "#3555a0", textDecoration: "none", fontWeight: 500 }}>
        Open in new tab ↗
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
        "The full standalone demo, iframed. Resize the iframe or pop out to a new tab to see responsive behaviour across all three breakpoints.",
    },
  },
};
