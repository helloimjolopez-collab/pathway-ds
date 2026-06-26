/**
 * SideNav — Pathway Design System
 *
 * Importable React component module. Source of truth for the SideNav
 * implementation; the standalone demo (sidenav.html) and the Storybook
 * stories both consume this.
 *
 * Spec: components/sidenav/sidenav-spec.md
 * Figma: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003951-2927
 */

import React, { useState, useRef } from "react";
import { Scrollable } from "../scrollbar/scrollbar.jsx";
import ReactDOM from "react-dom";
import { t } from "../../tokens/resolve-tokens.js";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const T = {
  fill: {
    navBase:    t("Fill/Contextual/NavItem/Base"),
    navHover:   t("Fill/Contextual/NavItem/Hover"),
    navActive:  t("Fill/Contextual/NavItem/Active"),
    navTrail:   t("Fill/Contextual/NavItem/Trail"),   // same resolved value as Hover — kept distinct
    infoSubtle: t("Stroke/Static/Neutral/Light"),      // container right border
  },
  surface: { navLight: t("Surface/Nav/Light") },
  text: {
    navBase:         t("Text/Contextual/NavItem/Base"),
    navHover:        t("Text/Contextual/NavItem/Hover"),
    navActive:       t("Text/Contextual/NavItem/Active"),
    secondary:       t("Text/Static/Secondary/Light"),   // PopoverMenu.SectionLabel
    secondarySubtle: t("Text/Static/Secondary/Subtle"),  // NavSectionLabel
  },
  icon: {
    navBase:         t("Icon/Contextual/NavItem/Base"),
    navHover:        t("Icon/Contextual/NavItem/Hover"),
    navActive:       t("Icon/Contextual/NavItem/Active"),  // also indicator stripe
    actionSecondary: t("Icon/Action/Secondary Inverse/Base"), // CollapseButton icon
  },
  indicator: t("Icon/Contextual/NavItem/Active"),
  radius:    8,  // Radius/M
};

// ─── LAYOUT VALUES (no semantic tokens in Figma — raw values) ─────────────────
export const L = {
  navPadH:     16,   // horizontal padding on expanded SideNav.Container — Padding/Base
  navColPadH:  12,   // horizontal padding on collapsed SideNav.Container — Padding/Medium
  navPadTop:   8,    // top padding on SideNav.Container — Padding/Tight
  navW:        240,  // expanded sidebar width (updated from 220px)
  navWcol:     72,   // collapsed rail width
  menuGap:     6,    // gap between SideNavMenu items — Gap/XTight (corrected 2026-05-26; was 0)
  menuPadT:    8,    // top padding on SideNavMenu (space below the NavHeader divider)
  menuPadB:    56,   // bottom padding in SideNavMenu (space before collapse button, updated from 24)
  itemH:       44,   // min-height per item (Accessibility/Touch Target/AA — Figma 40005281:10058, updated 2026-06-08 from 48)
  iconWrap:    24,   // leading icon wrapper (Accessibility/Icon Wrapping/Large)
  iconInner:   16,   // icon glyph size — Material Symbols Rounded at 16px (updated 2026-06-08 from 14)
  rowPadH:     8,    // horizontal padding in Container.rowStart
  textPad:     6,    // label text padding
  childIndent: 24,   // level-1 left indent inside rowStart 8px
  stripeW:     4,    // indicator stripe width
  colPadL:     12,   // collapse button left padding (Padding/Tight)
  colPadR:     8,    // collapse button right padding (Padding/XTight)
  collapseGap: 4,    // gap above collapse button divider
};

// ─── IndicatorStripe ──────────────────────────────────────────────────────────
export function IndicatorStripe({ visible }) {
  return (
    <div style={{ width: L.stripeW, alignSelf: "stretch", display: "flex",
      flexDirection: "column", alignItems: "flex-start",
      justifyContent: "center", padding: "4px 0", flexShrink: 0 }}>
      <div style={{ flex: "1 0 0", width: L.stripeW, minHeight: 1,
        borderRadius: "0 8px 8px 0",
        backgroundColor: visible ? T.indicator : "transparent",
        transition: "background-color var(--motion-duration-3) var(--motion-easing-standard)" }} />
    </div>
  );
}

