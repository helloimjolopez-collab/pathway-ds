import React, { useState } from "react";
import { Skeleton, SkeletonText, SkeletonKeyframes } from "../../../../components/skeleton/skeleton.jsx";
import { Spinner, SpinnerKeyframes, TONES, EMPHASES } from "../../../../components/spinner/spinner.jsx";

export default {
  title: "Library/Loading",
  parameters: {
    docs: {
      description: {
        component:
          "NewCo's loading states, brought across token-pure. The ring is three arcs of the mark's DNA " +
          "turning steadily; the skeleton sweeps a 45 degree band bottom-left to top-right, which is the " +
          "brand's ascent motion rather than the sideways shimmer every library ships. Both inherit the " +
          "active brand theme and invert in Midnight with no branching, because nothing is hardcoded: the " +
          "concept's literal purples and rgba() stops became semantic tokens and color-mix.",
      },
    },
  },
};

const CARD = {
  background: "var(--semantic-color-fill-surface-elevated)",
  border: "0.5px solid var(--semantic-color-stroke-static-neutral-base)",
  borderRadius: "var(--semantic-layout-units-cornerradius-large)",
  padding: "var(--semantic-layout-units-padding-base)",
};
const LBL = {
  fontFamily: "var(--semantic-type-family-brand)",
  fontSize: "var(--semantic-type-font-size-xs)",
  letterSpacing: "var(--semantic-type-letter-spacing-wide)",
  color: "var(--semantic-color-foreground-static-neutral-subtle)",
};
const Frame = ({ children }) => (
  <div style={{ padding: 24, fontFamily: "var(--semantic-type-family-brand)" }}>
    <SpinnerKeyframes />
    <SkeletonKeyframes />
    {children}
  </div>
);

export const Playground = (args) => (
  <Frame>
    <Spinner {...args} />
  </Frame>
);
Playground.args = { variant: "ring", size: 32, tone: "brand", emphasis: "base", label: "Loading" };
Playground.argTypes = {
  variant: { name: "Variant", control: "inline-radio", options: ["ring", "sunburst"],
    description: "ring is NewCo's loader, sunburst is Amplify's. Same contract either way." },
  size: { name: "Size (px)", control: { type: "range", min: 12, max: 96, step: 2 } },
  tone: { name: "Tone", control: "select", options: TONES },
  emphasis: { name: "Emphasis", control: "inline-radio", options: EMPHASES,
    description: "Only `neutral` has a real emphasis ramp; the other tones resolve to one token at every emphasis." },
  label: { name: "Accessible label", control: "text" },
};

export const RingSizes = () => (
  <Frame>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
      {[16, 20, 24, 32, 48, 64].map((s) => (
        <span key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Spinner size={s} tone="brand" />
          <span style={LBL}>{s}px</span>
        </span>
      ))}
    </div>
  </Frame>
);
RingSizes.storyName = "Ring, every size";

export const AllTones = () => (
  <Frame>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
      {TONES.map((t) => (
        <span key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 104 }}>
          <Spinner size={26} tone={t} />
          <span style={{ ...LBL, textAlign: "center" }}>{t}</span>
        </span>
      ))}
    </div>
  </Frame>
);
AllTones.storyName = "Ring, every tone";

export const SkeletonShapes = () => (
  <Frame>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={{ ...CARD, width: 260, display: "flex", flexDirection: "column", gap: 12 }}>
        <Skeleton circle height={40} />
        <SkeletonText lines={3} />
      </div>
      <div style={{ ...CARD, width: 260, display: "flex", flexDirection: "column", gap: 12 }}>
        <Skeleton height={80} radius={12} />
        <SkeletonText lines={2} lastLineWidth="60%" />
      </div>
    </div>
  </Frame>
);
SkeletonShapes.storyName = "Skeleton";

export const StandingInForContent = () => {
  const [loading, setLoading] = useState(true);
  return (
    <Frame>
      <button
        onClick={() => setLoading((v) => !v)}
        style={{
          marginBottom: 12, cursor: "pointer", fontFamily: "inherit",
          fontSize: "var(--semantic-type-font-size-xs)",
          padding: "var(--semantic-layout-units-padding-xtight) var(--semantic-layout-units-padding-base)",
          borderRadius: "var(--semantic-layout-units-cornerradius-base)",
          border: "0.5px solid var(--semantic-color-stroke-static-neutral-base)",
          background: "var(--semantic-color-fill-surface-elevated)",
          color: "var(--semantic-color-foreground-static-neutral-base)",
        }}
      >
        {loading ? "Show the content" : "Show the skeleton"}
      </button>
      <div style={{ ...CARD, width: 420, minHeight: 120 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton width="55%" height={16} />
            <SkeletonText lines={3} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <strong style={{ color: "var(--semantic-color-foreground-static-neutral-bold)" }}>Outstanding bills</strong>
            <p style={{ margin: 0, fontSize: "var(--semantic-type-font-size-r)",
              lineHeight: "var(--semantic-type-line-height-m-relaxed)",
              color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
              12 bills totalling $24,580 awaiting approval before the end of the month.
            </p>
          </div>
        )}
      </div>
    </Frame>
  );
};
StandingInForContent.storyName = "Standing in for content";

export const SunburstVariant = () => (
  <Frame>
    <div style={{ display: "flex", gap: 20 }}>
      {EMPHASES.map((e) => (
        <span key={e} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Spinner size={26} variant="sunburst" tone="neutral" emphasis={e} />
          <span style={LBL}>{e}</span>
        </span>
      ))}
    </div>
  </Frame>
);
SunburstVariant.storyName = "Sunburst, the Amplify loader";
SunburstVariant.tags = ["!dev"];
