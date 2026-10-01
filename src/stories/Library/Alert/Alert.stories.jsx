// Alert — Storybook stories (React framework)
//
// Module is components/alert/alert.jsx; nothing is redefined here.
// Figma: component set `Alert` (Amplify 40002171:5031), six Type variants.

import React, { useState } from "react";
import { Alert, AlertKeyframes, TYPES, TYPE, FIGMA_TYPE, TYPE_FAMILY } from "../../../../components/alert/alert.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;

const PAGE = { padding: SU("padding-base"), background: SC("fill-surface-canvas"), maxWidth: 760 };
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
const STACK = { display: "flex", flexDirection: "column", gap: SU("gap-tight") };
const Glyph = ({ name }) => (
  <span className="material-symbols-rounded" aria-hidden="true"
    style={{ fontSize: "inherit", lineHeight: 1, display: "block" }}>{name}</span>
);
const Btn = ({ children }) => (
  <span style={{
    fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
    fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
    display: "inline-flex", alignItems: "center",
    minHeight: SU("accessibility-touch-target-desktop-only-height"),
    padding: `0 ${SU("padding-tight")}`,
    borderRadius: "var(--contextual-layout-units-button-cornerradius)",
    border: `var(--contextual-layout-units-button-borderwidth-rest) solid ${SC("stroke-static-neutral-base")}`,
    background: SC("fill-surface-elevated"),
    color: SC("foreground-action-secondary-rest"),
    whiteSpace: "nowrap",
  }}>{children}</span>
);
const TABLE = { width: "100%", borderCollapse: "collapse" };
const TH = {
  ...META, textAlign: "left", fontWeight: ST("weight-medium"),
  padding: `${SU("padding-xxtight")} ${SU("padding-xtight")}`,
  borderBottom: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-base")}`,
};
const TD = {
  ...META, padding: `${SU("padding-xxtight")} ${SU("padding-xtight")}`,
  borderBottom: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-faint")}`,
  fontFamily: "ui-monospace, monospace",
};

export default {
  title: "Library/Alert",
  component: Alert,
  argTypes: {
    type: {
      name: "Type",
      description:
        "Figma's Type names and the token families they resolve to disagree. Success is positive, " +
        "Alert is severe, Warning is attention, Error is negative, Tertiary is info. `Alert` as a " +
        "Type inside a component called Alert means the severe level, not \"an alert\".",
      control: "select", options: TYPES,
    },
    heading: { name: "Heading", control: "text" },
    children: { name: "Body", control: "text" },
    dismissLabel: { name: "Dismiss label", control: "text" },
  },
  args: {
    type: "warning",
    heading: "Mandatory government fees apply",
    children: "Some of the jurisdictions you selected require mandatory government fees. These will be charged to your bill.",
    dismissLabel: "Dismiss",
  },
  parameters: {
    docs: {
      description: {
        component:
          "The one component whose job IS a sentence, so the usual rule against explanatory text does " +
          "not apply: heading and body are content. " +
          "Role is chosen by type rather than passed: error and alert interrupt with role=\"alert\" and " +
          "aria-live assertive, the other four are passive with role=\"status\" and polite, because a " +
          "screen reader should not be made to announce a success message over whatever the user is " +
          "doing. " +
          "The heading icon and the dismiss control both inherit currentColor, so neither is a second " +
          "colour decision per type. " +
          "One Figma inconsistency is rendered as drawn rather than smoothed: five of the six types " +
          "take their family's STRONG stroke and Tertiary takes info SUBTLE, so its border is much " +
          "fainter at the same 1.5 width. See the Borders story.",
      },
    },
  },
};

export const Playground = (args) => (
  <div style={PAGE}>
    <AlertKeyframes />
    <Alert {...args} icon={<Glyph name="info" />} action={<Btn>Learn more</Btn>} onDismiss={() => {}} />
  </div>
);

