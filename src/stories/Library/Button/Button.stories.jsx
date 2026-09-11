/**
 * Button - Storybook stories
 *
 * Playground · StateMatrix · ElementExplorer · AllSizes · IconVariants · LoadingState
 * · TokensFill · TokensForeground · TokensStroke
 * · TokensTypography · TokensSpacing · TokensMotion · TokensRadius
 * · StandaloneDemo
 *
 * Authoritative spec: components/button/button-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003293-93741
 */

import React, { useState } from "react";
import { Button, ButtonSpinner, T, SIZES, FILL, FG, STROKE } from "../../../../components/button/button.jsx";

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
  const [hex, setHex] = useState("-");

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
      description: "Fill - solid surface. Outlined - bordered transparent. Naked - no border or fill.",
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
  docs: { description: { story: "Full-featured sandbox - toggle any prop." } },
};

// ─── StateMatrix ──────────────────────────────────────────────────────────────

export const StateMatrix = () => {
  // forceState drives visual-only state simulation - no real interaction needed.
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
        "disabled / loading). Every cell is a live component - not a screenshot.",
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
    <SectionLabel>Sizes - Fill / Primary</SectionLabel>
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
    <SectionLabel>Sizes - Outlined / Primary</SectionLabel>
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
    <SectionLabel>Icon only - all types / Outlined</SectionLabel>
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
        "Leading icon · trailing icon · icon-only. The gap between icon and label is `--contextual-layout-units-button-gap-horizontal` (8px).",
    },
  },
};

// ─── Loading state ────────────────────────────────────────────────────────────

export const LoadingState = () => (
  <Col>
    <SectionLabel>Loading - all types</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Fill" type={type} size="M" text={type} loading />
      ))}
    </Row>
    <SectionLabel>Loading - Outlined</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Outlined" type={type} size="M" text={type} loading />
      ))}
    </Row>
    <SectionLabel>Loading - Naked</SectionLabel>
    <Row>
      {TYPES.map(type => (
        <Button key={type} buttonStyle="Naked" type={type} size="M" text={type} loading />
      ))}
    </Row>
    <SectionLabel>Loading - all sizes</SectionLabel>
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
        "The button is implicitly disabled while loading - `aria-busy='true'` is set. " +
        "The spinner colour inherits from the button's current icon token via `currentColor`.",
    },
  },
};

// ─── Colour token stories ─────────────────────────────────────────────────────
//
// These four stories are GENERATED from the component's own token tables, which
// button.jsx exports as FILL, FG and STROKE. They are not a hand-written list.
//
// WHY: until 2026-09-09 they WERE a hand-written list, and every name in it was
// wrong. They templated `--semantic-color-light-mode-fill-action-...`, a
// mode-in-name form that died with tokens.css on 2026-09-03; they named
// Tertiary and *inverse families that were deleted; they used `text-` and
// `icon-` tiers that merged into `foreground-`; and they suffixed `base` where
// the tokens now say `rest`. Every row rendered an empty swatch and a "-" hex,
// because TokenRow resolves the variable for real and a name that resolves to
// nothing has nothing to show.
//
// Reading the tables from the component makes that class of drift impossible:
// there is one list of names, the component's, and it is the list that ships.
// A token rename now moves these rows automatically or breaks the build.

// The state keys the component's tables actually use.
const TOKEN_STATES = ["base", "hover", "pressed", "disabled"];

// `base` is the table's key for the resting state; the token it points at is
// named `rest`. Both names are correct in their own layer, so the label says
// which is which rather than pretending they are the same word.
const STATE_LABEL = { base: "rest", hover: "hover", pressed: "pressed", disabled: "disabled" };

