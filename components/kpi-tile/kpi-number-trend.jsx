/**
 * KPI Number & Trend: a BUILDING BLOCK, not a component page.
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
import React, { useState } from "react";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;

export const T = {
  // Trend.ComparisonControl's chevron: an action colour, not the text's.
  compareChevron: C("foreground-action-secondary-rest"),
  // Type 03's own pill: Fill/Surface/Elevated with Stroke/Static/Neutral/Base.
  chipFill:   C("fill-surface-elevated"),
  chipBorder: C("stroke-static-neutral-base"),
  eyebrow:   C("foreground-static-neutral-subtle"),
  number:    C("foreground-static-neutral-strong"),
  caption:   C("foreground-static-neutral-base"),
  // Trend colour. These were Stroke/Static/{Positive,Negative}/Strong, because
  // that is what Figma bound as the TEXT fill. Fixed in Figma on 2026-10-07
  // rather than reproduced: a text fill belongs to the Foreground tier, and the
  // positive one also failed contrast at 4.15:1 on the card against a 4.5 floor
  // for 14px text. Foreground/Static/Positive/On Subtle measures 13.62:1 and
  // the negative one 10.74:1.
  filterBorder: C("stroke-action-secondary-rest"),
};

export const L = {
  rootPadH:   U("padding-tight"),    // 12, KPI Number & Trend pad 0,12,0,12
  // 16, `Chart & Trend: Right` gap. Measured on the Widget's Glance 01
  // variant 2026-10-07; it was 24, which is the KPI TILE's Icon gap, not this.
  rowGap:     U("gap-base"),
  stackGap:   U("gap-xxxtight"),     // 2
  changeGap:  U("gap-xtight"),       // 6, _Change outer gap
  changeInner:U("gap-xxxtight"),     // 2, _Change inner frame gap
  chartPadT:  U("padding-xtight"),   // 8, Chart.Container pad 8,0,8,4
  chartPadL:  U("padding-xxxtight"), // 4
  changeIcon: 16,
  // Type 03, the bordered pill: 73x28, r=6, pad 4,12,4,8, gap 4, glyph 12.
  chipH:      28,
  chipRadius: U("cornerradius-base"),
  chipPadV:   U("padding-xxxxtight"),
  chipPadL:   U("padding-tight"),
  chipPadR:   U("padding-base"),
  chipGap:    U("gap-xxtight"),
  chipIcon:   12,
  // Type 04, the tinted Badge: 52x16, r=12, Container.Main pad 2,6,2,4, gap 2.
  badgeH:      16,
  badgeRadius: U("cornerradius-large"),
  badgePadV:   U("padding-xxxxtight"),
  badgePadL:   U("padding-xxxtight"),
  badgePadR:   U("padding-xtight"),
  badgeGap:    U("gap-xxxtight"),
  badgeIcon:   11,
  // Trend.ComparisonControl: gap 3, chevron 12.
  compareGap:     U("gap-xxxtight"),
  compareChevron: 12,
  border:      "var(--semantic-layout-units-borderwidth-base)",
  filterH:    26,
  filterPadV: U("padding-xxxtight"), // 4
  filterPadH: U("padding-xxtight"),  // 6
  filterRadius: U("cornerradius-base"),
};

/** Figma's Type axis on _Change: 01 uses arrows, 02 uses the `moving` glyph. */
/**
 * Figma `_Change` 40009415:28112 has FOUR Types in one set, not two, and each
 * draws a different thing. Read and SCREENSHOTTED 2026-10-07:
 *
 *   Type  box     glyph                            container
 *   01    55x20   arrow_upward / arrow_downward     none
 *   02    55x20   moving / trending_down            none
 *   03    73x28   north_east / south_east           bordered pill, r=6
 *   04    52x16   moving / trending_down            tinted Badge, r=12
 *
 * Types 01 and 02 put BOTH the glyph and the text in the trend's
 * Foreground/Static/{Positive,Negative}/On Subtle. Type 03 colours only the
 * GLYPH with the trend and takes Foreground/Static/Neutral/Strong for the
 * text, on Fill/Surface/Elevated with Stroke/Static/Neutral/Base. Type 04 is a
 * Badge instance at Status={tone}, Size=Small, Style=Outline & Fill, so
 * Fill/Static/{tone}/Subtle with Stroke/Static/{tone}/Subtle, and its text
 * takes the tone.
 *
 * THIS USED TO BE TWO HALF-COMPONENTS. `Change` covered 01 and 02 through a
 * `glyphType` prop, `ChangeChip` in kpi-tile.jsx covered 03, and 04 did not
 * exist at all. One Figma set split across two files with one type missing is
 * how a component ends up looking nothing like the design.
 */
