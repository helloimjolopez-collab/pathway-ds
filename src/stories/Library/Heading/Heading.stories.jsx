// Heading — Storybook stories (React framework)
//
// Module is components/heading/heading.jsx; nothing is redefined here.
// Figma: two orthogonal sets, `Heading` (Level H1..H6, 40004143:1824) and
// `Heading.Style` (Context x Size x Weight, 40004024:31157).

import React from "react";
import {
  Heading, CONTEXTS, SIZES, WEIGHTS, LEVELS,
  CONTEXT_SIZES, CONTEXT_WEIGHTS, DEFINED_COMBINATIONS, weightsFor,
} from "../../../../components/heading/heading.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;

const PAGE = { padding: SU("padding-base"), background: SC("fill-surface-canvas"), maxWidth: 1040 };
const EYEBROW = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
  fontSize: ST("font-size-xs"), letterSpacing: ST("letter-spacing-extraspacious"),
  textTransform: "uppercase", color: SC("foreground-static-neutral-faint"),
  margin: `${SU("gap-relaxed")} 0 ${SU("gap-tight")}`,
};
const META = {
  fontFamily: ST("family-brand"), fontSize: ST("font-size-xs"),
  color: SC("foreground-static-neutral-faint"), margin: 0,
};
const ROW = {
  display: "flex", alignItems: "baseline", gap: SU("gap-base"),
  padding: `${SU("padding-xtight")} 0`,
  borderBottom: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-faint")}`,
};

export default {
  title: "Library/Heading",
  component: Heading,
  argTypes: {
    level: {
      name: "Level (tag only)",
      description:
        "Picks the HTML tag and nothing else, exactly as in Figma where all six Level variants " +
        "render identically at 24/30 Bold. Appearance comes from Context, Size and Weight.",
      control: "inline-radio", options: LEVELS,
    },
    context: { name: "Context", control: "inline-radio", options: CONTEXTS },
    size: { name: "Size", control: "inline-radio", options: SIZES },
    weight: { name: "Weight", control: "inline-radio", options: WEIGHTS },
    tone: { name: "Tone", control: "inline-radio", options: ["base", "subtle", "faint", "mono", "inherit"] },
    children: { name: "Text", control: "text" },
  },
  args: { level: 2, context: "page", size: "base", weight: "bold", tone: "base", children: "Giving overview" },
  parameters: {
    docs: {
      description: {
        component:
          "Two Figma sets that are orthogonal, kept orthogonal here. `Heading` carries Level H1 to " +
          "H6 and all six render identically, so Level is the semantic level and nothing more; " +
          "`Heading.Style` carries the appearance. A page's h1 can be Section/Small if the layout " +
          "wants that, and a visually huge heading can be an h2. " +
          "Only 27 of the 72 Context x Size x Weight combinations exist: Display has no Small or " +
          "below, Local has no L or above, and only Section defines Medium. An undrawn combination " +
          "falls back to the nearest defined size rather than rendering something the design does " +
          "not contain. " +
          "Figma's heading styles are TEXT STYLES, not variables, so they do not export and there " +
          "is no composite token to bind; every value here is one of the panel's type pieces.",
      },
    },
  },
};

export const Playground = (args) => (
  <div style={PAGE}><Heading {...args} /></div>
);

export const EveryDefinedCombination = () => {
  const byContext = CONTEXTS.map((ctx) => ({
    ctx,
    rows: DEFINED_COMBINATIONS.filter((c) => c.context === ctx),
  }));
  return (
    <div style={PAGE}>
      {byContext.map(({ ctx, rows }) => (
        <section key={ctx}>
          <p style={EYEBROW}>{ctx} &middot; {rows.length} combinations</p>
          {rows.map((c) => (
            <div key={`${c.context}/${c.size}/${c.weight}`} style={ROW}>
              <Heading level={2} as="div" context={c.context} size={c.size} weight={c.weight}>
                Giving overview
              </Heading>
              <p style={{ ...META, marginLeft: "auto", whiteSpace: "nowrap" }}>
                {c.size} &middot; {c.weight}
              </p>
            </div>
          ))}
        </section>
      ))}
      <p style={{ ...META, marginTop: SU("padding-base") }}>
        {DEFINED_COMBINATIONS.length} of a possible 72, listed explicitly rather than derived as a
        cross product: Section defines XSmall in Medium and Semibold but not Bold, and XXS in Medium
        only, while Local defines Base in Bold and Semibold but Small in Semibold only. A cross
        product gives 31, four of which Figma does not draw. Rendered with `as="div"` so the matrix
        does not inject 27 headings into the document outline.
      </p>
    </div>
  );
};
EveryDefinedCombination.parameters = {
  docs: {
    description: {
      story:
        "Exactly what Figma draws, grouped by Context. Note where the grid is deliberately sparse: " +
        "Display stops at Base, Local stops at Small, and Medium exists only in Section.",
    },
  },
};

