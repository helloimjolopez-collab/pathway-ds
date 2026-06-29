/**
 * OrgSwitcher — Pathway Design System (v1, trigger only)
 *
 * Trigger button that lives in the brand-blue top nav and shows the active
 * organisation. Catholic orgs render a second container after the org name
 * (city/diocese). Protestant orgs render the org name on its own.
 *
 * Spec:   components/org-switcher/org-switcher-spec.md
 * Figma:  https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583
 *
 * Variants on Figma (all read by the pipeline skill):
 *   Base    Desktop  40006819:14581
 *   Hover   Desktop  40006819:14582
 *   Pressed Desktop  40006933:15754
 *   Open    Desktop  40007336:9453    (Open variant — used only for the chevron rotation)
 *   Base    Mobile   40006820:14757
 *   Hover   Mobile   40006820:14772
 *   Pressed Mobile   40006933:15766
 *   Open    Mobile   40007336:17470
 *
 * Figma annotations on the desktop label:
 *   • Container.OrgLabel             — "Text truncates if going beyond 248pt"
 *   • Container.OrgName              — "Text Truncates if frame going beyond 170pt"
 *   • Container.CityName.Catholic    — "Catholic orgs only. NOT a suborg name."
 *
 * The placeholder icon (when no org logo on file) is the church/building SVG
 * at Figma node 40007243:73426. Never replace with text initials.
 *
 * v1 scope (per spec §0): TRIGGER ONLY. The dropdown panel is a separate
 * design pass; this file does not implement one. The `open` prop flips the
 * chevron rotation and pressed-state styling on the trigger itself, that's
 * all. The caller renders whatever (if any) panel they want above/below.
 */

import React, { useState, useEffect } from "react";

// ─── CHURCH PLACEHOLDER ICON ──────────────────────────────────────────────────
// Figma node 40007243:73426. Used when the org has no logo image on file.
const CHURCH_ICON_PATH =
  "M0 12.6667V9.53333C0 9.26667 0.0722222 9.025 0.216667 8.80833C0.361111 8.59167 0.555556 8.42778 0.8 8.31667L2.66667 7.48333V6.15C2.66667 5.89444 2.73333 5.66389 2.86667 5.45833C3 5.25278 3.17778 5.08889 3.4 4.96667L6 3.66667V2.66667H5.33333C5.14444 2.66667 4.98611 2.60278 4.85833 2.475C4.73056 2.34722 4.66667 2.18889 4.66667 2C4.66667 1.81111 4.73056 1.65278 4.85833 1.525C4.98611 1.39722 5.14444 1.33333 5.33333 1.33333H6V0.666667C6 0.477778 6.06389 0.319444 6.19167 0.191667C6.31944 0.0638889 6.47778 0 6.66667 0C6.85556 0 7.01389 0.0638889 7.14167 0.191667C7.26944 0.319444 7.33333 0.477778 7.33333 0.666667V1.33333H8C8.18889 1.33333 8.34722 1.39722 8.475 1.525C8.60278 1.65278 8.66667 1.81111 8.66667 2C8.66667 2.18889 8.60278 2.34722 8.475 2.475C8.34722 2.60278 8.18889 2.66667 8 2.66667H7.33333V3.66667L9.93333 4.96667C10.1556 5.08889 10.3333 5.25278 10.4667 5.45833C10.6 5.66389 10.6667 5.89444 10.6667 6.15V7.48333L12.5333 8.31667C12.7778 8.42778 12.9722 8.59167 13.1167 8.80833C13.2611 9.025 13.3333 9.26667 13.3333 9.53333V12.6667C13.3333 13.0333 13.2028 13.3472 12.9417 13.6083C12.6806 13.8694 12.3667 14 12 14H8.66667C8.47778 14 8.31944 13.9361 8.19167 13.8083C8.06389 13.6806 8 13.5222 8 13.3333V12C8 11.6333 7.86944 11.3194 7.60833 11.0583C7.34722 10.7972 7.03333 10.6667 6.66667 10.6667C6.3 10.6667 5.98611 10.7972 5.725 11.0583C5.46389 11.3194 5.33333 11.6333 5.33333 12V13.3333C5.33333 13.5222 5.26944 13.6806 5.14167 13.8083C5.01389 13.9361 4.85556 14 4.66667 14H1.33333C0.966667 14 0.652778 13.8694 0.391667 13.6083C0.130556 13.3472 0 13.0333 0 12.6667ZM6.66667 8.33333C6.94444 8.33333 7.18056 8.23611 7.375 8.04167C7.56944 7.84722 7.66667 7.61111 7.66667 7.33333C7.66667 7.05556 7.56944 6.81944 7.375 6.625C7.18056 6.43056 6.94444 6.33333 6.66667 6.33333C6.38889 6.33333 6.15278 6.43056 5.95833 6.625C5.76389 6.81944 5.66667 7.05556 5.66667 7.33333C5.66667 7.61111 5.76389 7.84722 5.95833 8.04167C6.15278 8.23611 6.38889 8.33333 6.66667 8.33333Z";

