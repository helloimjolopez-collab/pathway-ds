/**
 * Scrollable — Pathway Design System
 *
 * A reusable overlay-scrollbar wrapper. Hides the native OS scrollbar entirely and
 * renders one custom, semitransparent thumb so scrolling looks and behaves IDENTICALLY
 * on macOS, Windows, iOS, and Android (native scrollbars can't be made consistent — this
 * sidesteps them).
 *
 * Why a custom overlay (not just `::-webkit-scrollbar` CSS):
 *   - Windows Chromium renders a chunky, space-TAKING bar with corner boxes; CSS can thin
 *     it but not make it overlay. This thumb is absolutely positioned, so it NEVER takes
 *     layout width or shifts the content's padding — on any OS, any breakpoint.
 *   - Firefox only exposes `scrollbar-width`/`scrollbar-color` (no px control). Hidden here.
 *   - Mobile overlay bars auto-show on touch and aren't stylable. Hidden; our thumb shows
 *     while scrolling instead.
 *
 * Usage:
 *   <Scrollable style={{ flex: 1, minHeight: 0 }}>…tall content…</Scrollable>
 *
 * Spec: docs/scrollbar-spec.md  (system-wide — applies to every scroll surface in Pathway)
 */

import React, { useRef, useState, useEffect, useCallback } from "react";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
// Every colour + unit resolves through a SEMANTIC Pathway token (tokens.css) — no primitives,
// no hardcoded hex/px. Thumb colour uses the fill.static.neutral translucent-overlay semantics;
// geometry uses the semantic layout-unit tokens.
export const SCROLL = {
  thumbWidth:  "var(--semantic-layout-units-padding-xtight)",     // 6px
  thumbRadius: "var(--semantic-layout-units-cornerradius-full)",  // fully-rounded pill
  thumbMin:    28,                                                // px — numeric (JS layout math; no semantic step between 24 and 36)
  gutter:      "var(--semantic-layout-units-padding-xxxtight)",   // 2px — inset from the right edge
  // Liquid-glass thumb: translucent neutral overlay + backdrop blur that refracts content beneath.
  thumbRest:   "var(--semantic-color-light-mode-scrim-faint)",   // black 16% — faint overlay (rest)
  thumbHover:  "var(--semantic-color-light-mode-scrim-light)",   // black 30% — hover/drag
  thumbBlur:   "blur(8px) saturate(180%)",
  // Hairline glass edge: semantic white at 35% via color-mix.
  thumbEdge:   "inset 0 0 0 0.5px color-mix(in srgb, var(--semantic-color-light-mode-fill-static-neutral-light) 35%, transparent)",
  fadeMs: 240,
  idleHideMs: 900,                                // hide the thumb this long after scrolling stops
};

// Hide the native scrollbar once, globally, on the opt-in class only. Scrollbars cannot be
// removed via inline React styles — this is the single injected rule the component relies on.
if (typeof document !== "undefined" && !document.getElementById("pds-scrollable-base")) {
  const s = document.createElement("style");
  s.id = "pds-scrollable-base";
  s.textContent =
    ".pds-scrollable__view{scrollbar-width:none;-ms-overflow-style:none}" +
    ".pds-scrollable__view::-webkit-scrollbar{width:0;height:0;display:none}";
  document.head.appendChild(s);
}

export function Scrollable({ children, className = "", style = {}, viewClassName = "", viewStyle = {} }) {
  const viewRef   = useRef(null);
  const dragRef   = useRef(null);
  const idleRef   = useRef(null);
  const [thumb, setThumb] = useState({ h: 0, top: 0, show: false });
  const [active, setActive] = useState(false);   // hover OR recently scrolling
  const [hot, setHot]       = useState(false);    // pointer over / dragging the thumb

  const recompute = useCallback(() => {
    const el = viewRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight + 1) { setThumb(t => (t.show ? { ...t, show: false } : t)); return; }
    const h   = Math.max(SCROLL.thumbMin, (clientHeight / scrollHeight) * clientHeight);
    const top = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - h);
    setThumb({ h, top, show: true });
  }, []);

  // Recompute on mount, content change, and any size change.
  useEffect(() => {
    recompute();
    const el = viewRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    Array.from(el.children).forEach(c => ro.observe(c));
    return () => ro.disconnect();
  }, [children, recompute]);

  const wake = () => {
    setActive(true);
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => { if (!dragRef.current) setActive(false); }, SCROLL.idleHideMs);
  };

  const onScroll = () => { recompute(); wake(); };

  const onThumbDown = (e) => {
    e.preventDefault();
    const el = viewRef.current;
    if (!el) return;
    dragRef.current = { startY: e.clientY, startTop: el.scrollTop };
    setHot(true); setActive(true);
    const onMove = (ev) => {
      const { scrollHeight, clientHeight } = el;
      const h = Math.max(SCROLL.thumbMin, (clientHeight / scrollHeight) * clientHeight);
      const ratio = (scrollHeight - clientHeight) / (clientHeight - h);
      el.scrollTop = dragRef.current.startTop + (ev.clientY - dragRef.current.startY) * ratio;
    };
    const onUp = () => {
      dragRef.current = null;
      setHot(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      wake();
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className={`pds-scrollable ${className}`}
      style={{ position: "relative", minHeight: 0, ...style }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => { if (!dragRef.current) setActive(false); }}
    >
      <div
        ref={viewRef}
        className={`pds-scrollable__view ${viewClassName}`}
        onScroll={onScroll}
        style={{ height: "100%", overflowY: "auto", overflowX: "hidden", ...viewStyle }}
      >
        {children}
      </div>

      {thumb.show && (
        <div
          aria-hidden="true"
          onMouseDown={onThumbDown}
          onMouseEnter={() => setHot(true)}
          onMouseLeave={() => setHot(false)}
          style={{
            position: "absolute",
            top: thumb.top,
            right: SCROLL.gutter,
            width: SCROLL.thumbWidth,
            height: thumb.h,
            borderRadius: SCROLL.thumbRadius,
            background: hot ? SCROLL.thumbHover : SCROLL.thumbRest,
            backdropFilter: SCROLL.thumbBlur,            // liquid glass — refracts content behind
            WebkitBackdropFilter: SCROLL.thumbBlur,
            boxShadow: SCROLL.thumbEdge,                 // hairline glass edge
            opacity: active ? 1 : 0,
            transition: `opacity ${SCROLL.fadeMs}ms ease, background ${SCROLL.fadeMs}ms ease`,
            pointerEvents: active ? "auto" : "none",
            zIndex: 5,
            // Never affects layout — pure overlay.
          }}
        />
      )}
    </div>
  );
}

export default Scrollable;
