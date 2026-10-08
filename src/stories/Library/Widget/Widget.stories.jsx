/**
 * Widget: the dashboard container.
 *
 * Built from Figma set 40009622:39702 and checked against the rendered
 * component rather than only its measurements, which is what this page
 * previously failed at: it filled the content area with a dashed box captioned
 * "chart", and Figma's Detail and Explore are mostly chart by area.
 */
import React from "react";
import { Widget, WidgetKeyframes, SIZES, SIZE_LABEL, SIZE_GRID, isFlat } from "../../../../components/widget/widget.jsx";
import { KpiNumberAndTrend, Change } from "../../../../components/kpi-tile/kpi-number-trend.jsx";
import { MiniChart, SAMPLE_SERIES, SAMPLE_MARKERS, curveFor } from "../../../../components/kpi-tile/mini-chart.jsx";
import { BarChart, SAMPLE_STACKS } from "../../../../components/kpi-tile/bar-chart.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";
import { ActionIcon, ACTION_ICON_SIZES } from "../../../../components/icon/action-icon.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;

const board = (children, cols = 12) => (
  <div className="pw-dashboard-grid" style={{
    display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridAutoRows: "48px", gridAutoFlow: "row", gap: U("gap-base"),
    alignContent: "start", padding: U("padding-relaxed"),
    background: "var(--semantic-color-fill-surface-canvas)",
  }}>
    <WidgetKeyframes />
    <style>{`.pw-dashboard-grid{--pw-widget-cols-glance:3;--pw-widget-cols-detail:6;--pw-widget-cols-explore:12;--pw-widget-cols-band:12}`}</style>
    {children}
  </div>
);

/**
 * Glance: the number and a sparkline beside it.
 *
 * `realistic-01` is the default because that is the shape Figma's
 * `Size=Glance, Configuration=01` actually nests: its `_Chart mini` instance is
 * `Type=Realistic 01, Trend=Positive`. This defaulted to `wavy-01`, which is a
 * different drawing.
 */
const glanceBody = (series = "realistic-01", dir = "up", fav) => (
  <KpiNumberAndTrend
    eyebrow="Views per month" value="2,000"
    /* Figma's Glance draws _Change TYPE 04, the tinted pill, with the
       Trend.ComparisonControl beside it. The default type 01 is the naked
       arrow, which is what Detail uses. */
    change={<Change type="04" value="100%" direction={dir} favourable={fav}
      note="vs last month" onCompareClick={() => {}} />}
    /* curve and marker position both come from the Figma shape, not from a
       default: SAMPLE_MARKERS holds the real index per type and Figma marks an
       INTERIOR point, letting the line run past it to the edge. */
    chart={<MiniChart series={SAMPLE_SERIES[series]} direction={dir} favourable={fav}
      curve={curveFor(series)} markerIndex={SAMPLE_MARKERS[series]} />}
  />
);

/** Detail and Explore: the number row above, then the chart filling the rest. */
const layeredBody = (explore = false) => (
  <>
    <KpiNumberAndTrend
      numberStyle="wide" eyebrow={null} value="2,000"
      /* Figma's Detail and Explore draw _Change TYPE 02: moving / trending_down,
         no container, glyph and text both in the trend colour. */
      change={<Change type="02" value="100%" direction="up"
        note="vs last month" onCompareClick={() => {}} />}
    />
    {explore ? (
      <div style={{ display: "flex", gap: U("gap-base"), flex: 1, minHeight: 0 }}>
        <BarChart stacks={SAMPLE_STACKS} label="Active users by month" />
        <BarChart stacks={SAMPLE_STACKS} axes yTitle="Active users" xTitle="Month"
          label="Active users by month and series" />
      </div>
    ) : (
      <BarChart stacks={SAMPLE_STACKS} label="Active users by month" />
    )}
  </>
);

