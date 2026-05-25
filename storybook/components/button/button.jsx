/**
 * Button — Pathway Design System
 *
 * Importable React component module. Source of truth for the Button
 * implementation; the standalone demo (button.html) and the Storybook
 * stories both consume this.
 *
 * Spec:  components/button/button-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003293-93741
 */

import React, { useState, useEffect } from "react";

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────
// Returns a CSS var() string for a semantic token.
// SC = semantic-color (light mode)   SL = semantic-layout-units
// ST = semantic-type (desktop)
const SC = (p) => `var(--semantic-color-light-mode-${p})`;
const SL = (p) => `var(--semantic-layout-units-${p})`;
const ST = (p) => `var(--semantic-type-desktop-${p})`;

// ─── FILL TOKENS ──────────────────────────────────────────────────────────────
// Background colour by (buttonStyle, type, interactionState).
// Outlined/Naked use transparent base + light overlay on hover/pressed.
const FILL = {
  Fill: {
    Primary:   { base: SC("fill-action-primary-base"),              hover: SC("fill-action-primary-hover"),              pressed: SC("fill-action-primary-pressed"),              disabled: SC("fill-action-primary-disabled")              },
    Secondary: { base: SC("fill-action-secondary-base"),            hover: SC("fill-action-secondary-hover"),            pressed: SC("fill-action-secondary-pressed"),            disabled: SC("fill-action-secondaryinverse-disabled")     },
    Tertiary:  { base: SC("fill-action-tertiary-base"),             hover: SC("fill-action-tertiary-inverse-hover"),     pressed: SC("fill-action-tertiary-inverse-pressed"),     disabled: SC("fill-action-tertiary-disabled")             },
    Negative:  { base: SC("fill-action-negative-base"),             hover: SC("fill-action-negative-hover"),             pressed: SC("fill-action-negative-pressed"),             disabled: SC("fill-action-negative-disabled")             },
  },
  Outlined: {
    Primary:   { base: "transparent",                               hover: SC("fill-action-primaryinverse-hover"),       pressed: SC("fill-action-primaryinverse-pressed"),       disabled: "transparent"                                   },
    Secondary: { base: "transparent",                               hover: SC("fill-action-secondary-hover"),            pressed: SC("fill-action-secondary-pressed"),            disabled: "transparent"                                   },
    Tertiary:  { base: SC("fill-action-tertiary-inverse-base"),     hover: SC("fill-action-tertiary-inverse-hover"),     pressed: SC("fill-action-tertiary-inverse-pressed"),     disabled: "transparent"                                   },
    Negative:  { base: "transparent",                               hover: SC("fill-action-negativeinverse-hover"),      pressed: SC("fill-action-negativeinverse-pressed"),      disabled: "transparent"                                   },
  },
  Naked: {
    Primary:   { base: "transparent",                               hover: SC("fill-action-primaryinverse-hover"),       pressed: SC("fill-action-primaryinverse-pressed"),       disabled: "transparent"                                   },
    Secondary: { base: "transparent",                               hover: SC("fill-action-secondary-hover"),            pressed: SC("fill-action-secondary-pressed"),            disabled: "transparent"                                   },
    Tertiary:  { base: "transparent",                               hover: SC("fill-action-tertiary-inverse-hover"),     pressed: SC("fill-action-tertiary-inverse-pressed"),     disabled: "transparent"                                   },
    Negative:  { base: "transparent",                               hover: SC("fill-action-negativeinverse-hover"),      pressed: SC("fill-action-negativeinverse-pressed"),      disabled: "transparent"                                   },
  },
};

// ─── TEXT TOKENS ───────────────────────────────────────────────────────────────
// Fill buttons use *inverse* text (light on dark). Outlined/Naked use direct type text.
const TEXT = {
  Fill: {
    Primary:   { base: SC("text-action-primaryinverse-base"), hover: SC("text-action-primaryinverse-hover"), pressed: SC("text-action-primaryinverse-pressed"), disabled: SC("text-action-primaryinverse-disabled") },
    Secondary: { base: SC("text-action-secondary-base"),      hover: SC("text-action-secondary-hover"),      pressed: SC("text-action-secondary-pressed"),      disabled: SC("text-action-secondary-disabled")      },
    Tertiary:  { base: SC("text-action-tertiary-base"),       hover: SC("text-action-tertiary-hover"),       pressed: SC("text-action-tertiary-pressed"),       disabled: SC("text-action-tertiary-disabled")       },
    Negative:  { base: SC("text-action-mono-base"),           hover: SC("text-action-mono-hover"),           pressed: SC("text-action-mono-pressed"),           disabled: SC("text-action-mono-disabled")           },
  },
  Outlined: {
    Primary:   { base: SC("text-action-primary-base"),   hover: SC("text-action-primary-hover"),   pressed: SC("text-action-primary-pressed"),   disabled: SC("text-action-primary-disabled")   },
    Secondary: { base: SC("text-action-secondary-base"), hover: SC("text-action-secondary-hover"), pressed: SC("text-action-secondary-pressed"), disabled: SC("text-action-secondary-disabled") },
    Tertiary:  { base: SC("text-action-tertiary-base"),  hover: SC("text-action-tertiary-hover"),  pressed: SC("text-action-tertiary-pressed"),  disabled: SC("text-action-tertiary-disabled")  },
    Negative:  { base: SC("text-action-negative-base"),  hover: SC("text-action-negative-hover"),  pressed: SC("text-action-negative-pressed"),  disabled: SC("text-action-negative-disabled")  },
  },
};
TEXT.Naked = TEXT.Outlined;

