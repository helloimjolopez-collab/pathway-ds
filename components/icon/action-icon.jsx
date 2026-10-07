/**
 * ActionIcon: the icon-only control Pathway puts in a header or a toolbar.
 *
 * SOURCE OF TRUTH: Figma set `Action Icon` 40006794:19891, on the
 * `↳ ❇️ Action Icon` page. Nine variants on two axes, read and MEASURED
 * 2026-10-07. Used 30 times inside the Widget set and twice inside KPI Tiles,
 * which makes it the most-nested component in this part of the system and the
 * one whose absence from Code Connect mattered most.
 *
 * MEASURED, per Size. The box is the target, `Container.Icon` is the state
 * layer, and the glyph is the frame size an `<Icon>` takes:
 *
 *   Size    box     Container.Icon   glyph
 *   Small   36x36        24x24        12
 *   Base    44x44        28x28        14
 *   Large   48x48        32x32        16
 *
 * `State` is Default / Hover / Pressed and is runtime, never a prop.
 * `Icon` is an INSTANCE_SWAP, which in code is the `name` prop: any Material
 * Symbols ligature.
 *
 * THE COMPONENT ITSELF BINDS NO FILL, in any of the nine variants, and the
 * glyph's fill is unbound too so it inherits. That is why this takes its
 * resting colour from `color` on the button and lets the glyph inherit it: the
 * design expresses "whatever the surrounding context is" rather than a fixed
 * icon colour, and a hard-coded one would break the Widget header, the KPI
 * tile and a dark toolbar all differently.
 *
 * WHY IT LIVES HERE rather than in widget.jsx, where it used to. It was a
 * private helper inside the Widget, so the Figma component had nothing
 * importable to point at and the KPI Tile could not reuse it. The Widget now
 * imports it.
 */
import React, { useState } from "react";
import { Icon } from "./icon.jsx";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const M = (n) => `var(--motion-${n})`;

export const ACTION_ICON_SIZES = {
  Small: { box: 36, layer: 24, glyph: 12 },
  Base:  { box: 44, layer: 28, glyph: 14 },
  Large: { box: 48, layer: 32, glyph: 16 },
};

export const T = {
  rest:       C("foreground-action-secondary-rest"),
  hover:      C("foreground-action-secondary-hover"),
  pressed:    C("foreground-action-secondary-pressed"),
  layerHover: C("fill-action-secondary-hover"),
  layerPress: C("fill-action-secondary-pressed"),
};

/**
 * @param {string} name   Material Symbols ligature, Figma's `Icon` swap.
 * @param {"Small"|"Base"|"Large"} size  Figma's Size axis.
 * @param {string} label  Required: an icon-only control with no accessible
 *                        name is unusable, so this is not optional.
 * @param {0|1} fill      FILL axis. The Widget header is FILL 0.
 * @param {string} color  Override the resting colour. Omit on a light surface;
 *                        pass one on a dark or on-brand surface, where Ghost
 *                        is the right family.
 */
export function ActionIcon({
  name,
  size = "Small",
  label,
  fill = 0,
  color,
  onClick,
  disabled,
  className = "",
  style,
  ...rest
}) {
  const [hov, setHov] = useState(false);
  const [press, setPress] = useState(false);
  const s = ACTION_ICON_SIZES[size] || ACTION_ICON_SIZES.Small;
  const fg = disabled ? T.rest : press ? T.pressed : hov ? T.hover : (color || T.rest);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onBlur={() => setPress(false)}
      className={`pw-action-icon ${className}`}
      data-size={size}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: s.box, height: s.box, flexShrink: 0, boxSizing: "border-box",
        background: "transparent", border: "none", padding: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        color: fg,
        ...style,
      }}
      {...rest}
    >
      {/* Container.Icon is the state layer, and it is SMALLER than the target.
          The fill belongs on this box, not on the button: painting the target
          gives a hover area visibly larger than the one in the design, which
          is the bug the Widget header shipped with once. */}
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: s.layer, height: s.layer, borderRadius: U("cornerradius-base"),
        background: press ? T.layerPress : hov ? T.layerHover : "transparent",
        transition: `background ${M("duration-2")} ${M("easing-standard")}`,
      }}>
        <Icon name={name} size={s.glyph} fill={fill} style={{
          transition: `color ${M("duration-2")} ${M("easing-standard")}`,
        }} />
      </span>
    </button>
  );
}

export default ActionIcon;
