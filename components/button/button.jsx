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
// Every name below is MODELESS. The mode is resolved by selector from
// themes/light.css and themes/midnight.css, so there is no "light-mode" segment
// and no separate *inverse* token family: an inverted button is this same
// button inside a [data-theme="midnight"] region. See CLAUDE.md §2.0.
//
// SC = semantic-color         (themes/light.css + themes/midnight.css)
// SL = semantic-layout-units  (layout.css)
// CL = contextual-layout-units(layout-contextual.css — component metrics)
// ST = semantic-type          (type.css — a SCALE, composed below, not composites)
const SC = (p) => `var(--semantic-color-${p})`;
const SL = (p) => `var(--semantic-layout-units-${p})`;
const CL = (p) => `var(--contextual-layout-units-${p})`;
const ST = (p) => `var(--semantic-type-${p})`;

// ─── FILL TOKENS ──────────────────────────────────────────────────────────────
// Background colour by (buttonStyle, type, interactionState).
// Outlined/Naked use transparent base + light overlay on hover/pressed.
// Tertiary's own token family was deleted because it duplicated Primary Dim
// offset by one ramp step, so Tertiary now reads the Primary Dim ramp. Negative
// moved under Status. Disabled is ONE token per tier, not one per type — a
// disabled control is the same colour whatever it would have been.
const FILL = {
  Fill: {
    Primary:   { base: SC("fill-action-primary-rest"),              hover: SC("fill-action-primary-hover"),              pressed: SC("fill-action-primary-pressed"),              disabled: SC("fill-action-disabled") },
    Secondary: { base: SC("fill-action-secondary-rest"),            hover: SC("fill-action-secondary-hover"),            pressed: SC("fill-action-secondary-pressed"),            disabled: SC("fill-action-disabled") },
    Tertiary:  { base: SC("fill-action-primary-dim-rest"),          hover: SC("fill-action-primary-dim-hover"),          pressed: SC("fill-action-primary-dim-pressed"),          disabled: SC("fill-action-disabled") },
    Negative:  { base: SC("fill-action-status-negative-rest"),      hover: SC("fill-action-status-negative-hover"),      pressed: SC("fill-action-status-negative-pressed"),      disabled: SC("fill-action-disabled") },
  },
  // Outlined and Naked rest on nothing and tint on interaction. The Dim ramps
  // are exactly that tint, which is what the retired *inverse* hovers were for.
  Outlined: {
    Primary:   { base: "transparent", hover: SC("fill-action-primary-dim-hover"),          pressed: SC("fill-action-primary-dim-pressed"),          disabled: "transparent" },
    Secondary: { base: "transparent", hover: SC("fill-action-secondary-hover"),            pressed: SC("fill-action-secondary-pressed"),            disabled: "transparent" },
    Tertiary:  { base: "transparent", hover: SC("fill-action-primary-dim-hover"),          pressed: SC("fill-action-primary-dim-pressed"),          disabled: "transparent" },
    Negative:  { base: "transparent", hover: SC("fill-action-status-negative-dim-hover"),  pressed: SC("fill-action-status-negative-dim-pressed"),  disabled: "transparent" },
  },
};
FILL.Naked = FILL.Outlined;

// ─── FOREGROUND TOKENS ────────────────────────────────────────────────────────
// Text and Icon were merged into one Foreground tier. That merge is deliberate,
// not a rename for tidiness: a button is ONE interactive surface, so its label
// and its icon must not resolve through two ramps that can drift apart.
//
// On a solid fill the foreground is Mono, which has only a rest step — white
// stays white through hover and pressed, so all three states share it.
const FG = {
  Fill: {
    Primary:   { base: SC("foreground-action-mono-rest"),             hover: SC("foreground-action-mono-rest"),             pressed: SC("foreground-action-mono-rest"),             disabled: SC("foreground-action-disabled") },
    Secondary: { base: SC("foreground-action-secondary-rest"),        hover: SC("foreground-action-secondary-hover"),        pressed: SC("foreground-action-secondary-pressed"),        disabled: SC("foreground-action-disabled") },
    Tertiary:  { base: SC("foreground-action-primary-rest"),          hover: SC("foreground-action-primary-hover"),          pressed: SC("foreground-action-primary-pressed"),          disabled: SC("foreground-action-disabled") },
    Negative:  { base: SC("foreground-action-mono-rest"),             hover: SC("foreground-action-mono-rest"),             pressed: SC("foreground-action-mono-rest"),             disabled: SC("foreground-action-disabled") },
  },
  Outlined: {
    Primary:   { base: SC("foreground-action-primary-rest"),          hover: SC("foreground-action-primary-hover"),          pressed: SC("foreground-action-primary-pressed"),          disabled: SC("foreground-action-disabled") },
    Secondary: { base: SC("foreground-action-secondary-rest"),        hover: SC("foreground-action-secondary-hover"),        pressed: SC("foreground-action-secondary-pressed"),        disabled: SC("foreground-action-disabled") },
    Tertiary:  { base: SC("foreground-action-primary-rest"),          hover: SC("foreground-action-primary-hover"),          pressed: SC("foreground-action-primary-pressed"),          disabled: SC("foreground-action-disabled") },
    Negative:  { base: SC("foreground-action-status-negative-rest"),  hover: SC("foreground-action-status-negative-hover"),  pressed: SC("foreground-action-status-negative-pressed"),  disabled: SC("foreground-action-disabled") },
  },
};
FG.Naked = FG.Outlined;

