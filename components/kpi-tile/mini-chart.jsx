/**
 * Mini chart: the sparkline inside a KPI tile.
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
  // The halo. Figma strokes the 19px ring in the full trend colour over the
  // area gradient; at this size that reads as a halo, and a touch of
  // transparency keeps it from competing with the dot on a white card.
  // Figma: Ring opacity 0.20, Dot 1.00. Read from the node 2026-10-07.
  ringOpacity: 0.20,
  // Figma: the area vector is the trend colour at opacity 0.10, masked by a
  // vertical gradient from a1.00 at the top to a0.00 at the bottom. The first
  // version used 0.18, nearly double, which is why the wash read as a tinted
  // block where the design is barely there.
  areaOpacity: 0.10,
};

/**
 * The twelve Figma shapes as series, so the stories show the real range.
 *
 * CURVE IS PART OF THE SHAPE, not a style. Reading the vector paths on
 * 2026-10-07: `Realistic 01` is a POLYLINE, every segment an `L` command with
 * sharp corners, and `Wavy 01` and `Layers` are BEZIERS, `C` commands with
 * smooth joins. Drawing all twelve as polylines, which is what this file did,
 * makes every Wavy variant look like a Realistic one, and Wavy is what the
 * Glance widget uses.
 */
export const SAMPLE_SERIES = {
  "wavy-01":      [18, 26, 20, 34, 28, 42, 36, 50],
  "wavy-02":      [30, 22, 34, 26, 40, 32, 46, 38],
  "wavy-03":      [20, 34, 24, 40, 30, 44, 34, 48],
  "wavy-04":      [36, 28, 40, 30, 44, 34, 48, 38],
  "wavy-05":      [22, 38, 26, 30, 42, 34, 46, 52],
  "wavy-06":      [28, 20, 36, 26, 44, 32, 40, 50],
  "wavy-07":      [16, 30, 22, 38, 28, 46, 34, 52],
  "realistic-01": [12, 20, 17, 29, 24, 33, 41, 48],
  "realistic-02": [26, 18, 32, 22, 38, 28, 34, 44],
  "realistic-03": [40, 34, 38, 28, 31, 22, 25, 14],
  straight:       [10, 16, 22, 28, 34, 40, 46, 52],
  layers:         [24, 24, 30, 30, 38, 38, 46, 46],
};

/** Which Figma types are drawn as a smooth curve rather than a polyline. */
export const SMOOTH_TYPES = new Set([
  "wavy-01", "wavy-02", "wavy-03", "wavy-04", "wavy-05", "wavy-06", "wavy-07", "layers",
]);

/** The curve a named sample uses, so a story never has to say it twice. */
export const curveFor = (name) => (SMOOTH_TYPES.has(name) ? "smooth" : "linear");

/**
 * @param {number[]} series      The values to plot, left to right.
 * @param {"up"|"down"|"flat"} direction  Picks the line colour.
 * @param {boolean} favourable   Whether the movement is good. Defaults to
 *                               up-is-good, which is wrong for costs.
 * @param {boolean} markerBothEnds  Figma's Straight variant marks both ends.
 * @param {number} markerIndex   Which point carries the marker. Figma marks an
 *                               INTERIOR point and lets the line run past it.
 *                               Defaults to the last point.
 * @param {boolean} markers      Figma's `Marker(s)` boolean. False draws the
 *                               line with no end marker at all.
 * @param {boolean} area         Figma's `Background` boolean: the fill under
 *                               the line.
 * @param {"smooth"|"linear"} curve  Figma's Wavy and Layers paths are beziers
 *                               and its Realistic paths are polylines, so the
 *                               curve belongs to the shape. `curveFor(name)`
 *                               gives the right one for a named sample.
 */
