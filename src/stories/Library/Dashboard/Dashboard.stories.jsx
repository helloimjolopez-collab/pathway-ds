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
import { KpiTile, Change } from "../../../../components/kpi-tile/kpi-tile.jsx";
import { MiniChart, SAMPLE_SERIES } from "../../../../components/kpi-tile/mini-chart.jsx";

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
            <KpiTile eyebrow={label} value={value}
              change={<Change value={pct} direction={dir} favourable={fav} note="vs previous yr" />} />
          </div>
        ))}
      </div>
    );
  }
  if (w.size === "glance") {
    return (
      <KpiTile eyebrow="Undeposited" value="$3,940"
        change={<Change value="2 days" direction="down" favourable={false} note="oldest" />}
        chart={<MiniChart series={SAMPLE_SERIES["realistic-01"]} direction="up" />} />
    );
  }
  return (
    <>
      <KpiTile eyebrow={w.title} value="$4,948,850"
        change={<Change value="1.8%" direction="up" note="vs previous period" />} />
      <div style={{ flex: 1, minHeight: 80 }}>
        <MiniChart series={SAMPLE_SERIES[w.size === "explore" ? "wavy-02" : "wavy-01"]}
          direction="up" label={`${w.title} trend`} />
      </div>
    </>
  );
}

function Host() {
  const [dashboards, setDashboards] = useState(INITIAL);
  const [activeId, setActiveId] = useState("sys");
  const [stamp, setStamp] = useState(null);
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
        onRenameDashboard={(id, name) =>
          setDashboards((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)))}
        onCommit={({ dashboard }) =>
          setDashboards((ds) => ds.map((d) => (d.id === dashboard.id ? dashboard : d)))}
      />
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
