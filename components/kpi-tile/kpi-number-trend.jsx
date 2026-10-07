/**
 * KPI Number & Trend — a BUILDING BLOCK, not a component page.
 *
 * SOURCE OF TRUTH: Figma `KPI  Number & Trend`, set 40017320:247, with
 * `KPI Number` 40017333:37612 and `_Change` 40009415:28112 inside it.
 *
 * WHAT THIS IS AND IS NOT. This is the eyebrow, the figure, its trend and
 * optionally a sparkline. It has NO CARD. It is nested inside things that do:
 *
 *   KPI Tile   components/kpi-tile/kpi-tile.jsx   the card, 18 Figma variants
 *   Widget     components/widget/widget.jsx       the dashboard container
 *
 * An earlier version of this file was called KpiTile and described as "the KPI
 * tile that goes inside a widget, which has no card because the widget is the
 * card". That was wrong on both counts. A KPI Tile is a card, always: every one
 * of the 18 variants has its own surface, border and radius. And a KPI Tile and
 * a Widget are not two framings of one thing, they are two different
 * components that happen to nest the same block. Corrected 2026-10-07.
 *
 * It therefore gets a Code Connect mapping and no Storybook page of its own,
 * because it only ever appears as a nested instance.
 *
 * MEASURED
 *   root          VERTICAL, pad 0,12,0,12
 *   Chart & Trend HORIZONTAL gap 24
 *   Eyebrow       fs 10  Foreground/Static/Neutral/Subtle
 *   Number        fs 32  Foreground/Static/Neutral/Strong
 *   Chart slot    VERTICAL pad 8,0,8,4, FILLs
 *   _Change       gap 6 outer, 2 inner, 16px icon, fs 14
 *   filter pill   26 tall, r=8, Stroke/Action/Secondary/Rest
 *
 * FAVOURABLE IS NOT THE SAME AS UP. `direction` picks the arrow and
 * `favourable` picks the colour, because a rising figure is good for income and
 * bad for expenses. Collapsing them paints rising costs green.
 *
 * THE TREND COLOUR WAS A STROKE TOKEN USED AS A TEXT FILL, in Figma and so
 * here. Fixed in Figma 2026-10-07: 10 fills across the 8 _Change variants moved
 * to Foreground/Static/{Positive,Negative}/On Subtle. It was failing contrast as
 * well as the tier, 4.15:1 against a 4.5 floor for 14px text; now 13.62:1.
 */
import React from "react";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;

export const T = {
  eyebrow:   C("foreground-static-neutral-subtle"),
  number:    C("foreground-static-neutral-strong"),
  caption:   C("foreground-static-neutral-base"),
  // Trend colour. These were Stroke/Static/{Positive,Negative}/Strong, because
  // that is what Figma bound as the TEXT fill. Fixed in Figma on 2026-10-07
  // rather than reproduced: a text fill belongs to the Foreground tier, and the
  // positive one also failed contrast at 4.15:1 on the card against a 4.5 floor
  // for 14px text. Foreground/Static/Positive/On Subtle measures 13.62:1 and
  // the negative one 10.74:1.
  up:        C("foreground-static-positive-on-subtle"),
  down:      C("foreground-static-negative-on-subtle"),
  neutral:   C("foreground-static-neutral-base"),
  filterBorder: C("stroke-action-secondary-rest"),
};

export const L = {
  rootPadH:   U("padding-tight"),    // 12, KPI Number & Trend pad 0,12,0,12
  rowGap:     U("gap-relaxed"),      // 24, Chart & Trend gap
  stackGap:   U("gap-xxxtight"),     // 2
  changeGap:  U("gap-xtight"),       // 6, _Change outer gap
  changeInner:U("gap-xxxtight"),     // 2, _Change inner frame gap
  chartPadT:  U("padding-xtight"),   // 8, Chart.Container pad 8,0,8,4
  chartPadL:  U("padding-xxxtight"), // 4
  changeIcon: 16,
  filterH:    26,
  filterPadV: U("padding-xxxtight"), // 4
  filterPadH: U("padding-xxtight"),  // 6
  filterRadius: U("cornerradius-base"),
};

