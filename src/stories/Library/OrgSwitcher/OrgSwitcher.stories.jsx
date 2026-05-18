/**
 * OrgSwitcher — Storybook stories
 *
 * Spec: components/org-switcher/org-switcher-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583
 */
import React, { useState } from "react";
import { OrgSwitcher, abbreviateOrg, abbreviateCampus, mobileLabel }
  from "../../../../components/org-switcher/org-switcher.jsx";

// ── Demo logo ─────────────────────────────────────────────────────────────────
// Sacred Heart Church logo exported from Figma node 40006817:14372.
// Storybook serves /components/* as static assets (see .storybook/main.js).
const SACRED_HEART_LOGO = "/components/org-switcher/assets/sacred-heart-logo.png";

// ── Demo data ─────────────────────────────────────────────────────────────────
// In production, `logoUrl` is the org's logo from MB's media service.
// Orgs with a logo on file → image. Orgs without → church placeholder SVG.
const DEMO_ORGS = [
  // Catholic org — has logo + cityName (diocese) per Figma annotation
  { id: "shc",  name: "Sacred Heart Church-ITD",          cityName: "Knoxville", campus: "Knoxville",       logoUrl: SACRED_HEART_LOGO, users: [{color:"#5b8def"},{color:"#9c6dd8"},{color:"#d96c6c"},{color:"#4caf7d"},{color:"#e08c2d"}] },
  // Protestant orgs — no cityName; mix of logo-on-file vs no-logo
  { id: "gcc",  name: "Grace Community Church",           cityName: "",          campus: "West",            logoUrl: SACRED_HEART_LOGO, users: [{color:"#5b8def"},{color:"#9c6dd8"},{color:"#d96c6c"}] },
  { id: "ncc",  name: "Nashville Christian Church",       cityName: "",          campus: "Nashville North", logoUrl: "",                users: [{color:"#4caf7d"},{color:"#e08c2d"},{color:"#2b9ec3"},{color:"#c45d9e"}] },
  { id: "nkbc", name: "Northern Kentucky Baptist Church", cityName: "",          campus: "",                logoUrl: "",                users: [{color:"#5b8def"},{color:"#7cb342"}] },
  { id: "cp",   name: "Cross Point",                      cityName: "",          campus: "Main Campus",     logoUrl: SACRED_HEART_LOGO, users: [{color:"#9c6dd8"},{color:"#d96c6c"},{color:"#e08c2d"}] },
];

// Dark nav background wrapper — matches the real shell surface the trigger lives on.
function DarkShell({ children, style }) {
  return (
    <div style={{
      background: "var(--semantic-color-light-mode-fill-static-brand-base, #2d4889)",
      borderRadius: 8,
      padding: "8px 12px",
      display: "inline-flex",
      alignItems: "flex-start",
      position: "relative",
      overflow: "visible",
      ...style,
    }}>
      {children}
    </div>
  );
}

export default {
  title: "Library/OrgSwitcher",
  component: OrgSwitcher,
  parameters: {
    docs: {
      description: {
        component: "OrgSwitcher — trigger + panel for switching organisation and city/diocese context. Lives on the dark brand-blue nav bar. Avatar renders the org's logo (`object-fit: cover`) when present, otherwise the church/building SVG placeholder per Figma node 40007243:73405. Catholic orgs render a second label container with the city/diocese name; Protestant orgs render only the org name. Mobile abbreviates per Appendix A.",
      },
    },
    layout: "padded",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0a1223" },
        { name: "brand", value: "#2d4889" },
        { name: "light", value: "#f5f7fb" },
      ],
    },
  },
  argTypes: {
    orgName:     { control: "text",    name: "Org name",     description: "Full organisation name (max 170px on desktop before truncation)" },
    cityName:    { control: "text",    name: "City name",    description: "Catholic orgs ONLY — city/diocese name shown after pipe on desktop (max 72px). NOT a suborg name." },
    campusName:  { control: "text",    name: "Campus name",  description: "Drives mobile abbreviated label (Appendix A §5). Empty if none." },
    logoUrl:     { control: "text",    name: "Logo URL",     description: "Org logo image URL. Empty → renders church SVG placeholder." },
    activeOrgId: { control: "text",    name: "Active org ID", description: "Which org is highlighted in the panel list" },
    open:        { control: "boolean", name: "Open",          description: "Controlled open state — flips chevron and shows panel" },
    disabled:    { control: "boolean", name: "Disabled",      description: "True for single-org users — trigger renders but panel does not open" },
    mobile:      { control: "boolean", name: "Mobile",        description: "Force mobile abbreviated display regardless of viewport" },
  },
};

