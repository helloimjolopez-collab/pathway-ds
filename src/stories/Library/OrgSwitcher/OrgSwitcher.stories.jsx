/**
 * OrgSwitcher — Storybook stories (v1, trigger only)
 *
 * Spec:      components/org-switcher/org-switcher-spec.md
 * HTML demo: components/org-switcher/org-switcher.html
 * Figma:     https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583
 *
 * Visual treatment principle: the HTML demo at components/org-switcher/org-switcher.html
 * is the single visual source of truth for in-context presentation of the trigger. The
 * DemoCard helper below replicates that file's `.demo-section` CSS exactly — uppercase
 * grey caption header + dark TopNav-surface body. Storybook NEVER independently styles
 * its own demo wrapper.
 *
 * Canonical story set (per pathway-component-pipeline skill rules):
 *   Playground · StateMatrix · AvatarExplorer · DesktopVariants · CatholicVsProtestant
 *   · Truncation · Mobile · TokensFill · TokensStroke · TokensText · TokensIcon
 *   · TokensTypography · TokensSpacing · TokensMotion · TokensRadius · StandaloneDemo
 */
import React, { useState } from "react";
import { OrgSwitcher } from "../../../../components/org-switcher/org-switcher.jsx";

// Logo asset served by Storybook's staticDirs (.storybook/main.js).
const SACRED_HEART_LOGO = "components/org-switcher/assets/sacred-heart-logo.png";

// TopNav surface colour. Owned by the TopNav component, mirrored here to match
// the HTML demo's brand-blue body. NOT a token defined by OrgSwitcher.
const TOPNAV_SURFACE = "#2d4889";

// ── DemoCard ────────────────────────────────────────────────────────────────
// Lifted from components/org-switcher/org-switcher.html (.demo-section /
// .demo-section__label / .demo-section__body). Same visual treatment as the
// HTML demo so the two artefacts render identically in their respective hosts.
function DemoCard({ caption, children }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
      overflow: "visible",
      fontFamily: "'Red Hat Text', sans-serif",
    }}>
      <div style={{
        padding: "10px 16px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        color: "#888",
        borderBottom: "1px solid #f0f0f0",
      }}>
        {caption}
      </div>
      <div style={{
        padding: "20px 16px",
        background: TOPNAV_SURFACE,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {children}
      </div>
    </div>
  );
}

function StoryStack({ children, gap = 16 }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap,
      fontFamily: "'Red Hat Text', sans-serif",
      padding: 0,
    }}>
      {children}
    </div>
  );
}

// ── Meta ─────────────────────────────────────────────────────────────────────

export default {
  title: "Library/OrgSwitcher",
  component: OrgSwitcher,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**v1 — trigger only.** The OrgSwitcher trigger renders inside the `TopNav` component (`components/top-nav/`) and shows the active organisation. Catholic orgs render a second container (city/diocese) after the org name per spec §0.1; Protestant orgs render the org name on its own. Mobile compacts the trigger to a fixed 108px and truncates the org name inside a 50px label container. " +
          "The dropdown menu / panel is **out of scope for v1 and remains as it is in production until further notice.**",
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
    mobile:   { control: { type: "radio" }, options: [false, true, undefined], name: "Mobile",     description: "Tristate: true forces mobile, false forces desktop, undefined auto-detects via matchMedia." },
  },
};

// ── 1. Playground ───────────────────────────────────────────────────────────

function PlaygroundTemplate(args) {
  const [open, setOpen] = useState(args.open || false);
  return (
    <DemoCard caption="PLAYGROUND — TRIGGER + ALL CONTROLS">
      <OrgSwitcher
        {...args}
        logoUrl={args.logoUrl || undefined}
        open={open}
        onClick={() => setOpen(o => !o)}
      />
    </DemoCard>
  );
}

export const Playground = PlaygroundTemplate.bind({});
Playground.args = {
  orgName:  "Grace Community Church",
  orgType:  "protestant",
  cityName: "",
  logoUrl:  "",           // No logo by default — org name only (Figma: showOrgAvatar = false)
  open:     false,
  disabled: false,
  mobile:   false,
};

// ── 2. State Matrix ─────────────────────────────────────────────────────────

