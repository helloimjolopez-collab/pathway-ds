/**
 * OrgSwitcher — Pathway Design System
 *
 * Trigger component for switching organisation/campus context.
 * Lives in the global shell (dark top nav bar).
 * Desktop: full org + campus name. Mobile: abbreviated per Appendix A.
 *
 * NOTE: Component is not fully shipped — spec is PENDING HUMAN REVIEW.
 * The panel/dropdown is not yet designed in Figma; this module ships the
 * trigger only. Do not use in production until spec reaches REVIEWED.
 *
 * Spec:   components/org-switcher/org-switcher-spec.md
 * Figma:  https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583
 */

import React, { useState, useRef, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// All dark-mode tokens — this component is designed for dark/brand nav surfaces.
const T = {
  // Container fills
  fillBase:    "var(--semantic-color-dark-mode-fill-action-tertiary-base,    rgba(160,181,230,0.04))",
  fillHover:   "var(--semantic-color-dark-mode-fill-action-primaryinverse-hover,   rgba(10,18,35,0.16))",
  fillPressed: "var(--semantic-color-dark-mode-fill-action-primaryinverse-pressed, rgba(255,255,255,0.08))",

  // Border
  strokeBase:    "var(--semantic-color-dark-mode-stroke-action-tertiary-base,    rgba(160,181,230,0.16))",
  strokeHover:   "var(--semantic-color-dark-mode-stroke-action-tertiary-hover,   rgba(160,181,230,0.20))",
  strokePressed: "var(--semantic-color-dark-mode-stroke-action-tertiary-pressed, rgba(160,181,230,0.30))",

  // Text
  textBase:    "var(--semantic-color-dark-mode-text-action-mono-base,    #fbfbfb)",
  textHover:   "var(--semantic-color-dark-mode-text-action-mono-hover,   #ffffff)",
  textPressed: "var(--semantic-color-dark-mode-text-action-mono-pressed, #ffffff)",

  // Icon (chevron + avatar border)
  iconBase:    "var(--semantic-color-dark-mode-icon-action-mono-base,    #fbfbfb)",
  iconHover:   "var(--semantic-color-dark-mode-icon-action-mono-hover,   #ffffff)",
  iconPressed: "var(--semantic-color-dark-mode-icon-action-mono-pressed, #ffffff)",

  // Layout
  radiusMedium: "var(--semantic-layout-units-cornerradius-medium, 8px)",
  radiusSmall:  "var(--semantic-layout-units-cornerradius-small,  4px)",
  borderWidth:  "var(--semantic-layout-units-borderwidth-base,    1px)",
  pXxtight:     "var(--semantic-layout-units-padding-xxtight,     4px)",
  pXxxtight:    "var(--semantic-layout-units-padding-xxxtight,    2px)",
  pXtight:      "var(--semantic-layout-units-padding-xtight,      8px)",
  gapXxtight:   "var(--semantic-layout-units-gap-xxtight,         4px)",
};

// ─── ABBREVIATION UTILITIES ───────────────────────────────────────────────────
// Implements Appendix A of org-switcher-spec.md.
// Pure functions — importable independently of React.

const SKIP_WORDS = new Set(["the","a","an","of","in","at","for","and","or"]);

/**
 * Abbreviate an organisation name to exactly 3 uppercase letters.
 * See spec Appendix A §4.
 */
export function abbreviateOrg(name) {
  if (!name) return "???";
  const words = name.trim().split(/\s+/);
  const sig = words.filter(w => !SKIP_WORDS.has(w.toLowerCase()));
  if (sig.length === 0) return name.slice(0,3).toUpperCase();
  if (sig.length === 1) return sig[0].slice(0,3).toUpperCase();
  if (sig.length === 2) {
    const [w1, w2] = sig;
    return (w1[0] + (w1[1] || w1[0]) + w2[0]).toUpperCase();
  }
  return (sig[0][0] + sig[1][0] + sig[2][0]).toUpperCase();
}

const DIRECTIONALS = new Set(["west","east","north","south","central","downtown",
  "northeast","northwest","southeast","southwest"]);

const USPS_STATES = {
  alabama:"AL", alaska:"AK", arizona:"AZ", arkansas:"AR", california:"CA",
  colorado:"CO", connecticut:"CT", delaware:"DE", florida:"FL", georgia:"GA",
  hawaii:"HI", idaho:"ID", illinois:"IL", indiana:"IN", iowa:"IA",
  kansas:"KS", kentucky:"KY", louisiana:"LA", maine:"ME", maryland:"MD",
  massachusetts:"MA", michigan:"MI", minnesota:"MN", mississippi:"MS",
  missouri:"MO", montana:"MT", nebraska:"NE", nevada:"NV",
  "new hampshire":"NH", "new jersey":"NJ", "new mexico":"NM", "new york":"NY",
  "north carolina":"NC", "north dakota":"ND", ohio:"OH", oklahoma:"OK",
  oregon:"OR", pennsylvania:"PA", "rhode island":"RI", "south carolina":"SC",
  "south dakota":"SD", tennessee:"TN", texas:"TX", utah:"UT", vermont:"VT",
  virginia:"VA", washington:"WA", "west virginia":"WV", wisconsin:"WI", wyoming:"WY",
};

/**
 * Abbreviate a campus or sub-org name to exactly 2 uppercase letters.
 * See spec Appendix A §5.
 */
export function abbreviateCampus(name) {
  if (!name) return "";
  const lower = name.trim().toLowerCase();
  if (USPS_STATES[lower]) return USPS_STATES[lower];
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return lower.slice(0,2).toUpperCase();
  if (words.length === 2) {
    const [a, b] = words.map(w => w.toLowerCase());
    const aDir = DIRECTIONALS.has(a), bDir = DIRECTIONALS.has(b);
    if (aDir || bDir) {
      const place = aDir ? b : a, dir = aDir ? a : b;
      return (place[0] + dir[0]).toUpperCase();
    }
    return (a[0] + b[0]).toUpperCase();
  }
  return lower.slice(0,2).toUpperCase();
}

/** Full mobile trigger label: "GCC | WE" or "GCC". */
export function mobileLabel(orgName, campusName) {
  const org = abbreviateOrg(orgName);
  const cam = campusName ? abbreviateCampus(campusName) : "";
  return cam ? `${org} | ${cam}` : org;
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

// Chevron SVG from Figma (fill driven by CSS var for state-aware colour).
function ChevronIcon({ color, open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      aria-hidden="true"
      style={{
        display: "block", flexShrink: 0,
        transform: open ? "rotate(180deg)" : "none",
        transition: "transform 150ms ease",
      }}
    >
      {/* expand_more path from Figma asset, scaled to 16×16 */}
      <path
        d="M8 10.275a.93.93 0 0 1-.3-.05.72.72 0 0 1-.263-.162L3.637 6.263a.636.636 0 0 1 0-.9.636.636 0 0 1 .9 0L8 8.826l3.463-3.463a.636.636 0 0 1 .9 0 .636.636 0 0 1 0 .9L8.563 10.063a.72.72 0 0 1-.263.162.93.93 0 0 1-.3.05Z"
        fill={color}
      />
    </svg>
  );
}

// Org avatar: logo image if provided, otherwise initials block.
function OrgAvatar({ logoUrl, orgName, size, borderColor }) {
  const inner = size - 8; // 4px padding each side
  return (
    <div style={{
      width: size, height: size,
      padding: T.pXxtight,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{
        flex: "1 0 0", height: "100%",
        border: `${T.borderWidth} solid ${borderColor}`,
        borderRadius: T.radiusSmall,
        overflow: "hidden",
        position: "relative",
      }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          // Placeholder: two-letter initials in a branded block
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(53,85,160,0.25)",
          }}>
            <span style={{
              fontSize: Math.max(7, Math.round(inner * 0.55)),
              fontWeight: 700,
              color: "#fbfbfb",
              lineHeight: 1,
              fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
              userSelect: "none",
            }}>
              {abbreviateOrg(orgName).slice(0,2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * OrgSwitcher trigger button.
 *
 * Designed for use on a dark/brand-coloured top navigation surface.
 * Render it inside a containing element that provides the dark background.
 *
 * @param {string}   orgName        Full organisation name
 * @param {string}   [campusName]   Full campus name (empty if no campus)
 * @param {string}   [logoUrl]      Org logo image URL. Omit for initials placeholder.
 * @param {boolean}  [open]         Whether the downstream panel is open (flips chevron)
 * @param {Function} [onClick]      Click handler — use to toggle your panel
 * @param {boolean}  [disabled]     True for single-org users
 * @param {boolean}  [mobile]       Force mobile abbreviated display (auto-detects by default)
 * @param {string}   [className]    Additional class on the root element
 */
export function OrgSwitcher({
  orgName    = "Organisation",
  campusName = "",
  logoUrl,
  open       = false,
  onClick,
  disabled   = false,
  mobile     = false,
  className,
}) {
  const [pressed,  setPressed]  = useState(false);
  const [hovered,  setHovered]  = useState(false);
  const [isMobile, setIsMobile] = useState(mobile);

  // Auto-detect viewport unless mobile prop is forced
  useEffect(() => {
    if (mobile) { setIsMobile(true); return; }
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const h = e => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [mobile]);

  // Resolve state-dependent tokens
  const fill   = pressed ? T.fillPressed   : hovered ? T.fillHover   : T.fillBase;
  const stroke = pressed ? T.strokePressed : hovered ? T.strokeHover : T.strokeBase;
  const text   = pressed ? T.textPressed   : hovered ? T.textHover   : T.textBase;
  const icon   = pressed ? T.iconPressed   : hovered ? T.iconHover   : T.iconBase;

  const desktopLabel = campusName ? `${orgName}  |  ${campusName}` : orgName;
  const mobileText   = mobileLabel(orgName, campusName);

  const ariaLabel = campusName
    ? `Current organisation: ${orgName}, ${campusName}. Activate to switch.`
    : `Current organisation: ${orgName}. Activate to switch.`;

  // Figma dimensions
  const OUTER_MIN  = 48;  // min-h / min-w (touch target)
  const BTN_H      = 36;
  const AVATAR_SZ  = isMobile ? 20 : 24;
  const MAX_W      = isMobile ? 114 : 316;

  return (
    <div
      className={className}
      style={{
        minHeight: OUTER_MIN,
        minWidth:  OUTER_MIN,
        maxWidth:  MAX_W,
        padding:   T.pXxtight,
        display:   "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        position:  "relative",
      }}
    >
      {/* ── Inner button ── */}
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
          display: "flex",
          alignItems: "center",
          height: BTN_H,
          maxHeight: BTN_H,
          minHeight: BTN_H,
          position: "relative",
          borderRadius: T.radiusMedium,
          border: `${T.borderWidth} solid ${stroke}`,
          background: disabled ? T.fillBase : fill,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          padding: 0,
          outline: "none",
          transition: "background 120ms ease, border-color 120ms ease",
          // State-specific inner padding from Figma
          ...(isMobile ? {
            paddingLeft: T.pXxtight, paddingRight: T.pXxxtight, paddingTop: T.pXxtight, paddingBottom: T.pXxtight,
          } : {
            gap: T.gapXxtight, padding: T.pXxtight,
          }),
        }}
        // Focus ring
        onFocus={e  => e.currentTarget.style.outline = `2px solid ${T.iconHover}`}
        onBlur={e   => e.currentTarget.style.outline = "none"}
      >
        {/* ── Container.RowStart ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          ...(isMobile ? {
            justifyContent: "center",
            width:  AVATAR_SZ,
            height: AVATAR_SZ,
          } : {
            gap: T.gapXxtight,
            height: 24,
          }),
        }}>
          {/* Avatar */}
          <OrgAvatar
            logoUrl={logoUrl}
            orgName={orgName}
            size={AVATAR_SZ}
            borderColor={stroke}
          />

          {/* Desktop label (inside RowStart) */}
          {!isMobile && (
            <div style={{
              display: "flex", alignItems: "center", height: "100%",
              maxWidth: 248, paddingRight: T.pXxtight, flexShrink: 0,
            }}>
              <p style={{
                flex: "1 0 0",
                fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "var(--semantic-type-desktop-label-button-s-letterspacing, 0.3px)",
                color: text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 1,
                margin: 0,
              }}>
                {desktopLabel}
              </p>
            </div>
          )}
        </div>

        {/* Mobile label (outside RowStart, after avatar) */}
        {isMobile && (
          <div style={{
            display: "flex", alignItems: "center", height: "100%",
            paddingLeft: T.pXxxtight, paddingRight: T.pXxxtight,
            flexShrink: 0,
          }}>
            <p style={{
              fontFamily: "var(--semantic-type-desktop-label-button-xs-fontfamily, 'Red Hat Text', sans-serif)",
              fontWeight: 500,
              fontSize: 12,
              lineHeight: "18px",
              letterSpacing: "var(--semantic-type-desktop-label-button-xs-letterspacing, 0.3px)",
              color: text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              margin: 0,
            }}>
              {mobileText}
            </p>
          </div>
        )}

        {/* ── Container.RowEnd (chevron) ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: T.pXxxtight, flexShrink: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: T.pXxxtight, flexShrink: 0,
            width: 16, height: 16,
          }}>
            <ChevronIcon color={icon} open={open} />
          </div>
        </div>
      </button>
    </div>
  );
}

export default OrgSwitcher;