export function MiniChart({
  series = SAMPLE_SERIES["wavy-01"],
  direction = "up",
  favourable,
  markerBothEnds = false,
  markerIndex,
  markers = true,
  area = true,
  curve = "linear",
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
  /**
   * THE LINE SPANS THE WHOLE BOX, edge to edge, because Figma's paths do.
   * Reading them: every variant starts `M 0 56` and ends `L 112 0`, so the
   * first point sits on the left edge at the bottom and the last on the right
   * edge at the top. This used to inset by half the ring on all four sides,
   * which left a visible gap at both ends and made the chart float inside its
   * box instead of filling it.
   *
   * The MARKER is clamped inward instead, below, so it is the one thing that
   * cannot be clipped.
   */
  const x = (i) => (i / Math.max(1, pts.length - 1)) * L.vbW;
  const y = (v) => (1 - (v - min) / span) * L.vbH;

  /**
   * A CATMULL-ROM SPLINE CONVERTED TO CUBIC BEZIERS, which is how to get
   * Figma's Wavy shapes. They are `C` commands with smooth joins, and drawing
   * them as straight `L` segments made every Wavy variant look like a
   * Realistic one. A Catmull-Rom passes THROUGH every data point, which a
   * plain bezier smoothing does not, and a chart whose line misses its own
   * values is worse than an angular one.
   */
  const smoothPath = () => {
    if (pts.length < 3) return pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
    const P = pts.map((v, i) => [x(i), y(v)]);
    let d = `M${P[0][0].toFixed(2)},${P[0][1].toFixed(2)}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i];
      const p1 = P[i];
      const p2 = P[i + 1];
      const p3 = P[i + 2] || P[i + 1];
      // 1/6 is the standard Catmull-Rom to Bezier tension.
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    return d;
  };

  const line = curve === "smooth"
    ? smoothPath()
    : pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
  const areaPath = `${line} L${x(pts.length - 1).toFixed(2)},${L.vbH} L${x(0).toFixed(2)},${L.vbH} Z`;

  /**
   * Which point carries the marker. Figma puts it at an INTERIOR point, not at
   * the end: Realistic 01's marker frame sits at x=65 of 112 and Wavy 01's at
   * x=82, with the line carrying on past it to the right edge. That is a
   * highlighted observation rather than "the latest value", and which point is
   * highlighted is data, so it is a prop.
   *
   * The default is the last point, which is the sparkline convention and what
   * a KPI tile wants: here is where we are now.
   */
  const lastIdx = pts.length - 1;
  const markIdx = markerIndex == null ? lastIdx
    : Math.max(0, Math.min(lastIdx, markerIndex));
  const marks = !markers ? [] : (markerBothEnds ? [0, lastIdx] : [markIdx]);

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
            <stop offset="0%" stopColor={colour} stopOpacity={L.areaOpacity} />
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
    /* CLAMPED INWARD BY THE RING'S RADIUS, in pixels not percent, because the
       line now runs to the edges. Without this a marker on the last point
       hangs half outside the box and is clipped by the widget's content area. */
    const leftPct = (x(i) / L.vbW) * 100;
    const topPct  = (y(pts[i]) / L.vbH) * 100;
    const r = L.ringSize / 2;
    return (
      /* TWO SIBLINGS, NOT NESTED, and that is a bug fix rather than a tidy-up.
         The halo used to be the dot's PARENT at opacity 0.35, with the dot
         trying to cancel it out with `opacity: 1 / 0.35`. Opacity does not
         work that way: a child's opacity multiplies with its parent's and
         clamps at 1, so the dot rendered at 35% too. The inner ring came out
         washed-out grey-green where Figma draws it solid, which is why the
         marker never looked like the design. */
      <React.Fragment key={i}>
        {/* Ring: 19x19 at weight 2. Figma strokes it in the full trend colour;
            it reads as a halo because of its size, not because it is faded,
            and the pale wash around it in the design is this ring over the
            area gradient. */}
        <span aria-hidden="true" style={{
          position: "absolute", left: `${leftPct}%`, top: `${topPct}%`,
          transform: `translate(calc(-50% + ${(50 - leftPct) / 50 * r}px), calc(-50% + ${(50 - topPct) / 50 * r}px))`,
          width: L.ringSize, height: L.ringSize, borderRadius: "50%",
          border: `${L.ringWeight}px solid ${colour}`, opacity: L.ringOpacity,
          boxSizing: "border-box", pointerEvents: "none",
        }} />
        {/* Dot: 11x11, Fill/Surface/Elevated with a 2px stroke in the trend
            colour, at FULL opacity. */}
        <span aria-hidden="true" style={{
          position: "absolute", left: `${leftPct}%`, top: `${topPct}%`,
          transform: `translate(calc(-50% + ${(50 - leftPct) / 50 * r}px), calc(-50% + ${(50 - topPct) / 50 * r}px))`,
          width: L.dotSize, height: L.dotSize, borderRadius: "50%",
          background: T.dotFill, border: `${L.ringWeight}px solid ${colour}`,
          boxSizing: "border-box", pointerEvents: "none",
        }} />
      </React.Fragment>
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
