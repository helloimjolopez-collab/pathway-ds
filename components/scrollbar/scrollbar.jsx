/**
 * Scrollable — Pathway Design System
 *
 * A reusable overlay-scrollbar wrapper. Hides the native OS scrollbar entirely and renders
 * one custom liquid-glass thumb so scrolling looks and behaves IDENTICALLY on macOS, Windows,
 * iOS, and Android (native scrollbars can't be made consistent — this sidesteps them).
 *
 * Behaviour (see components/scrollbar/scrollbar-spec.md):
 *   - Thumb height is PROPORTIONAL to content: (viewport / total) × track, floored at 28px.
 *   - Reveal: appears while scrolling, fades ~900ms after; also appears when the MOUSE is near
 *     the right-edge bar (so it can be grabbed). It does NOT appear from hovering the panel.
 *   - Drag: MOUSE only, via a wider invisible grab strip (the 6px thumb alone is hard to hit).
 *   - Touch: passive — the bar just shows position; you scroll by swiping content. The grab
 *     strip is disabled on touch devices via a `(hover: none)` rule.
 *   - Keyboard / a11y: the content scrolls natively (arrows, PageUp/Down, Home/End, Space); the
 *     thumb is decorative (`aria-hidden`) and never the only scroll mechanism.
 *
 * Usage:
 *   <Scrollable style={{ flex: 1, minHeight: 0 }}>…tall content…</Scrollable>
 */

import React, { useRef, useState, useEffect, useCallback } from "react";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
// Every colour + unit resolves through a SEMANTIC Pathway token (tokens.css) — no primitives,
// no hardcoded hex/px. Motion uses the --motion-* tokens (durations/easings from design-system-spec §2).
export const SCROLL = {
  thumbWidth:  "var(--semantic-layout-units-padding-xtight)",     // 6px — visible thumb thickness
  thumbRadius: "var(--semantic-layout-units-cornerradius-full)",  // fully-rounded pill
  thumbMin:    28,                                                // px — min thumb length (grab-target floor); JS layout math
  gutter:      "var(--semantic-layout-units-padding-xxxtight)",   // 2px — inset from the right edge
  grabZone:    16,                                                // px — invisible mouse grab strip (wider than the 6px thumb so it's catchable)
  thumbRest:   "var(--semantic-color-light-mode-scrim-faint)",    // black 16% — faint overlay (rest)
  thumbHover:  "var(--semantic-color-light-mode-scrim-light)",    // black 30% — hover/drag
  thumbBlur:   "blur(8px) saturate(180%)",
  // Hairline glass edge: semantic white at 35% via color-mix.
  thumbEdge:   "inset 0 0 0 0.5px color-mix(in srgb, var(--semantic-color-light-mode-fill-static-neutral-light) 35%, transparent)",
  // Asymmetric fade, motion-token driven: snappy appear (200ms decelerate glide-in), graceful fade-out (380ms).
  fadeIn:      "opacity var(--motion-duration-3) var(--motion-easing-decelerate), background var(--motion-duration-3) var(--motion-easing-standard)",
  fadeOut:     "opacity var(--motion-duration-5) var(--motion-easing-standard)",
  idleHideMs:  500,                                               // hide the thumb this long after scrolling stops / mouse leaves the bar
};

// Injected once: hide the native bar on the opt-in class, and disable the mouse grab strip on
// touch devices so finger-swipes scroll the content underneath (the thumb stays a passive indicator).
if (typeof document !== "undefined" && !document.getElementById("pds-scrollable-base")) {
  const s = document.createElement("style");
  s.id = "pds-scrollable-base";
  s.textContent =
    ".pds-scrollable__view{scrollbar-width:none;-ms-overflow-style:none}" +
    ".pds-scrollable__view::-webkit-scrollbar{width:0;height:0;display:none}" +
    "@media (hover: none){.pds-scrollable__grab{pointer-events:none!important}}";
  document.head.appendChild(s);
}

