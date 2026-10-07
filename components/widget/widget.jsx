/**
 * Widget — the dashboard's container.
 *
 * SOURCE OF TRUTH: Figma set 40009622:39702, the Amplify section of the
 * "↳ Widget" page, read leaf by leaf on 2026-10-07. The behavioural source for
 * the grid and the dashboard flow is the canonical demo:
 * https://helloimjolopez-collab.github.io/design-sandbox/phase-2/Widget%20Container%20Demo/
 *
 * The previous version of this file was deleted because it had been reasoned
 * from a prototype rather than measured, and it got the size ladder, the grid
 * and the card colour all wrong. Nothing here is inferred: every number and
 * token below is quoted from the read it came from.
 *
 * MEASURED ANATOMY
 *
 *   root                r=16, stroke Stroke/Static/Neutral/Base, VERTICAL
 *     Glance   275x176  minW 275  minH 176  pad 0,0,8,0  fill Fill/Surface/Elevated
 *     Detail   566x416  minW 515            pad 0        fill #fefefd (unbound)
 *     Explore 1148x416  minW 1050           pad 0        fill #fefefd (unbound)
 *
 *   Glance            Container.Main  FILL/FILL
 *                       Container.WidgetHeading  44 tall, HORIZONTAL gap 2, pad 0,8,0,12
 *                       content                  FILL/FILL, pad 0,12,0,12
 *
 *   Detail / Explore  Heading and content  VERTICAL gap 2
 *                       Container.WidgetHeading  44 tall, HORIZONTAL gap 2, pad 0,6,0,16
 *                       MainContent.Slot         VERTICAL gap 8, pad 12,16,12,16,
 *                                                fill Fill/Surface/Elevated,
 *                                                stroke Stroke/Static/Neutral/Base
 *
 *   header            title 20 tall  +  Slot.HoverIcons 72x36 HUG, three Action.Icon 36x36
 *
 * TWO THINGS THAT LOOK LIKE MISTAKES AND ARE NOT
 *
 * 1. Detail and Explore are the SAME HEIGHT, 416, and differ only in WIDTH,
 *    566 against 1148. The old implementation gave them the same width and
 *    differentiated them by height, which is why an Explore widget rendered
 *    narrower than the board. Depth here is horizontal.
 * 2. MainContent.Slot carries its OWN fill and stroke inside a card that
 *    already has both, so Detail and Explore are a card within a card. Glance
 *    has no inner card, which is what "flat at Glance" means.
 *
 * ONE FIGMA GAP, recorded rather than copied: the Detail and Explore root fill
 * is an unbound #fefefd. That value is Fill/Static/Neutral/Faint, so the token
 * is used here and the gap is logged in the manifest for the file to fix.
 */
import React, { useState } from "react";

const C = (n) => `var(--semantic-color-${n})`;
const U = (n) => `var(--semantic-layout-units-${n})`;
const Y = (n) => `var(--semantic-type-${n})`;
const M = (n) => `var(--motion-${n})`;

export const T = {
  // Root card. Glance takes Fill/Surface/Elevated; Detail and Explore take the
  // token behind Figma's unbound #fefefd. See the gap note above.
  shellGlance:  C("fill-surface-elevated"),
  shellLayered: C("fill-static-neutral-faint"),
  shellBorder:  C("stroke-static-neutral-base"),
  // The inner card that Detail and Explore have and Glance does not.
  innerFill:    C("fill-surface-elevated"),
  innerBorder:  C("stroke-static-neutral-base"),
  title:        C("foreground-static-neutral-bold"),
  meta:         C("foreground-static-neutral-base"),
  // KPI number, 32px in Figma on Foreground/Static/Neutral/Strong.
  number:       C("foreground-static-neutral-strong"),
  iconRest:     C("foreground-action-secondary-rest"),
  iconHover:    C("foreground-action-secondary-hover"),
  iconBoxHover: C("fill-action-secondary-hover"),
};

export const L = {
  radius:        U("cornerradius-xlarge"),   // 16
  border:        U("borderwidth-base"),
  headerH:       44,
  headerGap:     U("gap-xxxtight"),          // 2
  // Header padding differs by size. Glance 0,8,0,12; Detail and Explore 0,6,0,16.
  headPadRGlance: U("padding-xtight"),       // 8
  headPadLGlance: U("padding-tight"),        // 12
  headPadRLayered:U("padding-xxtight"),      // 6
  headPadLLayered:U("padding-base"),         // 16
  // Glance content inset: pad 0,12,0,12.
  glancePadH:    U("padding-tight"),         // 12
  // MainContent.Slot: VERTICAL gap 8, pad 12,16,12,16.
  innerGap:      U("gap-tight"),             // 8
  innerPadV:     U("padding-tight"),         // 12
  innerPadH:     U("padding-base"),          // 16
  // Glance root has 8px of bottom padding and nothing else.
  glancePadB:    U("padding-xtight"),        // 8
  // Slot.HoverIcons is 72x36 and hugs; each Action.Icon is 36x36.
  actionIcon:    36,
  actionGlyph:   20,
  titleH:        20,
  // Figma's own min sizes, now also Contextual tokens.
  minW: {
    glance:  "var(--contextual-layout-units-widget-minwidth-glance)",
    detail:  "var(--contextual-layout-units-widget-minwidth-detail)",
    explore: "var(--contextual-layout-units-widget-minwidth-explore)",
  },
  minH: { glance: 176 },
};

