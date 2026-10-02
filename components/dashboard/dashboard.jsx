import React, { useEffect, useMemo, useRef, useState } from "react";
import { Widget, WidgetKeyframes, SIZES, SIZE_LABEL, SIZE_GRID } from "../widget/widget.jsx";

/**
 * dashboard.jsx — the Dashboard page template: the shell that holds the toolbar
 * and the widget grid, plus the templated flow for managing a dashboard and
 * adding widgets.
 *
 * Sibling to Widget. Widget owns the tiles; this owns the container, the
 * toolbar, saved-dashboard management, and the manage mode that makes the tiles
 * editable. The split is deliberate: a widget knows nothing about which
 * dashboard it is on, and the dashboard knows nothing about what is inside a
 * widget.
 *
 * WHERE THE DESIGN CAME FROM
 *   Spec   dashboard-shell-spec.md, in full: modes, dashboard types, toolbar
 *          anatomy per mode, the save-and-edit matrix, the manage-dashboards
 *          list, and the mode-aware widget overflow.
 *   Figma  'Dashboards' organism page 40009417:19915, and the templated flow
 *          'Dashboards: Add Widgets, Edit Dashboards' 40016300:28543, section
 *          'Add Widget & Manage Flows v2' 40016303:38002.
 *   Demo   widget-container.html, which is the interaction source of truth for
 *          the grid, the dashboard selector and the widget finder.
 *
 * THE GRID
 * 4 / 8 / 12 columns at mobile / tablet / desktop, 48px auto-rows, dense row
 * flow so widgets pull up and leftover space collects at the bottom. Widget
 * widths are fluid column spans and heights are fixed row counts, so two short
 * widgets stack to exactly fill one tall widget and a row never leaves a gap.
 * Compaction is always on; there is no drag-to-pixel-position and no
 * drag-to-resize. Size is picked from the widget's own menu.
 *
 * THE SAVE MATRIX, which is the part that is easy to get wrong
 *   Editing the SYSTEM dashboard: Done requires a name first and saves a NEW
 *   custom dashboard. The system baseline is never overwritten.
 *   Editing a CUSTOM dashboard: Done saves back to that dashboard. Save as
 *   creates a new one and leaves the original alone.
 * Cancel always exits manage mode without saving.
 *
 * THE TEXT BAN applies here too. The toolbar carries control labels and the
 * dashboard's own name. There are no explanatory sentences, no "you are editing"
 * banners and no helper copy. Manage mode is shown by the controls changing and
 * by every tile taking a dashed border, not by a sentence saying so.
 */

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const MO = (n) => `var(--motion-${n})`;

export const T = {
  canvas:        SC("fill-static-neutral-base"),
  surface:       SC("fill-surface-overlay"),
  hoverFill:     SC("fill-static-neutral-subtle"),
  pressedFill:   SC("fill-static-neutral-strong"),
  border:        SC("stroke-static-neutral-base"),
  divider:       SC("stroke-static-neutral-faint"),

  title:         SC("foreground-static-neutral-strong"),
  body:          SC("foreground-static-neutral-base"),
  subtle:        SC("foreground-static-neutral-subtle"),
  faint:         SC("foreground-static-neutral-faint"),

  primaryFill:   SC("fill-action-primary-strong-rest"),
  primaryHover:  SC("fill-action-primary-strong-hover"),
  primaryFg:     SC("foreground-action-primary-on-strong"),
  secondaryFg:   SC("foreground-action-secondary-rest"),

  accent:        SC("foreground-static-brand-on-subtle"),
  accentFill:    SC("fill-static-brand-subtle"),
  danger:        SC("foreground-static-negative-on-subtle"),
  dangerFill:    SC("fill-static-negative-subtle"),

  focusRing:     SC("stroke-action-primary-strong-rest"),
  badgeFill:     SC("fill-static-neutral-strong"),
};

export const L = {
  // The grid. These two are the dashboard's own, not the widget's.
  rowUnit:      48,
  gap:          SU("gap-base"),

  pagePadV:     SU("padding-base"),
  pagePadH:     SU("padding-base"),
  toolbarGap:   SU("gap-medium"),
  toolbarMinH:  SU("accessibility-touch-target-aa-height"),
  rowGap:       SU("gap-tight"),
  tightGap:     SU("gap-xxtight"),

  radius:       SU("cornerradius-base"),
  radiusSm:     SU("cornerradius-small"),
  radiusLg:     SU("cornerradius-large"),
  // Widget finder. The icon inset and the left padding are the same rung, so
  // the glyph sits in the padding rather than beside it.
  finderWidth:     220,
  finderIcon:      18,
  finderIconInset: SU("padding-xxtight"),
  finderPadLeft:   SU("padding-wide"),
  finderPadRight:  SU("padding-wide"),
  radiusFull:   SU("cornerradius-full"),
  border:       SU("borderwidth-base"),

  btnPadV:      SU("padding-xxtight"),
  btnPadH:      SU("padding-tight"),
  target:       SU("accessibility-touch-target-desktop-only-width"),
  targetAA:     SU("accessibility-touch-target-aa-width"),

  menuPadV:     SU("padding-xxxtight"),
  menuItemPadV: SU("padding-xxtight"),
  menuItemPadH: SU("padding-tight"),
  dialogPad:    SU("padding-base"),

  glyph:        16,
  glyphSm:      14,
  glyphLg:      20,
  glyphEmpty:   24,
};

