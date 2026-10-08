/**
 * Mini Chart: the sparkline.
 *
 * ITS OWN PAGE, because a chart that only appears inside a KPI Tile page
 * cannot be found, driven or composed with. Figma `_Chart mini`
 * 40009415:27919 is a component in its own right and is nested by the KPI
 * Tiles set, the Widget set and the KPI Number & Trend block.
 */
import React from "react";
import {
  MiniChart, SAMPLE_SERIES, SAMPLE_MARKERS, SAMPLE_LAYERS,
  SMOOTH_TYPES, curveFor, T, L,
} from "../../../../components/kpi-tile/mini-chart.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const page = (children, dir = "column") => (
  <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: dir,
    gap: U("gap-relaxed"), alignItems: dir === "row" ? "flex-start" : "stretch",
    background: "var(--semantic-color-fill-surface-elevated)" }}>{children}</div>
);
const caption = (text) => (
  <code style={{ display: "block", marginBottom: U("gap-xxtight"),
    fontSize: "var(--semantic-type-font-size-xs)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{text}</code>
);
const TYPES = Object.keys(SAMPLE_SERIES);

export default {
  title: "Library/Mini Chart",
  component: MiniChart,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "The sparkline, at Figma's 112x56. The twelve shapes are the REAL Figma " +
      "vectors: each series is that variant's Chart.Line path, flattened and " +
      "sampled at 40 x positions. The line is 2px with round caps, the area " +
      "under it is the same colour at 0.10 faded downward, and the marker is a " +
      "19px ring at 0.20 with an 11px Fill/Surface/Elevated dot at full " +
      "opacity. CURVE IS PART OF THE SHAPE and does not follow the family " +
      "name: Realistic 01 is a bezier while Realistic 02 and 03 are polylines." } },
  },
  argTypes: {
    shape: { name: "Figma shape", control: "select", options: [...TYPES, "layers"],
      description: "Which of the twelve `_Chart mini` Types to plot. `layers` is "
        + "a different drawing: two filled areas, no line, no marker." },
    direction: { name: "Direction (the arrow)", control: "inline-radio", options: ["up", "down", "flat"] },
    favourable: { name: "Favourable (the colour)", control: "inline-radio", options: [true, false, undefined] },
    markers: { name: "Marker(s)", control: "boolean" },
    area: { name: "Background area", control: "boolean" },
    width: { name: "Box width", control: { type: "range", min: 60, max: 560, step: 4 } },
    height: { name: "Box height", control: { type: "range", min: 28, max: 220, step: 4 } },
  },
};

/** Drive every prop, and resize the box, which is what a sparkline has to survive. */
export const Playground = {
  args: { shape: "realistic-01", direction: "up", markers: true, area: true,
    width: 112, height: 56 },
  render: (a) => page(
    <>
      {caption(`${a.shape} · ${a.shape === "layers" ? "two filled areas" : curveFor(a.shape)} · ${a.width}x${a.height}`)}
      <div style={{ width: a.width, height: a.height }}>
        {a.shape === "layers"
          ? <MiniChart layers={SAMPLE_LAYERS} direction={a.direction} favourable={a.favourable} />
          : <MiniChart series={SAMPLE_SERIES[a.shape]} direction={a.direction}
              favourable={a.favourable} curve={curveFor(a.shape)}
              markerIndex={SAMPLE_MARKERS[a.shape]} markers={a.markers} area={a.area} />}
      </div>
    </>
  ),
};

/** The smallest unit on its own, with the parts named. */
export const ElementExplorer = {
  name: "Element explorer",
  render: () => page(
    <>
      {[
        ["line only", { markers: false, area: false }],
        ["line and area", { markers: false, area: true }],
        ["line, area and marker", { markers: true, area: true }],
        ["marker on the LAST point, the default", { markers: true, area: true, markerIndex: undefined }],
        ["marker where Figma puts it, 66% along", { markers: true, area: true, markerIndex: 26 }],
        ["two markers, which Straight carries", { markers: true, area: true, markerIndex: [11, 28] }],
      ].map(([label, props]) => (
        <div key={label}>
          {caption(label)}
          <div style={{ width: 112, height: 56 }}>
            <MiniChart series={SAMPLE_SERIES["realistic-01"]} direction="up"
              curve="smooth" {...props} />
          </div>
        </div>
      ))}
    </>
  ),
  parameters: { docs: { description: { story:
    "Three parts: a 2px round-capped line, an area under it at 0.10 fading " +
    "down, and a marker made of a 19px ring and an 11px dot. `markers` and " +
    "`area` are Figma's own booleans. THE MARKER IS NOT AT THE END in the " +
    "design: it sits between 50% and 82% of the width with the line carrying " +
    "on past it, and `SAMPLE_MARKERS` holds the real index per shape." } } },
};

