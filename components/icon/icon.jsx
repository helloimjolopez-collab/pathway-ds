/**
 * Icon: the one place Pathway renders an icon.
 *
 * WHY THIS FILE EXISTS. Every Figma icon component in this system had NO code
 * to point at. Code Connect listed them with no path and no link, so a
 * developer opening an icon in Figma was told nothing about how to render one.
 * The repo was part of the reason: six components each carried their OWN
 * private `Icon` or `Glyph` helper (top-nav, search, org-switcher, dashboard,
 * kpi-tile, plus the sidenav's inline spans), all doing the same thing
 * slightly differently, and none of them importable. There was nothing to
 * link BECAUSE there was no shared module.
 *
 * WHAT A PATHWAY ICON ACTUALLY IS, since this is the question that keeps
 * coming up. It is not an SVG file and there is no per-icon asset to fetch.
 * It is one variable font, Material Symbols Rounded, and an icon is its NAME
 * written as text inside an element that has the font applied. The browser's
 * ligature substitution turns the text `arrow_forward` into the arrow glyph.
 * So:
 *
 *   the font       Material Symbols Rounded, from Google Fonts
 *   the stylesheet https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded
 *                    :opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
 *   the catalogue  https://fonts.google.com/icons  (set Style = Rounded)
 *   the source     https://github.com/google/material-design-icons
 *   one icon       <span class="material-symbols-rounded">arrow_forward</span>
 *
 * The name you write is the folder name in that repo and the name shown in
 * that catalogue. Nothing is imported per icon, which is the whole appeal: the
 * font carries every glyph, so adding an icon costs nothing.
 *
 * THE FOUR AXES are variable-font axes, not separate fonts:
 *
 *   FILL  0 outlined, 1 solid. READ IT FROM FIGMA PER COMPONENT, never assume.
 *         SideNav is FILL 1 throughout; the Widget header is FILL 0.
 *   wght  400 everywhere in Pathway.
 *   GRAD  0 everywhere in Pathway.
 *   opsz  matched to the font size, which is what keeps the stroke weight even
 *         across sizes. A 16px icon at opsz 20 is visibly lighter than it
 *         should be, and that defect shipped once in the SideNav rail.
 *
 * SIZE IS THE FRAME, NEVER THE VECTOR. Figma nests a wrapper (24), an icon
 * frame (16) and the drawn vector (~12), because the Material grid has about
 * 2px of built-in padding. `size` here is the FRAME, so `size={16}` reproduces
 * Figma's 16 and lands the visible glyph near 12. Passing the vector's 12
 * ships an icon a third too small. See docs/design-system-spec.md §7.2.
 */
import React from "react";

/** The stylesheet every surface that renders an icon must load. */
export const MATERIAL_SYMBOLS_HREF =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" +
  ":opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";

/** Where the names come from, for anyone looking for one. */
export const ICON_SOURCES = {
  catalogue: "https://fonts.google.com/icons",
  repo: "https://github.com/google/material-design-icons",
  webSymbols: "https://github.com/google/material-design-icons/tree/master/symbols/web",
};

/** Pathway's fixed axis values. Only FILL and opsz ever vary. */
export const AXES = { wght: 400, GRAD: 0 };

/**
 * The per-size table from docs/design-system-spec.md §7.2. `wrapper` is the
 * container Figma draws around the frame, and is the touch or alignment box
 * rather than anything the glyph itself occupies.
 */
export const SIZES = {
  L: { frame: 18, wrapper: 26 },
  M: { frame: 16, wrapper: 24 },
  S: { frame: 14, wrapper: 20 },
};

/**
 * @param {string} name   The Material Symbols ligature, e.g. "arrow_forward".
 *                        Same string as the folder name in Google's repo.
 * @param {number|"L"|"M"|"S"} size  The FRAME size. A letter resolves through
 *                        SIZES; a number is used as-is. Default M, 16.
 * @param {0|1} fill      FILL axis. Read it from Figma; never assume.
 * @param {string} color  Any CSS colour. Pass a semantic token's var(), never
 *                        a hex. Omit to inherit, which is usually right: an
 *                        icon beside a label should take the label's colour.
 * @param {string} label  An accessible name. Omit for a decorative icon and it
 *                        is hidden from assistive tech, which is the default
 *                        because most icons sit beside their own text.
 */
export function Icon({
  name,
  size = "M",
  fill = 0,
  color,
  label,
  className = "",
  style,
  ...rest
}) {
  const frame = typeof size === "number" ? size : (SIZES[size] || SIZES.M).frame;
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      // Decorative by default. A label makes it an image with a name.
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={{
        fontSize: frame,
        lineHeight: 1,
        display: "block",
        flexShrink: 0,
        color,
        // opsz TRACKS THE FONT SIZE. Pinning it to 20 while the glyph renders
        // at 16 makes the stroke too light, which is what went wrong in the
        // collapsed SideNav rail.
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${AXES.wght}, 'GRAD' ${AXES.GRAD}, 'opsz' ${frame}`,
        ...style,
      }}
      {...rest}
    >
      {name}
    </span>
  );
}

/**
 * The icon in its Figma wrapper: the alignment box, not the glyph.
 *
 * Use it when you are reproducing a Figma frame that nests
 * `Container.LeadingIcon` around `Icon.Leading`. A bare `<Icon>` is the frame
 * alone and is what most layouts want.
 */
export function IconBox({ name, size = "M", fill = 0, color, label, style, ...rest }) {
  const s = typeof size === "string" ? (SIZES[size] || SIZES.M) : { frame: size, wrapper: size + 8 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: s.wrapper, height: s.wrapper, flexShrink: 0, ...style,
    }} {...rest}>
      <Icon name={name} size={s.frame} fill={fill} color={color} label={label} />
    </span>
  );
}

/**
 * Drop the stylesheet in. Storybook and the HTML demos load it in their own
 * head; this is for a consumer who renders an Icon without having done that,
 * because a missing font shows the LIGATURE NAME as text rather than failing,
 * and "arrow_forward" in the middle of a button is a confusing bug to chase.
 */
export const IconFont = () => (
  <link rel="stylesheet" href={MATERIAL_SYMBOLS_HREF} />
);

export default Icon;