const TYPE = {
  pageTitle: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
    fontSize: ST("font-size-xl"), lineHeight: ST("line-height-xl-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  dialogTitle: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
    fontSize: ST("font-size-l"), lineHeight: ST("line-height-l-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  control: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
    fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  body: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
    fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  caption: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
    fontSize: ST("font-size-xs"), lineHeight: ST("line-height-xs-single"),
    letterSpacing: ST("letter-spacing-extraspacious"),
  },
  badge: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
    fontSize: ST("font-size-xs"), lineHeight: ST("line-height-xs-single"),
    letterSpacing: ST("letter-spacing-extraspacious"),
  },
};

// ─── CONTROLS ──────────────────────────────────────────────────────────────────
function Glyph({ name, size = L.glyph, color, style }) {
  return (
    <span className="material-symbols-rounded" aria-hidden="true" style={{
      fontSize: size, lineHeight: 1, display: "block", userSelect: "none",
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
      color, ...style,
    }}>{name}</span>
  );
}

/**
 * The toolbar's buttons. `tone` is primary for the one committing action,
 * secondary for a bordered control, naked for the quiet ones. No hover rise:
 * elevation and fill change, nothing translates.
 */
export function Button({ children, tone = "naked", icon, trailingIcon, onClick, disabled, ariaExpanded, ariaHasPopup, buttonRef, danger }) {
  const [hov, setHov] = useState(false);
  const [down, setDown] = useState(false);

  const look = (() => {
    if (tone === "primary") return {
      background: hov ? T.primaryHover : T.primaryFill,
      color: T.primaryFg, border: `${L.border} solid transparent`,
    };
    if (tone === "secondary") return {
      background: hov ? T.hoverFill : "transparent",
      color: danger ? T.danger : T.body, border: `${L.border} solid ${T.border}`,
    };
    return {
      background: down ? T.pressedFill : hov ? T.hoverFill : "transparent",
      color: danger ? T.danger : T.secondaryFg, border: `${L.border} solid transparent`,
    };
  })();

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      style={{
        ...TYPE.control, ...look,
        display: "inline-flex", alignItems: "center", gap: L.tightGap,
        minHeight: L.target,
        padding: `${L.btnPadV} ${L.btnPadH}`,
        borderRadius: L.radius,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.38 : 1,
        whiteSpace: "nowrap",
        transition: `background ${MO("duration-2")} ${MO("easing-standard")}, color ${MO("duration-2")} ${MO("easing-standard")}, border-color ${MO("duration-2")} ${MO("easing-standard")}, opacity ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      {icon && <Glyph name={icon} size={L.glyph} color="currentColor" />}
      {children}
      {trailingIcon && <Glyph name={trailingIcon} size={L.glyph} color="currentColor" />}
    </button>
  );
}

function Popover({ children, align = "left", minWidth = 240, onClose, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const away = (e) => { if (!ref.current?.contains(e.target)) onClose?.(); };
    const esc = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return (
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      style={{
        position: "absolute", top: "100%", [align]: 0, zIndex: 60, minWidth,
        marginTop: L.tightGap,
        background: T.surface,
        border: `${L.border} solid ${T.border}`,
        borderRadius: L.radius,
        boxShadow: "var(--elevation-lift)",
        padding: `${L.menuPadV} 0`,
        animation: `pwDashMenu ${MO("duration-3")} ${MO("easing-decelerate")} both`,
      }}
    >
      {children}
    </div>
  );
}

function Row({ label, meta, leading, trailing, onClick, danger, checked, role = "menuitem", disabled }) {
  const [hov, setHov] = useState(false);
  const fg = disabled ? T.faint : danger ? T.danger : checked ? T.accent : T.body;
  return (
    <button
      type="button" role={role} disabled={disabled}
      aria-checked={role === "menuitemradio" ? checked : undefined}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...TYPE.control, color: fg,
        display: "flex", alignItems: "center", gap: L.rowGap, width: "100%",
        minHeight: L.target,
        padding: `${L.menuItemPadV} ${L.menuItemPadH}`,
        background: hov && !disabled ? (danger ? T.dangerFill : T.hoverFill) : "transparent",
        border: "none", cursor: disabled ? "default" : "pointer", textAlign: "left",
        transition: `background ${MO("duration-2")} ${MO("easing-standard")}, color ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      {leading}
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        {meta && <span style={{ ...TYPE.caption, color: T.faint }}>{meta}</span>}
      </span>
      {trailing}
    </button>
  );
}

function SizeBadge({ size }) {
  return (
    <span style={{
      ...TYPE.badge, color: T.subtle, background: T.badgeFill,
      borderRadius: L.radiusFull, padding: `0 ${L.btnPadH}`, flex: "0 0 auto",
    }}>{SIZE_LABEL[size]}</span>
  );
}

// ─── DASHBOARD SELECTOR ────────────────────────────────────────────────────────
/**
 * The name and the chevron are two distinct targets: clicking the name renames
 * it in place (manage mode only), clicking the chevron opens the list of saved
 * dashboards. Separating them means the heading is never a mystery button.
 */
function DashboardSelector({ dashboard, dashboards, manage, onRename, onSwitch, onManageDashboards }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(dashboard.name);
  const [hovName, setHovName] = useState(false);

  useEffect(() => { setDraft(dashboard.name); }, [dashboard.name]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== dashboard.name) onRename?.(next);
    else setDraft(dashboard.name);
  };
  const canRename = manage && dashboard.type !== "system";

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 0, minWidth: 0 }}>
      {editing ? (
        <input
          autoFocus value={draft}
          aria-label="Dashboard name"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setDraft(dashboard.name); setEditing(false); }
          }}
          style={{
            ...TYPE.pageTitle, color: T.title,
            background: T.surface,
            border: `${L.border} solid ${T.focusRing}`,
            borderRadius: L.radius, padding: `0 ${L.btnPadH}`, outline: "none",
          }}
        />
      ) : (
        <span
          onClick={canRename ? () => setEditing(true) : undefined}
          onMouseEnter={() => setHovName(true)}
          onMouseLeave={() => setHovName(false)}
          title={dashboard.name}
          style={{
            ...TYPE.pageTitle, color: T.title,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            maxWidth: 420, minWidth: 0,
            borderRadius: L.radiusSm,
            padding: `0 ${L.tightGap}`,
            background: canRename && hovName ? T.hoverFill : "transparent",
            cursor: canRename ? "text" : "default",
            transition: `background ${MO("duration-2")} ${MO("easing-standard")}`,
          }}
        >
          {dashboard.name}
        </span>
      )}

      {/* The system dashboard is read-only, and saying so as a badge rather than
          a sentence is the whole point of the text ban. */}
      {dashboard.type === "system" && <SizeBadgeLike label="System" />}

      <Button
        icon="expand_more"
        ariaHasPopup="menu"
        ariaExpanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pw-sr-only">Switch dashboard</span>
      </Button>

      {open && (
        <Popover label="Saved dashboards" onClose={() => setOpen(false)} minWidth={260}>
          {dashboards.map((d) => (
            <Row
              key={d.id}
              role="menuitemradio"
              checked={d.id === dashboard.id}
              label={d.name}
              meta={d.isDefault ? "Default" : d.type === "system" ? "System" : undefined}
              leading={<Glyph name={d.type === "system" ? "dashboard" : "dashboard_customize"} size={L.glyph} color={d.id === dashboard.id ? T.accent : T.faint} />}
              trailing={d.id === dashboard.id ? <Glyph name="check" size={L.glyphSm} color={T.accent} /> : null}
              onClick={() => { onSwitch?.(d.id); setOpen(false); }}
            />
          ))}
          <span role="separator" style={{ display: "block", height: L.border, background: T.divider, margin: `${L.menuPadV} 0` }} />
          <Row
            label="Manage dashboards"
            leading={<Glyph name="settings" size={L.glyph} color={T.faint} />}
            onClick={() => { setOpen(false); onManageDashboards?.(); }}
          />
        </Popover>
      )}
    </div>
  );
}

