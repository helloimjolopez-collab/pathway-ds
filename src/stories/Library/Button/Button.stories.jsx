/**
 * Button — Storybook stories
 *
 * Playground · StateMatrix · ElementExplorer · AllSizes · IconVariants · LoadingState
 * · TokensFill · TokensText · TokensStroke · TokensIcon
 * · TokensTypography · TokensSpacing · TokensMotion · TokensRadius
 * · StandaloneDemo
 *
 * Authoritative spec: components/button/button-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003293-93741
 */

import React, { useState } from "react";
import { Button, ButtonSpinner, T, SIZES } from "../../../../components/button/button.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLES   = ["Fill", "Outlined", "Naked"];
const SIZES_OPT = ["L", "M", "S", "XS"];
const TYPES    = ["Primary", "Secondary", "Tertiary", "Negative"];
const STATES   = ["base", "hover", "pressed", "focused", "disabled", "loading"];

// ─── Story helpers ────────────────────────────────────────────────────────────

function Row({ children, gap = 12, wrap = true }) {
  return (
    <div style={{ display: "flex", flexWrap: wrap ? "wrap" : "nowrap", gap, alignItems: "center" }}>
      {children}
    </div>
  );
}

function Col({ children, gap = 8 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, alignItems: "flex-start" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontFamily: "'Red Hat Text', sans-serif", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.08em", textTransform: "uppercase", color: "#8890b0",
      margin: "24px 0 8px" }}>
      {children}
    </p>
  );
}

function TokenRow({ name, value, description }) {
  const [hex, setHex] = useState("—");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // Resolve the CSS variable value to a hex
    const varName = name.replace(/^var\((.+)\)$/, "$1");
    const resolved = window.getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (resolved) setHex(resolved);
  }, [name]);

  const cssVar = name.replace(/^var\((.+)\)$/, "$1");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0",
      borderBottom: "1px solid #f0f1f5", fontFamily: "'Red Hat Text', sans-serif" }}>
      {/* Swatch */}
      <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0,
        background: `var(${cssVar})`, border: "1px solid rgba(0,0,0,0.08)" }} />
      {/* Name */}
      <code style={{ fontSize: 12, color: "#3a3f5c", flex: "0 0 360px" }}>{cssVar}</code>
      {/* Hex */}
      <code style={{ fontSize: 12, color: "#8890b0", flex: "0 0 96px" }}>{hex}</code>
      {/* Usage */}
      <span style={{ fontSize: 12, color: "#8890b0" }}>{description}</span>
    </div>
  );
}

// ─── Storybook metadata ───────────────────────────────────────────────────────

