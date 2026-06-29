# TopNav.Global — Pathway Design System Component Spec

**Status:** `REVIEWED`

Complete implementation reference for the TopNav.Global component. Covers anatomy, design tokens, states, spacing, interaction patterns, org logo rules, and accessibility. Use alongside the [Figma source](#figma-source) for a pixel-accurate build.

## Links

| Artefact | URL |
|---|---|
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-topnav--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/top-nav/top-nav.html |
| GitHub source | https://github.com/helloimjolopez-collab/pathway-ds/tree/main/components/top-nav |

---

## 1. Component Overview

`TopNav.Global` is the fixed horizontal bar that sits at the very top of every page in Ministry Brands Amplify. It is the only navigation element that persists across all modules and all screen sizes. Its three jobs are: (1) tell the user which module they are in (ModuleSwitcher), (2) tell the user which organization and campus they are operating as (OrgSwitcher), and (3) give quick access to search, notifications, and the user profile.

It is **not** page-level or module-level navigation. It does not replace the SideNav. It does not surface destination links below the module level. Any in-module navigation belongs in `SideNav.Local`.

The component ships in three Figma variants corresponding to three viewport widths: **Desktop**, **Tablet**, and **Mobile**. At each breakpoint, sub-components are progressively simplified: labels truncate or hide, the profile menu collapses to an avatar, and the SideNav.Control hamburger appears on mobile.

The component always renders on the brand-blue surface (`fill/static/brand/base`, #2d4889). All interactive controls on it use dark-mode tokens regardless of the application's active color-scheme, because the brand-blue background is always dark.

### Figma source
- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **TopNav.Global component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508)

---

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Nav bar background color | Figma: TopNav.Global component, `fill/static/brand/base` token | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508) |
| TopNav height, padding | Figma: TopNav.Global component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508) |
| ModuleSwitcher labels, icons | Application data layer | §7.1 |
| OrgSwitcher label, logo image | Application data layer (organization profile) | §7.2 |
| Org logo display rules (size, fallback) | This spec | §7.2.1 |
| Org logo abbreviation rules (mobile label) | This spec | §10.2 |
| OrgSwitcher interactive tokens (fill, stroke, hover, pressed) | Figma: TopNav.Global component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508) |
| Search button appearance (collapsed pill, size, border) | This spec | §7.3 |
| Action icon buttons (bell, notification indicator) | Figma: TopNav.Global component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508) |
| Profile avatar size, fill tokens | Figma: TopNav.Global component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6508) |
| Dropdown panel visual design (surface, border, shadow, typography) | This spec | §8 |
| Dropdown animation (duration, easing) | This spec | §14 |
| Keyboard interaction | This spec | §13.3 |
| Breakpoint-specific layout behavior | This spec | §15 |
| Known design gaps and deferred decisions | This spec | §17 |

**Rule:** if a decision isn't in the table above, check §17 (gaps). If it's not there either, it hasn't been specified: add it to the spec before implementing.

---

## 2. Component Anatomy

```
TopNav.Global
├── Slot.RowStart (gap: 8px, flex-shrink: 0)
│   ├── [Mobile only] SideNav.Control (48×48 outer, hamburger icon)
│   ├── ModuleSwitcher.Trigger (48×48 outer touch target)
│   │   └── ModuleSwitcher.Inner (36px h, p-4px, rounded-8px)
│   │       ├── Container.RowStart (gap: 4px)
│   │       │   ├── Container.IconLeading (30×30)
│   │       │   │   └── Icon.Leading (SVG, fills container)
│   │       │   └── [Desktop/Tablet only] Container.Label
│   │       │       └── Label text ("Amplify Home")
│   │       └── Container.RowEnd
│   │           └── Icon.Chevron (16×16, rotates on open)
│   └── OrgSwitcher.Trigger (flex, max-w 316px desktop)
│       └── OrgSwitcher.Inner (36px h, p-4px, rounded-8px, has fill + stroke)
│           ├── Container.RowStart (gap: 4px, h: 20px)
│           │   ├── Container.Avatar (24×24, padded 2px)
│           │   │   └── Avatar.Container (20×20 rendered, rounded-4px, border)
│           │   │       ├── [logo present] img (cropped, position: absolute)
│           │   │       └── [logo absent] Fallback.Initials (text, 7px)
│           │   └── Container.Label
│           │       └── Label text ("Sacred Heart Church-ITD | Knoxville")
│           └── Container.RowEnd
│               └── Icon.Chevron (16×16, rotates on open)
└── Slot.RowEnd (gap: 8px, flex-shrink: 0)
    ├── TopNavSearch.Collapsed (48×48 outer)
    │   └── Search.Pill (32×32, rounded-full, fill + 0.75px border)
    │       └── Icon.Search (SVG, 12px, fill #fbfbfb)
    ├── [Desktop/Tablet] ActionIcon × N (48×48 outer)
    │   └── ActionIcon.Inner (p-8px, rounded-8px)
    │       └── Icon.Bell (SVG, fill #fbfbfb)
    └── Profile.Trigger (48×48 outer, p-2px)
        ├── Profile.Avatar (32×32, rounded-full)
        │   └── Initials text ("JL")
        └── [on open] Profile.Menu (absolute panel)
            ├── Profile.Header (name + email)
            └── Profile.MenuItem × 3 (icon + label)
```

### Dropdown panels

Both dropdowns (ModuleSwitcher and OrgSwitcher) and the Profile menu are positioned panels. They sit in the stacking context of their trigger via `position: absolute`, with `z-index: 300`.

