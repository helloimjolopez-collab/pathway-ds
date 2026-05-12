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
import { SideNav, SideNavItem, SectionLabel, IndicatorStripe, T, L } from "../../../../components/sidenav/sidenav.jsx";
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
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(160,181,230,0.16)" }} />
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
            <code key={t} style={{ fontSize: 10, color: "#2d4889",
              background: "rgba(160,181,230,0.16)", padding: "2px 6px",
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
          "of depth, two sidebar widths (240 px expanded, 72 px collapsed), three responsive " +
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
      description: "Toggle between 240 px expanded and 72 px icon-only rail.",
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
            <p style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 500, fontSize: 14,
              lineHeight: "20px", letterSpacing: "0.3px", color: T.text.navHover, margin: 0, whiteSpace: "nowrap" }}>
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
              <code key={t} style={{ fontSize: 10, color: "#2d4889",
                background: "rgba(160,181,230,0.16)", padding: "2px 6px", borderRadius: 3,
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
  { token: "Fill/Contextual/NavItem/Base",      value: T.fill.navBase,   hex: "#fafafa",   role: "Nav item resting state" },
  { token: "Fill/Contextual/NavItem/Hover",     value: T.fill.navHover,  hex: "#11111105", role: "Nav item pointer-over (~4% black)" },
  { token: "Fill/Contextual/NavItem/Active",    value: T.fill.navActive, hex: "#a0b5e629", role: "Active destination + Trail-collapsed" },
  { token: "Fill/Contextual/NavItem/Trail",     value: T.fill.navTrail,  hex: "#11111105", role: "Trail-expanded grouper (~4% black, distinct from Hover)" },
  { token: "Stroke/Static/Neutral/Light",       value: T.fill.infoSubtle, hex: "#f6f6f6", role: "Container right border · Popover border · Divider" },
];
const TEXT_ROWS = [
  { token: "Text/Contextual/NavItem/Base",   value: T.text.navBase,   hex: "#313131", role: "Resting label" },
  { token: "Text/Contextual/NavItem/Hover",  value: T.text.navHover,  hex: "#252525", role: "Hovered label" },
  { token: "Text/Contextual/NavItem/Active", value: T.text.navActive, hex: "#1b2d57", role: "Active + all trail states (no separate trail-text token)" },
];
const ICON_ROWS = [
  { token: "Icon/Contextual/NavItem/Base",           value: T.icon.navBase,          hex: "#484848", role: "Leading icon resting" },
  { token: "Icon/Contextual/NavItem/Hover",          value: T.icon.navHover,         hex: "#313131", role: "Leading icon hovered" },
  { token: "Icon/Contextual/NavItem/Active",         value: T.icon.navActive,        hex: "#2d4889", role: "Leading icon active — also indicator stripe" },
  { token: "Icon/Action/Secondary Inverse/Base",     value: T.icon.actionSecondary,  hex: "#6b6b6b", role: "CollapseButton action icon (right_panel_open / left_panel_open)" },
];

function TokenRow({ token, value, hex, role }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 80px 100px 1fr",
      gap: 12, alignItems: "center", padding: "10px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text',sans-serif" }}>
      <code style={{ fontSize: 12, color: "#2d4889", fontFamily: "monospace" }}>{token}</code>
      <div style={{ width: 64, height: 28, borderRadius: 6,
        background: value, border: "1px solid rgba(0,0,0,0.07)" }} />
      <code style={{ fontSize: 12, color: "#555", fontFamily: "monospace" }}>{hex}</code>
      {role && <span style={{ fontSize: 11, color: "#8890b0" }}>{role}</span>}
    </div>
  );
}

