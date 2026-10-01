// Dashboard — Storybook stories (React framework)
//
// The dashboard page template: the toolbar, the widget grid, and the templated
// flow for managing a dashboard and adding widgets. Module is
// components/dashboard/dashboard.jsx; nothing is redefined here.
//
// Figma: the 'Dashboards' organism page (40009417:19915) and the templated flow
// 'Dashboards: Add Widgets, Edit Dashboards' (40016300:28543), section
// 'Add Widget & Manage Flows v2' (40016303:38002).

import React, { useState } from "react";
import { Dashboard } from "../../../../components/dashboard/dashboard.jsx";
import {
  WidgetKeyframes, WidgetToolbar, Metric, SIZES, CONTENT_COLS, isFlat,
} from "../../../../components/widget/widget.jsx";
import { SkeletonKeyframes } from "../../../../components/skeleton/skeleton.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const SEQ = (i) => SC(`fill-chart-sequential-${String(i).padStart(2, "0")}`);

const FUNDS = [
  { label: "General", v: 21400, display: "$21,400", seq: 4 },
  { label: "Missions", v: 9100, display: "$9,100", seq: 6 },
  { label: "Building", v: 7300, display: "$7,300", seq: 8 },
  { label: "Youth", v: 5200, display: "$5,200", seq: 10 },
  { label: "Benevolence", v: 3100, display: "$3,100", seq: 12 },
  { label: "Other", v: 2110, display: "$2,110", seq: 14 },
];
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({
  label: m, v: [31, 34, 38, 41, 45, 48][i] * 1000,
  display: `$${[31, 34, 38, 41, 45, 48][i]},000`, seq: [12, 10, 8, 6, 5, 4][i],
}));
const ACCOUNTS = [
  { name: "Operating", cells: ["$128,410", "+4.2%"] },
  { name: "Payroll", cells: ["$46,900", "-1.1%"] },
  { name: "Missions", cells: ["$22,180", "+9.4%"] },
  { name: "Building", cells: ["$71,320", "+0.6%"] },
  { name: "Reserve", cells: ["$210,000", "0.0%"] },
];

const CATALOGUE = [
  { id: "given", name: "Given this month", group: "Giving", defaultSize: "glance", supportedSizes: ["glance", "explore"] },
  { id: "donors", name: "Active donors", group: "Giving", defaultSize: "glance", supportedSizes: ["glance", "explore"] },
  { id: "pending", name: "Pending deposits", group: "Giving", defaultSize: "glance", supportedSizes: ["glance"] },
  { id: "byfund", name: "Giving by fund", group: "Giving", defaultSize: "detail", supportedSizes: ["explore", "detail", "full"] },
  { id: "trend", name: "Giving trend", group: "Giving", defaultSize: "explore", supportedSizes: ["explore", "detail", "full"] },
  { id: "balances", name: "Account balances", group: "Accounting", defaultSize: "detail", supportedSizes: ["detail", "full"] },
  { id: "payroll", name: "Payroll distributions", group: "Accounting", defaultSize: "explore", supportedSizes: ["explore", "detail"] },
  { id: "signups", name: "Recent sign-ups", group: "People", defaultSize: "detail", supportedSizes: ["detail"] },
];

const INITIAL = [
  { id: "sys", name: "Accounting home", type: "system", isDefault: true, widgets: [
    { id: "w1", catalogueId: "given", title: "Given this month", size: "glance", updatedLabel: "Updated just now" },
    { id: "w2", catalogueId: "donors", title: "Active donors", size: "glance" },
    { id: "w3", catalogueId: "pending", title: "Pending deposits", size: "glance" },
    { id: "w4", catalogueId: "byfund", title: "Giving by fund", size: "detail" },
    { id: "w5", catalogueId: "trend", title: "Giving trend", size: "explore" },
    { id: "w6", catalogueId: "balances", title: "Account balances", size: "detail" },
  ] },
  { id: "c1", name: "Month end", type: "custom", isDefault: false, widgets: [
    { id: "m1", catalogueId: "balances", title: "Account balances", size: "full" },
    { id: "m2", catalogueId: "pending", title: "Pending deposits", size: "glance" },
    { id: "m3", catalogueId: "signups", title: "Recent sign-ups", size: "detail", state: "empty",
      emptyLine: "No one has signed up in this period. Widen the period to see earlier sign-ups." },
  ] },
];

