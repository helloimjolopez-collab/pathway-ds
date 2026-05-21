/**
 * OrgSwitcher — Storybook stories (v1, trigger only)
 *
 * Spec:  components/org-switcher/org-switcher-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583
 *
 * Stories render <OrgSwitcher> directly. No wrapper components are invented —
 * the trigger needs a dark surface behind it because its colour tokens are
 * dark-mode, so each story sets `parameters.backgrounds.default = "brand"`
 * to put Storybook's built-in canvas background on the brand-blue colour.
 */
import React, { useState } from "react";
import { OrgSwitcher } from "../../../../components/org-switcher/org-switcher.jsx";

// Sacred Heart Church logo exported from Figma node 40006817:14372.
// Storybook serves /components/* as static assets (.storybook/main.js
// staticDirs maps ../components → /components inside the iframe). Relative
// path (no leading slash) so the asset resolves on both localhost and on
// GitHub Pages at /pathway-ds/storybook/.
const SACRED_HEART_LOGO = "components/org-switcher/assets/sacred-heart-logo.png";

const BRAND_BG = { default: "brand", values: [
  { name: "brand", value: "#2d4889" },
  { name: "dark",  value: "#0a1223" },
  { name: "page",  value: "#f5f7fb" },
] };

export default {
  title: "Library/OrgSwitcher",
  component: OrgSwitcher,
  parameters: {
    layout: "padded",
    backgrounds: BRAND_BG,
    docs: {
      description: {
        component:
          "**v1 — trigger only.** The OrgSwitcher trigger sits inside the dark brand-blue top nav and shows the active organisation. Catholic orgs render a second container (city/diocese) after the org name per spec §0.1; Protestant orgs render the org name on its own. Mobile compacts the trigger to a fixed 108px and truncates the org name inside a 50px label container. " +
          "The drop panel is intentionally NOT part of v1 — it will get its own design pass later.",
      },
    },
  },
  argTypes: {
    orgName:  { control: "text",                                              name: "Org name",   description: "Full organisation name. Desktop ellipsis at 180px; mobile ellipsis at 50px." },
    orgType:  { control: { type: "radio" }, options: ["protestant","catholic"], name: "Org type",   description: "Discriminant. Only \"catholic\" enables the CityName container (spec §0.1)." },
    cityName: { control: "text",                                              name: "City name",  description: "Catholic orgs only. Ignored when orgType is \"protestant\"." },
    logoUrl:  { control: "text",                                              name: "Logo URL",   description: "Empty → church SVG placeholder." },
    open:     { control: "boolean",                                            name: "Open",       description: "Controlled. Flips chevron and applies pressed styling." },
    disabled: { control: "boolean",                                            name: "Disabled",   description: "Inert at 50% opacity — single-org users." },
    mobile:   { control: "boolean",                                            name: "Mobile",     description: "Force the compact mobile layout regardless of viewport." },
  },
};

// ── Playground ───────────────────────────────────────────────────────────────

function PlaygroundTemplate(args) {
  const [open, setOpen] = useState(args.open || false);
  return (
    <OrgSwitcher
      {...args}
      logoUrl={args.logoUrl || undefined}
      open={open}
      onClick={() => setOpen(o => !o)}
    />
  );
}

export const Playground = PlaygroundTemplate.bind({});
Playground.args = {
  orgName:  "Grace Community Church",
  orgType:  "protestant",
  cityName: "",
  logoUrl:  SACRED_HEART_LOGO,
  open:     false,
  disabled: false,
  mobile:   false,   // default desktop in Playground so the iframe width doesn't auto-flip to mobile
};

// ── Desktop variants ─────────────────────────────────────────────────────────

export const DesktopVariants = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <OrgSwitcher mobile={false} orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} />
    <OrgSwitcher mobile={false} orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} />
    <OrgSwitcher mobile={false} orgName="Northern Kentucky Baptist Church" />
    <OrgSwitcher mobile={false} orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} open onClick={() => {}} />
    <OrgSwitcher mobile={false} orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} disabled />
  </div>
);
DesktopVariants.storyName = "Desktop variants";

// ── Catholic vs Protestant — the spec §0.1 rule ─────────────────────────────

export const CatholicVsProtestant = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <OrgSwitcher mobile={false} orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} />
    <OrgSwitcher mobile={false} orgName="Grace Community Church" cityName="Atlanta" logoUrl={SACRED_HEART_LOGO} />
  </div>
);
CatholicVsProtestant.storyName = "Catholic vs Protestant";