function SizeBadgeLike({ label }) {
  return (
    <span style={{
      ...TYPE.badge, color: T.subtle, background: T.badgeFill,
      borderRadius: L.radiusFull, padding: `0 ${L.btnPadH}`,
      flex: "0 0 auto", marginLeft: L.tightGap,
    }}>{label}</span>
  );
}

// ─── ADD WIDGET ────────────────────────────────────────────────────────────────
/**
 * The widget finder. A searchable list of what can be added, each row carrying
 * the size it lands at, so the choice is informed before it is made. Rows
 * already on the dashboard are shown as added rather than hidden, so the list
 * does not shuffle under the user between visits.
 */
/**
 * Filters the widgets already on the dashboard. NOT the catalogue search: that
 * is AddWidgetPanel below, and the two answer different questions. "Where is my
 * cash widget" is this one; "what widgets exist" is that one.
 *
 * The clear button is always rendered once there is a query, rather than on
 * hover or focus, because the field is a FILTER: a dashboard showing three of
 * its eleven widgets needs a visible way back whether or not the box has focus.
 */
export function WidgetFinder({ value, onChange }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span className="material-symbols-rounded" aria-hidden="true" style={{
        position: "absolute", left: L.finderIconInset, fontSize: L.finderIcon,
        color: T.subtle, pointerEvents: "none",
        fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${L.finderIcon}`,
      }}>search</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Find a widget"
        aria-label="Find a widget"
        style={{
          minHeight: L.toolbarMinH,
          width: L.finderWidth,
          paddingLeft: L.finderPadLeft,
          paddingRight: L.finderPadRight,
          background: T.canvas,
          border: `${L.border} solid ${T.border}`,
          borderRadius: L.radius,
          color: T.title,
          fontFamily: "inherit",
          fontSize: ST("font-size-s"),
          letterSpacing: ST("letter-spacing-spacious"),
          // The native clear affordance is suppressed so there is one clear
          // control rather than two of different shapes in the same field.
          appearance: "none", WebkitAppearance: "none", outlineOffset: 2,
        }}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear widget search"
          onClick={() => onChange("")}
          style={{
            position: "absolute", right: L.finderIconInset,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", cursor: "pointer",
            padding: 0, color: T.subtle,
          }}
        >
          <span className="material-symbols-rounded" aria-hidden="true" style={{
            fontSize: L.finderIcon,
            fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${L.finderIcon}`,
          }}>close</span>
        </button>
      )}
    </div>
  );
}

