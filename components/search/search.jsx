/**
 * Search — Pathway Design System (v1, search bar only)
 *
 * Two named exports:
 *   SearchInput   — the base pill-shaped search bar
 *   TopNavSearch  — the nav bar wrapper (collapsed icon button + spring-expand bar)
 *
 * Spec:   components/search/search-spec.md
 * Figma:  https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006978-23158
 *
 * v1 scope: search bar + TopNavSearch collapsed/expanded states only.
 * The Open state (results dropdown) is deferred — see spec §17.
 *
 * Figma nodes read before this file was generated:
 *   SearchInput (all states):  40006978-23158
 *   FilterSelected state:      40007351-13533
 *   TopNavSearch:              40007095-4048
 *
 * Icon ligature names confirmed from Figma data-name attributes:
 *   search, cancel, filter_alt
 */

import React, { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
// Every value is a semantic CSS variable. Fallbacks are the resolved values from
// the token contract — used only when Storybook has not loaded it yet.
export const T = {
  // Bar fills
  barBg:           "var(--semantic-color-fill-static-neutral-faint)",
  filterActiveFill:"var(--semantic-color-fill-action-primary-subtle-rest)",
  // Icon pill hover/pressed: no semantic token resolves to the correct subtle overlay
  // on a white surface. fill.action.secondary.hover = warm-neutral-200 (#f7f5f3)
  // which creates a visible warm cream box — wrong. Using direct rgba values as a
  // token gap (see search-spec.md §17).
  iconPillHover:   "var(--semantic-color-fill-action-secondary-hover)",
  iconPillPressed: "var(--semantic-color-fill-action-secondary-pressed)",
  badgeFill:       "var(--semantic-color-fill-action-primary-strong-rest)",
  disabledBg:      "var(--primitive-color-cool-neutral-10)",      // token gap §17

  // Bar borders
  borderIdle:     "var(--semantic-color-stroke-static-neutral-faint)",
  borderHover:    "var(--semantic-color-stroke-action-primary-strong-hover)",
  borderActive:   "var(--semantic-color-stroke-action-primary-strong-pressed)",
  borderError:    "var(--semantic-color-stroke-action-status-negative-rest)",
  borderDisabled: "var(--primitive-color-cool-neutral-25)",       // token gap §17
  divider:        "var(--semantic-color-stroke-action-secondary-rest)",

  // Text
  textPlaceholder:"var(--semantic-color-foreground-static-neutral-base)",
  textValue:      "var(--semantic-color-foreground-static-neutral-bold)",

  // Icons
  iconIdle:    "var(--semantic-color-foreground-action-secondary-rest)",
  iconHover:   "var(--semantic-color-foreground-action-secondary-hover)",
  iconDisabled:"var(--semantic-color-foreground-action-disabled)",
  iconError:   "var(--semantic-color-foreground-action-status-negative-on-subtle-rest)",

  // TopNav.Search collapsed control — sits on the dark brand-blue nav surface, so it
  // resolves through the DARK-MODE token set (per Figma node 40007095-4048). The
  // expanded bar itself stays white (light-mode SearchInput) — only the collapsed
  // icon button + its icon use the inverse/mono dark-mode tokens.
  navIconFill:        "var(--semantic-color-foreground-static-neutral-mono)",
  collapsedBtnFill:   "var(--semantic-color-fill-action-primary-subtle-rest)",
  collapsedBtnHover:  "var(--semantic-color-fill-action-primary-subtle-hover)",
  collapsedBtnBorder: "var(--semantic-color-stroke-action-primary-strong-rest)",
  badgeBorderColor:   "var(--semantic-color-fill-static-neutral-faint)",
};

// ─── LAYOUT VALUES ─────────────────────────────────────────────────────────────
export const L = {
  touchTarget:    48,
  // The expanded bar's exit control. AA touch target rather than the nav's own
  // 48, because it sits inside the bar's own run and 48 would crowd the field.
  exitTarget:     "var(--semantic-layout-units-accessibility-touch-target-aa-width)",
  exitGlyph:      20,
  pillHeight:     36,
  barRadius:      64,   // cornerradius.full
  iconBtnRadius:  12,   // cornerradius.focused-element
  iconBtnSize:    24,
  iconSize:       16,
  iconSizeCollapsed: 20,
  barPadH:        8,    // layout.units.padding.xtight
  barGap:         8,    // layout.units.gap.xtight
  iconPillPad:    4,    // layout.units.padding.xxtight
  dividerPad:     4,    // layout.units.padding.xxtight
  badgeSize:      6,
  expandedWidth:  320,  // SearchInput width inside TopNavSearch
  containerPad:   4,    // TopNavSearch container padding
};

// ─── TYPOGRAPHY ────────────────────────────────────────────────────────────────
const TYPE_INPUT = {
  fontFamily: "'Red Hat Text', sans-serif",
  fontSize: "var(--semantic-type-font-size-s)",
  fontWeight:  400,
  lineHeight: "var(--semantic-type-line-height-s-single)",
  letterSpacing: "var(--semantic-type-letter-spacing-spacious)",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

// ─── ICON HELPER ───────────────────────────────────────────────────────────────
// Material Symbols Rounded. Ligature name read from Figma data-name attribute.
// Font loaded by Storybook preview-head.html and by the standalone HTML demo.
function Icon({ name, size = L.iconSize, color, style: extra }) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden="true"
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "block",
        userSelect: "none",
        color,
        // FILL=1 matches the filled Rounded variant in Figma.
        // Figma is the source of truth — icons in the search bar use filled style.
        fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20",
        ...extra,
      }}
    >
      {name}
    </span>
  );
}

