/**
 * KPI Tile: the card.
 *
 * SOURCE OF TRUTH: Figma `KPI Tiles`, set 40009415:27750, 18 variants on
 * Type x Breakpoint, read and LOOKED AT on 2026-10-07.
 *
 * A KPI TILE IS ALWAYS A CARD. Every one of the 18 variants has its own
 * surface, border, radius and padding. There is no cardless KPI tile: the
 * cardless thing is `KPI Number & Trend`, which is a building block this tile
 * nests, and which a Widget nests too. A KPI Tile and a Widget are two
 * different components that happen to share that block; they are not two
 * framings of one thing.
 *
 * MEASURED
 *   root          r=16, Fill/Surface/Elevated, Stroke/Static/Neutral/Base
 *                 desktop 388 wide, mobile 343
 *   Simple        90 tall,  gap 2,  pad 16
 *   Icon 01-04   158 tall,  gap 24, pad 16
 *   Chart 01-04  144 tall,  gap 8,  pad 24
 *
 *   Heading       fs 14. Foreground/Static/Neutral/BASE on Simple and Icon,
 *                 /STRONG on Chart. That is the design, not a slip.
 *   Number        fs 32, Foreground/Static/Neutral/Strong
 *   Number row    HORIZONTAL gap 16
 *   Featured icon 48x48, r=28, Fill/Static/Positive/Subtle
 *   Dropdown      20x20 more_vert, top right
 *
 * The Icon gap and the Chart padding read 20 at first, and 20 is not a rung:
 * the ladder goes 16 then 24. Nineteen bindings across the set pointed a gap or
 * a padding straight at the Unit/20 PRIMITIVE, the same defect as the Unit/10
 * ones. All nineteen were rebound in Figma on 2026-10-07 to Padding/Relaxed and
 * Gap/Relaxed, both 24, the nearest rung that keeps Chart roomier than the other
 * two Types. Chart is therefore 144 tall rather than 136.
 *
 * THE CHIP HERE IS NOT THE PILL IN THE BUILDING BLOCK. This set's `_Change` is
 * a bordered chip: 73x28, r=6, pad 4,12,4,8, gap 4, Fill/Surface/Elevated with
 * Stroke/Static/Neutral/Base, and its text takes
 * Foreground/Static/Neutral/STRONG rather than a trend colour. So the trend
 * reads as neutral chrome on the tile and as colour inside a widget. Measured,
 * and reproduced rather than unified, because unifying them is a design call.
 */
import React, { useState } from "react";
import { Change } from "./kpi-number-trend.jsx";
import { FeaturedIcon } from "../icon/featured-icon.jsx";
import { Dropdown, DropdownItem } from "../dropdown/dropdown.jsx";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;

export const T = {
  surface:     C("fill-surface-elevated"),
  border:      C("stroke-static-neutral-base"),
  headingSoft: C("foreground-static-neutral-base"),
  headingHard: C("foreground-static-neutral-strong"),
  number:      C("foreground-static-neutral-strong"),
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
};

/** Figma's nine Types, reduced to the three SHAPES they describe. The numbered
 *  suffixes vary the sample glyph or line, which are props, not layouts. */
export const KPI_TILE_TYPES = ["simple", "icon", "chart"];

/**
 * The bordered trend chip this set uses: Figma `_Change` **Type 03**.
 *
 * IT IS NOT A SECOND COMPONENT ANY MORE. This was a parallel implementation of
 * one of `_Change`'s four Types, which is how the set ended up split across two
 * files with Type 04 missing entirely. It now delegates, so there is one
 * implementation of the Figma set and this name stays valid for callers.
 */
export function ChangeChip({ value, direction = "up", favourable }) {
  return <Change type="03" value={value} direction={direction} favourable={favourable} />;
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
export function KpiTile({
  type = "simple",
  heading,
  value,
  change,
  chart,
  icon = "trending_up",
  direction = "up",
  onMenu,
  /** The menu's entries. Omit and the control still opens, with the one entry
   *  every tile has: a tile with a menu that opens nothing is a dead control. */
  menuItems,
  className = "",
  style,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isChart = type === "chart";
  const isIcon = type === "icon";
  const pad = isChart ? L.padChart : L.padSimple;
  const gap = isChart ? L.gapChart : isIcon ? L.gapIcon : L.gapSimple;

  /* A menu that opens nothing is a dead control, so a tile given `onMenu` but
     no `menuItems` gets the one entry every tile has. */
  const items = menuItems || (
    <DropdownItem label="Open the full view" onSelect={() => setMenuOpen(false)} />
  );

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
    <div className={`pw-kpi-tile ${className}`} data-type={type} style={{
      position: "relative",
      display: "flex", flexDirection: "column", gap,
      padding: pad, boxSizing: "border-box",
      background: T.surface, border: `${L.border} solid ${T.border}`,
      borderRadius: L.radius, minWidth: 0,
      ...style,
    }}>
      {/* THE DROPDOWN AND THE FEATURED ICON ARE PATHWAY COMPONENTS NOW.
          Figma nests two FOREIGN ones here, both from a third-party library:
          `Dropdown` 40003188:9930 eighteen times and `Featured icon`
          40003806:3550 ten times. Neither can be Code Connected from this repo,
          because a mapping publishes into the file that owns the component, so
          a third of what this tile is made of was unreachable.
          This file also drew its own private copies of both, which is the other
          half of the same problem: nothing else could reuse them.
          They are `components/dropdown/dropdown.jsx` and
          `components/icon/featured-icon.jsx`, measured off those nodes. */}
      {onMenu && (
        <span style={{ position: "absolute", top: pad, right: pad }}>
          <Dropdown
            type="icon"
            label="More actions"
            open={menuOpen}
            onOpenChange={(v) => { setMenuOpen(v); if (v) onMenu?.(); }}
          >
            {items}
          </Dropdown>
        </span>
      )}

      {isIcon && (
        /* Featured icon. Figma's variants here are Type=Light outline at
           Size=lg, so the tinted circle at 48. `direction` picks the tone,
           which is what this set uses it for. */
        <FeaturedIcon
          name={icon}
          size="lg"
          type="outline"
          color={direction === "up" ? "Positive" : "Negative"}
        />
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

export default KpiTile;
