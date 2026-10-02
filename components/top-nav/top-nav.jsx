/**
 * TopNav.Global — Pathway Design System
 *
 * Importable React component module. Source of truth for the TopNav.Global
 * implementation; the standalone demo (top-nav.html) and Storybook stories
 * both consume this.
 *
 * Spec:  components/top-nav/top-nav-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508
 */

import React, { useState, useEffect, useRef } from "react";

// TopNav.Search is the canonical nested search control. Import it — never
// reimplement it here. (See CLAUDE.md §10.1 "import, don't reinvent": the prior
// in-file duplicate drifted to hardcoded hex and the wrong token mode.)
import { TopNavSearch, SearchInput } from "../search/search.jsx";
// The OrgSwitcher "Open" dropdown lives in the org-switcher component (Figma
// node 40007336:9453). TopNav renders it when the org trigger is open.
import { OrgSwitcherPanel, DEMO_ORGS } from "../org-switcher/org-switcher.jsx";
import { ModuleIcon, MODULE_LABELS, MODULES } from "../module-icon/module-icon.jsx";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
// Bound to live semantic CSS variables (CLAUDE.md §6). The TopNav bar is a dark
// brand-blue surface, so every CONTROL on it resolves through the DARK-MODE token
// set (tertiary / primaryinverse / mono). The brand bg, the accent avatar, and the
// white dropdown panels use the LIGHT-MODE set. Each var() carries the previously
// hand-copied hex as a fallback, so rendering is unchanged if a var is unavailable;
// values were verified against get_variable_defs on Figma node 40007067:5284.
// Both helpers emit the MODELESS name. The mode is no longer baked into the
// property — it comes from the nearest [data-theme] ancestor, which is why the bar
// carries data-theme="midnight" and the dropdown panels carry data-theme="light".
// SCD and SCL are kept as separate names purely to document INTENT at each call
// site: SCD marks "this sits on the dark bar", SCL marks "this sits on a light
// panel". They resolve identically; the wrapper does the work.
// MOTION THE COMPONENT OWNS. The dropdown keyframe tnDropIn is defined in the
// STORY file, not here, which is why the search takeover had no motion at all:
// nothing had ever defined one for it, and a component cannot rely on its
// consumer to supply a keyframe it needs. Reported 2026-10-02.
//
// The bar EXPANDS from the control it replaces. clip-path reveals it leftward
// from the right-hand edge, where the collapsed search icon sits, so the field
// is uncovered rather than slid into place. Nothing inside translates or
// scales, so the placeholder and the back arrow stay sharp for the whole
// transition, which a scaleX would smear. The inset starts at the collapsed
// control's own width, 48, so the reveal begins exactly where the icon was.
if (typeof document !== "undefined" && !document.getElementById("pds-topnav-motion")) {
  const el = document.createElement("style");
  el.id = "pds-topnav-motion";
  el.textContent =
    "@keyframes tnSearchExpand{" +
      "from{clip-path:inset(0 0 0 calc(100% - 48px));opacity:.6}" +
      "to{clip-path:inset(0 0 0 0);opacity:1}}" +
    "@media (prefers-reduced-motion: reduce){" +
      "@keyframes tnSearchExpand{from{clip-path:inset(0);opacity:1}to{clip-path:inset(0);opacity:1}}}";
  document.head.appendChild(el);
}

