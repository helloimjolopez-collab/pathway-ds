import React, { useEffect, useId, useRef, useState } from "react";
import { Skeleton } from "../skeleton/skeleton.jsx";

/**
 * widget.jsx — the Widget container: the resizable dashboard building block.
 *
 * WHAT IT IS
 * One container, called Widget. It wraps an arbitrary piece of content in a
 * consistent shell: a header carrying the title and the widget's own actions,
 * and a content slot. It owns its size, its lifecycle states and its management
 * actions. It does not own the data, the query or the visualisation.
 *
 * WHAT IT IS NOT
 * Not a KPI tile. A KPI tile is simply Widget at Glance size holding a Metric,
 * so there is no separate component. Not the Dashboard toolbar, which operates
 * on the dashboard rather than on one widget and lives in dashboard.jsx. Not a
 * content component: Metric, Chart, Table and List live inside the slot.
 *
 * WHERE THE DESIGN CAME FROM
 *   Figma  'Widget' component set, Amplify 40009622:39702 and its NewCo mirror
 *          40016737:144022. Three Size variants (Glance, Detail, Explore) plus
 *          a separate Widget.Focus frame 40010500:6815 for Full.
 *   Spec   widget-container-spec.md section 0 (architecture, settled), 0.1
 *          (content header and slot contract, settled), 0.2 (accessibility
 *          gate), 0.4 (the header truncation recipe).
 *   Demo   widget-container.html, which is the interaction source of truth.
 *
 * SIZE IS DEPTH, NOT SCALE. Resizing changes the content and its depth:
 *   Glance   number + mini trend. Flat surface, no content toolbar.
 *   Explore  one view, wide and short. Two internal columns available.
 *   Detail   one view, large square. One internal column, deliberately.
 *   Full     two views side by side. The only size that shows two.
 * Content declares which sizes it supports; the rest are disabled in the picker.
 *
 * FLAT vs LAYERED is driven by the presence of content controls, not by size.
 * Glance has no content toolbar so header and content share one surface. The
 * others get a distinct raised content panel, so widget chrome (title, refresh,
 * resize) reads as separate from content chrome (filter, view toggle, overflow).
 *
 * THE TEXT BAN. There are no explanatory sentences anywhere in here, in any
 * state. The only prose this component renders is control labels, and one line
 * in a genuinely empty state. Scope is shown by the content toolbar's left-hand
 * selector, which doubles as the heading; direction and pacing are shown by a
 * compact badge supplied as content, never by a sentence.
 */

// ─── TOKENS ────────────────────────────────────────────────────────────────────
// Every value is a token. Nothing here is a literal colour or a literal length
// except glyph sizes, which have no token family in Pathway (see NOTES at foot).
const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const MO = (n) => `var(--motion-${n})`;

export const T = {
  // The two-layer card. The outer surface is the header tint; the content panel
  // is lighter, so the panel reads as sitting over the header.
  cardSurface:    SC("fill-static-neutral-base"),
  panelSurface:   SC("fill-static-neutral-faint"),
  flatSurface:    SC("fill-static-neutral-faint"),
  border:         SC("stroke-static-neutral-base"),
  borderManage:   SC("stroke-static-neutral-strong"),
  divider:        SC("stroke-static-neutral-faint"),

  title:          SC("foreground-static-neutral-strong"),
  body:           SC("foreground-static-neutral-base"),
  subtle:         SC("foreground-static-neutral-subtle"),
  faint:          SC("foreground-static-neutral-faint"),

  iconQuiet:      SC("foreground-action-secondary-rest"),
  iconHoverFill:  SC("fill-action-secondary-hover"),
  iconActive:     SC("foreground-static-brand-on-subtle"),
  dragHandle:     SC("foreground-static-neutral-faint"),

  danger:         SC("foreground-static-negative-on-subtle"),
  dangerFill:     SC("fill-static-negative-subtle"),

  menuSurface:    SC("fill-surface-overlay"),
  menuBorder:     SC("stroke-static-neutral-base"),
  menuHover:      SC("fill-static-neutral-subtle"),
  selectedFill:   SC("fill-static-brand-subtle"),
  selectedFg:     SC("foreground-static-brand-on-subtle"),

  focusRing:      SC("stroke-action-primary-strong-rest"),
};

