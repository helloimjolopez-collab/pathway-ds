# Pathway Design System — Design Kit Briefing

**Product:** Ministry Brands Amplify — church management platform
**Design system:** Pathway
**Figma file:** https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/
**Storybook (live components):** https://helloimjolopez-collab.github.io/pathway-ds/storybook/
**npm package:** `@helloimjolopez-pathway/pathway-tokens`

Use this document as the reference for building any Amplify screen. Every colour, size, component, and interaction described here is already designed and coded in the system — do not invent alternatives.

---

## Brand personality

Pathway is a professional, accessible, and calm design system for ministry and church management. It is NOT consumer-facing social media. It handles sensitive financial, people, and communications data. The visual language is clean and structured — clear hierarchy, generous whitespace, restrained use of colour, high readability. Every screen should feel trustworthy and focused.

---

## Colour system

### Brand surface (TopNav only)
| Role | Hex | Use |
|---|---|---|
| Nav bar background | `#2d4889` | The brand-blue bar. Only appears in TopNav. Never use elsewhere. |
| Text / icons on nav | `#fbfbfb` | All labels and icons on the brand-blue surface |
| Controls resting fill | `rgba(160,181,230,0.04)` | OrgSwitcher, ModuleSwitcher resting background |
| Controls border | `rgba(160,181,230,0.16)` | OrgSwitcher border on dark surface |
| Controls hover | `rgba(10,18,35,0.16)` | ALL interactive controls hover state on dark surface |
| Controls pressed | `rgba(255,255,255,0.08)` | Pressed/open state |

### Application surfaces (everywhere else)
| Role | Hex | Use |
|---|---|---|
| Canvas / page background | `#fafafa` | The main page background |
| SideNav background | `#fafafa` | Same as canvas — nav blends into page |
| Card background | `#ffffff` | Cards sit above the canvas |
| White | `#ffffff` | Search bars, input fields, modals |

### Text
| Role | Hex | Use |
|---|---|---|
| Primary text | `#202020` | Page headings, card titles, body text you want to read first |
| Secondary text | `#484848` | Page subtitles, descriptions, secondary labels |
| Tertiary / subtle | `#606060` | Section headings (uppercase), placeholder text, card body |
| Disabled | `#979797` | Non-interactive text |

### Interactive / brand
| Role | Hex | Use |
|---|---|---|
| Primary action fill | `#4b6ec3` | Primary buttons, active tab indicator, active nav indicator |
| Primary action hover | `#6e8bd4` | Primary button hover |
| Active / selected fill | `#eef2fb` | Active nav item background, active filter chip, active tab area |
| Active / selected text | `#3555a0` | Active nav item label, active filter chip text |

### Borders and strokes
| Role | Hex | Use |
|---|---|---|
| Card border | `#d2d2d2` | 0.5px border on cards, toolbar search |
| Page divider | `#f6f6f6` | SideNav right border, section separators, tab underlines |
| Input hover / focus | `#86a0dd` | Search bar and input borders on hover |
| Input active / focused | `#6e8bd4` | Input border when focused |

### Semantic accent colours (for icon containers and badges)
| Role | Hex | Use |
|---|---|---|
| Accent / amethyst light | `#f4f2fa` | Purple-tinted icon bg (people, identity) |
| Positive / green light | `#f0faf1` | Green-tinted icon bg (success, completed, paid) |
| Info / blue light | `#eef2fb` | Blue-tinted icon bg (information, system) |
| Warning / orange light | `#fff8e1` | Warm-tinted icon bg (warnings, due soon) |
| Destructive | `#c0392b` | Destructive actions (sign out, delete) — text only |

### Profile avatar
| Role | Hex | Use |
|---|---|---|
| Avatar background | `#dcd9ef` | Amethyst tint for user initials avatar |
| Avatar text | `#221e3f` | Initials text on avatar |

---

## Typography

**Font families:** Red Hat Text (UI, body, labels) · Red Hat Display (headings H1–H3 only)
**Both loaded from Google Fonts CDN.** 

> **For Claude Design or any design tool that needs font files:** download and upload these two font families:
> - Red Hat Text: https://fonts.google.com/specimen/Red+Hat+Text (click Download family)
> - Red Hat Display: https://fonts.google.com/specimen/Red+Hat+Display (click Download family)
> 
> Both are SIL Open Font License — free for all use.

### Type scale

