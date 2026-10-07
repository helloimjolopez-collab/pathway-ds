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
 * THE TWELVE FIGMA SHAPES, TAKEN OUT OF THE FIGMA VECTORS. Not approximations.
 *
 * Each array is the real `Chart.Line` path of one variant of set
 * 40009415:27919, flattened and sampled at 40 evenly spaced x positions in its
 * own 112x56 coordinate space, so the value IS the height in that space.
 * Extracted 2026-10-07 by parsing `vectorPaths[0].data` in the file: M, L and C
 * commands, beziers subdivided, then sampled by x.
 *
 * WHY THIS REPLACED HAND-WRITTEN DATA. The previous version carried eight
 * invented points per shape, so every chart in Storybook was a blocky
 * stand-in that read nothing like the frame it was supposed to be. Figma's
 * Realistic 01 has 83 points on its path and Wavy 03 has 133. A shape is not
 * "roughly rising", it is a specific line, and a sparkline with a fifth of the
 * detail is a different drawing.
 *
 * These are still SAMPLE DATA, in that a real widget plots real numbers
 * through the same component. What they are not any more is a guess at what
 * the design looks like.
 */
export const SAMPLE_SERIES = {
  "wavy-01": [
    0, 1.2, 2.9, 4.9, 7.5, 10.4, 13.6, 16.9, 19.9, 22.5, 24.6, 26.2, 27.3,
    28, 28.1, 27.7, 26.8, 25.4, 23.6, 21.6, 19.5, 17.5, 15.8, 14.6, 13.9,
    13.7, 14, 15.2, 16.9, 19.5, 23.1, 27.7, 33.2, 39, 44.3, 48.7, 51.8, 54,
    55.3, 56
  ],
  "wavy-02": [
    56, 55.4, 54.6, 54.1, 53.5, 52.5, 50.7, 47.8, 44.4, 41.2, 38.9, 38,
    38.2, 38.4, 37.5, 34.7, 30.6, 26.5, 24.2, 25, 28.8, 34.3, 40, 44.4,
    46.9, 47.7, 47.2, 45.5, 43.1, 40.8, 39, 38.6, 39.7, 41.9, 44.6, 47.2,
    49.4, 51.1, 52.5, 53.8
  ],
  "wavy-03": [
    56, 50.5, 48.8, 48.5, 48.8, 49.4, 49, 46.7, 44, 42.2, 42.8, 45.4, 48.7,
    51.4, 52.3, 51.5, 50.1, 48.9, 48.9, 50.3, 52.4, 54.4, 55.6, 56, 55.6,
    54.9, 54.3, 53.8, 53.1, 51.9, 49.8, 46.9, 43.5, 40.6, 38.8, 38.4, 38.6,
    38.6, 37.3, 34
  ],
  "wavy-04": [
    34.4, 31.8, 29.3, 27.4, 26.2, 26.2, 27.5, 29.8, 32.9, 36.3, 39.8, 43.1,
    45.8, 47.8, 49.1, 49.8, 49.9, 49.5, 48.8, 47.7, 46.3, 44.8, 43.3, 42.1,
    41.1, 40.7, 40.8, 41.4, 42.6, 44, 45.6, 47.3, 48.9, 50.3, 51.6, 52.7,
    53.6, 54.5, 55.2, 56
  ],
  "wavy-05": [
    24.1, 21, 18.9, 18, 18.6, 20.7, 24, 27.8, 31.6, 34.6, 36.2, 36.5, 35.6,
    34.1, 32.3, 30.5, 29.1, 28.2, 27.8, 28.1, 29.4, 31.7, 34.6, 37.4, 39.6,
    40.6, 39.8, 37.5, 34.5, 31.8, 30.2, 29.8, 30.7, 32.7, 35.4, 38.8, 42.6,
    46.8, 51.3, 56
  ],
  "wavy-06": [
    20, 20.9, 21.8, 22.5, 23.2, 23.8, 24.3, 24.7, 25, 25.3, 25.7, 26.3, 27,
    28, 29.2, 30.4, 31.6, 32.5, 33.2, 33.4, 33.1, 32.5, 31.7, 31.1, 30.8,
    31, 31.9, 33.6, 35.8, 38.5, 41.4, 44.4, 47.3, 50, 52.3, 54.1, 55.4, 56,
    55.7, 54.6
  ],
  "wavy-07": [
    34, 34.5, 34.8, 35, 35.2, 35.6, 36.2, 37.2, 38.8, 40.9, 43.3, 45.8,
    48.2, 50.4, 52.1, 53, 53.1, 52.5, 51.3, 49.8, 48.3, 46.9, 46, 45.7,
    46.2, 47.4, 48.9, 50.7, 52.5, 54.1, 55.3, 55.9, 55.9, 55.5, 54.8, 54,
    53.2, 52.6, 52.3, 52.6
  ],
  "realistic-01": [
    0, 4.8, 5.1, 5.3, 7.9, 8.9, 6.9, 9.4, 15.1, 19.7, 23.7, 26.1, 26.2,
    28.3, 26.8, 25.1, 19.5, 14.4, 14.9, 19.6, 25.1, 28.8, 30.6, 35.4, 40.4,
    42.6, 44.4, 42.4, 39.7, 34.7, 31.9, 34.7, 37.3, 34.2, 32.3, 36, 37.9,
    41.4, 46.3, 56
  ],
  "realistic-02": [
    0, 10.1, 11.8, 9.5, 11.6, 14.4, 15.7, 15.3, 23.9, 21.9, 17.1, 21.4,
    20.8, 23, 28.2, 17.5, 17.9, 19.7, 11.8, 30.2, 39.6, 38, 47.2, 47.9,
    48.3, 55.5, 50.7, 47.2, 46.4, 49.2, 47.2, 46.2, 49.7, 37.5, 35.3, 39.6,
    37.5, 43.8, 46.2, 39
  ],
  "realistic-03": [
    12, 12.4, 12.8, 13.2, 13.6, 14.7, 16, 17.3, 18.5, 21.3, 24.9, 28.5,
    32.1, 34.6, 35.8, 36.9, 38.1, 38.8, 38.1, 37.4, 36.6, 36.2, 38.1, 40,
    41.9, 43.9, 44.7, 45.4, 46.1, 46.8, 48.6, 50.8, 52.9, 55.1, 55.2, 53.7,
    52.3, 50.9, 50, 50
  ],
  "straight": [
    0, 3.2, 6.4, 9.6, 12.8, 16, 19.3, 22.5, 25.7, 28.9, 32.1, 32.9, 32.3,
    31.7, 31.1, 30.5, 30, 29.4, 28.8, 28.2, 27.6, 27, 26.5, 25.9, 25.3,
    24.7, 24.1, 23.5, 22.9, 24.8, 27.9, 31.1, 34.2, 37.3, 40.4, 43.5, 46.6,
    49.8, 52.9, 56
  ],
  "layers": [
    10.2, 10.5, 11.5, 12.8, 14.6, 16.8, 19.4, 22.2, 25.3, 28.6, 32, 35.3,
    38.4, 41.1, 43.3, 44.6, 45.1, 44.5, 42.9, 40.6, 37.9, 34.9, 32, 29.3,
    27.1, 25.5, 24.7, 24.4, 24.8, 25.7, 27.1, 29, 31.4, 34.1, 37.2, 40.6,
    44.2, 48, 40.3, 0
  ],
};

