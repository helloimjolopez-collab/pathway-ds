/**
 * KPI Tile: the card. 18 Figma variants on Type x Breakpoint.
 *
 * A KPI Tile is ALWAYS a card. The cardless thing is KPI Number & Trend, which
 * is a building block this tile nests and a Widget nests too, and which has no
 * page of its own because it only ever appears nested.
 */
import React from "react";
import { KpiTile, ChangeChip, KPI_TILE_TYPES } from "../../../../components/kpi-tile/kpi-tile.jsx";
import { MiniChart, SAMPLE_SERIES, SAMPLE_MARKERS, curveFor } from "../../../../components/kpi-tile/mini-chart.jsx";
import { KpiNumberAndTrend, Change, CHANGE_TYPES } from "../../../../components/kpi-tile/kpi-number-trend.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const page = (children) => (
  <div style={{ padding: U("padding-relaxed"), background: "var(--semantic-color-fill-surface-canvas)",
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(388px, 388px))",
    gap: U("gap-base"), alignItems: "start" }}>{children}</div>
);
const chart = (s = "wavy-01", dir = "up") => (
  <MiniChart series={SAMPLE_SERIES[s]} direction={dir} curve={curveFor(s)} />
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

/**
 * All three shapes, each captioned with its Type and its measured box. An
 * unlabelled grid of six cards tells a reader nothing about which Type each one
 * is, which is the only question this story exists to answer.
 */
const caption = (text) => (
  <code style={{ display: "block", marginBottom: U("gap-xxtight"),
    fontSize: "var(--semantic-type-font-size-xs)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{text}</code>
);

export const Types = {
  render: () => page(
    <>
      <div>
        {caption('type="simple" · 388x90 · gap 2 · pad 16')}
        <KpiTile type="simple" heading="Views 24 hours" value="2,000"
          change={<ChangeChip value="100%" direction="up" />} onMenu={() => {}} />
      </div>
      <div>
        {caption('type="icon" · 388x158 · gap 24 · pad 16 · featured icon 48 r=28')}
        <KpiTile type="icon" heading="Views 24 hours" value="2,000" icon="trending_up"
          change={<ChangeChip value="100%" direction="up" />} onMenu={() => {}} />
      </div>
      <div>
        {caption('type="chart" · 388x144 · gap 8 · pad 24 · heading Neutral/Strong')}
        <KpiTile type="chart" heading="Views 24 hours" value="2,000"
          change={<ChangeChip value="100%" direction="up" />}
          chart={chart("wavy-01")} onMenu={() => {}} />
      </div>
      <div>
        {caption('type="icon" · a down arrow, read as unfavourable')}
        <KpiTile type="icon" heading="Overdrawn accounts" value="2" icon="visibility"
          direction="down"
          change={<ChangeChip value="100%" direction="down" />} onMenu={() => {}} />
      </div>
      <div>
        {caption('type="chart" · a real measurement series')}
        <KpiTile type="chart" heading="Giving this month" value="$48,210"
          change={<ChangeChip value="12.4%" direction="up" />}
          chart={chart("realistic-01")} onMenu={() => {}} />
      </div>
      <div>
        {caption('type="chart" · the chip is NEUTRAL here, never a trend colour')}
        <KpiTile type="chart" heading="Expenses" value="$1,097,800"
          change={<ChangeChip value="4.1%" direction="up" />}
          chart={chart("realistic-03", "down")} onMenu={() => {}} />
      </div>
    </>
  ),
  parameters: { docs: { description: { story:
    "Nine Figma Types collapse to three shapes, because the numbered suffixes " +
    "vary the sample glyph or the sample line rather than the layout, and both " +
    "of those are props. Note that this set's chip takes " +
    "Foreground/Static/Neutral/Strong, so the trend reads as neutral chrome on " +
    "a tile and as colour inside a widget. That is measured from Figma and " +
    "reproduced rather than unified, because unifying them is a design call." } } },
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

/**
 * The building block, on its own, so the relationship is visible rather than
 * only described. `KpiNumberAndTrend` has NO card: no surface, no border, no
 * radius. It gets those from whatever nests it, which is either a KPI Tile or a
 * Widget. It has no component page of its own because it never appears alone in
 * a product; this story is the only place to look at it.
 */
export const TheBuildingBlock = {
  name: "The building block it nests",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-relaxed"), background: "var(--semantic-color-fill-surface-canvas)" }}>
      <div>
        {caption("KpiNumberAndTrend, raw. No surface, no border, no radius.")}
        <div style={{ width: 388, background: "var(--semantic-color-fill-surface-elevated)",
          border: "1px dashed var(--semantic-color-stroke-static-neutral-base)" }}>
          <KpiNumberAndTrend eyebrow="Views per month" value="2,000"
            change={<Change value="100%" direction="up" note="vs last month" />}
            chart={<MiniChart series={SAMPLE_SERIES["wavy-01"]} direction="up" />} />
        </div>
      </div>
      <div>
        {caption("The same block inside a KPI Tile, which supplies the card.")}
        <div style={{ width: 388 }}>
          <KpiTile type="chart" heading="Views 24 hours" value="2,000"
            change={<ChangeChip value="100%" direction="up" />}
            chart={chart("wavy-01")} onMenu={() => {}} />
        </div>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story:
    "The dashed border is drawn by this story, not by the block, to show where " +
    "its edges are. Anything a widget puts in its content slot gets its card " +
    "from the widget, which is why a KPI Tile inside a widget would be three " +
    "nested cards and is never done." } } },
};

// ─── Tokens ───────────────────────────────────────────────────────────────────

export const TokensColour = {
  name: "Tokens: colour",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Card",
        rows: [
          ["--semantic-color-fill-surface-elevated", "Card surface, and the chip's own fill"],
          ["--semantic-color-stroke-static-neutral-base", "Card border, and the chip's border"],
          ["--semantic-color-foreground-static-neutral-base", "Heading on Simple and Icon"],
          ["--semantic-color-foreground-static-neutral-strong", "Heading on Chart, the number, and the chip's text"],
          ["--semantic-color-foreground-static-neutral-subtle", "Eyebrow in the nested block"],
        ] },
      { title: "Featured icon and trend",
        note: "Direction and sentiment are separate in the building block's Change: " +
              "the arrow follows direction, the colour follows whether the move is " +
              "favourable. Collapsing them into one prop paints rising costs green.",
        rows: [
          ["--semantic-color-fill-static-positive-subtle", "Featured icon circle, favourable"],
          ["--semantic-color-fill-static-negative-subtle", "Featured icon circle, unfavourable"],
          ["--semantic-color-foreground-static-positive-on-subtle", "Favourable trend text and arrow"],
          ["--semantic-color-foreground-static-negative-on-subtle", "Unfavourable trend text and arrow"],
          ["--semantic-color-stroke-static-positive-strong", "The mini chart's LINE vector only, which genuinely strokes with this"],
          ["--semantic-color-stroke-static-negative-strong", "The same, falling"],
          ["--semantic-color-stroke-action-secondary-rest", "Trend filter pill border"],
        ] },
      { title: "Chart ramp",
        note: "The bar chart uses the dedicated fifteen-step chart ramp, not the blue " +
              "brand ramp. The bars are categories, so nothing in them is good or bad. " +
              "An earlier version bound Fill/Static/Brand and came out navy where the " +
              "design is violet.",
        rows: [
          ["--semantic-color-fill-chart-sequential-07", "Bottom series in a stacked bar"],
          ["--semantic-color-fill-chart-sequential-09", "Middle series, bound in Figma"],
          ["--semantic-color-fill-chart-sequential-11", "Top series, bound in Figma"],
        ] },
    ]} />
  ),
};

