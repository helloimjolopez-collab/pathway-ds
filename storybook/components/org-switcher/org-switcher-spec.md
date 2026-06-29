# OrgSwitcher: Pathway Design System Component Spec

**Status:** `REVIEWED`
**Version:** `v1` (trigger only — see §0)
**Reviewed:** 2026-05-21
**Previously reviewed:** 2026-05-18 (v1 first pass — required deepening to reach sidenav-spec parity per CLAUDE.md §5)

## TL;DR — what this component is, in one paragraph

The OrgSwitcher is the contextual navigation control that lives inside the `TopNav` component (see `components/top-nav/`) of every signed-in, multi-org Ministry Brands product. It always shows the user's active organisation. Clicking it is meant to open a panel that lets the user switch between orgs they have access to. **This spec covers v1, which is the trigger button only.** The dropdown menu / panel that opens below the trigger is **out of scope for v1 and remains as it is today in production until further notice** — a future version will give it its own design pass, spec, and release. The trigger is, however, fully spec'd here: pixel-accurate against Figma, with a clean Catholic-vs-Protestant rule, full state matrix, dark-mode tokens, mobile compact mode, and the church SVG placeholder for orgs that have no logo on file.

## Resources

Every artefact you might need is linked here. If something isn't in this table or the §1.1 governance table, it hasn't been specified.