export const L = {
  radius:         SU("cornerradius-large"),
  radiusPanel:    SU("cornerradius-base"),
  radiusSm:       SU("cornerradius-small"),
  radiusFull:     SU("cornerradius-full"),
  border:         SU("borderwidth-base"),
  borderThin:     SU("borderwidth-xthin"),
  borderManage:   SU("borderwidth-medium"),

  // Header icons are 36x36 on desktop per the accessibility gate: it is the hit
  // area that must meet the minimum, not the glyph. Adjacent icons sit flush so
  // 36 targets do not read as airy.
  iconTarget:     SU("accessibility-touch-target-desktop-only-width"),
  iconTargetAA:   SU("accessibility-touch-target-aa-width"),

  headPadV:       SU("padding-xxtight"),
  headPadLeft:    SU("padding-tight"),
  headPadRight:   SU("padding-xxxtight"),
  headGap:        SU("gap-xtight"),
  titleGap:       SU("gap-xxxtight"),

  contentPad:     SU("padding-medium"),
  contentPadTight: SU("padding-xtight"),
  toolbarGap:     SU("gap-tight"),
  rowGap:         SU("gap-xxtight"),
  colGap:         SU("gap-medium"),
  metricGap:      SU("gap-xxxtight"),

  menuPadV:       SU("padding-xxxtight"),
  menuItemPadV:   SU("padding-xxtight"),
  menuItemPadH:   SU("padding-tight"),
  menuGap:        SU("gap-tight"),

  // Glyph sizes. Pathway has no icon-size token family, so these stay numbers,
  // on the 2/4/6/8/12/16/20/24 scale the rest of the repo uses.
  glyph:          16,
  glyphSm:        14,
  glyphLg:        20,
  glyphState:     28,
};