/** Figma's Type axis on _Change: 01 uses arrows, 02 uses the `moving` glyph. */
export const CHANGE_TYPES = ["arrow", "moving"];

const GLYPH = {
  arrow:  { up: "arrow_upward", down: "arrow_downward", flat: "remove" },
  moving: { up: "moving",       down: "moving",         flat: "remove" },
};

/**
 * The trend pill. Figma's _Change.
 *
 * @param {"up"|"down"|"flat"} direction  Which way the number moved.
 * @param {boolean} favourable            Whether that movement is good. Defaults
 *                                        to up-is-good, which is true for most
 *                                        metrics and wrong for costs.
 * @param {"arrow"|"moving"} glyphType    Figma's Type axis.
 */
export function Change({
  value,
  direction = "up",
  favourable,
  glyphType = "arrow",
  note,
  className = "",
}) {
  const good = favourable === undefined ? direction === "up" : favourable;
  const colour = direction === "flat" ? T.neutral : (good ? T.up : T.down);
  const glyph = (GLYPH[glyphType] || GLYPH.arrow)[direction];

  return (
    <span className={`pw-kpi-change ${className}`} style={{
      display: "inline-flex", alignItems: "center", gap: L.changeGap, minWidth: 0,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: L.changeInner,
        color: colour, minWidth: 0 }}>
        <span className="material-symbols-rounded" aria-hidden="true" style={{
          fontSize: L.changeIcon, lineHeight: 1, display: "block",
          fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${L.changeIcon}`,
        }}>{glyph}</span>
        <span style={{
          fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
          letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap",
        }}>{value}</span>
      </span>
      {note && (
        <span style={{
          color: T.caption, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontSize: Y("font-size-xs"), lineHeight: Y("line-height-xs-single"),
          letterSpacing: Y("letter-spacing-spacious"),
        }}>{note}</span>
      )}
    </span>
  );
}

/**
 * The period filter control. Figma's "With Filter Controls?" axis puts a 26px
 * pill with Stroke/Action/Secondary/Rest above the number.
 */
export function TrendFilter({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", alignSelf: "flex-start",
      minHeight: L.filterH, padding: `${L.filterPadV} ${L.filterPadH}`,
      background: "transparent", color: T.caption, cursor: "pointer",
      border: `var(--semantic-layout-units-borderwidth-base) solid ${T.filterBorder}`,
      borderRadius: L.filterRadius, fontFamily: "inherit",
      fontSize: Y("font-size-xs"), lineHeight: Y("line-height-xs-single"),
      letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap",
    }}>{label}</button>
  );
}

/**
 * KPI Number: the eyebrow, the figure, and the trend beneath it.
 *
 * @param {string} eyebrow   Small label above the figure. fs 10 in Figma.
 * @param {string} value     The figure itself. fs 32.
 * @param {node}   change    A <Change>, or anything.
 * @param {string} filter    Period filter label. Omit for no filter control.
 */
export function KpiNumber({
  eyebrow,
  value,
  change,
  filter,
  onFilterClick,
  /** Figma `KPI Number` Style axis. Tall stacks the number over its trend;
   *  Wide sets them side by side, which is what the Chart Bottom layout uses so
   *  the number row does not eat the chart's height. */
  numberStyle = "tall",
  /** Figma `Trend Filter Layout`, all three of its options:
   *
   *    "stacked"  above the number, inside this block
   *    "inline"   on the same row as the number
   *    "toolbar"  on the widget's own toolbar, so this block draws none
   *
   *  "toolbar" is not the same as omitting `filter`: the control still exists,
   *  it just lives somewhere else, and the label is still needed so whoever
   *  renders the toolbar has it. */
  filterLayout = "stacked",
  className = "",
}) {
  const wide = numberStyle === "wide";
  return (
    <div className={`pw-kpi-number ${className}`} data-style={numberStyle} style={{
      display: "flex", flexDirection: "column", gap: L.stackGap, minWidth: 0,
      justifyContent: "center",
    }}>
      {filter && filterLayout === "stacked" && <TrendFilter label={filter} onClick={onFilterClick} />}
      {eyebrow && (
        <span style={{
          color: T.eyebrow, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontSize: Y("font-size-xxxs"), lineHeight: Y("line-height-xxs-single"),
          letterSpacing: Y("letter-spacing-spacious"),
        }}>{eyebrow}</span>
      )}
      {/* Tall stacks the number over the trend. Wide sets them in a row, which
          is Figma's Style=Wide and what Chart Bottom uses. */}
      <span style={{ display: "flex", alignItems: wide ? "baseline" : "stretch",
        flexDirection: wide ? "row" : "column", gap: wide ? L.rowGap : L.stackGap,
        minWidth: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: L.rowGap, minWidth: 0 }}>
          <span style={{
            color: T.number, whiteSpace: "nowrap",
            fontSize: Y("font-size-xxl"), lineHeight: Y("line-height-xxl-single"),
            fontWeight: Y("weight-bold"), letterSpacing: Y("letter-spacing-wide"),   // no `tight` rung exists; wide is the tightest
          }}>{value}</span>
          {/* inline: the filter rides the number's own row. */}
          {filter && filterLayout === "inline" && (
            <TrendFilter label={filter} onClick={onFilterClick} />
          )}
        </span>
        {change}
      </span>
    </div>
  );
}

/**
 * KPI Number & Trend: the figure beside its chart.
 *
 * Figma's Type axis is four layouts. `chart` here is whatever the consumer
 * supplies, so the axis reduces to where it goes:
 *
 *   Type=01 / 03 Chart Right   -> layout="right"   the default
 *   Type=02 Chart Bottom       -> layout="bottom"
 *   Type=04 No Chart           -> omit `chart`
 *
 * THE WIDGET'S `Configuration` AXIS RESOLVES TO PROPS ON THIS COMPONENT, which
 * is what it turned out to be after looking past the nested instance's own
 * variant and at its content. Read 2026-10-07:
 *
 *   Config   Style   Trend filter                  Chart
 *   01       Tall    stacked with the number       right
 *   02       Wide    on the widget's toolbar       bottom
 *   03       Tall    on the widget's toolbar       right
 *   04       Tall    on the widget's toolbar       right, different shape
 *
 * So 01 and 02 are genuinely distinct configurations, and 03 and 04 share a
 * structure and differ only in which sample line the chart draws. Those four
 * rows are expressible as `numberStyle`, `filterLayout` and `layout`, which is
 * why the Widget itself takes none of them: Configuration is a property of the
 * CONTENT, and this is the content.
 */
export function KpiNumberAndTrend({
  eyebrow,
  value,
  change,
  chart,
  layout = "right",
  filter,
  onFilterClick,
  numberStyle = "tall",
  filterLayout = "stacked",
  className = "",
  style,
}) {
  const bottom = layout === "bottom" || !chart;
  return (
    <div className={`pw-kpi-number-trend ${className}`} style={{
      display: "flex", flexDirection: "column",
      padding: `0 ${L.rootPadH}`, boxSizing: "border-box",
      flex: 1, minHeight: 0, minWidth: 0,
      ...style,
    }}>
      <div style={{
        display: "flex",
        flexDirection: bottom ? "column" : "row",
        alignItems: bottom ? "stretch" : "center",
        gap: L.rowGap, flex: 1, minHeight: 0, minWidth: 0,
      }}>
        <KpiNumber eyebrow={eyebrow} value={value} change={change}
          filter={filter} onFilterClick={onFilterClick}
          numberStyle={numberStyle} filterLayout={filterLayout} />
        {chart && (
          /* Chart.Container: VERTICAL, pad 8,0,8,4. It FILLs, so the chart
             takes whatever width is left beside the number. */
          <div style={{
            display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0,
            padding: `${L.chartPadT} 0 ${L.chartPadT} ${L.chartPadL}`, boxSizing: "border-box",
          }}>
            {chart}
          </div>
        )}
      </div>
    </div>
  );
}

export default KpiNumberAndTrend;