export default {
  title: "Library/Widget",
  component: Widget,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "The dashboard's container. SIZE IS DEPTH, NOT SCALE: a bigger size asks " +
      "for more content rather than enlarging the same content. Detail and " +
      "Explore are the SAME height, 416, and differ only in width, 566 against " +
      "1148, so depth here is horizontal. Glance is flat; the other two carry " +
      "an inner card rounded on its TOP corners only. Every border is 0.5px, " +
      "not 1. The three header actions are Size=Base, a 44px target with a 28px " +
      "state layer, and are visible at rest." } },
  },
  argTypes: {
    size: { name: "Size", control: "inline-radio", options: SIZES,
      description: "Figma's Size axis. RESIZE THE WIDGET with this: it changes "
        + "the grid span, the min width and whether there is an inner card." },
    title: { name: "Title", control: "text" },
    onRefresh: { name: "Refresh action", control: "boolean" },
    onGoTo: { name: "Open full view action", control: "boolean" },
    onMenu: { name: "More actions", control: "boolean" },
    swap: { name: "Title is a swap control", control: "boolean" },
    manage: { name: "Manage mode", control: "boolean" },
  },
};

/**
 * THE PLAYGROUND RESIZES. `size` is a real control, so the widget can be taken
 * through Glance, Detail, Explore and the board's full-width band without
 * leaving the page, and the caption states what changes each time.
 *
 * It used to render all three sizes at once with no controls, so there was
 * nothing to drive and no Detail to inspect on its own.
 */
export const Playground = {
  args: { size: "detail", title: "Widget Heading", onRefresh: true, onGoTo: true,
    onMenu: true, swap: false, manage: false },
  render: (a) => {
    const g = SIZE_GRID[a.size] || SIZE_GRID.detail;
    return board(
      <>
        <div style={{ gridColumn: "1 / -1" }}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
            color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
            {`size="${a.size}" \u00b7 ${g.cols[2]} of 12 columns \u00b7 ${g.rows} rows `}
            {`\u00b7 ${isFlat(a.size) ? "FLAT, no inner card" : "layered, inner card rounded top only"}`}
          </code>
        </div>
        <Widget
          title={a.title}
          size={a.size}
          onRefresh={a.onRefresh ? () => {} : undefined}
          onGoTo={a.onGoTo ? () => {} : undefined}
          onMenu={a.onMenu ? () => {} : undefined}
          swap={a.swap ? { onOpen: () => {}, open: false } : undefined}
          style={a.manage ? {
            outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)",
            outlineOffset: 2, cursor: "grab",
          } : undefined}
        >
          {isFlat(a.size) ? glanceBody() : layeredBody(a.size === "explore")}
        </Widget>
      </>
    );
  },
};

/** The three sizes on one board, as they appear on a dashboard. */
export const SizeLadder = {
  name: "Size ladder",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-relaxed"), background: "var(--semantic-color-fill-surface-canvas)" }}>
      <WidgetKeyframes />
      {[
        ["glance",  275,  176, "275x176, minW 275, minH 176, flat, 3 cols x 3 rows"],
        ["detail",  566,  416, "566x416, minW 515, layered, 6 cols x 8 rows"],
        ["explore", 1148, 416, "1148x416, minW 1050, layered, 12 cols x 9 rows"],
      ].map(([size, w, h, note]) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", gap: U("gap-tight") }}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
            color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{note}</code>
          <Widget title="Widget Heading" size={size} inGrid={false}
            onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}
            style={{ width: w, height: h }}>
            {isFlat(size) ? glanceBody() : layeredBody(size === "explore")}
          </Widget>
        </div>
      ))}
    </div>
  ),
};

/**
 * The four Glance Configurations, each read off its Figma variant on
 * 2026-10-07 rather than inferred. They are not four framings of one thing.
 *
 *  Cfg  KPI N&T Type      Number  Trend filter  Filter layout        Chart
 *  01   01 Chart Right    Tall    YES           Stacked with Number  Realistic 01
 *  02   02 Chart Bottom   Wide    no            On Filter Toolbar    Wavy 01
 *  03   01 Chart Right    Tall    no            On Filter Toolbar    Realistic 01
 *  04   01 Chart Right    Tall    no            On Filter Toolbar    Wavy 05
 *
 * So 01 is the only one with a trend-filter pill, and it is stacked. The other
 * three carry a BUTTON on the filter toolbar row instead, an Outlined/XS/
 * Secondary PW_Button. 03 and 04 are structurally identical and differ only in
 * the sample line drawn.
 */