// ─── ICON PILL BUTTON ──────────────────────────────────────────────────────────
// 24×24px button with 64px-radius icon pill inside. Hover/pressed via state.
function IconPillButton({ iconName, iconSize = L.iconSize, iconColor, label, onClick, style }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: L.iconBtnSize,
        height: L.iconBtnSize,
        borderRadius: L.iconBtnRadius,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Icon pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: L.barRadius,
          padding: L.iconPillPad,
          background: pressed ? T.iconPillPressed : hov ? T.iconPillHover : "transparent",
          transition: "background var(--motion-duration-2) var(--motion-easing-standard)",
        }}
      >
        <Icon name={iconName} size={iconSize} color={iconColor} />
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SEARCH INPUT
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * SearchInput — the base pill-shaped search bar.
 *
 * Props:
 *   value          — controlled string value
 *   placeholder    — placeholder text (default "Search...")
 *   showFilter     — renders the trailing filter button + divider
 *   filterActive   — filter-active visual state (active border, highlighted funnel)
 *   filterBadge    — shows the dot badge on the funnel icon
 *   disabled       — disabled state (38% opacity, non-interactive)
 *   error          — error visual state
 *   onSearch       — (value) => void — fired on Enter or search icon click
 *   onFilterClick  — () => void — fired on filter button click
 *   onChange       — (value) => void — fired on every keystroke
 *   onClear        — () => void — fired when clear button clicked
 *   className      — additional class on root element
 *   id             — for label association
 *   searchIconAriaLabel — override the leading search icon button label
 *   onSearchIconClick  — when provided, REPLACES the default onSearch behaviour of the
 *                         leading search icon button.
 *                         DEPRECATED for the expand/collapse job: the expanded bar and
 *                         TopNav's takeover both exit via a back arrow placed OUTSIDE
 *                         the field, to the left, so the leading glyph is never a second
 *                         exit sitting beside the trailing clear ✕. Still available for
 *                         a genuinely different leading action.
 */
