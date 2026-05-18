/**
 * OrgSwitcher — Pathway Design System
 *
 * Trigger + panel component for switching organisation/campus context.
 * Lives in the global shell (dark top nav bar).
 * Desktop: full org name + optional city/diocese name (Catholic orgs only).
 * Mobile: abbreviated per Appendix A of org-switcher-spec.md.
 *
 * Spec:   components/org-switcher/org-switcher-spec.md
 * Figma:  https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007336-9453
 *         Base Desktop: node 40006819:14581
 *         Base Mobile:  node 40006820:14757
 *         Placeholder:  node 40007243:73405
 *
 * ── Figma annotations (data-development-annotations) ──────────────────────────
 * • Container.OrgLabel     — "Text truncates if going beyond 248pt"
 * • Container.OrgName      — "Text Truncates if frame going beyond 170pt"
 * • Container.CityName.Catholic — "Text Truncates if going beyond 72pt |
 *     Container.CityName.Catholic is only implemented and/or shown for Catholic orgs.
 *     CityName does not apply to Protestant orgs. CityName is NOT a suborg name."
 * • Logo must always scale to fill frame proportionally (object-fit: cover).
 *   If org has no logo, use the church placeholder icon (node 40007243:73405).
 */

import React, { useState, useRef, useEffect } from "react";

// ─── CHURCH PLACEHOLDER ICON ──────────────────────────────────────────────────
// Figma node: I40007243:73405;40006817:14372;40007243:73426;84:22159
// Used in the trigger avatar AND in the panel org-logo when no logoUrl is provided.
// DO NOT replace with initials — Figma explicitly specifies this SVG.
const CHURCH_ICON_PATH =
  "M0 12.6667V9.53333C0 9.26667 0.0722222 9.025 0.216667 8.80833C0.361111 8.59167 0.555556 8.42778 0.8 8.31667L2.66667 7.48333V6.15C2.66667 5.89444 2.73333 5.66389 2.86667 5.45833C3 5.25278 3.17778 5.08889 3.4 4.96667L6 3.66667V2.66667H5.33333C5.14444 2.66667 4.98611 2.60278 4.85833 2.475C4.73056 2.34722 4.66667 2.18889 4.66667 2C4.66667 1.81111 4.73056 1.65278 4.85833 1.525C4.98611 1.39722 5.14444 1.33333 5.33333 1.33333H6V0.666667C6 0.477778 6.06389 0.319444 6.19167 0.191667C6.31944 0.0638889 6.47778 0 6.66667 0C6.85556 0 7.01389 0.0638889 7.14167 0.191667C7.26944 0.319444 7.33333 0.477778 7.33333 0.666667V1.33333H8C8.18889 1.33333 8.34722 1.39722 8.475 1.525C8.60278 1.65278 8.66667 1.81111 8.66667 2C8.66667 2.18889 8.60278 2.34722 8.475 2.475C8.34722 2.60278 8.18889 2.66667 8 2.66667H7.33333V3.66667L9.93333 4.96667C10.1556 5.08889 10.3333 5.25278 10.4667 5.45833C10.6 5.66389 10.6667 5.89444 10.6667 6.15V7.48333L12.5333 8.31667C12.7778 8.42778 12.9722 8.59167 13.1167 8.80833C13.2611 9.025 13.3333 9.26667 13.3333 9.53333V12.6667C13.3333 13.0333 13.2028 13.3472 12.9417 13.6083C12.6806 13.8694 12.3667 14 12 14H8.66667C8.47778 14 8.31944 13.9361 8.19167 13.8083C8.06389 13.6806 8 13.5222 8 13.3333V12C8 11.6333 7.86944 11.3194 7.60833 11.0583C7.34722 10.7972 7.03333 10.6667 6.66667 10.6667C6.3 10.6667 5.98611 10.7972 5.725 11.0583C5.46389 11.3194 5.33333 11.6333 5.33333 12V13.3333C5.33333 13.5222 5.26944 13.6806 5.14167 13.8083C5.01389 13.9361 4.85556 14 4.66667 14H1.33333C0.966667 14 0.652778 13.8694 0.391667 13.6083C0.130556 13.3472 0 13.0333 0 12.6667ZM6.66667 8.33333C6.94444 8.33333 7.18056 8.23611 7.375 8.04167C7.56944 7.84722 7.66667 7.61111 7.66667 7.33333C7.66667 7.05556 7.56944 6.81944 7.375 6.625C7.18056 6.43056 6.94444 6.33333 6.66667 6.33333C6.38889 6.33333 6.15278 6.43056 5.95833 6.625C5.76389 6.81944 5.66667 7.05556 5.66667 7.33333C5.66667 7.61111 5.76389 7.84722 5.95833 8.04167C6.15278 8.23611 6.38889 8.33333 6.66667 8.33333Z";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// All dark-mode tokens — this component is designed for dark/brand nav surfaces.
