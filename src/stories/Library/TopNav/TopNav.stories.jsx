/**
 * TopNav.Global — Storybook stories
 *
 * Figma node: 40007067:6508  File: 3sw45aVcngFAmpbP6cfrXP
 * Spec: components/top-nav/top-nav-spec.md
 */

import React, { useState, useEffect, useRef } from "react";

// ─── Token CSS + Google Fonts (injected once) ─────────────────────────────────
if (typeof document !== "undefined") {
  if (!document.getElementById("pds-topnav-tokens")) {
    const link = document.createElement("link");
    link.id = "pds-topnav-tokens";
    link.rel = "stylesheet";
    link.href = "../../src/tokens/tokens.css";
    document.head.appendChild(link);
  }
  if (!document.getElementById("pds-topnav-fonts")) {
    const style = document.createElement("style");
    style.id = "pds-topnav-fonts";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
      @keyframes tnDropIn {
        from { opacity: 0; transform: translateY(-4px) scale(0.99); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .material-symbols-rounded {
        font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;
        line-height: 1; display: block; user-select: none;
      }
    `;
    document.head.appendChild(style);
  }
}

// ─── Design token constants ───────────────────────────────────────────────────
// Sourced from Figma get_variable_defs on node 40007067:6508
const T = {
  navBg:       "#2d4889",
  orgFill:     "rgba(160,181,230,0.04)",
  orgStroke:   "rgba(160,181,230,0.16)",
  searchFill:  "rgba(160,181,230,0.08)",
  hover:       "rgba(10,18,35,0.16)",
  pressed:     "rgba(255,255,255,0.08)",
  mono:        "#fbfbfb",
  avatarBg:    "#dcd9ef",
  avatarText:  "#221e3f",
  activeItem:  "#eef2fb",
  itemText:    "#252525",
  itemBase:    "#484848",
  itemMeta:    "#6b6b6b",
};

// ─── Abbreviation utilities — §10.2 ──────────────────────────────────────────
const SKIP = new Set(["the","a","an","of","in","at","for","and","or","but"]);

function abbreviateOrg(name) {
  const sig = name.replace(/-/g," ").split(/\s+/).filter(w => !SKIP.has(w.toLowerCase()));
  if (sig.length >= 3) return (sig[0][0]+sig[1][0]+sig[2][0]).toUpperCase();
  if (sig.length === 2) return (sig[0][0]+sig[1][0]+sig[1][0]).toUpperCase();
  return (sig[0]||"???").slice(0,3).toUpperCase();
}

const PLACE_SUFFIXES = [
  "ville","field","burg","burgh","berg","town","port","ford",
  "wood","land","dale","view","gate","bridge","worth","shire",
];

function abbreviateCampus(campus) {
  if (!campus) return "";
  const sig = campus.replace(/-/g," ").split(/\s+/).filter(w => !SKIP.has(w.toLowerCase()));
  if (!sig.length) return campus.slice(0,2).toUpperCase();
  if (sig.length >= 2) return (sig[0][0]+sig[1][0]).toUpperCase();
  // Single word — check compound place-name suffix (e.g. Knoxville → KV)
  const w = sig[0], wl = w.toLowerCase();
  for (const sfx of PLACE_SUFFIXES) {
    if (wl.endsWith(sfx) && w.length > sfx.length + 1) return (w[0]+sfx[0]).toUpperCase();
  }
  return (w[0]+w[w.length-1]).toUpperCase();
}

// ─── Shared demo data ─────────────────────────────────────────────────────────
const MODULES = [
  { id: "home",   label: "Amplify Home",   icon: "home" },
  { id: "people", label: "People",         icon: "group" },
  { id: "giving", label: "Giving",         icon: "volunteer_activism" },
  { id: "events", label: "Events",         icon: "event" },
  { id: "comms",  label: "Communications", icon: "mail" },
];

const ORGS = [
  { id: "shc",        name: "Sacred Heart Church-ITD", campus: "Knoxville",   initials: "SH", bg: "#2d4889" },
  { id: "fellowship", name: "Fellowship Church",        campus: "Main Campus", initials: "FC", bg: "#22386b" },
  { id: "grace",      name: "Grace Community Church",   campus: "West Campus", initials: "GC", bg: "#345499" },
];

// ─── FIGMA CUSTOM SVG ICONS ───────────────────────────────────────────────────
// Custom Figma exports — do NOT replace with Material Symbols.

// Module=Home, Style=Flat, Color=White (Figma node 40006853:34204)
const HOME_ICON_PATH =
  "M16.5811 38.6244V32.8265C16.5811 31.3486 17.7937 30.1359 19.2716 30.1359H24.7095C25.4295 30.1359 26.1116 30.4202 26.6232 30.9128C27.1347 31.4054 27.4189 32.0875 27.4189 32.8075V38.6054C27.4189 39.2307 27.6653 39.8181 28.1011 40.2538C28.5368 40.6896 29.1242 40.9359 29.7495 40.9359H33.4632C35.1874 40.9359 36.8547 40.2538 38.0863 39.0412C39.3179 37.8286 40 36.1802 40 34.4559V17.9717C40 16.5696 39.3747 15.2623 38.2947 14.3717L25.6568 4.34858C23.4589 2.58647 20.3137 2.64331 18.1726 4.48121L5.83789 14.3528C4.72 15.2244 4.03789 16.5317 4 17.9528V34.437C4 38.037 6.93684 40.9549 10.5368 40.9359H14.1747C15.4632 40.9359 16.5053 39.9128 16.5242 38.6244H16.5811Z";

// Org avatar placeholder — church icon (Figma node 40007243:73426;84:22159)
const CHURCH_ICON_PATH =
  "M0 12.6667V9.53333C0 9.26667 0.0722222 9.025 0.216667 8.80833C0.361111 8.59167 0.555556 8.42778 0.8 8.31667L2.66667 7.48333V6.15C2.66667 5.89444 2.73333 5.66389 2.86667 5.45833C3 5.25278 3.17778 5.08889 3.4 4.96667L6 3.66667V2.66667H5.33333C5.14444 2.66667 4.98611 2.60278 4.85833 2.475C4.73056 2.34722 4.66667 2.18889 4.66667 2C4.66667 1.81111 4.73056 1.65278 4.85833 1.525C4.98611 1.39722 5.14444 1.33333 5.33333 1.33333H6V0.666667C6 0.477778 6.06389 0.319444 6.19167 0.191667C6.31944 0.0638889 6.47778 0 6.66667 0C6.85556 0 7.01389 0.0638889 7.14167 0.191667C7.26944 0.319444 7.33333 0.477778 7.33333 0.666667V1.33333H8C8.18889 1.33333 8.34722 1.39722 8.475 1.525C8.60278 1.65278 8.66667 1.81111 8.66667 2C8.66667 2.18889 8.60278 2.34722 8.475 2.475C8.34722 2.60278 8.18889 2.66667 8 2.66667H7.33333V3.66667L9.93333 4.96667C10.1556 5.08889 10.3333 5.25278 10.4667 5.45833C10.6 5.66389 10.6667 5.89444 10.6667 6.15V7.48333L12.5333 8.31667C12.7778 8.42778 12.9722 8.59167 13.1167 8.80833C13.2611 9.025 13.3333 9.26667 13.3333 9.53333V12.6667C13.3333 13.0333 13.2028 13.3472 12.9417 13.6083C12.6806 13.8694 12.3667 14 12 14H8.66667C8.47778 14 8.31944 13.9361 8.19167 13.8083C8.06389 13.6806 8 13.5222 8 13.3333V12C8 11.6333 7.86944 11.3194 7.60833 11.0583C7.34722 10.7972 7.03333 10.6667 6.66667 10.6667C6.3 10.6667 5.98611 10.7972 5.725 11.0583C5.46389 11.3194 5.33333 11.6333 5.33333 12V13.3333C5.33333 13.5222 5.26944 13.6806 5.14167 13.8083C5.01389 13.9361 4.85556 14 4.66667 14H1.33333C0.966667 14 0.652778 13.8694 0.391667 13.6083C0.130556 13.3472 0 13.0333 0 12.6667ZM6.66667 8.33333C6.94444 8.33333 7.18056 8.23611 7.375 8.04167C7.56944 7.84722 7.66667 7.61111 7.66667 7.33333C7.66667 7.05556 7.56944 6.81944 7.375 6.625C7.18056 6.43056 6.94444 6.33333 6.66667 6.33333C6.38889 6.33333 6.15278 6.43056 5.95833 6.625C5.76389 6.81944 5.66667 7.05556 5.66667 7.33333C5.66667 7.61111 5.76389 7.84722 5.95833 8.04167C6.15278 8.23611 6.38889 8.33333 6.66667 8.33333Z";

/** Custom home icon for ModuleSwitcher. Figma: Module=Home, Style=Flat, Color=White */
function HomeModuleIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size}
      fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path d={HOME_ICON_PATH} fill="white" />
    </svg>
  );
}

/** Org avatar placeholder for orgs with no logo. Figma: church icon, node 40007243:73426 */
function OrgAvatarPlaceholder() {
  return (
    <div style={{ position: "absolute", inset: "4.17% 8.33% 8.33% 8.33%" }}>
      <svg viewBox="0 0 13.3333 14" width="100%" height="100%"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" style={{ display: "block" }}>
        <path d={CHURCH_ICON_PATH} fill="white" fillOpacity="0.7" />
      </svg>
    </div>
  );
}

// ─── Icon helper — Google Material Symbols ────────────────────────────────────
// Only for icons that ARE Material Symbols in Figma. Custom icons use the SVG components above.
function Icon({ name, size = 20, color }) {
  return (
    <span className="material-symbols-rounded" aria-hidden="true"
      style={{ fontSize: size, color: color || "inherit" }}>
      {name}
    </span>
  );
}

// ─── Inline style constants ───────────────────────────────────────────────────
const S = {
  nav: (padH) => ({
    background: `var(--semantic-color-light-mode-fill-static-brand-base, ${T.navBg})`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: 56, maxHeight: 56, padding: `4px ${padH}px`,
    position: "relative", overflow: "visible", zIndex: 100,
    fontFamily: "'Red Hat Text', sans-serif",
  }),
  start: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  end:   { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  modBtn: (isOpen, hov) => ({
    display: "flex", alignItems: "center", height: 36, padding: 4, gap: 0, borderRadius: 8,
    background: isOpen ? T.pressed : hov ? T.hover : "transparent",
    border: `1px solid ${isOpen ? "rgba(160,181,230,0.30)" : "transparent"}`,
    cursor: "pointer", color: T.mono, fontFamily: "inherit",
    transition: "background 120ms ease, border-color 120ms ease",
  }),
  orgBtn: (isOpen, hov) => ({
    display: "flex", alignItems: "center", gap: 4, minHeight: 36, padding: 4, borderRadius: 8,
    background: isOpen ? T.pressed : hov ? T.hover : T.orgFill,
    border: `1px solid ${isOpen || hov ? "rgba(160,181,230,0.20)" : T.orgStroke}`,
    cursor: "pointer", color: T.mono, fontFamily: "inherit",
    transition: "background 120ms ease, border-color 120ms ease",
  }),
  searchBtn: (hov) => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    height: 32, width: 32,
    background: hov ? T.hover : T.searchFill,
    border: `0.75px solid ${T.mono}`, borderRadius: 9999,
    cursor: "pointer", flexShrink: 0, color: T.mono,
    transition: "background 120ms ease",
  }),
  iconBtn: (hov) => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 8, borderRadius: 8,
    background: hov ? T.hover : "transparent", border: "none",
    cursor: "pointer", color: T.mono, transition: "background 120ms ease",
  }),
  profileBtn: (isOpen, hov) => ({
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 44, height: 44,
    background: isOpen ? T.pressed : hov ? T.hover : "transparent",
    border: "none", borderRadius: "50%", cursor: "pointer", padding: 6,
    transition: "background 120ms ease",
  }),
  avatar: (isMobile) => ({
    width: 32, height: 32, borderRadius: "50%",
    background: `var(--semantic-color-light-mode-fill-static-accent-amethyst-base, ${T.avatarBg})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    // Desktop/Tablet: 14px/600 | Mobile: 11px/600 (Text/Supporting/Small/Semibold)
    fontSize: isMobile ? 11 : 14, fontWeight: 600, letterSpacing: "0.3px",
    color: `var(--semantic-color-light-mode-text-static-accent-amethyst-contrast, ${T.avatarText})`,
    lineHeight: 1, flexShrink: 0,
  }),
  // orgAvatar base — background set dynamically per hasLogo state
  orgAvatar: (hasLogo) => ({
    width: 20, height: 20, borderRadius: 4,
    border: `1px solid ${T.orgStroke}`,
    // With logo: transparent; no logo: Fill/Action/Secondary/Base per Figma node 40007243:73405
    background: hasLogo ? "transparent" : "rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative",
  }),
  dropdown: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, width: 243,
    background: "#fff", border: "1px solid rgba(45,72,137,0.12)", borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
    padding: 4, zIndex: 300, animation: "tnDropIn 140ms ease-out both",
    listStyle: "none", margin: 0,
  },
  panel: {
    position: "absolute", top: "calc(100% + 4px)", left: 40, width: 280,
    background: "#fff", border: "1px solid rgba(45,72,137,0.12)", borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
    padding: 8, zIndex: 300, animation: "tnDropIn 140ms ease-out both",
  },
  profileMenu: {
    position: "absolute", top: "calc(100% + 4px)", right: 0, width: 200,
    background: "#fff", border: "1px solid rgba(45,72,137,0.10)", borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
    padding: 4, zIndex: 300, animation: "tnDropIn 140ms ease-out both",
  },
};