// ─── ICON TOKENS ───────────────────────────────────────────────────────────────
const ICON = {
  Fill: {
    Primary:   { base: SC("icon-action-primaryinverse-base"), hover: SC("icon-action-primaryinverse-hover"), pressed: SC("icon-action-primaryinverse-pressed"), disabled: SC("icon-action-primaryinverse-disabled") },
    Secondary: { base: SC("icon-action-secondary-base"),      hover: SC("icon-action-secondary-hover"),      pressed: SC("icon-action-secondary-pressed"),      disabled: SC("icon-action-secondary-disabled")      },
    Tertiary:  { base: SC("icon-action-tertiary-base"),       hover: SC("icon-action-tertiary-hover"),       pressed: SC("icon-action-tertiary-pressed"),       disabled: SC("icon-action-tertiary-disabled")       },
    Negative:  { base: SC("icon-action-mono-base"),           hover: SC("icon-action-mono-hover"),           pressed: SC("icon-action-mono-pressed"),           disabled: SC("icon-action-mono-disabled")           },
  },
  Outlined: {
    Primary:   { base: SC("icon-action-primary-base"),   hover: SC("icon-action-primary-hover"),   pressed: SC("icon-action-primary-pressed"),   disabled: SC("icon-action-primary-disabled")   },
    Secondary: { base: SC("icon-action-secondary-base"), hover: SC("icon-action-secondary-hover"), pressed: SC("icon-action-secondary-pressed"), disabled: SC("icon-action-secondary-disabled") },
    Tertiary:  { base: SC("icon-action-tertiary-base"),  hover: SC("icon-action-tertiary-hover"),  pressed: SC("icon-action-tertiary-pressed"),  disabled: SC("icon-action-tertiary-disabled")  },
    Negative:  { base: SC("icon-action-negative-base"),  hover: SC("icon-action-negative-hover"),  pressed: SC("icon-action-negative-pressed"),  disabled: SC("icon-action-negative-disabled")  },
  },
};
ICON.Naked = ICON.Outlined;

// ─── STROKE TOKENS (Outlined only) ────────────────────────────────────────────
const STROKE = {
  Primary:   { base: SC("stroke-action-primary-base"),                 hover: SC("stroke-action-primary-hover"),                 pressed: SC("stroke-action-primary-pressed"),                 disabled: SC("stroke-action-primary-disabled")                 },
  Secondary: { base: SC("stroke-action-secondary-inverse-base"),       hover: SC("stroke-action-secondary-inverse-hover"),       pressed: SC("stroke-action-secondary-inverse-pressed"),       disabled: SC("stroke-action-secondary-inverse-disabled")       },
  Tertiary:  { base: SC("stroke-action-tertiary-base"),                hover: SC("stroke-action-tertiary-hover"),                pressed: SC("stroke-action-tertiary-pressed"),                disabled: SC("stroke-action-tertiary-disabled")                },
  Negative:  { base: SC("stroke-action-negative-base"),                hover: SC("stroke-action-negative-hover"),                pressed: SC("stroke-action-negative-pressed"),                disabled: SC("stroke-action-negative-disabled")                },
};

// ─── LAYOUT & FOCUS TOKENS ────────────────────────────────────────────────────
// Touch target: 48×48 minimum with 6px outer padding (WCAG 2.5.5 target size).
// Focus ring: 6px white halo + 2px brand ring (box-shadow on Container.Main).
export const T = {
  radius:      SL("cornerradius-medium"),                                   // 8px
  border:      SL("contextual-button-border-width-base-base"),              // 1.5px
  gap:         SL("contextual-button-gap-horizontal"),                      // 8px
  touch:       { pad: 6, min: 48 },
  focusShadow: `0 0 0 6px #ffffff, 0 0 0 8px ${SC("stroke-contextual-focusring-base")}`,
};

