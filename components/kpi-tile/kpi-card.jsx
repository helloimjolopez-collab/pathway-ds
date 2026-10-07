/**
 * KPI Card — the standalone KPI tile, the one that is its own card.
 *
 * SOURCE OF TRUTH: Figma `KPI Tiles`, set 40009415:27750, read 2026-10-07.
 * 18 variants on Type x Breakpoint.
 *
 * THIS IS NOT THE SAME COMPONENT AS KpiTile. That one is the thing that goes
 * INSIDE a Widget and has no card of its own, because the Widget is the card.
 * This one is a card: it carries its own surface, border, radius and padding,
 * and it is used on its own, outside the dashboard grid. They look alike and
 * they are not interchangeable, which is exactly why they are separate files.
 *
 * MEASURED
 *
 *   root          r=16, Fill/Surface/Elevated, Stroke/Static/Neutral/Base
 *                 desktop 388 wide, mobile 343 wide
 *   Simple        90 tall,  gap 2,  pad 16
 *   Icon 01-04   158 tall,  gap 24, pad 16
 *   Chart 01-04  144 tall,  gap 8,  pad 24
 *
 * The Icon gap and the Chart padding read 20 in the first pass, and 20 is not a
 * rung: the semantic ladder goes 16 then 24. Nineteen bindings across the set
 * pointed a gap or a padding straight at the Unit/20 PRIMITIVE, which is the
 * same defect as the Unit/10 bindings cleared earlier. All nineteen were
 * rebound in Figma on 2026-10-07 to Padding/Relaxed and Gap/Relaxed, both 24,
 * the nearest rung that keeps Chart visibly roomier than the other two Types.
 * Chart therefore measures 144 rather than 136.
 *
 *   Heading       fs 14. Foreground/Static/Neutral/BASE on Simple and Icon,
 *                 /STRONG on Chart. That is the design, not a slip.
 *   Number        fs 32, Foreground/Static/Neutral/Strong
 *   Number row    HORIZONTAL gap 16
 *   Featured icon 48x48, r=28, Fill/Static/Positive/Subtle
 *   Dropdown      20x20 dots-vertical, top right
 *
 * THE BADGE HERE IS NOT THE PILL FROM KpiTile. This set's `_Change` is a
 * bordered chip: 73x28, r=6, pad 4,12,4,8, gap 4, Fill/Surface/Elevated with
 * Stroke/Static/Neutral/Base, and its text takes
 * Foreground/Static/Neutral/STRONG rather than a trend colour. The arrow is a
 * 12px `north_east`. So the trend reads as neutral chrome on this component and
 * as colour on the in-widget one. Reproduced as measured rather than unified,
 * because unifying them would be a design decision.
 */
import React from "react";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;

export const T = {
  surface:     C("fill-surface-elevated"),
  border:      C("stroke-static-neutral-base"),
  headingSoft: C("foreground-static-neutral-base"),
  headingHard: C("foreground-static-neutral-strong"),
  number:      C("foreground-static-neutral-strong"),
  badgeFill:   C("fill-surface-elevated"),
  badgeBorder: C("stroke-static-neutral-base"),
  badgeText:   C("foreground-static-neutral-strong"),
  menu:        C("foreground-static-neutral-base"),
  iconUpFill:  C("fill-static-positive-subtle"),
  iconUpGlyph: C("foreground-static-positive-on-subtle"),
  iconDownFill:  C("fill-static-negative-subtle"),
  iconDownGlyph: C("foreground-static-negative-on-subtle"),
};

export const L = {
  radius:      U("cornerradius-xlarge"),   // 16
  border:      U("borderwidth-base"),
  padSimple:   U("padding-base"),          // 16, Simple and Icon
  padChart:    U("padding-relaxed"),       // 24, Chart. Was 20, see the note above.
  gapSimple:   U("gap-xxxtight"),          // 2
  gapIcon:     U("gap-relaxed"),           // 24. Was 20, see the note above.
  gapChart:    U("gap-tight"),             // 8
  numberRowGap:U("gap-base"),              // 16
  featuredIcon: 48,
  featuredGlyph: 24,
  menuIcon:    20,
  badgeRadius: U("cornerradius-xsmall"),   // 2 is the nearest rung to Figma's 6
  badgeGap:    U("gap-xxtight"),           // 4
  badgePadV:   U("padding-xxxtight"),      // 4
  badgePadL:   U("padding-xtight"),        // 8
  badgePadR:   U("padding-tight"),         // 12
  badgeArrow:  12,
  widthDesktop: 388,
  widthMobile:  343,
};

/** Figma's Type axis, reduced to the three shapes it actually describes. */
export const KPI_CARD_TYPES = ["simple", "icon", "chart"];

