// Badge — Storybook stories (React framework)
//
// Module is components/badge/badge.jsx; nothing is redefined here.
// Figma: component set `Badge` (Amplify 40011003:15892), 96 variants across
// Status x Size x Style.

import React from "react";
import { Badge, STATUSES, SIZES, STYLES, STATUS, FIGMA_STATUS } from "../../../../components/badge/badge.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;

const PAGE = { padding: SU("padding-base"), background: SC("fill-surface-canvas") };
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
const Glyph = ({ name }) => (
  <span className="material-symbols-rounded" aria-hidden="true"
    style={{ fontSize: "inherit", lineHeight: 1, display: "block" }}>{name}</span>
);
const TABLE = { width: "100%", borderCollapse: "collapse", maxWidth: 900 };
const TH = {
  ...META, textAlign: "left", fontWeight: ST("weight-medium"),
  padding: `${SU("padding-xxtight")} ${SU("padding-xtight")}`,
  borderBottom: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-base")}`,
};
const TD = {
  padding: `${SU("padding-xxtight")} ${SU("padding-xtight")}`,
  borderBottom: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-faint")}`,
};

export default {
  title: "Library/Badge",
  component: Badge,
  argTypes: {
    status: {
      name: "Status",
      description:
        "Figma's Accent 2 and Accent 3 are `jade` and `mauve` here, because a number that only means " +
        "\"the next accent we added\" tells a consumer nothing and the token it resolves to says jade. " +
        "There is no Accent 1: Info already resolves to the Amethyst ramp, which is what one would have been.",
      control: "select", options: STATUSES,
    },
    size: { name: "Size", control: "inline-radio", options: SIZES },
    badgeStyle: {
      name: "Style",
      description: "Named badgeStyle because `style` is the CSS style object.",
      control: "inline-radio", options: STYLES,
    },
    children: { name: "Label", control: "text" },
  },
  args: { status: "info", size: "medium", badgeStyle: "outline-fill", children: "Label" },
  parameters: {
    docs: {
      description: {
        component:
          "Three of the four Figma styles are systematic: outline-fill, fill and outline each read the " +
          "same three tokens per status and differ only in which they apply. " +
          "Naked is NOT systematic in Figma and this component does not copy it. Across its eight " +
          "variants it has a fill on five, a border on three, and four different text colours, so a " +
          "Naked status badge mostly loses its status; one variant also binds a raw primitive instead " +
          "of the semantic. By name, and by the Button precedent, Naked means no fill and no border " +
          "carrying only the status foreground, and that is what renders here. See the Naked story.",
      },
    },
  },
};

export const Playground = (args) => (
  <div style={PAGE}>
    <Badge {...args} leadingIcon={<Glyph name="circle" />} />
  </div>
);

export const StatusAndStyle = () => (
  <div style={PAGE}>
    {STYLES.map((sty) => (
      <section key={sty}>
        <p style={EYEBROW}>{sty}</p>
        <div style={{ display: "flex", gap: SU("gap-tight"), flexWrap: "wrap", alignItems: "center" }}>
          {STATUSES.map((s) => (
            <Badge key={s} status={s} badgeStyle={sty}>{s}</Badge>
          ))}
        </div>
      </section>
    ))}
  </div>
);
StatusAndStyle.parameters = {
  docs: {
    description: {
      story:
        "Eight statuses against four styles. The border is always declared and goes transparent when " +
        "a style has none, so a badge does not change size as the style changes.",
    },
  },
};