export const GlanceConfigurations = {
  name: "Glance configurations",
  render: () => board(
    <>
      {[
        ["01", "stacked", "tall",  "right",  "realistic-01", "Last 12 months"],
        ["02", "toolbar", "wide",  "bottom", "wavy-01",      "Button"],
        ["03", "toolbar", "tall",  "right",  "realistic-01", "Button"],
        ["04", "toolbar", "tall",  "right",  "wavy-05",      "Button"],
      ].map(([cfg, filterLayout, numberStyle, layout, series, filter]) => (
        <Widget key={cfg} title="Widget Heading" size="glance"
          onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>
          <KpiNumberAndTrend
            eyebrow="Views per month" value="2,000"
            numberStyle={numberStyle} layout={layout}
            filter={filter} filterLayout={filterLayout}
            change={<Change type="04" value="100%" direction="up"
              note="vs last month" onCompareClick={() => {}} />}
            chart={<MiniChart series={SAMPLE_SERIES[series]} direction="up"
              curve={curveFor(series)} markerIndex={SAMPLE_MARKERS[series]} />}
          />
        </Widget>
      ))}
    </>
  ),
  parameters: { docs: { description: { story:
    "Configuration is a property of the CONTENT, not of the container, which " +
    "is why the Widget takes no such prop and this story varies the nested " +
    "block instead. 01 is the only Configuration with a trend-filter pill, " +
    "stacked above the number; 02, 03 and 04 put an Outlined/XS/Secondary " +
    "button on the filter toolbar row. filterLayout=\"toolbar\" used to draw " +
    "nothing at all, on the reading that the control belonged to the widget\u2019s " +
    "own toolbar; the Figma variants all draw it inside the block." } } },
};

/** The arrow follows direction; the colour follows sentiment. */
export const TrendDirectionVersusSentiment = {
  name: "Trend: direction vs sentiment",
  render: () => board(
    <>
      <Widget title="Total income" size="glance" onRefresh={() => {}}>
        {glanceBody("wavy-01", "up", true)}
      </Widget>
      <Widget title="Total expenses" size="glance" onRefresh={() => {}}>
        {glanceBody("wavy-02", "up", false)}
      </Widget>
      <Widget title="Net income" size="glance" onRefresh={() => {}}>
        {glanceBody("realistic-03", "down", false)}
      </Widget>
    </>
  ),
  parameters: { docs: { description: { story:
    "Income up is green. Expenses up is red, same arrow. Collapsing direction " +
    "and sentiment into one prop paints rising costs green." } } },
};

/** Not every widget wires every action; the slot takes what it is given. */
/**
 * THE HEADER HAS TWO ICON SLOTS, which is the thing this page got wrong twice.
 * Walking the Figma header gives Container.RowStart (title + a HIDDEN 72x36
 * Slot.HoverIcons holding two icons) beside Slot.RowEnd (three icons, visible).
 */
export const HeaderActions = {
  name: "Header actions: two slots",
  render: () => board(
    <>
      <Widget title="All three" size="glance"
        onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>{glanceBody()}</Widget>
      <Widget title="Refresh only" size="glance" onRefresh={() => {}}>{glanceBody()}</Widget>
      <Widget title="None" size="glance">{glanceBody()}</Widget>
      <Widget title="With hover actions" size="glance"
        onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}
        hoverActions={[
          { name: "push_pin", label: "Pin this widget", onClick: () => {} },
          { name: "download", label: "Export", onClick: () => {} },
        ]}>{glanceBody()}</Widget>
    </>
  ),
  parameters: { docs: { description: { story:
    "Slot.RowEnd draws refresh, open_in_full and more_vert at 12px in 36px " +
    "boxes, and they are VISIBLE AT REST in all six Figma variants. The third " +
    "is conditional: a widget with no full view gets no expand button. " +
    "Slot.HoverIcons is a DIFFERENT slot, two icons beside the TITLE, hidden " +
    "until you hover or tab into the widget, and off unless a consumer passes " +
    "hoverActions, because the Figma boolean gating it defaults to false. " +
    "Hover the fourth widget to see it. An earlier version read the name " +
    "Slot.HoverIcons as the behaviour of the visible three; the correction " +
    "then claimed that slot simply held those three. Both were wrong." } } },
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
// Every name below is resolved against the live document by TokenTable, so a
// row is wrong only if the token is. A hand-copied hex in a story is a second
// source of truth that nothing checks.

