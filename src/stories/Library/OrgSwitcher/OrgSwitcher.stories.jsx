/**
 * OrgSwitcher — Storybook stories (v1 — trigger only)
 *
 * Spec: components/org-switcher/org-switcher-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583
 *
 * v1 scope: trigger control in the top nav only. The drop panel is a
 * placeholder and intentionally NOT spec'd or showcased here.
 */
import React, { useState } from "react";
import { OrgSwitcher } from "../../../../components/org-switcher/org-switcher.jsx";

// Sacred Heart Church logo exported from Figma node 40006817:14372.
// Storybook serves /components/* as static assets (see .storybook/main.js).
// Relative path (no leading slash) so it works both in dev (root) and on
// GitHub Pages (/pathway-ds/storybook/). Storybook's staticDirs maps
// ../components → /components inside the iframe.
const SACRED_HEART_LOGO = "components/org-switcher/assets/sacred-heart-logo.png";

// ── Demo data ─────────────────────────────────────────────────────────────────
// CityName.Catholic only renders for orgType === "catholic" (spec §0.1).
const ALL_MODULES = ["people","giving","app-builder","websites","streaming","content","communications","worship","protections","events","accounting"];
const DEMO_ORGS = [
  { id: "grace", name: "Grace Church",                     orgType: "protestant", logoUrl: SACRED_HEART_LOGO, modules: ALL_MODULES },
  { id: "city",  name: "City Hope Church",                 orgType: "protestant", logoUrl: SACRED_HEART_LOGO, modules: ALL_MODULES },
  { id: "nkbc",  name: "Northern Kentucky Baptist Church", orgType: "protestant", logoUrl: SACRED_HEART_LOGO, modules: ["people","giving","communications","events"] },
  { id: "cp",    name: "Cross Point",                      orgType: "protestant", logoUrl: SACRED_HEART_LOGO, modules: ALL_MODULES },
  { id: "shc",   name: "Sacred Heart Church-ITD",          orgType: "catholic",   cityName: "Knoxville", logoUrl: "", modules: ["people","giving","content","events"] },
];

// ── Presentation helpers ─────────────────────────────────────────────────────

/**
 * NavBar — a brand-blue strip that recreates the top-nav surface the trigger
 * lives on. No "Pathway" label or chrome — just the dark surface so the
 * trigger renders against the colour it was designed against.
 */
