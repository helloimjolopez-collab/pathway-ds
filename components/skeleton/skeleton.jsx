import React from "react";

/**
 * skeleton.jsx — NewCo's loading placeholder, brought across token-pure.
 *
 * A skeleton stands in for content that has not arrived: a block the shape of
 * the thing it replaces, with a light travelling across it so the wait reads as
 * progress rather than as a broken layout.
 *
 * WHERE THE DESIGN CAME FROM
 * The NewCo and Spired design concept. It is NOT in the newco-ds repo, which
 * has no skeleton, shimmer or spinner at any depth and no commit mentioning
 * them, so the geometry and timings are transcribed from the concept:
 *
 *   a 45deg band sweeping bottom-left to top-right, 3.8s, easing-breath,
 *   with a -1.6s delay so a freshly mounted skeleton is already mid-sweep
 *   instead of starting dark.
 *
 * The 45deg ORIENTATION matters and is not decorative. The band is
 * perpendicular to its own travel, so it reads as a diagonal sweep rising,
 * which is the brand's ascent motion. A vertical band travelling sideways is
 * the generic shimmer every library ships and is not this.
 *
 * WHAT CHANGED COMING ACROSS
 * The concept hardcoded its colours: a `warm` primitive ramp rung for the base,
 * which Pathway does not have at all, and two literal rgba() stops, a lavender
 * rgba(150,145,245,0.22) and a warm grey rgba(148,144,138,0.14). Here the base
 * is a semantic fill and the band is color-mix over tokens, so the sweep picks
 * up the brand tint in whichever brand is active and inverts correctly in
 * Midnight. Nothing is hardcoded, so nothing has to be maintained twice.
 */

const SHEEN = "var(--semantic-color-foreground-static-brand-on-subtle)";
const HAZE = "var(--semantic-color-foreground-static-neutral-subtle)";

/**
 * One skeleton block.
 *
 * @param {number|string} width   defaults to 100%
 * @param {number|string} height  defaults to 12px, a text-line's worth
 * @param {number|string} radius  defaults to the base corner radius
 * @param {boolean} circle        square it off and fully round it, for avatars
 */
export function Skeleton({ width = "100%", height = 12, radius, circle = false, className, style }) {
  const len = (v) => (typeof v === "number" ? `${v}px` : v);
  const side = circle ? len(height) : len(width);
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        position: "relative",
        display: "block",
        overflow: "hidden",
        width: side,
        height: len(height),
        flexShrink: 0,
        background: "var(--semantic-color-fill-static-neutral-strong)",
        borderRadius: circle
          ? "var(--semantic-layout-units-cornerradius-full)"
          : radius != null
          ? len(radius)
          : "var(--semantic-layout-units-cornerradius-base)",
        ...style,
      }}
    >
      <span className="pw-skeleton__sheen" aria-hidden="true" />
    </span>
  );
}

/**
 * Several lines of placeholder text.
 *
 * The last line is short on purpose: real paragraphs do not end flush with the
 * measure, and a stack of equal-length bars reads as a table rather than prose.
 */
export function SkeletonText({ lines = 3, lastLineWidth = "45%", gap, className, style }) {
  return (
    <span
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: gap != null ? (typeof gap === "number" ? `${gap}px` : gap) : "var(--semantic-layout-units-gap-tight)",
        ...style,
      }}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? lastLineWidth : "100%"} />
      ))}
    </span>
  );
}

/**
 * The sweep's keyframes and the band itself.
 *
 * A component rather than an import side effect, for the same reason as
 * SpinnerKeyframes: a module that injects CSS on import cannot be tree-shaken.
 * Mount it once per document.
 *
 * `inset: -80%` is what lets a band rotated 45deg still cover the corners of
 * its box through the whole travel. Inset 0 and the corners go unlit.
 */
export function SkeletonKeyframes() {
  return (
    <style>{`
      @keyframes pw-skeleton-sheen {
        0%   { transform: translate(-42%, 42%); }
        100% { transform: translate(42%, -42%); }
      }
      .pw-skeleton__sheen {
        content: ""; position: absolute; inset: -80%;
        background: linear-gradient(
          45deg,
          transparent 40%,
          color-mix(in srgb, ${SHEEN} 22%, transparent) 47%,
          color-mix(in srgb, ${HAZE} 14%, transparent) 53%,
          transparent 60%
        );
        animation: pw-skeleton-sheen 3800ms var(--motion-easing-breath) infinite;
        animation-delay: -1600ms;
      }
      @media (prefers-reduced-motion: reduce) {
        .pw-skeleton__sheen { animation: none; }
      }
    `}</style>
  );
}

export default Skeleton;
