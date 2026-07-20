/**
 * Scrollable (overlay scrollbar) — Storybook stories
 * Spec: docs/scrollbar-spec.md
 */
import React from "react";
import { Scrollable } from "../../../../components/scrollbar/scrollbar.jsx";

if (typeof document !== "undefined" && !document.getElementById("pds-scrollbar-story-fonts")) {
  const s = document.createElement("style");
  s.id = "pds-scrollbar-story-fonts";
  s.textContent = "@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600&display=swap');";
  document.head.appendChild(s);
}

const Rows = ({ n = 40 }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{
        padding: "10px 16px", fontFamily: "'Red Hat Text', sans-serif", fontSize: 14,
        color: "#252525", borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap",
      }}>
        Row {i + 1} — scroll to see the overlay thumb
      </div>
    ))}
  </>
);

const Frame = ({ children, w = 320, h = 300 }) => (
  <div style={{ width: w, height: h, border: "1px solid #e4e4e4", borderRadius: 12,
    overflow: "hidden", background: "#fff", fontFamily: "'Red Hat Text', sans-serif" }}>
    {children}
  </div>
);

export default {
  title: "Library/Scrollbar",
  component: Scrollable,
  parameters: {
    layout: "padded",
    docs: { description: { component:
      "One overlay scrollbar for the whole system. Hides the native OS scrollbar and draws a slim, semitransparent thumb so scrolling looks IDENTICAL on macOS, Windows, iOS, and Android — and never takes layout space or shifts padding. Hover or scroll the frame to reveal the thumb. See docs/scrollbar-spec.md." } },
  },
};

export const Playground = {
  render: () => (
    <Frame>
      <Scrollable style={{ height: "100%" }}><Rows n={40} /></Scrollable>
    </Frame>
  ),
  parameters: { docs: { description: { story: "Hover the frame (or scroll) — the slim semitransparent thumb fades in, overlaying the content's right edge. It takes no layout width." } } },
};

// ─── Edge controls (§8.1) ───────────────────────────────────────────────────
// Demonstrates the two consumer patterns for a control that sits on the scroll
// region's edge, using the REAL <Scrollable> in both panels. The only
// difference between the two panels is what the *consumer* places outside vs.
// inside <Scrollable> — nothing in scrollbar.jsx changes.

const NavRows = ({ n = 18 }) => {
  const labels = ["Dashboard", "People", "Groups", "Giving", "Events", "Check-ins",
    "Messages", "Forms", "Reports", "Workflows", "Calendar", "Resources"];
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10, margin: "1px 8px", padding: "8px 9px",
          borderRadius: 8, fontFamily: "'Red Hat Text', sans-serif", fontSize: 13.5, color: "#3c4152",
          background: i === 2 ? "#ececfb" : "transparent", fontWeight: i === 2 ? 600 : 400,
        }}>
          <span style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, background: i === 2 ? "#4646cf" : "#d6d9e6" }} />
          {labels[i % labels.length]}
        </div>
      ))}
    </>
  );
};

// The ad hoc handle below is a demo-only mock — it is NOT Pathway's shipped
// CollapseButton (that control lives correctly pinned inside SideNav's
// NavHeader; see sidenav-spec.md §9). This mock exists only to document how
// a floating, edge-straddling handle behaves when a consumer has no pinned
// header to place it in — the legacy pattern §8.1 flags as ad hoc.
const AdHocFloatingHandle = () => (
  <button aria-label="Collapse navigation" title="Collapse / expand (ad hoc demo handle)" style={{
    position: "absolute", top: 8, right: -13, width: 26, height: 26, borderRadius: "50%",
    background: "#fff", border: "1px solid #e4e4e4", boxShadow: "0 2px 8px rgba(30,32,60,.16)",
    display: "grid", placeItems: "center", cursor: "pointer", padding: 0, zIndex: 10,
  }}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M7.5 2.5 L4 6 L7.5 9.5" stroke="#4646cf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

const NavFrame = ({ children, label }) => (
  <div>
    <div style={{ fontFamily: "'Red Hat Text',sans-serif", fontSize: 12, fontWeight: 600, color: "#8890b0",
      textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{label}</div>
    <div style={{ position: "relative", width: 230, height: 308, border: "1px solid #e4e4e4", borderRadius: 10,
      background: "#fff", fontFamily: "'Red Hat Text', sans-serif", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  </div>
);

export const EdgeControls = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
      <NavFrame label="Recommended — pinned header">
        {/* Header is a flexShrink:0 sibling OUTSIDE <Scrollable> — the track
            starts below it, so it can never reach (or scroll past) the handle. */}
        <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center",
          height: 42, padding: "0 14px", borderBottom: "1px solid #eef0f4",
          fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#8890b0" }}>
          Workspace
          <AdHocFloatingHandle />
        </div>
        <Scrollable style={{ flex: 1, minHeight: 0 }} viewStyle={{ display: "flex", flexDirection: "column", paddingTop: 8 }}>
          <NavRows />
        </Scrollable>
      </NavFrame>

      <NavFrame label="Ad hoc — no pinned header (legacy)">
        {/* No header to place the handle in, so it floats directly over the
            scroll region's true edge. The whole panel IS the scroll region —
            scroll to the top and the thumb travels behind the handle. Not the
            pattern to reach for in new work; see §8.1. */}
        <AdHocFloatingHandle />
        <Scrollable style={{ flex: 1, minHeight: 0 }} viewStyle={{ display: "flex", flexDirection: "column", paddingTop: 8 }}>
          <NavRows />
        </Scrollable>
      </NavFrame>
    </div>
  ),
  parameters: { docs: { description: { story:
    "Scroll each panel to the top. Left: the collapse handle sits inside a pinned header **outside** `<Scrollable>` — the track starts below it, so there's no overlap, ever. Right: the same handle with no header to hold it — the whole panel is the scroll region, so the thumb travels behind the handle at the top of scroll. This is the ad hoc pattern flagged in scrollbar-spec.md §8.1: it ships in one production module today, but the pinned-header pattern (left, matching SideNav) is the one to build new work on."
  } } },
};

export const NoLayoutShift = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div>
        <div style={{ fontFamily: "'Red Hat Text',sans-serif", fontSize: 12, fontWeight: 600, color: "#8890b0", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Overflowing (scrollbar)</div>
        <Frame><Scrollable style={{ height: "100%" }}><Rows n={40} /></Scrollable></Frame>
      </div>
      <div>
        <div style={{ fontFamily: "'Red Hat Text',sans-serif", fontSize: 12, fontWeight: 600, color: "#8890b0", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Not overflowing</div>
        <Frame><Scrollable style={{ height: "100%" }}><Rows n={4} /></Scrollable></Frame>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story: "Both frames are exactly 320px wide and their content lines start at the same x — the overlay scrollbar adds **zero** width, so an overflowing list and a non-overflowing one have identical padding/alignment (unlike a native Windows scrollbar, which would shift the left one)." } } },
};