export function Scrollable({ children, className = "", style = {}, viewClassName = "", viewStyle = {} }) {
  const viewRef = useRef(null);
  const dragRef = useRef(null);
  const idleRef = useRef(null);
  const nearRef = useRef(false);                    // mouse currently near the right-edge bar
  const [thumb, setThumb] = useState({ h: 0, top: 0, show: false });
  const [active, setActive] = useState(false);       // thumb visible (scrolling, near-bar, or dragging)
  const [hot, setHot]       = useState(false);       // mouse over / dragging the grab strip

  // Thumb height is PROPORTIONAL to content; floored at thumbMin. Position maps the floored
  // thumb across the full track so it still reaches top and bottom exactly.
  const recompute = useCallback(() => {
    const el = viewRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight + 1) { setThumb(t => (t.show ? { ...t, show: false } : t)); return; }
    const h   = Math.max(SCROLL.thumbMin, (clientHeight / scrollHeight) * clientHeight);
    const top = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - h);
    setThumb({ h, top, show: true });
  }, []);

  useEffect(() => {
    recompute();
    const el = viewRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    Array.from(el.children).forEach(c => ro.observe(c));
    return () => ro.disconnect();
  }, [children, recompute]);

  const scheduleHide = () => {
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      if (!dragRef.current && !nearRef.current) setActive(false);
    }, SCROLL.idleHideMs);
  };
  const wake = () => { setActive(true); scheduleHide(); };          // reveal while scrolling
  const onScroll = () => { recompute(); wake(); };

  // Edge-proximity reveal (mouse): show the bar when the cursor is within grabZone of the right
  // edge, so it can be grabbed — but NOT from hovering the rest of the panel.
  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.right - e.clientX <= SCROLL.grabZone) {
      nearRef.current = true; setActive(true); clearTimeout(idleRef.current);
    } else if (nearRef.current) {
      nearRef.current = false; scheduleHide();
    }
  };
  const onMouseLeave = () => { nearRef.current = false; if (!dragRef.current) scheduleHide(); };

  // Drag (mouse only). The grab strip carries this; the visual thumb is decorative.
  const onGrabDown = (e) => {
    e.preventDefault();
    const el = viewRef.current;
    if (!el) return;
    dragRef.current = { startY: e.clientY, startTop: el.scrollTop };
    setHot(true); setActive(true); clearTimeout(idleRef.current);
    const onMove = (ev) => {
      const { scrollHeight, clientHeight } = el;
      const h = Math.max(SCROLL.thumbMin, (clientHeight / scrollHeight) * clientHeight);
      const ratio = (scrollHeight - clientHeight) / (clientHeight - h);
      el.scrollTop = dragRef.current.startTop + (ev.clientY - dragRef.current.startY) * ratio;
    };
    const onUp = () => {
      dragRef.current = null; setHot(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      wake();
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const barTop = thumb.top, barH = thumb.h;

  return (
    <div
      className={`pds-scrollable ${className}`}
      style={{ position: "relative", minHeight: 0, ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
        <>
          {/* Visual thumb — decorative, never intercepts pointer events. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: barTop, right: SCROLL.gutter,
              width: SCROLL.thumbWidth, height: barH, borderRadius: SCROLL.thumbRadius,
              background: hot ? SCROLL.thumbHover : SCROLL.thumbRest,
              backdropFilter: SCROLL.thumbBlur, WebkitBackdropFilter: SCROLL.thumbBlur,
              boxShadow: SCROLL.thumbEdge,
              opacity: active ? 1 : 0, transition: active ? SCROLL.fadeIn : SCROLL.fadeOut,
              pointerEvents: "none", zIndex: 5,
            }}
          />
          {/* Invisible mouse grab strip — wider than the thumb so it's catchable; disabled on
              touch via the (hover:none) rule so finger-swipes scroll the content beneath. */}
          <div
            aria-hidden="true"
            className="pds-scrollable__grab"
            onMouseDown={onGrabDown}
            onMouseEnter={() => setHot(true)}
            onMouseLeave={() => setHot(false)}
            style={{
              position: "absolute", top: barTop, right: 0,
              width: SCROLL.grabZone, height: barH,
              pointerEvents: active ? "auto" : "none", zIndex: 6, background: "transparent",
            }}
          />
        </>
      )}
    </div>
  );
}

export default Scrollable;
