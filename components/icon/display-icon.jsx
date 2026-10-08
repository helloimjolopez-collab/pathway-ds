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
 * THE TOKENS BELOW ARE READ BACK FROM FIGMA, not derived from the names.
 *
 * What was there before, and what it took to find it: the variant itself has no
 * fill and the nested glyph instance has no fill, so a reader checking those two
 * nodes concludes the Color axis is unbound. It is not: the bindings live on the
 * `Container` frame and on the `_shape` vector INSIDE the glyph instance. A
 * first pass reported "no tokens at all", which was wrong.
 *
 * The real defects, found by reading all 21 variants on 2026-10-08 and fixed in
 * the file the same day:
 *
 *   - Only 4 of 21 glyphs were bound. The other 17 were raw fills.
 *   - Two of those 4 used HUE-NAMED tokens, `Foreground/Static/Amethyst/Bold`
 *     and `Foreground/Static/Green/Bold`, which the semantic tier forbids and
 *     which are not even in the local variable set any more.
 *   - `Neutral` drew `Fill/Action/Secondary/Hover`: an ACTION token on a
 *     decorative element that has no states.
 *   - `Info` drew `Fill/Static/Brand/Faint`, and Faint has no paired On Subtle
 *     foreground, so the pairing the token set guarantees did not exist for it.
 *   - Every Container carried a paint STYLE as well as a variable, which is two
 *     sources of truth for one colour. The styles were cleared.
 */
import React from "react";
import { Icon } from "./icon.jsx";

const C = (n) => `var(--semantic-color-${n})`;

const U = (n) => `var(--semantic-layout-units-${n})`;

export const L = {
  // Figma: Container cornerRadius 8 on all 21 variants.
  radius: U("cornerradius-base"),
};

export const DISPLAY_ICON_SIZES = {
  Small:  { box: 24, glyph: 12 },
  Medium: { box: 32, glyph: 16 },
  Large:  { box: 40, glyph: 20 },
};

/**
 * Figma's Color axis, read back from the file after binding on 2026-10-08.
 *
 * EACH VALUE KEEPS THE HUE IT ALREADY RENDERED. The names are not a clean map
 * onto the tone groups and that is the file's own history, not something to
 * tidy here: `Accent` resolves to INFO (amethyst) and `Info` resolves to BRAND.
 * Repointing either would repaint a variant rather than fix a mapping, so the
 * binding kept the hue and fixed only the tier and the pairing.
 *
 * An earlier version of this file guessed Accent to Brand and Info to Info,
 * which is those two swapped, so a consumer asking for Accent got blue where
 * the design is amethyst.
 */
export const DISPLAY_ICON_COLORS = {
  // Accent is amethyst, which is the Info tone in the token set.
  Accent:   { fill: C("fill-static-info-subtle"),      fg: C("foreground-static-info-on-subtle") },
  Positive: { fill: C("fill-static-positive-subtle"),  fg: C("foreground-static-positive-on-subtle") },
  Negative: { fill: C("fill-static-negative-subtle"),  fg: C("foreground-static-negative-on-subtle") },
  // Danger is Severe (orange), a different tone from Negative (red). Both are
  // in the Figma axis, so they must stay different here too.
  Danger:   { fill: C("fill-static-severe-subtle"),    fg: C("foreground-static-severe-on-subtle") },
  Alert:    { fill: C("fill-static-attention-subtle"), fg: C("foreground-static-attention-on-subtle") },
  // Neutral has no On Subtle rung, so its foreground is Base.
  Neutral:  { fill: C("fill-static-neutral-subtle"),   fg: C("foreground-static-neutral-base") },
  // Info is the BRAND blue in this component, not the Info tone.
  Info:     { fill: C("fill-static-brand-subtle"),     fg: C("foreground-static-brand-on-subtle") },
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
        width: s.box, height: s.box, flexShrink: 0,
        /* r=8 ON EVERY VARIANT, a rounded square. This drew a full circle, which
           is a different shape: Figma's Container corner radius is 8 at all
           three sizes, and only the Featured icon's Light outline type is round. */
        borderRadius: L.radius,
        background: tone.fill, color: tone.fg, ...style,
      }}
      {...rest}
    >
      <Icon name={name} size={s.glyph} fill={fill} label={label} />
    </span>
  );
}

export default DisplayIcon;