const TYPE = {
  title: {
    fontFamily: ST("family-brand"),
    fontWeight: ST("weight-semibold"),
    fontSize:   ST("font-size-s"),
    lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  caption: {
    fontFamily: ST("family-brand"),
    fontWeight: ST("weight-regular"),
    fontSize:   ST("font-size-xs"),
    lineHeight: ST("line-height-xs-single"),
    letterSpacing: ST("letter-spacing-extraspacious"),
  },
  eyebrow: {
    fontFamily: ST("family-brand"),
    fontWeight: ST("weight-semibold"),
    fontSize:   ST("font-size-xs"),
    lineHeight: ST("line-height-xs-single"),
    letterSpacing: ST("letter-spacing-extraspacious"),
    textTransform: "uppercase",
  },
  body: {
    fontFamily: ST("family-brand"),
    fontWeight: ST("weight-regular"),
    fontSize:   ST("font-size-s"),
    lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  bodyMedium: {
    fontFamily: ST("family-brand"),
    fontWeight: ST("weight-medium"),
    fontSize:   ST("font-size-s"),
    lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  metric: {
    fontFamily: ST("family-brand"),
    fontWeight: ST("weight-semibold"),
    fontSize:   ST("font-size-xxl"),
    lineHeight: ST("line-height-xxl-single"),
    letterSpacing: ST("letter-spacing-spacious"),
  },
};

// ─── SIZES ─────────────────────────────────────────────────────────────────────
/**
 * Size is depth. The grid spans and row counts come from the canonical demo's
 * dashboard grid: 4 / 8 / 12 columns by breakpoint, 48px auto-rows, dense flow.
 * A widget never grows to fit its content; depth is chosen by size.
 */
export const SIZES = ["glance", "explore", "detail", "full"];

export const SIZE_LABEL = {
  glance:  "Glance",
  explore: "Explore",
  detail:  "Detail",
  full:    "Full",
};

export const SIZE_GRID = {
  //            mobile(4)  tablet(8)  desktop(12)   rows of 48px
  glance:  { cols: [4, 4, 3],  rows: 3 },
  explore: { cols: [4, 8, 6],  rows: 5 },
  detail:  { cols: [4, 8, 6],  rows: 9 },
  full:    { cols: [4, 8, 12], rows: 9 },
};

/** Glance is flat. Everything else layers, because everything else can carry a
 *  content toolbar and the two chromes must not read as one. */
export const isFlat = (size) => size === "glance";

/** Internal content columns per size. Detail is deliberately one column even
 *  though it has the width for two: more depth means a taller single view. */
export const CONTENT_COLS = { glance: 0, explore: 2, detail: 1, full: 2 };

// ─── PRIMITIVES ────────────────────────────────────────────────────────────────
function Glyph({ name, size = L.glyph, color, style }) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden="true"
      style={{
        fontSize: size, lineHeight: 1, display: "block", userSelect: "none",
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
        color, ...style,
      }}
    >
      {name}
    </span>
  );
}

/**
 * A header action. The hit area is the token-sized target; the glyph is sized
 * independently and centred in it. Adjacent actions sit flush.
 */
function ActionIcon({
  name, label, onClick, glyph = L.glyph, target = L.iconTarget,
  active = false, danger = false, reveal = false, revealed = false,
  ariaExpanded, ariaHasPopup, buttonRef,
}) {
  const [hov, setHov] = useState(false);
  const fg = danger ? T.danger : active ? T.iconActive : hov ? T.body : T.iconQuiet;
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: target, height: target, flex: "0 0 auto", padding: 0,
        background: hov ? T.iconHoverFill : "transparent",
        border: "none", borderRadius: L.radiusSm, cursor: "pointer",
        color: fg,
        // Hover-reveal is allowed; hover-only is not. The container reveals on
        // :focus-within too (see Header), and touch devices get it permanently.
        opacity: reveal && !revealed ? 0 : 1,
        pointerEvents: reveal && !revealed ? "none" : "auto",
        transition: `background ${MO("duration-2")} ${MO("easing-standard")}, color ${MO("duration-2")} ${MO("easing-standard")}, opacity ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      <Glyph name={name} size={glyph} color={fg} />
    </button>
  );
}

// ─── HEADER ────────────────────────────────────────────────────────────────────
/**
 * One row, always present: title left, refresh + resize right.
 *
 * Truncation follows the Figma recipe in spec 0.4. The max-width has to sit on
 * BOTH the label and its row-start wrapper; one alone does not work, and the
 * wrapper's max must be at least the label's or the wrapper caps the title
 * before the label's own max can apply. The maxima scale with the size, so a
 * wide widget actually uses the room it has.
 */
const TITLE_MAX = { glance: 150, explore: 300, detail: 300, full: 560 };

function Header({
  title, size, manage, updatedLabel,
  onRefresh, onResize, onInfo, onGoTo, onRename,
  refreshing, resizeOpen, resizeRef,
}) {
  const [hov, setHov] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const touch = useTouch();
  const revealed = hov || focusWithin || touch;

  useEffect(() => { setDraft(title); }, [title]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== title) onRename?.(next);
    else setDraft(title);
  };

  const max = TITLE_MAX[size] ?? TITLE_MAX.detail;

  // The hover-revealed info and go-to icons hold their 36px targets in the
  // layout even at opacity 0, so at Glance they ate ~72px of a ~130px title and
  // "Given this month" truncated to "Given ...". Collapsing their width on
  // hover instead would reflow the title under the cursor, which is worse.
  // Glance is Metric-only by the capacity table and has the smallest title max,
  // so it does without them; the go-to still lives in the overflow menu.
  const leadingIcons = size !== "glance" && (onInfo || onGoTo);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false); }}
      style={{
        display: "flex", alignItems: "center", gap: L.headGap,
        padding: `${L.headPadV} ${L.headPadRight} ${L.headPadV} ${L.headPadLeft}`,
        flex: "0 0 auto",
      }}
    >
      {manage && (
        <span
          aria-hidden="true"
          style={{ display: "inline-flex", alignItems: "center", color: T.dragHandle, cursor: "grab" }}
        >
          <Glyph name="drag_indicator" size={L.glyph} color={T.dragHandle} />
        </span>
      )}

      {/* RowStart: heading + the hover-revealed leading icons. Carries its own
          max-width, per the Figma recipe. */}
      <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: "0 1 auto", maxWidth: max + 56 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: L.titleGap, minWidth: 0, flex: "0 1 auto" }}>
          {editing ? (
            <input
              autoFocus
              value={draft}
              aria-label="Widget title"
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") { setDraft(title); setEditing(false); }
              }}
              style={{
                ...TYPE.title, color: T.title, width: "100%", minWidth: 0,
                background: T.panelSurface,
                border: `${L.border} solid ${T.focusRing}`,
                borderRadius: L.radiusSm,
                padding: `0 ${L.headPadRight}`, outline: "none",
              }}
            />
          ) : (
            <span
              // Rename is manage-mode only. In view mode the title is a plain
              // label, not a link: no hover underline, no pointer.
              onClick={manage ? () => setEditing(true) : undefined}
              title={title}
              style={{
                ...TYPE.title, color: T.title,
                maxWidth: max, minWidth: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                cursor: manage ? "text" : "default",
                borderRadius: L.radiusSm,
              }}
            >
              {title}
            </span>
          )}
          {updatedLabel && (
            <span style={{ ...TYPE.caption, color: T.faint, whiteSpace: "nowrap" }}>
              {updatedLabel}
            </span>
          )}
        </div>

        {leadingIcons && (
          <span style={{ display: "inline-flex", alignItems: "center", flex: "0 0 auto" }}>
            {onInfo && (
              <ActionIcon name="info" label="About this widget" onClick={onInfo}
                glyph={L.glyphSm} target={L.iconTarget} reveal revealed={revealed} />
            )}
            {onGoTo && (
              <ActionIcon name="open_in_new" label="Open the full view" onClick={onGoTo}
                glyph={L.glyphSm} target={L.iconTarget} reveal revealed={revealed} />
            )}
          </span>
        )}
      </div>

      <span style={{ flex: 1, minWidth: L.headGap }} />

      {/* RowEnd: pinned right, flush. */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
        {onRefresh && (
          <ActionIcon
            name="refresh" label="Refresh" onClick={onRefresh}
            glyph={L.glyphSm} reveal revealed={revealed || refreshing}
          />
        )}
        {onResize && (
          <ActionIcon
            name="aspect_ratio" label="Resize" onClick={onResize}
            glyph={L.glyph} active={resizeOpen} buttonRef={resizeRef}
            ariaHasPopup="menu" ariaExpanded={resizeOpen}
          />
        )}
      </div>
    </div>
  );
}

/** Touch devices get hover-revealed controls permanently, per the a11y gate. */
function useTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    setTouch(mq.matches);
    const h = (e) => setTouch(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return touch;
}

// ─── SIZE PICKER ───────────────────────────────────────────────────────────────
/**
 * Proportional glyphs, not words alone: the shape tells you what you get. Sizes
 * the content does not support are disabled rather than reflowed.
 */
export function SizePicker({ value, supported = SIZES, onPick, onClose }) {
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

  const SHAPE = {
    glance:  { w: 18, h: 10 },
    explore: { w: 26, h: 12 },
    detail:  { w: 18, h: 20 },
    full:    { w: 30, h: 20 },
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Widget size"
      style={{
        position: "absolute", top: "100%", right: 0, zIndex: 40,
        minWidth: 168,
        background: T.menuSurface,
        border: `${L.border} solid ${T.menuBorder}`,
        borderRadius: L.radiusPanel,
        boxShadow: "var(--elevation-lift)",
        padding: `${L.menuPadV} 0`,
        animation: `pwWidgetMenu ${MO("duration-3")} ${MO("easing-decelerate")} both`,
      }}
    >
      {SIZES.map((s) => {
        const ok = supported.includes(s);
        const on = s === value;
        return (
          <MenuRow
            key={s}
            role="menuitemradio"
            checked={on}
            disabled={!ok}
            onClick={() => { if (ok) { onPick?.(s); onClose?.(); } }}
            leading={
              <span style={{ display: "flex", width: 30, height: 20, alignItems: "center", justifyContent: "center" }}>
                <span style={{
                  width: SHAPE[s].w, height: SHAPE[s].h,
                  borderRadius: L.radiusSm,
                  background: on ? T.selectedFg : "transparent",
                  border: `${L.border} solid ${on ? T.selectedFg : T.border}`,
                }} />
              </span>
            }
            label={SIZE_LABEL[s]}
            trailing={on ? <Glyph name="check" size={L.glyphSm} color={T.selectedFg} /> : null}
          />
        );
      })}
    </div>
  );
}

function MenuRow({ label, leading, trailing, onClick, danger, disabled, role = "menuitem", checked }) {
  const [hov, setHov] = useState(false);
  const fg = disabled ? T.faint : danger ? T.danger : checked ? T.selectedFg : T.body;
  return (
    <button
      type="button"
      role={role}
      aria-checked={role === "menuitemradio" ? checked : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: L.menuGap, width: "100%",
        padding: `${L.menuItemPadV} ${L.menuItemPadH}`,
        background: hov && !disabled ? (danger ? T.dangerFill : T.menuHover) : "transparent",
        border: "none", cursor: disabled ? "default" : "pointer",
        textAlign: "left", color: fg, ...TYPE.bodyMedium,
        transition: `background ${MO("duration-2")} ${MO("easing-standard")}, color ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      {leading}
      <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
      {trailing}
    </button>
  );
}

