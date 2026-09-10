/**
 * tokenOrder.js — canonical display order for token ladders.
 *
 * WHY THIS EXISTS: the Figma Variables panel cannot be reordered. `variableIds`
 * has no setter, so there is no API call that moves a variable up a list, and
 * recreating 791 variables in the right order would break 17,875 node bindings.
 * The panel therefore shows groups in creation order, which is why
 * Foreground/Static/Neutral reads "faint, subtle, medium, contrast, bold,
 * xlight, white, light" — the two anchors and one rung added later sit at the
 * bottom.
 *
 * Everything DOWNSTREAM of the panel can still be ordered, and should be. This
 * module is the single place that decides what "in order" means, so the
 * Storybook tables, the Color docs page and any generated report agree.
 *
 * The ladder runs lightest to heaviest. That reads correctly for Foreground
 * (faint text through bold text) and for Fill (a faint tint through a bold
 * block). In Midnight the VALUES invert but the names do not, so the order is
 * mode-independent and this module needs no mode argument.
 */

// The graded ladder, per docs/design-system-spec.md. White, XLight and Black
// are inversion ANCHORS rather than rungs — they hold their value across modes
// instead of flipping — but they still have a place on the ramp, so they are
// ordered here and marked as anchors below for the UI to annotate.
export const LADDER = [
  "white",
  "xlight",
  "faint",
  "subtle",
  "light",
  "medium",
  "contrast",
  "bold",
  "black",
];

export const ANCHORS = new Set(["white", "xlight", "black"]);

// Interaction states, in the order a pointer actually moves through them.
// Disabled last because it is terminal, not a step.
export const STATES = ["rest", "hover", "pressed", "selected", "disabled"];

// Surface steps, flattest to most raised.
export const SURFACES = ["canvas", "sheet", "elevated"];

// Type scale, smallest to largest. R (16px) is the base step.
export const TYPE_SIZES = [
  "xxxs", "xxs", "xs", "s", "r", "m", "l",
  "xl", "xxl", "xxxl", "4xl", "5xl", "6xl",
];

// Line-height density, tightest first.
export const DENSITIES = ["tight", "single", "relaxed"];

// Weights, lightest first. Only faces Red Hat Text actually ships.
export const WEIGHTS = ["light", "regular", "medium", "semibold", "bold"];

// Tracking, tightest first.
export const TRACKING = ["compact", "wide", "spacious", "extraspacious"];

// Tier order for the colour contract. Foreground first because it is what a
// reader looks at, then what sits behind it, then its edge, then the veil.
export const TIERS = ["foreground", "fill", "stroke", "scrim"];

// Within a tier: Static is the graded ladder, Action is the interactive set,
// Surface is the page ground, FocusRing is a single accessibility token.
export const GROUPS = ["static", "surface", "action", "focusring", "base"];

// Roles inside Static/Action. Neutral and Brand lead because they carry most
// of the UI; Status is ordered by severity, not alphabetically; Accent last
// because it is decorative.
export const ROLES = [
  "neutral", "brand", "primary", "primary-dim", "secondary", "mono",
  "positive", "attention", "severe", "negative", "info",
  "amethyst", "jade", "seabreeze", "lagoon", "mauve", "saffron", "orange",
];

/**
 * Build a comparator that ranks by position in `list`, sending anything absent
 * to the end in alphabetical order rather than dropping or randomising it.
 * A silent drop is how an ordering helper hides a token; ranking unknowns last
 * makes a new step visible immediately, at the bottom, where it is obvious.
 */
export function rankBy(list) {
  const index = new Map(list.map((v, i) => [v, i]));
  return (a, b) => {
    const ia = index.has(a) ? index.get(a) : Number.MAX_SAFE_INTEGER;
    const ib = index.has(b) ? index.get(b) : Number.MAX_SAFE_INTEGER;
    return ia === ib ? String(a).localeCompare(String(b)) : ia - ib;
  };
}

/**
 * Like rankBy, but returns null when it does not RECOGNISE both segments,
 * instead of falling back to alphabetical.
 *
 * That distinction is the whole reason this exists. `compareColorPaths` tries
 * several vocabularies in turn against the same pair of segments, and it can
 * only move on to the next one if the current one can say "not mine". A
 * comparator that answers alphabetically for two names it has never heard of
 * is indistinguishable from one that ranked them, so the FIRST vocabulary
 * tried always won and the ladder was never consulted: Foreground/Static/Neutral
 * came out bold, contrast, faint, light — alphabetical, the exact disorder this
 * module was written to fix.
 */
export function strictRankBy(list) {
  const index = new Map(list.map((v, i) => [v, i]));
  return (a, b) => {
    if (!index.has(a) || !index.has(b)) return null;
    return index.get(a) - index.get(b);
  };
}

const byLadder = rankBy(LADDER);
const byState = rankBy(STATES);
const byRole = rankBy(ROLES);
const byTier = rankBy(TIERS);
const byGroup = rankBy(GROUPS);

// Strict variants, for the multi-vocabulary walk in compareColorPaths.
const strictRole = strictRankBy(ROLES);
const strictLadder = strictRankBy(LADDER);
const strictState = strictRankBy(STATES);
const strictSurface = strictRankBy(SURFACES);

/**
 * Order two colour token paths against each other. Compares tier, then group,
 * then role, then walks the remaining segments trying ladder, then state, then
 * surface — a leaf is exactly one of those, so the first list that knows the
 * segment wins.
 */
export function compareColorPaths(a, b) {
  // a and b are path arrays already stripped of ["semantic-color", "<mode>"]
  let r = byTier(a[0], b[0]);
  if (r) return r;
  r = byGroup(a[1], b[1]);
  if (r) return r;

  for (let i = 2; i < Math.max(a.length, b.length); i++) {
    const sa = a[i], sb = b[i];
    if (sa === undefined) return -1;
    if (sb === undefined) return 1;
    if (sa === sb) continue;
    // Try each vocabulary in turn. Each returns null for a pair it does not
    // recognise, so the walk can fall through to the next one; only when NO
    // vocabulary knows the pair does it settle alphabetically. Using the
    // non-strict comparators here is what broke the ladder before: they answer
    // alphabetically for unknown names, so the first one tried always won.
    for (const cmp of [strictRole, strictLadder, strictState, strictSurface]) {
      const known = cmp(sa, sb);
      if (known !== null && known !== 0) return known;
    }
    return sa.localeCompare(sb);
  }
  return 0;
}

export const compareLadder = byLadder;
export const compareState = byState;
export const compareRole = byRole;
