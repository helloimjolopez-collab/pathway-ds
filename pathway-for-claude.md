# Pathway Design System — Prototyping Guide for Claude

**Read this file fully before writing any code or design.** This is the complete reference.

```
Repo:       https://github.com/helloimjolopez-collab/pathway-ds
Storybook:  https://helloimjolopez-collab.github.io/pathway-ds/storybook/
Figma:      https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/
npm:        @helloimjolopez-pathway/pathway-tokens
Tokens CSS: https://raw.githubusercontent.com/helloimjolopez-collab/pathway-ds/main/src/tokens/tokens.css
```

---

## ⛔ STOP — paste this `<head>` block FIRST, before any component

Pathway icons are a **ligature web font** (Material Symbols Rounded), not SVGs.
Every icon in every component is `<span class="material-symbols-rounded">name</span>`.
**If you do not load the font, those spans render as literal text** (you'll see the
word `search` instead of a magnifying glass) — and you must **never** substitute your
own SVG paths or emoji to "fix" it. The only correct fix is loading the font below.

```html
<head>
  <!-- 1. Pathway design tokens (every color/size/space variable) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/tokens.css" />

  <!-- 2. Material Symbols Rounded — REQUIRED or all icons become plain text -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

  <!-- 3. Red Hat type family -->
  <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600;700&family=Red+Hat+Display:wght@600&display=swap" rel="stylesheet" />

  <style>
    /* Base icon class — every icon span needs this class */
    .material-symbols-rounded {
      font-variation-settings: 'wght' 400, 'GRAD' 0, 'opsz' 20;
      /* FILL is per-component: SideNav items + search = 'FILL' 1; TopNav controls = 'FILL' 0.
         Set it per-icon, e.g. style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" */
    }
  </style>
</head>
```

**Icon rules (non-negotiable):**
- Use `material-symbols-rounded` — never `-outlined`, never `-sharp`.
- Icon name = the Material Symbols ligature (e.g. `search`, `filter_alt`, `expand_more`). Browse names at https://fonts.google.com/icons (set Style = Rounded).
- **Never** replace an icon with a custom SVG, inline path, line drawing, or text label. If a glyph looks wrong, the font isn't loaded — fix the `<link>`, don't draw your own.
- Branded assets (org logo, the Amplify Home icon) are the *only* exception — those use `<img>`/inline SVG.

---

## How to load Pathway tokens in any prototype

```html
<!-- In any HTML file: -->
<link rel="stylesheet" href="https://raw.githubusercontent.com/helloimjolopez-collab/pathway-ds/main/src/tokens/tokens.css" />

<!-- Or use jsDelivr CDN (faster, cached): -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/tokens.css" />
```

Once loaded, every CSS variable below is available. Always use CSS variables — never hardcode hex values.

---

## The application shell (start every prototype with this)

Every Amplify screen uses this three-zone layout:

```
┌─────────────────────────────────────────────── TopNav (56px, fixed) ─┐
├───────────────┬──────────────────────────────────────────────────────┤
│ SideNav       │  Content area (scrollable)                           │
│ 240px expanded│  padding: 36px sides, 12px top, 56px bottom          │
│  72px rail    │                                                       │
└───────────────┴──────────────────────────────────────────────────────┘
```

### TopNav
- Background: `var(--semantic-color-light-mode-fill-static-brand-base)` = `#2d4889`
- Height: **56px fixed**
- Left side: ModuleSwitcher + OrgSwitcher (8px gap between them)
- Right side: TopNavSearch + action buttons + profile avatar (8px gaps)
- ALL text and icons on TopNav: `#fbfbfb`
- ALL controls hover state: `rgba(10,18,35,0.16)` — no exceptions

### SideNav
- Width: 240px expanded / 72px collapsed rail
- Background: `var(--semantic-color-light-mode-surface-nav-light)` = `#fafafa`
- Right border: `0.5px solid var(--semantic-color-light-mode-stroke-static-neutral-light)` = `#f6f6f6`
- Collapse button: **at the top** (in the NavHeader), never at the bottom
- Nav item height: 44px
- Nav item gap: 6px
- Active item: `#eef2fb` background + `#1b2d57` text + 4px `#2d4889` stripe at left edge

