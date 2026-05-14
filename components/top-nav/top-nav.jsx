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
export const T = {
  navBg:          "#2d4889",                    // Fill/Static/Brand/Base
  orgFill:        "rgba(160,181,230,0.04)",      // Fill/Action/Tertiary/Base
  orgStroke:      "rgba(160,181,230,0.16)",      // Stroke/Action/Tertiary/Base
  orgStrokeHover: "rgba(160,181,230,0.20)",
  searchFill:     "rgba(160,181,230,0.08)",      // Fill/Action/PrimaryInverse/Base
  controlHover:   "rgba(10,18,35,0.16)",         // Fill/Action/PrimaryInverse/Hover
  controlPressed: "rgba(255,255,255,0.08)",      // pressed / active toggle
  noLogoBg:       "rgba(255,255,255,0.08)",      // Fill/Action/Secondary/Base (no-logo avatar)
  monoBase:       "#fbfbfb",                    // Text/Action/Mono/Base = Icon/Action/Mono/Base
  avatarBg:       "#dcd9ef",                    // Fill/Static/Accent_Amethyst/Base
  avatarText:     "#221e3f",                    // Text/Static/Accent-Amethyst/Contrast
  panelBorder:    "rgba(45,72,137,0.12)",
  panelShadow:    "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
  activeItem:     "#eef2fb",
  itemText:       "#252525",
  itemTextBase:   "#484848",
  itemMeta:       "#6b6b6b",
};

