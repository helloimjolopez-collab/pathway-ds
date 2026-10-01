import React from "react";

/**
 * alert.jsx — Alert.
 *
 * FIGMA
 * Component set `Alert` 40002171:5031, six variants on one axis:
 *   Type [Success|Alert|Error|Warning|Neutral|Tertiary]
 * plus Show Heading / Heading, Show Body / Body, Show Heading Icon / Heading
 * Icon, Show Heading Trailing Icon, Show Trailing Icon / Trailing Icon,
 * Show Button / Container-Button, and several content slots.
 *
 * FIGMA'S TYPE NAMES DO NOT MATCH THE TOKEN FAMILIES, so the mapping is worth
 * reading before using it:
 *   Success   -> positive
 *   Alert     -> severe
 *   Warning   -> attention
 *   Error     -> negative
 *   Neutral   -> neutral
 *   Tertiary  -> info
 * `Alert` as a Type inside a component called Alert is the confusing one: it
 * means the severe level, not "an alert". The props keep Figma's names so a
 * designer and a developer are talking about the same thing, and TYPE_FAMILY
 * below records what each one actually resolves to.
 *
 * ONE INCONSISTENCY, reported not smoothed. Five of the six types take their
 * family's STRONG stroke; Tertiary takes info SUBTLE, so its border is far
 * fainter than the others at the same 1.5 width. Rendered as drawn, because an
 * alert border is a deliberate loudness choice and guessing at it would be
 * worse than showing it. Recorded in the manifest.
 *
 * THE TEXT BAN DOES NOT APPLY HERE. An Alert is the one component whose job IS
 * a sentence: it exists to say something. Heading and body are content, not
 * explanation.
 *
 * STRUCTURE, from the variants
 *   container    radius 8, 1.5 border, fill and border per type
 *   content row  heading icon + heading, then body, then an action slot
 *   dismiss      its own 42-wide column at the trailing edge
 * The heading icon has no bound fill in Figma, so it inherits: it is rendered
 * with currentColor and follows the text rather than being coloured twice.
 */

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const MO = (n) => `var(--motion-${n})`;

export const TYPES = ["success", "alert", "warning", "error", "neutral", "tertiary"];

/** What each Figma Type resolves to, variant for variant. */
export const TYPE = {
  success:  { fill: "fill-static-positive-subtle",  stroke: "stroke-static-positive-strong",  fg: "foreground-static-positive-on-subtle",  family: "positive" },
  alert:    { fill: "fill-static-severe-subtle",    stroke: "stroke-static-severe-strong",    fg: "foreground-static-severe-on-subtle",    family: "severe" },
  warning:  { fill: "fill-static-attention-subtle", stroke: "stroke-static-attention-strong", fg: "foreground-static-attention-on-subtle", family: "attention" },
  error:    { fill: "fill-static-negative-subtle",  stroke: "stroke-static-negative-strong",  fg: "foreground-static-negative-on-subtle",  family: "negative" },
  neutral:  { fill: "fill-static-neutral-faint",    stroke: "stroke-static-neutral-base",     fg: "foreground-static-neutral-base",        family: "neutral" },
  // Tertiary is the odd one: info SUBTLE rather than strong, so its border is
  // much fainter than the other five at the same width. As drawn.
  tertiary: { fill: "fill-static-info-subtle",      stroke: "stroke-static-info-subtle",      fg: "foreground-static-info-on-subtle",      family: "info" },
};

/** Figma Type name to prop, for anyone reading a design. */
export const FIGMA_TYPE = {
  Success: "success",
  Alert: "alert",
  Warning: "warning",
  Error: "error",
  Neutral: "neutral",
  Tertiary: "tertiary",
};

/** Which token family each type resolves to, since the names disagree. */
export const TYPE_FAMILY = Object.fromEntries(
  Object.entries(TYPE).map(([k, v]) => [k, v.family]),
);

