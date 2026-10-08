/**
 * KPI Tile: the card.
 *
 * SOURCE OF TRUTH: Figma `KPI Tiles`, set 40009415:27750, 18 variants on
 * Type x Breakpoint. Every one of the nine desktop variants was walked and
 * measured on 2026-10-08.
 *
 * THE NINE TYPES ARE NINE LAYOUTS, NOT THREE SHAPES. The previous version of
 * this file collapsed them into `simple | icon | chart` on the reasoning that
 * the numbered suffixes only varied the sample glyph or line. That was wrong,
 * and it is the reason the page looked nothing like the design. They differ in
 * root direction, padding, gap, heading weight, which change type they carry,
 * which featured icon, which chart, and their height:
 *
 *   Type       box       root   pad  gap  heading           change  chart
 *   Simple     388x90    V      16   2    14/500 Base       03      none
 *   Icon 01    388x162   V      16   24   14/500 Base       03      none
 *   Icon 02    388x162   V      16   24   16/600 Strong     01      none
 *   Icon 03    388x162   V      16   24   14/500 Base       02      none
 *   Icon 04    388x96    H      16   16   14/500 Base       03      none
 *   Chart 01   388x144   V      24   8    14/500 Strong     01      112x56 Realistic 01
 *   Chart 02   388x160   V      16   24   16/600 Strong     02      128x56 Layers
 *   Chart 03   388x144   V      16   24   14/500 Base       block   100x52 Layers
 *   Chart 04   388x244   V      16   2    14/600 Strong     02      308x56 Realistic 03
 *
 * SIX DIFFERENT HEIGHTS: 90, 96, 144, 160, 162, 244. A component with three
 * shapes cannot express that.
 *
 * CHART 04 IS A CARD INSIDE A CARD. Its root fills with
 * `Fill/Static/Neutral/Faint` rather than Elevated, and holds an inner
 * `Content` frame at r=12 on `Fill/Surface/Elevated` with its own border. The
 * same pattern the Widget's Detail and Explore sizes use.
 *
 * THE NUMBER IS WEIGHT 600, NOT 700. Measured on all nine. The previous version
 * used `weight-bold`, 700.
 *
 * THE FEATURED ICONS ARE FOUR DIFFERENT ONES:
 *   Icon 01   lg Light outline, Positive tint, `trending_up`
 *   Icon 02   lg Light outline, Info tint, `bolt`
 *   Icon 03   lg Modern, `trending_up`
 *   Icon 04   md Modern, `trending_up`
 *   Chart 02  lg Modern, `visibility`
 *
 * AND FIGMA IS INCONSISTENT ABOUT THEIR GLYPH COLOUR, which is recorded rather
 * than normalised: Icon 01 binds `Foreground/Static/Positive/On STRONG` while
 * Icon 02 binds `Info/On Subtle`, for the same Light outline type on a Subtle
 * fill. On Strong is the foreground for a SOLID fill, so Icon 01's binding is a
 * pairing oddity in the file. It is reproduced because Figma owns the visual
 * design, and flagged in the spec.
 *
 * EVERY VARIANT CARRIES A 44x44 `TouchTarget`, which is the menu trigger's
 * accessible hit area around a 20px glyph. Reproduced, because a 20px tap
 * target fails WCAG 2.5.5.
 */
import React, { useState } from "react";
import { Change } from "./kpi-number-trend.jsx";
import { MiniChart, SAMPLE_SERIES, SAMPLE_LAYERS, SAMPLE_MARKERS, curveFor } from "./mini-chart.jsx";
import { FeaturedIcon } from "../icon/featured-icon.jsx";
import { Dropdown, DropdownItem, DropdownDivider } from "../dropdown/dropdown.jsx";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;