export const EveryType = () => (
  <div style={PAGE}>
    <AlertKeyframes />
    <div style={STACK}>
      {TYPES.map((t) => (
        <Alert key={t} type={t}
          icon={<Glyph name="info" />}
          heading={`${t} (${TYPE_FAMILY[t]})`}
          action={<Btn>Learn more</Btn>}
          onDismiss={() => {}}>
          Some of the jurisdictions you selected require mandatory government fees.
        </Alert>
      ))}
    </div>
  </div>
);
EveryType.parameters = {
  docs: {
    description: {
      story:
        "All six Figma types, each labelled with the token family it actually resolves to. The border " +
        "difference on Tertiary is visible here against the other five.",
    },
  },
};

export const ContentCombinations = () => (
  <div style={PAGE}>
    <AlertKeyframes />
    <div style={STACK}>
      <Alert type="success" icon={<Glyph name="check_circle" />} heading="Heading only" />
      <Alert type="neutral">Body only, no heading and no icon.</Alert>
      <Alert type="warning" icon={<Glyph name="warning" />} heading="Heading and body">
        Both, which is the common case.
      </Alert>
      <Alert type="error" icon={<Glyph name="error" />} heading="With an action"
        action={<Btn>Retry</Btn>}>
        The action slot is Figma's Container-Button and takes any node.
      </Alert>
      <Alert type="tertiary" icon={<Glyph name="info" />} heading="With dismiss" onDismiss={() => {}}>
        The dismiss control gets its own column at the trailing edge, as drawn.
      </Alert>
      <Alert type="alert" icon={<Glyph name="report" />} heading="Everything"
        action={<Btn>Review</Btn>} onDismiss={() => {}}>
        Heading, body, icon, action and dismiss together.
      </Alert>
    </div>
  </div>
);
ContentCombinations.parameters = {
  docs: {
    description: {
      story:
        "Figma's Show Heading, Show Body, Show Heading Icon, Show Button and Show Trailing Icon " +
        "collapse into the presence of the content props, the same call as Card and Badge.",
    },
  },
};

export const Dismissible = () => {
  const [open, setOpen] = useState(TYPES.slice(0, 3));
  return (
    <div style={PAGE}>
      <AlertKeyframes />
      <div style={STACK}>
        {open.map((t) => (
          <Alert key={t} type={t} icon={<Glyph name="info" />} heading={t}
            onDismiss={() => setOpen(open.filter((x) => x !== t))}>
            Dismiss this one and it goes.
          </Alert>
        ))}
      </div>
      {open.length === 0 && (
        <p style={META}>All dismissed. Reload the story to bring them back.</p>
      )}
      <p style={{ ...META, marginTop: SU("padding-base") }}>
        {open.length} of 3 remaining.
      </p>
    </div>
  );
};

export const BordersAndTheTertiaryGap = () => (
  <div style={PAGE}>
    <AlertKeyframes />
    <p style={EYEBROW}>Border token per type</p>
    <table style={TABLE}>
      <thead><tr><th style={TH}>Figma Type</th><th style={TH}>Prop</th><th style={TH}>Border token</th></tr></thead>
      <tbody>
        {Object.entries(FIGMA_TYPE).map(([figmaName, prop]) => (
          <tr key={prop}>
            <td style={{ ...TD, fontFamily: ST("family-brand") }}>{figmaName}</td>
            <td style={TD}>{prop}</td>
            <td style={{ ...TD, color: prop === "tertiary" ? SC("foreground-static-negative-on-subtle") : undefined }}>
              {TYPE[prop].stroke}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ ...META, marginTop: SU("padding-base") }}>
      Five of the six take their family's strong stroke. Tertiary takes info subtle, so at the same
      1.5 width its border is far fainter than the others. Rendered as drawn, because an alert border
      is a deliberate loudness choice and guessing at it would be worse than showing it. Recorded in
      the manifest.
    </p>
    <p style={EYEBROW}>Side by side</p>
    <div style={STACK}>
      <Alert type="tertiary" icon={<Glyph name="info" />} heading="tertiary, info subtle border">
        Compare this border against the one below.
      </Alert>
      <Alert type="success" icon={<Glyph name="check_circle" />} heading="success, positive strong border">
        Same 1.5 width, much more present.
      </Alert>
    </div>
  </div>
);