export const TokensFill = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Five fill tokens applied to nav items and container surfaces. Hover and Trail both resolve to <code>#11111105</code> (≈4% black) but are kept as distinct tokens — they've diverged before and can again.
      The border/divider token changed from <code>Fill/Static/Info/Subtle</code> to <code>Stroke/Static/Neutral/Light</code> (<code>#f6f6f6</code>) in the 2026-05-12 Figma update.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "300px 80px 100px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4 }}>
      {["Token", "Swatch", "Hex", "Role"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {FILL_ROWS.map(r => <TokenRow key={r.token} {...r} />)}
  </div>
);
TokensFill.parameters = {
  docs: { description: { story: "Fill tokens used by nav items and the container border/divider." } },
};

export const TokensText = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Three text tokens. Active is also used for <em>every</em> trail state — there is no separate trail-text token.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "300px 80px 100px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4 }}>
      {["Token", "Swatch", "Hex", "Role"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {TEXT_ROWS.map(r => <TokenRow key={r.token} {...r} />)}
  </div>
);

export const TokensIcon = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Four icon tokens. The NavItem/Active token (<code>#2d4889</code>) is also the colour of the indicator stripe.
      The <code>Icon/Action/Secondary Inverse/Base</code> token (<code>#6b6b6b</code>) is new as of 2026-05-12 — it drives the CollapseButton's action icon (right_panel_open / left_panel_open) and does not change on hover.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "300px 80px 100px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4 }}>
      {["Token", "Swatch", "Hex", "Role"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {ICON_ROWS.map(r => <TokenRow key={r.token} {...r} />)}
  </div>
);

// ─── Typography tokens ──────────────────────────────────────────────────────
const TYPOGRAPHY_ROWS = [
  {
    token: "Label/Menu/Base/Medium",
    role: "Nav item label — Level 0 and Level 1",
    value: "14px / 500 / 20px / 0.3px",
    sample: (
      <span style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 500,
        fontSize: 14, lineHeight: "20px", letterSpacing: "0.3px", color: T.text.navBase }}>
        Balance Sheet
      </span>
    ),
  },
  {
    token: "Label/Section/Small/Semibold",
    role: "SectionLabel — CollapsedPopover group header",
    value: "11px / 600 / 16px / 0.6px · uppercase",
    sample: <SectionLabel label="Planning" />,
  },
  {
    token: "Text/Body/S/Regular (Tooltip)",
    role: "SideNavTooltip label text",
    value: "14px / 400 / 20px / 0.02px",
    sample: (
      <span style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 400,
        fontSize: 14, lineHeight: "20px", letterSpacing: "0.02px", color: "#202020" }}>
        Reports
      </span>
    ),
  },
];

function TypographyRow({ token, role, value, sample }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 160px",
      gap: 16, alignItems: "center", padding: "12px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text',sans-serif" }}>
      <div>
        <code style={{ fontSize: 12, color: "#2d4889", fontFamily: "monospace", display: "block" }}>{token}</code>
        <span style={{ fontSize: 11, color: "#8890b0", marginTop: 2, display: "block" }}>{role}</span>
      </div>
      <div style={{ padding: "4px 8px", background: T.surface.navLight,
        border: `0.5px solid ${T.fill.infoSubtle}`, borderRadius: 6 }}>
        {sample}
      </div>
      <code style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>{value}</code>
    </div>
  );
}

export const TokensTypography = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Three type styles used by the SideNav. All use Red Hat Text. Nav item labels apply
      {" "}<code>Label/Menu/Base/Medium</code> at every level — Level 1 hierarchy comes from
      the indent, not a smaller font.
    </p>
    {TYPOGRAPHY_ROWS.map(r => <TypographyRow key={r.token} {...r} />)}
  </div>
);
TokensTypography.parameters = {
  docs: { description: { story: "Typography tokens applied across all SideNav text elements." } },
};

