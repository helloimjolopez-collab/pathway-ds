/**
 * Search - Storybook stories
 *
 * Spec:      components/search/search-spec.md
 * HTML demo: components/search/search.html
 * Figma:     https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006978-23158
 *
 * v1 scope: SearchInput + TopNavSearch collapsed/expanded. Open state deferred.
 *
 * Story set:
 *   Playground, StateMatrix, TopNavSearchStory, TokensFill, TokensStroke,
 *   TokensForeground, TokensSpacing, TokensMotion, StandaloneDemo
 */
import { LiveTokenTable } from "../../components/LiveTokenTable.jsx";
import React, { useState } from "react";
import { SearchInput, TopNavSearch } from "../../../../components/search/search.jsx";

const TOPNAV_BG = "#2d4889";

// ── Demo wrappers ─────────────────────────────────────────────────────────────

function LightCard({ caption, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      fontFamily: "'Red Hat Text', sans-serif" }}>
      {caption && (
        <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600,
          letterSpacing: ".07em", textTransform: "uppercase", color: "#888",
          borderBottom: "1px solid #f0f0f0" }}>{caption}</div>
      )}
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * NavBar - simulates the right end of TopNav.Global so TopNavSearch
 * is shown in its real context rather than floating in a coloured box.
 *
 * Left slot: placeholder text representing module + org switcher area.
 * Right slot: the TopNavSearch being demoed.
 */
function NavBar({ children, label }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      fontFamily: "'Red Hat Text', sans-serif" }}>
      {label && (
        <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600,
          letterSpacing: ".07em", textTransform: "uppercase", color: "#888",
          borderBottom: "1px solid #f0f0f0" }}>{label}</div>
      )}
      {/* Simulated TopNav bar - full width, 56px tall, brand blue */}
      <div style={{
        background: TOPNAV_BG,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 16,
        paddingRight: 8,
        gap: 8,
      }}>
        {/* Left: placeholder representing ModuleSwitcher + OrgSwitcher */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: "rgba(251,251,251,0.35)",
          fontSize: 13,
          fontFamily: "'Red Hat Text', sans-serif",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
        }}>
          <span style={{ fontSize: 11, letterSpacing: ".04em", textTransform: "uppercase" }}>
            ModuleSwitcher · OrgSwitcher
          </span>
        </div>
        {/* Right: TopNavSearch slot */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function NavCard({ caption, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      fontFamily: "'Red Hat Text', sans-serif" }}>
      {caption && (
        <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600,
          letterSpacing: ".07em", textTransform: "uppercase", color: "#888",
          borderBottom: "1px solid #f0f0f0" }}>{caption}</div>
      )}
      <div style={{ background: TOPNAV_BG, padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Stack({ children, gap = 16 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap,
      fontFamily: "'Red Hat Text', sans-serif" }}>{children}</div>
  );
}

function ControlledSearch(props) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <SearchInput
      {...props}
      value={value}
      onChange={setValue}
      onClear={() => setValue("")}
      onSearch={(v) => console.log("search:", v)}
    />
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export default {
  title: "Library/Search",
  component: SearchInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "**v1 - search bar only.** SearchInput is a pill-shaped search bar for toolbars, " +
          "drawers, forms, and command bars. TopNavSearch wraps it inside the top navigation " +
          "bar with a collapsed icon button and a spring-expand animation. " +
          "The Open state (results dropdown) is deferred - use Radix `Combobox` or `Command` " +
          "with Pathway tokens if you need a dropdown today.",
      },
    },
  },
  argTypes: {
    value:        { control: "text",    name: "Value",         description: "Controlled input value" },
    placeholder:  { control: "text",    name: "Placeholder",   description: "Placeholder text shown when input is empty" },
    showFilter:   { control: "boolean", name: "Show filter",   description: "Renders the trailing filter button with left-border divider" },
    filterActive: { control: "boolean", name: "Filter active", description: "Visual state when filters are applied - active border, highlighted funnel" },
    filterBadge:  { control: "boolean", name: "Filter badge",  description: "Shows the 6px dot badge on the filter button (use with filterActive)" },
    disabled:     { control: "boolean", name: "Disabled",      description: "38% opacity, non-interactive - for read-only contexts" },
    error:        { control: "boolean", name: "Error",         description: "Error visual state - negative border + icon colour" },
  },
};