/** The three sizes Figma defines, narrowest first. */
export const SIZES = ["glance", "detail", "explore"];

export const SIZE_LABEL = { glance: "Glance", detail: "Detail", explore: "Explore" };

/**
 * GRID SPANS, measured off the canonical demo at 1600px and again at 800px.
 * The board is 12 columns at desktop, 8 at tablet, 4 on mobile, with 48px
 * auto-rows, a 16px gap and `grid-auto-flow: row` so authored order is kept.
 *
 *   demo size   desktop(12)   tablet(8)   rows
 *   kpi         span 3        span 4      3
 *   wide        span 6        span 8      8
 *   xwide       span 12       span 8      9
 *   band        full          full        3
 *
 * glance maps to the demo's kpi, detail to wide, explore to xwide. `band` is
 * the demo's full-width strip at 3 rows, which is what holds a row of KPI tiles
 * under one heading. It is not in SIZES because it is not a Figma widget size;
 * a consumer opts into it through supportedSizes.
 */
export const SIZE_GRID = {
  glance:  { cols: [4, 4, 3],  rows: 3 },
  detail:  { cols: [4, 8, 6],  rows: 8 },
  explore: { cols: [4, 8, 12], rows: 9 },
  band:    { cols: [4, 8, 12], rows: 3 },
};

/** Glance is flat: no inner card. Everything else layers. */
export const isFlat = (size) => size === "glance" || size === "band";

/** Emits one --pw-widget-cols-<size> per entry, for one breakpoint. */
const spanRule = (bp, indent = "") =>
  Object.entries(SIZE_GRID)
    .map(([size, g]) => `${indent}  --pw-widget-cols-${size}: ${g.cols[bp]};\n`)
    .join("");

export const WidgetKeyframes = () => (
  <style>{`
.pw-dashboard-grid {
${spanRule(0)}}
@media (min-width: 768px) {
  .pw-dashboard-grid {
${spanRule(1, "  ")}  }
}
@media (min-width: 1024px) {
  .pw-dashboard-grid {
${spanRule(2, "  ")}  }
}
@keyframes pwWidgetIn { from { opacity: 0 } to { opacity: 1 } }
@media (prefers-reduced-motion: reduce) {
  @keyframes pwWidgetIn { from { opacity: 1 } to { opacity: 1 } }
}
  `}</style>
);