### Content area
- Background: `var(--semantic-color-light-mode-surface-canvas-light)` = `#fafafa`
- Padding: `36px` horizontal, `12px` top, `56px` bottom
- Tabs (if present): 46px tall, border-bottom `#f6f6f6`

### Responsive breakpoints
| Viewport | SideNav | TopNav |
|---|---|---|
| ≥1024px desktop | 240px push (user can collapse to 72px) | Full labels, 2 bells |
| 768–1023px tablet | 72px rail always | Icon only, more_vert |
| <768px mobile | Hidden, hamburger reveals 240px overlay | Hamburger, abbreviated labels |

---

## Colour tokens

Load `tokens.css` and use these CSS variables. The hex values are shown for reference — always use the variable, never the hex directly.

### Backgrounds and surfaces
```css
--semantic-color-light-mode-fill-static-brand-base    /* #2d4889  — TopNav background */
--semantic-color-light-mode-surface-canvas-light      /* #fafafa  — Page background */
--semantic-color-light-mode-surface-nav-light         /* #fafafa  — SideNav background */
--semantic-color-light-mode-fill-static-neutral-light /* #ffffff  — Cards, inputs, white surfaces */
```

### Text
```css
--semantic-color-light-mode-text-static-primary-base    /* #202020  — Page headings, card titles */
--semantic-color-light-mode-text-static-secondary-base  /* #484848  — Body text, subtitles */
--semantic-color-light-mode-text-static-secondary-subtle /* #606060 — Captions, placeholders, card body */
--semantic-color-light-mode-text-action-primary-base    /* #345499  — Active links, active tab text */
--semantic-color-light-mode-text-contextual-navitem-active /* #1b2d57 — Active SideNav item label */
```

### Interactive / brand
```css
--semantic-color-light-mode-fill-action-primary-base    /* #4b6ec3  — Primary button fill, active indicators */
--semantic-color-light-mode-fill-action-primary-hover   /* #5475c6  — Primary button hover */
--semantic-color-light-mode-fill-action-tertiary-base   /* #eef2fb  — Active filter chip bg, active nav item bg */
--semantic-color-light-mode-fill-contextual-navitem-active /* rgba(160,181,230,0.16) — Active nav item fill */
```

### Borders and strokes
```css
--semantic-color-light-mode-stroke-static-neutral-light         /* #f6f6f6 — Dividers, SideNav border */
--semantic-color-light-mode-stroke-action-secondary-inverse-base /* #d2d2d2 — Card border (0.5px), input border */
--semantic-color-light-mode-stroke-action-primary-hover         /* #86a0dd — Input/search hover border */
--semantic-color-light-mode-stroke-action-primary-pressed       /* #6e8bd4 — Input/search focused border */
```

### Icons in SideNav
```css
--semantic-color-light-mode-icon-contextual-navitem-base   /* #484848  — Resting nav icon */
--semantic-color-light-mode-icon-contextual-navitem-active /* #2d4889  — Active nav icon */
```

### Semantic accent (icon containers, badges)
```css
--semantic-color-light-mode-fill-static-accent-amethyst-light  /* #f4f2fa — Purple icon container bg */
--semantic-color-light-mode-text-static-accent-amethyst-contrast /* #221e3f — Text on amethyst bg */
--semantic-color-light-mode-fill-static-positive-light          /* #f0faf1 — Green icon container bg */
--semantic-color-light-mode-fill-static-info-light              /* #eef2fb — Blue icon container bg */
--semantic-color-light-mode-fill-static-warning-light           /* #fff8e1 — Warm icon container bg */
```

### Profile avatar
```css
--semantic-color-light-mode-fill-static-accent-amethyst-base   /* #dcd9ef — Avatar background */
--semantic-color-light-mode-text-static-accent-amethyst-contrast /* #221e3f — Avatar initials */
```