export const TokensGeometry = {
  name: "Tokens: geometry and type",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Radius, border and spacing",
        note: "Icon's gap and Chart's padding read 20 in Figma, and 20 is not a rung: " +
              "the ladder goes 16 then 24. Nineteen bindings across the set pointed " +
              "straight at the Unit/20 primitive and were rebound to Relaxed, 24, on " +
              "2026-10-07, which is why Chart is 144 tall rather than 136.",
        rows: [
          ["--semantic-layout-units-cornerradius-xlarge", "Card radius, 16"],
          ["--semantic-layout-units-cornerradius-base", "Chip radius"],
          ["--semantic-layout-units-cornerradius-xsmall", "Bar cap radius"],
          ["--semantic-layout-units-borderwidth-base", "Card, chip and axis line, 1"],
          ["--semantic-layout-units-padding-base", "Simple and Icon padding, 16"],
          ["--semantic-layout-units-padding-relaxed", "Chart padding, 24"],
          ["--semantic-layout-units-gap-relaxed", "Icon gap, 24"],
          ["--semantic-layout-units-gap-base", "Number row gap, 16"],
          ["--semantic-layout-units-gap-tight", "Chart gap, 8"],
          ["--semantic-layout-units-gap-xxxtight", "Simple gap, 2"],
        ] },
      { title: "Type",
        rows: [
          ["--semantic-type-font-size-xxl", "The number, 32"],
          ["--semantic-type-font-size-s", "Heading and chip, 14"],
          ["--semantic-type-font-size-xxxs", "Eyebrow, 10"],
          ["--semantic-type-font-size-xxs", "Chart axis and legend labels"],
          ["--semantic-type-weight-bold", "The number"],
          ["--semantic-type-line-height-xxl-single", "The number"],
          ["--semantic-type-letter-spacing-spacious", "Heading, chip and labels"],
          ["--semantic-type-letter-spacing-wide", "Eyebrow"],
        ] },
    ]} />
  ),
};


