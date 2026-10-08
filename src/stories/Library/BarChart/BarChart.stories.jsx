/**
 * Bar Chart: the stacked bars a Detail or Explore widget fills with.
 *
 * ITS OWN PAGE, because a chart buried in the Widget page cannot be found,
 * driven or composed with. Figma `_Chart data` 40009417:13029 is a component
 * in its own right with eighteen Chart types, and the Bar types map here while
 * the Line types map to Mini Chart.
 */
import React from "react";
import { BarChart, SAMPLE_STACKS, T, L } from "../../../../components/kpi-tile/bar-chart.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const page = (children) => (
  <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
    gap: U("gap-relaxed"), background: "var(--semantic-color-fill-surface-elevated)" }}>{children}</div>
);
const caption = (text) => (
  <code style={{ display: "block", marginBottom: U("gap-xxtight"),
    fontSize: "var(--semantic-type-font-size-xs)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{text}</code>
);

/** Fewer or more columns, so the bar width and gap can be judged. */
const SLICES = {
  "15 columns, as Figma": SAMPLE_STACKS,
  "7 columns": SAMPLE_STACKS.slice(0, 7),
  "one series": SAMPLE_STACKS.map(([a]) => [a]),
  "two series": SAMPLE_STACKS.map(([a, b]) => [a, b]),
};

export default {
  title: "Library/Bar Chart",
  component: BarChart,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "EACH COLUMN IS THREE OVERLAPPING BANDS, not a flat stack of boxes. " +
      "Figma builds a bar from three vectors that each start lower than the " +
      "last and run to the baseline, each with a ROUNDED TOP, so every band's " +
      "cap shows above the one below it. Two alternating colours, not three: " +
      "Series 1 and 3 bind Fill/Chart/Sequential/09 and Series 2 binds /11. " +
      "The chart ramp, not the brand ramp, because the bars are categories and " +
      "nothing in them is good or bad." } },
  },
  argTypes: {
    columns: { name: "Data", control: "select", options: Object.keys(SLICES) },
    axes: { name: "Axes and legend", control: "boolean",
      description: "Figma draws these on Explore's second panel only." },
    yTitle: { name: "Y axis title", control: "text" },
    xTitle: { name: "X axis title", control: "text" },
    height: { name: "Box height", control: { type: "range", min: 80, max: 400, step: 10 } },
  },
};

export const Playground = {
  args: { columns: "15 columns, as Figma", axes: true, yTitle: "Active users",
    xTitle: "Month", height: 260 },
  render: (a) => page(
    <>
      {caption(`${a.columns} · ${a.axes ? "with axes and legend" : "bars only"} · ${a.height}px tall`)}
      <div style={{ height: a.height, display: "flex" }}>
        <BarChart stacks={SLICES[a.columns]} axes={a.axes}
          yTitle={a.axes ? a.yTitle : undefined} xTitle={a.axes ? a.xTitle : undefined}
          label="Active users by month" />
      </div>
    </>
  ),
};

/** The parts, one at a time. */
/**
 * ONE COLUMN, with its three band values as controls. This is the level the
 * overlap is visible at: the bands are drawn in a fixed order and each runs to
 * the baseline, so setting the middle value above the top one hides the top
 * band rather than reordering them.
 */
export const ElementExplorer = {
  name: "Element explorer",
  args: { a: 40, b: 70, c: 95, axes: false, height: 220 },
  argTypes: {
    a: { name: "Band 07, drawn first", control: { type: "range", min: 0, max: 100 } },
    b: { name: "Band 09, drawn second", control: { type: "range", min: 0, max: 100 } },
    c: { name: "Band 11, drawn last and so on top", control: { type: "range", min: 0, max: 100 } },
    axes: { name: "Axis line and legend", control: "boolean" },
    height: { name: "Container height", control: { type: "range", min: 60, max: 320, step: 20 } },
  },
  render: (a) => page(
    <>
      {caption(
        `07=${a.a} 09=${a.b} 11=${a.c}. Each band runs from the baseline to its own ` +
        "value with a rounded top, so the taller ones cap the shorter ones. Drop " +
        "band 11 below band 09 and it disappears behind it: that is the overlap, " +
        "and it is why these are not stacked segments.")}
      <div style={{ height: a.height, width: 72, display: "flex" }}>
        <BarChart stacks={[[a.a, a.b, a.c]]} axes={a.axes} label="One column" />
      </div>
      {caption(
        "Set one value to 0 and the cap radius goes with it. An 8px radius on a " +
        "1px band draws a curve that cannot fit, which shows as a smear along the " +
        "axis, so the radius is dropped below the height that can carry it.")}
    </>
  ),
};

