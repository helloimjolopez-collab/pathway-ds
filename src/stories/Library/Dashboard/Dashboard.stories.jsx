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
import { WidgetKeyframes, SIZE_GRID } from "../../../../components/widget/widget.jsx";
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

/**
 * The board has four states, and they are states of the BOARD rather than of
 * any one widget: viewing, managing, mid-drag, and empty. Managing is the only
 * one that changes what the widgets themselves look like, because a card you
 * can pick up has to say so.
 */
export const StateMatrix = {
  name: "State matrix",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-relaxed"), background: "var(--semantic-color-fill-surface-canvas)" }}>
      <WidgetKeyframes />
      {[
        ["Viewing",
         "Each widget shows its own header actions. The board's own controls are " +
         "the switcher, Refresh all and Manage."],
        ["Managing",
         "Every widget gets a dashed outline and a grab cursor, its per-widget menu " +
         "is replaced by the manage menu, and Save and Cancel appear. Nothing is " +
         "written until Save: Cancel restores the draft from the committed board."],
        ["Dragging",
         "The card being moved drops to 50% so the gap it came from stays readable, " +
         "and the slot it would land in is outlined. Nothing tweens: a transition on " +
         "a dragged card lags the pointer."],
        ["Empty",
         "A board with no widgets is not an error, it is the first thing a new user " +
         "sees, so it offers Add widget rather than explaining itself."],
      ].map(([label, why]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: U("gap-xxtight") }}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)", fontWeight: 600,
            color: "var(--semantic-color-foreground-static-neutral-bold)" }}>{label}</code>
          <span style={{ fontSize: "var(--semantic-type-font-size-xs)", maxWidth: 820,
            color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{why}</span>
        </div>
      ))}
      <p style={{ margin: 0, maxWidth: 820, fontSize: "var(--semantic-type-font-size-s)",
        color: "var(--semantic-color-foreground-static-neutral-base)" }}>
        All four are reachable from the Playground above rather than mocked here,
        because a mocked drag proves nothing. Press Manage, pick a card up, drop it,
        then Cancel and watch the board come back.
      </p>
      <Host />
    </div>
  ),
};

/**
 * The smallest unit of a dashboard is one slot in the grid. Its two numbers,
 * span and rows, are what every size on the ladder resolves to, and they are
 * the reason a widget cannot be dragged into a space that will not hold it.
 */
export const ElementExplorer = {
  name: "Element explorer",
  args: { size: "detail", columns: 12 },
  argTypes: {
    size: { name: "Widget size", control: "inline-radio", options: Object.keys(SIZE_GRID) },
    columns: { name: "Board columns at this breakpoint",
      control: "inline-radio", options: [12, 8, 4] },
  },
  render: (a) => {
    // SIZE_GRID.cols is indexed by BREAKPOINT, mobile first: [4, 8, 12].
    const spec = SIZE_GRID[a.size];
    const bp = { 4: 0, 8: 1, 12: 2 }[a.columns];
    const span = Math.min(spec.cols[bp], a.columns);
    return (
      <div style={{ padding: U("padding-relaxed"), fontFamily: "'Red Hat Text',sans-serif",
        background: "var(--semantic-color-fill-surface-canvas)" }}>
        <code style={{ display: "block", marginBottom: U("gap-tight"),
          fontSize: "var(--semantic-type-font-size-xs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
          {`${a.size} \u2192 span ${span} of ${a.columns} \u00b7 ${spec.rows} rows \u00b7 48px auto-rows \u00b7 16px gap`}
        </code>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${a.columns}, 1fr)`,
          gridAutoRows: 48, gap: U("gap-base") }}>
          {Array.from({ length: a.columns }).map((_, i) => (
            <span key={i} style={{ gridColumn: "span 1", gridRow: "span 1",
              border: "1px dashed var(--semantic-color-stroke-static-neutral-faint)",
              borderRadius: 4 }} />
          ))}
          <span style={{ gridColumn: `span ${span}`, gridRow: `span ${spec.rows}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--semantic-color-fill-action-primary-subtle-rest)",
            color: "var(--semantic-color-foreground-action-primary-on-subtle-rest)",
            border: "1px solid var(--semantic-color-stroke-action-primary-strong-rest)",
            borderRadius: "var(--semantic-layout-units-cornerradius-base)",
            fontSize: "var(--semantic-type-font-size-s)", fontWeight: 600 }}>
            {a.size}
          </span>
        </div>
        <p style={{ maxWidth: 760, fontSize: "var(--semantic-type-font-size-s)",
          color: "var(--semantic-color-foreground-static-neutral-base)" }}>
          Drop the column count to 4 and watch Explore stop being wide: the span is
          clamped to the board, which is what stops a widget from overflowing a
          phone instead of reflowing on it.
        </p>
      </div>
    );
  },
};