// ─── OVERFLOW MENU ─────────────────────────────────────────────────────────────
/**
 * Mode aware. View mode carries view actions; manage mode carries the layout
 * actions. The per-content overflow belongs in the content toolbar, not here.
 */
export function WidgetMenu({ manage, onRefresh, onExport, onGoTo, onResize, onDuplicate, onRemove, onClose }) {
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

  const rows = manage
    ? [
        onResize    && { key: "resize",    icon: "aspect_ratio",  label: "Resize",    onClick: onResize },
        onDuplicate && { key: "duplicate", icon: "content_copy",  label: "Duplicate", onClick: onDuplicate },
        onRemove    && { key: "remove",    icon: "delete",        label: "Remove",    onClick: onRemove, danger: true, sep: true },
      ]
    : [
        onRefresh && { key: "refresh", icon: "refresh",      label: "Refresh now",  onClick: onRefresh },
        onExport  && { key: "export",  icon: "download",     label: "Export",       onClick: onExport },
        onGoTo    && { key: "goto",    icon: "open_in_new",  label: "View full",    onClick: onGoTo },
      ];

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "absolute", top: "100%", right: 0, zIndex: 40, minWidth: 180,
        background: T.menuSurface,
        border: `${L.border} solid ${T.menuBorder}`,
        borderRadius: L.radiusPanel,
        boxShadow: "var(--elevation-lift)",
        padding: `${L.menuPadV} 0`,
        animation: `pwWidgetMenu ${MO("duration-3")} ${MO("easing-decelerate")} both`,
      }}
    >
      {rows.filter(Boolean).map((r) => (
        <React.Fragment key={r.key}>
          {r.sep && <span role="separator" style={{ display: "block", height: L.border, background: T.divider, margin: `${L.menuPadV} 0` }} />}
          <MenuRow
            label={r.label}
            danger={r.danger}
            onClick={() => { r.onClick?.(); onClose?.(); }}
            leading={<Glyph name={r.icon} size={L.glyph} color={r.danger ? T.danger : T.iconQuiet} />}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── CONTENT TOOLBAR ───────────────────────────────────────────────────────────
/**
 * Exactly one line, ever. Left is identity: whatever answers "what am I looking
 * at" goes there and acts as the heading. Right is actions. If the controls do
 * not fit they move into the overflow; they never wrap to a second line.
 */
export function WidgetToolbar({ identity, actions, overflow }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: L.toolbarGap,
        padding: `${L.contentPadTight} ${L.contentPadTight} 0`,
        flex: "0 0 auto", minWidth: 0,
        // The hard rule made structural: one line, no wrapping, and the
        // identity side is what gives when space runs short.
        flexWrap: "nowrap", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: L.rowGap, minWidth: 0, flex: "0 1 auto", overflow: "hidden" }}>
        {identity}
      </div>
      <span style={{ flex: 1, minWidth: 0 }} />
      <div style={{ display: "flex", alignItems: "center", gap: L.rowGap, flex: "0 0 auto" }}>
        {actions}
        {overflow}
      </div>
    </div>
  );
}

