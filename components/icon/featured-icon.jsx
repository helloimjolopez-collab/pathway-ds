/**
 * FeaturedIcon: the large icon badge a KPI tile puts above its number.
 *
 * WHY THIS EXISTS. The KPI Tiles set nests a FOREIGN component here: `Featured
 * icon` 40003806:3550, a remote library component from Untitled UI, the same
 * source as the `↳ Select` page in CLAUDE.md §8.1. Eighty-four variants of it,
 * ten instances inside a Pathway component, none of them ours and none of them
 * mappable from this repo because a Code Connect mapping publishes into the
 * file that owns the component.
 *
 * THE FOREIGN COMPONENT WAS ALREADY USING PATHWAY'S COLOURS, just not bound to
 * them. Every one of the seven raw hexes in the four variants the KPI Tile uses
 * matches an existing Pathway semantic token EXACTLY, distance 0 in RGB:
 *
 *   #dff6e2  Fill/Static/Positive/Subtle
 *   #dcd9ef  Fill/Static/Info/Subtle
 *   #353063  Foreground/Static/Info/On Subtle
 *   #ffffff  Fill/Surface/Elevated
 *   #e6e2dc  Stroke/Static/Neutral/Base
 *   #313131  Foreground/Static/Neutral/Base
 *   #001f00  Foreground/Static/Positive/On Strong
 *
 * So nothing here is a redesign. It is the same drawing on the tokens it was
 * already the colour of.
 *
 * MEASURED, from the four variants the KPI Tile actually nests:
 *
 *   Type=Light outline   r=28, so a circle
 *     lg  48x48, glyph 24
 *     fill and stroke are THE SAME HEX at sw=8, so the ring is invisible and
 *     the shape is a flat tinted circle. Reproduced as a solid circle, because
 *     an 8px stroke in the fill's own colour is decoration that draws nothing.
 *
 *   Type=Modern          r=8, a rounded square. NOT tone-coloured:
 *     lg  48x48, glyph 24
 *     md  40x40, glyph 20
 *     Fill/Surface/Elevated, 1px Stroke/Static/Neutral/Base, inside align,
 *     plus a shadow. Its glyph is Foreground/Static/Neutral/Base.
 *
 * ONE DEPARTURE AND ONE GAP, both deliberate:
 *
 *   - The Positive glyph takes `On Subtle` (#0d351b) rather than the `On
 *     Strong` (#001f00) the foreign component used. On Strong is the
 *     foreground for a SOLID fill and this glyph sits on a Subtle one, so the
 *     exact-hex match would have been a pairing violation. On Subtle measures
 *     11.94:1 on that tint against On Strong's 15.4:1, so both clear AAA and
 *     the difference is invisible at 24px. This also makes Positive consistent
 *     with the Info variant, which was already an exact match AND the correct
 *     pairing.
 *
 *   - Figma's Modern shadow is `0 1 2 rgba(10,13,18,0.05)` plus two inner
 *     shadows. Pathway's smallest elevation token is `--elevation-widget`,
 *     `0 2px 8px -2px`, so there is no exact match and the inner shadows have
 *     no token at all. Rather than invent one, this uses the nearest existing
 *     token and the gap is recorded in the spec. The inner shadows are dropped:
 *     they are an Untitled UI flourish, not a Pathway treatment.
 */
import React from "react";
import { Icon } from "./icon.jsx";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;

export const FEATURED_ICON_SIZES = {
  md: { box: 40, glyph: 20 },
  lg: { box: 48, glyph: 24 },
};

/**
 * The tones, on the same pairing every Pathway tone group guarantees: a Subtle
 * fill with its On Subtle foreground. Matched to DisplayIcon's table so the two
 * cannot disagree, including that `Accent` is amethyst (Info) and `Info` is
 * brand, which is the file's own history.
 */
export const FEATURED_ICON_COLORS = {
  Accent:   { fill: C("fill-static-info-subtle"),      fg: C("foreground-static-info-on-subtle") },
  Positive: { fill: C("fill-static-positive-subtle"),  fg: C("foreground-static-positive-on-subtle") },
  Negative: { fill: C("fill-static-negative-subtle"),  fg: C("foreground-static-negative-on-subtle") },
  Danger:   { fill: C("fill-static-severe-subtle"),    fg: C("foreground-static-severe-on-subtle") },
  Alert:    { fill: C("fill-static-attention-subtle"), fg: C("foreground-static-attention-on-subtle") },
  Neutral:  { fill: C("fill-static-neutral-subtle"),   fg: C("foreground-static-neutral-base") },
  Info:     { fill: C("fill-static-brand-subtle"),     fg: C("foreground-static-brand-on-subtle") },
};

export const FEATURED_ICON_TYPES = ["outline", "modern"];

export const T = {
  chipFill:   C("fill-surface-elevated"),
  chipBorder: C("stroke-static-neutral-base"),
  chipGlyph:  C("foreground-static-neutral-base"),
};

export const L = {
  // Light outline is r=28 on a 48 box, which is past half the width, so it is a
  // circle rather than a specific radius. CornerRadius/Full says that.
  circle: U("cornerradius-full"),
  // Modern is r=8 at both sizes.
  chip:   U("cornerradius-base"),
  border: "var(--semantic-layout-units-borderwidth-base)",
};

/**
 * @param {string} name  Material Symbols ligature.
 * @param {"md"|"lg"} size  Figma's Size axis, the two values the design uses.
 * @param {"outline"|"modern"} type  Figma's Type axis. `outline` is the tinted
 *                       circle and takes `color`; `modern` is the white chip
 *                       and ignores it, because it is not tone-coloured.
 * @param {keyof FEATURED_ICON_COLORS} color  Only meaningful for `outline`.
 * @param {string} label  Omit for a decorative badge, which is the common case:
 *                       a featured icon sits above a heading that already says
 *                       what it means.
 */
export function FeaturedIcon({
  name = "trending_up",
  size = "lg",
  type = "outline",
  color = "Positive",
  fill = 1,
  label,
  className = "",
  style,
  ...rest
}) {
  const s = FEATURED_ICON_SIZES[size] || FEATURED_ICON_SIZES.lg;
  const modern = type === "modern";
  const tone = FEATURED_ICON_COLORS[color] || FEATURED_ICON_COLORS.Positive;

  return (
    <span
      className={`pw-featured-icon ${className}`}
      data-size={size}
      data-type={type}
      data-color={modern ? "Neutral" : color}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: s.box, height: s.box, flexShrink: 0, boxSizing: "border-box",
        borderRadius: modern ? L.chip : L.circle,
        background: modern ? T.chipFill : tone.fill,
        color: modern ? T.chipGlyph : tone.fg,
        // Modern's 1px border is INSIDE-aligned in Figma, which border-box
        // reproduces: the chip stays 48, the border eats into it.
        border: modern ? `${L.border} solid ${T.chipBorder}` : "none",
        boxShadow: modern ? "var(--elevation-widget)" : "none",
        ...style,
      }}
      {...rest}
    >
      <Icon name={name} size={s.glyph} fill={fill} label={label} />
    </span>
  );
}

export default FeaturedIcon;
