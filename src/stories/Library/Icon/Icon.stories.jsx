/**
 * Icon: the primitive, plus the two wrappers Figma nests around it.
 *
 * This page exists because icons had NO code and no page at all until
 * 2026-10-07: Code Connect listed every Figma icon component with no path and
 * no link, and six components each carried a private helper nothing could
 * import.
 */
import React from "react";
import { Icon, IconBox, SIZES, MATERIAL_SYMBOLS_HREF, ICON_SOURCES } from "../../../../components/icon/icon.jsx";
import { ActionIcon, ACTION_ICON_SIZES } from "../../../../components/icon/action-icon.jsx";
import { DisplayIcon, DISPLAY_ICON_SIZES, DISPLAY_ICON_COLORS } from "../../../../components/icon/display-icon.jsx";
import { FeaturedIcon, FEATURED_ICON_SIZES, FEATURED_ICON_COLORS } from "../../../../components/icon/featured-icon.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const page = (children, dir = "column") => (
  <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: dir,
    gap: U("gap-relaxed"), alignItems: dir === "row" ? "flex-start" : "stretch",
    background: "var(--semantic-color-fill-surface-canvas)" }}>{children}</div>
);
const caption = (text) => (
  <code style={{ display: "block", marginBottom: U("gap-xxtight"),
    fontSize: "var(--semantic-type-font-size-xs)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{text}</code>
);

export default {
  title: "Library/Icon",
  component: Icon,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "A PATHWAY ICON IS A FONT, NOT A FILE. There is no per-icon asset: " +
      "Material Symbols Rounded is one variable font, and an icon is its NAME " +
      "written as text. Browse the names at fonts.google.com/icons with " +
      "Style = Rounded; the name you write is the folder name in " +
      "github.com/google/material-design-icons. SIZE IS THE FRAME, never the " +
      "drawn vector: Figma nests a 24 wrapper, a 16 frame and a ~12 vector, " +
      "and size={16} reproduces the 16." } },
  },
  argTypes: {
    name: { name: "Name (the ligature)", control: "text" },
    size: { name: "Size (the FRAME)", control: "inline-radio", options: ["L", "M", "S"] },
    fill: { name: "FILL axis", control: "inline-radio", options: [0, 1] },
    label: { name: "Accessible name (omit for decorative)", control: "text" },
  },
};

export const Playground = {
  args: { name: "arrow_forward", size: "M", fill: 0, label: "" },
  render: (a) => page(
    <div style={{ display: "flex", alignItems: "center", gap: U("gap-relaxed") }}>
      <Icon {...a} label={a.label || undefined} />
      <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
        {`<Icon name="${a.name}" size="${a.size}" fill={${a.fill}} />`}
      </code>
    </div>
  ),
};

/** FILL is a font axis, and it is the icon mistake this system makes most. */
export const TheFillAxis = {
  name: "The FILL axis",
  render: () => page(
    ["home", "settings", "notifications", "check_circle", "folder", "star"].map((n) => (
      <div key={n} style={{ display: "flex", alignItems: "center", gap: U("gap-relaxed") }}>
        <code style={{ width: 140, fontSize: "var(--semantic-type-font-size-xs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{n}</code>
        <Icon name={n} size={24} fill={0} />
        <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>FILL 0</code>
        <Icon name={n} size={24} fill={1} />
        <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>FILL 1</code>
      </div>
    ))
  ),
  parameters: { docs: { description: { story:
    "FILL 0 is outlined, FILL 1 is solid, and it is ONE font either way. " +
    "READ IT FROM FIGMA PER COMPONENT and never assume: SideNav is FILL 1 " +
    "throughout, the Widget header is FILL 0. Assuming it is the most common " +
    "icon bug in this system." } } },
};

/** The size you pass is the frame. Passing the vector ships it too small. */
export const SizeIsTheFrame = {
  name: "Size is the frame, not the vector",
  render: () => page(
    <>
      <div>
        {caption("The system ladder: L=18, M=16, S=14 inside 26 / 24 / 20 wrappers")}
        <div style={{ display: "flex", alignItems: "flex-end", gap: U("gap-relaxed") }}>
          {Object.entries(SIZES).map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)",
                display: "inline-block" }}>
                <IconBox name="settings" size={k} />
              </div>
              <code style={{ display: "block", marginTop: 4,
                fontSize: "var(--semantic-type-font-size-xxs)",
                color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
                {k}: frame {v.frame}, wrapper {v.wrapper}
              </code>
            </div>
          ))}
        </div>
      </div>
      <div>
        {caption("The same glyph at the FRAME (16) and at the VECTOR (12). The second is the bug.")}
        <div style={{ display: "flex", alignItems: "flex-end", gap: U("gap-relaxed") }}>
          <div style={{ textAlign: "center" }}>
            <Icon name="settings" size={16} />
            <code style={{ display: "block", fontSize: "var(--semantic-type-font-size-xxs)",
              color: "var(--semantic-color-foreground-static-positive-on-subtle)" }}>16, correct</code>
          </div>
          <div style={{ textAlign: "center" }}>
            <Icon name="settings" size={12} />
            <code style={{ display: "block", fontSize: "var(--semantic-type-font-size-xxs)",
              color: "var(--semantic-color-foreground-static-negative-on-subtle)" }}>12, a third too small</code>
          </div>
        </div>
      </div>
    </>
  ),
  parameters: { docs: { description: { story:
    "Figma nests a wrapper (24), an icon frame (16) and the drawn vector " +
    "(~12), because the Material grid carries about 2px of built-in padding. " +
    "size is the FRAME, so size={16} lands the visible glyph near 12 on its " +
    "own. The dashed outline is the wrapper, drawn by this story." } } },
};