/**
 * The top-metric strip. Two lines at most, and only when the content has no
 * natural total of its own or the headline is a cross-period comparison. A
 * table with a total row, or a donut with a centre total, gets none.
 * Never rendered at Glance, where the Metric IS the content.
 */
export function WidgetTopMetric({ eyebrow, value, signal }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: L.metricGap,
      padding: `${L.contentPadTight} ${L.contentPad} 0`, flex: "0 0 auto",
    }}>
      {eyebrow && <span style={{ ...TYPE.eyebrow, color: T.faint }}>{eyebrow}</span>}
      <div style={{ display: "flex", alignItems: "baseline", gap: L.rowGap, minWidth: 0 }}>
        <span style={{ ...TYPE.bodyMedium, color: T.title, fontSize: "var(--semantic-type-font-size-l)" }}>{value}</span>
        {signal}
      </div>
    </div>
  );
}

// ─── METRIC (content, not container) ───────────────────────────────────────────
/**
 * The number, its one directional signal, and an optional mini trend. This is
 * content, and Widget at Glance holding one is what a KPI tile is.
 *
 * The signal stays on the face as a compact graphic. It is not deferred to
 * hover and it is not spelled out in a sentence: whether the thing is up or
 * down and by how much is exactly what the glance is for.
 */
export function Metric({ value, delta, deltaDirection = "up", deltaNote, alarm, spark }) {
  const dir = deltaDirection === "down" ? "down" : "up";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: L.colGap,
      padding: `0 ${L.contentPad} ${L.contentPadTight}`, flex: 1, minWidth: 0,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: L.metricGap, minWidth: 0, flex: 1 }}>
        <span style={{ ...TYPE.metric, color: T.title, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </span>
        {(delta || alarm) && (
          <div style={{ display: "flex", alignItems: "center", gap: L.rowGap, minWidth: 0 }}>
            {delta && <DeltaPill direction={dir} label={delta} note={deltaNote} />}
            {alarm}
          </div>
        )}
      </div>
      {spark && <div style={{ flex: "0 0 auto" }}>{spark}</div>}
    </div>
  );
}

