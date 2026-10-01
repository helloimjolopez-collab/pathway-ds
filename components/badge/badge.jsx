import React from "react";

/**
 * badge.jsx — Badge.
 *
 * FIGMA
 * Component set `Badge`, Amplify 40011003:15892, 96 variants:
 *   Status [Neutral|Severe|Negative|Positive|Attention|Info|Accent 2|Accent 3]
 *   x Size [Small|Medium|Large]
 *   x Style[Outline & Fill|Fill|Outline|Naked]
 * plus Label, Show Label, Leading Icon, Show Leading Icon, Trailing Icon,
 * Show Trailing Icon, Long Text, Show Long Text.
 *
 * The page also carries four older 63-variant sets that still report variant
 * conflicts. This reads the clean 96-variant Amplify one.
 *
 * ACCENT 2 IS JADE AND ACCENT 3 IS MAUVE. That is what the variants bind, and
 * there is no Accent 1: Info already resolves to the Amethyst ramp, which is
 * what an Accent 1 would have been. The props here are named `jade` and
 * `mauve` rather than `accent-2` and `accent-3`, because a number that only
 * means "the next accent we added" tells a consumer nothing, and the token it
 * resolves to says jade. Code Connect maps the Figma names onto these.
 *
 * THREE OF THE FOUR STYLES ARE SYSTEMATIC
 *   outline-fill  fill + border + status foreground
 *   fill          fill, no border
 *   outline       border, no fill
 * Each one reads the same three tokens per status, so STATUS below is the
 * whole colour story and `style` only decides which of the three it applies.
 *
 * NAKED IS NOT SYSTEMATIC IN FIGMA, AND THIS DOES NOT COPY IT.
 * Read across the eight Naked variants and they disagree in four ways:
 *   it has a FILL on five of eight (Attention, Negative, Info, Accent 2,
 *     Accent 3), which contradicts the name outright
 *   it has a BORDER on three of eight (Neutral, Severe, Positive)
 *   its text is foreground-static-neutral-bold on Neutral, neutral-base on
 *     Severe, Negative, Info and Accent 2, neutral-strong on Positive, and the
 *     status's own on-subtle on Attention and Accent 3, so a Naked status badge
 *     mostly loses its status entirely
 *   Accent 3 binds the PRIMITIVE Mauve/25 directly instead of the semantic
 *     fill-static-accent-mauve-subtle
 * By name, and by the Button precedent where Naked is the quietest style,
 * Naked means no fill and no border, carrying only the status foreground. That
 * is what this renders for all eight. The eight real bindings are recorded in
 * the manifest so the file can be corrected; until it is, Naked is the one
 * style where this component and Figma deliberately differ.
 */

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;

export const STATUSES = [
  "neutral", "info", "positive", "attention", "negative", "severe", "jade", "mauve",
];
export const SIZES = ["small", "medium", "large"];
export const STYLES = ["outline-fill", "fill", "outline", "naked"];

/**
 * The three tokens each status reads. Taken variant by variant from the Figma
 * set, including the places it does not follow the obvious pattern: Neutral
 * uses the neutral BOLD stroke and foreground rather than an on-subtle,
 * Attention uses the STRONG stroke rather than subtle, and the two accents use
 * an unsuffixed stroke because that is the only one the accent families have.
 */
export const STATUS = {
  neutral:   { fill: "fill-static-neutral-base",        stroke: "stroke-static-neutral-bold",      fg: "foreground-static-neutral-bold" },
  info:      { fill: "fill-static-info-subtle",         stroke: "stroke-static-info-subtle",       fg: "foreground-static-info-on-subtle" },
  positive:  { fill: "fill-static-positive-subtle",     stroke: "stroke-static-positive-subtle",   fg: "foreground-static-positive-on-subtle" },
  attention: { fill: "fill-static-attention-subtle",    stroke: "stroke-static-attention-strong",  fg: "foreground-static-attention-on-subtle" },
  negative:  { fill: "fill-static-negative-subtle",     stroke: "stroke-static-negative-subtle",   fg: "foreground-static-negative-on-subtle" },
  severe:    { fill: "fill-static-severe-subtle",       stroke: "stroke-static-severe-subtle",     fg: "foreground-static-severe-on-subtle" },
  jade:      { fill: "fill-static-accent-jade-subtle",  stroke: "stroke-static-accent-jade",       fg: "foreground-static-accent-jade-on-subtle" },
  mauve:     { fill: "fill-static-accent-mauve-subtle", stroke: "stroke-static-accent-mauve",      fg: "foreground-static-accent-mauve-on-subtle" },
};