// ─── DESIGN TOKENS (dark mode) ────────────────────────────────────────────────
// Every value is a semantic token name. Fallbacks are the resolved Figma values
// — they're never used at runtime when Storybook loads tokens.css, but they
// keep the file readable on its own.
const T = {
  // Container fills
  fillBase:    "var(--semantic-color-dark-mode-fill-action-tertiary-base,    rgba(160,181,230,0.04))",
  fillHover:   "var(--semantic-color-dark-mode-fill-action-primaryinverse-hover,   rgba(10,18,35,0.16))",
  fillPressed: "var(--semantic-color-dark-mode-fill-action-primaryinverse-pressed, rgba(255,255,255,0.08))",

  // Avatar placeholder background (when no logo on file)
  fillAvatarPlaceholder: "var(--semantic-color-dark-mode-fill-action-secondary-base, rgba(255,255,255,0.08))",

  // Borders
  strokeBase:    "var(--semantic-color-dark-mode-stroke-action-tertiary-base,    rgba(160,181,230,0.16))",
  strokeHover:   "var(--semantic-color-dark-mode-stroke-action-tertiary-hover,   rgba(160,181,230,0.20))",
  strokePressed: "var(--semantic-color-dark-mode-stroke-action-tertiary-pressed, rgba(160,181,230,0.30))",

  // Text
  textBase:    "var(--semantic-color-dark-mode-text-action-mono-base,    #fbfbfb)",
  textHover:   "var(--semantic-color-dark-mode-text-action-mono-hover,   #ffffff)",
  textPressed: "var(--semantic-color-dark-mode-text-action-mono-pressed, #ffffff)",

  // Chevron icon
  iconBase:    "var(--semantic-color-dark-mode-icon-action-mono-base,    #fbfbfb)",
  iconHover:   "var(--semantic-color-dark-mode-icon-action-mono-hover,   #ffffff)",
  iconPressed: "var(--semantic-color-dark-mode-icon-action-mono-pressed, #ffffff)",

  // Geometry
  radiusMedium: "var(--semantic-layout-units-cornerradius-medium, 8px)",
  radiusSmall:  "var(--semantic-layout-units-cornerradius-small,  4px)",
  borderWidth:  "var(--semantic-layout-units-borderwidth-base,    1px)",
  pXxtight:     "var(--semantic-layout-units-padding-xxtight,     4px)",
  pXxxtight:    "var(--semantic-layout-units-padding-xxxtight,    2px)",
  gapXxtight:   "var(--semantic-layout-units-gap-xxtight,         4px)",
};

// ─── ICON HELPER ──────────────────────────────────────────────────────────────
// Material Symbols Rounded. Pathway uses Material Symbols for all icons
// (CLAUDE.md icon rules). The font is loaded by the Storybook preview-head
// and by the standalone HTML demo.
function Icon({ name, size = 20, style }) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden="true"
      style={{ fontSize: size, lineHeight: 1, display: "block", userSelect: "none", ...style }}
    >
      {name}
    </span>
  );
}