export default {
  title: "Library/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Pathway's primary action trigger. Three styles (Fill / Outlined / Naked), " +
          "four semantic types (Primary / Secondary / Tertiary / Negative), four sizes (L / M / S / XS). " +
          "Supports leading icon, trailing icon, icon-only, and loading states. " +
          "Figma node `40003293:93741` (PW_Button).",
      },
    },
    layout: "padded",
  },
  argTypes: {
    buttonStyle: {
      name: "Style",
      control: { type: "select" },
      options: STYLES,
      description: "Fill — solid surface. Outlined — bordered transparent. Naked — no border or fill.",
    },
    size: {
      name: "Size",
      control: { type: "select" },
      options: SIZES_OPT,
      description: "L (18px label) · M (16px label, default) · S (14px label).",
    },
    type: {
      name: "Type",
      control: { type: "select" },
      options: TYPES,
      description:
        "Semantic intent. Primary = brand blue (highest weight). Secondary = muted. " +
        "Tertiary = lowest visual weight. Negative = destructive / error.",
    },
    text: {
      name: "Label",
      control: { type: "text" },
      description: "Visible button text. Also used as accessible name when showText is false.",
    },
    showLeadingIcon: {
      name: "Leading icon?",
      control: { type: "boolean" },
      description: "Show a Material Symbol before the label.",
    },
    leadingIcon: {
      name: "Leading icon name",
      control: { type: "text" },
      description: "Material Symbols ligature name (e.g. 'add', 'check', 'arrow_forward').",
    },
    showTrailingIcon: {
      name: "Trailing icon?",
      control: { type: "boolean" },
      description: "Show a Material Symbol after the label.",
    },
    trailingIcon: {
      name: "Trailing icon name",
      control: { type: "text" },
      description: "Material Symbols ligature name (e.g. 'arrow_forward', 'chevron_right').",
    },
    showText: {
      name: "Show label?",
      control: { type: "boolean" },
      description: "When false: icon-only. Requires ariaLabel to be set for accessibility.",
    },
    loading: {
      name: "Loading?",
      control: { type: "boolean" },
      description: "Replaces content with an inline spinner. Sets aria-busy='true'.",
    },
    disabled: {
      name: "Disabled?",
      control: { type: "boolean" },
      description: "Prevents interaction. Sets disabled + aria-disabled='true'.",
    },
    ariaLabel: {
      name: "ARIA label",
      control: { type: "text" },
      description: "Override accessible name. Required when Show label is off (icon-only).",
    },
  },
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground = (args) => <Button {...args} />;
Playground.args = {
  buttonStyle: "Fill",
  size: "M",
  type: "Primary",
  text: "Save changes",
  showLeadingIcon: false,
  leadingIcon: "check",
  showTrailingIcon: false,
  trailingIcon: "arrow_forward",
  showText: true,
  loading: false,
  disabled: false,
  ariaLabel: "",
};
Playground.parameters = {
  docs: { description: { story: "Full-featured sandbox — toggle any prop." } },
};

// ─── StateMatrix ──────────────────────────────────────────────────────────────

export const StateMatrix = () => {
  // forceState drives visual-only state simulation — no real interaction needed.
  // "disabled" and "loading" use their real props so aria-* attributes are correct.
  const combos = [
    { label: "Default",  props: {} },
    { label: "Hover",    props: { forceState: "hover" } },
    { label: "Pressed",  props: { forceState: "pressed" } },
    { label: "Focused",  props: { forceState: "focused" } },
    { label: "Disabled", props: { disabled: true } },
    { label: "Loading",  props: { loading: true } },
  ];

  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif" }}>
      {STYLES.map(style => (
        <div key={style} style={{ marginBottom: 40 }}>
          <SectionLabel>{style}</SectionLabel>
          {TYPES.map(type => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "#8890b0", width: 80, flexShrink: 0 }}>{type}</span>
              <Row gap={4} wrap={false}>
                {combos.map(({ label, props: extra }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <Button
                      buttonStyle={style}
                      type={type}
                      size="M"
                      text={label}
                      {...extra}
                    />
                    <span style={{ fontSize: 10, color: "#b0b6cc" }}>{label}</span>
                  </div>
                ))}
              </Row>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
StateMatrix.parameters = {
  docs: {
    description: {
      story:
        "All 3 styles × 4 types × 6 interaction states (default / hover / pressed / focused / " +
        "disabled / loading). Every cell is a live component — not a screenshot.",
    },
  },
};

// ─── ElementExplorer ──────────────────────────────────────────────────────────

export const ElementExplorer = (args) => <Button {...args} />;
ElementExplorer.args = {
  buttonStyle: "Fill",
  size: "M",
  type: "Primary",
  text: "Explore me",
  showLeadingIcon: true,
  leadingIcon: "rocket_launch",
  showTrailingIcon: false,
  trailingIcon: "arrow_forward",
  showText: true,
  loading: false,
  disabled: false,
};
ElementExplorer.parameters = {
  docs: {
    description: {
      story:
        "Isolated single button with full prop controls. Use this to explore " +
        "specific style/type/size combinations, icon slot placement, and edge cases.",
    },
  },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const AllSizes = () => (
  <Col>
    <SectionLabel>Sizes — Fill / Primary</SectionLabel>
    <Row>
      {SIZES_OPT.map(sz => (
        <div key={sz} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Button buttonStyle="Fill" type="Primary" size={sz} text={`Size ${sz}`} />
          <span style={{ fontFamily: "'Red Hat Text', sans-serif", fontSize: 11, color: "#8890b0" }}>
            {sz === "L" ? "18px" : sz === "M" ? "16px" : sz === "S" ? "14px" : "12px"} label
          </span>
        </div>
      ))}
    </Row>
    <SectionLabel>Sizes — Outlined / Primary</SectionLabel>
    <Row>
      {SIZES_OPT.map(sz => (
        <Button key={sz} buttonStyle="Outlined" type="Primary" size={sz} text={`Size ${sz}`} />
      ))}
    </Row>
  </Col>
);
AllSizes.parameters = {
  docs: {
    description: {
      story: "Four sizes (L / M / S / XS) available. XS is defined in Figma for Primary / Secondary / Negative; Tertiary has no XS variant.",
    },
  },
};

// ─── Icon variants ────────────────────────────────────────────────────────────

export const IconVariants = () => (
  <Col>
    <SectionLabel>Leading icon</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Fill" type={type} size="M"
          text={type} showLeadingIcon leadingIcon="add" />
      ))}
    </Row>
    <SectionLabel>Trailing icon</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Fill" type={type} size="M"
          text={type} showTrailingIcon trailingIcon="arrow_forward" />
      ))}
    </Row>
    <SectionLabel>Icon only (requires ariaLabel)</SectionLabel>
    <Row>
      {["add", "edit", "delete", "check", "close", "settings"].map(icon => (
        <Button key={icon} buttonStyle="Fill" type="Primary" size="M"
          showText={false} leadingIcon={icon} showLeadingIcon
          ariaLabel={icon.replace(/_/g, " ")} />
      ))}
    </Row>
    <SectionLabel>Icon only — all types / Outlined</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Outlined" type={type} size="M"
          showText={false} leadingIcon="add" showLeadingIcon
          ariaLabel={`Add (${type})`} />
      ))}
    </Row>
  </Col>
);
IconVariants.parameters = {
  docs: {
    description: {
      story:
        "Leading icon · trailing icon · icon-only. The gap between icon and label is `--semantic-layout-units-contextual-button-gap-horizontal` (8px).",
    },
  },
};

