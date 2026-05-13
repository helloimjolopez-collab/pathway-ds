/**
 * TopNav.Global — Storybook stories
 *
 * Figma node: 40007067:6508  File: 3sw45aVcngFAmpbP6cfrXP
 * Spec: components/top-nav/top-nav-spec.md
 *
 * Stories:
 *   Playground       — full interactive desktop nav
 *   Mobile           — 393px viewport, hamburger, abbreviated label
 *   OrgLogoFallback  — no logo: shows initials fallback
 *   MultiOrg         — org panel open with 3 orgs
 *   ModuleDropdown   — module dropdown open
 *   ProfileMenu      — profile menu open
 *   StandaloneDemo   — iframe to full HTML demo
 */

import React, { useState, useEffect, useRef } from "react";

// ─── TOKEN file injected once ─────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("pds-topnav-tokens")) {
  const link = document.createElement("link");
  link.id = "pds-topnav-tokens";
  link.rel = "stylesheet";
  // Storybook serves from /storybook/ so climb up to repo root
  link.href = "../../src/tokens/tokens.css";
  document.head.appendChild(link);
}

// ─── Keyframes ────────────────────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("pds-topnav-keyframes")) {
  const style = document.createElement("style");
  style.id = "pds-topnav-keyframes";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600;700&display=swap');
    @keyframes tnDropIn {
      from { opacity: 0; transform: translateY(-4px) scale(0.99); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes tnDropIn { from { opacity: 0; } to { opacity: 1; } }
    }
    .pds-topnav-story { font-family: 'Red Hat Text', sans-serif; }
  `;
  document.head.appendChild(style);
}

// ─── Inline styles (mirrors tokens.css vars — fallbacks for Storybook isolation) ─
const S = {
  nav: {
    background: "var(--semantic-color-light-mode-fill-static-brand-base, #2d4889)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    maxHeight: 56, padding: "4px 16px", position: "relative", overflow: "visible", zIndex: 100,
    fontFamily: "'Red Hat Text', sans-serif",
  },
  start: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  end:   { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  modInner: {
    display: "flex", alignItems: "center", maxHeight: 36, minHeight: 36, padding: 4,
    borderRadius: 8, background: "transparent", border: "1px solid transparent", cursor: "pointer",
    transition: "background 120ms ease, border-color 120ms ease",
    color: "var(--semantic-color-dark-mode-text-action-mono-base, #fbfbfb)",
    fontFamily: "inherit",
  },
  orgInner: {
    display: "flex", alignItems: "center", gap: 4, minHeight: 36, padding: 4, borderRadius: 8,
    background: "var(--semantic-color-dark-mode-fill-action-tertiary-base, rgba(160,181,230,0.04))",
    border: "1px solid var(--semantic-color-dark-mode-stroke-action-tertiary-base, rgba(160,181,230,0.16))",
    cursor: "pointer", color: "var(--semantic-color-dark-mode-text-action-mono-base, #fbfbfb)",
    fontFamily: "inherit", transition: "background 120ms ease, border-color 120ms ease",
  },
  searchBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: 32, width: 32,
    background: "var(--semantic-color-dark-mode-fill-action-primaryinverse-base, rgba(160,181,230,0.08))",
    border: "0.75px solid var(--semantic-color-dark-mode-icon-action-mono-base, #fbfbfb)",
    borderRadius: 9999, cursor: "pointer", padding: 8, flexShrink: 0,
  },
  actionBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "100%", height: "100%", padding: 8, borderRadius: 8,
    background: "transparent", border: "none", cursor: "pointer",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "var(--semantic-color-light-mode-fill-static-accent-amethyst-base, #dcd9ef)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 600, letterSpacing: "0.3px",
    color: "var(--semantic-color-light-mode-text-static-accent-amethyst-contrast, #221e3f)",
    lineHeight: 1, flexShrink: 0,
  },
  orgAvatarSm: {
    width: 20, height: 20, borderRadius: 4,
    border: "1px solid rgba(160,181,230,0.16)",
    background: "rgba(45,72,137,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative",
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, width: 243,
    background: "#fff", border: "1px solid rgba(45,72,137,0.12)", borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
    padding: 4, zIndex: 300, animation: "tnDropIn 140ms ease-out both",
  },
  panel: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, width: 280,
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

// ─── Demo data ────────────────────────────────────────────────────────────────
const MODULES = [
  { id: "home",   label: "Amplify Home" },
  { id: "people", label: "People" },
  { id: "giving", label: "Giving" },
  { id: "events", label: "Events" },
  { id: "comms",  label: "Communications" },
];
const ORGS = [
  { id: "shc",        name: "Sacred Heart Church-ITD", campus: "Knoxville",   initials: "SH", bg: "#2d4889" },
  { id: "fellowship", name: "Fellowship Church",        campus: "Main Campus", initials: "FC", bg: "#22386b" },
  { id: "grace",      name: "Grace Community Church",   campus: "West Campus", initials: "GC", bg: "#345499" },
];

// ─── SVG icons ────────────────────────────────────────────────────────────────
const ChevronIcon = () => (
  <svg width="10" height="6" viewBox="0 0 5.575 3.275" fill="none" style={{ display: "block" }}>
    <path d="M2.7875 3.275C2.72083 3.275 2.65833 3.26458 2.6 3.24375C2.54167 3.22292 2.4875 3.1875 2.4375 3.1375L0.1375 0.8375C0.0458333 0.745833 0 0.629167 0 0.4875C0 0.345833 0.0458333 0.229167 0.1375 0.1375C0.229167 0.0458333 0.345833 0 0.4875 0C0.629167 0 0.745833 0.0458333 0.8375 0.1375L2.7875 2.0875L4.7375 0.1375C4.82917 0.0458333 4.94583 0 5.0875 0C5.22917 0 5.34583 0.0458333 5.4375 0.1375C5.52917 0.229167 5.575 0.345833 5.575 0.4875C5.575 0.629167 5.52917 0.745833 5.4375 0.8375L3.1375 3.1375C3.0875 3.1875 3.03333 3.22292 2.975 3.24375C2.91667 3.26458 2.85417 3.275 2.7875 3.275Z" fill="#FBFBFB"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 44 44" fill="none">
    <path d="M16.5811 38.6244V32.8265C16.5811 31.3486 17.7937 30.1359 19.2716 30.1359H24.7095C25.4295 30.1359 26.1116 30.4202 26.6232 30.9128C27.1347 31.4054 27.4189 32.0875 27.4189 32.8075V38.6054C27.4189 39.2307 27.6653 39.8181 28.1011 40.2538C28.5368 40.6896 29.1242 40.9359 29.7495 40.9359H33.4632C35.1874 40.9359 36.8547 40.2538 38.0863 39.0412C39.3179 37.8286 40 36.1802 40 34.4559V17.9717C40 16.5696 39.3747 15.2623 38.2947 14.3717L25.6568 4.34858C23.4589 2.58647 20.3137 2.64331 18.1726 4.48121L5.83789 14.3528C4.72 15.2244 4.03789 16.5317 4 17.9528V34.437C4 38.037 6.93684 40.9549 10.5368 40.9359H14.1747C15.4632 40.9359 16.5053 39.9128 16.5242 38.6244H16.5811Z" fill="white"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="12" height="12" viewBox="0 0 11.7167 11.7167" fill="none">
    <path d="M4.33333 8.66667C3.12222 8.66667 2.09722 8.24722 1.25833 7.40833C0.419444 6.56944 0 5.54444 0 4.33333C0 3.12222 0.419444 2.09722 1.25833 1.25833C2.09722 0.419444 3.12222 0 4.33333 0C5.54444 0 6.56944 0.419444 7.40833 1.25833C8.24722 2.09722 8.66667 3.12222 8.66667 4.33333C8.66667 4.82222 8.58889 5.28333 8.43333 5.71667C8.27778 6.15 8.06667 6.53333 7.8 6.86667L11.5333 10.6C11.6556 10.7222 11.7167 10.8778 11.7167 11.0667C11.7167 11.2556 11.6556 11.4111 11.5333 11.5333C11.4111 11.6556 11.2556 11.7167 11.0667 11.7167C10.8778 11.7167 10.7222 11.6556 10.6 11.5333L6.86667 7.8C6.53333 8.06667 6.15 8.27778 5.71667 8.43333C5.28333 8.58889 4.82222 8.66667 4.33333 8.66667ZM4.33333 7.33333C5.16667 7.33333 5.875 7.04167 6.45833 6.45833C7.04167 5.875 7.33333 5.16667 7.33333 4.33333C7.33333 3.5 7.04167 2.79167 6.45833 2.20833C5.875 1.625 5.16667 1.33333 4.33333 1.33333C3.5 1.33333 2.79167 1.625 2.20833 2.20833C1.625 2.79167 1.33333 3.5 1.33333 4.33333C1.33333 5.16667 1.625 5.875 2.20833 6.45833C2.79167 7.04167 3.5 7.33333 4.33333 7.33333Z" fill="#FBFBFB"/>
  </svg>
);
const BellIcon = () => (
  <svg width="14" height="16" viewBox="0 0 13.3333 16.6667" fill="none">
    <path d="M0.833333 14.1667C0.597222 14.1667 0.399306 14.0868 0.239583 13.9271C0.0798611 13.7674 0 13.5694 0 13.3333C0 13.0972 0.0798611 12.8993 0.239583 12.7396C0.399306 12.5799 0.597222 12.5 0.833333 12.5H1.66667V6.66667C1.66667 5.51389 2.01389 4.48958 2.70833 3.59375C3.40278 2.69792 4.30556 2.11111 5.41667 1.83333V1.25C5.41667 0.902778 5.53819 0.607639 5.78125 0.364583C6.02431 0.121528 6.31944 0 6.66667 0C7.01389 0 7.30903 0.121528 7.55208 0.364583C7.79514 0.607639 7.91667 0.902778 7.91667 1.25V1.83333C9.02778 2.11111 9.93056 2.69792 10.625 3.59375C11.3194 4.48958 11.6667 5.51389 11.6667 6.66667V12.5H12.5C12.7361 12.5 12.934 12.5799 13.0938 12.7396C13.2535 12.8993 13.3333 13.0972 13.3333 13.3333C13.3333 13.5694 13.2535 13.7674 13.0938 13.9271C12.934 14.0868 12.7361 14.1667 12.5 14.1667H0.833333ZM6.66667 16.6667C6.20833 16.6667 5.81597 16.5035 5.48958 16.1771C5.16319 15.8507 5 15.4583 5 15H8.33333C8.33333 15.4583 8.17014 15.8507 7.84375 16.1771C7.51736 16.5035 7.125 16.6667 6.66667 16.6667ZM3.33333 12.5H10V6.66667C10 5.75 9.67361 4.96528 9.02083 4.3125C8.36806 3.65972 7.58333 3.33333 6.66667 3.33333C5.75 3.33333 4.96528 3.65972 4.3125 4.3125C3.65972 4.96528 3.33333 5.75 3.33333 6.66667V12.5Z" fill="white"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
    <path d="M1 1h16M1 7h16M1 13h16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ─── Shared TopNav React component (self-contained, no external deps) ─────────
function TopNavStory({
  orgName = "Sacred Heart Church-ITD",
  campusName = "Knoxville",
  logoUrl,
  userName = "Jo Lopez",
  userInitials = "JL",
  userEmail = "jo@sacredheart.org",
  activeModule = "home",
  showOrgs = false,
  showModule = false,
  showProfile = false,
  mobile = false,
  onAction,
}) {
  const [openPanel, setOpenPanel] = useState(
    showOrgs ? "org" : showModule ? "module" : showProfile ? "profile" : null
  );
  const [currentModule, setCurrentModule]   = useState(activeModule);
  const [currentOrg, setCurrentOrg]         = useState(ORGS[0]);
  const [imgFailed, setImgFailed]           = useState(false);
  const navRef = useRef(null);

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

  const abbreviated = (() => {
    const SKIP = new Set(["the","a","an","of","in","at","for","and","or","but"]);
    const words = currentOrg.name.replace(/-/g," ").split(/\s+/).filter(Boolean);
    const sig = words.filter(w => !SKIP.has(w.toLowerCase()));
    let abbr;
    if (sig.length >= 3) abbr = sig[0][0]+sig[1][0]+sig[2][0];
    else if (sig.length === 2) abbr = sig[0][0]+sig[1][0]+sig[1][0];
    else abbr = sig[0].slice(0,3);
    const ca = currentOrg.campus ? (" | " + currentOrg.campus.split(/\s+/).slice(0,2).map((w,i,a) => i===0&&a.length>1?w[0]:a.length===1?w.slice(0,2):w[0]).join("").toUpperCase()) : "";
    return abbr.toUpperCase() + ca;
  })();

  const displayLabel = mobile
    ? abbreviated
    : currentOrg.name + (currentOrg.campus ? " | " + currentOrg.campus : "");

  return (
    <nav style={S.nav} aria-label="Global navigation" ref={navRef}>
      <div style={S.start}>
        {mobile && (
          <button
            style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:48, minWidth:48, background:"transparent", border:"none", cursor:"pointer", borderRadius:8 }}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>
        )}
        {/* ModuleSwitcher */}
        <div style={{ position:"relative", padding:"4px 2px" }}>
          <button
            style={{
              ...S.modInner,
              background: openPanel==="module" ? "rgba(255,255,255,0.08)" : "transparent",
              borderColor: openPanel==="module" ? "rgba(160,181,230,0.30)" : "transparent",
            }}
            aria-haspopup="listbox"
            aria-expanded={openPanel==="module"}
            aria-label={`Switch module — ${MODULES.find(m=>m.id===currentModule)?.label}`}
            onClick={() => toggle("module")}
          >
            <div style={{ display:"flex", alignItems:"center", gap:4, paddingRight:2 }}>
              <div style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <HomeIcon />
              </div>
              {!mobile && (
                <span style={{ fontSize:14, fontWeight:500, lineHeight:"20px", letterSpacing:"0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:160, color:"#fbfbfb" }}>
                  {MODULES.find(m=>m.id===currentModule)?.label}
                </span>
              )}
            </div>
            <div style={{ width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", marginLeft:4, transform: openPanel==="module" ? "rotate(180deg)" : "none", transition:"transform 180ms ease" }}>
              <ChevronIcon />
            </div>
          </button>
          {openPanel==="module" && (
            <ul style={S.dropdown} role="listbox" aria-label="Switch module">
              {MODULES.map(m => (
                <li key={m.id} role="option" aria-selected={m.id===currentModule}>
                  <button
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:6, color: m.id===currentModule?"#252525":"#484848", fontSize:13, fontWeight: m.id===currentModule?500:400, background: m.id===currentModule?"#eef2fb":"transparent", border:"none", width:"100%", textAlign:"left", fontFamily:"inherit", cursor:"pointer" }}
                    onClick={() => { setCurrentModule(m.id); close(); onAction?.("moduleSelect", m.id); }}
                  >
                    <span style={{ opacity: m.id===currentModule?1:0.7, width:18, height:18 }}>
                      <HomeIcon />
                    </span>
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* OrgSwitcher */}
        <div style={{ position:"relative", padding:4, maxWidth: mobile?160:316 }}>
          <button
            style={{
              ...S.orgInner,
              background: openPanel==="org" ? "rgba(255,255,255,0.08)" : S.orgInner.background,
              borderColor: openPanel==="org" ? "rgba(160,181,230,0.30)" : "rgba(160,181,230,0.16)",
            }}
            aria-haspopup="true"
            aria-expanded={openPanel==="org"}
            aria-label={`Switch organisation — ${currentOrg.name}${currentOrg.campus?", "+currentOrg.campus:""}`}
            onClick={() => toggle("org")}
          >
            <div style={{ display:"flex", alignItems:"center", gap:4, height:20, padding:"0 2px" }}>
              <div style={{ width:24, height:24, padding:2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <div style={S.orgAvatarSm}>
                  {logoUrl && !imgFailed
                    ? <img src={logoUrl} alt="" onError={() => setImgFailed(true)} style={{ position:"absolute", width:"196.31%", height:"228.29%", left:"-47.05%", top:"-63.31%" }} />
                    : <span style={{ fontSize:7, fontWeight:700, letterSpacing:".04em", color:"#fbfbfb", lineHeight:1 }}>{currentOrg.initials}</span>
                  }
                </div>
              </div>
              <span aria-hidden={mobile?"true":undefined} style={{ fontSize: mobile?13:14, fontWeight:500, lineHeight:"20px", letterSpacing:"0.3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth: mobile?70:248, color:"#fbfbfb", paddingRight:4 }}>
                {displayLabel}
              </span>
            </div>
            <div style={{ width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", transform: openPanel==="org"?"rotate(180deg)":"none", transition:"transform 180ms ease" }}>
              <ChevronIcon />
            </div>
          </button>
          {openPanel==="org" && (
            <div style={S.panel} role="dialog" aria-label="Switch organisation">
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:".07em", textTransform:"uppercase", padding:"4px 8px 6px", color:"#b5b5b5" }}>Organisations</div>
              {ORGS.map(org => (
                <div key={org.id}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:8, borderRadius:6, cursor:"pointer", background: org.id===currentOrg.id?"#eef2fb":"transparent" }}
                  onClick={() => { setCurrentOrg(org); close(); onAction?.("orgSelect", org.id); }}
                  role="option" aria-selected={org.id===currentOrg.id}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key==="Enter"||e.key===" ") { setCurrentOrg(org); close(); } }}
                >
                  <div style={{ width:32, height:32, borderRadius:4, background:org.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                    <span style={{ fontSize:9, fontWeight:700, color:"#fff" }}>{org.initials}</span>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"#252525", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{org.name}</div>
                    {org.campus && <div style={{ fontSize:11, color:"#6b6b6b", marginTop:1 }}>{org.campus}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={S.end}>
        {/* Search */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:48, minWidth:48 }}>
          <button style={S.searchBtn} aria-label="Open search">
            <SearchIcon />
          </button>
        </div>
        {/* Bell icons — hidden on mobile */}
        {!mobile && (
          <div style={{ display:"flex", alignItems:"center" }}>
            {[0,1].map(i => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:48, minWidth:48, padding:6 }}>
                <button style={S.actionBtn} aria-label={i===0?"Notifications":"Alerts"}>
                  <BellIcon />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Profile */}
        <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", minHeight:48, minWidth:48, padding:2 }}>
          <button
            style={{ display:"flex", alignItems:"center", justifyContent:"center", width:44, height:44, background: openPanel==="profile"?"rgba(255,255,255,0.08)":"transparent", border:"none", borderRadius:"50%", cursor:"pointer", padding:6 }}
            aria-haspopup="true"
            aria-expanded={openPanel==="profile"}
            aria-label={`Account — ${userName}`}
            onClick={() => toggle("profile")}
          >
            <div style={S.avatar}>{userInitials}</div>
          </button>
          {openPanel==="profile" && (
            <div style={S.profileMenu} role="menu">
              <div style={{ padding:"10px 12px 8px", borderBottom:"1px solid rgba(0,0,0,0.06)", marginBottom:4 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#252525" }}>{userName}</div>
                <div style={{ fontSize:11, color:"#6b6b6b", marginTop:1 }}>{userEmail}</div>
              </div>
              {["Profile settings","Settings"].map(label => (
                <button key={label} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:6, fontFamily:"inherit", fontSize:13, color:"#313131", background:"transparent", border:"none", width:"100%", textAlign:"left", cursor:"pointer" }} role="menuitem">{label}</button>
              ))}
              <button style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:6, fontFamily:"inherit", fontSize:13, color:"#c0392b", background:"transparent", border:"none", width:"100%", textAlign:"left", cursor:"pointer" }} role="menuitem">Sign out</button>
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
    docs: { description: { component: "Global navigation bar. Persists across all modules. Always on brand-blue surface. Uses dark-mode tokens throughout. Figma node: 40007067:6508." } },
  },
  argTypes: {
    orgName:       { control: "text",    name: "Org name",        description: "Full organisation name" },
    campusName:    { control: "text",    name: "Campus name",     description: "Campus or sub-org name (empty = no campus)" },
    logoUrl:       { control: "text",    name: "Logo URL",        description: "Org logo image URL — omit to see initials fallback" },
    userName:      { control: "text",    name: "User name",       description: "User display name" },
    userInitials:  { control: "text",    name: "User initials",   description: "Two-letter initials for avatar" },
    userEmail:     { control: "text",    name: "User email",      description: "Email shown in profile menu" },
    activeModule:  { control: { type: "select" }, options: MODULES.map(m=>m.id), name: "Active module" },
    mobile:        { control: "boolean", name: "Mobile layout",   description: "Show mobile variant (hamburger, abbreviated label, no bell icons)" },
    showOrgs:      { control: "boolean", name: "Org panel open",  description: "Pre-open the org switcher panel" },
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
    showOrgs: false,
    showModule: false,
    showProfile: false,
  },
  parameters: {
    docs: { description: { story: "Full interactive desktop TopNav. Use the Controls panel to explore all props." } },
  },
};

export const Mobile = {
  args: {
    ...Playground.args,
    mobile: true,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: { description: { story: "Mobile layout: hamburger visible, org label abbreviated (SHC | KNX), bell icons hidden." } },
  },
};

export const OrgLogoFallback = {
  args: {
    ...Playground.args,
    logoUrl: "",
    orgName: "Sacred Heart Church-ITD",
    campusName: "Knoxville",
  },
  parameters: {
    docs: { description: { story: "When no logo URL is provided, the avatar falls back to initials. SH = first two significant letters of 'Sacred Heart Church-ITD'." } },
  },
};

export const OrgPanelOpen = {
  args: {
    ...Playground.args,
    showOrgs: true,
  },
  parameters: {
    docs: { description: { story: "Org switcher panel open. Shows all 3 orgs with fallback initials avatars. Active org highlighted." } },
  },
};

export const ModuleDropdownOpen = {
  args: {
    ...Playground.args,
    showModule: true,
  },
  parameters: {
    docs: { description: { story: "Module switcher dropdown open. Amplify Home is active." } },
  },
};

export const ProfileMenuOpen = {
  args: {
    ...Playground.args,
    showProfile: true,
  },
  parameters: {
    docs: { description: { story: "Profile menu open showing name, email, and three actions including the destructive Sign out item." } },
  },
};

export const SingleOrg = {
  args: {
    ...Playground.args,
    orgName: "Cornerstone Church",
    campusName: "",
  },
  parameters: {
    docs: { description: { story: "Single-org mode: no campus name, no pipe separator in the OrgSwitcher label." } },
  },
};

export const StandaloneDemo = {
  render: () => (
    <iframe
      src="/components/top-nav/top-nav.html"
      style={{ width: "100%", height: 400, border: "none", display: "block" }}
      title="TopNav.Global standalone demo"
    />
  ),
  parameters: {
    layout: "fullscreen",
    docs: { description: { story: "Full standalone HTML demo served from the repo. Fully interactive, responsive." } },
  },
};