| Resource | Link | Notes |
|---|---|---|
| 🖼️ **Live HTML demo** | [helloimjolopez-collab.github.io/pathway-ds/components/org-switcher/org-switcher.html](https://helloimjolopez-collab.github.io/pathway-ds/components/org-switcher/org-switcher.html) | Self-contained React+Babel CDN page with all desktop and mobile trigger states. |
| 📘 **Storybook docs** | [`Library/OrgSwitcher`](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-orgswitcher--docs) | Playground + Controls, all stories, token tables. |
| 🎨 **Figma source** | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) | Node `40006819:14583`. The 8 variant nodes are listed in `org-switcher.jsx`. |
| 💻 **React module** | [`components/org-switcher/org-switcher.jsx`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher.jsx) | The trigger component. Source of truth for implementation. |
| 🌐 **Standalone HTML source** | [`components/org-switcher/org-switcher.html`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher.html) | The page that powers the live HTML demo. |
| 🎨 **Design tokens (DTCG JSON)** | [`tokens/pathway-design-tokens.json`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/tokens/pathway-design-tokens.json) | Generated from Figma export. Source for every token referenced in §3. |
| 🎨 **Design tokens (CSS variables)** | [`src/tokens/tokens.css`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/src/tokens/tokens.css) | Style-Dictionary output. Consume these CSS vars in component code. |
| 📦 **npm package** | [`@helloimjolopez-pathway/pathway-tokens`](https://www.npmjs.com/package/@helloimjolopez-pathway/pathway-tokens) | The tokens shipped to consumer apps. `npm install` → import the CSS and JS bundles. |
| 📄 **Design-system spec** | [`docs/design-system-spec.md`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/docs/design-system-spec.md) | System-wide rules for motion, accessibility, breakpoints, typography. Every component spec inherits from this. |
| 📄 **Component manifest** | [`components/manifest.json`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/manifest.json) | Machine-readable registry of every Pathway component. The OrgSwitcher row mirrors this spec's metadata. |
| 📄 **Sidenav reference spec** | [`components/sidenav/sidenav-spec.md`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav-spec.md) | Canonical spec structure that this document mirrors (per CLAUDE.md §5). |

---

## 0. Scope of this version (v1)

**This release covers the trigger control in the top nav only.**

The dropdown menu / panel that opens beneath the trigger is **out of scope for v1 and remains as it is today in production until further notice.** A future version (v2 or later) will design, spec, and release the panel separately. Until then, treat any panel code in this repo as non-normative scaffolding — it exists so the trigger has something to open against in demos and dev tooling, but it is not part of the design system.

| Sub-component | Scope in v1 | Notes |
|---|---|---|
| **Trigger button** (Base / Hover / Pressed / Open × Desktop / Mobile — 8 variants total) | ✅ IN SCOPE | Visual + interaction spec is normative. Pixel-accurate against Figma. |
| **Avatar** (logo image / church placeholder) | ✅ IN SCOPE | Logo: `object-fit: cover` proportional fill. Placeholder: church SVG. |
| **Container.CityName.Catholic** | ✅ IN SCOPE | Catholic orgs only (see §0.1). |
| **Chevron rotation** (open ↔ closed) | ✅ IN SCOPE | `--motion-duration-4` + `--motion-easing-standard`. |
| **Dropdown menu / panel** (open state) | ⚠️ **OUT OF SCOPE** in v1. **Remains as it is in production until further notice.** | A working placeholder lives in the repo so the trigger has something to open against, but it is **non-normative** and **will be replaced** when the panel gets its own design pass. Do not treat any of its visuals or interactions as authoritative. |

### 0.1 CityName is Catholic-only — never Protestant

`Container.CityName.Catholic` (the second text container after the org name, separated by ` | `) is **only ever shown for Catholic organisations**.

- It carries the **city or diocese** name — never a campus, suborg, region, or other identifier.
- Protestant organisations render the trigger with `orgName` only. No pipe. No second container. The Catholic city container is not rendered at all (not just hidden) for Protestant orgs.
- The component reads `orgType` and renders `Container.CityName.Catholic` **only when** `orgType === "catholic"`. Even if a `cityName` string is supplied, it is ignored for non-Catholic orgs.

> **⚠ Figma annotation (node `40007477:12205`):** *"Container.CityName.Catholic is only implemented and/or shown for Catholic orgs. CityName does not apply to Protestant orgs. CityName is NOT a suborg name."*

---

## 1. Component Overview

`OrgSwitcher` is a contextual navigation control that shows the user's current organisation and lets them switch to another. It renders inside the `TopNav` component and is visible at all times while signed in to a multi-org context. The OrgSwitcher does not own or define the TopNav surface — see `components/top-nav/top-nav-spec.md` for the TopNav's own surface tokens.

It is **not** used for module-level navigation (that is SideNav's job), for settings access, or for user-profile actions. It is not a generic dropdown or select control — it is specifically scoped to org-and-city/diocese switching.

The trigger has two display modes driven by viewport:

- **Desktop** (`≥ 768 px`): renders the full organisation name in `Container.OrgName` (max-width 180px, content-sized, truncates with ellipsis at 180px). For **Catholic organisations only**, a second `Container.CityName.Catholic` (max 72px) follows after a pipe: `Sacred Heart Church-ITD  |  Knoxville`. Protestant orgs render the org name on its own.
- **Mobile** (`< 768 px`): renders inside a fixed 108px-wide pill. The label container is a fixed 50px and the full `orgName` is truncated by `text-overflow: ellipsis`. **No abbreviation** — "Grace Community Church" displays visually as "Grace Comm…". Typography is the same `Label/Button/S` (14px) used on desktop.

### Figma source

- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **OrgSwitcher component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583)

### Figma variant nodes (read by `/pathway:component-pipeline`)

| State | Type | Node ID |
|---|---|---|
| Base | Desktop | `40006819:14581` |
| Hover | Desktop | `40006819:14582` |
| Pressed | Desktop | `40006933:15754` |
| Open | Desktop | `40007336:9453` |
| Base | Mobile | `40006820:14757` |
| Hover | Mobile | `40006820:14772` |
| Pressed | Mobile | `40006933:15766` |
| Open | Mobile | `40007336:17470` |

---

## 1.1 Governance: where things live

Use this table to find the owner of any decision. Every row points to the single location that owns it.

| To change… | Owner | Where |
|---|---|---|
| Trigger colours, typography, spacing tokens | Figma: OrgSwitcher component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) |
| Primitive or semantic token values | Figma: Variables panel + `tokens/figma-export/pathwaytokens.json` | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) |
| Org logo image source / placeholder rules | Figma: `Container.Avatar` (node `40006817:14389`) + this spec §5 | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) |
| Church placeholder SVG (no-logo state) | Figma node `40007243:73426` + `components/org-switcher/org-switcher.jsx` (`CHURCH_ICON_PATH`) | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007243-73405) |
| Catholic-only CityName rule | This spec | §0.1 |
| Desktop label format + truncation rules | This spec | §5.1 |
| Mobile label truncation (no abbreviation) | This spec | §5.2 |
| Chevron rotation animation | This spec | §9 |
| Trigger interaction (click, keyboard) | This spec | §10 |
| Accessibility (ARIA, focus, reduced motion) | This spec | §11 |
| Touch target size, contrast ratios, SR announcements | This spec | §11.1, §11.6, §11.5 |
| Responsive breakpoint | This spec | §12 + `docs/design-system-spec.md` §Breakpoints |
| Dropdown menu / panel design | **DEFERRED to next version** | §0 — out of scope in v1, remains as in production until further notice |
| Live HTML demo | This spec § 15 + [`org-switcher.html`](https://helloimjolopez-collab.github.io/pathway-ds/components/org-switcher/org-switcher.html) | §15 |
| Storybook stories + docs page | This spec § 19 + `src/stories/Library/OrgSwitcher/` | §19 |
| Manifest entry | `components/manifest.json` | row keyed by `"org-switcher"` |
| TopNav surface colour / chrome | `TopNav` component spec | `components/top-nav/top-nav-spec.md` — OrgSwitcher does NOT own or define the TopNav background |
| Known design gaps | This spec | §16 (Figma-side) + §17 (deferred decisions) |

**Rule:** if a decision isn't in the table above, check §16 / §17 (gaps). If it's not there either, it hasn't been specified yet — add it to the spec before implementing.

---

## 2. Component Anatomy

```
OrgSwitcher.Root                       desktop: content-sized · mobile: w-108 fixed
                                       min-w/h 48 (touch target) · p-4 desktop · px-2 py-4 mobile
└── Container.Main                      h-36 · p-4 · rounded-8 · 1px border
    │                                    desktop: gap-2 between RowStart and RowEnd
    │                                    mobile: NO gap
    ├── Container.RowStart              flex items-center gap-4
    │   │                                desktop: h-24 · content-sized
    │   │                                mobile: h-20 · max-w-74
    │   ├── Container.Avatar            p-2 · 24×24 desktop · 20×20 mobile
    │   │   └── Avatar                  rounded-4 · 1px border
    │   │       ├─ [logo present]       <img object-fit: cover>
    │   │       └─ [no logo]            church SVG · bg fill.action.secondary.base
    │   ├── Container.OrgLabel          DESKTOP ONLY · max-w-248
    │   │   ├── Container.OrgName       max-w-180 · content-sized · truncates with ellipsis
    │   │   └── Container.CityName.Catholic   CATHOLIC ONLY · max-w-72 · "| {cityName}"
    │   └── Container.Label             MOBILE ONLY · w-50 fixed · truncated org name
    └── Container.RowEnd                p-2
        └── Container.IconTrailing      16×16 · p-2 · expand_more icon
                                         rotates 180° when open
```

### 2.1 Container.Avatar — sub-component anatomy

- **Frame:** 24×24px (desktop) / 20×20px (mobile) outer, with 2px inner padding (`padding-xxxtight`)
- **Inner avatar:** content area = outer − 2×padding = 20×20 (desktop) / 16×16 (mobile)
- **Border:** 1px solid, uses `stroke.action.tertiary.*` per state (same token family as the outer trigger button)
- **Corner radius:** 4px (`cornerradius-small`)
- **Two render modes:**
  - **Logo present** (`logoUrl` truthy): `<img>` with `object-fit: cover` filling 100% × 100%. Background transparent.
  - **No logo** (`logoUrl` empty/missing): church SVG icon (see §2.2) on `fill.action.secondary.base` background (`rgba(255,255,255,0.08)`)

### 2.2 Church placeholder SVG — sub-component anatomy

- **Source:** Figma node `40007243:73426`. Path data lives in `org-switcher.jsx` as `CHURCH_ICON_PATH`.
- **viewBox:** `0 0 13.3333 14`
- **Inset within inner avatar:** `top: 4.17%, right: 8.33%, bottom: 8.33%, left: 8.33%`
- **Fill:** `white` with `fill-opacity: 0.7`
- **Never replaced with text initials.** This is a hard constraint (§16 #2).

### 2.3 Container.IconTrailing (Chevron) — sub-component anatomy

- **Frame:** 16×16, 2px inner padding → 12×12 effective icon area
- **Icon:** Material Symbols Rounded `expand_more`
- **Colour:** `icon.action.mono.*` per state
- **Rotation:** 0° closed, 180° open (`transform --motion-duration-4 --motion-easing-standard`)

---

## 3. Design Tokens

All tokens confirmed from Figma node `40006819:14583`. This component uses **dark-mode tokens** — it is designed for the dark/brand-coloured nav surface.

### 3.1 Fill

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `fill.action.tertiary.base` | `--semantic-color-dark-mode-fill-action-tertiary-base` | `rgba(160,181,230,0.04)` | Trigger background — base |
| `fill.action.primaryinverse.hover` | `--semantic-color-dark-mode-fill-action-primaryinverse-hover` | `rgba(10,18,35,0.16)` | Trigger background — hover |
| `fill.action.primaryinverse.pressed` | `--semantic-color-dark-mode-fill-action-primaryinverse-pressed` | `rgba(255,255,255,0.08)` | Trigger background — pressed / open |
| `fill.action.secondary.base` | `--semantic-color-dark-mode-fill-action-secondary-base` | `rgba(255,255,255,0.08)` | Avatar placeholder background (no logo) |

### 3.2 Stroke

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `stroke.action.tertiary.base` | `--semantic-color-dark-mode-stroke-action-tertiary-base` | `rgba(160,181,230,0.16)` | Trigger + avatar border — base |
| `stroke.action.tertiary.hover` | `--semantic-color-dark-mode-stroke-action-tertiary-hover` | `rgba(160,181,230,0.20)` | Trigger + avatar border — hover |
| `stroke.action.tertiary.pressed` | `--semantic-color-dark-mode-stroke-action-tertiary-pressed` | `rgba(160,181,230,0.30)` | Trigger + avatar border — pressed / open |

### 3.3 Text

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `text.action.mono.base` | `--semantic-color-dark-mode-text-action-mono-base` | `#fbfbfb` | Label text — base |
| `text.action.mono.hover` | `--semantic-color-dark-mode-text-action-mono-hover` | `#ffffff` | Label text — hover |
| `text.action.mono.pressed` | `--semantic-color-dark-mode-text-action-mono-pressed` | `#ffffff` | Label text — pressed / open |

### 3.4 Icon

| Semantic Token | CSS Variable | Resolved Value | Usage |
|---|---|---|---|
| `icon.action.mono.base` | `--semantic-color-dark-mode-icon-action-mono-base` | `#fbfbfb` | Chevron — base |
| `icon.action.mono.hover` | `--semantic-color-dark-mode-icon-action-mono-hover` | `#ffffff` | Chevron — hover |
| `icon.action.mono.pressed` | `--semantic-color-dark-mode-icon-action-mono-pressed` | `#ffffff` | Chevron — pressed / open |

### 3.5 Geometry

| Property | Value | CSS Variable |
|---|---|---|
| Trigger corner radius | 8px | `--semantic-layout-units-cornerradius-medium` |
| Avatar corner radius | 4px | `--semantic-layout-units-cornerradius-small` |
| Border width | 1px | `--semantic-layout-units-borderwidth-base` |
| Avatar inner padding (xxxtight) | 2px | `--semantic-layout-units-padding-xxxtight` |
| Trigger inner padding (xxtight) | 4px | `--semantic-layout-units-padding-xxtight` |
| Row gap (xxtight) | 4px | `--semantic-layout-units-gap-xxtight` |

### 3.6 Typography

| Usage | CSS Variable prefix | Weight | Size | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Trigger label (desktop + mobile, v1) | `--semantic-type-desktop-label-button-s-` | 500 | 14px | 20px | 0.3px |
| Font family | `--semantic-type-desktop-label-button-s-fontfamily` | — | Red Hat Text | — | — |

> v1 uses the same `Label/Button/S` size on desktop and mobile. Earlier drafts used `Label/Button/XS` (12px) on mobile — Figma was updated to a uniform 14px in 2026-05.

---

## 4. Layout & Spacing

All values confirmed from Figma (Base × Desktop = `40006819:14581` and Base × Mobile = `40006820:14757`).

| Value | Desktop | Mobile | Source |
|---|---|---|---|
| Root frame | content-sized | **108px fixed** | Figma node `40006819:14581` / `40006820:14757` |
| Root min-height / min-width (touch target) | 48px | 48px | `Accessibility/Touch Target/Optimal/Size` |
| Root padding | 4px all sides | `px:2 py:4` asymmetric | `padding-xxtight` / `padding-xxxtight` |
| `Container.Main` max-width | 308px | 102px | Figma 40006817:14391 / 40006820:14758 |
| `Container.Main` min-height | 36px | 36px | raw |
| `Container.Main` padding | 4px | 4px | `padding-xxtight` |
| `Container.Main` gap (between RowStart and RowEnd) | 2px | **none** | `gap-xxxtight` (desktop only) |
| `Container.RowStart` sizing | content-sized | max-w 74 content-sized | Figma 40006820:14759 |
| `Container.RowStart` height | 24px | 20px | raw |
| `Container.RowStart` gap | 4px | 4px | `gap-xxtight` |
| `Container.Avatar` outer | 24×24px | 20×20px | raw |
| `Container.Avatar` padding | 2px | 2px | `padding-xxxtight` |
| `Container.OrgLabel` max-width | 248px | (n/a) | annotation: "Text truncates if going beyond 248pt" |
| `Container.OrgName` max-width | 180px | (n/a) | annotation: "Text Truncates if frame going beyond 170pt" |
| `Container.CityName.Catholic` max-width | 72px (+6px paddingLeft for pipe spacing) | (n/a) | Catholic orgs only |
| `Container.Label` (mobile) | (n/a) | 50px fixed | Figma 40007067:13273 |
| `Container.RowEnd` padding | 2px | 2px | `padding-xxxtight` |
| `Container.IconTrailing` size + padding | 16×16, p-2 | 16×16, p-2 | raw |
| Chevron icon size | 12×12 (16 container − 2×2 padding) | 12×12 | raw |

---

## 5. Item Variants

### 5.1 Desktop trigger

- Renders the full legal org name in `Container.OrgName`. Container is content-sized with `max-width: 180px`. Long names truncate with `text-overflow: ellipsis` at 180px.
- For Catholic organisations (`orgType === "catholic"`), appends `Container.CityName.Catholic` (max-width 72px, with 6px `paddingLeft` so the pipe has visual breathing room) after a ` | ` separator with the city or diocese name.
- Protestant organisations render no pipe and no second container — the org name alone.
- Chevron trails the text on the right; rotates 180° when the panel is open.

### 5.2 Mobile trigger

- Fixed 108px-wide pill (`Container.Main` max-width 102px inside the 108px outer wrapper).
- Renders the **full `orgName`** truncated by CSS `text-overflow: ellipsis` at `Container.Label` fixed width 50px.
- **No abbreviation.** "Grace Community Church" displays as "Grace Comm…". This is a visual truncation, not an initialism.
- The CityName container is not rendered on mobile, even for Catholic orgs.
- Chevron trails the label on the right.

### 5.3 Avatar — logo present

When `logoUrl` is provided, the avatar renders the org's logo image with `object-fit: cover` inside the bordered rounded container. The image always scales to fill the frame proportionally — no hardcoded crop offsets.

> **Figma annotation:** "Logo must always scale to fill frame proportionally."

### 5.4 Avatar — no logo (church placeholder)

When `logoUrl` is absent (or fails to load), the avatar renders the **church/building SVG icon** on a `fill.action.secondary.base` (`rgba(255,255,255,0.08)`) background.

- Figma node: `40007243:73405` (full placeholder state), inner icon `40007243:73426`
- Icon inset: `4.17% 8.33% 8.33% 8.33%` within the inner avatar frame
- `fill="white"` with `fillOpacity="0.7"`
- **Never use text initials as the placeholder.** Figma explicitly specifies this icon.

---

## 6. State Matrix

All confirmed from Figma. Six trigger variants: `State × Type = {Base, Hover, Pressed, Open} × {Desktop, Mobile}`.

| State | Fill | Stroke | Text | Chevron |
|---|---|---|---|---|
| **Base** | `fill.action.tertiary.base` · `rgba(160,181,230,0.04)` | `stroke.action.tertiary.base` · `rgba(160,181,230,0.16)` | `text.action.mono.base` · `#fbfbfb` | `icon.action.mono.base` · `#fbfbfb` |
| **Hover** | `fill.action.primaryinverse.hover` · `rgba(10,18,35,0.16)` | `stroke.action.tertiary.hover` · `rgba(160,181,230,0.20)` | `text.action.mono.hover` · `#ffffff` | `icon.action.mono.hover` · `#ffffff` |
| **Pressed / Open** | `fill.action.primaryinverse.pressed` · `rgba(255,255,255,0.08)` | `stroke.action.tertiary.pressed` · `rgba(160,181,230,0.30)` | `text.action.mono.pressed` · `#ffffff` | `icon.action.mono.pressed` · `#ffffff` |
| **Disabled** | Base fill at 50% opacity | Base stroke at 50% opacity | Base text at 50% opacity | Base icon at 50% opacity |
| **Open** (additional) | Pressed styling | Pressed styling | Pressed styling | Rotated 180° |

The avatar border uses the same stroke token as the outer button border per state.

### State logic rules

1. The trigger shows **Open** state as long as the panel is mounted and visible.
2. **Disabled** applies when the user belongs to exactly one organisation; the trigger renders inert but does not open a panel.
3. Chevron rotates 180° on open; rotation animates per §9.
4. State transitions on fill / border are `--motion-duration-2` + `--motion-easing-standard` (instant under `prefers-reduced-motion`).

---

## 7. Sub-components

See §2.1, §2.2, §2.3 for full anatomy. Brief summary:

| Sub-component | Role |
|---|---|
| Container.Avatar | 24×24 (desktop) / 20×20 (mobile) frame holding the logo image or church placeholder |
| Church placeholder SVG | Fallback for orgs with no `logoUrl` on file (path lives in `org-switcher.jsx`) |
| Container.IconTrailing (Chevron) | `expand_more` Material Symbol Rounded, 12×12 effective, rotates 180° on open |

---

## 8. Iconography

- **Chevron:** Material Symbols Rounded `expand_more`. 12×12 effective. Colour: `icon.action.mono.*` per state.
- **Avatar (logo):** product-supplied image — sourced from the org record. `object-fit: cover`.
- **Avatar (no logo):** church/building SVG embedded in `org-switcher.jsx` as `CHURCH_ICON_PATH`. Never replace with text initials.

---

## 9. Motion

All motion resolves through `--motion-*` tokens — no hardcoded ms/curves.

| Property | Token | Notes |
|---|---|---|
| Chevron rotation | `transform --motion-duration-4 --motion-easing-standard` | The system chevron rule (300 ms standard, design-system-spec §2.2) |
| State transition (fill + border) | `--motion-duration-2` + `--motion-easing-standard` | Snappy enough for hover, no perceptible lag |
| Reduced motion | All transforms and transitions removed | Honour `prefers-reduced-motion: reduce` at the shell level |

See `docs/design-system-spec.md` §Motion for the system-wide motion ladder.

---

## 10. Interaction

- **Click / tap trigger** → toggles panel open/closed (panel out of scope in v1, but the trigger state still flips).
- **Enter / Space** on trigger → same as click.
- **Escape** while panel is open → closes panel, returns focus to trigger (wired in the shell).
- **Click outside panel** → closes panel (non-modal).
- **Single-org users** → trigger is rendered disabled; no panel mounts.

---

## 11. Accessibility

> **Legend:**
> ✅ Implemented in the reference module (`org-switcher.jsx`)
> 📋 Required for production
> ❓ Unconfirmed / awaiting design

---

### 11.0 ARIA Pattern

The OrgSwitcher uses the [Disclosure (Show/Hide) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) with `aria-haspopup="true"` and `aria-expanded` on the trigger button. The trigger is a real `<button type="button">` — never a `<div>` with `role="button"`.

The panel (when designed in v2) will follow either the Disclosure or the Combobox pattern depending on whether it supports text filtering. That decision is deferred to the panel spec.

---

### 11.1 Touch & Pointer Targets

| Token | Value | Source |
|---|---|---|
| `Accessibility/Touch Target/Optimal/Size` | `48px` | Figma ✅ |
| `Accessibility/Icon Wrapping/Large/Size` | `24×24px` (desktop avatar) | Figma ✅ |
| `Accessibility/Icon Wrapping/Small/Size` | `20×20px` (mobile avatar) | Figma ✅ |

Both viewport modes wrap the trigger in a 48×48 minimum outer wrapper — desktop adds it as `min-width / min-height`; mobile satisfies it via the 108×48 pill. Either way, WCAG 2.5.5 Target Size (`Level AAA`, but also our org-wide minimum) is met.

---

### 11.2 ARIA Markup

```html
<!-- Desktop, Catholic org -->
<button
  type="button"
  aria-haspopup="true"
  aria-expanded="false"
  aria-label="Current organisation: Sacred Heart Church-ITD, Knoxville. Activate to switch."
>
  <span aria-hidden="true">[avatar]</span>
  <span aria-hidden="true">Sacred Heart Church-ITD</span>
  <span aria-hidden="true">| Knoxville</span>
  <span aria-hidden="true">[chevron]</span>
</button>

<!-- Desktop, Protestant org -->
<button
  type="button"
  aria-haspopup="true"
  aria-expanded="false"
  aria-label="Current organisation: Grace Community Church. Activate to switch."
>
  <span aria-hidden="true">[avatar]</span>
  <span aria-hidden="true">Grace Community Church</span>
  <span aria-hidden="true">[chevron]</span>
</button>

<!-- Disabled (single-org user) -->
<button
  type="button"
  disabled
  aria-haspopup="true"
  aria-expanded="false"
  aria-label="Current organisation: Grace Community Church. Only organisation available."
>
  …
</button>
```

**Key rules:**
- `aria-label` always carries the full org name (and city name for Catholic orgs), regardless of visible truncation.
- The visible label is `aria-hidden="true"` — screen readers rely on the `aria-label`, not the truncated text.
- `aria-expanded` reflects panel open/closed state.
- `aria-haspopup="true"` (not `"menu"` or `"listbox"`) — the panel pattern is not yet specced, and `true` is the safe generic value.
- `disabled` (the native attribute) implicitly sets `aria-disabled`. Do not add `aria-disabled` separately.

---

### 11.3 Keyboard Interaction

| Key | Behaviour | Status |
|---|---|---|
| `Tab` | Moves focus into / out of the trigger button as normal | ✅ Native `<button>` behaviour |
| `Enter` | Toggles the panel open/closed | ✅ Native `<button>` behaviour |
| `Space` | Toggles the panel open/closed | ✅ Native `<button>` behaviour |
| `Escape` | When the panel is open, closes the panel and returns focus to the trigger | 📋 Wired in the shell that mounts the panel |
| Arrow keys within panel | Defined by panel spec (deferred) | ❓ v2 |

There is no roving tabindex — the trigger is a single Tab stop. Once the panel ships in v2, it will have its own focus management spec.

---

### 11.4 Focus Styles

| Requirement | Status |
|---|---|
| Visible focus ring on the trigger | ✅ `2px solid rgba(255,255,255,0.9)` on `:focus-visible` |
| Focus ring uses `:focus-visible` (not `:focus`) to avoid painting on mouse click | ✅ Implemented in `org-switcher.jsx` via `onFocus` handler |
| Focus ring contrast against TopNav surface | ✅ White outline on the TopNav background (`#2d4889`, owned by TopNav) ≈ 8.8:1 — passes WCAG 1.4.11 (3:1) |
| Focus visible in pressed / open states | ✅ Outline overlays the pressed-state fill |

> Figma does **not** ship a focused-state variant of the trigger. Focus styling is documented and implemented in this spec / `org-switcher.jsx`, but a Figma variant for the focused state would close the loop. See §16.

---

### 11.5 Screen Reader Announcements

| Concern | Recommendation | Status |
|---|---|---|
| Trigger label | `aria-label="Current organisation: {orgName}[, {cityName}]. Activate to switch."` | ✅ Implemented |
| Panel state | `aria-expanded="true/false"` reflects current state, announced on toggle | ✅ Implemented |
| Catholic city | Included in `aria-label` as a comma-separated clause | ✅ Implemented |
| Truncated visible text | Visible label is `aria-hidden="true"`; SR reads the `aria-label` only | ✅ Implemented |
| Disabled state | Native `disabled` makes the button unfocusable and announces "dimmed/unavailable" | ✅ Implemented; `aria-label` clarifies why (single org) |
| Org switch confirmation | Once the panel ships, announce the new active org via a polite live region in the shell | 📋 v2 / shell |

#### Expected screen reader output (VoiceOver / NVDA)

These are approximate strings. Exact wording varies by screen reader and browser.

| Scenario | Expected announcement |
|---|---|
| Tab to trigger, Protestant org | *"Current organisation: Grace Community Church. Activate to switch. Pop-up button, collapsed."* |
| Tab to trigger, Catholic org | *"Current organisation: Sacred Heart Church-ITD, Knoxville. Activate to switch. Pop-up button, collapsed."* |
| Trigger opened (panel mounted) | *"Pop-up button, expanded."* |
| Tab to disabled trigger | *"Current organisation: Grace Community Church. Only organisation available. Pop-up button, dimmed."* |
| Focus on truncated mobile label | (Same as above — the visible "Grace Comm…" is `aria-hidden`; SR reads the full `aria-label`.) |

---

### 11.6 Colour Contrast

All values below use token resolved values on the `TopNav` surface (which resolves to `#2d4889`; that colour is owned and defined by the TopNav component, not by OrgSwitcher). Verify in production with a tool (e.g. Colour Contrast Analyser).

| Surface | Foreground token → hex | Background | Approx. ratio | WCAG AA (4.5:1 text / 3:1 non-text) |
|---|---|---|---|---|
| Trigger label, base | `text.action.mono.base` → `#fbfbfb` | TopNav surface (`#2d4889`) under `rgba(160,181,230,0.04)` fill ≈ `#2d4889` | ≈ 10.4:1 | ✅ Pass |
| Trigger label, hover | `text.action.mono.hover` → `#ffffff` | `#2d4889` under `rgba(10,18,35,0.16)` fill ≈ `#26396f` | ≈ 9.2:1 | ✅ Pass |
| Trigger label, pressed / open | `text.action.mono.pressed` → `#ffffff` | `#2d4889` under `rgba(255,255,255,0.08)` ≈ `#3a548d` | ≈ 9.7:1 | ✅ Pass |
| Chevron, base | `icon.action.mono.base` → `#fbfbfb` | (as label, base) | ≈ 10.4:1 | ✅ Pass (non-text 3:1 minimum) |
| Trigger border, base | `stroke.action.tertiary.base` → `rgba(160,181,230,0.16)` | `#2d4889` | ≈ 1.4:1 | ❌ Border alone fails 3:1 — relies on fill differentiation; acceptable per WCAG 1.4.11 because the button has a visible fill+text |
| Focus outline | `rgba(255,255,255,0.9)` ≈ `#e6e6e6` | `#2d4889` | ≈ 8.8:1 | ✅ Pass (WCAG 2.4.11 minimum 3:1) |

> ⚠ The trigger border alone is below the 3:1 non-text contrast threshold, but WCAG 1.4.11 only requires 3:1 for UI components that are "essential to understanding". The trigger is essential, but its fill + label + chevron provide sufficient identification at every state. The thin border is decorative.

---

### 11.7 Reduced motion

When `prefers-reduced-motion: reduce` is set at the shell level, chevron rotation and state transitions render instantly. The reduced-motion behaviour is honoured by the shell's global CSS in `docs/design-system-spec.md` §Motion, not by the component itself — the component just declares the transitions.

---

### 11.8 Figma Accessibility Gaps

The ARIA pattern, keyboard tables, screen reader strings, and contrast ratios all live in this spec (single source of truth). Figma does not need to duplicate them. The items below are genuine Figma gaps — design work that must happen in Figma before production.

| Gap | Priority | Action needed in Figma |
|---|---|---|
| No "focused" state variant in the OrgSwitcher component | HIGH | Add a Focus state variant matching the existing Pressed visual tier, plus a 2px white outline. Variant axis: `State: Base | Hover | Pressed | Open | Focus | Disabled`. |
| No link to this spec in Dev Mode | HIGH | In Figma Dev Mode → Resources panel, add the spec URL. Takes 30 seconds. |
| Disabled state not surfaced as a variant | MEDIUM | Currently the disabled visual (50% opacity over Base) is documented here but not a Figma variant. Add it to the component so designers can see it in context. |

---

## 12. Responsiveness

### 12.1 Breakpoint

| Viewport | Trigger label | Container.Main max-width | Notes |
|---|---|---|---|
| `≥ 768 px` (desktop) | Full org name (+ city name for Catholic orgs) | 308px | Default state |
| `< 768 px` (mobile) | Full org name truncated by ellipsis at 50px | 102px | 108px fixed outer pill |

Breakpoint comes from `docs/design-system-spec.md` §Breakpoints. The component uses `window.matchMedia('(max-width: 767px)')` internally to switch modes when the `mobile` prop is not explicitly forced.

### 12.2 The `mobile` prop is tristate

`mobile` is intentionally tristate so consuming apps can force a layout regardless of viewport:

- `mobile === true` → force the 108px mobile pill, ignore viewport
- `mobile === false` → force the desktop layout, ignore viewport
- `mobile === undefined` → auto-detect via media query (the default)

This matters for design system tooling (Storybook iframes are often narrow but should still render the desktop variant in dedicated desktop stories).

### 12.3 Viewport test matrix

Test the trigger at these widths to confirm correct rendering:

| Width | Expected | Why |
|---|---|---|
| 320px | Mobile pill (108px), label truncated | iPhone SE narrowest dimension |
| 375px | Mobile pill (108px), label truncated | iPhone 13 mini portrait |
| 414px | Mobile pill (108px), label truncated | iPhone Pro Max portrait |
| 767px | Mobile pill (108px), label truncated | Last px before desktop |
| 768px | Desktop, content-sized | Breakpoint boundary |
| 1024px | Desktop, content-sized | iPad landscape / small laptop |
| 1280px | Desktop, content-sized | Standard laptop |
| 1920px+ | Desktop, content-sized | Large display |

### 12.4 What does NOT change at the breakpoint

- Typography (`Label/Button/S` 14px) — same on both viewports in v1
- All colour tokens — same dark-mode token set on both viewports
- Avatar shape (square 4px-radius) — only the dimension changes (24 → 20)
- Chevron behaviour (rotates 180° on open) — same on both viewports

### 12.5 Container queries

The trigger does **not** respond to container queries. It responds to viewport width only. A future v2 may revisit this if the trigger gets embedded in slim sidebars where a narrower container should force the mobile pill.

---

## 13. Decision tree — when to use / when not to use

Use OrgSwitcher when:
- The signed-in user has access to **more than one** organisation, and the UI needs to make the active org visible and switchable.
- The component sits in the top navigation bar of a Ministry Brands product.

Do NOT use OrgSwitcher when:
- The user has access to a single organisation. Render a non-interactive label instead (or render OrgSwitcher with `disabled`).
- You need a generic dropdown / select. Use a `Select` component (not yet specced).
- You need to switch between modules within an org. Use `ModuleSwitcher` / `SideNav`.

---

## 14. Usage examples

### Basic — Protestant org with logo
```jsx
<OrgSwitcher
  orgName="Grace Community Church"
  logoUrl="/api/orgs/grace/logo.png"
  onClick={() => setOpen(o => !o)}
  open={open}
/>
```

### Catholic org with city name
```jsx
<OrgSwitcher
  orgName="Sacred Heart Church-ITD"
  orgType="catholic"
  cityName="Knoxville"
  logoUrl="/api/orgs/shc/logo.png"
/>
```

### No logo on file (church placeholder)
```jsx
<OrgSwitcher orgName="Northern Kentucky Baptist Church" />
```

### Forced mobile (e.g. inside a Storybook story or a narrow shell)
```jsx
<OrgSwitcher orgName="Grace Community Church" mobile />
```

### Forced desktop (override the media query)
```jsx
<OrgSwitcher orgName="Grace Community Church" mobile={false} />
```

### Disabled (single-org user)
```jsx
<OrgSwitcher orgName="Grace Community Church" disabled />
```

### In context — top-nav shell
```jsx
<header className="top-nav">
  <Logo />
  <OrgSwitcher
    orgName={user.activeOrg.name}
    orgType={user.activeOrg.type}
    cityName={user.activeOrg.cityName}
    logoUrl={user.activeOrg.logoUrl}
    disabled={user.orgs.length <= 1}
    open={panelOpen}
    onClick={() => setPanelOpen(o => !o)}
  />
  <SideNavToggle />
  <UserMenu />
</header>
```

---

## 15. What to pass Claude to implement this component

If you are pointing Claude (or any agent) at this component, hand it:

1. **This spec.** Full path: `components/org-switcher/org-switcher-spec.md`.
2. **The reference module.** `components/org-switcher/org-switcher.jsx` — the source of truth for implementation.
3. **The standalone HTML demo.** `components/org-switcher/org-switcher.html` — shows every state in context.
4. **Storybook stories.** `src/stories/Library/OrgSwitcher/OrgSwitcher.stories.jsx` — shows the component-property surface area.
5. **Figma file key + node ID.** File `3sw45aVcngFAmpbP6cfrXP`, root node `40006819:14583`. The 8 variant node IDs are in §1's table.
6. **Token files.** `src/tokens/tokens.css` (the CSS vars the agent must consume) and `tokens/pathway-design-tokens.json` (the source-of-truth DTCG JSON).
7. **System-wide spec.** `docs/design-system-spec.md` — defines motion, breakpoints, accessibility minimums.
8. **The icon system rule.** All Pathway icons are Material Symbols Rounded. The component already uses `expand_more`. Never look for a custom SVG file for icons.

If the agent is building a downstream consumer (a top-nav shell, a settings page mock), hand it just this spec plus the manifest entry — the component is published as part of `@helloimjolopez-pathway/pathway-tokens` and can be imported.

---

## 16. Figma gaps — needs design work in Figma

Items here require action in Figma (not the repo) before production. Separate from §17 (deferred decisions).

| Gap | Priority | Action |
|---|---|---|
| No focused-state variant in the OrgSwitcher Figma component | HIGH | Add `State: Focus` variant with 2px white outline. (Also §11.8.) |
| Disabled state not surfaced as a Figma variant | MEDIUM | Add `State: Disabled` with 50% opacity treatment. |
| No spec link in Figma Dev Mode → Resources panel | HIGH | Add `https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher-spec.md`. |
| Avatar logo crop variants (logo with letterbox vs full-bleed) | LOW | Designers occasionally produce logos that don't crop well at 24×24. Decide if a per-org logo-fit override (`object-fit: contain` for letterboxed logos) is needed. |

---

## 17. Deferred decisions

| Item | Priority | Notes |
|---|---|---|
| **Dropdown menu / panel — entire sub-component** | DEFERRED to next version | Out of scope in v1. Remains as it is in production until further notice. The whole panel design (header, search, row layout, module icons, mobile bottom-sheet vs dropdown, dimensions, ARIA pattern, keyboard nav within panel) lands in v2. Placeholder lives in the repo so the trigger is testable end-to-end. |
| CityName.Catholic — product data mapping | HIGH | The product database / API must supply `cityName` AND an `orgType: "catholic"` discriminant. Component renders the CityName container ONLY when `orgType === "catholic"` (see §0.1). Confirm data model with backend. |
| Single-org disabled state visual | MEDIUM | Current implementation: trigger at 50% opacity, inert. Confirm this matches design intent or whether a dedicated treatment is wanted. |
| Org switch confirmation toast / live region | MEDIUM | When the panel ships, decide whether selecting a new org fires a toast/live-region announcement. Affects §11.5. |

---

## 18. AI agent implementation guide

A condensed playbook for an AI agent asked to implement (or re-implement) this component from scratch.

1. **Read this spec end-to-end** before opening any file. Especially §0 (scope), §0.1 (Catholic rule), §11 (a11y), §16 (Figma gaps that mean Figma may not match this spec yet).
2. **Read `docs/design-system-spec.md`** for system-wide motion, breakpoints, a11y minimums. Inherit those — don't redefine.
3. **Pull live Figma context.** Use `mcp__c5ffa7b0__get_design_context`, `get_metadata`, `get_variable_defs`, `get_screenshot` for every variant node listed in §1. **Never implement from memory or a sandbox prototype** (CLAUDE.md §10 rule #15).
4. **Confirm the token set is current** by running `/pathway:tokens-sync` first. Stale tokens make every visual wrong.
5. **Implement the trigger only.** Do NOT design or implement the panel. If a panel placeholder is needed for demo purposes, make it visibly non-normative (label it "placeholder, out of scope in v1").
6. **Enforce the Catholic rule in code,** not in data validation: `const showCityName = orgType === "catholic" && Boolean(cityName);` — the gate must live in the component, not in the consumer.
7. **`mobile` is tristate.** `true` forces mobile, `false` forces desktop, `undefined` auto-detects.
8. **Use `box-sizing: border-box` on every nested container.** Padding inside declared dimensions, not added to them. Avoids the avatar-overflow bug that bit v1's first pass.
9. **Add the intermediate `flex flex-row items-center self-stretch` wrapper** around `Container.RowStart`. Figma autolayout has this; it's easy to skip in code and the layout subtly breaks.
10. **The pipe before CityName is not a leading space inside the `<p>`.** Use `paddingLeft: 6` on the CityName container; browsers strip leading whitespace inside `<p>` with `overflow:hidden` + `whiteSpace:nowrap`.
11. **Test at all viewport widths in §12.3** before committing.
12. **Regenerate ALL files** when changing the component (jsx + html + stories.jsx + mdx + manifest entry). Per CLAUDE.md §10 rule "Always regenerate ALL files for an update."

---

## 19. Storybook

Stories at `src/stories/Library/OrgSwitcher/`. Canonical structure mirrors `src/stories/Library/SideNav/SideNav.stories.jsx`: only a handful of interactive stories appear in the left sidebar, and all reference/documentation stories use `tags: ["!dev"]` to hide from the sidebar while remaining embeddable in the Docs MDX page via `<Canvas of={Stories.X} />`.

### Sidebar entries (4 total — matches SideNav's pattern)

| Story | Story ID | What it demonstrates |
|---|---|---|
| Docs | `library-orgswitcher--docs` | The MDX docs page — contains the spec content, all tokens, accessibility, responsive behaviour |
| Playground | `library-orgswitcher--playground` | Full Controls panel — every prop interactive |
| Mobile | `library-orgswitcher--mobile` | 108px-fixed pills with truncated labels — logo + no-logo |
| Avatar Explorer | `library-orgswitcher--avatar-explorer` | Logo on file vs church SVG placeholder, isolated |

### Hidden stories — referenced from the Docs MDX page only (`tags: ["!dev"]`)

These exist as exports so the Docs MDX page can embed them with `<Canvas of={Stories.X} />`, but they do not clutter the sidebar.

- `StateMatrix` — all interaction states on desktop + mobile
- `DesktopVariants` — captions mirror HTML demo: logo on file / no logo / open
- `CatholicVsProtestant` — Catholic shows `| Knoxville`; Protestant with `cityName="Atlanta"` shows NO city container (spec §0.1)
- `Truncation` — short / medium / long
- `TokensFill`, `TokensStroke`, `TokensText`, `TokensIcon`, `TokensTypography`, `TokensSpacing`, `TokensMotion`, `TokensRadius` — one per token category used by the component

### Standalone HTML demo — not a story

The standalone HTML demo (`components/org-switcher/org-switcher.html`) is **NOT** exported as a story. It lives only as a link in the Resources table at the top of the Docs MDX page (and in the Resources table at the top of this spec). Embedding it as a story added noise to the sidebar with no value.

MDX docs page: `library-orgswitcher--docs`. Live URL: [storybook?path=/docs/library-orgswitcher--docs](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-orgswitcher--docs).

---

## 20. Constraints

Hard rules that must not be broken:

1. **CityName is Catholic-only.** Protestant orgs render no city container, even if a `cityName` string is supplied (§0.1).
2. **No text initials in the placeholder.** Always use the church SVG (`CHURCH_ICON_PATH`).
3. **`Container.OrgName` max-width is 180px (max), not fixed.** The container shrinks to fit short org names; long names truncate with ellipsis. Never apply `width: 180px`.
4. **Mobile root is fixed `width: 108px`.** Outer wrapper has asymmetric padding (`px:2 py:4`).
5. **Mobile label container is fixed `width: 50px`.** The full org name truncates inside it visually — never abbreviate.
6. **No raw hex or primitive token references** in component code. Every colour resolves through a semantic token (CLAUDE.md §6).
7. **Mobile and desktop use the same `Label/Button/S` (14px) typography in v1.**
8. **`mobile` prop is tristate.** `true` forces mobile, `false` forces desktop, `undefined` auto-detects. Never coerce to a plain boolean.
9. **Dropdown menu / panel is non-normative in v1.** Treat all panel code as placeholder until a v2 panel spec lands.
10. **Touch target 48×48 minimum** at every viewport (WCAG 2.5.5).
