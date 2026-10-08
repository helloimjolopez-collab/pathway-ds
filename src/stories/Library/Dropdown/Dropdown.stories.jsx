/**
 * Dropdown: a trigger and the menu it opens.
 *
 * The replacement for a FOREIGN component: Figma nests `Dropdown`
 * 40003188:9930 inside KPI Tiles eighteen times, and it is a remote
 * third-party component that cannot be Code Connected from this repo.
 */
import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownDivider, DROPDOWN_TYPES, L } from "../../../../components/dropdown/dropdown.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const page = (children) => (
  <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
    gap: U("gap-relaxed"), minHeight: 320,
    background: "var(--semantic-color-fill-surface-canvas)" }}>{children}</div>
);
const caption = (text) => (
  <code style={{ display: "block", marginBottom: U("gap-xxtight"),
    fontSize: "var(--semantic-type-font-size-xs)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{text}</code>
);

const items = (
  <>
    <DropdownItem label="Open the full view" onSelect={() => {}} />
    <DropdownItem label="Refresh" onSelect={() => {}} note="just now" />
    <DropdownDivider />
    <DropdownItem label="Glance" checked={false} onSelect={() => {}} />
    <DropdownItem label="Detail" checked onSelect={() => {}} />
    <DropdownDivider />
    <DropdownItem label="Remove from this dashboard" danger onSelect={() => {}} />
  </>
);

export default {
  title: "Library/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "A trigger and the menu it opens. Figma's set is Type (Button | Icon | " +
      "Avatar) x Open (False | True), and the Icon trigger is a BARE 20px " +
      "glyph: no box, no fill, no border. So the trigger was never the hard " +
      "part, since Pathway already had ActionIcon; what the system was missing " +
      "is the MENU, which only existed as a private helper inside dashboard.jsx " +
      "and could not be reused." } },
  },
  argTypes: {
    type: { name: "Type", control: "inline-radio", options: DROPDOWN_TYPES },
    align: { name: "Panel alignment", control: "inline-radio", options: ["start", "end"] },
  },
};

export const Playground = {
  args: { type: "icon", align: "end" },
  render: (a) => page(
    <>
      {/* The echo is here because the Icon trigger is a bare glyph with no
          text, so without it the page reads as empty: to a screen reader, to a
          render check, and to anyone looking at a thumbnail. */}
      {caption(`<Dropdown type="${a.type}" align="${a.align}" label="More actions">`)}
      <div style={{ display: "flex", justifyContent: a.align === "end" ? "flex-end" : "flex-start" }}>
        <Dropdown {...a} label="More actions" text="This period" initials="JL">{items}</Dropdown>
      </div>
    </>
  ),
};

/** All three triggers, closed and open. */
export const Types = {
  render: () => page(
    <>
      {DROPDOWN_TYPES.map((t) => (
        <div key={t}>
          {caption(`type="${t}"${t === "icon" ? " · a bare 20px glyph, which is what Figma draws" : ""}`)}
          <div style={{ display: "flex", alignItems: "center", gap: U("gap-relaxed") }}>
            <Dropdown type={t} label="More actions" text="This period" initials="JL">{items}</Dropdown>
            <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
              color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>closed</code>
          </div>
        </div>
      ))}
    </>
  ),
  parameters: { docs: { description: { story:
    "Open any of them: the panel closes on Escape, on a click outside, and " +
    "carries role=menu with its trigger's aria-expanded and aria-controls. " +
    "The Icon trigger is 20x20 with a 20px glyph and nothing around it, " +
    "measured off Figma's Type=Icon, Open=False, which walks to a single " +
    "dots-vertical instance and nothing else." } } },
};

/** The open state, which is Figma's second axis. */
export const Open = {
  name: "Open: the panel",
  render: () => {
    const [which, setWhich] = useState("icon");
    return page(
      <>
        {caption('Figma’s Open axis. Controlled here, so the panel stays up to look at.')}
        {/* align="start" here, because these triggers sit at the LEFT of the
            page and an end-aligned panel on the first one opens off-screen.
            The default is "end" for the opposite reason: a trigger at the top
            right of a card needs the panel to open inward. */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 260 }}>
          {DROPDOWN_TYPES.map((t) => (
            <Dropdown key={t} type={t} open={which === t} align="start"
              onOpenChange={(v) => setWhich(v ? t : null)}
              label="More actions" text="This period" initials="JL">{items}</Dropdown>
          ))}
        </div>
      </>
    );
  },
  parameters: { docs: { description: { story:
    "The panel's own measurements are NOT from the foreign component: its " +
    "Open=True variants are that library's menu, and copying them would " +
    "import a second system's panel. This follows Pathway's own overlay " +
    "conventions, the ones the OrgSwitcher panel and the Widget menu already " +
    "use: Fill/Surface/Elevated, Stroke/Static/Neutral/Base, CornerRadius/Base " +
    "and --elevation-lift." } } },
};

