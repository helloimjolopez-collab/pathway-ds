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

// ─── DESIGN TOKENS (dark-mode surface — all controls on brand-blue bg) ─────────
// Values sourced from get_variable_defs on Figma node 40007067:6508.
// Consume via CSS vars where available; raw fallbacks for CDN/Storybook isolation.
export const T = {
  // Nav bar surface
  navBg:              "#2d4889",   // Fill/Static/Brand/Base

  // Interactive controls (dark-mode tokens — applied on brand-blue surface)
  orgFill:            "rgba(160,181,230,0.04)",   // Fill/Action/Tertiary/Base
  orgStroke:          "rgba(160,181,230,0.16)",   // Stroke/Action/Tertiary/Base
  orgStrokeHover:     "rgba(160,181,230,0.20)",   // Stroke/Action/Tertiary/Hover
  searchFill:         "rgba(160,181,230,0.08)",   // Fill/Action/PrimaryInverse/Base
  controlHover:       "rgba(10,18,35,0.16)",      // Fill/Action/PrimaryInverse/Hover
  controlPressed:     "rgba(255,255,255,0.08)",   // Fill/Action/PrimaryInverse/Pressed
  controlActive:      "rgba(255,255,255,0.08)",   // pressed = active for toggles

  // Text / icon on nav bar
  monoBase:           "#fbfbfb",   // Text/Action/Mono/Base = Icon/Action/Mono/Base

  // Profile avatar (light-mode accent — always the same regardless of app mode)
  avatarBg:           "#dcd9ef",   // Fill/Static/Accent_Amethyst/Base
  avatarText:         "#221e3f",   // Text/Static/Accent-Amethyst/Contrast

  // Dropdown / panel (on white surface — light-mode tokens)
  panelBorder:        "rgba(45,72,137,0.12)",
  panelShadow:        "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
  activeItem:         "#eef2fb",   // NOTE: no semantic token yet — tracked in spec §17
  itemText:           "#252525",
  itemTextBase:       "#484848",
  itemMeta:           "#6b6b6b",
};

// ─── LAYOUT VALUES ─────────────────────────────────────────────────────────────
// Sourced from Figma get_design_context measurements on Desktop/Tablet/Mobile nodes.
export const L = {
  // Desktop (≥1024px)
  deskPadH:   16,   // px-[16px]
  deskPadV:   4,    // py-[4px]
  deskH:      56,   // max-h-[56px]
  deskOrgMax: 316,  // OrgSwitcher max-w

  // Tablet (768–1023px)
  tabPadH:    12,   // px-[12px]
  tabH:       54,   // max-h-[54px]

  // Mobile (<768px)
  mobPadH:    8,    // px-[8px]
  mobH:       56,   // max-h-[56px]
  mobOrgMax:  120,  // OrgSwitcher max-w on mobile

  // Controls
  touchTarget:  48, // min touch target (WCAG 2.5.5)
  modInnerH:    36, // ModuleSwitcher inner height
  orgAvatarNav: 20, // org avatar size in nav bar
  orgAvatarSm:  24, // org avatar wrapper in nav bar
  orgAvatarPanel: 32, // org avatar in panel dropdown
  searchPill:   32, // search pill outer size
  avatarSize:   32, // profile avatar size
  radius:       8,  // CornerRadius/Medium
  radiusSm:     4,  // CornerRadius/Small

  // Org avatar crop (Figma-defined, §7.2.1)
  logoW:    "196.31%",
  logoH:    "228.29%",
  logoL:    "-47.05%",
  logoT:    "-63.31%",
};

// ─── ABBREVIATION UTILITIES ────────────────────────────────────────────────────
// Implements §10.2 AP-based abbreviation rules.

const SKIP_WORDS = new Set(["the","a","an","of","in","at","for","and","or","but"]);

/**
 * Abbreviate an org name to exactly 3 uppercase letters.
 * Rules: skip articles/prepositions/conjunctions; take first letter of first 3
 * significant words. If 2 significant words, repeat last letter. If 1, first 3 chars.
 */
export function abbreviateOrg(name) {
  if (!name) return "???";
  const words = name.replace(/-/g, " ").split(/\s+/).filter(Boolean);
  const sig = words.filter(w => !SKIP_WORDS.has(w.toLowerCase()));
  if (sig.length >= 3) return (sig[0][0] + sig[1][0] + sig[2][0]).toUpperCase();
  if (sig.length === 2) return (sig[0][0] + sig[1][0] + sig[1][0]).toUpperCase();
  return sig[0].slice(0, 3).toUpperCase();
}

