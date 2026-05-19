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

// ── 5. Anatomy ───────────────────────────────────────────────────────────────
// Visual breakdown of the trigger. The trigger is rendered at native pixel
// sizes (24px avatar, 36px main height, etc.) then wrapped in CSS
// transform: scale(4) so every container, padding and gap is visible. Each
// box outlines itself with a coloured dashed line and pins a label.
// A legend follows the diagram. A "logo at three scales" callout explains
// why a logo cropped tight at 24×24 looks like nothing — common confusion.

const ANATOMY_PARTS = [
  { key: "root",         color: "#9b59b6", label: "OrgSwitcher.Root",            spec: "min-w/h 48 (touch target) · p-4 desktop · px-2 py-4 mobile" },
  { key: "main",         color: "#3498db", label: "Container.Main",              spec: "h-36 · p-4 · rounded-8 · 1px border · gap-2 desktop / no gap mobile" },
  { key: "rowstart",     color: "#16a085", label: "Container.RowStart",          spec: "flex items-center · gap-4 · h-24 desktop · h-20 max-w-74 mobile" },
  { key: "avatar",       color: "#e67e22", label: "Container.Avatar",            spec: "24×24 desktop · 20×20 mobile · p-2 (xxxtight)" },
  { key: "avatarinner",  color: "#e74c3c", label: "Avatar",                      spec: "flex-1 · rounded-4 · 1px border · <img object-fit:cover> or church SVG" },
  { key: "orglabel",     color: "#27ae60", label: "Container.OrgLabel",          spec: "max-w-248 · DESKTOP ONLY · holds OrgName (+ optional CityName)" },
  { key: "orgname",      color: "#f1c40f", label: "Container.OrgName",           spec: "max-w-180 · content-sized · ellipsis at 180px · Label/Button/S" },
  { key: "cityname",     color: "#c0392b", label: "Container.CityName.Catholic", spec: "max-w-72 · Catholic orgs ONLY · NOT a suborg name" },
  { key: "rowend",       color: "#8e44ad", label: "Container.RowEnd",            spec: "p-2 · wraps the trailing icon container" },
  { key: "icontrailing", color: "#d35400", label: "Container.IconTrailing",      spec: "16×16 · p-2 · expand_more · rotates 180° when open" },
];

function AnnotatedBox({ color, label, top, left, scale = 4, children, ...rest }) {
  return (
    <div style={{
      outline: `${1 / scale * 2}px dashed ${color}`,
      outlineOffset: `${1 / scale}px`,
      position: "relative",
      ...rest,
    }}>
      {children}
      <div style={{
        position: "absolute",
        top, left,
        background: color, color: "white",
        padding: `${2 / scale}px ${4 / scale}px`,
        fontSize: 10 / scale, lineHeight: 1.2,
        fontFamily: "'Red Hat Text', sans-serif", fontWeight: 600,
        whiteSpace: "nowrap", borderRadius: 2 / scale, zIndex: 10,
        pointerEvents: "none",
      }}>{label}</div>
    </div>
  );
}

function AnatomyDiagram({ orgName, cityName, scale = 4 }) {
  const S = scale;
  return (
    <div style={{ background: "#2d4889", padding: 56, borderRadius: 12, overflow: "auto" }}>
      <div style={{
        transform: `scale(${S})`, transformOrigin: "top left",
        width: 240 * S, height: 60 * S,
      }}>
        <AnnotatedBox color={ANATOMY_PARTS[0].color} label="Root · 238×48 · p-4"
          top={-12 / S} left={0} scale={S}
          style={{
            minHeight: 48, minWidth: 48, width: 238, height: 48,
            padding: 4, display: "flex", flexDirection: "column",
            alignItems: "flex-start", justifyContent: "center",
            position: "relative", boxSizing: "border-box",
          }}>
          <AnnotatedBox color={ANATOMY_PARTS[1].color} label="Container.Main · h-36 · p-4 · rounded-8 · gap-2"
            top={36 + 2 / S} left={0} scale={S}
            style={{
              display: "flex", alignItems: "center",
              height: 36, maxHeight: 36, minHeight: 36,
              borderRadius: 8, border: "1px solid rgba(160,181,230,0.16)",
              background: "rgba(160,181,230,0.04)",
              padding: 4, gap: 2, boxSizing: "border-box",
            }}>
            <AnnotatedBox color={ANATOMY_PARTS[2].color} label="RowStart · gap-4 · h-24"
              top={-10 / S} left={0} scale={S}
              style={{ display: "flex", alignItems: "center", flexShrink: 0, gap: 4, height: 24 }}>
              <AnnotatedBox color={ANATOMY_PARTS[3].color} label="Avatar · 24×24 · p-2"
                top={24 + 2 / S} left={0} scale={S}
                style={{
                  width: 24, height: 24, padding: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, boxSizing: "border-box",
                }}>
                <AnnotatedBox color={ANATOMY_PARTS[4].color} label="<img>"
                  top={-10 / S} left={22} scale={S}
                  style={{
                    flex: "1 0 0", height: "100%",
                    border: "1px solid rgba(160,181,230,0.16)",
                    borderRadius: 4, overflow: "hidden",
                    position: "relative",
                    background: "rgba(255,255,255,0.08)",
                    boxSizing: "border-box",
                  }}>
                  <img src={SACRED_HEART_LOGO} alt="" aria-hidden="true" style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                  }} />
                </AnnotatedBox>
              </AnnotatedBox>
              <AnnotatedBox color={ANATOMY_PARTS[5].color} label="OrgLabel · max-w-248"
                top={24 + 2 / S} left={0} scale={S}
                style={{ display: "flex", alignItems: "center", height: "100%", maxWidth: 248, flexShrink: 0, minWidth: 0 }}>
                <AnnotatedBox color={ANATOMY_PARTS[6].color} label="OrgName · max-w-180 · 14/500/20/0.3"
                  top={-10 / S} left={0} scale={S}
                  style={{ display: "flex", alignItems: "center", height: "100%", maxWidth: 180, flexShrink: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "'Red Hat Text', sans-serif",
                    fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "0.3px",
                    color: "#fbfbfb", margin: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    maxWidth: 180,
                  }}>{orgName}</p>
                </AnnotatedBox>
                {cityName && (
                  <AnnotatedBox color={ANATOMY_PARTS[7].color} label="CityName.Catholic · max-w-72 · Catholic ONLY"
                    top={24 + 2 / S} left={0} scale={S}
                    style={{ display: "flex", alignItems: "center", height: "100%", maxWidth: 72, flexShrink: 0, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'Red Hat Text', sans-serif",
                      fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: "0.3px",
                      color: "#fbfbfb", margin: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: 72,
                    }}>{` | ${cityName}`}</p>
                  </AnnotatedBox>
                )}
              </AnnotatedBox>
            </AnnotatedBox>
            <AnnotatedBox color={ANATOMY_PARTS[8].color} label="RowEnd · p-2"
              top={24 + 2 / S} left={0} scale={S}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 2, flexShrink: 0 }}>
              <AnnotatedBox color={ANATOMY_PARTS[9].color} label="IconTrailing · 16×16 · p-2"
                top={-10 / S} left={20} scale={S}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 16, height: 16, padding: 2, boxSizing: "border-box",
                }}>
                <span className="material-symbols-rounded" aria-hidden="true" style={{
                  fontSize: 12, lineHeight: 1, color: "#fbfbfb", display: "block",
                }}>expand_more</span>
              </AnnotatedBox>
            </AnnotatedBox>
          </AnnotatedBox>
        </AnnotatedBox>
      </div>
    </div>
  );
}