export const StateMatrix = () => (
  <StoryStack>
    <DemoCard caption="STATE MATRIX — DESKTOP, ALL INTERACTION STATES (ORG NAME ONLY)">
      <OrgSwitcher mobile={false} orgName="Grace Community Church" />
      <OrgSwitcher mobile={false} orgName="Grace Community Church" open onClick={() => {}} />
      <OrgSwitcher mobile={false} orgName="Grace Community Church" disabled />
    </DemoCard>
    <DemoCard caption="STATE MATRIX — MOBILE, ALL INTERACTION STATES (ORG NAME ONLY)">
      <OrgSwitcher mobile orgName="Grace Community Church" />
      <OrgSwitcher mobile orgName="Grace Community Church" open onClick={() => {}} />
      <OrgSwitcher mobile orgName="Grace Community Church" disabled />
    </DemoCard>
  </StoryStack>
);
StateMatrix.storyName = "State matrix (all states)";
StateMatrix.tags = ["!dev"]; // reference story — shown in MDX docs, hidden from sidebar

// ── 3. Avatar Explorer ──────────────────────────────────────────────────────

export const AvatarExplorer = () => (
  <StoryStack>
    <DemoCard caption="DEFAULT — ORG NAME ONLY (NO LOGO, NO PLACEHOLDER)">
      <OrgSwitcher mobile={false} orgName="Grace Community Church" />
      <OrgSwitcher mobile={false} orgName="Northern Kentucky Baptist Church" />
    </DemoCard>
    <DemoCard caption="OPTIONAL — WITH LOGO (pass logoUrl to render the avatar)">
      <OrgSwitcher mobile={false} orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} />
    </DemoCard>
  </StoryStack>
);
AvatarExplorer.storyName = "Logo variant (optional)";

// ── 4. Desktop variants (captions mirror the HTML demo) ─────────────────────

export const DesktopVariants = () => (
  <StoryStack>
    <DemoCard caption="TRIGGER — DESKTOP, DEFAULT (ORG NAME ONLY, NO LOGO)">
      <OrgSwitcher mobile={false} orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" />
      <OrgSwitcher mobile={false} orgName="Grace Community Church" />
      <OrgSwitcher mobile={false} orgName="Cross Point" />
    </DemoCard>
    <DemoCard caption="TRIGGER — DESKTOP, OPEN (⚠ PANEL IS PLACEHOLDER, OUT OF SCOPE IN V1)">
      <OrgSwitcher mobile={false} orgName="Grace Community Church" open onClick={() => {}} />
    </DemoCard>
    <DemoCard caption="TRIGGER — DESKTOP, WITH OPTIONAL LOGO (pass logoUrl)">
      <OrgSwitcher mobile={false} orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" logoUrl={SACRED_HEART_LOGO} />
      <OrgSwitcher mobile={false} orgName="Grace Community Church" logoUrl={SACRED_HEART_LOGO} />
    </DemoCard>
  </StoryStack>
);
DesktopVariants.storyName = "Desktop variants";
DesktopVariants.tags = ["!dev"];

// ── 5. Catholic vs Protestant — spec §0.1 ──────────────────────────────────

export const CatholicVsProtestant = () => (
  <StoryStack>
    <DemoCard caption="CATHOLIC ORG — CityName.Catholic CONTAINER RENDERS">
      <OrgSwitcher mobile={false} orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" />
    </DemoCard>
    <DemoCard caption='PROTESTANT ORG — CityName NEVER RENDERS (cityName="Atlanta" IS IGNORED)'>
      <OrgSwitcher mobile={false} orgName="Grace Community Church" cityName="Atlanta" />
    </DemoCard>
  </StoryStack>
);
CatholicVsProtestant.storyName = "Catholic vs Protestant rule (§0.1)";
CatholicVsProtestant.tags = ["!dev"];

// ── 6. Truncation ───────────────────────────────────────────────────────────

export const Truncation = () => (
  <StoryStack>
    <DemoCard caption="TRUNCATION — SHORT (CONTAINER SHRINKS TO FIT)">
      <OrgSwitcher mobile={false} orgName="Cross Point" />
    </DemoCard>
    <DemoCard caption="TRUNCATION — MEDIUM (FITS WITHIN 180px)">
      <OrgSwitcher mobile={false} orgName="Grace Community Church" />
    </DemoCard>
    <DemoCard caption="TRUNCATION — LONG (ELLIPSIS AT 180px)">
      <OrgSwitcher mobile={false} orgName="Northern Kentucky Baptist Church Fellowship Ministries" />
    </DemoCard>
  </StoryStack>
);
Truncation.tags = ["!dev"];

