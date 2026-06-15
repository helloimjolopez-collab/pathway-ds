/**
 * TopNav.Global — Storybook stories
 *
 * Figma node: 40007067:6508  File: 3sw45aVcngFAmpbP6cfrXP
 * Spec: components/top-nav/top-nav-spec.md
 */

import React from "react";
import { TopNav, DEFAULT_MODULES, abbreviateOrg } from "../../../../components/top-nav/top-nav.jsx";

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

// ─── TopNavStory — thin adapter that renders the REAL <TopNav> ─────────────────
// Stories MUST render the real component (CLAUDE.md §10 / storybook-authoring.md),
// never a reimplementation. This only maps the flat Controls args onto TopNav's props.
function TopNavStory({
  orgName = "Sacred Heart Church-ITD", campusName = "Knoxville", logoUrl = "",
  userName = "Jo Lopez", userInitials = "JL", userEmail = "jo@sacredheart.org",
  activeModule = "home", mobile = false, tablet = false,
  showOrgs = false, showModule = false, showProfile = false,
  moduleSwitcherType = "interactive",
}) {
  const breakpoint = mobile ? "mobile" : tablet ? "tablet" : "desktop";
  const initialOpenPanel = showOrgs ? "org" : showModule ? "module" : showProfile ? "profile" : null;
  return (
    <TopNav
      breakpoint={breakpoint}
      activeModuleId={activeModule}
      moduleSwitcherType={moduleSwitcherType}
      initialOpenPanel={initialOpenPanel}
      org={{ id: "org", name: orgName, campus: campusName || undefined,
             initials: abbreviateOrg(orgName), logoUrl: logoUrl || undefined, bg: "#2d4889" }}
      user={{ name: userName, initials: userInitials, email: userEmail }}
    />
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
    activeModule:  { control: { type: "select" }, options: DEFAULT_MODULES.map(m => m.id),
                     name: "Active module",   description: "Which module is currently active" },
    mobile:        { control: "boolean", name: "Mobile layout",      description: "Show mobile variant: hamburger, abbreviated label, more_vert, 11px initials" },
    tablet:        { control: "boolean", name: "Tablet layout",      description: "Show tablet variant: icon-only module switcher, more_vert actions" },
    showOrgs:      { control: "boolean", name: "Org panel open",     description: "Pre-open the org switcher panel" },
    showModule:    { control: "boolean", name: "Module dropdown open" },
    showProfile:   { control: "boolean", name: "Profile menu open" },
    moduleSwitcherType: {
      control: { type: "select" }, options: ["interactive", "static"],
      name: "Module switcher variant",
      description: "interactive (default) = chevron + hover/pressed, opens the app switcher. static = Amplify Dashboard ONLY: current-module label with NO chevron, NO hover/pressed, not a control (the dashboard has nowhere to switch to). Maps to Figma's 'Type' variant property.",
    },
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
    moduleSwitcherType: "interactive",
  },
  parameters: {
    docs: { description: { story: "Full interactive desktop TopNav. Use the Controls panel to explore all props." } },
  },
};

const _capStyle = { padding: "10px 16px 6px", fontFamily: "'Red Hat Text',sans-serif", fontSize: 12,
  fontWeight: 600, color: "#8890b0", textTransform: "uppercase", letterSpacing: "0.06em" };

export const ModuleSwitcherVariants = {
  name: "ModuleSwitcher — interactive vs static",
  render: () => (
    <div>
      <div style={_capStyle}>Interactive (default) — every module</div>
      <TopNavStory {...Playground.args} moduleSwitcherType="interactive" />
      <div style={{ ..._capStyle, paddingTop: 28 }}>Static — Amplify Dashboard only (no chevron, no hover/pressed, not a control)</div>
      <TopNavStory {...Playground.args} moduleSwitcherType="static" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "**ModuleSwitcher `type` property (the Figma Type variant property).** `interactive` (default) is the switch-module control — chevron + hover/pressed, opens the app switcher. `static` is used **only on the Amplify Dashboard**, where the module switcher merely indicates the current location: no chevron, no hover/pressed, and it is not a button (there is nowhere to switch *to* from the dashboard). Maps to the Figma Type variant property. The OrgSwitcher is unaffected. See `top-nav-spec.md` §ModuleSwitcher properties + usage-by-context.",
      },
    },
  },
};

