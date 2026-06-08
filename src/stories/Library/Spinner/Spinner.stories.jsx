// Spinner — Storybook stories (React framework)
//
// The Spinner component is simple enough to define inline here. The
// authoritative spec lives at components/spinner/spinner-spec.md.
// Token-binding CSS lives in spinner.css (imported below), which reads
// from the global tokens.css loaded by .storybook/preview.js.

import React from "react";
import "./spinner.css";

// ─── Figma spoke paths + opacity ladder (see spinner-spec.md §5) ─────────────
const SPOKES = [
  { d: "M6 1V3",             opacity: 1.0  },
  { d: "M8.1 3.9L9.55 2.45", opacity: 0.87 },
  { d: "M9 6H11",            opacity: 0.75 },
  { d: "M8.1 8.1L9.55 9.55", opacity: 0.62 },
  { d: "M6 9V11",            opacity: 0.5  },
  { d: "M2.45 9.55L3.9 8.1", opacity: 0.37 },
  { d: "M1 6H3",             opacity: 0.25 },
  { d: "M2.45 2.45L3.9 3.9", opacity: 0.12 },
];

const TONES = [
  "neutral", "brand", "info", "warning", "danger",
  "negative", "positive", "accent-amethyst", "accent-jade", "accent-seabreeze",
];
const EMPHASES = ["light", "subtle", "base", "contrast", "bold"];

// ─── Spinner component (React) ───────────────────────────────────────────────
function Spinner({ size = 24, tone = "neutral", emphasis = "base", label = "Loading" }) {
  const style = size != null
    ? { "--pds-spinner-size": typeof size === "number" ? `${size}px` : size }
    : undefined;

  return (
    <span className="pds-spinner" role="status" aria-live="polite" aria-label={label}
      data-tone={tone} data-emphasis={emphasis} style={style}>
      <svg className="pds-spinner__svg" viewBox="0 0 12 12"
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        {SPOKES.map(({ d, opacity }, i) => (
          <path key={i} className="pds-spinner__spoke" d={d} opacity={opacity} />
        ))}
      </svg>
      <span className="pds-spinner__sr-only">{label}</span>
    </span>
  );
}

// ─── Story helpers ───────────────────────────────────────────────────────────
function Cell({ label, token, children }) {
  return (
    <div className="sb-spinner-cell">
      <div className="sb-spinner-swatch">{children}</div>
      <span className="sb-spinner-label">{label}</span>
      {token && <span className="sb-spinner-token">{token}</span>}
    </div>
  );
}

function Grid({ children }) {
  return <div className="sb-spinner-grid">{children}</div>;
}

// ─── Storybook metadata ─────────────────────────────────────────────────────
export default {
  title: "Library/Spinner",
  component: Spinner,
  argTypes: {
    tone: { control: { type: "select" }, options: TONES },
    emphasis: { control: { type: "select" }, options: EMPHASES },
    size: { control: { type: "number", min: 8, max: 128, step: 2 } },
    label: { control: { type: "text" } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Indeterminate activity indicator built from the Figma `progress-activity` " +
          "node (`40006622:50003`). Colour is locked to `icon.static.*` semantic tokens. " +
          "See `components/spinner/spinner-spec.md` for the full spec.",
      },
    },
  },
};

// ─── Stories ─────────────────────────────────────────────────────────────────
export const Playground = (args) => <Spinner {...args} />;
Playground.args = { size: 32, tone: "neutral", emphasis: "base", label: "Loading" };

export const FluidSizes = () => (
  <Grid>
    {[12, 16, 20, 24, 32, 48, 64, 96].map(px => (
      <Cell key={px} label={`${px}px`}>
        <Spinner size={px} tone="neutral" />
      </Cell>
    ))}
  </Grid>
);
FluidSizes.parameters = {
  docs: { description: { story: "One component, any size. Pass any CSS length to `size`." } },
};

export const AllTones = () => (
  <Grid>
    {TONES.map(tone => (
      <Cell key={tone} label={tone} token={`icon.static.${tone}.base`}>
        <Spinner size={32} tone={tone} emphasis="base" />
      </Cell>
    ))}
  </Grid>
);
AllTones.parameters = {
  docs: {
    description: {
      story:
        "Every tone in `icon.static.*` at `emphasis=\"base\"`. These are the **only** " +
        "colour values the spinner accepts. No raw hex, no primitives, no invented tokens.",
    },
  },
};

export const EmphasisLadder = () => (
  <Grid>
    {EMPHASES.map(emphasis => (
      <Cell key={emphasis} label={emphasis} token={`icon.static.brand.${emphasis}`}>
        <Spinner size={32} tone="brand" emphasis={emphasis} />
      </Cell>
    ))}
  </Grid>
);
EmphasisLadder.parameters = {
  docs: {
    description: {
      story:
        "Five emphasis levels for a single tone (`brand`). The same ladder is available on every tone.",
    },
  },
};

export const ReducedMotion = () => (
  <div>
    <p style={{ fontFamily: "'Red Hat Text', sans-serif", fontSize: 13, color: "#8890b0", margin: "0 0 12px" }}>
      With your OS set to reduce motion, the rotation stops and the opacity ladder
      flattens to a uniform 0.6 — a neutral "in progress" glyph instead of a paused head-and-tail.
    </p>
    <Grid>
      <Cell label="tone=neutral"><Spinner size={48} tone="neutral" /></Cell>
      <Cell label="tone=brand"><Spinner size={48} tone="brand" /></Cell>
      <Cell label="tone=positive"><Spinner size={48} tone="positive" /></Cell>
    </Grid>
  </div>
);
ReducedMotion.parameters = {
  docs: {
    description: {
      story:
        "Simulate by toggling **Reduce motion** in your OS (macOS > System Settings > " +
        "Accessibility > Display > Reduce Motion).",
    },
  },
};