const T = {
  // Container fills (trigger button)
  fillBase:    "var(--semantic-color-dark-mode-fill-action-tertiary-base,    rgba(160,181,230,0.04))",
  fillHover:   "var(--semantic-color-dark-mode-fill-action-primaryinverse-hover,   rgba(10,18,35,0.16))",
  fillPressed: "var(--semantic-color-dark-mode-fill-action-primaryinverse-pressed, rgba(255,255,255,0.08))",

  // Avatar placeholder background — token: fill.action.secondary.base
  // Figma node 40007243:73405: bg-[var(--fill/action/secondary/base,rgba(255,255,255,0.08))]
  fillAvatarPlaceholder: "var(--semantic-color-dark-mode-fill-action-secondary-base, rgba(255,255,255,0.08))",

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

  // Panel (light surface)
  panelBg:     "#ffffff",
  panelShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
  panelRadius: "8px",

  // Panel text
  panelHeading:  "#252525",
  panelOrgName:  "#252525",
  panelCampus:   "#6b6b6b",
  panelSearch:   "#606060",
  panelChevron:  "#c0c0c0",
  searchBg:      "#f4f4f4",
  searchBorder:  "#e0e0e0",

  // Active org highlight
  activeOrg:     "#eef2fb",
  orgHover:      "#f8f8f8",

  // Layout
  radiusMedium: "var(--semantic-layout-units-cornerradius-medium, 8px)",
  radiusSmall:  "var(--semantic-layout-units-cornerradius-small,  4px)",
  borderWidth:  "var(--semantic-layout-units-borderwidth-base,    1px)",
  pXxtight:     "var(--semantic-layout-units-padding-xxtight,     4px)",
  pXxxtight:    "var(--semantic-layout-units-padding-xxxtight,    2px)",
  pXtight:      "var(--semantic-layout-units-padding-xtight,      8px)",
  gapXxtight:   "var(--semantic-layout-units-gap-xxtight,         4px)",
};

// User avatar colors cycling palette
const USER_COLORS = [
  "#5b8def","#9c6dd8","#d96c6c","#4caf7d",
  "#e08c2d","#2b9ec3","#c45d9e","#7cb342",
];

// ─── ABBREVIATION UTILITIES ───────────────────────────────────────────────────
// Implements Appendix A of org-switcher-spec.md.
// Pure functions — importable independently of React.

// Articles, prepositions, conjunctions — never initialled (spec §A.4).
const SKIP_WORDS = new Set(["the","a","an","of","in","at","for","and","or","but"]);

// Known compound org-name words and their constituent parts (spec §A.4.2b).
const COMPOUND_SPLITS = {
  northpoint:  ["north","point"],
  crossroads:  ["cross","roads"],
  hillside:    ["hill","side"],
  hillcrest:   ["hill","crest"],
  charlestown: ["charles","town"],
  brookside:   ["brook","side"],
  lakewood:    ["lake","wood"],
  riverwood:   ["river","wood"],
  ridgewood:   ["ridge","wood"],
  northwood:   ["north","wood"],
  eastwood:    ["east","wood"],
  westwood:    ["west","wood"],
  southwood:   ["south","wood"],
  northridge:  ["north","ridge"],
  westridge:   ["west","ridge"],
  eastridge:   ["east","ridge"],
  southridge:  ["south","ridge"],
  northfield:  ["north","field"],
  westfield:   ["west","field"],
  springfield: ["spring","field"],
  brookfield:  ["brook","field"],
  clearwater:  ["clear","water"],
  greenwood:   ["green","wood"],
  stonegate:   ["stone","gate"],
  cornerstone: ["corner","stone"],
  livingstone: ["living","stone"],
  lifegate:    ["life","gate"],
  newlife:     ["new","life"],
};

/**
 * Abbreviate an organisation name to exactly 3 uppercase letters.
 * See spec Appendix A §A.4.
 */