// ── 1. Playground ─────────────────────────────────────────────────────────────
// CSF3 render function - required for Storybook 7 args to propagate correctly
// when the story also manages local React state (value).

export const Playground = {
  args: {
    placeholder:  "Search...",
    showFilter:   false,
    filterActive: false,
    filterBadge:  false,
    disabled:     false,
    error:        false,
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <LightCard caption="PLAYGROUND - SEARCHINPUT + ALL CONTROLS">
        <SearchInput
          {...args}
          value={value}
          onChange={setValue}
          onClear={() => setValue("")}
          onSearch={(v) => console.log("search:", v)}
          onFilterClick={() => console.log("filter click")}
        />
      </LightCard>
    );
  },
};

// ── 2. State matrix ───────────────────────────────────────────────────────────

export const StateMatrix = () => (
  <Stack>
    <LightCard caption="SEARCHINPUT - ALL STATES, NO FILTER">
      <ControlledSearch placeholder="Idle (default)" />
      <ControlledSearch value="Input value" placeholder="With-value (has text)" />
      <ControlledSearch error placeholder="Error state" />
      <ControlledSearch disabled placeholder="Disabled (38% opacity)" />
    </LightCard>
    <LightCard caption="SEARCHINPUT - WITH FILTER BUTTON">
      <ControlledSearch showFilter placeholder="Idle + filter" />
      <ControlledSearch showFilter filterActive placeholder="Filter-active (border + funnel)" />
      <ControlledSearch showFilter filterActive filterBadge placeholder="Filter-active + badge dot" />
    </LightCard>
  </Stack>
);
StateMatrix.storyName = "State matrix";
StateMatrix.tags = ["!dev"];

// ── 3. TopNavSearch ───────────────────────────────────────────────────────────

export const TopNavSearchStory = () => {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  return (
    <Stack gap={24}>
      {/* Collapsed state */}
      <NavBar label="TOPNAVSEARCH IN CONTEXT - COLLAPSED (click the search icon to expand)">
        <TopNavSearch
          expanded={expanded}
          onExpandChange={setExpanded}
          searchProps={{
            value,
            onChange: setValue,
            onClear: () => setValue(""),
            onSearch: (v) => { console.log("search:", v); setExpanded(false); },
          }}
        />
      </NavBar>

      {/* Expanded state preview */}
      <NavBar label="TOPNAVSEARCH - EXPANDED STATE (the bar the user sees after tapping the icon)">
        <TopNavSearch
          expanded={true}
          onExpandChange={() => {}}
          searchProps={{
            value: "",
            placeholder: "Search...",
            onChange: () => {},
            onClear: () => {},
            onSearch: () => {},
          }}
        />
      </NavBar>

      {/* Behaviour notes */}
      <div style={{
        background: "#fff", borderRadius: 8, padding: "16px 20px",
        fontFamily: "'Red Hat Text', sans-serif", fontSize: 13, color: "#484848",
        lineHeight: 1.6, border: "1px solid #e5e7eb",
      }}>
        <strong style={{ color: "#252525" }}>How it works</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li>Collapsed: renders a 48×48 icon button on the dark nav surface</li>
          <li>Tap / click the icon: bar springs open to 320px with a spring animation (350ms, cubic-bezier overshoot)</li>
          <li>Press <strong>Escape</strong> or click the search icon inside the bar: collapses, focus returns to the icon button</li>
          <li>Input value persists across collapse/expand cycles</li>
          <li>The bar is a full <code>SearchInput</code> - all states (hover, focus, with-value, clear) apply inside the expanded bar</li>
        </ul>
        <p style={{ margin: "12px 0 0" }}>
          Component: <code>TopNavSearch</code> from <code>components/search/search.jsx</code> -
          a nav-specific wrapper around <code>SearchInput</code>.
          Spec: <a href="https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/search/search-spec.md" style={{ color: "#3555a0" }}>search-spec.md</a>
        </p>
      </div>
    </Stack>
  );
};
TopNavSearchStory.storyName = "TopNavSearch - nav bar search (collapsed + expanded)";

