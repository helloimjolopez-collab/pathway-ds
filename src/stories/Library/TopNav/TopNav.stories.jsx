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
      @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
      @keyframes tnDropIn {
        from { opacity: 0; transform: translateY(-4px) scale(0.99); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .material-symbols-outlined {
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

function abbreviateCampus(campus) {
  if (!campus) return "";
  const sig = campus.replace(/-/g," ").split(/\s+/).filter(w => !SKIP.has(w.toLowerCase()));
  if (!sig.length) return campus.slice(0,2).toUpperCase();
  if (sig.length === 1) { const w = sig[0]; return (w[0]+w[w.length-1]).toUpperCase(); }
  return (sig[0][0]+sig[1][0]).toUpperCase();
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

// ─── Icon helper — Google Material Symbols ────────────────────────────────────
function Icon({ name, size = 20, color }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true"
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
  orgAvatar: {
    width: 20, height: 20, borderRadius: 4,
    border: `1px solid ${T.orgStroke}`, background: "rgba(45,72,137,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative",
  },
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
  const [moduleId, setModuleId]   = useState(activeModule);
  const [currentOrg, setOrg]      = useState(ORGS[0]);
  const [imgFailed, setImgFailed] = useState(false);
  const [hovMod,  setHovMod]   = useState(false);
  const [hovOrg,  setHovOrg]   = useState(false);
  const [hovSrch, setHovSrch]  = useState(false);
  const [hovBell0,setHovBell0] = useState(false);
  const [hovBell1,setHovBell1] = useState(false);
  const [hovMore, setHovMore]  = useState(false);
  const [hovProf, setHovProf]  = useState(false);
  const navRef = useRef(null);

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
    const h = e => { if (e.key === "Escape") close(); };
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
              <div style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name={activeModData.icon} size={22} color={T.mono} />
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
                    <Icon name={m.icon} size={18}
                      color={m.id === moduleId ? T.itemText : T.itemBase} />
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
                <div style={S.orgAvatar}>
                  {logoUrl && !imgFailed
                    ? <img src={logoUrl} alt="" onError={() => setImgFailed(true)}
                        style={{ position:"absolute", width:"196.31%", height:"228.29%",
                          left:"-47.05%", top:"-63.31%" }} />
                    : <span style={{ fontSize:7, fontWeight:700, letterSpacing:".04em",
                        color: T.mono, lineHeight:1 }}>
                        {currentOrg.initials}
                      </span>
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

        {/* Search */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:48, minWidth:48 }}>
          <button style={S.searchBtn(hovSrch)}
            onMouseEnter={() => setHovSrch(true)} onMouseLeave={() => setHovSrch(false)}
            aria-label="Open search">
            <Icon name="search" size={16} color={T.mono} />
          </button>
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
    logoUrl:       { control: "text",    name: "Logo URL",           description: "Org logo image URL. Omit to see initials fallback." },
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

export const OrgLogoFallback = {
  args: { ...Playground.args, logoUrl: "" },
  parameters: {
    docs: { description: { story: "No logo URL — avatar falls back to initials. SH = first two significant letters from 'Sacred Heart Church-ITD'. Always prevents a broken image or empty box." } },
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