// ─── Loading state ────────────────────────────────────────────────────────────

export const LoadingState = () => (
  <Col>
    <SectionLabel>Loading — all types</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Fill" type={type} size="M" text={type} loading />
      ))}
    </Row>
    <SectionLabel>Loading — Outlined</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Outlined" type={type} size="M" text={type} loading />
      ))}
    </Row>
    <SectionLabel>Loading — Naked</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Naked" type={type} size="M" text={type} loading />
      ))}
    </Row>
    <SectionLabel>Loading — all sizes</SectionLabel>
    <Row>
      {SIZES_OPT.map(sz => (
        <Button key={sz} buttonStyle="Fill" type="Primary" size={sz} text="Saving…" loading />
      ))}
    </Row>
  </Col>
);
LoadingState.parameters = {
  docs: {
    description: {
      story:
        "The loading state replaces all content (label, icons) with an inline spinner. " +
        "The button is implicitly disabled while loading — `aria-busy='true'` is set. " +
        "The spinner colour inherits from the button's current icon token via `currentColor`.",
    },
  },
};

// ─── TokensFill ───────────────────────────────────────────────────────────────

export const TokensFill = () => (
  <div>
    {TYPES.map(type => (
      <div key={type}>
        <SectionLabel>Fill — {type}</SectionLabel>
        {[
          { suffix: "base",     description: `${type} / Fill / resting background` },
          { suffix: "hover",    description: `${type} / Fill / pointer over` },
          { suffix: "pressed",  description: `${type} / Fill / active press` },
          { suffix: "disabled", description: `${type} / Fill / non-interactive` },
        ].map(({ suffix, description }) => (
          <TokenRow
            key={suffix}
            name={`var(--semantic-color-light-mode-fill-action-${type.toLowerCase()}-${suffix})`}
            description={description}
          />
        ))}
        <SectionLabel>Outlined / Naked — {type} hover fill</SectionLabel>
        <TokenRow
          name={`var(--semantic-color-light-mode-fill-action-${type.toLowerCase()}inverse-hover)`}
          description={`${type} / hover overlay on transparent surface`}
        />
      </div>
    ))}
  </div>
);
TokensFill.parameters = {
  docs: {
    description: {
      story:
        "All `fill.action.*` tokens consumed by the Button. Fill-style buttons use solid fills; " +
        "Outlined and Naked share the `*inverse` hover/pressed overlays over a transparent base.",
    },
  },
};