| Name | Size | Weight | Line height | Letter spacing | Use |
|---|---|---|---|---|---|
| Page heading | 24px | 600 | 30px | 0.1px | H1 on every page |
| Page subtitle | 16px | 400 | 22px | 0.1px | Subtitle under page heading |
| Body base | 16px | 400 | 22px | 0.1px | General body text |
| Body base semibold | 16px | 600 | 22px | 0.1px | Card titles, emphasis |
| Body small | 14px | 400 | 20px | 0.3px | Card body, secondary descriptions |
| Body small semibold | 14px | 600 | 20px | 0.3px | Nav item labels, filter chip text (active) |
| Label button M | 16px | 500 | 22px | 0.1px | Button labels (medium size) |
| Label button S | 14px | 500 | 20px | 0.3px | Small button labels, OrgSwitcher label, module label |
| Label input | 14px | 400 | 20px | 0.3px | Search and input placeholder + value |
| Section heading | 14px | 600 | 22px | 0.6px | Uppercase section labels |
| Badge | 11px | 500 | 16px | 0.3px | Badge labels, avatar initials (mobile) |
| Supporting small | 11px | 600 | 16px | 0.3px | Profile avatar initials (mobile) |

---

## Spacing scale

Core values used throughout the system (in px):

| Token name | Value | Use |
|---|---|---|
| xxxtight | 2px | Tight internal padding (icon pills, badge padding) |
| xxtight | 4px | Icon pill padding, small gaps |
| xtight | 6px | Nav item horizontal padding offset, small control padding |
| tight | 8px | Standard gaps between controls, search bar padding |
| medium | 12px | SideNav collapsed horizontal padding |
| base | 16px | Card internal padding, page horizontal padding contributions |
| page horizontal | 36px | Main content area left/right padding |
| page top | 12px | Main content area top padding |
| page bottom | 56px | Main content area bottom padding |
| section gap | 24px | Gap between page sections |
| card gap | 12px | Gap between elements inside a card |

---

## Border radius

| Name | Value | Use |
|---|---|---|
| xs | 4px | FilterChip label container, badge, small inputs |
| small / s | 8px | Card border-radius, icon containers (32×32), buttons, nav items, module/org switcher pills |
| medium | 8–12px | SideNav tooltip, dropdowns |
| full | 9999px | Search bar pill, TopNavSearch collapsed button |
| circular | 50% | Profile avatar |

---

## Icons

**Icon library: Material Symbols Rounded — always Rounded, never Outlined or Sharp.**
**Font class: `material-symbols-rounded`**
**Google Fonts CDN:** `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`

**FILL setting — per-component rule:**
- **SideNav nav items: FILL=1** (filled/solid icons always)
- **TopNav controls: FILL=0** (outlined icons on dark surface)
- **Search bar icons: FILL=1** (filled)
- **Button icons: FILL=0** (outlined)
- **Content area icons in containers: FILL=1** (filled)

**Icon size reference:**
- Navigation icons (SideNav, TopNav): 20px
- Button icons: 16–18px
- Card icon containers: 16px icon in 32×32px container
- TopNav hamburger: 22px
- Chevrons, trailing indicators: 16px

**Custom SVG icons (NOT Material Symbols — do not replace):**
- Amplify Home module icon — custom branded house/home SVG (white fill)
- SideNav collapse/expand arrows — custom thin-line SVG (12×12px)

---

## Components

### 1. NavShell — the application frame
Every Amplify page lives inside NavShell. It is not a page — it is the container.