/** Direction and size as one compact graphic. Shape plus sign plus colour, so
 *  it never relies on colour alone. */
export function DeltaPill({ direction = "up", label, note }) {
  const up = direction !== "down";
  const fg = up ? SC("foreground-static-positive-on-subtle") : SC("foreground-static-negative-on-subtle");
  const bg = up ? SC("fill-static-positive-subtle") : SC("fill-static-negative-subtle");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: L.rowGap, minWidth: 0 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 2,
        padding: `0 ${L.headPadRight}`,
        background: bg, color: fg,
        borderRadius: L.radiusFull, ...TYPE.caption,
        fontWeight: ST("weight-medium"),
      }}>
        <Glyph name={up ? "arrow_upward" : "arrow_downward"} size={12} color={fg} />
        {label}
      </span>
      {note && (
        <span style={{ ...TYPE.caption, color: T.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {note}
        </span>
      )}
    </span>
  );
}

// ─── STATES ────────────────────────────────────────────────────────────────────
/**
 * Loading replaces the content with a skeleton and leaves the header live.
 * Empty and Error are mutually exclusive end states; Error always offers Retry
 * and Empty never does. The single line of copy in a whole-empty state is the
 * one place prose is allowed in this component.
 */
function LoadingState({ size }) {
  const lines = size === "glance" ? 2 : size === "explore" ? 4 : 6;
  return (
    <div
      aria-busy="true"
      style={{
        display: "flex", flexDirection: "column", gap: L.rowGap,
        padding: L.contentPad, flex: 1, minWidth: 0, justifyContent: "center",
      }}
    >
      {size !== "glance" && <Skeleton width="42%" height={10} />}
      <Skeleton width="68%" height={size === "glance" ? 26 : 18} />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <Skeleton key={i} width={`${92 - i * 11}%`} height={10} />
      ))}
    </div>
  );
}

function EndState({ size, icon, title, line, action }) {
  const compact = size === "glance";
  return (
    <div
      role="status"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: compact ? L.metricGap : L.rowGap,
        padding: compact ? L.contentPadTight : L.contentPad,
        flex: 1, minWidth: 0, textAlign: "center",
      }}
    >
      <Glyph name={icon} size={compact ? L.glyphLg : L.glyphState} color={T.faint} />
      <span style={{ ...TYPE.bodyMedium, color: T.body, fontSize: compact ? ST("font-size-xs") : undefined }}>
        {title}
      </span>
      {/* Suppressed at Glance: the tile is three rows tall and a second line clips. */}
      {line && !compact && (
        <span style={{ ...TYPE.caption, color: T.faint, maxWidth: 280 }}>{line}</span>
      )}
      {action}
    </div>
  );
}

