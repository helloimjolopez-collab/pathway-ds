/**
 * KPI Tile's standalone demo. Imports the real module: see
 * components/_demo/harness.jsx for why the newer demos are generated rather
 * than hand-copied.
 */
import React, { useState } from "react";
import { DemoChrome, mount } from "../_demo/harness.jsx";
import { KpiTile, KPI_TILE_TYPES, KPI_TILE_SPECS } from "./kpi-tile.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;

function App() {
  const [bp, setBp] = useState("desktop");
  return (
    <DemoChrome
      title="KPI Tile"
      blurb={"All nine types, at both of Figma's breakpoints. Mobile is not a " +
             "narrower desktop: Icon 04 goes from 96 tall and horizontal to 146 " +
             "and stacked, and seven of the nine change height."}>
      <div style={{ display: "flex", flexDirection: "column", gap: U("gap-relaxed") }}>
        <div style={{ display: "flex", gap: U("gap-tight") }}>
          {["desktop", "mobile"].map((b) => (
            <button key={b} type="button" onClick={() => setBp(b)} aria-pressed={bp === b}
              style={{ appearance: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: "var(--semantic-type-font-size-xs)", minHeight: 28,
                padding: `${U("padding-xxxtight")} ${U("padding-tight")}`,
                borderRadius: U("cornerradius-base"),
                border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
                background: bp === b
                  ? "var(--semantic-color-fill-action-primary-subtle-rest)"
                  : "var(--semantic-color-fill-surface-elevated)",
                color: bp === b
                  ? "var(--semantic-color-foreground-action-primary-on-subtle-rest)"
                  : "var(--semantic-color-foreground-action-secondary-rest)" }}>
              breakpoint={b}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: U("gap-relaxed"),
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {KPI_TILE_TYPES.map((t) => {
            const s = KPI_TILE_SPECS[t];
            return (
              <div key={t} style={{ display: "flex", flexDirection: "column",
                gap: U("gap-xxtight"), minWidth: 0 }}>
                <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
                  color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
                  {`${t} · ${bp === "mobile" ? s.hMobile : s.h} tall`}
                </code>
                <KpiTile type={t} breakpoint={bp} heading="Views 24 hours"
                  value="2,000" changeValue="100%" direction="up" />
              </div>
            );
          })}
        </div>
      </div>
    </DemoChrome>
  );
}

mount(<App />);
