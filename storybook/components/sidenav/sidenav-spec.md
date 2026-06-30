# SideNav: Pathway Design System Component Spec

**Status:** `REVIEWED`
**Reviewed:** 2026-05-12 by Jo Lopez, 11 decisions recorded in this session (2 BLOCK, 4 ASK, 4 NIT + 1 rename)

Complete implementation reference for the SideNav component. Covers anatomy, design tokens, states, spacing, interaction patterns, and accessibility. Use alongside the [Figma source](#figma-source) for a pixel-accurate build.

## Links

| Artefact | URL |
|---|---|
| **Figma — design system master file** | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) |
| **Figma — SideNav component set** | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40004059-1374) |
| **Live HTML demo** | [Open demo](https://helloimjolopez-collab.github.io/pathway-ds/components/sidenav/sidenav.html) |
| **Storybook (deployed)** | [Open Storybook](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-sidenav--docs) |
| **GitHub — component source** | [components/sidenav/](https://github.com/helloimjolopez-collab/pathway-ds/tree/main/components/sidenav) |
| **Nested component — Scrollbar** | The menu's scroll uses the system `<Scrollable>` overlay scrollbar — [spec](../scrollbar/scrollbar-spec.md) · [Storybook](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-scrollbar--docs) |

---

## 1. Component Overview

`SideNav.Local` is a persistent vertical panel used across all modules in Ministry Brands Amplify: a church management product. It renders the primary navigation tree for a given module and communicates the user's current location within that tree at all times.

It is **not** global app navigation or top-level product navigation. Each module has its own SideNav instance. It is also not used for action buttons or CTAs: navigation only.

It supports two levels of depth: Level 0 (parent) and Level 1 (child). Level 1 items are always leaf destinations: they never group or expand further. This is a hard constraint enforced at the data layer, not just a design convention.

The component supports two layout states: **expanded** (240px wide, icons and labels visible) and **collapsed** (72px wide, icons only).

**Composition / nested components:** the menu's overflow scroll is handled by the system **[Scrollbar component](../scrollbar/scrollbar-spec.md) (`<Scrollable>`)** — SideNav nests it rather than implementing its own scrollbar (see §9.1).

### Figma source
- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **SideNav component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40004059-1374)

---

## 1.1 Governance: where things live

Use this table when you need to find or change something. Every row points to the single location that owns that decision.

| To change… | Owner | Where |
|---|---|---|
| SideNav item colours, typography, spacing tokens | Figma: SideNav component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40004059-1374) |
| Primitive or semantic token values (colours, radii, shadows) | Figma: Variables panel | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) |
| Popover visual design (surface, border, shadow, typography) | Figma: PopoverMenu component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40005913-152988) |
| Popover animation (duration, easing, reduced-motion) | Figma: PopoverMenu component page | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40005913-152988) |
| Popover positioning relative to SideNav (8px offset, direction) | This spec | §10.5 |
| Which hover target shows tooltip vs popover | This spec | §10.3 |
| Hover-safe interaction (bridge, close delay) | This spec | §10.4 |
| Collapsed state layout (72px width, icon centering, tooltip tokens) | This spec | §10.1–10.2 |
| Collapsed tooltip visual design | This spec | §10.3 |
| Expand/Collapse control structure and tokens | This spec | §9 |
| Sidebar width transition animation | This spec | §8 |
| Active / hover / trail state colours | This spec | §5–6 |
| ARIA pattern and keyboard behaviour | This spec | §13 |
| Screen reader output | This spec | §13.5 |
| Scroll/overflow structure (pinned header, edge-bleed) | This spec | §9.1 |
| Scrollbar thumb itself (appearance, tokens, motion, a11y) | Scrollbar component | [scrollbar-spec.md](../scrollbar/scrollbar-spec.md) |
| NavSectionLabel anatomy, tokens, collapsed rail → divider behaviour, icon slot, usage rules | This spec | §2.3 |
| SideNavListSection anatomy, tokens, ListItem spec, visibility rules | This spec | §2.4 |
| Grouper accordion expand/collapse animation, multi-open behaviour, DOM strategy | This spec | §12.1 |
| Grouper collapsed-rail behaviour (popover vs accordion) | This spec | §12.2 |
| Trail state transitions when sidebar collapses / section label interaction | This spec | §12.3–12.5 |
| Responsive breakpoints and SideNav behaviour per viewport | This spec | §17 |
| Overlay vs push layout mode | This spec | §17.2 |
| Mobile states (hidden / overlay / collapsed: hidden is mobile-only <768px) | This spec | §17.3 |
| Overlay enter animation (duration, easing, reduced-motion) | This spec | §17.6 |
| Scrim colour, breakpoint rules, and interaction | This spec | §17.7 |
| Known design gaps and deferred decisions | This spec | §16 |
| Motion overrides and duration summary | This spec | §14 |

**Rule:** if a decision isn't in the table above, check §16 (gaps). If it's not there either, it hasn't been specified yet: add it to the spec before implementing.

---

## 2. Component Anatomy

```
SideNav.Container
└── SideNavMenu   (flex column, gap: 6px between direct children — Gap/XTight)
│   │
│   │   ── optional section group ──
│   ├── NavSectionLabel           ← "MUSIC" / "PEOPLE" / etc. — optional, omit if not needed
│   ├── SideNavItem (Level 0: Destination)
│   ├── SideNavItem (Level 0: Grouper, expanded)
│   │   ├── SideNavItem (Level 1: child Destination)
│   │   └── SideNavItem (Level 1: child Destination)
│   │
│   │   ── another section group ──
│   ├── NavSectionLabel           ← next section label — Divider in collapsed rail
│   ├── SideNavItem (Level 0: Destination)
│   │
│   │   ── flat list section (optional) ──
│   └── SideNavListSection
│       ├── NavSectionLabel       ← list section heading ("Recent Content" etc.)
│       └── ListItem (×N)         ← icon-less flat items with bullet dot
│
└── Collapse_Expand_Nav_Container
    ├── Divider
    └── Collapse (SideNavItem-like row, no indicator stripe)
```

> **Key structural rule:** `NavSectionLabel` and `SideNavListSection` are **flat siblings** of `SideNavItem` inside the `SideNavMenu` flex container. They are never wrappers around items. The parent `gap: 6px` (Gap/XTight) applies between direct children.

### SideNavItem internal structure

**Level 0:**
```
[container.indicator 4px] [Container.rowStart px-8]
  [Container.Main]
    [Container.LeadingIcon 24×24] → [Icon.Leading 16×16]
    [text.label px-6]
  [Container.RowEnd 40×24]       ← groupers only
    [Container.RowEnd.Icon 24×24]
      [chevron 10pt]
```

**Level 1 (child):**
```
[container.indicator 4px] [child.container]
  [Container.rowStart px-8]
    [container.main pl-24]
      [text.label]
```
> **Annotation from Figma:** "Children are always a destination and never a grouper: only 2 levels of depth are allowed."

---

## 2.1 Container Variants: Stroked vs Unstroked

The `SideNav.Container` comes in two visual variants that control whether a visible border separates the nav panel from the page content. Both variants are available for the **expanded** (240px) and **collapsed** (72px) layout states, giving four possible combinations in total.

### Default (unstroked)

The nav surface (`#fafafa`) sits flush against the page background with no drawn border between them. This is the default option and should be used when the module's layout already creates sufficient visual separation: for example, when the page canvas uses a distinct background colour, or when a shadow or depth effect is present.

### Stroked

A 0.5px right-hand border (`border-right: 0.5px solid #f6f6f6`) is rendered on the nav container. The stroke colour is `Stroke/Static/Neutral/Light` (`#f6f6f6`): the same token used for the horizontal divider above the collapse control and popover borders.

> **2026-05-12 update:** Token changed from `Fill/Static/Info/Subtle` (`#edf0f9`) to `Stroke/Static/Neutral/Light` (`#f6f6f6`). All three places it's used (container border, divider, popover border) updated together.

Use the stroked variant when modules need an explicit visual boundary: for example, when the page content background is also `#fafafa` (identical to the nav surface) and the two areas would otherwise appear merged.

| Variant | Applies to | Token | Value |
|---|---|---|---|
| **Unstroked** | Expanded + Collapsed | *(no border)* |: |
| **Stroked** | Expanded + Collapsed | `Stroke/Static/Neutral/Light` | `#f6f6f6` |

> **Usage guidance:** Neither variant is "correct": the choice belongs to the individual module team, not the design system. Use the variant that produces the clearest visual hierarchy for that module's specific page backgrounds.

> **Figma:** Both variants (Expanded/Stroked, Expanded/Unstroked, Collapsed/Stroked, Collapsed/Unstroked) are available as separate component instances in the SideNavComponents frame.

---

## 2.3 NavSectionLabel

**Figma:** `SectionLabel` instance inside `SideNavMenu` (Figma node `40006794:5975`, seen in context frame `40006794:5874`). Also called `SideNav.SectionLabel` in the Figma layer tree.

NavSectionLabel is an **optional** in-nav section heading that organises items within a module's SideNav into named groups (e.g. "MUSIC", "PEOPLE", "SERVICES"). Not all modules use sections. Modules with fewer than ~5 items or with a single coherent topic do not need them.

### Anatomy

```
NavSectionLabel
└── Container.Main  (h-40px, pl-4px, pr-4px, py-8px, gap-4px)
    ├── [optional] Container.Icon  ← icon slot, hidden by default (see §2.3.1)
    └── Container.Label  (flex-1)
        └── text  (uppercase, 11px, semibold, #606060)
```

### Tokens

| Property | Semantic token | Resolved value |
|---|---|---|
| Height | *(raw)* | `40px` fixed |
| Left / right padding | `Gap/XTight` | `4px` |
| Top / bottom padding | `Padding/Tight` | `8px` |
| Font family | `Label/Section/Small/Semibold/FontFamily` | `'Red Hat Text', sans-serif` |
| Font weight | `Label/Section/Small/Semibold/FontWeight` | `600` (SemiBold) |
| Font size | `Label/Section/Small/Semibold/FontSize` | `11px` |
| Line height | `Label/Section/Small/Semibold/LineHeight` | `16px` |
| Letter spacing | `Label/Section/Small/Semibold/LetterSpacing` | `0.6px` |
| Text transform | *(design rule)* | `uppercase` |
| Text colour | `Text/Static/Secondary/Subtle` | `#606060` |

### Collapsed rail behaviour

In the 72px collapsed rail, `NavSectionLabel` **is replaced by a thin `Divider` line** — it does not just fade or hide. This is intentional: the collapsed rail has no room for text labels, but sections still need visual separation between groups.

The divider that replaces a section label uses identical tokens to the `NavHeader` divider:

| Property | Value | Token |
|---|---|---|
| Height | `1px` | *(raw)* |
| Colour | `#f6f6f6` | `Stroke/Static/Neutral/Light` |
| Surrounding padding | `2px top / 2px bottom` | *(raw)* |

**First section rule:** If the first `NavSectionLabel` in the list is replaced by a divider in rail mode, no divider is rendered above the very first section (there is nothing above it to separate). Subsequent sections each get a divider between them. This matches Figma node `40006794:6144`.

**Implementation pattern (React):**

Section labels must **not** alter `SideNavItem` rendering in any way. The pattern below keeps `SideNavItem` and its expand-collapse animation untouched, and groups each section in its own flex column so the parent menu's `gap: 6 px` applies only between sections, never between an item and its own expanded children.