// ─── THE WIDGET ────────────────────────────────────────────────────────────────
/**
 * @param {string}   title            the widget's name
 * @param {string}   size             one of SIZES
 * @param {string[]} supportedSizes   which sizes this content can render; the
 *                                    rest are disabled in the picker
 * @param {string}   state            ready | loading | empty | error
 * @param {boolean}  manage           dashboard-global manage mode
 * @param {string}   updatedLabel     freshness, e.g. "Updated just now". Shown
 *                                    under the title, muted. Optional.
 * @param {node}     toolbar          a WidgetToolbar. Never at Glance.
 * @param {node}     topMetric        a WidgetTopMetric. Never at Glance.
 * @param {node}     children         the content slot
 * @param {node}     emptyAction      optional recovery control in the empty state
 */
export function Widget({
  title,
  size = "detail",
  supportedSizes = SIZES,
  state = "ready",
  manage = false,
  dragging = false,
  flash = false,
  updatedLabel,
  emptyTitle = "No data yet",
  emptyLine,
  emptyAction,
  errorTitle = "Could not load",
  onRetry,
  onRefresh,
  onExport,
  onResize,
  onDuplicate,
  onRemove,
  onRename,
  onInfo,
  onGoTo,
  toolbar,
  topMetric,
  children,
  style,
  className = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hov, setHov] = useState(false);
  const resizeRef = useRef(null);
  const flat = isFlat(size);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh?.();
    // The spin is a token duration, so it stays in step with the rest of the
    // system if the motion scale moves.
    window.setTimeout(() => setRefreshing(false), 1000);
  };

  const grid = SIZE_GRID[size] ?? SIZE_GRID.detail;

  const body = (() => {
    if (state === "loading") return <LoadingState size={size} />;
    if (state === "error")
      return (
        <EndState
          size={size} icon="error" title={errorTitle}
          action={onRetry ? <RetryButton onClick={onRetry} /> : null}
        />
      );
    if (state === "empty")
      return <EndState size={size} icon="inbox" title={emptyTitle} line={emptyLine} action={emptyAction} />;
    return (
      <>
        {!flat && toolbar}
        {!flat && topMetric}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </div>
      </>
    );
  })();

  return (
    <section
      className={`pw-widget ${className}`}
      data-size={size}
      data-state={state}
      data-manage={manage || undefined}
      data-dragging={dragging || undefined}
      aria-label={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column", minWidth: 0, overflow: "visible",
        // Falls back to one track when the Widget is NOT inside a dashboard
        // grid. The span properties are declared on .pw-dashboard-grid, not on
        // :root, so a Widget dropped into a page section or any other grid asks
        // for one track instead of three and tiles with its siblings.
        gridColumn: `span var(--pw-widget-cols-${size}, 1)`,
        gridRow: `span ${grid.rows}`,
        background: flat ? T.flatSurface : T.cardSurface,
        border: `${manage ? L.borderManage : L.border} ${manage ? "dashed" : "solid"} ${manage ? T.borderManage : T.border}`,
        borderRadius: L.radius,
        boxShadow: hov && !manage ? "var(--elevation-lift)" : "var(--elevation-widget)",
        opacity: dragging ? 0.5 : 1,
        cursor: manage ? "grab" : "default",
        animation: flash ? `pwWidgetFlash ${MO("duration-5")} ${MO("easing-standard")}` : undefined,
        transition: `box-shadow ${MO("duration-2")} ${MO("easing-standard")}, border-color ${MO("duration-2")} ${MO("easing-standard")}, opacity ${MO("duration-2")} ${MO("easing-standard")}, background ${MO("duration-2")} ${MO("easing-standard")}`,
        ...style,
      }}
    >
      <div style={{ position: "relative" }}>
        <Header
          title={title}
          size={size}
          manage={manage}
          updatedLabel={updatedLabel}
          refreshing={refreshing}
          onRefresh={onRefresh ? handleRefresh : undefined}
          onResize={(onResize || onDuplicate || onRemove || onExport || onGoTo)
            ? () => { setMenuOpen((v) => !v); setPickerOpen(false); }
            : undefined}
          resizeOpen={menuOpen || pickerOpen}
          resizeRef={resizeRef}
          onInfo={onInfo}
          onGoTo={onGoTo}
          onRename={manage ? onRename : undefined}
        />
        {menuOpen && (
          <WidgetMenu
            manage={manage}
            onRefresh={onRefresh ? handleRefresh : undefined}
            onExport={onExport}
            onGoTo={onGoTo}
            onResize={onResize ? () => { setPickerOpen(true); } : undefined}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
            onClose={() => setMenuOpen(false)}
          />
        )}
        {pickerOpen && (
          <SizePicker
            value={size}
            supported={supportedSizes}
            onPick={onResize}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>

      {/* The content panel. Flat at Glance: header and content share one
          surface because there is no content toolbar to separate from. */}
      <div
        style={{
          flex: 1, minHeight: 0, display: "flex", flexDirection: "column", minWidth: 0,
          background: flat ? "transparent" : T.panelSurface,
          borderRadius: flat ? 0 : `${L.radiusPanel} ${L.radiusPanel} 0 0`,
          boxShadow: flat ? "none" : "var(--elevation-widget)",
          overflow: "hidden",
          paddingBottom: flat ? 0 : L.contentPadTight,
        }}
      >
        {body}
      </div>
    </section>
  );
}