/** The icon-only control. Nested 30 times inside the Widget set. */
export const ActionIcons = {
  name: "ActionIcon: the three sizes and their states",
  render: () => page(
    <>
      <div>
        {caption("Figma Action Icon 40006794:19891. Hover and press them: the fill is on the LAYER, not the target.")}
        <div style={{ display: "flex", alignItems: "center", gap: U("gap-base") }}>
          {Object.entries(ACTION_ICON_SIZES).map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)",
                display: "inline-block" }}>
                <ActionIcon name="more_vert" size={k} label={`More actions, ${k}`} onClick={() => {}} />
              </div>
              <code style={{ display: "block", marginTop: 4,
                fontSize: "var(--semantic-type-font-size-xxs)",
                color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
                {k}: {v.box} box, {v.layer} layer, {v.glyph} glyph
              </code>
            </div>
          ))}
        </div>
      </div>
      <div>
        {caption("The Widget header's three, at Size=Small, which is what Figma draws")}
        <div style={{ display: "flex", background: "var(--semantic-color-fill-surface-elevated)",
          border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
          borderRadius: U("cornerradius-xlarge"), padding: U("padding-xxtight") }}>
          <ActionIcon name="refresh" label="Refresh" onClick={() => {}} />
          <ActionIcon name="open_in_full" label="Open the full view" onClick={() => {}} />
          <ActionIcon name="more_vert" label="More actions" onClick={() => {}} />
        </div>
      </div>
      <div>
        {caption('Disabled, and Figma’s SideNav.Control: an Action Icon at Size=Large with the menu glyph')}
        <div style={{ display: "flex", alignItems: "center", gap: U("gap-base") }}>
          <ActionIcon name="more_vert" label="More actions" disabled />
          <ActionIcon name="menu" size="Large" label="Open navigation menu" onClick={() => {}} />
        </div>
      </div>
    </>
  ),
  parameters: { docs: { description: { story:
    "The dashed outline is the TARGET and the state layer inside it is " +
    "smaller, which is the whole point: the fill belongs on the layer. " +
    "Painting the target gives a hover box visibly bigger than the design, " +
    "and that shipped twice, in the Widget header and in the TopNav's " +
    "SideNav.Control, which had no layer at all." } } },
};