/** Render one style x type block from a component token table. */
function TokenBlock({ table, styleName, type, describe }) {
  const row = table[styleName] && table[styleName][type];
  if (!row) return null;
  return (
    <div key={styleName + type}>
      <SectionLabel>{styleName} - {type}</SectionLabel>
      {TOKEN_STATES.map((state) => {
        const value = row[state];
        if (!value) return null;
        // A table entry can be the literal "transparent" rather than a var(),
        // which is a real answer for Outlined and Naked at rest. Show it as
        // such instead of rendering a swatch of nothing.
        if (!String(value).startsWith("var(")) {
          return (
            <div
              key={state}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0",
                borderBottom: "1px solid #f0f1f5", fontFamily: "'Red Hat Text', sans-serif" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                border: "1px dashed #c9cde0",
                background: "repeating-conic-gradient(#f4f4f6 0% 25%, #fff 0% 50%) 50%/10px 10px" }} />
              <code style={{ fontSize: 12, color: "#3a3f5c", flex: "0 0 360px" }}>{String(value)}</code>
              <code style={{ fontSize: 12, color: "#8890b0", flex: "0 0 96px" }}>-</code>
              <span style={{ fontSize: 12, color: "#8890b0" }}>
                {describe(styleName, type, STATE_LABEL[state])} (no fill at rest by design)
              </span>
            </div>
          );
        }
        return (
          <TokenRow
            key={state}
            name={value}
            description={describe(styleName, type, STATE_LABEL[state])}
          />
        );
      })}
    </div>
  );
}

// ─── TokensFill ───────────────────────────────────────────────────────────────

export const TokensFill = () => (
  <div>
    {["Fill", "Outlined"].map((styleName) =>
      TYPES.map((type) => (
        <TokenBlock
          key={styleName + type}
          table={FILL}
          styleName={styleName}
          type={type}
          describe={(s, t, st) => `${t} / ${s} / ${st} background`}
        />
      ))
    )}
  </div>
);
TokensFill.parameters = {
  docs: {
    description: {
      story:
        "Every background token the Button resolves, read straight from the component's FILL table. " +
        "Fill-style buttons carry a solid background. Outlined and Naked rest on `transparent` and " +
        "tint on interaction from the Dim ramps, which is what the retired `*inverse` hover tokens " +
        "used to do. Naked shares Outlined's table exactly, so it is not repeated. " +
        "Disabled is ONE token per tier rather than one per type: a disabled control is the same " +
        "colour whatever it would otherwise have been.",
    },
  },
};

// ─── TokensForeground ─────────────────────────────────────────────────────────

export const TokensForeground = () => (
  <div>
    {["Fill", "Outlined"].map((styleName) =>
      TYPES.map((type) => (
        <TokenBlock
          key={styleName + type}
          table={FG}
          styleName={styleName}
          type={type}
          describe={(s, t, st) => `${t} / ${s} / ${st} label and icon colour`}
        />
      ))
    )}
  </div>
);
TokensForeground.parameters = {
  docs: {
    description: {
      story:
        "Label and icon colour, which are now ONE tier. Text and Icon merged into Foreground on " +
        "2026-09-03 because every pair held the same value; keeping them apart doubled the contract " +
        "while never letting a button's label and its icon differ. The merge is also a correctness " +
        "guard: a button is one interactive surface, so its label and icon must not resolve through " +
        "two ramps that can drift. On a solid fill the foreground is Mono, which has only a `rest` " +
        "step, so all three interaction states share it - white stays white through hover and press.",
    },
  },
};

// ─── TokensStroke ─────────────────────────────────────────────────────────────

export const TokensStroke = () => (
  <div>
    {TYPES.map((type) => (
      <TokenBlock
        key={type}
        table={{ Outlined: STROKE }}
        styleName="Outlined"
        type={type}
        describe={(s, t, st) => `Outlined / ${t} / ${st} border colour`}
      />
    ))}
    <SectionLabel>Focus ring</SectionLabel>
    <TokenRow
      name="var(--semantic-color-stroke-focusring-base)"
      description="Brand ring of the 6px white + 9px brand focus halo"
    />
  </div>
);
TokensStroke.parameters = {
  docs: {
    description: {
      story:
        "Border tokens, Outlined only - Fill and Naked have no border. There is no Primary Dim " +
        "stroke ramp, so Tertiary borrows the Primary stroke; that is a deliberate reuse, recorded " +
        "here so it does not read as a mistake. The border width comes from " +
        "`--contextual-layout-units-button-border-width-base-base` (0.75px), not from a colour token. " +
        "Focus ring moved out of the retired Contextual group to Stroke/FocusRing and is a single " +
        "token shared by every focusable component.",
    },
  },
};
// ─── TokensTypography ────────────────────────────────────────────────────────