export function abbreviateOrg(name) {
  if (!name) return "???";
  const words = name.trim().split(/\s+/);
  const sig = words.filter(w => !SKIP_WORDS.has(w.toLowerCase()));
  if (sig.length === 0) return name.slice(0,3).toUpperCase();

  // §A.4.4 single word → first 3 letters
  if (sig.length === 1) return sig[0].slice(0,3).toUpperCase();

  if (sig.length === 2) {
    const [w1, w2] = sig;
    const w1l = w1.toLowerCase();

    // §A.4.2b compound word
    if (COMPOUND_SPLITS[w1l]) {
      const [p1, p2] = COMPOUND_SPLITS[w1l];
      return (p1[0] + p2[0] + w2[0]).toUpperCase();
    }

    // §A.4.2a / §A.4.2c
    const afterFirst = w1.slice(1);
    const distinctive = afterFirst.match(/[xzq]/i);
    const second = distinctive ? distinctive[0] : (w1[1] || w1[0]);
    return (w1[0] + second + w2[0]).toUpperCase();
  }

  // §A.4.1 three or more significant words
  return (sig[0][0] + sig[1][0] + sig[2][0]).toUpperCase();
}

// Exact two-letter codes for single directional campus words (spec §A.5.1).
const DIRECTIONAL_CODES = {
  west: "WE", east: "EA", north: "NO", south: "SO",
  central: "CE", downtown: "DT",
  northeast: "NE", northwest: "NW", southeast: "SE", southwest: "SW",
};

const DIRECTIONALS = new Set(Object.keys(DIRECTIONAL_CODES));

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
 * See spec Appendix A §A.5.
 */
export function abbreviateCampus(name) {
  if (!name) return "";
  const lower = name.trim().toLowerCase();

  // §A.5.2 U.S. states
  if (USPS_STATES[lower]) return USPS_STATES[lower];

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    if (DIRECTIONAL_CODES[lower]) return DIRECTIONAL_CODES[lower];
    return lower.slice(0,2).toUpperCase();
  }

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

// ─── ICON HELPER ──────────────────────────────────────────────────────────────
// Material Symbols Rounded — requires the font to be loaded in the page.
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

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

/**
 * Church SVG rendered inside the avatar frame when no org logo is on file.
 * Figma: node 40007243:73426, positioned at inset 4.17% 8.33% 8.33% 8.33%
 * within the 16px inner avatar frame (= the Avatar div minus its border).
 * DO NOT replace with text initials — Figma explicitly specifies this icon.
 */
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

/**
 * Org avatar in the trigger button.
 * — Logo present: renders org logo as object-fit: cover fill.
 *   "Logo must always scale to fill frame proportionally." (Figma annotation)
 * — No logo: renders church placeholder SVG on fill.action.secondary.base background.
 *   (Figma node 40007243:73405 — NOT initials.)
 */
function TriggerAvatar({ logoUrl, size, borderColor }) {
  return (
    <div style={{
      width: size, height: size,
      padding: T.pXxtight,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {/* Avatar box: border + corner radius from Figma tokens */}
      <div style={{
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
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <ChurchPlaceholderIcon />
        )}
      </div>
    </div>
  );
}

/**
 * Org logo in the panel list rows: 48×48, border-radius 8px.
 * — Logo present: object-fit: cover fill.
 * — No logo: church placeholder SVG on fill.action.secondary.base background.
 */
function PanelOrgLogo({ logoUrl }) {
  return (
    <div style={{
      width: 48, height: 48,
      borderRadius: 8,
      overflow: "hidden",
      flexShrink: 0,
      position: "relative",
      background: T.fillAvatarPlaceholder,
      border: `${T.borderWidth} solid rgba(0,0,0,0.08)`,
    }}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: "8.33% 12.5% 12.5% 12.5%" }}>
          <svg
            viewBox="0 0 13.3333 14"
            width="100%" height="100%"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ display: "block" }}
          >
            <path d={CHURCH_ICON_PATH} fill="#606060" fillOpacity="0.7" />
          </svg>
        </div>
      )}
    </div>
  );
}

// Overlapping user avatar row (up to 8 shown).
function UserAvatarRow({ users = [] }) {
  const visible = users.slice(0, 8);
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {visible.map((u, i) => (
        <div
          key={i}
          style={{
            width: 20, height: 20,
            borderRadius: "50%",
            border: "1.5px solid white",
            background: u.color || USER_COLORS[i % USER_COLORS.length],
            display: "flex", alignItems: "center", justifyContent: "center",
            marginLeft: i === 0 ? 0 : -6,
            overflow: "hidden",
            position: "relative",
            zIndex: visible.length - i,
          }}
        >
          <Icon name="person" size={12} style={{ color: "white" }} />
        </div>
      ))}
    </div>
  );
}

