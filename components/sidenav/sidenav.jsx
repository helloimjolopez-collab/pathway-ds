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
import ReactDOM from "react-dom";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Semantic token → resolved value. Kept as constants (not CSS vars) because the
// contextual.navitem.* family was dropped by sync-tokens (Blue.180 orphan).
// Migrate to var(--semantic-color-light-mode-fill-contextual-navitem-*) once
// those tokens are restored in Figma.
export const T = {
  fill: {
    navBase:    "#fafafa",
    navHover:   "#11111105",
    navActive:  "#a0b5e629",
    navTrail:   "#11111105",
    infoSubtle: "#edf0f9",
  },
  surface: { navLight: "#fafafa" },
  text: {
    navBase:      "#313131",
    navHover:     "#252525",
    navActive:    "#1b2d57",
    secondary:    "#7b7b7b",  // Text/Static/Secondary/Light — SectionLabel
  },
  icon: {
    navBase:   "#484848",
    navHover:  "#313131",
    navActive: "#2d4889",
  },
  indicator: "#2d4889",
  radius:    8,
};

// ─── LAYOUT VALUES (no semantic tokens in Figma — raw values) ─────────────────
export const L = {
  navPadH:     12,
  navPadV:     14,
  navW:        220,
  navWcol:     72,
  menuGap:     8,
  menuPadB:    24,
  itemH:       48,
  iconWrap:    24,
  iconInner:   16,
  rowPadH:     8,
  textPad:     6,
  childIndent: 24,
  stripeW:     4,
  colPadL:     12,
  colPadR:     8,
  collapseGap: 4,
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
        transition: "background-color 0.15s ease" }} />
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
          overflow: "hidden", transition: "background-color 0.15s ease", userSelect: "none" }}>

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
          transition: "max-width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease" }}>
          <p style={{ fontFamily: "'Red Hat Text',sans-serif", fontWeight: 500,
            fontSize: 14, lineHeight: "20px", letterSpacing: "0.3px", color: textColor, margin: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            transition: "color 0.15s ease" }}>
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
            transition: "max-width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease" }}>
            {isExpanded
              ? (chevronUp ? chevronUp({ size: 10, color: iconColor }) : <ChevUp size={10} color={iconColor} />)
              : (chevronDown ? chevronDown({ size: 10, color: iconColor }) : <ChevDown size={10} color={iconColor} />)}
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
        animation: "popoverInCentered 150ms cubic-bezier(0,0,0.2,1) forwards" }}>
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
        animation: "popoverIn 150ms cubic-bezier(0,0,0.2,1) forwards" }}>
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
        transition: "background-color 0.15s ease" }}>
      <div style={{ width: 4, alignSelf: "stretch", borderRadius: "0 4px 4px 0",
        backgroundColor: isActive ? T.indicator : "transparent",
        flexShrink: 0, transition: "background-color 0.15s ease" }} />
      <span style={{ padding: "0 8px", fontFamily: "'Red Hat Text',sans-serif",
        fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: "0.02px",
        color, transition: "color 0.15s ease", flex: 1 }}>
        {item.label}
      </span>
    </div>
  );
}