// ── Playground ────────────────────────────────────────────────────────────────
function PlaygroundTemplate({ logoUrl, ...args }) {
  const [open, setOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState("shc");
  return (
    <DarkShell style={{ minHeight: 80 }}>
      <OrgSwitcher
        {...args}
        logoUrl={logoUrl || undefined}
        orgs={DEMO_ORGS}
        activeOrgId={activeOrg}
        onOrgSelect={(id) => { setActiveOrg(id); setOpen(false); }}
        open={open}
        onClick={() => setOpen(o => !o)}
      />
    </DarkShell>
  );
}

export const Playground = PlaygroundTemplate.bind({});
Playground.args = {
  orgName:    "Sacred Heart Church-ITD",
  cityName:   "Knoxville",
  campusName: "Knoxville",
  logoUrl:    SACRED_HEART_LOGO,
  activeOrgId: "shc",
  open:       false,
  disabled:   false,
  mobile:     false,
};
Playground.storyName = "Playground";

// ── With Logo (default state) ─────────────────────────────────────────────────
export const WithLogo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}>
    <div>
      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Red Hat Text', sans-serif" }}>
        Catholic org — logo image + city name (CityName.Catholic)
      </p>
      <DarkShell>
        <OrgSwitcher orgName="Sacred Heart Church-ITD" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} />
      </DarkShell>
    </div>
    <div>
      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Red Hat Text', sans-serif" }}>
        Protestant org — logo image, no city name
      </p>
      <DarkShell>
        <OrgSwitcher orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} />
      </DarkShell>
    </div>
  </div>
);
WithLogo.storyName = "With Logo (default state)";

// ── No Logo (church placeholder) ──────────────────────────────────────────────
export const NoLogo = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}>
    <div>
      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Red Hat Text', sans-serif" }}>
        No logo on file → church SVG placeholder on fill.action.secondary.base background
      </p>
      <DarkShell>
        <OrgSwitcher orgName="Sacred Heart Church-ITD" cityName="Knoxville" />
      </DarkShell>
    </div>
    <div>
      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Red Hat Text', sans-serif" }}>
        Protestant org — no logo, no city name
      </p>
      <DarkShell>
        <OrgSwitcher orgName="Grace Community Church" />
      </DarkShell>
    </div>
  </div>
);
NoLogo.storyName = "No Logo (church placeholder)";

// ── Panel Open ────────────────────────────────────────────────────────────────
export const PanelOpen = () => {
  const [activeOrg, setActiveOrg] = useState("shc");
  const current = DEMO_ORGS.find(o => o.id === activeOrg) || DEMO_ORGS[0];
  return (
    <DarkShell style={{ minHeight: 480 }}>
      <OrgSwitcher
        orgName={current.name}
        cityName={current.cityName}
        campusName={current.campus}
        logoUrl={current.logoUrl}
        orgs={DEMO_ORGS}
        activeOrgId={activeOrg}
        onOrgSelect={setActiveOrg}
        open={true}
        onClick={() => {}}
      />
    </DarkShell>
  );
};
PanelOpen.storyName = "Panel — Open";

// ── Mobile ────────────────────────────────────────────────────────────────────
export const Mobile = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 8 }}>
    {DEMO_ORGS.map(o => (
      <DarkShell key={o.id}>
        <OrgSwitcher mobile orgName={o.name} cityName={o.cityName} campusName={o.campus} logoUrl={o.logoUrl || undefined} />
      </DarkShell>
    ))}
  </div>
);
Mobile.storyName = "Mobile — abbreviated";

// ── Abbreviation Showcase ──────────────────────────────────────────────────────
const ABBR_EXAMPLES = [
  ["Grace Community Church",           "West"],
  ["Grace Community Church",           "Georgia"],
  ["Nashville Christian Church",       "Nashville North"],
  ["Nashville Christian Church",       "Nashville South"],
  ["Northern Kentucky Baptist Church", ""],
  ["Cross Point",                      "Main Campus"],
  ["Sacred Heart Church-ITD",          "Knoxville"],
  ["Northpoint Church",                ""],
  ["Northpoint Church",                "Knoxville"],
  ["Crossroads Church",                "Downtown"],
  ["Elevation",                        "Main Campus"],
  ["Church of the Highlands",          "North"],
  ["Knoxville Sanctuary",              "East"],
  ["Axios Church",                     "West"],
];

