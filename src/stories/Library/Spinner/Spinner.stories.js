// Spinner — Storybook stories (HTML framework)
//
// These stories render the spinner as plain HTML + inline CSS, reading the
// same semantic tokens that tokens.css exposes (loaded globally via
// .storybook/preview.js). The goal is a Storybook-native demo that does NOT
// depend on React/Babel at runtime — the standalone demo at
// components/spinner/spinner.html uses React only because it's a self-contained file; the real
// component is a few DOM nodes and a stylesheet.

import "./spinner.css";

/** The eight Figma spoke paths + opacity ladder (see spinner-spec.md §5). */
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

function spinner({ size = 24, tone = "neutral", emphasis = "base", label = "Loading" } = {}) {
  const wrap = document.createElement("span");
  wrap.className = "pds-spinner";
  wrap.setAttribute("role", "status");
  wrap.setAttribute("aria-live", "polite");
  wrap.setAttribute("aria-label", label);
  wrap.dataset.tone = tone;
  wrap.dataset.emphasis = emphasis;
  wrap.style.setProperty("--pds-spinner-size",
    typeof size === "number" ? `${size}px` : size);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "pds-spinner__svg");
  svg.setAttribute("viewBox", "0 0 12 12");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  SPOKES.forEach(({ d, opacity }) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "pds-spinner__spoke");
    path.setAttribute("d", d);
    path.setAttribute("opacity", String(opacity));
    svg.appendChild(path);
  });

  const sr = document.createElement("span");
  sr.className = "pds-spinner__sr-only";
  sr.textContent = label;

  wrap.appendChild(svg);
  wrap.appendChild(sr);
  return wrap;
}

/** Helper — build a caption-labelled grid cell for the grid stories. */
function cell(label, node, token) {
  const c = document.createElement("div");
  c.className = "sb-spinner-cell";
  const swatch = document.createElement("div");
  swatch.className = "sb-spinner-swatch";
  swatch.appendChild(node);
  const cap = document.createElement("span");
  cap.className = "sb-spinner-label";
  cap.textContent = label;
  c.appendChild(swatch);
  c.appendChild(cap);
  if (token) {
    const t = document.createElement("span");
    t.className = "sb-spinner-token";
    t.textContent = token;
    c.appendChild(t);
  }
  return c;
}

function grid(cells) {
  const g = document.createElement("div");
  g.className = "sb-spinner-grid";
  cells.forEach(c => g.appendChild(c));
  return g;
}

// ───── Storybook metadata ─────────────────────────────────────────────────────
export default {
  title: "Components/Spinner",
  // Docs page is supplied by Spinner.mdx — no autodocs tag.
  argTypes: {
    tone: { control: { type: "select" }, options: TONES },
    emphasis: { control: { type: "select" }, options: EMPHASES },
    size: { control: { type: "number", min: 8, max: 128, step: 2 } },
    label: { control: { type: "text" } },
    style: {
      control: { type: "select" },
      options: ["progress-activity"],
      description: "Variant selector. Only `progress-activity` exists today.",
    },
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

// ───── Stories ─────────────────────────────────────────────────────────────────
export const Default = ({ size, tone, emphasis, label }) => spinner({ size, tone, emphasis, label });
Default.args = { size: 32, tone: "neutral", emphasis: "base", label: "Loading" };

export const FluidSizes = () =>
  grid([12, 16, 20, 24, 32, 48, 64, 96].map(px =>
    cell(`${px}px`, spinner({ size: px, tone: "neutral" }))
  ));
FluidSizes.parameters = {
  docs: { description: { story: "One component, any size. Pass any CSS length to `size`." } },
};

export const AllTones = () =>
  grid(TONES.map(tone =>
    cell(tone, spinner({ size: 32, tone, emphasis: "base" }),
      `icon.static.${tone}.base`)
  ));
AllTones.parameters = {
  docs: {
    description: {
      story:
        "Every tone in `icon.static.*` at `emphasis=\"base\"`. These are the **only** " +
        "colour values the spinner accepts. No raw hex, no primitives, no invented tokens.",
    },
  },
};

export const EmphasisLadder = () =>
  grid(EMPHASES.map(emphasis =>
    cell(emphasis, spinner({ size: 32, tone: "brand", emphasis }),
      `icon.static.brand.${emphasis}`)
  ));
EmphasisLadder.parameters = {
  docs: {
    description: {
      story:
        "Five emphasis levels for a single tone (`brand`). The same ladder is available " +
        "on every tone.",
    },
  },
};

export const ReducedMotion = () => {
  const wrap = document.createElement("div");
  wrap.innerHTML =
    `<p style="font-family:'Red Hat Text',sans-serif;font-size:13px;color:#8890b0;margin:0 0 12px;">
       With your OS set to reduce motion, the rotation stops and the opacity ladder
       flattens to a uniform 0.6 — a neutral "in progress" glyph instead of a paused head-and-tail.
     </p>`;
  wrap.appendChild(grid([
    cell("tone=neutral", spinner({ size: 48, tone: "neutral" })),
    cell("tone=brand",   spinner({ size: 48, tone: "brand" })),
    cell("tone=positive",spinner({ size: 48, tone: "positive" })),
  ]));
  return wrap;
};
ReducedMotion.parameters = {
  docs: {
    description: {
      story:
        "Simulate by toggling **Reduce motion** in your OS (macOS ▸ System Settings ▸ " +
        "Accessibility ▸ Display ▸ Reduce Motion).",
    },
  },
};