// ─── SideNavItem ──────────────────────────────────────────────────────────────
export function SideNavItem({
  item, isActive, isTrail, isExpanded, isSidebarCollapsed,
  isChild, onClick, onToggle,
  popoverOpen, anchorRect, onPopoverEnter, onPopoverLeave, activeId,
  chevronUp, chevronDown, collapseIcon, expandIcon,
}) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = !!(item.children && item.children.length);
  const itemRef = useRef(null);

  const isExpandedGrouper = hasChildren && isExpanded && !isSidebarCollapsed;
  const isCollapsedActiveGrouper = isTrail && (!isExpanded || isSidebarCollapsed);
  const isCollapsedGrouper = isSidebarCollapsed && hasChildren;
  const showStripe = isCollapsedActiveGrouper || (isActive && !isCollapsedGrouper);

  const fillBg =
    (isActive || isCollapsedActiveGrouper) ? T.fill.navActive
    : isExpandedGrouper                    ? T.fill.navTrail
    : hovered                              ? T.fill.navHover
    :                                        T.fill.navBase;
  const textColor =
    (isActive || isCollapsedActiveGrouper || isExpandedGrouper) ? T.text.navActive
    : hovered ? T.text.navHover
    :           T.text.navBase;
  const iconColor =
    (isActive || isCollapsedActiveGrouper) ? T.icon.navActive
    : hovered                              ? T.icon.navHover
    :                                        T.icon.navBase;

  const handleClick = () => {
    if (hasChildren && !isSidebarCollapsed) onToggle(item.id);
    else onClick(item.id);
  };

  return (
    <div ref={itemRef} style={{ position: "relative" }}>
      <div role="button" tabIndex={0} aria-current={isActive ? "page" : undefined}
        aria-expanded={hasChildren && !isSidebarCollapsed ? isExpanded : undefined}
        onClick={handleClick}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleClick()}
        onMouseEnter={() => {
          setHovered(true);
          if (isSidebarCollapsed && onPopoverEnter) {
            const rect = itemRef.current ? itemRef.current.getBoundingClientRect() : null;
            onPopoverEnter(item.id, rect);
          }
        }}
        onMouseLeave={() => {
          setHovered(false);
          if (isSidebarCollapsed && onPopoverLeave) onPopoverLeave();
        }}
        style={{ display: "flex", alignItems: "center", minHeight: L.itemH, width: "100%",
          borderRadius: T.radius, backgroundColor: fillBg, cursor: "pointer",
          overflow: "hidden", transition: "background-color var(--motion-duration-3) var(--motion-easing-standard)", userSelect: "none" }}>

        <IndicatorStripe visible={showStripe} />

        {/* Leading icon — Level 0 only */}
        {!isChild && item.icon && (
          <div style={{ width: L.iconWrap, height: L.iconWrap, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
            marginLeft: L.rowPadH, color: iconColor }}>
            {typeof item.icon === "function"
              ? item.icon({ size: L.iconInner, color: iconColor })
              : React.cloneElement(item.icon, { style: { color: iconColor } })}
          </div>
        )}

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0,
          paddingLeft: isChild ? 32 : L.textPad,
          paddingRight: (!isChild && hasChildren) ? 0 : L.rowPadH,
          maxWidth: isSidebarCollapsed ? 0 : 200,
          opacity: isSidebarCollapsed ? 0 : 1,
          overflow: "hidden",
          pointerEvents: isSidebarCollapsed ? "none" : "auto",
          transition: "max-width var(--motion-duration-6) var(--motion-easing-emphasized), opacity var(--motion-duration-3) var(--motion-easing-standard)" }}>
          <p style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 500,
            fontSize: 14, lineHeight: "20px", letterSpacing: "0.3px", color: textColor, margin: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            transition: "color var(--motion-duration-3) var(--motion-easing-standard)" }}>
            {item.label}
          </p>
        </div>

        {/* Chevron — groupers only */}
        {!isChild && hasChildren && (
          <div style={{ width: 40, height: L.iconWrap, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
            maxWidth: isSidebarCollapsed ? 0 : 40,
            opacity: isSidebarCollapsed ? 0 : 1,
            overflow: "hidden",
            transition: "max-width var(--motion-duration-6) var(--motion-easing-emphasized), opacity var(--motion-duration-3) var(--motion-easing-standard)" }}>
            {/* Chevron rotation matches accordion timing — --motion-duration-5 + --motion-easing-accordion */}
            <div style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform var(--motion-duration-5) var(--motion-easing-accordion)" }}>
              {chevronDown ? chevronDown({ size: 10, color: iconColor }) : <ChevDown size={10} color={iconColor} />}
            </div>
          </div>
        )}
      </div>

      {/* Hover-safe bridge */}
      {isSidebarCollapsed && popoverOpen && anchorRect && (
        <div style={{ position: "fixed", left: anchorRect.right, top: anchorRect.top,
          width: 8, height: anchorRect.height, zIndex: 999 }}
          onMouseEnter={() => {
            const rect = itemRef.current ? itemRef.current.getBoundingClientRect() : anchorRect;
            onPopoverEnter && onPopoverEnter(item.id, rect);
          }} />
      )}

      {/* Collapsed grouper → flyout popover */}
      {isSidebarCollapsed && hasChildren && popoverOpen && anchorRect &&
        <CollapsedPopover item={item} onClick={onClick} anchorRect={anchorRect}
          activeId={activeId}
          onMouseEnter={() => {
            const rect = itemRef.current ? itemRef.current.getBoundingClientRect() : anchorRect;
            onPopoverEnter && onPopoverEnter(item.id, rect);
          }}
          onMouseLeave={onPopoverLeave} />
      }

      {/* Collapsed destination → tooltip */}
      {isSidebarCollapsed && !hasChildren && popoverOpen && anchorRect &&
        <SideNavTooltip label={item.label} anchorRect={anchorRect}
          onMouseEnter={() => {
            const rect = itemRef.current ? itemRef.current.getBoundingClientRect() : anchorRect;
            onPopoverEnter && onPopoverEnter(item.id, rect);
          }}
          onMouseLeave={onPopoverLeave} />
      }
    </div>
  );
}