---

## 3. Design Tokens

The TopNav.Global surface is always the brand-blue background. Because this background is dark, all interactive controls on it consume **dark-mode tokens** regardless of the app's active color scheme.

### 3.1 Surface

| Semantic Token | Primitive | Resolved | Usage |
|---|---|---|---|
| `semantic-color.light-mode.fill.static.brand.base` | `primitive-color.brand-500` | `#2d4889` | Nav bar background |

### 3.2 Interactive control fills (OrgSwitcher base state)

| Semantic Token | Primitive | Resolved | Usage |
|---|---|---|---|
| `semantic-color.dark-mode.fill.action.tertiary.base` | `primitive-color.brand-50-4` | `rgba(160,181,230,0.04)` | OrgSwitcher inner base fill |
| `semantic-color.dark-mode.fill.action.primaryinverse.base` | `primitive-color.brand-50-8` | `rgba(160,181,230,0.08)` | Search pill base fill |
| `semantic-color.dark-mode.fill.action.primaryinverse.hover` | `primitive-color.brand-900-16` | `rgba(10,18,35,0.16)` | All controls hover fill |
| `semantic-color.dark-mode.fill.action.primaryinverse.pressed` | `primitive-color.cool-neutral-0-8` | `rgba(255,255,255,0.08)` | All controls pressed fill |

> IMPLEMENTATION RULE: All dark-mode fill tokens
> Every button, pill, and interactive container on TopNav.Global uses dark-mode fill tokens. Never use light-mode fill tokens here regardless of the app's color-scheme setting. The nav surface is always brand-blue and always "dark."

### 3.3 Strokes

| Semantic Token | Primitive | Resolved | Usage |
|---|---|---|---|
| `semantic-color.dark-mode.stroke.action.tertiary.base` | `primitive-color.brand-50-16` | `rgba(160,181,230,0.16)` | OrgSwitcher border base; avatar border |
| `semantic-color.dark-mode.stroke.action.tertiary.hover` | `primitive-color.brand-50-20` | `rgba(160,181,230,0.20)` | OrgSwitcher border hover |
| `semantic-color.dark-mode.stroke.action.tertiary.pressed` | `primitive-color.brand-50-30` | `rgba(160,181,230,0.30)` | OrgSwitcher border pressed/expanded |

The Search pill uses a distinct border: `0.75px solid` at the `icon-action-mono-base` value (`#fbfbfb`), not the tertiary stroke token. This is a Figma-confirmed design decision.

### 3.4 Text and icons (on nav bar)

| Semantic Token | Primitive | Resolved | Usage |
|---|---|---|---|
| `semantic-color.dark-mode.text.action.mono.base` | `primitive-color.cool-neutral-10` | `#fbfbfb` | ModuleSwitcher label, OrgSwitcher label |
| `semantic-color.dark-mode.icon.action.mono.base` | `primitive-color.cool-neutral-10` | `#fbfbfb` | All icon fills on the nav bar |

### 3.5 Profile avatar

| Semantic Token | Primitive | Resolved | Usage |
|---|---|---|---|
| `semantic-color.light-mode.fill.static.accent.amethyst.base` | `primitive-color.amethyst-30` | `#dcd9ef` | Profile avatar background |
| `semantic-color.light-mode.text.static.accent.amethyst.contrast` | `primitive-color.amethyst-150` | `#221e3f` | Profile avatar initials text |

The profile avatar uses light-mode amethyst tokens. This is correct: the avatar is a content element with its own background color, not part of the nav bar's interactive surface.

### 3.6 Geometry

| Value | Usage | Token |
|---|---|---|
| `border-radius: 8px` | OrgSwitcher inner, ModuleSwitcher inner, ActionIcon inner | None — raw value (Figma-defined shape) |
| `border-radius: 9999px` | Search pill | None — raw value (pill shape) |
| `border-radius: 50%` | Profile avatar | None — raw value (circle) |
| `border-radius: 4px` | Org logo avatar (small) | None — raw value |
| `0.75px` | Search pill border width | None — raw value (Figma-specified) |

### 3.7 Typography

All labels on the nav bar use **Red Hat Text** (the Pathway system font).

| Usage | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| ModuleSwitcher label | 14px | 500 | 20px | 0.3px |
| OrgSwitcher label (desktop/tablet) | 14px | 500 | 20px | 0.3px |
| OrgSwitcher label (mobile abbreviated) | 14px | 500 | 20px | 0.3px |
| Profile avatar initials | 14px | 600 | 1 | 0.3px |
| Org logo fallback initials (nav bar) | 7px | 700 | 1 | 0.04em |
| Org logo fallback initials (panel) | 9px | 700 | 1 | 0 |
| Dropdown item label | 13px | 400 | normal | 0 |
| Dropdown item label (active) | 13px | 500 | normal | 0 |
| Profile menu name | 14px | 600 | 20px | 0 |
| Profile menu email | 12px | 400 | 16px | 0 |
| Org panel section header | 11px | 600 | normal | 0.07em |

---

## 4. Layout and Spacing

All spacing values are in pixels (Figma-sourced). Where a semantic spacing token exists in `tokens.css`, it is cited. Unit tokens in the system are unitless numbers (e.g. `--primitive-unit-unit-4: 4`) and require `px` postfix in CSS.

