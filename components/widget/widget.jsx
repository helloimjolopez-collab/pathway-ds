/**
 * Widget: the dashboard's container.
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
 *   header            Container.WidgetHeading 44 tall, HORIZONTAL, two children:
 *                     Container.RowStart  title 20 tall + Slot.HoverIcons 72x36 HIDDEN, TWO Action.Icon
 *                     Slot.RowEnd         THREE Action.Icon 36x36, VISIBLE at rest
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
import { ActionIcon } from "../icon/action-icon.jsx";

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
  // KPI number, 32px in Figma on Foreground/Static/Neutral/Strong.
};

export const L = {
  radius:        U("cornerradius-xlarge"),   // 16, bound to CornerRadius/XLarge
  /* 0.5, NOT 1. Measured on every variant 2026-10-08: the root and the
     MainContent.Slot both stroke at 0.5 INSIDE. This was borderwidth-base, 1px,
     so every widget border rendered at twice the design's weight, which on a
     1148px Explore card is the most visible line on the board.
     BorderWidth/XThin is exactly 0.5. Note Figma does not BIND the weight to a
     variable, so 0.5 is a raw value there; the token matches it exactly. */
  border:        U("borderwidth-xthin"),
  /* MainContent.Slot is rounded on its TOP corners only: 12,12,0,0. It was a
     uniform 8 here, which is both the wrong radius and the wrong shape. */
  innerRadiusTop: U("cornerradius-large"),
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
  // Slot.RowEnd hugs its three Action.Icons. They are Size=BASE: a 44x44
  // target, a 28x28 state layer at r=8 and a 14px glyph. They were Size=Small
  // (36/24/12) until the design changed on 2026-10-08, and 44 is also the WCAG
  // 2.5.5 minimum, so the change fixed a target that was 8px short.
  // The separate, hidden Slot.HoverIcons is 72x36 and holds two.
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
/* Slot.HoverIcons: the SECOND icon slot, beside the title. Hidden at rest and
   revealed on hover OR keyboard focus within the widget, so it is reachable
   without a pointer. pointer-events is off while invisible so it cannot be
   clicked blind, which is the failure mode of an opacity-only reveal. */