// ─── SIZE TABLE ────────────────────────────────────────────────────────────────
// padH / padV for Size L are hardcoded: no semantic button-large-padding tokens
// exist yet in the token file. Figma source: "New group/Horizontal" (14px) and
// "Contextual/Vertical" (12px). Flagged as HIGH gap in spec §15.
export const SIZES = {
  L: {
    padH:       14,                                          // no CSS var — see §15
    padV:       12,                                          // no CSS var — see §15
    iconWrap:   26,
    iconInner:  18,
    fontSize:   18,                                          // no CSS var — see §15
    fontFamily: ST("label-button-l-fontfamily"),
    fontWeight: ST("label-button-l-fontweight"),
    lineHeight: ST("label-button-l-lineheight"),
    letterSpacing: ST("label-button-l-letterspacing"),
  },
  M: {
    padH:       SL("contextual-button-padding-medium-horizontal"),
    padV:       SL("contextual-button-padding-medium-vertical"),
    iconWrap:   24,
    iconInner:  16,
    fontSize:   16,                                          // no CSS var — see §15
    fontFamily: ST("label-button-base-fontfamily"),
    fontWeight: ST("label-button-base-fontweight"),
    lineHeight: ST("label-button-base-lineheight"),
    letterSpacing: ST("label-button-base-letterspacing"),
  },
  S: {
    padH:       SL("contextual-button-padding-small-horizontal"),
    padV:       SL("contextual-button-padding-small-vertical"),
    iconWrap:   20,
    iconInner:  14,
    fontSize:   14,                                          // no CSS var — see §15
    fontFamily: ST("label-button-s-fontfamily"),
    fontWeight: ST("label-button-s-fontweight"),
    lineHeight: ST("label-button-s-lineheight"),
    letterSpacing: ST("label-button-s-letterspacing"),
  },
};

// ─── SPINNER SPOKE DATA (from Pathway Spinner component) ───────────────────────
const SPINNER_SPOKES = [
  { d: "M6 1V3",             opacity: 1.00 },
  { d: "M8.1 3.9L9.55 2.45", opacity: 0.87 },
  { d: "M9 6H11",            opacity: 0.75 },
  { d: "M8.1 8.1L9.55 9.55", opacity: 0.62 },
  { d: "M6 9V11",            opacity: 0.50 },
  { d: "M2.45 9.55L3.9 8.1", opacity: 0.37 },
  { d: "M1 6H3",             opacity: 0.25 },
  { d: "M2.45 2.45L3.9 3.9", opacity: 0.12 },
];