/**
 * Abbreviate a campus name to 2 uppercase letters.
 * Rules (Two-Letter Rule per §10.2):
 *   - Two+ significant words: first letter of first two words (e.g. "Main Campus" → MC)
 *   - Single word with a recognisable place-name suffix (-ville, -field, -burg, -town,
 *     -port, -ford, -wood, -land, -dale, -view, -gate, -bridge, -worth, -shire, -berg):
 *     take first letter of root + first letter of suffix (e.g. "Knoxville" → KV)
 *   - Single word, no suffix: first + last letter (e.g. "East" → ET)
 */
const PLACE_SUFFIXES = [
  "ville","field","burg","burgh","berg","town","port","ford",
  "wood","land","dale","view","gate","bridge","worth","shire",
];

export function abbreviateCampus(campus) {
  if (!campus) return "";
  const words = campus.replace(/-/g, " ").split(/\s+/).filter(Boolean);
  const sig = words.filter(w => !SKIP_WORDS.has(w.toLowerCase()));
  if (sig.length === 0) return campus.slice(0, 2).toUpperCase();
  if (sig.length >= 2) {
    // Two+ significant words: first letter of first two
    return (sig[0][0] + sig[1][0]).toUpperCase();
  }
  // Single word — check for compound place-name suffix
  const w = sig[0];
  const wl = w.toLowerCase();
  for (const suffix of PLACE_SUFFIXES) {
    if (wl.endsWith(suffix) && w.length > suffix.length + 1) {
      // e.g. Knoxville: root=Knox → K, suffix=ville → V
      return (w[0] + suffix[0]).toUpperCase();
    }
  }
  // Fallback: first + last letter
  return (w[0] + w[w.length - 1]).toUpperCase();
}

/**
 * Build the mobile display label: "ORG | CA" or just "ORG" when no campus.
 */
export function mobileLabel(orgName, campusName) {
  const org = abbreviateOrg(orgName);
  if (!campusName) return org;
  const cam = abbreviateCampus(campusName);
  return `${org} | ${cam}`;
}

// ─── MATERIAL SYMBOL HELPER ────────────────────────────────────────────────────
// All Pathway icons use Google Material Symbols (outlined variant).
function Icon({ name, size = 20, style: extraStyle }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "block",
        userSelect: "none",
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' size",
        ...extraStyle,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ─── MODULE DATA (app-level) ───────────────────────────────────────────────────
export const DEFAULT_MODULES = [
  { id: "home",   label: "Amplify Home",    icon: "home" },
  { id: "people", label: "People",          icon: "group" },
  { id: "giving", label: "Giving",          icon: "volunteer_activism" },
  { id: "events", label: "Events",          icon: "event" },
  { id: "comms",  label: "Communications",  icon: "mail" },
];

// ─── TopNavSearch ──────────────────────────────────────────────────────────────
export function TopNavSearch({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: L.touchTarget, minWidth: L.touchTarget }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-label="Open search"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: L.searchPill, width: L.searchPill,
          background: hov ? T.controlHover : T.searchFill,
          border: `0.75px solid ${T.monoBase}`,
          borderRadius: 9999, cursor: "pointer", padding: 8, flexShrink: 0,
          transition: "background 120ms ease",
        }}
      >
        <Icon name="search" size={16} style={{ color: T.monoBase }} />
      </button>
    </div>
  );
}