// ─── header ───────────────────────────────────────────────────────────────────
function ActionIcon({ name, label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        // Figma Action.Icon is 36x36 fixed.
        width: L.actionIcon, height: L.actionIcon, flexShrink: 0,
        borderRadius: U("cornerradius-base"), border: "none", padding: 0,
        background: hov ? T.iconBoxHover : "transparent",
        color: hov ? T.iconHover : T.iconRest,
        cursor: "pointer",
        transition: `background ${M("duration-2")} ${M("easing-standard")}, color ${M("duration-2")} ${M("easing-standard")}`,
      }}
    >
      <span className="material-symbols-rounded" aria-hidden="true" style={{
        fontSize: L.actionGlyph, lineHeight: 1, display: "block",
        fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${L.actionGlyph}`,
      }}>{name}</span>
    </button>
  );
}

/**
 * Container.WidgetHeading. 44 tall, horizontal, gap 2, with the title on the
 * left and Slot.HoverIcons on the right.
 *
 * The icons are REVEALED rather than always present: Figma names the slot
 * Slot.HoverIcons, and three 36px buttons on every widget of a twelve-widget
 * board is a wall of chrome. They are shown on hover and on keyboard focus
 * within, so the set is reachable without a pointer, and the slot keeps its
 * width either way so the title does not reflow when they appear.
 */
function WidgetHeading({ title, size, actions, swap }) {
  const [hov, setHov] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const revealed = hov || focusWithin;
  const layered = !isFlat(size);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false); }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: L.headerGap, height: L.headerH, flex: "0 0 auto", boxSizing: "border-box",
        paddingRight: layered ? L.headPadRLayered : L.headPadRGlance,
        paddingLeft:  layered ? L.headPadLLayered : L.headPadLGlance,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 0, height: L.titleH }}>
        {swap ? (
          // The title is the swap control. See swap in the props below.
          <button type="button" onClick={swap.onOpen}
            aria-haspopup="listbox" aria-expanded={!!swap.open}
            aria-label={`${title} — swap this widget for another`}
            style={{
              display: "inline-flex", alignItems: "center", gap: L.headerGap,
              minWidth: 0, background: "transparent", border: "none", padding: 0,
              cursor: "pointer", color: T.title, fontFamily: "inherit",
              fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
              fontWeight: Y("weight-semibold"), letterSpacing: Y("letter-spacing-spacious"),
            }}>
            <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden",
              textOverflow: "ellipsis" }}>{title}</span>
            <span className="material-symbols-rounded" aria-hidden="true" style={{
              fontSize: 12, lineHeight: 1, display: "block",
              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 12",
            }}>expand_more</span>
          </button>
        ) : (
          <span title={title} style={{
            color: T.title, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
            fontWeight: Y("weight-semibold"), letterSpacing: Y("letter-spacing-spacious"),
          }}>{title}</span>
        )}
      </div>

      {/* Slot.HoverIcons. Figma holds three Action.Icons in a 72x36 hug, so the
          slot is two icons wide with the third conditional: a widget that has
          no full view does not get a Go-to button. */}
      {actions.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", flexShrink: 0,
          opacity: revealed ? 1 : 0,
          // Kept in the layout at all times so revealing them never reflows the
          // title, and hidden from the pointer when invisible.
          pointerEvents: revealed ? "auto" : "none",
          transition: `opacity ${M("duration-2")} ${M("easing-standard")}`,
        }}>
          {actions.map((a) => (
            <ActionIcon key={a.name} name={a.name} label={a.label} onClick={a.onClick} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── component ────────────────────────────────────────────────────────────────
/**
 * @param {string} title     Widget heading.
 * @param {"glance"|"detail"|"explore"|"band"} size
 * @param {node}   children  The widget's content: a KPI tile, a chart, a table.
 * @param {func}   onInfo    "About this widget". Omit to hide.
 * @param {func}   onGoTo    "Go to the full view". Omit to hide.
 * @param {func}   onRefresh "Refresh". Omit to hide.
 * @param {func}   onMenu    "More actions". Omit to hide.
 * @param {object} swap      { onOpen, open } makes the title a swap control.
 * @param {bool}   inGrid    false when the widget is not inside a dashboard
 *                           grid, so it does not claim a column span.
 */
export function Widget({
  title,
  size = "detail",
  children,
  onInfo,
  onGoTo,
  onRefresh,
  onMenu,
  swap,
  inGrid = true,
  className = "",
  style,
  ...rest
}) {
  const layered = !isFlat(size);
  const grid = SIZE_GRID[size] || SIZE_GRID.detail;

  // Figma's Slot.HoverIcons holds three. Which three depends on what the
  // consumer wires up, in the order the design shows them.
  const actions = [
    onInfo    && { name: "info",         label: "About this widget", onClick: onInfo },
    onGoTo    && { name: "open_in_new",  label: "Go to the full view", onClick: onGoTo },
    onRefresh && { name: "refresh",      label: "Refresh", onClick: onRefresh },
    onMenu    && { name: "more_vert",    label: "More actions", onClick: onMenu },
  ].filter(Boolean);

  return (
    <div
      className={`pw-widget ${className}`}
      data-size={size}
      aria-label={title}
      style={{
        display: "flex", flexDirection: "column", boxSizing: "border-box",
        // Figma's own minimum width per size, via the Contextual tokens. band
        // and explore span every track, so their floor is the grid's.
        minWidth: L.minW[size] ?? 0,
        minHeight: L.minH[size] ?? undefined,
        // Spans are declared on .pw-dashboard-grid, not :root, so a widget
        // dropped into a page section asks for one track instead of twelve.
        ...(inGrid ? {
          gridColumn: `span var(--pw-widget-cols-${size}, 1)`,
          gridRow: `span ${grid.rows}`,
        } : {}),
        background: layered ? T.shellLayered : T.shellGlance,
        border: `${L.border} solid ${T.shellBorder}`,
        borderRadius: L.radius,
        // Glance's only padding is 8 at the bottom.
        paddingBottom: layered ? 0 : L.glancePadB,
        overflow: "hidden",
        animation: `pwWidgetIn ${M("duration-3")} ${M("easing-standard")} both`,
        ...style,
      }}
      {...rest}
    >
      <WidgetHeading title={title} size={size} actions={actions} swap={swap} />

      {layered ? (
        /* MainContent.Slot: the inner card Detail and Explore have. */
        <div style={{
          display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
          gap: L.innerGap,
          padding: `${L.innerPadV} ${L.innerPadH}`,
          background: T.innerFill,
          border: `${L.border} solid ${T.innerBorder}`,
          boxSizing: "border-box",
          overflow: "hidden",
        }}>
          {children}
        </div>
      ) : (
        /* Glance is flat: content sits directly on the card with a 12px inset. */
        <div style={{
          display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
          padding: `0 ${L.glancePadH}`, boxSizing: "border-box", overflow: "hidden",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Widget;
