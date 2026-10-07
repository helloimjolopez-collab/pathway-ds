/**
 * Dashboard.
 *
 * Behaviour and layout measured off the canonical demo on 2026-10-07:
 * https://helloimjolopez-collab.github.io/design-sandbox/phase-2/Widget%20Container%20Demo/
 *
 * The catalogue below mirrors the demo's own: an app badge, a category, and a
 * one-line description per entry, which is what its cards show.
 */
import React, { useState } from "react";
import { Dashboard } from "../../../../components/dashboard/dashboard.jsx";
import { WidgetKeyframes, SIZES } from "../../../../components/widget/widget.jsx";
// The dashboard puts the BUILDING BLOCK inside its widgets, not a KPI Tile: a
// KPI Tile is itself a card, and a card inside a widget would be a card inside
// a card inside a card.
import { KpiNumberAndTrend, Change } from "../../../../components/kpi-tile/kpi-number-trend.jsx";
import { BarChart, SAMPLE_STACKS } from "../../../../components/kpi-tile/bar-chart.jsx";
import { MiniChart, SAMPLE_SERIES, SAMPLE_MARKERS, curveFor } from "../../../../components/kpi-tile/mini-chart.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;

const GL = { short: "GL", name: "General Ledger" };
const PR = { short: "PR", name: "Payroll" };
const AR = { short: "AR", name: "Receivables" };

const CATALOGUE = [
  { id: "finkpi", name: "Financial KPIs", app: GL, category: "Overview", repeatable: false,
    description: "Income, expenses and net income year-to-date, each with its trend vs last year. Full-width band, one size.",
    defaultSize: "band", supportedSizes: ["band", "detail"] },
  { id: "bank", name: "Bank Balances", app: GL, category: "Cash & banking",
    description: "Every account with its balance, flagged when overdrawn or unreconciled.",
    defaultSize: "detail", supportedSizes: ["detail", "explore"] },
  { id: "deposits", name: "Deposits on Hand", app: GL, category: "Cash & banking",
    description: "Undeposited funds and how long they have been waiting.",
    defaultSize: "glance", supportedSizes: ["glance", "detail"] },
  { id: "budget", name: "Budget Compared to Actual", app: GL, category: "Overview",
    description: "Spend against budget for the period, by fund.",
    defaultSize: "explore", supportedSizes: ["detail", "explore"] },
  { id: "payroll", name: "Payroll Distributions", app: PR, category: "Payroll",
    description: "Where this period's payroll landed, by department and pay type.",
    defaultSize: "detail", supportedSizes: ["detail", "explore"] },
  { id: "pto", name: "Payroll Scheduled Time Off", app: PR, category: "Payroll",
    description: "Approved and pending time off across the next pay periods.",
    defaultSize: "detail", supportedSizes: ["detail"] },
  { id: "ar", name: "Receivable Invoices Outstanding", app: AR, category: "Receivables & payables",
    description: "What is owed to you, aged, with the oldest first.",
    defaultSize: "detail", supportedSizes: ["detail", "explore"] },
  { id: "giving", name: "Giving by Fund", app: GL, category: "Giving",
    description: "This period's giving split by fund, with the prior period behind it.",
    defaultSize: "detail", supportedSizes: ["glance", "detail", "explore"] },
];

const INITIAL = [
  { id: "sys", name: "Accounting Home", type: "system", isDefault: true, widgets: [
    { id: "w0", catalogueId: "finkpi",   title: "Financial KPIs", size: "band" },
    { id: "w1", catalogueId: "deposits", title: "Deposits on Hand", size: "glance" },
    { id: "w2", catalogueId: "bank",     title: "Bank Balances", size: "detail" },
    { id: "w3", catalogueId: "budget",   title: "Budget Compared to Actual", size: "explore" },
  ]},
  { id: "mine", name: "My board", type: "custom", isDefault: false, widgets: [
    { id: "m1", catalogueId: "payroll", title: "Payroll Distributions", size: "detail" },
  ]},
];

/** The KPI band: one heading over a row of tiles, as the demo's Financial KPIs. */
const BAND = [
  ["Total income",   "$1,284,500", "6.2%",  "up",   true],
  ["Total expenses", "$1,097,800", "4.1%",  "up",   false],
  ["Net income",     "$186,700",   "21.3%", "up",   true],
];