| Value | Used for | Semantic token |
|---|---|---|
| 4px | Nav bar top/bottom padding (`py`) | `primitive-unit-unit-4` (unitless) |
| 16px | Nav bar left/right padding desktop (`px`) | `primitive-unit-unit-16` (unitless) |
| 12px | Nav bar left/right padding tablet | `primitive-unit-unit-12` (unitless) |
| 8px | Nav bar left/right padding mobile | `primitive-unit-unit-8` (unitless) |
| 8px | Gap between nav bar start/end slot children | None — raw value |
| 56px | Nav bar max-height desktop | None — raw value |
| 54px | Nav bar max-height tablet | None — raw value |
| 48px | All outer touch-target wrappers (min-h, min-w) | None — raw value |
| 36px | Inner control height (OrgSwitcher, ModuleSwitcher) | None — raw value |
| 4px | Inner control padding | None — raw value |
| 4px | Gap within OrgSwitcher/ModuleSwitcher RowStart | None — raw value |
| 32px | Profile avatar diameter | None — raw value |
| 32px | Search pill diameter | None — raw value |
| 24px | Org logo avatar wrapper in nav bar | None — raw value |
| 20px | Org logo rendered size in nav bar (inside 2px padding) | None — raw value |
| 32px | Org logo in org panel | None — raw value |
| 16px | Chevron icon container | None — raw value |
| 316px | OrgSwitcher max-width desktop | None — raw value |
| 280px | Org panel dropdown width | None — raw value |
| 243px | Module dropdown width | None — raw value |

---

## 5. Item / Variant Structure

Figma ships three variants (note: "Desktop" is spelled "Destkop" in Figma — a known typo, do not fix in Figma without design sign-off):

### Desktop (≥1024px)
- Full nav bar at 56px height, 16px horizontal padding.
- ModuleSwitcher shows: icon + label + chevron.
- OrgSwitcher shows: avatar + full org name + separator + campus name + chevron. Max-width 316px, text truncates via `text-overflow: ellipsis`.
- Search, 2 × ActionIcon, Profile visible.
- No hamburger.

### Tablet (768px–1023px)
- Nav bar 54px height, 12px horizontal padding.
- ModuleSwitcher: icon only (no label). Chevron remains.
- OrgSwitcher: avatar + truncated label. Max-width tightened.
- Search, ActionIcons, Profile visible.
- No hamburger.

### Mobile (<768px)
- Nav bar height same as desktop (56px).
- SideNav.Control hamburger added to RowStart (leftmost).
- ModuleSwitcher: icon only, no label. Chevron present.
- OrgSwitcher: avatar + abbreviated label using the AP-based abbreviation rule (see §10.2). Chevron present.
- ActionIcons hidden (bell icons do not appear on mobile).
- Profile avatar visible, no profile menu on mobile (deferred — see §17 Gaps).
- Search pill visible.

---

## 6. State Matrix

States apply to the interactive inner controls (ModuleSwitcher.Inner, OrgSwitcher.Inner, Search.Pill, ActionIcon.Inner, Profile.Trigger).