// ─── Spacing tokens ─────────────────────────────────────────────────────────
const SPACING_ROWS = [
  { name: "Nav container padding H",  value: "16px",  token: "— (no token)",  role: "px-[16px] on SideNav.Container (updated from 12px, 2026-05-12)" },
  { name: "Nav container padding V",  value: "12px",  token: "— (no token)",  role: "py-[12px] on SideNav.Container (updated from 14px, 2026-05-12)" },
  { name: "Item min-height",          value: "48px",  token: "Accessibility/Touch Target/Optimal", role: "WCAG 2.5.5 minimum — enforced on every item" },
  { name: "Icon wrapper size",        value: "24px",  token: "Accessibility/Icon Wrapping/Large",  role: "Container.LeadingIcon" },
  { name: "Leading-icon glyph",       value: "16px",  token: "— (no token)",  role: "Icon.Leading inside wrapper" },
  { name: "SideNavMenu item gap",     value: "0px",   token: "— (no token)",  role: "gap-[0px] on SideNavMenu (updated from 8px — items flush, spacing from padding)" },
  { name: "Bottom spacer (menuPadB)", value: "56px",  token: "— (no token)",  role: "Space before CollapseButton (updated from 24px, 2026-05-12)" },
  { name: "Row horizontal padding",   value: "8px",   token: "— (no token)",  role: "Container.rowStart px-[8px]" },
  { name: "Label text padding",       value: "6px",   token: "— (no token)",  role: "text.label px-[6px]" },
  { name: "Level 1 indent",           value: "32px",  token: "— (no token)",  role: "rowStart 8px + container.main 24px" },
  { name: "Indicator stripe width",   value: "4px",   token: "— (no token)",  role: "indicator.stripe — always in DOM, structural" },
  { name: "SectionLabel padding L",   value: "12px",  token: "Padding/Tight",  role: "CollapsedPopover section header" },
  { name: "SectionLabel padding V",   value: "8px",   token: "Padding/XTight", role: "CollapsedPopover section header" },
  { name: "Expanded sidebar width",   value: "240px", token: "— (no token)",  role: "SideNav.Container expanded (updated from 220px, 2026-05-12)" },
  { name: "Collapsed sidebar width",  value: "72px",  token: "— (no token)",  role: "SideNav.Container collapsed rail" },
];

function SpacingRow({ name, value, token, role }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 60px 260px 1fr",
      gap: 12, alignItems: "center", padding: "8px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text',sans-serif" }}>
      <span style={{ fontSize: 12, color: "#313131" }}>{name}</span>
      <code style={{ fontSize: 12, fontWeight: 600, color: "#2d4889", fontFamily: "monospace" }}>{value}</code>
      <code style={{ fontSize: 11, color: token.startsWith("—") ? "#c00" : "#2d4889",
        fontFamily: "monospace" }}>{token}</code>
      <span style={{ fontSize: 11, color: "#8890b0" }}>{role}</span>
    </div>
  );
}

export const TokensSpacing = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Spacing and layout values. Most are raw px — no spacing token family exists yet in the
      Pathway token file (tracked as a MEDIUM-priority gap). Red token names = no token; black = real token.
    </p>
    {SPACING_ROWS.map(r => <SpacingRow key={r.name} {...r} />)}
  </div>
);
TokensSpacing.parameters = {
  docs: { description: { story: "Spacing and layout values used by the SideNav. Most are raw px — spacing tokens are a pending gap." } },
};

// ─── Motion tokens ──────────────────────────────────────────────────────────
const MOTION_ROWS = [
  { name: "Panel width",         duration: "360ms", standard: "short (300ms)", curve: "cubic-bezier(0.4,0,0.2,1)", token: "Motion/SideNav/Panel/Width",       rationale: "Full-panel width; 300ms reads abrupt" },
  { name: "Label fade",          duration: "180ms", standard: "instant (150ms)", curve: "ease",                     token: "Motion/SideNav/Label/Fade",       rationale: "Labels begin fading before panel finishes" },
  { name: "Overlay enter",       duration: "380ms", standard: "short (300ms)",   curve: "cubic-bezier(0,0,0.2,1)", token: "Motion/SideNav/Overlay/Enter",    rationale: "Full-height panel gliding in; 300ms feels mechanical" },
  { name: "Overlay exit",        duration: "300ms", standard: "short (300ms)",   curve: "cubic-bezier(0.4,0,0.6,1)", token: "Motion/SideNav/Overlay/Exit",  rationale: "Matches standard — exits are snappier by design" },
  { name: "Item colour/fill",    duration: "150ms", standard: "instant (150ms)", curve: "ease",                     token: "— (standard)",                  rationale: "Hover/active fill and colour transitions" },
  { name: "Popover enter",       duration: "150ms", standard: "instant (150ms)", curve: "cubic-bezier(0,0,0.2,1)", token: "— (standard)",                  rationale: "Tooltip and flyout popover appear" },
  { name: "Scrim",               duration: "280ms", standard: "short (300ms)",   curve: "cubic-bezier(0.4,0,0.2,1)", token: "— (standard ~)",              rationale: "Overlay scrim fade" },
];