// TYPOGRAPHY_ROWS is DERIVED from the component's SIZES table, not written out.
//
// WHY: the hand-written version claimed every size used
// `letter-spacing-spacious` at 0.3px. The component uses
// `letter-spacing-compact`, which is 0. It also listed only L, M and S, so XS -
// added 2026-06-11 - was undocumented. Both errors are the same error: a second
// copy of a fact that already lived in the code.
//
// SIZES stores each value as a `var(--semantic-type-...)` string, so the token
// name is recovered from the var() and the rendered sample uses the var()
// directly. That means the sample is drawn by the real token, not by a px
// number retyped alongside it, so the two cannot disagree.
const varName = (v) => String(v || "").replace(/^var\((.+)\)$/, "$1");

const TYPOGRAPHY_ROWS = Object.entries(SIZES).map(([size, s]) => ({
  size: size === "M" ? "M (base)" : size,
  typeTokens: [
    varName(s.fontSize),
    varName(s.fontWeight),
    varName(s.lineHeight),
    varName(s.letterSpacing),
  ].join("  +  "),
  // Passed through as var() so the browser resolves them; a broken token shows
  // up as visibly unstyled text rather than as a plausible wrong number.
  fontSize: s.fontSize,
  lineHeight: s.lineHeight,
  fontWeight: s.fontWeight,
  letterSpacing: s.letterSpacing,
  role: `Size ${size} button label${size === "M" ? " (default)" : ""}`,
}));
/**
 * Read back what the four type tokens actually computed to.
 *
 * The previous version printed hand-typed px numbers next to the token names.
 * That is how the table came to claim 0.3px tracking for a button that uses 0:
 * the number and the token were two facts, and only one of them shipped. This
 * asks the browser instead, so the column cannot disagree with the sample
 * beside it.
 */
function ResolvedType({ fontSize, fontWeight, lineHeight, letterSpacing }) {
  const [vals, setVals] = useState(null);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const cs = window.getComputedStyle(document.documentElement);
    const get = (v) => cs.getPropertyValue(varName(v)).trim() || "?";
    setVals([get(fontSize), get(fontWeight), get(lineHeight), get(letterSpacing)]);
  }, [fontSize, fontWeight, lineHeight, letterSpacing]);
  return (
    <code style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
      {vals ? vals.join(" / ") : "resolving..."}
    </code>
  );
}

function TypographyRow({ size, typeTokens, fontSize, lineHeight, fontWeight, letterSpacing, role }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "90px 360px 1fr 130px",
      gap: 16, alignItems: "center", padding: "12px 0",
      borderBottom: "1px solid #f0f1f4", fontFamily: "'Red Hat Text', sans-serif",
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#313131" }}>{size}</span>
      <div>
        <code style={{ fontSize: 11, color: "#2d4889", fontFamily: "monospace", display: "block" }}>
          {typeTokens}
        </code>
        <code style={{ fontSize: 11, color: "#8890b0", fontFamily: "monospace", display: "block", marginTop: 2 }}>
          composed from the Semantic: Type scale
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
      <ResolvedType fontSize={fontSize} fontWeight={fontWeight}
        lineHeight={lineHeight} letterSpacing={letterSpacing} />
    </div>
  );
}

export const TokensTypography = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif" }}>
    <p style={{ fontSize: 13, color: "#4b4b4b", margin: "0 0 12px" }}>
      Three label type styles - one per size. All use Red Hat Text at weight 500 with{" "}
      <code style={{ fontSize: 12 }}>letter-spacing: 0.3px</code>. Only the font-size and
      line-height scale.
    </p>
    <div style={{
      display: "grid", gridTemplateColumns: "90px 360px 1fr 130px",
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
        "Label typography tokens - one set per size (L / M / S). All three share the same " +
        "font-family, weight, and letter-spacing. Only font-size and line-height differ.",
    },
  },
};