// ─── TokensText ───────────────────────────────────────────────────────────────

export const TokensText = () => (
  <div>
    {TYPES.map(type => (
      <div key={type}>
        <SectionLabel>Text — Fill / {type}</SectionLabel>
        {["base", "hover", "pressed", "disabled"].map(suffix => {
          const isMono = type === "Negative";
          const isFillPrimary = type === "Primary";
          const tokenBase = isFillPrimary
            ? `text-action-primaryinverse-${suffix}`
            : isMono
            ? `text-action-mono-${suffix}`
            : `text-action-${type.toLowerCase()}-${suffix}`;
          return (
            <TokenRow
              key={suffix}
              name={`var(--semantic-color-light-mode-${tokenBase})`}
              description={`Fill / ${type} / ${suffix} label colour`}
            />
          );
        })}
        <SectionLabel>Text — Outlined & Naked / {type}</SectionLabel>
        {["base", "hover", "pressed", "disabled"].map(suffix => (
          <TokenRow
            key={suffix}
            name={`var(--semantic-color-light-mode-text-action-${type.toLowerCase()}-${suffix})`}
            description={`Outlined+Naked / ${type} / ${suffix} label colour`}
          />
        ))}
      </div>
    ))}
  </div>
);
TokensText.parameters = {
  docs: {
    description: {
      story:
        "Label colour tokens. Fill buttons use *inverse* text on their coloured surface. " +
        "Outlined and Naked use the direct action text token. Negative Fill uses `text.action.mono.*`.",
    },
  },
};

// ─── TokensStroke ─────────────────────────────────────────────────────────────

export const TokensStroke = () => (
  <div>
    {TYPES.map(type => (
      <div key={type}>
        <SectionLabel>Stroke (Outlined only) — {type}</SectionLabel>
        {["base", "hover", "pressed", "disabled"].map(suffix => {
          const tokenName = type === "Secondary"
            ? `stroke-action-secondary-inverse-${suffix}`
            : `stroke-action-${type.toLowerCase()}-${suffix}`;
          return (
            <TokenRow
              key={suffix}
              name={`var(--semantic-color-light-mode-${tokenName})`}
              description={`Outlined / ${type} / ${suffix} border colour`}
            />
          );
        })}
      </div>
    ))}
    <SectionLabel>Focus ring</SectionLabel>
    <TokenRow
      name="var(--semantic-color-light-mode-stroke-contextual-focusring-base)"
      description="Outer ring of the 6px white + 2px brand focus halo"
    />
  </div>
);
TokensStroke.parameters = {
  docs: {
    description: {
      story:
        "Border and focus-ring tokens. Outlined buttons render a 1.5px border " +
        "(`--semantic-layout-units-contextual-button-border-width-base-base`). " +
        "Fill and Naked have no border.",
    },
  },
};

// ─── TokensIcon ───────────────────────────────────────────────────────────────

export const TokensIcon = () => (
  <div>
    {TYPES.map(type => (
      <div key={type}>
        <SectionLabel>Icon — Fill / {type}</SectionLabel>
        {["base", "hover", "pressed", "disabled"].map(suffix => {
          const isMono = type === "Negative";
          const isFillPrimary = type === "Primary";
          const tokenBase = isFillPrimary
            ? `icon-action-primaryinverse-${suffix}`
            : isMono
            ? `icon-action-mono-${suffix}`
            : `icon-action-${type.toLowerCase()}-${suffix}`;
          return (
            <TokenRow
              key={suffix}
              name={`var(--semantic-color-light-mode-${tokenBase})`}
              description={`Fill / ${type} / ${suffix} icon/spinner colour`}
            />
          );
        })}
        <SectionLabel>Icon — Outlined & Naked / {type}</SectionLabel>
        {["base", "hover", "pressed", "disabled"].map(suffix => (
          <TokenRow
            key={suffix}
            name={`var(--semantic-color-light-mode-icon-action-${type.toLowerCase()}-${suffix})`}
            description={`Outlined+Naked / ${type} / ${suffix} icon/spinner colour`}
          />
        ))}
      </div>
    ))}
  </div>
);
TokensIcon.parameters = {
  docs: {
    description: {
      story:
        "Icon and spinner colour tokens. The spinner inherits via `currentColor` from the " +
        "container's `color` property, which is always set to the current icon token.",
    },
  },
};

