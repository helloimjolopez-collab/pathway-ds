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
export const ElementExplorer = {
  name: "Element explorer",
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

export const TokensColour = {
  name: "Tokens: colour",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "The bars",
        note: "TWO colours, alternating. Series 1 and Series 3 are the same step, "
            + "which is what Figma binds; a third distinct step was this component's "
            + "invention and made a two-tone chart read as three-tone.",
        rows: [
          ["--semantic-color-fill-chart-sequential-09", "Series 1 and Series 3"],
          ["--semantic-color-fill-chart-sequential-11", "Series 2"],
        ] },
      { title: "Axes and legend",
        rows: [
          ["--semantic-color-stroke-static-neutral-faint", "The baseline"],
          ["--semantic-color-foreground-static-neutral-subtle", "Tick values, month labels and both axis titles"],
          ["--semantic-color-foreground-static-neutral-base", "Legend labels"],
        ] },
    ]} />
  ),
};
