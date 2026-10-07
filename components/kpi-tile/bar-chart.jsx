/**
 * Bar chart: the stacked bars that fill a Detail or Explore widget.
 *
 * SOURCE OF TRUTH: the rendered Figma Widget, set 40009622:39702, and the
 * `_Chart data` and `Line and bar chart` instances inside its Detail and
 * Explore variants.
 *
 * WHY THIS EXISTS: the Widget stories previously filled the content area with a
 * dashed box captioned "chart". That is a wireframe, not a component, and it
 * made the whole Widget page useless for judging the design. Figma's Detail and
 * Explore are mostly chart by area, so the chart is most of what the widget IS.
 *
 * MEASURED: stacked violet bars on Fill/Chart/Sequential, a light baseline, and on
 * Explore a second panel with a y-axis, x-axis month labels and a series
 * legend. The bars come from the CHART ramp rather than a status colour,
 * because they are categories and not sentiment: nothing here is good or bad.
 * Figma binds Fill/Chart/Sequential/09 and /11 on the Detail bars.
 */
import React, { useId } from "react";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;

export const T = {
  // THE CHART RAMP, not the brand ramp. There is a dedicated
  // Fill/Chart/Sequential/01 to 15 family, a fifteen-step violet scale, and
  // Figma's Widget bars bind /09 (#a198d4) and /11 (#b9b3e0) from it. The first
  // version of this file used Fill/Static/Brand/*, which is the blue brand, so
  // the bars came out navy where the design is violet. Corrected 2026-10-07
  // after reading the fills rather than inferring them.
  //
  // Three stacked series are taken as /07, /09 and /11: the two Figma uses plus
  // one step darker, so the stack keeps an even separation rather than reusing
  // a value. Darkest sits at the bottom of each column.
  // TWO COLOURS, ALTERNATING, not three. Reading the Detail variant's bar on
  // 2026-10-07: Series 1 and Series 3 both bind Fill/Chart/Sequential/09 and
  // Series 2 binds /11. A third distinct step was this file's invention, and it
  // made a two-tone chart read as a three-tone one.
  series: [
    C("fill-chart-sequential-09"),
    C("fill-chart-sequential-11"),
    C("fill-chart-sequential-09"),
  ],
  axis:      C("stroke-static-neutral-faint"),
  axisLabel: C("foreground-static-neutral-subtle"),
  legend:    C("foreground-static-neutral-base"),
};

export const L = {
  // 8, the `Chart` frame's itemSpacing. Measured: 15 bars of 27 with a gap of
  // 8 fill a 526-wide chart, so the bars stay wide and the gaps stay narrow.
  barGap:     U("gap-tight"),
  axisGap:    U("gap-xtight"),
  legendGap:  U("gap-tight"),
  tickWidth:  34,
  titleWidth: 18,   // Figma _Y-axis label is 18 wide
  // The rounded cap on every band. At Figma's 27px bar width the cap measures
  // about 8, so a third of the width, and a flat-topped bar is the single most
  // visible difference between this chart and the design.
  capRadius:  8,
  labelHeight: 16,
};

const MONTHS = ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Dec"];

/**
 * Three series per column, so each bar stacks.
 *
 * FIFTEEN columns, not twelve. Walking the Figma Detail variant's
 * `_Chart data` instance (`Chart type=Bar 01 desktop`) on 2026-10-07 counts
 * fifteen `Bar` frames at 27x286 each. The first version had twelve, taken
 * from the months of a year rather than from the drawing, which left the bars
 * noticeably wider than the design at the same width.
 */
export const SAMPLE_STACKS = [
  [320, 240, 140], [180, 150, 90],  [120, 110, 70],  [260, 200, 120],
  [420, 260, 150], [300, 210, 130], [210, 170, 100], [390, 250, 160],
  [360, 230, 140], [150, 130, 80],  [280, 200, 120], [410, 260, 150],
  [240, 190, 110], [330, 220, 130], [190, 160, 95],
];

/**
 * @param {number[][]} stacks   One array per column, one value per series.
 * @param {boolean} axes        Draw the y-axis, month labels and legend. Figma
 *                              shows these on Explore's second panel only.
 * @param {string[]} seriesNames  Legend labels. Only used when `axes` is true.
 * @param {string} yTitle  Figma `_Y-axis label` 40009417:12964, a rotated axis
 *                 title. Its sample text is "Active users".
 * @param {string} xTitle  Figma `_X-axis label` 40009417:12962, below the
 *                 month row. Its sample text is "Month".
 *
 * THE AXIS TITLES WERE MISSING until 2026-10-07. Figma's Explore variant draws
 * both, and this component had ticks and month labels but no titles at all, so
 * the chart said what the numbers were and never what they measured.
 */
