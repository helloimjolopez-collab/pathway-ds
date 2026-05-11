/**
 * OrgSwitcher — Pathway Design System
 *
 * PLACEHOLDER — awaiting Figma node confirmation and spec review.
 * Do not use in production. See org-switcher-spec.md for status.
 *
 * Spec: components/org-switcher/org-switcher-spec.md
 * Figma: TBD
 */

import React, { useState, useRef, useEffect } from "react";

// ─── ABBREVIATION UTILITIES ───────────────────────────────────────────────────
// Implements Appendix A of org-switcher-spec.md.

const SKIP_WORDS = new Set(["the", "a", "an", "of", "in", "at", "for", "and", "or"]);

/**
 * Abbreviate an organisation name to exactly 3 uppercase letters.
 * See spec Appendix A §4 for full rule set.
 */
export function abbreviateOrg(name) {
  if (!name) return "???";
  const words = name.trim().split(/\s+/);
  const significant = words.filter(w => !SKIP_WORDS.has(w.toLowerCase()));

  if (significant.length === 0) return name.slice(0, 3).toUpperCase();

  if (significant.length === 1) {
    return significant[0].slice(0, 3).toUpperCase();
  }

  if (significant.length === 2) {
    const w1 = significant[0];
    const w2 = significant[1];
    return (w1[0] + (w1[1] || w1[0]) + w2[0]).toUpperCase();
  }

  // 3 or more significant words
  return (significant[0][0] + significant[1][0] + significant[2][0]).toUpperCase();
}

const DIRECTIONALS = new Set(["west", "east", "north", "south", "central", "downtown", "northeast", "northwest", "southeast", "southwest"]);

const USPS_STATES = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY",
};

function firstConsonantAfterVowel(str) {
  const s = str.toLowerCase();
  let pastVowel = false;
  for (let i = 0; i < s.length; i++) {
    if ("aeiou".includes(s[i])) { pastVowel = true; continue; }
    if (pastVowel && /[a-z]/.test(s[i])) return s[i].toUpperCase();
  }
  return s[1] ? s[1].toUpperCase() : s[0].toUpperCase();
}

/**
 * Abbreviate a campus or sub-org name to exactly 2 uppercase letters.
 * See spec Appendix A §5 for full rule set.
 */
