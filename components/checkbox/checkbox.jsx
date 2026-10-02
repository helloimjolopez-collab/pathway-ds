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
  fillCheckedBase:     "var(--semantic-color-fill-action-primary-strong-rest)",
  fillCheckedHover:    "var(--semantic-color-fill-action-primary-strong-hover)",
  fillCheckedFocused:  "var(--semantic-color-fill-action-primary-strong-hover)",
  fillCheckedPressed:  "var(--semantic-color-fill-action-primary-strong-pressed)",
  fillCheckedDisabled: "var(--semantic-color-fill-action-disabled)",

  // Box border — standard unchecked
  borderBase:     "var(--semantic-color-stroke-action-secondary-rest)",
  borderHover:    "var(--semantic-color-stroke-action-secondary-hover)",
  borderFocused:  "var(--semantic-color-stroke-action-secondary-hover)",
  borderPressed:  "var(--semantic-color-stroke-action-secondary-pressed)",
  borderDisabled: "var(--semantic-color-stroke-action-disabled)",

  // Checkmark / dash icon — standard.
  //
  // MUST be an ON-STRONG foreground, because the box it sits in is filled with
  // fill-action-primary-strong-*. This was foreground-action-primary-ON-SUBTLE-rest,
  // which is #345499 sitting on #3a5aaa: the same blue, so the whole square
  // read as a solid blue block with no visible tick. Reported 2026-10-02.
  //
  // Figma binds Foreground/Static/Neutral/MONO here instead, which is correct
  // in Light (#ffffff) and wrong in Midnight: mono is an INVERSION ANCHOR, not
  // a rung, so it flips to #181b2b and would put a near-black tick on a blue
  // box. on-strong is #ffffff in both modes, which is what a foreground on a
  // strong fill is for. Recorded in the manifest as a Figma defect.
  iconPrimary: "var(--semantic-color-foreground-action-primary-on-strong)",

  // Checkmark / dash icon — error. Same fix: the error box is filled with
  // fill-action-status-negative-strong-*, so the tick needs the on-strong
  // foreground. Was on-subtle-rest: #722121 on #b03a3a.
  iconError: "var(--semantic-color-foreground-action-status-negative-on-strong)",

  // State-layer — unchecked hover / focused
  stateLayerUncheckedHover: "var(--semantic-color-fill-action-secondary-hover)",

  // State-layer — checked hover / focused / pressed
  stateLayerCheckedHover:    "var(--semantic-color-fill-action-primary-subtle-hover)",
  stateLayerCheckedFocused:  "var(--semantic-color-fill-action-primary-subtle-hover)",
  stateLayerCheckedPressed:  "var(--semantic-color-fill-action-primary-subtle-pressed)",

  // Box fill — error checked / indeterminate
  fillErrorBase:     "var(--semantic-color-fill-action-status-negative-strong-rest)",
  fillErrorHover:    "var(--semantic-color-fill-action-status-negative-strong-hover)",
  fillErrorFocused:  "var(--semantic-color-fill-action-status-negative-strong-hover)",
  fillErrorPressed:  "var(--semantic-color-fill-action-status-negative-strong-pressed)",
  fillErrorDisabled: "var(--semantic-color-fill-action-disabled)",

  // Box border — error unchecked
  borderErrorBase:     "var(--semantic-color-stroke-action-status-negative-rest)",
  borderErrorHover:    "var(--semantic-color-stroke-action-status-negative-hover)",
  borderErrorFocused:  "var(--semantic-color-stroke-action-status-negative-hover)",
  borderErrorPressed:  "var(--semantic-color-stroke-action-status-negative-pressed)",
  borderErrorDisabled: "var(--semantic-color-stroke-action-disabled)",

  // State-layer — error hover (both unchecked and checked)
  stateLayerErrorHover: "var(--semantic-color-fill-action-status-negative-subtle-hover)",

  // Highlight.
  //
  // THIS IS NOT A RESTING TINT. It used to be one here, and that was wrong in
  // both directions: it painted a background the Figma variant does not have,
  // and it did nothing on hover, which is the only place the variant actually
  // differs. Reported 2026-10-02.
  //
  // Figma has three Highlight variants, all Unselected:
  //   Type=Highlight Unselected, State=Active   no state layer at all
  //   Type=Highlight Hovered,    State=Hovered  state layer #e2e9f7
  //   Type=Hhighlight Focused,   State=Focused  state layer #e2e9f7  (sic)
  // The box fill and both border colours are IDENTICAL to the standard
  // unselected variants (#77726b rest, #67625c hover). So the entire meaning of
  // Highlight is one swap: the unchecked hover/focus state layer goes from the
  // warm grey Fill/Action/Secondary/Hover (#f3f0ec) to the pale blue
  // Fill/Action/Primary/Subtle/Hover (#e2e9f7). It marks a row as brand-live on
  // interaction; it does not mark it at rest.
  stateLayerHighlightHover: "var(--semantic-color-fill-action-primary-subtle-hover)",

  // Label text
  labelColor: "var(--semantic-color-foreground-static-neutral-base)",

  // Geometry
  // cornerradius.small = 4px — matches the 4px box radius in the Figma spec.
  // (cornerradius.xsmall = 2px which is too small; small is the correct value.)
  //
  // NOT wrapped in calc(... * 1px). The layout tokens already carry their unit
  // (`--semantic-layout-units-cornerradius-small: 4px`), so multiplying by 1px
  // produced calc(4px * 1px) — px times px is not a length, so the browser
  // dropped the declaration and the box rendered with square corners. Silent,
  // because an invalid value falls back to the initial one rather than erroring.
  // Style Dictionary emits layout tokens as unitless numbers, so we multiply
  // by 1px inside calc() to get a valid CSS length.
  radius:     "var(--semantic-layout-units-cornerradius-small)",
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
 * @param {boolean}  highlight      - Brand-tinted hover/focus state-layer for selectable
 *                                   rows. Unchecked only, and no effect at rest.
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
        // Unchecked hover/focus. Highlight swaps the warm grey layer for the
        // pale blue one; error still wins over both. See V.stateLayerHighlightHover.
        stateLayerBg = error
          ? V.stateLayerErrorHover
          : (highlight ? V.stateLayerHighlightHover : V.stateLayerUncheckedHover);
      }
    }
    // No `else if (highlight)` branch: Figma's highlight variant has no resting
    // state layer, so at rest a highlighted checkbox is indistinguishable from
    // a standard one. That is the design.
  }

  // ─── Focus ring ───────────────────────────────────────────────────────────
  // Error: spec defines a 3px rgba red shadow on the state-layer.
  // Standard: border colour change on the box is sufficient (above).
  const focusShadow = focused && error
    ? "0 0 0 3px var(--semantic-color-fill-static-negative-subtle)"
    // Was a hand-mixed red at 10 percent. Fill/Static/Negative/Subtle is the
    // tone's own pale tint and it inverts with the theme, so the ring stays
    // visible on a dark canvas instead of vanishing into it.
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
            fontSize: "var(--semantic-type-font-size-s)",
            lineHeight: "var(--semantic-type-line-height-s-single)",
            fontWeight: 400,
            color:      disabled
              ? "var(--semantic-color-foreground-static-neutral-base)"
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