// ─── TopNavStory component ────────────────────────────────────────────────────
function TopNavStory({
  orgName      = "Sacred Heart Church-ITD",
  campusName   = "Knoxville",
  logoUrl      = "",
  userName     = "Jo Lopez",
  userInitials = "JL",
  userEmail    = "jo@sacredheart.org",
  activeModule = "home",
  mobile       = false,
  tablet       = false,
  showOrgs     = false,
  showModule   = false,
  showProfile  = false,
  onAction,
}) {
  const [openPanel, setOpenPanel] = useState(
    showOrgs ? "org" : showModule ? "module" : showProfile ? "profile" : null
  );
  const [moduleId, setModuleId]     = useState(activeModule);
  const [currentOrg, setOrg]        = useState(ORGS[0]);
  const [imgFailed, setImgFailed]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQ]   = useState("");
  const searchInputRef              = useRef(null);
  const [hovMod,  setHovMod]   = useState(false);
  const [hovOrg,  setHovOrg]   = useState(false);
  const [hovSrch, setHovSrch]  = useState(false);
  const [hovBell0,setHovBell0] = useState(false);
  const [hovBell1,setHovBell1] = useState(false);
  const [hovMore, setHovMore]  = useState(false);
  const [hovProf, setHovProf]  = useState(false);
  const navRef = useRef(null);

  const openSearch = () => {
    setSearchOpen(true);
    setOpenPanel(null);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };
  const closeSearch = () => { setSearchOpen(false); setSearchQ(""); };

  const isDesktop = !mobile && !tablet;
  const isMobile  = mobile;
  const padH = isMobile ? 8 : tablet ? 12 : 16;

  const toggle = p => setOpenPanel(x => x === p ? null : p);
  const close  = () => setOpenPanel(null);

  useEffect(() => {
    const h = e => { if (navRef.current && !navRef.current.contains(e.target)) close(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") { close(); closeSearch(); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const activeModData = MODULES.find(m => m.id === moduleId) || MODULES[0];
  const displayLabel = isMobile
    ? (abbreviateOrg(currentOrg.name) + (currentOrg.campus ? " | " + abbreviateCampus(currentOrg.campus) : ""))
    : currentOrg.name + (currentOrg.campus ? " | " + currentOrg.campus : "");

  return (
    <nav style={S.nav(padH)} aria-label="Global navigation" ref={navRef}
      className="pds-topnav-story">

      {/* ── START ── */}
      <div style={S.start}>

        {/* Hamburger (mobile) — icon: menu */}
        {isMobile && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:48, minWidth:48 }}>
            <button style={{ display:"flex", alignItems:"center", justifyContent:"center",
              minHeight:48, minWidth:48, background:"transparent", border:"none",
              cursor:"pointer", borderRadius:8, color: T.mono }}
              aria-label="Open navigation menu">
              <Icon name="menu" size={22} color={T.mono} />
            </button>
          </div>
        )}

        {/* ModuleSwitcher */}
        <div style={{ position:"relative", padding:"4px 2px" }}>
          <button
            style={S.modBtn(openPanel === "module", hovMod)}
            onMouseEnter={() => setHovMod(true)} onMouseLeave={() => setHovMod(false)}
            aria-haspopup="listbox" aria-expanded={openPanel === "module"}
            aria-label={`Switch module — ${activeModData.label}`}
            onClick={() => toggle("module")}
          >
            <div style={{ display:"flex", alignItems:"center", gap:4, paddingRight: isDesktop ? 2 : 0 }}>
              <div style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {/* Home module = custom Figma SVG; others = Material Symbol */}
                {activeModData.id === "home"
                  ? <HomeModuleIcon size={22} />
                  : <Icon name={activeModData.icon} size={22} color={T.mono} />
                }
              </div>
              {isDesktop && (
                <span style={{ fontSize:14, fontWeight:500, lineHeight:"20px", letterSpacing:"0.3px",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  maxWidth:160, color: T.mono }}>
                  {activeModData.label}
                </span>
              )}
            </div>
            <div style={{ width:16, height:16, display:"flex", alignItems:"center",
              justifyContent:"center", marginLeft:4,
              transform: openPanel === "module" ? "rotate(180deg)" : "none",
              transition:"transform 180ms ease" }}>
              <Icon name="expand_more" size={16} color={T.mono} />
            </div>
          </button>

          {openPanel === "module" && (
            <ul style={S.dropdown} role="listbox" aria-label="Switch module">
              {MODULES.map(m => (
                <li key={m.id} role="option" aria-selected={m.id === moduleId}>
                  <button
                    style={{ display:"flex", alignItems:"center", gap:10,
                      padding:"9px 10px", borderRadius:6,
                      color: m.id === moduleId ? T.itemText : T.itemBase,
                      fontSize:13, fontWeight: m.id === moduleId ? 500 : 400,
                      background: m.id === moduleId ? T.activeItem : "transparent",
                      border:"none", width:"100%", textAlign:"left",
                      fontFamily:"inherit", cursor:"pointer" }}
                    onClick={() => { setModuleId(m.id); close(); onAction?.("moduleSelect", m.id); }}
                  >
                    {m.id === "home"
                      ? <HomeModuleIcon size={18} />
                      : <Icon name={m.icon} size={18} color={m.id === moduleId ? T.itemText : T.itemBase} />
                    }
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* OrgSwitcher */}
        <div style={{ position:"relative", padding: isMobile ? "4px 2px" : 4,
          maxWidth: isMobile ? 120 : 316 }}>
          <button
            style={S.orgBtn(openPanel === "org", hovOrg)}
            onMouseEnter={() => setHovOrg(true)} onMouseLeave={() => setHovOrg(false)}
            aria-haspopup="true" aria-expanded={openPanel === "org"}
            aria-label={`Switch organisation — ${currentOrg.name}${currentOrg.campus ? ", "+currentOrg.campus : ""}`}
            onClick={() => toggle("org")}
          >
            <div style={{ display:"flex", alignItems:"center", gap:4, height:20, padding:"0 2px" }}>
              <div style={{ width:24, height:24, padding:2, display:"flex",
                alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {/* Avatar: with logo = image; no logo = church SVG placeholder (Figma 40007243:73405) */}
                <div style={S.orgAvatar(logoUrl && !imgFailed)}>
                  {logoUrl && !imgFailed
                    ? <img src={logoUrl} alt="" onError={() => setImgFailed(true)}
                        style={{ position:"absolute", width:"196.31%", height:"228.29%",
                          left:"-47.05%", top:"-63.31%" }} />
                    : <OrgAvatarPlaceholder />
                  }
                </div>
              </div>
              {/* Label/Button/XS on mobile (12px/500), Label/Button/S on desktop/tablet (14px/500) */}
              <span aria-hidden={isMobile ? "true" : undefined}
                style={{ fontSize: isMobile ? 12 : 14,
                  fontWeight:500,
                  lineHeight: isMobile ? "18px" : "20px",
                  letterSpacing:"0.3px",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  maxWidth: isMobile ? 70 : 248, color: T.mono, paddingRight:4 }}>
                {displayLabel}
              </span>
              {isMobile && (
                <span style={{ position:"absolute", left:-9999, width:1, height:1, overflow:"hidden" }}>
                  {currentOrg.name}{currentOrg.campus ? ", " + currentOrg.campus : ""}
                </span>
              )}
            </div>
            <div style={{ width:16, height:16, display:"flex", alignItems:"center",
              justifyContent:"center", marginRight:2,
              transform: openPanel === "org" ? "rotate(180deg)" : "none",
              transition:"transform 180ms ease" }}>
              <Icon name="expand_more" size={16} color={T.mono} />
            </div>
          </button>

          {openPanel === "org" && (
            <div style={S.panel} role="dialog" aria-label="Switch organisation">
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:".07em",
                textTransform:"uppercase", padding:"4px 8px 6px", color:"#b5b5b5" }}>
                Organisations
              </div>
              {ORGS.map(org => (
                <div key={org.id}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:8,
                    borderRadius:6, cursor:"pointer",
                    background: org.id === currentOrg.id ? T.activeItem : "transparent" }}
                  role="option" aria-selected={org.id === currentOrg.id} tabIndex={0}
                  onClick={() => { setOrg(org); close(); onAction?.("orgSelect", org.id); }}
                  onKeyDown={e => { if (e.key==="Enter"||e.key===" ") { setOrg(org); close(); } }}
                >
                  <div style={{ width:32, height:32, borderRadius:4, background:org.bg,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0 }}>
                    <span style={{ fontSize:9, fontWeight:700, color:"#fff" }}>{org.initials}</span>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:T.itemText,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{org.name}</div>
                    {org.campus && <div style={{ fontSize:11, color:T.itemMeta, marginTop:1 }}>{org.campus}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── END ── */}
      <div style={S.end}>

        {/* Search — collapsed pill / expanded input */}
        <div style={{ display:"flex", alignItems:"center", minHeight:48, minWidth:48 }}>
          {searchOpen ? (
            <div style={{ display:"flex", alignItems:"center", gap:4,
              height:32, padding:"0 6px 0 8px",
              background: T.searchFill, border:`0.75px solid ${T.mono}`,
              borderRadius: 9999, minWidth:200, maxWidth:280 }}>
              <Icon name="search" size={16} color={T.mono} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search…"
                aria-label="Search"
                style={{ flex:1, background:"transparent", border:"none", outline:"none",
                  color: T.mono, fontSize:13, fontWeight:400, minWidth:0,
                  fontFamily:"'Red Hat Text', sans-serif" }}
              />
              <button onClick={closeSearch} aria-label="Close search"
                style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  background:"transparent", border:"none", cursor:"pointer",
                  padding:3, borderRadius:4, flexShrink:0 }}>
                <Icon name="close" size={14} color={T.mono} />
              </button>
            </div>
          ) : (
            <button style={S.searchBtn(hovSrch)}
              onMouseEnter={() => setHovSrch(true)} onMouseLeave={() => setHovSrch(false)}
              aria-label="Open search" onClick={openSearch}>
              <Icon name="search" size={16} color={T.mono} />
            </button>
          )}
        </div>

        {/* Action icons
            Desktop  → two notification bells
            Tablet/Mobile → more_vert                     */}
        {isDesktop ? (
          <>
            {[
              { hov: hovBell0, setHov: setHovBell0, label: "Notifications" },
              { hov: hovBell1, setHov: setHovBell1, label: "Alerts" },
            ].map(({ hov, setHov, label }, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"center",
                minHeight:48, minWidth:48, padding:6 }}>
                <button style={S.iconBtn(hov)}
                  onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  aria-label={label}>
                  <Icon name="notifications" size={20} color={T.mono} />
                </button>
              </div>
            ))}
          </>
        ) : (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:48, minWidth:48 }}>
            <button style={S.iconBtn(hovMore)}
              onMouseEnter={() => setHovMore(true)} onMouseLeave={() => setHovMore(false)}
              aria-label="More actions">
              <Icon name="more_vert" size={20} color={T.mono} />
            </button>
          </div>
        )}

        {/* Profile */}
        <div style={{ position:"relative", display:"flex", alignItems:"center",
          justifyContent:"center", minHeight:48, minWidth:48, padding:2 }}>
          <button style={S.profileBtn(openPanel === "profile", hovProf)}
            onMouseEnter={() => setHovProf(true)} onMouseLeave={() => setHovProf(false)}
            aria-haspopup="true" aria-expanded={openPanel === "profile"}
            aria-label={`Account — ${userName}`}
            onClick={() => toggle("profile")}>
            <div style={S.avatar(isMobile)}>{userInitials}</div>
          </button>

          {openPanel === "profile" && (
            <div style={S.profileMenu} role="menu">
              <div style={{ padding:"10px 12px 8px", borderBottom:"1px solid rgba(0,0,0,0.06)", marginBottom:4 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.itemText }}>{userName}</div>
                <div style={{ fontSize:11, color:T.itemMeta, marginTop:1 }}>{userEmail}</div>
              </div>
              {["Profile settings","Settings"].map(label => (
                <button key={label} role="menuitem"
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
                    borderRadius:6, fontFamily:"inherit", fontSize:13, color:T.itemBase,
                    background:"transparent", border:"none", width:"100%",
                    textAlign:"left", cursor:"pointer" }}>
                  {label}
                </button>
              ))}
              <button role="menuitem"
                style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
                  borderRadius:6, fontFamily:"inherit", fontSize:13, color:"#c0392b",
                  background:"transparent", border:"none", width:"100%",
                  textAlign:"left", cursor:"pointer" }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── STORYBOOK CONFIG ─────────────────────────────────────────────────────────
export default {
  title: "Library/TopNav",
  component: TopNavStory,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Global navigation bar. Persists across all modules and viewports. Always on brand-blue surface (#2d4889). Uses dark-mode tokens throughout. Figma: node 40007067:6508.",
      },
    },
  },
  argTypes: {
    orgName:       { control: "text",    name: "Org name",           description: "Full organisation name" },
    campusName:    { control: "text",    name: "Campus name",        description: "Campus or sub-org name (empty string = no campus)" },
    logoUrl:       { control: "text",    name: "Logo URL",           description: "Org logo image URL. Omit (default) to show org name only — no avatar or placeholder." },
    userName:      { control: "text",    name: "User name",          description: "Displayed in profile menu header" },
    userInitials:  { control: "text",    name: "User initials",      description: "Two-letter initials for profile avatar" },
    userEmail:     { control: "text",    name: "User email",         description: "Email shown in profile menu" },
    activeModule:  { control: { type: "select" }, options: MODULES.map(m => m.id),
                     name: "Active module",   description: "Which module is currently active" },
    mobile:        { control: "boolean", name: "Mobile layout",      description: "Show mobile variant: hamburger, abbreviated label, more_vert, 11px initials" },
    tablet:        { control: "boolean", name: "Tablet layout",      description: "Show tablet variant: icon-only module switcher, more_vert actions" },
    showOrgs:      { control: "boolean", name: "Org panel open",     description: "Pre-open the org switcher panel" },
    showModule:    { control: "boolean", name: "Module dropdown open" },
    showProfile:   { control: "boolean", name: "Profile menu open" },
  },
};