function MotionRow({ name, duration, standard, curve, token, rationale }) {
  const isOverride = !token.startsWith("—");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 70px 130px 260px 1fr",
      gap: 12, alignItems: "center", padding: "8px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text',sans-serif" }}>
      <span style={{ fontSize: 12, color: "#313131", fontWeight: isOverride ? 600 : 400 }}>{name}</span>
      <code style={{ fontSize: 12, fontWeight: 600,
        color: isOverride ? "#2d4889" : "#555", fontFamily: "monospace" }}>{duration}</code>
      <span style={{ fontSize: 11, color: "#8890b0" }}>{standard}</span>
      <code style={{ fontSize: 11, color: isOverride ? "#2d4889" : "#999", fontFamily: "monospace" }}>{token}</code>
      <span style={{ fontSize: 11, color: "#8890b0" }}>{rationale}</span>
    </div>
  );
}

export const TokensMotion = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Motion durations for the SideNav. Bold blue entries are approved contextual overrides — they
      intentionally exceed the system-wide standard (see overarching spec §2.4 and sidenav-spec §14).
      All motion is suppressed to 150ms linear opacity fades under{" "}
      <code style={{ fontSize: 12 }}>prefers-reduced-motion: reduce</code>.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "160px 70px 130px 260px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4 }}>
      {["Property", "Duration", "Standard", "Token", "Rationale"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {MOTION_ROWS.map(r => <MotionRow key={r.name} {...r} />)}
  </div>
);
TokensMotion.parameters = {
  docs: { description: { story: "Motion durations for all animated parts of the SideNav. Blue = approved contextual override above system standard." } },
};

// ─── Radius tokens ──────────────────────────────────────────────────────────
const RADIUS_ROWS = [
  { name: "Nav item",           value: "8px",  token: "Radius/M",             role: "SideNavItem.Container border-radius" },
  { name: "Indicator stripe",   value: "8px",  token: "Radius/M",             role: "indicator.stripe border-radius (0 top-left, 8px top-right, 8px bottom-right, 0 bottom-left)" },
  { name: "CollapseButton",     value: "8px",  token: "Radius/M",             role: "CollapseButton row border-radius" },
  { name: "PopoverRow item",    value: "8px",  token: "Radius/M",             role: "PopoverRow within CollapsedPopover" },
  { name: "CollapsedPopover",   value: "8px",  token: "Radius/M",             role: "CollapsedPopover panel border-radius" },
  { name: "SideNavTooltip",     value: "8px",  token: "Radius/M",             role: "Destination tooltip border-radius" },
  { name: "SideNav.Container",  value: "0px",  token: "— (no token)",         role: "Panel itself has no radius — flush with viewport/module edges" },
];

function RadiusRow({ name, value, token, role }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 60px 200px 1fr",
      gap: 12, alignItems: "center", padding: "8px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text',sans-serif" }}>
      <span style={{ fontSize: 12, color: "#313131" }}>{name}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 28, height: 28, border: "1.5px solid #2d4889",
          borderRadius: parseInt(value) || 0, background: "rgba(160,181,230,0.12)" }} />
        <code style={{ fontSize: 12, fontWeight: 600, color: "#2d4889", fontFamily: "monospace" }}>{value}</code>
      </div>
      <code style={{ fontSize: 11, color: token.startsWith("—") ? "#bbb" : "#2d4889",
        fontFamily: "monospace" }}>{token}</code>
      <span style={{ fontSize: 11, color: "#8890b0" }}>{role}</span>
    </div>
  );
}