export const CHANGE_TYPES = ["01", "02", "03", "04"];

/** Per type, per direction. The negative is NOT the positive mirrored. */
const GLYPH = {
  "01": { up: "arrow_upward", down: "arrow_downward", flat: "remove" },
  // Figma draws `moving` for the positive and `trending_down` for the
  // negative: two different glyphs, not one rotated.
  "02": { up: "moving",       down: "trending_down",  flat: "remove" },
  "03": { up: "north_east",   down: "south_east",     flat: "remove" },
  "04": { up: "moving",       down: "trending_down",  flat: "remove" },
};

/** Kept so `glyphType="arrow"` and `"moving"` still work. */
const LEGACY_TYPE = { arrow: "01", moving: "02" };

const TONE = {
  up:   { fg: C("foreground-static-positive-on-subtle"),
          fill: C("fill-static-positive-subtle"), stroke: C("stroke-static-positive-subtle") },
  down: { fg: C("foreground-static-negative-on-subtle"),
          fill: C("fill-static-negative-subtle"), stroke: C("stroke-static-negative-subtle") },
  flat: { fg: C("foreground-static-neutral-base"),
          fill: C("fill-static-neutral-subtle"),  stroke: C("stroke-static-neutral-base") },
};

/**
 * The trend indicator. Figma's `_Change`, all four Types.
 *
 * @param {string} value                  The figure, e.g. "100%".
 * @param {"up"|"down"|"flat"} direction  Which way the number moved. Drives the
 *                                        ARROW.
 * @param {boolean} favourable            Whether that movement is good. Drives
 *                                        the COLOUR. Separate from direction on
 *                                        purpose: expenses up is a rising arrow
 *                                        and a red one, and collapsing the two
 *                                        into one prop paints rising costs green.
 * @param {"01"|"02"|"03"|"04"} type      Figma's Type axis.
 * @param {string} note                   Quiet text after the figure, e.g.
 *                                        "vs last month". Types 01 and 02 only,
 *                                        because 03 and 04 are fixed-size pills.
 * @param {func} onCompareClick           Makes `note` the Trend.ComparisonControl
 *                                        it is in Figma: the text plus an
 *                                        expand_more chevron, because the
 *                                        comparison period is changeable.
 * @param {"arrow"|"moving"} glyphType    Deprecated alias for types 01 and 02.
 */