// ─── STORIES ──────────────────────────────────────────────────────────────────

export const Playground = {
  args: {
    orgName: "Sacred Heart Church-ITD",
    campusName: "Knoxville",
    logoUrl: "",
    userName: "Jo Lopez",
    userInitials: "JL",
    userEmail: "jo@sacredheart.org",
    activeModule: "home",
    mobile: false,
    tablet: false,
    showOrgs: false,
    showModule: false,
    showProfile: false,
  },
  parameters: {
    docs: { description: { story: "Full interactive desktop TopNav. Use the Controls panel to explore all props." } },
  },
};

export const Mobile = {
  args: { ...Playground.args, mobile: true },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: { description: { story: 'Mobile layout (393px): hamburger visible, org label abbreviated per §10.2 AP rules ("SHC | KV" for Knoxville), action area shows more_vert, profile initials use 11px/600.' } },
  },
};

export const Tablet = {
  args: { ...Playground.args, tablet: true },
  parameters: {
    docs: { description: { story: "Tablet layout (768px): module switcher shows icon + chevron only (no label), action area shows more_vert instead of two bells." } },
  },
};

export const OrgNoLogo = {
  args: { ...Playground.args, logoUrl: "" },
  parameters: {
    docs: { description: { story: "Default state — no logo. The OrgSwitcher trigger shows org name and chevron only. No avatar frame, no church placeholder. Pass `logoUrl` to render an org logo." } },
  },
};