/**
 * Every state the widget and its header have, rendered live rather than
 * described, with the tokens that drive each one named beneath it.
 */
export const StateMatrix = {
  name: "State matrix",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-relaxed"), background: "var(--semantic-color-fill-surface-canvas)" }}>
      <WidgetKeyframes />
      {[
        ["Rest", "the three row-end icons are VISIBLE, the hover pair is not", {}],
        ["Manage", "dashed outline and a grab cursor; the per-widget menu is suppressed",
          { style: { outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)",
            outlineOffset: 2, cursor: "grab" }, onMenu: undefined }],
        ["Dragging", "50% opacity, so the slot it came from stays readable",
          { style: { opacity: 0.5, outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)",
            outlineOffset: 2, cursor: "grabbing" } }],
      ].map(([label, why, props]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: U("gap-xxtight") }}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
            color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
            {label} · {why}
          </code>
          <div style={{ width: 275 }}>
            <Widget title="Widget Heading" size="glance" inGrid={false}
              onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}} {...props}>
              {glanceBody()}
            </Widget>
          </div>
        </div>
      ))}
      <div>
        <code style={{ display: "block", marginBottom: U("gap-xxtight"),
          fontSize: "var(--semantic-type-font-size-xs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
          The header actions, each state side by side. Hover and press them to confirm.
        </code>
        <div style={{ display: "flex", gap: U("gap-base"), alignItems: "center",
          background: "var(--semantic-color-fill-surface-elevated)",
          border: "0.5px solid var(--semantic-color-stroke-static-neutral-base)",
          borderRadius: U("cornerradius-xlarge"), padding: U("padding-xxtight") }}>
          <ActionIcon name="refresh" size="Base" label="Refresh" onClick={() => {}} />
          <ActionIcon name="open_in_full" size="Base" label="Open the full view" onClick={() => {}} />
          <ActionIcon name="more_vert" size="Base" label="More actions" onClick={() => {}} />
          <ActionIcon name="more_vert" size="Base" label="Disabled" disabled />
        </div>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story:
    "The header action icons are Size=Base: a 44x44 target, a 28x28 state " +
    "layer at r=8 and a 14px glyph. THE STATE LAYER IS WHERE THE FILL GOES, " +
    "not the target, and it is Fill/Action/Primary/Subtle on hover and " +
    "pressed, which is a light blue rather than the neutral grey this " +
    "component used until 2026-10-08. Every icon carries both an aria-label " +
    "and a title, so hovering one says what it does." } } },
};

/**
 * The smallest unit with its own controls: one header action icon, isolated
 * from the widget so its size, glyph and states can be driven directly.
 */
export const ElementExplorer = {
  name: "Element explorer",
  args: { name: "refresh", size: "Base", label: "Refresh", disabled: false },
  argTypes: {
    name: { name: "Glyph", control: "select",
      options: ["refresh", "open_in_full", "more_vert", "push_pin", "download", "expand_more"] },
    size: { name: "Action Icon size", control: "inline-radio",
      options: Object.keys(ACTION_ICON_SIZES) },
    label: { name: "Accessible name and tooltip", control: "text" },
    disabled: { name: "Disabled", control: "boolean" },
  },
  render: (a) => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-base"), background: "var(--semantic-color-fill-surface-elevated)" }}>
      <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
        {`${a.size} \u00b7 ${ACTION_ICON_SIZES[a.size].box} target \u00b7 ${ACTION_ICON_SIZES[a.size].layer} layer \u00b7 ${ACTION_ICON_SIZES[a.size].glyph} glyph`}
      </code>
      <div style={{ display: "inline-flex",
        outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)", alignSelf: "flex-start" }}>
        <ActionIcon name={a.name} size={a.size} label={a.label}
          disabled={a.disabled} onClick={() => {}} />
      </div>
      <span style={{ fontSize: "var(--semantic-type-font-size-xs)",
        color: "var(--semantic-color-foreground-static-neutral-base)", maxWidth: 520 }}>
        The dashed box is the TARGET. The state layer inside it is smaller, and
        the fill belongs on the layer: painting the target gives a hover box
        visibly bigger than the design, which shipped twice.
      </span>
    </div>
  ),
};