export const T = {
  surface:      C("fill-surface-elevated"),
  border:       C("stroke-static-neutral-base"),
  // Chart 04's root, which is the outer half of a card inside a card.
  surfaceFaint: C("fill-static-neutral-faint"),
  headingSoft:  C("foreground-static-neutral-base"),
  headingHard:  C("foreground-static-neutral-strong"),
  number:       C("foreground-static-neutral-strong"),
  // Icon 01's glyph, which Figma binds to On STRONG rather than On Subtle.
  positiveOnStrong: C("foreground-static-positive-on-strong"),
};

/**
 * THE NUMBER'S LINE HEIGHT HAS NO TOKEN, and that is a gap in the type scale
 * rather than a choice here.
 *
 * Figma's `Number` is the text style `❇️ Heading/Page/Large/Semibold`: Red Hat
 * Text SemiBold, fs 32, **line height 36px**, letter spacing 0.1. Three of
 * those four have tokens: `font-size-xxl` is 32, `weight-semibold` is 600 and
 * `letter-spacing-wide` is 0.1. The line height does NOT: the ladder goes
 * `xl-single` 30, `xxl-single` 40, `xxxl-single` 44, so there is no 36.
 *
 * Using 40, the nearest, makes the text 4px taller than the design, and the
 * tile's own height is measured: Simple is exactly 90, which is 32 of padding
 * plus a 20 heading plus a 2 gap plus a 36 number. Rounding the line height up
 * breaks all six measured heights at once.
 *
 * So this is a raw 36 with the gap named, rather than a wrong token or an
 * invented one. The fix belongs in the Figma Variables panel: a
 * `line-height/xxl-tight` rung at 36. Recorded in the spec's gaps.
 */
const NUMBER_LINE_HEIGHT = "36px";

/**
 * FIGMA'S INSIDE STROKE DOES NOT PARTICIPATE IN LAYOUT, and a CSS `border`
 * does, which is worth 2px on every tile.
 *
 * The tile's stroke is 1px at `strokeAlign: INSIDE`, so in Figma the frame is
 * exactly 90 tall: 32 of padding plus a 20 heading plus a 2 gap plus a 36
 * number, with the stroke painted inside that. With a CSS border and
 * `box-sizing: border-box`, `minHeight: 90` becomes a floor of
 * border + padding + content, so the tile grew to 92 and all six measured
 * heights were wrong by the same 2.
 *
 * An inset ring paints in exactly the same place and takes no space, which is
 * what INSIDE means. Modelled rather than worked around, so the measured
 * heights hold without touching the padding.
 */
const insetRing = (colour, width = 1) => `inset 0 0 0 ${width}px ${colour}`;

export const L = {
  radius:      U("cornerradius-xlarge"),   // 16 on every variant
  innerRadius: U("cornerradius-large"),     // 12, Chart 04's Content frame
  pad:         U("padding-base"),           // 16 everywhere except Chart 01
  padChart01:  U("padding-relaxed"),        // 24
  gapTight:    U("gap-xxxtight"),           // 2
  gapRow:      U("gap-tight"),              // 8
  gapBase:     U("gap-base"),               // 16
  gapIconHead: U("gap-tight"),              // 12 on Chart 02, see note
  gapRelaxed:  U("gap-relaxed"),            // 24
  numberGap12: U("padding-tight"),          // 12, Chart 01's Number and badge
  touchTarget: 44,
};

/**
 * Every type's layout, measured. Kept as DATA rather than nine branches of JSX
 * so the differences are readable side by side and a wrong one is visible.
 */
export const KPI_TILE_TYPES = [
  "simple", "icon-01", "icon-02", "icon-03", "icon-04",
  "chart-01", "chart-02", "chart-03", "chart-04",
];

/** The old three-value prop still works, mapped to its nearest real type. */
const LEGACY_TYPE = { simple: "simple", icon: "icon-01", chart: "chart-01" };