---

## Typography

**Fonts:** Red Hat Text (all UI) · Red Hat Display (H1–H3 headings only)

```html
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600;700&family=Red+Hat+Display:wght@600&display=swap" rel="stylesheet" />
```

| Use | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| Page heading (H1) | 24px | 600 | 30px | 0.1px |
| Page subtitle | 16px | 400 | 22px | 0.1px |
| Body / general text | 16px | 400 | 22px | 0.1px |
| Card title | 16px | 600 | 22px | 0.1px |
| Nav item label | 14px | 400/500 | 20px | 0.3px |
| Button label (M) | 16px | 500 | 22px | 0.1px |
| Button label (S) | 14px | 500 | 20px | 0.3px |
| Small / card body | 14px | 400 | 20px | 0.3px |
| Section heading | 14px | 600 | 22px | 0.6px uppercase |
| Badge / caption | 11px | 500 | 16px | 0.3px |

---

## Icons

**Library: Material Symbols Rounded only. Never Outlined or Sharp.**

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
```

```html
<span class="material-symbols-rounded">icon_name</span>
```

**FILL setting — changes whether icons are solid or outlined:**
- SideNav nav items: `FILL=1` (solid/filled) — always
- TopNav controls: `FILL=0` (outlined) — always
- Search bar icons: `FILL=1`
- Content area icons in containers: `FILL=1`
- Button icons: `FILL=0`

**CSS to set FILL:**
```css
.material-symbols-rounded {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}
```

**Icon name = the Figma layer name.** Use the exact string shown at fonts.google.com/icons (filter to Rounded style).

**Custom branded icons (NOT Material Symbols — use exactly as given):**
- Amplify Home: custom house SVG — copy from `components/top-nav/top-nav.jsx` `HOME_ICON_PATH`
- SideNav collapse arrows: copy from `components/sidenav/sidenav.jsx`

---

## Components — what exists and how to use it

### TopNav.Global
**Import:** `import { TopNav, DEFAULT_MODULES } from './components/top-nav/top-nav.jsx'`

```jsx
<TopNav
  modules={DEFAULT_MODULES}           // array of {id, label, icon}
  activeModuleId="home"
  org={{ id:"x", name:"Grace Community Church", campus:"Knoxville", initials:"GC" }}
  user={{ name:"Jo Lopez", initials:"JL", email:"jo@example.org" }}
  breakpoint="desktop"                // "desktop" | "tablet" | "mobile"
  onSideNavToggle={() => {}}
/>
```

TopNav manages its own internal state (open panels, search expand/collapse).

---

### SideNav
**Import:** `import { SideNav } from './components/sidenav/sidenav.jsx'`

The SideNav in the repo has its own hardcoded demo items. For a prototype with custom nav items, build the SideNav inline using these exact CSS classes and token values:

```html
<nav style="
  width: 240px; /* or 72px collapsed */
  background: var(--semantic-color-light-mode-surface-nav-light);
  border-right: 0.5px solid var(--semantic-color-light-mode-stroke-static-neutral-light);
  display: flex; flex-direction: column;
  transition: width 380ms cubic-bezier(0.32,0.72,0,1);
">
  <!-- Nav items -->
  <button style="
    display: flex; align-items: center; gap: 12px;
    min-height: 44px; padding: 0 16px; width: 100%;
    background: transparent; border: none; cursor: pointer;
    font-size: 14px; font-weight: 400; letter-spacing: 0.3px;
    color: var(--semantic-color-light-mode-text-static-secondary-base);
    position: relative;
  ">
    <!-- Active state: add background #eef2fb, text #1b2d57, 4px stripe -->
    <span class="material-symbols-rounded"
      style="font-variation-settings: 'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20; font-size: 20px;">
      home
    </span>
    Item Label
  </button>