export function abbreviateCampus(name) {
  if (!name) return "";
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // USPS state?
  if (USPS_STATES[lower]) return USPS_STATES[lower];

  const words = trimmed.split(/\s+/);

  if (words.length === 1) {
    if (DIRECTIONALS.has(lower)) return lower.slice(0, 2).toUpperCase();
    // Single non-directional: first 2 letters
    return lower.slice(0, 2).toUpperCase();
  }

  if (words.length === 2) {
    const [a, b] = words.map(w => w.toLowerCase());
    const aIsDirectional = DIRECTIONALS.has(a);
    const bIsDirectional = DIRECTIONALS.has(b);

    if (aIsDirectional || bIsDirectional) {
      // place + directional: place initial first, then directional initial
      const place = aIsDirectional ? b : a;
      const dir   = aIsDirectional ? a : b;
      return (place[0] + dir[0]).toUpperCase();
    }

    // Two descriptive words: first letter of each
    return (a[0] + b[0]).toUpperCase();
  }

  // Fallback: first two letters of first word
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * Compute the mobile display string for the trigger.
 * Returns e.g. "GCC | WE" or "GCC".
 */
export function mobileLabel(orgName, campusName) {
  const org    = abbreviateOrg(orgName);
  const campus = campusName ? abbreviateCampus(campusName) : "";
  return campus ? `${org} | ${campus}` : org;
}

// ─── PLACEHOLDER TOKENS ───────────────────────────────────────────────────────
// All values are hardcoded placeholders. Replace with semantic CSS vars once
// the Figma node is confirmed and tokens are mapped in §3 of the spec.
const T = {
  trigger: {
    bg:         "transparent",
    bgHover:    "#1111110a",
    bgOpen:     "#11111114",
    text:       "#363636",
    border:     "1px solid #e5e7eb",
    radius:     "6px",
  },
  panel: {
    bg:         "#ffffff",
    border:     "1px solid #e5e7eb",
    shadow:     "0 4px 12px rgba(0,0,0,0.10)",
    radius:     "8px",
  },
  row: {
    bgHover:    "#f5f5f5",
    bgActive:   "#edf0f9",
    text:       "#363636",
    textMuted:  "#71717a",
  },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function OrgAvatar({ name }) {
  const initials = abbreviateOrg(name).slice(0, 2);
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 6,
      background: "#edf0f9", color: "#3555a0",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 11, flexShrink: 0,
      fontFamily: "inherit",
    }}>
      {initials}
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      aria-hidden="true"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease", flexShrink: 0 }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

/**
 * OrgSwitcher
 *
 * @param {string}   orgName        Full organisation name
 * @param {string}   [campusName]   Full campus or sub-org name (omit if none)
 * @param {Array}    orgs           Array of { id, orgName, campusName? } for the panel
 * @param {Function} onOrgChange    Called with the selected org id
 * @param {boolean}  [disabled]     True for single-org users
 * @param {boolean}  [mobile]       Force mobile abbreviated display (default: auto from viewport)
 */
export function OrgSwitcher({
  orgName    = "Organisation",
  campusName = "",
  orgs       = [],
  onOrgChange,
  disabled   = false,
  mobile     = false,
}) {
  const [open, setOpen]         = useState(false);
  const [isMobile, setIsMobile] = useState(mobile);
  const rootRef                 = useRef(null);
  const panelId                 = "org-switcher-panel";

  // Viewport listener
  useEffect(() => {
    if (mobile) return;
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mobile]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const triggerLabel = isMobile
    ? mobileLabel(orgName, campusName)
    : campusName ? `${orgName}  |  ${campusName}` : orgName;

  const fullLabel = campusName
    ? `Current organisation: ${orgName}, ${campusName}. Switch organisation.`
    : `Current organisation: ${orgName}. Switch organisation.`;

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={fullLabel}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px",
          background: open ? T.trigger.bgOpen : T.trigger.bg,
          border: T.trigger.border,
          borderRadius: T.trigger.radius,
          color: T.trigger.text,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit", fontSize: 14, fontWeight: 500,
          opacity: disabled ? 0.5 : 1,
          transition: "background 120ms ease",
        }}
        onMouseEnter={e => { if (!open && !disabled) e.currentTarget.style.background = T.trigger.bgHover; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = T.trigger.bg; }}
      >
        <span aria-hidden="true" style={{ whiteSpace: "nowrap" }}>{triggerLabel}</span>
        <ChevronIcon open={open} />
      </button>

      {/* Panel */}
      {open && (
        <ul
          id={panelId}
          role="listbox"
          aria-label="Select organisation"
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0,
            minWidth: 240, maxHeight: 320, overflowY: "auto",
            background: T.panel.bg,
            border: T.panel.border,
            borderRadius: T.panel.radius,
            boxShadow: T.panel.shadow,
            padding: "4px 0",
            listStyle: "none", margin: 0,
            zIndex: 1000,
          }}
        >
          {orgs.length === 0 && (
            <li style={{ padding: "10px 12px", color: T.row.textMuted, fontSize: 13 }}>
              No organisations available
            </li>
          )}
          {orgs.map(org => {
            const isActive = org.orgName === orgName && (org.campusName || "") === (campusName || "");
            return (
              <li
                key={org.id}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => { onOrgChange?.(org.id); setOpen(false); }}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { onOrgChange?.(org.id); setOpen(false); } }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", cursor: "pointer",
                  background: isActive ? T.row.bgActive : "transparent",
                  transition: "background 100ms ease",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.row.bgHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <OrgAvatar name={org.orgName} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.row.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {org.orgName}
                  </div>
                  {org.campusName && (
                    <div style={{ fontSize: 12, color: T.row.textMuted }}>
                      {org.campusName}
                    </div>
                  )}
                </div>
                {isActive && (
                  <span style={{ color: "#3555a0", flexShrink: 0 }}>
                    <CheckIcon />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default OrgSwitcher;
