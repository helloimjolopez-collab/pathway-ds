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

// The graded ladder, per docs/design-system-spec.md. Mono and Black are
// inversion ANCHORS rather than rungs — they hold their value across modes
// instead of flipping — but they still have a place on the ramp, so they are
// ordered here and marked as anchors below for the UI to annotate.
//
// STRONG IS THE LAST RUNG (2026-09-15, final pass). The ladder now reads
//
//   Faint, Subtle, Base, Bold, Strong
//
// with Neutral allowed Mono on top of that. Two things landed at once:
// the `Accent` tier was dropped, so a hue sits directly under Static
// (Fill/Static/Jade/Subtle, not Fill/Static/Accent/Jade/Faint), and every group
// shifted up one so the heaviest rung is Strong rather than Bold. Base is the
// default: the rung to reach for when nothing about the context says otherwise.
//
// How the previous rungs map, by position:
//   dim      -> subtle
//   subtle   -> base
//   medium   -> base       (only Fill/Static/Neutral had one)
//   contrast -> bold
//   bold     -> strong
//   boldest  -> strongest  (Fill/Static/Brand's sixth rung)
//
// Foreground/Static/Neutral had already been shifted in the earlier pass, so it
// carried Base before this one and needed only Bold and Strong exchanged.
//
// SIMPLIFIED 2026-09-14, completed 2026-09-15. Foreground/Static/Neutral used to run
// white, xlight, faint, subtle, light, medium, contrast, bold — eight steps, two
// of which (faint at cool-400 and light at cool-500) were close enough to be a
// coin toss, and whose NAMES disagreed with their values: `subtle` sat at
// cool-450 and `light` at cool-500, so "light" was the darker of the two.
// Foreground/Static/Neutral is now exactly six:
//
//   mono, faint, dim, subtle, contrast, bold
//
// How the old rungs resolved, by value rather than by name:
//   white   -> renamed to mono    (same value, cool-neutral-0)
//   subtle  -> renamed to dim     (same value, cool-neutral-450)
//   medium  -> renamed to subtle  (same value, cool-neutral-600)
//   light   -> deleted; cool-500 is not a rung on the new ladder
//   xlight  -> deleted; cool-200 is 2.92:1 on canvas, unusable for text
//
// On 2026-09-15 the SAME positional rename was applied to every other tone
// ladder, including both Brand ladders, and then the whole set shifted again so
// Strong ends it (see the top of this comment). These are the only
// non-conforming rungs left, and each is deliberate:
//
//   mono      Fill/Static/Neutral/Mono     Neutral is allowed the anchor
//   strongest Fill/Static/Brand/Strongest  a sixth rung past Strong, Brand only
//   light     Scrim/Light                  Scrim is an opacity ramp, not a tone one
//   xlight    nothing on main              kept for the NewCo branch, which has it
//   white     nothing                      retired 2026-09-16: the neutral fill
//                                          anchor was renamed Mono to match the
//                                          name the foreground side already used
//   black     nothing                      retired 2026-09-15, see below
//
// Brand's sixth rung was spelled Dark on Fill and Black on Stroke, which put two
// names on one ladder position. It is `Strongest` now, and the reason is worth
// keeping: that rung resolves to Brand/0 in Midnight, which is nearly WHITE, so
// "Black" was factually wrong in one of the two modes. Faint and Strong survive
// mode inversion because they describe a position on the ladder rather than a
// colour; Strongest does the same.
//
// An unknown rung falls through to alphabetical, which is the exact disorder
// this module exists to prevent, so removing a name here is only safe once
// nothing anywhere uses it.
//
// `light` before `subtle` used to be a genuine conflict: Scrim needed that
// order while Stroke/Brand needed the reverse, and Stroke/Brand was the only
// group holding both. Normalising the Brand ladders removed its `light`
// entirely, so Scrim is now the sole claimant and the order is uncontested.
//
// A NOTE ON EDITING THIS COMMENT: the list above names retired rungs on purpose.
// A bulk rename pass hit it on 2026-09-15 and rewrote "light  Fill/Static/Brand/Light"
// into "light  Fill/Static/Brand/Subtle", which is nonsense — the entry existed to say
// that Fill/Static/Brand was where `light` still lived. Prose about a retired name is
// not a reference to it.
// Retired names are kept in place rather than deleted: an unknown rung falls
// through to alphabetical, so a stale reference anywhere downstream would
// silently reorder a whole table instead of standing out.
export const LADDER = [
  "mono",
  "white",
  "xlight",
  "faint",
  "dim",
  "light",
  "subtle",
  "base",
  "medium",
  "contrast",
  "bold",
  "strong",
  "boldest",
  "strongest",
  "black",
];

