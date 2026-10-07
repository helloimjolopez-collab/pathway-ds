/**
 * DisplayIcon: a decorative icon in a tinted circle, used by alerts, empty
 * states and the KPI tile's featured icon slot.
 *
 * SOURCE OF TRUTH: Figma set `DisplayIcon` 40006522:26547 on the
 * `↳ ❇️ Display Icon` page. 21 variants on Size x Color, plus an
 * INSTANCE_SWAP for the glyph, read and MEASURED 2026-10-07.
 *
 * MEASURED
 *   Size      box       glyph
 *   Small    24x24       12
 *   Medium   32x32       16
 *   Large    40x40       20
 *
 *   Color    Accent | Positive | Negative | Danger | Neutral | Info | Alert
 *
 * THE COLOUR AXIS MAPS ONTO THE MEANING-NAMED TONE GROUPS, not onto hue names,
 * which is what CLAUDE.md §2.0 requires. `Danger` and `Negative` are both in
 * the Figma axis and are different tones in the token set: Negative is Red and
 * Severe is Orange, so Danger takes Severe. `Accent` has no single meaning, so
 * it takes Brand rather than one of the four decorative accents, because a
 * display icon on an alert is not decoration.
 *
 * Each tone draws its SUBTLE fill with its ON SUBTLE foreground, which is the
 * pairing the token set guarantees and `check-fill-foreground-pairs` asserts.
 * Reaching for a Strong fill here would put tone text on a tone block.
 *
 * ONE MEASURED GAP, recorded rather than invented: the component binds no fill
 * on the variant and the nested glyph's fill is unbound, so neither the circle
 * colour nor the glyph colour is bound to a variable in Figma. The Color axis
 * therefore has no token behind it in the file. The mapping below is this
 * repo's, derived from the tone names, and the Figma side needs binding.
 */
import React from "react";
import { Icon } from "./icon.jsx";

const C = (n) => `var(--semantic-color-${n})`;

export const DISPLAY_ICON_SIZES = {
  Small:  { box: 24, glyph: 12 },
  Medium: { box: 32, glyph: 16 },
  Large:  { box: 40, glyph: 20 },
};

/** Figma's Color axis, onto the meaning-named tone groups. */
export const DISPLAY_ICON_COLORS = {
  Accent:   { fill: C("fill-static-brand-subtle"),     fg: C("foreground-static-brand-on-subtle") },
  Positive: { fill: C("fill-static-positive-subtle"),  fg: C("foreground-static-positive-on-subtle") },
  Negative: { fill: C("fill-static-negative-subtle"),  fg: C("foreground-static-negative-on-subtle") },
  Danger:   { fill: C("fill-static-severe-subtle"),    fg: C("foreground-static-severe-on-subtle") },
  Neutral:  { fill: C("fill-static-neutral-subtle"),   fg: C("foreground-static-neutral-base") },
  Info:     { fill: C("fill-static-info-subtle"),      fg: C("foreground-static-info-on-subtle") },
  Alert:    { fill: C("fill-static-attention-subtle"), fg: C("foreground-static-attention-on-subtle") },
};

/**
 * @param {string} name  Material Symbols ligature, Figma's `IconInstance` swap.
 * @param {"Small"|"Medium"|"Large"} size
 * @param {keyof DISPLAY_ICON_COLORS} color  Figma's Color axis.
 * @param {string} label  Omit for a decorative icon, which is the common case:
 *                        a display icon almost always sits beside a heading
 *                        that already says what it means.
 */
export function DisplayIcon({
  name,
  size = "Small",
  color = "Accent",
  fill = 1,
  label,
  className = "",
  style,
  ...rest
}) {
  const s = DISPLAY_ICON_SIZES[size] || DISPLAY_ICON_SIZES.Small;
  const tone = DISPLAY_ICON_COLORS[color] || DISPLAY_ICON_COLORS.Accent;
  return (
    <span
      className={`pw-display-icon ${className}`}
      data-size={size}
      data-color={color}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: s.box, height: s.box, flexShrink: 0, borderRadius: "50%",
        background: tone.fill, color: tone.fg, ...style,
      }}
      {...rest}
    >
      <Icon name={name} size={s.glyph} fill={fill} label={label} />
    </span>
  );
}

export default DisplayIcon;