</nav>
```

---

### Button
**Import:** `import { Button } from './components/button/button.jsx'`

```jsx
<Button style="Fill"   type="Primary"   size="M">Save</Button>
<Button style="Outlined" type="Secondary" size="M">Cancel</Button>
<Button style="Naked"  type="Primary"   size="M">View all</Button>
<Button style="Fill"   type="Negative"  size="M">Delete</Button>
```

**Styles:** Fill / Outlined / Naked
**Types:** Primary (brand blue) / Secondary (neutral) / Tertiary / Negative (red)
**Sizes:** L (18px) / M (16px, default) / S (14px)

Touch target: 48×48px minimum always.

---

### OrgSwitcher
**Import:** `import { OrgSwitcher } from './components/org-switcher/org-switcher.jsx'`

```jsx
<OrgSwitcher
  orgName="Grace Community Church"
  orgType="protestant"              // "protestant" | "catholic"
  cityName=""                       // Catholic orgs only — show "| Knoxville"
  open={false}
  onClick={() => {}}
  mobile={false}
/>
```

Default: org name + chevron only. No logo or avatar.

---

### SearchInput / TopNavSearch
**Import:** `import { SearchInput, TopNavSearch } from './components/search/search.jsx'`

```jsx
// Standalone search bar (toolbars, drawers, modals)
<SearchInput
  value={value}
  onChange={setValue}
  onClear={() => setValue("")}
  onSearch={(v) => console.log(v)}
  placeholder="Search..."
  showFilter={false}               // shows filter funnel button
  filterActive={false}
  filterBadge={false}
  disabled={false}
  error={false}
/>

// TopNav-specific expanding search
<TopNavSearch
  expanded={expanded}
  onExpandChange={setExpanded}
  searchProps={{ value, onChange, onClear, onSearch }}
/>
```

---

### Checkbox
**Import:** `import { Checkbox } from './components/checkbox/checkbox.jsx'`

---

### Spinner
**Import:** `import { Spinner } from './components/spinner/spinner-spec.md'`

Actually: Spinner is SVG-based, copy from `components/spinner/spinner.html`.

---

## Page content layout (ScreenTemplate)

Not yet a standalone component — build inline:

```html
<div style="padding: 12px 36px 56px; min-height: 100%;
            background: var(--semantic-color-light-mode-surface-canvas-light);">

  <!-- 1. Tabs (optional, 46px) -->
  <div style="display: flex; border-bottom: 1px solid #f6f6f6;">
    <button style="padding: 14px 16px; font-size:14px; font-weight:600;
                   color: #345499; border:none; background:transparent;
                   border-bottom: 2px solid #4b6ec3; cursor:pointer;">
      Tab One
    </button>
    <button style="padding:14px 16px; font-size:14px; color:#606060;
                   border:none; background:transparent; cursor:pointer;">
      Tab Two
    </button>
  </div>

  <!-- 2. PageHeading (84px) -->
  <div style="display:flex; align-items:flex-start; justify-content:space-between;
              padding: 8px 0 16px;">
    <div>
      <h1 style="font-size:24px; font-weight:600; line-height:30px;
                 color: var(--semantic-color-light-mode-text-static-primary-base);">
        Page Title
      </h1>
      <p style="margin-top:8px; font-size:16px; line-height:22px;
                color: var(--semantic-color-light-mode-text-static-secondary-base);">
        Page subtitle text
      </p>
    </div>
    <!-- Trailing actions: Outlined + Filled buttons -->
  </div>

  <!-- 3. ToolBar (64px) -->
  <div style="padding: 8px 0; display:flex; align-items:center; gap:24px;">
    <!-- SearchBar: 400px wide, border-radius 6px (NOT 8px), border 0.75px #d2d2d2 -->
    <div style="display:flex; align-items:center; gap:8px; width:400px; height:36px;
                padding:0 8px; border:0.75px solid #d2d2d2; border-radius:6px;
                background:#ffffff;">
      <span class="material-symbols-rounded"
            style="font-size:16px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20;
                   color:#6b6b6b;">search</span>
      <input placeholder="Search..." style="flex:1; border:none; outline:none;
             font-family:'Red Hat Text',sans-serif; font-size:16px; background:transparent;" />
    </div>
    <!-- FilterChips: 60px each, 8px gap, 48px touch target -->
    <div style="display:flex; gap:8px;">
      <button style="min-height:48px; padding:6px 0; background:transparent; border:none; cursor:pointer;">
        <span style="padding:4px 8px; border-radius:4px; font-size:12px; font-weight:500;
                     color:#292724;">All</span>
      </button>
      <!-- Active chip: background #eef2fb, color #345499, weight 600 -->
    </div>
  </div>

  <!-- 4. Sections -->
  <div style="margin-top:16px;">
    <!-- SectionHeading -->
    <div style="font-size:14px; font-weight:600; letter-spacing:0.6px;
                text-transform:uppercase; color:#606060; padding:6px 0; margin-bottom:8px;">
      SECTION NAME
    </div>
    <!-- Card grid: 4 columns × 275px, 8px gap at 1440px desktop -->
    <div style="display:grid; grid-template-columns:repeat(4,275px); gap:8px;">
      <!-- Card -->
      <div style="background:#ffffff; border:0.5px solid #d2d2d2; border-radius:8px;
                  padding:16px; display:flex; flex-direction:column; gap:12px;">
        <!-- Icon container (32×32, radius 8px) + Title (16px/600) -->
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:32px; height:32px; border-radius:8px; background:#f4f2fa;
                      display:flex; align-items:center; justify-content:center;">
            <span class="material-symbols-rounded"
                  style="font-size:16px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20;
                         color:#6a5acd;">receipt_long</span>
          </div>
          <span style="font-size:16px; font-weight:600; color:#202020;">Card Title</span>
        </div>
        <!-- Optional badge -->
        <span style="display:inline-flex; padding:1px 6px; border-radius:12px;
                     background:#f4f2fa; color:#221e3f; font-size:11px; font-weight:500;">
          Badge label
        </span>
        <!-- Body text -->
        <p style="font-size:14px; line-height:20px; color:#606060; margin:0;">
          Card body description text goes here.
        </p>
      </div>
    </div>
  </div>