export const LevelIsSemanticsOnly = () => (
  <div style={PAGE}>
    <p style={EYEBROW}>Same appearance, six different tags</p>
    {LEVELS.map((l) => (
      <div key={l} style={ROW}>
        <Heading level={l} context="page" size="base" weight="bold">Giving overview</Heading>
        <p style={{ ...META, marginLeft: "auto" }}>&lt;h{l}&gt;</p>
      </div>
    ))}
    <p style={EYEBROW}>Same tag, six different appearances</p>
    {["xl", "l", "base"].map((s) => (
      <div key={s} style={ROW}>
        <Heading level={2} as="div" context="page" size={s} weight="bold">Giving overview</Heading>
        <p style={{ ...META, marginLeft: "auto" }}>page &middot; {s}</p>
      </div>
    ))}
    {["l", "base", "small"].map((s) => (
      <div key={s} style={ROW}>
        <Heading level={2} as="div" context="section" size={s} weight="semibold">Giving overview</Heading>
        <p style={{ ...META, marginLeft: "auto" }}>section &middot; {s}</p>
      </div>
    ))}
  </div>
);
LevelIsSemanticsOnly.parameters = {
  docs: {
    description: {
      story:
        "The two axes do not imply each other. Above: six tags, one appearance, which is exactly " +
        "what Figma's Heading set does. Below: one tag, six appearances. Pick the level for the " +
        "document outline and the style for the layout, independently.",
    },
  },
};

export const UndrawnCombinationsFallBack = () => (
  <div style={PAGE}>
    <p style={EYEBROW}>Asked for a size the context does not define</p>
    {[
      { context: "display", size: "xxs", note: "Display stops at Base, so this falls back to Base" },
      { context: "local", size: "xl", note: "Local stops at Small, so this falls back to Base" },
      { context: "page", size: "xxs", note: "Page stops at Base, so this falls back to Base" },
      { context: "section", size: "xxs", weight: "bold", note: "Section/XXS is Medium only, so Bold falls back to Medium" },
    ].map((c) => (
      <div key={c.context + c.size} style={ROW}>
        <Heading level={2} as="div" context={c.context} size={c.size} weight={c.weight || "bold"}>Giving overview</Heading>
        <p style={{ ...META, marginLeft: "auto", maxWidth: 320, textAlign: "right" }}>{c.note}</p>
      </div>
    ))}
    <p style={EYEBROW}>Asked for a weight the context does not define</p>
    <div style={ROW}>
      <Heading level={2} as="div" context="page" size="base" weight="medium">Giving overview</Heading>
      <p style={{ ...META, marginLeft: "auto", maxWidth: 320, textAlign: "right" }}>
        Page/Base is Bold and Semibold only, so Medium falls back to Bold
      </p>
    </div>
    <div style={ROW}>
      <Heading level={2} as="div" context="section" size="xsmall" weight="bold">Giving overview</Heading>
      <p style={{ ...META, marginLeft: "auto", maxWidth: 320, textAlign: "right" }}>
        Section/XSmall is Semibold and Medium only, so Bold falls back to Semibold
      </p>
    </div>
  </div>
);
UndrawnCombinationsFallBack.parameters = {
  docs: {
    description: {
      story:
        "A combination Figma does not draw renders the nearest one it does, rather than inventing " +
        "a style the design has never approved.",
    },
  },
};
