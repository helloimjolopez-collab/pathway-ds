/**
 * Dashboard: the board, its toolbar, and the add-widget flow.
 *
 * SOURCE OF TRUTH for the GRID is Figma: the Pathway Grid on the Widget page's
 * ScreenTemplates (40010514:6808 at 1440, 40010482:8492 at 1920), 12 columns,
 * gutter 16, inside the SheetContainer and Sheet padding. The spans and
 * breakpoints live in SIZE_GRID in widget.jsx, with the measurements.
 *
 * SOURCE OF TRUTH for BEHAVIOUR is the canonical demo, read on 2026-10-07 by
 * driving it rather than looking at it:
 * https://helloimjolopez-collab.github.io/design-sandbox/phase-2/Widget%20Container%20Demo/
 *
 * GRID
 *   page inset     SheetContainer/Padding + Sheet/Padding: 24 + 32 = 56 each
 *                  side and 16 + 16 = 32 on top at desktop, responsive below
 *   columns        4, 8 from a 720 grid, 12 from a 1050 grid, read off the
 *                  grid's own width by a container query, not the viewport
 *   8px auto-rows, 16px gap: a span of n rows is 24n - 16, which draws
 *                  Figma's 176 and 416 exactly
 *   grid-auto-flow: ROW, not row dense
 *
 * `dense` is the tempting choice and it is wrong. It backfills holes by pulling
 * later widgets up into them, so a board silently reorders itself and a widget
 * the reader placed third can end up first. The demo keeps authored order.
 *
 * MEASURED TOOLBAR, all of it available WITHOUT entering manage mode
 *   dashboard selector  name, inline rename, switcher
 *   Find a widget       filters the widgets ALREADY on the board, with a clear
 *   Add widget          opens the modal below
 *   Refresh all         fans out to every widget
 *
 * MEASURED ADD-WIDGET MODAL  (data-action add-widget)
 *   dialog         900x660, role=dialog, aria-modal, aria-label "Add widget"
 *   header         dashboard_customize glyph + title + close
 *   body           category rail 186 wide | gallery 714 wide, 557 tall
 *   categories     All widgets, Added (n) hidden at 0, separator, then
 *                  Overview, Cash & banking, Payroll, Receivables & payables,
 *                  Giving, Assets & loans, Purchasing, Tasks
 *   view toggle    grid_view / view_list
 *   card           app badge + name, a description, an Add button,
 *                  role=button, tabindex 0, and searchable text
 *
 * THE FINDER AND THE GALLERY SEARCH ARE DIFFERENT QUESTIONS. "Where is my cash
 * widget" is the toolbar finder, filtering what is on the board. "What widgets
 * exist" is the modal. They were one control once and it was the wrong one.
 */