export const KPI_TILE_SPECS = {
  "simple":   { h: 90,  hMobile: 90,  dir: "column", pad: "pad", gap: "gapTight",
                heading: "soft", change: "03", icon: null, chart: null },
  "icon-01":  { h: 162, hMobile: 154, dir: "column", pad: "pad", gap: "gapRelaxed",
                heading: "soft", change: "03", icon: { size: "lg", type: "outline",
                  color: "Positive", glyph: "trending_up", glyphColor: T.positiveOnStrong },
                chart: null, iconAbove: true },
  "icon-02":  { h: 162, hMobile: 154, dir: "column", pad: "pad", gap: "gapRelaxed",
                heading: "big", change: "01", note: true,
                icon: { size: "lg", type: "outline", color: "Accent", glyph: "bolt" },
                chart: null, iconBesideHeading: true },
  "icon-03":  { h: 162, hMobile: 154, dir: "column", pad: "pad", gap: "gapRelaxed",
                heading: "soft", change: "02", note: true,
                icon: { size: "lg", type: "modern", glyph: "trending_up" },
                chart: null, iconAbove: true },
  "icon-04":  { h: 96,  hMobile: 146, dir: "row", pad: "pad", gap: "gapBase",
                heading: "soft", change: "03",
                icon: { size: "md", type: "modern", glyph: "trending_up" },
                chart: null },
  /* Chart 01 is the only type whose `Number and badge` is VERTICAL: 212x68 at
     gap 12, with the Number on its own row and the change plus its note
     below. Every other type puts them side by side, and doing that here
     squeezed the note until "vs last month" truncated to "vs last m...". */
  "chart-01": { h: 144, hMobile: 138, dir: "column", pad: "padChart01", gap: "gapRow",
                heading: "hard", change: "01", note: true, icon: null,
                numberStacked: true,
                chart: { w: 112, h: 56, series: "realistic-01" } },
  "chart-02": { h: 160, hMobile: 152, dir: "column", pad: "pad", gap: "gapRelaxed",
                heading: "big", change: "02",
                icon: { size: "lg", type: "modern", glyph: "visibility" },
                iconBesideHeading: true, numberInline: true,
                chart: { w: 128, h: 56, layers: true } },
  "chart-03": { h: 144, hMobile: 144, dir: "column", pad: "pad", gap: "gapChart03",
                heading: "soft", change: "02", icon: null,
                chart: { w: 100, h: 52, layers: true }, compact: true },
  "chart-04": { h: 244, hMobile: 244, dir: "column", pad: "pad", gap: "gapTight",
                heading: "hardBold", change: "02", note: true, icon: null,
                chart: { w: null, h: 56, series: "realistic-03" }, innerCard: true },
};

/**
 * @param {keyof KPI_TILE_SPECS} type   Figma's Type axis, all nine values.
 *                              `simple`, `icon` and `chart` still map to the
 *                              nearest real type for existing callers.
 * @param {"desktop"|"mobile"} breakpoint  Figma's Breakpoint axis: a WIDTH of
 *                              388 or 343. The tile is fluid and fills its
 *                              column, so this only drives the height.
 * @param {node} menuItems      The menu's entries. A tile with a trigger that
 *                              opens nothing is a dead control.
 */