// ── Truncation ───────────────────────────────────────────────────────────────

export const Truncation = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <OrgSwitcher mobile={false} orgName="Cross Point" logoUrl={SACRED_HEART_LOGO} />
    <OrgSwitcher mobile={false} orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} />
    <OrgSwitcher mobile={false} orgName="Northern Kentucky Baptist Church Fellowship Ministries" logoUrl={SACRED_HEART_LOGO} />
  </div>
);

// ── Mobile ───────────────────────────────────────────────────────────────────

export const Mobile = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <OrgSwitcher mobile orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} />
    <OrgSwitcher mobile orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} />
    <OrgSwitcher mobile orgName="Northern Kentucky Baptist Church" />
  </div>
);
Mobile.storyName = "Mobile (108px fixed)";

// ── Tokens — Fill / Stroke / Text / Icon ─────────────────────────────────────

function TokenRow({ token, hex, usage }) {
  return (
    <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
      <td style={{ padding: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 6, background: "#2d4889", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 28, height: 28, background: hex, borderRadius: 4 }} />
        </div>
      </td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>{token}</td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#71717a" }}>{hex}</td>
      <td style={{ padding: 8, color: "#363636" }}>{usage}</td>
    </tr>
  );
}

function TokenTable({ title, rows }) {
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8, marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
            <th style={{ padding: 8, width: 64 }}>Swatch</th>
            <th style={{ padding: 8 }}>Token</th>
            <th style={{ padding: 8 }}>Resolved</th>
            <th style={{ padding: 8 }}>Usage</th>
          </tr>
        </thead>
        <tbody>{rows.map(r => <TokenRow key={r.token} {...r} />)}</tbody>
      </table>
    </div>
  );
}

export const TokensFill = () => (
  <div>
    <TokenTable title="Fill (dark mode)" rows={[
      { token: "fill.action.tertiary.base",          hex: "rgba(160,181,230,0.04)", usage: "Trigger background — base" },
      { token: "fill.action.primaryinverse.hover",   hex: "rgba(10,18,35,0.16)",    usage: "Trigger background — hover" },
      { token: "fill.action.primaryinverse.pressed", hex: "rgba(255,255,255,0.08)", usage: "Trigger background — pressed / open" },
      { token: "fill.action.secondary.base",         hex: "rgba(255,255,255,0.08)", usage: "Avatar placeholder background (no logo)" },
    ]} />
    <TokenTable title="Stroke (dark mode)" rows={[
      { token: "stroke.action.tertiary.base",        hex: "rgba(160,181,230,0.16)", usage: "Trigger + avatar border — base" },
      { token: "stroke.action.tertiary.hover",       hex: "rgba(160,181,230,0.20)", usage: "Trigger + avatar border — hover" },
      { token: "stroke.action.tertiary.pressed",     hex: "rgba(160,181,230,0.30)", usage: "Trigger + avatar border — pressed / open" },
    ]} />
    <TokenTable title="Text + Icon (dark mode)" rows={[
      { token: "text.action.mono.base",              hex: "#fbfbfb", usage: "Org label" },
      { token: "icon.action.mono.base",              hex: "#fbfbfb", usage: "Chevron" },
    ]} />
  </div>
);
TokensFill.storyName = "Tokens — Fill / Stroke / Text";
TokensFill.parameters = { backgrounds: { default: "page" } };

// ── Tokens — Typography ──────────────────────────────────────────────────────

export const TokensTypography = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Typography tokens</h3>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
          <th style={{ padding: 8 }}>Usage</th>
          <th style={{ padding: 8 }}>CSS variable prefix</th>
          <th style={{ padding: 8 }}>Size / Weight / LH / LS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: 8 }}>Trigger label — desktop and mobile (both)</td>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>--semantic-type-desktop-label-button-s-</td>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>14 / 500 / 20 / 0.3</td>
        </tr>
      </tbody>
    </table>
  </div>
);
TokensTypography.storyName = "Tokens — Typography";
TokensTypography.parameters = { backgrounds: { default: "page" } };

// ── Standalone HTML demo ─────────────────────────────────────────────────────

export const StandaloneDemo = () => (
  <iframe
    src="/components/org-switcher/org-switcher.html"
    style={{ width: "100%", height: 680, border: "none", borderRadius: 8 }}
    title="OrgSwitcher standalone demo"
  />
);
StandaloneDemo.storyName = "Standalone HTML demo";
StandaloneDemo.parameters = { layout: "fullscreen" };
