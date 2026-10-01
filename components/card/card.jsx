import React, { useState } from "react";

/**
 * card.jsx — the Card.
 *
 * FIGMA
 * Component set `Card`, Amplify 40006608:49667, NewCo mirror 40016724:103731.
 * One variant axis, State: Default | Hover | Focus | Active | Disabled. The
 * rest of its properties are content toggles and slots:
 *
 *   ShowHeading + CardTitle                       -> title
 *   Show CardSubtitle + Slot.CardSubtitle         -> subtitle
 *   ShowCardBody + CardBody                       -> body
 *   ShowCardSupportingContent + Slot.*            -> children
 *   ShowIconLeading + IconLeading (instance swap) -> icon
 *
 * In code a toggle plus the thing it toggles is one prop: passing `title`
 * shows the heading, omitting it hides it. A boolean that only means "is the
 * next prop set" is not an API, it is a Figma limitation.
 *
 * INTERACTIVE OR NOT
 * Figma gives Card five states, which only make sense if the whole surface is
 * a target. So `onClick` decides: with it the card is a button with hover,
 * active and focus states; without it the card is a plain container and the
 * states are unreachable. A card that looks pressable and is not is worse than
 * either.
 *
 * TOKENS
 * Every value is a token. The contextual Card family already existed in the
 * panel (cornerradius, gap, padding, borderwidth rest/hover/selected) so this
 * binds those rather than the generic ones.
 *
 * A GAP WORTH NAMING. Figma binds `Elevation/Card/Rest`, `/Hover` and
 * `/Pressed` as effect variables, but the panel's Elevation collection holds
 * only Lift, Overlay, Sheet and Widget, so those three resolve through a
 * published library and never reach the export. Their COMPONENTS are in the
 * panel though: shadow-card-rest/hover/pressed x, y, blur and spread, plus
 * fill-shadow-dropshadow. So the shadows here are composed from those exactly
 * as the Figma effect composes them, rather than inventing three elevation
 * names the panel would not recognise. Either the three get added to the
 * Elevation collection, or this composition is the contract.
 */

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const CU = (n) => `var(--contextual-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const MO = (n) => `var(--motion-${n})`;

/** Composed from the shadow components, because Elevation/Card/* is not in the
 *  panel. Mirrors the Figma effect: x y blur spread, dropshadow colour. */
const shadow = (state) =>
  `${SU(`shadow-card-${state}-x`)} ${SU(`shadow-card-${state}-y`)} ` +
  `${SU(`shadow-card-${state}-blur`)} ${SU(`shadow-card-${state}-spread`)} ` +
  `${SC("fill-shadow-dropshadow")}`;

export const T = {
  surface:      SC("fill-surface-elevated"),
  border:       SC("stroke-static-neutral-base"),
  borderHover:  SC("stroke-static-neutral-bold"),
  borderActive: SC("stroke-action-primary-subtle-pressed"),
  borderDisabled: SC("stroke-action-disabled"),
  focusRing:    SC("stroke-focusring-base"),

  title:        SC("foreground-static-neutral-strong"),
  subtitle:     SC("foreground-static-neutral-subtle"),
  body:         SC("foreground-static-neutral-faint"),
  disabled:     SC("foreground-action-disabled"),

  iconFill:     SC("fill-static-info-subtle"),
  iconFg:       SC("foreground-static-info-on-subtle"),
};

export const L = {
  radius:       CU("card-cornerradius"),
  gap:          CU("card-gap"),
  padH:         CU("card-padding-horizontal"),
  padV:         CU("card-padding-vertical"),
  borderRest:   CU("card-borderwidth-rest"),
  borderHover:  CU("card-borderwidth-hover"),
  borderSelected: CU("card-borderwidth-selected"),

  focusWidth:   CU("focusring-width"),
  focusOffset:  CU("focusring-offset"),

  iconBox:      SU("accessibility-touch-target-desktop-only-width"),
  iconRadius:   SU("cornerradius-base"),
  rowGap:       SU("gap-xxxtight"),

  glyph:        20,
};

const TYPE = {
  title: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
    fontSize: ST("font-size-r"), lineHeight: ST("line-height-r-single"),
    letterSpacing: ST("letter-spacing-spacious"),
  },
  subtitle: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
    fontSize: ST("font-size-xs"), lineHeight: ST("line-height-xs-single"),
    letterSpacing: ST("letter-spacing-extraspacious"),
  },
  body: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
    fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
};

export const STATES = ["default", "hover", "focus", "active", "disabled"];

/**
 * @param {string} title     the heading. Omit it and there is no heading.
 * @param {node}   subtitle  Slot.CardSubtitle
 * @param {string} body      CardBody
 * @param {node}   icon      IconLeading, shown in a tinted box before the title
 * @param {node}   children  Slot.CardSupportingContent
 * @param {func}   onClick   with it the whole card is a target and the hover,
 *                           active and focus states apply; without it the card
 *                           is a plain container
 * @param {boolean} disabled
 * @param {string} forceState  for the state matrix in Storybook only. Real
 *                             cards derive their state from interaction.
 */
export function Card({
  title,
  subtitle,
  body,
  icon,
  children,
  onClick,
  disabled = false,
  forceState,
  as,
  style,
  className = "",
  ...rest
}) {
  const [hov, setHov] = useState(false);
  const [down, setDown] = useState(false);
  const [focus, setFocus] = useState(false);

  const interactive = Boolean(onClick) && !disabled;
  const state = forceState
    || (disabled ? "disabled"
      : !interactive ? "default"
      : down ? "active"
      : focus ? "focus"
      : hov ? "hover"
      : "default");

  const look = (() => {
    if (state === "disabled") return {
      border: `${L.borderRest} solid ${T.borderDisabled}`,
      boxShadow: "none", opacity: 0.38,
    };
    if (state === "active") return {
      border: `${L.borderSelected} solid ${T.borderActive}`,
      boxShadow: shadow("pressed"),
    };
    if (state === "hover") return {
      border: `${L.borderHover} solid ${T.borderHover}`,
      boxShadow: shadow("hover"),
    };
    if (state === "focus") return {
      border: `${L.borderRest} solid ${T.border}`,
      boxShadow: shadow("rest"),
      outline: `${L.focusWidth} solid ${T.focusRing}`,
      outlineOffset: L.focusOffset,
    };
    return {
      border: `${L.borderRest} solid ${T.border}`,
      boxShadow: shadow("rest"),
    };
  })();

  const Tag = as || (interactive ? "button" : "div");

  return (
    <Tag
      className={`pw-card ${className}`}
      data-state={state}
      type={Tag === "button" ? "button" : undefined}
      disabled={Tag === "button" ? disabled : undefined}
      aria-disabled={Tag !== "button" && disabled ? true : undefined}
      onClick={interactive ? onClick : undefined}
      onMouseEnter={interactive ? () => setHov(true) : undefined}
      onMouseLeave={interactive ? () => { setHov(false); setDown(false); } : undefined}
      onMouseDown={interactive ? () => setDown(true) : undefined}
      onMouseUp={interactive ? () => setDown(false) : undefined}
      onFocus={interactive ? () => setFocus(true) : undefined}
      onBlur={interactive ? () => setFocus(false) : undefined}
      style={{
        display: "flex", flexDirection: "column", gap: L.gap,
        padding: `${L.padV} ${L.padH}`,
        minWidth: 0, textAlign: "left",
        background: T.surface,
        borderRadius: L.radius,
        cursor: interactive ? "pointer" : "default",
        font: "inherit",
        ...look,
        transition: `border-color ${MO("duration-2")} ${MO("easing-standard")}, border-width ${MO("duration-2")} ${MO("easing-standard")}, box-shadow ${MO("duration-2")} ${MO("easing-standard")}, opacity ${MO("duration-2")} ${MO("easing-standard")}, outline-color ${MO("duration-2")} ${MO("easing-standard")}`,
        ...style,
      }}
      {...rest}
    >
      {(icon || title || subtitle) && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: L.gap, minWidth: 0 }}>
          {icon && (
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: L.iconBox, height: L.iconBox, flex: "0 0 auto",
              background: T.iconFill, color: T.iconFg,
              borderRadius: L.iconRadius,
            }}>{icon}</span>
          )}
          {(title || subtitle) && (
            <div style={{ display: "flex", flexDirection: "column", gap: L.rowGap, minWidth: 0, flex: 1 }}>
              {title && (
                <span style={{ ...TYPE.title, color: state === "disabled" ? T.disabled : T.title, minWidth: 0 }}>
                  {title}
                </span>
              )}
              {subtitle && (
                <span style={{ ...TYPE.subtitle, color: state === "disabled" ? T.disabled : T.subtitle, minWidth: 0 }}>
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {body && (
        <p style={{ ...TYPE.body, color: state === "disabled" ? T.disabled : T.body, margin: 0, minWidth: 0 }}>
          {body}
        </p>
      )}

      {children}
    </Tag>
  );
}

export const CardKeyframes = () => (
  <style>{`
@media (prefers-reduced-motion: reduce) { .pw-card { transition: none !important; } }
`}</style>
);

export default Card;