/** Direction and sentiment are separate, which is the whole point. */
export const StateMatrix = {
  name: "State matrix",
  render: () => page(
    <div style={{ display: "grid", gridTemplateColumns: "auto repeat(3, 1fr)",
      gap: U("gap-base"), alignItems: "center" }}>
      <span />
      {["up", "down", "flat"].map((d) => (
        <code key={d} style={{ fontSize: "var(--semantic-type-font-size-xxs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
          direction={d}
        </code>
      ))}
      {[["favourable undefined, so up-is-good", undefined],
        ["favourable true", true],
        ["favourable false", false]].map(([label, fav]) => (
        <React.Fragment key={label}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
            color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{label}</code>
          {["up", "down", "flat"].map((d) => (
            <div key={d} style={{ width: 112, height: 56 }}>
              <MiniChart series={SAMPLE_SERIES["wavy-01"]} direction={d} favourable={fav}
                curve="smooth" markerIndex={SAMPLE_MARKERS["wavy-01"]} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story:
    "The ARROW follows direction and the COLOUR follows whether the move is " +
    "favourable. Collapsing them into one prop paints rising costs green. " +
    "`flat` takes the neutral stroke." } } },
};

/** All twelve shapes, both trends. */
export const Shapes = {
  name: "All twelve Figma shapes",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: U("gap-base"),
      background: "var(--semantic-color-fill-surface-elevated)" }}>
      {TYPES.map((k) => (
        <div key={k}>
          {caption(`${k} · ${curveFor(k)} · marker ${SAMPLE_MARKERS[k].join(", ") || "none"}`)}
          <div style={{ display: "flex", gap: U("gap-base") }}>
            {["up", "down"].map((d) => (
              <div key={d} style={{ width: 112, height: 56 }}>
                <MiniChart series={SAMPLE_SERIES[k]} direction={d} curve={curveFor(k)}
                  markerIndex={SAMPLE_MARKERS[k]} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div>
        {caption("layers · two filled areas · no line, no marker")}
        <div style={{ display: "flex", gap: U("gap-base") }}>
          {["up", "down"].map((d) => (
            <div key={d} style={{ width: 128, height: 56 }}>
              <MiniChart layers={SAMPLE_LAYERS} direction={d} />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

/** The sizes the real components ask for. */
export const InContext = {
  name: "The sizes its consumers use",
  render: () => page(
    <>
      {[
        ["112x56", 112, 56, "KPI Tile Chart 01, and the Widget's Glance"],
        ["128x56", 128, 56, "KPI Tile Chart 02, Layers"],
        ["100x52", 100, 52, "KPI Tile Chart 03, Layers"],
        ["308x56", 308, 56, "KPI Tile Chart 04, inside its inner card"],
        ["84x108", 84, 108, "the Widget's Glance, which stretches it TALL"],
      ].map(([label, w, h, who]) => (
        <div key={label}>
          {caption(`${label} · ${who}`)}
          <div style={{ width: w, height: h,
            outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)" }}>
            <MiniChart series={SAMPLE_SERIES["realistic-01"]} direction="up"
              curve="smooth" markerIndex={SAMPLE_MARKERS["realistic-01"]} />
          </div>
        </div>
      ))}
    </>
  ),
  parameters: { docs: { description: { story:
    "It fills whatever box it is given, which is why the line uses " +
    "preserveAspectRatio none and a NON-SCALING stroke: the stroke stays 2px " +
    "at any size rather than fattening with the box. The marker is an HTML " +
    "element positioned by percentage and sized in pixels, so it stays a " +
    "circle; a <circle> inside that viewBox comes out an ellipse, which is " +
    "what the first version of this component shipped." } } },
};

export const TokensColour = {
  name: "Tokens: colour",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Line and area",
        note: "The line and the area are the SAME token: the area is that colour at "
            + "0.10, masked by a vertical fade. The ring is the same again at 0.20.",
        rows: [
          ["--semantic-color-stroke-static-positive-strong", "Line, area and marker when the move is favourable"],
          ["--semantic-color-stroke-static-negative-strong", "The same when it is not"],
          ["--semantic-color-stroke-static-neutral-base", "direction=flat"],
          ["--semantic-color-fill-surface-elevated", "The marker's 11px dot"],
        ] },
    ]} />
  ),
};
