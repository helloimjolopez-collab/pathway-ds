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
    return (
      <KpiNumberAndTrend value="$4,948,850" numberStyle="wide"
        change={<Change value="1.8%" direction="up" type="02" note="vs previous period" />} />
    );
  }
  return (
    <>
      <KpiNumberAndTrend value="$4,948,850" numberStyle="wide"
        change={<Change value="1.8%" direction="up" type="02" note="vs previous period" />} />
      {size === "explore"
        ? <BarChart stacks={SAMPLE_STACKS} axes yTitle="Amount" xTitle="Month" />
        : <MiniChart d={SAMPLE_SERIES["realistic-01"]} curve={curveFor("realistic-01")}
            markerIndex={SAMPLE_MARKERS["realistic-01"]} favourable />}
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
          {`${size} · span ${g.cols[2]} of 12 at desktop, ${g.cols[1]} of 8 at tablet, ${g.cols[0]} of 4 on mobile · ${g.rows} rows · ${isFlat(size) ? "flat" : "layered"}`}
        </code>
        <Widget title="Bank Balances" size={size} inGrid={false}
          onRefresh={() => {}} onGoTo={() => {}} onMenu={() => {}}>
          {body(size)}
        </Widget>
      </div>
    </DemoChrome>
  );
}

mount(<App />);