export function BarChart({
  stacks = SAMPLE_STACKS,
  axes = false,
  seriesNames = ["Series 1", "Series 2", "Series 3"],
  yTitle,
  xTitle,
  label,
  className = "",
  style,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const totals = stacks.map((s) => s.reduce((a, b) => a + b, 0));
  const max = Math.max(...totals, 1);
  // Round the axis up to a clean step so the ticks read as numbers a person
  // would choose rather than as the data's own maximum.
  const step = Math.pow(10, Math.floor(Math.log10(max))) / 2;
  const top = Math.ceil(max / step) * step;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f)).reverse();

  const bars = (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: L.barGap,
      flex: 1, minWidth: 0, minHeight: 0,
      borderBottom: `var(--semantic-layout-units-borderwidth-base) solid ${T.axis}`,
    }}>
      {stacks.map((col, i) => {
        /**
         * OVERLAPPING BANDS, EACH RUNNING TO THE BASELINE, which is how Figma
         * builds a bar and nothing like a flat stack of boxes.
         *
         * Reading one `Bar` on 2026-10-07: inside a 27x286 wrapper sits a
         * `Bars` frame 27x243, the column's value, holding three vectors:
         *
         *   Series 1   27x243 at y=0     Fill/Chart/Sequential/09
         *   Series 2   27x179 at y=64    Fill/Chart/Sequential/11
         *   Series 3   27x115 at y=128   Fill/Chart/Sequential/09
         *
         * Each one starts lower than the last and runs to the bottom, each with
         * a ROUNDED TOP, so the cap of every band shows above the one below it
         * and the column reads as a stack of soft steps. The previous version
         * drew three flat boxes end to end with a 2px radius on the topmost
         * only, which is why the chart looked nothing like the design.
         */
        const total = col.reduce((a, b) => a + b, 0);
        let fromTop = 0;
        const bands = col.map((v, s) => {
          const band = { height: total - fromTop, colour: T.series[s % T.series.length] };
          fromTop += v;
          return band;
        });
        return (
          <div key={i} style={{
            flex: 1, minWidth: 0, position: "relative", height: "100%",
          }}>
            {bands.map((b, s) => (
              <div key={s} aria-hidden="true" style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                height: `${(b.height / top) * 100}%`,
                background: b.colour,
                borderTopLeftRadius: L.capRadius,
                borderTopRightRadius: L.capRadius,
              }} />
            ))}
          </div>
        );
      })}
    </div>
  );

  if (!axes) {
    return (
      <div className={`pw-bar-chart ${className}`}
        role={label ? "img" : "presentation"} aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        style={{ display: "flex", flex: 1, minHeight: 0, minWidth: 0, ...style }}>
        {bars}
      </div>
    );
  }

  return (
    <div className={`pw-bar-chart ${className}`}
      role={label ? "img" : "presentation"} aria-label={label || undefined}
      style={{ display: "flex", flexDirection: "column", gap: L.axisGap,
        flex: 1, minHeight: 0, minWidth: 0, ...style }}>
      {/* Legend above, as Figma places it. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end",
        gap: L.legendGap, flexWrap: "wrap" }}>
        {seriesNames.map((n, i) => (
          <span key={n} style={{ display: "inline-flex", alignItems: "center",
            gap: U("gap-xxtight"), color: T.legend,
            fontSize: Y("font-size-xxs"), letterSpacing: Y("letter-spacing-spacious") }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%",
              background: T.series[i % T.series.length] }} />
            {n}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0, gap: L.axisGap }}>
        {/* _Y-axis label: rotated a quarter turn, reading bottom to top, which
            is how Figma draws it and the only way it fits an 18px column. */}
        {yTitle && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
            width: L.titleWidth, flexShrink: 0, color: T.axisLabel,
            fontSize: Y("font-size-xxs"), letterSpacing: Y("letter-spacing-spacious"),
            writingMode: "vertical-rl", transform: "rotate(180deg)",
            paddingBottom: L.labelHeight, whiteSpace: "nowrap" }}>{yTitle}</div>
        )}
        {/* y-axis ticks */}
        <div style={{ width: L.tickWidth, flexShrink: 0, display: "flex",
          flexDirection: "column", justifyContent: "space-between",
          alignItems: "flex-end", paddingBottom: L.labelHeight,
          color: T.axisLabel, fontSize: Y("font-size-xxs") }}>
          {ticks.map((t) => <span key={t}>{t.toLocaleString()}</span>)}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {bars}
          {/* x-axis month labels, spread to match the columns */}
          <div style={{ display: "flex", justifyContent: "space-between",
            height: L.labelHeight, alignItems: "center",
            color: T.axisLabel, fontSize: Y("font-size-xxs") }}>
            {MONTHS.map((m) => <span key={m}>{m}</span>)}
          </div>
          {/* _X-axis label, centred under the month row. */}
          {xTitle && (
            <div style={{ textAlign: "center", color: T.axisLabel,
              fontSize: Y("font-size-xxs"), letterSpacing: Y("letter-spacing-spacious") }}>
              {xTitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarChart;