// ─── TokensTypography ────────────────────────────────────────────────────────

const TYPOGRAPHY_ROWS = [
  {
    size: "L",
    tokenBase: "--semantic-type-desktop-label-button-l",
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "500",
    letterSpacing: "0.3px",
    role: "Size L button label",
  },
  {
    size: "M (base)",
    tokenBase: "--semantic-type-desktop-label-button-base",
    fontSize: "16px",
    lineHeight: "22px",
    fontWeight: "500",
    letterSpacing: "0.3px",
    role: "Size M button label (default)",
  },
  {
    size: "S",
    tokenBase: "--semantic-type-desktop-label-button-s",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "500",
    letterSpacing: "0.3px",
    role: "Size S button label",
  },
];

function TypographyRow({ size, tokenBase, fontSize, lineHeight, fontWeight, letterSpacing, role }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "80px 280px 160px 1fr",
      gap: 16, alignItems: "center", padding: "12px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text', sans-serif",
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#313131" }}>{size}</span>
      <div>
        <code style={{ fontSize: 11, color: "#2d4889", fontFamily: "monospace", display: "block" }}>
          {tokenBase}-fontsize
        </code>
        <code style={{ fontSize: 11, color: "#8890b0", fontFamily: "monospace", display: "block", marginTop: 2 }}>
          {tokenBase}-lineheight · -fontweight · -letterspacing
        </code>
      </div>
      <div style={{
        padding: "6px 12px",
        background: "#f5f7fb",
        border: "1px solid #edf0f9",
        borderRadius: 6,
      }}>
        <span style={{
          fontFamily: "'Red Hat Text', sans-serif",
          fontWeight: 500,
          fontSize,
          lineHeight,
          letterSpacing,
          color: "#02060d",
        }}>
          Save changes
        </span>
      </div>
      <code style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
        {fontSize} / {fontWeight} / {lineHeight} / {letterSpacing}
      </code>
    </div>
  );
}