// ─── TopNavActions ─────────────────────────────────────────────────────────────
// Desktop: two notification bell buttons.
// Tablet/Mobile: single more_vert (three-dot) button.
export function TopNavActions({ breakpoint = "desktop", onNotifications, onMore }) {
  const [hov0, setHov0] = useState(false);
  const [hov1, setHov1] = useState(false);
  const [hovMore, setHovMore] = useState(false);

  const btnStyle = (hov) => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "100%", height: "100%", padding: 8, borderRadius: L.radius,
    background: hov ? T.controlHover : "transparent",
    border: "none", cursor: "pointer",
    transition: "background 120ms ease",
  });

  if (breakpoint === "desktop") {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {[
          { hov: hov0, setHov: setHov0, label: "Notifications", idx: 0 },
          { hov: hov1, setHov: setHov1, label: "Alerts", idx: 1 },
        ].map(({ hov, setHov, label, idx }) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: L.touchTarget, minWidth: L.touchTarget, padding: 6 }}>
            <button
              onMouseEnter={() => setHov(true)}
              onMouseLeave={() => setHov(false)}
              onClick={onNotifications}
              aria-label={label}
              style={btnStyle(hov)}
            >
              <Icon name="notifications" size={20} style={{ color: T.monoBase }} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Tablet and Mobile: more_vert
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: L.touchTarget, minWidth: L.touchTarget }}>
      <button
        onMouseEnter={() => setHovMore(true)}
        onMouseLeave={() => setHovMore(false)}
        onClick={onMore}
        aria-label="More actions"
        style={btnStyle(hovMore)}
      >
        <Icon name="more_vert" size={20} style={{ color: T.monoBase }} />
      </button>
    </div>
  );
}

// ─── TopNavProfile ─────────────────────────────────────────────────────────────
export function TopNavProfile({ user, open, onToggle }) {
  const [hov, setHov] = useState(false);
  const showsInitials = !user.avatarUrl;

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center",
      justifyContent: "center", minHeight: L.touchTarget, minWidth: L.touchTarget, padding: 2 }}>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Account — ${user.name}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44,
          background: open ? T.controlActive : hov ? T.controlHover : "transparent",
          border: "none", borderRadius: "50%", cursor: "pointer", padding: 6,
          transition: "background 120ms ease",
        }}
      >
        <div style={{
          width: L.avatarSize, height: L.avatarSize, borderRadius: "50%",
          background: T.avatarBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 600, letterSpacing: "0.3px",
          color: T.avatarText,
          lineHeight: 1, flexShrink: 0, overflow: "hidden",
        }}>
          {showsInitials
            ? user.initials
            : <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          }
        </div>
      </button>
    </div>
  );
}

// ─── OrgSwitcher ──────────────────────────────────────────────────────────────
export function OrgSwitcher({ org, open, onToggle, mobile = false, className = "" }) {
  const [hov, setHov] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const label = mobile
    ? mobileLabel(org.name, org.campus)
    : org.name + (org.campus ? " | " + org.campus : "");

  const labelStyle = mobile
    ? { fontSize: 12, fontWeight: 500, lineHeight: "18px", letterSpacing: "0.3px" }  // Label/Button/XS
    : { fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: "0.3px" }; // Label/Button/S

  const maxOrgW = mobile ? L.mobOrgMax : L.deskOrgMax;

  return (
    <div
      style={{ position: "relative", padding: mobile ? "4px 2px" : 4, maxWidth: maxOrgW }}
      className={className}
    >
      <button
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={onToggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Switch organisation — ${org.name}${org.campus ? ", " + org.campus : ""}`}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          minHeight: 36, padding: mobile ? "4px 2px" : 4, borderRadius: L.radius,
          background: open ? T.controlActive : hov ? T.controlHover : T.orgFill,
          border: `1px solid ${open || hov ? T.orgStrokeHover : T.orgStroke}`,
          cursor: "pointer",
          color: T.monoBase,
          fontFamily: "inherit",
          transition: "background 120ms ease, border-color 120ms ease",
        }}
      >
        {/* Org avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: 20, padding: "0 2px" }}>
          <div style={{ width: L.orgAvatarSm, height: L.orgAvatarSm, padding: 2, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{
              width: L.orgAvatarNav, height: L.orgAvatarNav, borderRadius: L.radiusSm,
              border: `1px solid ${T.orgStroke}`,
              background: `rgba(45,72,137,0.25)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative",
            }}>
              {org.logoUrl && !imgFailed
                ? <img
                    src={org.logoUrl}
                    alt=""
                    onError={() => setImgFailed(true)}
                    style={{ position: "absolute", width: L.logoW, height: L.logoH, left: L.logoL, top: L.logoT }}
                  />
                : <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".04em",
                    color: T.monoBase, lineHeight: 1 }}>
                    {org.initials}
                  </span>
              }
            </div>
          </div>
          {/* Label */}
          <span
            aria-hidden={mobile ? "true" : undefined}
            style={{
              ...labelStyle,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: mobile ? 70 : 248,
              color: T.monoBase, paddingRight: 4,
            }}
          >
            {label}
          </span>
          {/* Accessible label for mobile (full, unabbreviated) */}
          {mobile && (
            <span className="sr-only" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
              {org.name}{org.campus ? ", " + org.campus : ""}
            </span>
          )}
        </div>
        {/* Chevron */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          width: 16, height: 16, marginRight: 2,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 180ms ease" }}>
          <Icon name="expand_more" size={16} style={{ color: T.monoBase }} />
        </div>
      </button>
    </div>
  );
}

