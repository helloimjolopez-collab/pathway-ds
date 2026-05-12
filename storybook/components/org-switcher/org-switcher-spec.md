# Org Switcher — Pathway Design System Component Spec

**Status:** `PENDING HUMAN REVIEW`

Complete implementation reference for the Org Switcher component. Covers anatomy, design tokens, states, spacing, interaction patterns, and accessibility. Use alongside the [Figma source](#figma-source) for a pixel-accurate build. See [Appendix A](#appendix-a-abbreviation-guidelines) for the full mobile display abbreviation standard.

---

## 1. Component Overview

`OrgSwitcher` is a contextual navigation control that lets a user identify their currently active organisation and campus, and switch to a different one. It lives in the global shell — typically inside the top navigation bar — and is visible at all times while the user is signed in to a multi-org context.

It is **not** used for module-level navigation (that is SideNav's job), for settings access, or for user-profile actions. It is not a generic dropdown or select control: it is specifically scoped to org and campus switching.

The component has two distinct display modes driven by viewport:

- **Desktop** (`≥ 768 px`): renders the full organisation name and, when a campus exists, the full campus name separated by a pipe: `Grace Community Church  |  West Campus`. The trigger is a styled button element, not a plain text label.
- **Mobile** (`< 768 px`): renders abbreviated initialisations of both the org name and the campus name per the rules in [Appendix A](#appendix-a-abbreviation-guidelines): `GCC | WE`. The pipe and campus abbreviation are suppressed when no campus or sub-org exists.

The switcher opens a panel (dropdown or bottom sheet depending on viewport) listing all organisations the signed-in user has access to. Selecting a row switches context and closes the panel.

### Figma source

- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **Org Switcher component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583)

---

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Trigger colours, typography, spacing tokens | Figma: Org Switcher component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) |
| Primitive or semantic token values | Figma: Variables panel | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) |
| Org logo / avatar appearance | Figma: Org Switcher → Container.Avatar | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) |
| Panel / dropdown surface and layout | Not yet designed — deferred | §17 |
| Abbreviation rules (mobile display) | This spec | [Appendix A](#appendix-a-abbreviation-guidelines) |
| Desktop full-name display format | This spec | §5.1 |
| Mobile abbreviated display format | This spec | §5.2 + Appendix A |
| Chevron icon rotation (open/closed) | This spec | §11 |
| Open/close animation | This spec | §14 |
| Keyboard navigation | This spec | §13.3 |
| Responsive breakpoints | This spec | §15 |
| Known gaps and deferred decisions | This spec | §17 |

---

## 2. Component Anatomy

The Figma component (node `40006819:14583`) defines **the trigger button only**. The panel/dropdown is not yet designed; it is a deferred deliverable (see §17).

```
OrgSwitcher.Root                        min-h/w 48px (touch target), p-4px, max-w: 316px (desktop) / 114px (mobile)
└── Container.Main                      h-36px, border 1px, rounded-8px
     ├── Container.RowStart             flex, items-center, gap-4px (desktop) | 20×20px (mobile)
     │    ├── Container.Avatar          24×24px (desktop) | fills 20×20px (mobile), p-4px
     │    │    └── Avatar              border 1px, rounded-4px, overflow-hidden
     │    │         └── Image          org logo or initials placeholder
     │    └── Container.Label          max-w-248px, pr-4px — DESKTOP ONLY (inside RowStart)
     │         └── label text          14px / 500 / 20px lh / 0.3px ls
     ├── Container.Label               px-2px — MOBILE ONLY (outside RowStart)
     │    └── abbreviated text         12px / 500 / 18px lh / 0.3px ls (e.g. "SHC | KV")
     └── Container.RowEnd              p-2px
          └── Container.IconTrailing   p-2px, 16×16px
               └── expand_more icon   SVG chevron, rotates 180° when open
```

> **Note on logo vs placeholder:** The Avatar renders the org's logo image when `logoUrl` is provided. When absent, it renders a two-letter initials block (computed from the org name via `abbreviateOrg()`).

### Trigger label format

| Context | Label content |
|---|---|
| Desktop, with campus | `{Full Org Name}  \|  {Full Campus Name}` |
| Desktop, no campus | `{Full Org Name}` |
| Mobile, with campus | `{ORG} \| {CA}` (per Appendix A) |
| Mobile, no campus | `{ORG}` (per Appendix A) |

---

## 3. Design Tokens

All tokens confirmed from Figma node `40006819:14583`. This component uses **dark-mode tokens** — it is designed for use on dark/brand-coloured navigation surfaces.

### 3.2 Fill

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `fill.action.tertiary.base` | `--semantic-color-dark-mode-fill-action-tertiary-base` | `rgba(160,181,230,0.04)` | Trigger background — base |
| `fill.action.primaryinverse.hover` | `--semantic-color-dark-mode-fill-action-primaryinverse-hover` | `rgba(10,18,35,0.16)` | Trigger background — hover |
| `fill.action.primaryinverse.pressed` | `--semantic-color-dark-mode-fill-action-primaryinverse-pressed` | `rgba(255,255,255,0.08)` | Trigger background — pressed |

### 3.3 Stroke

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `stroke.action.tertiary.base` | `--semantic-color-dark-mode-stroke-action-tertiary-base` | `rgba(160,181,230,0.16)` | Trigger border + avatar border — base |
| `stroke.action.tertiary.hover` | `--semantic-color-dark-mode-stroke-action-tertiary-hover` | `rgba(160,181,230,0.20)` | Trigger border + avatar border — hover |
| `stroke.action.tertiary.pressed` | `--semantic-color-dark-mode-stroke-action-tertiary-pressed` | `rgba(160,181,230,0.30)` | Trigger border + avatar border — pressed |

### 3.4 Text

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `text.action.mono.base` | `--semantic-color-dark-mode-text-action-mono-base` | `#fbfbfb` | Label text — base |
| `text.action.mono.hover` | `--semantic-color-dark-mode-text-action-mono-hover` | `#ffffff` | Label text — hover |
| `text.action.mono.pressed` | `--semantic-color-dark-mode-text-action-mono-pressed` | `#ffffff` | Label text — pressed |

### 3.5 Icon

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `icon.action.mono.base` | `--semantic-color-dark-mode-icon-action-mono-base` | `#fbfbfb` | Chevron + avatar border tint — base |
| `icon.action.mono.hover` | `--semantic-color-dark-mode-icon-action-mono-hover` | `#ffffff` | Chevron — hover |
| `icon.action.mono.pressed` | `--semantic-color-dark-mode-icon-action-mono-pressed` | `#ffffff` | Chevron — pressed |

### 3.6 Geometry

| Property | Value | CSS Variable |
|---|---|---|
| Trigger corner radius | 8px | `--semantic-layout-units-cornerradius-medium` |
| Avatar corner radius | 4px | `--semantic-layout-units-cornerradius-small` |
| Border width | 1px | `--semantic-layout-units-borderwidth-base` |

### 3.7 Typography

| Usage | CSS Variable prefix | Weight | Size | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Trigger label — desktop | `--semantic-type-desktop-label-button-s-` | 500 | 14px | 20px | 0.3px |
| Trigger label — mobile (abbr) | `--semantic-type-desktop-label-button-xs-` | 500 | 12px | 18px | 0.3px |
| Font family (both) | `--semantic-type-desktop-label-button-s-fontfamily` | — | Red Hat Text | — | — |

---

## 4. Layout & Spacing

All values confirmed from Figma node `40006819:14583`.

| Value | px | CSS Variable |
|---|---|---|
| Root outer padding (all sides) | 4px | `--semantic-layout-units-padding-xxtight` |
| Root min-height / min-width (touch target) | 48px | raw |
| Root max-width — desktop | 316px | raw |
| Root max-width — mobile | 114px | raw |
| Inner button height | 36px | raw |
| Inner button padding (desktop) — all sides | 4px | `--semantic-layout-units-padding-xxtight` |
| Inner button padding (mobile) — left/top/bottom | 4px | `--semantic-layout-units-padding-xxtight` |
| Inner button padding (mobile) — right | 2px | `--semantic-layout-units-padding-xxxtight` |
| Gap between avatar and label (desktop, inside RowStart) | 4px | `--semantic-layout-units-gap-xxtight` |
| Container.Avatar — desktop | 24×24px | raw |
| Container.Avatar — mobile | 20×20px | raw |
| Avatar inner padding (all sides) | 4px | `--semantic-layout-units-padding-xxtight` |
| Container.RowEnd padding | 2px | `--semantic-layout-units-padding-xxxtight` |
| Container.IconTrailing padding | 2px | `--semantic-layout-units-padding-xxxtight` |
| Chevron icon size | 16×16px | raw |
| Desktop label max-width | 248px | raw |
| Desktop label right padding | 4px | `--semantic-layout-units-padding-xxtight` |
| Mobile label horizontal padding | 2px | `--semantic-layout-units-padding-xxxtight` |
| Panel layout spacing | TBD — panel not yet designed | — |

---

## 5. Item / Variant Structure

### 5.1 Desktop trigger

- Renders the full legal org name as provided in the organisation record.
- When a campus or sub-org is active, appends ` | ` (space-pipe-space) then the full campus name.
- Truncates with ellipsis (`…`) if the combined string exceeds the available trigger width.
- Chevron icon trails the text on the right.

### 5.2 Mobile trigger

- Renders the abbreviated org initialism (exactly 3 uppercase letters, no periods) computed per [Appendix A §4](#a4-organization-name--three-initial-rule).
- When a campus or sub-org is active, appends ` | ` then the 2-letter campus abbreviation computed per [Appendix A §5](#a5-campus-and-sub-organization--two-initial-rule).
- No truncation: the abbreviated form is always short enough to render fully at mobile widths.
- Chevron icon trails the text on the right.

### 5.3 Avatar — logo present

When `logoUrl` is provided, the avatar renders the org's logo image as a cropped `object-fit: cover` fill inside the bordered rounded container.

### 5.4 Avatar — no logo (placeholder)

When `logoUrl` is absent, the avatar renders the first two letters of the org's abbreviated name (per Appendix A §4) in a tinted block. This is the initials-fallback placeholder.

### 5.5 Panel variants

Not yet designed in Figma. Deferred — see §17.

---

## 6. State Matrix

### Trigger states

All confirmed from Figma (6 variants: State × Type = {Base, Hover, Pressed} × {Desktop, Mobile}).

| Condition | Fill | Stroke | Text | Chevron |
|---|---|---|---|---|
| **Base** | `fill.action.tertiary.base` · `rgba(160,181,230,0.04)` | `stroke.action.tertiary.base` · `rgba(160,181,230,0.16)` | `text.action.mono.base` · `#fbfbfb` | `icon.action.mono.base` · `#fbfbfb` |
| **Hover** | `fill.action.primaryinverse.hover` · `rgba(10,18,35,0.16)` | `stroke.action.tertiary.hover` · `rgba(160,181,230,0.20)` | `text.action.mono.hover` · `#ffffff` | `icon.action.mono.hover` · `#ffffff` |
| **Pressed** | `fill.action.primaryinverse.pressed` · `rgba(255,255,255,0.08)` | `stroke.action.tertiary.pressed` · `rgba(160,181,230,0.30)` | `text.action.mono.pressed` · `#ffffff` | `icon.action.mono.pressed` · `#ffffff` |
| **Disabled** | Base fill | Base stroke | `text.action.mono.disabled` | `icon.action.mono.disabled` |
| **Open** | Hover fill | Hover stroke | Hover text | Rotated 180° |

The avatar border uses the same stroke token as the outer button border per state.

### Panel states

Not yet designed in Figma. Deferred — see §17.

### State logic rules

1. The trigger shows **Open** state as long as the panel is mounted and visible.
2. A row shows **Active** only when it is the currently signed-in org/campus combination — not just hovered.
3. **Disabled** applies when the user belongs to exactly one organisation; the trigger renders but does not open a panel.
4. Chevron rotates 180° on open; rotation is animated per §14.

---

## 7. Sub-components / Decorations

### OrgAvatar
A square or circular block showing either the organisation's logo mark (if one is configured) or a 2–3 character text initialism derived from the org name per Appendix A §4. Size and corner radius: TBD from Figma.

### ActiveMark
A checkmark icon or filled circle that appears on the currently active org row. Token: TBD. Positioned flush right inside the row.

### PanelHeader
Optional static label above the org list ("Switch organisation" or similar). Presence, copy, and typography: TBD from Figma.

---

## 8. Container / Surface

### 8.1 Surface
- Trigger: inherits from top-nav shell surface. Specific fill token: TBD.
- Panel: elevated surface. Shadow token: TBD. Border token: TBD.

### 8.2 Dimensions & Padding
- Trigger width: grows with content (desktop); fixed or min-width constrained (mobile).
- Panel width: matches trigger width or has a minimum (e.g. 240 px). TBD from Figma.
- Panel max-height: scrollable after N rows. TBD.

### 8.3 Transition
- Trigger width change on breakpoint: no animation (instant snap).
- Panel open/close: see §14.

---

## 9. Interaction / Behaviour

- **Click / tap trigger** → toggles panel open/closed.
- **Click / tap org row** → sets that org as active, closes panel, fires `onOrgChange` callback.
- **Click outside panel** → closes panel (focus-trap behaviour does not apply; the panel is not modal).
- **Escape key** → closes panel, returns focus to trigger.
- **Single-org users** → trigger is rendered disabled (no open/close behaviour); no panel mounts.

---

## 10. Collapsed / Compact / Variant-specific State

The mobile abbreviated display (§5.2) is this component's equivalent of a collapsed state. The abbreviation computation is deterministic (Appendix A) and is performed at render time from the raw org and campus names.

No separate "compact" Figma variant is expected — the breakpoint switch handles it entirely via display logic and the abbreviation utility function.

---

## 11. Iconography

- **Chevron:** `expand_more` icon from Figma (path confirmed). 16×16px container (including 2px internal padding on all sides), so effective icon area ~12×12px. Fill uses `icon.action.mono.*` per state. Rotates 180° (`transform: rotate(180deg)`) when the panel is open; transition: 150ms ease.
- **OrgAvatar — logo:** org logo image rendered `object-fit: cover`, filling a square container. Size: 16×16px inner (24×24px outer including 4px padding). Corner radius: 4px (`cornerradius.small`). Border: 1px solid `stroke.action.tertiary.*` per state.
- **OrgAvatar — placeholder:** two-letter initials derived from `abbreviateOrg(orgName).slice(0,2)`, rendered in a tinted block when no `logoUrl` is provided. No separate icon asset needed.

---

## 12. Interaction Patterns

### 12.1 Panel positioning
Panel anchors to the bottom-left corner of the trigger on desktop (dropping down). On mobile it may render as a bottom sheet. Exact positioning offsets: TBD from Figma.

### 12.2 Close-on-outside-click
A `pointerdown` listener on `document` dismisses the panel unless the event target is inside the panel or trigger. This is the same pattern used across Pathway dropdowns.

### 12.3 Abbreviation computation
The abbreviation utility (`abbreviateOrg`, `abbreviateCampus`) must be a pure function importable independently of the React component, so it can be tested in isolation and used by server-side rendering contexts. See Appendix A for the full rule set.

---

## 13. Accessibility

### 13.0 ARIA pattern

The Org Switcher uses the [Disclosure (Show/Hide) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) with `aria-expanded` and `aria-controls`, combined with a `listbox` role on the panel. Alternatively, consider the [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) if the org list supports filtering. Decision deferred to Figma review.

### 13.1 Touch & pointer targets

Per `docs/design-system-spec.md` §Accessibility: minimum 44×44 px touch target on all interactive elements. Org rows must each meet this minimum.

### 13.2 ARIA markup

```html
<!-- Trigger -->
<button
  type="button"
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-controls="org-switcher-panel"
  aria-label="Current organisation: {full org name}. Switch organisation."
>
  <!-- label text (abbreviated on mobile) -->
  <span aria-hidden="true">GCC | WE</span>
  <!-- chevron icon, decorative -->
</button>

<!-- Panel -->
<ul
  id="org-switcher-panel"
  role="listbox"
  aria-label="Select organisation"
>
  <li
    role="option"
    aria-selected="true"
    tabindex="0"
  >
    <!-- org name + campus name -->
  </li>
  <!-- ... -->
</ul>
```

> The visible abbreviated label is wrapped in `aria-hidden="true"`. The button's `aria-label` always uses the full org name so screen readers announce the unabbreviated name.

### 13.3 Keyboard interaction

| Key | Behaviour | Status |
|---|---|---|
| `Enter` / `Space` on trigger | Open/close panel | Required |
| `Escape` | Close panel, return focus to trigger | Required |
| `Arrow Down` | Move focus to next org row | Required |
| `Arrow Up` | Move focus to previous org row | Required |
| `Enter` on org row | Select org, close panel | Required |
| `Tab` | Move focus out of panel, close panel | Required |
| `Home` | Focus first org row | Required |
| `End` | Focus last org row | Required |

### 13.4 Focus styles

Focus ring per system-wide specification in `docs/design-system-spec.md` §Focus. Token: TBD. Reduced-motion: focus ring appears instantly (no transition).

### 13.5 Screen reader announcements

| Event | Announcement |
|---|---|
| Panel opens | "Select organisation, listbox" (role announcement) |
| Row focused | "{Org name}, {campus name if present}, {N} of {total}" |
| Row selected (active) | "{Org name} selected" |
| Panel closes after selection | Focus returns to trigger; trigger label updates; AT reads new label |

### 13.6 Colour contrast

All text-on-background combinations must meet WCAG AA (4.5:1 for body text, 3:1 for large/bold text, 3:1 for interactive UI components). Specific ratios: TBD from Figma token resolution.

---

## 14. Motion

| Property | Value | Why |
|---|---|---|
| Panel enter duration | TBD | Confirm against `docs/design-system-spec.md` §Motion |
| Panel enter easing | TBD | Per system motion spec |
| Panel exit duration | TBD | Exit slightly faster than enter (system convention) |
| Chevron rotation duration | TBD | Matches panel enter duration |
| Chevron rotation easing | TBD | Per system motion spec |
| Reduced motion | No translate/opacity transitions; panel snaps in/out | `prefers-reduced-motion: reduce` |

---

## 15. Responsiveness

| Viewport | Trigger label | Panel behaviour |
|---|---|---|
| `≥ 768 px` (desktop) | Full org name + campus name | Dropdown anchored below trigger |
| `< 768 px` (mobile) | Abbreviated `ORG \| CA` | Bottom sheet or anchored dropdown (TBD) |

Breakpoint values per `docs/design-system-spec.md` §Breakpoints.

---

## 16. What to pass Claude to implement this component

- Confirmed Figma node URL (required — pipeline will refuse without it)
- List of all org + campus name combinations in real MB product data (for abbreviation collision testing per Appendix A §4.5, §5.6)
- Decision on panel behaviour at mobile: anchored dropdown or bottom sheet
- Confirmation on ARIA pattern choice: Disclosure + listbox vs. Combobox
- Icon names for chevron and active mark (from the system icon set)
- Confirmation on whether `OrgAvatar` uses logo marks or initials only at launch

---

## 17. Gaps & deferred decisions

| Gap | Priority | Notes |
|---|---|---|
| Panel / dropdown not designed | HIGH | Figma only defines the trigger (node `40006819:14583`). The switcher panel (org list, selection, active mark) needs a Figma pass before the full component ships. |
| ARIA pattern choice (Disclosure vs Combobox) | HIGH | Combobox required if org list supports search/filter. Decide before accessibility review. |
| Panel mobile behaviour (dropdown vs bottom sheet) | HIGH | No Figma reference yet. Needs design decision. |
| Single-org disabled state visual | MEDIUM | Current impl: trigger at 50% opacity, inert. Confirm this matches design intent. |
| Abbreviation collision handling | MEDIUM | Appendix A §4.5 / §5.6 defines resolution rules; product DB must support storing per-org override values. |
| Animation values | MEDIUM | Chevron: 150ms ease (placeholder). Verify against `docs/design-system-spec.md §Motion` once panel is designed. |
| `logoUrl` placeholder tint | LOW | Avatar placeholder uses `rgba(53,85,160,0.25)` — not a semantic token. Confirm correct token at spec review. |
| Panel header copy | LOW | "Switch organisation" copy not yet confirmed with content strategy. |

---

## 18. Storybook

Not yet in Storybook. Placeholder story file at `src/stories/Library/OrgSwitcher/OrgSwitcher.stories.jsx` — renders a shell with static demo data. Full stories (Playground, StateMatrix, AbbreviationShowcase, StandaloneDemo) to be generated by the pipeline once the Figma node is confirmed and the spec reaches `REVIEWED`.

---

---

# Appendix A: Abbreviation Guidelines

**Mobile UI Display Standard for Organization and Campus Names**
Version 1.1 · Based on AP Stylebook and supporting standards

---

## A.1 Purpose

This appendix defines the rules for abbreviating organisation and campus names in the platform's mobile org switcher. On desktop, the full church name and campus/sub-organisation identifier are displayed. On mobile, space constraints require both to be abbreviated to short initialisations. This guideline ensures those abbreviations are consistent, predictable, and defensible across all implementations.

These rules are grounded primarily in the **Associated Press Stylebook (AP)**, supplemented by the **Chicago Manual of Style (CMOS)** and **U.S. Postal Service (USPS)** conventions where AP is silent.

---

## A.2 Display Behaviour by Context

| Context | Format | Example |
|---|---|---|
| Desktop | `Full Church Name  \|  Campus Name` | Grace Community Church  \|  West |
| Mobile (with campus) | `ORG \| CA` | GCC \| WE |
| Mobile (no campus) | `ORG` | GCC |

The pipe separator and campus abbreviation are only shown when a campus or sub-org exists.

---

## A.3 Authority and Style References

In priority order:

1. **AP Stylebook** — primary authority for organisation name abbreviations and initialism formatting
2. **Chicago Manual of Style (CMOS)** — consulted for edge cases not covered by AP, particularly single-word names
3. **U.S. Postal Service (USPS)** — consulted for geographic and directional abbreviations
4. **Merriam-Webster's New World College Dictionary** — fallback per AP's own instruction for unlisted cases

> **AP Stylebook principle:** "Use all caps, but no periods, in longer abbreviations and acronyms when the individual letters are pronounced individually" (e.g., FBI, CIA, ABC). This governs the all-caps, no-periods format used throughout this system.

---

## A.4 Organization Name — Three-Initial Rule

All organisation names are abbreviated to **exactly three uppercase letters with no periods**.

Words that are **never initialled**: articles (the, a, an), prepositions (of, in, at, for), and conjunctions (and, or, but). Strip these first — they do not count as significant words and are invisible to all rules below.

### A.4.1 Three or more significant words

Take the first letter of each of the first three significant words.

| Full Name | Abbr. | Derivation |
|---|---|---|
| Grace Community Church | GCC | Grace + Community + Church |
| Nashville Christian Church | NCC | Nashville + Christian + Church |
| Crossroads Community Fellowship | CCF | Crossroads + Community + Fellowship |

### A.4.2 Two significant words

The first (most distinctive) word contributes **two characters**. The second word contributes **one character** — always its first letter. Which two characters the first word contributes depends on its nature:

#### A.4.2a — First word is a place name (city, town, neighbourhood)

Use the first two letters of the place name, following USPS geographic convention (the same method used in §A.5.2 for campus abbreviations).

| Full Name | Abbr. | Derivation |
|---|---|---|
| Knoxville Sanctuary | KNS | KN (Knoxville, USPS-style) + S (Sanctuary) |
| Franklin Fellowship | FRF | FR (Franklin) + F (Fellowship) |
| Memphis Church | MEC | ME (Memphis) + C (Church) |

#### A.4.2b — First word is a compound word (two fused words)

Use the first letter of each of the two fused words as the two characters.

| Full Name | Abbr. | Derivation |
|---|---|---|
| Northpoint Church | NPC | N (North) + P (Point) + C (Church) |
| Crossroads Church | CRC | C (Cross) + R (Roads) + C (Church) |
| Hillside Fellowship | HLF | H (Hill) + L (Side) + F (Fellowship) |
| Charlestown Church | CTC | C (Charles) + T (Town) + C (Church) |

#### A.4.2c — First word is a single, non-place, non-compound word

Use the first letter and the second letter of the word. Exception: if the word contains a more phonetically distinctive letter (X, Z, Q) after the first letter, use that letter instead of the natural second letter, as it better identifies the word.

| Full Name | Abbr. | Derivation |
|---|---|---|
| Elevation Church | ELC | E + L (natural second letter) + C (Church) |
| Triumph Church | TRC | T + R (natural second letter) + C (Church) |
| Axios Church | AXC | A + X (more distinctive than natural second letter I) + C (Church) |

### A.4.3 Two significant words after stripping articles and prepositions

Names like "Church of the Highlands" reduce to two significant words once non-significant words are removed. Apply §A.4.2 to the remaining two words normally.

| Full Name | Significant Words | Abbr. | Derivation |
|---|---|---|---|
| Church of the Highlands | Church + Highlands | CHH | §A.4.2c: C (Church) + H + H (first letter + second letter of Highlands) |
| City of Grace | City + Grace | CIG | §A.4.2c: C + I (City first + second letter) + G (Grace first letter) |

> **Note on Church of the Highlands:** Church contributes C (first letter). Highlands contributes H + H (first letter + second letter per §A.4.2c). Result: **CHH**.
> **Note on City of Grace:** City is word 1, Grace is word 2. City contributes C + I (§A.4.2c, first + second letter). Grace contributes G (first letter). Result: **CIG**.

### A.4.4 Single-word names

Take the **first three letters** of the word, uppercased. This follows the truncation convention in CMOS, which is the standard method for abbreviating single-word proper names in reference and tabular contexts.

| Full Name | Abbr. | Derivation |
|---|---|---|
| Elevation | ELE | First 3 letters |
| Crossroads | CRO | First 3 letters |
| Northpoint | NOR | First 3 letters |

### A.4.5 Duplicate abbreviations

If two organisations in the same user's context produce the same three-letter abbreviation:

1. Use the third letter of the most distinctive word instead of the second: NPC (Northpoint Church) vs. NPC (Northpark Chapel) → NPC vs. **NKC** (using K, the third letter of Northpark)
2. If still identical, apply §A.4.4 to the most distinctive word (first three letters of that word)
3. Document the override as an implementation note on the org record

---

## A.5 Campus and Sub-Organisation — Two-Initial Rule

Campus and sub-org identifiers are abbreviated to **exactly two uppercase letters with no periods**. The two-letter format follows the USPS two-letter state abbreviation convention, which AP defers to for geographic identifiers, adapted here for directional and place-name campus identifiers.

### A.5.1 Single directional word

Use the first two letters of the directional word, uppercased.

| Campus Name | Abbr. |
|---|---|
| West | WE |
| East | EA |
| North | NO |
| South | SO |
| Central | CE |
| Downtown | DT |

### A.5.2 Single place name (city, neighbourhood, or proper noun)

If the name matches a U.S. state, use the **official USPS two-letter state code** — this is both intuitive and standardised, and AP defers to USPS codes for all state-level geographic identifiers.

For all other place names, use the **first letter + first consonant after the first vowel**, uppercased.

| Campus Name | Abbr. | Derivation |
|---|---|---|
| Georgia | GA | USPS state code |
| Tennessee | TN | USPS state code |
| Knoxville | KN | K + N (first consonant cluster) |
| Franklin | FR | F + R |
| Brentwood | BR | B + R |
| Memphis | ME | M + E |
| Riverside | RI | R + I (first two letters; I is a vowel but R+I is unambiguous — see §A.5.5) |

### A.5.3 Place name + directional (Nashville North, East Memphis, etc.)

Take the **first letter of the place name** and the **first letter of the directional word**. The place name initial always comes first, regardless of word order in the full name.

| Campus Name | Abbr. | Derivation |
|---|---|---|
| Nashville North | NN | Nashville (N) + North (N) |
| Nashville South | NS | Nashville (N) + South (S) |
| East Memphis | ME | Memphis (M) + East (E) — place first |
| North Knoxville | KN | Knoxville (K) + North (N) — place first |
| West Franklin | FW | Franklin (F) + West (W) — place first |

### A.5.4 Two-word descriptive campus names

Take the first letter of each word.

| Campus Name | Abbr. |
|---|---|
| Main Campus | MC |
| Online Campus | OC |
| Lake Shore | LS |
| North Side | NS |

### A.5.5 Single-word campus (non-directional)

Use the **first two letters** of the word, uppercased.

| Campus Name | Abbr. |
|---|---|
| Uptown | UP |
| Midtown | MI |
| Lakewood | LA |

### A.5.6 Duplicate campus abbreviations within the same org

If two campuses under the same org produce the same two-letter abbreviation:

1. Use the first two distinct letters of the differentiating word: NO (North) vs. NE (Northeast)
2. If still ambiguous, use the first letter of the place and the second letter of the directional — document as an override

---

## A.6 Formatting Rules

These apply to all abbreviations in the org switcher regardless of derivation method.

- **All uppercase** — no lowercase letters
- **No periods** — per AP Stylebook: initials pronounced individually take all caps and no periods
- **No punctuation between letters** — GCC not G.C.C.
- **Pipe separator** with a single space on each side: `GCC | WE`
- **No pipe** when no campus or sub-org exists: `GCC`

---

## A.7 Quick-Reference Decision Trees

### A.7.1 Organisation name → 3 letters

```
Strip all articles (the, a, an) and prepositions (of, in, at, for) and conjunctions (and, or, but) first.
How many significant words remain?
├── 3 or more → First letter of each of the first 3 significant words (§A.4.1)
├── 2 words   → Word 1 contributes 2 characters + Word 2 contributes its first letter (§A.4.2)
│              ├── Word 1 is a place name?    → first 2 letters of place (USPS-style) (§A.4.2a)
│              ├── Word 1 is a compound word? → first letter of each fused word (§A.4.2b)
│              └── Word 1 is a plain word?    → first letter + second letter (or more distinctive letter if X/Z/Q present) (§A.4.2c)
└── 1 word    → First 3 letters of the word (§A.4.4)
Duplicate in same user context? → §A.4.5
```

### A.7.2 Campus / sub-org name → 2 letters

```
Is it a U.S. state name?           →  USPS two-letter code
Is it a single directional word?   →  First 2 letters of that word (see table §A.5.1 for Downtown exception)
Is it a single place name?         →  First letter + first consonant after first vowel
Is it place + directional?         →  Place initial + directional initial (place always first)
Is it two descriptive words?       →  First letter of each word
Is it a single non-directional?    →  First 2 letters
Duplicate within same org?         →  §A.5.6
```

---

## A.8 Complete Examples

| Desktop Display | Campus | Mobile | Rule |
|---|---|---|---|
| Grace Community Church  \|  West | West | GCC \| WE | §A.4.1, §A.5.1 |
| Grace Community Church  \|  East | East | GCC \| EA | §A.4.1, §A.5.1 |
| Grace Community Church  \|  Georgia | Georgia | GCC \| GA | §A.4.1, §A.5.2 + USPS |
| Nashville Christian Church  \|  Nashville North | Nashville North | NCC \| NN | §A.4.1, §A.5.3 |
| Nashville Christian Church  \|  Nashville South | Nashville South | NCC \| NS | §A.4.1, §A.5.3 |
| Northpoint Church | (none) | NPC | §A.4.2b |
| Northpoint Church  \|  Knoxville | Knoxville | NPC \| KN | §A.4.2b, §A.5.2 |
| Knoxville Sanctuary  \|  East | East | KNS \| EA | §A.4.2a, §A.5.1 |
| Crossroads Church  \|  Downtown | Downtown | CRC \| DT | §A.4.2b, §A.5.1 |
| Elevation  \|  Main Campus | Main Campus | ELE \| MC | §A.4.4, §A.5.4 |
| Church of the Highlands  \|  North | North | CHH \| NO | §A.4.3, §A.5.1 |
| Axios Church  \|  West | West | AXC \| WE | §A.4.2c, §A.5.1 |

---

## A.9 Scope and Limitations

The AP Stylebook and other referenced guides do not provide explicit rules for fixed-length UI initialisations. Sections A.4.2, A.4.3, A.5.2, and A.5.3 are principled extensions of AP and CMOS conventions applied consistently to fill those gaps. Treat this appendix as the authoritative internal standard, with AP as the grounding authority for the underlying principles.

This appendix does **not** govern:

- Desktop views (full names always displayed)
- Notification copy, email templates, or printed materials (use full names per AP)
- Organisation legal name records in the database (always store the full legal name)

---

## A.10 Document Control

| Version | Date | Notes |
|---|---|---|
| 1.0 | May 2026 | Initial release |
| 1.1 | May 2026 | §A.4 rewritten — two-word org rules expanded into §A.4.2a/b/c (place name / compound word / plain word); "but" added to skip-word list; §A.4.5 duplicate example corrected; §A.8 examples updated (KNS, AXC) |

**Primary authority:** AP Stylebook (current edition)
**Secondary:** Chicago Manual of Style (18th ed.), USPS Publication 28