export function AddWidgetPanel({ catalogue, presentIds, onAdd, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return catalogue;
    return catalogue.filter((c) =>
      c.name.toLowerCase().includes(needle) || (c.group || "").toLowerCase().includes(needle));
  }, [catalogue, q]);

  return (
    <Popover label="Add widget" onClose={onClose} minWidth={300} align="right">
      <div style={{ padding: `${L.menuPadV} ${L.menuItemPadH} ${L.menuItemPadV}` }}>
        <div style={{
          display: "flex", alignItems: "center", gap: L.tightGap,
          height: L.target, padding: `0 ${L.btnPadV}`,
          background: T.surface,
          border: `${L.border} solid ${T.border}`,
          borderRadius: L.radiusFull,
        }}>
          <Glyph name="search" size={L.glyphSm} color={T.faint} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a widget"
            aria-label="Find a widget"
            style={{
              ...TYPE.body, flex: 1, minWidth: 0, color: T.body,
              background: "transparent", border: "none", outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ maxHeight: 320, overflowY: "auto", minWidth: 0 }}>
        {results.length === 0 ? (
          // A genuinely empty result, with the search as the recovery. This and
          // a widget's whole-empty state are the only prose in the template.
          <div style={{ ...TYPE.caption, color: T.faint, padding: `${L.menuItemPadV} ${L.menuItemPadH} ${L.dialogPad}` }}>
            Nothing matches that name.
          </div>
        ) : (
          results.map((c) => {
            const added = presentIds.includes(c.id);
            return (
              <Row
                key={c.id}
                label={c.name}
                meta={c.group}
                disabled={added && !c.repeatable}
                leading={<Glyph name={added ? "check_circle" : "add"} size={L.glyph} color={added ? T.accent : T.accent} />}
                trailing={<SizeBadge size={c.defaultSize} />}
                onClick={() => { if (!added || c.repeatable) { onAdd?.(c); onClose?.(); } }}
              />
            );
          })
        )}
      </div>
    </Popover>
  );
}

/**
 * The in-grid add tile. Shown whenever the dashboard is nearly empty, so there
 * is always an obvious way to add the next widget without hunting the toolbar.
 */
function AddWidgetTile({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...TYPE.control,
        gridColumn: "span var(--pw-dash-add-cols)",
        gridRow: `span ${SIZE_GRID.glance.rows}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: L.tightGap,
        background: hov ? T.hoverFill : "transparent",
        color: hov ? T.body : T.subtle,
        border: `${L.border} dashed ${T.border}`,
        borderRadius: L.radiusLg, cursor: "pointer",
        transition: `background ${MO("duration-2")} ${MO("easing-standard")}, color ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      <Glyph name="add" size={L.glyphEmpty} color="currentColor" />
      Add widget
    </button>
  );
}