// ─── ModuleSwitcher ────────────────────────────────────────────────────────────
export function ModuleSwitcher({ modules, activeId, open, onToggle, breakpoint = "desktop" }) {
  const [hov, setHov] = useState(false);
  const active = modules.find(m => m.id === activeId) || modules[0];
  const showLabel = breakpoint === "desktop"; // tablet and mobile: icon only

  return (
    <div style={{ position: "relative", padding: "4px 2px" }}>
      <button
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Switch module — ${active.label}`}
        style={{
          display: "flex", alignItems: "center",
          maxHeight: L.modInnerH, minHeight: L.modInnerH, padding: 4, borderRadius: L.radius,
          background: open ? T.controlActive : hov ? T.controlHover : "transparent",
          border: `1px solid ${open ? T.orgStrokeHover : "transparent"}`,
          cursor: "pointer",
          color: T.monoBase,
          fontFamily: "inherit",
          transition: "background 120ms ease, border-color 120ms ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: showLabel ? 2 : 0 }}>
          {/* Module icon */}
          <div style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={active.icon} size={22} style={{ color: T.monoBase }} />
          </div>
          {/* Label — desktop only */}
          {showLabel && (
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: "0.3px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: 160, color: T.monoBase }}>
              {active.label}
            </span>
          )}
        </div>
        {/* Chevron */}
        <div style={{ width: 16, height: 16, display: "flex", alignItems: "center",
          justifyContent: "center", marginLeft: 4,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 180ms ease" }}>
          <Icon name="expand_more" size={16} style={{ color: T.monoBase }} />
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
 *   items            — NavItem[]  (not used directly; kept for future use)
 *   activeId         — string     (currently active navigation item ID — passed through to onNavigate)
 *   modules          — Array<{id, label, icon}>  (default: DEFAULT_MODULES)
 *   activeModuleId   — string     (id of active module)
 *   org              — { id, name, campus?, initials, logoUrl?, bg? }
 *   user             — { name, initials, email, avatarUrl? }
 *   breakpoint       — "desktop" | "tablet" | "mobile"  (consumer controls this; use window.innerWidth)
 *   onModuleSelect   — (id: string) => void
 *   onOrgSelect      — () => void  (opens the panel — panel design pending)
 *   onSearchOpen     — () => void
 *   onSideNavToggle  — () => void  (mobile only)
 *   onNotifications  — () => void
 *   onMore           — () => void  (tablet/mobile three-dot menu)
 *   className        — string
 */
export function TopNav({
  modules = DEFAULT_MODULES,
  activeModuleId = "home",
  org = { id: "shc", name: "Sacred Heart Church-ITD", campus: "Knoxville", initials: "SH", bg: "#2d4889" },
  user = { name: "Jo Lopez", initials: "JL", email: "jo@sacredheart.org" },
  breakpoint = "desktop",
  onModuleSelect,
  onOrgSelect,
  onSearchOpen,
  onSideNavToggle,
  onNotifications,
  onMore,
  className = "",
}) {
  const [openPanel, setOpenPanel] = useState(null); // "module" | "org" | "profile" | null
  const [currentModuleId, setCurrentModuleId] = useState(activeModuleId);
  const navRef = useRef(null);

  const isMobile  = breakpoint === "mobile";
  const isTablet  = breakpoint === "tablet";
  const isDesktop = breakpoint === "desktop";

  const padH = isMobile ? L.mobPadH : isTablet ? L.tabPadH : L.deskPadH;
  const navH = isTablet ? L.tabH : 56;

  const toggle = (panel) => setOpenPanel(x => x === panel ? null : x = panel);
  const close  = () => setOpenPanel(null);

  // Close panels on outside click
  useEffect(() => {
    const handler = (e) => { if (!navRef.current?.contains(e.target)) close(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close panels on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleModuleSelect = (id) => {
    setCurrentModuleId(id);
    close();
    onModuleSelect?.(id);
  };

  const activeModule = modules.find(m => m.id === currentModuleId) || modules[0];

  return (
    <nav
      ref={navRef}
      aria-label="Global navigation"
      className={className}
      style={{
        background: `var(--semantic-color-light-mode-fill-static-brand-base, ${T.navBg})`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxHeight: navH, padding: `${L.deskPadV}px ${padH}px`,
        position: "relative", overflow: "visible", zIndex: 100,
        fontFamily: "'Red Hat Text', sans-serif",
      }}
    >
      {/* ── Slot.RowStart ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Hamburger (mobile only) */}
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
        />

        {/* ModuleSwitcher dropdown */}
        {openPanel === "module" && (
          <ul
            role="listbox"
            aria-label="Switch module"
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: padH,
              width: 243, background: "#fff",
              border: `1px solid ${T.panelBorder}`, borderRadius: L.radius,
              boxShadow: T.panelShadow,
              padding: 4, zIndex: 300, margin: 0, listStyle: "none",
              animation: "tnDropIn 140ms ease-out both",
            }}
          >
            {modules.map(m => (
              <li key={m.id} role="option" aria-selected={m.id === currentModuleId}>
                <button
                  onClick={() => handleModuleSelect(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 6,
                    color: m.id === currentModuleId ? T.itemText : T.itemTextBase,
                    fontSize: 13,
                    fontWeight: m.id === currentModuleId ? 500 : 400,
                    background: m.id === currentModuleId ? T.activeItem : "transparent",
                    border: "none", width: "100%", textAlign: "left",
                    fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  <Icon name={m.icon} size={18} style={{ color: m.id === currentModuleId ? T.itemText : T.itemTextBase, opacity: 0.8 }} />
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

        {/* OrgSwitcher panel (panel design TBD — §17) */}
        {openPanel === "org" && (
          <div
            role="dialog"
            aria-label="Switch organisation"
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: isMobile ? padH : padH + 40,
              width: 280, background: "#fff",
              border: `1px solid ${T.panelBorder}`, borderRadius: L.radius,
              boxShadow: T.panelShadow,
              padding: 8, zIndex: 300,
              animation: "tnDropIn 140ms ease-out both",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em",
              textTransform: "uppercase", padding: "4px 8px 6px", color: "#b5b5b5" }}>
              Organisations
            </div>
            {/* Placeholder: org list slot — panel design pending (§17) */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, padding: 8,
                borderRadius: 6, background: T.activeItem }}
            >
              <div style={{
                width: L.orgAvatarPanel, height: L.orgAvatarPanel, borderRadius: L.radiusSm,
                background: org.bg || T.navBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{org.initials}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.itemText,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {org.name}
                </div>
                {org.campus && (
                  <div style={{ fontSize: 11, color: T.itemMeta, marginTop: 1 }}>{org.campus}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Slot.RowEnd ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Search pill */}
        <TopNavSearch onClick={onSearchOpen} />

        {/* Action icons */}
        <TopNavActions
          breakpoint={breakpoint}
          onNotifications={onNotifications}
          onMore={onMore}
        />

        {/* Profile */}
        <TopNavProfile
          user={user}
          open={openPanel === "profile"}
          onToggle={() => toggle("profile")}
        />

        {/* Profile menu */}
        {openPanel === "profile" && (
          <div
            role="menu"
            style={{
              position: "absolute", top: "calc(100% + 4px)", right: padH,
              width: 200, background: "#fff",
              border: `1px solid rgba(45,72,137,0.10)`, borderRadius: L.radius,
              boxShadow: T.panelShadow,
              padding: 4, zIndex: 300,
              animation: "tnDropIn 140ms ease-out both",
            }}
          >
            <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.itemText }}>{user.name}</div>
              <div style={{ fontSize: 11, color: T.itemMeta, marginTop: 1 }}>{user.email}</div>
            </div>
            {["Profile settings", "Settings"].map(label => (
              <button key={label} role="menuitem"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                  borderRadius: 6, fontFamily: "inherit", fontSize: 13,
                  color: T.itemTextBase, background: "transparent",
                  border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
                {label}
              </button>
            ))}
            <button role="menuitem"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                borderRadius: 6, fontFamily: "inherit", fontSize: 13,
                color: "#c0392b", background: "transparent",
                border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