export const Mobile = {
  args: { ...Playground.args, mobile: true },
  // Shown at 393px to match real mobile viewport (iPhone 14 / most Android)
  render: (args) => (
    <div style={{ width: 393, margin: "0 auto", overflow: "hidden" }}>
      <TopNavStory {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: [
          "**Mobile layout — 393px viewport.** The bar is constrained to real mobile width here so it matches what users actually see.",
          "",
          "Changes at this breakpoint:",
          "- **Hamburger button** appears on the far left — tapping it opens/closes the **SideNav**. Without it the module side navigation is inaccessible on mobile.",
          "- Module label hidden (icon + chevron only)",
          "- Org label abbreviated to initials per AP rules (e.g. `SHC | KV`)",
          "- Notification bells replaced by a single `more_vert` button",
          "- Profile avatar uses 11px/600 initials (smaller scale)",
        ].join("\n"),
      },
    },
  },
  tags: ["!dev"],
};

export const Tablet = {
  args: { ...Playground.args, tablet: true },
  render: (args) => (
    <div style={{ width: 768, margin: "0 auto", overflow: "hidden" }}>
      <TopNavStory {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: { description: { story: "**Tablet layout — 768px viewport.** Module switcher shows icon + chevron only (no label). Action area collapses to `more_vert`. OrgSwitcher shows full name." } },
  },
  tags: ["!dev"],
};

export const OrgNoLogo = {
  args: { ...Playground.args, logoUrl: "" },
  parameters: {
    docs: { description: { story: "**Default state** — OrgSwitcher shows org name + chevron only. No logo, no avatar. This is the Figma default (`showOrgAvatar = false`). Pass `logoUrl` to show a logo." } },
  },
  tags: ["!dev"],
};

export const OrgPanelOpen = {
  args: { ...Playground.args, showOrgs: true },
  parameters: {
    docs: { description: { story: "Org switcher panel open. Active org is highlighted." } },
  },
  tags: ["!dev"],
};

export const ModuleDropdownOpen = {
  args: { ...Playground.args, showModule: true },
  parameters: {
    docs: { description: { story: "Module dropdown open. Amplify Home is active." } },
  },
  tags: ["!dev"],
};

export const ProfileMenuOpen = {
  args: { ...Playground.args, showProfile: true },
  parameters: {
    docs: { description: { story: "Profile menu open: name, email, Profile settings, Settings, Sign out." } },
  },
  tags: ["!dev"],
};

export const SingleOrg = {
  args: { ...Playground.args, orgName: "Cornerstone Church", campusName: "" },
  parameters: {
    docs: { description: { story: "Single-org user — no campus means the pipe separator is omitted from the OrgSwitcher label." } },
  },
  tags: ["!dev"],
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
  tags: ["!dev"],
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
  tags: ["!dev"],
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
  tags: ["!dev"],
  render: () => (
    <TokenTable title="Text tokens" rows={[
      <TokenRow key="mono"  varName="--semantic-color-dark-mode-text-action-mono-base"               fallback="#fbfbfb" label="All text on nav bar" type="text" />,
      <TokenRow key="avtxt" varName="--semantic-color-light-mode-text-static-accent-amethyst-contrast" fallback="#221e3f" label="Profile avatar initials" type="text" />,
    ]} />
  ),
  parameters: { docs: { description: { story: "Text tokens. Both are on the nav bar surface — mono/base for all labels, amethyst/contrast for avatar initials." } } },
};

export const TokensIcon = {
  tags: ["!dev"],
  render: () => (
    <TokenTable title="Icon tokens" rows={[
      <TokenRow key="icomono" varName="--semantic-color-dark-mode-icon-action-mono-base" fallback="#fbfbfb" label="All icons on nav bar surface" type="icon" />,
    ]} />
  ),
  parameters: { docs: { description: { story: "Icon tokens. All Material Symbol icons on the brand-blue surface use Icon/Action/Mono/Base." } } },
};

export const TokensTypography = {
  tags: ["!dev"],
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
  tags: ["!dev"],
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