export const TokensTypography = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 12px" }}>
      Three label type styles — one per size. All use Red Hat Text at weight 500 with{" "}
      <code style={{ fontSize: 12 }}>letter-spacing: 0.3px</code>. Only the font-size and
      line-height scale.
    </p>
    <div style={{
      display: "grid", gridTemplateColumns: "80px 280px 160px 1fr",
      gap: 16, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4,
    }}>
      {["Size", "Token", "Sample", "Values"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {TYPOGRAPHY_ROWS.map(r => <TypographyRow key={r.size} {...r} />)}
  </div>
);
TokensTypography.tags = ["!dev"];
TokensTypography.parameters = {
  docs: {
    description: {
      story:
        "Label typography tokens — one set per size (L / M / S). All three share the same " +
        "font-family, weight, and letter-spacing. Only font-size and line-height differ.",
    },
  },
};

// ─── TokensSpacing ────────────────────────────────────────────────────────────

const SPACING_ROWS = [
  { name: "Padding — L horizontal", value: "14px", token: "--semantic-layout-units-contextual-button-padding-large-horizontal",  role: "Left + right padding inside Container.Main for size L" },
  { name: "Padding — L vertical",   value: "12px", token: "--semantic-layout-units-contextual-button-padding-large-vertical",    role: "Top + bottom padding inside Container.Main for size L" },
  { name: "Padding — M horizontal", value: "12px", token: "--semantic-layout-units-contextual-button-padding-medium-horizontal", role: "Left + right padding inside Container.Main for size M (default)" },
  { name: "Padding — M vertical",   value: "10px", token: "--semantic-layout-units-contextual-button-padding-medium-vertical",   role: "Top + bottom padding inside Container.Main for size M" },
  { name: "Padding — S horizontal", value: "8px",  token: "--semantic-layout-units-contextual-button-padding-small-horizontal",  role: "Left + right padding inside Container.Main for size S" },
  { name: "Padding — S vertical",   value: "6px",  token: "--semantic-layout-units-contextual-button-padding-small-vertical",    role: "Top + bottom padding inside Container.Main for size S" },
  { name: "Icon–label gap",         value: "8px",  token: "--semantic-layout-units-contextual-button-gap-horizontal",            role: "Gap between leading/trailing icon and label text" },
  { name: "Border width (Outlined)",value: "0.75px",token: "--semantic-layout-units-contextual-button-border-width-base-base",   role: "Outlined style border thickness" },
  { name: "Touch-target padding",   value: "6px",  token: "— (hardcoded)",  role: "Transparent outer padding on <button> — ensures 48×48px minimum touch target (WCAG 2.5.5)" },
  { name: "Touch target min-size",  value: "48px", token: "— (hardcoded)",  role: "Minimum interactive area enforced by outer <button> min-height + min-width" },
];

function SpacingRow({ name, value, token, role }) {
  const noToken = token.startsWith("—");
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "200px 60px 360px 1fr",
      gap: 12, alignItems: "center", padding: "8px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text', sans-serif",
    }}>
      <span style={{ fontSize: 12, color: "#313131" }}>{name}</span>
      <code style={{ fontSize: 12, fontWeight: 600, color: "#2d4889", fontFamily: "monospace" }}>{value}</code>
      <code style={{ fontSize: 11, color: noToken ? "#bbb" : "#2d4889", fontFamily: "monospace" }}>{token}</code>
      <span style={{ fontSize: 11, color: "#8890b0" }}>{role}</span>
    </div>
  );
}

export const TokensSpacing = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 12px" }}>
      Padding, gap, border-width, and touch-target values. Grey token names have no
      design token yet — they are hardcoded in the component.
    </p>
    <div style={{
      display: "grid", gridTemplateColumns: "200px 60px 360px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4,
    }}>
      {["Property", "Value", "Token", "Role"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {SPACING_ROWS.map(r => <SpacingRow key={r.name} {...r} />)}
  </div>
);
TokensSpacing.tags = ["!dev"];
TokensSpacing.parameters = {
  docs: {
    description: {
      story:
        "Padding scales across L / M / S sizes, plus the icon–label gap, border width, and touch-target " +
        "floor. Grey entries have no token yet — they are hardcoded constants in button.jsx.",
    },
  },
};

// ─── TokensMotion ─────────────────────────────────────────────────────────────

const MOTION_ROWS = [
  {
    name: "State transition",
    duration: "150ms",
    curve: "ease",
    token: "— (standard)",
    properties: "background-color · border-color · box-shadow · color",
    rationale: "Hover, pressed, focused fill and colour changes — instant-class per the system standard",
  },
  {
    name: "Spinner rotation",
    duration: "750ms",
    curve: "linear infinite",
    token: "— (hardcoded)",
    properties: "transform: rotate (pw-btn-spin keyframe)",
    rationale: "Loading indicator rotation — continuous loop, not tied to interaction",
  },
];

function MotionRow({ name, duration, curve, token, properties, rationale }) {
  const hasToken = !token.startsWith("—");
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "160px 80px 200px 220px 1fr",
      gap: 12, alignItems: "center", padding: "10px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text', sans-serif",
    }}>
      <span style={{ fontSize: 12, color: "#313131", fontWeight: 500 }}>{name}</span>
      <code style={{ fontSize: 12, fontWeight: 600, color: "#2d4889", fontFamily: "monospace" }}>{duration}</code>
      <code style={{ fontSize: 11, color: hasToken ? "#2d4889" : "#bbb", fontFamily: "monospace" }}>{token}</code>
      <code style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>{curve}</code>
      <span style={{ fontSize: 11, color: "#8890b0" }}>{rationale}</span>
    </div>
  );
}