/** The decorative icon in a tinted circle. */
export const DisplayIcons = {
  name: "DisplayIcon: every size and colour",
  render: () => page(
    <>
      <div>
        {caption("Sizes: Small 24 / glyph 12, Medium 32 / 16, Large 40 / 20")}
        <div style={{ display: "flex", alignItems: "center", gap: U("gap-base") }}>
          {Object.entries(DISPLAY_ICON_SIZES).map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <DisplayIcon name="info" size={k} color="Info" />
              <code style={{ display: "block", marginTop: 4,
                fontSize: "var(--semantic-type-font-size-xxs)",
                color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
                {k}: {v.box} / {v.glyph}
              </code>
            </div>
          ))}
        </div>
      </div>
      <div>
        {caption("Figma's Color axis, onto the meaning-named tone groups. Danger is SEVERE, not Negative.")}
        <div style={{ display: "flex", alignItems: "center", gap: U("gap-base"), flexWrap: "wrap" }}>
          {Object.keys(DISPLAY_ICON_COLORS).map((c) => (
            <div key={c} style={{ textAlign: "center" }}>
              <DisplayIcon name={{
                Accent: "auto_awesome", Positive: "check_circle", Negative: "error",
                Danger: "warning", Neutral: "circle", Info: "info", Alert: "priority_high",
              }[c]} size="Medium" color={c} />
              <code style={{ display: "block", marginTop: 4,
                fontSize: "var(--semantic-type-font-size-xxs)",
                color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{c}</code>
            </div>
          ))}
        </div>
      </div>
    </>
  ),
  parameters: { docs: { description: { story:
    "Each tone draws its SUBTLE fill with its ON SUBTLE foreground, the " +
    "pairing the token set guarantees. Danger and Negative are both in the " +
    "Figma axis and are different tones: Negative is Red, Severe is Orange, " +
    "so Danger takes Severe. OPEN FIGMA GAP: the variant binds no fill and " +
    "the nested glyph's fill is unbound, so the Color axis has no token " +
    "behind it in the file. This mapping is the repo's, from the tone names." } } },
};

export const TokensColour = {
  name: "Tokens: colour",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Icon",
        note: "An Icon sets NO colour unless given one. That is deliberate: an icon " +
              "beside a label should be the label's colour, and it then follows Light " +
              "and Midnight for free with nothing to keep in step.",
        rows: [["--semantic-color-foreground-static-neutral-base", "Whatever it inherits, in the common case"]] },
      { title: "ActionIcon",
        note: "The Figma component binds no fill in any of its nine variants and the " +
              "glyph's fill is unbound too, so the design says 'whatever the context is'.",
        rows: [
          ["--semantic-color-foreground-action-secondary-rest", "Glyph at rest"],
          ["--semantic-color-foreground-action-secondary-hover", "Glyph on hover"],
          ["--semantic-color-foreground-action-secondary-pressed", "Glyph while pressed"],
          ["--semantic-color-fill-action-secondary-hover", "State layer on hover"],
          ["--semantic-color-fill-action-secondary-pressed", "State layer while pressed"],
          ["--semantic-layout-units-cornerradius-base", "State layer radius"],
        ] },
      { title: "DisplayIcon",
        note: "Figma's Color axis onto meaning-named tones. Each pairs a Subtle fill " +
              "with its On Subtle foreground.",
        rows: [
          ["--semantic-color-fill-static-brand-subtle", "Accent"],
          ["--semantic-color-foreground-static-brand-on-subtle", "Accent glyph"],
          ["--semantic-color-fill-static-positive-subtle", "Positive"],
          ["--semantic-color-foreground-static-positive-on-subtle", "Positive glyph"],
          ["--semantic-color-fill-static-negative-subtle", "Negative"],
          ["--semantic-color-foreground-static-negative-on-subtle", "Negative glyph"],
          ["--semantic-color-fill-static-severe-subtle", "Danger, which is SEVERE not Negative"],
          ["--semantic-color-foreground-static-severe-on-subtle", "Danger glyph"],
          ["--semantic-color-fill-static-info-subtle", "Info"],
          ["--semantic-color-foreground-static-info-on-subtle", "Info glyph"],
          ["--semantic-color-fill-static-attention-subtle", "Alert"],
          ["--semantic-color-foreground-static-attention-on-subtle", "Alert glyph"],
          ["--semantic-color-fill-static-neutral-subtle", "Neutral"],
        ] },
    ]} />
  ),
};


/**
 * The large badge a KPI tile puts above its number, and the replacement for a
 * FOREIGN component: Figma nests `Featured icon` 40003806:3550 here, a remote
 * third-party component, ten times inside a Pathway one.
 */
export const FeaturedIcons = {
  name: "FeaturedIcon: the two Figma types",
  render: () => page(
    <>
      <div>
        {caption("type=\"outline\" \u00b7 a tinted circle \u00b7 lg 48 / glyph 24, md 40 / glyph 20")}
        <div style={{ display: "flex", alignItems: "center", gap: U("gap-base"), flexWrap: "wrap" }}>
          {Object.keys(FEATURED_ICON_COLORS).map((c) => (
            <div key={c} style={{ textAlign: "center" }}>
              <FeaturedIcon name="trending_up" size="lg" type="outline" color={c} />
              <code style={{ display: "block", marginTop: 4,
                fontSize: "var(--semantic-type-font-size-xxs)",
                color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{c}</code>
            </div>
          ))}
        </div>
      </div>
      <div>
        {caption('type="modern" \u00b7 a white chip, NOT tone-coloured \u00b7 r=8, 1px border, shadow')}
        <div style={{ display: "flex", alignItems: "center", gap: U("gap-base") }}>
          {Object.entries(FEATURED_ICON_SIZES).map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <FeaturedIcon name="trending_up" size={k} type="modern" />
              <code style={{ display: "block", marginTop: 4,
                fontSize: "var(--semantic-type-font-size-xxs)",
                color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
                {k}: {v.box} / glyph {v.glyph}
              </code>
            </div>
          ))}
        </div>
      </div>
      <div>
        {caption("The two variants the KPI Tile actually nests, side by side")}
        <div style={{ display: "flex", alignItems: "center", gap: U("gap-base") }}>
          <FeaturedIcon name="trending_up" size="lg" type="outline" color="Positive" />
          <FeaturedIcon name="bolt" size="lg" type="outline" color="Accent" />
          <FeaturedIcon name="trending_up" size="lg" type="modern" />
          <FeaturedIcon name="trending_up" size="md" type="modern" />
        </div>
      </div>
    </>
  ),
  parameters: { docs: { description: { story:
    "EVERY COLOUR HERE WAS ALREADY A PATHWAY COLOUR. All seven raw hexes in " +
    "the foreign component's four used variants match an existing semantic " +
    "token exactly, distance 0 in RGB, so this is the same drawing on the " +
    "tokens it was already the colour of. Two departures: the Positive glyph " +
    "takes On Subtle rather than the On Strong the foreign component used, " +
    "because On Strong is for a solid fill and this sits on a Subtle one; and " +
    "the chip's shadow uses --elevation-widget, the nearest Pathway token to " +
    "Figma's 0 1 2, since no exact one exists." } } },
};
