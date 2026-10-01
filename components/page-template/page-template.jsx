import React, { useState } from "react";

/**
 * page-template.jsx — the screen template every Amplify page is built on.
 *
 * In Figma the component set is called ScreenTemplate (Amplify 40009709:26016,
 * NewCo mirror 40016724:105674) and it lives on the "Page Template" page under
 * Screen Templates. It is the outermost shell: the top navigation region, the
 * page navigation region, and a scrolling sheet that holds the page's heading,
 * its tabs, its toolbar and its sections.
 *
 * WHAT IT OWNS AND WHAT IT DOES NOT
 * It owns the regions, the sheet, and the four page-level compositions that
 * only ever appear inside a page: PageHeading, PageTabs, PageToolbar and
 * PageSection. It does NOT own what goes in the slots. TopNav and SideNav are
 * real components and are passed in. Card, Input, FilterChip, Heading, Button
 * and the Tabs atoms are separate library components that do not exist in this
 * repo yet, so the places they belong are slots and the stories fill them with
 * the components that do exist.
 *
 * THE FIGMA PROPS, mapped
 *   Breakpoint                 -> breakpoint, which also drives the sheet
 *                                 padding and radius through Responsive: Layout
 *   Show PageTopNavigation     -> showTopNav
 *   Slot.PageNavigation        -> navigation
 *   Container.ScreenContent    -> children
 *
 * A TOKEN GAP WORTH NAMING. The Figma component binds four contextual gaps that
 * are NOT in the Pathway Variables panel: Contextual/Page/Gap/Horizontal and
 * /Vertical, Contextual/Page Heading/Gap/Vertical, Contextual/Section/Gap/
 * Horizontal and /Vertical, and Contextual/ToolBar/Gap/Vertical. They resolve
 * through a published library rather than locally, so they are absent from the
 * export and the repo has no name for them. Each one resolves to a semantic gap
 * that DOES exist (16 is Gap/Base, 8 is Gap/Tight), so this binds those and
 * reports the gap rather than inventing six contextual names that the panel
 * would not recognise.
 *
 * THE SHEET IS THE ONE RESPONSIVE PIECE. Sheet padding and corner radius are
 * the only tokens in the system besides TopNav's that change by breakpoint, and
 * they resolve through a media query in Responsive: Layout. There is no JS
 * branch for them: one name each.
 */

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const RL = (n) => `var(--responsive-layout-${n})`;
const MO = (n) => `var(--motion-${n})`;

export const T = {
  canvas:        SC("fill-surface-canvas"),
  sheet:         SC("fill-surface-elevated"),
  sectionFill:   SC("fill-static-neutral-faint"),
  hover:         SC("fill-static-neutral-subtle"),
  pressed:       SC("fill-static-neutral-strong"),

  border:        SC("stroke-static-neutral-base"),
  divider:       SC("stroke-static-neutral-faint"),
  tabRest:       SC("foreground-action-secondary-rest"),
  tabSelected:   SC("foreground-static-neutral-strong"),
  tabIndicator:  SC("fill-action-primary-strong-rest"),

  title:         SC("foreground-static-neutral-strong"),
  body:          SC("foreground-static-neutral-base"),
  subtle:        SC("foreground-static-neutral-subtle"),
  faint:         SC("foreground-static-neutral-faint"),

  badgeFill:     SC("fill-static-info-subtle"),
  badgeFg:       SC("foreground-static-info-on-subtle"),

  focusRing:     SC("stroke-action-primary-strong-rest"),
};

export const L = {
  // The sheet: the only responsive piece, resolved by media query.
  sheetPadH:     RL("sheet-padding-horizontal"),
  sheetPadTop:   RL("sheet-padding-top"),
  sheetPadBottom:RL("sheet-padding-bottom"),
  sheetRadius:   RL("sheet-corner-radius-cornerradius"),
  containerPadH: RL("sheetcontainer-padding-horizontal"),
  containerPadTop: RL("sheetcontainer-padding-top"),

  // The four contextual gaps the Figma component names but the panel does not
  // carry. Bound to the semantic gaps they resolve to; see the header note.
  pageGapV:      SU("gap-base"),     // Contextual/Page/Gap/Vertical, 16
  pageGapH:      SU("gap-base"),     // Contextual/Page/Gap/Horizontal, 16
  headingGapV:   SU("gap-tight"),    // Contextual/Page Heading/Gap/Vertical, 8
  sectionGapV:   SU("gap-tight"),    // Contextual/Section/Gap/Vertical, 8
  sectionGapH:   SU("gap-base"),     // Contextual/Section/Gap/Horizontal, 16
  toolbarGapV:   SU("gap-tight"),    // Contextual/ToolBar/Gap/Vertical, 8

  rowGap:        SU("gap-tight"),
  tightGap:      SU("gap-xxtight"),
  tabGap:        SU("gap-relaxed"),

  navItemPadH:   "var(--contextual-layout-units-navitem-padding-horizontal)",
  navItemPadV:   "var(--contextual-layout-units-navitem-padding-vertical)",

  radius:        SU("cornerradius-base"),
  radiusSm:      SU("cornerradius-small"),
  radiusFull:    SU("cornerradius-full"),
  border:        SU("borderwidth-base"),
  borderThin:    SU("borderwidth-xthin"),
  indicator:     SU("borderwidth-thick"),

  target:        SU("accessibility-touch-target-desktop-only-height"),
  targetAA:      SU("accessibility-touch-target-aa-height"),
  tabPadH:       SU("padding-xtight"),
  tabPadV:       SU("padding-xxtight"),

  topNavH:       "var(--contextual-layout-units-topnav-height)",
};

