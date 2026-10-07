import React from "react";

/**
 * spinner.jsx: the React module Spinner never had, with NewCo's ring loader.
 *
 * WHY THIS EXISTS
 * Spinner shipped as HTML/SVG/CSS only; the manifest said a .jsx wrapper was on
 * the backlog. Jo asked for NewCo's spinner and loading states to be brought
 * into the repo, and NewCo's loader is a RING, not the sunburst Amplify has. So
 * both live here as variants rather than as two components: a caller picks the
 * shape, and everything else about the contract is shared.
 *
 * WHERE THE NEWCO DESIGN CAME FROM
 * The NewCo and Spired design concept. It is NOT in the newco-ds repo (checked
 * local and origin, no spinner, skeleton or shimmer at any depth and no commit
 * mentioning them), so the geometry and timings are transcribed from the
 * concept: three arcs at 0.32, 0.19 and 0.09 of the circumference, offset 0,
 * 0.4 and 0.68, turning at 1.4s linear. It reads as the mark's DNA, one long,
 * one medium and one short pill, arranged in a ring.
 *
 * WHAT CHANGED COMING ACROSS, AND WHY IT IS BETTER
 * The concept painted its three arcs with hardcoded NewCo purples: three rungs of a `purple` primitive ramp that
 * Pathway does not have at all (and #6E64BE is in fact NewCo's own Brand/400).
 * Here the arcs are currentColor at
 * three stroke opacities, so the ring inherits whatever the tone and emphasis
 * resolve to. That means it renders Amplify blue under Amplify and NewCo purple
 * under NewCo with no branching, and it also answers every tone the sunburst
 * does, which the hardcoded version could not.
 */

/** The tones Spinner answers to. Mirrors spinner.html. */
export const TONES = [
  "neutral", "brand", "info", "warning", "danger", "negative", "positive",
  "accent-amethyst", "accent-jade", "accent-seabreeze",
];
export const EMPHASES = ["light", "subtle", "base", "contrast", "bold"];

const c = (n) => `var(--semantic-color-${n})`;

/**
 * tone + emphasis -> the ONE colour token the spinner takes.
 *
 * Only `neutral` has a real emphasis ramp. Every other tone resolves to a
 * single token at all five emphases, and that is deliberate rather than
 * unfinished: those families have no foreground ladder to ramp through. The
 * prop is still accepted so a caller can pass emphasis uniformly without
 * special-casing neutral.
 */
const TONE = {
  neutral: {
    light: c("foreground-static-neutral-faint"),
    subtle: c("foreground-static-neutral-base"),
    base: c("foreground-static-neutral-base"),
    contrast: c("foreground-static-neutral-strong"),
    bold: c("foreground-static-neutral-bold"),
  },
  brand: c("foreground-action-primary-on-subtle-rest"),
  info: c("foreground-static-info-on-subtle"),
  warning: c("foreground-static-attention-on-subtle"),
  danger: c("foreground-static-negative-on-subtle"),
  negative: c("foreground-static-negative-on-subtle"),
  positive: c("foreground-static-positive-on-subtle"),
  "accent-amethyst": c("foreground-static-info-on-subtle"),
  "accent-jade": c("foreground-static-accent-jade-on-subtle"),
  "accent-seabreeze": c("foreground-static-accent-seabreeze-on-subtle"),
};

function colourFor(tone, emphasis) {
  const entry = TONE[tone] ?? TONE.neutral;
  if (typeof entry === "string") return entry;
  return entry[emphasis] ?? entry.base;
}

/**
 * Amplify's sunburst. Eight spokes on a 12x12 viewBox with an opacity ladder
 * from 1.00 down to 0.12, which breaks the 8-fold rotational symmetry so that
 * rotating the whole SVG reads as a head with a fading trail.
 */