export const Sizes = () => (
  <div style={PAGE}>
    {SIZES.map((sz) => (
      <section key={sz}>
        <p style={EYEBROW}>{sz}</p>
        <div style={{ display: "flex", gap: SU("gap-tight"), flexWrap: "wrap", alignItems: "center" }}>
          {["neutral", "info", "positive", "attention", "negative", "severe"].map((s) => (
            <Badge key={s} size={sz} status={s} leadingIcon={<Glyph name="circle" />}>{s}</Badge>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export const WithIcons = () => (
  <div style={PAGE}>
    <p style={EYEBROW}>Leading, trailing, both, neither</p>
    <div style={{ display: "flex", gap: SU("gap-tight"), flexWrap: "wrap", alignItems: "center" }}>
      <Badge status="positive" leadingIcon={<Glyph name="check_circle" />}>Settled</Badge>
      <Badge status="attention" trailingIcon={<Glyph name="close" />}>Pending</Badge>
      <Badge status="info" leadingIcon={<Glyph name="info" />} trailingIcon={<Glyph name="close" />}>Scheduled</Badge>
      <Badge status="neutral">Draft</Badge>
    </div>
  </div>
);
WithIcons.parameters = {
  docs: {
    description: {
      story:
        "Figma's Show Leading Icon and Show Trailing Icon collapse into the presence of the icon props. " +
        "The glyph inherits the badge's size so it never has to be set twice.",
    },
  },
};

export const NakedDivergesFromFigma = () => (
  <div style={PAGE}>
    <p style={EYEBROW}>What this renders</p>
    <div style={{ display: "flex", gap: SU("gap-tight"), flexWrap: "wrap", alignItems: "center" }}>
      {STATUSES.map((s) => <Badge key={s} status={s} badgeStyle="naked">{s}</Badge>)}
    </div>

    <p style={EYEBROW}>What Figma binds, variant by variant</p>
    <table style={TABLE}>
      <thead>
        <tr><th style={TH}>Figma status</th><th style={TH}>Fill</th><th style={TH}>Border</th><th style={TH}>Text</th></tr>
      </thead>
      <tbody>
        {[
          ["Neutral", "none", "stroke-static-neutral-base", "foreground-static-neutral-bold"],
          ["Severe", "none", "stroke-static-neutral-base", "foreground-static-neutral-base"],
          ["Positive", "none", "stroke-static-neutral-base", "foreground-static-neutral-strong"],
          ["Attention", "fill-static-attention-subtle", "none", "foreground-static-attention-on-subtle"],
          ["Negative", "fill-static-negative-subtle", "none", "foreground-static-neutral-base"],
          ["Info", "fill-static-info-subtle", "none", "foreground-static-neutral-base"],
          ["Accent 2", "fill-static-accent-jade-subtle", "none", "foreground-static-neutral-base"],
          ["Accent 3", "Mauve/25 (a PRIMITIVE)", "none", "foreground-static-accent-mauve-on-subtle"],
        ].map((r) => (
          <tr key={r[0]}>
            {r.map((cell, i) => (
              <td key={i} style={{ ...TD, ...META, fontFamily: i === 0 ? ST("family-brand") : "ui-monospace, monospace" }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ ...META, marginTop: SU("padding-base"), maxWidth: 760 }}>
      A fill on five of eight, a border on three of eight, four different text colours, and one raw
      primitive. Five of the eight lose their status colour entirely. By name, and by the Button
      precedent where Naked is the quietest style, Naked means no fill and no border carrying only
      the status foreground, so that is what this renders for all eight. This is the one style where
      the component and Figma deliberately differ, and it is recorded in the manifest.
    </p>
  </div>
);
NakedDivergesFromFigma.parameters = {
  docs: {
    description: {
      story:
        "The reason Naked is not a faithful transcription. Both halves are on screen so the gap is " +
        "checkable rather than asserted.",
    },
  },
};

export const FigmaNameMapping = () => (
  <div style={PAGE}>
    <table style={TABLE}>
      <thead><tr><th style={TH}>Figma Status</th><th style={TH}>Prop</th><th style={TH}>Fill token</th></tr></thead>
      <tbody>
        {Object.entries(FIGMA_STATUS).map(([figmaName, prop]) => (
          <tr key={prop}>
            <td style={{ ...TD, ...META }}>{figmaName}</td>
            <td style={{ ...TD, ...META, fontFamily: "ui-monospace, monospace" }}>{prop}</td>
            <td style={{ ...TD, ...META, fontFamily: "ui-monospace, monospace" }}>{STATUS[prop].fill}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
FigmaNameMapping.parameters = {
  docs: {
    description: {
      story:
        "For anyone reading a Figma file and looking for the prop. Accent 2 is jade and Accent 3 is " +
        "mauve, which is what the tokens say.",
    },
  },
};
