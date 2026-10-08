/**
 * Dashboard's standalone demo, and the one of the three that most needed a
 * standalone: a board is the thing you want to drag a real window across.
 * Imports the real module; see components/_demo/harness.jsx.
 */
import React, { useState } from "react";
import { DemoChrome, mount } from "../_demo/harness.jsx";
import { Dashboard } from "./dashboard.jsx";
import { Widget, WidgetKeyframes } from "../widget/widget.jsx";
import { KpiTile } from "../kpi-tile/kpi-tile.jsx";
import { KpiNumberAndTrend, Change } from "../kpi-tile/kpi-number-trend.jsx";
import { MiniChart, SAMPLE_SERIES, SAMPLE_MARKERS, curveFor } from "../kpi-tile/mini-chart.jsx";
import { BarChart, SAMPLE_STACKS } from "../kpi-tile/bar-chart.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const GL = { short: "GL", name: "General Ledger" };
const PR = { short: "PR", name: "Payroll" };

const CATALOGUE = [
  { id: "financial-kpis", name: "Financial KPIs", app: GL, category: "Accounting",
    description: "Income, expenses and net, against the previous period.", size: "band" },
  { id: "deposits", name: "Deposits on Hand", app: GL, category: "Accounting",
    description: "What has been received and not yet deposited.", size: "glance" },
  { id: "bank", name: "Bank Balances", app: GL, category: "Accounting",
    description: "Every account, with its movement since the last reconciliation.", size: "explore" },
  { id: "payroll", name: "Payroll Distributions", app: PR, category: "People",
    description: "Where this period's payroll landed, by fund.", size: "detail" },
];

/* A board member is `{ id, catalogueId, title, size }`. `title` is carried on
   the MEMBER rather than looked up, because a user can rename a widget on their
   own board without renaming the catalogue entry, and `catalogueId` is the key
   Dashboard itself uses when it adds or swaps one. Getting either name wrong
   fails quietly: this demo first used `widgetId` with no `title`, so every
   widget rendered its body correctly under an empty heading. */
const INITIAL = [
  { id: "w1", catalogueId: "financial-kpis", title: "Financial KPIs", size: "band" },
  { id: "w2", catalogueId: "deposits", title: "Deposits on Hand", size: "glance" },
  { id: "w3", catalogueId: "bank", title: "Bank Balances", size: "explore" },
];

function renderWidget(w) {
  const entry = CATALOGUE.find((c) => c.id === w.catalogueId) || CATALOGUE[0];
  if (entry.id === "financial-kpis") {
    return (
      <div style={{ display: "grid", gap: U("gap-base"),
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {[["Total income", "$1,284,500", "6.2%", "up", true],
          ["Total expenses", "$1,097,800", "4.3%", "up", false],
          ["Net income", "$186,700", "21.3%", "up", true]].map(([h, v, c, d, f]) => (
          <KpiTile key={h} type="simple" heading={h} value={v}
            changeValue={c} direction={d} favourable={f} note="vs previous year"
            onMenu={false} />
        ))}
      </div>
    );
  }
  if (entry.id === "bank") {
    return (
      <>
        <KpiNumberAndTrend value="$4,948,850" numberStyle="wide"
          change={<Change value="1.8%" direction="up" type="02" note="vs previous period" />} />
        <BarChart stacks={SAMPLE_STACKS} axes yTitle="Amount" xTitle="Month" />
      </>
    );
  }
  if (entry.id === "payroll") {
    return (
      <>
        <KpiNumberAndTrend value="$312,400" numberStyle="wide"
          change={<Change value="2.1%" direction="down" favourable type="02" note="vs last run" />} />
        <BarChart stacks={SAMPLE_STACKS.slice(0, 8)} axes yTitle="Amount" xTitle="Fund" />
      </>
    );
  }
  return (
    <KpiNumberAndTrend eyebrow="Undeposited" value="$3,940"
      change={<Change value="2 days" direction="down" favourable={false} type="04" note="oldest" />}
      chart={<MiniChart d={SAMPLE_SERIES["realistic-01"]} curve={curveFor("realistic-01")}
        markerIndex={SAMPLE_MARKERS["realistic-01"]} favourable />} />
  );
}

function App() {
  const [boards, setBoards] = useState([
    { id: "home", name: "Accounting Home", type: "system", isDefault: true, widgets: INITIAL },
    { id: "mine", name: "My board", type: "custom", widgets: [
      { id: "w4", catalogueId: "payroll", title: "Payroll Distributions", size: "detail" }] },
  ]);
  const [activeId, setActiveId] = useState("home");

  return (
    <DemoChrome
      title="Dashboard"
      blurb={"The whole pattern, live. Press Manage, drag a card, resize one from " +
             "its menu, duplicate it, remove it, rename the board, switch boards, " +
             "then Cancel and watch it come back: nothing is written until Save."}>
      <WidgetKeyframes />
      <Dashboard
        dashboards={boards}
        activeId={activeId}
        catalogue={CATALOGUE}
        renderWidget={renderWidget}
        onSwitch={setActiveId}
        onCommit={(id, widgets) =>
          setBoards((b) => b.map((d) => (d.id === id ? { ...d, widgets } : d)))}
        onRenameDashboard={(id, name) =>
          setBoards((b) => b.map((d) => (d.id === id ? { ...d, name } : d)))}
        onRefreshAll={() => {}}
        onOpenWidget={() => {}}
      />
    </DemoChrome>
  );
}

mount(<App />);