const SUNBURST = [
  { d: "M6 1V3", opacity: 1.0 },
  { d: "M8.1 3.9L9.55 2.45", opacity: 0.87 },
  { d: "M9 6H11", opacity: 0.75 },
  { d: "M8.1 8.1L9.55 9.55", opacity: 0.62 },
  { d: "M6 9V11", opacity: 0.5 },
  { d: "M2.45 9.55L3.9 8.1", opacity: 0.37 },
  { d: "M1 6H3", opacity: 0.25 },
  { d: "M2.45 2.45L3.9 3.9", opacity: 0.12 },
];

/** NewCo's ring: one long, one medium, one short arc. */
const RING = [
  { frac: 0.32, off: 0.0, opacity: 1 },
  { frac: 0.19, off: 0.4, opacity: 0.7 },
  { frac: 0.09, off: 0.68, opacity: 0.45 },
];

/**
 * @param {"ring"|"sunburst"} variant  ring is NewCo's, sunburst is Amplify's
 * @param {number|string} size         px number or any CSS length; default 1em
 * @param {string} tone                one of TONES
 * @param {string} emphasis            one of EMPHASES; only neutral ramps
 * @param {string} label               announced by screen readers
 */
export function Spinner({
  variant = "ring",
  size,
  tone = "neutral",
  emphasis = "base",
  label = "Loading",
  className,
  style,
}) {
  // Invalid values are surfaced loudly rather than rendering as `color: unset`,
  // which is invisible and would look like the spinner simply failed to paint.
  if (!TONES.includes(tone)) {
    console.error(`[Spinner] Invalid tone "${tone}". Allowed: ${TONES.join(", ")}`);
  }
  if (!EMPHASES.includes(emphasis)) {
    console.error(`[Spinner] Invalid emphasis "${emphasis}". Allowed: ${EMPHASES.join(", ")}`);
  }

  const box = size == null ? "1em" : typeof size === "number" ? `${size}px` : size;
  const common = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: box, height: box, flexShrink: 0,
    color: colourFor(tone, emphasis),
  };

  // 24 units of viewBox for the ring so the stroke maths stay whole numbers.
  const V = 24, STROKE = 2.5;
  const r = (V - STROKE) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={className}
      data-tone={tone}
      data-emphasis={emphasis}
      data-variant={variant}
      style={{ ...common, ...style }}
    >
      {variant === "sunburst" ? (
        <svg
          viewBox="0 0 12 12" width="100%" height="100%" aria-hidden="true" focusable="false"
          style={{ animation: "pw-spin var(--motion-duration-loop) var(--motion-easing-linear) infinite" }}
        >
          {SUNBURST.map((s, i) => (
            <path key={i} d={s.d} opacity={s.opacity} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ))}
        </svg>
      ) : (
        <svg
          viewBox={`0 0 ${V} ${V}`} width="100%" height="100%" fill="none" aria-hidden="true" focusable="false"
          // 1.4s linear, from the concept. Linear is correct for a continuous
          // loop: any eased curve makes a constant rotation appear to stutter
          // once per revolution. motion.css reserves easing-linear for exactly
          // this and says so.
          style={{ animation: "pw-spin 1400ms var(--motion-easing-linear) infinite" }}
        >
          {RING.map((s, i) => (
            <circle
              key={i}
              cx={V / 2} cy={V / 2} r={r}
              stroke="currentColor" strokeOpacity={s.opacity}
              strokeWidth={STROKE} strokeLinecap="round"
              strokeDasharray={`${s.frac * circ} ${circ}`}
              strokeDashoffset={-s.off * circ}
            />
          ))}
        </svg>
      )}
      <span
        style={{
          position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
          overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
        }}
      >
        {label}
      </span>
    </span>
  );
}

/**
 * The keyframes both variants need, plus the reduced-motion opt-out.
 *
 * Returned as a component rather than injected on import, because a module with
 * an import side effect cannot be tree-shaken and would push CSS into any
 * bundle that merely referenced the file. Mount it once per document.
 */
export function SpinnerKeyframes() {
  return (
    <style>{`
      @keyframes pw-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        [role="status"][data-variant] svg { animation: none !important; }
      }
    `}</style>
  );
}

export default Spinner;
