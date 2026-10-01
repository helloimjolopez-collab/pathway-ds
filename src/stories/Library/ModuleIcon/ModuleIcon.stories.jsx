import React from "react";
import { ModuleIcon, MODULES, MODULE_LABELS, MODULE_IDENTITY, COLORS, VIEWBOX } from "../../../../components/module-icon/module-icon.jsx";

/**
 * Module.Icon — the twelve Amplify module marks.
 *
 * Generated from the Figma component set Module.Icon (40006876:42134). One
 * geometry serves all three colour variants; see the module header for why.
 *
 * On 2026-10-01 the canvas moved from 24x24 to 16x16 and Figma's single `Full`
 * colour became `Two Color` plus `One Color`, so the artwork is re-exported
 * rather than rescaled. `full` still works as a deprecated alias.
 */
export default {
  title: "Library/ModuleIcon",
  component: ModuleIcon,
  parameters: {
    docs: {
      description: {
        component:
          "The twelve module marks, from the Figma component set Module.Icon, on a 16 canvas. " +
          "Two Color resolves the module's base and subtle identity colours; One Color draws the " +
          "whole mark in the base colour, which Figma treats as its own variant rather than a tint; " +
          "Mono resolves every path to currentColor so the mark tracks its surrounding text. " +
          "The identity colours are declared on the component " +
          "rather than in the Variables panel, because module identity is not a semantic: nothing in " +
          "the system means \"people are blue\". It is a brand axis, like a logo, and it must not flip " +
          "with the theme.",
      },
    },
  },
  argTypes: {
    module: {
      name: "Module",
      description: "Which module mark to draw. Matches Figma's Module property.",
      control: "select",
      options: MODULES,
    },
    size: {
      name: "Size (px)",
      description: `The artwork is a ${VIEWBOX}x${VIEWBOX} viewBox and scales cleanly to any size. Was 24 until 2026-10-01.`,
      control: { type: "range", min: 12, max: 128, step: 2 },
    },
    color: {
      name: "Colour",
      description:
        "Two Color uses the module's base and subtle identity colours. One Color draws the whole " +
        "mark in the base colour. Mono inherits currentColor, for a coloured or dark surface.",
      control: "inline-radio",
      options: COLORS,
    },
    title: {
      name: "Accessible name",
      description:
        "Sets role=\"img\" and aria-label. Leave empty for a decorative mark sitting beside a visible label, which is the usual case in a nav.",
      control: "text",
    },
  },
  args: { module: "people", size: 48, color: "two-color", title: "" },
};

const CARD = {
  display: "flex", flexDirection: "column", alignItems: "center",
  gap: "var(--semantic-layout-units-gap-xtight)",
  padding: "var(--semantic-layout-units-padding-base)",
  background: "var(--semantic-color-fill-surface-elevated)",
  border: "0.5px solid var(--semantic-color-stroke-static-neutral-base)",
  borderRadius: "var(--semantic-layout-units-cornerradius-base)",
};
const LABEL = {
  fontFamily: "var(--semantic-type-family-brand)",
  fontSize: "var(--semantic-type-font-size-xs)",
  letterSpacing: "var(--semantic-type-letter-spacing-wide)",
  color: "var(--semantic-color-foreground-static-neutral-subtle)",
  textAlign: "center",
};
const GRID = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))",
  gap: "var(--semantic-layout-units-gap-tight)", maxWidth: 900,
};

export const Playground = (args) => (
  <div style={{ padding: 24, color: "var(--semantic-color-foreground-static-neutral-bold)" }}>
    <ModuleIcon {...args} title={args.title || undefined} />
  </div>
);

export const AllModules = () => (
  <div style={{ padding: 24 }}>
    <div style={GRID}>
      {MODULES.map((m) => (
        <div key={m} style={CARD}>
          <ModuleIcon module={m} size={40} />
          <span style={LABEL}>{MODULE_LABELS[m]}</span>
        </div>
      ))}
    </div>
  </div>
);
AllModules.storyName = "All twelve";

export const OneColour = () => (
  <div style={GRID}>
    {MODULES.map((m) => (
      <div key={m} style={CARD}>
        <ModuleIcon module={m} size={40} color="one-color" />
        <span style={LABEL}>{MODULE_LABELS[m]}</span>
      </div>
    ))}
  </div>
);
OneColour.parameters = {
  docs: {
    description: {
      story:
        "Figma's One Color value, added 2026-10-01. The same geometry as Two Color, with every " +
        "path taking the module's base colour instead of base plus subtle. It is its own variant, " +
        "not a tint or an opacity: compare it against All Modules above and the internal shapes " +
        "flatten into one silhouette. Equip stays a gradient here, because its artwork has no flat " +
        "base colour to fall back to.",
    },
  },
};

export const MonoOnAnySurface = () => (
  <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
    {[
      ["var(--semantic-color-fill-surface-chrome)", "var(--semantic-color-foreground-static-neutral-base)", "on chrome, midnight region", true],
      ["var(--semantic-color-fill-surface-elevated)", "var(--semantic-color-foreground-static-neutral-bold)", "on elevated", false],
      ["var(--semantic-color-fill-static-negative-strong)", "var(--semantic-color-foreground-static-neutral-mono)", "on a strong fill", false],
    ].map(([bg, fg, label, midnight]) => (
      <div
        key={label}
        data-theme={midnight ? "midnight" : undefined}
        style={{ background: bg, color: fg, padding: 16, borderRadius: 8,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
      >
        {MODULES.map((m) => <ModuleIcon key={m} module={m} size={22} color="mono" />)}
        <span style={{ ...LABEL, color: "inherit", opacity: 0.8 }}>{label}</span>
      </div>
    ))}
  </div>
);
MonoOnAnySurface.storyName = "Mono follows currentColor";

export const Sizes = () => (
  <div style={{ padding: 24, display: "flex", alignItems: "flex-end", gap: 12 }}>
    {[16, 20, 24, 32, 48, 64, 96].map((s) => (
      <div key={s} style={CARD}>
        <ModuleIcon module="giving" size={s} />
        <span style={LABEL}>{s}px</span>
      </div>
    ))}
  </div>
);

export const IdentityPalette = () => (
  <div style={{ padding: 24, fontFamily: "var(--semantic-type-family-brand)" }}>
    <p style={{ maxWidth: "70ch", marginBottom: 16, fontSize: 13, lineHeight: 1.6,
      color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
      Every fill in the artwork is one of these. They resolve through primitives on purpose:
      module identity does not change with the theme, because it is a brand mark rather than a
      surface. A semantic token would flip in Midnight and break the mark.
    </p>
    <table style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
      <tbody>
        {Object.entries(MODULE_IDENTITY).map(([prop, value]) => (
          <tr key={prop} style={{ borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>
            <td style={{ padding: "6px 10px" }}>
              <div style={{ width: 28, height: 28, borderRadius: 5, background: value,
                border: "1px solid var(--semantic-color-stroke-static-neutral-base)" }} />
            </td>
            <td style={{ padding: "6px 10px", fontFamily: "monospace",
              color: "var(--semantic-color-foreground-static-neutral-base)" }}>{prop}</td>
            <td style={{ padding: "6px 10px", fontFamily: "monospace",
              color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
IdentityPalette.storyName = "Identity palette";
IdentityPalette.tags = ["!dev"];