/** The three sizes, from the Figma label styles: Small is Label/Badge/Small,
 *  Medium is Label/Badge/Base, Large is Text/Body/Small. */
const SIZE = {
  small:  { fontSize: "font-size-xxs", lineHeight: "line-height-xxs-single", ls: "letter-spacing-extraspacious", padH: "padding-xxtight", padV: "padding-xxxtight", glyph: 10 },
  medium: { fontSize: "font-size-xs",  lineHeight: "line-height-xs-single",  ls: "letter-spacing-extraspacious", padH: "padding-xxtight", padV: "padding-xxxtight", glyph: 12 },
  large:  { fontSize: "font-size-s",   lineHeight: "line-height-s-single",   ls: "letter-spacing-wide",          padH: "padding-xtight",  padV: "padding-xxtight",  glyph: 14 },
};

export const L = {
  radius:     SU("cornerradius-large"),
  border:     SU("borderwidth-base"),
  gap:        SU("gap-xxxtight"),
};

/**
 * @param {string} status      one of STATUSES. `jade` and `mauve` are Figma's
 *                             Accent 2 and Accent 3.
 * @param {string} size        small | medium | large
 * @param {string} badgeStyle  outline-fill | fill | outline | naked. Named
 *                             badgeStyle because `style` is the CSS style object.
 * @param {node}   leadingIcon
 * @param {node}   trailingIcon
 * @param {node}   children     the label
 */
export function Badge({
  status = "neutral",
  size = "medium",
  badgeStyle = "outline-fill",
  leadingIcon,
  trailingIcon,
  children,
  style,
  className = "",
  ...rest
}) {
  const st = STATUS[status] || STATUS.neutral;
  const sz = SIZE[size] || SIZE.medium;
  const sty = STYLES.includes(badgeStyle) ? badgeStyle : "outline-fill";

  const hasFill = sty === "outline-fill" || sty === "fill";
  const hasBorder = sty === "outline-fill" || sty === "outline";

  return (
    <span
      className={`pw-badge ${className}`}
      data-status={status}
      data-size={size}
      data-style={sty}
      style={{
        display: "inline-flex", alignItems: "center", gap: L.gap,
        padding: `${SU(sz.padV)} ${SU(sz.padH)}`,
        borderRadius: L.radius,
        // Always declare the border, transparent when the style has none, so a
        // badge does not change size between styles.
        border: `${L.border} solid ${hasBorder ? SC(st.stroke) : "transparent"}`,
        background: hasFill ? SC(st.fill) : "transparent",
        color: SC(st.fg),
        fontFamily: ST("family-brand"),
        fontWeight: ST("weight-medium"),
        fontSize: ST(sz.fontSize),
        lineHeight: ST(sz.lineHeight),
        letterSpacing: ST(sz.ls),
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        ...style,
      }}
      {...rest}
    >
      {leadingIcon && (
        <span aria-hidden="true" style={{ display: "flex", flex: "0 0 auto", fontSize: sz.glyph }}>
          {leadingIcon}
        </span>
      )}
      {children}
      {trailingIcon && (
        <span aria-hidden="true" style={{ display: "flex", flex: "0 0 auto", fontSize: sz.glyph }}>
          {trailingIcon}
        </span>
      )}
    </span>
  );
}

/** Figma's Status names, for anyone reading a design and looking for the prop. */
export const FIGMA_STATUS = {
  Neutral: "neutral",
  Info: "info",
  Positive: "positive",
  Attention: "attention",
  Negative: "negative",
  Severe: "severe",
  "Accent 2": "jade",
  "Accent 3": "mauve",
};

export default Badge;