export const TokensFill = {
  name: "Tokens: fill",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Fill",
        note: "Glance takes the elevated surface and has no inner card. Detail and " +
              "Explore take the faint neutral on the root with an elevated inner " +
              "card, which is what makes them a card inside a card. The root fill " +
              "on those two was an unbound #fefefd in Figma until 2026-10-07.",
        rows: [
          ["--semantic-color-fill-surface-elevated",
           "Root on Glance, and the inner MainContent.Slot on Detail and Explore"],
          ["--semantic-color-fill-static-neutral-faint",
           "Root on Detail and Explore"],
          ["--semantic-color-fill-action-secondary-hover",
           "Header action box on hover"],
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
        note: "One stroke token does both borders, and the width is XThin, 0.5, not " +
              "Base. Figma draws it INSIDE, which takes no layout space, so the " +
              "implementation uses an inset box-shadow rather than a CSS border: a " +
              "border would push the content in by a pixel on every edge.",
        rows: [
          ["--semantic-color-stroke-static-neutral-base",
           "Root border, and the inner card's border"],
          ["--semantic-layout-units-borderwidth-base",
           "Root and inner card border, 1"],
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
        note: "Bold for the heading, Strong for the swap trigger when the title is " +
              "interactive, Base for anything in the content slot.",
        rows: [
          ["--semantic-color-foreground-static-neutral-bold",
           "Widget heading"],
          ["--semantic-color-foreground-static-neutral-strong",
           "Swap trigger label when the title is interactive"],
          ["--semantic-color-foreground-static-neutral-base",
           "Caption and meta text in the content slot"],
        ] },
    ]} />
  ),
};

export const TokensIcon = {
  name: "Tokens: icon",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Icon",
        note: "The header actions are Action/Secondary for the glyph and " +
              "Action/Primary/Subtle for the state layer behind it. Those are " +
              "deliberately different families: the glyph is a quiet control, the " +
              "layer is a primary-tinted wash.",
        rows: [
          ["--semantic-color-foreground-action-secondary-rest",
           "Header action glyph at rest"],
          ["--semantic-color-foreground-action-secondary-hover",
           "Header action glyph on hover"],
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
        note: "One style, Heading/Content/XSmall/Semibold, for the widget heading. " +
              "Nothing else in the chrome sets type.",
        rows: [
          ["--semantic-type-font-size-s",
           "Heading"],
          ["--semantic-type-weight-semibold",
           "Heading"],
          ["--semantic-type-line-height-s-single",
           "Heading"],
          ["--semantic-type-letter-spacing-spacious",
           "Heading"],
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
        note: "Every value here is a rung on the ladder. The three minimum widths " +
              "are Contextual rather than component constants, because a widget " +
              "squeezed below the width its content needs is the failure the size " +
              "ladder exists to prevent.",
        rows: [
          ["--semantic-layout-units-gap-xxxtight",
           "Header gap, 2"],
          ["--semantic-layout-units-gap-tight",
           "Content slot gap, 8"],
          ["--semantic-layout-units-padding-tight",
           "Inner card vertical padding, 12"],
          ["--semantic-layout-units-padding-base",
           "Inner card horizontal padding, 16"],
          ["--semantic-layout-units-padding-xtight",
           "Header left padding on the layered sizes"],
          ["--semantic-layout-units-padding-xxtight",
           "Header right padding"],
          ["--contextual-layout-units-widget-minwidth-glance",
           "Glance, 275"],
          ["--contextual-layout-units-widget-minwidth-detail",
           "Detail, 515"],
          ["--contextual-layout-units-widget-minwidth-explore",
           "Explore, 1050"],
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
        note: "XLarge, 16, on the root. The inner card is Large, 12, and ONLY on " +
              "its top two corners, because its bottom edge meets the widget's own " +
              "bottom padding.",
        rows: [
          ["--semantic-layout-units-cornerradius-xlarge",
           "Root radius, 16"],
          ["--semantic-layout-units-cornerradius-base",
           "Inner card radius"],
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
        note: "Suppressed under prefers-reduced-motion.",
        rows: [
          ["--motion-duration-2",
           "Action icon colour and fill on hover"],
          ["--motion-duration-3",
           "Widget opacity fade in"],
          ["--motion-easing-standard",
           "Both"],
        ] },
    ]} />
  ),
};