**Structure:**
- TopNav: fixed, 56px tall, full width, brand blue (#2d4889)
- SideNav: fixed left, 240px expanded / 72px collapsed rail
- Content area: everything to the right of SideNav, scrollable

**When to use:** always. Every screen uses NavShell.

**Storybook:** Library/NavShell → Desktop, Tablet, Mobile
**Figma:** The `SideNav.Container` + `ScreenTemplate` + `TopNav.Global` compose this.

---

### 2. TopNav.Global
The fixed horizontal bar at the top of every page. Always brand blue. Never changes between pages.

**What's inside (left to right):**
- ModuleSwitcher: Home icon + module label + chevron. Tap opens module list.
- OrgSwitcher: org name + chevron. Tap opens org panel.
- TopNavSearch: collapsed = pill icon button. Tap = bar expands to 320px.
- Action icons: 2× notification bells (desktop) or more_vert (tablet/mobile)
- Profile avatar: user initials in amethyst circle

**Breakpoints:**
- Desktop (≥1024px): full labels, 2 bells, no hamburger
- Tablet (768–1023px): module icon only, more_vert, no hamburger
- Mobile (<768px): hamburger appears (only way to open SideNav on mobile)

**Visual rules:**
- No hardcoded colours — everything uses dark-mode tokens on the brand surface
- OrgSwitcher shows org name only, no logo by default
- All controls hover: `rgba(10,18,35,0.16)`

**Figma:** TopNav.Global node `40007067-6508`
**Storybook:** Library/TopNav

---

### 3. SideNav
The left navigation panel. Shows the pages within the current module.

**States:**
- Expanded (240px): icon + label visible. Push layout — content shifts right.
- Collapsed rail (72px): icon only. Tooltip on hover. Push layout.
- Hidden: mobile only. Revealed by hamburger as 240px overlay with dark scrim.

**Visual rules:**
- Background: #fafafa (blends with page — no visible contrast from canvas)
- Right border: 1px #f6f6f6 (very subtle)
- Active item: #eef2fb background + #3555a0 text + 4px stripe at left edge
- Icons: Material Symbols Rounded, FILL=1 always, 20px
- Item height: 44px
- Item gap: 6px
- NavHeader (collapse button): at top, not bottom

**Figma:** SideNav.Container node `40003951-2927`
**Storybook:** Library/SideNav

---

### 4. Button
Primary action trigger. Three styles, four semantic types.

**Styles:**
- Fill: solid background — strongest action. Use once per primary action per screen.
- Outlined: border only — secondary actions adjacent to a primary.
- Naked: no border, no background — lowest weight, tertiary actions.

**Types (control colour):**
- Primary (blue, default): `#4b6ec3` fill / `#3555a0` text
- Secondary (neutral): warm neutral
- Negative (destructive): red — delete, revoke, sign out

**Sizes:**
- L: 18px label, 18px icon
- M (default): 16px label, 16px icon
- S: 14px label, 14px icon

**Visual rules:**
- Border-radius: 8px
- Touch target: 48×48px minimum
- Icon: Material Symbols Rounded, FILL=0, 16–18px depending on size
- Font: Label/Button/M or S

**Figma:** PW_Button
**Storybook:** Library/Button

---

### 5. OrgSwitcher
The org context trigger inside TopNav. Shows which organisation the user is operating as.

**Default:** org name + chevron only. No logo or avatar by default.
**With logo:** pass `logoUrl` to show the org logo inside a 24×24 avatar.
**Catholic orgs:** show `orgName | campusName` format.
**Mobile:** abbreviated (e.g. "GCC | KV").

**Figma:** OrgSwitcher node `40006819-14583`
**Storybook:** Library/OrgSwitcher

---

### 6. Search (SearchInput + TopNavSearch)

**SearchInput:** pill-shaped search bar for toolbars, drawers, modals.
- Height: 48px touch target / 36px visual pill
- Border-radius: 9999px (full pill)
- Resting border: 0.75px #f6f6f6
- Hover border: 1px #86a0dd
- Focused / active border: 1px #6e8bd4
- Icons: FILL=1 (filled). `search`, `cancel`, `filter_alt`

**TopNavSearch:** the nav-bar-specific wrapper.
- Collapsed: 48×48 icon button on brand-blue surface
- Expanded: 320px search bar with spring animation
- Tapping the search icon inside the expanded bar collapses it
- Escape also collapses

**Figma:** SearchInput `40006978-23158` / TopNavSearch `40007095-4048`
**Storybook:** Library/Search

---

### 7. Checkbox
Multi-select form control. Three states: unchecked, checked, indeterminate.

**Visual rules:**
- Touch target: 44×44px
- Box size: 18×18px visual (16px at size S)
- Border-radius: 4px
- Checked/indeterminate: brand blue fill
- Error: red border and fill

**Storybook:** Library/Checkbox

---

### 8. Spinner
Indeterminate loading indicator. Rotating 8-spoke sunburst SVG.

**Visual rules:**
- Size: scales with container (vector, never blurry)
- Colour: inherits from parent via `currentColor` or pass a token
- Rotation: 1000ms linear loop
- Reduced motion: static glyph, no rotation

**Storybook:** Library/Spinner

---

## Screen Template (ScreenTemplate)

The content area layout used by most Amplify pages. Not yet a standalone component — compose it inline using these rules.

**Structure (top to bottom):**
1. **Tabs** (optional): `46px tall`, border-bottom `#f6f6f6`. Active tab: `#3555a0` text + 2px indicator.
2. **PageHeading** (84px): H1 (`24px/600`) + subtitle (`16px/400`). Trailing slot: action buttons.
3. **ToolBar** (64px): SearchInput (`400px max, 6px radius`) + FilterChips + trailing slot (empty by default).
4. **Section Container**: one or more sections, each with SectionHeading + card grid.

**Content area padding:** 36px horizontal, 12px top, 56px bottom.
**Gap between sections:** 24px.

**FilterChip:** 12px/500 label, 4px radius, 48px touch target, 60px typical width. Active: `#eef2fb` bg + `#3555a0` text.

**SectionHeading:** 14px/600, uppercase, 0.6px letter-spacing, `#606060`.

**Card:**
- Background: `#ffffff`
- Border: 0.5px `#d2d2d2`
- Border-radius: 8px
- Padding: 16px
- Internal gap: 12px
- Structure: 32×32 icon container + title (`16px/600`) + optional badge + body (`14px/400, #606060`)
- Card grid: 4 columns, 8px gap, 275px per card at 1440px viewport
- Hover: subtle shadow + `#86a0dd` border

**Badge (on card):**
- Background: `#f4f2fa` (amethyst) or semantic variant
- Text: 11px/500, `#221e3f`
- Border-radius: 12px
- Padding: 1px 6px

**Figma ScreenTemplate:** node `40006538-43236`

---

## NavShell layout — pixel reference

For the desktop 1440px viewport (the design target):

```
Total: 1440px
TopNav: full width × 56px (fixed)

SideNav: 240px × (100vh - 56px) (fixed, left)
  NavHeader: 56px (module label + collapse icon)
  NavMenu: scrollable, 6px gaps between items, 44px items
  
Content area: 1196px
  Horizontal padding: 36px each side → 1124px usable
  Tabs: 46px
  PageHeading: 84px (pt 8, pb 16, content 60)
  ToolBar: 64px (py 8, content 48)
  Cards: 4 × 275px = 1100px + 3 × 8px gaps = 1124px (perfect fit)
```

**Card heights:**
- Without badge (Slot.CardSubtitle hidden): 116px
- With badge (Slot.CardSubtitle visible): 148px

---

## Breakpoints

| Breakpoint | Width | SideNav | Key changes |
|---|---|---|---|
| Desktop | ≥1024px | 240px expanded (user-toggleable to 72px) | Full labels, 2 bells |
| Tablet | 768–1023px | 72px rail always | Module label hidden, more_vert |
| Mobile | <768px | Hidden, overlay on tap | Hamburger visible, orgs abbreviated |

---

## Motion

All transitions use these durations and easings. Do not use browser defaults (`ease`, `ease-in-out`).

| Interaction | Duration | Easing |
|---|---|---|
| Hover fills, colour changes | 100–120ms | `ease-out` |
| SideNav width expand/collapse | 380ms | `cubic-bezier(0.32,0.72,0,1)` |
| OrgSwitcher dropdown | 150ms | `ease-out` |
| TopNavSearch expand | 350ms | `cubic-bezier(0.34,1.56,0.64,1)` (spring) |
| Nav item labels fade | 200ms | `ease` |
| Spinner rotation | 1000ms | `linear` loop |

Under `prefers-reduced-motion`: remove all transforms, shorten durations to 0.01ms.

---

## Accessibility non-negotiables

Every interactive element: **48×48px minimum touch target** (WCAG 2.5.5).
Every button and icon button: has `aria-label` if no visible text.
Focus ring: `:focus-visible` only (not on mouse click). 2px solid `#3555a0`, 2px offset.
SideNav: `role="tree"`, nav items: `role="treeitem"`, active: `aria-current="page"`.
TopNavSearch: `aria-expanded` on the collapsed button; Escape collapses.
Colour contrast: text on `#fafafa` minimum 4.5:1. Text on `#2d4889` minimum 3:1.

---

## How to use this system

**To build any Amplify screen:**
1. Start with NavShell (TopNav + SideNav + content area)
2. Module name goes in TopNav ModuleSwitcher
3. Nav items go in SideNav
4. Page content uses ScreenTemplate structure: Tabs → PageHeading → ToolBar → Sections
5. Cards in 4-column grid at desktop, 2-column at tablet, 1-column at mobile
6. Use colours from the Brand/Application/Text/Interactive tables above — never invent new colours
7. Use the type scale exactly — never use off-scale sizes
8. All icons: Material Symbols Rounded (check google.com/icons, set Style=Rounded)

**To verify any component:**
- Visual reference: https://helloimjolopez-collab.github.io/pathway-ds/storybook/
- Design source: https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/
- Token values: https://raw.githubusercontent.com/helloimjolopez-collab/pathway-ds/main/src/tokens/tokens.css