export const OrgPanelOpen = {
  args: { ...Playground.args, showOrgs: true },
  parameters: {
    docs: { description: { story: "Org switcher panel open. Lists all organisations. Active org highlighted with fill.action.primaryinverse token." } },
  },
};

export const ModuleDropdownOpen = {
  args: { ...Playground.args, showModule: true },
  parameters: {
    docs: { description: { story: "Module dropdown open. Amplify Home is active (highlighted). Material Symbol icons for each module." } },
  },
};

export const ProfileMenuOpen = {
  args: { ...Playground.args, showProfile: true },
  parameters: {
    docs: { description: { story: "Profile menu open: name, email, Profile settings, Settings, and the destructive Sign out item." } },
  },
};

export const SingleOrg = {
  args: { ...Playground.args, orgName: "Cornerstone Church", campusName: "" },
  parameters: {
    docs: { description: { story: "Single-org user: no campus means the pipe separator is omitted entirely from the OrgSwitcher label." } },
  },
};

// ─── TOKEN SHOWCASE STORIES ───────────────────────────────────────────────────
// Required by pipeline rules: every token category used by the component must
// have a dedicated story. Renders a visual reference swatch table.

function TokenRow({ varName, fallback, label, type = "fill" }) {
  const swatch = type === "text"
    ? { background: "#f0f2f5", color: `var(${varName}, ${fallback})`,
        fontSize: 14, fontWeight: 600, padding: "0 12px",
        display: "flex", alignItems: "center", justifyContent: "center" }
    : type === "icon"
    ? { background: "#2d4889", color: `var(${varName}, ${fallback})`,
        display: "flex", alignItems: "center", justifyContent: "center" }
    : type === "stroke"
    ? { background: "#2d4889",
        border: `2px solid var(${varName}, ${fallback})`,
        borderRadius: 4 }
    : { background: `var(${varName}, ${fallback})` };

  return (
    <tr>
      <td style={{ padding: "8px 12px", width: 200 }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0, ...swatch }}>
          {type === "text" && "Aa"}
          {type === "icon" && <Icon name="home" size={18} />}
        </div>
      </td>
      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "#484848" }}>
        {varName}
      </td>
      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        {fallback}
      </td>
      <td style={{ padding: "8px 12px", fontSize: 12, color: "#313131" }}>{label}</td>
    </tr>
  );
}