export const ANCHORS = new Set(["mono", "white", "black"]);

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

// Within a tier: Action is the interactive set, Surface is the page ground,
// FocusRing is a single accessibility token. "static" is listed for the NewCo
// branch, which still carries that tier; main dropped it.
export const GROUPS = ["static", "surface", "action", "focusring", "base"];

/**
 * What can appear at segment 1, in display order.
 *
 * This list exists because segment 1 stopped being one kind of thing on
 * 2026-09-15. Negative and Positive were promoted out of /Status/ to sit beside
 * Neutral, so the same position now holds:
 *
 *   a ROLE     foreground/negative/faint
 *   a GROUP    foreground/accent/saffron/faint, fill/status/attention/faint
 *   a RUNG     scrim/faint
 *
 * Before that they were uniformly groups, so a single GROUPS comparator worked.
 * Afterwards it did not: rankBy sends anything it does not recognise to the end
 * and then sorts alphabetically, so `negative` and `neutral` were ordered by
 * spelling rather than by meaning — the precise failure the comment on
 * strictRankBy describes, reappearing one segment to the left.
 *
 * Order: the neutrals and the meaning-bearing tones a reader looks at first,
 * then brand, then the remaining tone groups, then interaction, then the page
 * ground and the single accessibility token.
 */
export const SEGMENT1 = [
  // Static was reinstated on 2026-09-15 and now holds the hue directly, so a
  // path reads fill/static/jade/subtle and the tone name has moved to segment 2
  // where ROLES already covers it.
  "static",
  "neutral",
  "negative",
  "positive",
  "info",
  "brand",
  "status",
  "accent",
  "action",
  "surface",
  "focusring",
  // Scrim's rungs sit directly at segment 1 because Scrim has no role tier.
  "faint",
  "light",
  "subtle",
  "base",
];

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
const strictSegment1 = strictRankBy(SEGMENT1);
const strictGroup = strictRankBy(GROUPS);
const strictRole = strictRankBy(ROLES);
const strictLadder = strictRankBy(LADDER);
const strictState = strictRankBy(STATES);
const strictSurface = strictRankBy(SURFACES);

/**
 * Order two colour token paths against each other. Compares tier, then walks
 * every remaining segment trying each vocabulary in turn — a segment is exactly
 * one kind of thing, so the first list that knows it wins.
 *
 * Segment 1 used to be compared separately with the non-strict GROUPS
 * comparator. That stopped being correct when Negative and Positive were
 * promoted to sit beside Neutral, because segment 1 then held roles, groups and
 * (for Scrim) ladder rungs, and a non-strict comparator answers alphabetically
 * for names it has never heard of. It is folded into the same strict walk now,
 * which is what the rest of the path already did.
 */
export function compareColorPaths(a, b) {
  // a and b are path arrays already stripped of ["semantic-color", "<mode>"]
  const r = byTier(a[0], b[0]);
  if (r) return r;

  for (let i = 1; i < Math.max(a.length, b.length); i++) {
    const sa = a[i], sb = b[i];
    if (sa === undefined) return -1;
    if (sb === undefined) return 1;
    if (sa === sb) continue;
    // Try each vocabulary in turn. Each returns null for a pair it does not
    // recognise, so the walk can fall through to the next one; only when NO
    // vocabulary knows the pair does it settle alphabetically. Using the
    // non-strict comparators here is what broke the ladder before: they answer
    // alphabetically for unknown names, so the first one tried always won.
    for (const cmp of [strictSegment1, strictGroup, strictRole, strictLadder, strictState, strictSurface]) {
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