// ─── SideNavTooltip ─────────────────────────────────────────────────────────
export function SideNavTooltip({ label, anchorRect, onMouseEnter, onMouseLeave }) {
  if (!anchorRect) return null;
  return ReactDOM.createPortal(
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ position: "fixed",
        left: anchorRect.right + 8,
        top: anchorRect.top + anchorRect.height / 2,
        zIndex: 1000, backgroundColor: "#fff",
        border: "0.5px solid #f6f6f6", borderRadius: 8,
        boxShadow: "2px 2px 8px 0px rgba(0,0,0,0.03)",
        padding: "6px 8px", whiteSpace: "nowrap", pointerEvents: "auto",
        animation: "popoverInCentered var(--motion-duration-3) var(--motion-easing-spring) forwards" }}>
      <span style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 400,
        fontSize: 14, lineHeight: "20px", letterSpacing: "0.02px", color: "#202020" }}>
        {label}
      </span>
    </div>,
    document.body
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
// Figma node 40006794-5977 — building block used in CollapsedPopover headers.
// Tokens: Text/Static/Secondary/Light (#7b7b7b), Label/Section/Small/Semibold
//         (11px / 600 / 16px / 0.6px letter-spacing, uppercase)
// Padding: Padding/Tight (12px left), Padding/XTight (8px vertical)
export function SectionLabel({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%",
      paddingLeft: 12, paddingTop: 8, paddingBottom: 8 }}>
      <span style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 600,
        fontSize: 11, lineHeight: "16px", letterSpacing: "0.6px",
        color: T.text.secondary, textTransform: "uppercase",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
    </div>
  );
}

// ─── CollapsedPopover ─────────────────────────────────────────────────────────
export function CollapsedPopover({ item, onClick, anchorRect, onMouseEnter, onMouseLeave, activeId }) {
  if (!anchorRect) return null;
  return ReactDOM.createPortal(
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ position: "fixed", left: anchorRect.right + 8, top: anchorRect.top,
        zIndex: 1000, backgroundColor: "#fff",
        border: "0.5px solid #ededed", borderRadius: 8,
        boxShadow: "2px 2px 8px 4px rgba(0,0,0,0.03)",
        padding: 6, minWidth: 200, pointerEvents: "auto",
        animation: "popoverIn var(--motion-duration-3) var(--motion-easing-spring) forwards" }}>
      {/* Section label — Figma component 40006794-5977 */}
      <div style={{ borderBottom: "0.5px solid #ededed" }}>
        <SectionLabel label={item.label} />
      </div>
      {item.children.map(child =>
        <PopoverRow key={child.id} item={child} onClick={onClick} activeId={activeId} />
      )}
    </div>,
    document.body
  );
}

