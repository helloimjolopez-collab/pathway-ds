/**
 * Dropdown: a trigger and the menu it opens.
 *
 * WHY THIS EXISTS. The KPI Tiles set nests a FOREIGN component here:
 * `Dropdown` 40003188:9930, a remote library component, eighteen instances
 * inside a Pathway component. Like the Featured icon it is from the same
 * third-party library and cannot be Code Connected from this repo, because a
 * mapping publishes into the file that owns the component.
 *
 * WHAT THE FOREIGN COMPONENT ACTUALLY IS, measured 2026-10-08. Six variants on
 * two axes, `Type` (Button | Icon | Avatar) and `Open` (False | True). The one
 * the KPI Tile uses, `Type=Icon, Open=False`, walks to:
 *
 *   Type=Icon, Open=False [COMPONENT 20x20]
 *     dots-vertical [INSTANCE 20x20]
 *
 * That is all of it. No box, no fill, no border, no radius: a bare 20px glyph.
 * So eighteen instances of a foreign component were carrying a single icon.
 *
 * WHICH MEANS THE TRIGGER WAS NEVER THE HARD PART. Pathway already has the
 * icon-button primitive in `ActionIcon`, and what the system was missing is the
 * MENU: the `Open=True` half, which nothing in this repo had as a reusable
 * piece. `dashboard.jsx` grew a private `WidgetMenu` for exactly this and it
 * could not be reused.
 *
 * So this component is the pairing. The trigger is whichever of the three
 * types the caller asks for, the menu is one implementation, and `open` is the
 * Figma axis.
 *
 * THE PANEL IS PATHWAY'S OWN `PopoverMenu`, WHICH ALREADY EXISTED.
 *
 * This is the part worth reading. The foreign Dropdown's `Open=True` variants
 * are that library's menu, so copying them would import a second system's
 * panel, and the first version of this file invented a third. Neither was
 * necessary: the `↳ ❇️ Menu` page has had a complete Pathway menu all along and
 * nothing in this repo had ever implemented it.
 *
 *   PopoverMenu              40005568:4207   the panel
 *   PopoverMenu.Item         40005568:4191   3 variants on State
 *   PopoverMenu.SectionLabel 40005748:20503
 *   Menu.Divider             40006377:69269
 *
 * So `dashboard.jsx`'s private `WidgetMenu` and this file's first panel were
 * both reinventing a component the design system already had. The measurements
 * below are that component's, read on 2026-10-08:
 *
 *   PopoverMenu   212 wide, VERTICAL, pad 8, r=8, Fill/Surface/Elevated,
 *                 Stroke/Static/Neutral/Base, shadow 0 4 16 -2 at a0.08.
 *                 Its inner Menu slot is VERTICAL, gap 8, pad 6.
 *   Item          200x40, HORIZONTAL, pad 6,14,6,14, r=8, label fs 14.
 *                 Base  fill Fill/Surface/Elevated,
 *                       label Foreground/Action/Secondary/Rest
 *                 Hover fill Fill/Action/Selection/Hover,
 *                       label Foreground/Action/Secondary/Hover
 *                 Label Wrapper gap 4 pad 0,0,0,8; leading icon 20 box / 14 glyph.
 *   Divider       VERTICAL pad 6,0,6,0, a line on Stroke/Static/Neutral/Base.
 *
 * ONE GAP: the panel's shadow is 0 4 16 -2 and Pathway's nearest token is
 * --elevation-sheet, 0 4 32 -8. Same offset, different blur, and there is no
 * exact token. Used the nearest rather than inventing one; recorded in the spec.
 */
import React, { useEffect, useRef, useState, useId } from "react";
import { Icon } from "../icon/icon.jsx";
import { ActionIcon } from "../icon/action-icon.jsx";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;
const M = (n) => `var(--motion-${n})`;

export const DROPDOWN_TYPES = ["icon", "button", "avatar"];

export const T = {
  panel:        C("fill-surface-elevated"),
  panelBorder:  C("stroke-static-neutral-base"),
  // Menu.Divider strokes with the BASE neutral, not the faint one.
  divider:      C("stroke-static-neutral-base"),
  // PopoverMenu.Item's label is an ACTION foreground, not a static one: the
  // item is interactive, and State=Hover moves it from Rest to Hover.
  item:         C("foreground-action-secondary-rest"),
  itemFgHover:  C("foreground-action-secondary-hover"),
  // State=Hover fills with Action/SELECTION/Hover, which is the selection
  // family rather than the secondary one. Measured.
  itemHover:    C("fill-action-selection-hover"),
  danger:       C("foreground-static-negative-on-subtle"),
  subtle:       C("foreground-static-neutral-subtle"),
  // The Icon type is a bare 20px glyph in Figma, so its colour is inherited
  // rather than set: it takes whatever the tile around it is using.
  trigger:      C("foreground-action-secondary-rest"),
  triggerHover: C("foreground-action-secondary-hover"),
  buttonFill:   C("fill-surface-elevated"),
  buttonBorder: C("stroke-action-secondary-rest"),
  avatarFill:   C("fill-action-primary-subtle-rest"),
  avatarText:   C("foreground-action-primary-on-subtle-rest"),
};