export const L = {
  radius:      SU("cornerradius-base"),
  border:      SU("borderwidth-medium"),
  padV:        SU("padding-medium"),
  padH:        SU("padding-base"),
  rowGap:      SU("gap-relaxed"),
  stackGap:    SU("gap-tight"),
  headGap:     SU("gap-tight"),
  dismissBox:  SU("accessibility-touch-target-aa-width"),
  glyph:       16,
  glyphDismiss: 20,
};

const TYPE_HEADING = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
  fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
  letterSpacing: ST("letter-spacing-wide"),
};
const TYPE_BODY = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
  fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
  letterSpacing: ST("letter-spacing-wide"),
};

/**
 * @param {string} type       one of TYPES. See the header: Figma's names and
 *                            the token families they resolve to disagree.
 * @param {string} heading
 * @param {node}   children   the body
 * @param {node}   icon       the heading icon. Inherits currentColor.
 * @param {node}   action     Container-Button: whatever the alert asks you to do
 * @param {func}   onDismiss  renders the trailing dismiss control
 * @param {string} role       status for a passive alert, alert for one that
 *                            interrupts. Defaults by type.
 */
export function Alert({
  type = "neutral",
  heading,
  children,
  icon,
  action,
  onDismiss,
  dismissLabel = "Dismiss",
  role,
  style,
  className = "",
  ...rest
}) {
  const t = TYPE[type] || TYPE.neutral;
  // error and alert interrupt; the rest are passive. A screen reader should not
  // be made to announce a success message over whatever the user is doing.
  const resolvedRole = role || (type === "error" || type === "alert" ? "alert" : "status");

  return (
    <div
      className={`pw-alert ${className}`}
      data-type={type}
      role={resolvedRole}
      aria-live={resolvedRole === "alert" ? "assertive" : "polite"}
      style={{
        display: "flex", alignItems: "flex-start",
        gap: L.stackGap, minWidth: 0,
        padding: `${L.padV} ${L.padH}`,
        borderRadius: L.radius,
        background: SC(t.fill),
        border: `${L.border} solid ${SC(t.stroke)}`,
        color: SC(t.fg),
        ...style,
      }}
      {...rest}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: L.rowGap,
        flex: 1, minWidth: 0, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: L.stackGap, flex: 1, minWidth: 0 }}>
          {(heading || icon) && (
            <div style={{ display: "flex", alignItems: "center", gap: L.headGap, minWidth: 0 }}>
              {icon && (
                <span aria-hidden="true" style={{
                  display: "flex", flex: "0 0 auto",
                  // No bound fill in Figma, so it inherits rather than being
                  // coloured a second time.
                  color: "currentColor", fontSize: L.glyph,
                }}>{icon}</span>
              )}
              {heading && <span style={{ ...TYPE_HEADING, minWidth: 0 }}>{heading}</span>}
            </div>
          )}
          {children && <div style={{ ...TYPE_BODY, minWidth: 0 }}>{children}</div>}
        </div>
        {action && <div style={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}>{action}</div>}
      </div>

      {onDismiss && <DismissButton onClick={onDismiss} label={dismissLabel} />}
    </div>
  );
}

function DismissButton({ onClick, label }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: L.dismissBox, height: L.dismissBox, flex: "0 0 auto", padding: 0,
        // Inherits the alert's foreground, so dismiss is never a second colour
        // decision per type.
        background: hov ? SC("fill-action-secondary-hover") : "transparent",
        color: "currentColor",
        border: "none", borderRadius: SU("cornerradius-base"), cursor: "pointer",
        transition: `background ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      <span className="material-symbols-rounded" aria-hidden="true"
        style={{ fontSize: L.glyphDismiss, lineHeight: 1, display: "block" }}>close</span>
    </button>
  );
}

export const AlertKeyframes = () => (
  <style>{`
@media (prefers-reduced-motion: reduce) { .pw-alert * { transition: none !important; } }
`}</style>
);

export default Alert;
