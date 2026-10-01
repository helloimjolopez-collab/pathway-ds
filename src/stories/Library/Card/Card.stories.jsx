// Card — Storybook stories (React framework)
//
// Module is components/card/card.jsx; nothing is redefined here.
// Figma: component set `Card` (Amplify 40006608:49667, NewCo mirror
// 40016724:103731), one State axis plus content toggles and slots.

import React from "react";
import { Card, CardKeyframes, STATES } from "../../../../components/card/card.jsx";
import { ModuleIcon } from "../../../../components/module-icon/module-icon.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;

const GRID = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: SU("gap-base"), maxWidth: 1040, padding: SU("padding-base"),
  background: SC("fill-surface-canvas"),
};
const LABEL = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
  fontSize: ST("font-size-xs"), letterSpacing: ST("letter-spacing-extraspacious"),
  textTransform: "uppercase", color: SC("foreground-static-neutral-faint"),
  margin: `0 0 ${SU("gap-tight")}`,
};
const Glyph = ({ name }) => (
  <span className="material-symbols-rounded" aria-hidden="true"
    style={{ fontSize: 20, lineHeight: 1, display: "block" }}>{name}</span>
);

export default {
  title: "Library/Card",
  component: Card,
  argTypes: {
    title: { name: "Title", control: "text" },
    subtitle: { name: "Subtitle", control: "text" },
    body: { name: "Body", control: "text" },
    disabled: { name: "Disabled", control: "boolean" },
    forceState: {
      name: "Force state",
      description:
        "For this matrix only. A real card derives its state from interaction, and only an " +
        "interactive card (one given onClick) can reach hover, active or focus at all.",
      control: "inline-radio", options: [undefined, ...STATES],
    },
  },
  args: {
    title: "Outstanding bills",
    subtitle: "Accounts payable",
    body: "12 bills totalling $24,580 awaiting approval before the end of the month.",
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Figma gives Card five states, which only make sense if the whole surface is a target. " +
          "So `onClick` decides: with it the card is a button carrying hover, active and focus; " +
          "without it the card is a plain container and those states are unreachable. A card that " +
          "looks pressable and is not is worse than either. " +
          "Figma's content toggles collapse into the content props: passing `title` shows the " +
          "heading, omitting it hides it, because a boolean that only means \"is the next prop set\" " +
          "is a Figma limitation rather than an API. " +
          "One token gap: Figma binds Elevation/Card/Rest, /Hover and /Pressed, but the panel's " +
          "Elevation collection holds only Lift, Overlay, Sheet and Widget, so those three resolve " +
          "through a published library and never reach the export. Their components ARE in the " +
          "panel, so the shadows are composed from shadow-card-*-x/y/blur/spread plus " +
          "fill-shadow-dropshadow, exactly as the Figma effect composes them.",
      },
    },
  },
};

export const Playground = (args) => (
  <>
    <CardKeyframes />
    <div style={{ ...GRID, gridTemplateColumns: "minmax(260px, 340px)" }}>
      <Card {...args} icon={<Glyph name="receipt_long" />} onClick={() => {}} />
    </div>
  </>
);

export const StateMatrix = () => (
  <>
    <CardKeyframes />
    <div style={{ padding: SU("padding-base"), background: SC("fill-surface-canvas") }}>
      <p style={LABEL}>Forced states, interactive card</p>
      <div style={{ ...GRID, padding: 0, background: "transparent" }}>
        {STATES.map((s) => (
          <Card key={s} forceState={s} onClick={() => {}}
            icon={<Glyph name="receipt_long" />}
            title={s} subtitle="Accounts payable"
            body="12 bills totalling $24,580 awaiting approval." />
        ))}
      </div>
    </div>
  </>
);
StateMatrix.parameters = {
  docs: {
    description: {
      story:
        "The five Figma states, forced. Notice what distinguishes them: border width AND colour, " +
        "and shadow depth. Never colour alone, and nothing translates on hover.",
    },
  },
};

export const ContainerVersusTarget = () => (
  <>
    <CardKeyframes />
    <div style={GRID}>
      <Card title="Plain container" subtitle="No onClick"
        body="No hover, no active, no focus. The cursor stays default and the surface is not a target." />
      <Card title="Interactive" subtitle="Given onClick" onClick={() => {}}
        body="Renders as a button. Hover, active and focus all apply, and it is reachable by keyboard." />
    </div>
  </>
);
ContainerVersusTarget.parameters = {
  docs: {
    description: {
      story:
        "The same component either way. Hover both: only the second responds, and only the second " +
        "takes keyboard focus, because only the second is a button in the DOM.",
    },
  },
};

export const ContentCombinations = () => (
  <>
    <CardKeyframes />
    <div style={GRID}>
      <Card title="Title only" />
      <Card title="Title and subtitle" subtitle="Accounts payable" />
      <Card title="With body" body="12 bills totalling $24,580 awaiting approval before the end of the month." />
      <Card icon={<Glyph name="receipt_long" />} title="With leading icon" subtitle="Accounts payable" />
      <Card icon={<ModuleIcon module="giving" size={20} />} title="With a module mark"
        subtitle="Giving" body="A ModuleIcon in the leading slot, so the card carries module identity." />
      <Card title="With supporting content" subtitle="Slot.CardSupportingContent">
        <div style={{
          display: "flex", gap: SU("gap-xxtight"), flexWrap: "wrap",
          fontFamily: ST("family-brand"), fontSize: ST("font-size-xs"),
        }}>
          {["Pending", "Approved", "Overdue"].map((t) => (
            <span key={t} style={{
              padding: `0 ${SU("padding-xtight")}`,
              borderRadius: SU("cornerradius-full"),
              background: SC("fill-static-neutral-strong"),
              color: SC("foreground-static-neutral-subtle"),
            }}>{t}</span>
          ))}
        </div>
      </Card>
      <Card title="Disabled" subtitle="Accounts payable" disabled onClick={() => {}}
        body="Dimmed, non-interactive, and the border drops to the disabled stroke." />
    </div>
  </>
);
ContentCombinations.parameters = {
  docs: {
    description: {
      story:
        "Figma's four content toggles as they appear in code: each one is the presence of the prop " +
        "itself. The leading slot takes any node, including a ModuleIcon.",
    },
  },
};