export const L = {
  // Figma: the Icon trigger is 20x20 with a 20x20 glyph and nothing around it.
  iconBox:     20,
  iconGlyph:   20,
  // PopoverMenu: 212 wide, pad 8, r=8. Its inner slot is gap 8, pad 6.
  panelMinW:   212,
  radius:      U("cornerradius-base"),
  border:      "var(--semantic-layout-units-borderwidth-base)",
  panelPad:    U("padding-xtight"),
  slotPad:     U("padding-xxtight"),
  slotGap:     U("gap-xtight"),
  // PopoverMenu.Item: 40 tall, pad 6,14,6,14, label gap 4 with an 8 inset.
  itemH:       40,
  itemPadV:    U("padding-xxtight"),
  // Figma's item pad is 6,14,6,14, and 14 IS a rung: Padding/Medium. This read
  // Padding/Tight, 12, under a comment asserting the ladder went 12 then 16,
  // which is the gap ladder and not the padding ladder. Corrected 2026-10-08.
  itemPadH:    U("padding-medium"),
  itemInset:   U("padding-xtight"),
  gap:         U("gap-xxtight"),
  // Menu.Divider: pad 6,0,6,0.
  dividerPadV: U("padding-xxtight"),
  // Leading icon: a 20 box holding a 14 glyph.
  leadingBox:  20,
  leadingGlyph: 14,
  offset:      4,
  buttonPadV:  U("padding-xtight"),
  buttonPadH:  U("padding-tight"),
  avatarBox:   28,
};

/**
 * One menu entry.
 *
 * @param {string} label
 * @param {func} onSelect
 * @param {boolean} danger   Destructive, so it takes the negative foreground.
 * @param {boolean} checked  Draws a leading check. Used for a current value.
 * @param {string} icon      Figma's `Leading.Icon` swap, a Material ligature.
 * @param {boolean} disabled
 */
export function DropdownItem({ label, onSelect, danger, checked, disabled, note, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-checked={checked === undefined ? undefined : !!checked}
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: L.gap, width: "100%",
        minHeight: L.itemH, boxSizing: "border-box",
        textAlign: "left", padding: `${L.itemPadV} ${L.itemPadH}`,
        borderRadius: L.radius,
        background: hov && !disabled ? T.itemHover : "transparent",
        border: "none", cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        // The label follows State, Rest to Hover, which is why it is an action
        // foreground rather than a static one.
        color: danger ? T.danger : (hov && !disabled ? T.itemFgHover : T.item),
        fontFamily: "inherit",
        fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
        letterSpacing: Y("letter-spacing-spacious"),
        transition: `background ${M("duration-2")} ${M("easing-standard")}, color ${M("duration-2")} ${M("easing-standard")}`,
      }}
    >
      {/* Container.LeadingIcon: a 20 box holding a 14 glyph. Figma gates it
          with `Show Leading Icon`, which is `icon` or `checked` here. */}
      {(icon || checked !== undefined) && (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: L.leadingBox, height: L.leadingBox, flexShrink: 0 }}>
          <Icon name={icon || (checked ? "check" : "")} size={L.leadingGlyph}
            style={{ opacity: icon || checked ? 1 : 0 }} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, paddingLeft: icon || checked !== undefined ? 0 : L.itemInset }}>{label}</span>
      {note && <span style={{ color: T.subtle, fontSize: Y("font-size-xxs") }}>{note}</span>}
    </button>
  );
}

/** A rule between groups of items. */
/** Figma `Menu.Divider` 40006377:69269: a line with 6px above and below. */
export const DropdownDivider = () => (
  <hr aria-hidden="true" style={{
    border: 0, borderTop: `${L.border} solid ${T.divider}`,
    margin: `${L.dividerPadV} 0`,
  }} />
);

