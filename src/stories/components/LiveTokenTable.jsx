import React, { useState, useEffect } from "react";

/**
 * LiveTokenTable — a token reference table that RESOLVES its own values.
 *
 * WHY THIS EXISTS: Search, TopNav, OrgSwitcher and Checkbox each carried their
 * own copy of a token table in the shape
 *
 *     { token: "fill.action.tertiary.base", hex: "#eef2fb", usage: "..." }
 *
 * Two things were wrong with that shape, and the second is the reason this file
 * is shared rather than fixed four times:
 *
 *   1. The names went stale. `fill.action.tertiary.*` and every `*inverse`
 *      family were deleted, `text.*` and `icon.*` merged into `foreground.*`,
 *      and `.base` became `.rest` on Action tokens. Four documents kept
 *      publishing them.
 *   2. The hex was HAND-TYPED beside the name. So even where the name was
 *      right, the swatch was drawn from a number a human copied once. A token
 *      value change repainted the component and left the documentation
 *      asserting the old colour, with no way to tell from the page which of
 *      the two was true.
 *
 * Here the swatch and the "resolved" column both come from
 * getComputedStyle on the live custom property. A name that no longer exists
 * renders an empty swatch and "unresolved" in red, so a stale row is visible on
 * the page instead of looking like a fact.
 *
 * `token` is accepted in dot form (`fill.action.primary.rest`) because that is
 * how the specs write it, and converted to the custom property. Pass
 * `cssVar` instead to name the property directly.
 */

export const toCssVar = (dotted) =>
  `--semantic-color-${String(dotted).replace(/\./g, "-")}`;

export function LiveTokenRow({ token, cssVar, usage }) {
  const varName = cssVar || toCssVar(token);
  const [resolved, setResolved] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    setResolved(v || "");
  }, [varName]);

  const missing = resolved === "";

  return (
    <tr style={{ borderBottom: "1px solid #f1f1f4" }}>
      <td style={{ padding: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: missing ? "transparent" : `var(${varName})`,
            border: missing ? "1px dashed #d99" : "1px solid rgba(0,0,0,0.08)",
          }}
        />
      </td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 11.5, color: "#3a3f5c" }}>
        {varName}
      </td>
      <td
        style={{
          padding: 8,
          fontFamily: "monospace",
          fontSize: 11.5,
          color: missing ? "#b00" : "#71717a",
          whiteSpace: "nowrap",
        }}
      >
        {resolved === null ? "resolving..." : missing ? "unresolved" : resolved}
      </td>
      <td style={{ padding: 8, fontSize: 12.5, color: "#52525b" }}>{usage}</td>
    </tr>
  );
}

export function LiveTokenTable({ title, rows, note }) {
  return (
    <div
      style={{
        fontFamily: "'Red Hat Text', sans-serif",
        padding: 24,
        background: "#fff",
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>{title}</h3>
      {note && (
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#71717a", maxWidth: "70ch", lineHeight: 1.5 }}>
          {note}
        </p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
            <th style={{ padding: 8, width: 64 }}>Swatch</th>
            <th style={{ padding: 8 }}>Custom property</th>
            <th style={{ padding: 8, width: 130 }}>Resolved</th>
            <th style={{ padding: 8 }}>Usage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <LiveTokenRow key={r.cssVar || r.token} {...r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LiveTokenTable;