function Donut({ size = 132 }) {
  const r = size / 2 - 11, C = 2 * Math.PI * r;
  const sum = FUNDS.reduce((s, x) => s + x.v, 0);
  let off = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Giving by fund">
        {FUNDS.map((s, i) => {
          const dash = (s.v / sum) * C;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={SEQ(s.seq)} strokeWidth={20}
            strokeDasharray={`${dash.toFixed(2)} ${C.toFixed(2)}`}
            strokeDashoffset={(-off).toFixed(2)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
          off += dash; return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
          fontSize: ST("font-size-m"), color: SC("foreground-static-neutral-strong") }}>$48,210</span>
        <span style={{ fontFamily: ST("family-brand"), fontSize: ST("font-size-xs"),
          color: SC("foreground-static-neutral-faint") }}>total</span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SU("gap-xxtight"), minWidth: 0, flex: 1 }}>
      {FUNDS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: SU("gap-tight"), minWidth: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: SU("cornerradius-small"), background: SEQ(s.seq), flex: "0 0 auto" }} />
          <span style={{ fontFamily: ST("family-brand"), fontSize: ST("font-size-xs"),
            color: SC("foreground-static-neutral-base"), flex: 1, minWidth: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
          <span style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
            fontSize: ST("font-size-xs"), fontVariantNumeric: "tabular-nums",
            color: SC("foreground-static-neutral-strong"), flex: "0 0 auto" }}>{s.display}</span>
        </div>
      ))}
    </div>
  );
}

function Bars({ series, max }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: SU("gap-xxtight"),
      flex: 1, minHeight: 0, minWidth: 0, padding: `${SU("padding-xtight")} ${SU("padding-medium")} ${SU("padding-xtight")}` }}>
      {series.map((b, i) => (
        <div key={i} title={`${b.label}: ${b.display}`}
          style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
            alignItems: "center", gap: SU("gap-xxxtight"), height: "100%", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", height: `${Math.max(4, (b.v / max) * 100)}%`,
            background: SEQ(b.seq), borderRadius: `${SU("cornerradius-small")} ${SU("cornerradius-small")} 0 0` }} />
          <span style={{ fontFamily: ST("family-brand"), fontSize: ST("font-size-xxs"),
            color: SC("foreground-static-neutral-faint") }}>{b.label}</span>
          <span className="pw-sr-only">{b.display}</span>
        </div>
      ))}
    </div>
  );
}

function Table({ cols, rows, totalRow }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", gap: SU("gap-tight"), padding: `${SU("gap-xxtight")} ${SU("padding-medium")}`,
        borderBottom: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-faint")}` }}>
        {cols.map((c, i) => (
          <span key={i} style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
            fontSize: ST("font-size-xs"), color: SC("foreground-static-neutral-faint"),
            flex: i === 0 ? "1 1 auto" : "0 0 92px", minWidth: 0,
            textAlign: i === 0 ? "left" : "right" }}>{c}</span>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: SU("gap-tight"), padding: `${SU("gap-xxtight")} ${SU("padding-medium")}` }}>
            <span style={{ fontFamily: ST("family-brand"), fontSize: ST("font-size-s"),
              color: SC("foreground-static-neutral-base"), flex: "1 1 auto", minWidth: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
            {r.cells.map((c, j) => (
              <span key={j} style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
                fontSize: ST("font-size-s"), fontVariantNumeric: "tabular-nums",
                color: SC("foreground-static-neutral-strong"), flex: "0 0 92px", textAlign: "right" }}>{c}</span>
            ))}
          </div>
        ))}
      </div>
      {totalRow && (
        <div style={{ display: "flex", gap: SU("gap-tight"), padding: `${SU("gap-xxtight")} ${SU("padding-medium")}`,
          borderTop: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-faint")}` }}>
          <span style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
            fontSize: ST("font-size-s"), color: SC("foreground-static-neutral-strong"), flex: "1 1 auto" }}>{totalRow.name}</span>
          {totalRow.cells.map((c, j) => (
            <span key={j} style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
              fontSize: ST("font-size-s"), fontVariantNumeric: "tabular-nums",
              color: SC("foreground-static-neutral-strong"), flex: "0 0 92px", textAlign: "right" }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
      fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
      display: "inline-flex", alignItems: "center",
      minHeight: SU("accessibility-touch-target-desktop-only-height"),
      padding: `0 ${SU("padding-xtight")}`, borderRadius: SU("cornerradius-base"),
      border: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-base")}`,
      color: SC("foreground-static-neutral-strong"),
    }}>{children}</span>
  );
}

/** The content each catalogue entry renders. Passed to Dashboard as
 *  renderWidget, which is how a real host supplies its own content. */