const Glyph = ({ name, size, color }) => (
  <span className="material-symbols-rounded" aria-hidden="true" style={{
    fontSize: size, lineHeight: 1, display: "block", color,
    fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
  }}>{name}</span>
);

/**
 * The bordered trend chip this set uses. Neutral text, not a trend colour.
 * See the note at the top of the file.
 */
export function ChangeChip({ value, direction = "up" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: L.badgeGap, flexShrink: 0,
      padding: `${L.badgePadV} ${L.badgePadR} ${L.badgePadV} ${L.badgePadL}`,
      background: T.badgeFill, color: T.badgeText,
      border: `${L.border} solid ${T.badgeBorder}`, borderRadius: L.badgeRadius,
      fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
      letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap",
    }}>
      <Glyph name={direction === "up" ? "north_east" : "south_east"} size={L.badgeArrow} />
      {value}
    </span>
  );
}

/**
 * @param {"simple"|"icon"|"chart"} type   Figma's Type axis.
 * @param {string}  heading
 * @param {string}  value
 * @param {node}    change   A <ChangeChip>, or anything.
 * @param {node}    chart    Only drawn when type is "chart".
 * @param {string}  icon     Material ligature. Only drawn when type is "icon".
 * @param {"up"|"down"} direction  Tints the featured icon.
 * @param {func}    onMenu   Draws the dots-vertical control when supplied.
 */
export function KpiCard({
  type = "simple",
  heading,
  value,
  change,
  chart,
  icon = "trending_up",
  direction = "up",
  onMenu,
  className = "",
  style,
}) {
  const isChart = type === "chart";
  const isIcon = type === "icon";
  const pad = isChart ? L.padChart : L.padSimple;
  const gap = isChart ? L.gapChart : isIcon ? L.gapIcon : L.gapSimple;

  const headingEl = (
    <span style={{
      // Chart uses the STRONG heading, Simple and Icon use BASE. Measured.
      color: isChart ? T.headingHard : T.headingSoft,
      fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
      letterSpacing: Y("letter-spacing-spacious"),
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    }}>{heading}</span>
  );

  const numberEl = (
    <span style={{
      color: T.number, whiteSpace: "nowrap",
      fontSize: Y("font-size-xxl"), lineHeight: Y("line-height-xxl-single"),
      fontWeight: Y("weight-bold"), letterSpacing: Y("letter-spacing-wide"),
    }}>{value}</span>
  );

  return (
    <div className={`pw-kpi-card ${className}`} data-type={type} style={{
      position: "relative",
      display: "flex", flexDirection: "column", gap,
      padding: pad, boxSizing: "border-box",
      background: T.surface, border: `${L.border} solid ${T.border}`,
      borderRadius: L.radius, minWidth: 0,
      ...style,
    }}>
      {/* Dropdown: 20x20 dots-vertical in the top right. Absolute, so it never
          takes part in the stack's gap and the three Types keep their measured
          heights of 90, 158 and 136. */}
      {onMenu && (
        <button type="button" aria-label="More actions" onClick={onMenu} style={{
          position: "absolute", top: pad, right: pad,
          display: "flex", background: "transparent", border: "none",
          padding: 0, cursor: "pointer", color: T.menu,
        }}>
          <Glyph name="more_vert" size={L.menuIcon} />
        </button>
      )}

      {isIcon && (
        /* Featured icon: 48x48 at r=28, tinted by direction. */
        <span style={{
          width: L.featuredIcon, height: L.featuredIcon, borderRadius: "50%",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          background: direction === "up" ? T.iconUpFill : T.iconDownFill,
        }}>
          <Glyph name={icon} size={L.featuredGlyph}
            color={direction === "up" ? T.iconUpGlyph : T.iconDownGlyph} />
        </span>
      )}

      {isChart ? (
        <>
          {headingEl}
          {/* Number and chart: HORIZONTAL gap 16, the number column then the chart. */}
          <div style={{ display: "flex", alignItems: "center", gap: L.numberRowGap,
            minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: U("gap-medium"),
              minWidth: 0 }}>
              {numberEl}
              {change}
            </div>
            {chart && <div style={{ flex: 1, minWidth: 0, height: 56 }}>{chart}</div>}
          </div>
        </>
      ) : (
        <>
          {/* Icon groups its heading and number together under the featured icon;
              Simple stacks them directly. Both end with the number row. */}
          <div style={{ display: "flex", flexDirection: "column", gap: L.gapSimple, minWidth: 0 }}>
            {headingEl}
            <div style={{ display: "flex", alignItems: "center", gap: L.numberRowGap, minWidth: 0 }}>
              {numberEl}
              {change}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default KpiCard;