const TYPE = {
  pageHeading: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
    fontSize: ST("font-size-xl"), lineHeight: ST("line-height-xl-single"),
    letterSpacing: ST("letter-spacing-spacious"),
  },
  pageHeadingH2: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
    fontSize: ST("font-size-l"), lineHeight: ST("line-height-l-single"),
    letterSpacing: ST("letter-spacing-spacious"),
  },
  subheading: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
    fontSize: ST("font-size-r"), lineHeight: ST("line-height-r-single"),
    letterSpacing: ST("letter-spacing-spacious"),
  },
  sectionHeading: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
    fontSize: ST("font-size-xs"), lineHeight: ST("line-height-xs-single"),
    letterSpacing: ST("letter-spacing-extraspacious"),
    textTransform: "uppercase",
  },
  tabSelected: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
    fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  tabRest: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
    fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
    letterSpacing: ST("letter-spacing-wide"),
  },
  badge: {
    fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
    fontSize: ST("font-size-xs"), lineHeight: ST("line-height-xs-single"),
    letterSpacing: ST("letter-spacing-extraspacious"),
  },
};

export const BREAKPOINTS = ["desktop", "tablet", "mobile"];

/**
 * The page heading. Heading level, an optional subheading, and a leading and a
 * trailing slot. In Figma the trailing slot is where the page's primary action
 * button lives; Button is not in this repo yet, so it is a slot here.
 */
export function PageHeading({ title, subtitle, level = 1, leading, trailing }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: L.rowGap,
      flexWrap: "wrap", flex: "0 0 auto",
    }}>
      {leading && <div style={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}>{leading}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: L.headingGapV, minWidth: 0, flex: 1 }}>
        {React.createElement(
          level === 2 ? "h2" : "h1",
          { style: { ...(level === 2 ? TYPE.pageHeadingH2 : TYPE.pageHeading), color: T.title, margin: 0 } },
          title,
        )}
        {subtitle && <p style={{ ...TYPE.subheading, color: T.faint, margin: 0 }}>{subtitle}</p>}
      </div>
      {trailing && (
        <div style={{ display: "flex", alignItems: "center", gap: L.tightGap, flex: "0 0 auto" }}>
          {trailing}
        </div>
      )}
    </div>
  );
}

/**
 * Fixed secondary tabs, label only, with an optional badge, over a full-width
 * divider. The selected tab is medium weight plus an indicator, never colour
 * alone.
 */
export function PageTabs({ tabs, activeId, onSelect, ariaLabel = "Page sections" }) {
  return (
    <div role="tablist" aria-label={ariaLabel} style={{
      display: "flex", alignItems: "stretch", gap: L.tabGap,
      borderBottom: `${L.border} solid ${T.divider}`,
      flex: "0 0 auto", minWidth: 0, overflowX: "auto",
    }}>
      {tabs.map((t) => (
        <Tab key={t.id} {...t} selected={t.id === activeId} onSelect={() => onSelect?.(t.id)} />
      ))}
    </div>
  );
}

function Tab({ id, label, badge, disabled, selected, onSelect }) {
  const [hov, setHov] = useState(false);
  const fg = disabled ? T.faint : selected ? T.tabSelected : hov ? T.body : T.tabRest;
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={selected}
      aria-controls={`panel-${id}`}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...(selected ? TYPE.tabSelected : TYPE.tabRest),
        display: "inline-flex", alignItems: "center", gap: L.tightGap,
        minHeight: L.targetAA,
        padding: `${L.tabPadV} ${L.tabPadH}`,
        background: "transparent", color: fg,
        border: "none",
        borderBottom: `${L.indicator} solid ${selected ? T.tabIndicator : "transparent"}`,
        marginBottom: `calc(-1 * ${L.border})`,
        cursor: disabled ? "default" : "pointer",
        whiteSpace: "nowrap", flex: "0 0 auto",
        opacity: disabled ? 0.38 : 1,
        transition: `color ${MO("duration-2")} ${MO("easing-standard")}, border-color ${MO("duration-2")} ${MO("easing-standard")}, opacity ${MO("duration-2")} ${MO("easing-standard")}`,
      }}
    >
      {label}
      {badge != null && (
        <span style={{
          ...TYPE.badge, color: T.badgeFg, background: T.badgeFill,
          borderRadius: L.radiusFull, padding: `0 ${L.tabPadH}`,
        }}>{badge}</span>
      )}
    </button>
  );
}