</div>
```

---

## Border radius reference

| Value | Use |
|---|---|
| `4px` | FilterChip label container, badges, small elements |
| `8px` | Cards, buttons, nav items, icon containers, dropdowns |
| `9999px` | Search bar pill, avatar circles, tag-style chips |

---

## Spacing reference (use these values, not arbitrary ones)

| px | Use |
|---|---|
| 4px | Tight internal padding (icon pills, badge padding) |
| 6px | Nav item offset, small control gaps |
| 8px | Standard gap between controls, card icon-to-title gap |
| 12px | Card internal gap between elements |
| 16px | Card padding, standard section padding |
| 24px | Gap between page sections |
| 36px | Page horizontal padding |

---

## What NOT to do (causes wrong output every time)

1. **Do not hardcode hex values** — use CSS variables. `#2d4889` → `var(--semantic-color-light-mode-fill-static-brand-base)`.
2. **Do not use Material Icons or Material Symbols Outlined** — always Rounded. Never `material-icons` class.
3. **Do not put the SideNav collapse button at the bottom** — it is at the top, in the NavHeader.
4. **Do not invent new colours** — every colour you need is in the token list above.
5. **Do not use `border-radius: 8px` on the toolbar search input** — it is `6px` (confirmed from Figma).
6. **Do not use `rgba(160,181,230,0.16)` as the hover background for TopNav controls** — the hover is `rgba(10,18,35,0.16)`.
7. **Do not show a logo or avatar in the OrgSwitcher by default** — it shows org name + chevron only.
8. **Do not import from HTML demo files** — import from `.jsx` modules only.
9. **Do not use `type="search"` on search inputs** — use `type="text" role="searchbox"` (avoids browser native clear button).
10. **Do not rebuild what already exists** — check the component list above first.
