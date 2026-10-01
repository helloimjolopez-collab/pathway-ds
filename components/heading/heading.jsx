import React from "react";

/**
 * heading.jsx — Heading.
 *
 * FIGMA: TWO SETS THAT ARE ORTHOGONAL
 *   `Heading`       40004143:1824, six variants, Level H1 to H6
 *   `Heading.Style` 40004024:31157, 27 variants,
 *                   Context [Display|Page|Section|Local]
 *                   x Size  [XL|L|Base|Small|XSmall|XXS]
 *                   x Weight[Bold|Semibold|Medium]
 *
 * All six Level variants render identically in Figma: 24/30 Bold, every one of
 * them. So Level carries no appearance at all; it is the semantic level, and
 * the appearance comes from Heading.Style. That is the right split, and this
 * component keeps it: `level` picks the tag, `context`/`size`/`weight` pick the
 * look, and the two never imply each other. A page's h1 can be Section/Small
 * if that is what the layout wants, and a visually huge heading can be an h2.
 *
 * ONLY 27 OF THE 72 COMBINATIONS EXIST. Context, Size and Weight do not form a
 * full grid: Display has no Small or below, Local has no L or above, Page has
 * no Medium weight at all. STYLES below is the exact set Figma draws, and an
 * unknown combination falls back to the nearest defined one rather than
 * rendering something the design does not contain.
 *
 * WHY THE TYPE IS COMPOSED HERE
 * Figma's `❇️ Heading/...` are TEXT STYLES, not variables, so they do not
 * export and there is no composite token to bind. The panel ships the pieces
 * (font-size, line-height, letter-spacing, weight, family) and every value
 * below is one of them. Nothing is a raw number.
 *
 * A DEFECT WORTH NAMING, NOT FIXED HERE. Two Figma variants have their weight
 * label inverted against what they render:
 *   Section / XSmall / Weight=Medium   renders SemiBold
 *   Section / XSmall / Weight=Semibold renders Medium
 *   Section / XXS    / Weight=Medium   renders SemiBold
 * This component honours the LABEL, because the label is the contract the name
 * makes: `weight="medium"` gives 500. So those three render differently here
 * than in Figma until the file is corrected. Recorded in the manifest.
 */

const ST = (n) => `var(--semantic-type-${n})`;
const SC = (n) => `var(--semantic-color-${n})`;

export const CONTEXTS = ["display", "page", "section", "local"];
export const SIZES = ["xl", "l", "base", "small", "xsmall", "xxs"];
export const WEIGHTS = ["bold", "semibold", "medium"];
export const LEVELS = [1, 2, 3, 4, 5, 6];

/**
 * The 27 combinations Figma actually draws, as [fontSize, lineHeight,
 * letterSpacing] token suffixes. Weight is applied separately because it is a
 * free axis within each entry.
 */
const STYLES = {
  "display/xl":      ["font-size-6xl",  "line-height-6xl-single",  "letter-spacing-wide"],
  "display/l":       ["font-size-5xl",  "line-height-5xl-single",  "letter-spacing-wide"],
  "display/base":    ["font-size-4xl",  "line-height-4xl-single",  "letter-spacing-wide"],

  "page/xl":         ["font-size-xxxl", "line-height-xxxl-single", "letter-spacing-wide"],
  "page/l":          ["font-size-xxl",  "line-height-xxl-single",  "letter-spacing-wide"],
  "page/base":       ["font-size-xl",   "line-height-xl-single",   "letter-spacing-wide"],

  // Section/Base is 18/30, which is line-height-m-RELAXED rather than the
  // single 24. That is a real token pairing, not a slip: a section heading sits
  // over body copy and takes the looser leading.
  "section/l":       ["font-size-l",    "line-height-l-single",    "letter-spacing-wide"],
  "section/base":    ["font-size-m",    "line-height-m-relaxed",   "letter-spacing-wide"],
  "section/small":   ["font-size-r",    "line-height-r-single",    "letter-spacing-wide"],
  "section/xsmall":  ["font-size-s",    "line-height-s-single",    "letter-spacing-spacious"],
  "section/xxs":     ["font-size-xs",   "line-height-xs-single",   "letter-spacing-extraspacious"],

  "local/base":      ["font-size-s",    "line-height-s-tight",     "letter-spacing-spacious"],
  "local/small":     ["font-size-xs",   "line-height-xs-tight",    "letter-spacing-extraspacious"],
};

/**
 * The 27 combinations Figma draws, listed explicitly.
 *
 * NOT a cross product of context x size x weight. The grid is sparse in both
 * directions: Section defines XSmall in Medium and Semibold but not Bold, and
 * XXS in Medium only; Local defines Base in Bold and Semibold but Small in
 * Semibold only. A cross product gives 31, which is four combinations Figma
 * does not draw, so it has to be the real list.
 */