/**
 * The page toolbar: a leading region and a trailing region, with an optional
 * second row. One row by default, because a toolbar that wraps reads as two
 * toolbars.
 */
export function PageToolbar({ leading, trailing, secondRow }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: L.toolbarGapV, flex: "0 0 auto", minWidth: 0 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: L.rowGap,
        minHeight: L.target, minWidth: 0, flexWrap: "nowrap", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: L.tightGap, minWidth: 0, flex: "0 1 auto", overflow: "hidden" }}>
          {leading}
        </div>
        <span style={{ flex: 1, minWidth: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: L.tightGap, flex: "0 0 auto" }}>
          {trailing}
        </div>
      </div>
      {secondRow && (
        <div style={{ display: "flex", alignItems: "center", gap: L.tightGap, minWidth: 0, flexWrap: "wrap" }}>
          {secondRow}
        </div>
      )}
    </div>
  );
}

/**
 * A page section: an optional heading with its own leading and trailing slots,
 * and a content slot. A page is a stack of these.
 */
export function PageSection({ heading, leading, trailing, children, id }) {
  return (
    <section
      id={id}
      aria-labelledby={heading && id ? `${id}-heading` : undefined}
      style={{ display: "flex", flexDirection: "column", gap: L.sectionGapV, minWidth: 0, flex: "0 0 auto" }}
    >
      {heading && (
        <div style={{ display: "flex", alignItems: "center", gap: L.sectionGapH, minWidth: 0 }}>
          {leading}
          <h2 id={id ? `${id}-heading` : undefined}
            style={{ ...TYPE.sectionHeading, color: T.faint, margin: 0, minWidth: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {heading}
          </h2>
          <span style={{ flex: 1, minWidth: 0 }} />
          {trailing}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: L.sectionGapH, minWidth: 0 }}>
        {children}
      </div>
    </section>
  );
}

/**
 * @param {string} breakpoint   desktop | tablet | mobile. Mirrors the Figma
 *                              variant. The sheet's own padding and radius come
 *                              from Responsive: Layout, not from this, so the
 *                              prop drives layout decisions only.
 * @param {boolean} showTopNav  the Figma boolean Show PageTopNavigation
 * @param {node} topNav         the TopNav region's content
 * @param {node} navigation     Slot.PageNavigation, normally a SideNav
 * @param {node} heading        a PageHeading
 * @param {node} tabs           a PageTabs
 * @param {node} toolbar        a PageToolbar
 * @param {node} children       Container.ScreenContent, normally PageSections
 */
export function PageTemplate({
  breakpoint = "desktop",
  showTopNav = true,
  topNav,
  navigation,
  heading,
  tabs,
  toolbar,
  children,
  style,
  className = "",
}) {
  const stacked = breakpoint === "mobile";

  return (
    <div
      className={`pw-page ${className}`}
      data-breakpoint={breakpoint}
      style={{
        display: "flex", flexDirection: "column",
        minHeight: "100%", minWidth: 0,
        background: T.canvas,
        ...style,
      }}
    >
      {showTopNav && (
        <div style={{ flex: "0 0 auto", position: "relative", zIndex: 100 }}>
          {topNav}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0, minWidth: 0 }}>
        {/* Page navigation. On mobile it is a takeover driven by TopNav rather
            than a rail, so the region is simply not rendered here. */}
        {navigation && !stacked && (
          <div style={{ flex: "0 0 auto", minHeight: 0 }}>{navigation}</div>
        )}

        {/* The sheet container, then the sheet. The container's padding is what
            insets the sheet from the canvas; the sheet's own padding is what
            insets the content. Both are responsive. */}
        <div style={{
          flex: 1, minWidth: 0, minHeight: 0,
          padding: `${L.containerPadTop} ${L.containerPadH} 0`,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            flex: 1, minHeight: 0, minWidth: 0,
            display: "flex", flexDirection: "column", gap: L.pageGapV,
            background: T.sheet,
            borderTopLeftRadius: L.sheetRadius,
            borderTopRightRadius: L.sheetRadius,
            padding: `${L.sheetPadTop} ${L.sheetPadH} ${L.sheetPadBottom}`,
            boxShadow: "var(--elevation-sheet)",
            overflowY: "auto",
          }}>
            {heading}
            {tabs}
            {toolbar}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export const PageTemplateKeyframes = () => (
  <style>{`
.pw-page { --pw-page-gutter: ${L.pageGapH}; }
@media (prefers-reduced-motion: reduce) { .pw-page, .pw-page * { animation: none !important; } }
`}</style>
);

export default PageTemplate;
