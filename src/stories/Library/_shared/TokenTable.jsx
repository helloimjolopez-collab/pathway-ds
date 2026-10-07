/**
 * TokenTable: the token listing every component page owes its reader.
 *
 * WHY THIS IS SHARED. Button, OrgSwitcher, Search, SideNav and TopNav each
 * carry their own private copy of a `TokenRow`, five near-identical functions
 * that drifted: one resolves the variable on mount, one never resolves it, one
 * shows a swatch for a length token where a swatch means nothing. Widget, KPI
 * Tile and Dashboard are the three newest pages and had no listing at all,
 * which is the worse failure: a reader could see the component and not the
 * contract behind it.
 *
 * It RESOLVES each name against the live document rather than restating a hex
 * from the spec. A hand-copied hex in a story is a second source of truth that
 * nothing checks, and it goes stale the first time a token value moves in
 * Figma. Resolving means the row is wrong only if the token itself is wrong,
 * and an unknown name shows as "unresolved" instead of quietly rendering
 * nothing, which is how `--semantic-color-light-mode-*` survived a rename.
 */
import React, { useEffect, useState } from "react";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "'Red Hat Text', sans-serif";

/** Lengths, durations and easings have no colour, so a swatch would lie. */
const isColour = (name) => /-color-/.test(name);

function Row({ name, use }) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    setValue(v || "");
  }, [name]);

  const unresolved = value === "";
  return (
    <tr style={{ borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>
      <td style={{ padding: "6px 12px 6px 0", width: 40 }}>
        {isColour(name) ? (
          <span style={{ display: "block", width: 28, height: 28, borderRadius: 6,
            background: `var(${name})`,
            border: "1px solid var(--semantic-color-stroke-static-neutral-base)" }} />
        ) : null}
      </td>
      <td style={{ padding: "6px 12px 6px 0", fontFamily: MONO, fontSize: 12,
        color: "var(--semantic-color-foreground-static-neutral-bold)", whiteSpace: "nowrap" }}>
        {name}
      </td>
      <td style={{ padding: "6px 12px 6px 0", fontFamily: MONO, fontSize: 12, whiteSpace: "nowrap",
        color: unresolved
          ? "var(--semantic-color-foreground-static-negative-on-subtle)"
          : "var(--semantic-color-foreground-static-neutral-subtle)" }}>
        {value === null ? "" : unresolved ? "unresolved" : value}
      </td>
      <td style={{ padding: "6px 0", fontFamily: SANS, fontSize: 12,
        color: "var(--semantic-color-foreground-static-neutral-base)" }}>
        {use}
      </td>
    </tr>
  );
}

/**
 * @param {string} title     What this group of tokens is for.
 * @param {Array<[string,string]>} rows  [cssVariableName, what it is used for].
 */
export function TokenTable({ title, note, rows }) {
  return (
    <section style={{ padding: "var(--semantic-layout-units-padding-relaxed)",
      fontFamily: SANS, background: "var(--semantic-color-fill-surface-elevated)" }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600,
        color: "var(--semantic-color-foreground-static-neutral-strong)" }}>{title}</h3>
      {note && (
        <p style={{ margin: "0 0 12px", maxWidth: 760, fontSize: 13,
          color: "var(--semantic-color-foreground-static-neutral-base)" }}>{note}</p>
      )}
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-base)" }}>
            <th />
            <th style={{ textAlign: "left", padding: "0 12px 6px 0", fontSize: 11,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>Token</th>
            <th style={{ textAlign: "left", padding: "0 12px 6px 0", fontSize: 11,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>Resolved</th>
            <th style={{ textAlign: "left", padding: "0 0 6px", fontSize: 11,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>Where it is used</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, use]) => <Row key={name} name={name} use={use} />)}
        </tbody>
      </table>
    </section>
  );
}

/** Several groups on one page, which is how the token stories read best. */
export function TokenTables({ groups }) {
  return (
    <div style={{ display: "flex", flexDirection: "column",
      gap: "var(--semantic-layout-units-gap-base)",
      background: "var(--semantic-color-fill-surface-canvas)" }}>
      {groups.map((g) => <TokenTable key={g.title} {...g} />)}
    </div>
  );
}

export default TokenTable;
