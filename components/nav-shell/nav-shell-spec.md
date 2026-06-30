# NavShell — Pathway Design System Component Spec

**Status:** `PENDING HUMAN REVIEW`

Complete implementation reference for the Ministry Brands Amplify navigation shell. Covers the full-page layout that wraps every screen: TopNav, SideNav, and the main content area (ScreenTemplate). Agents reading this spec can produce a pixel-accurate, fully interactive implementation for any module, org, or page content by following the rules exactly.

---

## Authorship

Design (Jo Lopez) owns and signs off on: Status, Purpose, Layout, Breakpoints, Token reference, Accessibility intent, Usage rules.
Engineering owns and signs off on: prop types, ARIA implementation in code, browser-specific behaviour.
Neither signs off on the other's section.

---

## Links

| Artefact | URL |
|---|---|
| Figma (ScreenTemplate) | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006538-43236 |
| Figma (TopNav) | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508 |
| Figma (SideNav) | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003951-2927 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-navshell--docs (pending) |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/nav-shell/nav-shell.html |

---

## Section index

| Section | Jump |
|---|---|
| §1 Purpose | [↓](#1-purpose) |
| §2 Anatomy | [↓](#2-anatomy) |
| §3 Design tokens | [↓](#3-design-tokens) |
| §4 Layout and spacing | [↓](#4-layout-and-spacing) |
| §5 Breakpoints | [↓](#5-breakpoints) |
| §6 Nested components | [↓](#6-nested-components) |
| §7 ScreenTemplate content area | [↓](#7-screentemplate-content-area) |
| §8 Interaction | [↓](#8-interaction) |
| §9 Agent implementation guide | [↓](#9-agent-implementation-guide) |
| §10 Accessibility | [↓](#10-accessibility) |
| §11 Motion | [↓](#11-motion) |
| §12 Responsiveness | [↓](#12-responsiveness) |
| §13 Figma gaps and deferred decisions | [↓](#13-figma-gaps-and-deferred-decisions) |

---

## 1. Purpose

The NavShell is the fixed application frame that wraps every page in Ministry Brands Amplify. It is not a page — it is the container that every page lives inside. Its three jobs:

1. **Identity and context** — always tells the user which module (ModuleSwitcher), which organisation (OrgSwitcher), and which sub-section (SideNav) they are in.
2. **Navigation** — provides access to all modules (TopNav), all pages within the current module (SideNav), and system-level actions (search, notifications, profile).
3. **Layout** — defines the stable three-zone layout (TopNav + SideNav + Content) that every module shares. This predictability is what makes the product feel like a system rather than a collection of pages.

The NavShell never changes between pages. The SideNav items change per module. The content area changes per page. Everything else is constant.

---

## 2. Anatomy

```
NavShell
├── TopNav (fixed, full width, 56px tall)
│   ├── Slot.RowStart
│   │   ├── [Hamburger button]       ← mobile only
│   │   ├── ModuleSwitcher           ← always present
│   │   └── OrgSwitcher              ← always present
│   └── Slot.RowEnd
│       ├── TopNavSearch             ← always present
│       ├── [Notification bells]     ← desktop only
│       ├── [more_vert button]       ← tablet + mobile
│       └── ProfileAvatar            ← always present
│
├── SideNav (fixed below TopNav, left edge)
│   ├── NavHeader                    ← module label + collapse button
│   ├── NavMenu                      ← nav items (tree pattern)
│   │   ├── [NavSectionLabel]        ← optional grouping label
│   │   └── NavItem (×N)             ← one per module page
│   └── NavFooter                    ← collapse toggle button
│
└── Shell.Main (scrollable content area)
    └── ScreenTemplate               ← page content (changes per page)
        ├── Slot.PageNavigation      ← Tabs (optional)
        ├── PageHeading              ← page title + subtitle + actions
        ├── ToolBar                  ← search + FilterChips + actions
        └── Section (×N)            ← section heading + card grid
```

The three zones are always present. Their dimensions change at breakpoints (see §5) but their presence is constant.

---

## 3. Design tokens

### TopNav surface (dark mode — brand blue)

| Token | CSS variable | Resolved | Usage |
|---|---|---|---|
| `fill.static.brand.base` | `--semantic-color-light-mode-fill-static-brand-base` | #2d4889 | Nav bar background |
| `fill.action.tertiary.base` (dark) | dark-mode | rgba(160,181,230,0.04) | OrgSwitcher resting fill |
| `stroke.action.tertiary.base` (dark) | dark-mode | rgba(160,181,230,0.16) | OrgSwitcher border |
| `fill.action.primaryinverse.hover` (dark) | dark-mode | rgba(10,18,35,0.16) | All nav controls hover |
| `text.action.mono.base` (dark) | dark-mode | #fbfbfb | All text + icons on nav |
| `fill.static.accent.amethyst.base` | `--semantic-color-light-mode-fill-static-accent-amethyst-base` | #dcd9ef | Profile avatar bg |
| `text.static.accent-amethyst.contrast` | `--semantic-color-light-mode-text-static-accent-amethyst-contrast` | #221e3f | Profile avatar initials |

### SideNav surface (light mode)

| Token | CSS variable | Resolved | Usage |
|---|---|---|---|
| `surface.nav.light` | `--semantic-color-light-mode-surface-nav-light` | #f9f9f9 | SideNav background |
| `stroke.static.neutral.light` | `--semantic-color-light-mode-stroke-static-neutral-light` | #f6f6f6 | Right border + section separators |
| `fill.contextual.navitem.hover` | `--semantic-color-light-mode-fill-contextual-navitem-hover` | rgba(69,77,94,0.06) | Nav item hover |
| `fill.contextual.navitem.active` | `--semantic-color-light-mode-fill-contextual-navitem-active` | #eef2fb | Active nav item fill |
| `text.contextual.navitem.base` | `--semantic-color-light-mode-text-contextual-navitem-base` | #484848 | Nav item label |
| `text.contextual.navitem.active` | `--semantic-color-light-mode-text-contextual-navitem-active` | #3555a0 | Active nav item label |
| `icon.contextual.navitem.base` | `--semantic-color-light-mode-icon-contextual-navitem-base` | #606060 | Nav item icon (resting) |
| `icon.contextual.navitem.active` | `--semantic-color-light-mode-icon-contextual-navitem-active` | #3555a0 | Active nav item icon |

### ScreenTemplate surface (light mode)

| Token | CSS variable | Resolved | Usage |
|---|---|---|---|
| `surface.canvas.light` | `--semantic-color-light-mode-surface-canvas-light` | #fafafa | Page background |
| `fill.static.neutral.light` | `--semantic-color-light-mode-fill-static-neutral-light` | #ffffff | Card background |
| `stroke.action.secondary-inverse.base` | `--semantic-color-light-mode-stroke-action-secondary-inverse-base` | #d2d2d2 | Card border + toolbar search border |
| `text.static.primary.base` | `--semantic-color-light-mode-text-static-primary-base` | #202020 | Page heading, card title |
| `text.static.secondary.base` | `--semantic-color-light-mode-text-static-secondary-base` | #484848 | Page subtitle |
| `text.static.secondary.subtle` | `--semantic-color-light-mode-text-static-secondary-subtle` | #606060 | Section heading, card body, search placeholder |
| `fill.action.tertiary.base` | `--semantic-color-light-mode-fill-action-tertiary-base` | #eef2fb | Active filter chip bg |
| `text.action.primary.base` | `--semantic-color-light-mode-text-action-primary-base` | #3555a0 | Active tab, active filter chip text |
| `fill.static.accent_amethyst.light` | `--semantic-color-light-mode-fill-static-accent-amethyst-light` | #f4f2fa | Badge background |
| `text.static.accent-amethyst.contrast` | `--semantic-color-light-mode-text-static-accent-amethyst-contrast` | #221e3f | Badge text |

---

## 4. Layout and spacing

### Shell structure

```
┌─────────────────────────────────────────────────────────────────┐
│ TopNav (position: fixed, height: 56px, z-index: 100)            │
├─────────┬───────────────────────────────────────────────────────┤
│ SideNav │ Shell.Main (overflow-y: auto)                         │
│ fixed   │  └── ScreenTemplate                                   │
│ top:56px│       px:36, pt:12, pb:56, gap:24                     │
│         │                                                       │
└─────────┴───────────────────────────────────────────────────────┘
```

### Contextual spacing tokens (from Figma ScreenTemplate)

| Property | Token | Value |
|---|---|---|
| Page horizontal padding | `contextual.page.padding.horizontal` | 36px |
| Page top padding | `contextual.page.padding.top` | 12px |
| Page bottom padding | `contextual.page.padding.bottom` | 56px |
| Page gap (between sections) | `contextual.page.gap.vertical` | 16px (gap-relaxed = 24px) |
| PageHeading padding-top | `contextual.page-heading.padding.top` | 8px |
| PageHeading padding-bottom | `contextual.page-heading.padding.bottom` | 16px |
| PageHeading gap | `contextual.page-heading.gap.vertical` | 8px |
| ToolBar padding-vertical | `contextual.toolbar.padding.vertical` | 8px |
| ToolBar gap-vertical | `contextual.toolbar.gap.vertical` | 8px |
| SectionHeading padding-vertical | `contextual.section-heading.padding.vertical` | 6px |
| Section padding-top | `contextual.section.padding.top` | 4px |
| Section padding-bottom | `contextual.section.padding.bottom` | 16px |
| Section gap | `contextual.section.gap.vertical` | 8px |
| Card padding | `contextual.card.padding.medium.horizontal` | 16px |
| Card gap | `contextual.card.gap.gap` | 12px |
| Card border-radius | `contextual.card.cornerradius.cornerradius` | 8px |
| Card border width | `contextual.card.border-width.base.base` | 0.5px |

> IMPLEMENTATION RULE: Toolbar search input uses border-radius 6px.
> This is NOT `cornerradius.medium` (8px). The 6px value is confirmed from Figma node 40006537:42540 and must not be changed to match the standard button radius.

---

## 5. Breakpoints

| Breakpoint | Width | SideNav state | Content margin | TopNav changes |
|---|---|---|---|---|
| **Desktop** | ≥1024px | Expanded (240px) or Collapsed (72px rail) — user controls | 240px or 72px | Full labels, 2× notification bells |
| **Tablet** | 768–1023px | Always collapsed rail (72px, no labels) | 72px fixed | Module label hidden, bells → more_vert |
| **Mobile** | <768px | Hidden by default, overlay on hamburger tap | 0 | Hamburger visible, org label abbreviated, initials 11px |

### Desktop SideNav states

The desktop SideNav has two user-controlled states:

- **Expanded (240px):** labels + icons visible. Push layout — content area shifts right.
- **Collapsed (72px):** icons only, labels hidden. Tooltip shown on hover. Push layout — content shifts to 72px.

The user can toggle between these by clicking the collapse button at the bottom of the SideNav, or the `left_panel_close` / `right_panel_close` icon in the nav header.

### Mobile overlay

On mobile, the SideNav slides in as a 240px overlay (not push) when the hamburger is tapped. A dark scrim covers the content area. Tapping the scrim or pressing Escape closes the SideNav.

> IMPLEMENTATION RULE: The SideNav never uses CSS `display: none`.
> All three states (expanded, collapsed, hidden) are controlled by `width` transition. This preserves focus management and avoids layout flicker.

---

## 6. Nested components

The NavShell is composed from these existing DS components. Each has its own spec and implementation files:

| Component | Role | Spec | Module |
|---|---|---|---|
| `TopNav` | Fixed top bar — module + org + search + profile | `components/top-nav/top-nav-spec.md` | `components/top-nav/top-nav.jsx` |
| `SideNav` | Left navigation rail — module page nav | `components/sidenav/sidenav-spec.md` | `components/sidenav/sidenav.jsx` |
| `SearchInput` / `TopNavSearch` | Search trigger inside TopNav | `components/search/search-spec.md` | `components/search/search.jsx` |
| `OrgSwitcher` | Org name trigger inside TopNav | `components/org-switcher/org-switcher-spec.md` | `components/org-switcher/org-switcher.jsx` |

The **ScreenTemplate** content area (PageHeading, ToolBar, FilterChips, Tabs, Cards) contains sub-components that are not yet standalone DS components. They are implemented inline in `nav-shell.html` with full token bindings. Each will become its own component in a future pipeline run. See §13.

---

## 7. ScreenTemplate content area

The ScreenTemplate fills the Shell.Main scrollable area. It is composed from four zones stacked vertically.

### 7.1 Slot.PageNavigation — Tabs

Optional. When present, renders above the PageHeading.

- Background: `surface.canvas.light` (#fafafa)
- Active tab: `text.action.primary.base` (#3555a0), font-weight 600
- Active indicator: 2px bar at bottom, `fill.action.primary.base` (#3555a0), border-radius 2px 2px 0 0
- Inactive tab: `text.static.secondary.subtle` (#606060), font-weight 500
- Border-bottom on the tab container: 1px `stroke.static.neutral.light`

### 7.2 PageHeading

- **Title:** `heading.page.base.semibold` — 24px / 600 / 30px line-height / 0.1px tracking
  - Color: `text.static.primary.base` = #202020
- **Subtitle:** `text.body.base.regular` — 16px / 400 / 22px / 0.1px tracking
  - Color: `text.static.secondary.base` = #484848
- **Padding:** top 8px, bottom 16px, gap 8px between title and subtitle
- **Trailing actions slot:** right-aligned, contains action buttons (Button DS component)

### 7.3 ToolBar

Stacks vertically at 8px gap. Default: one row.

**Leading slot:**
- Search bar: max-width 400px, min-width 200px, height 36px
  - Border: 0.75px `stroke.action.secondary-inverse.base` = #d2d2d2
  - **Border-radius: 6px** (NOT 8px — confirmed from Figma)
  - Padding: 8px horizontal
  - Search icon: 16×16, `icon.action.secondary-inverse.base` = #6b6b6b
- FilterChips: inline row, gap 4px, each chip min-height 48px
  - Resting: transparent background, `text.action.secondary.base` = #292724, font 12px/500
  - Active: `fill.action.tertiary.base` = #eef2fb, `text.action.primary.base` = #3555a0, font-weight 600
  - Border-radius: 4px (`border-radius.xs`) — NOT 8px

**Trailing slot:** action buttons (right-aligned)

### 7.4 Content sections

Each section has:
1. **SectionHeading:** 14px/600 uppercase, `text.static.secondary.subtle` (#606060), letter-spacing 0.6px, padding-vertical 6px
2. **Card grid:** `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, gap 8px

**Card anatomy:**
```
Card (bg: white, border: 0.5px #d2d2d2, radius: 8px, padding: 16px, gap: 12px)
├── CardHeading
│   ├── IconContainer (32×32, radius: 8px, color variant background)
│   │   └── Icon (16×16, Material Symbols Rounded)
│   └── CardTitle (16px/600/22px, text.static.primary.base = #202020)
├── Slot.CardSubtitle
│   └── Badge (bg: fill.static.accent_amethyst.light = #f4f2fa, radius: 12px)
│       └── label.badge.small.medium: 11px/500/16px, tracking 0.3px
│           color: text.static.accent-amethyst.contrast = #221e3f
└── CardBody (14px/400/20px, text.static.secondary.subtle = #606060)
```

Card icon color variants (32×32 container):
- **Accent/amethyst:** bg `fill.static.accent_amethyst.light` (#f4f2fa)
- **Positive/green:** bg `fill.static.positive.light` (#f0faf1)
- **Info/blue:** bg `fill.static.info.light` (#eef2fb)
- **Warning:** bg `fill.static.warning.light` (#fff8e1)

---

## 8. Interaction

### SideNav collapse (desktop)

- Clicking the NavHeader collapse button or NavFooter toggle button collapses/expands the SideNav.
- Width transitions with `--motion-duration-6` · `--motion-easing-emphasized` (same as the SideNav component).
- The Shell.Main margin-left matches the SideNav width and transitions simultaneously.
- Labels and section headings fade via `opacity` transition (`--motion-duration-3` · `--motion-easing-standard`), not `display: none`.

### Mobile hamburger

- The hamburger button only appears at <768px viewports.
- Its sole purpose is to reveal/hide the module SideNav. There is no other trigger for this on mobile.
- When tapped, the SideNav animates in from the left at 240px width over the content (overlay, not push).
- A dark scrim (rgba(0,0,0,0.32)) covers the content. Tapping it closes the SideNav.
- Escape key also closes the SideNav and returns focus to the hamburger.

### OrgSwitcher

- Clicking the OrgSwitcher trigger opens a panel listing all organisations the user has access to.
- Clicking outside or pressing Escape closes it.
- The active org is highlighted with `fill.action.primaryinverse` in the panel.

### TopNavSearch (TopNavSearch component)

- Collapsed state: 48×48 icon button on the brand-blue surface.
- Tap/click expands into a 320px search bar with spring animation (350ms, cubic-bezier overshoot).
- Search icon inside the expanded bar collapses it. Escape also collapses.
- See `components/search/search-spec.md` for full spec.

---

## 9. Agent implementation guide

This section is written specifically for AI agents implementing the NavShell. Follow every rule precisely.

### 9.1 The single place to configure the shell

All content-level customisation happens through `SHELL_CONFIG` at the top of the implementation file. Never hardcode module names, org names, or nav items anywhere else.

```javascript
const SHELL_CONFIG = {
  // REQUIRED — the active module
  module: {
    id:       "giving",                // unique string
    label:    "Amplify Giving",        // display name in TopNav
    icon:     "volunteer_activism",    // Material Symbols Rounded ligature
    isCustom: false,                   // true ONLY for Amplify Home (uses custom SVG)
  },

  // REQUIRED — the active organisation
  org: {
    name:   "NorthPoint Church",
    campus: "Atlanta",                 // empty string if no campus
    // logoUrl: "https://..."          // omit for default no-logo behavior
  },

  // REQUIRED — the logged-in user (for profile avatar)
  user: {
    name:     "Jo Lopez",
    initials: "JL",                    // 2–3 chars, derived from name
    email:    "jo@northpoint.org",
  },

  // REQUIRED — the SideNav navigation items
  // Order matters — items appear in this exact order
  navItems: [
    {
      id:           "home",            // unique string
      label:        "Home",            // displayed label
      icon:         "home",            // Material Symbols Rounded ligature
      active:       true,              // true = current page (exactly one item)
      sectionLabel: undefined,         // optional: adds a NavSectionLabel above this item
    },
    {
      id:    "teams",
      label: "Teams",
      icon:  "group",
    },
    {
      id:    "projects",
      label: "Projects",
      icon:  "folder",
    },
  ],

  // REQUIRED — the current page content
  page: {
    title:     "Teams",
    subtitle:  "Manage your ministry teams and volunteers",
    tabs:      ["All Teams", "Active", "Archived"],   // empty array = no tabs
    activeTab: 0,
    toolbar: {
      searchPlaceholder: "Search teams...",
      filters:           ["All", "Active", "Archived"],
      activeFilter:      0,
    },
  },
};
```

### 9.2 Icon rules

- Every nav item icon must be a Material Symbols Rounded ligature name.
- To find an icon: browse `https://github.com/google/material-design-icons` (folder name = ligature) or search at `https://fonts.google.com/icons?style=rounded`.
- Active nav items use `FILL=1` (filled icon). Resting items use `FILL=0` (outlined).
- The Amplify Home module icon is a custom branded SVG (not a Material Symbol). Use `HomeModuleIcon` component. Do NOT replace it with `home` ligature.
- All other module icons use Material Symbols Rounded.

### 9.3 Layout rules — never break these

1. The TopNav is always `position: fixed; top: 0; z-index: 100; height: 56px`. Never change height.
2. The SideNav is always `position: fixed; top: 56px; left: 0; bottom: 0`. Never absolute.
3. The Shell.Main always has `margin-left` equal to the current SideNav width. This creates the push layout.
4. At mobile (<768px), margin-left is 0 and the SideNav is an overlay (z-index > 50).
5. The SideNav uses width transitions, never display:none. States: 240px (expanded), 72px (collapsed), 0px (mobile hidden).

### 9.4 Breakpoint behaviour — exactly as designed

**Desktop (≥1024px):**
- SideNav: 240px expanded OR 72px collapsed (user toggles)
- TopNav: full module label, 2× notification bells, no hamburger
- Content: margin-left matches SideNav width

**Tablet (768–1023px):**
- SideNav: always 72px rail (no labels, no collapse button action)
- TopNav: module icon only (label hidden), bells → more_vert, no hamburger
- Content: margin-left always 72px

**Mobile (<768px):**
- SideNav: 0px default, 240px overlay on hamburger tap
- TopNav: hamburger button visible (ONLY way to access SideNav on mobile), org label abbreviated, profile initials 11px
- Content: margin-left always 0

### 9.5 Organisation label abbreviation rules (mobile)

On mobile, the org trigger shows abbreviated text. The rules:

- **Org abbreviation:** Take first letter of first 3 significant words (skip articles: the, a, an, of, in, at, for, and, or). If 2 words, repeat last. Example: "NorthPoint Church" → "NPC".
- **Campus abbreviation:** If campus is a single place name, use first letter + first letter of suffix (e.g. "Knoxville" → "KV"). If two words, first letter each.
- **Full label:** `"NPC | KV"` (org abbreviation + pipe + campus abbreviation). No pipe if no campus.

### 9.6 What to never do

- Never hardcode `#2d4889` — always use `var(--semantic-color-light-mode-fill-static-brand-base, #2d4889)`.
- Never hardcode `#fafafa` — always use `var(--semantic-color-light-mode-surface-canvas-light, #fafafa)`.
- Never use `display: none` on the SideNav for any state — use `width: 0` with `overflow: hidden`.
- Never set `border-radius: 8px` on the ToolBar search input — it is 6px (confirmed from Figma).
- Never put `overflow: hidden` on Shell.Main — the content area must scroll.
- Never show a logo or avatar in the OrgSwitcher nav trigger unless `logoUrl` is explicitly provided.
- Never use `Material Icons` (outdated) — always `Material Symbols Rounded`.

### 9.7 Common implementation prompt template

When asking an agent to implement a page in the NavShell, use this template:

```
Use the Pathway NavShell from components/nav-shell/nav-shell.html.
Import TopNav from components/top-nav/top-nav.jsx and SideNav from components/sidenav/sidenav.jsx.

Configure SHELL_CONFIG as follows:
- Module: [MODULE_NAME] (icon: [ICON_LIGATURE])
- Org: [ORG_NAME], campus [CAMPUS]
- User: [NAME] ([INITIALS])
- Nav items: [ITEM_1 (active)], [ITEM_2], [ITEM_3]...
- Page title: [TITLE]
- Page subtitle: [SUBTITLE]
- Tabs: [TAB_1, TAB_2, ...]
- Filter chips: [FILTER_1, FILTER_2, ...]

For the card content, use [DESCRIBE_CONTENT].

Apply all Pathway semantic tokens. Do not hardcode colours. Follow nav-shell-spec.md §9.
```

---

## 10. Accessibility

| What | How |
|---|---|
| TopNav landmark | `<header role="banner">` |
| SideNav landmark | `<nav aria-label="Module navigation">` |
| Main content landmark | `<main id="main-content">` |
| Skip link | Add `<a href="#main-content">Skip to content</a>` as first focusable element |
| SideNav tree | `role="tree"` on nav menu, `role="treeitem"` on each item, `aria-current="page"` on active |
| Collapsed SideNav items | `aria-label={item.label}` on the button when labels are hidden |
| Mobile hamburger | `aria-label="Toggle navigation menu"`, `aria-expanded` reflects SideNav state |
| OrgSwitcher | `aria-haspopup="true"`, `aria-expanded` reflects panel state |
| TopNavSearch | Full spec in `components/search/search-spec.md §13` |
| Focus trap | Mobile SideNav overlay traps focus inside the nav panel |
| Touch targets | All interactive controls: 48×48px minimum (WCAG 2.5.5) |
| Reduced motion | All width/opacity transitions suppressed under `prefers-reduced-motion: reduce` |

---

## 11. Motion

| Element | Property | Duration | Easing |
|---|---|---|---|
| SideNav expand/collapse | `width` | `--motion-duration-6` | `--motion-easing-emphasized` |
| Shell.Main margin-left | `margin-left` | `--motion-duration-6` | `--motion-easing-emphasized` |
| Nav item labels | `opacity` | `--motion-duration-3` | `--motion-easing-standard` |
| Nav section labels | `opacity` | `--motion-duration-4` | `--motion-easing-standard` |
| TopNavSearch expand | `width` + opacity | `--motion-duration-4` | `--motion-easing-spring` |
| OrgSwitcher panel | drop-in fade | `--motion-duration-3` | `--motion-easing-decelerate` |
| Card hover | `box-shadow` + `border-color` | `--motion-duration-2` | `--motion-easing-standard` |

All transitions registered as contextual overrides per `docs/design-system-spec.md §2.3`.

---

## 12. Responsiveness

Detailed per-breakpoint layout values (pixel-accurate from Figma and implementation):

### Desktop (≥1024px)

```
┌── TopNav: 100vw × 56px, px:16 ──────────────────────────────────┐
│ [ModuleSwitcher + label] [OrgSwitcher]       [Search][Bell×2][Avatar] │
├── SideNav: 240px × (100vh-56px) ───┬── Shell.Main: (100vw-240px) ┤
│ NavHeader: 48px                    │ ScreenTemplate: px:36 pt:12  │
│ NavMenu: flex-1, overflow-y: auto  │                              │
│ NavItem: 48px min-height           │                              │
│ NavFooter: 48px                    │                              │
└────────────────────────────────────┴──────────────────────────────┘
Collapsed rail: SideNav = 72px, Shell.Main = (100vw-72px)
```

### Tablet (768–1023px)

```
┌── TopNav: 100vw × 56px ─────────────────────────────────────────┐
│ [ModuleIcon only] [OrgSwitcher]              [Search][more_vert][Avatar] │
├── SideNav: 72px × (100vh-56px) ────┬── Shell.Main: (100vw-72px) ┤
│ Icons only, no labels              │ ScreenTemplate: px:36 pt:12 │
└────────────────────────────────────┴─────────────────────────────┘
```

### Mobile (<768px)

```
┌── TopNav: 100vw × 56px ─────────────────────────────────────────┐
│ [Hamburger][ModuleIcon][OrgSwitcher abbr]  [Search][more_vert][Avatar 11px] │
├── Shell.Main: 100vw ────────────────────────────────────────────┤
│ ScreenTemplate: px:16 pt:8                                       │
│ Card grid: 1 column                                              │
└─────────────────────────────────────────────────────────────────┘
SideNav: 240px overlay (z:50), positioned fixed top:56px, slides in from left
Scrim: rgba(0,0,0,0.32), covers full content area below TopNav
```

---

## 13. Figma gaps and deferred decisions

### ScreenTemplate sub-components — future standalone DS components

These are implemented inline in `nav-shell.html`. Each will get its own pipeline run:

| Component | Figma node | Status |
|---|---|---|
| `PageHeading` | Inside 40006538:43236 | Not yet a standalone DS component |
| `ToolBar` | `40006537:42570` | Not yet a standalone DS component |
| `FilterChip` | `40006526:36972` | Not yet a standalone DS component |
| `Tabs` | Inside 40006718:5996 | Not yet a standalone DS component |
| `Card` | Inside 40006538:42775 | Not yet a standalone DS component |
| `Badge` | Inside card | Not yet a standalone DS component |
| `SectionHeading` | `40006538:43364` | Not yet a standalone DS component |

### Token gaps

| Gap | Priority | Notes |
|---|---|---|
| ToolBar search border-radius 6px | MEDIUM | Not a standard token value. `cornerradius.medium` = 8px, `cornerradius.xs` = 4px. 6px is a raw value — no token. Flag for Figma to add as a contextual token. |
| `contextual.page.*` tokens not in token file | HIGH | Figma uses `--contextual/page/padding/horizontal`, etc. These are not in `tokens/pathway-design-tokens.json`. Raw values used as fallbacks. |
| `contextual.card.*` tokens not in token file | HIGH | Same issue — raw fallback values used. |
| `contextual.toolbar.*` tokens not in token file | MEDIUM | Same issue. |
| Mobile ScreenTemplate padding | LOW | Reduced to `px:16 pt:8` on mobile — no explicit Figma spec. Current values are reasonable defaults. |

---

## Changelog

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-06-05 | Jo Lopez + Claude | Initial draft. NavShell spec + HTML demo. Figma ScreenTemplate node 40006538-43236 read. TopNav + SideNav reuse existing components. ScreenTemplate sub-components inline pending standalone pipeline runs. |