/**
 * Figma `_Change` 40009415:28112, all FOUR Types and both Trends, against the
 * measurements. This story exists because the set was split across two files
 * with Type 04 missing entirely, so nothing in Storybook showed what the
 * component is supposed to be.
 */
export const ChangeTypes = {
  name: "Change: all four Figma types",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "grid",
      gridTemplateColumns: "auto auto auto 1fr", gap: U("gap-base"),
      alignItems: "center", justifyItems: "start",
      background: "var(--semantic-color-fill-surface-elevated)" }}>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>TYPE</code>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>POSITIVE</code>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>NEGATIVE</code>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>MEASURED</code>
      {[
        ["01", "55x20, arrow_upward / arrow_downward, no container, glyph AND text in the trend"],
        ["02", "55x20, moving / trending_down, no container, glyph AND text in the trend"],
        ["03", "73x28, north_east / south_east, bordered pill r=6, GLYPH in the trend and text Neutral/Strong"],
        ["04", "52x16, moving / trending_down, tinted Badge r=12, Subtle fill with its Subtle stroke"],
      ].map(([t, note]) => (
        <React.Fragment key={t}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)" }}>{t}</code>
          <Change type={t} value="100%" direction="up" />
          <Change type={t} value="100%" direction="down" />
          <span style={{ fontSize: "var(--semantic-type-font-size-xs)",
            color: "var(--semantic-color-foreground-static-neutral-base)" }}>{note}</span>
        </React.Fragment>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story:
    "One Figma set, four Types. Direction drives the ARROW and favourable " +
    "drives the COLOUR, which is why they are separate props: expenses up is " +
    "a rising arrow and a red one. The negative glyph is not the positive " +
    "rotated: Figma draws moving for up and trending_down for down." } } },
};

/**
 * Figma `_Chart mini` 40009415:27919, all twelve Types at both Trends.
 */
export const ChartShapes = {
  name: "Mini chart: all twelve Figma shapes",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: U("gap-base"),
      background: "var(--semantic-color-fill-surface-elevated)" }}>
      {Object.keys(SAMPLE_SERIES).map((k) => (
        <div key={k}>
          {caption(`${k} \u00b7 ${curveFor(k)}`)}
          <div style={{ display: "flex", gap: U("gap-base") }}>
            {["up", "down"].map((d) => (
              <div key={d} style={{ width: 112, height: 56 }}>
                <MiniChart series={SAMPLE_SERIES[k]} direction={d} curve={curveFor(k)}
                  markerIndex={SAMPLE_MARKERS[k]} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story:
    "112x56 at Glance scale. The line is 2px with round caps in " +
    "Stroke/Static/{Positive,Negative}/Strong; the area under it is the same " +
    "colour faded downward; the marker is a 19px ring with an 11px " +
    "Fill/Surface/Elevated dot. CURVE IS PART OF THE SHAPE: Figma's Wavy and " +
    "Layers paths are beziers and its Realistic paths are polylines, and " +
    "drawing all twelve as polylines made every Wavy look like a Realistic." } } },
};
