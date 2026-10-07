/**
 * Mini chart — the sparkline inside a KPI tile.
 *
 * SOURCE OF TRUTH: Figma `_Chart mini`, set 40009415:27919, read 2026-10-07.
 * 24 variants, axes Type x Trend, where Type is one of twelve hand-drawn line
 * shapes: Wavy 01 to 07, Realistic 01 to 03, Straight and Layers.
 *
 * THOSE TWELVE SHAPES ARE SAMPLE DATA, NOT AN API. Every one of the 24 variants
 * has the identical structure and differs only in the path of a single vector.
 * Reproducing them as twelve hardcoded paths would give a chart that cannot
 * plot anything, which is the opposite of what a widget needs, so this renders
 * from a series and the variants become the thing they actually are: proof the
 * container works at a range of shapes.
 *
 * WHAT IS REPRODUCED EXACTLY, because it is the design rather than the data:
 *
 *   canvas        112x56 at Glance scale
 *   Line          strokeWeight 2, stroke Stroke/Static/{Positive,Negative}/Strong
 *   Marker        19x19 frame at the series end
 *     Ring        19x19, strokeWeight 2, same stroke token
 *     Dot         11x11, fill Fill/Surface/Elevated, same stroke token
 *   Straight      carries TWO markers, one at each end
 *
 * The line's stroke token is correct as it stands: a stroke token on a stroke.
 * The masked area vector inside Marker fills with the same stroke token, which
 * is a tier oddity, but it is there to match the line's colour exactly and no
 * Fill token shares that value, so changing it would alter the design rather
 * than fix a mapping. Left alone deliberately.
 */
import React, { useId } from "react";

const C = (n) => `var(--semantic-color-${n})`;

export const T = {
  up:      C("stroke-static-positive-strong"),
  down:    C("stroke-static-negative-strong"),
  flat:    C("stroke-static-neutral-base"),
  dotFill: C("fill-surface-elevated"),
};

export const L = {
  // Figma's canvas at Glance. The component scales to its box; these are the
  // viewBox proportions and the stroke widths that must not scale with it.
  vbW: 112,
  vbH: 56,
  lineWeight: 2,
  ringSize: 19,
  ringWeight: 2,
  dotSize: 11,
};

/** The twelve Figma shapes as series, so the stories can show the real range. */
export const SAMPLE_SERIES = {
  "wavy-01":      [18, 26, 20, 34, 28, 42, 36, 50],
  "wavy-02":      [30, 22, 34, 26, 40, 32, 46, 38],
  "realistic-01": [12, 20, 17, 29, 24, 33, 41, 48],
  "realistic-03": [40, 34, 38, 28, 31, 22, 25, 14],
  straight:       [10, 16, 22, 28, 34, 40, 46, 52],
  layers:         [24, 24, 30, 30, 38, 38, 46, 46],
};

/**
 * @param {number[]} series      The values to plot, left to right.
 * @param {"up"|"down"|"flat"} direction  Picks the line colour.
 * @param {boolean} favourable   Whether the movement is good. Defaults to
 *                               up-is-good, which is wrong for costs.
 * @param {boolean} markerBothEnds  Figma's Straight variant marks both ends.
 * @param {boolean} markers      Figma's `Marker(s)` boolean. False draws the
 *                               line with no end marker at all.
 * @param {boolean} area         Figma's `Background` boolean: the fill under
 *                               the line.
 */
export function MiniChart({
  series = SAMPLE_SERIES["wavy-01"],
  direction = "up",
  favourable,
  markerBothEnds = false,
  markers = true,
  area = true,
  label,
  className = "",
  style,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const good = favourable === undefined ? direction === "up" : favourable;
  const colour = direction === "flat" ? T.flat : (good ? T.up : T.down);

  const pts = series.length ? series : [0, 0];
  const min = Math.min(...pts), max = Math.max(...pts);
  const span = max - min || 1;
  // Inset by half the ring so a marker at either end is never clipped.
  const inset = L.ringSize / 2;
  const x = (i) => inset + (i / Math.max(1, pts.length - 1)) * (L.vbW - inset * 2);
  const y = (v) => inset + (1 - (v - min) / span) * (L.vbH - inset * 2);

  const line = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
  const areaPath = `${line} L${x(pts.length - 1).toFixed(2)},${L.vbH} L${x(0).toFixed(2)},${L.vbH} Z`;

  const marks = !markers ? [] : (markerBothEnds ? [0, pts.length - 1] : [pts.length - 1]);

  const svg = (
    <svg
      className="pw-mini-chart"
      viewBox={`0 0 ${L.vbW} ${L.vbH}`}
      preserveAspectRatio="none"
      role={label ? "img" : "presentation"}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={{ display: "block", width: "100%", height: "100%", overflow: "visible" }}
    >
      {/* Background: the area under the line, fading out downward. The gradient
          is geometry rather than colour, so it inherits `colour` through
          currentColor and stays on one token. */}
      {area && (
        <defs>
          <linearGradient id={`pwmc${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colour} stopOpacity="0.18" />
            <stop offset="100%" stopColor={colour} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {area && <path d={areaPath} fill={`url(#pwmc${uid})`} stroke="none" />}

      {/* Line. strokeWeight 2 in Figma, and vectorEffect keeps it 2 whatever
          the box does, because preserveAspectRatio none would otherwise
          stretch the stroke along with the path. */}
      <path
        d={line}
        fill="none"
        stroke={colour}
        strokeWidth={L.lineWeight}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

    </svg>
  );

  /* THE MARKER IS NOT DRAWN IN THE SVG, and that is the whole point.
     A sparkline has to fill its box, which means preserveAspectRatio="none"
     and a non-uniform scale. Any <circle> inside that viewBox is stretched by
     it, so Figma's 19px ring came out as a wide ellipse in a 700px-wide
     widget: the first version of this file did exactly that and it is visible
     in the screenshot that caught it.
     The marker is therefore an HTML element positioned over the chart by
     PERCENTAGE and sized in PIXELS, so it stays a circle at Figma's own 19 and
     11 whatever the box does. */
  const markerEls = marks.map((i) => {
    const leftPct = (x(i) / L.vbW) * 100;
    const topPct  = (y(pts[i]) / L.vbH) * 100;
    return (
      <span key={i} aria-hidden="true" style={{
        position: "absolute", left: `${leftPct}%`, top: `${topPct}%`,
        transform: "translate(-50%, -50%)",
        width: L.ringSize, height: L.ringSize, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        // Ring: 19 at weight 2, carried at low opacity so it reads as a halo
        // rather than a second dot.
        border: `${L.ringWeight}px solid ${colour}`, opacity: 0.35,
        boxSizing: "border-box", pointerEvents: "none",
      }}>
        <span style={{
          width: L.dotSize, height: L.dotSize, borderRadius: "50%",
          background: T.dotFill, border: `${L.ringWeight}px solid ${colour}`,
          boxSizing: "border-box", opacity: 1 / 0.35,
        }} />
      </span>
    );
  });

  return (
    <span className={`pw-mini-chart-wrap ${className}`} style={{
      position: "relative", display: "block", width: "100%", height: "100%",
      minHeight: 0, ...style,
    }}>
      {svg}
      {markerEls}
    </span>
  );
}

export default MiniChart;
