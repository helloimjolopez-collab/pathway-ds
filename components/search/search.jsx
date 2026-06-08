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
// tokens.css — used only when Storybook has not loaded tokens.css yet.
export const T = {
  // Bar fills
  barBg:           "var(--semantic-color-light-mode-fill-static-neutral-light, #ffffff)",
  filterActiveFill:"var(--semantic-color-light-mode-fill-action-tertiary-base, #eef2fb)",
  // Icon pill hover/pressed: no semantic token resolves to the correct subtle overlay
  // on a white surface. fill.action.secondaryinverse.hover = warm-neutral-200 (#f7f5f3)
  // which creates a visible warm cream box — wrong. Using direct rgba values as a
  // token gap (see search-spec.md §17).
  iconPillHover:   "rgba(0,0,0,0.06)",
  iconPillPressed: "rgba(0,0,0,0.10)",
  badgeFill:       "var(--semantic-color-light-mode-fill-action-primary-base, #3555a0)",
  collapsedBtnFill:"var(--semantic-color-light-mode-fill-action-primaryinverse-base, rgba(160,181,230,0.08))",
  disabledBg:      "var(--primitive-color-cool-neutral-10, #fbfbfb)",      // token gap §17

  // Bar borders
  borderIdle:     "var(--semantic-color-light-mode-stroke-static-neutral-light, #f6f6f6)",
  borderHover:    "var(--semantic-color-light-mode-stroke-action-primary-hover, #86a0dd)",
  borderActive:   "var(--semantic-color-light-mode-stroke-action-primary-pressed, #6e8bd4)",
  borderError:    "var(--semantic-color-light-mode-stroke-action-negative-base, #b03a3a)",
  borderDisabled: "var(--primitive-color-cool-neutral-30, #ededed)",       // token gap §17
  divider:        "var(--semantic-color-light-mode-stroke-action-secondary-inverse-base, #d2d2d2)",

  // Text
  textPlaceholder:"var(--semantic-color-light-mode-text-static-secondary-subtle, #606060)",
  textValue:      "var(--semantic-color-light-mode-text-static-secondary-bold, #202020)",

  // Icons
  iconIdle:    "var(--semantic-color-light-mode-icon-action-secondary-inverse-base, #6b6b6b)",
  iconHover:   "var(--semantic-color-light-mode-icon-action-secondary-inverse-hover, #545454)",
  iconDisabled:"var(--semantic-color-light-mode-icon-action-secondary-disabled, #979797)",
  iconError:   "var(--semantic-color-light-mode-icon-action-negative-base, #b03a3a)",

  // TopNavSearch surface (dark nav, no semantic dark-mode tokens yet — §17)
  navIconFill:        "rgba(251,251,251,0.9)",
  collapsedBtnBorder: "rgba(251,251,251,0.14)",
  badgeBorderColor:   "var(--semantic-color-light-mode-fill-static-neutral-light, #ffffff)",
};

// ─── LAYOUT VALUES ─────────────────────────────────────────────────────────────
export const L = {
  touchTarget:    48,
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
  fontSize:    14,
  fontWeight:  400,
  lineHeight:  "20px",
  letterSpacing: "0.3px",
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
          transition: "background 160ms cubic-bezier(0.4,0,0.2,1)",
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
 *   searchIconAriaLabel — override the search icon button label (used by TopNavSearch
 *                         to make it "Collapse search")
 *   onSearchIconClick  — when provided, REPLACES the default onSearch behaviour of the
 *                         leading search icon button. TopNavSearch passes `collapse` here
 *                         so tapping the icon inside the expanded bar collapses it.
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
}) {
  const [hovered, setHovered]   = useState(false);
  const [focused, setFocused]   = useState(false);
  const inputRef                = useRef(null);

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
          transition: "border-color 160ms cubic-bezier(0.4,0,0.2,1), background 160ms cubic-bezier(0.4,0,0.2,1)",
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
                  transition: "background 160ms cubic-bezier(0.4,0,0.2,1)",
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
 * TopNavSearch — nav bar wrapper for SearchInput.
 *
 * Props:
 *   expanded       — controlled expanded state
 *   onExpandChange — (expanded: boolean) => void
 *   searchProps    — all SearchInput props forwarded
 *   className      — additional class on root element
 */
export function TopNavSearch({
  expanded = false,
  onExpandChange,
  searchProps = {},
  className = "",
}) {
  const collapsedBtnRef = useRef(null);
  const [hov, setHov]   = useState(false);

  const expand = () => {
    onExpandChange?.(true);
  };

  const collapse = () => {
    onExpandChange?.(false);
    // Return focus to collapsed button after state update
    setTimeout(() => collapsedBtnRef.current?.focus(), 0);
  };

  // Escape key collapses the bar
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
        display: "inline-flex",   // shrinks to content — does not stretch to fill a flex parent
        alignItems: "center",
        justifyContent: "center",
        minHeight: L.touchTarget,
        minWidth: L.touchTarget,
        // Width is explicit so the collapsed state never expands beyond 48px
        width: expanded ? L.expandedWidth + L.containerPad * 2 : L.touchTarget,
        overflow: "hidden",
        padding: L.containerPad,
        position: "relative",
        transition: "width 420ms cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      {/* Collapsed button — 48×48 icon button on dark nav surface */}
      <button
        ref={collapsedBtnRef}
        type="button"
        aria-label="Open search"
        aria-expanded={expanded}
        onClick={expand}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: expanded ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          width: L.touchTarget,
          height: L.touchTarget,
          borderRadius: L.iconBtnRadius,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 8,
          flexShrink: 0,
          transition: "background 160ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Inner pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 32,
            borderRadius: L.barRadius,
            background: T.collapsedBtnFill,
            border: `0.5px solid ${T.collapsedBtnBorder}`,
            padding: 8,
            transition: "background 160ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <Icon
            name="search"
            size={L.iconSizeCollapsed}
            color={T.navIconFill}
          />
        </div>
      </button>

      {/* Expanded bar — slides in when expanded */}
      {expanded && (
        <div
          aria-hidden={false}
          style={{
            width: L.expandedWidth,
          }}
        >
          <SearchInput
            {...searchProps}
            searchIconAriaLabel="Collapse search"
            onSearchIconClick={collapse}
            onSearch={(v) => {
              searchProps.onSearch?.(v);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default SearchInput;