function NavBar({ children, height = 56, padX = 20 }) {
  return (
    <div style={{
      background: "#2d4889",
      height,
      padding: `0 ${padX}px`,
      borderRadius: 8,
      display: "flex", alignItems: "center",
      position: "relative", overflow: "visible",
      fontFamily: "'Red Hat Text', sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      {children}
    </div>
  );
}

/** Section caption above a demo */
function Caption({ children }) {
  return (
    <p style={{
      margin: "0 0 10px",
      fontSize: 11, fontWeight: 600,
      color: "#71717a",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontFamily: "'Red Hat Text', sans-serif",
    }}>
      {children}
    </p>
  );
}

/** Page wrapper for stories */
function StoryFrame({ children, gap = 24 }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap,
      padding: 0,
      fontFamily: "'Red Hat Text', sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      {children}
    </div>
  );
}

// ── Default export (meta) ───────────────────────────────────────────────────

export default {
  title: "Library/OrgSwitcher",
  component: OrgSwitcher,
  parameters: {
    docs: {
      description: {
        component:
          "**v1 — trigger only.** The OrgSwitcher trigger sits inside the dark brand-blue top nav and shows the active organisation. Catholic orgs render an additional city/diocese container after the org name; Protestant orgs render the org name alone. Mobile renders the trigger compacted to 108px with the org name truncated by `text-overflow: ellipsis`. " +
          "The drop panel is a placeholder in v1 and not part of the design system release — its visual is not authoritative.",
      },
    },
    layout: "padded",
    backgrounds: {
      default: "page",
      values: [
        { name: "page",  value: "#f5f7fb" },
        { name: "brand", value: "#2d4889" },
        { name: "dark",  value: "#0a1223" },
      ],
    },
  },
  argTypes: {
    orgName:     { control: "text",                      name: "Org name",     description: "Full organisation name. Desktop truncates at 180px; mobile truncates at 50px. Both use text-overflow: ellipsis." },
    orgType:     { control: { type: "radio" }, options: ["protestant", "catholic"], name: "Org type", description: "Discriminant — only \"catholic\" enables the CityName container. Protestant is the safe default." },
    cityName:    { control: "text",                      name: "City name",    description: "City/diocese name. RENDERED ONLY when orgType === \"catholic\" (spec §0.1). Ignored for Protestant orgs." },
    logoUrl:     { control: "text",                      name: "Logo URL",     description: "Org logo image URL. Empty → renders church SVG placeholder." },
    open:        { control: "boolean",                    name: "Open",         description: "Controlled open state — flips chevron (panel is placeholder in v1)." },
    disabled:    { control: "boolean",                    name: "Disabled",     description: "True for single-org users — trigger renders inert at 50% opacity." },
    mobile:      { control: "boolean",                    name: "Mobile",       description: "Force the mobile compact display regardless of viewport." },
  },
};

// ── 1. Playground ─────────────────────────────────────────────────────────────

function PlaygroundTemplate({ logoUrl, ...args }) {
  const [open, setOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState("grace");
  return (
    <StoryFrame>
      <NavBar>
        <OrgSwitcher
          {...args}
          logoUrl={logoUrl || undefined}
          orgs={DEMO_ORGS}
          activeOrgId={activeOrg}
          onOrgSelect={(id) => { setActiveOrg(id); setOpen(false); }}
          open={open}
          onClick={() => setOpen(o => !o)}
        />
      </NavBar>
    </StoryFrame>
  );
}

export const Playground = PlaygroundTemplate.bind({});
Playground.args = {
  orgName:    "Grace Community Church",
  orgType:    "protestant",
  cityName:   "",
  logoUrl:    SACRED_HEART_LOGO,
  open:       false,
  disabled:   false,
  mobile:     false,
};
Playground.storyName = "Playground";

// ── 2. Trigger states — Desktop ──────────────────────────────────────────────
// Static stories for each interaction state so designers can compare side by
// side. We can't show real hover/pressed without DOM events, so we set the
// `open` prop (which triggers the "active" styling) and the disabled prop.

export const DesktopVariants = () => (
  <StoryFrame>
    <div>
      <Caption>Default · Protestant org</Caption>
      <NavBar>
        <OrgSwitcher orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} />
      </NavBar>
    </div>
    <div>
      <Caption>Default · Catholic org (with City name)</Caption>
      <NavBar>
        <OrgSwitcher orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} />
      </NavBar>
    </div>
    <div>
      <Caption>No logo on file · church SVG placeholder</Caption>
      <NavBar>
        <OrgSwitcher orgName="Northern Kentucky Baptist Church" />
      </NavBar>
    </div>
    <div>
      <Caption>Open · chevron rotated, pressed-state styling</Caption>
      <NavBar>
        <OrgSwitcher orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} open onClick={() => {}} orgs={[]} />
      </NavBar>
    </div>
    <div>
      <Caption>Disabled · single-org user</Caption>
      <NavBar>
        <OrgSwitcher orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} disabled />
      </NavBar>
    </div>
  </StoryFrame>
);
DesktopVariants.storyName = "Desktop — variants";

// ── 3. Catholic vs Protestant (spec §0.1) ─────────────────────────────────────

export const CatholicVsProtestant = () => (
  <StoryFrame>
    <div>
      <Caption>Catholic org · CityName.Catholic container renders</Caption>
      <NavBar>
        <OrgSwitcher orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} />
      </NavBar>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#71717a" }}>
        <code>orgType="catholic" cityName="Knoxville"</code> → shows "Sacred Heart Church-ITD | Knoxville"
      </p>
    </div>
    <div>
      <Caption>Protestant org · CityName never renders (even if supplied)</Caption>
      <NavBar>
        <OrgSwitcher orgName="Grace Community Church" cityName="Atlanta" logoUrl={SACRED_HEART_LOGO} />
      </NavBar>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#71717a" }}>
        <code>cityName="Atlanta"</code> is passed but ignored — orgType defaults to "protestant" and the city container is not rendered at all.
      </p>
    </div>
  </StoryFrame>
);
CatholicVsProtestant.storyName = "Catholic vs Protestant rule";

// ── 4. Truncation behaviour ──────────────────────────────────────────────────

export const Truncation = () => (
  <StoryFrame>
    <div>
      <Caption>Short name · container shrinks to fit</Caption>
      <NavBar><OrgSwitcher orgName="Cross Point" logoUrl={SACRED_HEART_LOGO} /></NavBar>
    </div>
    <div>
      <Caption>Medium name · fits within 180px</Caption>
      <NavBar><OrgSwitcher orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} /></NavBar>
    </div>
    <div>
      <Caption>Long name · truncated by text-overflow ellipsis at 180px</Caption>
      <NavBar><OrgSwitcher orgName="Northern Kentucky Baptist Church Fellowship Ministries" logoUrl={SACRED_HEART_LOGO} /></NavBar>
    </div>
  </StoryFrame>
);
Truncation.storyName = "Truncation — short / medium / long";

// ── 5. Mobile ─────────────────────────────────────────────────────────────────