// ── 7. Mobile ───────────────────────────────────────────────────────────────

export const Mobile = () => (
  <StoryStack>
    <DemoCard caption="TRIGGER — MOBILE, DEFAULT (ORG NAME ONLY, 108px FIXED PILL)">
      <OrgSwitcher mobile orgName="Grace Community Church" />
      <OrgSwitcher mobile orgName="Sacred Heart Church-ITD" orgType="catholic" cityName="Knoxville" />
      <OrgSwitcher mobile orgName="Northern Kentucky Baptist Church" />
    </DemoCard>
  </StoryStack>
);
Mobile.storyName = "Mobile";

// ── Token swatch + row helpers ──────────────────────────────────────────────

function TokenRow({ token, hex, usage }) {
  return (
    <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
      <td style={{ padding: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 6, background: TOPNAV_SURFACE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 28, height: 28, background: hex, borderRadius: 4 }} />
        </div>
      </td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>{token}</td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#71717a" }}>{hex}</td>
      <td style={{ padding: 8, color: "#363636" }}>{usage}</td>
    </tr>
  );
}

function TokenTable({ title, rows, noteEmpty }) {
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8, marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ margin: 0, color: "#71717a", fontSize: 13 }}>{noteEmpty}</p>
      ) : (
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
      )}
    </div>
  );
}

// ── 8. Tokens — Fill ────────────────────────────────────────────────────────

export const TokensFill = () => (
  <TokenTable title="Fill tokens (dark mode)" rows={[
    { token: "fill.action.tertiary.base",          hex: "rgba(160,181,230,0.04)", usage: "Trigger background — base" },
    { token: "fill.action.primaryinverse.hover",   hex: "rgba(10,18,35,0.16)",    usage: "Trigger background — hover" },
    { token: "fill.action.primaryinverse.pressed", hex: "rgba(255,255,255,0.08)", usage: "Trigger background — pressed / open" },
    { token: "fill.action.secondary.base",         hex: "rgba(255,255,255,0.08)", usage: "Avatar placeholder background (no logo)" },
  ]} />
);
TokensFill.storyName = "Tokens — Fill";
TokensFill.tags = ["!dev"];

// ── 9. Tokens — Stroke ──────────────────────────────────────────────────────

export const TokensStroke = () => (
  <TokenTable title="Stroke tokens (dark mode)" rows={[
    { token: "stroke.action.tertiary.base",    hex: "rgba(160,181,230,0.16)", usage: "Trigger + avatar border — base" },
    { token: "stroke.action.tertiary.hover",   hex: "rgba(160,181,230,0.20)", usage: "Trigger + avatar border — hover" },
    { token: "stroke.action.tertiary.pressed", hex: "rgba(160,181,230,0.30)", usage: "Trigger + avatar border — pressed / open" },
  ]} />
);
TokensStroke.storyName = "Tokens — Stroke";
TokensStroke.tags = ["!dev"];

// ── 10. Tokens — Text ───────────────────────────────────────────────────────

export const TokensText = () => (
  <TokenTable title="Text tokens (dark mode)" rows={[
    { token: "text.action.mono.base",    hex: "#fbfbfb", usage: "Trigger label — base" },
    { token: "text.action.mono.hover",   hex: "#ffffff", usage: "Trigger label — hover" },
    { token: "text.action.mono.pressed", hex: "#ffffff", usage: "Trigger label — pressed / open" },
  ]} />
);
TokensText.storyName = "Tokens — Text";
TokensText.tags = ["!dev"];

// ── 11. Tokens — Icon ───────────────────────────────────────────────────────

export const TokensIcon = () => (
  <TokenTable title="Icon tokens (dark mode)" rows={[
    { token: "icon.action.mono.base",    hex: "#fbfbfb", usage: "Chevron — base" },
    { token: "icon.action.mono.hover",   hex: "#ffffff", usage: "Chevron — hover" },
    { token: "icon.action.mono.pressed", hex: "#ffffff", usage: "Chevron — pressed / open" },
  ]} />
);
TokensIcon.storyName = "Tokens — Icon";
TokensIcon.tags = ["!dev"];