export const TokensRadius = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 8px" }}>
      Radius values used across all SideNav surfaces. All interactive elements use{" "}
      <code style={{ fontSize: 12 }}>Radius/M</code> (8px). The container panel itself has no radius
      — it is flush with the module layout edge.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "180px 60px 200px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4 }}>
      {["Element", "Value", "Token", "Role"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {RADIUS_ROWS.map(r => <RadiusRow key={r.name} {...r} />)}
  </div>
);
TokensRadius.parameters = {
  docs: { description: { story: "Border-radius values for all SideNav surfaces. Everything interactive is Radius/M (8px); the panel itself is flush." } },
};

// ─── Section Label showcase ─────────────────────────────────────────────────
export const SectionLabelStory = () => (
  <div style={{ fontFamily: "'Red Hat Text',sans-serif", display: "flex", flexDirection: "column", gap: 24 }}>
    <div>
      <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 12px" }}>
        The <strong>SectionLabel</strong> (Figma node 40006794-5977) is a building block used as the
        header row inside the CollapsedPopover flyout. It renders the grouper's label in uppercase
        small-semibold type, separated from the child items by a bottom divider.
      </p>
      <div style={{ width: 220, border: "0.5px solid #ededed", borderRadius: 8,
        background: "#fff", boxShadow: "2px 2px 8px 4px rgba(0,0,0,0.03)", padding: 6 }}>
        <div style={{ borderBottom: "0.5px solid #ededed" }}>
          <SectionLabel label="Applications" />
        </div>
        {["Overview", "Installed", "Scheduled"].map(label => (
          <div key={label} style={{ display: "flex", alignItems: "center", minHeight: 40,
            borderRadius: 8, padding: "0 8px", cursor: "pointer" }}>
            <div style={{ width: 4, alignSelf: "stretch", borderRadius: "0 4px 4px 0",
              backgroundColor: "transparent", flexShrink: 0 }} />
            <span style={{ padding: "0 8px", fontFamily: "'Red Hat Text',sans-serif", fontWeight: 400,
              fontSize: 14, lineHeight: "20px", letterSpacing: "0.02px", color: T.text.navBase }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#4b4b4b",
        textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Token reference</p>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: "8px 16px",
        alignItems: "center", fontSize: 12 }}>
        <code style={{ fontFamily: "monospace", color: "#2d4889" }}>Text/Static/Secondary/Light</code>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: T.text.secondary,
          border: "1px solid rgba(0,0,0,0.07)" }} />
        <span style={{ color: "#555" }}>#7b7b7b — label colour</span>
        <code style={{ fontFamily: "monospace", color: "#2d4889" }}>Label/Section/Small/Semibold</code>
        <span style={{ color: "#8890b0", fontSize: 11 }}>—</span>
        <span style={{ color: "#555" }}>11px / 600 / 16px / 0.6px letter-spacing / uppercase</span>
        <code style={{ fontFamily: "monospace", color: "#2d4889" }}>Padding/Tight</code>
        <span style={{ color: "#8890b0", fontSize: 11 }}>—</span>
        <span style={{ color: "#555" }}>12px — left padding</span>
        <code style={{ fontFamily: "monospace", color: "#2d4889" }}>Padding/XTight</code>
        <span style={{ color: "#8890b0", fontSize: 11 }}>—</span>
        <span style={{ color: "#555" }}>8px — vertical padding</span>
      </div>
    </div>
  </div>
);
SectionLabelStory.storyName = "SectionLabel";
SectionLabelStory.parameters = {
  docs: { description: { story: "The SectionLabel building block (Figma 40006794-5977) — header row for the collapsed flyout popover." } },
};

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
        style={{ color: "#2d4889", textDecoration: "none", fontWeight: 500 }}>
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