// ─── TokensSpacing ────────────────────────────────────────────────────────────

const SPACING_ROWS = [
  { name: "Padding - L horizontal", value: "14px", token: "--contextual-layout-units-button-padding-large-horizontal",  role: "Left + right padding inside Container.Main for size L" },
  { name: "Padding - L vertical",   value: "12px", token: "--contextual-layout-units-button-padding-large-vertical",    role: "Top + bottom padding inside Container.Main for size L" },
  { name: "Padding - M horizontal", value: "12px", token: "--contextual-layout-units-button-padding-medium-horizontal", role: "Left + right padding inside Container.Main for size M (default)" },
  { name: "Padding - M vertical",   value: "10px", token: "--contextual-layout-units-button-padding-medium-vertical",   role: "Top + bottom padding inside Container.Main for size M" },
  { name: "Padding - S horizontal", value: "8px",  token: "--contextual-layout-units-button-padding-small-horizontal",  role: "Left + right padding inside Container.Main for size S" },
  { name: "Padding - S vertical",   value: "6px",  token: "--contextual-layout-units-button-padding-small-vertical",    role: "Top + bottom padding inside Container.Main for size S" },
  { name: "Icon–label gap",         value: "8px",  token: "--contextual-layout-units-button-gap-horizontal",            role: "Gap between leading/trailing icon and label text" },
  { name: "Border width (Outlined)",value: "0.75px",token: "--contextual-layout-units-button-border-width-base-base",   role: "Outlined style border thickness" },
  { name: "Touch-target padding",   value: "6px",  token: "- (hardcoded)",  role: "Transparent outer padding on <button> - ensures 48×48px minimum touch target (WCAG 2.5.5)" },
  { name: "Touch target min-size",  value: "48px", token: "- (hardcoded)",  role: "Minimum interactive area enforced by outer <button> min-height + min-width" },
];

function SpacingRow({ name, value, token, role }) {
  const noToken = token.startsWith("-");
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
      design token yet - they are hardcoded in the component.
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
        "floor. Grey entries have no token yet - they are hardcoded constants in button.jsx.",
    },
  },
};

// ─── TokensMotion ─────────────────────────────────────────────────────────────

const MOTION_ROWS = [
  {
    name: "State transition",
    duration: "150ms",
    curve: "ease",
    token: "- (standard)",
    properties: "background-color · border-color · box-shadow · color",
    rationale: "Hover, pressed, focused fill and colour changes - instant-class per the system standard",
  },
  {
    name: "Spinner rotation",
    duration: "750ms",
    curve: "linear infinite",
    token: "- (hardcoded)",
    properties: "transform: rotate (pw-btn-spin keyframe)",
    rationale: "Loading indicator rotation - continuous loop, not tied to interaction",
  },
];

function MotionRow({ name, duration, curve, token, properties, rationale }) {
  const hasToken = !token.startsWith("-");
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
      use the system-standard 150 ms / ease - fast enough to feel instant. The spinner
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
        "Motion values for the Button. Both are hardcoded - no motion token family exists in the " +
        "Pathway token file yet. State transitions follow the system-standard 150ms / ease.",
    },
  },
};

// ─── TokensRadius ─────────────────────────────────────────────────────────────

const RADIUS_ROWS = [
  {
    name: "Container.Main",
    value: "8px",
    token: "--contextual-layout-units-button-radius-radius",
    role: "Visible button surface - all sizes, all styles",
  },
  {
    name: "Outer <button>",
    value: "0px",
    token: "- (no token)",
    role: "Touch-target wrapper has no radius - it is transparent and never visually borders",
  },
];

function RadiusRow({ name, value, token, role }) {
  const noToken = token.startsWith("-");
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