// ─── PopoverRow ───────────────────────────────────────────────────────────────
export function PopoverRow({ item, onClick, activeId }) {
  const [h, setH] = useState(false);
  const isActive = item.id === activeId;
  const bg = isActive ? T.fill.navActive : h ? T.fill.navHover : "transparent";
  const color = isActive ? T.text.navActive : h ? T.text.navHover : T.text.navBase;
  return (
    <div onClick={() => onClick(item.id)}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", minHeight: 40, borderRadius: 8,
        overflow: "hidden", backgroundColor: bg, cursor: "pointer",
        transition: "background-color var(--motion-duration-3) var(--motion-easing-standard)" }}>
      <div style={{ width: 4, alignSelf: "stretch", borderRadius: "0 4px 4px 0",
        backgroundColor: isActive ? T.indicator : "transparent",
        flexShrink: 0, transition: "background-color var(--motion-duration-3) var(--motion-easing-standard)" }} />
      <span style={{ padding: "0 8px", fontFamily: "'Red Hat Text',sans-serif",
        fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: "0.02px",
        color, transition: "color var(--motion-duration-3) var(--motion-easing-standard)", flex: 1 }}>
        {item.label}
      </span>
    </div>
  );
}

// ─── CollapseButton ───────────────────────────────────────────────────────────
// Redesigned in Figma (2026-05-12): now uses Slot.RowStart (Module.Mark icon)
// + Slot.RowEnd (Action Icon). The action icon uses Icon/Action/Secondary Inverse/Base
// (#6b6b6b) — different from nav item icons. SVG assets fetched from Figma directly.
export function CollapseButton({ isSidebarCollapsed, onToggle, collapseIcon, expandIcon }) {
  const [h, setH] = useState(false);
  const labelColor = h ? T.text.navHover : T.text.navBase;
  const actionIconColor = T.icon.actionSecondary; // #6b6b6b — always static, no hover change
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 1, backgroundColor: T.fill.infoSubtle, marginBottom: L.collapseGap }} />
      <div onClick={onToggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        aria-label={isSidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
        role="button" tabIndex={0}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && onToggle()}
        style={{ display: "flex", alignItems: "center", minHeight: L.itemH, width: "100%",
          borderRadius: T.radius, backgroundColor: h ? T.fill.navHover : T.fill.navBase,
          cursor: "pointer", transition: "background-color var(--motion-duration-3) var(--motion-easing-standard)", overflow: "hidden" }}>

        {/* Slot.RowStart — 4px stripe column (structural, always present) */}
        <div style={{ width: L.stripeW, alignSelf: "stretch", flexShrink: 0 }} />

        {/* Container.Main — label (hidden when collapsed) */}
        <div style={{ flex: 1, paddingLeft: L.rowPadH,
          maxWidth: isSidebarCollapsed ? 0 : 200,
          opacity: isSidebarCollapsed ? 0 : 1,
          overflow: "hidden",
          transition: "max-width var(--motion-duration-5) var(--motion-easing-standard), opacity var(--motion-duration-3) var(--motion-easing-standard)",
          pointerEvents: isSidebarCollapsed ? "none" : "auto" }}>
          <span style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 500, fontSize: 14,
            lineHeight: "20px", letterSpacing: "0.3px", color: labelColor,
            transition: "color var(--motion-duration-3) var(--motion-easing-standard)", whiteSpace: "nowrap" }}>
            Collapse
          </span>
        </div>

        {/* Slot.RowEnd — Action Icon (right_panel_open / left_panel_open from Figma) */}
        <div style={{ width: 40, height: L.iconWrap, display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
          marginLeft: isSidebarCollapsed ? "auto" : 0,
          paddingLeft: isSidebarCollapsed ? 0 : 0 }}>
          {isSidebarCollapsed
            ? (expandIcon
                ? expandIcon({ size: 12, color: actionIconColor })
                : <LeftPanelOpenIcon color={actionIconColor} />)
            : (collapseIcon
                ? collapseIcon({ size: 12, color: actionIconColor })
                : <RightPanelOpenIcon color={actionIconColor} />)}
        </div>
      </div>
    </div>
  );
}

