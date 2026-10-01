import React, { useId, useState } from "react";

/**
 * radio.jsx — Radio and RadioGroup.
 *
 * FIGMA
 * Component set `Radio` 40002974:83004, 25 variants:
 *   Type  [Selected|Unselected|Error Selected|Error Unselected]
 *   x State[Active|Hover|Focused|Pressed|Disabled]
 *   x Size [Base|Large]
 *
 * A RADIO IS NEVER ALONE, so RadioGroup ships with it. A lone radio cannot be
 * unselected by the user, has no arrow-key behaviour, and has nothing for its
 * label to describe. The group owns the name, the value, roving tabindex and
 * arrow-key navigation; the radio owns one option.
 *
 * STATE IS DERIVED, NOT PASSED. Figma's State axis is a drawing convenience:
 * hover, focus and pressed are things the browser already knows. `forceState`
 * exists for the Storybook matrix and nothing else. Type collapses the same
 * way: `checked` and `error` are two booleans, not a four-value enum, because
 * Selected and Error Selected are the same selection in different validity.
 *
 * GEOMETRY, from the variants
 *   ring         20 at Base, 22 at Large, fully rounded, 0.75 stroke
 *   dot          10, shown only when checked
 *   hover halo   42, filled only on hover and focus
 *   hit area     44, which is the AA touch target
 * The halo is what makes a 20px ring meet a 44px target without the ring
 * growing, so the control stays the size the design drew while still being
 * reachable.
 *
 * TWO FIGMA DEFECTS, REPORTED NOT COPIED
 *   Size=Large exists for Unselected ONLY, five variants out of a possible
 *     twenty. There is no Large Selected and no Large Error at all, so the
 *     Large column is unfinished. This renders Large for every combination,
 *     scaling the ring to 22 and leaving the dot, halo and hit area as drawn,
 *     because a size that only works unselected is not a size.
 *   The label NEVER dims when disabled: all twenty variants bind
 *     foreground-static-neutral-base, so a disabled radio's only cue is its
 *     ring and dot. This dims the label to foreground-action-disabled, because
 *     a disabled control whose label looks enabled reads as a bug.
 * Both are recorded in the manifest.
 */

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const CU = (n) => `var(--contextual-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const MO = (n) => `var(--motion-${n})`;

export const SIZES = ["base", "large"];
export const STATES = ["active", "hover", "focused", "pressed", "disabled"];

/** Ring stroke per Type and State, variant for variant from the Figma set. */
const RING = {
  normal: {
    active:   "stroke-action-secondary-rest",
    hover:    "stroke-action-secondary-hover",
    focused:  "stroke-action-secondary-hover",
    pressed:  "stroke-action-secondary-pressed",
    disabled: "stroke-action-disabled",
  },
  checked: {
    active:   "stroke-action-primary-strong-pressed",
    hover:    "stroke-action-primary-strong-pressed",
    focused:  "stroke-action-primary-strong-pressed",
    pressed:  "stroke-action-primary-strong-pressed",
    disabled: "stroke-action-disabled",
  },
  error: {
    active:   "stroke-action-status-negative-rest",
    hover:    "stroke-action-status-negative-hover",
    focused:  "stroke-action-status-negative-hover",
    pressed:  "stroke-action-status-negative-pressed",
    disabled: "stroke-action-disabled",
  },
  errorChecked: {
    active:   "stroke-action-status-negative-pressed",
    hover:    "stroke-action-status-negative-pressed",
    focused:  "stroke-action-status-negative-pressed",
    pressed:  "stroke-action-status-negative-pressed",
    disabled: "stroke-action-disabled",
  },
};

/** Dot fill per Type and State. Only the checked rows have a dot. */
const DOT = {
  checked: {
    active:   "fill-action-primary-strong-rest",
    hover:    "fill-action-primary-strong-hover",
    focused:  "fill-action-primary-strong-hover",
    pressed:  "fill-action-primary-strong-pressed",
    disabled: "fill-action-disabled",
  },
  errorChecked: {
    active:   "fill-action-status-negative-strong-rest",
    hover:    "fill-action-status-negative-strong-rest",
    focused:  "fill-action-status-negative-strong-rest",
    pressed:  "fill-action-status-negative-strong-pressed",
    disabled: "fill-action-disabled",
  },
};

export const L = {
  ringBase:   20,
  ringLarge:  22,
  dot:        10,
  halo:       42,
  target:     SU("accessibility-touch-target-aa-height"),
  stroke:     CU("selection-controls-borderwidth"),
  radiusFull: SU("cornerradius-full"),
  gap:        SU("gap-tight"),
  groupGap:   SU("gap-xtight"),
  focusWidth: CU("focusring-width"),
  focusOffset:CU("focusring-offset"),
};

const LABEL_TYPE = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
  fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
  letterSpacing: ST("letter-spacing-wide"),
};

function rowFor(checked, error) {
  if (error && checked) return "errorChecked";
  if (error) return "error";
  if (checked) return "checked";
  return "normal";
}

/**
 * One option. Normally rendered by RadioGroup rather than directly.
 *
 * @param {string}  value
 * @param {boolean} checked
 * @param {boolean} error
 * @param {boolean} disabled
 * @param {string}  size        base | large
 * @param {string}  name        the group's name; RadioGroup supplies it
 * @param {string}  forceState  Storybook matrix only
 */
export function Radio({
  value,
  checked = false,
  error = false,
  disabled = false,
  size = "base",
  name,
  onChange,
  forceState,
  children,
  tabIndex,
  style,
  className = "",
  ...rest
}) {
  const [hov, setHov] = useState(false);
  const [down, setDown] = useState(false);
  const [focus, setFocus] = useState(false);
  const id = useId();

  const state = forceState
    || (disabled ? "disabled"
      : down ? "pressed"
      : focus ? "focused"
      : hov ? "hover"
      : "active");

  const row = rowFor(checked, error);
  const ring = RING[row][state];
  const dot = checked ? DOT[row === "errorChecked" ? "errorChecked" : "checked"][state] : null;
  const ringSize = size === "large" ? L.ringLarge : L.ringBase;
  const showHalo = state === "hover" || state === "focused";

  return (
    <label
      className={`pw-radio ${className}`}
      htmlFor={id}
      data-state={state}
      data-size={size}
      data-checked={checked || undefined}
      data-error={error || undefined}
      onMouseEnter={disabled ? undefined : () => setHov(true)}
      onMouseLeave={disabled ? undefined : () => { setHov(false); setDown(false); }}
      onMouseDown={disabled ? undefined : () => setDown(true)}
      onMouseUp={disabled ? undefined : () => setDown(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: L.gap,
        cursor: disabled ? "default" : "pointer",
        minHeight: L.target,
        ...style,
      }}
    >
      {/* The hit area. 44 wide so the control is reachable without the ring
          growing; the halo inside it is what the hover state paints. */}
      <span style={{
        position: "relative", flex: "0 0 auto",
        width: L.target, height: L.target,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span aria-hidden="true" style={{
          position: "absolute", width: L.halo, height: L.halo,
          borderRadius: L.radiusFull,
          background: showHalo ? SC("fill-action-selection-hover") : "transparent",
          transition: `background ${MO("duration-2")} ${MO("easing-standard")}`,
        }} />
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          tabIndex={tabIndex}
          aria-invalid={error || undefined}
          onChange={(e) => onChange?.(value, e)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            position: "absolute", inset: 0, margin: 0,
            opacity: 0, cursor: disabled ? "default" : "pointer",
          }}
          {...rest}
        />
        {/* The ring and dot. aria-hidden because the real input above carries
            the role, the name and the checked state. */}
        <span aria-hidden="true" style={{
          position: "relative",
          width: ringSize, height: ringSize,
          borderRadius: L.radiusFull,
          border: `${L.stroke} solid ${SC(ring)}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: `border-color ${MO("duration-2")} ${MO("easing-standard")}`,
        }}>
          {checked && (
            <span style={{
              width: L.dot, height: L.dot, borderRadius: L.radiusFull,
              background: SC(dot),
              transition: `background ${MO("duration-2")} ${MO("easing-standard")}`,
            }} />
          )}
        </span>
        {/* Focus is shown on the ring's box rather than the input, so the halo
            and the ring stay centred inside it. */}
        {state === "focused" && (
          <span aria-hidden="true" style={{
            position: "absolute", width: ringSize, height: ringSize,
            borderRadius: L.radiusFull,
            outline: `${L.focusWidth} solid ${SC("stroke-focusring-base")}`,
            outlineOffset: L.focusOffset,
          }} />
        )}
      </span>

      {children && (
        <span style={{
          ...LABEL_TYPE,
          // Figma leaves the label at the neutral base in all twenty variants,
          // including Disabled. Dimming it here: a disabled control whose label
          // looks enabled reads as a bug. Recorded in the manifest.
          color: disabled ? SC("foreground-action-disabled") : SC("foreground-static-neutral-base"),
          transition: `color ${MO("duration-2")} ${MO("easing-standard")}`,
        }}>
          {children}
        </span>
      )}
    </label>
  );
}

