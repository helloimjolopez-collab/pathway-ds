// Radio — Storybook stories (React framework)
//
// Module is components/radio/radio.jsx; nothing is redefined here.
// Figma: component set `Radio` (40002974:83004), 25 variants.

import React, { useState } from "react";
import { Radio, RadioGroup, RadioKeyframes, SIZES, STATES } from "../../../../components/radio/radio.jsx";

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
const FUNDS = [
  { value: "general", label: "General fund" },
  { value: "missions", label: "Missions" },
  { value: "building", label: "Building fund" },
  { value: "archive", label: "Archived fund", disabled: true },
];

export default {
  title: "Library/Radio",
  component: RadioGroup,
  argTypes: {
    size: { name: "Size", control: "inline-radio", options: SIZES },
    error: { name: "Error", control: "boolean" },
    disabled: { name: "Disabled (whole group)", control: "boolean" },
    orientation: { name: "Orientation", control: "inline-radio", options: ["vertical", "horizontal"] },
  },
  args: { size: "base", error: false, disabled: false, orientation: "vertical" },
  parameters: {
    docs: {
      description: {
        component:
          "A radio is never alone, so RadioGroup ships with Radio. A lone radio cannot be unselected " +
          "by the user, has no arrow-key behaviour, and has nothing for its label to describe. The " +
          "group owns the name, the value, roving tabindex and arrow-key navigation. " +
          "Figma's State axis is a drawing convenience: hover, focus and pressed are things the " +
          "browser already knows, so state is derived and `forceState` exists for the matrix below " +
          "and nothing else. Type collapses the same way: `checked` and `error` are two booleans, " +
          "not a four-value enum, because Selected and Error Selected are the same selection in " +
          "different validity. " +
          "The 20px ring meets the 44px AA target through a 42px halo rather than by growing, so the " +
          "control stays the size the design drew while still being reachable.",
      },
    },
  },
};

export const Playground = (args) => {
  const [value, setValue] = useState("general");
  return (
    <div style={PAGE}>
      <RadioKeyframes />
      <RadioGroup {...args} options={FUNDS} value={value} onChange={setValue} label="Fund" />
      <p style={{ ...META, marginTop: SU("padding-base") }}>Selected: {value}</p>
    </div>
  );
};
Playground.parameters = {
  docs: {
    description: {
      story:
        "Tab into the group once, then use the arrow keys. One tab stop for the whole group, which " +
        "is what the native radio role expects. The archived fund is disabled and arrow keys skip it.",
    },
  },
};

export const StateMatrix = () => (
  <div style={PAGE}>
    <RadioKeyframes />
    {[
      { label: "Unselected", checked: false, error: false },
      { label: "Selected", checked: true, error: false },
      { label: "Error unselected", checked: false, error: true },
      { label: "Error selected", checked: true, error: true },
    ].map((row) => (
      <section key={row.label}>
        <p style={EYEBROW}>{row.label}</p>
        <div style={{ display: "flex", gap: SU("gap-relaxed"), flexWrap: "wrap" }}>
          {STATES.map((s) => (
            <Radio key={s} value={s} forceState={s}
              checked={row.checked} error={row.error} disabled={s === "disabled"}
              name={`matrix-${row.label}`}>{s}</Radio>
          ))}
        </div>
      </section>
    ))}
    <p style={{ ...META, marginTop: SU("padding-base"), maxWidth: 760 }}>
      All 20 of Figma's Base-size combinations. The halo appears on hover and focus only, the dot
      only when checked, and the ring stroke carries the state in every row.
    </p>
  </div>
);
StateMatrix.parameters = {
  docs: {
    description: {
      story:
        "Forced states, which is the only thing forceState is for. A real radio derives all of these " +
        "from the browser.",
    },
  },
};

export const SizesAndTheLargeGap = () => (
  <div style={PAGE}>
    <RadioKeyframes />
    <p style={EYEBROW}>Base, 20px ring</p>
    <div style={{ display: "flex", gap: SU("gap-relaxed") }}>
      <Radio value="a" name="sz-base" size="base">Unselected</Radio>
      <Radio value="b" name="sz-base2" size="base" checked>Selected</Radio>
      <Radio value="c" name="sz-base3" size="base" error>Error</Radio>
      <Radio value="d" name="sz-base4" size="base" error checked>Error selected</Radio>
    </div>
    <p style={EYEBROW}>Large, 22px ring</p>
    <div style={{ display: "flex", gap: SU("gap-relaxed") }}>
      <Radio value="a" name="sz-lg" size="large">Unselected</Radio>
      <Radio value="b" name="sz-lg2" size="large" checked>Selected</Radio>
      <Radio value="c" name="sz-lg3" size="large" error>Error</Radio>
      <Radio value="d" name="sz-lg4" size="large" error checked>Error selected</Radio>
    </div>
    <p style={{ ...META, marginTop: SU("padding-base"), maxWidth: 760 }}>
      In Figma, Size=Large exists for Unselected ONLY: five variants out of a possible twenty, with
      no Large Selected and no Large Error at all, so the Large column is unfinished. This renders
      Large for every combination, scaling the ring to 22 and leaving the dot, halo and hit area as
      drawn, because a size that only works unselected is not a size. Recorded in the manifest.
    </p>
  </div>
);

export const DisabledLabelDims = () => (
  <div style={PAGE}>
    <RadioKeyframes />
    <p style={EYEBROW}>Disabled</p>
    <div style={{ display: "flex", gap: SU("gap-relaxed") }}>
      <Radio value="a" name="dis" disabled>Unselected and disabled</Radio>
      <Radio value="b" name="dis2" disabled checked>Selected and disabled</Radio>
    </div>
    <p style={{ ...META, marginTop: SU("padding-base"), maxWidth: 760 }}>
      All twenty Figma variants bind foreground-static-neutral-base for the label, including the
      Disabled ones, so in Figma a disabled radio's only cue is its ring and dot. This dims the label
      to foreground-action-disabled, because a disabled control whose label looks enabled reads as a
      bug. Recorded in the manifest.
    </p>
  </div>
);

export const HorizontalGroup = () => {
  const [value, setValue] = useState("monthly");
  return (
    <div style={PAGE}>
      <RadioKeyframes />
      <RadioGroup
        label="Frequency"
        orientation="horizontal"
        value={value}
        onChange={setValue}
        options={[
          { value: "once", label: "One off" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "annual", label: "Annually" },
        ]}
      />
    </div>
  );
};