const TOK = (p) => `var(--semantic-color-${p})`;
const SCD = TOK;   // on the dark bar
const SCL = TOK;   // on a light panel
// Layout helpers. `r` reads Responsive: Layout, the only collection with
// breakpoint modes: layout-responsive.css emits ONE property name and switches
// its value by media query, so the chrome's padding no longer needs a JS
// breakpoint branch. `u` reads the single-valued semantic scale.
const r = (name) => `var(--responsive-layout-${name})`;
const u = (name) => `var(--semantic-layout-units-${name})`;
// Contextual: Layout & Units. TopNav/Height lives HERE, not in Responsive:
// Layout, because the bar is the same height at every breakpoint — only its
// padding and gap change. navH used to read the height through the RESPONSIVE
// helper, asking for a property that no emitted file declares. The two-argument
// helper form hid it, because the reference checker skips a call it cannot
// evaluate statically: the height resolved to a hard-coded 60px fallback for as
// long as that fallback existed, and would have painted nothing the moment it
// was removed. Corrected 2026-09-30 while removing the fallbacks.
const c = (name) => `var(--contextual-layout-units-${name})`;
export const T = {
  navBg:          SCL("fill-surface-chrome"),
  // GHOST IS THIS BAR'S FAMILY. Everything that sits on the brand chrome and
  // answers a pointer is Action/Ghost: the org switcher, the module switcher,
  // the collapsed search, the side nav control, the action icons, the avatar
  // button. All of it was Action/Primary/Subtle, which is a family for LIGHT
  // surfaces, so the whole bar was quietly wearing the wrong tier. Reported
  // 2026-10-02. Measured against Figma the same day:
  //
  //   Fill/Action/Ghost/Rest      #b6c6ec @  8%
  //   Fill/Action/Ghost/Hover     #b6c6ec @ 16%
  //   Fill/Action/Ghost/Pressed   #22386b @ 70%
  //   Stroke/Action/Ghost/Rest    #b6c6ec @ 36%
  //   Stroke/Action/Ghost/Hover   #b6c6ec @ 50%
  //   Stroke/Action/Ghost/Pressed #b6c6ec @ 70%
  //
  // Ghost is the right family here for the reason it is the WRONG family on a
  // light page: its foreground is near-white in both modes, which is exactly
  // what a control on a permanently dark bar needs.
  //
  // The AVATAR is the single exception and stays Action/Primary/Subtle: it is a
  // filled identity chip, not a ghost control. See avatarBg/avatarText below.
  //
  // THERE IS NO RESTING FILL on the org switcher or the module switcher. Figma's
  // State=Base has no fill on Container.Main at all, for either of them; the
  // fill arrives on Hover and stays through Pressed and Open. The org switcher
  // does carry a resting STROKE; the module switcher carries nothing at rest.
  // The collapsed search is different again: it is the one control with a
  // resting ghost fill, because it reads as a field rather than a label.
  orgStroke:        SCD("stroke-action-ghost-rest"),
  orgStrokeHover:   SCD("stroke-action-ghost-hover"),
  orgStrokePressed: SCD("stroke-action-ghost-pressed"),
  searchFill:       SCD("fill-action-ghost-rest"),
  controlHover:     SCD("fill-action-ghost-hover"),
  controlPressed:   SCD("fill-action-ghost-pressed"),
  noLogoBg:       SCD("fill-action-secondary-rest"),
  // FOREGROUNDS ARE GHOST TOO. Every glyph and label on the bar is
  // Foreground/Action/Ghost: #e2e9f7 rest, #eef2fb hover, #f9fafd pressed in
  // Light, and #e8eafe / #f0f1ff / #f8f9ff in Midnight. Reported 2026-10-02.
  //
  // They were Foreground/Static/Neutral/Base and /Bold. On screen that looked
  // acceptable, which is exactly why it survived: the bar carries
  // data-theme="midnight" permanently, and inside a midnight region the neutral
  // ladder resolves LIGHT (base is #e8eafe), so a near-black Light-mode value
  // came out near-white by accident. The colour was right by side effect and the
  // token was wrong on its face. Ghost names the thing directly: a control
  // foreground for a dark, on-brand surface, near-white in BOTH modes, so it no
  // longer depends on the data-theme trick to be legible.
  //
  // Before that it was foreground-static-neutral-MONO, which is an inversion
  // anchor rather than a rung: #ffffff in Light and #181b2b in Midnight, so the
  // label, the notification icons and the more-actions icon were all painting
  // #181b2b on #2d4889. It went unnoticed because the one element anybody
  // looked at, the Home module mark, was a hand-drawn SVG with fill="white"
  // baked in, so exactly one thing on the bar was legible and it was legible
  // for the wrong reason.
  //
  // Code Connect does not protect against any of this: it publishes a code
  // snippet from this repo into Figma's dev panel, one way, and never compares
  // a token value in the file against a token value in the design.
  monoBase:       SCD("foreground-action-ghost-rest"),
  monoHover:      SCD("foreground-action-ghost-hover"),
  monoPressed:    SCD("foreground-action-ghost-pressed"),
  // Org switcher label and chevron. Ghost has no weight axis, so the label's
  // emphasis comes from font-weight at the call site, not from a bolder colour.
  orgText:        SCD("foreground-action-ghost-rest"),
  orgChevron:     SCD("foreground-action-ghost-rest"),
  // SubOrgName, the campus line. Figma binds Foreground/Static/Neutral/Mono
  // here rather than a Ghost rung, so it stays put while OrgName tracks hover.
  // Mono is safe on this bar now that the bar renders Light, where it is
  // #ffffff; it would be wrong the moment anything inverted the bar, which is
  // recorded in the manifest as a Figma-side fragility rather than copied as a
  // pattern.
  orgSubText:     SCD("foreground-static-neutral-mono"),
  avatarBg:       SCD("fill-action-primary-subtle-rest"),
  avatarText:     SCD("foreground-action-primary-on-subtle-rest"),
  // White dropdown-menu surface — tracks fill-neutral-light (now warm-neutral-0).
  panelBg:        SCL("fill-static-neutral-faint"),
  activeItem:     SCL("fill-action-primary-subtle-rest"),
  itemText:       SCL("foreground-static-neutral-bold"),
  itemTextBase:   SCL("foreground-static-neutral-base"),
  itemMeta:       SCL("foreground-static-neutral-base"),
  signOut:        SCL("foreground-action-status-negative-on-subtle-rest"),
  // Token gaps (no semantic token exists yet — flagged P2 in the pipeline report):
  panelBorder:    SCL("stroke-static-neutral-base"),
  // The dropdown panels are a LIFT, and Elevation already encodes the whole
  // shadow per theme. The two-layer rgba stack it replaces was a light-mode
  // value that stayed light-mode on a dark surface.
  panelShadow:    "var(--elevation-lift)",
  panelDivider:   SCL("stroke-static-neutral-faint"),
};