// Label and icon read the same tier now, so these are the same table. They stay
// as two names because the render code addresses them separately.
const TEXT = FG;
const ICON = FG;

// ─── STROKE TOKENS (Outlined only) ────────────────────────────────────────────
// There is no Primary Dim stroke ramp, so Tertiary borrows the Primary stroke.
const STROKE = {
  Primary:   { base: SC("stroke-action-primary-rest"),          hover: SC("stroke-action-primary-hover"),          pressed: SC("stroke-action-primary-pressed"),          disabled: SC("stroke-action-disabled") },
  Secondary: { base: SC("stroke-action-secondary-rest"),        hover: SC("stroke-action-secondary-hover"),        pressed: SC("stroke-action-secondary-pressed"),        disabled: SC("stroke-action-disabled") },
  Tertiary:  { base: SC("stroke-action-primary-rest"),          hover: SC("stroke-action-primary-hover"),          pressed: SC("stroke-action-primary-pressed"),          disabled: SC("stroke-action-disabled") },
  Negative:  { base: SC("stroke-action-status-negative-rest"),  hover: SC("stroke-action-status-negative-hover"),  pressed: SC("stroke-action-status-negative-pressed"),  disabled: SC("stroke-action-disabled") },
};

// ─── LAYOUT & FOCUS TOKENS ────────────────────────────────────────────────────
// Touch target: 48×48 minimum with 6px outer padding (WCAG 2.5.5 target size).
// Focus ring: 6px white halo + 9px brand ring (box-shadow on Container.Main).
// Figma spec: DROP_SHADOW spread:9 color:#a0b5e6 + spread:6 color:#ffffff
// Component metrics live in layout-contextual.css under their OWN prefix,
// --contextual-layout-units-*, not as a "contextual" branch of the semantic
// layout scale. The focus ring moved out of Contextual to Stroke/FocusRing.
export const T = {
  radius:      CL("button-radius-radius"),                                  // 8px
  border:      CL("button-border-width-base-base"),                         // 0.75px
  gap:         CL("button-gap-horizontal"),                                  // 8px
  touch:       { pad: 6, min: 48 },
  focusShadow: `0 0 0 6px #ffffff, 0 0 0 9px ${SC("stroke-focusring-base")}`,
};

// Type is a scale now, not 111 composites, so each size composes its own five
// values. The px in each comment is what the retired Label/Button composite
// resolved to, kept so a drift here is obvious.
const LABEL = (size, lineHeight) => ({
  fontFamily:    ST("family-brand"),
  fontSize:      ST(`font-size-${size}`),
  fontWeight:    ST("weight-medium"),
  lineHeight:    ST(`line-height-${lineHeight}`),
  letterSpacing: ST("letter-spacing-compact"),   // 0px — the neutral tracking step
});