export const TokensMotion = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 12px" }}>
      Button motion is intentionally minimal. State transitions (hover, pressed, focus ring)
      use the system-standard 150 ms / ease — fast enough to feel instant. The spinner
      rotation is a continuous loop and not part of the interaction model.
      All motion is suppressed under{" "}
      <code style={{ fontSize: 12 }}>prefers-reduced-motion: reduce</code>.
    </p>
    <div style={{
      display: "grid", gridTemplateColumns: "160px 80px 200px 220px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4,
    }}>
      {["Property", "Duration", "Token", "Curve", "Rationale"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {MOTION_ROWS.map(r => <MotionRow key={r.name} {...r} />)}
  </div>
);
TokensMotion.tags = ["!dev"];
TokensMotion.parameters = {
  docs: {
    description: {
      story:
        "Motion values for the Button. Both are hardcoded — no motion token family exists in the " +
        "Pathway token file yet. State transitions follow the system-standard 150ms / ease.",
    },
  },
};

// ─── TokensRadius ─────────────────────────────────────────────────────────────

const RADIUS_ROWS = [
  {
    name: "Container.Main",
    value: "8px",
    token: "--semantic-layout-units-contextual-button-radius-radius",
    role: "Visible button surface — all sizes, all styles",
  },
  {
    name: "Outer <button>",
    value: "0px",
    token: "— (no token)",
    role: "Touch-target wrapper has no radius — it is transparent and never visually borders",
  },
];

function RadiusRow({ name, value, token, role }) {
  const noToken = token.startsWith("—");
  const r = parseInt(value) || 0;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "180px 80px 380px 1fr",
      gap: 12, alignItems: "center", padding: "10px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text', sans-serif",
    }}>
      <span style={{ fontSize: 12, color: "#313131" }}>{name}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32,
          border: "1.5px solid #2d4889",
          borderRadius: r,
          background: "rgba(160,181,230,0.12)",
        }} />
        <code style={{ fontSize: 12, fontWeight: 600, color: "#2d4889", fontFamily: "monospace" }}>{value}</code>
      </div>
      <code style={{ fontSize: 11, color: noToken ? "#bbb" : "#2d4889", fontFamily: "monospace" }}>{token}</code>
      <span style={{ fontSize: 11, color: "#8890b0" }}>{role}</span>
    </div>
  );
}

export const TokensRadius = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 12px" }}>
      The Button uses a single radius value (8px / Radius/M) on the visible{" "}
      <code style={{ fontSize: 12 }}>Container.Main</code>. The outer{" "}
      <code style={{ fontSize: 12 }}>&lt;button&gt;</code> touch-target wrapper is transparent
      and has no radius.
    </p>
    <div style={{
      display: "grid", gridTemplateColumns: "180px 80px 380px 1fr",
      gap: 12, padding: "6px 0", borderBottom: "2px solid #edf0f9", marginBottom: 4,
    }}>
      {["Element", "Value", "Token", "Role"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b4b4b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
      ))}
    </div>
    {RADIUS_ROWS.map(r => <RadiusRow key={r.name} {...r} />)}
  </div>
);
TokensRadius.tags = ["!dev"];
TokensRadius.parameters = {
  docs: {
    description: {
      story:
        "Border-radius values for the Button. Container.Main uses Radius/M (8px) at all sizes " +
        "and styles. The outer touch-target wrapper is transparent and has no radius.",
    },
  },
};

// ─── StandaloneDemo ───────────────────────────────────────────────────────────

export const StandaloneDemo = () => (
  <iframe
    src="/components/button/button.html"
    title="Button standalone demo"
    style={{ width: "100%", height: 700, border: "none", borderRadius: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}
  />
);
StandaloneDemo.parameters = {
  docs: {
    description: {
      story:
        "The self-contained HTML demo (`components/button/button.html`). " +
        "Resize the Storybook panel to test responsive behaviour.",
    },
  },
  layout: "fullscreen",
};