// Inject the keyframe animation once into the document head.
let _keyframeInjected = false;
function ensureSpinKeyframe() {
  if (_keyframeInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent =
    "@keyframes pw-btn-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }" +
    "@media (prefers-reduced-motion: reduce) { .pw-btn-spinner { animation: none !important; } }";
  document.head.appendChild(style);
  _keyframeInjected = true;
}

// ─── ButtonSpinner ─────────────────────────────────────────────────────────────
// Inline 8-spoke spinner for the loading state. Uses currentColor so the
// caller controls colour via the CSS `color` property.
export function ButtonSpinner({ size = 20 }) {
  return (
    <svg
      className="pw-btn-spinner"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      aria-hidden="true"
      style={{
        animation: "pw-btn-spin 0.75s linear infinite",
        flexShrink: 0,
        display: "block",
      }}
    >
      {SPINNER_SPOKES.map((spoke, i) => (
        <path
          key={i}
          d={spoke.d}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity={spoke.opacity}
        />
      ))}
    </svg>
  );
}

// ─── Button ────────────────────────────────────────────────────────────────────
/**
 * Props:
 *   buttonStyle  — "Fill" | "Outlined" | "Naked"   (default: "Fill")
 *   size         — "L" | "M" | "S"                 (default: "M")
 *   type         — "Primary" | "Secondary" | "Tertiary" | "Negative"  (default: "Primary")
 *   text         — button label                     (default: "Button")
 *   leadingIcon  — React node (Material Symbol span or custom) | null
 *   trailingIcon — React node | null
 *   showLeadingIcon  — bool (default: false)
 *   showTrailingIcon — bool (default: false)
 *   showText     — bool (default: true)
 *   loading      — bool — replaces content with spinner, sets aria-busy
 *   disabled     — bool — prevents interaction, sets aria-disabled
 *   onClick      — (e) => void
 *   ariaLabel    — overrides accessible name (required when showText=false)
 *   className    — extra CSS class on the outer <button>
 */
export function Button({
  buttonStyle = "Fill",
  size        = "M",
  type        = "Primary",
  text        = "Button",
  leadingIcon  = null,
  trailingIcon = null,
  showLeadingIcon  = false,
  showTrailingIcon = false,
  showText    = true,
  loading     = false,
  disabled    = false,
  onClick,
  ariaLabel,
  className   = "",
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => { ensureSpinKeyframe(); }, []);

  const isDisabled = disabled || loading;

  // Resolve interaction state → token lookup key
  const stateKey = isDisabled ? "disabled"
    : pressed  ? "pressed"
    : hovered  ? "hover"
    : "base";

  const fillTokens   = FILL[buttonStyle]?.[type]  || FILL.Fill.Primary;
  const textTokens   = TEXT[buttonStyle]?.[type]  || TEXT.Fill.Primary;
  const iconTokens   = ICON[buttonStyle]?.[type]  || ICON.Fill.Primary;
  const strokeTokens = STROKE[type] || STROKE.Primary;
  const sz           = SIZES[size] || SIZES.M;

  const bgColor     = fillTokens[stateKey];
  const textColor   = textTokens[stateKey];
  const iconColor   = iconTokens[stateKey];
  const strokeColor = strokeTokens[stateKey];

  const hasStroke = buttonStyle === "Outlined";

  // Container.Main styles (the visible button surface)
  const containerStyle = {
    display:          "inline-flex",
    alignItems:       "center",
    justifyContent:   "center",
    paddingLeft:      typeof sz.padH === "number" ? `${sz.padH}px` : sz.padH,
    paddingRight:     typeof sz.padH === "number" ? `${sz.padH}px` : sz.padH,
    paddingTop:       typeof sz.padV === "number" ? `${sz.padV}px` : sz.padV,
    paddingBottom:    typeof sz.padV === "number" ? `${sz.padV}px` : sz.padV,
    borderRadius:     T.radius,
    backgroundColor:  bgColor,
    border:           hasStroke ? `${T.border} solid ${strokeColor}` : "none",
    gap:              T.gap,
    flex:             "1 0 0",
    minWidth:         0,
    boxShadow:        focused && !isDisabled ? T.focusShadow : "none",
    transition:       "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, color 150ms ease",
    color:            iconColor,  // propagated to icons via currentColor
  };

  // Label styles
  const labelStyle = {
    fontFamily:    sz.fontFamily,
    fontWeight:    sz.fontWeight,
    lineHeight:    sz.lineHeight,
    letterSpacing: sz.letterSpacing,
    fontSize:      sz.fontSize,
    color:         textColor,
    whiteSpace:    "nowrap",
    transition:    "color 150ms ease",
    userSelect:    "none",
  };

  // Icon slot wrapper
  const iconWrapStyle = {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    width:          sz.iconWrap,
    height:         sz.iconWrap,
    flexShrink:     0,
    fontSize:       sz.iconInner,
    color:          iconColor,
    transition:     "color 150ms ease",
  };

  // Outer button element — handles the touch-target zone
  const outerStyle = {
    display:          "inline-flex",
    alignItems:       "center",
    justifyContent:   "center",
    padding:          T.touch.pad,
    minHeight:        T.touch.min,
    minWidth:         T.touch.min,
    background:       "transparent",
    border:           "none",
    borderRadius:     T.radius,
    cursor:           isDisabled ? "not-allowed" : "pointer",
    outline:          "none",
    opacity:          1,
    textDecoration:   "none",
  };

  return (
    <button
      type="button"
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      aria-label={ariaLabel || (showText ? undefined : text)}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !isDisabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); setPressed(false); }}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !isDisabled) setPressed(true); }}
      onKeyUp={() => setPressed(false)}
      className={className}
      style={outerStyle}
    >
      <span style={containerStyle} aria-hidden="true" className="pw-button__container">
        {loading ? (
          // Loading state — spinner only, no label or icons
          <ButtonSpinner size={sz.iconInner * 1.2} />
        ) : (
          <>
            {showLeadingIcon && (
              <span
                style={iconWrapStyle}
                className="material-symbols-outlined pw-button__icon pw-button__icon--leading"
                aria-hidden="true"
              >
                {leadingIcon || "add"}
              </span>
            )}
            {showText && (
              <span style={labelStyle} className="pw-button__label">
                {text}
              </span>
            )}
            {showTrailingIcon && (
              <span
                style={iconWrapStyle}
                className="material-symbols-outlined pw-button__icon pw-button__icon--trailing"
                aria-hidden="true"
              >
                {trailingIcon || "arrow_forward"}
              </span>
            )}
          </>
        )}
      </span>
    </button>
  );
}

export default Button;
