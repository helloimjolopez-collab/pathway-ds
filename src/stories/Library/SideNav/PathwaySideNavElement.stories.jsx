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
        /* Targets the WHOLE subtree, including the nav.
           This selector used to be scoped to .pw-host-content, so it never
           pointed at the nav and the claim below was never actually tested.
           Pointed at everything, it found a real leak: Shadow DOM blocks
           selectors from reaching in, but not INHERITANCE. A rule matching the
           <pathway-sidenav> element itself sets inherited properties on it, and
           those flow through the boundary - the nav's items rendered in Comic
           Sans, green, at 3px tracking, while background and border stayed put
           because those are not inherited. The component now carries an
           inheritance firewall on its shadow-root wrapper, which is what this
           story verifies. */
        .pw-hostile, .pw-hostile * {
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
                The hostile rules target this whole subtree, the nav included, and
                the nav still renders correctly.
              </p>
              <p>
                Two things make that true, and only one of them is Shadow DOM.
                Shadow DOM stops the host's <em>selectors</em> matching anything
                inside the nav, which is why the magenta and the dashed borders
                stop at the boundary. It does <strong>not</strong> stop
                <em>inheritance</em>: font, colour and letter-spacing set on the{" "}
                <code>&lt;pathway-sidenav&gt;</code> element itself flow straight
                through. The component blocks that separately, with an explicit
                reset of inherited properties on its shadow-root wrapper.
              </p>
              <p>
                Slot content is the deliberate exception. Those nodes stay in the
                host document so the host keeps owning them, styling included.
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

export const Slots = {
  name: "Slots (header, body, footer)",
  render: () => {
    const host = useRef(null);
    useEffect(() => {
      if (!host.current) return;
      // Written as an HTML STRING on purpose. The point of this story is that a
      // team with no React puts slot content in with ordinary markup, so
      // building it with JSX here would demonstrate the wrong thing.
      host.current.innerHTML = `
        <style>
          /* Slotted nodes live in the HOST document, so the host styles them.
             That is also how a host adapts its own slot content to the 72px
             rail: \`collapsed\` is reflected back as an attribute, so a plain
             CSS selector is enough - no JS, no listener, no state to sync. */
          pathway-sidenav[collapsed] .slot-footer-label { display: none; }
          pathway-sidenav[collapsed] [slot="footer"] { justify-content: center; }
        </style>
        <pathway-sidenav active-id="manage" items='${JSON.stringify(ITEMS)}'>
          <span slot="header" style="font-weight:600;">Giving</span>
          <button slot="footer" type="button"
            style="display:flex; align-items:center; gap:8px; width:100%; padding:8px;
                   border:0; border-radius:8px; background:transparent; cursor:pointer;
                   font:inherit; color:inherit; text-align:left;">
            <span class="material-symbols-rounded" style="font-size:16px;">support_agent</span>
            <span class="slot-footer-label">Get support</span>
          </button>
        </pathway-sidenav>`;
    }, []);
    return frame(
      <>
        <div ref={host} style={{ display: "contents" }} />
        <div style={{ flex: 1, background: "var(--semantic-color-fill-surface-canvas)" }} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Three insertion points, mirroring the slot structure in Figma. **`header`** sits " +
          "after the collapse toggle and is hidden on the 72px rail, which is only wide enough " +
          "for a centred icon. **Unnamed** children scroll with the item list. **`footer`** is " +
          "pinned below the scroll region and only draws its divider when it has content.\n\n" +
          "Why slots exist at all: the `items` array already expresses anything item-shaped, so " +
          "ten modules share one component by passing ten different arrays rather than forking " +
          "ten navs. What `items` cannot express is a module-specific widget - a usage meter, a " +
          "support button, a badge component a team already owns. Without a slot, a team needing " +
          "one of those has exactly one option, which is to rebuild the nav. That is the drift " +
          "this component exists to prevent, so the escape hatch belongs inside it.\n\n" +
          "Slotted nodes stay in the host document. The host's CSS and framework keep owning " +
          "them, which is what lets a Blazor or Radzen team drop *their* component into the " +
          "footer and have it stay theirs. The corollary is that Shadow DOM does not protect " +
          "slot content from host CSS - see the hostile-CSS story for where the boundary " +
          "actually falls.",
      },
    },
  },
};
