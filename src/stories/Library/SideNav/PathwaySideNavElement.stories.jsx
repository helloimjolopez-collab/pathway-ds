/**
 * <pathway-sidenav> — the side nav as a custom element.
 *
 * These stories render the CUSTOM ELEMENT, not the React component. That is the
 * point: what a Radzen, Blazor or Angular team drops into their page is this
 * tag, and Storybook should show the same thing they will get rather than a
 * React stand-in that happens to look similar.
 *
 * The React stories live in SideNav.stories.jsx. Both render the same
 * implementation; components/sidenav/sidenav.jsx is the single source of truth
 * and the element wraps it.
 */
import React, { useEffect, useRef, useState } from "react";
import "../../../../components/sidenav/pathway-sidenav.js";

// Nav data as plain JSON, with Material Symbols ligature strings for icons.
// This is deliberately the JSON shape a server-rendered host would emit, not
// the React-component-icon shape the React stories use.
const ITEMS = [
  { id: "applications", label: "Applications", icon: "apps", children: [
    { id: "overview",  label: "Overview" },
    { id: "installed", label: "Installed" },
    { id: "scheduled", label: "Scheduled" },
  ]},
  { id: "enter",  label: "Enter",  icon: "note_add" },
  { id: "manage", label: "Manage", icon: "tune" },
  { id: "view",   label: "View",   icon: "visibility", children: [
    { id: "reports", label: "Reports" },
    { id: "tables",  label: "Tables" },
  ]},
  { id: "help",   label: "Help",   icon: "help" },
];

const frame = (children, height = 560) => (
  <div style={{ display: "flex", height, border: "0.5px solid var(--semantic-color-stroke-static-neutral-subtle)",
    borderRadius: "var(--semantic-layout-units-cornerradius-medium)", overflow: "hidden" }}>
    {children}
  </div>
);

/** Wraps the element so a story can pass objects as properties and hear events. */
function Element({ items = ITEMS, activeId, collapsed, hideCollapseButton, onNavigate, onCollapseChange, defaultExpanded }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.items = items;
    if (defaultExpanded) el.defaultExpanded = defaultExpanded;
    const nav = (e) => onNavigate && onNavigate(e.detail.id);
    const col = (e) => onCollapseChange && onCollapseChange(e.detail.collapsed);
    el.addEventListener("pathway-navigate", nav);
    el.addEventListener("pathway-collapse-change", col);
    return () => {
      el.removeEventListener("pathway-navigate", nav);
      el.removeEventListener("pathway-collapse-change", col);
    };
  }, [items, defaultExpanded, onNavigate, onCollapseChange]);

  return (
    <pathway-sidenav
      ref={ref}
      active-id={activeId}
      {...(collapsed ? { collapsed: "" } : {})}
      {...(hideCollapseButton ? { "hide-collapse-button": "" } : {})}
    />
  );
}

export default {
  title: "Library/SideNav/Custom Element",
  parameters: {
    docs: { description: { component:
      "The side nav as `<pathway-sidenav>`, a framework-agnostic custom element. " +
      "One HTML tag, no React on the host page, Shadow DOM for style isolation. " +
      "It wraps `components/sidenav/sidenav.jsx` rather than reimplementing it, so " +
      "there is no second implementation to drift." } },
  },
};

/** The element driven by properties and events, the way a JS host would use it. */
export const Playground = {
  render: () => {
    const [active, setActive] = useState("overview");
    const [log, setLog] = useState([]);
    const note = (s) => setLog((l) => [`${new Date().toLocaleTimeString()}  ${s}`, ...l].slice(0, 6));
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {frame(
          <>
            <Element
              items={ITEMS}
              activeId={active}
              defaultExpanded={{ applications: true }}
              onNavigate={(id) => { setActive(id); note(`pathway-navigate -> ${id}`); }}
              onCollapseChange={(c) => note(`pathway-collapse-change -> collapsed=${c}`)}
            />
            <div style={{ flex: 1, padding: 20, background: "var(--semantic-color-fill-surface-canvas)",
              fontFamily: "var(--semantic-type-family-brand), sans-serif" }}>
              <p style={{ margin: 0, fontSize: "var(--semantic-type-font-size-s)",
                color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
                Active: <code>{active}</code>
              </p>
            </div>
          </>
        )}
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11,
          color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>
          {log.length ? log.map((l) => <div key={l}>{l}</div>) : <div>Click an item, or collapse the rail.</div>}
        </div>
      </div>
    );
  },
};

/** Collapsed to the 72px rail. Hover a group to get the popover. */
export const Collapsed = {
  render: () => frame(
    <>
      <Element items={ITEMS} activeId="overview" collapsed />
      <div style={{ flex: 1, background: "var(--semantic-color-fill-surface-canvas)" }} />
    </>
  ),
};

/**
 * The reason Shadow DOM is here. Everything OUTSIDE the element is wrecked by
 * a host stylesheet that forces Comic Sans, magenta and dashed borders on `*`
 * with `!important`. The nav is untouched.
 */
export const SurvivesHostileHostCSS = {
  name: "Survives hostile host CSS",
  render: () => (
    <>
      <style>{`
        .pw-hostile .pw-host-content, .pw-hostile .pw-host-content * {
          font-family: "Comic Sans MS", cursive !important;
          background: #ff00ff !important;
          color: #00ff00 !important;
          border: 3px dashed red !important;
          letter-spacing: 3px !important;
        }
      `}</style>
      <div className="pw-hostile">
        {frame(
          <>
            <Element items={ITEMS} activeId="overview" defaultExpanded={{ applications: true }} />
            <div className="pw-host-content" style={{ flex: 1, padding: 20 }}>
              <h3>Host app content</h3>
              <p>
                This side is what a host stylesheet does to anything it can reach.
                The nav on the left renders through Shadow DOM, so it cannot.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  ),
};

/**
 * Driven entirely by HTML attributes, which is the Blazor and Radzen path: the
 * server writes the tag, no JS glue.
 */
export const AttributeDriven = {
  name: "Attribute driven (no JS glue)",
  render: () => {
    const host = useRef(null);
    useEffect(() => {
      if (host.current) {
        host.current.innerHTML =
          `<pathway-sidenav active-id="manage" items='${JSON.stringify(ITEMS)}'></pathway-sidenav>`;
      }
    }, []);
    return frame(
      <>
        <div ref={host} style={{ display: "contents" }} />
        <div style={{ flex: 1, background: "var(--semantic-color-fill-surface-canvas)" }} />
      </>
    );
  },
};
