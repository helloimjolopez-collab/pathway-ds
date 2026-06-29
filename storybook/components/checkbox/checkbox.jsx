/**
 * Checkbox — Pathway Design System
 *
 * Importable React component module. Source of truth for the Checkbox
 * implementation; the standalone demo (checkbox.html) and the Storybook
 * stories both consume this.
 *
 * Spec:  components/checkbox/checkbox-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002324-54532
 */

import React, { useRef, useEffect, useState } from "react";

// ─── SEMANTIC TOKEN CSS VARIABLES ─────────────────────────────────────────────
// All colours and radii come from semantic tokens only. No raw hex, no
// primitive vars. See checkbox-spec.md §5 for the full token table.
//
// Note: some tokens in §5.3 of the spec are missing from the token file.
// Fallbacks are used where noted and will be updated once Figma is re-synced.
const V = {
  // Box fill — standard checked / indeterminate
  fillCheckedBase:     "var(--semantic-color-light-mode-fill-action-primary-base)",
  fillCheckedHover:    "var(--semantic-color-light-mode-fill-action-primary-hover)",
  fillCheckedFocused:  "var(--semantic-color-light-mode-fill-action-primary-hover)",
  fillCheckedPressed:  "var(--semantic-color-light-mode-fill-action-primary-pressed)",
  fillCheckedDisabled: "var(--semantic-color-light-mode-fill-action-primary-disabled)",

  // Box border — standard unchecked
  borderBase:     "var(--semantic-color-light-mode-stroke-action-secondary-base)",
  borderHover:    "var(--semantic-color-light-mode-stroke-action-secondary-hover)",
  borderFocused:  "var(--semantic-color-light-mode-stroke-action-secondary-hover)",
  borderPressed:  "var(--semantic-color-light-mode-stroke-action-secondary-pressed)",
  borderDisabled: "var(--semantic-color-light-mode-stroke-action-secondary-disabled)",

  // Checkmark / dash icon — standard
  iconPrimary: "var(--semantic-color-light-mode-icon-action-primaryinverse-base)",

  // Checkmark / dash icon — error
  iconError: "var(--semantic-color-light-mode-icon-action-negativeinverse-base)",

  // State-layer — unchecked hover / focused
  stateLayerUncheckedHover: "var(--semantic-color-light-mode-fill-action-secondary-hover)",

  // State-layer — checked hover / focused / pressed
  stateLayerCheckedHover:    "var(--semantic-color-light-mode-fill-action-primaryinverse-hover)",
  stateLayerCheckedFocused:  "var(--semantic-color-light-mode-fill-action-primaryinverse-hover)",
  stateLayerCheckedPressed:  "var(--semantic-color-light-mode-fill-action-primaryinverse-pressed)",

  // Box fill — error checked / indeterminate
  fillErrorBase:     "var(--semantic-color-light-mode-fill-action-negative-base)",
  fillErrorHover:    "var(--semantic-color-light-mode-fill-action-negative-hover)",
  fillErrorFocused:  "var(--semantic-color-light-mode-fill-action-negative-hover)",
  fillErrorPressed:  "var(--semantic-color-light-mode-fill-action-negative-pressed)",
  fillErrorDisabled: "var(--semantic-color-light-mode-fill-action-negative-disabled)",

  // Box border — error unchecked
  borderErrorBase:     "var(--semantic-color-light-mode-stroke-action-negative-base)",
  borderErrorHover:    "var(--semantic-color-light-mode-stroke-action-negative-hover)",
  borderErrorFocused:  "var(--semantic-color-light-mode-stroke-action-negative-hover)",
  borderErrorPressed:  "var(--semantic-color-light-mode-stroke-action-negative-pressed)",
  borderErrorDisabled: "var(--semantic-color-light-mode-stroke-action-negative-disabled)",

  // State-layer — error hover (both unchecked and checked)
  stateLayerErrorHover: "var(--semantic-color-light-mode-fill-action-negativeinverse-hover)",

  // Highlight resting state — FALLBACK
  // fill.action.secondaryinverse.base is missing from token file (§5.3 HIGH).
  // Using fill.action.secondary.base as the closest available value.
  highlightResting: "var(--semantic-color-light-mode-fill-action-secondary-base)",

  // Label text
  labelColor: "var(--semantic-color-light-mode-text-static-secondary-base)",

  // Geometry
  // cornerradius.small = 4px — matches the 4px box radius in the Figma spec.
  // (cornerradius.xsmall = 2px which is too small; small is the correct value.)
  // Style Dictionary emits layout tokens as unitless numbers, so we multiply
  // by 1px inside calc() to get a valid CSS length.
  radius:     "calc(var(--semantic-layout-units-cornerradius-small) * 1px)",
  radiusFull: "100px",  // state-layer pill — no dedicated token, 100px safely rounds any 44px circle
};