function RetryButton({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...TYPE.bodyMedium,
        display: "inline-flex", alignItems: "center", gap: L.rowGap,
        padding: `${L.headPadRight} ${L.menuItemPadH}`,
        minHeight: L.iconTarget,
        background: hov ? T.menuHover : "transparent",
        color: T.body,
        border: `${L.border} solid ${T.border}`,
        borderRadius: L.radiusPanel, cursor: "pointer",
        transition: `background ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      Retry
    </button>
  );
}

// ─── KEYFRAMES + GRID CUSTOM PROPERTIES ────────────────────────────────────────
/**
 * The column spans are custom properties so the breakpoint lives in a media
 * query rather than in a JS branch, the way TopNav's responsive chrome does.
 * 4 / 8 / 12 columns at mobile / tablet / desktop, from the canonical demo.
 */
export const WidgetKeyframes = () => (
  <style>{`
@keyframes pwWidgetMenu { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes pwWidgetFlash {
  0%   { box-shadow: 0 0 0 0 ${T.focusRing}; }
  40%  { box-shadow: 0 0 0 3px ${T.focusRing}; }
  100% { box-shadow: var(--elevation-widget); }
}
.pw-dashboard-grid {
  --pw-widget-cols-glance: ${SIZE_GRID.glance.cols[0]};
  --pw-widget-cols-explore: ${SIZE_GRID.explore.cols[0]};
  --pw-widget-cols-detail: ${SIZE_GRID.detail.cols[0]};
  --pw-widget-cols-full: ${SIZE_GRID.full.cols[0]};
}
@media (min-width: 768px) {
  .pw-dashboard-grid {
    --pw-widget-cols-glance: ${SIZE_GRID.glance.cols[1]};
    --pw-widget-cols-explore: ${SIZE_GRID.explore.cols[1]};
    --pw-widget-cols-detail: ${SIZE_GRID.detail.cols[1]};
    --pw-widget-cols-full: ${SIZE_GRID.full.cols[1]};
  }
}
@media (min-width: 1024px) {
  .pw-dashboard-grid {
    --pw-widget-cols-glance: ${SIZE_GRID.glance.cols[2]};
    --pw-widget-cols-explore: ${SIZE_GRID.explore.cols[2]};
    --pw-widget-cols-detail: ${SIZE_GRID.detail.cols[2]};
    --pw-widget-cols-full: ${SIZE_GRID.full.cols[2]};
  }
}
@media (prefers-reduced-motion: reduce) {
  .pw-widget, .pw-widget * { animation: none !important; }
}
`}</style>
);

export default Widget;

/* NOTES
 *
 * Glyph sizes are the only numbers left in this file. Pathway has no icon-size
 * token family: every component in the repo passes a number, and inventing a
 * name here would put a token in code that does not exist in the panel. They
 * sit on the scale the rest of the repo uses.
 *
 * The 48px row unit and 16px gap of the dashboard grid live in dashboard.jsx,
 * not here, because they belong to the container rather than the tile.
 */
