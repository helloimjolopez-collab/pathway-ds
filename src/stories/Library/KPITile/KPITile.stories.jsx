/**
 * KPI Tile.
 *
 * Two components, measured from Figma on 2026-10-07 and deliberately separate:
 *   KpiTile  from KPI Number & Trend 40017320:247, goes inside a Widget
 *   KpiCard  from KPI Tiles 40009415:27750, is its own card
 */
import React from "react";
import { KpiTile, KpiNumber, Change } from "../../../../components/kpi-tile/kpi-tile.jsx";
import { KpiCard, ChangeChip, KPI_CARD_TYPES } from "../../../../components/kpi-tile/kpi-card.jsx";
import { MiniChart, SAMPLE_SERIES } from "../../../../components/kpi-tile/mini-chart.jsx";
import { Widget, WidgetKeyframes } from "../../../../components/widget/widget.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;

const page = (children, cols = "repeat(auto-fit, minmax(388px, 388px))") => (
  <div style={{ padding: U("padding-relaxed"), background: "var(--semantic-color-fill-surface-canvas)",
    display: "grid", gridTemplateColumns: cols, gap: U("gap-base"), alignItems: "start" }}>
    <WidgetKeyframes />
    {children}
  </div>
);

const note = (t) => (
  <code style={{ gridColumn: "1 / -1", fontSize: "var(--semantic-type-font-size-xs)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{t}</code>
);

export default {
  title: "Library/KPI Tile",
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "Two KPI tiles that look alike and are not interchangeable. KpiTile goes " +
      "INSIDE a Widget and has no card of its own, because the Widget is the " +
      "card. KpiCard IS a card. Putting the wrong one in a Widget gives a card " +
      "inside a card inside a card; putting the wrong one on a page gives a " +
      "tile with no edges." } },
  },
};

/** The in-widget tile, in the thing it belongs in. */
export const Playground = {
  render: () => page(
    <>
      {note("KpiTile inside a Widget. The Widget is the card, so the tile has none.")}
      <Widget title="Views per month" size="glance" inGrid={false}
        onInfo={() => {}} onRefresh={() => {}} style={{ width: 275, height: 176 }}>
        <KpiTile eyebrow="Views per month" value="2,000"
          change={<Change value="100%" direction="up" note="vs previous yr" />}
          chart={<MiniChart series={SAMPLE_SERIES["wavy-01"]} direction="up" />} />
      </Widget>
      <Widget title="Chart bottom" size="glance" inGrid={false} onRefresh={() => {}}
        style={{ width: 275, height: 176 }}>
        <KpiTile layout="bottom" eyebrow="Views per month" value="2,000"
          change={<Change value="100%" direction="up" />}
          chart={<MiniChart series={SAMPLE_SERIES["realistic-01"]} direction="up" />} />
      </Widget>
      <Widget title="No chart" size="glance" inGrid={false} style={{ width: 275, height: 176 }}>
        <KpiTile eyebrow="Views per month" value="2,000"
          change={<Change value="100%" direction="up" note="vs previous yr" />} />
      </Widget>
    </>,
    "repeat(auto-fit, minmax(275px, 275px))"
  ),
};

/** The standalone card, at its three measured Types. */
export const CardTypes = {
  name: "Card types",
  render: () => page(
    <>
      {note("Simple: 388x90, gap 2, pad 16. Heading on Neutral/Base.")}
      <KpiCard type="simple" heading="Views 24 hours" value="2,000"
        change={<ChangeChip value="100%" direction="up" />} onMenu={() => {}}
        style={{ width: 388, height: 90 }} />
      {note("Icon: 388x158, gap 24, pad 16. Featured icon 48 at r=28. Gap was Unit/20, rebound to Gap/Relaxed.")}
      <KpiCard type="icon" heading="Views 24 hours" value="2,000" icon="trending_up"
        change={<ChangeChip value="100%" direction="up" />} onMenu={() => {}}
        style={{ width: 388, height: 158 }} />
      {note("Chart: 388x144, gap 8, pad 24. Heading on Neutral/STRONG, not Base. Padding was Unit/20.")}
      <KpiCard type="chart" heading="Views 24 hours" value="2,000"
        change={<ChangeChip value="100%" direction="up" />} onMenu={() => {}}
        chart={<MiniChart series={SAMPLE_SERIES["wavy-01"]} direction="up" />}
        style={{ width: 388, height: 144 }} />
      {note("Mobile width: 343 rather than 388. Same heights.")}
      <KpiCard type="simple" heading="Views 24 hours" value="2,000"
        change={<ChangeChip value="100%" direction="down" />} onMenu={() => {}}
        style={{ width: 343, height: 90 }} />
    </>
  ),
};

/**
 * The one rule in this component that cannot be shortcut: the arrow follows
 * direction, the colour follows sentiment.
 */
export const TrendDirectionVersusSentiment = {
  name: "Trend: direction vs sentiment",
  render: () => page(
    <>
      {note("Income up is green. Expenses up is RED, same arrow. Net income down is red.")}
      {[
        ["Total income",   "$1,284,500", "6.2%",  "up",   true],
        ["Total expenses", "$1,097,800", "4.1%",  "up",   false],
        ["Net income",     "$186,700",   "21.3%", "down", false],
      ].map(([label, value, pct, dir, fav]) => (
        <div key={label} style={{ width: 275, padding: U("padding-tight"),
          background: "var(--semantic-color-fill-surface-elevated)",
          border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
          borderRadius: U("cornerradius-xlarge") }}>
          <KpiNumber eyebrow={label} value={value}
            change={<Change value={pct} direction={dir} favourable={fav} note="vs previous yr" />} />
        </div>
      ))}
    </>,
    "repeat(auto-fit, minmax(275px, 275px))"
  ),
  parameters: { docs: { description: { story:
    "`direction` picks the arrow, `favourable` picks the colour. Collapsing " +
    "them into one prop is the obvious shortcut and it paints rising costs " +
    "green. The default is up-is-good, which is right for most metrics and " +
    "wrong for every cost." } } },
};

/**
 * Figma's twelve chart Types are twelve hand-drawn shapes, so the component
 * plots a series instead. These are those shapes as data.
 */
export const ChartShapes = {
  name: "Chart shapes",
  render: () => page(
    <>
      {note("MiniChart renders from a series. The marker stays 19/11 and circular at any box size.")}
      {Object.entries(SAMPLE_SERIES).map(([name, series]) => (
        <div key={name} style={{ width: 275, display: "flex", flexDirection: "column",
          gap: U("gap-xtight") }}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
            color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{name}</code>
          <div style={{ height: 70, background: "var(--semantic-color-fill-surface-elevated)",
            border: "1px solid var(--semantic-color-stroke-static-neutral-faint)",
            borderRadius: U("cornerradius-base"), padding: U("padding-xtight") }}>
            <MiniChart series={series} direction={name.includes("03") ? "down" : "up"}
              markerBothEnds={name === "straight"} label={`${name} trend`} />
          </div>
        </div>
      ))}
    </>,
    "repeat(auto-fit, minmax(275px, 275px))"
  ),
};