export const TokensFill = {
  name: "Tokens: fill",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Fill",
        note: "The board sits on the canvas surface so the widgets on it read as " +
              "elevated. The dialog takes the overlay surface and the scrim behind " +
              "it, which is the only place this component dims anything.",
        rows: [
          ["--semantic-color-fill-surface-canvas",
           "The page behind the board"],
          ["--semantic-color-fill-surface-elevated",
           "Toolbar controls, the dialog, and every card in the gallery"],
          ["--semantic-color-fill-action-primary-strong-rest",
           "Add widget, at rest"],
          ["--semantic-color-fill-action-primary-strong-hover",
           "Add widget, on hover"],
          ["--semantic-color-fill-action-primary-subtle-rest",
           "Selected category in the rail"],
          ["--semantic-color-fill-action-secondary-hover",
           "Quiet controls on hover"],
          ["--semantic-color-fill-static-brand-subtle",
           "App badge on a gallery card"],
          ["--semantic-color-scrim-base",
           "The dialog's backdrop"],
          ["--semantic-color-fill-surface-overlay",
           "The dialog's own surface"],
        ] },
    ]} />
  ),
};

export const TokensStroke = {
  name: "Tokens: stroke",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Stroke",
        note: "Base on controls and cards, Faint on the rail and section dividers. " +
              "The two are one step apart and the difference is what keeps the rail " +
              "from competing with the cards.",
        rows: [
          ["--semantic-color-stroke-static-neutral-base",
           "Control and card borders"],
          ["--semantic-color-stroke-static-neutral-faint",
           "Rail and section dividers"],
          ["--semantic-color-stroke-action-primary-strong-rest",
           "Add widget border"],
          ["--semantic-layout-units-borderwidth-base",
           "Every border, 1"],
        ] },
    ]} />
  ),
};

export const TokensText = {
  name: "Tokens: text",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Text",
        note: "Add widget's label is Foreground/Action/Primary/On Strong, NOT the " +
              "mono anchor: the anchor measured 3.04:1 against the strong fill in " +
              "Midnight.",
        rows: [
          ["--semantic-color-foreground-static-neutral-bold",
           "Dashboard name, dialog title, card names"],
          ["--semantic-color-foreground-static-neutral-base",
           "Card descriptions"],
          ["--semantic-color-foreground-static-neutral-subtle",
           "Category labels and counts"],
          ["--semantic-color-foreground-action-primary-on-strong",
           "Add widget label. NOT the mono anchor: that measured 3.04:1 in " +
           "Midnight"],
          ["--semantic-color-foreground-action-primary-on-subtle-rest",
           "Selected category label"],
          ["--semantic-color-foreground-static-brand-on-subtle",
           "App badge initials"],
        ] },
    ]} />
  ),
};

export const TokensTypography = {
  name: "Tokens: typography",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Typography",
        note: "The dashboard name is the only type this component sets directly. " +
              "Everything else is inside a Widget, a Button or a card.",
        rows: [
          ["--semantic-type-font-size-xl",
           "Dialog title"],
          ["--semantic-type-font-size-m",
           "Dashboard name"],
          ["--semantic-type-font-size-s",
           "Control labels and card names"],
          ["--semantic-type-font-size-xs",
           "Card descriptions"],
          ["--semantic-type-font-size-xxs",
           "Category counts"],
          ["--semantic-type-weight-bold",
           "Dialog title"],
          ["--semantic-type-weight-semibold",
           "Card names and control labels"],
          ["--semantic-type-letter-spacing-spacious",
           "Body text"],
          ["--semantic-type-letter-spacing-extraspacious",
           "The uppercase category headings"],
        ] },
    ]} />
  ),
};