// ─── CHURCH PLACEHOLDER (no-logo state) ───────────────────────────────────────
// Renders inside the avatar frame at Figma's specified inset (4.17% top,
// 8.33% sides, 8.33% bottom). White at 70% opacity.
function ChurchPlaceholderIcon() {
  return (
    <div style={{ position: "absolute", inset: "4.17% 8.33% 8.33% 8.33%" }}>
      <svg
        viewBox="0 0 13.3333 14"
        width="100%" height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <path d={CHURCH_ICON_PATH} fill="white" fillOpacity="0.7" />
      </svg>
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
// Outer Container.Avatar: declared size×size with 2px padding (xxxtight).
// box-sizing:border-box keeps padding INSIDE the declared dimensions so the
// avatar doesn't overflow the 24-tall RowStart.
// Inner Avatar div: 1px border, rounded-4, holds either the logo <img> or
// the church placeholder SVG.
function TriggerAvatar({ logoUrl, size, borderColor }) {
  return (
    <div style={{
      boxSizing: "border-box",
      width: size, height: size,
      padding: T.pXxxtight,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{
        boxSizing: "border-box",
        flex: "1 0 0", height: "100%",
        border: `${T.borderWidth} solid ${borderColor}`,
        borderRadius: T.radiusSmall,
        overflow: "hidden",
        position: "relative",
        background: logoUrl ? "transparent" : T.fillAvatarPlaceholder,
      }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <ChurchPlaceholderIcon />
        )}
      </div>
    </div>
  );
}

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
// Label/Button/S — used on both desktop and mobile per Figma. The primitive
// values in tokens.css are unitless (e.g. lineheight=20, not 20px), which
// breaks CSS inline `lineHeight: var(...)` because 20 is interpreted as a
// multiplier. So raw px values are used here, with the token names captured
// in comments. If/when the primitive values get units, swap these to vars.
const TYPE_S = {
  // --semantic-type-desktop-label-button-s-*
  fontFamily: "'Red Hat Text', sans-serif",
  fontWeight: 500,
  fontSize: 14,
  lineHeight: "20px",
  letterSpacing: "0.3px",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  textAlign: "left",
};

// ═════════════════════════════════════════════════════════════════════════════
//   ORG SWITCHER — TRIGGER (v1)
// ═════════════════════════════════════════════════════════════════════════════
//
// Props
//   orgName   — full organisation name. Truncates with ellipsis at 180px
//               desktop / 50px mobile.
//   orgType   — "protestant" (default) | "catholic". Catholic-only gate
//               for the CityName container (spec §0.1). Even if a cityName
//               string is supplied, Protestant orgs render no city container.
//   cityName  — city/diocese name. Catholic orgs only.
//   logoUrl   — org logo image URL. When provided the logo avatar renders.
//               When absent no avatar is shown — org name only (Figma default:
//               showOrgAvatar = false). The church placeholder is NOT shown.
//   open      — controlled open state. Flips the chevron rotation and applies
//               pressed-state styling. The caller renders any panel above.
//   onClick   — () => void — fired when the trigger is activated.
//   disabled  — true for single-org users. Renders inert at 50% opacity.
//   mobile    — force the mobile compact display regardless of viewport.

export function OrgSwitcher({
  orgName    = "Organisation",
  orgType    = "protestant",
  cityName   = "",
  logoUrl,
  open       = false,
  onClick,
  disabled   = false,
  mobile,                       // tristate: true=force mobile, false=force desktop, undefined=auto-detect
  className,
}) {
  const [pressed,  setPressed]  = useState(false);
  const [hovered,  setHovered]  = useState(false);
  const [isMobile, setIsMobile] = useState(mobile === true);

  // Viewport detection. When `mobile` is explicitly true or false, that value
  // wins — useful for Storybook stories where the iframe width is artificial.
  // When `mobile` is undefined, fall back to (max-width: 767px) media query.
  useEffect(() => {
    if (mobile === true)  { setIsMobile(true);  return; }
    if (mobile === false) { setIsMobile(false); return; }
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const h = e => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [mobile]);

  // State → token mapping
  const isActive = open || pressed;
  const fill   = isActive ? T.fillPressed   : hovered ? T.fillHover   : T.fillBase;
  const stroke = isActive ? T.strokePressed : hovered ? T.strokeHover : T.strokeBase;
  const text   = isActive ? T.textPressed   : hovered ? T.textHover   : T.textBase;
  const icon   = isActive ? T.iconPressed   : hovered ? T.iconHover   : T.iconBase;

  // CityName visibility — Catholic orgs ONLY (spec §0.1).
  const showCityName = orgType === "catholic" && Boolean(cityName);

  const ariaLabel = showCityName
    ? `Current organisation: ${orgName}, ${cityName}. Activate to switch.`
    : `Current organisation: ${orgName}. Activate to switch.`;

  // Avatar size from Figma — Container.Avatar size-24 desktop, h-full (=20) mobile
  const AVATAR_SZ = isMobile ? 20 : 24;

  return (
    <div
      className={className}
      style={{
        // Outer wrapper. min-w/h 48 (touch target). Mobile gets a fixed
        // w-108 per Figma 40006820:14757. Desktop is content-sized.
        boxSizing: "border-box",
        minHeight: 48,
        minWidth:  48,
        ...(isMobile
          ? { width: 108 }
          : {}),
        // Mobile asymmetric padding (px-2 py-4) vs desktop uniform (p-4)
        ...(isMobile
          ? { paddingLeft: T.pXxxtight, paddingRight: T.pXxxtight, paddingTop: T.pXxtight, paddingBottom: T.pXxtight }
          : { padding: T.pXxtight }),
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        position: "relative",
        width: isMobile ? 108 : "fit-content",
      }}
    >
      {/* Container.Main — the pill button */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={onClick}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => !disabled && setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          height: 36, maxHeight: 36, minHeight: 36,
          maxWidth: isMobile ? 102 : 308,
          borderRadius: T.radiusMedium,
          border: `${T.borderWidth} solid ${stroke}`,
          background: disabled ? T.fillBase : fill,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          // Figma: Container.Main — pl-12px pr-6px py-4px (Padding/Medium, XTight, XXTight)
          paddingLeft:   12,
          paddingRight:  6,
          paddingTop:    T.pXxtight,
          paddingBottom: T.pXxtight,
          // Desktop: 2px gap between RowStart and RowEnd. Mobile: no gap.
          ...(isMobile ? {} : { gap: T.pXxxtight }),
          outline: "none",
          transition: "background var(--motion-duration-2) var(--motion-easing-standard), border-color var(--motion-duration-2) var(--motion-easing-standard)",
        }}
        onFocus={e => {
          // Only show focus ring on keyboard navigation, not on mouse click
          if (e.target.matches?.(':focus-visible')) {
            e.currentTarget.style.outline = `2px solid ${T.iconHover}`;
            e.currentTarget.style.outlineOffset = "2px";
          }
        }}
        onBlur={e => (e.currentTarget.style.outline = "none")}
      >
        {/* Intermediate wrapper around RowStart — `flex flex-row items-center
            self-stretch` per Figma desktop. Lets the row vertically fill the
            button content area on desktop. */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", alignSelf: "stretch", flexShrink: 0 }}>
          {/* Container.RowStart */}
          <div style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            gap: T.gapXxtight,
            ...(isMobile
              ? { height: 20, maxWidth: 74 }
              : { height: "100%" }),
          }}>
            {/* Avatar only rendered when a logo URL is explicitly provided.
                The church placeholder is no longer shown by default — per Figma
                the OrgSwitcher shows org name only (showOrgAvatar = false). */}
            {logoUrl && <TriggerAvatar logoUrl={logoUrl} size={AVATAR_SZ} borderColor={stroke} />}

            {/* Container.OrgLabel — DESKTOP ONLY (annotation: truncates at 248pt) */}
            {!isMobile && (
              <div style={{
                display: "flex", alignItems: "center", height: "100%",
                maxWidth: 248, flexShrink: 0, minWidth: 0,
              }}>
                {/* Container.OrgName — content-sized, max-w 180.
                    Annotation: "Text Truncates if frame going beyond 170pt"
                    Figma autolayout class is max-w-[180px] (treat 180 as the
                    cap; "170pt" annotation is the design intent).
                    The inner <p> has max-w-[200px] per Figma autolayout. */}
                <div style={{
                  display: "flex", alignItems: "center", height: "100%",
                  maxWidth: 180, flexShrink: 1, minWidth: 0,
                }}>
                  <p style={{
                    ...TYPE_S,
                    color: text,
                    margin: 0,
                    maxWidth: 200,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {orgName}
                  </p>
                </div>

                {/* Container.CityName.Catholic — Catholic orgs ONLY (spec §0.1).
                    Figma annotation: "Catholic orgs only. NOT a suborg name."
                    The 6px left padding gives the pipe visual breathing room
                    from the OrgName — Figma renders this gap via the
                    OrgLabel autolayout, but with overflow:hidden + nowrap on
                    the inner <p>, leading whitespace inside the <p> is
                    unreliable across browsers. Use padding instead. */}
                {showCityName && (
                  <div style={{
                    display: "flex", alignItems: "center", height: "100%",
                    maxWidth: 78, flexShrink: 0, minWidth: 0,
                    paddingLeft: 6,
                  }}>
                    <p style={{
                      ...TYPE_S,
                      color: text,
                      margin: 0,
                      maxWidth: 72,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {`| ${cityName}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Container.Label — MOBILE ONLY (Figma 40007067:13273).
                Fixed w-50, holds the truncated full org name. Typography is
                Label/Button/S — same scale as desktop. */}
            {isMobile && (
              <div style={{
                display: "flex", alignItems: "center", height: "100%",
                width: 50, flexShrink: 0, minWidth: 0,
              }}>
                <p style={{
                  ...TYPE_S,
                  color: text,
                  margin: 0,
                  maxWidth: 50,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {orgName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Container.RowEnd — p-2 (xxxtight) around the trailing icon */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: T.pXxxtight,
          flexShrink: 0,
        }}>
          {/* Container.IconTrailing — size-16, p-2, holds the chevron */}
          <div style={{
            boxSizing: "border-box",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 16, height: 16,
            padding: T.pXxxtight,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform var(--motion-duration-4) var(--motion-easing-standard)",
          }}>
            <Icon name="expand_more" size={12} style={{ color: icon }} />
          </div>
        </div>
      </button>
    </div>
  );
}

export default OrgSwitcher;