// ─── LAYOUT VALUES ─────────────────────────────────────────────────────────────
export const L = {
  // TopNav is chrome that DOES change across breakpoints, so its padding, height
  // and gap live in Responsive: Layout and resolve by media query. One name each,
  // no JS branch. Horizontal padding is 16 / 12 / 8 desktop / tablet / mobile,
  // measured from Container.Main in Figma; vertical is 6 and the gap 8 at every
  // breakpoint. Before 2026-09-17 these were six hardcoded numbers here, and the
  // tablet height said 54 while the token said 56.
  navPadH:     r("topnav-padding-horizontal"),
  navPadV:     r("topnav-padding-vertical"),
  navH:        c("topnav-height"),
  navGap:      r("topnav-gap-horizontal"),
  deskOrgMax: 316, mobOrgMax: 120,
  touchTarget: 48, modInnerH: 36,
  orgAvatarNav: 20, orgAvatarSm: 24, orgAvatarPanel: 32,
  searchPill: 32, avatarSize: 32,
  // ICON GEOMETRY, read off the leaf nodes of Figma TopNav.Global 40007067:6508
  // on 2026-10-02 rather than inferred from container padding:
  //   ModuleSwitcher Container.RowEnd       20x20 box, expand_more  12x12
  //   Org Switcher   Container.RowEnd       24x24 box, expand_more  12x12
  //   TopNav.Actions Container.Icon         28x28 box, glyph        14x14
  //   TopNav.Search  Container.Icon         32x32 box, search       16x16
  // The chevron glyph is the SAME 12 in both switchers; only the box differs,
  // which is why one constant serves both.
  // Org Switcher Container.Main padding, Figma 6,6,6,12.
  orgPadV: u("padding-xxtight"),        // 6
  orgPadL: u("padding-tight"),          // 12
  orgPadMobileH: u("padding-xxxxtight"),// 2
  chevronGlyph: 12,
  modChevronBox: 20,
  orgChevronBox: 24,
  actionIconBox: 28, actionIconGlyph: 14,
  // Figma's Action Icon is 44, not the bar's 48. It is the one control on the
  // bar whose touch target is the AA minimum rather than the nav's own height.
  actionTarget: u("accessibility-touch-target-aa-width"),
  // The search takeover's back arrow. AA touch target (44) rather than the
  // nav's own 48, because it sits inside the bar's padding and 48 would crowd
  // the field; the glyph is sized independently and centred in the target.
  takeoverExit:      u("accessibility-touch-target-aa-width"),
  takeoverExitGlyph: 24,
  radius:      u("cornerradius-base"),
  radiusSm:    u("cornerradius-small"),
};

// ─── ABBREVIATION UTILITIES ────────────────────────────────────────────────────
const SKIP_WORDS = new Set(["the","a","an","of","in","at","for","and","or","but"]);

export function abbreviateOrg(name) {
  if (!name) return "???";
  const sig = name.replace(/-/g," ").split(/\s+/).filter(w => !SKIP_WORDS.has(w.toLowerCase()));
  if (sig.length >= 3) return (sig[0][0]+sig[1][0]+sig[2][0]).toUpperCase();
  if (sig.length === 2) return (sig[0][0]+sig[1][0]+sig[1][0]).toUpperCase();
  return sig[0].slice(0,3).toUpperCase();
}

const PLACE_SUFFIXES = [
  "ville","field","burg","burgh","berg","town","port","ford",
  "wood","land","dale","view","gate","bridge","worth","shire",
];

export function abbreviateCampus(campus) {
  if (!campus) return "";
  const sig = campus.replace(/-/g," ").split(/\s+/).filter(w => !SKIP_WORDS.has(w.toLowerCase()));
  if (!sig.length) return campus.slice(0,2).toUpperCase();
  if (sig.length >= 2) return (sig[0][0]+sig[1][0]).toUpperCase();
  const w = sig[0], wl = w.toLowerCase();
  for (const sfx of PLACE_SUFFIXES) {
    if (wl.endsWith(sfx) && w.length > sfx.length+1) return (w[0]+sfx[0]).toUpperCase();
  }
  return (w[0]+w[w.length-1]).toUpperCase();
}

export function mobileLabel(orgName, campusName) {
  const org = abbreviateOrg(orgName);
  return campusName ? `${org} | ${abbreviateCampus(campusName)}` : org;
}

// ─── FIGMA CUSTOM SVG ICONS ────────────────────────────────────────────────────
// These are custom Figma-exported SVG paths. Do NOT replace with Material Symbols.
// Source: get_design_context on TopNav.Global desktop/tablet/mobile + no-logo variant.

// Module=Home, Style=Flat, Color=White — node I40007067:5241;40006803:50605;40006853:34204
/**
 * @deprecated Use `<ModuleIcon module="home" />`.
 *
 * Was a hand-drawn 44x44 path traced from Module=Home, Style=Flat, Color=White,
 * carried here because the repo had no module artwork. Module.Icon now ships all
 * twelve marks from the Figma component set, so keeping a second copy of one of
 * them would be keeping a copy that drifts. Delegates rather than being deleted
 * outright, because it is an exported name.
 */
export function HomeModuleIcon({ size = 22 }) {
  return <ModuleIcon module="home" size={size} color="mono" />;
}

/**
 * Org avatar placeholder shown when an org has no logo on file.
 * Figma: church icon, node 40007243:73426 — positioned at inset 4.17% 8.33% 8.33% 8.33%
 * within the 16px inner avatar frame.
 */
export function OrgAvatarPlaceholder() {
  return (
    <div style={{ position: "absolute", inset: "4.17% 8.33% 8.33% 8.33%" }}>
      <svg
        viewBox="0 0 13.3333 14" width="100%" height="100%"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" style={{ display: "block" }}
      >
        <path d={CHURCH_ICON_PATH} fill="white" fillOpacity="0.7" />
      </svg>
    </div>
  );
}