/**
 * @param {"icon"|"button"|"avatar"} type  Figma's Type axis.
 * @param {boolean} open     Figma's Open axis. Controlled when given, internal
 *                           when not, so a story can show the open state and a
 *                           product can own it.
 * @param {node} children    `DropdownItem`s and `DropdownDivider`s.
 * @param {string} label     The trigger's accessible name. Required for `icon`
 *                           and `avatar`, which have no visible text.
 * @param {string} text      The `button` type's visible label.
 * @param {string} initials  The `avatar` type's initials.
 * @param {string} icon      The `icon` type's ligature. Figma draws
 *                           dots-vertical, which is `more_vert`.
 * @param {"start"|"end"} align  Which edge of the trigger the panel lines up
 *                           with. `end` by default: a trigger at the top-right
 *                           of a card opens leftward or the panel leaves the
 *                           card.
 */
export function Dropdown({
  type = "icon",
  open: openProp,
  onOpenChange,
  children,
  label,
  text,
  initials,
  icon = "more_vert",
  align = "end",
  className = "",
  style,
}) {
  const controlled = openProp !== undefined;
  const [openState, setOpenState] = useState(false);
  const open = controlled ? openProp : openState;
  const setOpen = (v) => { if (!controlled) setOpenState(v); onOpenChange?.(v); };

  const wrap = useRef(null);
  const panelId = `pwdd${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [hov, setHov] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const shared = {
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? panelId : undefined,
    onClick: () => setOpen(!open),
  };

  let trigger;
  if (type === "button") {
    trigger = (
      <button type="button" {...shared} aria-label={label}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          display: "inline-flex", alignItems: "center", gap: L.gap,
          padding: `${L.buttonPadV} ${L.buttonPadH}`, cursor: "pointer",
          background: hov ? T.itemHover : T.buttonFill,
          border: `${L.border} solid ${T.buttonBorder}`, borderRadius: L.radius,
          color: T.trigger, fontFamily: "inherit",
          fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
          letterSpacing: Y("letter-spacing-spacious"), whiteSpace: "nowrap",
          transition: `background ${M("duration-2")} ${M("easing-standard")}`,
        }}>
        {text}
        <Icon name={open ? "expand_less" : "expand_more"} size={16} />
      </button>
    );
  } else if (type === "avatar") {
    trigger = (
      <button type="button" {...shared} aria-label={label}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: L.avatarBox, height: L.avatarBox, borderRadius: L.radius,
          background: T.avatarFill, color: T.avatarText, border: "none",
          cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
          fontSize: Y("font-size-xxs"), fontWeight: Y("weight-semibold"),
          letterSpacing: Y("letter-spacing-spacious"),
          filter: hov ? "brightness(0.97)" : "none",
          transition: `filter ${M("duration-2")} ${M("easing-standard")}`,
        }}>
        {initials}
      </button>
    );
  } else {
    /* Figma's Icon type is a BARE 20px glyph: no box, no fill, no border. So
       this is not an ActionIcon, which carries a 36px target and a state
       layer. It is the glyph alone, in a 20px button, which is what the KPI
       tile's top-right control is. */
    trigger = (
      <button type="button" {...shared} aria-label={label}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: L.iconBox, height: L.iconBox, padding: 0, flexShrink: 0,
          background: "transparent", border: "none", cursor: "pointer",
          color: hov || open ? T.triggerHover : T.trigger,
          transition: `color ${M("duration-2")} ${M("easing-standard")}`,
        }}>
        <Icon name={icon} size={L.iconGlyph} />
      </button>
    );
  }

  return (
    <span ref={wrap} className={`pw-dropdown ${className}`} data-type={type}
      data-open={open || undefined}
      style={{ position: "relative", display: "inline-flex", ...style }}>
      {trigger}
      {open && (
        <div id={panelId} role="menu" aria-label={label || text}
          style={{
            position: "absolute", top: `calc(100% + ${L.offset}px)`, zIndex: 30,
            [align === "end" ? "right" : "left"]: 0,
            minWidth: L.panelMinW, boxSizing: "border-box",
            // PopoverMenu pad 8, with its inner Menu slot at pad 6 and gap 8.
            padding: L.panelPad,
            background: T.panel, border: `${L.border} solid ${T.panelBorder}`,
            borderRadius: L.radius,
            /* Figma's shadow is 0 4 16 -2 at a0.08. --elevation-sheet is
               0 4 32 -8: the same offset, a softer blur, and the nearest token
               that exists. Recorded in the spec rather than inventing one. */
            boxShadow: "var(--elevation-sheet)",
          }}>
          <div style={{ display: "flex", flexDirection: "column",
            gap: L.slotGap, padding: L.slotPad }}>
            {children}
          </div>
        </div>
      )}
    </span>
  );
}

export default Dropdown;
