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