// ─── SideNav (top-level container) ────────────────────────────────────────────
// ── NavSectionLabel ──────────────────────────────────────────────────────────
// Optional in-nav section heading. Figma: SideNav.SectionLabel (node 40006794:5975).
// Tokens: Label/Section/Small/Semibold (11px/600/16px/0.6px), Text/Static/Secondary/Subtle (#606060)
// Container: h-[40px], pl-[4px], pr-[4px], py-[8px]
// In collapsed rail: hidden — replaced by a Divider (rendered by SideNav itself, see §2.3)
// ── NavHeader ────────────────────────────────────────────────────────────────
// Sits at the TOP of the SideNav. 48px row with the expand/collapse action icon
// in Slot.RowEnd (expanded) or centered (collapsed). Divider below.
// Matches Figma "Slot.NavHeader" (node 40007331:7794).
// Hidden on mobile (<768px) — TopNav hamburger is the sole toggle there.
export function NavHeader({ isSidebarCollapsed, onToggle, collapseIcon, expandIcon }) {
  const [h, setH] = useState(false);
  const actionIconColor = T.icon.actionSecondary; // #6b6b6b — always static
  return (
    <div style={{ width: "100%", flexShrink: 0 }}>
      <div onClick={onToggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        aria-label={isSidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
        role="button" tabIndex={0}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && onToggle()}
        style={{ display: "flex", alignItems: "center", height: L.itemH, width: "100%",
          borderRadius: T.radius, cursor: "pointer",
          backgroundColor: h ? T.fill.navHover : "transparent",
          transition: "background-color var(--motion-duration-3) var(--motion-easing-standard)" }}>
        {isSidebarCollapsed ? (
          /* Collapsed: centered action icon */
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {expandIcon
              ? expandIcon({ size: 12, color: actionIconColor })
              : <LeftPanelOpenIcon color={actionIconColor} />}
          </div>
        ) : (
          /* Expanded: right-aligned action icon in Slot.RowEnd */
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{ width: 36, height: 36, display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              {collapseIcon
                ? collapseIcon({ size: 12, color: actionIconColor })
                : <RightPanelOpenIcon color={actionIconColor} />}
            </div>
          </div>
        )}
      </div>
      {/* Divider — Stroke/Static/Neutral/Light, py-[2px] in Figma */}
      <div style={{ padding: "2px 0" }}>
        <div style={{ height: 1, backgroundColor: T.fill.infoSubtle }} />
      </div>
    </div>
  );
}

export function NavSectionLabel({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 40, width: "100%",
      paddingLeft: 4, paddingRight: 4, paddingTop: 8, paddingBottom: 8,
      flexShrink: 0 }}>
      <span style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 600,
        fontSize: 11, lineHeight: "16px", letterSpacing: "0.6px",
        textTransform: "uppercase", color: T.text.secondarySubtle || "#606060",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
    </div>
  );
}

// ── BulletDot ────────────────────────────────────────────────────────────────
// 6px filled circle — leading icon for SideNavListSection's ListItem.
// Color cycles Base / Hover / Active just like SideNavItem icons.
export function BulletDot({ color }) {
  return (
    <div style={{ width: 6, height: 6, borderRadius: "50%",
      backgroundColor: color, flexShrink: 0 }} />
  );
}

// ── ListItem ─────────────────────────────────────────────────────────────────
// Figma: SideNavItemList (node 40007332:6994). Used inside SideNavListSection.
// 48px min-height, 12px/400/18px/0.6px Text/Body/XSmall/Regular.
// Same Base/Hover/Active token cycle as SideNavItem destinations.
export function ListItem({ item, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);
  const bg       = isActive ? T.fill.navActive : hovered ? T.fill.navHover : "transparent";
  const color    = isActive ? T.text.navActive : hovered ? T.text.navHover : T.text.navBase;
  const dotColor = isActive ? T.icon.navActive : hovered ? T.icon.navHover : T.icon.navBase;
  return (
    <div onClick={() => onClick && onClick(item.id)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      role="button" tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick && onClick(item.id)}
      style={{ display: "flex", alignItems: "center", minHeight: L.itemH, width: "100%",
        borderRadius: T.radius, backgroundColor: bg, cursor: "pointer",
        overflow: "hidden", transition: "background-color var(--motion-duration-3) var(--motion-easing-standard)",
        userSelect: "none" }}>
      <IndicatorStripe visible={isActive} />
      <div style={{ width: L.iconWrap, height: L.iconWrap, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
        marginLeft: L.rowPadH }}>
        <BulletDot color={dotColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingLeft: L.textPad, paddingRight: L.rowPadH }}>
        <p style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 400,
          fontSize: 12, lineHeight: "18px", letterSpacing: "0.6px", color,
          margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          transition: "color var(--motion-duration-3) var(--motion-easing-standard)" }}>
          {item.label}
        </p>
      </div>
    </div>
  );
}

