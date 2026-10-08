/**
 * Search - Storybook stories
 *
 * Spec:      components/search/search-spec.md
 * HTML demo: components/search/search.html
 * Figma:     https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007095-4048
 *            TopNav.Search, a COMPONENT_SET. The id cited here until 2026-10-07,
 *            40006978-23158, is a layout frame rather than a component.
 *
 * v1 scope: SearchInput + TopNavSearch collapsed/expanded. Open state deferred.
 *
 * Story set:
 *   Playground, Field, StateMatrix, TokensFill, TokensStroke,
 *   TokensForeground, TokensSpacing, TokensMotion, StandaloneDemo
 */
import { LiveTokenTable } from "../../components/LiveTokenTable.jsx";
import React, { useState } from "react";
import { SearchInput, TopNavSearch } from "../../../../components/search/search.jsx";

const TOPNAV_BG = "var(--semantic-color-foreground-static-brand-on-subtle)";

// ── Demo wrappers ─────────────────────────────────────────────────────────────

function LightCard({ caption, children }) {
  return (
    <div style={{ background: "var(--semantic-color-fill-surface-elevated)", borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      fontFamily: "'Red Hat Text', sans-serif" }}>
      {caption && (
        <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600,
          letterSpacing: ".07em", textTransform: "uppercase", color: "#888",
          borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>{caption}</div>
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
    <div style={{ background: "var(--semantic-color-fill-surface-elevated)", borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      fontFamily: "'Red Hat Text', sans-serif" }}>
      {label && (
        <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600,
          letterSpacing: ".07em", textTransform: "uppercase", color: "#888",
          borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>{label}</div>
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
    <div style={{ background: "var(--semantic-color-fill-surface-elevated)", borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      fontFamily: "'Red Hat Text', sans-serif" }}>
      {caption && (
        <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600,
          letterSpacing: ".07em", textTransform: "uppercase", color: "#888",
          borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>{caption}</div>
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
  // Retitled: this is not a general-purpose search. It is the global search,
  // and today it lives only in the top nav, so that is what the page shows.
  title: "Library/Global Search (Top Nav)",
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

// The expanded field on its own. Reference only: it is a PART of the global
// search, not a component a consumer picks up by itself.
export const Field = {
  tags: ["!dev"],
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

/** The component itself: collapsed control, full-bar takeover, results menu. */
export const Playground = () => {
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
        background: "var(--semantic-color-fill-surface-elevated)", borderRadius: 8, padding: "16px 20px",
        fontFamily: "'Red Hat Text', sans-serif", fontSize: 13, color: "var(--semantic-color-foreground-static-neutral-subtle)",
        lineHeight: 1.6, border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
      }}>
        <strong style={{ color: "var(--semantic-color-foreground-static-neutral-bold)" }}>How it works</strong>
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
          Spec: <a href="https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/search/search-spec.md" style={{ color: "var(--semantic-color-foreground-static-brand-on-subtle)" }}>search-spec.md</a>
        </p>
      </div>
    </Stack>
  );
};
// Renaming TopNavSearchStory to Playground left this assignment behind,
// pointing at an export that no longer existed. A ReferenceError at module
// scope takes the whole CSF file down, so all nine stories in this group
// rendered empty, and `storybook build` still passed because the throw only
// happens when the module is evaluated in the browser. Caught 2026-10-02 by
// loading every story and checking it rendered.
Playground.storyName = "Playground";

// ── Token helpers ─────────────────────────────────────────────────────────────

function TokenRow({ token, hex, usage }) {
  const isAlpha = hex.startsWith("rgba") || hex.startsWith("rgb");
  const swatchBg = isAlpha
    ? `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%) 0 0/8px 8px, linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%) 4px 4px/8px 8px`
    : undefined;
  return (
    <tr style={{ borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>
      <td style={{ padding: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 6, background: isAlpha ? swatchBg : undefined,
          backgroundColor: isAlpha ? undefined : hex,
          border: "1px solid var(--semantic-color-stroke-static-neutral-base)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {isAlpha && <div style={{ width: 28, height: 28, background: hex, borderRadius: 4 }} />}
        </div>
      </td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "var(--semantic-color-foreground-static-brand-on-subtle)" }}>{token}</td>
      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "#71717a" }}>{hex}</td>
      <td style={{ padding: 8, color: "var(--semantic-color-foreground-static-neutral-base)", fontSize: 13 }}>{usage}</td>
    </tr>
  );
}

function TokenTable({ title, rows }) {
  return (
    <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "var(--semantic-color-fill-surface-elevated)",
      borderRadius: 8, marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--semantic-color-stroke-static-neutral-base)", color: "#71717a", textAlign: "left" }}>
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
      { token: "fill.action.primary.subtle.rest",    usage: "Filter pill background - filter-active state. Primary/Subtle replaced the deleted Tertiary ramp" },
      { token: "fill.action.primary.subtle.hover",   usage: "Icon pill - hover. The Dim ramp is the tint the retired *inverse hovers provided" },
      { token: "fill.action.primary.strong.rest",        usage: "Badge dot fill" },
      { token: "fill.static.brand.subtle",         usage: "TopNavSearch collapsed button background" },
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
      { token: "stroke.action.primary.strong.rest",         usage: "Bar border - with-value / filter-active (1px)" },
      { token: "stroke.action.primary.strong.hover",        usage: "Bar border - hover (1px)" },
      { token: "stroke.action.primary.strong.pressed",      usage: "Bar border - focused (1px)" },
      { token: "stroke.action.status.negative.rest", usage: "Bar border - error (1px). Negative moved under Status" },
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
      { token: "foreground.static.neutral.base",         usage: "Placeholder text" },
      { token: "foreground.static.neutral.bold",           usage: "Input value text" },
      { token: "foreground.action.secondary.rest",         usage: "All icons - idle" },
      { token: "foreground.action.secondary.hover",        usage: "All icons - hover / focused" },
      { token: "foreground.action.disabled",               usage: "All icons - disabled. ONE disabled token per tier, not one per role" },
      { token: "foreground.action.status.negative.on-subtle.rest",   usage: "Search icon - error state" },
      { token: "foreground.static.neutral.mono",              usage: "Badge count on the filled badge dot. Mono has only a rest step" },
    ]}
  />
);
TokensForeground.storyName = "Tokens - Foreground";
TokensForeground.tags = ["!dev"];
// ── 8. Tokens - Spacing ───────────────────────────────────────────────────────

export const TokensSpacing = () => (
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "var(--semantic-color-fill-surface-elevated)", borderRadius: 8 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Spacing tokens</h3>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid var(--semantic-color-stroke-static-neutral-base)", color: "#71717a", textAlign: "left" }}>
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
          <tr key={tok+val} style={{ borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>
            <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12, color: "var(--semantic-color-foreground-static-brand-on-subtle)" }}>{tok}</td>
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
  <div style={{ fontFamily: "'Red Hat Text', sans-serif", padding: 24, background: "var(--semantic-color-fill-surface-elevated)", borderRadius: 8 }}>
    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Motion (TopNavSearch only)</h3>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid var(--semantic-color-stroke-static-neutral-base)", color: "#71717a", textAlign: "left" }}>
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
          <tr key={prop} style={{ borderBottom: "1px solid var(--semantic-color-stroke-static-neutral-faint)" }}>
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

// Sidebar discipline: the global search has ONE browsable page, its Playground.
// The state matrix and the token tables are evidence for a reviewer, not pages
// to wander into, and the bare field is a part rather than a component: so all
// of them are reference-only. This is what stopped the page reading as a pile
// of unfinished search variants.
StateMatrix.tags      = ["!dev"];
TokensFill.tags       = ["!dev"];
TokensStroke.tags     = ["!dev"];
TokensForeground.tags = ["!dev"];
TokensSpacing.tags    = ["!dev"];
TokensMotion.tags     = ["!dev"];

/**
 * The nav bar search, which `Search.mdx` has linked to since it was written and
 * which did not exist until 2026-10-08: the page rendered an empty block where
 * this canvas belongs, and `storybook build` stayed green throughout.
 * `scripts/check-mdx-refs.js` now fails on that class of hole.
 */
export const TopNavSearchStory = {
  name: "TopNavSearch",
  args: { breakpoint: "desktop", expanded: undefined },
  argTypes: {
    breakpoint: { name: "Breakpoint", control: "inline-radio",
      options: ["desktop", "tablet", "mobile"],
      description: "Below desktop, TopNav renders a full-width takeover rather than the 320px bar." },
    expanded: { name: "Expanded", control: "inline-radio", options: [undefined, true, false],
      description: "Leave unset to let the component own it, which is how TopNav uses it." },
  },
  render: (a) => (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16,
      background: "var(--semantic-color-fill-surface-canvas)" }}>
      <span style={{ fontFamily: "'Red Hat Text',sans-serif", fontSize: 13, maxWidth: 620,
        color: "var(--semantic-color-foreground-static-neutral-base)" }}>
        Collapsed it is an icon; expanded it is a 320px field. Click it, then press
        Escape: focus returns to the collapsed trigger rather than being dropped,
        which is the part that is easy to lose when this is rebuilt inside a nav.
      </span>
      <div style={{ display: "flex", justifyContent: "flex-end",
        background: "var(--semantic-color-fill-surface-elevated)",
        border: "1px solid var(--semantic-color-stroke-static-neutral-base)",
        borderRadius: 8, padding: 8 }}>
        <TopNavSearch breakpoint={a.breakpoint} expanded={a.expanded}
          onExpandChange={() => {}} />
      </div>
    </div>
  ),
};