/** Where a tile actually puts it. */
export const InACard = {
  name: "In a card, where a KPI tile puts it",
  render: () => page(
    <div style={{ position: "relative", width: 388, minHeight: 90,
      padding: U("padding-base"), boxSizing: "border-box",
      background: "var(--semantic-color-fill-surface-elevated)",
      border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
      borderRadius: U("cornerradius-xlarge") }}>
      <span style={{ position: "absolute", top: U("padding-base"), right: U("padding-base") }}>
        <Dropdown type="icon" label="More actions">{items}</Dropdown>
      </span>
      <div style={{ fontSize: "var(--semantic-type-font-size-s)",
        color: "var(--semantic-color-foreground-static-neutral-base)" }}>Views 24 hours</div>
      <div style={{ fontSize: "var(--semantic-type-font-size-xxl)",
        fontWeight: "var(--semantic-type-weight-bold)",
        color: "var(--semantic-color-foreground-static-neutral-strong)" }}>2,000</div>
    </div>
  ),
  parameters: { docs: { description: { story:
    "The panel aligns to its trigger's END edge by default, which is why it " +
    "opens leftward here. A trigger at the top right of a card with a " +
    "start-aligned panel pushes the panel off the card." } } },
};

/**
 * Two things have states here and they are separate components in Figma: the
 * TRIGGER, whose Open axis is a variant, and the ITEM inside the panel, whose
 * hover is its own. Treating the panel's hover as a state of the trigger is
 * how a menu ends up highlighting the wrong row.
 */
export const StateMatrix = {
  name: "State matrix",
  render: () => page(
    <>
      {caption(
        "The three trigger types, closed and open. Open is a Figma variant, not a " +
        "CSS state, which is why it is a prop on this component and can be driven " +
        "from a story.")}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr",
        alignItems: "start", gap: U("gap-relaxed") }}>
        <span />
        <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>Open=False</code>
        <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>Open=True</code>
        {DROPDOWN_TYPES.map((t) => (
          <React.Fragment key={t}>
            <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
              color: "var(--semantic-color-foreground-static-neutral-bold)" }}>{t}</code>
            {[false, true].map((open) => (
              <span key={String(open)} style={{ display: "inline-flex", minHeight: open ? 220 : 44 }}>
                <Dropdown type={t} open={open} onOpenChange={() => {}}
                  label="More actions" text="Actions" initials="JL">
                  {items}
                </Dropdown>
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
      {caption(
        "Item states, inside a real panel. Rest is Foreground/Action/Secondary/Rest " +
        "on a transparent row; hover swaps the label to /Hover and fills the row " +
        "with Fill/Action/Selection/Hover. Checked adds a leading check without " +
        "moving the label, because a label that shifts on selection reads as a " +
        "different item.")}
      <div style={{ display: "inline-flex" }}>
        <Dropdown type="button" text="Every item state" open onOpenChange={() => {}}>
          <DropdownItem label="Rest" />
          <DropdownItem label="With a leading icon" icon="refresh" />
          <DropdownItem label="Checked" checked />
          <DropdownItem label="Unchecked" checked={false} />
          <DropdownItem label="With a note" note="Ctrl K" />
          <DropdownItem label="Disabled" disabled />
          <DropdownDivider />
          <DropdownItem label="Destructive" danger />
        </Dropdown>
      </div>
      {caption("Hover each row. Disabled does not take the hover fill and is not " +
               "focusable, so keyboard navigation skips it rather than landing on " +
               "a row that cannot be chosen.")}
    </>
  ),
};

/**
 * One item, with its own controls. Every property that changes an item's shape
 * is on this one unit, which is the level a menu is actually assembled at.
 */
export const ElementExplorer = {
  name: "Element explorer",
  args: { label: "Remove from this dashboard", icon: "", note: "", checked: undefined,
          danger: false, disabled: false },
  argTypes: {
    label: { name: "Label", control: "text" },
    icon: { name: "Leading Material Symbols glyph, blank for none", control: "text" },
    note: { name: "Trailing note", control: "text" },
    checked: { name: "Checked", control: "inline-radio",
      options: [undefined, true, false] },
    danger: { name: "Destructive", control: "boolean" },
    disabled: { name: "Disabled", control: "boolean" },
  },
  render: (a) => page(
    <>
      <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
        {`40 tall \u00b7 pad 6/14 \u00b7 label gap 4 at an 8 inset \u00b7 leading glyph 14 in a 20 box`}
      </code>
      <div style={{ width: L.panelMinW, padding: L.panelPad, boxSizing: "border-box",
        background: "var(--semantic-color-fill-surface-elevated)",
        border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
        borderRadius: L.radius, boxShadow: "var(--elevation-sheet)" }}>
        <DropdownItem label={a.label} icon={a.icon || undefined}
          note={a.note || undefined} checked={a.checked}
          danger={a.danger} disabled={a.disabled} />
      </div>
      {caption(
        "The horizontal padding is 14, Padding/Medium. It read 12 until 2026-10-08 " +
        "under a comment claiming 14 was not on the ladder: that is true of the GAP " +
        "ladder, which goes 12 then 16, and not of the padding ladder, which has a " +
        "Medium rung at exactly 14.")}
    </>
  ),
};

export const TokensFill = {
  name: "Tokens: fill",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Fill",
        note: "The panel is an elevated surface, not an overlay one: it is anchored " +
              "to its trigger rather than floating free, and it does not dim what " +
              "is behind it. Selection/Hover is the row fill, and it is a selection " +
              "token rather than an action one because the row is a choice.",
        rows: [
          ["--semantic-color-fill-surface-elevated", "The panel"],
          ["--semantic-color-fill-action-selection-hover", "A row on hover"],
          ["--semantic-color-fill-action-primary-subtle-rest", "A checked row"],
        ] },
    ]} />
  ),
};