// Individual org list item in the panel.
function OrgListItem({ org, isActive, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const bg = isActive
    ? T.activeOrg
    : hovered ? T.orgHover : "transparent";

  return (
    <button
      type="button"
      onClick={() => onSelect(org.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px",
        width: "100%",
        background: bg,
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
        textAlign: "left",
        transition: "background 150ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <PanelOrgLogo logoUrl={org.logoUrl} />

      {/* Text column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{
          fontSize: 14, fontWeight: 500,
          color: T.panelOrgName,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {org.name}
        </div>
        {org.campus && (
          <div style={{
            fontSize: 12, fontWeight: 400,
            color: T.panelCampus,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {org.campus}
          </div>
        )}
      </div>

      {/* User avatar row */}
      {org.users && org.users.length > 0 && (
        <UserAvatarRow users={org.users} />
      )}

      {/* Chevron */}
      <Icon name="chevron_right" size={16} style={{ color: T.panelChevron, flexShrink: 0 }} />
    </button>
  );
}

// The panel that opens below the trigger.
function OrgPanel({ orgs = [], activeOrgId, onOrgSelect }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = orgs.filter(org =>
    !searchQuery.trim() ||
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.campus && org.campus.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      role="dialog"
      aria-label="Switch organisation"
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        zIndex: 300,
        width: 316,
        background: T.panelBg,
        borderRadius: T.panelRadius,
        boxShadow: T.panelShadow,
        overflow: "hidden",
        animation: "orgPanelIn 200ms cubic-bezier(0,0,0.2,1) both",
      }}
    >
      <style>{`
        @keyframes orgPanelIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 16px 12px",
        fontSize: 14, fontWeight: 600,
        color: T.panelHeading,
        fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
      }}>
        My Organizations
      </div>

      {/* Search bar */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          height: 36,
          background: T.searchBg,
          border: `1px solid ${T.searchBorder}`,
          borderRadius: 9999,
          padding: "0 12px",
        }}>
          <Icon name="search" size={16} style={{ color: T.panelSearch, flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search organisations"
            style={{
              flex: 1, border: "none", background: "transparent",
              outline: "none", fontSize: 14, fontWeight: 400,
              color: T.panelHeading,
              fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
            }}
          />
        </div>
      </div>

      {/* Org list */}
      <div
        role="listbox"
        aria-label="Organisations"
        style={{
          maxHeight: 320,
          overflowY: "auto",
        }}
      >
        {filtered.map(org => (
          <OrgListItem
            key={org.id}
            org={org}
            isActive={org.id === activeOrgId}
            onSelect={onOrgSelect || (() => {})}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: "16px 12px",
            fontSize: 13, color: T.panelCampus,
            fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
            textAlign: "center",
          }}>
            No organisations found
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * OrgSwitcher — trigger button + panel.
 *
 * Designed for use on a dark/brand-coloured top navigation surface.
 * The `open` state is controlled externally; the caller owns open/close logic.
 *
 * Desktop label structure (Figma nodes 40006819:14581 / 40007477:12230 / 40007477:12205):
 *   Container.OrgName (max 170px)  ←  orgName
 *   Container.CityName.Catholic (max 72px, Catholic orgs ONLY)  ←  cityName
 *
 * ⚠️  CityName rules (Figma annotation on node 40007477:12205):
 *   - Only shown for Catholic organisations.
 *   - It is the CITY or DIOCESE name, NOT a campus or sub-org name.
 *   - Protestant orgs show only `orgName` — no pipe, no second field.
 *
 * Mobile label uses the abbreviated form from Appendix A (campusName prop drives
 * the campus abbreviation — this is separate from the desktop CityName.Catholic).
 *
 * @param {string}   orgName        Full organisation name (max 170px before truncation)
 * @param {string}   [cityName]     City/diocese name — Catholic orgs only. Shown after " | " on desktop.
 *                                  Max 72px before truncation. NOT a suborg name.
 * @param {string}   [campusName]   Campus name — drives mobile abbreviated label only (Appendix A §5).
 * @param {string}   [logoUrl]      Org logo URL. Omit → church SVG placeholder (never initials).
 * @param {Array}    [orgs]         Panel org list: [{id, name, campus?, logoUrl?, users?: [{color}]}]
 * @param {string}   [activeOrgId]  Which org is highlighted in the panel
 * @param {Function} [onOrgSelect]  (orgId) => void — called when user picks an org
 * @param {boolean}  [open]         Whether the panel is open (controlled externally)
 * @param {Function} [onClick]      () => void — toggle handler
 * @param {boolean}  [disabled]     True for single-org users
 * @param {boolean}  [mobile]       Force mobile abbreviated display
 * @param {string}   [className]    Additional class on the root element
 */
export function OrgSwitcher({
  orgName    = "Organisation",
  cityName   = "",   // Catholic orgs only — city/diocese name shown on desktop
  campusName = "",   // Campus abbreviation source for mobile label
  logoUrl,
  orgs       = [],
  activeOrgId,
  onOrgSelect,
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
  const isActive = open || pressed;
  const fill   = isActive ? T.fillPressed  : hovered ? T.fillHover   : T.fillBase;
  const stroke = isActive ? T.strokePressed: hovered ? T.strokeHover : T.strokeBase;
  const text   = isActive ? T.textPressed  : hovered ? T.textHover   : T.textBase;
  const icon   = isActive ? T.iconPressed  : hovered ? T.iconHover   : T.iconBase;

  // Mobile label uses campusName for abbreviation (Appendix A §5)
  const mobileText = mobileLabel(orgName, campusName);

  const ariaLabel = cityName
    ? `Current organisation: ${orgName}, ${cityName}. Activate to switch.`
    : `Current organisation: ${orgName}. Activate to switch.`;

  // Figma dimensions (nodes 40006819:14581 desktop / 40006820:14757 mobile)
  const OUTER_MIN  = 48;
  const BTN_H      = 36;
  const AVATAR_SZ  = isMobile ? 20 : 24;
  const MAX_W      = isMobile ? 108 : 316; // Mobile Container.Main max-width = 108px (Figma node 40006820:14758)

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
          ...(isMobile ? {
            paddingLeft: T.pXxtight, paddingRight: T.pXxxtight,
            paddingTop: T.pXxtight, paddingBottom: T.pXxtight,
          } : {
            gap: T.gapXxtight, padding: T.pXxtight,
          }),
        }}
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
          {/* Avatar — logo or church placeholder per Figma */}
          <TriggerAvatar
            logoUrl={logoUrl}
            size={AVATAR_SZ}
            borderColor={stroke}
          />

          {/* Desktop label — two separate containers per Figma anatomy
              Container.OrgLabel (max 248px) →
                Container.OrgName (max 170px, fixed 170px) + Container.CityName.Catholic (max 72px)
              Annotation: CityName is Catholic orgs only — NOT a suborg name. */}
          {!isMobile && (
            <div style={{
              display: "flex", alignItems: "center", height: "100%",
              maxWidth: 248, flexShrink: 0,
            }}>
              {/* Container.OrgName — max 170px, truncates independently */}
              <div style={{
                display: "flex", alignItems: "center", height: "100%",
                width: 170, maxWidth: 170, flexShrink: 0,
              }}>
                <p style={{
                  flex: "1 0 0",
                  fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
                  fontWeight: "var(--semantic-type-desktop-label-button-s-fontweight, 500)",
                  fontSize: "var(--semantic-type-desktop-label-button-s-fontsize, 14px)",
                  lineHeight: "var(--semantic-type-desktop-label-button-s-lineheight, 20px)",
                  letterSpacing: "var(--semantic-type-desktop-label-button-s-letterspacing, 0.3px)",
                  color: text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 1,
                  margin: 0,
                }}>
                  {orgName}
                </p>
              </div>
              {/* Container.CityName.Catholic — max 72px, Catholic orgs only.
                  NOT a suborg name. Shows diocese/city name with leading " | ". */}
              {cityName && (
                <div style={{
                  display: "flex", alignItems: "center", height: "100%",
                  maxWidth: 72, flexShrink: 0,
                }}>
                  <p style={{
                    fontFamily: "var(--semantic-type-desktop-label-button-s-fontfamily, 'Red Hat Text', sans-serif)",
                    fontWeight: "var(--semantic-type-desktop-label-button-s-fontweight, 500)",
                    fontSize: "var(--semantic-type-desktop-label-button-s-fontsize, 14px)",
                    lineHeight: "var(--semantic-type-desktop-label-button-s-lineheight, 20px)",
                    letterSpacing: "var(--semantic-type-desktop-label-button-s-letterspacing, 0.3px)",
                    color: text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 72,
                    margin: 0,
                  }}>
                    {` | ${cityName}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile label */}
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
            width: 16, height: 16,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
          }}>
            <Icon name="expand_more" size={16} style={{ color: icon }} />
          </div>
        </div>
      </button>

      {/* ── Panel ── */}
      {open && !disabled && (
        <OrgPanel
          orgs={orgs}
          activeOrgId={activeOrgId}
          onOrgSelect={onOrgSelect}
        />
      )}
    </div>
  );
}

export default OrgSwitcher;