// ── SideNavListSection ───────────────────────────────────────────────────────
// Figma: SideNav.ListSection (node 40007332:8034). A labelled grouping of flat
// nav items — no icons, no children, no expand/collapse. Used for contextual
// link lists (Recent Content, Pinned, Bookmarks). Only shown in expanded sidebar.
export function SideNavListSection({ label, items, activeId, onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", flexShrink: 0 }}>
      <NavSectionLabel label={label} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map(item => (
          <ListItem key={item.id} item={item}
            isActive={item.id === activeId}
            onClick={onNavigate} />
        ))}
      </div>
    </div>
  );
}

export function SideNav({
  items,
  sections,
  listSection,
  activeId,
  onNavigate,
  collapsed = false,
  onCollapseChange,
  hideCollapseButton = false,
  defaultExpanded = {},
  className = "",
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [popoverId, setPopoverId] = useState(null);
  const [popoverRect, setPopoverRect] = useState(null);
  const timerRef = useRef(null);

  // Build a single flat list of all nav items for trail computation, regardless of
  // whether the data was passed as flat `items` or as `sections` (which contain items).
  // This keeps the active/trail logic unchanged from the flat-items API.
  const flatItems = sections
    ? sections.flatMap(s => s.items)
    : (items || []);

  const trailParentId = (() => {
    const p = flatItems.find(item => item.children && item.children.some(c => c.id === activeId));
    return p ? p.id : null;
  })();

  // Accordion behaviour: opening one grouper auto-closes any other that's open.
  // Matches the demo HTML (2026-05-13).
  const toggleExpand = id => setExpanded(prev => {
    const isNowOpen = !prev[id];
    if (isNowOpen) return { [id]: true };       // close all others
    const next = { ...prev }; delete next[id]; return next;
  });
  const onPopoverEnter = (id, rect) => {
    clearTimeout(timerRef.current);
    setPopoverId(id);
    if (rect) setPopoverRect(rect);
  };
  const onPopoverLeave = () => {
    timerRef.current = setTimeout(() => {
      setPopoverId(null);
      setPopoverRect(null);
    }, 300);
  };

  // Renders one nav item + its animated child list. Shared between flat-items and
  // sectioned renders so behaviour is identical regardless of which API is used.
  const renderItem = (item) => {
    const hasChildren = !!(item.children && item.children.length);
    const isActive = item.id === activeId;
    const isTrail = item.id === trailParentId;
    const isExp = !!expanded[item.id];
    return (
      <div key={item.id}>
        <SideNavItem item={item} isActive={isActive} isTrail={isTrail}
          isExpanded={isExp} isSidebarCollapsed={collapsed}
          isChild={false} onClick={onNavigate} onToggle={toggleExpand}
          popoverOpen={popoverId === item.id}
          anchorRect={popoverId === item.id ? popoverRect : null}
          onPopoverEnter={onPopoverEnter} onPopoverLeave={onPopoverLeave}
          activeId={activeId} />
        {/* Level 1 children — animated accordion. grid-template-rows 0fr→1fr at
            --motion-duration-5 + --motion-easing-accordion, with inner wrapper opacity
            fade --motion-duration-4 (70ms delay on expand, no delay on collapse). */}
        {hasChildren && !collapsed && (
          <div style={{
            display: "grid",
            gridTemplateRows: isExp ? "1fr" : "0fr",
            marginTop: isExp ? L.menuGap : 0,
            transition: "grid-template-rows var(--motion-duration-5) var(--motion-easing-accordion), margin-top var(--motion-duration-5) var(--motion-easing-accordion)" }}>
            <div style={{
              overflow: "hidden",
              display: "flex", flexDirection: "column", gap: L.menuGap,
              opacity: isExp ? 1 : 0,
              transition: isExp
                ? "opacity var(--motion-duration-4) var(--motion-easing-standard) 70ms"
                : "opacity var(--motion-duration-3) var(--motion-easing-standard)" }}>
              {item.children.map(child => (
                <SideNavItem key={child.id} item={child}
                  isActive={child.id === activeId} isTrail={false}
                  isExpanded={false} isSidebarCollapsed={false}
                  isChild={true} onClick={onNavigate} onToggle={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={className} style={{
      width: collapsed ? L.navWcol : L.navW,
      height: "100%",
      backgroundColor: T.surface.navLight,
      display: "flex", flexDirection: "column",
      paddingTop: L.navPadTop,
      paddingBottom: 0,
      paddingLeft:  collapsed ? L.navColPadH : L.navPadH,
      paddingRight: collapsed ? L.navColPadH : L.navPadH,
      boxSizing: "border-box", flexShrink: 0,
      // Smooth-spring curve — soft personality, no overshoot.
      transition: "width var(--motion-duration-6) var(--motion-easing-emphasized)",
      borderRight: `0.5px solid ${T.fill.infoSubtle}`,
      overflow: "hidden",   // the inner menu scrolls; the nav itself does not
    }}>
      {/* NavHeader — TOP of nav, PINNED (flexShrink:0) so it stays visible while the
          item list scrolls beneath it. Hidden on mobile (<768px). */}
      {!hideCollapseButton && (
        <div style={{ flexShrink: 0 }}>
          <NavHeader isSidebarCollapsed={collapsed}
            onToggle={() => onCollapseChange && onCollapseChange(!collapsed)} />
        </div>
      )}

      {/* SideNavMenu — the ONLY scroll region, wrapped in <Scrollable> so the custom
          overlay scrollbar (identical on every OS, never affects layout/padding) handles
          overflow. flex:1 + minHeight:0 lets it shrink below content height; the pinned
          header above never moves. Applies in BOTH expanded (240px) and collapsed (72px) states. */}
      <Scrollable
        style={{ flex: 1, minHeight: 0,
          // Bleed the scroll region out to the nav's TRUE right edge so the overlay thumb
          // hugs the edge in BOTH states (the nav's border-box paddingRight would otherwise
          // inset the thumb by 16px expanded / 12px on the 72px rail — badly off on the rail).
          marginRight: collapsed ? -L.navColPadH : -L.navPadH }}
        viewStyle={{ display: "flex", flexDirection: "column", gap: L.menuGap,
          paddingTop: L.menuPadT || 8,
          // Re-add the content's right inset INSIDE the scroll view so items keep their
          // position; only the thumb moves to the edge. (Spec rule: padding on viewStyle,
          // never on the wrapper — keeps the thumb flush on any scroll surface.)
          paddingRight: collapsed ? L.navColPadH : L.navPadH }}
      >

        {/* Sectioned render — when `sections` prop is provided */}
        {sections && sections.map(({ section, items: secItems }, sIdx) => (
          <div key={section} style={{ display: "flex", flexDirection: "column",
            gap: L.menuGap, flexShrink: 0 }}>
            {/* Expanded: NavSectionLabel; fades to 0 height as rail collapses */}
            <div style={{ opacity: collapsed ? 0 : 1,
              maxHeight: collapsed ? 0 : 40, overflow: "hidden",
              transition: "opacity var(--motion-duration-4) var(--motion-easing-standard), max-height var(--motion-duration-5) var(--motion-easing-spring)",
              flexShrink: 0 }}>
              <NavSectionLabel label={section} />
            </div>
            {/* Collapsed rail: Divider replaces the section label (skip first section) */}
            {sIdx > 0 && (
              <div style={{ opacity: collapsed ? 1 : 0,
                maxHeight: collapsed ? 5 : 0, overflow: "hidden",
                transition: "opacity var(--motion-duration-4) var(--motion-easing-standard), max-height var(--motion-duration-5) var(--motion-easing-spring)",
                padding: "2px 0", flexShrink: 0 }}>
                <div style={{ height: 1, backgroundColor: T.fill.infoSubtle }} />
              </div>
            )}
            {secItems.map(renderItem)}
          </div>
        ))}

        {/* Flat render — when only `items` is provided (backward compatibility) */}
        {!sections && (items || []).map(renderItem)}

        {/* SideNavListSection — optional. Hidden in collapsed rail. */}
        {listSection && (
          <div style={{ opacity: collapsed ? 0 : 1,
            maxHeight: collapsed ? 0 : 400, overflow: "hidden",
            transition: "opacity var(--motion-duration-4) var(--motion-easing-standard), max-height var(--motion-duration-5) var(--motion-easing-spring)" }}>
            <SideNavListSection label={listSection.label} items={listSection.items}
              activeId={activeId} onNavigate={onNavigate} />
          </div>
        )}

        {/* Bottom spacer — fills remaining height */}
        <div style={{ flex: 1, minHeight: L.menuPadB }} />
      </Scrollable>
    </nav>
  );
}

// ─── Built-in chevron icons ───────────────────────────────────────────────────
function ChevDown({ size = 10, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 5.5L8 10.5L13 5.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevUp({ size = 10, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 10.5L8 5.5L13 10.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Collapse / Expand action icons (fetched from Figma 2026-05-12) ──────────
// right_panel_open — used on the collapse button when sidebar is EXPANDED (click to collapse)
// Token: Icon/Action/Secondary Inverse/Base (#6b6b6b)
// Figma component: SideBar Expand/Collapse, Type=Collapse, node 40006793:3783
function RightPanelOpenIcon({ size = 12, color = T.icon.actionSecondary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M5.66667 7.86667V4.13333C5.66667 3.97778 5.6 3.87222 5.46667 3.81667C5.33333 3.76111 5.21111 3.78889 5.1 3.9L3.46667 5.53333C3.33333 5.66667 3.26667 5.82222 3.26667 6C3.26667 6.17778 3.33333 6.33333 3.46667 6.46667L5.1 8.1C5.21111 8.21111 5.33333 8.23889 5.46667 8.18333C5.6 8.12778 5.66667 8.02222 5.66667 7.86667ZM1.33333 12C0.966667 12 0.652778 11.8694 0.391667 11.6083C0.130556 11.3472 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130556 0.652778 0.391667 0.391667C0.652778 0.130556 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3472 0.130556 11.6083 0.391667C11.8694 0.652778 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8694 11.3472 11.6083 11.6083C11.3472 11.8694 11.0333 12 10.6667 12H1.33333ZM8.66667 10.6667H10.6667V1.33333H8.66667V10.6667ZM7.33333 10.6667V1.33333H1.33333V10.6667H7.33333Z" fill={color} />
    </svg>
  );
}

// left_panel_open — used on the collapse button when sidebar is COLLAPSED (click to expand)
// Token: Icon/Action/Secondary Inverse/Base (#6b6b6b)
// Figma component: SideBar Expand/Collapse, Type=Expand, node 40006793:3783
function LeftPanelOpenIcon({ size = 12, color = T.icon.actionSecondary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6.33333 4.13333V7.86667C6.33333 8.02222 6.4 8.12778 6.53333 8.18333C6.66667 8.23889 6.78889 8.21111 6.9 8.1L8.53333 6.46667C8.66667 6.33333 8.73333 6.17778 8.73333 6C8.73333 5.82222 8.66667 5.66667 8.53333 5.53333L6.9 3.9C6.78889 3.78889 6.66667 3.76111 6.53333 3.81667C6.4 3.87222 6.33333 3.97778 6.33333 4.13333ZM1.33333 12C0.966667 12 0.652778 11.8694 0.391667 11.6083C0.130556 11.3472 0 11.0333 0 10.6667V1.33333C0 0.966667 0.130556 0.652778 0.391667 0.391667C0.652778 0.130556 0.966667 0 1.33333 0H10.6667C11.0333 0 11.3472 0.130556 11.6083 0.391667C11.8694 0.652778 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8694 11.3472 11.6083 11.6083C11.3472 11.8694 11.0333 12 10.6667 12H1.33333ZM3.33333 10.6667V1.33333H1.33333V10.6667H3.33333ZM4.66667 10.6667H10.6667V1.33333H4.66667V10.6667Z" fill={color} />
    </svg>
  );
}