// ─── GEOMETRY ─────────────────────────────────────────────────────────────────
export const BOX_SIZE  = { default: 18, s: 16 };
export const TARGET_SIZE = 44;          // touch target — always 44px (WCAG 2.5.5)
export const BORDER_WIDTH = 1.5;        // px
export const LABEL_GAP = 16;            // px — gap between state-layer and label text

// ─── ICONS ────────────────────────────────────────────────────────────────────
// Both icons use the same 18×18 viewBox so they scale cleanly when size="s".
// Paths are centred in the viewBox to match Figma geometry.

export function IconCheck({ color, size }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 18 18"
      fill="none" aria-hidden="true" focusable="false"
    >
      <path
        d="M4 9.5L7.5 13L14 6"
        stroke={color}
        strokeWidth={BORDER_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDash({ color, size }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 18 18"
      fill="none" aria-hidden="true" focusable="false"
    >
      <path
        d="M5 9H13"
        stroke={color}
        strokeWidth={BORDER_WIDTH}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── CHECKBOX ─────────────────────────────────────────────────────────────────

/**
 * Checkbox
 *
 * @param {boolean}  checked        - Whether the checkbox is checked
 * @param {boolean}  indeterminate  - Shows dash icon; overrides checked visually
 * @param {boolean}  error          - Error / negative styling
 * @param {boolean}  highlight      - Tinted resting background on the state-layer
 * @param {boolean}  secondary      - Secondary indeterminate (muted colour) — use with indeterminate only
 * @param {boolean}  disabled       - Non-interactive
 * @param {"default"|"s"} size      - Visual size of the control
 * @param {string}   label          - Optional visible label
 * @param {function} onChange       - (checked: boolean) => void
 * @param {string}   id             - For <label htmlFor> association
 * @param {string}   name           - Form field name
 * @param {string}   value          - Form field value
 * @param {string}   className      - Additional CSS class on the root element
 * @param {string}   [describedBy]  - aria-describedby for error messages (error state)
 */
export function Checkbox({
  checked = false,
  indeterminate = false,
  error = false,
  highlight = false,
  secondary = false,
  disabled = false,
  size = "default",
  label,
  onChange,
  id,
  name,
  value,
  className = "",
  describedBy,
}) {
  const inputRef = useRef(null);
  const [hovered,  setHovered]  = useState(false);
  const [focused,  setFocused]  = useState(false);
  const [pressed,  setPressed]  = useState(false);

  // The indeterminate state can only be set on the DOM element — not via HTML.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const boxSize = BOX_SIZE[size] || BOX_SIZE.default;

  // ─── Derived box fill ──────────────────────────────────────────────────────
  let boxFill = "transparent";
  if (disabled && (checked || indeterminate)) {
    boxFill = error ? V.fillErrorDisabled : V.fillCheckedDisabled;
  } else if (!disabled && (checked || indeterminate)) {
    if (error) {
      boxFill = pressed  ? V.fillErrorPressed
              : focused  ? V.fillErrorFocused
              : hovered  ? V.fillErrorHover
              :             V.fillErrorBase;
    } else {
      boxFill = pressed  ? V.fillCheckedPressed
              : focused  ? V.fillCheckedFocused
              : hovered  ? V.fillCheckedHover
              :             V.fillCheckedBase;
    }
  }

  // ─── Derived box border colour ─────────────────────────────────────────────
  // When checked or indeterminate, border matches fill (visually absorbed).
  // When unchecked, border shows the action.secondary (or negative) stroke token.
  let borderColor;
  if (checked || indeterminate) {
    borderColor = boxFill; // border hidden under fill
  } else if (disabled) {
    borderColor = error ? V.borderErrorDisabled : V.borderDisabled;
  } else if (error) {
    borderColor = pressed  ? V.borderErrorPressed
                : focused  ? V.borderErrorFocused
                : hovered  ? V.borderErrorHover
                :             V.borderErrorBase;
  } else {
    borderColor = pressed  ? V.borderPressed
                : focused  ? V.borderFocused
                : hovered  ? V.borderHover
                :             V.borderBase;
  }

  // ─── Derived state-layer background ───────────────────────────────────────
  let stateLayerBg = "transparent";
  if (!disabled) {
    if (pressed) {
      // pressed: same tint as hover — no separate pressed state-layer in spec
      stateLayerBg = (checked || indeterminate)
        ? V.stateLayerCheckedPressed
        : (error ? V.stateLayerErrorHover : V.stateLayerUncheckedHover);
    } else if (hovered || focused) {
      if (checked || indeterminate) {
        stateLayerBg = error
          ? V.stateLayerErrorHover
          : (focused ? V.stateLayerCheckedFocused : V.stateLayerCheckedHover);
      } else {
        stateLayerBg = error ? V.stateLayerErrorHover : V.stateLayerUncheckedHover;
      }
    } else if (highlight) {
      // Resting highlight tint (fallback token — see V.highlightResting note above)
      stateLayerBg = V.highlightResting;
    }
  }

  // ─── Focus ring ───────────────────────────────────────────────────────────
  // Error: spec defines a 3px rgba red shadow on the state-layer.
  // Standard: border colour change on the box is sufficient (above).
  const focusShadow = focused && error
    ? "0 0 0 3px rgba(170, 54, 54, 0.1)"
    : "none";

  // ─── Icon colour ──────────────────────────────────────────────────────────
  const iconColor = error ? V.iconError : V.iconPrimary;
  const showIcon  = checked || indeterminate;

  return (
    <label
      className={`pds-checkbox${size === "s" ? " pds-checkbox--s" : ""}${error ? " pds-checkbox--error" : ""}${highlight ? " pds-checkbox--highlight" : ""}${disabled ? " pds-checkbox--disabled" : ""}${className ? ` ${className}` : ""}`}
      style={{
        display:     "inline-flex",
        alignItems:  "center",
        gap:         label ? LABEL_GAP : 0,
        cursor:      disabled ? "not-allowed" : "pointer",
        userSelect:  "none",
        fontFamily:  "'Red Hat Text', sans-serif",
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={()  => !disabled && setPressed(true)}
      onMouseUp={()    => setPressed(false)}
    >
      {/* 44×44 touch target / state-layer */}
      <span
        aria-hidden="true"
        style={{
          position:         "relative",
          display:          "inline-flex",
          alignItems:       "center",
          justifyContent:   "center",
          width:            TARGET_SIZE,
          height:           TARGET_SIZE,
          borderRadius:     V.radiusFull,
          backgroundColor:  stateLayerBg,
          transition:       "background-color var(--motion-duration-3) var(--motion-easing-standard)",
          boxShadow:        focusShadow,
          flexShrink:       0,
        }}
      >
        {/* Visually hidden native input — provides semantics and keyboard behaviour */}
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={indeterminate ? false : checked}
          disabled={disabled}
          aria-describedby={describedBy}
          onChange={e => onChange && onChange(e.target.checked)}
          onFocus={() => setFocused(true)}
          onBlur={()  => setFocused(false)}
          style={{
            position:  "absolute",
            width:     boxSize,
            height:    boxSize,
            opacity:   0,
            margin:    0,
            padding:   0,
            cursor:    disabled ? "not-allowed" : "pointer",
            zIndex:    1,
          }}
        />

        {/* Visual checkbox box */}
        <span
          aria-hidden="true"
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            justifyContent:  "center",
            width:           boxSize,
            height:          boxSize,
            borderRadius:    V.radius,
            border:          `${BORDER_WIDTH}px solid ${borderColor}`,
            backgroundColor: boxFill,
            boxSizing:       "border-box",
            transition:      "background-color var(--motion-duration-2) var(--motion-easing-decelerate), border-color var(--motion-duration-2) var(--motion-easing-decelerate)",
            flexShrink:      0,
          }}
        >
          {showIcon && (
            indeterminate
              ? <IconDash  color={iconColor} size={boxSize} />
              : <IconCheck color={iconColor} size={boxSize} />
          )}
        </span>
      </span>

      {/* Label text */}
      {label && (
        <span
          style={{
            fontSize:   14,
            lineHeight: "20px",
            fontWeight: 400,
            color:      disabled
              ? "var(--semantic-color-light-mode-text-static-secondary-base)"
              : V.labelColor,
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