```jsx
// Parent: SideNavMenu is a flex column with gap: 6px between sections.
// Each section is ONE child of the parent. Inside the section, items + their
// children stay in their original wrapper divs — IDENTICAL to a sectionless nav.

NAV_SECTIONS.map(({ section, items }, sIdx) => (
  <div key={section} style={{
    display: 'flex', flexDirection: 'column',
    gap: 6,                     // same gap between items as the parent uses between sections
    flexShrink: 0,
  }}>
    {/* Expanded: NavSectionLabel — fades out + collapses height as rail narrows */}
    <div style={{
      opacity: sidebarCollapsed ? 0 : 1,
      maxHeight: sidebarCollapsed ? 0 : 40,
      overflow: 'hidden',
      transition: 'opacity var(--motion-duration-4) var(--motion-easing-standard), max-height var(--motion-duration-5) var(--motion-easing-spring)',
    }}>
      <NavSectionLabel label={section} />
    </div>

    {/* Collapsed rail: Divider replaces the label. Skip for sIdx === 0
        (no divider above the very first section). */}
    {sIdx > 0 && (
      <div style={{
        opacity: sidebarCollapsed ? 1 : 0,
        maxHeight: sidebarCollapsed ? 5 : 0,
        overflow: 'hidden',
        transition: 'opacity var(--motion-duration-4) var(--motion-easing-standard), max-height var(--motion-duration-5) var(--motion-easing-spring)',
        padding: '2px 0',
      }}>
        <div style={{ height: 1, backgroundColor: '#f6f6f6' }} />
      </div>
    )}

    {/* Items: render EXACTLY as a sectionless nav would. SideNavItem and its
        children-grid live in their own wrapper div so the section's flex gap
        applies between distinct items, never between an item and its own
        expanded child list. */}
    {items.map(item => (
      <div key={item.id}>
        <SideNavItem item={item} /* ...props unchanged... */ />
        {item.children && !sidebarCollapsed && (
          <div style={{ display: 'grid', gridTemplateRows: isExpanded ? '1fr' : '0fr',
            transition: 'grid-template-rows var(--motion-duration-5) var(--motion-easing-accordion)' }}>
            <div style={{ overflow: 'hidden' }}>
              {item.children.map(child => <SideNavItem key={child.id} item={child} /* ... */ />)}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
))
```

> **Critical:** Do **NOT** modify `SideNavItem` to add awareness of sections. The component is unchanged from the no-sections layout. Sections are added at the parent menu level only.

### 2.3.1 Optional icon slot

Figma's `SectionLabel` component includes an optional icon slot (`Container.Icon`) to the left of the label text. The icon is **hidden by default** in all current usages. Modules may enable it if their design requires an icon alongside the section heading, but this is not expected to be common. The icon, if used, should follow the same `16px inside 24px wrapper` pattern as `SideNavItem` leading icons.

### Usage rules

