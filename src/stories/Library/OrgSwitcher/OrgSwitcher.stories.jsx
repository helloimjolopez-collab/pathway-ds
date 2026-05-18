/**
 * OrgSwitcher — Storybook stories
 *
 * Spec: components/org-switcher/org-switcher-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007336-9453
 */
import React, { useState } from "react";
import { OrgSwitcher, abbreviateOrg, abbreviateCampus, mobileLabel }
  from "../../../../components/org-switcher/org-switcher.jsx";

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_ORGS = [
  { id: "shc",  name: "Sacred Heart Church-ITD",          campus: "Knoxville",       logoUrl: "https://picsum.photos/seed/shc/48/48",  users: [{color:"#5b8def"},{color:"#9c6dd8"},{color:"#d96c6c"},{color:"#4caf7d"},{color:"#e08c2d"}] },
  { id: "gcc",  name: "Grace Community Church",           campus: "West",            logoUrl: "",  users: [{color:"#5b8def"},{color:"#9c6dd8"},{color:"#d96c6c"}] },
  { id: "ncc",  name: "Nashville Christian Church",       campus: "Nashville North", logoUrl: "",  users: [{color:"#4caf7d"},{color:"#e08c2d"},{color:"#2b9ec3"},{color:"#c45d9e"}] },
  { id: "nkbc", name: "Northern Kentucky Baptist Church", campus: "",                logoUrl: "",  users: [{color:"#5b8def"},{color:"#7cb342"}] },
  { id: "cp",   name: "Cross Point",                      campus: "Main Campus",     logoUrl: "",  users: [{color:"#9c6dd8"},{color:"#d96c6c"},{color:"#e08c2d"}] },
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
        component: "OrgSwitcher — trigger + panel for switching organisation and campus context. Lives on the dark brand-blue nav bar. Panel includes search, org list with logos, user avatars, and active state highlight.",
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
    orgName:     { control: "text",    name: "Org name",      description: "Full organisation name" },
    campusName:  { control: "text",    name: "Campus name",   description: "Full campus / sub-org name (empty if none)" },
    logoUrl:     { control: "text",    name: "Logo URL",      description: "Org logo image URL — omit for branded initials placeholder" },
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
  campusName: "Knoxville",
  logoUrl:    "",
  activeOrgId: "shc",
  open:       false,
  disabled:   false,
  mobile:     false,
};
Playground.storyName = "Playground";

// ── Panel Open ────────────────────────────────────────────────────────────────
export const PanelOpen = () => {
  const [activeOrg, setActiveOrg] = useState("shc");
  const current = DEMO_ORGS.find(o => o.id === activeOrg) || DEMO_ORGS[0];
  return (
    <DarkShell style={{ minHeight: 480 }}>
      <OrgSwitcher
        orgName={current.name}
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
        <OrgSwitcher mobile orgName={o.name} campusName={o.campus} logoUrl={o.logoUrl || undefined} />
      </DarkShell>
    ))}
  </div>
);
Mobile.storyName = "Mobile — abbreviated";

// ── No Logo (initials fallback) ────────────────────────────────────────────────
export const NoLogo = () => {
  const [activeOrg, setActiveOrg] = useState("gcc");
  const current = DEMO_ORGS.find(o => o.id === activeOrg) || DEMO_ORGS[1];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}>
      <div>
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Red Hat Text', sans-serif" }}>
          Trigger — no logo
        </p>
        <DarkShell>
          <OrgSwitcher orgName="Grace Community Church" campusName="West" />
        </DarkShell>
      </div>
      <div>
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Red Hat Text', sans-serif" }}>
          Panel open — branded initials in list
        </p>
        <DarkShell style={{ minHeight: 460 }}>
          <OrgSwitcher
            orgName={current.name}
            campusName={current.campus}
            orgs={DEMO_ORGS}
            activeOrgId={activeOrg}
            onOrgSelect={setActiveOrg}
            open={true}
            onClick={() => {}}
          />
        </DarkShell>
      </div>
    </div>
  );
};
NoLogo.storyName = "No Logo — initials fallback";

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
          <OrgSwitcher orgName="Sacred Heart Church-ITD" campusName="Knoxville" {...props} />
        </DarkShell>
      </div>
    ))}
  </div>
);
States.storyName = "States — Base / Disabled";

// ── Standalone Demo ────────────────────────────────────────────────────────────
export const StandaloneDemo = () => (
  <iframe
    src="../../../../components/org-switcher/org-switcher.html"
    style={{ width: "100%", height: 680, border: "none", borderRadius: 8 }}
    title="OrgSwitcher standalone demo"
  />
);
StandaloneDemo.storyName = "Standalone Demo";
StandaloneDemo.parameters = { layout: "fullscreen" };