.pw-widget .pw-widget-hover-actions {
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--motion-duration-2) var(--motion-easing-standard);
}
.pw-widget:hover .pw-widget-hover-actions,
.pw-widget:focus-within .pw-widget-hover-actions {
  opacity: 1;
  pointer-events: auto;
}
@media (prefers-reduced-motion: reduce) {
  .pw-widget .pw-widget-hover-actions { transition: none }
}
  `}</style>
);

// ─── header ───────────────────────────────────────────────────────────────────
/* ActionIcon used to be a private helper right here, which is why Figma's
   `Action Icon` set (40006794:19891, used 30 times inside this very component)
   had no code to point at and the KPI Tile could not reuse it. It now lives in
   components/icon/action-icon.jsx and is measured off that set. */
/**
 * Container.WidgetHeading. 44 tall, horizontal, gap 2.
 *
 * THERE ARE TWO ICON SLOTS, and conflating them is what went wrong twice.
 * Walking the Figma tree on 2026-10-07 gives, inside the 566x44 header:
 *
 *   Container.RowStart  109x20
 *     Heading           the title
 *     Slot.HoverIcons   72x36, HIDDEN, TWO Action.Icon
 *   Slot.RowEnd         433x36, THREE Action.Icon: refresh, open_in_full, more_vert
 *
 * So the three icons a reader sees at rest are `Slot.RowEnd`, and they are
 * visible in all six variants as drawn. `Slot.HoverIcons` is a DIFFERENT slot:
 * two more actions, beside the TITLE rather than at the row end, hidden, and
 * gated by the set's `Show Hover Actions` boolean, whose default is false.
 *
 * The first implementation read the name `Slot.HoverIcons` as the behaviour of
 * the visible three and hid them until hover. The correction then over-swung
 * and claimed the slot simply held the visible three and that its name
 * described position rather than timing. Both were wrong: there are two slots,
 * the row-end three are always on, and the hover two are genuinely hover-only
 * and off by default. `hoverActions` below is that second slot.
 */
/* Exported so Figma's `Widget.Heading` component (40017333:34481) has something
   to map to. It is a BUILDING BLOCK: mapped, but no Storybook page, because it
   only ever appears nested inside a Widget. */
export function WidgetHeading({ title, size = "detail", actions = [], hoverActions = [], swap }) {
  const layered = !isFlat(size);
  return (
    <div
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
            aria-label={`${title}: swap this widget for another`}
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

        {/* Slot.HoverIcons: the SECOND slot, beside the title, two icons, hidden
            until hover or keyboard focus. Off unless a consumer passes it,
            because the Figma boolean that gates it defaults to false. It is
            pointer-events: none while invisible so it cannot be clicked blind. */}
        {hoverActions.length > 0 && (
          <div className="pw-widget-hover-actions"
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {hoverActions.slice(0, 2).map((a) => (
              <ActionIcon key={a.name} name={a.name} label={a.label} onClick={a.onClick} size="Base" />
            ))}
          </div>
        )}
      </div>

      {/* Slot.RowEnd: the three icons that ARE visible at rest. The third is
          conditional, because a widget with no full view gets no expand
          button. */}
      {actions.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {actions.map((a) => (
            <ActionIcon key={a.name} name={a.name} label={a.label} onClick={a.onClick} size="Base" />
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
 * @param {func}   onGoTo    "Open the full view". Omit to hide.
 * @param {func}   onRefresh "Refresh". Omit to hide.
 * @param {func}   onMenu    "More actions". Omit to hide.
 * @param {object} swap      { onOpen, open } makes the title a swap control.
 * @param {array}  hoverActions  Slot.HoverIcons: up to TWO extra actions that
 *                           sit beside the TITLE and appear on hover or focus.
 *                           A different slot from the three row-end icons
 *                           above, and OFF by default, because the Figma
 *                           boolean that gates it (`Show Hover Actions`)
 *                           defaults to false. Shape: [{ name, label, onClick }].
 * @param {bool}   inGrid    false when the widget is not inside a dashboard
 *                           grid, so it does not claim a column span.
 */
export function Widget({
  title,
  size = "detail",
  children,
  onGoTo,
  onRefresh,
  onMenu,
  swap,
  hoverActions = [],
  inGrid = true,
  className = "",
  style,
  ...rest
}) {
  const layered = !isFlat(size);
  const grid = SIZE_GRID[size] || SIZE_GRID.detail;

  // Figma's Slot.RowEnd holds three. Which three depends on what the
  // consumer wires up, in the order the design shows them.
  // EXACTLY THE THREE FIGMA DRAWS, in its order: refresh, open_in_full,
  // more_vert. There is no `info` icon on the widget: I had invented one, and
  // `open_in_new` was the wrong ligature for the expand action.
  const actions = [
    onRefresh && { name: "refresh",       label: "Refresh", onClick: onRefresh },
    onGoTo    && { name: "open_in_full",  label: "Open the full view", onClick: onGoTo },
    onMenu    && { name: "more_vert",     label: "More actions", onClick: onMenu },
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
      <WidgetHeading title={title} size={size} actions={actions}
        hoverActions={hoverActions} swap={swap} />

      {layered ? (
        /* MainContent.Slot: the inner card Detail and Explore have. */
        <div style={{
          display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
          gap: L.innerGap,
          padding: `${L.innerPadV} ${L.innerPadH}`,
          background: T.innerFill,
          border: `${L.border} solid ${T.innerBorder}`,
          /* Rounded at the TOP only, which is what the slot's per-corner radii
             say: 12, 12, 0, 0. Its bottom edge meets the card's own bottom. */
          borderTopLeftRadius: L.innerRadiusTop,
          borderTopRightRadius: L.innerRadiusTop,
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