export const AxesAndTitles = {
  name: "Axes and titles",
  render: () => page(
    <>
      {[
        ["bars only, which is what Detail draws", { axes: false }],
        ["with the axes, the legend and both titles", { axes: true, yTitle: "Active users", xTitle: "Month" }],
        ["axes with no titles, to see what the titles add", { axes: true }],
      ].map(([label, props]) => (
        <div key={label}>
          {caption(label)}
          <div style={{ height: 220, display: "flex" }}>
            <BarChart stacks={SAMPLE_STACKS} label="Active users by month" {...props} />
          </div>
        </div>
      ))}
      <div>
        {caption("one column, magnified: three bands, each with a rounded cap")}
        <div style={{ height: 220, width: 60, display: "flex" }}>
          <BarChart stacks={[SAMPLE_STACKS[4]]} label="One column" />
        </div>
      </div>
    </>
  ),
  parameters: { docs: { description: { story:
    "The single column is the one to look at. The bands overlap rather than " +
    "stacking: band one runs the full height, band two starts lower and also " +
    "runs to the baseline, band three lower again. Each has an 8px rounded " +
    "top, so what you see is three soft steps. A flat stack of three boxes " +
    "with a 2px radius on the topmost is what this component drew until " +
    "2026-10-08, and it is the reason the chart looked nothing like Figma." } } },
};

/** How it behaves in the boxes its consumers give it. */
export const InContext = {
  name: "The sizes its consumers use",
  render: () => page(
    <>
      {[
        ["Detail, one panel, no axes", 566, 300, false],
        ["Explore, left panel, no axes", 520, 300, false],
        ["Explore, right panel, with axes", 520, 300, true],
      ].map(([label, w, h, axes]) => (
        <div key={label}>
          {caption(`${label} · ${w}x${h}`)}
          <div style={{ width: w, height: h, display: "flex",
            outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)" }}>
            <BarChart stacks={SAMPLE_STACKS} axes={axes}
              yTitle={axes ? "Active users" : undefined} xTitle={axes ? "Month" : undefined}
              label="Active users by month" />
          </div>
        </div>
      ))}
    </>
  ),
  parameters: { docs: { description: { story:
    "Bar width is not fixed: the columns flex and the GAP is held at 8, which " +
    "is Figma's own itemSpacing. Fifteen bars of 27 with a gap of 8 fill a " +
    "526-wide chart, which is what the Detail variant measures." } } },
};

/**
 * A chart's states are its DATA's states, not a pointer's. These four are the
 * ones that break a chart drawn naively: one column, one series, a zero, and
 * nothing at all.
 */
export const StateMatrix = {
  name: "State matrix",
  render: () => page(
    <>
      {caption(
        "Each of these drew wrong at some point. A single column stretched to the " +
        "full width, a single series lost the alternating ramp, a zero column drew " +
        "a 1px sliver with a 8px cap radius on it, and no data drew an axis with " +
        "nothing against it.")}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: U("gap-relaxed") }}>
        {[
          ["Full, fifteen columns", SAMPLE_STACKS],
          ["One column", [SAMPLE_STACKS[0]]],
          ["One series", SAMPLE_STACKS.map((c) => [c[0]])],
          ["A zero in the middle", SAMPLE_STACKS.map((c, i) => (i === 7 ? [0, 0, 0] : c))],
        ].map(([label, stacks]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column",
            gap: U("gap-xxtight") }}>
            <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
              color: "var(--semantic-color-foreground-static-neutral-bold)" }}>{label}</code>
            <div style={{ height: 180,
              background: "var(--semantic-color-fill-surface-elevated)",
              border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
              borderRadius: "var(--semantic-layout-units-cornerradius-base)",
              padding: U("padding-base"), boxSizing: "border-box" }}>
              <BarChart stacks={stacks} axes yTitle="Amount" xTitle="Month" />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: U("gap-xxtight") }}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
            color: "var(--semantic-color-foreground-static-neutral-bold)" }}>No data</code>
          <div style={{ height: 180,
            background: "var(--semantic-color-fill-surface-elevated)",
            border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
            borderRadius: "var(--semantic-layout-units-cornerradius-base)",
            padding: U("padding-base"), boxSizing: "border-box" }}>
            <BarChart stacks={[]} axes yTitle="Amount" xTitle="Month" />
          </div>
        </div>
      </div>
      {caption(
        "The bands in a column OVERLAP and each one runs to the baseline, which is " +
        "why the lightest reads as a cap rather than a segment. Drawn as stacked " +
        "segments instead, the middle series is a floating block.")}
    </>
  ),
};

export const TokensFill = {
  name: "Tokens: fill",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Fill",
        note: "Two alternating ramp steps, 09 and 11, with 07 for a third series. " +
              "The three bands in a column OVERLAP and each runs to the baseline, " +
              "which is why the lightest one reads as a cap rather than a segment.",
        rows: [
          ["--semantic-color-fill-chart-sequential-09",
           "Series 1 and Series 3"],
          ["--semantic-color-fill-chart-sequential-11",
           "Series 2"],
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
        note: "The axis line only.",
        rows: [
          ["--semantic-color-stroke-static-neutral-faint",
           "The baseline"],
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
        note: "Axis and legend labels.",
        rows: [
          ["--semantic-color-foreground-static-neutral-subtle",
           "Tick values, month labels and both axis titles"],
          ["--semantic-color-foreground-static-neutral-base",
           "Legend labels"],
        ] },
    ]} />
  ),
};