// ─── LAYOUT VALUES ─────────────────────────────────────────────────────────────
export const L = {
  deskPadH: 16, deskPadV: 4, deskH: 56,
  tabPadH:  12, tabH: 54,
  mobPadH:  8,  mobH: 56,
  deskOrgMax: 316, mobOrgMax: 120,
  touchTarget: 48, modInnerH: 36,
  orgAvatarNav: 20, orgAvatarSm: 24, orgAvatarPanel: 32,
  searchPill: 32, avatarSize: 32,
  radius: 8, radiusSm: 4,
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
const HOME_ICON_PATH =
  "M16.5811 38.6244V32.8265C16.5811 31.3486 17.7937 30.1359 19.2716 30.1359H24.7095C25.4295 30.1359 26.1116 30.4202 26.6232 30.9128C27.1347 31.4054 27.4189 32.0875 27.4189 32.8075V38.6054C27.4189 39.2307 27.6653 39.8181 28.1011 40.2538C28.5368 40.6896 29.1242 40.9359 29.7495 40.9359H33.4632C35.1874 40.9359 36.8547 40.2538 38.0863 39.0412C39.3179 37.8286 40 36.1802 40 34.4559V17.9717C40 16.5696 39.3747 15.2623 38.2947 14.3717L25.6568 4.34858C23.4589 2.58647 20.3137 2.64331 18.1726 4.48121L5.83789 14.3528C4.72 15.2244 4.03789 16.5317 4 17.9528V34.437C4 38.037 6.93684 40.9549 10.5368 40.9359H14.1747C15.4632 40.9359 16.5053 39.9128 16.5242 38.6244H16.5811Z";

// Org avatar placeholder (no logo) — node I40007243:73405;40006817:14372;40007243:73426;84:22159
const CHURCH_ICON_PATH =
  "M0 12.6667V9.53333C0 9.26667 0.0722222 9.025 0.216667 8.80833C0.361111 8.59167 0.555556 8.42778 0.8 8.31667L2.66667 7.48333V6.15C2.66667 5.89444 2.73333 5.66389 2.86667 5.45833C3 5.25278 3.17778 5.08889 3.4 4.96667L6 3.66667V2.66667H5.33333C5.14444 2.66667 4.98611 2.60278 4.85833 2.475C4.73056 2.34722 4.66667 2.18889 4.66667 2C4.66667 1.81111 4.73056 1.65278 4.85833 1.525C4.98611 1.39722 5.14444 1.33333 5.33333 1.33333H6V0.666667C6 0.477778 6.06389 0.319444 6.19167 0.191667C6.31944 0.0638889 6.47778 0 6.66667 0C6.85556 0 7.01389 0.0638889 7.14167 0.191667C7.26944 0.319444 7.33333 0.477778 7.33333 0.666667V1.33333H8C8.18889 1.33333 8.34722 1.39722 8.475 1.525C8.60278 1.65278 8.66667 1.81111 8.66667 2C8.66667 2.18889 8.60278 2.34722 8.475 2.475C8.34722 2.60278 8.18889 2.66667 8 2.66667H7.33333V3.66667L9.93333 4.96667C10.1556 5.08889 10.3333 5.25278 10.4667 5.45833C10.6 5.66389 10.6667 5.89444 10.6667 6.15V7.48333L12.5333 8.31667C12.7778 8.42778 12.9722 8.59167 13.1167 8.80833C13.2611 9.025 13.3333 9.26667 13.3333 9.53333V12.6667C13.3333 13.0333 13.2028 13.3472 12.9417 13.6083C12.6806 13.8694 12.3667 14 12 14H8.66667C8.47778 14 8.31944 13.9361 8.19167 13.8083C8.06389 13.6806 8 13.5222 8 13.3333V12C8 11.6333 7.86944 11.3194 7.60833 11.0583C7.34722 10.7972 7.03333 10.6667 6.66667 10.6667C6.3 10.6667 5.98611 10.7972 5.725 11.0583C5.46389 11.3194 5.33333 11.6333 5.33333 12V13.3333C5.33333 13.5222 5.26944 13.6806 5.14167 13.8083C5.01389 13.9361 4.85556 14 4.66667 14H1.33333C0.966667 14 0.652778 13.8694 0.391667 13.6083C0.130556 13.3472 0 13.0333 0 12.6667ZM6.66667 8.33333C6.94444 8.33333 7.18056 8.23611 7.375 8.04167C7.56944 7.84722 7.66667 7.61111 7.66667 7.33333C7.66667 7.05556 7.56944 6.81944 7.375 6.625C7.18056 6.43056 6.94444 6.33333 6.66667 6.33333C6.38889 6.33333 6.15278 6.43056 5.95833 6.625C5.76389 6.81944 5.66667 7.05556 5.66667 7.33333C5.66667 7.61111 5.76389 7.84722 5.95833 8.04167C6.15278 8.23611 6.38889 8.33333 6.66667 8.33333Z";

/**
 * Custom home icon for the ModuleSwitcher.
 * Figma: Module=Home, Style=Flat, Color=White
 * Do NOT replace with Material Symbols — this is a custom Figma asset.
 */
export function HomeModuleIcon({ size = 22 }) {
  return (
    <svg
      viewBox="0 0 44 44" width={size} height={size}
      fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={HOME_ICON_PATH} fill="white" />
    </svg>
  );
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
      className="material-symbols-outlined"
      style={{
        fontSize: size, lineHeight: 1, display: "block",
        userSelect: "none",
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...extraStyle,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ─── MODULE DATA ───────────────────────────────────────────────────────────────
export const DEFAULT_MODULES = [
  { id: "home",   label: "Amplify Home",   icon: "home" },
  { id: "people", label: "People",         icon: "group" },
  { id: "giving", label: "Giving",         icon: "volunteer_activism" },
  { id: "events", label: "Events",         icon: "event" },
  { id: "comms",  label: "Communications", icon: "mail" },
];

// ─── TopNavSearch ──────────────────────────────────────────────────────────────
/**
 * Search control. Collapsed: pill button. Expanded: inline text input.
 * Manages its own expand/collapse state; calls onSearchOpen when expanding.
 */
export function TopNavSearch({ onSearchOpen }) {
  const [expanded, setExpanded]   = useState(false);
  const [query, setQuery]         = useState("");
  const [hov, setHov]             = useState(false);
  const inputRef                  = useRef(null);

  const open = () => {
    setExpanded(true);
    onSearchOpen?.();
    // Defer focus so the input is in the DOM first
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const close = () => { setExpanded(false); setQuery(""); };

  useEffect(() => {
    if (!expanded) return;
    const h = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [expanded]);

  if (expanded) {
    return (
      <div style={{ display: "flex", alignItems: "center",
        minHeight: L.touchTarget, minWidth: L.touchTarget }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 8px",
          background: "white",
          border: "1px solid #6e8bd4",
          borderRadius: 9999, width: 320,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
            width: 24, height: 24, flexShrink: 0 }}>
            <Icon name="search" size={16} style={{ color: "#606060" }} />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#252525", fontSize: 14, fontWeight: 400, lineHeight: "20px",
              letterSpacing: "0.3px", minWidth: 0,
              fontFamily: "'Red Hat Text', sans-serif",
            }}
          />
          {query.length > 0 && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer",
                padding: 0, borderRadius: 9999, flexShrink: 0,
                width: 24, height: 24,
              }}
            >
              <Icon name="cancel" size={20} style={{ color: "#606060" }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: L.touchTarget, minWidth: L.touchTarget }}>
      <button
        onClick={open}
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
export function TopNavActions({ breakpoint = "desktop", onNotifications, onMore }) {
  const [hov0, setHov0]       = useState(false);
  const [hov1, setHov1]       = useState(false);
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
          { hov: hov0, setHov: setHov0, label: "Notifications" },
          { hov: hov1, setHov: setHov1, label: "Alerts" },
        ].map(({ hov, setHov, label }, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: L.touchTarget, minWidth: L.touchTarget, padding: 6 }}>
            <button
              onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              onClick={onNotifications} aria-label={label}
              style={btnStyle(hov)}
            >
              <Icon name="notifications" size={20} style={{ color: T.monoBase }} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: L.touchTarget, minWidth: L.touchTarget }}>
      <button
        onMouseEnter={() => setHovMore(true)} onMouseLeave={() => setHovMore(false)}
        onClick={onMore} aria-label="More actions"
        style={btnStyle(hovMore)}
      >
        <Icon name="more_vert" size={20} style={{ color: T.monoBase }} />
      </button>
    </div>
  );
}