function renderWidget(w) {
  if (w.catalogueId === "finkpi") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${BAND.length}, minmax(0, 1fr))`,
        gap: U("gap-tight"), flex: 1, minHeight: 0 }}>
        {BAND.map(([label, value, pct, dir, fav]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", justifyContent: "center",
            minWidth: 0, padding: U("padding-xtight"),
            border: `1px solid var(--semantic-color-stroke-static-neutral-faint)`,
            borderRadius: U("cornerradius-base") }}>
            <KpiNumberAndTrend eyebrow={label} value={value}
              change={<Change type="04" value={pct} direction={dir} favourable={fav}
                note="vs previous yr" onCompareClick={() => {}} />} />
          </div>
        ))}
      </div>
    );
  }
  if (w.size === "glance") {
    return (
      <KpiNumberAndTrend eyebrow="Undeposited" value="$3,940"
        change={<Change type="04" value="2 days" direction="down" favourable={false} note="oldest" />}
        chart={<MiniChart series={SAMPLE_SERIES["realistic-01"]} direction="up"
          curve={curveFor("realistic-01")} markerIndex={SAMPLE_MARKERS["realistic-01"]} />} />
    );
  }
  // Detail and Explore are mostly chart by area, so they get a real one.
  return (
    <>
      <KpiNumberAndTrend numberStyle="wide" value="$4,948,850"
        change={<Change type="02" value="1.8%" direction="up"
          note="vs previous period" onCompareClick={() => {}} />} />
      {w.size === "explore" ? (
        <div style={{ display: "flex", gap: U("gap-base"), flex: 1, minHeight: 0 }}>
          <BarChart stacks={SAMPLE_STACKS} label={`${w.title} by month`} />
          <BarChart stacks={SAMPLE_STACKS} axes yTitle="Amount" xTitle="Month"
            label={`${w.title} by month and series`} />
        </div>
      ) : (
        <BarChart stacks={SAMPLE_STACKS} label={`${w.title} by month`} />
      )}
    </>
  );
}

function Host() {
  const [dashboards, setDashboards] = useState(INITIAL);
  const [activeId, setActiveId] = useState("sys");
  const [stamp, setStamp] = useState(null);
  const [opened, setOpened] = useState(null);
  return (
    <>
      <WidgetKeyframes />
      <Dashboard
        dashboards={dashboards}
        activeId={activeId}
        catalogue={CATALOGUE}
        renderWidget={renderWidget}
        onSwitch={setActiveId}
        onRefreshAll={() => setStamp(new Date().toLocaleTimeString())}
        /* Wiring this is what draws the THIRD header icon, open_in_full.
           Figma shows all three on every one of the Widget set's six variants,
           and the board is what knows where a widget's full view lives. */
        onOpenWidget={(w) => setOpened(w.title)}
        onRenameDashboard={(id, name) =>
          setDashboards((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)))}
        onCommit={({ dashboard }) =>
          setDashboards((ds) => ds.map((d) => (d.id === dashboard.id ? dashboard : d)))}
      />
      {opened && (
        <p role="status" style={{ margin: 0, padding: U("padding-tight"),
          color: "var(--semantic-color-foreground-static-neutral-subtle)",
          fontSize: "var(--semantic-type-font-size-xs)" }}>
          Open the full view of {opened}.
        </p>
      )}
      {stamp && (
        <p style={{ margin: 0, padding: U("padding-tight"),
          color: "var(--semantic-color-foreground-static-neutral-subtle)",
          fontSize: "var(--semantic-type-font-size-xs)" }}>
          Refresh all fired at {stamp}.
        </p>
      )}
    </>
  );
}

export default {
  title: "Library/Dashboard",
  component: Dashboard,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "The board, its toolbar and the add-widget flow, measured off the " +
      "canonical demo. 12 columns at desktop, 8 at tablet, 4 on mobile, 48px " +
      "rows, 16px gap, and grid-auto-flow ROW so authored order is kept. " +
      "Find a widget, Add widget and Refresh all are all available without " +
      "entering manage mode; manage keeps the destructive half, which is " +
      "rearranging, resizing and removing." } },
  },
};

export const Playground = { render: () => <Host /> };

export const AddWidgetFlow = {
  name: "Add widget flow",
  render: () => <Host />,
  parameters: { docs: { description: { story:
    "Add widget opens a 900x660 dialog with a 186px category rail and a 714px " +
    "gallery, as the demo. Categories come from the catalogue; Added appears " +
    "only once something is on the board, because a filter for an empty set is " +
    "a dead end. Each card carries its app badge, name and description, is " +
    "itself a button, and has an Add button as the label for that. Focus is " +
    "trapped, Escape closes, and body scroll is locked while it is open." } } },
};

export const SwapAndManage = {
  name: "Swap and manage",
  render: () => <Host />,
  parameters: { docs: { description: { story:
    "Every widget title is a swap control: it exchanges that widget for another " +
    "in the same slot, keeping its position, keeping its size when the incoming " +
    "widget supports it and otherwise falling back to that widget's default. " +
    "Manage mode adds drag-to-reorder. Both go through a draft, so Cancel puts " +
    "the board back." } } },
};

// ─── Tokens ───────────────────────────────────────────────────────────────────

export const TokensColour = {
  name: "Tokens: colour",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Board and toolbar",
        rows: [
          ["--semantic-color-fill-surface-canvas", "The page behind the board"],
          ["--semantic-color-fill-surface-elevated", "Toolbar controls, the dialog, and every card in the gallery"],
          ["--semantic-color-stroke-static-neutral-base", "Control and card borders"],
          ["--semantic-color-stroke-static-neutral-faint", "Rail and section dividers"],
          ["--semantic-color-foreground-static-neutral-bold", "Dashboard name, dialog title, card names"],
          ["--semantic-color-foreground-static-neutral-base", "Card descriptions"],
          ["--semantic-color-foreground-static-neutral-subtle", "Category labels and counts"],
        ] },
      { title: "Buttons",
        rows: [
          ["--semantic-color-fill-action-primary-strong-rest", "Add widget, at rest"],
          ["--semantic-color-fill-action-primary-strong-hover", "Add widget, on hover"],
          ["--semantic-color-stroke-action-primary-strong-rest", "Add widget border"],
          ["--semantic-color-foreground-action-primary-on-strong", "Add widget label. NOT the mono anchor: that measured 3.04:1 in Midnight"],
          ["--semantic-color-fill-action-primary-subtle-rest", "Selected category in the rail"],
          ["--semantic-color-foreground-action-primary-on-subtle-rest", "Selected category label"],
          ["--semantic-color-fill-action-secondary-hover", "Quiet controls on hover"],
        ] },
      { title: "App badge and overlay",
        rows: [
          ["--semantic-color-fill-static-brand-subtle", "App badge on a gallery card"],
          ["--semantic-color-foreground-static-brand-on-subtle", "App badge initials"],
          ["--semantic-color-scrim-base", "The dialog's backdrop"],
          ["--semantic-color-fill-surface-overlay", "The dialog's own surface"],
        ] },
    ]} />
  ),
};

export const TokensGeometry = {
  name: "Tokens: geometry and motion",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "The grid",
        note: "The grid itself is not tokenised and should not be: 12/8/4 columns, " +
              "48px auto-rows and a 16px gap were measured off the canonical demo, " +
              "which owns how the board behaves. The gap is the one value that comes " +
              "from a token, because it is ordinary spacing.",
        rows: [
          ["--semantic-layout-units-gap-base", "Grid gap, 16"],
          ["--semantic-layout-units-padding-relaxed", "Board padding"],
          ["--semantic-layout-units-cornerradius-large", "Dialog radius"],
          ["--semantic-layout-units-cornerradius-base", "Card and control radius"],
          ["--semantic-layout-units-cornerradius-small", "Badge radius"],
          ["--semantic-layout-units-borderwidth-base", "Every border, 1"],
          ["--semantic-layout-units-padding-wide", "Dialog header and footer"],
          ["--semantic-layout-units-padding-base", "Card padding"],
          ["--semantic-layout-units-padding-tight", "Control padding"],
          ["--semantic-layout-units-padding-xxxxtight", "The tightest inset, on the icon controls"],
        ] },
      { title: "Type",
        rows: [
          ["--semantic-type-font-size-xl", "Dialog title"],
          ["--semantic-type-font-size-m", "Dashboard name"],
          ["--semantic-type-font-size-s", "Control labels and card names"],
          ["--semantic-type-font-size-xs", "Card descriptions"],
          ["--semantic-type-font-size-xxs", "Category counts"],
          ["--semantic-type-weight-bold", "Dialog title"],
          ["--semantic-type-weight-semibold", "Card names and control labels"],
          ["--semantic-type-letter-spacing-spacious", "Body text"],
          ["--semantic-type-letter-spacing-extraspacious", "The uppercase category headings"],
        ] },
      { title: "Elevation and motion",
        rows: [
          ["--elevation-lift", "The add-widget dialog"],
          ["--motion-duration-2", "Control hover, card hover, dialog entrance"],
          ["--motion-easing-standard", "All of the above"],
        ] },
    ]} />
  ),
};