// ── Token helpers ─────────────────────────────────────────────────────────────

function TokenRow({ token, hex, usage }) {
  const isAlpha = hex.startsWith("rgba") || hex.startsWith("rgb");
  const swatchBg = isAlpha
    ? `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%) 0 0/8px 8px, linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%) 4px 4px/8px 8px`
    : undefined;
  return (
    <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
      <td style={{ padding: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 6, background: isAlpha ? swatchBg : undefined,
          backgroundColor: isAlpha ? undefined : hex,
          border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {isAlpha && <div style={{ width: 28, height: 28, background: hex, borderRadius: 4 }} />}
        </div>
      </td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>{token}</td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#71717a" }}>{hex}</td>
      <td style={{ padding: 8, color: "#363636", fontSize: 13 }}>{usage}</td>
    </tr>
  );
}

function TokenTable({ title, rows }) {
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff",
      borderRadius: 8, marginBottom: 16 }}>
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

// ── 4-7. Colour tokens ───────────────────────────────────────────────────────
//
// Rewritten 2026-09-09. These four tables previously listed names that no
// longer exist (`fill.action.tertiary.*`, every `*inverse` family, `text.*` and
// `icon.*` as separate tiers, `.base` on Action tokens) beside HAND-TYPED hex
// values. Both halves could go stale independently, and both had.
//
// The names below are the ones search.jsx actually resolves. The values are not
// written here at all - LiveTokenTable reads them off the live custom property,
// so a token that gets deleted shows "unresolved" in red on this page rather
// than a colour that used to be true.
//
// Text and Icon are ONE table now because they are one tier: they merged into
// Foreground on 2026-09-03.

export const TokensFill = () => (
  <LiveTokenTable
    title="Fill tokens"
    note="Backgrounds. Surface lives under Fill now, so the bar ground is a Fill token rather than a Surface one."
    rows={[
      { token: "fill.static.neutral.faint",       usage: "Bar background - all states except disabled" },
      { token: "fill.action.primary-dim.rest",    usage: "Filter pill background - filter-active state. Primary Dim replaced the deleted Tertiary ramp" },
      { token: "fill.action.primary-dim.hover",   usage: "Icon pill - hover. The Dim ramp is the tint the retired *inverse hovers provided" },
      { token: "fill.action.primary.rest",        usage: "Badge dot fill" },
      { token: "fill.static.brand.light",         usage: "TopNavSearch collapsed button background" },
    ]}
  />
);
TokensFill.storyName = "Tokens - Fill";
TokensFill.tags = ["!dev"];

export const TokensStroke = () => (
  <LiveTokenTable
    title="Stroke tokens"
    note="Borders. The disabled border no longer falls back to a primitive: product code must never name a --primitive-* (CLAUDE.md §6), so it reads the Static Neutral ladder."
    rows={[
      { token: "stroke.static.neutral.faint",        usage: "Bar border - idle (0.75px), and disabled" },
      { token: "stroke.action.primary.rest",         usage: "Bar border - with-value / filter-active (1px)" },
      { token: "stroke.action.primary.hover",        usage: "Bar border - hover (1px)" },
      { token: "stroke.action.primary.pressed",      usage: "Bar border - focused (1px)" },
      { token: "stroke.action.status-negative.rest", usage: "Bar border - error (1px). Negative moved under Status" },
      { token: "stroke.action.secondary.rest",       usage: "Cancel-filter divider (0.75px)" },
    ]}
  />
);
TokensStroke.storyName = "Tokens - Stroke";
TokensStroke.tags = ["!dev"];

export const TokensForeground = () => (
  <LiveTokenTable
    title="Foreground tokens - text and icons"
    note="One tier for both. Text and Icon merged on 2026-09-03 because every pair held the same value; the split doubled the contract while never letting a control's label and its icon differ."
    rows={[
      { token: "foreground.static.neutral.subtle",         usage: "Placeholder text" },
      { token: "foreground.static.neutral.bold",           usage: "Input value text" },
      { token: "foreground.action.secondary.rest",         usage: "All icons - idle" },
      { token: "foreground.action.secondary.hover",        usage: "All icons - hover / focused" },
      { token: "foreground.action.disabled",               usage: "All icons - disabled. ONE disabled token per tier, not one per role" },
      { token: "foreground.action.status-negative.rest",   usage: "Search icon - error state" },
      { token: "foreground.action.mono.rest",              usage: "Badge count on the filled badge dot. Mono has only a rest step" },
    ]}
  />
);
TokensForeground.storyName = "Tokens - Foreground";
TokensForeground.tags = ["!dev"];
// ── 8. Tokens - Spacing ───────────────────────────────────────────────────────

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
        {[
          ["layout.units.gap.xtight",     "8px",    "Gap between children inside the pill"],
          ["layout.units.padding.xtight", "8px",    "Left/right padding on the pill"],
          ["layout.units.padding.xxtight","4px",    "Icon pill padding + filter divider gap"],
          ["layout.units.padding.xxtight","4px",    "TopNavSearch container padding"],
        ].map(([tok, val, usage]) => (
          <tr key={tok+val} style={{ borderBottom: "1px solid #f5f5f5" }}>
            <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#3555a0" }}>{tok}</td>
            <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>{val}</td>
            <td style={{ padding: 8 }}>{usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
TokensSpacing.storyName = "Tokens - Spacing";
TokensSpacing.tags = ["!dev"];

// ── 9. Tokens - Motion ────────────────────────────────────────────────────────

export const TokensMotion = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "#fff", borderRadius: 8 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Motion (TopNavSearch only)</h3>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#71717a", textAlign: "left" }}>
          <th style={{ padding: 8 }}>Property</th>
          <th style={{ padding: 8 }}>Value</th>
          <th style={{ padding: 8 }}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Expand", "--motion-duration-4 + --motion-easing-spring", "300ms, whisper of overshoot - the bar springs open"],
          ["Collapse", "--motion-duration-4 + --motion-easing-accelerate", "Same duration, clean accelerating exit"],
          ["Animated property", "width (0 → 336px) + opacity (0 → 1)", "Width drives layout shift; opacity fades content in"],
          ["Focus delay", "120ms after expand starts (timer)", "Avoids input flashing in before animation starts"],
          ["Reduced motion", "opacity fade only, width instant", "prefers-reduced-motion: reduce"],
        ].map(([prop, val, note]) => (
          <tr key={prop} style={{ borderBottom: "1px solid #f5f5f5" }}>
            <td style={{ padding: 8 }}>{prop}</td>
            <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>{val}</td>
            <td style={{ padding: 8, color: "#71717a" }}>{note}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ margin: "12px 0 0", fontSize: 12, color: "#71717a" }}>
      No motion tokens are defined as semantic variables for this component yet. Values live inline in <code>search.jsx</code>. See spec §17.
    </p>
  </div>
);
TokensMotion.storyName = "Tokens - Motion";
TokensMotion.tags = ["!dev"];

// Note: StandaloneDemo intentionally removed - the iframe path does not work
// on GitHub Pages. Open the HTML demo directly:
// https://helloimjolopez-collab.github.io/pathway-ds/components/search/search.html