| State | Fill | Stroke | Text/Icon |
|---|---|---|---|
| **Base (ModuleSwitcher)** | transparent | transparent | `dark-mode.text.action.mono.base` (#fbfbfb) |
| **Base (OrgSwitcher)** | `dark-mode.fill.action.tertiary.base` (rgba 160,181,230 / 0.04) | `dark-mode.stroke.action.tertiary.base` (rgba 160,181,230 / 0.16) | `dark-mode.text.action.mono.base` (#fbfbfb) |
| **Base (Search pill)** | `dark-mode.fill.action.primaryinverse.base` (rgba 160,181,230 / 0.08) | `dark-mode.icon.action.mono.base` (#fbfbfb), 0.75px | `dark-mode.icon.action.mono.base` (#fbfbfb) |
| **Base (ActionIcon)** | transparent | none | `dark-mode.icon.action.mono.base` (#fbfbfb) |
| **Hover (all controls)** | `dark-mode.fill.action.primaryinverse.hover` (rgba 10,18,35 / 0.16) | (tertiary hover for org/mod) | unchanged |
| **Pressed / Expanded** | `dark-mode.fill.action.primaryinverse.pressed` (rgba 255,255,255 / 0.08) | (tertiary pressed for org/mod) | unchanged |
| **Focus-visible** | unchanged | 2px solid `rgba(160,181,230,0.7)`, 2px offset | unchanged |

### State logic rules

1. ModuleSwitcher shows expanded state (`aria-expanded="true"`) while its dropdown is open. Chevron rotates 180° (`--motion-duration-4` + `--motion-easing-standard`).
2. OrgSwitcher shows expanded state while its panel is open. Same chevron rotation.
3. Only one dropdown/panel can be open at a time. Opening one closes any other.
4. Pressing Escape closes the active open panel and returns focus to its trigger.
5. Search pill has a collapsed and an expanded state. Clicking the collapsed pill expands it to an inline 320px search input. Pressing Escape collapses it. See §7.3 for the full expanded-state spec.
6. Profile trigger expands the profile menu. Same token rules as other controls.

---

## 7. Sub-components

### 7.1 ModuleSwitcher

The ModuleSwitcher (app switcher) trigger shows the currently active module. In its interactive variant, clicking it opens a dropdown listing all available modules.

**Trigger anatomy:**
- Module icon: **24px** glyph in a 30×30 wrap (custom SVG for Home; Material Symbol for other modules)
- Label text (desktop/tablet only): 14px / 500 / max-w 160px / ellipsis (`label-button-s`)
- Chevron: **12px** `expand_more` glyph in a 16×16 box, rotates 180° on open — **interactive variant only**

#### Properties

| Prop | Type | Default | Figma property | Description |
|---|---|---|---|---|
| `type` | `"interactive" \| "static"` | `"interactive"` | **Type** (static \| interactive) | Whether the module switcher is a control or a static label. Exposed on `TopNav` as `moduleSwitcherType`, forwarded to the ModuleSwitcher. The OrgSwitcher has no such property. |

- **`interactive`** — chevron + hover + pressed + button semantics (`aria-haspopup`, focusable); opens the app-switcher dropdown.
- **`static`** — current-module **label only**: no chevron, no hover, no pressed, not a button.

#### Usage by context

| Context | Config | Why |
|---|---|---|
| **Amplify Dashboard** | `moduleSwitcherType="static"` | The dashboard is the home surface — there is nowhere to switch *to* from it, so the module switcher only indicates the current location and carries no affordance. |
| **All other modules** | `"interactive"` (default) | Switching between modules is the primary navigation job. |

> **IMPLEMENTATION RULE:** `static` is one concept, not merely a hidden chevron. It removes the chevron **and** the hover state **and** the pressed state **and** the button role/focusability together. Never ship a static module switcher that still highlights on hover or is keyboard-focusable as a control.

> **SCOPE:** Applies to the **ModuleSwitcher only**. The OrgSwitcher (§7.2) is always interactive and is unaffected.

**Dropdown (interactive only):**
- Width: 243px
- Items: icon (18×18, 70% opacity base / 100% active) + label (13px/400 base, 13px/500 active)
- Active item background: `#eef2fb` (light brand tint — token gap, see §17)
- Hover item background: `#eef2fb`
- Border-radius: 8px outer panel, 6px per item
- Animation: tnDropIn (see §14)

> **Note:** The full open "App Switcher Dropdown" shown in Figma (15 modules, colored icons, divider, "Explore" control) is a future redesign and is **not yet in the repo/Storybook** — the dropdown documented here is the current shipped list.

### 7.2 OrgSwitcher

The OrgSwitcher shows the currently active organization and campus. On click, it opens a panel listing all orgs the user can switch to.

**Trigger anatomy:**
- Avatar container (24×24 wrap, 2px padding, rendered avatar 20×20)
- Label: `{OrgName} | {CampusName}`, 14px/500, max-w 248px, ellipsis. Pipe character is a literal `|` with surrounding whitespace.
- If no campus: label is `{OrgName}` only (no pipe, no second segment).
- Chevron (16×16, rotates on open)

**Panel:**
- Width: 280px
- Section header: `ORGANISATIONS`, 11px/600/uppercase/letter-spacing 0.07em, color `#b5b5b5`
- Items: logo (32×32) + org name (13px/500) + campus name (11px/400, `#6b6b6b`)
- Active item: `background: #eef2fb`

#### 7.2.1 Org logo display rules

This section defines the authoritative rules for how org logos are displayed throughout TopNav.Global. These rules apply to every context where an org logo appears: the nav bar trigger (small), the org panel item list (medium), and any future placement.

##### Logo sizes

| Context | Outer wrap | Rendered size | Shape |
|---|---|---|---|
| Nav bar trigger (OrgSwitcher.Inner) | 24×24px | 20×20px (inside 2px padding) | `border-radius: 4px` |
| Org panel item | 32×32px | 32×32px | `border-radius: 4px` |

> IMPLEMENTATION RULE: Org logo container shape
> Org logos always use `border-radius: 4px`, never a circle. Church org logos are typically rectangular or square-crop compositions; clipping them to a circle distorts most designs.

##### Logo source

The org logo is a raster image (PNG or JPEG) served from the organization's profile in the data layer. The `<img>` tag receives the URL as its `src`.

The logo scales to fill its container proportionally. This matches the Figma design annotation: **"Logo must always scale to fill frame proportionally."**

Implementation: `object-fit: cover; width: 100%; height: 100%; display: block;` on the `<img>` tag. The container uses `overflow: hidden` and the appropriate `border-radius`.

This applies at all sizes: 20×20 in the nav bar trigger, 32×32 in the org panel.

##### Logo fallback: when an org has no logo

When no logo image is available for an org, the avatar container shows the org's initials instead. This fallback applies to all contexts where an org logo would otherwise appear.

**Fallback initials derivation rules:**

1. Take the first letter of each significant word in the org name.
2. "Significant" words exclude articles (the, a, an), prepositions (of, in, at, for), and conjunctions (and, or, but).
3. Use at most **2 letters**. If the name has one significant word, use its first two letters (e.g. "Crossroads" → `CR`). If it has two or more, take the first letter of the first two significant words.
4. Always uppercase.
5. Examples: `Grace Community Church` → `GC`, `Sacred Heart Church-ITD` → `SH`, `Fellowship Church` → `FC`, `The Bridge` → `TB` (skip "The"), `Church of the Resurrection` → `CO`.

> IMPLEMENTATION RULE: Fallback initials are 2 characters maximum
> The nav bar avatar is 20×20px rendered. At 7px font size, 3-character initials overflow the container. Always derive exactly 2 characters.

**Fallback visual spec:**

| Context | Container | Background | Text size | Text color |
|---|---|---|---|---|
| Nav bar trigger | 20×20, `border-radius: 4px` | `rgba(45,72,137,0.3)` (semi-transparent brand) | 7px / 700 | `dark-mode.text.action.mono.base` (#fbfbfb) |
| Org panel item | 32×32, `border-radius: 4px` | `#2d4889` (brand base) | 9px / 700 | `#ffffff` |

The nav bar fallback uses a semi-transparent brand fill so the underlying nav-bar color bleeds through slightly, keeping the avatar visually integrated. The panel fallback uses solid brand fill because it sits on a white panel surface.

> IMPLEMENTATION RULE: No logo fallback must never be a broken-image icon
> When org logo load fails or no URL is provided, always show the initials fallback. Never show a browser-default broken-image icon or an empty box. Implement via `<img onerror>` + a hidden `.avatar-fallback` element, or by omitting the `<img>` entirely when no URL is available.

##### Logo load failure handling

```html
<!-- Pattern: image + hidden fallback sibling -->
<div class="tn-org__avatar">
  <img
    src="{org.logoUrl}"
    alt="{org.name} logo"
    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
  >
  <span class="tn-org__avatar-fallback" style="display:none">{initials}</span>
</div>
```

When `logoUrl` is `null` or `undefined`, omit the `<img>` entirely and render only `.tn-org__avatar-fallback`.

### 7.3 TopNavSearch

TopNavSearch has two states: **Collapsed** (default) and **Expanded** (triggered by clicking the pill).

#### Collapsed state

A circular pill button sits in the RowEnd slot.

- Outer container: 48×48px (touch target)
- Pill: 32×32px, `border-radius: 9999px`
- Background: `dark-mode.fill.action.primaryinverse.base` (`rgba(160,181,230,0.08)`)
- Border: `0.75px solid #fbfbfb` (the `dark-mode.icon.action.mono.base` resolved value)
- Icon: search SVG, fill #fbfbfb, 16px

#### Expanded state

Clicking the collapsed pill replaces it with an inline search input (320px wide). The expanded pill overlays the right side of the nav bar.

**Focused-empty** (just opened, no text entered):
- Container: white fill (`fill.static.neutral.light`), 1px solid `#6e8bd4` (`stroke.action.primary.pressed`), `border-radius: 9999px`, 36px height, 320px width, `padding: 0 8px`
- Leading icon: search, 24px container, color `#606060` (`text.static.secondary.subtle`)
- Placeholder text: "Search…", 14px/400, color `#606060`
- **No trailing clear button** (none in Figma for this state)

**with-value** (text entered):
- Same container styling as focused-empty
- Input text color: `#202020` (`text.static.secondary.bold`)
- Trailing `cancel` (circled X) icon button: 24px container, color `#606060` — visible only when query is non-empty
- Clicking the clear button clears the input and refocuses — it does **not** collapse the pill

**Collapse:** Pressing Escape collapses back to the pill and clears the query.

### 7.4 ActionIcon buttons

Two bell/notification icon buttons sit in the RowEnd slot (desktop and tablet only; hidden on mobile).

- Outer: 48×48px touch target
- Inner: full outer size with `padding: 8px`, `border-radius: 8px`
- Icon: bell SVG, fill `#fbfbfb`, positioned within the inner padded area
- Hover: `dark-mode.fill.action.primaryinverse.hover`
- Pressed: `dark-mode.fill.action.primaryinverse.pressed`
- Badge / notification indicator: not yet designed — see §17

### 7.5 Profile trigger and menu

- Outer: 48×48px touch target
- Avatar: 32×32px circle, `border-radius: 50%`
- Avatar background: `light-mode.fill.static.accent.amethyst.base` (#dcd9ef)
- Avatar text (initials): `light-mode.text.static.accent.amethyst.contrast` (#221e3f), 14px/600
- Hover: outer 44×44 rounded-full receives `dark-mode.fill.action.primaryinverse.hover`

**Profile menu (panel, desktop/tablet):**
- Position: `absolute`, right-aligned to the profile trigger, `top: 100% + 4px`
- Surface: `#ffffff`
- Border: `1px solid rgba(45,72,137,0.12)`
- Border-radius: 8px
- Shadow: `0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)`
- Header: user's full name (14px/600) + email (12px/400, `#6b6b6b`)
- Items: icon (18×18) + label (13px/400), hover background `#eef2fb`
- Destructive item ("Sign out"): text + icon in red (see §17 for token gap)

---

## 8. Container / Surface

### 8.1 Surface
- Background: `semantic-color.light-mode.fill.static.brand.base` (#2d4889)
- No border
- No shadow on the bar itself (shadow is applied to opened dropdown panels)

### 8.2 Dimensions and Padding

| Viewport | Height | px (top/bottom) | px (left/right) |
|---|---|---|---|
| Desktop (≥1024px) | 56px max-height | 4px | 16px |
| Tablet (768–1023px) | 54px max-height | 4px | 12px |
| Mobile (<768px) | 56px max-height | 4px | 8px |

### 8.3 Position
TopNav.Global is `position: sticky` or `position: fixed` at `top: 0`. The decision between sticky and fixed depends on application-level scroll behavior (see §17).

### 8.4 Z-index
- Nav bar: `z-index: 100`
- Open dropdown panels: `z-index: 300`
- Scrim (when org panel is open on mobile): `z-index: 200`

---

## 9. Interaction and Behaviour

1. **One panel open at a time.** Opening ModuleSwitcher dropdown, OrgSwitcher panel, or Profile menu closes any currently open one. Implemented by tracking an `activePanel` state variable.

2. **Click outside to close.** A document-level `click` listener closes the active panel when the click target is outside the panel and its trigger. The listener is added on panel open and removed on panel close.

3. **Escape to close.** `keydown Escape` on `document` closes the active panel and restores focus to the trigger that opened it.

4. **Scrim on mobile org panel.** When the org panel opens at <768px, a full-screen scrim appears at z-index 200. Clicking the scrim closes the panel. The scrim uses `background: rgba(0,0,0,0.32)`.

5. **Module switch.** Clicking a module item in the ModuleSwitcher dropdown navigates to that module's home route. The active item is visually highlighted and should receive `aria-current="page"`.

6. **Org switch.** Clicking an org item in the OrgSwitcher panel switches the active organization context and reloads the relevant data. The active org item should receive `aria-pressed="true"` or equivalent.

7. **Search.** Clicking the search pill fires a `search:open` event (or equivalent application event). The pill itself has no open/expanded state.

---

## 10. Mobile / Responsive Behaviour

### 10.1 SideNav.Control

On mobile (<768px), a hamburger button appears as the leftmost element in Slot.RowStart. This control opens/closes the SideNav overlay. It inherits the same 48×48 touch target and `dark-mode.fill.action.primaryinverse.hover` hover state as all other nav controls.

### 10.2 Mobile org label abbreviation rules

On mobile, the OrgSwitcher label switches from the full `{OrgName} | {CampusName}` string to an abbreviated form. The abbreviated form uses initialism rules grounded in the Associated Press Stylebook (AP).

#### Display format

| Context | Format | Example |
|---|---|---|
| Desktop / Tablet | `Full Church Name \| Campus Name` | `Sacred Heart Church-ITD \| Knoxville` |
| Mobile (with campus) | `ORG \| CA` | `SHC \| KNX` |
| Mobile (no campus) | `ORG` | `SHC` |

The pipe separator and campus abbreviation are shown only when a campus or sub-org exists.

#### Organization name abbreviation (ORG): the Three-Initial Rule

All org names abbreviate to **exactly three uppercase letters, no periods**.

Words never initialed: articles (the, a, an), prepositions (of, in, at, for), conjunctions (and, or).

**Three or more significant words** — take first letter of first three:

| Full name | Abbr. | Derivation |
|---|---|---|
| Grace Community Church | GCC | Grace + Community + Church |
| Nashville Christian Church | NCC | Nashville + Christian + Church |
| Sacred Heart Church-ITD | SHC | Sacred + Heart + Church |
| Church of the Resurrection | COR | Church + Resurrection (skip "of", "the") |
| Fellowship Community Church | FCC | Fellowship + Community + Church |

**Exactly two significant words** — double the last initial:

| Full name | Abbr. | Derivation |
|---|---|---|
| Grace Church | GCC | Grace (G) + Church (C) → double last → GCC |
| Fellowship Church | FCC | Fellowship (F) + Church (C) → double last → FCC |
| Crossroads Church | CRC | Crossroads (C) + Church (C) → double last → CRC |
| First Baptist | FBB | First (F) + Baptist (B) → double last → FBB |

**One significant word** — repeat the first letter three times:

| Full name | Abbr. | Derivation |
|---|---|---|
| Crossroads | CCC | Three times first letter of "Crossroads" → wait, actually: C + R + O → first three letters |

> IMPLEMENTATION RULE: Single-word org name
> For a single-word org name, use the first three letters of that word, uppercased (e.g. "Crossroads" → `CRO`, "Cornerstone" → `COR`, "Amplify" → `AMP`). Do not repeat letters unless the word itself is two or fewer characters.

**Hyphenated words:** treat as two separate words. `Church-ITD` → `C` + `I`. `Saint-Paul` → `S` + `P`.

**The word "Church":** always initial as `C`. Do not substitute `CH`.

**Numbered churches:** `First Baptist Church` → `FBC`. Numerals (`1st Baptist`) → treat the numeral as a single initial using the first letter of its verbal equivalent: `1st` → `F` (First).

#### Campus abbreviation (CA): the Two-Letter Rule

Campus names abbreviate to **exactly two uppercase letters, no periods**.

USPS two-letter codes are used when the campus name is a U.S. state or city known by a standard two-letter postal abbreviation. Otherwise, take the first two significant letters of the campus name.

| Campus name | Abbr. | Source |
|---|---|---|
| Knoxville | KNX | First 2 significant letters |
| Nashville | NSH | First 2 significant letters |
| West Campus | WC | First significant letter of each word |
| Main Campus | MC | First significant letter of each word |
| Downtown | DT | First + last significant letter |
| East Side | ES | First letter of each word |
| North | NO | First 2 letters of word |
| South | SO | First 2 letters of word |
| Tennessee | TN | USPS state code |
| California | CA | USPS state code |

> IMPLEMENTATION RULE: Campus "Main" or "Main Campus"
> "Main Campus" abbreviates to `MC`, not `MA` or `MP`. Both words contribute one initial each. This is the most common campus name in the MB Amplify customer base.

**Single-word campus names** that are not USPS codes: use the first two letters of the word.

**Two-word campus names**: one initial from each word.

**Directional prefixes** (North, South, East, West): `NO`, `SO`, `EA`, `WE` when standalone; `N`, `S`, `E`, `W` when combined with another word (`North Campus` → `NC`, `West Side` → `WS`).

#### Rendering the mobile label

The mobile abbreviated label is assembled at render time from the org's name and campus fields using the rules above. It is not stored as a separate field. The full name must remain available for tooltip or accessible label purposes.

> IMPLEMENTATION RULE: Mobile abbreviated label accessibility
> The mobile `<button>` that shows the abbreviated label must carry `aria-label` with the full un-abbreviated org and campus name. Screen readers announce the full name; sighted users see the abbreviation.

---

## 11. Iconography

All icons in the nav bar are sourced from Figma as SVG paths. They are inlined as an SVG `<symbol>` sprite to avoid cross-origin or asset-server dependencies in standalone demos.

| Icon | Figma asset UUID | ViewBox | Size in use |
|---|---|---|---|
| Module / Home (Amplify Home) | `62a7f7286d39afbc637588611c31b3c96d39c3c7` | `0 0 44 44` | 30×30 container |
| Chevron / expand_more | `8a8378b55c16ab6e8f4baf311357aa8cb519ee4f` | `0 0 5.575 3.275` | 16×16 container |
| Search (small) | `81490c8093fcf6a4844c1f804c5dab79c36fd827` | `0 0 11.7167 11.7167` | Inside 32×32 pill |
| Bell / notification | `8ae7cd30cf31e7344917660e9ffc163fbf0e20c3` | `0 0 13.3333 16.6667` | Inside 48×48 action |
| Hamburger / menu | Inline SVG (3-line pattern) | `0 0 18 12` | Inside 48×48 |

Icon fill is always `currentColor` where possible, or `#fbfbfb` explicitly where `currentColor` does not resolve to the correct value in the SVG context.

---

## 12. Interaction Patterns

### 12.1 Dropdown animation

All panels (ModuleSwitcher dropdown, OrgSwitcher panel, Profile menu) share a single `tnDropIn` animation:

```css
@keyframes tnDropIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Motion: **`--motion-duration-4` + `--motion-easing-spring`** (300 ms, a whisper of overshoot for the panel-drop). Reduced-motion: omit the translateY; keep the opacity fade.

### 12.2 Chevron rotation

ModuleSwitcher and OrgSwitcher chevrons rotate 180° when their panel is open. Transition: **`transform --motion-duration-4 --motion-easing-standard`** (300 ms — the system chevron rule, see design-system-spec §2.2). Reduced-motion: no rotation; leave chevron at 0°.

### 12.3 Single-open constraint

Implementation pattern:
```js
let activePanel = null; // 'module' | 'org' | 'profile' | null

function openPanel(name) {
  if (activePanel && activePanel !== name) closePanel(activePanel);
  activePanel = name;
  // ... show panel, set aria-expanded="true"
}
function closePanel(name) {
  // ... hide panel, set aria-expanded="false"
  if (activePanel === name) activePanel = null;
}
```

### 12.4 Focus management

When a panel closes via Escape or click-outside, focus returns to the trigger button that opened it. This is required for keyboard accessibility (WCAG 2.4.3).

---

## 13. Accessibility

### 13.0 ARIA pattern

ModuleSwitcher and OrgSwitcher both use the **Disclosure (Show/Hide)** ARIA pattern (WAI-ARIA 1.2). The trigger is a `<button>` with `aria-expanded` and `aria-controls` pointing to the panel's `id`. The panel is not a `role="menu"` — it is a list of navigable options.

The Profile menu uses the **Menu Button** pattern with `role="menu"` on the panel and `role="menuitem"` on each item.

### 13.1 Touch and pointer targets

All interactive controls have a minimum outer touch target of 48×48px (per WCAG 2.5.5 AAA and the Pathway system standard). The inner visual elements may be smaller (36px, 32px) but the touch target is always 48×48.

The OrgSwitcher inner control has a minimum height of 36px but its outer wrapper provides the 48px touch target.

### 13.2 ARIA markup

```html
<!-- ModuleSwitcher -->
<button
  class="tn-mod__inner"
  aria-haspopup="true"
  aria-expanded="false"
  aria-controls="tn-mod-dropdown"
  aria-label="Module: Amplify Home — switch module"
>
  <!-- icon + label + chevron -->
</button>
<div id="tn-mod-dropdown" role="list" aria-label="Available modules" hidden>
  <button class="tn-mod__item" role="listitem" aria-current="page">Amplify Home</button>
  <button class="tn-mod__item" role="listitem">People</button>
  <!-- ... -->
</div>

<!-- OrgSwitcher -->
<button
  class="tn-org__inner"
  aria-haspopup="true"
  aria-expanded="false"
  aria-controls="tn-org-panel"
  aria-label="Organization: Sacred Heart Church-ITD, Knoxville — switch organization"
>
  <!-- avatar + label + chevron -->
</button>
<!-- Mobile abbreviated version: -->
<button
  class="tn-org__inner"
  aria-label="Organization: Sacred Heart Church-ITD, Knoxville — switch organization"
>
  <span aria-hidden="true">SHC | KNX</span>
</button>

<!-- Search -->
<button
  class="tn-search__btn"
  aria-label="Open search"
>
  <!-- search icon -->
</button>

<!-- Profile -->
<button
  class="tn-profile__btn"
  aria-haspopup="menu"
  aria-expanded="false"
  aria-label="Profile: Jo Lopez — open profile menu"
>
  <span aria-hidden="true">JL</span>
</button>
```

> IMPLEMENTATION RULE: OrgSwitcher aria-label must use full name on mobile
> On mobile, the button shows the abbreviated label visually but must carry `aria-label` with the full org and campus name. The abbreviated text should be wrapped in `<span aria-hidden="true">` so screen readers do not announce it.

### 13.3 Keyboard interaction

| Key | Behaviour |
|---|---|
| `Tab` | Moves focus through all interactive controls in DOM order |
| `Enter` / `Space` | Activates the focused trigger (opens/closes panel) |
| `Escape` | Closes the active open panel; returns focus to its trigger |
| `Arrow Down` | When ModuleSwitcher or OrgSwitcher panel is open: moves focus to first item (optional enhancement) |
| `Arrow Up/Down` | Navigates between items within an open panel |
| `Enter` / `Space` on item | Selects the item (module switch or org switch) |

### 13.4 Focus styles

All interactive controls show a `2px solid rgba(160,181,230,0.7)` focus ring with `outline-offset: 2px` on `:focus-visible`. The focus ring is white-adjacent (brand-50 tint at 70%) against the dark nav surface, providing sufficient contrast.

Reduced-motion: focus styles are not animated; no change needed.

### 13.5 Screen reader announcements

| Action | Announcement |
|---|---|
| Focus ModuleSwitcher trigger | "Amplify Home — switch module, collapsed, button" |
| Open ModuleSwitcher | "Expanded" + panel becomes non-hidden |
| Focus OrgSwitcher trigger | "Sacred Heart Church-ITD, Knoxville — switch organization, collapsed, button" |
| Mobile OrgSwitcher focus | Same full name via aria-label |
| Select a module item | Navigation occurs, page title changes |
| Select an org item | Org context changes, page reloads with new org data |
| Open Search | "Open search, button" |
| Open Profile | "Profile: Jo Lopez — open profile menu, collapsed, button" |

### 13.6 Colour contrast

| Combination | Ratio | WCAG |
|---|---|---|
| White text (#fbfbfb) on brand-blue (#2d4889) | ≥ 4.5:1 | AA |
| Profile initials amethyst-150 (#221e3f) on amethyst-30 (#dcd9ef) | ≥ 4.5:1 | AA |
| Org fallback white (#fbfbfb) on rgba(45,72,137,0.3) over brand-blue | ≥ 3:1 | AA Large |
| Dropdown item text (#252525) on white | ≥ 10:1 | AAA |

---

## 14. Motion

All motion resolves through `--motion-*` tokens (design-system-spec §2) — no hardcoded ms/curves. Values below reflect the implementation.

| Property | Token | Reduced-motion |
|---|---|---|
| Panel entrance (`tnDropIn`, opacity + translateY) | `--motion-duration-4` + `--motion-easing-spring` | Fade only (no translateY) |
| Chevron rotation | `--motion-duration-4` + `--motion-easing-standard` | No rotation |
| Control fill/border transitions | `--motion-duration-2` / `-3` + `--motion-easing-standard` | No change (hover feedback is not motion) |

Motion is consistent with `docs/design-system-spec.md` §2. No deviation.

---

## 15. Responsiveness

| Viewport | Breakpoint | Key changes |
|---|---|---|
| Mobile | < 768px | Hamburger shown; ModuleSwitcher label hidden; OrgSwitcher abbreviated label; ActionIcons hidden; padding 8px |
| Tablet | 768–1023px | No hamburger; ModuleSwitcher label hidden; ActionIcons shown; padding 12px |
| Desktop | ≥ 1024px | Full labels; all controls; padding 16px |

These are the Pathway system breakpoints from `docs/design-system-spec.md` §5.2.

---

## 16. What to pass Claude to implement this component

- Nav items array: `[{ id, label, icon: SVG string | component, href }]`
- Active module ID (string matching one of the nav item IDs)
- Current org object: `{ id, name, campusName?, logoUrl? }`
- Orgs list (for the panel): `[{ id, name, campusName?, logoUrl? }]`
- Active org ID
- User profile: `{ displayName, initials, email, avatarUrl? }`
- Event handlers: `onModuleSelect(id)`, `onOrgSelect(id)`, `onSearchOpen()`, `onSideNavToggle()` (mobile only)

---

## 17. Gaps and deferred decisions

| Gap | Priority | Notes |
|---|---|---|
| Active item token in module dropdown and org panel | MEDIUM | Currently uses `#eef2fb` (raw brand-tint). No semantic token found in tokens.css. Needs a `fill.contextual.navitem.active` equivalent or a new token. |
| Destructive item ("Sign out") token | MEDIUM | Currently hardcoded red. Should use a `text.status.danger` or equivalent semantic token once it exists. |
| Profile menu on mobile | MEDIUM | Figma mobile variant shows no profile menu (just the avatar button). What happens when the avatar is tapped on mobile? Not yet designed. |
| Notification badge / dot on bell icon | HIGH | Bell icons exist in the nav but the notification indicator dot/badge is not designed. Required for the notification system. |
| TopNav position: sticky vs fixed | MEDIUM | Not resolved in Figma. Sticky breaks in some scroll contexts. Fixed requires `padding-top` on the page body equal to nav height. Decision deferred to engineering. |
| OrgSwitcher max-width on tablet | LOW | Desktop max-width is 316px. Tablet constraint not specified in Figma. |
| Mobile profile tap | HIGH | Tapping the profile avatar on mobile should do something. Not specified. |
| Tablet OrgSwitcher label truncation point | LOW | No max-width specified for tablet. |

---

## 18. Storybook

Not yet in Storybook. Awaiting spec review and branch creation before pipeline runs.

---

*Spec authored from live Figma MCP data. Node: `40007067:6508`, file: `3sw45aVcngFAmpbP6cfrXP`. Demo reference: `components-sandbox/top-nav/top-nav-2026-05-13-v3.html`.*