export const Anatomy = () => (
  <StoryFrame>
    <div>
      <Caption>Protestant org · enlarged 4× · every container outlined and labelled</Caption>
      <AnatomyDiagram orgName="Grace Community Church" />
    </div>
    <div>
      <Caption>Catholic org · adds CityName.Catholic container after the org name</Caption>
      <AnatomyDiagram orgName="Sacred Heart Church-ITD" cityName="Knoxville" />
    </div>
    <div>
      <Caption>Legend</Caption>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, fontFamily: "'Red Hat Text', sans-serif" }}>
        {ANATOMY_PARTS.map(p => (
          <div key={p.key} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
            <div style={{ width: 14, height: 14, marginTop: 3, borderRadius: 3, background: p.color, flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: "#363636", minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{p.label}</div>
              <div style={{ color: "#6b6b6b", fontSize: 12, marginTop: 2 }}>{p.spec}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <Caption>Logo image at three scales — why the avatar looks like a tight crop</Caption>
      <div style={{ display: "flex", gap: 24, alignItems: "center", padding: 20, background: "#f5f7fb", borderRadius: 8, fontFamily: "'Red Hat Text', sans-serif" }}>
        <div style={{ textAlign: "center", fontSize: 12, color: "#6b6b6b" }}>
          <img src={SACRED_HEART_LOGO} alt="Sacred Heart logo at native size" style={{ width: 140, height: 140, objectFit: "contain", display: "block", border: "1px solid #e5e7eb", borderRadius: 4, marginBottom: 8 }} />
          <div><strong>Native</strong> · ~140px</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "#6b6b6b" }}>
          <div style={{ width: 64, height: 46, borderRadius: 4, background: "#0f3e80", padding: 6, marginBottom: 8, boxSizing: "border-box" }}>
            <img src={SACRED_HEART_LOGO} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>
          <div><strong>Panel logo box</strong> · 64×46<br /><code style={{ background: "#eef2fb", padding: "1px 4px", borderRadius: 3, color: "#3555a0", fontSize: 11 }}>object-fit: contain</code></div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "#6b6b6b" }}>
          <div style={{ width: 24, height: 24, padding: 2, display: "inline-block", marginBottom: 8, boxSizing: "border-box" }}>
            <div style={{ width: 20, height: 20, border: "1px solid rgba(0,0,0,0.16)", borderRadius: 4, overflow: "hidden", position: "relative", background: "rgba(0,0,0,0.04)" }}>
              <img src={SACRED_HEART_LOGO} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
          <div><strong>Trigger avatar</strong> · 24×24<br /><code style={{ background: "#eef2fb", padding: "1px 4px", borderRadius: 3, color: "#3555a0", fontSize: 11 }}>object-fit: cover</code></div>
        </div>
        <div style={{ flex: 1, fontSize: 13, color: "#363636", lineHeight: 1.55, minWidth: 0 }}>
          The trigger avatar is <strong>24×24 outer</strong> (≈18×18 visible after padding + border). At that size, even a clear logo collapses to a few coloured pixels. <code style={{ background: "#eef2fb", padding: "1px 4px", borderRadius: 3, color: "#3555a0", fontSize: 12 }}>object-fit: cover</code> shows the centre crop of the source image — not a bug, just the consequence of rendering at 24px. The 64×46 panel box uses <code style={{ background: "#eef2fb", padding: "1px 4px", borderRadius: 3, color: "#3555a0", fontSize: 12 }}>object-fit: contain</code> with 6px padding so the full mark stays visible.
        </div>
      </div>
    </div>
  </StoryFrame>
);
Anatomy.storyName = "Anatomy — labeled at 4× scale";

// ── 6. Mobile ─────────────────────────────────────────────────────────────────

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