// ─── MANAGE DASHBOARDS ─────────────────────────────────────────────────────────
/**
 * Swap, set as default, rename, delete. The system dashboard can be set as the
 * default and opened, but never renamed and never deleted, so those two rows
 * are disabled on it rather than hidden: the user can see the rule.
 */
export function ManageDashboardsDialog({ dashboards, activeId, onSwitch, onSetDefault, onRename, onDelete, onClose }) {
  const ref = useRef(null);
  const [renaming, setRenaming] = useState(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Manage dashboards"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: L.dialogPad,
        background: SC("scrim-base"),
        animation: `pwDashScrim ${MO("duration-3")} ${MO("easing-decelerate")} both`,
      }}
    >
      <div
        ref={ref}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "80vh",
          display: "flex", flexDirection: "column",
          background: T.surface,
          border: `${L.border} solid ${T.border}`,
          borderRadius: L.radiusLg,
          boxShadow: "var(--elevation-overlay)",
          overflow: "hidden",
          animation: `pwDashDialog ${MO("duration-4")} ${MO("easing-decelerate")} both`,
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: L.rowGap,
          padding: `${L.menuItemPadV} ${L.menuItemPadV} ${L.menuItemPadV} ${L.dialogPad}`,
          borderBottom: `${L.border} solid ${T.divider}`,
        }}>
          <span style={{ ...TYPE.dialogTitle, color: T.title, flex: 1 }}>Dashboards</span>
          <Button icon="close" onClick={onClose}><span className="pw-sr-only">Close</span></Button>
        </div>

        <div style={{ overflowY: "auto", padding: `${L.menuPadV} 0` }}>
          {dashboards.map((d) => {
            const system = d.type === "system";
            return (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: L.tightGap,
                padding: `${L.menuPadV} ${L.menuItemPadH}`,
              }}>
                {renaming === d.id ? (
                  <input
                    autoFocus value={draft}
                    aria-label={`Rename ${d.name}`}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => { const v = draft.trim(); if (v) onRename?.(d.id, v); setRenaming(null); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { const v = draft.trim(); if (v) onRename?.(d.id, v); setRenaming(null); }
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    style={{
                      ...TYPE.control, flex: 1, minWidth: 0, color: T.body,
                      background: T.surface, border: `${L.border} solid ${T.focusRing}`,
                      borderRadius: L.radiusSm, padding: `${L.btnPadV} ${L.tightGap}`, outline: "none",
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onSwitch?.(d.id)}
                    style={{
                      ...TYPE.control, flex: 1, minWidth: 0, textAlign: "left",
                      display: "flex", alignItems: "center", gap: L.rowGap,
                      minHeight: L.target, padding: `${L.btnPadV} ${L.tightGap}`,
                      background: "transparent", border: "none", cursor: "pointer",
                      color: d.id === activeId ? T.accent : T.body,
                    }}
                  >
                    <Glyph name={system ? "dashboard" : "dashboard_customize"} size={L.glyph}
                      color={d.id === activeId ? T.accent : T.faint} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                    {system && <SizeBadgeLike label="System" />}
                    {d.isDefault && <SizeBadgeLike label="Default" />}
                  </button>
                )}

                <Button
                  icon="star"
                  disabled={d.isDefault}
                  onClick={() => onSetDefault?.(d.id)}
                ><span className="pw-sr-only">{`Set ${d.name} as default`}</span></Button>
                <Button
                  icon="edit"
                  disabled={system}
                  onClick={() => { setDraft(d.name); setRenaming(d.id); }}
                ><span className="pw-sr-only">{`Rename ${d.name}`}</span></Button>
                <Button
                  icon="delete"
                  danger
                  disabled={system}
                  onClick={() => onDelete?.(d.id)}
                ><span className="pw-sr-only">{`Delete ${d.name}`}</span></Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Naming gate. Editing the system dashboard cannot commit without a name,
 *  because the commit creates a new custom dashboard. */
export function SaveAsDialog({ initialName, onSave, onClose }) {
  const [name, setName] = useState(initialName || "");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  const ok = name.trim().length > 0;

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Save dashboard"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: L.dialogPad, background: SC("scrim-base"),
        animation: `pwDashScrim ${MO("duration-3")} ${MO("easing-decelerate")} both`,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 420,
        display: "flex", flexDirection: "column", gap: L.rowGap,
        padding: L.dialogPad,
        background: T.surface,
        border: `${L.border} solid ${T.border}`,
        borderRadius: L.radiusLg,
        boxShadow: "var(--elevation-overlay)",
        animation: `pwDashDialog ${MO("duration-4")} ${MO("easing-decelerate")} both`,
      }}>
        <span style={{ ...TYPE.dialogTitle, color: T.title }}>Save dashboard</span>
        <input
          ref={ref}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && ok) onSave?.(name.trim()); }}
          aria-label="Dashboard name"
          placeholder="Dashboard name"
          style={{
            ...TYPE.body, color: T.body,
            minHeight: L.targetAA,
            background: T.surface,
            border: `${L.border} solid ${T.border}`,
            borderRadius: L.radius, padding: `0 ${L.btnPadH}`, outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: L.tightGap }}>
          <Button tone="secondary" onClick={onClose}>Cancel</Button>
          <Button tone="primary" disabled={!ok} onClick={() => ok && onSave?.(name.trim())}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ─── THE DASHBOARD ─────────────────────────────────────────────────────────────
