/**
 * Widget's standalone demo. Imports the real module, so there is nothing here
 * that can fall out of step with the shipped component: see
 * components/_demo/harness.jsx for why the newer demos are generated.
 */
import React, { useState } from "react";
import { DemoChrome, mount } from "../_demo/harness.jsx";
import { Widget, WidgetKeyframes, SIZE_GRID, isFlat } from "./widget.jsx";
import { KpiNumberAndTrend, Change } from "../kpi-tile/kpi-number-trend.jsx";
import { MiniChart, SAMPLE_SERIES, SAMPLE_MARKERS, curveFor } from "../kpi-tile/mini-chart.jsx";
import { BarChart, SAMPLE_STACKS } from "../kpi-tile/bar-chart.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const SIZES = Object.keys(SIZE_GRID);

const body = (size) => {
  if (isFlat(size)) {
    /* A GLANCE IS 275 WIDE AND THAT CONSTRAINS THE NUMBER, not the component.
       Figma's own Chart Right has KPI Number HUG at 152 and Chart.Container
       FILL at 111 inside 287, which is what this implements. Put "$4,948,850"
       there instead, 32px and ten characters wide, and the number takes 180 of
       the 227 available: the chart is the flexible item, so it shrinks to 4px
       and renders as a lone marker dot. That is the content not fitting, not
       the layout misbehaving, and it is the reason a Glance shows a short
       figure with its trend and leaves the long one to Detail. */
    return (
      <KpiNumberAndTrend
        eyebrow="Undeposited" value="$3,940"
        change={<Change value="1.8%" direction="up" type="02" note="vs last week" />}
        chart={<MiniChart d={SAMPLE_SERIES["realistic-01"]} curve={curveFor("realistic-01")}
          markerIndex={SAMPLE_MARKERS["realistic-01"]} favourable />} />
    );
  }
  return (
    <>
      <KpiNumberAndTrend value="$4,948,850" numberStyle="wide"
        change={<Change value="1.8%" direction="up" type="02" note="vs previous period" />} />
      {/* A MINI CHART DOES NOT BELONG IN A DETAIL OR EXPLORE WIDGET. It stretches
          to its container on both axes by design, which is what lets one path
          fill a 112x56 slot in a KPI tile, and the same property blows it up to
          a 560x300 sparkline here. Detail and Explore get the full chart; the
          mini chart stays in Glance, where it is the size it was drawn at. */}
      <BarChart stacks={size === "explore" ? SAMPLE_STACKS : SAMPLE_STACKS.slice(0, 8)}
        axes yTitle="Amount" xTitle="Month" />
    </>
  );
};

function App() {
  const [size, setSize] = useState("detail");
  const g = SIZE_GRID[size];
  return (
    <DemoChrome
      title="Widget"
      blurb={"Resize the window, or pick a width above. The size is not a label: " +
             "Glance is flat, Detail and Explore layer an elevated card inside a " +
             "faint root, and each resolves to a column span and a row count."}>
      <WidgetKeyframes />
      <div style={{ display: "flex", flexDirection: "column", gap: U("gap-base") }}>
        <div style={{ display: "flex", gap: U("gap-tight"), flexWrap: "wrap" }}>
          {SIZES.map((s) => (
            <button key={s} type="button" onClick={() => setSize(s)}
              aria-pressed={size === s}
              style={{ appearance: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: "var(--semantic-type-font-size-xs)", minHeight: 28,
                padding: `${U("padding-xxxtight")} ${U("padding-tight")}`,
                borderRadius: U("cornerradius-base"),
                border: `1px solid var(--semantic-color-stroke-static-neutral-base)`,
                background: size === s
                  ? "var(--semantic-color-fill-action-primary-subtle-rest)"
                  : "var(--semantic-color-fill-surface-elevated)",
                color: size === s
                  ? "var(--semantic-color-foreground-action-primary-on-subtle-rest)"
                  : "var(--semantic-color-foreground-action-secondary-rest)" }}>
              {s}
            </button>
          ))}
        </div>
        <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
          {`${size} · span ${g.cols[2]} of 12 at desktop, ${g.cols[1]} of 8 at tablet, ${g.cols[0]} of 4 on mobile · ${g.rows} rows = ${g.rows * 48 + (g.rows - 1) * 16}px · ${isFlat(size) ? "flat" : "layered"}`}
        </code>
        {/* A REAL `.pw-dashboard-grid`, not a widget with a hand-set height.
            Outside a board a widget hugs its content and spans nothing, so the
            first version of this demo showed Detail 290px tall and full width
            under a caption reading "span 6 of 12": the numbers were right and
            the picture contradicted them. In the grid the widget sizes itself
            from the same `--pw-widget-cols-*` variables and row counts the
            Dashboard uses, and the breakpoints in `WidgetKeyframes` move the
            span, so the caption and the drawing cannot disagree. */}
        <div className="pw-dashboard-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: 48, gap: U("gap-base"), alignItems: "stretch" }}>
          <Widget title="Bank Balances" size={size}
            onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>
            {body(size)}
          </Widget>
        </div>
      </div>
    </DemoChrome>
  );
}

mount(<App />);