export const TokensStroke = {
  name: "Tokens: stroke",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Stroke",
        note: "One border on the panel and one on the Button trigger. The divider " +
              "between item groups is a 1px rule in the same token.",
        rows: [
          ["--semantic-color-stroke-static-neutral-base", "Panel border and item divider"],
          ["--semantic-color-stroke-action-secondary-rest", "Button trigger border"],
          ["--semantic-layout-units-borderwidth-base", "Both, 1"],
        ] },
    ]} />
  ),
};

export const TokensText = {
  name: "Tokens: text",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Text",
        note: "An item's label moves between Rest and Hover in the same family, so " +
              "the row's text and its fill change together. Destructive is the only " +
              "label that leaves that family.",
        rows: [
          ["--semantic-color-foreground-action-secondary-rest", "Item label and the Icon trigger's glyph"],
          ["--semantic-color-foreground-action-secondary-hover", "Both, on hover"],
          ["--semantic-color-foreground-action-primary-on-subtle-rest", "A checked row's label"],
          ["--semantic-color-foreground-static-negative-on-subtle", "A destructive row's label and glyph"],
          ["--semantic-color-foreground-static-neutral-subtle", "A trailing note, such as a shortcut"],
        ] },
    ]} />
  ),
};

export const TokensTypography = {
  name: "Tokens: typography",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Typography",
        note: "Labels are 14 at 500. The note beside a label drops to 10, which is " +
              "small enough that it cannot be the only place a meaning lives.",
        rows: [
          ["--semantic-type-font-size-s", "Item label and Button trigger text"],
          ["--semantic-type-font-size-xxs", "Trailing note"],
          ["--semantic-type-line-height-s-single", "Item label"],
          ["--semantic-type-weight-semibold", "Button trigger text"],
          ["--semantic-type-letter-spacing-spacious", "Everything in the panel"],
        ] },
    ]} />
  ),
};

export const TokensSpacing = {
  name: "Tokens: spacing",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Spacing",
        note: "Measured off Pathway's own PopoverMenu rather than invented, because " +
              "this component is that menu with a trigger attached: panel 212 wide " +
              "at pad 8, item 40 tall at pad 6 and 14.",
        rows: [
          ["--semantic-layout-units-padding-xtight", "Panel padding, and an item's leading inset, 8"],
          ["--semantic-layout-units-padding-xxtight", "Item vertical padding and the divider's, 6"],
          ["--semantic-layout-units-padding-medium", "Item horizontal padding, 14"],
          ["--semantic-layout-units-padding-tight", "Button trigger horizontal padding, 12"],
          ["--semantic-layout-units-gap-xtight", "Gap between item groups, 6"],
          ["--semantic-layout-units-gap-xxtight", "Gap between an item's glyph and its label, 4"],
        ] },
    ]} />
  ),
};

export const TokensRadius = {
  name: "Tokens: radius",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Radius",
        note: "One radius, on the panel and on each row, so a hovered row's corners " +
              "sit concentric inside the panel's.",
        rows: [
          ["--semantic-layout-units-cornerradius-base", "Panel and item row, 8"],
        ] },
    ]} />
  ),
};

export const TokensElevation = {
  name: "Tokens: elevation",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Elevation",
        note: "Figma draws the panel with 0 4 16 -2. Pathway's nearest is the sheet " +
              "token at 0 4 32 -8: the same offset with a softer blur. Used rather " +
              "than inventing a token, and the gap is recorded in the spec.",
        rows: [
          ["--elevation-sheet", "The panel"],
        ] },
    ]} />
  ),
};
