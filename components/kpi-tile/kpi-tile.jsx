/**
 * KPI Tile — the number, its trend, and optionally a mini chart.
 *
 * SOURCE OF TRUTH, all read on 2026-10-07 from the Amplify section of the
 * "↳ Mini Charts & KPI Tiles" page:
 *
 *   KPI Number & Trend   40017320:247    6 variants  Type x With Filter Controls?
 *   _Change              40009415:28112  8 variants  Type x Trend
 *   KPI Number           40017333:37612  4 variants  Style x Show Trend Filter x Layout
 *   _Chart mini          40009415:27919  24 variants Type x Trend
 *
 * MEASURED
 *
 *   KPI Number & Trend   VERTICAL, pad 0,12,0,12
 *     Chart & Trend      HORIZONTAL gap 24      the number and the chart sit side by side
 *     Eyebrow            fs 10   Foreground/Static/Neutral/Subtle
 *     Number             fs 32   Foreground/Static/Neutral/Strong
 *     Chart.Container    VERTICAL pad 8,0,8,4
 *
 *   _Change              55x20, HORIZONTAL gap 6, inner frame gap 2
 *     icon               16x16   arrow_upward / arrow_downward on Type 01,
 *                                moving on Type 02
 *     Change             fs 14   Stroke/Static/Positive/Strong  when positive
 *                                Stroke/Static/Negative/Strong  when negative
 *
 * THE TREND COLOUR WAS A STROKE TOKEN USED AS A TEXT FILL, in Figma and
 * therefore here. Fixed in Figma on 2026-10-07, 10 fills across the 8 _Change
 * variants moved onto Foreground/Static/{Positive,Negative}/On Subtle, with the
 * genuine strokes elsewhere left alone: the mini chart's Line vectors really do
 * stroke with Stroke/Static/Positive/Strong and were not touched.
 *
 * It was not only a tier violation. #358d4b on the white card measures 4.15:1,
 * under the 4.5 floor for 14px text, so positive trends were failing contrast.
 * The foreground tokens measure 13.62:1 and 10.74:1.
 *
 * FAVOURABLE IS NOT THE SAME AS UP. A rising figure is good for income and bad
 * for expenses, so direction and sentiment are separate props: `direction`
 * picks the arrow, `favourable` picks the colour. Collapsing them, which is the
 * obvious shortcut, would paint rising costs green.
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
  className = "",
}) {
  return (
    <div className={`pw-kpi-number ${className}`} style={{
      display: "flex", flexDirection: "column", gap: L.stackGap, minWidth: 0,
      justifyContent: "center",
    }}>
      {filter && <TrendFilter label={filter} onClick={onFilterClick} />}
      {eyebrow && (
        <span style={{
          color: T.eyebrow, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontSize: Y("font-size-xxxs"), lineHeight: Y("line-height-xxs-single"),
          letterSpacing: Y("letter-spacing-spacious"),
        }}>{eyebrow}</span>
      )}
      <span style={{
        color: T.number, whiteSpace: "nowrap",
        fontSize: Y("font-size-xxl"), lineHeight: Y("line-height-xxl-single"),
        fontWeight: Y("weight-bold"), letterSpacing: Y("letter-spacing-wide"),   // no `tight` rung exists; wide is the tightest
      }}>{value}</span>
      {change}
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
 */
export function KpiTile({
  eyebrow,
  value,
  change,
  chart,
  layout = "right",
  filter,
  onFilterClick,
  className = "",
  style,
}) {
  const bottom = layout === "bottom" || !chart;
  return (
    <div className={`pw-kpi-tile ${className}`} style={{
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
          filter={filter} onFilterClick={onFilterClick} />
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

export default KpiTile;
