# OrgSwitcher: Pathway Design System Component Spec

**Status:** `REVIEWED`
**Version:** `v1` (trigger only — see §0)
**Reviewed:** 2026-05-18

Complete implementation reference for the OrgSwitcher trigger. Covers anatomy, design tokens, states, spacing, interaction, motion, and accessibility. Use alongside the [Figma source](#figma-source) for a pixel-accurate build.

## Resources

| Resource | Link |
|---|---|
| 🖼️ **Live HTML demo** | [Open in browser](https://helloimjolopez-collab.github.io/pathway-ds/components/org-switcher/org-switcher.html) — self-contained React+Babel CDN demo |
| 📘 **Storybook docs** | [`Library/OrgSwitcher`](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-orgswitcher--docs) |
| 🎨 **Figma source** | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) — node `40006819:14583` |
| 💻 **React module** | [`components/org-switcher/org-switcher.jsx`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher.jsx) |
| 🌐 **Standalone HTML source** | [`components/org-switcher/org-switcher.html`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher.html) |

---

## 0. Scope of this version (v1)

**This release covers the trigger control in the top nav only.**

| Sub-component | Scope in v1 | Notes |
|---|---|---|
| **Trigger button** (Base / Hover / Pressed / Open × Desktop / Mobile) | ✅ IN SCOPE | Visual + interaction spec is normative. Pixel-accurate against Figma. |
| **Avatar** (logo image / church placeholder) | ✅ IN SCOPE | Logo: `object-fit: cover` proportional fill. Placeholder: church SVG. |
| **Container.CityName.Catholic** | ✅ IN SCOPE | Catholic orgs only (see §0.1). |
| **Chevron rotation** (open ↔ closed) | ✅ IN SCOPE | 200ms `cubic-bezier(0.4,0,0.2,1)`. |
| **Drop panel** (open state) | ⚠️ OUT OF SCOPE — placeholder only | Working scaffolding lives in `org-switcher.jsx` so the trigger has something to open against. **Not part of v1 design system release.** Panel will be designed and specced in a later version. |

### 0.1 CityName is Catholic-only — never Protestant

`Container.CityName.Catholic` (the second text container after the org name, separated by ` | `) is **only ever shown for Catholic organisations**.

- It carries the **city or diocese** name — never a campus, suborg, region, or other identifier.
- Protestant organisations render the trigger with `orgName` only. No pipe. No second container. The Catholic city container is not rendered at all (not just hidden) for Protestant orgs.
- The component reads `orgType` and renders `Container.CityName.Catholic` **only when** `orgType === "catholic"`. Even if a `cityName` string is supplied, it is ignored for non-Catholic orgs.

> **⚠ Figma annotation (node 40007477:12205):** "Container.CityName.Catholic is only implemented and/or shown for Catholic orgs. CityName does not apply to Protestant orgs. CityName is NOT a suborg name."

---

## 1. Component Overview

`OrgSwitcher` is a contextual navigation control that shows the user's current organisation and lets them switch to another. It lives in the brand-blue top navigation bar and is visible at all times while signed in to a multi-org context.

It is **not** used for module-level navigation (that is SideNav's job), for settings access, or for user-profile actions. It is not a generic dropdown or select control — it is specifically scoped to org-and-city/diocese switching.

The trigger has two display modes driven by viewport:

- **Desktop** (`≥ 768 px`): renders the full organisation name in `Container.OrgName` (max-width 180px, content-sized, truncates with ellipsis at 180px). For **Catholic organisations only**, a second `Container.CityName.Catholic` (max 72px) follows after a pipe: `Sacred Heart Church-ITD  |  Knoxville`. Protestant orgs render the org name on its own.
- **Mobile** (`< 768 px`): renders inside a fixed 108px-wide pill. The label container is a fixed 50px and the full `orgName` is truncated by `text-overflow: ellipsis`. **No abbreviation** — "Grace Community Church" displays visually as "Grace Comm…". Typography is the same `Label/Button/S` (14px) used on desktop.

### Figma source

- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **OrgSwitcher component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583)

---

## 1.1 Governance: where things live

Use this table to find the owner of any decision. Every row points to the single location that owns it.

| To change… | Owner | Where |
|---|---|---|
| Trigger colours, typography, spacing tokens | Figma: OrgSwitcher component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) |
| Primitive or semantic token values | Figma: Variables panel | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) |
| Org logo image source / placeholder rules | Figma: `Container.Avatar` (node `40006817:14389`) + this spec §5 | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006819-14583) |
| Church placeholder SVG (no-logo state) | Figma node `40007243:73426` + `components/org-switcher/org-switcher.jsx` (`CHURCH_ICON_PATH`) | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007243-73405) |
| Catholic-only CityName rule | This spec | §0.1 |
| Desktop label format + truncation rules | This spec | §5.1 |
| Mobile label truncation (no abbreviation) | This spec | §5.2 |
| Chevron rotation animation | This spec | §9 |
| Trigger interaction (click, keyboard) | This spec | §10 |
| Accessibility (ARIA, focus, reduced motion) | This spec | §11 |
| Responsive breakpoint | This spec | §12 |
| Drop panel design | **DEFERRED to next version** | §0 — out of scope in v1 |
| Live HTML demo | This spec § 15 + [`org-switcher.html`](https://helloimjolopez-collab.github.io/pathway-ds/components/org-switcher/org-switcher.html) | §15 |
| Storybook stories + docs page | This spec § 13 + `src/stories/Library/OrgSwitcher/` | §13 |
| Known design gaps | This spec | §16 |

**Rule:** if a decision isn't in the table above, check §16 (gaps). If it's not there either, it hasn't been specified yet — add it to the spec before implementing.

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
| Root min-height / min-width (touch target) | 48px | 48px | raw |
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
| `Container.CityName.Catholic` max-width | 72px | (n/a) | Catholic orgs only |
| `Container.Label` (mobile) | (n/a) | 50px fixed | Figma 40007067:13273 |
| `Container.RowEnd` padding | 2px | 2px | `padding-xxxtight` |
| `Container.IconTrailing` size + padding | 16×16, p-2 | 16×16, p-2 | raw |
| Chevron icon size | 12×12 (16 container - 2×2 padding) | 12×12 | raw |

---

## 5. Item Variants

### 5.1 Desktop trigger

- Renders the full legal org name in `Container.OrgName`. Container is content-sized with `max-width: 180px`. Long names truncate with `text-overflow: ellipsis` at 180px.
- For Catholic organisations (`orgType === "catholic"`), appends `Container.CityName.Catholic` (max-width 72px) after a ` | ` separator with the city or diocese name.
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
4. State transitions on fill / border are `120ms ease` (instant under `prefers-reduced-motion`).

---

## 7. Sub-components

### 7.1 Avatar

24×24 (desktop) / 20×20 (mobile) outer; 2px inner padding; 1px border; corner radius 4px. Contains either the org's logo image (`object-fit: cover`) or the church placeholder SVG (see §5.3 / §5.4).

### 7.2 Chevron

`expand_more` Material Symbol (Rounded). Lives inside `Container.IconTrailing` (16×16, 2px inner padding → 12×12 effective icon area). Rotates 180° when the panel is open.

---

## 8. Iconography

- **Chevron:** Material Symbols Rounded `expand_more`. 12×12 effective. Colour: `icon.action.mono.*` per state.
- **Avatar (logo):** product-supplied image — sourced from the org record. `object-fit: cover`.
- **Avatar (no logo):** church/building SVG embedded in `org-switcher.jsx` as `CHURCH_ICON_PATH`. Never replace with text initials.

---

## 9. Motion

| Property | Value | Notes |
|---|---|---|
| Chevron rotation | `transform 200ms cubic-bezier(0.4,0,0.2,1)` | Same easing tier as other Pathway "expand" controls |
| State transition (fill + border) | `120ms ease` | Snappy enough for hover, no perceptible lag |
| Reduced motion | All transforms and transitions removed | Honour `prefers-reduced-motion: reduce` at the shell level |

---

## 10. Interaction

- **Click / tap trigger** → toggles panel open/closed (panel out of scope in v1, but the trigger state still flips).
- **Enter / Space** on trigger → same as click.
- **Escape** while panel is open → closes panel, returns focus to trigger (wired in the shell).
- **Click outside panel** → closes panel (non-modal).
- **Single-org users** → trigger is rendered disabled; no panel mounts.

---

## 11. Accessibility

### 11.1 ARIA pattern

The OrgSwitcher uses the [Disclosure (Show/Hide) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) with `aria-haspopup` and `aria-expanded` on the trigger button.

### 11.2 ARIA markup

```html
<button
  type="button"
  aria-haspopup="true"
  aria-expanded="false"
  aria-label="Current organisation: Sacred Heart Church-ITD, Knoxville. Activate to switch."
>
  <span aria-hidden="true">[avatar]</span>
  <span aria-hidden="true">Sacred Heart Church-ITD | Knoxville</span>
  <span aria-hidden="true">[chevron]</span>
</button>
```

- `aria-label` always carries the full org name (and city name for Catholic orgs), regardless of visible truncation.
- The visible label is `aria-hidden="true"` — screen readers rely on the label, not the truncated text.

### 11.3 Keyboard

| Key | Behaviour |
|---|---|
| `Enter` / `Space` on trigger | Open/close panel |
| `Escape` | Close panel, return focus to trigger |
| `Tab` | Move focus out of trigger (normal tab order) |

### 11.4 Focus

Focus ring: `2px solid rgba(255,255,255,0.9)` on the trigger button. Touch target: 48×48 (WCAG 2.5.5) provided by the outer wrapper.

### 11.5 Reduced motion

When `prefers-reduced-motion: reduce` is set at the shell level, chevron rotation and state transitions render instantly.

---

## 12. Responsiveness

| Viewport | Trigger label | Container.Main max-width |
|---|---|---|
| `≥ 768 px` (desktop) | Full org name (+ city name for Catholic orgs) | 308px |
| `< 768 px` (mobile) | Full org name truncated by ellipsis at 50px | 102px |

Breakpoint per `docs/design-system-spec.md` §Breakpoints. The component uses `window.matchMedia('(max-width: 767px)')` internally to switch modes when `mobile` prop is not explicitly forced.

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

### Forced mobile
```jsx
<OrgSwitcher orgName="Grace Community Church" mobile />
```

### Disabled (single-org user)
```jsx
<OrgSwitcher orgName="Grace Community Church" disabled />
```

---

## 15. Standalone HTML demo

A self-contained React+Babel CDN demo of the OrgSwitcher lives at:

- **Live:** [`https://helloimjolopez-collab.github.io/pathway-ds/components/org-switcher/org-switcher.html`](https://helloimjolopez-collab.github.io/pathway-ds/components/org-switcher/org-switcher.html)
- **Source:** [`components/org-switcher/org-switcher.html`](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/org-switcher/org-switcher.html)

The demo file has a resource bar at the top linking back to this spec, the Storybook docs, and the source on GitHub. It shows:
- Desktop trigger with logo on file
- Desktop trigger with no logo on file (church placeholder)
- Desktop trigger open (with placeholder panel)
- Mobile compact triggers with logo + no-logo variants

The demo is also embedded as a Storybook story (`StandaloneDemo`) for in-context review.

---

## 16. Constraints

Hard rules that must not be broken:

1. **CityName is Catholic-only.** Protestant orgs render no city container, even if a `cityName` string is supplied (§0.1).
2. **No text initials in the placeholder.** Always use the church SVG (`CHURCH_ICON_PATH`).
3. **`Container.OrgName` max-width is 180px (max), not fixed.** The container shrinks to fit short org names; long names truncate with ellipsis. Never apply `width: 180px`.
4. **Mobile root is fixed `width: 108px`.** Outer wrapper has asymmetric padding (`px:2 py:4`).
5. **Mobile label container is fixed `width: 50px`.** The full org name truncates inside it visually — never abbreviate.
6. **No raw hex or primitive token references** in component code. Every colour resolves through a semantic token.
7. **Mobile and desktop use the same `Label/Button/S` (14px) typography in v1.**
8. **Panel is placeholder.** Treat panel code as non-normative until a future version specs it.

---

## 17. Gaps & deferred decisions

| Gap | Priority | Notes |
|---|---|---|
| **Panel — entire sub-component** | DEFERRED to next version | Out of scope in v1. Whole panel design (header, search, row layout, module icons, mobile bottom-sheet vs dropdown, dimensions, ARIA pattern, keyboard nav within panel) lands later. Placeholder lives in the repo so the trigger is testable end-to-end. |
| CityName.Catholic — product data mapping | HIGH | The product database / API must supply `cityName` AND an `orgType: "catholic"` discriminant. Component renders the CityName container ONLY when `orgType === "catholic"` (see §0.1). Confirm data model with backend. |
| Single-org disabled state visual | MEDIUM | Current implementation: trigger at 50% opacity, inert. Confirm this matches design intent. |
