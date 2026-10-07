/**
 * KPI Tile — the card. 18 Figma variants on Type x Breakpoint.
 *
 * A KPI Tile is ALWAYS a card. The cardless thing is KPI Number & Trend, which
 * is a building block this tile nests and a Widget nests too, and which has no
 * page of its own because it only ever appears nested.
 */
import React from "react";
import { KpiTile, ChangeChip, KPI_TILE_TYPES } from "../../../../components/kpi-tile/kpi-tile.jsx";
import { MiniChart, SAMPLE_SERIES } from "../../../../components/kpi-tile/mini-chart.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const page = (children) => (
  <div style={{ padding: U("padding-relaxed"), background: "var(--semantic-color-fill-surface-canvas)",
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(388px, 388px))",
    gap: U("gap-base"), alignItems: "start" }}>{children}</div>
);
const chart = (s = "wavy-01", dir = "up") => (
  <MiniChart series={SAMPLE_SERIES[s]} direction={dir} />
);

export default {
  title: "Library/KPI Tile",
  component: KpiTile,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "The KPI card. Nine Figma Types collapse to three shapes here, because " +
      "the numbered suffixes vary the sample glyph or line rather than the " +
      "layout, and both are props. Simple 388x90, Icon 388x158, Chart 388x144. " +
      "Breakpoint is a width, 388 and 343, and the tile is fluid, so it fills " +
      "whatever column it is given." } },
  },
  argTypes: {
    type: { name: "Type", control: "inline-radio", options: KPI_TILE_TYPES },
    heading: { name: "Heading", control: "text" },
    value: { name: "Value", control: "text" },
    icon: { name: "Featured icon (Icon type)", control: "text" },
    direction: { name: "Direction", control: "inline-radio", options: ["up", "down"] },
  },
};

export const Playground = {
  args: { type: "chart", heading: "Views 24 hours", value: "2,000",
    icon: "trending_up", direction: "up" },
  render: (a) => page(
    <KpiTile {...a}
      change={<ChangeChip value="100%" direction={a.direction} />}
      chart={chart("wavy-01", a.direction)}
      onMenu={() => {}} />
  ),
};

/** All three shapes, at their measured sizes. */
export const Types = {
  render: () => page(
    <>
      <KpiTile type="simple" heading="Views 24 hours" value="2,000"
        change={<ChangeChip value="100%" direction="up" />} onMenu={() => {}} />
      <KpiTile type="icon" heading="Views 24 hours" value="2,000" icon="trending_up"
        change={<ChangeChip value="100%" direction="up" />} onMenu={() => {}} />
      <KpiTile type="chart" heading="Views 24 hours" value="2,000"
        change={<ChangeChip value="100%" direction="up" />}
        chart={chart("wavy-01")} onMenu={() => {}} />
      <KpiTile type="icon" heading="Overdrawn accounts" value="2" icon="visibility"
        direction="down"
        change={<ChangeChip value="100%" direction="down" />} onMenu={() => {}} />
      <KpiTile type="chart" heading="Giving this month" value="$48,210"
        change={<ChangeChip value="12.4%" direction="up" />}
        chart={chart("realistic-01")} onMenu={() => {}} />
      <KpiTile type="chart" heading="Expenses" value="$1,097,800"
        change={<ChangeChip value="4.1%" direction="up" />}
        chart={chart("realistic-03", "down")} onMenu={() => {}} />
    </>
  ),
};

/** Mobile is 343 rather than 388. Heights do not change. */
export const Breakpoints = {
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", gap: U("gap-base"),
      alignItems: "flex-start", background: "var(--semantic-color-fill-surface-canvas)" }}>
      <div style={{ width: 388 }}>
        <KpiTile type="chart" heading="Desktop, 388" value="2,000"
          change={<ChangeChip value="100%" direction="up" />} chart={chart()} onMenu={() => {}} />
      </div>
      <div style={{ width: 343 }}>
        <KpiTile type="chart" heading="Mobile, 343" value="2,000"
          change={<ChangeChip value="100%" direction="up" />} chart={chart()} onMenu={() => {}} />
      </div>
    </div>
  ),
};