// ─── CollapseButton ───────────────────────────────────────────────────────────
export function CollapseButton({ isSidebarCollapsed, onToggle, collapseIcon, expandIcon }) {
  const [h, setH] = useState(false);
  const colIconColor = h ? T.icon.navHover : T.icon.navBase;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 1, backgroundColor: T.fill.infoSubtle, marginBottom: L.collapseGap }} />
      <div onClick={onToggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        aria-label={isSidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
        role="button" tabIndex={0}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && onToggle()}
        style={{ display: "flex", alignItems: "center", minHeight: L.itemH, width: "100%",
          borderRadius: T.radius, backgroundColor: h ? T.fill.navHover : T.fill.navBase,
          cursor: "pointer", transition: "background-color 0.15s ease", overflow: "hidden" }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center",
          paddingLeft: L.colPadL, paddingRight: L.colPadR, height: "100%" }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", minHeight: 24 }}>
            <div style={{ width: L.iconWrap, height: L.iconWrap, display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {isSidebarCollapsed
                ? (expandIcon ? expandIcon({ size: 18, color: colIconColor })
                    : <ExpandIcon size={18} color={colIconColor} />)
                : (collapseIcon ? collapseIcon({ size: 18, color: colIconColor })
                    : <CollapseIcon size={18} color={colIconColor} />)}
            </div>
            <span style={{ paddingLeft: L.textPad, paddingRight: L.textPad,
              fontFamily: "'Red Hat Text',sans-serif", fontWeight: 500, fontSize: 14,
              lineHeight: "20px", letterSpacing: "0.3px", color: h ? T.text.navHover : T.text.navBase,
              transition: "color 0.15s ease, max-width 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease",
              maxWidth: isSidebarCollapsed ? 0 : 120,
              opacity: isSidebarCollapsed ? 0 : 1,
              overflow: "hidden", whiteSpace: "nowrap",
              pointerEvents: isSidebarCollapsed ? "none" : "auto" }}>
              Collapse
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SideNav (top-level container) ────────────────────────────────────────────
export function SideNav({
  items,
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

  const trailParentId = (() => {
    const p = items.find(item => item.children && item.children.some(c => c.id === activeId));
    return p ? p.id : null;
  })();

  const toggleExpand = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
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

  return (
    <nav className={className} style={{
      width: collapsed ? L.navWcol : L.navW,
      height: "100%",
      backgroundColor: T.surface.navLight,
      display: "flex", flexDirection: "column",
      padding: `${L.navPadV}px ${L.navPadH}px`,
      boxSizing: "border-box", flexShrink: 0,
      transition: "width 0.36s cubic-bezier(0.4,0,0.2,1)",
      borderRight: `0.5px solid ${T.fill.infoSubtle}`,
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: L.menuGap }}>
        {items.map(item => {
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
              {hasChildren && isExp && !collapsed && (
                <div style={{ display: "flex", flexDirection: "column", gap: L.menuGap, marginTop: 2 }}>
                  {item.children.map(child => (
                    <SideNavItem key={child.id} item={child}
                      isActive={child.id === activeId} isTrail={false}
                      isExpanded={false} isSidebarCollapsed={false}
                      isChild={true} onClick={onNavigate} onToggle={() => {}} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ paddingTop: L.collapseGap, display: hideCollapseButton ? "none" : "block" }}>
          <CollapseButton isSidebarCollapsed={collapsed}
            onToggle={() => onCollapseChange && onCollapseChange(!collapsed)} />
        </div>
      </div>
    </nav>
  );
}

// ─── Built-in chevron/collapse icons (defaults when consumers don't inject) ───
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
function CollapseIcon({ size = 18, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="17.5" height="17.5" rx="8.75" stroke={color} strokeWidth="0.5" />
      <path fill={color} d="M10.8231 4.91184C10.5881 4.67685 10.2093 4.67685 9.97427 4.91184L5.98891 8.8972C5.80187 9.08424 5.80187 9.38638 5.98891 9.57342L9.97427 13.5588C10.2093 13.7938 10.5881 13.7938 10.8231 13.5588C11.0581 13.3238 11.0581 12.9449 10.8231 12.7099L7.35094 9.23291L10.8279 5.75591C11.0581 5.52571 11.0581 5.14204 10.8231 4.91184Z" />
    </svg>
  );
}
function ExpandIcon({ size = 18, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.25" y="0.25" width="17.5" height="17.5" rx="8.75" stroke={color} strokeWidth="0.5" />
      <g transform="scale(-1,1) translate(-18,0)">
        <path fill={color} d="M10.8231 4.91184C10.5881 4.67685 10.2093 4.67685 9.97427 4.91184L5.98891 8.8972C5.80187 9.08424 5.80187 9.38638 5.98891 9.57342L9.97427 13.5588C10.2093 13.7938 10.5881 13.7938 10.8231 13.5588C11.0581 13.3238 11.0581 12.9449 10.8231 12.7099L7.35094 9.23291L10.8279 5.75591C11.0581 5.52571 11.0581 5.14204 10.8231 4.91184Z" />
      </g>
    </svg>
  );
}