export const DEFINED_COMBINATIONS = [
  { context: "display", size: "xl",     weight: "bold" },
  { context: "display", size: "xl",     weight: "semibold" },
  { context: "display", size: "l",      weight: "bold" },
  { context: "display", size: "l",      weight: "semibold" },
  { context: "display", size: "base",   weight: "bold" },
  { context: "display", size: "base",   weight: "semibold" },

  { context: "page",    size: "xl",     weight: "bold" },
  { context: "page",    size: "xl",     weight: "semibold" },
  { context: "page",    size: "l",      weight: "bold" },
  { context: "page",    size: "l",      weight: "semibold" },
  { context: "page",    size: "base",   weight: "bold" },
  { context: "page",    size: "base",   weight: "semibold" },

  { context: "section", size: "l",      weight: "bold" },
  { context: "section", size: "l",      weight: "semibold" },
  { context: "section", size: "l",      weight: "medium" },
  { context: "section", size: "base",   weight: "bold" },
  { context: "section", size: "base",   weight: "semibold" },
  { context: "section", size: "base",   weight: "medium" },
  { context: "section", size: "small",  weight: "bold" },
  { context: "section", size: "small",  weight: "semibold" },
  { context: "section", size: "small",  weight: "medium" },
  { context: "section", size: "xsmall", weight: "semibold" },
  { context: "section", size: "xsmall", weight: "medium" },
  { context: "section", size: "xxs",    weight: "medium" },

  { context: "local",   size: "base",   weight: "bold" },
  { context: "local",   size: "base",   weight: "semibold" },
  { context: "local",   size: "small",  weight: "semibold" },
];

/** Which weights each context defines, derived from the list above so the two
 *  can never disagree. */
export const CONTEXT_WEIGHTS = DEFINED_COMBINATIONS.reduce((acc, c) => {
  acc[c.context] = acc[c.context] || [];
  if (!acc[c.context].includes(c.weight)) acc[c.context].push(c.weight);
  return acc;
}, {});

/** Which sizes each context defines, derived the same way. */
export const CONTEXT_SIZES = DEFINED_COMBINATIONS.reduce((acc, c) => {
  acc[c.context] = acc[c.context] || [];
  if (!acc[c.context].includes(c.size)) acc[c.context].push(c.size);
  return acc;
}, {});

/** Which weights a given context AND size define together, which is the only
 *  question that actually has a sparse answer. */
export function weightsFor(context, size) {
  const w = DEFINED_COMBINATIONS
    .filter((c) => c.context === context && c.size === size)
    .map((c) => c.weight);
  return w.length ? w : ["semibold"];
}

/** Nearest defined size within a context, so an undrawn combination renders
 *  something the design contains rather than something it does not. */
function nearestSize(context, size) {
  const defined = CONTEXT_SIZES[context] || CONTEXT_SIZES.section;
  if (defined.includes(size)) return size;
  const order = SIZES;
  const want = order.indexOf(size);
  let best = defined[0], bestGap = Infinity;
  for (const d of defined) {
    const gap = Math.abs(order.indexOf(d) - want);
    if (gap < bestGap) { bestGap = gap; best = d; }
  }
  return best;
}

export const T = {
  base:   SC("foreground-static-neutral-strong"),
  subtle: SC("foreground-static-neutral-base"),
  faint:  SC("foreground-static-neutral-faint"),
  mono:   SC("foreground-static-neutral-mono"),
};

/** Which foreground a tone resolves to. `inherit` lets a heading sit inside a
 *  themed region and take that region's colour. */
export const TONES = { base: T.base, subtle: T.subtle, faint: T.faint, mono: T.mono, inherit: "inherit" };

/**
 * @param {number} level     1 to 6. Picks the TAG only, exactly as in Figma
 *                           where all six Levels render identically.
 * @param {string} context   display | page | section | local
 * @param {string} size      xl | l | base | small | xsmall | xxs
 * @param {string} weight    bold | semibold | medium
 * @param {string} tone      base | subtle | faint | mono | inherit
 * @param {string} as        override the tag without changing the level, for a
 *                           heading that must not enter the document outline
 */
export function Heading({
  level = 2,
  context = "section",
  size = "base",
  weight = "semibold",
  tone = "base",
  as,
  children,
  style,
  className = "",
  ...rest
}) {
  const ctx = CONTEXTS.includes(context) ? context : "section";
  const sz = nearestSize(ctx, SIZES.includes(size) ? size : "base");
  const allowed = weightsFor(ctx, sz);
  const wt = allowed.includes(weight) ? weight : allowed[0];

  const [fontSize, lineHeight, letterSpacing] =
    STYLES[`${ctx}/${sz}`] || STYLES["section/base"];

  const Tag = as || `h${LEVELS.includes(level) ? level : 2}`;

  return (
    <Tag
      className={`pw-heading ${className}`}
      data-context={ctx}
      data-size={sz}
      data-weight={wt}
      style={{
        margin: 0,
        fontFamily: ST("family-brand"),
        fontSize: ST(fontSize),
        lineHeight: ST(lineHeight),
        letterSpacing: ST(letterSpacing),
        fontWeight: ST(`weight-${wt}`),
        color: TONES[tone] || T.base,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Heading;