// ─── MATERIAL SYMBOL HELPER ────────────────────────────────────────────────────
// Used for all icons EXCEPT the custom Figma SVGs above.
function Icon({ name, size = 20, style: extraStyle }) {
  return (
    <span
      className="material-symbols-rounded"
      style={{
        fontSize: size, lineHeight: 1, display: "block",
        userSelect: "none",
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
        ...extraStyle,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ─── MODULE DATA ───────────────────────────────────────────────────────────────
/**
 * The modules, in Figma's Module.Icon variant order.
 *
 * This list used to name five Material Symbols (home, group, volunteer_activism,
 * event, mail) for five entries, one of which ("events") is not an Amplify
 * module at all. So the switcher showed generic glyphs where the design has
 * bespoke marks, and seven modules were missing entirely.
 *
 * There is no `icon` field any more. The mark is the module: ModuleIcon takes
 * the id directly, so there is nothing to keep in step.
 */
export const DEFAULT_MODULES = MODULES.map((id) => ({ id, label: MODULE_LABELS[id] }));

// ─── TopNavActions ─────────────────────────────────────────────────────────────
export function TopNavActions({ breakpoint = "desktop", onNotifications, onMore }) {
  const [hov0, setHov0]       = useState(false);
  const [hov1, setHov1]       = useState(false);
  const [hovMore, setHovMore] = useState(false);

  // Figma TopNav.Actions, node 40007082:7313, Amplify section, read 2026-10-02:
  //
  //   component        132x48  horizontal, gap 0
  //   Action Icon      44x44   three of them, 3 x 44 = 132
  //   Container.Icon   28x28   r=8   rest no fill, hover Fill/Action/Ghost/Hover,
  //                                  pressed Fill/Action/Ghost/Pressed
  //   glyph            14x14   rest Foreground/Action/Ghost/Rest,
  //                                  hover Foreground/Action/Ghost/Hover
  //
  // THE HOVER FILL BELONGS ON THE 28px BOX, not on the touch target. It was on
  // a 48px button, so the hover state painted a box nearly twice the size of
  // the one in the design. The target is also 44 in Figma, not 48.
  const btnStyle = () => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "100%", height: "100%", padding: 0,
    background: "transparent", border: "none", cursor: "pointer",
  });
  // The box that actually carries the state.
  const iconBoxStyle = (hov) => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    width: L.actionIconBox, height: L.actionIconBox, borderRadius: L.radius,
    background: hov ? T.controlHover : "transparent",
    transition: "background var(--motion-duration-2) var(--motion-easing-standard)",
  });

  if (breakpoint === "desktop") {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {[
          { hov: hov0, setHov: setHov0, label: "Notifications" },
          { hov: hov1, setHov: setHov1, label: "Alerts" },
        ].map(({ hov, setHov, label }, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: L.actionTarget, minWidth: L.actionTarget, padding: 0}}>
            <button
              onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              onClick={onNotifications} aria-label={label}
              style={btnStyle()}
            >
              <span style={iconBoxStyle(hov)}>
                {/* The glyph tracks hover too: Figma moves it from
                    Foreground/Action/Ghost/Rest to /Hover. It used to stay put. */}
                <Icon name="notifications" size={L.actionIconGlyph}
                  style={{ color: hov ? T.monoHover : T.monoBase,
                    transition: "color var(--motion-duration-2) var(--motion-easing-standard)" }} />
              </span>
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: L.actionTarget, minWidth: L.actionTarget }}>
      <button
        onMouseEnter={() => setHovMore(true)} onMouseLeave={() => setHovMore(false)}
        onClick={onMore} aria-label="More actions"
        style={btnStyle()}
      >
        <span style={iconBoxStyle(hovMore)}>
          <Icon name="more_vert" size={L.actionIconGlyph}
            style={{ color: hovMore ? T.monoHover : T.monoBase,
              transition: "color var(--motion-duration-2) var(--motion-easing-standard)" }} />
        </span>
      </button>
    </div>
  );
}

