/**
 * Widget.
 *
 * Built from Figma set 40009622:39702, Amplify section of the "↳ Widget" page,
 * read 2026-10-07. The grid spans come from the canonical demo:
 * https://helloimjolopez-collab.github.io/design-sandbox/phase-2/Widget%20Container%20Demo/
 */
import React from "react";
import {
  Widget, WidgetKeyframes, SIZES, SIZE_LABEL, SIZE_GRID, isFlat, L,
} from "../../../../components/widget/widget.jsx";
import { KpiTile, Change } from "../../../../components/kpi-tile/kpi-tile.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;

/** A stand-in for a chart, so the container can be judged without one. */
const ChartBox = ({ label = "chart" }) => (
  <div style={{
    flex: 1, minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--semantic-color-fill-static-neutral-base)",
    border: "1px dashed var(--semantic-color-stroke-static-neutral-base)",
    borderRadius: "var(--semantic-layout-units-cornerradius-base)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)",
    fontSize: "var(--semantic-type-font-size-xs)",
  }}>{label}</div>
);

const kpi = (
  <KpiTile
    eyebrow="Views per month"
    value="2,000"
    change={<Change value="100%" direction="up" note="vs previous yr" />}
    chart={<ChartBox label="mini chart" />}
  />
);

const grid = (children) => (
  <div className="pw-dashboard-grid" style={{
    display: "grid",
    gridTemplateColumns: "repeat(var(--pw-dash-cols, 12), minmax(0, 1fr))",
    gridAutoRows: "48px", gridAutoFlow: "row", gap: U("gap-base"),
    alignContent: "start", padding: U("padding-relaxed"),
    background: "var(--semantic-color-fill-surface-canvas)",
  }}>
    <WidgetKeyframes />
    <style>{`:root{--pw-dash-cols:4}
@media(min-width:768px){:root{--pw-dash-cols:8}}
@media(min-width:1024px){:root{--pw-dash-cols:12}}`}</style>
    {children}
  </div>
);

export default {
  title: "Library/Widget",
  component: Widget,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "The dashboard's container. Three sizes from Figma, and the size is DEPTH " +
      "rather than scale: Detail and Explore are the same height, 416, and " +
      "differ only in width, 566 against 1148. Glance is flat; Detail and " +
      "Explore carry an inner card, which is what the layered look is. " +
      "Minimum widths are Figma's own: 275, 515, 1050." } },
  },
};

/** The three sizes in one board, at their real spans. */
export const Playground = {
  render: () => grid(
    SIZES.map((size) => (
      <Widget key={size} title={`${SIZE_LABEL[size]} widget`} size={size}
        onInfo={() => {}} onGoTo={() => {}} onRefresh={() => {}} onMenu={() => {}}>
        {isFlat(size) ? kpi : (
          <>
            <KpiTile eyebrow="Views per month" value="2,000"
              change={<Change value="100%" direction="up" note="vs previous yr" />} />
            <ChartBox label={`${SIZE_LABEL[size]} chart area`} />
          </>
        )}
      </Widget>
    ))
  ),
};

/** Every size with its measured geometry stated, so drift is visible. */
export const SizeLadder = {
  name: "Size ladder",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-relaxed"), background: "var(--semantic-color-fill-surface-canvas)" }}>
      <WidgetKeyframes />
      {[
        ["glance",  "275x176, minW 275, minH 176, flat, spans 3 cols x 3 rows"],
        ["detail",  "566x416, minW 515, layered, spans 6 cols x 8 rows"],
        ["explore", "1148x416, minW 1050, layered, spans 12 cols x 9 rows"],
      ].map(([size, note]) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", gap: U("gap-tight") }}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
            color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{note}</code>
          <div style={{ display: "flex" }}>
            <Widget title={SIZE_LABEL[size]} size={size} inGrid={false}
              onInfo={() => {}} onRefresh={() => {}}
              style={{ width: size === "glance" ? 275 : size === "detail" ? 566 : 1148,
                height: size === "glance" ? 176 : 416 }}>
              {isFlat(size) ? kpi : (
                <>
                  <KpiTile eyebrow="Views per month" value="2,000"
                    change={<Change value="100%" direction="up" />} />
                  <ChartBox />
                </>
              )}
            </Widget>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * The title as a swap control, which is what the demo puts there. Rename is
 * deliberately not on the title: a renamed widget shows the same data under a
 * different name, which is not what clicking a title asks for.
 */
export const TitleIsSwap = {
  name: "Title is a swap control",
  render: () => grid(
    <Widget title="Financial KPIs" size="detail"
      swap={{ open: false, onOpen: () => {} }}
      onInfo={() => {}} onRefresh={() => {}} onMenu={() => {}}>
      <KpiTile eyebrow="Total income" value="$1,284,500"
        change={<Change value="6.2%" direction="up" note="vs previous yr" />} />
      <ChartBox />
    </Widget>
  ),
};

/**
 * Favourable is not the same as up. Rising costs are bad, so direction and
 * sentiment are separate props; collapsing them paints rising costs green.
 */
export const TrendDirectionVersusSentiment = {
  name: "Trend: direction vs sentiment",
  render: () => grid(
    [
      ["Total income",   "up",   true,  "6.2%"],
      ["Total expenses", "up",   false, "4.1%"],
      ["Net income",     "down", false, "2.3%"],
    ].map(([label, dir, fav, pct]) => (
      <Widget key={label} title={label} size="glance" onInfo={() => {}}>
        <KpiTile eyebrow={label} value="$1,097,800"
          change={<Change value={pct} direction={dir} favourable={fav} note="vs previous yr" />} />
      </Widget>
    ))
  ),
  parameters: { docs: { description: { story:
    "Income up is green. Expenses up is red, same arrow. Net income down is " +
    "red. The arrow follows `direction`, the colour follows `favourable`." } } },
};

/** Not every widget wires every action; the slot takes what it is given. */
export const HeaderActions = {
  name: "Header actions",
  tags: ["!dev"],
  render: () => grid(
    <>
      <Widget title="All four actions" size="glance"
        onInfo={() => {}} onGoTo={() => {}} onRefresh={() => {}} onMenu={() => {}}>
        {kpi}
      </Widget>
      <Widget title="Refresh only" size="glance" onRefresh={() => {}}>{kpi}</Widget>
      <Widget title="No actions" size="glance">{kpi}</Widget>
    </>
  ),
  parameters: { docs: { description: { story:
    "Figma's Slot.HoverIcons is a 72x36 hug holding three 36px Action.Icons, " +
    "so the set is conditional by design. They are revealed on hover and on " +
    "keyboard focus within, and hold their width either way so the title does " +
    "not reflow when they appear." } } },
};