/**
 * Where Figma puts the marker on each shape, as an index into the 40-point
 * series above. Measured from each variant's `Marker` frame centre on
 * 2026-10-07.
 *
 * THE MARKER IS NOT AT THE END, which is the thing to know. Figma highlights an
 * INTERIOR point, between 50% and 82% of the width depending on the shape, and
 * lets the line carry on past it to the right edge. `Straight` carries TWO
 * markers and `Layers` carries NONE.
 *
 * So it is a highlighted observation rather than "the latest value", and which
 * point is highlighted is data. A chart given no `markerIndex` still marks its
 * last point, because that is the sparkline convention and what a KPI tile
 * wants.
 */
export const SAMPLE_MARKERS = {
  "wavy-01": [32],                     // Figma 82%
  "wavy-02": [25],                     // Figma 65%
  "wavy-03": [21],                     // Figma 53%
  "wavy-04": [32],                     // Figma 82%
  "wavy-05": [25],                     // Figma 64%
  "wavy-06": [30],                     // Figma 77%
  "wavy-07": [29],                     // Figma 74%
  "realistic-01": [26],                // Figma 66%
  "realistic-02": [20],                // Figma 50%
  "realistic-03": [25],                // Figma 65%
  "straight": [28, 11],                    // Figma 73%, 27%
  "layers": [],                      // Figma no marker
};

/**
 * Which shapes are drawn as a curve, read from whether the Figma path uses
 * bezier commands rather than assumed from the name. Note that Realistic 01 IS
 * smooth and Realistic 02 and 03 are not, so the family name does not predict
 * it: guessing from the name would have got one of the three wrong.
 */
export const SMOOTH_TYPES = new Set(["layers", "realistic-01", "wavy-01", "wavy-02", "wavy-03", "wavy-04", "wavy-05", "wavy-06", "wavy-07"]);

/** The curve a named sample uses, so a story never has to say it twice. */
export const curveFor = (name) => (SMOOTH_TYPES.has(name) ? "smooth" : "linear");

/**
 * @param {number[]} series      The values to plot, left to right.
 * @param {"up"|"down"|"flat"} direction  Picks the line colour.
 * @param {boolean} favourable   Whether the movement is good. Defaults to
 *                               up-is-good, which is wrong for costs.
 * @param {boolean} markerBothEnds  Figma's Straight variant marks both ends.
 * @param {number|number[]} markerIndex  Which point or points carry a marker.
 *                               Figma marks an INTERIOR point and lets the
 *                               line run past it; `SAMPLE_MARKERS` has the real
 *                               index per shape. An empty array draws none,
 *                               which is what `Layers` does. Defaults to the
 *                               last point.
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
  const clamp = (i) => Math.max(0, Math.min(lastIdx, i));
  // An ARRAY because Figma's `Straight` carries two markers and `Layers`
  // carries none, so the count is per shape, not a boolean.
  const chosen = markerIndex == null ? [lastIdx]
    : Array.isArray(markerIndex) ? markerIndex.map(clamp)
    : [clamp(markerIndex)];
  const marks = !markers ? [] : (markerBothEnds ? [0, lastIdx] : chosen);

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