import React, { useState, useMemo, useRef, useEffect, useId } from "react";
import { Widget, WidgetKeyframes, SIZES, SIZE_LABEL, SIZE_GRID, GRID_TEMPLATE } from "../widget/widget.jsx";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const R = (n) => `var(--responsive-layout-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;
const M = (n) => `var(--motion-${n})`;

export const T = {
  // The PAGE, not a card. The two were the same token once and nothing on the
  // board read as a card because of it.
  canvas:       C("fill-surface-canvas"),
  surface:      C("fill-surface-overlay"),
  elevated:     C("fill-surface-elevated"),
  border:       C("stroke-static-neutral-base"),
  divider:      C("stroke-static-neutral-faint"),
  title:        C("foreground-static-neutral-bold"),
  body:         C("foreground-static-neutral-base"),
  subtle:       C("foreground-static-neutral-subtle"),
  hoverFill:    C("fill-action-secondary-hover"),
  selectedFill: C("fill-action-primary-subtle-rest"),
  selectedFg:   C("foreground-action-primary-on-subtle-rest"),
  primaryFill:  C("fill-action-primary-strong-rest"),
  primaryHover: C("fill-action-primary-strong-hover"),
  primaryFg:    C("foreground-action-primary-on-strong"),
  badgeFill:    C("fill-static-brand-subtle"),
  badgeFg:      C("foreground-static-brand-on-subtle"),
  scrim:        C("scrim-base"),
  focusRing:    C("stroke-action-primary-strong-rest"),
};

export const L = {
  rowUnit:      8,
  gap:          U("gap-base"),        // 16
  pagePadH:     U("padding-relaxed"),
  // The page inset is the ScreenTemplate's padding plus the Sheet's, so the
  // board's content box IS Figma's Pathway Grid. Responsive tokens, so it
  // steps down with the breakpoints the way Figma's does.
  insetTop:     `calc(${R("sheetcontainer-padding-top")} + ${R("sheet-padding-top")})`,
  insetH:       `calc(${R("sheetcontainer-padding-horizontal")} + ${R("sheet-padding-horizontal")})`,
  insetBottom:  R("sheet-padding-bottom"),
  toolbarGap:   U("gap-tight"),
  toolbarMinH:  44,
  radius:       U("cornerradius-base"),
  radiusLg:     U("cornerradius-large"),
  border:       U("borderwidth-base"),
  btnPadV:      U("padding-xxtight"),
  btnPadH:      U("padding-tight"),
  // Add-widget modal, measured.
  modalW:       900,
  modalH:       660,
  catRailW:     186,
  modalPad:     U("padding-base"),
  cardGap:      U("gap-tight"),
  // The widget finder.
  finderW:      220,
  finderIcon:   18,
  finderInset:  U("padding-xxtight"),
  finderPadL:   U("padding-wide"),
};

const Glyph = ({ name, size = 20, color }) => (
  <span className="material-symbols-rounded" aria-hidden="true" style={{
    fontSize: size, lineHeight: 1, display: "block", color,
    fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
  }}>{name}</span>
);

export function Button({ children, tone = "naked", icon, onClick, disabled,
  ariaExpanded, ariaHasPopup, style }) {
  const [hov, setHov] = useState(false);
  const primary = tone === "primary";
  const outlined = tone === "secondary";
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      aria-expanded={ariaExpanded} aria-haspopup={ariaHasPopup}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: U("gap-xtight"),
        minHeight: L.toolbarMinH, padding: `${L.btnPadV} ${L.btnPadH}`,
        borderRadius: L.radius, cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1, fontFamily: "inherit", whiteSpace: "nowrap",
        fontSize: Y("font-size-s"), letterSpacing: Y("letter-spacing-spacious"),
        background: primary ? (hov ? T.primaryHover : T.primaryFill)
                  : (hov ? T.hoverFill : "transparent"),
        color: primary ? T.primaryFg : T.body,
        border: outlined || primary ? `${L.border} solid ${primary ? "transparent" : T.border}` : `${L.border} solid transparent`,
        transition: `background ${M("duration-2")} ${M("easing-standard")}, color ${M("duration-2")} ${M("easing-standard")}`,
        ...style,
      }}>
      {icon && <Glyph name={icon} size={18} />}
      {children}
    </button>
  );
}

// ─── toolbar pieces ───────────────────────────────────────────────────────────
/**
 * Filters the widgets already on the board. NOT the catalogue search, which is
 * AddWidgetModal below. The clear button is always present once there is a
 * query, because the field is a filter: a board showing three of its eleven
 * widgets needs a visible way back whether or not the box has focus.
 */
export function WidgetFinder({ value, onChange }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span style={{ position: "absolute", left: L.finderInset, pointerEvents: "none", color: T.subtle }}>
        <Glyph name="search" size={L.finderIcon} />
      </span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Find a widget" aria-label="Find a widget"
        style={{
          minHeight: L.toolbarMinH, width: L.finderW, boxSizing: "border-box",
          paddingLeft: L.finderPadL, paddingRight: L.finderPadL,
          background: T.canvas, color: T.title,
          border: `${L.border} solid ${T.border}`, borderRadius: L.radius,
          fontFamily: "inherit", fontSize: Y("font-size-s"),
          letterSpacing: Y("letter-spacing-spacious"), appearance: "none",
        }} />
      {value && (
        <button type="button" aria-label="Clear widget search" onClick={() => onChange("")}
          style={{ position: "absolute", right: L.finderInset, background: "transparent",
            border: "none", padding: 0, cursor: "pointer", color: T.subtle, display: "flex" }}>
          <Glyph name="close" size={L.finderIcon} />
        </button>
      )}
    </div>
  );
}

/** Name plus switcher. Clicking the name renames; the chevron switches. */
export function DashboardSelector({ dashboard, dashboards, editing, onRename, onSwitch }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(dashboard.name);
  const [renaming, setRenaming] = useState(false);
  useEffect(() => { setDraft(dashboard.name); }, [dashboard.name]);
  const commit = () => { setRenaming(false); const v = draft.trim(); if (v && v !== dashboard.name) onRename?.(v); };
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: U("gap-xtight") }}>
      {renaming ? (
        <input autoFocus value={draft} aria-label="Dashboard name"
          onChange={(e) => setDraft(e.target.value)} onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(dashboard.name); setRenaming(false); } }}
          style={{ fontFamily: "inherit", fontSize: Y("font-size-xl"), fontWeight: Y("weight-bold"),
            color: T.title, background: T.canvas, border: `${L.border} solid ${T.focusRing}`,
            borderRadius: L.radius, padding: `0 ${U("padding-xxtight")}` }} />
      ) : (
        <button type="button" onClick={() => editing && setRenaming(true)}
          title={editing ? "Rename this dashboard" : dashboard.name}
          style={{ background: "transparent", border: "none", padding: 0, color: T.title,
            cursor: editing ? "text" : "default", fontFamily: "inherit",
            fontSize: Y("font-size-xl"), fontWeight: Y("weight-bold"),
            letterSpacing: Y("letter-spacing-spacious") }}>
          {dashboard.name}
        </button>
      )}
      {dashboard.type === "system" && (
        <span style={{ padding: `0 ${U("padding-xxtight")}`, borderRadius: L.radius,
          background: T.hoverFill, color: T.subtle, fontSize: Y("font-size-xxs") }}>System</span>
      )}
      <button type="button" aria-haspopup="listbox" aria-expanded={open}
        aria-label="Switch dashboard" onClick={() => setOpen(v => !v)}
        style={{ background: "transparent", border: "none", cursor: "pointer",
          color: T.body, display: "flex", padding: U("padding-xxxxtight") }}>
        <Glyph name="expand_more" size={18} />
      </button>
      {open && (
        <div role="listbox" aria-label="Dashboards" style={{
          position: "absolute", top: "100%", left: 0, zIndex: 40, minWidth: 240,
          marginTop: U("gap-xxtight"), background: T.elevated,
          border: `${L.border} solid ${T.border}`, borderRadius: L.radius,
          boxShadow: "var(--elevation-lift)", padding: U("padding-xxxtight"), overflow: "hidden",
        }}>
          {dashboards.map((d) => (
            <button key={d.id} role="option" aria-selected={d.id === dashboard.id}
              onClick={() => { setOpen(false); onSwitch?.(d.id); }}
              style={{ display: "flex", alignItems: "center", gap: U("gap-xtight"), width: "100%",
                padding: `${U("padding-xxtight")} ${U("padding-tight")}`, background: "transparent",
                border: "none", borderRadius: L.radius, cursor: "pointer", textAlign: "left",
                color: T.title, fontFamily: "inherit", fontSize: Y("font-size-s") }}>
              <span style={{ width: 18, display: "inline-flex" }}>
                {d.id === dashboard.id && <Glyph name="check" size={18} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>{d.name}</span>
              {d.isDefault && <span style={{ color: T.subtle, fontSize: Y("font-size-xxs") }}>Default</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── add widget ───────────────────────────────────────────────────────────────
/**
 * The add-widget modal. 900x660 with a 186px category rail and a 714px gallery,
 * exactly as the demo.
 *
 * Every card is itself a button AND carries an Add button, which is the demo's
 * arrangement and not redundant: the card opens nothing, so the whole surface
 * being clickable is the primary affordance and the button is the label for it.
 * role=button plus tabindex 0 is what makes the card reachable by keyboard.
 */
export function AddWidgetModal({ catalogue, presentIds = [], onAdd, onClose }) {
  const [cat, setCat] = useState("All");
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const panel = useRef(null);
  const titleId = useId();

  const cats = useMemo(() => {
    const seen = [];
    for (const c of catalogue) if (c.category && !seen.includes(c.category)) seen.push(c.category);
    return seen;
  }, [catalogue]);

  const addedCount = presentIds.length;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return catalogue.filter((c) => {
      if (cat === "__added" && !presentIds.includes(c.id)) return false;
      if (cat !== "All" && cat !== "__added" && c.category !== cat) return false;
      if (!needle) return true;
      return `${c.name} ${c.description || ""}`.toLowerCase().includes(needle);
    });
  }, [catalogue, cat, q, presentIds]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { onClose?.(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const catButton = (value, label, count) => {
    const sel = cat === value;
    return (
      <button key={value} type="button" onClick={() => setCat(value)}
        aria-pressed={sel}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: U("gap-xtight"), width: "100%", textAlign: "left",
          padding: `${U("padding-xxtight")} ${U("padding-tight")}`,
          background: sel ? T.selectedFill : "transparent",
          color: sel ? T.selectedFg : T.body,
          border: "none", borderRadius: L.radius, cursor: "pointer",
          fontFamily: "inherit", fontSize: Y("font-size-s"),
          letterSpacing: Y("letter-spacing-spacious"),
        }}>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        {count > 0 && <span style={{ color: T.subtle, fontSize: Y("font-size-xxs") }}>({count})</span>}
      </button>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex",
      alignItems: "center", justifyContent: "center", padding: U("padding-relaxed") }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: T.scrim }} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        style={{
          position: "relative", width: L.modalW, maxWidth: "100%",
          height: L.modalH, maxHeight: "100%",
          // border-box, or the 1px border makes the measured dialog 902x662
          // against the demo's 900x660.
          boxSizing: "border-box",
          display: "flex", flexDirection: "column",
          background: T.elevated, borderRadius: L.radiusLg,
          border: `${L.border} solid ${T.border}`, boxShadow: "var(--elevation-lift)",
          outline: "none", overflow: "hidden",
        }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: U("gap-tight"), padding: `${U("padding-tight")} ${L.modalPad}`,
          borderBottom: `${L.border} solid ${T.divider}` }}>
          <span id={titleId} style={{ display: "inline-flex", alignItems: "center",
            gap: U("gap-xtight"), color: T.title,
            fontSize: Y("font-size-m"), fontWeight: Y("weight-semibold") }}>
            <Glyph name="dashboard_customize" size={19} color={T.subtle} />
            Add widget
          </span>
          <button type="button" aria-label="Close" onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer",
              color: T.body, display: "flex", padding: U("padding-xxtight") }}>
            <Glyph name="close" size={20} />
          </button>
        </div>

        {/* body: category rail | gallery */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* border-box: the 4px padding and the 1px divider were adding to the
              declared 186 and making the rail 195. */}
          <div style={{ width: L.catRailW, flexShrink: 0, overflowY: "auto", boxSizing: "border-box",
            padding: U("padding-xxxtight"), borderRight: `${L.border} solid ${T.divider}`,
            display: "flex", flexDirection: "column", gap: U("gap-xxtight") }}>
            {catButton("All", "All widgets", 0)}
            {/* "Added" is hidden at zero in the demo: a filter for an empty set
                is a dead end, so it appears only once something is on the board. */}
            {addedCount > 0 && catButton("__added", "Added", addedCount)}
            <div style={{ height: L.border, background: T.divider, margin: `${U("gap-xxtight")} 0` }} />
            {cats.map((c) => catButton(c, c, catalogue.filter(x => x.category === c && presentIds.includes(x.id)).length))}
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: U("gap-tight"),
              padding: `${U("padding-xxtight")} ${L.modalPad}`,
              borderBottom: `${L.border} solid ${T.divider}` }}>
              <WidgetFinder value={q} onChange={setQ} />
              <span style={{ flex: 1 }} />
              {[["grid", "grid_view"], ["list", "view_list"]].map(([v, icon]) => (
                <button key={v} type="button" onClick={() => setView(v)}
                  aria-label={v === "grid" ? "Grid view" : "List view"} aria-pressed={view === v}
                  style={{ display: "flex", padding: U("padding-xxtight"), borderRadius: L.radius,
                    background: view === v ? T.selectedFill : "transparent",
                    color: view === v ? T.selectedFg : T.body,
                    border: "none", cursor: "pointer" }}>
                  <Glyph name={icon} size={18} />
                </button>
              ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: L.modalPad,
              display: "grid", gap: L.cardGap,
              gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr" }}>
              {shown.length === 0 ? (
                <p style={{ margin: 0, color: T.subtle, fontSize: Y("font-size-s") }}>
                  No widget matches that search.
                </p>
              ) : shown.map((c) => {
                const added = presentIds.includes(c.id);
                const repeatable = c.repeatable !== false;
                const disabled = added && !repeatable;
                return (
                  <div key={c.id} role="button" tabIndex={disabled ? -1 : 0}
                    aria-label={`Add ${c.name}`} aria-disabled={disabled}
                    onClick={() => { if (!disabled) onAdd?.(c); }}
                    onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onAdd?.(c); } }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: U("gap-tight"),
                      padding: U("padding-tight"), background: T.canvas,
                      border: `${L.border} solid ${T.border}`, borderRadius: L.radius,
                      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1,
                      textAlign: "left",
                    }}>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
                      gap: U("gap-xxtight") }}>
                      <span style={{ display: "inline-flex", alignItems: "center",
                        gap: U("gap-xtight"), minWidth: 0 }}>
                        {c.app && (
                          <span role="img" aria-label={c.app.name || c.app.short} title={c.app.name || c.app.short}
                            style={{ flexShrink: 0, padding: `0 ${U("padding-xxxtight")}`,
                              borderRadius: U("cornerradius-small"),
                              background: T.badgeFill, color: T.badgeFg,
                              fontSize: Y("font-size-xxs"), fontWeight: Y("weight-semibold"),
                              letterSpacing: Y("letter-spacing-extraspacious") }}>{c.app.short}</span>
                        )}
                        <span style={{ color: T.title, fontSize: Y("font-size-s"),
                          fontWeight: Y("weight-semibold"), minWidth: 0,
                          overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                      </span>
                      {c.description && (
                        <span style={{ color: T.body, fontSize: Y("font-size-xs"),
                          lineHeight: Y("line-height-xs-single") }}>{c.description}</span>
                      )}
                    </div>
                    <Button tone="secondary" disabled={disabled}
                      style={{ minHeight: 32, flexShrink: 0 }}
                      onClick={(e) => { if (e) e.stopPropagation(); if (!disabled) onAdd?.(c); }}>
                      {added && !repeatable ? "Added" : "Add"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── dashboard ────────────────────────────────────────────────────────────────
/**
 * @param {object[]} dashboards  [{ id, name, type, isDefault, widgets:[...] }]
 * @param {string}   activeId
 * @param {object[]} catalogue   [{ id, name, description, category, app, defaultSize, supportedSizes, repeatable }]
 * @param {func}     renderWidget  (widget, api) => node. The host supplies content.
 * @param {func}     onRefreshAll  Omit and the Refresh all button is not drawn,
 *                                 because a board whose widgets do not fetch
 *                                 has nothing to refresh.
 */
export function Dashboard({
  dashboards = [],
  activeId,
  catalogue = [],
  renderWidget,
  onSwitch,
  onCommit,
  onRenameDashboard,
  onRefreshAll,
  /** Called with the widget when its open_in_full icon is used. Omit and that
   *  one icon is not drawn, which is the only one a board may genuinely not be
   *  able to honour: a widget with no full view has nowhere to go. */
  onOpenWidget,
}) {
  const active = dashboards.find((d) => d.id === activeId) || dashboards[0];
  const [manage, setManage] = useState(false);
  const [draft, setDraft] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [find, setFind] = useState("");
  const [dragId, setDragId] = useState(null);
  const [swapFor, setSwapFor] = useState(null);
  // Which widget's own menu is open, and which widget was last refreshed. The
  // second exists so the refresh icon DOES something observable in a story
  // rather than being a decoration that proves nothing.
  const [menuFor, setMenuFor] = useState(null);
  const [menuAt, setMenuAt] = useState(null);
  const [refreshed, setRefreshed] = useState(null);

  const all = draft ?? active?.widgets ?? [];
  const presentIds = all.map((w) => w.catalogueId);

  // Filtering is presentational only: it never touches the draft, so finding a
  // widget cannot become an edit and clearing always brings the board back.
  const q = find.trim().toLowerCase();
  const widgets = q ? all.filter((w) => String(w.title || "").toLowerCase().includes(q)) : all;

  const mutate = (fn) => setDraft((cur) => fn(cur ?? active.widgets.map((w) => ({ ...w }))));
  const enterManage = () => { setDraft(active.widgets.map((w) => ({ ...w }))); setManage(true); };
  const cancel = () => { setDraft(null); setManage(false); };
  const done = () => { onCommit?.({ dashboard: { ...active, widgets: draft ?? active.widgets } }); setDraft(null); setManage(false); };

  const api = {
    add: (entry) => {
      const supported = entry.supportedSizes || SIZES;
      mutate((ws) => [...ws, {
        id: `w${Date.now()}`, catalogueId: entry.id, title: entry.name,
        size: entry.defaultSize && supported.includes(entry.defaultSize) ? entry.defaultSize : supported[0],
      }]);
    },
    resize: (id, size) => mutate((ws) => ws.map((w) => (w.id === id ? { ...w, size } : w))),
    remove: (id) => mutate((ws) => ws.filter((w) => w.id !== id)),
    /**
     * Swap a slot for a different widget, KEEPING ITS POSITION. The size is
     * kept when the incoming widget supports it and otherwise falls back to
     * that widget's default: a Glance-only widget dropped into a Detail slot
     * would be asked to render at a size it has no layout for. A new id is
     * minted, because any per-widget state keyed on the old one belongs to the
     * widget that left.
     */
    swap: (id, entryId) => mutate((ws) => ws.map((w) => {
      if (w.id !== id) return w;
      const entry = catalogue.find((c) => c.id === entryId);
      const supported = entry?.supportedSizes || SIZES;
      const size = supported.includes(w.size) ? w.size : (entry?.defaultSize || supported[0]);
      return { id: `w${Date.now()}`, catalogueId: entryId, title: entry?.name || w.title, size };
    })),
    /** Refresh one widget. The board owns this because the board owns the data. */
    refresh: (id) => setRefreshed({ id, at: new Date().toLocaleTimeString() }),
    move: (fromId, toId) => mutate((ws) => {
      const a = ws.findIndex((w) => w.id === fromId), b = ws.findIndex((w) => w.id === toId);
      if (a < 0 || b < 0 || a === b) return ws;
      const next = [...ws]; const [moved] = next.splice(a, 1); next.splice(b, 0, moved); return next;
    }),
  };

  if (!active) return null;

  return (
    <div className="pw-dashboard" style={{ background: T.canvas, minHeight: "100%",
      padding: `${L.insetTop} ${L.insetH} ${L.insetBottom}`, display: "flex", flexDirection: "column",
      gap: U("gap-base"),
      // The grid's breakpoints query this box, whose content width is the grid's.
      containerType: "inline-size", containerName: "pw-dashboard" }}>
      <WidgetKeyframes />

      {/* TOOLBAR. Find, Add and Refresh all are available without manage mode,
          which is how the demo works. Manage keeps what belongs to it: the
          destructive half, rearranging, resizing and removing. */}
      <div style={{ display: "flex", alignItems: "center", gap: L.toolbarGap,
        minHeight: L.toolbarMinH, flexWrap: "wrap" }}>
        <DashboardSelector dashboard={active} dashboards={dashboards} editing={manage}
          onRename={(name) => onRenameDashboard?.(active.id, name)}
          onSwitch={(id) => { if (!draft) onSwitch?.(id); }} />
        <span style={{ flex: 1, minWidth: 0 }} />
        {!manage ? (
          <>
            <WidgetFinder value={find} onChange={setFind} />
            <Button tone="secondary" icon="add" onClick={() => setAddOpen(true)}>Add widget</Button>
            {onRefreshAll && <Button icon="refresh" onClick={onRefreshAll}>Refresh all</Button>}
            <Button tone="secondary" icon="tune" onClick={enterManage}>Manage</Button>
          </>
        ) : (
          <>
            <Button tone="secondary" icon="add" onClick={() => setAddOpen(true)}>Add widget</Button>
            <Button onClick={cancel}>Cancel</Button>
            <Button tone="primary" onClick={done}>Done</Button>
          </>
        )}
      </div>

      {/* THE GRID. 12 / 8 / 4 columns by its own width, 8px rows, 16px gap, authored order. */}
      <div className="pw-dashboard-grid" style={{
        display: "grid",
        gridTemplateColumns: GRID_TEMPLATE,
        gridAutoRows: `${L.rowUnit}px`,
        gridAutoFlow: "row",
        gap: L.gap, alignContent: "start",
      }}>
        {widgets.map((w) => {
          const entry = catalogue.find((c) => c.id === w.catalogueId);
          return (
            <Widget
              key={w.id}
              title={w.title}
              size={w.size}
              /* THE THREE HEADER ICONS ARE ALWAYS WIRED, because Figma draws
                 all three on every one of the Widget set's six variants. This
                 passed `w.onRefresh` and friends straight through, and the
                 widget objects on a board do not carry handlers, so every
                 widget on the board rendered with NO header icons at all. A
                 board-level default is the right owner anyway: refreshing one
                 widget, opening its full view and opening its menu are things
                 the board knows how to do, and a widget may still override.
                 `onInfo` was also passed and Widget has no such prop: there is
                 no info icon in the design. */
              onRefresh={w.onRefresh || (() => api.refresh(w.id))}
              onGoTo={w.onGoTo || (onOpenWidget ? () => onOpenWidget(w) : undefined)}
              onMenu={manage ? undefined : (w.onMenu || ((e) => {
                /* ANCHOR THE MENU TO ITS TRIGGER. It first opened at a fixed
                   top-right corner of the viewport whichever widget you
                   clicked, which severs the one thing a menu has to say:
                   which widget it belongs to. */
                const r = e?.currentTarget?.getBoundingClientRect();
                setMenuAt(r ? { right: Math.round(window.innerWidth - r.right), top: Math.round(r.bottom + 4) } : null);
                setMenuFor(menuFor === w.id ? null : w.id);
              }))}
              swap={{ open: swapFor === w.id, onOpen: () => setSwapFor(swapFor === w.id ? null : w.id) }}
              draggable={manage}
              onDragStart={() => setDragId(w.id)}
              onDragOver={(e) => { if (manage) e.preventDefault(); }}
              onDrop={() => { if (dragId && dragId !== w.id) api.move(dragId, w.id); setDragId(null); }}
              onDragEnd={() => setDragId(null)}
              style={manage ? { outline: `${L.border} dashed ${T.border}`, outlineOffset: 2,
                opacity: dragId === w.id ? 0.5 : 1, cursor: "grab" } : undefined}
            >
              {renderWidget?.(w, api, entry)}
            </Widget>
          );
        })}
      </div>

      {/* The swap picker is rendered by the Dashboard rather than the Widget,
          because it needs the catalogue. */}
      {swapFor && (
        <SwapSheet
          options={catalogue}
          currentId={all.find((w) => w.id === swapFor)?.catalogueId}
          onPick={(id) => { if (!manage) enterManage(); api.swap(swapFor, id); setSwapFor(null); }}
          onClose={() => setSwapFor(null)}
        />
      )}

      {/* A widget's own menu. It is the board's rather than the Widget's for
          the same reason the swap picker is: the actions in it are board
          actions, and the Widget does not know the catalogue or the draft. */}
      {menuFor && !manage && (
        <WidgetMenu
          widget={all.find((w) => w.id === menuFor)}
          catalogue={catalogue}
          onResize={(size) => { if (!manage) enterManage(); api.resize(menuFor, size); setMenuFor(null); }}
          onRemove={() => { if (!manage) enterManage(); api.remove(menuFor); setMenuFor(null); }}
          onRefresh={() => { api.refresh(menuFor); setMenuFor(null); }}
          at={menuAt}
          onClose={() => setMenuFor(null)}
        />
      )}

      {/* The refresh icon has to DO something observable, or it is a decoration
          that proves nothing about whether it is wired. */}
      {refreshed && (
        <p role="status" style={{
          margin: 0, padding: `${L.btnPadV} ${L.pagePadH}`, color: T.subtle,
          fontSize: Y("font-size-xs"), letterSpacing: Y("letter-spacing-spacious"),
        }}>
          {all.find((w) => w.id === refreshed.id)?.title || "Widget"} refreshed at {refreshed.at}.
        </p>
      )}

      {addOpen && (
        <AddWidgetModal catalogue={catalogue} presentIds={presentIds}
          onAdd={(entry) => { if (!manage) enterManage(); api.add(entry); setAddOpen(false); }}
          onClose={() => setAddOpen(false)} />
      )}
    </div>
  );
}

/**
 * One widget's own menu, opened by its more_vert icon.
 *
 * Resize lives here rather than only in manage mode because changing one
 * widget's size is not destructive: it asks for more or less of that widget's
 * content and nothing else moves out of authored order. Remove does go through
 * the draft, so Cancel still puts the board back.
 */
function WidgetMenu({ widget, catalogue, onResize, onRemove, onRefresh, onClose, at }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [onClose]);
  if (!widget) return null;
  const entry = catalogue.find((c) => c.id === widget.catalogueId);
  const sizes = entry?.supportedSizes || SIZES;

  const item = (label, onClick, danger) => (
    <button key={label} type="button" onClick={onClick} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      padding: `${L.btnPadV} ${L.modalPad}`, background: "transparent", border: "none",
      fontFamily: "inherit", fontSize: Y("font-size-s"),
      letterSpacing: Y("letter-spacing-spacious"),
      color: danger ? C("foreground-static-negative-on-subtle") : T.title,
    }}>{label}</button>
  );

  return (
    <div ref={ref} role="menu" aria-label={`${widget.title} actions`} style={{
      /* Positioned under its own trigger. `at` is measured from the button in
         the click handler, because the menu is rendered by the Dashboard and
         so is not a descendant of the Widget it belongs to. */
      position: "fixed", zIndex: 40,
      right: at ? Math.max(8, at.right) : L.pagePadH,
      top: at ? at.top : L.pagePadH,
      minWidth: 220, background: T.surface, borderRadius: L.radius,
      border: `${L.border} solid ${T.border}`, boxShadow: "var(--elevation-lift)",
      padding: `${L.btnPadV} 0`,
    }}>
      {item("Refresh this widget", onRefresh)}
      {sizes.length > 1 && (
        <>
          <hr style={{ border: 0, borderTop: `${L.border} solid ${T.divider}`,
            margin: `${L.btnPadV} 0` }} />
          {sizes.map((sz) => item(
            `${SIZE_LABEL?.[sz] || sz}${sz === widget.size ? " (current)" : ""}`,
            () => onResize(sz),
          ))}
        </>
      )}
      <hr style={{ border: 0, borderTop: `${L.border} solid ${T.divider}`,
        margin: `${L.btnPadV} 0` }} />
      {item("Remove from this dashboard", onRemove, true)}
    </div>
  );
}

/**
 * Swap picker. The current widget is listed and checked rather than omitted: a
 * picker that hides what you already have gives you no way to confirm what you
 * are looking at or to back out.
 */
function SwapSheet({ options, currentId, onPick, onClose }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [onClose]);
  const needle = q.trim().toLowerCase();
  const sorted = [...options].sort((a, b) => (a.id === currentId ? -1 : b.id === currentId ? 1 : 0));
  const shown = needle ? sorted.filter(o => o.id === currentId || o.name.toLowerCase().includes(needle)) : sorted;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex",
      alignItems: "flex-start", justifyContent: "center", paddingTop: 120 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: T.scrim, opacity: 0.4 }} />
      <div ref={ref} style={{ position: "relative", width: 320, maxHeight: 380,
        display: "flex", flexDirection: "column", background: T.elevated,
        border: `${L.border} solid ${T.border}`, borderRadius: L.radius,
        boxShadow: "var(--elevation-lift)", overflow: "hidden" }}>
        <div style={{ padding: U("padding-xxtight"), borderBottom: `${L.border} solid ${T.divider}` }}>
          <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Swap for another widget..." aria-label="Swap for another widget"
            style={{ width: "100%", boxSizing: "border-box", minHeight: 36,
              padding: `0 ${U("padding-xxtight")}`, background: T.canvas, color: T.title,
              border: `${L.border} solid ${T.border}`, borderRadius: L.radius,
              fontFamily: "inherit", fontSize: Y("font-size-xs"), appearance: "none" }} />
        </div>
        <div role="listbox" aria-label="Choose a widget to swap in"
          style={{ overflowY: "auto", padding: U("padding-xxxtight") }}>
          {shown.map((o) => {
            const current = o.id === currentId;
            return (
              <button key={o.id} role="option" aria-selected={current}
                onClick={() => { if (!current) onPick?.(o.id); else onClose?.(); }}
                style={{ display: "flex", alignItems: "center", gap: U("gap-xtight"), width: "100%",
                  padding: `${U("padding-xxtight")} ${U("padding-xxtight")}`, background: "transparent",
                  border: "none", borderRadius: L.radius, textAlign: "left",
                  cursor: current ? "default" : "pointer", color: T.title,
                  fontFamily: "inherit", fontSize: Y("font-size-xs") }}>
                <span style={{ width: 18, flexShrink: 0, display: "inline-flex" }}>
                  {current && <Glyph name="check" size={18} />}
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap" }}>{o.name}</span>
                {o.app && (
                  <span role="img" aria-label={o.app.name || o.app.short}
                    style={{ flexShrink: 0, padding: `0 ${U("padding-xxxtight")}`,
                      borderRadius: U("cornerradius-small"), background: T.badgeFill,
                      color: T.badgeFg, fontSize: Y("font-size-xxs"),
                      fontWeight: Y("weight-semibold") }}>{o.app.short}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { SIZE_GRID, SIZE_LABEL, SIZES };
export default Dashboard;