export function Change({
  value,
  direction = "up",
  favourable,
  type,
  glyphType,
  note,
  onCompareClick,
  className = "",
  style,
}) {
  const t = type || LEGACY_TYPE[glyphType] || "01";
  const good = favourable === undefined ? direction === "up" : favourable;
  const tone = direction === "flat" ? TONE.flat : (good ? TONE.up : TONE.down);
  const glyph = (GLYPH[t] || GLYPH["01"])[direction];

  /**
   * Trend.ComparisonControl, Figma 40017320:361, a SIBLING of the indicator in
   * all four Types rather than part of any one of them: `_Change`'s own outer
   * gap is 6 and the control sits after the pill.
   *
   * It was rendered only for types 01 and 02 because those returned last and
   * 03 and 04 returned early, so the Glance widget showed a tinted "100%" pill
   * with no "vs last month" beside it where Figma shows both.
   */
  const comparison = !note ? null : onCompareClick ? (
    <button type="button" onClick={onCompareClick} style={{
      display: "inline-flex", alignItems: "center", gap: L.compareGap,
      background: "transparent", border: "none", padding: 0, cursor: "pointer",
      fontFamily: "inherit", color: T.caption, whiteSpace: "nowrap",
      fontSize: Y("font-size-xxxs"), lineHeight: Y("line-height-xxs-single"),
      letterSpacing: Y("letter-spacing-spacious"),
    }}>
      {note}
      <span className="material-symbols-rounded" aria-hidden="true" style={{
        fontSize: L.compareChevron, lineHeight: 1, display: "block",
        color: T.compareChevron,
        fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${L.compareChevron}`,
      }}>expand_more</span>
    </button>
  ) : (
    <span style={{
      color: T.caption, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      fontSize: Y("font-size-xxxs"), lineHeight: Y("line-height-xxs-single"),
      letterSpacing: Y("letter-spacing-spacious"),
    }}>{note}</span>
  );

  /** Every type is the indicator plus the comparison control, gap 6. */
  const withComparison = (indicator) => (
    comparison ? (
      <span className={`pw-kpi-change ${className}`} data-type={t} style={{
        display: "inline-flex", alignItems: "center", gap: L.changeGap,
        minWidth: 0, ...style,
      }}>
        {indicator}
        {comparison}
      </span>
    ) : indicator
  );

  const icon = (size) => (
    <span className="material-symbols-rounded" aria-hidden="true" style={{
      fontSize: size, lineHeight: 1, display: "block", flexShrink: 0,
      fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
    }}>{glyph}</span>
  );

  // Type 03: a bordered pill. The GLYPH takes the trend and the TEXT does not,
  // so the trend reads as neutral chrome on a card and as colour in a widget.
  if (t === "03") {
    return withComparison(
      <span data-type="03" style={{
        display: "inline-flex", alignItems: "center", gap: L.chipGap, flexShrink: 0,
        minHeight: L.chipH, padding: `${L.chipPadV} ${L.chipPadR} ${L.chipPadV} ${L.chipPadL}`,
        background: T.chipFill, border: `${L.border} solid ${T.chipBorder}`,
        borderRadius: L.chipRadius, boxSizing: "border-box",
        fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
        letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap",
        color: T.number, ...style,
      }}>
        <span style={{ color: tone.fg, display: "flex" }}>{icon(L.chipIcon)}</span>
        {value}
      </span>
    );
  }

  // Type 04: the tinted Badge. r=12, a full pill at this height.
  if (t === "04") {
    return withComparison(
      <span data-type="04" style={{
        display: "inline-flex", alignItems: "center", gap: L.badgeGap, flexShrink: 0,
        minHeight: L.badgeH, padding: `${L.badgePadV} ${L.badgePadR} ${L.badgePadV} ${L.badgePadL}`,
        background: tone.fill, border: `${L.border} solid ${tone.stroke}`,
        borderRadius: L.badgeRadius, boxSizing: "border-box", color: tone.fg,
        fontSize: Y("font-size-xs"), lineHeight: Y("line-height-xs-single"),
        letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap", ...style,
      }}>
        {icon(L.badgeIcon)}
        {value}
      </span>
    );
  }

  // Types 01 and 02: no container. Glyph AND text in the trend colour.
  return (
    <span className={`pw-kpi-change ${className}`} data-type={t} style={{
      display: "inline-flex", alignItems: "center", gap: L.changeGap, minWidth: 0, ...style,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: L.changeInner,
        color: tone.fg, minWidth: 0 }}>
        {icon(L.changeIcon)}
        <span style={{
          fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
          letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap",
        }}>{value}</span>
      </span>
      {comparison}
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
 * The control Figma puts on the filter toolbar row: `PW_Button` at
 * Style=Outlined, Size=XS, Type=Secondary, State=Rest, measured from
 * Configurations 02, 03 and 04 on 2026-10-07.
 *
 * It is drawn here rather than imported from button.jsx because this is the
 * nested instance's resting appearance at one fixed size and style, and
 * importing the full Button would pull its whole state machine into a chart
 * block that never uses it. The tokens are Button's own either way.
 */
export function FilterToolbarButton({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: U("gap-xxtight"),
        alignSelf: "flex-start", minHeight: L.filterH,
        padding: `${L.filterPadV} ${L.filterPadH}`,
        background: hov ? C("fill-action-secondary-hover") : "transparent",
        color: C("foreground-action-secondary-rest"), cursor: "pointer",
        border: `var(--semantic-layout-units-borderwidth-base) solid ${C("stroke-action-secondary-rest")}`,
        borderRadius: L.filterRadius, fontFamily: "inherit",
        fontSize: Y("font-size-xs"), lineHeight: Y("line-height-xs-single"),
        fontWeight: Y("weight-semibold"),
        letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap",
        transition: "background var(--motion-duration-2) var(--motion-easing-standard)",
      }}>
      {label}
      <span className="material-symbols-rounded" aria-hidden="true" style={{
        fontSize: 12, lineHeight: 1,
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 12",
      }}>expand_more</span>
    </button>
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
   *    "stacked"  a trend-filter pill above the number, inside this block
   *    "inline"   the same pill, on the number's own row
   *    "toolbar"  a BUTTON on a toolbar row at the top of this block
   *
   *  "toolbar" USED TO DRAW NOTHING, on the reading that the control lived on
   *  the widget's own toolbar and so was somebody else's to render. Walking the
   *  four Glance Configurations on 2026-10-07 disproves that: Configurations
   *  02, 03 and 04 all carry `Trend Filter Layout=On Filter Toolbar` AND a
   *  `PW_Button` (Outlined, XS, Secondary) inside the KPI Number block, above
   *  the eyebrow. So the toolbar is a row at the top of this block, and the
   *  three layouts differ in WHICH control sits there, not in whether one does:
   *  stacked and inline draw the trend-filter pill, toolbar draws a button.
   *  Only Configuration 01 uses stacked, and it is the only one with
   *  `Show Trend Filter=Yes`. */
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
      {/* The filter toolbar row. Figma draws an Outlined/XS/Secondary button
          here, which is a different control from the trend-filter pill. */}
      {filter && filterLayout === "toolbar" && (
        <FilterToolbarButton label={filter} onClick={onFilterClick} />
      )}
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
  // IT GROWS ONLY WHEN IT HAS A CHART OF ITS OWN, and that is the fix for a
  // real layout bug rather than a preference. Without a chart this block is
  // just the number row, and a Widget's Detail and Explore content puts it
  // ABOVE a chart as siblings. Growing unconditionally made the two split the
  // height evenly: in the Dashboard the number row measured 208px to hold 40px
  // of content while the chart got 208 of an available 450.
  //
  // Figma agrees: in the Detail variant `Number and badge` is 534x36 and HUGS,
  // and `Chart.Container` is 534x302 and FILLs. The number row is 36 tall
  // because that is what a number is, and the chart takes everything else.
  const grows = !!chart;
  return (
    <div className={`pw-kpi-number-trend ${className}`} style={{
      display: "flex", flexDirection: "column",
      padding: `0 ${L.rootPadH}`, boxSizing: "border-box",
      flex: grows ? 1 : "0 0 auto", minHeight: 0, minWidth: 0,
      ...style,
    }}>
      <div style={{
        display: "flex",
        flexDirection: bottom ? "column" : "row",
        alignItems: bottom ? "stretch" : "center",
        gap: L.rowGap, flex: grows ? 1 : "0 0 auto", minHeight: 0, minWidth: 0,
      }}>
        <KpiNumber eyebrow={eyebrow} value={value} change={change}
          filter={filter} onFilterClick={onFilterClick}
          numberStyle={numberStyle} filterLayout={filterLayout} />
        {chart && (
          /* Chart.Container. Figma: 88x124 inside a 275x176 Glance, VERTICAL,
             pad 8,0,8,4, H=FILL and **V=FILL**, holding a `_Chart mini` that is
             also FILL/FILL and so renders 84x108.
             `alignSelf: stretch` IS THE FIX, and it is why the chart looked
             nothing like the design. The row centres its children, because the
             number and its trend should sit on the chart's optical centre, and
             a centred flex child sizes to its CONTENT. So the chart container
             came out 68x48 and the chart inside it 64x32, against Figma's
             84x108: a little over a third of the area, which reads as a
             squeezed thumbnail rather than a sparkline. */
          <div style={{
            display: "flex", flexDirection: "column", flex: 1, alignSelf: "stretch",
            minWidth: 0, minHeight: 0,
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