export function SearchInput({
  value = "",
  placeholder = "Search...",
  showFilter = false,
  filterActive = false,
  filterBadge = false,
  disabled = false,
  error = false,
  onSearch,
  onFilterClick,
  onChange,
  onClear,
  className = "",
  id,
  searchIconAriaLabel = "Search",
  onSearchIconClick,                 // when set, overrides the icon button's onClick
  inputRef: externalInputRef,        // optional external ref (TopNav.Search uses this to focus on expand)
}) {
  const [hovered, setHovered]   = useState(false);
  const [focused, setFocused]   = useState(false);
  const internalInputRef        = useRef(null);
  const inputRef                = externalInputRef || internalInputRef;

  // Derived state
  const hasValue   = value.length > 0;
  const isDisabled = disabled;
  const isError    = error && !disabled;

  // Bar border resolution per spec §6 state matrix
  const getBorderStyle = () => {
    if (isDisabled) return { border: `1px solid ${T.borderDisabled}` };
    if (isError)    return { border: `1px solid ${T.borderError}` };
    if (filterActive || focused || hasValue)
      return { border: `1px solid ${T.borderActive}` };
    if (hovered)    return { border: `1px solid ${T.borderHover}` };
    return { border: `0.75px solid ${T.borderIdle}` };
  };

  // Icon colour resolution
  const iconColor = (() => {
    if (isDisabled) return T.iconDisabled;
    if (isError)    return T.iconError;
    if (hovered || focused) return T.iconHover;
    return T.iconIdle;
  })();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch?.(value);
  };

  const handleClear = () => {
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    // Touch target — 48px, full width (or 320px when inside TopNavSearch)
    <div
      className={className}
      style={{
        boxSizing: "border-box",
        minHeight: L.touchTarget,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        opacity: isDisabled ? 0.38 : 1,
        pointerEvents: isDisabled ? "none" : "auto",
      }}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pill — Container.Main */}
      <div
        role="search"
        aria-label="Search"
        style={{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: L.barGap,
          minHeight: L.pillHeight,
          borderRadius: L.barRadius,
          background: isDisabled ? T.disabledBg : T.barBg,
          overflow: "hidden",
          paddingLeft: L.barPadH,
          paddingRight: L.barPadH,
          transition: "border-color var(--motion-duration-2) var(--motion-easing-standard), background var(--motion-duration-2) var(--motion-easing-standard)",
          ...getBorderStyle(),
        }}
      >
        {/* Leading icon — search button */}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <IconPillButton
            iconName="search"
            iconColor={iconColor}
            label={searchIconAriaLabel}
            onClick={onSearchIconClick ? onSearchIconClick : () => onSearch?.(value)}
          />
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="searchbox"
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          autoComplete="off"
          aria-label="Search"
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          style={{
            ...TYPE_INPUT,
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: hasValue ? T.textValue : T.textPlaceholder,
          }}
        />

        {/* Trailing slot — cancel button (conditional) */}
        {hasValue && (
          <IconPillButton
            iconName="cancel"
            iconColor={iconColor}
            label="Clear search"
            onClick={handleClear}
          />
        )}

        {/* Trailing slot — filter wrap + badge (conditional) */}
        {showFilter && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              borderLeft: `0.75px solid ${T.divider}`,
              paddingLeft: L.dividerPad,
              position: "relative",
            }}
          >
            {/* Filter pill — highlighted when filterActive */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                aria-label={filterActive ? "Open filters (filters active)" : "Open filters"}
                onClick={onFilterClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: L.iconBtnSize,
                  height: L.iconBtnSize,
                  borderRadius: L.iconBtnRadius,
                  background: filterActive ? T.filterActiveFill : "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                  transition: "background var(--motion-duration-2) var(--motion-easing-standard)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    borderRadius: L.barRadius,
                    padding: L.iconPillPad,
                  }}
                >
                  <Icon name="filter_alt" size={L.iconSize} color={iconColor} />
                </div>
              </button>

              {/* Badge dot */}
              {filterBadge && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 1,
                    right: 1,
                    width: L.badgeSize,
                    height: L.badgeSize,
                    borderRadius: "50%",
                    background: T.badgeFill,
                    border: `1.5px solid ${T.badgeBorderColor}`,
                    display: "block",
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//   TOP NAV SEARCH
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * TopNavSearch — the nested search control for TopNav.Global.
 *
 * Canonical display name: **TopNav.Search** (exposed as `TopNav.Search` compound
 * member in top-nav.jsx; the bare identifier here is `TopNavSearch` because JS
 * identifiers can't contain a dot — same convention as TopNav.Global).
 *
 * Sits on the dark brand-blue nav surface. The COLLAPSED icon button resolves
 * through the DARK-MODE token set (inverse fill + mono icon). The EXPANDED bar is
 * the standard white SearchInput (light-mode), exactly as Figma node 40007095-4048
 * shows. Tapping the search icon inside the expanded bar collapses it; the typed
 * query PERSISTS across collapse/expand (never cleared on collapse).
 *
 * Works controlled OR uncontrolled:
 *   - Controlled expand:  pass `expanded` + `onExpandChange`.
 *   - Uncontrolled (default): manages its own expanded state — just drop it in.
 *   - Controlled value:   pass `searchProps.value` + `searchProps.onChange`.
 *   - Uncontrolled value (default): manages its own query string internally so it
 *     persists across collapse/expand without the parent wiring any state.
 *
 * Props:
 *   expanded       — (optional) controlled expanded state
 *   onExpandChange — (optional) (expanded: boolean) => void
 *   searchProps    — all SearchInput props forwarded (value, onChange, showFilter,
 *                    filterActive, filterBadge, onFilterClick, onSearch, ...)
 *   onSearchOpen   — (optional) fired when the bar expands (analytics / focus hook)
 *   className      — additional class on root element
 */
// One-time keyframe for the expanded bar's leftward slide-in (self-contained).
if (typeof document !== "undefined" && !document.getElementById("pds-topnavsearch-anim")) {
  const s = document.createElement("style");
  s.id = "pds-topnavsearch-anim";
  s.textContent = "@keyframes pwSearchExpand{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}";
  document.head.appendChild(s);
}

export function TopNavSearch({
  expanded: expandedProp,
  onExpandChange,
  searchProps = {},
  onSearchOpen,
  breakpoint = "desktop",   // on non-desktop, TopNav renders a full-width takeover instead of the 320px bar
  className = "",
}) {
  const collapsedBtnRef = useRef(null);
  const inputRef        = useRef(null);
  const [hov, setHov]   = useState(false);

  // Expanded state: controlled if `expandedProp` provided, else internal.
  const isExpandedControlled = expandedProp !== undefined;
  const [expandedState, setExpandedState] = useState(false);
  const expanded = isExpandedControlled ? expandedProp : expandedState;

  // Query value: controlled if searchProps.value provided, else internal so the
  // text PERSISTS across collapse/expand (interaction spec requirement).
  const isValueControlled = searchProps.value !== undefined;
  const [queryState, setQueryState] = useState("");
  const query = isValueControlled ? searchProps.value : queryState;

  const setQuery = (v) => {
    if (!isValueControlled) setQueryState(v);
    searchProps.onChange?.(v);
  };

  const expand = () => {
    if (!isExpandedControlled) setExpandedState(true);
    onExpandChange?.(true);
    onSearchOpen?.();
    // Defer focus until the input is in the DOM.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const collapse = () => {
    if (!isExpandedControlled) setExpandedState(false);
    onExpandChange?.(false);
    // NB: query is intentionally NOT cleared — it persists across collapse/expand.
    setTimeout(() => collapsedBtnRef.current?.focus(), 0);
  };

  // Escape key collapses the bar.
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => { if (e.key === "Escape") collapse(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [expanded]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // Footprint is ALWAYS the 48px collapsed slot — the expanded bar is absolutely
        // positioned, so expanding never changes layout / never pushes sibling elements.
        width: L.touchTarget,
        height: L.touchTarget,
        minWidth: L.touchTarget,
        flexShrink: 0,
      }}
    >
      {/* Collapsed control — perfect 32×32 circle inside the 48px touch target
          (Figma node 40006967:20917 — Container.Icon h32 w32 rounded-full). */}
      <button
        ref={collapsedBtnRef}
        type="button"
        aria-label="Open search"
        aria-expanded={expanded}
        onClick={expand}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          // On desktop the icon hides when expanded (the inline bar replaces it). On
          // narrow, the collapsed icon stays — TopNav's full-width takeover overlays it.
          display: (expanded && breakpoint === "desktop") ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          width: L.touchTarget,
          height: L.touchTarget,
          borderRadius: L.iconBtnRadius,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
        }}
      >
        {/* Fixed 32×32 square + border-radius 50% = always a perfect circle, regardless of flex context */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: hov ? T.collapsedBtnHover : T.collapsedBtnFill,
            border: `0.5px solid ${T.collapsedBtnBorder}`,
            transition: "background var(--motion-duration-2) var(--motion-easing-standard)",
          }}
        >
          <Icon
            name="search"
            size={L.iconSizeCollapsed}
            color={T.navIconFill}
          />
        </div>
      </button>

      {/* Expanded bar — absolutely positioned, RIGHT-anchored so it grows LEFTWARD and
          NEVER pushes the elements to its right. It overlays the nav space to its left.
          Desktop only: on narrow widths TopNav renders a full-width takeover instead. */}
      {expanded && breakpoint === "desktop" && (
        <div
          aria-hidden={false}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: L.expandedWidth,
            display: "flex",
            alignItems: "center",
            gap: "var(--semantic-layout-units-gap-xtight)",
            zIndex: 50,
            animation: "pwSearchExpand var(--motion-duration-4) var(--motion-easing-spring) both",
          }}
        >
          {/* Exit, to the LEFT and OUTSIDE the field. It used to be the field's
              own leading search glyph, which meant the expanded bar carried two
              controls of similar weight inches apart: the leading glyph threw
              the whole search away and the trailing ✕ threw only the typed text
              away. A back arrow outside the field is a different shape, on the
              other side, and reads as "go back" rather than "close". The
              leading glyph is now a plain search mark with no action.
              TopNav's full-bar takeover uses the identical affordance, so there
              is one way out of search everywhere. */}
          <button
            type="button"
            aria-label="Back"
            onClick={collapse}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: L.exitTarget, height: L.exitTarget, flexShrink: 0,
              background: "transparent", border: "none", cursor: "pointer",
              borderRadius: L.iconBtnRadius, color: T.navIconFill,
            }}
          >
            <Icon name="arrow_back" size={L.exitGlyph} color={T.navIconFill} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchInput
              {...searchProps}
              value={query}
              onChange={setQuery}
              inputRef={inputRef}
              onSearch={(v) => searchProps.onSearch?.(v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchInput;
