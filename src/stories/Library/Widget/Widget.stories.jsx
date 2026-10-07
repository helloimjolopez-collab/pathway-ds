/**
 * Widget — the dashboard container.
 *
 * Built from Figma set 40009622:39702 and checked against the rendered
 * component rather than only its measurements, which is what this page
 * previously failed at: it filled the content area with a dashed box captioned
 * "chart", and Figma's Detail and Explore are mostly chart by area.
 */
import React from "react";
import { Widget, WidgetKeyframes, SIZES, SIZE_LABEL, isFlat } from "../../../../components/widget/widget.jsx";
import { KpiNumberAndTrend, Change } from "../../../../components/kpi-tile/kpi-number-trend.jsx";
import { MiniChart, SAMPLE_SERIES } from "../../../../components/kpi-tile/mini-chart.jsx";
import { BarChart, SAMPLE_STACKS } from "../../../../components/kpi-tile/bar-chart.jsx";

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

/** Glance: the number and a sparkline beside it, which is what Figma shows. */
const glanceBody = (series = "wavy-01", dir = "up", fav) => (
  <KpiNumberAndTrend
    eyebrow="Views per month" value="2,000"
    change={<Change value="100%" direction={dir} favourable={fav} note="vs last month" />}
    chart={<MiniChart series={SAMPLE_SERIES[series]} direction={dir} favourable={fav} />}
  />
);

/** Detail and Explore: the number row above, then the chart filling the rest. */
const layeredBody = (explore = false) => (
  <>
    <KpiNumberAndTrend
      numberStyle="wide" eyebrow={null} value="2,000"
      change={<Change value="100%" direction="up" note="vs last month" />}
    />
    {explore ? (
      <div style={{ display: "flex", gap: U("gap-base"), flex: 1, minHeight: 0 }}>
        <BarChart stacks={SAMPLE_STACKS} label="Active users by month" />
        <BarChart stacks={SAMPLE_STACKS} axes label="Active users by month and series" />
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
      "an inner card. The three header actions are visible at rest." } },
  },
};

/** The three sizes on one board, as they appear on a dashboard. */
export const Playground = {
  render: () => board(
    <>
      <Widget title="Widget Heading" size="glance"
        onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>
        {glanceBody()}
      </Widget>
      <Widget title="Widget Heading" size="detail"
        onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>
        {layeredBody()}
      </Widget>
      <Widget title="Widget Heading" size="explore"
        onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>
        {layeredBody(true)}
      </Widget>
    </>
  ),
};

/** Each size at its exact Figma box, with the numbers stated. */
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
 * The four Glance Configurations from Figma. They are not four framings of one
 * thing: 01 stacks the filter with the number, 02 is a Wide number with the
 * chart beneath, and 03 and 04 share a structure and differ only in the sample
 * line they draw.
 */
export const GlanceConfigurations = {
  name: "Glance configurations",
  render: () => board(
    <>
      {[
        ["01", "stacked", "tall",  "right",  "realistic-01"],
        ["02", "toolbar", "wide",  "bottom", "wavy-01"],
        ["03", "toolbar", "tall",  "right",  "realistic-01"],
        ["04", "toolbar", "tall",  "right",  "wavy-05"],
      ].map(([cfg, filterLayout, numberStyle, layout, series]) => (
        <Widget key={cfg} title="Widget Heading" size="glance"
          onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>
          <KpiNumberAndTrend
            eyebrow="Views per month" value="2,000"
            numberStyle={numberStyle} layout={layout}
            filter="Button" filterLayout={filterLayout}
            change={<Change value="100%" direction="up" note="vs last month" />}
            chart={<MiniChart series={SAMPLE_SERIES[series] || SAMPLE_SERIES["wavy-01"]} direction="up" />}
          />
        </Widget>
      ))}
    </>
  ),
  parameters: { docs: { description: { story:
    "Configuration is a property of the CONTENT, not of the container, which " +
    "is why the Widget takes no such prop and this story varies the nested " +
    "block instead: numberStyle, filterLayout and layout between them express " +
    "all four rows." } } },
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
export const HeaderActions = {
  name: "Header actions",
  tags: ["!dev"],
  render: () => board(
    <>
      <Widget title="All three" size="glance"
        onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>{glanceBody()}</Widget>
      <Widget title="Refresh only" size="glance" onRefresh={() => {}}>{glanceBody()}</Widget>
      <Widget title="None" size="glance">{glanceBody()}</Widget>
    </>
  ),
  parameters: { docs: { description: { story:
    "Figma draws refresh, open_in_full and more_vert at 12px in 36px boxes, " +
    "and they are VISIBLE AT REST. The slot is named Slot.HoverIcons and I " +
    "first read that name as the behaviour and hid them until hover; the name " +
    "describes where they sit, not when they appear." } } },
};