// ─── TopNavProfile ─────────────────────────────────────────────────────────────
export function TopNavProfile({ user, open, onToggle, mobile = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center",
      justifyContent: "center", minHeight: L.touchTarget, minWidth: L.touchTarget, padding: 2 }}>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        aria-haspopup="true" aria-expanded={open}
        aria-label={`Account — ${user.name}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44,
          background: open ? T.controlPressed : hov ? T.controlHover : "transparent",
          border: "none", borderRadius: "50%", cursor: "pointer", padding: 6,
          transition: "background 120ms ease",
        }}
      >
        <div style={{
          width: L.avatarSize, height: L.avatarSize, borderRadius: "50%",
          background: T.avatarBg, display: "flex", alignItems: "center", justifyContent: "center",
          // Desktop/Tablet: Text/Body/Small/Semibold 14px/600
          // Mobile: Text/Supporting/Small/Semibold 11px/600 (Figma)
          fontSize: mobile ? 11 : 14, fontWeight: 600, letterSpacing: "0.3px",
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

  const label = mobile
    ? mobileLabel(org.name, org.campus)
    : org.name + (org.campus ? " | " + org.campus : "");

  // Desktop/Tablet: Label/Button/S — 14px/500/20px
  // Mobile: Label/Button/XS — 12px/500/18px (Figma annotation)
  const labelStyle = mobile
    ? { fontSize: 12, fontWeight: 500, lineHeight: "18px", letterSpacing: "0.3px" }
    : { fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: "0.3px" };

  return (
    <div style={{ position: "relative", padding: mobile ? "4px 2px" : 4,
      maxWidth: mobile ? L.mobOrgMax : L.deskOrgMax }}>
      <button
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={onToggle}
        aria-haspopup="true" aria-expanded={open}
        aria-label={`Switch organisation — ${org.name}${org.campus ? ", "+org.campus : ""}`}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          minHeight: 36, padding: mobile ? "4px 2px" : 4, borderRadius: L.radius,
          background: open ? T.controlPressed : hov ? T.controlHover : T.orgFill,
          border: `1px solid ${open || hov ? T.orgStrokeHover : T.orgStroke}`,
          cursor: "pointer", color: T.monoBase, fontFamily: "inherit",
          transition: "background 150ms cubic-bezier(0.4,0,0.2,1), border-color 150ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Avatar container */}
        <div style={{ display: "flex", alignItems: "center", gap: 4,
          height: 20, padding: "0 2px" }}>
          <div style={{ width: L.orgAvatarSm, height: L.orgAvatarSm, padding: 2,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {/* Inner 20×20 avatar frame */}
            <div style={{
              width: L.orgAvatarNav, height: L.orgAvatarNav, borderRadius: L.radiusSm,
              border: `1px solid ${T.orgStroke}`,
              // With logo: transparent bg; no logo: Fill/Action/Secondary/Base per Figma
              background: hasLogo ? "transparent" : T.noLogoBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative", flexShrink: 0,
            }}>
              {hasLogo
                ? <img
                    src={org.logoUrl} alt=""
                    onError={() => setImgFailed(true)}
                    style={{ width: "100%", height: "100%", objectFit: "cover",
                      display: "block" }}
                  />
                : <OrgAvatarPlaceholder />
              }
            </div>
          </div>
          {/* Label */}
          <span
            aria-hidden={mobile ? "true" : undefined}
            style={{
              ...labelStyle,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: mobile ? 70 : 248, color: T.monoBase, paddingRight: 4,
            }}
          >
            {label}
          </span>
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
          transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
        }}>
          <Icon name="expand_more" size={16} style={{ color: T.monoBase }} />
        </div>
      </button>
    </div>
  );
}

// ─── ModuleSwitcher ────────────────────────────────────────────────────────────
export function ModuleSwitcher({ modules, activeId, open, onToggle, breakpoint = "desktop" }) {
  const [hov, setHov]   = useState(false);
  const active          = modules.find(m => m.id === activeId) || modules[0];
  const showLabel       = breakpoint === "desktop";

  return (
    <div style={{ position: "relative", padding: "4px 2px" }}>
      <button
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={onToggle}
        aria-haspopup="listbox" aria-expanded={open}
        aria-label={`Switch module — ${active.label}`}
        style={{
          display: "flex", alignItems: "center",
          maxHeight: L.modInnerH, minHeight: L.modInnerH, padding: 4, borderRadius: L.radius,
          background: open ? T.controlPressed : hov ? T.controlHover : "transparent",
          border: `1px solid ${open ? T.orgStrokeHover : "transparent"}`,
          cursor: "pointer", color: T.monoBase, fontFamily: "inherit",
          transition: "background 150ms cubic-bezier(0.4,0,0.2,1), border-color 150ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4,
          paddingRight: showLabel ? 2 : 0 }}>
          {/* Module icon — custom SVG for home; Material Symbol for all others */}
          <div style={{ width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0 }}>
            {active.id === "home"
              ? <HomeModuleIcon size={22} />
              : <Icon name={active.icon} size={22} style={{ color: T.monoBase }} />
            }
          </div>
          {/* Label — desktop only */}
          {showLabel && (
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px",
              letterSpacing: "0.3px", whiteSpace: "nowrap", overflow: "hidden",
              textOverflow: "ellipsis", maxWidth: 160, color: T.monoBase }}>
              {active.label}
            </span>
          )}
        </div>
        {/* Chevron */}
        <div style={{
          width: 16, height: 16, display: "flex", alignItems: "center",
          justifyContent: "center", marginLeft: 4,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
        }}>
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
 *   modules          — Array<{id, label, icon}>  (default: DEFAULT_MODULES)
 *   activeModuleId   — string
 *   org              — { id, name, campus?, initials, logoUrl?, bg? }
 *                      logoUrl absent or undefined → shows church placeholder icon
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
  user            = { name: "Jo Lopez", initials: "JL", email: "jo@sacredheart.org" },
  breakpoint      = "desktop",
  onModuleSelect,
  onOrgSelect,
  onSearchOpen,
  onSideNavToggle,
  onNotifications,
  onMore,
  className = "",
}) {
  const [openPanel, setOpenPanel]       = useState(null); // "module"|"org"|"profile"|null
  const [currentModuleId, setModuleId]  = useState(activeModuleId);
  const navRef                          = useRef(null);

  const isMobile  = breakpoint === "mobile";
  const isTablet  = breakpoint === "tablet";
  const padH      = isMobile ? L.mobPadH : isTablet ? L.tabPadH : L.deskPadH;
  const navH      = isTablet ? L.tabH : 56;

  const toggle = (p) => setOpenPanel(x => x === p ? null : p);
  const close  = () => setOpenPanel(null);

  useEffect(() => {
    const h = (e) => { if (!navRef.current?.contains(e.target)) close(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleModuleSelect = (id) => {
    setModuleId(id);
    close();
    onModuleSelect?.(id);
  };

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
        />

        {/* Module dropdown */}
        {openPanel === "module" && (
          <ul role="listbox" aria-label="Switch module"
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: padH,
              width: 243, background: "#fff",
              border: `1px solid ${T.panelBorder}`, borderRadius: L.radius,
              boxShadow: T.panelShadow, padding: 4, zIndex: 300,
              margin: 0, listStyle: "none",
              animation: "tnDropIn 200ms cubic-bezier(0,0,0.2,1) both",
            }}
          >
            {modules.map(m => (
              <li key={m.id} role="option" aria-selected={m.id === currentModuleId}>
                <button
                  onClick={() => handleModuleSelect(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 6, width: "100%", textAlign: "left",
                    color: m.id === currentModuleId ? T.itemText : T.itemTextBase,
                    fontSize: 13, fontWeight: m.id === currentModuleId ? 500 : 400,
                    background: m.id === currentModuleId ? T.activeItem : "transparent",
                    border: "none", fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  {/* Use custom SVG for home, Material Symbol for others */}
                  {m.id === "home"
                    ? <HomeModuleIcon size={18} />
                    : <Icon name={m.icon} size={18} style={{
                        color: m.id === currentModuleId ? T.itemText : T.itemTextBase, opacity: 0.8 }} />
                  }
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

        {/* Org panel (placeholder — full design pending §17) */}
        {openPanel === "org" && (
          <div role="dialog" aria-label="Switch organisation"
            style={{
              position: "absolute", top: "calc(100% + 4px)",
              left: isMobile ? padH : padH + 40,
              width: 280, background: "#fff",
              border: `1px solid ${T.panelBorder}`, borderRadius: L.radius,
              boxShadow: T.panelShadow, padding: 8, zIndex: 300,
              animation: "tnDropIn 200ms cubic-bezier(0,0,0.2,1) both",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em",
              textTransform: "uppercase", padding: "4px 8px 6px", color: "#b5b5b5" }}>
              Organisations
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10,
              padding: 8, borderRadius: 6, background: T.activeItem }}>
              <div style={{ width: L.orgAvatarPanel, height: L.orgAvatarPanel,
                borderRadius: L.radiusSm, background: org.bg || T.navBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
                border: `1px solid ${T.orgStroke}` }}>
                {hasLogo
                  ? <img src={org.logoUrl} alt="" style={{ width: "100%", height: "100%",
                      objectFit: "cover", display: "block" }} />
                  : <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{org.initials}</span>
                }
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

        <TopNavSearch onSearchOpen={onSearchOpen} />

        <TopNavActions breakpoint={breakpoint} onNotifications={onNotifications} onMore={onMore} />

        <TopNavProfile
          user={user}
          open={openPanel === "profile"}
          onToggle={() => toggle("profile")}
          mobile={isMobile}
        />

        {/* Profile menu */}
        {openPanel === "profile" && (
          <div role="menu"
            style={{
              position: "absolute", top: "calc(100% + 4px)", right: padH,
              width: 200, background: "#fff",
              border: `1px solid rgba(45,72,137,0.10)`, borderRadius: L.radius,
              boxShadow: T.panelShadow, padding: 4, zIndex: 300,
              animation: "tnDropIn 200ms cubic-bezier(0,0,0.2,1) both",
            }}
          >
            <div style={{ padding: "10px 12px 8px",
              borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: 4 }}>
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