// ─── SIZE TABLE ────────────────────────────────────────────────────────────────
export const SIZES = {
  L: {
    padH:      CL("button-padding-large-horizontal"),
    padV:      CL("button-padding-large-vertical"),
    iconWrap:  26,
    iconInner: 18,
    ...LABEL("m", "m-single"),        // was Label/Button/Large — 18 / 24
  },
  M: {
    padH:      CL("button-padding-medium-horizontal"),
    padV:      CL("button-padding-medium-vertical"),
    iconWrap:  24,
    iconInner: 16,
    ...LABEL("r", "r-single"),        // was Label/Button/Base — 16 / 22
  },
  S: {
    padH:      CL("button-padding-small-horizontal"),
    padV:      CL("button-padding-small-vertical"),
    iconWrap:  20,
    iconInner: 14,
    ...LABEL("s", "s-single"),        // was Label/Button/Small — 14 / 20
  },
  // XS — added 2026-06-11 (Figma node 40007881:21300). 44×44 touch target preserved;
  // padding 8/6. Figma defines XS for Primary/Secondary/Negative across
  // Fill/Outlined/Naked — NOT Tertiary (see spec §Gaps).
  XS: {
    padH:      CL("button-padding-xsmall-horizontal"),
    padV:      CL("button-padding-xsmall-vertical"),
    iconWrap:  16,
    iconInner: 12,
    ...LABEL("xs", "xs-single"),      // was Label/Button/XSmall — 12 / 18
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
        animation: "pw-btn-spin var(--motion-duration-loop-fast) var(--motion-easing-linear) infinite",
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
 *   size         — "L" | "M" | "S" | "XS"           (default: "M")
 *   type         — "Primary" | "Secondary" | "Tertiary" | "Negative"  (default: "Primary")
 *   text         — button label                     (default: "Button")
 *   leadingIcon  — Material Symbols ligature string or React node | null
 *   trailingIcon — Material Symbols ligature string or React node | null
 *   showLeadingIcon  — bool (default: false)
 *   showTrailingIcon — bool (default: false)
 *   showText     — bool (default: true)
 *   loading      — bool — replaces content with spinner, sets aria-busy
 *   disabled     — bool — prevents interaction, sets aria-disabled
 *   forceState   — "hover"|"pressed"|"focused"|"disabled"|"loading"|null
 *                  Visual-only override for Storybook StateMatrix. Does not
 *                  affect real interaction in production.
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
  forceState  = null,
  onClick,
  ariaLabel,
  className   = "",
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => { ensureSpinKeyframe(); }, []);

  // forceState drives visual simulation in Storybook; real props win in production
  const forceLoading  = forceState === "loading";
  const forceDisabled = forceState === "disabled";
  const isDisabled    = disabled || loading || forceDisabled || forceLoading;

  // Resolve the token-lookup key: forceState overrides live interaction when set
  const stateKey = (() => {
    if (forceState && !disabled && !loading) {
      if (forceDisabled || forceLoading) return "disabled";
      if (forceState === "focused")       return "base";   // focused = base bg + ring
      if (forceState === "hover")         return "hover";
      if (forceState === "pressed")       return "pressed";
    }
    return isDisabled ? "disabled"
      : pressed  ? "pressed"
      : hovered  ? "hover"
      : "base";
  })();

  // Show focus ring only on keyboard navigation (not mouse click) or when forced
  const showFocusRing = !isDisabled && (forceState === "focused" || focused);

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
    paddingLeft:      sz.padH,
    paddingRight:     sz.padH,
    paddingTop:       sz.padV,
    paddingBottom:    sz.padV,
    borderRadius:     T.radius,
    backgroundColor:  bgColor,
    border:           hasStroke ? `${T.border} solid ${strokeColor}` : "none",
    // Figma's Container.Main has gap 0. The 8px separation is realised as
    // padding INSIDE the icon and label containers (4px each side of each),
    // so applying it again as a flex gap double-counts it: the icon drifts to
    // 12px from the label, and the button ends up 16px on the icon side
    // against 12px on the label side. Keep this 0 and let the slots pad
    // themselves - see labelStyle and iconWrapStyle below.
    gap:              0,
    boxShadow:        showFocusRing ? T.focusShadow : "none",
    transition:       "background-color var(--motion-duration-2) var(--motion-easing-standard), border-color var(--motion-duration-2) var(--motion-easing-standard), box-shadow var(--motion-duration-2) var(--motion-easing-standard), color var(--motion-duration-2) var(--motion-easing-standard)",
    color:            iconColor,  // propagated to icons via currentColor
  };

  // Label styles. Figma's Container.Label carries pad=[0,4,0,4]; that half-gap
  // on each side is what separates it from an adjacent icon and what keeps a
  // text-only button symmetric. Derived from the gap token so the two cannot
  // drift: half either side sums to the full gap between slots.
  const halfGap = `calc(${T.gap} / 2)`;
  const labelStyle = {
    fontFamily:    sz.fontFamily,
    fontWeight:    sz.fontWeight,
    lineHeight:    sz.lineHeight,
    letterSpacing: sz.letterSpacing,
    fontSize:      sz.fontSize,
    color:         textColor,
    whiteSpace:    "nowrap",
    paddingLeft:   halfGap,
    paddingRight:  halfGap,
    transition:    "color var(--motion-duration-2) var(--motion-easing-standard)",
    userSelect:    "none",
  };

  // Icon slot wrapper — iconWrap = outer slot size, iconInner = rendered glyph size.
  // fontVariationSettings overrides the global opsz:24 from preview-head.html —
  // all button icon sizes (14–18px) sit below the minimum opsz axis value (20),
  // so opsz:20 is the correct optical size for the tightest stroke rendering.
  const iconWrapStyle = {
    display:              "inline-flex",
    alignItems:           "center",
    justifyContent:       "center",
    width:                sz.iconWrap,
    height:               sz.iconWrap,
    flexShrink:           0,
    fontSize:             sz.iconInner,
    color:                iconColor,
    transition:           "color var(--motion-duration-2) var(--motion-easing-standard)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
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
      aria-busy={(loading || forceLoading) || undefined}
      aria-disabled={isDisabled || undefined}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !isDisabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={(e) => {
        // Only show focus ring when navigating via keyboard (focus-visible heuristic).
        // Mouse clicks focus the button but should not trigger the focus ring.
        if (e.target.matches?.(':focus-visible')) setFocused(true);
      }}
      onBlur={() => { setFocused(false); setPressed(false); }}
      onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !isDisabled) setPressed(true); }}
      onKeyUp={() => setPressed(false)}
      className={className}
      style={outerStyle}
    >
      <span style={containerStyle} aria-hidden="true" className="pw-button__container">
        {(loading || forceLoading) ? (
          // Loading state — spinner only, no label or icons
          <ButtonSpinner size={sz.iconInner * 1.2} />
        ) : (
          <>
            {showLeadingIcon && (
              <span
                style={iconWrapStyle}
                className="material-symbols-rounded pw-button__icon pw-button__icon--leading"
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
                className="material-symbols-rounded pw-button__icon pw-button__icon--trailing"
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
