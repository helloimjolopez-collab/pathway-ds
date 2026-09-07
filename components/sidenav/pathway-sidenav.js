/**
 * <pathway-sidenav> — the Pathway side nav as a framework-agnostic custom element.
 *
 * WHY THIS EXISTS
 *
 * Tribes are on Radzen, Blazor, Angular, React and older libraries. Handing each
 * one a React component means they reimplement it against their own library, and
 * every reimplementation drifts. A custom element is just an HTML tag, so every
 * one of those stacks can consume the real component instead of approximating it:
 *
 *   <link rel="stylesheet" href=".../primitives.css">
 *   <link rel="stylesheet" href=".../themes/light.css">
 *   <script type="module" src=".../pathway-sidenav.js"></script>
 *
 *   <pathway-sidenav active-id="dashboard"></pathway-sidenav>
 *
 * WHY SHADOW DOM
 *
 * Style isolation runs both ways: the host's CSS reset cannot reach in and the
 * nav's styles cannot leak out. That is the actual problem a team hits when they
 * drop a design-system component into an app that already has a component
 * library. CSS custom properties DO inherit through the shadow boundary, which is
 * what makes this work at all: the token contract is 800+ custom properties on
 * :root, so they reach inside without being re-declared. Fonts are
 * document-scoped too, so Red Hat Text and Material Symbols load once on the
 * host page.
 *
 * WHY IT WRAPS THE REACT MODULE RATHER THAN REIMPLEMENTING
 *
 * components/sidenav/sidenav.jsx stays the single source of truth. A second
 * hand-written implementation would drift from it within weeks, which is the
 * problem this is meant to solve. The cost is React inside the bundle, which for
 * one shell component is a fair trade; a Lit rewrite would shed that weight but
 * would be that second implementation.
 *
 * TWO THINGS TO KNOW
 *
 * The tooltip and the collapsed-group popover render through React portals to
 * document.body, so those two overlays sit OUTSIDE the shadow root. Tokens still
 * resolve for them (they inherit from :root), but a host page with very
 * aggressive global CSS could reach them. They are the only two exceptions.
 *
 * Nav data can arrive either way: set `items` / `sections` / `listSection` as a
 * PROPERTY when the host is JS-capable, or as a JSON string ATTRIBUTE when it is
 * a server-rendered template. Blazor and Radzen generally want the attribute.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { SideNav } from "./sidenav.jsx";

const BOOL_ATTRS = { collapsed: "collapsed", "hide-collapse-button": "hideCollapseButton" };

/**
 * Styles that have to live INSIDE the shadow root.
 *
 * Custom properties and @font-face are both document-scoped, so the token
 * contract and the font FILES reach in on their own. A CSS *class* does not.
 * Google's stylesheet defines `.material-symbols-rounded` in the document, so
 * without this the icon spans render their ligature as literal text: "apps",
 * "tune", "visibility". The font is there; the rule that switches the family on
 * is not. This is the one piece of style plumbing a shadow root needs.
 */
const SHADOW_CSS = `
:host { display: block; height: 100%; }
:host([hidden]) { display: none; }
.material-symbols-rounded {
  font-family: 'Material Symbols Rounded';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}`;

const parseJSON = (raw, name) => {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw);
  } catch (err) {
    // A malformed attribute must say so loudly. Rendering an empty nav and
    // staying silent is how a consumer loses an afternoon.
    console.error(`<pathway-sidenav>: the "${name}" attribute is not valid JSON.`, err);
    return undefined;
  }
};

export class PathwaySideNav extends HTMLElement {
  static get observedAttributes() {
    return ["active-id", "collapsed", "hide-collapse-button",
            "items", "sections", "list-section", "default-expanded"];
  }

  constructor() {
    super();
    this._props = {};
    this._reactRoot = null;
  }

  // Property setters, so a JS host can hand over real objects and skip JSON.
  set items(v) { this._props.items = v; this._render(); }
  get items() { return this._props.items; }
  set sections(v) { this._props.sections = v; this._render(); }
  get sections() { return this._props.sections; }
  set listSection(v) { this._props.listSection = v; this._render(); }
  get listSection() { return this._props.listSection; }
  set defaultExpanded(v) { this._props.defaultExpanded = v; this._render(); }
  get defaultExpanded() { return this._props.defaultExpanded; }
  // These two getters must fall back to the attribute. The component collapses
  // itself and we reflect that to the attribute, so a host reading
  // `nav.collapsed` right after the user clicked collapse would otherwise be
  // told false while the DOM says otherwise.
  set activeId(v) { this._props.activeId = v; this._render(); }
  get activeId() {
    if ("activeId" in this._props) return this._props.activeId;
    return this.getAttribute("active-id") ?? undefined;
  }
  set collapsed(v) { this._props.collapsed = !!v; this._render(); }
  get collapsed() {
    if ("collapsed" in this._props) return !!this._props.collapsed;
    const a = this.getAttribute("collapsed");
    return a !== null && a !== "false" && a !== "0";
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      // The element is a block by default and the nav owns its own width, so the
      // host does not have to know anything about sizing to place it.
      const style = document.createElement("style");
      style.textContent = SHADOW_CSS;
      root.appendChild(style);
      this._mount = document.createElement("div");
      this._mount.style.height = "100%";
      root.appendChild(this._mount);
      this._reactRoot = createRoot(this._mount);
    }
    this._render();
  }

  disconnectedCallback() {
    // Unmount asynchronously: React warns if a root is unmounted while it is
    // rendering, which happens when a host framework moves the node.
    const r = this._reactRoot;
    this._reactRoot = null;
    if (r) Promise.resolve().then(() => r.unmount());
  }

  attributeChangedCallback() {
    this._render();
  }

  _readAttributes() {
    const attrProps = {};
    if (this.hasAttribute("active-id")) attrProps.activeId = this.getAttribute("active-id");
    for (const [attr, prop] of Object.entries(BOOL_ATTRS)) {
      if (this.hasAttribute(attr)) {
        const v = this.getAttribute(attr);
        attrProps[prop] = v !== "false" && v !== "0";
      }
    }
    for (const attr of ["items", "sections", "list-section", "default-expanded"]) {
      if (!this.hasAttribute(attr)) continue;
      const prop = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const parsed = parseJSON(this.getAttribute(attr), attr);
      if (parsed !== undefined) attrProps[prop] = parsed;
    }
    return attrProps;
  }

  _emit(name, detail) {
    // composed:true so the event crosses the shadow boundary and a host can
    // listen on the element itself, which is what every framework expects.
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  _render() {
    if (!this._reactRoot) return;
    // Properties win over attributes: a JS host that set a real object should not
    // have it overwritten by a stale JSON attribute.
    const props = { ...this._readAttributes(), ...this._props };

    this._reactRoot.render(
      React.createElement(SideNav, {
        ...props,
        onNavigate: (id) => {
          this._emit("pathway-navigate", { id });
          if (typeof this.onnavigate === "function") this.onnavigate({ id });
        },
        onCollapseChange: (next) => {
          // Reflect to the attribute so the host's own state can follow the DOM.
          if (next) this.setAttribute("collapsed", "");
          else this.removeAttribute("collapsed");
          this._emit("pathway-collapse-change", { collapsed: !!next });
        },
      })
    );
  }
}

if (!customElements.get("pathway-sidenav")) {
  customElements.define("pathway-sidenav", PathwaySideNav);
}

export default PathwaySideNav;
