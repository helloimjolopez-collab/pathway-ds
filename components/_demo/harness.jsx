/**
 * The demo harness every generated standalone demo shares.
 *
 * WHY THIS EXISTS. Each of the eight older components carries a hand-written
 * `<name>.html` that says, at the top of its script block, "Mirrors
 * components/<name>/<name>.jsx exactly. Keep the two in step." That is a second
 * implementation of a shipped component, maintained by hand, and the only thing
 * keeping it honest is somebody remembering. The token CSS in those files is
 * LINKED from src/tokens and so cannot drift; the component is copied and can.
 *
 * So the newer demos are generated instead: `scripts/build-demos.js` bundles the
 * REAL module with esbuild and writes an html that loads the bundle. There is
 * one implementation of the component, and a demo cannot fall behind it.
 *
 * This file is the page chrome around it: the title, the Light and Midnight
 * switch, and the viewport buttons. It knows nothing about any component.
 *
 * THE WIDTH BUTTONS LOAD THE PAGE IN AN IFRAME rather than narrowing a <main>.
 * That looks like over-engineering and is the only thing that works. Pathway's
 * responsiveness is media queries on the VIEWPORT, so constraining an element
 * to 390px leaves every query reporting desktop: the first version of this
 * harness did that, and the Dashboard sat in a 390px box still dividing itself
 * into 12 columns of 13.8px each. A button labelled "Mobile 390" that does not
 * put the component at a mobile breakpoint is a lie of the same kind as a story
 * labelled "Menu open" that renders a closed menu.
 *
 * So `?embed=1` renders the component alone, with no chrome, and the outer page
 * sizes an iframe to the chosen width. An iframe has its own viewport, so the
 * queries fire. Resizing the real browser window works in either mode, which is
 * the whole point of a standalone demo.
 */
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const U = (n) => `var(--semantic-layout-units-${n})`;
const C = (n) => `var(--semantic-color-${n})`;

/** The three widths the system has breakpoints for, plus unconstrained. */
export const WIDTHS = {
  Desktop: null,
  Tablet: 900,
  Mobile: 390,
};

/** True when this document is the inner frame: component only, no chrome. */
export const isEmbed = () =>
  typeof window !== "undefined" && new URLSearchParams(location.search).has("embed");

export function DemoChrome({ title, blurb, children, widths = WIDTHS }) {
  const [theme, setTheme] = useState("light");
  const [width, setWidth] = useState("Desktop");
  const embed = isEmbed();

  // The inner frame inherits the outer frame's theme through the query string,
  // because it is a separate document and cannot see the outer <html>.
  useEffect(() => {
    if (!embed) return;
    const t = new URLSearchParams(location.search).get("theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
  }, [embed]);

  // The themes are selected by an ancestor attribute, so the demo sets it on
  // <html> exactly as an application would. Nothing here re-declares a token.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const pill = (active) => ({
    appearance: "none", cursor: "pointer", fontFamily: "inherit",
    fontSize: "var(--semantic-type-font-size-xs)",
    letterSpacing: "var(--semantic-type-letter-spacing-spacious)",
    padding: `${U("padding-xxxtight")} ${U("padding-tight")}`,
    minHeight: 28,
    borderRadius: U("cornerradius-base"),
    border: `1px solid ${active ? C("stroke-action-primary-strong-rest") : C("stroke-static-neutral-base")}`,
    background: active ? C("fill-action-primary-subtle-rest") : C("fill-surface-elevated"),
    color: active ? C("foreground-action-primary-on-subtle-rest") : C("foreground-action-secondary-rest"),
  });

  const w = widths[width];

  /* The inner frame: the component on the page, nothing else. */
  if (embed) {
    return (
      <div style={{ minHeight: "100vh", background: C("fill-surface-canvas"),
        fontFamily: "'Red Hat Text', sans-serif", padding: U("padding-base") }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C("fill-surface-canvas"),
      fontFamily: "'Red Hat Text', sans-serif",
      padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-base") }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center",
        gap: U("gap-base"), justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: U("gap-xxtight"),
          minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: "var(--semantic-type-font-size-xl)",
            fontWeight: "var(--semantic-type-weight-bold)",
            color: C("foreground-static-neutral-bold") }}>{title}</h1>
          {blurb && (
            <p style={{ margin: 0, maxWidth: 820,
              fontSize: "var(--semantic-type-font-size-s)",
              color: C("foreground-static-neutral-base") }}>{blurb}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: U("gap-tight"), flexWrap: "wrap" }}>
          {Object.keys(widths).map((k) => (
            <button key={k} type="button" onClick={() => setWidth(k)}
              aria-pressed={width === k} style={pill(width === k)}>
              {k}{widths[k] ? ` ${widths[k]}` : ""}
            </button>
          ))}
          <span style={{ width: 1, background: C("stroke-static-neutral-base"),
            alignSelf: "stretch" }} />
          {["light", "midnight"].map((t) => (
            <button key={t} type="button" onClick={() => setTheme(t)}
              aria-pressed={theme === t} style={pill(theme === t)}>
              {t === "light" ? "Light" : "Midnight"}
            </button>
          ))}
        </div>
      </header>

      {/* Desktop renders the component in this document, so there is no iframe
          in the way of the thing most people came to look at. A narrower width
          loads the same page as an inner frame at that width, which is the only
          way its media queries see it. */}
      <main style={{ width: "100%", minWidth: 0 }}>
        {w ? (
          <iframe
            title={`${title} at ${w}px`}
            src={`?embed=1&theme=${theme}`}
            style={{ width: w, maxWidth: "100%", height: "80vh", display: "block",
              border: `1px dashed ${C("stroke-static-neutral-base")}`,
              borderRadius: U("cornerradius-base"),
              background: C("fill-surface-canvas") }}
          />
        ) : children}
      </main>
    </div>
  );
}

export function mount(node) {
  createRoot(document.getElementById("root")).render(node);
}
