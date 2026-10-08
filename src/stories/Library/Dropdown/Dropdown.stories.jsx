/**
 * Dropdown: a trigger and the menu it opens.
 *
 * The replacement for a FOREIGN component: Figma nests `Dropdown`
 * 40003188:9930 inside KPI Tiles eighteen times, and it is a remote
 * third-party component that cannot be Code Connected from this repo.
 */
import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownDivider, DROPDOWN_TYPES, L } from "../../../../components/dropdown/dropdown.jsx";

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