export const TokensSpacing = {
  name: "Tokens: spacing",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Spacing",
        note: "The grid itself is not tokenised and should not be: 12/8/4 columns, " +
              "48px auto-rows and a 16px gap were measured off the canonical demo, " +
              "which owns how the board behaves. The gap is the one value that " +
              "comes from a token, because it is ordinary spacing.",
        rows: [
          ["--semantic-layout-units-gap-base",
           "Grid gap, 16"],
          ["--semantic-layout-units-padding-relaxed",
           "Board padding"],
          ["--semantic-layout-units-padding-wide",
           "Dialog header and footer"],
          ["--semantic-layout-units-padding-base",
           "Card padding"],
          ["--semantic-layout-units-padding-tight",
           "Control padding"],
          ["--semantic-layout-units-padding-xxxxtight",
           "The tightest inset, on the icon controls"],
        ] },
    ]} />
  ),
};

export const TokensRadius = {
  name: "Tokens: radius",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Radius",
        note: "Large on the dialog, Base on cards and controls, Small on the app " +
              "badge.",
        rows: [
          ["--semantic-layout-units-cornerradius-large",
           "Dialog radius"],
          ["--semantic-layout-units-cornerradius-base",
           "Card and control radius"],
          ["--semantic-layout-units-cornerradius-small",
           "Badge radius"],
        ] },
    ]} />
  ),
};

export const TokensMotion = {
  name: "Tokens: motion",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Motion",
        note: "Suppressed under prefers-reduced-motion. Dragging does not animate: " +
              "a tween on a dragged card lags the pointer.",
        rows: [
          ["--motion-duration-2",
           "Control hover, card hover, dialog entrance"],
          ["--motion-easing-standard",
           "All of the above"],
        ] },
    ]} />
  ),
};

export const TokensElevation = {
  name: "Tokens: elevation",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Elevation",
        note: "Elevation is a shadow token, not a colour. The dialog is the only " +
              "thing on the board that lifts.",
        rows: [
          ["--elevation-lift",
           "The add-widget dialog"],
        ] },
    ]} />
  ),
};

export const ThePattern = {
  name: "The pattern: every flow",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: `${U("padding-tight")} ${U("padding-relaxed")}`,
        background: "var(--semantic-color-fill-surface-elevated)",
        borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "'Red Hat Text', sans-serif",
          fontSize: "var(--semantic-type-font-size-xs)" }}>
          <tbody>
            {[
              ["The flex grid", "12 columns at desktop, 8 at tablet, 4 on mobile. 48px rows, 16px gap, grid-auto-flow ROW so authored order is kept. Resize the preview to see it reflow."],
              ["Switch dashboard", "The chevron beside the name. The System one is marked and cannot be renamed."],
              ["Rename, and save", "Manage, then click the name. Done commits, Cancel puts the board back: every edit goes through a draft."],
              ["Add a widget", "Add widget. A 900x660 dialog, a 186px category rail, a card per entry. Available without entering manage mode."],
              ["Find a widget", "Find a widget filters the board by title. Presentational only, so it can never become an edit."],
              ["Refresh", "Refresh all on the toolbar, or Refresh this widget in a widget's menu."],
              ["Swap a widget", "Click a widget's TITLE. It exchanges that widget for another in the same slot, keeping its position."],
              ["Resize a widget", "A widget's more_vert menu lists the sizes its catalogue entry supports, with the current one marked."],
              ["Duplicate a widget", "The same menu. The copy lands directly after the original, not at the bottom."],
              ["Delete a widget", "The same menu, last and in the negative tone."],
              ["Move a widget", "Manage, then drag. Dragging is the one flow that needs manage mode, because it is the only one you can do by accident."],
            ].map(([flow, how]) => (
              <tr key={flow}>
                <td style={{ padding: "3px 16px 3px 0", whiteSpace: "nowrap", verticalAlign: "top",
                  fontWeight: "var(--semantic-type-weight-semibold)",
                  color: "var(--semantic-color-foreground-static-neutral-bold)" }}>{flow}</td>
                <td style={{ padding: "3px 0", color: "var(--semantic-color-foreground-static-neutral-base)" }}>{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Host />
      </div>
    </div>
  ),
  parameters: { docs: { description: { story:
    "Every flow is live here: nothing in the table is a description of " +
    "something unbuilt. MANAGE MODE holds the destructive half, which is " +
    "dragging, and it keeps a DRAFT so Cancel genuinely reverts. Everything " +
    "non-destructive, which is finding, adding, refreshing, swapping, " +
    "resizing and duplicating, works without entering it, because making " +
    "someone enter a mode to add a widget is friction with nothing behind it." } } },
};