// ── 12. Tokens — Typography ─────────────────────────────────────────────────

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
          <td style={{ padding: 8 }}>Trigger label — desktop AND mobile (both viewports use the same scale in v1)</td>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>--semantic-type-desktop-label-button-s-</td>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>14 / 500 / 20 / 0.3</td>
        </tr>
      </tbody>
    </table>
  </div>
);
TokensTypography.storyName = "Tokens — Typography";
TokensTypography.tags = ["!dev"];

// ── 13. Tokens — Spacing ────────────────────────────────────────────────────

export const TokensSpacing = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Spacing tokens</h3>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
          <th style={{ padding: 8 }}>Token</th>
          <th style={{ padding: 8 }}>Value</th>
          <th style={{ padding: 8 }}>Usage</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>--semantic-layout-units-padding-xxtight</td>
          <td style={{ padding: 8, fontFamily: "monospace" }}>4px</td>
          <td style={{ padding: 8 }}>Trigger inner padding (Container.Main)</td>
        </tr>
        <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>--semantic-layout-units-padding-xxxtight</td>
          <td style={{ padding: 8, fontFamily: "monospace" }}>2px</td>
          <td style={{ padding: 8 }}>Avatar / RowEnd / IconTrailing inner padding</td>
        </tr>
        <tr>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>--semantic-layout-units-gap-xxtight</td>
          <td style={{ padding: 8, fontFamily: "monospace" }}>4px</td>
          <td style={{ padding: 8 }}>Container.RowStart inner gap</td>
        </tr>
      </tbody>
    </table>
  </div>
);
TokensSpacing.storyName = "Tokens — Spacing";
TokensSpacing.tags = ["!dev"];

// ── 14. Tokens — Motion ─────────────────────────────────────────────────────

export const TokensMotion = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Motion</h3>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
          <th style={{ padding: 8 }}>Property</th>
          <th style={{ padding: 8 }}>Value</th>
          <th style={{ padding: 8 }}>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
          <td style={{ padding: 8 }}>Chevron rotation (open ↔ closed)</td>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>transform --motion-duration-4 --motion-easing-standard</td>
          <td style={{ padding: 8 }}>System chevron rule (300ms standard)</td>
        </tr>
        <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
          <td style={{ padding: 8 }}>State transition (fill + border)</td>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>--motion-duration-2 --motion-easing-standard</td>
          <td style={{ padding: 8 }}>Snappy enough for hover</td>
        </tr>
        <tr>
          <td style={{ padding: 8 }}>Reduced motion</td>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>(none)</td>
          <td style={{ padding: 8 }}>All transitions removed when <code>prefers-reduced-motion: reduce</code></td>
        </tr>
      </tbody>
    </table>
    <p style={{ margin: "12px 0 0", fontSize: 12, color: "#71717a" }}>
      No motion tokens are defined as semantic variables for this component yet — the values above live inline in <code>org-switcher.jsx</code>. See spec §9.
    </p>
  </div>
);
TokensMotion.storyName = "Tokens — Motion";
TokensMotion.tags = ["!dev"];

// ── 15. Tokens — Radius ─────────────────────────────────────────────────────

export const TokensRadius = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Corner radius tokens</h3>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
          <th style={{ padding: 8 }}>Token</th>
          <th style={{ padding: 8 }}>Value</th>
          <th style={{ padding: 8 }}>Usage</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>--semantic-layout-units-cornerradius-medium</td>
          <td style={{ padding: 8, fontFamily: "monospace" }}>8px</td>
          <td style={{ padding: 8 }}>Container.Main (the trigger pill)</td>
        </tr>
        <tr>
          <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>--semantic-layout-units-cornerradius-small</td>
          <td style={{ padding: 8, fontFamily: "monospace" }}>4px</td>
          <td style={{ padding: 8 }}>Container.Avatar (inner avatar frame)</td>
        </tr>
      </tbody>
    </table>
  </div>
);
TokensRadius.storyName = "Tokens — Radius";
TokensRadius.tags = ["!dev"];

// Note: the standalone HTML demo is not a story — it lives at
// components/org-switcher/org-switcher.html and is linked from the Resources
// section at the top of the Docs MDX page. Embedding it as a story added
// noise to the sidebar with no value.