export const AbbreviationShowcase = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
    <p style={{ fontSize: 12, color: "#71717a", marginBottom: 16 }}>
      Abbreviation output per spec Appendix A. Compare desktop full label vs mobile abbreviated label.
    </p>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#71717a", fontWeight: 600 }}>Org name</th>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#71717a", fontWeight: 600 }}>Campus</th>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#3555a0", fontWeight: 700 }}>Mobile label</th>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#71717a", fontWeight: 600 }}>Org abbr.</th>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#71717a", fontWeight: 600 }}>Campus abbr.</th>
          <th style={{ textAlign: "left", padding: "6px 8px", color: "#71717a", fontWeight: 600 }}>Mobile trigger</th>
        </tr>
      </thead>
      <tbody>
        {ABBR_EXAMPLES.map(([org, campus], i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
            <td style={{ padding: "7px 8px" }}>{org}</td>
            <td style={{ padding: "7px 8px", color: "#71717a" }}>{campus || "—"}</td>
            <td style={{ padding: "7px 8px", fontWeight: 700, fontFamily: "monospace", color: "#363636" }}>
              {mobileLabel(org, campus)}
            </td>
            <td style={{ padding: "7px 8px", fontFamily: "monospace", color: "#71717a" }}>
              {abbreviateOrg(org)}
            </td>
            <td style={{ padding: "7px 8px", fontFamily: "monospace", color: "#71717a" }}>
              {campus ? abbreviateCampus(campus) : "—"}
            </td>
            <td style={{ padding: "4px 8px" }}>
              <div style={{ background: "#2d4889", borderRadius: 6, padding: "2px 4px", display: "inline-block" }}>
                <OrgSwitcher mobile orgName={org} campusName={campus} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
AbbreviationShowcase.storyName = "Abbreviation Showcase (Appendix A)";
AbbreviationShowcase.parameters = {
  backgrounds: { default: "light" },
};

// ── Tokens — Typography ────────────────────────────────────────────────────────
export const TokensTypography = () => {
  const rows = [
    { label: "Desktop trigger label",  varname: "--semantic-type-desktop-label-button-s-",  size: "14px", weight: 500, lh: "20px", ls: "0.3px" },
    { label: "Mobile abbreviated label", varname: "--semantic-type-desktop-label-button-xs-", size: "12px", weight: 500, lh: "18px", ls: "0.3px" },
  ];
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Typography tokens</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a" }}>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Usage</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>CSS variable prefix</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Size</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Weight</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Line height</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Letter spacing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "8px" }}>{r.label}</td>
              <td style={{ padding: "8px", fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>{r.varname}</td>
              <td style={{ padding: "8px", fontFamily: "monospace" }}>{r.size}</td>
              <td style={{ padding: "8px", fontFamily: "monospace" }}>{r.weight}</td>
              <td style={{ padding: "8px", fontFamily: "monospace" }}>{r.lh}</td>
              <td style={{ padding: "8px", fontFamily: "monospace" }}>{r.ls}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
TokensTypography.storyName = "Tokens — Typography";
TokensTypography.parameters = { backgrounds: { default: "light" } };

// ── Tokens — Fill / Stroke / Text / Icon ──────────────────────────────────────
export const TokensFill = () => {
  const rows = [
    { token: "fill.action.tertiary.base",         hex: "rgba(160,181,230,0.04)", usage: "Trigger background — base" },
    { token: "fill.action.primaryinverse.hover",  hex: "rgba(10,18,35,0.16)",    usage: "Trigger background — hover" },
    { token: "fill.action.primaryinverse.pressed",hex: "rgba(255,255,255,0.08)", usage: "Trigger background — pressed" },
    { token: "fill.action.secondary.base",        hex: "rgba(255,255,255,0.08)", usage: "Avatar placeholder background (no logo)" },
  ];
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Fill tokens (dark mode)</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a" }}>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Swatch</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Token</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Resolved value</th>
            <th style={{ textAlign: "left", padding: "6px 8px" }}>Usage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.token} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "8px" }}>
                <div style={{ width: 32, height: 32, borderRadius: 4, background: "#2d4889", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 24, height: 24, background: r.hex, borderRadius: 3 }} />
                </div>
              </td>
              <td style={{ padding: "8px", fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>{r.token}</td>
              <td style={{ padding: "8px", fontFamily: "monospace", fontSize: 12, color: "#71717a" }}>{r.hex}</td>
              <td style={{ padding: "8px", color: "#363636" }}>{r.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
TokensFill.storyName = "Tokens — Fill";
TokensFill.parameters = { backgrounds: { default: "light" } };

// ── States ─────────────────────────────────────────────────────────────────────
export const States = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 8 }}>
    {[
      { label: "Base",     props: {} },
      { label: "Disabled", props: { disabled: true } },
    ].map(({ label, props }) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 12, color: "#9ca3af", width: 72, fontFamily: "monospace" }}>{label}</span>
        <DarkShell>
          <OrgSwitcher orgName="Sacred Heart Church-ITD" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} {...props} />
        </DarkShell>
      </div>
    ))}
  </div>
);
States.storyName = "States — Base / Disabled";

// ── Standalone Demo ────────────────────────────────────────────────────────────
export const StandaloneDemo = () => (
  <iframe
    src="/components/org-switcher/org-switcher.html"
    style={{ width: "100%", height: 680, border: "none", borderRadius: 8 }}
    title="OrgSwitcher standalone demo"
  />
);
StandaloneDemo.storyName = "Standalone Demo";
StandaloneDemo.parameters = { layout: "fullscreen" };