/**
 * The group. Owns the name, the selected value, roving tabindex and arrow-key
 * navigation, which is what the native radio role expects and what a lone
 * Radio cannot provide.
 *
 * @param {object[]} options  [{ value, label, disabled }]
 * @param {string}   value
 * @param {string}   name     generated when omitted
 */
export function RadioGroup({
  options = [],
  value,
  onChange,
  name,
  label,
  error = false,
  disabled = false,
  size = "base",
  orientation = "vertical",
  style,
  className = "",
  ...rest
}) {
  const auto = useId();
  const groupName = name || `pw-radio-${auto}`;
  const enabled = options.filter((o) => !o.disabled && !disabled);
  // Roving tabindex: the group is one tab stop. If nothing is selected the
  // first enabled option takes it, which is what a native group does.
  const rovingValue = options.some((o) => o.value === value) ? value : enabled[0]?.value;

  const move = (dir) => {
    if (!enabled.length) return;
    const i = enabled.findIndex((o) => o.value === rovingValue);
    const next = enabled[(i + dir + enabled.length) % enabled.length];
    onChange?.(next.value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={error || undefined}
      className={`pw-radio-group ${className}`}
      onKeyDown={(e) => {
        if (["ArrowDown", "ArrowRight"].includes(e.key)) { e.preventDefault(); move(1); }
        if (["ArrowUp", "ArrowLeft"].includes(e.key)) { e.preventDefault(); move(-1); }
      }}
      style={{
        display: "flex",
        flexDirection: orientation === "horizontal" ? "row" : "column",
        gap: orientation === "horizontal" ? L.gap : L.groupGap,
        flexWrap: orientation === "horizontal" ? "wrap" : undefined,
        ...style,
      }}
      {...rest}
    >
      {options.map((o) => (
        <Radio
          key={o.value}
          name={groupName}
          value={o.value}
          checked={o.value === value}
          error={error}
          disabled={disabled || o.disabled}
          size={size}
          onChange={onChange}
          tabIndex={o.value === rovingValue ? 0 : -1}
        >
          {o.label}
        </Radio>
      ))}
    </div>
  );
}

export const RadioKeyframes = () => (
  <style>{`
@media (prefers-reduced-motion: reduce) { .pw-radio * { transition: none !important; } }
`}</style>
);

export default Radio;