export function KpiTile({
  type = "simple",
  breakpoint = "desktop",
  heading = "Views 24 hours",
  value = "2,000",
  changeValue = "100%",
  direction = "up",
  favourable,
  note = "vs last month",
  icon,
  onMenu,
  menuItems,
  className = "",
  style,
  ...rest
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = KPI_TILE_SPECS[type] ? type : (LEGACY_TYPE[type] || "simple");
  const s = KPI_TILE_SPECS[t];
  const mobile = breakpoint === "mobile";

  const items = menuItems || (
    <>
      <DropdownItem label="Open the full view" icon="open_in_full" onSelect={() => setMenuOpen(false)} />
      <DropdownItem label="Refresh" icon="refresh" onSelect={() => setMenuOpen(false)} />
      <DropdownDivider />
      <DropdownItem label="Remove from this dashboard" danger onSelect={() => setMenuOpen(false)} />
    </>
  );

  /* The heading. Four treatments across the nine types, measured:
       soft      14 / 500 / Neutral Base     Simple, Icon 01, Icon 03, Chart 03
       hard      14 / 500 / Neutral Strong   Chart 01
       hardBold  14 / 600 / Neutral Strong   Chart 04
       big       16 / 600 / Neutral Strong   Icon 02, Chart 02  */
  const headingEl = (
    <span style={{
      color: s.heading === "soft" ? T.headingSoft : T.headingHard,
      fontSize: s.heading === "big" ? Y("font-size-m") : Y("font-size-s"),
      lineHeight: s.heading === "big" ? Y("line-height-m-single") : Y("line-height-s-single"),
      fontWeight: s.heading === "soft" || s.heading === "hard"
        ? Y("weight-medium") : Y("weight-semibold"),
      letterSpacing: Y("letter-spacing-spacious"),
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0,
    }}>{heading}</span>
  );

  // fs 32, weight 600. Measured on all nine; it was 700 here until 2026-10-08.
  const numberEl = (
    <span style={{
      color: T.number, whiteSpace: "nowrap", flexShrink: 0,
      fontSize: Y("font-size-xxl"), lineHeight: NUMBER_LINE_HEIGHT,
      fontWeight: Y("weight-semibold"), letterSpacing: Y("letter-spacing-wide"),
    }}>{value}</span>
  );

  const changeEl = (
    <Change type={s.change} value={changeValue} direction={direction}
      favourable={favourable} note={s.note ? note : undefined} />
  );

  const iconEl = s.icon && (
    <FeaturedIcon
      name={icon || s.icon.glyph}
      size={s.icon.size}
      type={s.icon.type}
      color={s.icon.color || "Neutral"}
      glyphColor={s.icon.glyphColor}
    />
  );

  const chartEl = s.chart && (
    <div style={{ width: s.chart.w || "100%", height: s.chart.h, flexShrink: 0 }}>
      {s.chart.layers
        ? <MiniChart layers={SAMPLE_LAYERS} direction={direction} favourable={favourable} />
        : <MiniChart series={SAMPLE_SERIES[s.chart.series]} direction={direction}
            favourable={favourable} curve={curveFor(s.chart.series)}
            markerIndex={SAMPLE_MARKERS[s.chart.series]} />}
    </div>
  );

  /* Dropdown: 20x20 inside a 44x44 TouchTarget, which every variant carries.
     Absolute, so it never takes part in the stack's gap and the nine measured
     heights hold. */
  const menuEl = onMenu !== false && (
    <span style={{
      position: "absolute", top: 0, right: 0,
      width: L.touchTarget, height: L.touchTarget,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Dropdown type="icon" label="More actions" open={menuOpen}
        onOpenChange={(v) => { setMenuOpen(v); if (v) onMenu?.(); }}>
        {items}
      </Dropdown>
    </span>
  );

  // The number row, which differs per type.
  const numberRow = s.numberStacked ? (
    // Chart 01: Number above, change and note below, gap 12.
    <span style={{ display: "flex", flexDirection: "column",
      gap: L.numberGap12, minWidth: 0 }}>
      {numberEl}{changeEl}
    </span>
  ) : s.numberInline ? (
    // Chart 02: Number and _Change on ONE row, gap 8.
    <span style={{ display: "flex", alignItems: "center", gap: L.gapRow, minWidth: 0 }}>
      {numberEl}{changeEl}
    </span>
  ) : (
    <span style={{
      display: "flex", gap: L.gapBase, minWidth: 0,
      // Simple and Icon 01 align the change to the number's BASELINE edge
      // (align=MAX); Icon 03, Icon 04 and Chart 04 centre it.
      alignItems: t === "simple" || t === "icon-01" ? "flex-end" : "center",
    }}>
      {numberEl}{changeEl}
    </span>
  );

  const headingBlock = s.iconBesideHeading ? (
    <span style={{ display: "flex", alignItems: "center",
      gap: t === "chart-02" ? L.gapIconHead : L.gapBase, minWidth: 0 }}>
      {iconEl}{headingEl}
    </span>
  ) : headingEl;

  let body;
  if (s.innerCard) {
    // Chart 04: a card inside a card. Root on Neutral/Faint, inner Content on
    // Elevated at r=12 with its own border, pad 24, gap 24.
    body = (
      <>
        <span style={{ display: "flex", alignItems: "center",
          padding: `14px ${24}px 12px`, boxSizing: "border-box" }}>
          {headingEl}
        </span>
        <span style={{
          display: "flex", flexDirection: "column", gap: L.gapRelaxed,
          padding: L.padChart01, boxSizing: "border-box",
          background: T.surface, boxShadow: insetRing(T.border),
          borderRadius: L.innerRadius, position: "relative",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: L.numberGap12, minWidth: 0 }}>
            {numberEl}{changeEl}
          </span>
          {chartEl}
          {menuEl}
        </span>
      </>
    );
  } else if (s.compact) {
    // Chart 03: the nested KPI Number & Trend block, H gap 24, chart right.
    body = (
      <>
        {headingEl}
        <span style={{ display: "flex", alignItems: "center", gap: L.gapRelaxed,
          padding: `0 ${12}px`, boxSizing: "border-box", minWidth: 0 }}>
          <span style={{ display: "flex", flexDirection: "column", gap: L.gapTight,
            flex: 1, minWidth: 0 }}>
            {numberRow}
          </span>
          <span style={{ padding: `8px 0 8px 12px`, flexShrink: 0 }}>{chartEl}</span>
        </span>
      </>
    );
  } else if (s.chart) {
    // Chart 01 and Chart 02: heading, then a row of number-block and chart.
    body = (
      <>
        {headingBlock}
        <span style={{ display: "flex", alignItems: "flex-end", gap: L.gapBase, minWidth: 0 }}>
          <span style={{ display: "flex", flexDirection: "column",
            gap: t === "chart-01" ? L.numberGap12 : L.gapRow, flex: 1, minWidth: 0 }}>
            {numberRow}
          </span>
          {chartEl}
        </span>
      </>
    );
  } else if (s.dir === "row") {
    // Icon 04: the icon beside a vertical heading-and-number block, gap 8.
    body = (
      <>
        {iconEl}
        <span style={{ display: "flex", flexDirection: "column", gap: L.gapRow,
          flex: 1, minWidth: 0 }}>
          {headingEl}{numberRow}
        </span>
      </>
    );
  } else if (s.iconAbove) {
    // Icon 01 and Icon 03: the icon, then heading-and-number at gap 2.
    body = (
      <>
        {iconEl}
        <span style={{ display: "flex", flexDirection: "column", gap: L.gapTight, minWidth: 0 }}>
          {headingEl}{numberRow}
        </span>
      </>
    );
  } else if (s.iconBesideHeading) {
    // Icon 02: icon beside a bold heading, then number and change at gap 2.
    body = (
      <>
        {headingBlock}
        <span style={{ display: "flex", flexDirection: "column", gap: L.gapTight, minWidth: 0 }}>
          {numberEl}{changeEl}
        </span>
      </>
    );
  } else {
    // Simple.
    body = <>{headingEl}{numberRow}</>;
  }

  return (
    <div
      className={`pw-kpi-tile ${className}`}
      data-type={t}
      data-breakpoint={breakpoint}
      style={{
        position: "relative", boxSizing: "border-box",
        display: "flex", flexDirection: s.dir,
        gap: L[s.gap], padding: s.innerCard ? L.pad : L[s.pad],
        minHeight: mobile ? s.hMobile : s.h,
        background: s.innerCard ? T.surfaceFaint : T.surface,
        boxShadow: insetRing(T.border),
        borderRadius: L.radius,
        ...style,
      }}
      {...rest}
    >
      {body}
      {!s.innerCard && menuEl}
    </div>
  );
}

/**
 * Figma `_Change` Type 03, the bordered chip. Delegates, so there is one
 * implementation of the `_Change` set.
 */
export function ChangeChip({ value, direction = "up", favourable }) {
  return <Change type="03" value={value} direction={direction} favourable={favourable} />;
}

export default KpiTile;