export const Mobile = () => (
  <StoryFrame>
    <div>
      <Caption>Mobile · 108px fixed, Label/Button/S 14px, truncated at 50px</Caption>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {DEMO_ORGS.map(o => (
          <NavBar key={o.id} height={56} padX={12}>
            <OrgSwitcher mobile orgName={o.name} orgType={o.orgType} cityName={o.cityName} logoUrl={o.logoUrl || undefined} />
          </NavBar>
        ))}
      </div>
    </div>
    <div>
      <Caption>How each name renders inside the 50px label container</Caption>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Red Hat Text', sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
            <th style={{ padding: "6px 8px" }}>Org name (source)</th>
            <th style={{ padding: "6px 8px" }}>Visible (truncated)</th>
          </tr>
        </thead>
        <tbody>
          {DEMO_ORGS.map(o => (
            <tr key={o.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "8px", color: "#363636" }}>{o.name}</td>
              <td style={{ padding: "8px", color: "#3555a0", fontFamily: "monospace" }}>{o.name.length > 7 ? o.name.slice(0, 7) + "…" : o.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </StoryFrame>
);
Mobile.storyName = "Mobile — compact (108px)";

// ── 6. Tokens — Typography ────────────────────────────────────────────────────

export const TokensTypography = () => {
  const rows = [
    { label: "Trigger label · desktop AND mobile", varname: "--semantic-type-desktop-label-button-s-",  size: "14px", weight: 500, lh: "20px", ls: "0.3px", note: "Both viewports use Label/Button/S in v1." },
  ];
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Typography tokens</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
            <th style={{ padding: "6px 8px" }}>Usage</th>
            <th style={{ padding: "6px 8px" }}>CSS variable prefix</th>
            <th style={{ padding: "6px 8px" }}>Size</th>
            <th style={{ padding: "6px 8px" }}>Weight</th>
            <th style={{ padding: "6px 8px" }}>Line height</th>
            <th style={{ padding: "6px 8px" }}>Letter spacing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "8px" }}>
                <div>{r.label}</div>
                <div style={{ fontSize: 11, color: "#71717a", marginTop: 2 }}>{r.note}</div>
              </td>
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
TokensTypography.parameters = { backgrounds: { default: "page" } };

// ── 7. Tokens — Fill / Stroke / Text / Icon ──────────────────────────────────

function TokenSwatchTable({ title, rows }) {
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8, marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
            <th style={{ padding: "6px 8px", width: 64 }}>Swatch</th>
            <th style={{ padding: "6px 8px" }}>Token</th>
            <th style={{ padding: "6px 8px" }}>Resolved value</th>
            <th style={{ padding: "6px 8px" }}>Usage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.token} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "8px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: "#2d4889", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ width: 28, height: 28, background: r.hex, borderRadius: 4, border: r.border || "none" }} />
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
}

export const TokensFill = () => (
  <div>
    <TokenSwatchTable title="Fill (dark mode)" rows={[
      { token: "fill.action.tertiary.base",         hex: "rgba(160,181,230,0.04)", usage: "Trigger background — base" },
      { token: "fill.action.primaryinverse.hover",  hex: "rgba(10,18,35,0.16)",    usage: "Trigger background — hover" },
      { token: "fill.action.primaryinverse.pressed",hex: "rgba(255,255,255,0.08)", usage: "Trigger background — pressed / open" },
      { token: "fill.action.secondary.base",        hex: "rgba(255,255,255,0.08)", usage: "Avatar placeholder background (no logo)" },
    ]} />
    <TokenSwatchTable title="Stroke (dark mode)" rows={[
      { token: "stroke.action.tertiary.base",       hex: "rgba(160,181,230,0.16)", usage: "Trigger + avatar border — base" },
      { token: "stroke.action.tertiary.hover",      hex: "rgba(160,181,230,0.20)", usage: "Trigger + avatar border — hover" },
      { token: "stroke.action.tertiary.pressed",    hex: "rgba(160,181,230,0.30)", usage: "Trigger + avatar border — pressed / open" },
    ]} />
    <TokenSwatchTable title="Text + Icon (dark mode)" rows={[
      { token: "text.action.mono.base",             hex: "#fbfbfb", usage: "Label — base", border: "1px solid #e5e7eb" },
      { token: "text.action.mono.hover",            hex: "#ffffff", usage: "Label — hover", border: "1px solid #e5e7eb" },
      { token: "icon.action.mono.base",             hex: "#fbfbfb", usage: "Chevron — base", border: "1px solid #e5e7eb" },
    ]} />
  </div>
);
TokensFill.storyName = "Tokens — Fill / Stroke / Text";
TokensFill.parameters = { backgrounds: { default: "page" } };

// ── 8. Standalone HTML Demo ──────────────────────────────────────────────────

export const StandaloneDemo = () => (
  <iframe
    src="/components/org-switcher/org-switcher.html"
    style={{ width: "100%", height: 680, border: "none", borderRadius: 8 }}
    title="OrgSwitcher standalone demo"
  />
);
StandaloneDemo.storyName = "Standalone HTML Demo";
StandaloneDemo.parameters = { layout: "fullscreen" };