- **Optional, not mandatory.** Modules without a need for sections should omit NavSectionLabel entirely and use a flat item list.
- **Never wrap items.** NavSectionLabel is always a sibling of the items it heads, not a parent wrapper.
- **Gap is inherited.** The 6px `gap` of the `SideNavMenu` flex container applies between the section label and the item below it — no extra margin is needed on the label itself.
- **One label per section.** Nested section labels (a label inside a label's group) are not supported and not needed: the SideNav only supports two levels of item depth.
- **Labels collapse to dividers, not nothing.** In the 72px rail, every section boundary (except the topmost) must render a divider. Omitting the divider in rail mode makes sections invisible to the user and loses the visual grouping intent.

---

## 2.4 SideNavListSection

**Figma:** `SideNav.ListSection` (node `40007332:8034`). A labelled group of flat navigation items — no icons, no children, no expand/collapse. Used for context-specific link lists such as "Recent Content", "Pinned Items", or "Bookmarks".

### When to use

Use `SideNavListSection` when a module needs to surface a dynamic, flat list of contextual links (e.g. recently visited records, pinned pages, bookmarked items) as part of the nav. These are **not hierarchical destinations** — they do not fit the `Level 0 / Level 1` item model. They are flat reference links to specific content.

**Do not use** for primary navigation. If the links represent the module's top-level destinations, use `SideNavItem` instead.

### Anatomy

```
SideNavListSection
├── NavSectionLabel  (40px, e.g. "RECENT CONTENT")
└── [list of ListItems, no gap between them]
    └── ListItem
        ├── IndicatorStripe (4px, same structural column as SideNavItem)
        ├── Container.LeadingIcon (24×24)
        │   └── BulletDot (6px filled circle)
        └── text.label
```

### ListItem tokens

| Property | Token | Resolved value |
|---|---|---|
| Min-height | `Accessibility/Touch Target/AA/Size` | `44px` (updated 2026-06-08 from 48) |
| Border radius | `Component/NavItem/Large/Radius/Radius` | `8px` |
| Fill (base) | `Fill/Contextual/NavItem/Base` | `#fafafa` (transparent) |
| Fill (hover) | `Fill/Contextual/NavItem/Hover` | `rgba(17,17,17,0.02)` |
| Fill (active) | `Fill/Contextual/NavItem/Active` | `rgba(160,181,230,0.16)` |
| Text (base) | `Text/Contextual/NavItem/Base` | `#313131` |
| Text (hover) | `Text/Contextual/NavItem/Hover` | `#252525` |
| Text (active) | `Text/Contextual/NavItem/Active` | `#1b2d57` |
| Bullet dot (base) | `Icon/Contextual/NavItem/Base` | `#484848` |
| Bullet dot (hover) | `Icon/Contextual/NavItem/Hover` | `#313131` |
| Bullet dot (active) | `Icon/Contextual/NavItem/Active` | `#2d4889` |
| Font size | `Text/Body/XSmall/Regular` | `12px` |
| Font weight | `Text/Body/XSmall/Regular` | `400` |
| Line height | `Text/Body/XSmall/Regular` | `18px` |
| Letter spacing | `Text/Body/XSmall/Regular` | `0.6px` |

### BulletDot sub-component

The bullet dot sits inside a `24×24` `Container.LeadingIcon` wrapper (same dimensions as the icon wrapper on `SideNavItem`). The dot itself is a `6×6px` filled circle — it does not use a Material Symbol. Its colour follows the same `Base/Hover/Active` token cycle as `SideNavItem` icons.

### Visibility: collapsed rail

`SideNavListSection` is **only shown in the expanded sidebar (240px)**. In the 72px collapsed rail it fades out entirely — it receives `opacity: 0; max-height: 0; overflow: hidden` with the same transition as NavSectionLabel. There is no icon-only equivalent of a list section for the rail.

```jsx
{/* SideNavListSection — only in expanded nav */}
<div style={{
  opacity: sidebarCollapsed ? 0 : 1,
  maxHeight: sidebarCollapsed ? 0 : 400,
  overflow: 'hidden',
  transition: 'opacity var(--motion-duration-4) var(--motion-easing-standard), max-height var(--motion-duration-5) var(--motion-easing-spring)'
}}>
  <SideNavListSection
    label="Recent Content"
    items={LIST_SECTION_ITEMS}
    activeId={activeId}
    onNavigate={onNavigate}
  />
</div>
```

### State matrix

ListItems follow the exact same `Base / Hover / Active` state matrix as `SideNavItem` destinations. The `indicator.stripe` column is always present structurally; it is only painted when the item is active. The Trail state does not apply — list section items are never groupers.

---

## 3. Design Tokens

### 3.1 Surface

| Semantic Token | Primitive | Resolved Value | Usage |
|---|---|---|---|
| `Surface/Nav/Light` |: | `#fafafa` | SideNav container background |
| `Surface/Canvas/Light` | `Brand/10` | `#fafafa` | Page/viewport background |

> **Note:** Both tokens resolve to the same hex (`#fafafa`). They are semantically distinct: `Surface/Nav/Light` is the nav panel's own background; `Surface/Canvas/Light` is the page/app canvas behind it. Do not merge them. Confirmed in Figma variable library: `Surface/Canvas/Light → Brand/10 → #fafafa`.

### 3.2 Fill (NavItem states)

| Semantic Token | Primitive | Resolved Value | Used In |
|---|---|---|---|
| `Fill/Contextual/NavItem/Base` |: | `#fafafa` | Resting item fill |
| `Fill/Contextual/NavItem/Hover` |: | `#11111105` *(≈ rgba 17,17,17 / 2%)* | Hover fill |
| `Fill/Contextual/NavItem/Active` |: | `#a0b5e629` *(≈ rgba 160,181,230 / 16%)* | Active destination + collapsed-trail grouper |
| `Fill/Contextual/NavItem/Trail` |: | `#11111105` *(≈ rgba 17,17,17 / 2%)* | Expanded grouper fill: **distinct token from Hover** |
| `Stroke/Static/Neutral/Light` |: | `#f6f6f6` | Divider (`h-[1px]`) + nav container `border-right` + popover border |

> **2026-05-12 update:** Previously `Fill/Static/Info/Subtle` (`#edf0f9`). Now `Stroke/Static/Neutral/Light` (`#f6f6f6`) — lighter, less saturated. All three uses updated together.

> **Note:** `Fill/Contextual/NavItem/Trail` and `Fill/Contextual/NavItem/Hover` currently resolve to the **same hex** (`#11111105` ≈ 4% black). They are kept as separate tokens so they can diverge independently in future. Do not merge them.

> **⚠ Gap:** Primitive token names are not surfaced by `get_variable_defs`: the tool resolves alias chains to final hex only. The full `Semantic → Primitive → Hex` chain requires the Figma REST API or a dedicated token documentation frame.

### 3.3 Text (NavItem states)

| Semantic Token | Primitive | Resolved Value | Used In |
|---|---|---|---|
| `Text/Contextual/NavItem/Base` |: | `#313131` | Label default |
| `Text/Contextual/NavItem/Hover` |: | `#252525` | Label hover |
| `Text/Contextual/NavItem/Active` |: | `#1b2d57` | Active destination **and** all trail states |

> Trail text color = `Text/Contextual/NavItem/Active`. This applies to both **expanded** trail (grouper showing children) and **collapsed** trail (grouper with hidden active child). Do not use `Text/Contextual/NavItem/Base` for trail.

### 3.4 Icon (NavItem states)

| Semantic Token | Primitive | Resolved Value | Used In |
|---|---|---|---|
| `Icon/Contextual/NavItem/Base` |: | `#484848` | Icon default + expanded-trail icon |
| `Icon/Contextual/NavItem/Hover` |: | `#313131` | Icon hover |
| `Icon/Contextual/NavItem/Active` |: | `#2d4889` | Active icon + collapsed-trail icon + `indicator.stripe` color |
| `Icon/Action/Secondary Inverse/Base` |: | `#6b6b6b` | CollapseButton action icon (right_panel_open / left_panel_open) |

> `Icon/Contextual/NavItem/Active` (`#2d4889`) is used for **three things simultaneously**: the leading icon, the indicator stripe, and the collapsed-trail icon. They share the same token.

> Expanded trail icon = `Icon/Contextual/NavItem/Base` (`#484848`). Do not use active blue for expanded trail icons.

> **2026-05-12 update:** `Icon/Action/Secondary Inverse/Base` (`#6b6b6b`) added for the CollapseButton's new Slot.RowEnd action icon. This is a separate token from the nav item icons — it does not change on hover.

### 3.5 Geometry

| Semantic Token | Primitive | Resolved Value | Usage |
|---|---|---|---|
| `Component/NavItem/Large/Radius/Radius` | `Border/S` | `8px` | Item `border-radius` |
| `Accessibility/Touch Target/AA/Size` |: | `44px` | Item `min-height` (updated 2026-06-08 from 48) |
| `Accessibility/Icon Wrapping/Large/Size` |: | `24×24px` | `Container.LeadingIcon` dimensions |

### 3.6 Typography

All `SideNavItem` labels at all levels use **the same** text style. There is no size variation between Level 0 and Level 1 items.

#### Semantic token: `Label/Menu/Base/Medium`

| Property | CSS Variable (Style Dictionary output) | Resolved Value |
|---|---|---|
| Font family | `--semantic-type-desktop-label-menu-base-medium-fontfamily` | `'Red Hat Text', sans-serif` |
| Font weight | `--semantic-type-desktop-label-menu-base-medium-fontweight` | `500` (Medium) |
| Font size | `--semantic-type-desktop-label-menu-base-medium-fontsize` | `14px` |
| Line height | `--semantic-type-desktop-label-menu-base-medium-lineheight` | `20px` |
| Letter spacing | `--semantic-type-desktop-label-menu-base-medium-letterspacing` | `0.3px` |

#### Implementation (CSS)

```css
/* Using CSS custom properties */
.sidenav-label {
  font-family: var(--semantic-type-desktop-label-menu-base-medium-fontfamily, 'Red Hat Text', sans-serif);
  font-weight: var(--semantic-type-desktop-label-menu-base-medium-fontweight, 500);
  font-size: var(--semantic-type-desktop-label-menu-base-medium-fontsize, 14px);
  line-height: var(--semantic-type-desktop-label-menu-base-medium-lineheight, 20px);
  letter-spacing: var(--semantic-type-desktop-label-menu-base-medium-letterspacing, 0.3px);
}

/* Hard-coded fallback (no token system) */
.sidenav-label {
  font-family: 'Red Hat Text', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.3px;
}
```

> **Google Font:** `Red Hat Text` must be loaded via `@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600&display=swap')` or equivalent if not already provided by the app shell.

> **No font-size variation** between Level 0 and Level 1 items. The visual hierarchy of child items is achieved solely through the `pl-[24px]` left-indent and the absence of a leading icon: not via smaller text.

### Label truncation & overflow tooltip (PLANNED — not yet implemented)

The expanded SideNav is a **fixed 240px** wide. Item labels (especially Level 1 children) can exceed the available width and must **truncate with an ellipsis** (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`) — they never wrap to a second line and never widen the rail.

**Requirement:** when (and only when) a label is actually truncated, hovering or keyboard-focusing the item shows a **tooltip with the full label**. Spec:

- **Trigger condition:** truncation only — detect at runtime via `scrollWidth > clientWidth` on the label element. Do NOT show a tooltip for labels that fit.
- **Trigger events:** pointer hover **and** keyboard focus (so keyboard users get it too).
- **Content:** the complete, untruncated label text.
- **Visual:** reuse the Pathway **Tooltip** component (Figma node `5929:18392`) — same surface, radius, type, and motion. Do not invent a bespoke tooltip.
- **Accessibility:** the full label must also be available to assistive tech (e.g. `aria-label`/`title` on the truncated item), not only visually.
- **Distinct from §10.3:** that tooltip is for the **collapsed 72px rail** (icon-only items, always shown on hover). This one is for the **expanded 240px** rail, shown **only** when a label overflows.

> **Build order (decided 2026-06-15):** implement in the repo / Storybook / HTML demo first (truncation-triggered tooltips are interaction behavior Figma cannot fully express); the tooltip's *visual* comes from the existing Tooltip component. Reconcile Figma afterward with a documentation frame showing a long-name item + tooltip. **Figma TODO:** add that doc frame and confirm the long-label item uses the Tooltip component style.

---

## 4. Layout & Spacing

> **⚠ Gap:** The values in this section appear as raw Tailwind utility classes in Figma (`px-[12px]`, `gap-[8px]`, etc.) with **no named spacing/layout tokens**. This is a documentation gap in the design system. Recommend creating spacing tokens for these values so implementations can reference them semantically.

> **2026-05-12 Figma sync:** Several dimensions updated. Changed values are marked ★.

| Value | Figma class | px | Semantic token |
|---|---|---|---|
| Nav container horizontal padding (expanded) | `px-[16px]` | **16** | `Padding/Base` |
| Nav container horizontal padding (collapsed) | `px-[12px]` | **12** | `Padding/Medium` |
| Nav container top padding | `pt-[8px]` | **8** | `Padding/Tight` |
| SideNav expanded width |: | **240** | **None** |
| SideNav collapsed width |: | 72 | **None**: breaks down as 12px left padding + 48px item + 12px right padding (Padding/Medium) |
| Gap between nav items | `gap-[6px]` | **6** | `Gap/XTight` |
| SideNavMenu bottom spacer ★ | `pb-[56px]` | **56** | **None** *(was 24px)* |
| `Container.rowStart` horizontal padding | `px-[8px]` | 8 | **None** |
| `text.label` horizontal padding | `px-[6px]` | 6 | **None** |
| Level 1 `container.main` left indent | `pl-[24px]` | 24 | **None** |
| `indicator.stripe` width |: | 4 | **None** |
| `indicator.stripe` border-radius (right only) |: | `0 8px 8px 0` | Assumed `Border/S`: **unconfirmed** |
| Collapse row left padding | `pl-[12px]` | 12 | **None** |
| Collapse row right padding | `pr-[8px]` | 8 | **None** |
| `Collapse_Expand_Nav_Container` top padding / gap | `pt-[4px]` `gap-[4px]` | 4 | **None** |
| Icon.Leading inner size (nav items) |: | 16 | **None**: `Accessibility/Icon Wrapping/Large` covers 24px wrapper only |
| CollapseButton action icon size ★ |: | **12** | **None** *(was 18px, now uses right_panel_open/left_panel_open 12×12 SVGs)* |
| `Container.RowEnd` dimensions |: | 40×24px | **None** |
| `Container.RowEnd.Icon` dimensions |: | 24×24px | `Accessibility/Icon Wrapping/Large` |
| Chevron icon size |: | 10pt | **None** |
| NavSectionLabel height | `h-[40px]` | 40 | **None** |
| NavSectionLabel left/right padding | `px-[4px]` | 4 | `Gap/XTight` |
| NavSectionLabel top/bottom padding | `py-[8px]` | 8 | `Padding/Tight` |
| NavSectionLabel font size | *(type scale)* | 11 | `Label/Section/Small/Semibold/FontSize` |
| NavSectionLabel letter spacing | *(type scale)* | 0.6px | `Label/Section/Small/Semibold/LetterSpacing` |
| SideNavListSection bullet dot size | *(raw)* | 6 | **None** |

---

## 5. Item Variants

### Level 0: Destination
- Has `Container.LeadingIcon` (24×24) with `Icon.Leading` (16pt fill-style icon)
- **No `Container.RowEnd`**: destinations omit the right-side container entirely. Only groupers have a `Container.RowEnd`.
- Interacts: click → sets active state

### Level 0: Grouper
- Has `Container.LeadingIcon` (24×24) with `Icon.Leading` (16pt fill-style icon)
- Has `Container.RowEnd` (40×24): **contains chevron** (10pt)
- Chevron direction: **▼ down** when collapsed, **▲ up** when expanded
- Interacts: click → toggles expand/collapse (does not navigate)

### Level 1: Child (always Destination)
- Uses `child.container` wrapper
- **No** `Container.LeadingIcon`, **no** icon of any kind
- `container.main` has `pl-[24px]` left indent to create visual hierarchy
- Same font (`Label/Menu/Base/Medium`) as Level 0
- Always a destination, never a grouper
- Only 2 levels of depth allowed

### NavSectionLabel (content divider, optional)
- A 40px-tall uppercase heading that labels a group of nav items within the menu
- Not an interactive element — no hover state, no click handler
- **Optional**: omit entirely for modules that do not need sections
- Full spec at §2.3

### SideNavListSection (flat contextual list, optional)
- A labelled group of flat, icon-less list items (bullet-dot leading icon)
- Only visible in expanded sidebar — hidden in 72px collapsed rail
- Not for primary navigation; for contextual links (recent items, pinned items, etc.)
- Full spec at §2.4

---

## 6. State Matrix

| Condition | Fill token | Text token | Icon token | `indicator.stripe` |
|---|---|---|---|---|
| **Base** | `NavItem/Base` | `NavItem/Base` | `NavItem/Base` | hidden |
| **Hover** | `NavItem/Hover` | `NavItem/Hover` | `NavItem/Hover` | hidden |
| **Active** (destination) | `NavItem/Active` | `NavItem/Active` | `NavItem/Active` | **visible** |
| **Trail: expanded** (grouper is open) | `NavItem/Trail` | `NavItem/Active` | `NavItem/Base` | hidden |
| **Trail: collapsed** (grouper closed, child is active) | `NavItem/Active` | `NavItem/Active` | `NavItem/Active` | **visible** |

### State logic rules

1. **Any expanded grouper** (children are visible) → Trail-expanded state. This applies regardless of whether a child item is currently active.
2. **Collapsed grouper with active child** (children hidden because grouper is closed, OR sidebar is fully collapsed) → Trail-collapsed state. Visually identical to Active state: same fill, same icon color, same stripe.
3. When the sidebar collapses, any grouper that was in expanded-trail automatically transitions to collapsed-trail if it has an active child.
4. `indicator.stripe` is only visible in **Active** and **Trail-collapsed** states.
5. `indicator.stripe` color = `Icon/Contextual/NavItem/Active` (`#2d4889`): same token as icon active.

> **Standalone implementation rule: Trail-collapsed:** When a grouper is closed and any of its children is the active destination, apply **exactly the same 5 token values as Active state** to the grouper row: fill `#a0b5e629`, text `#1b2d57`, icon `#2d4889`, stripe visible `#2d4889`. Trail-collapsed and Active are visually indistinguishable. The only difference is semantic: Active applies to a leaf destination; Trail-collapsed applies to a grouper whose active descendant is hidden. This rule applies whether the sidebar is 240px expanded or 72px collapsed.

---

## 7. `indicator.stripe` Sub-component

```
container.indicator (structural, 4px wide, full item height)
└── indicator.stripe (visible stripe)
    border-radius: 0 8px 8px 0   ← rounded on right only
    width: 4px
    color: var(--icon/contextual/navitem/active, #2d4889)
    padding: 4px 0  (top/bottom inset within container)
```

The `container.indicator` column is **always present** on every `SideNavItem` (Level 0 and Level 1). It is a structural 4px spacer. The `indicator.stripe` inside it is only visually painted when the item is in Active or Trail-collapsed state.

> **Implementation rule:** `container.indicator` must exist in the DOM / component tree at all times for every SideNavItem: it is not conditionally rendered. Only the visual paint of `indicator.stripe` is conditional (via `background: transparent` when hidden, `background: #2d4889` when visible). Removing the column from the DOM when hidden will cause layout shift as items jump 4px when the stripe appears.

---

## 8. SideNav Container

### 8.1 Surface
- Background: `Surface/Nav/Light` → `#fafafa`
- Right border: `0.5px solid` `Stroke/Static/Neutral/Light` → `#f6f6f6`

### 8.2 Dimensions & Padding
```
Expanded:  width 240px, padding-top: 8px (Padding/Tight), padding-horizontal: 16px (Padding/Base), padding-bottom: 0px
Collapsed: width  72px, padding-top: 8px (Padding/Tight), padding-horizontal: 12px (Padding/Medium), padding-bottom: 0px
```
> Bottom space (56px) is provided by the SideNavMenu flex spacer (`minHeight: L.menuPadB`), not container padding. See §4.

### 8.3 Transition
```
width: transition var(--motion-duration-6) var(--motion-easing-emphasized)
```

**Label and chevron fade:** Item labels, chevrons, and the CollapseButton "Collapse" text are always present in the DOM. They fade out/in using `max-width` + `opacity` transitions so text does not pop-in at full opacity inside the still-narrow container during an expand animation.

| Element | Collapsed value | Expanded value | Transition |
|---|---|---|---|
| Label `max-width` | `0` | `200px` | `--motion-duration-6` · emphasized |
| Label `opacity` | `0` | `1` | `--motion-duration-3` · standard |
| Chevron `max-width` | `0` | `40px` | `--motion-duration-6` · emphasized |
| Chevron `opacity` | `0` | `1` | `--motion-duration-3` · standard |
| CollapseButton label `max-width` | `0` | `120px` | `--motion-duration-6` · emphasized |
| CollapseButton label `opacity` | `0` | `1` | `--motion-duration-3` · standard |

> **Motion override — intentional:** The sidebar width transition uses `--motion-duration-6` with `--motion-easing-emphasized` — a smooth glide with a soft, characterful ease but **no overshoot**. (An earlier implementation used a strongly bouncy spring at 500 ms, which felt overly springy for a structural panel; `--motion-easing-emphasized` preserves a hint of warmth and personality without the visible bounce.) The label/chevron `max-width` matches the width move (`--motion-duration-6` · emphasized); its opacity rides `--motion-duration-3` · standard — slightly shorter, so labels finish fading before the panel finishes collapsing, avoiding a flash of fully-visible text inside an already-narrow container.

> **Why `--motion-easing-emphasized` and not the standard `--motion-easing-standard`:** The standard Material curve is correct but reads as clinical at the scale of a 240→72 px panel. `--motion-easing-emphasized` borrows Apple's HIG easing language — strong initial acceleration that decelerates smoothly into rest — giving the motion warmth and presence without the literal physical bounce of an overshoot. The grouper accordion uses the closely related `--motion-easing-accordion` (the gentlest overshoot in the system), keeping the two motions feeling coherent.

---

## 9. NavHeader (collapse / expand control)

> **Migration note (2026-05-13):** The collapse/expand control moved from the **bottom of the scroll flow** to the **TOP of the nav**. The component name in code is now `NavHeader` (was `CollapseButton` / `Collapse_Expand_Nav_Container`). The old `CollapseButton` symbol remains exported in `sidenav.jsx` for backward compatibility but is no longer rendered by `<SideNav />` itself.

The NavHeader is the first row inside the SideNav container, above all nav items and section labels. It is sticky at the top so it stays visible no matter how far the user scrolls through the nav.

```
NavHeader  (48px row + 1px divider below)
├── Container.Main  (h-[48px], full width, hover fill)
│   ├── Expanded (240px): action icon right-aligned in Slot.RowEnd (36×36 wrapper, 12×12 icon)
│   └── Collapsed (72px): action icon centered (12×12)
└── Divider  (1px, Stroke/Static/Neutral/Light #f6f6f6, py-[2px])
```

**Action icons:** `right_panel_open` (when sidebar is expanded — click to collapse) and `left_panel_open` (when sidebar is collapsed — click to expand). Both 12×12 SVG glyphs, fill colour `Icon/Action/Secondary Inverse/Base` (`#6b6b6b`).

**Key differences from `SideNavItem`:**
- No `container.indicator` / `indicator.stripe` column
- No leading icon (the action icon lives in the row-end / centered slot)
- No "Collapse" text label (the previous design had one — removed 2026-05-13)
- No active / trail states — only base and hover

**Visibility rule:** NavHeader is rendered at **all desktop and tablet breakpoints (≥768 px)** regardless of whether the sidebar is expanded or collapsed. It is hidden only on mobile (<768 px), where the TopNav hamburger is the sole toggle and there is no 72 px rail state.

| Sidebar state | NavHeader rendered? | Action icon | Position |
|---|---|---|---|
| Expanded (240px, ≥768px) | ✓ Yes | `right_panel_open` (12×12 `#6b6b6b`) | Right-aligned in Slot.RowEnd |
| Collapsed (72px rail, ≥768px) | ✓ Yes | `left_panel_open` (12×12 `#6b6b6b`) | Centered |
| Mobile overlay (<768px) | ✗ No | — | — |

The 1 px divider below the NavHeader is always rendered when the NavHeader is rendered. The 8 px gap between the divider and the first nav item is provided by `paddingTop: L.menuPadT` on the SideNavMenu (not by margin on the divider).

---

## 9.1 Overflow and scroll behaviour

The SideNav menu is the only scroll region, and it is wrapped in the **system [Scrollbar component](../scrollbar/scrollbar-spec.md) (`<Scrollable>`)** — **not** a native, generic, or per-element scrollbar. SideNav *consumes* the Scrollbar component the same way it would any nested component; behaviour, tokens, motion, and accessibility for the bar itself are owned by the [Scrollbar spec](../scrollbar/scrollbar-spec.md) ([Storybook](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-scrollbar--docs)).

**Structure — same in both states:**
- The **NavHeader is pinned** at the top: a `flex-shrink: 0` child placed **outside** the scroll region, so it never scrolls.
- The **menu** below it is the `<Scrollable>` region (`flex: 1; min-height: 0`). It is **bled to the nav's true right edge** (`margin-right: -padH`) with the content inset re-added inside the scroll view (`padding-right: padH`), so the overlay thumb hugs the edge in BOTH the 240 px expanded and 72 px collapsed rail. All nav items (including `SideNavListSection`) remain reachable by scrolling.

**Thumb:** the native bar is hidden; a slim liquid-glass thumb is drawn as an **overlay** — `scrim/faint` at rest → `scrim/light` on hover/drag (semantic tokens), backdrop-blurred, identical on macOS/Windows/iOS/Android, **zero layout width** (never shifts the 240 px / 72 px sizing), revealed on hover/scroll, fading when idle.

> **IMPLEMENTATION RULE: SideNav must use `<Scrollable>` for menu overflow — never a raw `overflow-y: auto` native bar.**
> This applies to the repo `.jsx`, the standalone `sidenav.html` demo, and Storybook (which renders the `.jsx`). The pre-2026-06 per-element `::-webkit-scrollbar` CSS has been removed and is fully superseded by the Scrollbar component. For the thumb's full spec, see [components/scrollbar/scrollbar-spec.md](../scrollbar/scrollbar-spec.md).

The 4 px scrollbar is intentionally narrow so it does not visually intrude on item layout. `rgba(0,0,0,0.18)` is a documented implementation constant — no token maps directly to scrollbar thumb opacity.

### Popovers and tooltips when the sidebar is scrolled

`SideNavTooltip` and `CollapsedPopover` are rendered via portal (`document.body`) using `position: fixed` with coordinates from `getBoundingClientRect()`. Their position is always relative to the **viewport**, not the scroll container.

This means:

- If the user opens a popover/tooltip and then scrolls the nav, the overlay does **not** follow the item: it stays at its original screen position until dismissed.
- In practice this is not an issue: the popover/tooltip is shown on hover and dismissed on mouse leave (300 ms delay). A user cannot simultaneously hover an item and scroll the nav without triggering the leave event.
- If a scroll event causes an item to move out of view, the popover closes via the normal mouse-leave path.

### Figma gap

The overflow/scroll behaviour is not annotated in Figma. The nav container is designed at a fixed height showing all items in frame. The NavHeader sticky behaviour (§16.8) and scrollbar token (above) are the primary open implementation decisions in this area.

---

## 10. Sidebar Collapsed State

### 10.1 Container

| Property | Value | Token |
|---|---|---|
| Width | 72px | None: raw value |
| Padding | `12px` horizontal (`Padding/Medium`), `8px` top (`Padding/Tight`), `0` bottom | None |
| Background | `#fafafa` | `Surface/Nav/Light` |
| Border-right | `0.5px solid #f6f6f6` | `Stroke/Static/Neutral/Light` |
| Item gap | `6px` | `Gap/XTight` |

The 72px breaks down as: 12px left padding + 48px item + 12px right padding. Items are 44px tall × 48px wide in the collapsed rail.

### 10.2 SideNavItem.Collapsed

All state tokens are the same as the expanded item (see §6 State Matrix). Layout differences:

- Labels hidden
- `Container.RowEnd` (chevrons) hidden
- Level 1 children hidden
- Icon container: 24×24px centered within the 48px item via `px-[8px]` + flex `justify-center`: no manual offset needed
- `indicator.stripe` present on Active and Trail-collapsed states as normal

### 10.3 Hover behaviour: destinations vs groupers

| Item type | On hover |
|---|---|
| **Destination** (no children) | Show `SideNavTooltip`: label only, positioned to the right |
| **Grouper** (has children) | Show `PopoverMenu`: section label + children list |

Both appear with an **8px gap** from the container's right edge (`left: calc(100% + 8px)`).

#### SideNavTooltip

| Property | Value | Token |
|---|---|---|
| Background | `white` | `Fill/Static/Neutral/White` |
| Border | `0.5px solid #f6f6f6` | `Stroke/Static/Neutral/Light` |
| Border radius | `8px` | `Border/Radius/S` |
| Shadow | `2px 2px 8px 0px rgba(0,0,0,0.03)` |: |
| Padding | `6px 8px` |: |
| Typography | 14px / 400 / 20px / 0.02px | `Text/Body/S/Regular` |
| Text colour | `#202020` | `Text/Static/Primary/Base` |
| Position | Right of item, vertically centred (`top: 50%; transform: translateY(-50%)`) |: |

#### PopoverMenu (grouper flyout)

| Property | Value | Token |
|---|---|---|
| Background | `white` | `Fill/Static/Surface/White` |
| Border | `0.5px solid #ededed` | `Stroke/Static/Neutral/Subtle` |
| Border radius | `8px` | `Border/Radius/S` |
| Shadow | `2px 2px 8px 4px rgba(0,0,0,0.03)` | `Shadow.Medium` |
| Padding | `6px` |: |
| Min-width | `200px` |: |
| Position | `left: calc(100% + 8px)`, `top: 0` on the container |: |

**`PopoverMenu.SectionLabel`** (group name, shown above items):

| Property | Value | Token |
|---|---|---|
| Height | `40px min` |: |
| Bottom border | `0.5px solid #ededed` | `Stroke/Static/Neutral/Subtle` |
| Left indicator slot | `4px wide` (same structural column as `indicator.stripe`) |: |
| Text indent | `8px left padding` |: |
| Typography | 14px / 400 / 20px / 0.02px | `Label/Menu/Base/Regular` |
| Text colour | `#6b6b6b` | `Text/Static/Secondary/Subtle` |

**`PopoverMenu.Item`** (each child):

| Property | Value | Token |
|---|---|---|
| Height | `40px min` |: |
| Padding | `4px 12px` |: |
| Border radius | `8px` | `Border/Radius/S` |
| Typography | 14px / 400 / 20px / 0.02px | `Text/Body/S/Regular` |
| Text colour (base) | `#313131` | `Text/Contextual/NavItem/Base` |
| Text colour (hover) | `#252525` | `Text/Contextual/NavItem/Hover` |
| Fill (hover) | `rgba(17,17,17,0.04)` | `Fill/Contextual/NavItem/Hover` |

### 10.4 Hover-safe interaction

The popover must not close as the user moves their mouse from the nav item to the popover. Two mechanisms work together:

**Invisible bridge element:** An 8px-wide transparent div sits between the item's right edge and the popover's left edge (`position: absolute; left: 100%; width: 8px; height: 100%`). Mouse movement through this gap triggers `onMouseEnter` on the bridge, keeping the popover open.

**Close delay:** 300ms timer fires after mouse leaves both the item and the popover. This is generous enough for motor-impaired users and satisfies WCAG 2.5.1. The timer resets any time the mouse re-enters the item, bridge, or popover.

### 10.5 Popover animation

The full motion spec (duration, easing, reduced-motion, hover-safe close delay) is owned by the PopoverMenu component and documented on the [PopoverMenu Figma component page](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40005913-152988&t=C5AHPCaPqyhmnq3s-1).

SideNav-specific positioning: the popover opens **to the right** of the collapsed container, **8px from the container's right edge** (`left: calc(100% + 8px)`), sliding in from the left (`translateX(-4px → 0)`).

### 10.6 Overlay stacking context (implementation note)

The collapsed nav container requires `overflow-y: auto` for scrolling. Any `overflow` value other than `visible` on a positioned element creates a CSS clipping context: absolutely positioned children that extend beyond the container's bounds (i.e. the popover and tooltip, which open to the right) will be clipped regardless of `z-index`.

**Required implementation pattern:** The `SideNavTooltip` and `CollapsedPopover` must be rendered outside the nav's DOM subtree (e.g. via `ReactDOM.createPortal` into `document.body`) using `position: fixed` with coordinates calculated at open time from `getBoundingClientRect()` on the trigger element. The hover-safe bridge element must also use `position: fixed` for the same reason.

This is a CSS architectural constraint, not a Figma design concern. No Figma annotation is needed.

---

## 11. Iconography

> **Migration note (2026-06-08):** Nav-item icon size increased from 14px to **16px** (Material Symbols Rounded). Nav-item min-height changed from 48px (Touch Target Optimal) to **44px** (Touch Target AA) to match the current Figma rail. Rail-state padding follows Figma node `40005281:10058`. HTML demos predating this date may still show 14px/48px — the `.jsx` (`L.iconInner: 16`, `L.itemH: 44`) and this spec are authoritative.

- **Library: Material Symbols Rounded** — the only icon library permitted in SideNav. Never use Outlined, Sharp, or any other variant. CSS class: `material-symbols-rounded`.
- **Icon size: 16px** inside a 24×24 wrapper (updated 2026-06-08 from 14px).
- **FILL=1 always** — all SideNav icons use the filled (solid) variant. This is a hard rule, not a per-state toggle. `fontVariationSettings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20'`.
- **Icon name = Figma layer name** — when reading the component via `get_design_context`, the icon frame's `data-name` attribute is the exact Material Symbols ligature string.
- Icons live at `16×16pt` inside a `24×24pt` `Container.LeadingIcon` wrapper
- Icon source: [design system iconography page](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002909-32275)
- **Figma CDN asset URLs cannot be used directly in browsers**: they require auth headers that only the Figma MCP server provides. Implementations must either use the design system icon component library or embed SVG assets at build time.

> IMPLEMENTATION RULE: SideNav icons are always FILL=1.
> `font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20` on every `.material-symbols-rounded` span inside a SideNav item. Never FILL=0. Never a per-state toggle between filled and outlined.

### Demo SideNav icon mapping (current reference implementation)

The reference demo (`sidenav.html`) uses a church management context with three sections. All icons are **Material Symbols Rounded** (Google Fonts CDN).

#### MUSIC section

| Nav Item | Icon name (Material Symbols) | Grouper |
|---|---|---|
| Music | `music_note` | ✓ (children: Songs, Albums, Playlists) |
| Media | `video_library` |: |
| Live | `live_tv` |: |

#### PEOPLE section

| Nav Item | Icon name (Material Symbols) | Grouper |
|---|---|---|
| Groups | `group` | ✓ (children: Small Groups, Youth, Adults) |
| Members | `person` |: |
| Volunteers | `volunteer_activism` |: |

#### SERVICES section

| Nav Item | Icon name (Material Symbols) | Grouper |
|---|---|---|
| Services | `church` | ✓ (children: Sunday Service, Events) |
| Giving | `favorite` |: |

> **Note:** These items are demo data chosen to illustrate the section-label pattern in a realistic church management context. Production modules supply their own item lists, icons, and section headings.

---

## 12. Interaction Patterns

| Trigger | Behavior |
|---|---|
| Click destination (L0 or L1) | Set that item as active |
| Click grouper (expanded sidebar) | Toggle expand/collapse (accordion) |
| Click grouper (collapsed sidebar) | No expand: show flyout popover instead |
| Hover any item | Hover fill + hover text + hover icon |
| Hover grouper in collapsed sidebar | Show flyout popover with group label + children |
| Click Collapse button | Sidebar width transition to 72px |
| Click Expand button | Sidebar width transition to 240px |

### 12.1 Grouper accordion expand/collapse (expanded sidebar)

When the sidebar is in the 240px expanded state, clicking a Level 0 Grouper toggles its Level 1 children between visible and hidden using an **animated accordion**.

**Single-open accordion (updated 2026-05-13):** Only one grouper is open at a time. Opening a grouper automatically closes any other previously expanded grouper. This keeps the nav compact and the active context obvious. The collapse animation on the previously-open grouper runs in parallel with the expand on the newly-opened one — both use the same `--motion-duration-5` + `--motion-easing-accordion`.

```js
// Reference implementation (matches sidenav.html and sidenav.jsx)
const toggleExpand = id => setExpanded(prev => {
  const isNowOpen = !prev[id];
  if (isNowOpen) return { [id]: true };   // close all others, open this one
  const next = { ...prev }; delete next[id]; return next;
});
```

**Chevron direction:**
- Collapsed (children hidden): chevron points **down** (`▼`)
- Expanded (children visible): chevron points **up** (`▲`)

The chevron lives in `Container.RowEnd` (40×24px), which is only present on grouper items. Destination items have no `Container.RowEnd`.

**Expand/collapse animation:**

The Level 1 child list uses CSS Grid `grid-template-rows` to animate between zero height (collapsed) and natural height (expanded). This avoids JavaScript height calculations and supports dynamic content length. The inner wrapper additionally fades opacity 0 → 1 (with a 70ms delay behind the height grow) so children emerge gracefully rather than clipping into existence.

```jsx
<div style={{
  display: 'grid',
  gridTemplateRows: isExpanded ? '1fr' : '0fr',
  transition: 'grid-template-rows var(--motion-duration-5) var(--motion-easing-accordion)'
}}>
  <div style={{
    overflow: 'hidden',
    opacity: isExpanded ? 1 : 0,
    transition: isExpanded
      ? 'opacity var(--motion-duration-4) var(--motion-easing-standard) 70ms'   // fade in slightly behind the grow
      : 'opacity var(--motion-duration-3) var(--motion-easing-standard)'         // exit faster (no delay)
  }}>
    {item.children.map(child => <SideNavItem ... />)}
  </div>
</div>
```

| Property | Value |
|---|---|
| Animation type | CSS `grid-template-rows: 0fr → 1fr` + opacity fade |
| Height duration | `--motion-duration-5` (380ms) |
| Height easing | `--motion-easing-accordion` — the gentlest overshoot in the system, smooth settle without a visible bounce |
| Children opacity (expand) | `0 → 1`, `--motion-duration-4` · standard, `70ms` delay |
| Children opacity (collapse) | `1 → 0`, `--motion-duration-3` · standard, no delay (snappier exit) |
| Chevron rotation | `--motion-duration-5` · accordion — matches accordion timing so chevron + panel land together |
| Inner wrapper | `overflow: hidden` — required for the clip to work |

> **Why `--motion-easing-accordion` and not the standard `--motion-easing-standard`:** The standard curve is fine for short hover transitions but feels mechanical on a panel that grows several rows tall. `--motion-easing-accordion` starts fast and decelerates strongly into the resting position, which reads as a polished, considered motion at the larger scale of an accordion. Its overshoot is the gentlest in the system, so items below the grouper do not visibly jiggle.

> **Why matching chevron timing:** Earlier the chevron and accordion ran on different timings, so the chevron landed after the panel finished opening. Matching both to `--motion-duration-5` + `--motion-easing-accordion` makes the two motions feel like a single coherent action.

> **Why grid-template-rows:** `max-height` transitions require a hard ceiling value and produce uneven timing (slow at the start when the element is short, fast at the end). `grid-template-rows: 0fr → 1fr` produces perfectly even timing because the fraction unit is relative to the natural content height, regardless of how many children are present.

**Children always in DOM:** The Level 1 child list is always in the DOM when the sidebar is expanded (not conditionally rendered). This is required so the collapse animation plays when a grouper is closed — if the children were removed immediately, there would be nothing to animate. The children are only truly absent from the DOM in the 72px collapsed rail, where they are not rendered at all (popovers handle the collapsed case instead).

### 12.2 Grouper behaviour in collapsed rail (72px)

In the collapsed rail, clicking a grouper does not expand it accordion-style. There is no room for Level 1 children in a 72px rail. Instead:

- Hovering a grouper opens the `CollapsedPopover` flyout (see §10.3)
- The popover contains the group name (`PopoverMenu.SectionLabel`) and the children as `PopoverMenu.Item` rows
- Clicking a child inside the popover navigates to that destination and sets it active
- The grouper row itself shows Trail-collapsed state when any of its children is active (see §6)

### 12.3 Trail state transitions

Trail state is managed purely by the current `activeId` and the open/closed state of each grouper:

1. User navigates to a Level 1 child → child is active, parent grouper enters **Trail-expanded** (children visible) or **Trail-collapsed** (children hidden or sidebar at 72px).
2. User collapses the sidebar to 72px while a child is active → all expanded groupers with an active child immediately switch to Trail-collapsed. The accordion close animation does not play (the sidebar width transition takes priority as the visual signal).
3. User re-expands the sidebar → Trail-expanded state resumes (grouper shows its children again).
4. User clicks a different destination (not a child of this grouper) → grouper returns to Base state; no trail.

### 12.4 NavSectionLabel interaction

`NavSectionLabel` has **no interactive states**. It does not respond to hover, click, or focus. It is a purely decorative/organisational element. Do not assign `role="button"`, `tabindex`, or event handlers to it.

### 12.5 SideNavListSection interaction

`ListItem` within a `SideNavListSection` behaves identically to a Level 0 Destination item:
- Hover → hover fill, hover text, hover bullet dot colour
- Click → set as active, update `activeId`
- Active → active fill, active text, active bullet dot colour, indicator stripe visible

List section items do not have children and are never groupers. They do not interact with the Trail state logic.

---

## 13. Accessibility

> **Legend used in this section:**
> - ✅ **Implemented**: present in the current reference demo (`sidenav.html`)
> - 📋 **Required for production**: standard spec for this pattern, not yet in the demo
> - ❓ **Unconfirmed**: not yet validated; Figma does not supply an annotation for this

---

### 13.0 ARIA Pattern

The SideNav uses the **ARIA Tree View pattern** (`role="tree"`). The component has two levels of hierarchy: expandable Level 0 groupers with Level 1 child destinations: which maps directly to the [WAI-ARIA treeview specification](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

The entire nav is a single Tab stop. Arrow keys navigate within it (see §13.3). This is the correct pattern for a hierarchical, expandable navigation structure of this kind.

Do not use `role="menu"` / `role="menuitem"`: that is for application context-menus, not site navigation, and screen readers will announce it incorrectly.

> **Note on the reference demo (`sidenav.html`):** The demo currently uses `<nav>` with `role="button"` divs as a visual scaffolding baseline. This is not a production-ready implementation. Production code requires native `<button>` / `<a>` elements, roving-tabindex focus management, and the full arrow key handlers documented in §13.3.

---

### 13.1 Touch & Pointer Targets

| Token | Value | Source |
|---|---|---|
| `Accessibility/Touch Target/AA/Size` | `44px` | Figma ✅ |
| `Accessibility/Icon Wrapping/Large/Size` | `24×24px` | Figma ✅ |

Both values come from named Figma tokens. `min-height: 48px` on every `SideNavItem` satisfies WCAG 2.5.5 Target Size.

---

### 13.2 ARIA Markup

```html
<nav aria-label="Main navigation">

  <ul role="tree" aria-label="Main navigation">

    <!-- Level 0: Destination (no children) -->
    <li role="treeitem" tabindex="-1" aria-current="page">
      <!-- aria-current="page" on the active item only -->
      Reports
    </li>

    <!-- Level 0: Grouper (has children) -->
    <li role="treeitem" tabindex="-1" aria-expanded="true">
      Applications
      <ul role="group">
        <li role="treeitem" tabindex="-1">Child Item A</li>
        <li role="treeitem" tabindex="-1">Child Item B</li>
      </ul>
    </li>

    <!-- Level 0: Grouper (collapsed) -->
    <li role="treeitem" tabindex="-1" aria-expanded="false">
      Modify
      <!-- ul[role="group"] not rendered (or aria-hidden="true") when collapsed -->
    </li>

  </ul>

</nav>

<!-- Collapse/Expand control: outside the tree, separate button -->
<button type="button" aria-label="Collapse navigation">
  <!-- collapse_nav icon -->
</button>
```

**Key rules:**
- The `<ul role="tree">` contains the first level of items only. Children sit inside `<ul role="group">` nested within their parent `<li role="treeitem">`.
- Only **one** `treeitem` should have `tabindex="0"` at a time (the currently focused item). All others use `tabindex="-1"`. This is roving-tabindex focus management.
- `aria-expanded` is only valid on grouper treeitems: omit it entirely from leaf (destination) items.
- `aria-current="page"` goes on the active destination `treeitem` only.
- The Collapse/Expand button sits **outside** the tree: it is a separate `<button>`, not a `treeitem`.

---

### 13.3 Keyboard Interaction

The entire nav is a single Tab stop. Arrow keys navigate within it.

| Key | Behaviour | Status |
|---|---|---|
| `Tab` | Moves focus **into** the tree (to the roving focus item): or **out** of the tree to the next focusable element on the page | 📋 Requires roving-tabindex implementation |
| `Shift+Tab` | Moves focus out of the tree backward | 📋 Requires roving-tabindex implementation |
| `↓` (Down Arrow) | Moves focus to the **next visible treeitem** (skips hidden children of collapsed groupers) | 📋 Not in demo |
| `↑` (Up Arrow) | Moves focus to the **previous visible treeitem** | 📋 Not in demo |
| `→` (Right Arrow) | On a **collapsed grouper**: expands it. On an **expanded grouper**: moves focus to its first child. On a leaf item: no action. | 📋 Not in demo |
| `←` (Left Arrow) | On an **expanded grouper**: collapses it. On a **child item (Level 1)**: moves focus to its parent grouper. On a Level 0 leaf: no action. | 📋 Not in demo |
| `Enter` | Activates the focused item: navigates (destination) or toggles expand/collapse (grouper) | ✅ Implemented (via click handler) |
| `Space` | Same as Enter for treeitems | 📋 Not in demo |
| `Home` | Moves focus to the first treeitem in the tree | 📋 Not in demo: recommended |
| `End` | Moves focus to the last visible treeitem in the tree | 📋 Not in demo: recommended |
| `Escape` | If a grouper is focused and expanded, collapse it | 📋 Not in demo: recommended |

> **Focus management: roving tabindex:** Only the currently focused item has `tabindex="0"`. When focus moves to a new item (via arrow key), set the old item to `tabindex="-1"` and the new item to `tabindex="0"`. This ensures Tab always lands on the last-focused item when the user returns to the tree.

---

### 13.4 Focus Styles

| Requirement | Status |
|---|---|
| Visible focus ring on all interactive items | ❓ Not styled in demo: browser default outline only |
| Focus ring must not be suppressed (`outline: none` without replacement) | 📋 Required: WCAG 2.4.11 |
| Focus ring should use `:focus-visible` (not `:focus`) to avoid painting on mouse click | 📋 Recommended |
| Suggested focus style | `outline: 2px solid #2d4889; outline-offset: 2px;` (uses `Icon/Contextual/NavItem/Active`) |

> Figma does not contain a "focused" state variant in the `SideNavItem` component variants. This is a documentation gap: a focused state should be added to the component before production. See §16.

---

### 13.5 Screen Reader Announcements

| Concern | Recommendation | Status |
|---|---|---|
| Tree label | `<ul role="tree" aria-label="Main navigation">`: ensures the landmark is named and SR announces "tree" on entry | 📋 Required |
| Grouper state | `aria-expanded="true/false"` on grouper treeitems only: SR announces "expanded" or "collapsed". Do not put `aria-expanded` on leaf destination items. | 📋 Required |
| Active page | `aria-current="page"` on the active destination: SR announces "current page" | ✅ Implemented in demo |
| Icon-only collapsed sidebar | When collapsed to 72px, labels are hidden visually. Each item needs a text alternative: `aria-label` on the item or a visually-hidden `<span>`. Do not rely on the icon alone. | 📋 Not in demo |
| Collapsed grouper children | When a grouper is collapsed, its children must be removed from DOM or `aria-hidden="true"`: not just visually hidden with CSS | 📋 Demo uses conditional render: correct approach |
| Collapse/Expand button | `aria-label="Collapse navigation"` when expanded, `aria-label="Expand navigation"` when collapsed. Update dynamically as state changes. | 📋 Not in demo |
| Depth announcement | Screen readers announce depth automatically from the markup nesting: do not add manual "level 1 / level 2" text | ✅ Handled by correct markup |

#### Expected screen reader output (VoiceOver / NVDA)

These are approximate strings. Exact wording varies by screen reader and browser.

| Scenario | Expected announcement |
|---|---|
| Tab into the nav | *"Main navigation, tree"* |
| Focus on a leaf destination item (resting) | *"Reports, treeitem, 3 of 7"* |
| Focus on the active destination | *"Enter, current page, treeitem, 2 of 7"* |
| Focus on a collapsed grouper | *"Applications, collapsed, treeitem, 1 of 7"* |
| Focus on an expanded grouper | *"Applications, expanded, treeitem, 1 of 7"* |
| Focus on a Level 1 child | *"Enter Journal, treeitem, 1 of 3, level 2"* |
| Pressing → on a collapsed grouper | *"Applications, expanded"* (state change announced) |
| Pressing ← on an expanded grouper | *"Applications, collapsed"* |
| Focus on Collapse button | *"Collapse navigation, button"* |
| Sidebar collapsed, focus on icon-only item | *"Reports, treeitem"*: only if `aria-label` is set; without it: *"treeitem"* (no label: broken) |


---

### 13.6 Colour Contrast

All values below use token resolved values. Verify with a tool (e.g. Colour Contrast Analyser).

| State | Text token → hex | Background | Approx. ratio | WCAG AA (4.5:1) |
|---|---|---|---|---|
| Base | `Text/NavItem/Base` → `#313131` on `#fafafa` | ~11.6:1 | ✅ Pass |
| Hover | `Text/NavItem/Hover` → `#252525` on `≈#f5f5f5` | ~14.1:1 | ✅ Pass |
| Active | `Text/NavItem/Active` → `#1b2d57` on `≈#eef1f8` | ~16.3:1 | ✅ Pass |
| Trail (expanded) | `Text/NavItem/Active` → `#1b2d57` on `≈#f5f5f5` | ~17.9:1 | ✅ Pass |
| `indicator.stripe` | `Icon/NavItem/Active` → `#2d4889` on `#fafafa` | Non-text UI component | ✅ 3:1 (WCAG 1.4.11) |
| Focus ring (proposed) | `#2d4889` outline on `#fafafa` | Non-text UI component | ✅ 3:1: verify with tool |

> ⚠ Contrast ratios are approximated on the `#fafafa` nav surface. Alpha-blended fills (`rgba(...)`) will vary on other backgrounds.

---

### 13.7 Figma Accessibility Gaps

The ARIA pattern, keyboard tables, screen reader strings, and contrast ratios all live in this spec (single source of truth). Figma does not need to duplicate that content: it should link to this document instead.

The only things that genuinely need to be **done in Figma** (because they are design artifacts, not documentation):

| Gap | Priority | Action needed in Figma |
|---|---|---|
| No "focused" state variant in `SideNavItem` | HIGH | Design and add a focused variant to the component: suggested style: `2px solid #2d4889` outline, `2px` offset. This is a visual design decision that must exist in Figma. |
| No link to this spec in Dev Mode | HIGH | In Figma Dev Mode → Resources panel, add the spec URL: `https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav-spec.md`. Takes 30 seconds and means devs always have one click to the full reference. |
| Accessibility section in Figma doc frame is outdated | MEDIUM | Replace with a short plain-text summary (component description, key decisions, any gaps that require design work) and a link to this spec. Do not duplicate tables. |

---

## 14. Motion

All SideNav motion resolves through the **`--motion-*` tokens** (`docs/design-system-spec.md` §2) — no hardcoded ms/curves in `sidenav.jsx`. This table reflects the tokens the implementation actually uses (it supersedes the older named-step references):

### Summary — token per motion

| Element | Duration token | Easing token |
|---|---|---|
| Hover fills, colour transitions | `--motion-duration-3` (200ms) | `--motion-easing-standard` |
| Popover/tooltip enter (`popoverIn`) | `--motion-duration-3` | `--motion-easing-spring` |
| Grouper accordion expand/collapse (grid-rows) | `--motion-duration-5` (380ms) | `--motion-easing-accordion` |
| Chevron rotation (matches accordion) | `--motion-duration-5` | `--motion-easing-accordion` |
| Grouper child opacity fade-in | `--motion-duration-4` (300ms), 70ms delay | `--motion-easing-standard` |
| Grouper child opacity fade-out | `--motion-duration-3` | `--motion-easing-standard` |
| NavSectionLabel opacity fade | `--motion-duration-4` | `--motion-easing-standard` |
| NavSectionLabel / Divider max-height | `--motion-duration-5` | `--motion-easing-spring` |
| Sidebar width expand/collapse | `--motion-duration-6` (460ms) | `--motion-easing-emphasized` |
| Label/chevron max-width (rail header) | `--motion-duration-6` | `--motion-easing-emphasized` |
| Label/chevron opacity fade | `--motion-duration-3` | `--motion-easing-standard` |

> The earlier hardcoded values (e.g. sidebar width "380ms", accordion "340ms easeOutQuart") were drift; the running implementation used 460ms / 420ms, which now snap to `--motion-duration-6` / `--motion-duration-5`. The off-scale `easeOutQuart` (`0.22,1,0.36,1`) maps to `--motion-easing-accordion` (content reveal/hide, the spec's semantic for accordions). Overlay panel enter/exit + scrim live in §17.6 / nav-shell and are migrated with that component.

---

## 15. What to Pass Claude to Implement This Component

To implement SideNav from scratch with correct design system alignment, provide:

1. **This document**
2. **Figma variable export** from the [Pathway Design System file](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/): specifically the token values for `Fill/Contextual/NavItem/*`, `Text/Contextual/NavItem/*`, `Icon/Contextual/NavItem/*`, `Surface/Nav/Light`, `Fill/Static/Info/Subtle`, and `Component/NavItem/Large/Radius/Radius`
3. **Icon assets**: either the design system icon React component library, or SVG files for the fill-style icons embedded at build time
4. **Specific nav content**: the nav items, their labels, icon names, and which are groupers vs destinations

---

## 16. Figma Gaps: Blocks to Full Token-Driven Implementation

The following are gaps in the current Figma documentation that prevent a fully semantic implementation:

### 16.1 Missing spacing/layout tokens (HIGH priority)
Most spacing values now map to existing semantic tokens: `Padding/Base` (16px expanded H), `Padding/Medium` (12px collapsed H), `Padding/Tight` (8px container top / menu top), `Gap/XTight` (6px item gap), `Padding/XXWide` (56px bottom spacer). Remaining raw values with no token: stripe width (4px), row padding (8px), child indent (24px), collapse row padding, nav widths (240px / 72px), `Container.RowEnd` dimensions. **Recommend creating tokens** for these with semantic names like `Spacing/Nav/StripeWidth`.

### 16.2 Primitive token names not surfaced (MEDIUM priority)
`get_variable_defs` (Figma MCP tool) resolves semantic token alias chains to their final hex value but does not expose intermediate primitive token names. The full chain `Semantic → Primitive → Hex` cannot be reconstructed from MCP alone. This blocks documentation of the full token lineage. **Recommend:** either expose primitives in a dedicated Figma frame/page, or use the Figma REST API (`GET /v1/files/:key/variables`) which does return the full alias chain.

### 16.3 `Component/NavItem/Large/Radius/Radius` not in token file (LOW priority)
§3.5 cites `Component/NavItem/Large/Radius/Radius` for the item `border-radius` (8px). No `component/*` token family exists in `tokens/pathway-design-tokens.json`. The resolved value (8px) matches `Border/S` (assumed). Until this token is added in Figma and exported, implementations should fall back to `Border/S` or the raw value `8px`. Accepted as a documented gap — 2026-05-11 spec review.

### 16.4 Icon inner size token missing (LOW priority)
`Icon.Leading` inside `Container.LeadingIcon` renders at `16×16pt`. `Accessibility/Icon Wrapping/Large` documents the `24px` wrapper but there is no token for the inner icon size. Recommend `Accessibility/Icon/Leading/Size` or similar.

`Accessibility/Icon Wrapping/Large/Size` (cited in §3.5 for the 24×24px `Container.LeadingIcon` wrapper) does not exist as a named token in `tokens/pathway-design-tokens.json` — only `accessibility.touch-target.*` tokens are present. The 24×24px value is correct but is currently undocumented in the token file. Accepted as a documented gap — 2026-05-12 spec review.

### 16.5 indicator.stripe border-radius unconfirmed (LOW priority)
The stripe uses `border-radius: 0 8px 8px 0` (rounded right only). The `8px` is assumed to match `Border/S` (same as the item radius token) but has not been explicitly confirmed in Figma.

### 16.7 Grouper collapsed with no active child: state unconfirmed (LOW priority)
The state matrix above specifies that a collapsed grouper with **no** active child shows in Base state. This should be explicitly documented in the Figma component annotations to avoid ambiguity.

### 16.8 Collapse/Expand control: placement decision (APPROVED)

**Status:** Approved — Design System (Pathway), 2026-05-12. Supersedes prior "design debt" note.

Figma annotation: [view](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40004169-1511&t=C5AHPCaPqyhmnq3s-1)

#### Decision

Use the **anchored toggle pattern** (Pattern A): the collapse/expand control occupies a fixed slot anchored within the nav panel, with an icon and optional label. We do not use a floating edge handle (Pattern B).

The current implementation places this control as a **NavHeader at the top of the nav** (see §9). This satisfies Pattern A — the control is anchored inside the panel, right-aligned in the header row, with sticky positioning so it never scrolls out of view. The previous bottom-of-scroll-flow placement was migrated to the top on 2026-05-13.

#### Why Pattern A over Pattern B

Two patterns exist in production SaaS for side navigation collapse controls:

- **Pattern A (anchored toggle):** control in a fixed slot inside the panel (header row or bottom row), icon with optional label
- **Pattern B (edge handle):** floating control on the panel's right stroke, often a chevron pill, sometimes hover-revealed

Pattern A wins on every axis that matters for Pathway:

| Criterion | Pattern A | Pattern B |
|---|---|---|
| Accessibility | Sits in natural tab order; meets 44×44 touch target without extra work | Often 16–24px; hover-revealed variants fail keyboard and touch |
| Usability — touch | Scales identically | Fitts's edge advantage is mouse-only; disappears on touchscreens |
| Implementation | A button in a flex row | Requires absolute positioning, z-index, animation handoff, resize-boundary handling |
| Scalability | Works at every density; survives nested panels | Two edge handles compete for the same vertical line in nested nav patterns |
| Discoverability | Visible by default in a familiar location | Can look like extra chrome; hover-revealed variants fail visibility heuristics |
| Responsive | Folds cleanly into mobile overlay pattern | Needs full redesign for mobile |
| Industry adoption | VS Code, Figma, Linear, Notion, Slack, Jira, Asana, GitHub — dominant modern pattern | Confluence (historical), GitLab (older) — trending out |

**Decision rationale (condensed):**

1. **Pathway products have nested/stacked navigation.** Protections and Financials suites require primary + secondary nav patterns. Edge handles conflict in this configuration; anchored toggles do not.
2. **WCAG 2.2 AA is non-negotiable.** Anchored toggles meet 24×24 trivially and 44×44 without custom work. Edge handles routinely require intentional padding to pass.
3. **The Fitts's Law advantage of edge handles is narrow.** It applies only on desktop pointer devices when the panel is flush to the viewport edge. Pathway products run in browser tabs alongside other chrome and are sometimes embedded; the edge is not reliably "the edge."
4. **Implementation cost is materially lower.** No positioning logic, no animation handoff with panel transitions, no resize-boundary edge cases.
5. **Matches user expectations.** Every major productivity product our users already use (Slack, Notion, VS Code, etc.) uses this pattern. No learning tax.

#### Component specification (target state)

| Property | Value |
|---|---|
| Visual size | 32×32 |
| Hit area | 40×40 minimum (exceeds WCAG AA with margin) |
| Icon | `sidebar-collapse` / `sidebar-expand` pair, mirrored for RTL |
| States | default, hover, active, focus, disabled |
| Tooltip | "Collapse sidebar" / "Expand sidebar" |
| ARIA | `aria-expanded` reflecting panel state; `aria-controls` pointing to panel id |
| Label | Optional; hidden when panel is collapsed |
| Position (target) | Panel header row, right-aligned |

#### Redundant entry points (recommended)

Following VS Code and Figma practice, the collapse action should have multiple entry points: anchored toggle button (primary), keyboard shortcut (`Cmd/Ctrl + B`), and optionally a command palette entry. This lowers the stakes of any single placement and supports keyboard-first users.

#### Current vs. target placement gap

The current implementation positions the control as a **NavHeader at the top of the panel** (§9). This is Pattern A and is the approved pattern type. The placement migration from "bottom of scroll flow" to "panel header" was completed on 2026-05-13 — the control now stays visible regardless of scroll position. No further migration work is required for this control.

---

## 17. Responsiveness

Figma reference: [SideNav Responsiveness (WIP)](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40005913-173454&t=C5AHPCaPqyhmnq3s-1)

### 17.1 Breakpoints

All four required breakpoints exist as Figma variables:

| Name | Value | Variable token |
|---|---|---|
| Mobile | 393px | `Mobile 393px` |
| Tablet | 768px | `Tablet 768px` |
| Small desktop / large tablet | 1024px | `Small Desktop 1024px` |
| Desktop | 1440px | `Desktop 1440px` |

The 1024px breakpoint is the collapse/overlay threshold (see §17.2).

A fifth value (>1900px) exists in the variables panel but is unused and unconfirmed. 1900px is not a standard value: the nearest standards are 1920px (Full HD) and 2560px (2K). For a desktop-primary product this breakpoint is unlikely to be needed and should be reviewed before use.

### 17.2 SideNav behaviour per breakpoint

| Viewport | Default state | Expanded state layout | Can be fully hidden |
|---|---|---|---|
| ≥1024px Desktop | Expanded (240px) | **Push**: content shifts right | No |
| 768px–1023px Tablet | Collapsed (72px) | **Overlay**: 240px panel floats above content, scrim behind | No |
| <768px Mobile | **Hidden** (default) | **Overlay (240px)**: same drawer width as tablet, scrim behind | Yes: hamburger/close in global top nav |

**Key rules:**

**Desktop (≥1024px): in-flow, always visible:** SideNav occupies layout space. Expanded (240px) by default; user can collapse to 72px via the in-nav collapse button. Content shifts to accommodate whichever width is active.

**Tablet (768–1023px): overlay, always visible:** SideNav is collapsed (72px) by default and always in-flow. User can expand it, which causes it to float as a 240px overlay above the page content (with a scrim behind). Collapsing returns it to the 72px in-flow rail. The nav cannot be hidden at tablet: only collapsed or expanded.

**Mobile (<768px): hidden by default:** The SideNav is fully hidden on initial load. The hamburger control in the global top nav reveals it as a **240px overlay** with a scrim (same width as tablet). Closing via the top-nav close icon or tapping the scrim hides it again. **There is no 72px collapsed rail state on mobile**: the icon-only rail is unsuitable for touch screens (hover popovers don't apply) and consumes too much of a narrow viewport. **There is no collapse button inside the mobile overlay**: the TopNav hamburger/close is the sole toggle.

**Push vs overlay:** At ≥1024px, the SideNav is in the page's layout flow: it takes up width. Below 1024px, the SideNav floats as an overlay above the content: it does not shift the page. This is a page-shell concern, not a SideNav component property.

> **Implementation rule: layout architecture:** At ≥1024px: the page shell is `display: flex; flex-direction: row`. SideNav is a sibling of the content area with `width: 240px | 72px` and `flex-shrink: 0`. Content fills the remaining space. At <1024px: SideNav uses `position: fixed; left: 0; top: 64px; bottom: 0; width: 240px; z-index: 100` for the overlay panel. The 72px in-flow rail at tablet is a separate element; the 240px overlay slides over it. At <768px: there is no in-flow rail at all: only the overlay panel.

**Top nav variant:** The global top nav shows its full desktop layout at ≥768px (no hamburger). Below 768px it switches to the mobile layout (hamburger/close, app icon, ellipsis, avatar). See §17.4 for details.

### 17.3 States below 1024px

#### Tablet (768–1023px): two states

**Collapsed rail (72px): default at tablet:** SideNav is always visible as a 72px icon-only rail. Content fills the remaining width. Tap a grouped item to get a popover menu; tap a destination to navigate. This matches the `SideNav.Collapsed` touch-interaction pattern: Figma includes "Mobile: Tap Main Item" and "Mobile: Tap Grouper" instances in the `SideNav Instances/Interaction` frame specifically documenting this. (The "Mobile" label refers to touch/pointer context, not viewport size.)

**Expanded overlay (240px): triggered at tablet:** User expands the nav via the expand control. SideNav slides over the page content as a 240px-wide overlay. A scrim appears behind it. Tapping the scrim or the collapse control dismisses the overlay and returns to the 72px rail.

#### Mobile (<768px): two states only (no 72px collapsed rail)

**Hidden: default at mobile:** The SideNav is fully hidden on load. The hamburger icon (≡) appears in the global top nav. **There is no 72px collapsed rail on mobile.** The icon-only rail pattern is not appropriate for touch-only screens: hover popovers don't trigger, icon-only navigation is ambiguous at phone scale, and 72px represents ~20% of a 390px viewport.

**240px overlay: triggered at mobile:** Tapping the hamburger slides the SideNav in as a 240px drawer with a scrim behind it. On a 393px phone this leaves 143px of dimmed content visible: enough for users to understand and tap outside to dismiss. The global top nav shows the close icon (×). Tapping the scrim or the close icon hides the nav (returns to hamburger ≡). The SideNav **does not show a collapse button** inside the mobile overlay: there is nothing to collapse to.

**Overlay dismiss:** On tablet, tapping the scrim or the in-nav collapse button closes the overlay. On mobile, the top-nav hamburger/close toggle or tapping the scrim are the dismiss mechanisms. No swipe-to-dismiss gesture is specified.

### 17.4 Global top nav (TopNav.Global): out of scope, Figma reference

The global top navigation is a separate component not owned by this spec. The Pathway Design System has standardised on **TopNav.Global** (Figma node `40005504:55844`) — a **brand-blue (`Fill/Static/Brand/Base` → `#2d4889`)** nav bar with a fixed height of **56 px**. Full component documentation is maintained on the [TopNav Figma page](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40005504-55844).

**TopNav.Global slot layout (left → right) — as read from Figma 2026-05-13:**
- **Row Start:** SideNav control (mobile hamburger `menu`, hidden ≥768px via CSS) · ModuleSwitcher (Amplify Home icon + `expand_more` chevron, no text label) · OrgSwitcher (church logo 20×20 sq + "Sacred Heart Church-ITD | Knoxville" label + `expand_more` chevron; container has `stroke/action/tertiary/base` border)
- **Row End:** Search (48×48 wrapper → 32×32 circle button with `cornerradius/full:64px` and `search` icon) · Desktop: 2× Notifications bell (`notifications` Material Symbol, 48×48 each) | Tablet+Mobile: `more_vert` (48×48) · Profile (32×32 circle, `Fill/Static/Accent_Amethyst/Base #dcd9ef`, "JL" in `#221e3f`)

**Breakpoint variants (Figma node IDs):**
- Desktop 1440px: `40007103:17678` — `justify-content: space-between`, right slot `width: 216px`
- Tablet 768px: `40007067:8151` — `px: 12px`, right slot has `more_vert` instead of 2 bells
- Mobile 393px: `40007067:8205` — hamburger appears left, org label truncates to `max-width: 80px`

**Height and z-index:**
- Height: 56 px (54 px on tablet per Figma, unified to 56 px in implementation)
- `position: fixed; top: 0; left: 0; right: 0; z-index: 100`
- SideNav overlay sits at z-index 100 (same layer — overlay panels appear inside the body area, not above the top nav)
- Dropdown menus from the top nav sit at z-index 200

**Icons:** All TopNav icons use **Material Symbols Rounded** (Google Fonts CDN, FILL 0, wght 300). Exception: the Amplify Home module icon and the church org logo are branded image assets (Figma CDN URLs, expire ~7 days — replace with stable CDN in production).

**SideNav integration at breakpoints:**

**At ≥768px (desktop/tablet layout):** Full nav bar. No hamburger. SideNav cannot be hidden at these sizes.

**At <768px (mobile layout):** Hamburger button (`.topnav__sidenav-control`) becomes visible via CSS (`display: none !important` by default → `display: flex !important` at `max-width: 767px`). Tapping the hamburger calls `onSideNavToggle` which opens the 240 px overlay drawer. Closing via scrim tap calls the same handler. The icon state is managed by the App shell, not inside TopNav.Global.

**Demo HTML reference:** `components/sidenav/sidenav.html` integrates TopNav.Global as of 2026-05-13 (rebuilt from Figma MCP read on that date).

This spec does not prescribe anything about the top nav's visual design, tokens, or other interactions beyond the integration points above.

### 17.5 Figma component variant guidance

A single `SideNav.Local` component covers all breakpoints. No separate mobile or desktop variants are needed: the component structure and tokens are identical across all sizes.

For designers building screens, expose a `layout` component property with two values:

- `push`: use in desktop frames (≥1440px). SideNav sits in flow, content shifts right.
- `overlay`: use in tablet and mobile frames (<1024px). SideNav floats above content when expanded.

Pair this with a `state` property: `expanded` / `collapsed` / `hidden` to represent the three states in §17.3. This gives designers everything they need to accurately represent any SideNav state at any breakpoint without a separate component.

### 17.6 Overlay enter/exit animation

The overlay panel (`.overlay-panel`) uses CSS transitions rather than one-shot keyframe animations. The overlay container always remains in the DOM when `!isDesktop`, and `.overlay-panel--open` class is toggled to drive both the enter and exit transitions. This is intentional: keyframe animations only play on insertion; a CSS transition reverses smoothly when the class is removed, giving a proper exit without instant-removal flash.

The overlay uses **asymmetric enter/exit transitions**: the enter is slower and decelerated (`--motion-duration-5` transform / `--motion-duration-4` opacity, `--motion-easing-decelerate`) to feel intentional; the exit is snappier and accelerated (`--motion-duration-4` / `--motion-duration-3`, `--motion-easing-accelerate`) to stay out of the user's way. This is achieved by placing the exit `transition` on the base class and the enter `transition` on the `--open` modifier: CSS always uses the destination state's transition property.

> **Motion override — intentional:** The overlay enter transform uses `--motion-duration-5` (380ms), one step above the `--motion-duration-4` used for most in-component transitions. This is deliberate for a full-height panel entering the viewport: a 300ms enter feels abrupt at this physical scale, while 380ms reads as purposeful. The enter is **decelerated, not springy** — at the scale of a full-height panel, overshoot would feel unstable; `--motion-easing-decelerate` glides it cleanly into rest. The exit drops to `--motion-duration-4` and accelerates out — exits should be snappier than enters to stay out of the user's way.

**Enter (`.overlay-panel--open` added):**

| Property | Value |
|---|---|
| Transform | `translateX(-110%)` → `translateX(0)`: 110% hides any shadow bleed |
| Opacity | `0` → `1` |
| Transform duration | `--motion-duration-5` (380ms) |
| Opacity duration | `--motion-duration-4` (300ms) |
| Easing | `--motion-easing-decelerate` (eases into resting position, no overshoot) |

**Exit (`.overlay-panel--open` removed):**

| Property | Value |
|---|---|
| Transform | `translateX(0)` → `translateX(-110%)` |
| Opacity | `1` → `0` |
| Transform duration | `--motion-duration-4` (300ms) |
| Opacity duration | `--motion-duration-3` (200ms) |
| Easing | `--motion-easing-accelerate` (exits with intent) |

**Scrim (`.overlay-scrim`):** Opacity `0` → `1` on show, `1` → `0` on dismiss. `--motion-duration-4` · `--motion-easing-standard`. `pointer-events: none` when invisible (no click-through).

**Reduced motion (`prefers-reduced-motion: reduce`):** Transform is suppressed (`transform: none !important`). Only opacity fades remain, shortened to `--motion-duration-2` · `--motion-easing-linear`.

```css
.overlay-panel {
  position: fixed; left: 0; bottom: 0; z-index: 100;
  transform: translateX(-110%);
  opacity: 0; pointer-events: none;
  will-change: transform;
  /* EXIT transition: fires when .overlay-panel--open class is removed */
  transition:
    transform var(--motion-duration-4) var(--motion-easing-accelerate),
    opacity   var(--motion-duration-3) var(--motion-easing-accelerate);
}
.overlay-panel--open {
  transform: translateX(0); opacity: 1; pointer-events: auto;
  /* ENTER transition: fires when .overlay-panel--open class is added */
  transition:
    transform var(--motion-duration-5) var(--motion-easing-decelerate),
    opacity   var(--motion-duration-4) var(--motion-easing-decelerate);
}

.overlay-scrim {
  position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32); z-index: 99;
  opacity: 0; pointer-events: none;
  transition: opacity var(--motion-duration-4) var(--motion-easing-standard);
}
.overlay-scrim--visible { opacity: 1; pointer-events: auto; }

@media (prefers-reduced-motion: reduce) {
  .overlay-panel, .overlay-panel--open { transform: none !important; transition: opacity var(--motion-duration-2) var(--motion-easing-linear); }
  .overlay-scrim { transition: opacity var(--motion-duration-2) var(--motion-easing-linear); }
}
```

**Figma:** Static states only. Animation is a code concern; it does not need Figma component variants. Use `overlay` + `expanded` variant to represent the open state in designs.

### 17.7 Scrim (backdrop overlay)

A semi-transparent scrim is shown behind the SideNav whenever it is in expanded-overlay mode (below 1024px viewport width). The scrim communicates that the page content is temporarily inaccessible and draws focus to the open SideNav panel.

**Scrim spec:**

| Property | Value | Notes |
|---|---|---|
| Colour | `rgba(0, 0, 0, 0.32)` | 32% black: standard modal-overlay opacity |
| Position | `position: fixed; top: 56px; left: 0; right: 0; bottom: 0` | Sits below TopNav.Global (56 px tall) |
| Z-index | `99` | Behind SideNav overlay (`z-index: 100`), above page content |
| Enter animation | Opacity `0` → `1`, `--motion-duration-4` · `--motion-easing-standard` | Synchronised with nav slide-in |
| Exit animation | Opacity `1` → `0`, same duration and easing | CSS transition reversal: scrim stays in DOM |

**Breakpoint rules:**

- **<768px (Mobile):** Scrim **shown**. The overlay is 240px wide, leaving page content visible to the right: the scrim dims that content and provides the tap-outside-to-dismiss affordance.
- **768px–1023px (Tablet):** Scrim shown. Same 240px overlay width; same scrim behaviour.
- **≥1024px:** No overlay mode; no scrim.

**Interaction:** Tapping the scrim dismisses the SideNav overlay (returns to 72px collapsed rail). This is the standard mobile drawer tap-outside pattern. The in-nav collapse button is the alternative dismiss path.

---

## 18. AI Agent Implementation Guide

This section is for any AI agent implementing this component: Figma Make, Lovable, v0, Claude, Cursor, GitHub Copilot, or equivalent. It is a self-contained brief: read it alongside the sections cited.

---

### 17.1 Reference files

| File | What it is |
|---|---|
| `sidenav-figmamake.html` | The interactive React prototype: same component as the full demo but without the spec annotations panel. Use this as the live visual and behavioural reference. It is responsive: resize the browser to see all three breakpoint states. Auto-synced from `sidenav.html` on every push. |
| `sidenav-spec.md` (this file) | Token values, anatomy, state matrix, interaction, accessibility, responsiveness. The authoritative source for all implementation decisions. |

Both files are needed. The HTML shows you what it looks like and how it behaves. The spec tells you the exact values and rules behind every decision.

---

### 17.2 How to specify nav items

```
Items (in order):
Elephant (grouper): Rebecca, Elisa, Monica, Marguerite
Giraffe (destination)
Lion (grouper): Florence, Gabrielle
Zebra (destination)
```

- `(grouper)`: Level 0 item with children. Children are always Level 1 Destination items.
- `(destination)`: Level 0 leaf item, no children.
- Children are listed after the colon, in order.

---

### 17.3 TopNav: always implement alongside SideNav

TopNav and SideNav are a single shell. Never implement one without the other.

| Property | Value |
|---|---|
| Height | 64px |
| Background | `#0f3e80` (Brand Colors/Dark Cerulean) |
| Left: desktop (≥1024px) | Logo icon (32×32, `rgba(255,255,255,0.13)` bg, 6px radius) + "Amplify" (14px/600/white) + "Ministry Brands" (10px/400, `rgba(255,255,255,0.69)`) |
| Left: tablet/mobile | Hamburger (≡) or close (×) button (40×40, `rgba(255,255,255,0.08)` bg, 8px radius), then logo |
| Right | App-switcher button (40×40, same bg) + Avatar (32×32 circle, `#5a7fc0`) |
| Hamburger shows when | Nav is hidden or collapsed at tablet/mobile |
| × shows when | Nav overlay is open at tablet/mobile |

---

### 17.4 CollapseButton: do not skip

> The CollapseButton renders at **all breakpoints ≥768px**, in **both** the 240px and 72px sidebar states. It is absent only on mobile (<768px).

| Sidebar state | Renders? | Icon | Label |
|---|---|---|---|
| Expanded 240px, ≥768px | ✓ Yes | `collapse_nav` | "Collapse": visible |
| Collapsed 72px, ≥768px | ✓ Yes | `expand_nav` | Hidden (no room) |
| Mobile overlay <768px | ✗ No |: |: |

Anatomy: 1px divider (`#edf0f9`) above it · `pl-12px` (not `px-8px`) · no `indicator.stripe` column · scrolls with content, not sticky. Full detail at §9.

---

### 17.5 Trail-collapsed state: do not skip

> When a grouper is closed and one of its children is the active destination, the grouper itself shows **Trail-collapsed** state. This looks identical to Active state.

**Trigger logic:** `isTrailCollapsed = grouper has an active child AND (grouper is closed OR sidebar is collapsed to 72px)`

Concrete example: user clicks "Hyena" (child of Elephant). Elephant's children show, Hyena is active. User then collapses Elephant. Elephant's children hide. Elephant now shows Trail-collapsed: same background fill, same stripe, same text/icon colour as if Elephant itself were active.

| Property | Token | Value |
|---|---|---|
| Background | `Fill/Contextual/NavItem/Active` | `#a0b5e629` |
| Text | `Text/Contextual/NavItem/Active` | `#1b2d57` |
| Icon | `Icon/Contextual/NavItem/Active` | `#2d4889` |
| `indicator.stripe` | visible | `#2d4889` |

This applies whether the sidebar is 240px or 72px. Full detail at §6 and §7.

---

### 17.6 Prompt template

```
Using components/sidenav/sidenav-figmamake.html as the visual reference and
components/sidenav/sidenav-spec.md as the specification, implement a responsive
prototype with TopNav + SideNav.

Nav items (in order):
[your list: see §17.2 for format]

Icons:
[your icon names / attach SVG files — nav item icons render at 16px inside 24px wrapper]

Requirements — implement all of these, do not skip any:

1. TopNav and SideNav together as a single shell. Never one without the other.

2. NavHeader inside the SideNav at all breakpoints ≥768px, in both expanded
   and collapsed states. On mobile (<768px) it is hidden. In the collapsed 72px
   state the action icon is centered (left_panel_open, 12×12). In the expanded
   240px state the action icon is right-aligned (right_panel_open, 12×12). It
   sits at the TOP of the nav, is sticky, and has a 1px divider below it.

3. Trail-collapsed state: when a grouper's child is active and the grouper is
   closed (or sidebar is 72px collapsed), the grouper shows Active-state styling:
   same background fill, stripe indicator, text and icon colour as an active item.

4. Main content area — copy the placeholder structure from the HTML exactly:
   - A page heading (<h1>) showing the active nav item name + its icon.
     This updates dynamically on every nav click.
   - Three empty card containers in a row with dashed borders.
   - One wider empty card container below them.
   DO NOT add a welcome message, org name, product description, feature list,
   or any other custom text. Do not write "Welcome to [anything]".
   The heading is the only text, and it comes from the nav item name.

5. Collapsed sidebar width: 72px (not 64px). Expanded: 240px.

6. Nav item icons: 16px inside a 24×24 wrapper. NavHeader/CollapseButton action icon: 12px.
   These are two different sizes — do not use 16px for the action icon.

Match all spacing, colours, states, and responsive breakpoints from the spec.

Before submitting, verify this checklist — these two are the most commonly skipped:

[ ] NavHeader (collapse/expand control) is visible at the TOP of the SideNav at
    all viewports >=768px. Check BOTH states: expanded 240px (right_panel_open
    icon right-aligned, 12px) and collapsed 72px rail (left_panel_open icon
    centered, 12px). It must be absent only on mobile (<768px). If you cannot
    see a collapse/expand icon at the top of the nav in your desktop or tablet
    preview, it is missing. Note: NavHeader is at the TOP, not the bottom.

[ ] At 768-1023px viewport the SideNav renders as a 72px icon-only rail in the
    normal page flow by default — it is NOT hidden, and NOT treated as mobile.
    The main content fills the remaining width to the right of the 72px rail.
    Only after the user taps the expand icon does the 240px overlay appear.
    Treating this breakpoint as mobile (hiding the nav entirely) is wrong.
```

---

## 19. Storybook

The SideNav component is live in Storybook. Stories are located at `src/stories/Library/SideNav/`.

| Story | Purpose |
|---|---|
| `Playground` | Fully interactive demo with Controls panel (active item, collapsed state, hide collapse button) |
| `Collapsed` | 72px icon-only rail — hover to see tooltips and flyout popovers |
| `StateMatrix` | Visual grid of all five nav item states |
| `NavItemExplorer` | Single isolated nav item with per-state controls |
| `TokensFill` | Fill token swatches with hex values |
| `TokensText` | Text colour token swatches |
| `TokensIcon` | Icon colour token swatches |
| `TrailComparison` | Expanded vs. collapsed trail states side-by-side |
| `StandaloneDemo` | Full responsive HTML demo iframed (includes TopNav, responsive breakpoints) |

Deployed at: `https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/components-sidenav--docs`