/**
 * @param {object[]} dashboards   [{ id, name, type: 'system'|'custom', isDefault, widgets: [{id, catalogueId, title, size, state}] }]
 * @param {string}   activeId
 * @param {object[]} catalogue    [{ id, name, group, defaultSize, supportedSizes, repeatable }]
 * @param {function} renderWidget (widget, api) => node, for the content slot
 * @param {function} onCommit     ({ mode, dashboard, name }) => void
 */
export function Dashboard({
  dashboards,
  activeId,
  catalogue = [],
  renderWidget,
  onSwitch,
  onCommit,
  onSetDefault,
  onRenameDashboard,
  onDeleteDashboard,
  /** Refresh every widget at once. The toolbar button is drawn only when a
   *  consumer supplies this, because a board whose widgets do not fetch has
   *  nothing to refresh and the button would be a lie. */
  onRefreshAll,
}) {
  const active = dashboards.find((d) => d.id === activeId) || dashboards[0];

  const [manage, setManage] = useState(false);
  const [draftWidgets, setDraftWidgets] = useState(null);   // null means not editing
  const [draftName, setDraftName] = useState(active?.name || "");
  const [addOpen, setAddOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  // THE WIDGET FINDER IS PART OF THE TOOLBAR, not of the add-widget panel. In
  // the canonical demo it is a standing input that filters the widgets ALREADY
  // on the dashboard, with its own clear button, and it is available without
  // entering manage mode. Here it only existed inside the Add widget panel,
  // where it searched the catalogue instead: a different question, answered in
  // a place you had to open a panel to reach. Reported 2026-10-02.
  const [find, setFind] = useState("");
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [flashId, setFlashId] = useState(null);

  const allWidgets = draftWidgets ?? active?.widgets ?? [];
  // Filtering is presentational only: it never touches the draft, so finding a
  // widget cannot accidentally become an edit, and clearing the box always
  // brings the dashboard back whole.
  const q = find.trim().toLowerCase();
  const widgets = q
    ? allWidgets.filter((w) => String(w.title || "").toLowerCase().includes(q))
    : allWidgets;
  const presentIds = allWidgets.map((w) => w.catalogueId);
  // Every catalogue entry is swappable in, including ones already on the board:
  // two Bank Balances widgets scoped differently is a legitimate dashboard, and
  // the picker checks the current one rather than hiding its own neighbours.
  const swapOptions = catalogue.map((c) => ({ id: c.id, name: c.name, app: c.app }));
  const dirty = draftWidgets !== null &&
    (JSON.stringify(draftWidgets) !== JSON.stringify(active?.widgets) || draftName !== active?.name);

  const enterManage = () => {
    setDraftWidgets(active.widgets.map((w) => ({ ...w })));
    setDraftName(active.name);
    setManage(true);
  };
  const exitManage = () => {
    setManage(false);
    setDraftWidgets(null);
    setAddOpen(false);
  };

  // The save matrix. Editing the system dashboard always names and creates a
  // new custom dashboard; the baseline is never overwritten.
  const commit = (name) => {
    onCommit?.({
      mode: active.type === "system" || name ? "create" : "update",
      dashboard: { ...active, name: name || draftName, widgets },
      name: name || draftName,
    });
    exitManage();
  };
  const handleDone = () => {
    if (active.type === "system") setSaveAsOpen(true);
    else commit(null);
  };

  const mutate = (fn) => setDraftWidgets((prev) => fn([...(prev ?? active.widgets)]));

  const api = {
    resize: (id, size) => mutate((ws) => ws.map((w) => (w.id === id ? { ...w, size } : w))),
    duplicate: (id) => mutate((ws) => {
      const i = ws.findIndex((w) => w.id === id);
      if (i < 0) return ws;
      const copy = { ...ws[i], id: `${ws[i].id}-copy-${Date.now()}` };
      ws.splice(i + 1, 0, copy);
      setFlashId(copy.id);
      return ws;
    }),
    remove: (id) => mutate((ws) => ws.filter((w) => w.id !== id)),
    rename: (id, title) => mutate((ws) => ws.map((w) => (w.id === id ? { ...w, title } : w))),
    /**
     * SWAP a slot for a different widget, keeping its POSITION. The size is
     * kept too when the incoming widget supports it, and otherwise falls back
     * to that widget's own default: a Glance-only widget dropped into a Detail
     * slot would otherwise be asked to render at a size it has no layout for.
     *
     * A new widget id is minted rather than reused, because the slot now holds
     * a different widget and any per-widget state keyed on the old id belongs
     * to the widget that left.
     */
    swap: (id, option) => mutate((ws) => ws.map((w) => {
      if (w.id !== id) return w;
      const entry = catalogue.find((c) => c.id === option.id);
      const supported = entry?.supportedSizes || SIZES;
      const size = supported.includes(w.size) ? w.size : (entry?.defaultSize || supported[0]);
      return { id: `w${Date.now()}`, catalogueId: option.id, title: entry?.name || option.name, size };
    })),
  };

  const add = (entry) => {
    const id = `${entry.id}-${Date.now()}`;
    mutate((ws) => [...ws, {
      id, catalogueId: entry.id, title: entry.name,
      size: entry.defaultSize, state: "ready",
    }]);
    setFlashId(id);
  };

  useEffect(() => {
    if (!flashId) return;
    const t = window.setTimeout(() => setFlashId(null), 1400);
    return () => window.clearTimeout(t);
  }, [flashId]);

  // Drag to reorder. Compaction is always on, so dropping onto a target simply
  // splices; there are no pixel positions to keep.
  const onDrop = (overId) => {
    if (!dragId || dragId === overId) { setDragId(null); return; }
    mutate((ws) => {
      const from = ws.findIndex((w) => w.id === dragId);
      const to = ws.findIndex((w) => w.id === overId);
      if (from < 0 || to < 0) return ws;
      const [moved] = ws.splice(from, 1);
      ws.splice(to, 0, moved);
      return ws;
    });
    setDragId(null);
  };

  if (!active) return null;

  return (
    <div
      className="pw-dashboard-page"
      style={{
        background: T.canvas, minHeight: "100%",
        padding: `${L.pagePadV} ${L.pagePadH}`,
        display: "flex", flexDirection: "column", gap: L.gap,
      }}
    >
      <WidgetKeyframes />
      <DashboardKeyframes />

      {/* TOOLBAR. View mode: name, switcher, Manage. Manage mode: editable
          heading, Add widget, Discard changes, Save as, Cancel, Done. */}
      <div style={{
        display: "flex", alignItems: "center", gap: L.toolbarGap,
        minHeight: L.toolbarMinH, flexWrap: "wrap",
      }}>
        <DashboardSelector
          dashboard={{ ...active, name: manage ? draftName : active.name }}
          dashboards={dashboards}
          manage={manage}
          onRename={setDraftName}
          onSwitch={(id) => { if (!dirty) { exitManage(); onSwitch?.(id); } }}
          onManageDashboards={() => setManageOpen(true)}
        />

        <span style={{ flex: 1, minWidth: 0 }} />

        {/* THE STANDING TOOLBAR, matching the canonical demo: find a widget,
            Add widget, Refresh all. None of these used to be reachable without
            entering manage mode first, which made adding a widget a three-step
            errand and refreshing the board impossible. Manage mode is still
            where REARRANGING lives, because that is the destructive part. */}
        {!manage && (
          <>
            <WidgetFinder value={find} onChange={setFind} />
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Button
                tone="secondary" icon="add"
                ariaHasPopup="menu" ariaExpanded={addOpen}
                onClick={() => setAddOpen((v) => !v)}
              >Add widget</Button>
              {addOpen && (
                <AddWidgetPanel
                  catalogue={catalogue}
                  presentIds={presentIds}
                  onAdd={(c) => { enterManage(); add(c); }}
                  onClose={() => setAddOpen(false)}
                />
              )}
            </div>
            {onRefreshAll && (
              <Button icon="refresh" onClick={onRefreshAll}>Refresh all</Button>
            )}
          </>
        )}

        {!manage ? (
          <Button tone="secondary" icon="tune" onClick={enterManage}>Manage</Button>
        ) : (
          <>
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Button
                tone="secondary" icon="add"
                ariaHasPopup="menu" ariaExpanded={addOpen}
                onClick={() => setAddOpen((v) => !v)}
              >Add widget</Button>
              {addOpen && (
                <AddWidgetPanel
                  catalogue={catalogue}
                  presentIds={presentIds}
                  onAdd={add}
                  onClose={() => setAddOpen(false)}
                />
              )}
            </div>
            {/* "Discard changes" is this dashboard's revert, which is reading (a)
                of the spec's open question 3. Restoring the shipped System
                baseline, and switching to the user's chosen default, are two
                different buttons and are not drawn until that call is made. */}
            <Button
              icon="undo"
              disabled={!dirty}
              onClick={() => { setDraftWidgets(active.widgets.map((w) => ({ ...w }))); setDraftName(active.name); }}
            >Discard changes</Button>
            <Button tone="secondary" onClick={() => setSaveAsOpen(true)}>Save as</Button>
            <Button onClick={exitManage}>Cancel</Button>
            <Button tone="primary" onClick={handleDone}>Done</Button>
          </>
        )}
      </div>

      {/* THE GRID. Dense row flow, so widgets pull up and leftover space
          collects at the bottom rather than between tiles. */}
      <div
        className="pw-dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(var(--pw-dash-cols), minmax(0, 1fr))",
          gridAutoRows: `${L.rowUnit}px`,
          gridAutoFlow: "row dense",
          gap: L.gap,
          alignContent: "start",
        }}
      >
        {widgets.map((w) => {
          const entry = catalogue.find((c) => c.id === w.catalogueId);
          return (
            <div
              key={w.id}
              draggable={manage}
              onDragStart={() => setDragId(w.id)}
              onDragOver={(e) => { if (manage) e.preventDefault(); }}
              onDrop={() => onDrop(w.id)}
              onDragEnd={() => setDragId(null)}
              style={{
                display: "contents",
              }}
            >
              <Widget
                title={w.title}
                size={w.size}
                supportedSizes={entry?.supportedSizes || SIZES}
                state={w.state || "ready"}
                manage={manage}
                dragging={dragId === w.id}
                flash={flashId === w.id}
                updatedLabel={w.updatedLabel}
                onRefresh={w.onRefresh}
                onExport={w.onExport}
                onGoTo={w.onGoTo}
                onInfo={w.onInfo}
                onResize={manage ? (size) => api.resize(w.id, size) : undefined}
                onDuplicate={manage ? () => api.duplicate(w.id) : undefined}
                onRemove={manage ? () => api.remove(w.id) : undefined}
                onRename={undefined}
                // Swap is available WITHOUT manage mode, the way it is in the
                // demo: exchanging one widget for another in the same slot is
                // not a layout edit. It still goes through the draft, so Cancel
                // puts the original widget back.
                swapOptions={swapOptions}
                catalogueId={w.catalogueId}
                onSwap={(option) => { if (!manage) enterManage(); api.swap(w.id, option); }}
                onRetry={w.onRetry}
                emptyLine={w.emptyLine}
                toolbar={w.toolbar}
                topMetric={w.topMetric}
              >
                {renderWidget?.(w, api)}
              </Widget>
            </div>
          );
        })}

        {/* Always an in-grid way to add the next one when the dashboard is
            nearly empty, so a new user is never stuck looking at a blank page. */}
        {manage && widgets.length <= 1 && <AddWidgetTile onClick={() => setAddOpen(true)} />}
      </div>

      {manageOpen && (
        <ManageDashboardsDialog
          dashboards={dashboards}
          activeId={active.id}
          onSwitch={(id) => { setManageOpen(false); exitManage(); onSwitch?.(id); }}
          onSetDefault={onSetDefault}
          onRename={onRenameDashboard}
          onDelete={onDeleteDashboard}
          onClose={() => setManageOpen(false)}
        />
      )}

      {saveAsOpen && (
        <SaveAsDialog
          initialName={active.type === "system" ? `${draftName} (copy)` : draftName}
          onSave={(name) => { setSaveAsOpen(false); commit(name); }}
          onClose={() => setSaveAsOpen(false)}
        />
      )}
    </div>
  );
}

export const DashboardKeyframes = () => (
  <style>{`
@keyframes pwDashMenu { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes pwDashScrim { from { opacity: 0; } to { opacity: 1; } }
@keyframes pwDashDialog { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: none; } }
.pw-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
:root { --pw-dash-cols: 4; --pw-dash-add-cols: 4; }
@media (min-width: 768px)  { :root { --pw-dash-cols: 8; --pw-dash-add-cols: 4; } }
@media (min-width: 1024px) { :root { --pw-dash-cols: 12; --pw-dash-add-cols: 3; } }
@media (prefers-reduced-motion: reduce) {
  .pw-dashboard-page, .pw-dashboard-page * { animation: none !important; }
}
`}</style>
);

export default Dashboard;