function TokenTable({ title, rows }) {
  return (
    <div style={{ padding: 24, fontFamily: "'Red Hat Text', sans-serif" }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#252525", marginBottom: 16 }}>{title}</h3>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
            {["Swatch","Token","Value","Usage"].map(h => (
              <th key={h} style={{ padding: "6px 12px", textAlign: "left",
                fontSize: 11, fontWeight: 600, color: "#888",
                letterSpacing: ".07em", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export const TokensFill = {
  render: () => (
    <TokenTable title="Fill tokens" rows={[
      <TokenRow key="brand"   varName="--semantic-color-light-mode-fill-static-brand-base"         fallback="#2d4889"               label="Nav bar background" />,
      <TokenRow key="org"     varName="--semantic-color-dark-mode-fill-action-tertiary-base"        fallback="rgba(160,181,230,0.04)" label="OrgSwitcher resting fill" />,
      <TokenRow key="search"  varName="--semantic-color-dark-mode-fill-action-primaryinverse-base"  fallback="rgba(160,181,230,0.08)" label="Search pill fill" />,
      <TokenRow key="hover"   varName="--semantic-color-dark-mode-fill-action-primaryinverse-hover" fallback="rgba(10,18,35,0.16)"    label="All controls hover" />,
      <TokenRow key="pressed" varName="--semantic-color-dark-mode-fill-action-primaryinverse-pressed" fallback="rgba(255,255,255,0.08)" label="All controls pressed / open" />,
      <TokenRow key="avbg"   varName="--semantic-color-light-mode-fill-static-accent-amethyst-base" fallback="#dcd9ef"               label="Profile avatar background" />,
    ]} />
  ),
  parameters: { docs: { description: { story: "All fill tokens used by TopNav.Global. Applied on the brand-blue surface via dark-mode token family." } } },
};

export const TokensStroke = {
  render: () => (
    <TokenTable title="Stroke tokens" rows={[
      <TokenRow key="orgborder"   varName="--semantic-color-dark-mode-stroke-action-tertiary-base"  fallback="rgba(160,181,230,0.16)" label="OrgSwitcher border" type="stroke" />,
      <TokenRow key="orghover"    varName="--semantic-color-dark-mode-stroke-action-tertiary-hover" fallback="rgba(160,181,230,0.20)" label="OrgSwitcher hover border" type="stroke" />,
      <TokenRow key="searchbdr"   varName="--semantic-color-dark-mode-icon-action-mono-base"        fallback="#fbfbfb"                label="Search pill border (0.75px)" type="stroke" />,
    ]} />
  ),
  parameters: { docs: { description: { story: "Stroke tokens. OrgSwitcher uses tertiary stroke family; search pill uses mono base at 0.75px." } } },
};

export const TokensText = {
  render: () => (
    <TokenTable title="Text tokens" rows={[
      <TokenRow key="mono"  varName="--semantic-color-dark-mode-text-action-mono-base"               fallback="#fbfbfb" label="All text on nav bar" type="text" />,
      <TokenRow key="avtxt" varName="--semantic-color-light-mode-text-static-accent-amethyst-contrast" fallback="#221e3f" label="Profile avatar initials" type="text" />,
    ]} />
  ),
  parameters: { docs: { description: { story: "Text tokens. Both are on the nav bar surface — mono/base for all labels, amethyst/contrast for avatar initials." } } },
};

export const TokensIcon = {
  render: () => (
    <TokenTable title="Icon tokens" rows={[
      <TokenRow key="icomono" varName="--semantic-color-dark-mode-icon-action-mono-base" fallback="#fbfbfb" label="All icons on nav bar surface" type="icon" />,
    ]} />
  ),
  parameters: { docs: { description: { story: "Icon tokens. All Material Symbol icons on the brand-blue surface use Icon/Action/Mono/Base." } } },
};

export const TokensTypography = {
  render: () => (
    <div style={{ padding: 24, fontFamily: "'Red Hat Text', sans-serif" }}>
      <h3 style={{ fontSize:14, fontWeight:600, color:"#252525", marginBottom:16 }}>Typography tokens</h3>
      {[
        { label: "Label/Button/S — module + org labels (desktop/tablet)", style: { fontSize:14, fontWeight:500, lineHeight:"20px", letterSpacing:"0.3px" }, example: "Amplify Home  |  Sacred Heart Church-ITD | Knoxville" },
        { label: "Label/Button/XS — org label mobile", style: { fontSize:12, fontWeight:500, lineHeight:"18px", letterSpacing:"0.3px" }, example: "SHC | KV" },
        { label: "Text/Supporting/Small/Semibold — profile initials mobile", style: { fontSize:11, fontWeight:600 }, example: "JL" },
      ].map(({ label, style, example }) => (
        <div key={label} style={{ marginBottom:20, padding:"12px 16px", background:"#f8f8f8", borderRadius:8 }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:".07em", textTransform:"uppercase", color:"#888", marginBottom:8 }}>{label}</div>
          <div style={{ ...style, color:"#313131" }}>{example}</div>
          <div style={{ marginTop:6, fontFamily:"monospace", fontSize:11, color:"#aaa" }}>
            {Object.entries(style).map(([k,v]) => `${k}: ${v}`).join("  ·  ")}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Typography token scale used by TopNav. Three distinct sizes driven by Label/Button/S, Label/Button/XS, and Text/Supporting/Small/Semibold." } } },
};

export const TokensRadius = {
  render: () => (
    <div style={{ padding:24, fontFamily:"'Red Hat Text', sans-serif" }}>
      <h3 style={{ fontSize:14, fontWeight:600, color:"#252525", marginBottom:16 }}>Corner radius tokens</h3>
      {[
        { token:"CornerRadius/Medium", value:"8px", label:"ModuleSwitcher, OrgSwitcher, icon buttons, dropdowns" },
        { token:"CornerRadius/Small",  value:"4px", label:"Org logo avatar (nav bar + panel)" },
        { token:"CornerRadius/Full",   value:"9999px", label:"Search pill" },
      ].map(({ token, value, label }) => (
        <div key={token} style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <div style={{ width:48, height:48, background:"#2d4889",
            borderRadius: value === "9999px" ? 9999 : value === "8px" ? 8 : 4,
            flexShrink:0 }} />
          <div>
            <div style={{ fontFamily:"monospace", fontSize:12, color:"#484848" }}>{token} — {value}</div>
            <div style={{ fontSize:12, color:"#888", marginTop:2 }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: "Corner radius tokens. Three values: Medium (8px) for interactive controls, Small (4px) for org avatars, Full (9999px) for the search pill." } } },
};

// StandaloneDemo — full iframe of the HTML demo file
export const StandaloneDemo = {
  render: () => (
    <iframe
      src="../../components/top-nav/top-nav.html"
      style={{ width: "100%", height: 700, border: "none", display: "block" }}
      title="TopNav.Global standalone demo"
    />
  ),
  parameters: {
    layout: "fullscreen",
    docs: { description: { story: "Full self-contained HTML demo. Loads real Pathway token CSS. Includes breakpoint switcher and all state variants." } },
  },
};