function renderWidget(w) {
  const id = w.catalogueId;
  if (id === "given") return <Metric value="$48,210" delta="12.4%" deltaDirection="up" deltaNote="vs last month" />;
  if (id === "donors") return <Metric value="1,284" delta="38" deltaDirection="up" deltaNote="new this month" />;
  if (id === "pending") return <Metric value="$3,940" delta="2 days" deltaDirection="down" deltaNote="oldest" />;
  if (id === "byfund") {
    const side = CONTENT_COLS[w.size] === 2;
    return (
      <div style={{ display: "flex", flexDirection: side ? "row" : "column",
        alignItems: side ? "center" : "stretch", gap: SU("gap-medium"),
        padding: SU("padding-medium"), flex: 1, minHeight: 0 }}>
        <Donut size={side ? 132 : 148} /><Legend />
      </div>
    );
  }
  if (id === "trend" || id === "payroll") return <Bars series={MONTHS} max={50000} />;
  if (id === "balances") return <Table cols={["Account", "Balance", "Change"]} rows={ACCOUNTS}
    totalRow={{ name: "Total", cells: ["$478,810", ""] }} />;
  return null;
}

function withToolbar(ws) {
  return ws.map((w) => (isFlat(w.size) || w.catalogueId === "signups")
    ? w
    : { ...w, toolbar: <WidgetToolbar identity={<Chip>All funds</Chip>} /> });
}

function Host({ activeId: initialActive = "sys" }) {
  const [dashboards, setDashboards] = useState(INITIAL);
  const [activeId, setActiveId] = useState(initialActive);
  const prepared = dashboards.map((d) => ({ ...d, widgets: withToolbar(d.widgets) }));
  return (
    <>
      <WidgetKeyframes />
      <SkeletonKeyframes />
      <Dashboard
        dashboards={prepared}
        activeId={activeId}
        catalogue={CATALOGUE}
        renderWidget={renderWidget}
        onSwitch={setActiveId}
        onCommit={({ mode, dashboard, name }) => {
          setDashboards((ds) => {
            if (mode === "create") {
              const id = `c${Date.now()}`;
              setActiveId(id);
              return [...ds, { ...dashboard, id, name, type: "custom", isDefault: false }];
            }
            return ds.map((d) => (d.id === dashboard.id ? { ...d, name, widgets: dashboard.widgets } : d));
          });
        }}
        onSetDefault={(id) => setDashboards((ds) => ds.map((d) => ({ ...d, isDefault: d.id === id })))}
        onRenameDashboard={(id, name) => setDashboards((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)))}
        onDeleteDashboard={(id) => {
          setDashboards((ds) => ds.filter((d) => d.id !== id));
          if (activeId === id) setActiveId("sys");
        }}
      />
    </>
  );
}

export default {
  title: "Library/Dashboard",
  component: Dashboard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The dashboard page template. Figma: the 'Dashboards' organism page (`40009417:19915`) " +
          "and the templated flow 'Dashboards: Add Widgets, Edit Dashboards' (`40016300:28543`). " +
          "4 / 8 / 12 columns by breakpoint, a 48px row unit and dense row flow, so two short " +
          "widgets stack to exactly fill one tall one and a row never leaves a gap. Compaction is " +
          "always on; there is no drag-to-pixel-position and no drag-to-resize, because size is " +
          "picked from the widget's own menu. " +
          "The save matrix is the part that is easy to get wrong: editing the System dashboard " +
          "always names and creates a NEW custom dashboard, so the shipped baseline can never be " +
          "overwritten, while editing a custom dashboard saves back to it.",
      },
    },
  },
};

export const Playground = () => <Host />;
Playground.parameters = {
  docs: {
    description: {
      story:
        "Press Manage to enter manage mode. Every tile takes a dashed border and a drag handle, " +
        "the toolbar swaps to the layout controls, and each widget's own menu swaps from the view " +
        "actions to Resize, Duplicate and Remove. Titles rename in place. Done on the System " +
        "dashboard asks for a name, because it is creating a new custom dashboard rather than " +
        "overwriting the baseline.",
    },
  },
};

export const CustomDashboard = () => <Host activeId="c1" />;
CustomDashboard.parameters = {
  docs: {
    description: {
      story:
        "A saved custom dashboard. Done here saves back to this dashboard rather than creating a " +
        "new one, and the Recent sign-ups widget is in its empty state with the period offered as " +
        "the recovery.",
    },
  },
};