// ─── TopNavProfile ─────────────────────────────────────────────────────────────
export function TopNavProfile({ user, open, onToggle, mobile = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center",
      justifyContent: "center", minHeight: L.touchTarget, minWidth: L.touchTarget, padding: "var(--semantic-layout-units-padding-xxxxtight)"}}>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        aria-haspopup="true" aria-expanded={open}
        aria-label={`Account — ${user.name}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44,
          background: open ? T.controlPressed : hov ? T.controlHover : "transparent",
          border: "none", borderRadius: "50%", cursor: "pointer", padding: "var(--semantic-layout-units-padding-xxtight)",
          transition: "background var(--motion-duration-2) var(--motion-easing-standard)",
        }}
      >
        <div style={{
          width: L.avatarSize, height: L.avatarSize, borderRadius: "50%",
          background: T.avatarBg, display: "flex", alignItems: "center", justifyContent: "center",
          // Desktop/Tablet: Text/Body/Small/Semibold 14px/600
          // Mobile: Text/Supporting/Small/Semibold 11px/600 (Figma)
          fontSize: mobile ? 11 : 14, fontWeight: 600, letterSpacing: "var(--semantic-type-letter-spacing-spacious)",
          color: T.avatarText, lineHeight: 1, flexShrink: 0, overflow: "hidden",
        }}>
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : user.initials
          }
        </div>
      </button>
    </div>
  );
}

// ─── OrgSwitcher ──────────────────────────────────────────────────────────────
export function OrgSwitcher({ org, open, onToggle, mobile = false }) {
  const [hov, setHov]           = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const hasLogo = org.logoUrl && !imgFailed;

  // FIGMA HAS TWO TEXT NODES, NOT ONE STRING. OrgName takes
  // Foreground/Action/Ghost/* and follows the hover state; SubOrgName takes
  // Foreground/Static/Neutral/Mono and does not. Concatenating them into
  // "name | campus" gave the campus the org name's colour and made it track
  // hover, which the design does not. Read off set 40006819:14583, 2026-10-02.
  //
  // Mobile still abbreviates into one string, because the mobile variant has a
  // single label with no room for two.
  const label = mobile ? mobileLabel(org.name, org.campus) : org.name;
  const subLabel = mobile ? null : (org.campus || null);

  // Desktop/Tablet: Label/Button/S — 14px/500/20px
  // Mobile: Label/Button/XS — 12px/500/18px (Figma annotation)
  const labelStyle = mobile
    ? { fontSize: "var(--semantic-type-font-size-xs)", fontWeight: 500, lineHeight: "var(--semantic-type-line-height-xs-single)", letterSpacing: "var(--semantic-type-letter-spacing-spacious)"}
    : { fontSize: "var(--semantic-type-font-size-s)", fontWeight: 500, lineHeight: "var(--semantic-type-line-height-s-single)", letterSpacing: "var(--semantic-type-letter-spacing-spacious)"};

  return (
    <div style={{ position: "relative", padding: mobile ? "4px 2px" : 4,
      maxWidth: mobile ? L.mobOrgMax : L.deskOrgMax }}>
      <button
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={onToggle}
        aria-haspopup="true" aria-expanded={open}
        aria-label={`Switch organisation — ${org.name}${org.campus ? ", "+org.campus : ""}`}
        style={{
          display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-xxtight)",
          minHeight: 36,
          // Figma OrgSwitcher Container.Main: pl-12 pr-6 py-4 (updated 2026-06-08 from uniform 4px)
          // Figma Org Switcher Container.Main is pad 6,6,6,12 on desktop, read
          // off set 40006819:14583 on 2026-10-02. The vertical was 4 here, so
          // the trigger sat 4px shorter than the design and out of step with
          // the module switcher beside it.
          padding: mobile ? `${L.orgPadV} ${L.orgPadMobileH}` : `${L.orgPadV} ${L.orgPadV} ${L.orgPadV} ${L.orgPadL}`,
          borderRadius: L.radius,
          // Rest is bare: stroke only, no fill. See the Ghost note in T.
          background: open ? T.controlPressed : hov ? T.controlHover : "transparent",
          border: `1px solid ${open ? T.orgStrokePressed : hov ? T.orgStrokeHover : T.orgStroke}`,
          cursor: "pointer", color: T.monoBase, fontFamily: "inherit",
          transition: "background var(--motion-duration-3) var(--motion-easing-standard), border-color var(--motion-duration-3) var(--motion-easing-standard)",
        }}
      >
        {/* RowStart — org name label only. No avatar or logo displayed in the
            nav trigger per Figma (showOrgAvatar = false by default).
            If org.logoUrl is provided it is still used in the org panel below. */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-xxtight)",
          height: 20, padding: "0 2px" }}>
          {/* Logo avatar — only rendered when a URL is explicitly provided */}
          {hasLogo && (
            <div style={{ width: L.orgAvatarSm, height: L.orgAvatarSm, padding: "var(--semantic-layout-units-padding-xxxxtight)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{
                width: L.orgAvatarNav, height: L.orgAvatarNav, borderRadius: L.radiusSm,
                border: `1px solid ${T.orgStroke}`,
                background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative", flexShrink: 0,
              }}>
                <img
                  src={org.logoUrl} alt=""
                  onError={() => setImgFailed(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          )}
          {/* Label */}
          <span
            aria-hidden={mobile ? "true" : undefined}
            style={{
              ...labelStyle,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: mobile ? 70 : 248, color: T.orgText, paddingRight: "var(--semantic-layout-units-padding-xxxtight)",
            }}
          >
            {label}
          </span>
          {/* SubOrgName. Its own node in Figma with its own token,
              Foreground/Static/Neutral/Mono, which on this bar resolves to
              #ffffff and does NOT follow the hover state the way OrgName does.
              Figma puts it in Container.CityName.Catholic beside the org name
              with gap 8. */}
          {subLabel && (
            <span
              style={{
                ...labelStyle,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: 110, flexShrink: 0,
                color: T.orgSubText,
                marginLeft: "var(--semantic-layout-units-gap-tight)",
              }}
            >
              {subLabel}
            </span>
          )}
          {mobile && (
            <span style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
              {org.name}{org.campus ? ", "+org.campus : ""}
            </span>
          )}
        </div>
        {/* Chevron */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 16, height: 16, marginRight: 2,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform var(--motion-duration-4) var(--motion-easing-standard)",
        }}>
          {/* Figma Org Switcher Container.RowEnd is a 24x24 box holding a 12x12
              expand_more. This was a bare 16px glyph with no box, so the
              chevron was both too large and unaligned with the module
              switcher's, which sits in a 20 box. */}
          <span style={{ width: L.orgChevronBox, height: L.orgChevronBox, display: "inline-flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="expand_more" size={L.chevronGlyph} style={{ color: T.orgChevron }} />
          </span>
        </div>
      </button>
    </div>
  );
}

// ─── ModuleSwitcher ────────────────────────────────────────────────────────────
/**
 * ModuleSwitcher (app switcher).
 *
 *   type — "interactive" (default) | "static"   (Figma variant property "Type")
 *     "interactive": switch-module control — chevron + hover + pressed + button
 *       semantics + aria-haspopup. Used in every module.
 *     "static": non-interactive current-module label — NO chevron, NO hover,
 *       NO pressed, NOT a button. Used on the Amplify Dashboard, where the module
 *       switcher only indicates the current location (there is nowhere to switch
 *       to from the dashboard).
 *       See top-nav-spec.md §ModuleSwitcher properties + usage-by-context.
 */
export function ModuleSwitcher({ modules, activeId, open, onToggle, breakpoint = "desktop", type = "interactive" }) {
  const [hov, setHov]   = useState(false);
  const active          = modules.find(m => m.id === activeId) || modules[0];
  const showLabel       = breakpoint === "desktop";
  const isStatic        = type === "static";

  // Icon + label — identical in both variants.
  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-xxtight)",
      paddingRight: showLabel && !isStatic ? 2 : 0 }}>
      {/* The module mark. Mono on the bar: the chrome is brand blue, so the
          mark inherits currentColor and reads as near-white, which is what the
          hand-drawn home icon did for one module and nothing did for the rest. */}
      <div style={{ width: 30, height: 30, display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, color: T.monoBase }}>
        <ModuleIcon module={active.id} size={24} color="mono" />
      </div>
      {/* Label — desktop only */}
      {showLabel && (
        <span style={{ fontSize: "var(--semantic-type-font-size-s)", fontWeight: 500, lineHeight: "var(--semantic-type-line-height-s-single)",
          letterSpacing: "var(--semantic-type-letter-spacing-spacious)", whiteSpace: "nowrap", overflow: "hidden",
          textOverflow: "ellipsis", maxWidth: 160, color: T.monoBase }}>
          {active.label}
        </span>
      )}
    </div>
  );

  // STATIC — Amplify Dashboard: current-module label, not a control.
  // No chevron, no hover/pressed, no button role/affordance.
  if (isStatic) {
    return (
      <div style={{ position: "relative", padding: "4px 2px" }}>
        <div
          aria-label={`Current module — ${active.label}`}
          style={{
            display: "flex", alignItems: "center",
            maxHeight: L.modInnerH, minHeight: L.modInnerH, padding: "var(--semantic-layout-units-padding-xxxtight)", borderRadius: L.radius,
            background: "transparent", border: "1px solid transparent",
            color: T.monoBase, fontFamily: "inherit", cursor: "default",
          }}
        >
          {inner}
        </div>
      </div>
    );
  }

  // INTERACTIVE (default) — switch-module control.
  return (
    <div style={{ position: "relative", padding: "4px 2px" }}>
      <button
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={onToggle}
        aria-haspopup="listbox" aria-expanded={open}
        aria-label={`Switch module — ${active.label}`}
        style={{
          display: "flex", alignItems: "center",
          maxHeight: L.modInnerH, minHeight: L.modInnerH, padding: "var(--semantic-layout-units-padding-xxxtight)", borderRadius: L.radius,
          background: open ? T.controlPressed : hov ? T.controlHover : "transparent",
          // No stroke in any state — Figma's ModuleSwitcher has none, unlike the
          // org switcher next to it. Transparent rather than none so the two
          // controls keep the same box height.
          border: "1px solid transparent",
          cursor: "pointer", color: T.monoBase, fontFamily: "inherit",
          transition: "background var(--motion-duration-3) var(--motion-easing-standard), border-color var(--motion-duration-3) var(--motion-easing-standard)",
        }}
      >
        {inner}
        {/* Chevron. Figma ModuleSwitcher Container.RowEnd is a 20x20 box holding a
            12x12 expand_more instance, read off node 40007067:6508 on
            2026-10-02. The glyph was right at 12; the box said 16. */}
        <div style={{
          width: L.modChevronBox, height: L.modChevronBox, display: "flex", alignItems: "center",
          justifyContent: "center", marginLeft: 2,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform var(--motion-duration-4) var(--motion-easing-standard)",
        }}>
          <Icon name="expand_more" size={12} style={{ color: T.monoBase }} />
        </div>
      </button>
    </div>
  );
}

// ─── TopNav ────────────────────────────────────────────────────────────────────
/**
 * TopNav.Global component.
 *
 * Props:
 *   modules          — Array<{id, label, icon}>  (default: DEFAULT_MODULES)
 *   activeModuleId   — string
 *   org              — { id, name, campus?, initials, logoUrl?, bg? }
 *                      logoUrl absent or undefined → nav trigger shows org name only
 *                      (no avatar/placeholder). logoUrl, when provided, renders the logo
 *                      in the nav trigger AND in the org-panel dropdown.
 *   user             — { name, initials, email, avatarUrl? }
 *   breakpoint       — "desktop" | "tablet" | "mobile"
 *   onModuleSelect   — (id: string) => void
 *   onOrgSelect      — () => void
 *   onSearchOpen     — () => void
 *   onSideNavToggle  — () => void  (mobile only)
 *   onNotifications  — () => void
 *   onMore           — () => void
 *   className        — string
 */
export function TopNav({
  modules         = DEFAULT_MODULES,
  activeModuleId  = "home",
  org             = { id: "shc", name: "Sacred Heart Church-ITD", campus: "Knoxville", initials: "SH" },
  orgs            = DEMO_ORGS,   // list shown in the OrgSwitcher "Open" dropdown panel
  user            = { name: "Jo Lopez", initials: "JL", email: "jo@sacredheart.org" },
  breakpoint      = "desktop",
  moduleSwitcherType = "interactive",   // "interactive" | "static" (Amplify Dashboard) — Figma "Type"
  initialOpenPanel = null,              // "module" | "org" | "profile" | null — seeds the open panel (demo/snapshot use)
  onModuleSelect,
  onOrgSelect,
  onSearchOpen,
  onSideNavToggle,
  onNotifications,
  onMore,
  className = "",
}) {
  const [openPanel, setOpenPanel]       = useState(initialOpenPanel); // "module"|"org"|"profile"|null
  const [currentModuleId, setModuleId]  = useState(activeModuleId);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");  // shared so the value persists across the collapsed icon ↔ takeover
  const navRef                          = useRef(null);

  const isMobile  = breakpoint === "mobile";
  const isTablet  = breakpoint === "tablet";

  const toggle = (p) => setOpenPanel(x => x === p ? null : p);
  const close  = () => setOpenPanel(null);

  useEffect(() => {
    const h = (e) => { if (!navRef.current?.contains(e.target)) close(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { close(); setSearchExpanded(false); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleModuleSelect = (id) => {
    setModuleId(id);
    close();
    onModuleSelect?.(id);
  };

  // Search always takes over the whole bar when open (all breakpoints), until
  // it is closed. There is no inline-expand state — opening search overlays the
  // entire TopNav so it can never collide with the OrgSwitcher or other controls.
  const useTakeover = searchExpanded;

  return (
    // TWO ELEMENTS, AND THE SPLIT IS THE POINT.
    //
    // The bar is brand-coloured, not dark-themed. Those are different things and
    // conflating them was a real bug: data-theme="midnight" used to sit on the
    // <nav> itself, and a [data-theme] applies to the element it is on as well as
    // its descendants, so the bar re-resolved its OWN background through Midnight
    // and painted Fill/Surface/Chrome as #152343. In Figma the bar is #2d4889 and
    // carries no mode override at all, so on a Light page the repo was showing a
    // colour the design does not contain.
    //
    // So the background is read OUT here, in the page's own theme, and the dark
    // region starts INSIDE. The nav keeps position:relative, so the absolutely
    // positioned dropdown panels still anchor to it and nothing about layout
    // moves.
    <div
      style={{
        background: "var(--semantic-color-fill-surface-chrome)",
        position: "relative", zIndex: 100,
      }}
    >
    <nav
      ref={navRef}
      // NO data-theme HERE, AND THAT IS THE FIX FOR THE WHOLE BAR.
      //
      // This carried data-theme="midnight", on the reasoning that a dark bar is
      // a dark region. It is not. Figma renders this bar in LIGHT, and the bar
      // is dark because Fill/Surface/Chrome is itself a dark navy in Light, not
      // because the region is inverted. Measured off node 40007067:6508 on
      // 2026-10-02, reading the resolved paints as the file renders them:
      //
      //   bar       Container.Main   #2d4889   Fill/Surface/Chrome, LIGHT
      //   avatar    Avatar           #eef2fb   Fill/Action/Primary/Subtle/Rest, LIGHT
      //   initials  "JL"             #345499   Foreground/Action/Primary/On Subtle/Rest, LIGHT
      //
      // Forcing midnight made every token on the bar resolve to its Midnight
      // value while the bar's own background, which sits outside this element,
      // resolved Light. So the avatar came out #22386b instead of #eef2fb, and
      // the initials with it. It stayed hidden on the Ghost tokens only because
      // those are near-white in both modes, which is also why fixing the tier
      // earlier today did not fix the colours: the tier was right and the mode
      // was wrong.
      //
      // The dropdown panels keep their own data-theme="light" and are unaffected,
      // since light is now the ambient mode rather than an opt-out.
      aria-label="Global navigation"
      className={className}
      style={{
        background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxHeight: L.navH, padding: `${L.navPadV} ${L.navPadH}`, gap: L.navGap,
        position: "relative", overflow: "visible",
        fontFamily: "'Red Hat Text', sans-serif",
      }}
    >
      {/* ── Slot.RowStart ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-tight)", flexShrink: 0 }}>

        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={onSideNavToggle}
            aria-label="Open navigation menu"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: L.touchTarget, minWidth: L.touchTarget,
              background: "transparent", border: "none", cursor: "pointer", borderRadius: L.radius,
            }}
          >
            <Icon name="menu" size={22} style={{ color: T.monoBase }} />
          </button>
        )}

        {/* ModuleSwitcher */}
        <ModuleSwitcher
          modules={modules}
          activeId={currentModuleId}
          open={openPanel === "module"}
          onToggle={() => toggle("module")}
          breakpoint={breakpoint}
          type={moduleSwitcherType}
        />

        {/* Module dropdown — never opens in static mode (non-interactive) */}
        {openPanel === "module" && moduleSwitcherType !== "static" && (
          <ul role="listbox" data-theme="light" aria-label="Switch module"
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: L.navPadH,
              width: 243, background: T.panelBg,
              border: `1px solid ${T.panelBorder}`, borderRadius: L.radius,
              boxShadow: T.panelShadow, padding: "var(--semantic-layout-units-padding-xxxtight)", zIndex: 300,
              margin: 0, listStyle: "none",
              animation: "tnDropIn var(--motion-duration-4) var(--motion-easing-spring) both",
            }}
          >
            {modules.map(m => (
              <li key={m.id} role="option" aria-selected={m.id === currentModuleId}>
                <button
                  onClick={() => handleModuleSelect(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-medium)",
                    padding: "", borderRadius: "var(--semantic-layout-units-cornerradius-base)", width: "100%", textAlign: "left",
                    color: m.id === currentModuleId ? T.itemText : T.itemTextBase,
                    fontSize: "var(--semantic-type-font-size-s)", fontWeight: m.id === currentModuleId ? 500 : 400,
                    background: m.id === currentModuleId ? T.activeItem : "transparent",
                    border: "none", fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  {/* Full colour here: the panel is a light surface and the
                      identity colour is what makes a module recognisable. */}
                  <ModuleIcon module={m.id} size={18} />
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* OrgSwitcher */}
        <OrgSwitcher
          org={org}
          open={openPanel === "org"}
          onToggle={() => { toggle("org"); onOrgSelect?.(); }}
          mobile={isMobile}
        />

        {/* Org panel — the real OrgSwitcher "Open" dropdown (Figma 40007336:9453) */}
        {openPanel === "org" && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)",
            left: isMobile ? L.navPadH : `calc(${L.navPadH} + 40px)`, zIndex: 300,
            animation: "tnDropIn var(--motion-duration-4) var(--motion-easing-spring) both",
          }}>
            <OrgSwitcherPanel
              orgs={orgs}
              activeOrgId={org.id}
              onSelect={(o) => { close(); onOrgSelect?.(o); }}
            />
          </div>
        )}
      </div>

      {/* ── Slot.RowEnd ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-tight)", flexShrink: 0 }}>

        {/* Collapsed search pill. Opening it triggers the full-bar takeover
            overlay below (never an inline expand), so it cannot overlap the
            OrgSwitcher. */}
        <TopNavSearch
          expanded={false}
          onExpandChange={setSearchExpanded}
          breakpoint={breakpoint}
          onSearchOpen={onSearchOpen}
          searchProps={{ value: searchQuery, onChange: setSearchQuery, onClear: () => setSearchQuery("") }}
        />

        <TopNavActions breakpoint={breakpoint} onNotifications={onNotifications} onMore={onMore} />

        <TopNavProfile
          user={user}
          open={openPanel === "profile"}
          onToggle={() => toggle("profile")}
          mobile={isMobile}
        />

        {/* Profile menu */}
        {openPanel === "profile" && (
          <div role="menu" data-theme="light"
            style={{
              position: "absolute", top: "calc(100% + 4px)", right: L.navPadH,
              width: 200, background: T.panelBg,
              border: `1px solid ${T.panelBorder}`, borderRadius: L.radius,
              boxShadow: T.panelShadow, padding: "var(--semantic-layout-units-padding-xxxtight)", zIndex: 300,
              animation: "tnDropIn var(--motion-duration-4) var(--motion-easing-spring) both",
            }}
          >
            <div style={{ padding: " ",
              borderBottom: `1px solid ${T.panelDivider}`, marginBottom: 4 }}>
              <div style={{ fontSize: "var(--semantic-type-font-size-s)", fontWeight: 600, color: T.itemText }}>{user.name}</div>
              <div style={{ fontSize: "var(--semantic-type-font-size-xxs)", color: T.itemMeta, marginTop: 1 }}>{user.email}</div>
            </div>
            {["Profile settings", "Settings"].map(label => (
              <button key={label} role="menuitem"
                style={{ display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-tight)", padding: "",
                  borderRadius: "var(--semantic-layout-units-cornerradius-base)", fontFamily: "inherit", fontSize: "var(--semantic-type-font-size-s)",
                  color: T.itemTextBase, background: "transparent",
                  border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
                {label}
              </button>
            ))}
            <button role="menuitem"
              style={{ display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-tight)", padding: "",
                borderRadius: "var(--semantic-layout-units-cornerradius-base)", fontFamily: "inherit", fontSize: "var(--semantic-type-font-size-s)",
                color: T.signOut, background: "transparent",
                border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Full-width search takeover — shown whenever search is open, on every
          breakpoint. Fills the entire bar (absolute inset:0) so it can never
          collide with the OrgSwitcher.
          Exit is a BACK ARROW to the LEFT of the field, outside it. It used to
          be a ✕ to the right, which sat beside the field's own ✕ for clearing
          typed text: two glyphs of the same shape, inches apart, one throwing
          the query away and one throwing the whole search away. The arrow is a
          different shape, on the opposite side, and says "go back" rather than
          "close". The field's leading glyph is now a plain search mark with no
          action, because giving it a second exit was the same confusion again.
          Escape still closes. */}
      {useTakeover && (
        <div
          // data-theme="light" because the takeover IS the bar, and the bar
          // resolves its chrome in light. Without it the takeover sat inside the
          // bar's own data-theme="midnight" region, where Fill/Surface/Chrome is
          // #152343 rather than #2d4889 — so opening search visibly darkened the
          // whole bar. Measured 2026-10-02: bar rgb(45,72,137), takeover
          // rgb(21,35,67).
          data-theme="light"
          style={{
            position: "absolute", inset: 0, zIndex: 200,
            background: "var(--semantic-color-fill-surface-chrome)",
            animation: "tnSearchExpand var(--motion-duration-4) var(--motion-easing-emphasized) both",
            display: "flex", alignItems: "center", gap: "var(--semantic-layout-units-gap-tight)",
            padding: `0 ${L.navPadH}`,
          }}
        >
          {/* Exit, to the LEFT and outside the field, so it can never be read
              as the field's own clear control */}
          <button
            type="button"
            aria-label="Back"
            onClick={() => setSearchExpanded(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: L.takeoverExit, height: L.takeoverExit, flexShrink: 0,
              background: "transparent", border: "none", cursor: "pointer",
              borderRadius: L.radius, color: T.monoBase,
            }}
          >
            <Icon name="arrow_back" size={L.takeoverExitGlyph} style={{ color: T.monoBase }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              inputRef={(el) => el && el.focus()}
              placeholder="Search…"
            />
          </div>
        </div>
      )}
    </nav>
    </div>
  );
}

// Canonical compound name: TopNav.Search (the nested search control). The bare
// `TopNavSearch` export is kept for backward-compatible named imports.
TopNav.Search = TopNavSearch;
export { TopNavSearch };

export default TopNav;
