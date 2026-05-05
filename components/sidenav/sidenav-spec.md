# SideNav: Pathway Design System Component Spec

**Status:** `REVIEWED` (authored and reviewed by Jo Lopez, 2026-04-17)

Complete implementation reference for the SideNav component. Covers anatomy, design tokens, states, spacing, interaction patterns, and accessibility. Use alongside the [Figma source](#figma-source) for a pixel-accurate build.

---

## 1. Component Overview

`SideNav.Local` is a persistent vertical panel used across all modules in Ministry Brands Amplify: a church management product. It renders the primary navigation tree for a given module and communicates the user's current location within that tree at all times.

It is **not** global app navigation or top-level product navigation. Each module has its own SideNav instance. It is also not used for action buttons or CTAs: navigation only.

It supports two levels of depth: Level 0 (parent) and Level 1 (child). Level 1 items are always leaf destinations: they never group or expand further. This is a hard constraint enforced at the data layer, not just a design convention.

The component supports two layout states: **expanded** (250px wide, icons and labels visible) and **collapsed** (72px wide, icons only).

### Figma source
- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **SideNav component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003951-2927)

---

## 1.1 Governance: where things live

Use this table when you need to find or change something. Every row points to the single location that owns that decision.

| To change… | Owner | Where |
|---|---|---|
| SideNav item colours, typography, spacing tokens | Figma: SideNav component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003951-2927) |
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
| Scroll and overflow behaviour | This spec | §9.1 |
| Responsive breakpoints and SideNav behaviour per viewport | This spec | §16 |
| Overlay vs push layout mode | This spec | §16.2 |
| Mobile states (hidden / overlay / collapsed: hidden is mobile-only <768px) | This spec | §16.3 |
| Overlay enter animation (duration, easing, reduced-motion) | This spec | §16.6 |
| Scrim colour, breakpoint rules, and interaction | This spec | §16.7 |
| Known design gaps and deferred decisions | This spec | §15 |

**Rule:** if a decision isn't in the table above, check §15 (gaps). If it's not there either, it hasn't been specified yet: add it to the spec before implementing.

---

## 2. Component Anatomy

```
SideNav.Container
└── SideNavMenu
│   ├── SideNavItem (Level 0: Destination)
│   ├── SideNavItem (Level 0: Grouper, expanded)
│   │   ├── SideNavItem (Level 1: child Destination)
│   │   └── SideNavItem (Level 1: child Destination)
│   └── SideNavItem (Level 0: Destination)
└── Collapse_Expand_Nav_Container
    ├── Divider
    └── Collapse (SideNavItem-like row, no indicator stripe)
```

### SideNavItem internal structure

**Level 0:**
```
[container.indicator 4px] [Container.rowStart px-8]
  [Container.Main]
    [Container.LeadingIcon 24×24] → [Icon.Leading 14×14]
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

The `SideNav.Container` comes in two visual variants that control whether a visible border separates the nav panel from the page content. Both variants are available for the **expanded** (250px) and **collapsed** (72px) layout states, giving four possible combinations in total.

### Default (unstroked)

The nav surface (`#fafafa`) sits flush against the page background with no drawn border between them. This is the default option and should be used when the module's layout already creates sufficient visual separation: for example, when the page canvas uses a distinct background colour, or when a shadow or depth effect is present.

### Stroked

A 1px right-hand border (`border-right: 1px solid #edf0f9`) is rendered on the nav container. The stroke colour is `Fill/Static/Info/Subtle` (`#edf0f9`): the same token used for the horizontal divider above the collapse control. This provides a visible, low-contrast seam between the nav and the content area.

Use the stroked variant when modules need an explicit visual boundary: for example, when the page content background is also `#fafafa` (identical to the nav surface) and the two areas would otherwise appear merged.

| Variant | Applies to | Token | Value |
|---|---|---|---|
| **Unstroked** | Expanded + Collapsed | *(no border)* |: |
| **Stroked** | Expanded + Collapsed | `Fill/Static/Info/Subtle` | `#edf0f9` |

> **Usage guidance:** Neither variant is "correct": the choice belongs to the individual module team, not the design system. Use the variant that produces the clearest visual hierarchy for that module's specific page backgrounds.

> **Figma:** Both variants (Expanded/Stroked, Expanded/Unstroked, Collapsed/Stroked, Collapsed/Unstroked) are available as separate component instances in the SideNavComponents frame.

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
| `Fill/Contextual/NavItem/Hover` |: | `#1111110a` *(≈ rgba 17,17,17 / 4%)* | Hover fill |
| `Fill/Contextual/NavItem/Active` |: | `#3555a014` *(≈ rgba 53,85,160 / 8%)* | Active destination + collapsed-trail grouper |
| `Fill/Contextual/NavItem/Trail` |: | `#11111105` *(≈ rgba 17,17,17 / 2%)* | Expanded grouper fill: **distinct token from Hover** |
| `Fill/Static/Info/Subtle` |: | `#edf0f9` | Divider (`h-[1px]`) + nav container `border-right` |

> **Note:** `Fill/Contextual/NavItem/Trail` and `Fill/Contextual/NavItem/Hover` have **diverged**: they now resolve to different alpha values (Hover `#1111110a` ≈ 4%, Trail `#11111105` ≈ 2%). Keep them as separate tokens and do not merge.

> **⚠ Gap:** Primitive token names are not surfaced by `get_variable_defs`: the tool resolves alias chains to final hex only. The full `Semantic → Primitive → Hex` chain requires the Figma REST API or a dedicated token documentation frame.

### 3.3 Text (NavItem states)

| Semantic Token | Primitive | Resolved Value | Used In |
|---|---|---|---|
| `Text/Contextual/NavItem/Base` |: | `#363636` | Label default |
| `Text/Contextual/NavItem/Hover` |: | `#252525` | Label hover |
| `Text/Contextual/NavItem/Active` |: | `#051428` | Active destination **and** all trail states |

> Trail text color = `Text/Contextual/NavItem/Active`. This applies to both **expanded** trail (grouper showing children) and **collapsed** trail (grouper with hidden active child). Do not use `Text/Contextual/NavItem/Base` for trail.

### 3.4 Icon (NavItem states)

| Semantic Token | Primitive | Resolved Value | Used In |
|---|---|---|---|
| `Icon/Contextual/NavItem/Base` |: | `#4b4b4b` | Icon default + expanded-trail icon |
| `Icon/Contextual/NavItem/Hover` |: | `#363636` | Icon hover |
| `Icon/Contextual/NavItem/Active` |: | `#3555a0` | Active icon + collapsed-trail icon + `indicator.stripe` color |

> `Icon/Contextual/NavItem/Active` (`#3555a0`) is used for **three things simultaneously**: the leading icon, the indicator stripe, and the collapsed-trail icon. They share the same token.

> Expanded trail icon = `Icon/Contextual/NavItem/Base` (`#4b4b4b`). Do not use active blue for expanded trail icons.

### 3.5 Geometry

| Semantic Token | Primitive | Resolved Value | Usage |
|---|---|---|---|
| `Component/NavItem/Large/Radius/Radius` | `Border/S` | `8px` | Item `border-radius` |
| `Accessibility/Touch Target/Optimal/Size` |: | `48px` | Item `min-height` |
| `Accessibility/Icon Wrapping/Large/Size` |: | `24×24px` | `Container.LeadingIcon` dimensions |

### 3.6 Typography

All `SideNavItem` labels at all levels use **the same** text style. There is no size variation between Level 0 and Level 1 items.

#### Semantic token: `Label/Menu/L/Medium`

> **Note on naming:** The Figma variable set abbreviates the size tier as `L` (not `Large`). The full canonical token name is `Label/Menu/L/Medium`.

| Property | CSS Variable (from Figma code output) | Resolved Value |
|---|---|---|
| Font family | `--label/menu/l/medium/fontfamily` | `'Red Hat Text', sans-serif` |
| Font weight | `--label/menu/l/medium/fontweight` | `500` (Medium) |
| Font size | `--label/menu/l/medium/fontsize` | `16px` |
| Line height | `--label/menu/l/medium/lineheight` | `22px` |
| Letter spacing | `--label/menu/l/medium/letterspacing` | `0px` |

#### Implementation (CSS)

```css
/* Using CSS custom properties */
.sidenav-label {
  font-family: var(--label/menu/l/medium/fontfamily, 'Red Hat Text', sans-serif);
  font-weight: var(--label/menu/l/medium/fontweight, 500);
  font-size: var(--label/menu/l/medium/fontsize, 16px);
  line-height: var(--label/menu/l/medium/lineheight, 22px);
  letter-spacing: var(--label/menu/l/medium/letterspacing, 0px);
}

/* Hard-coded fallback (no token system) */
.sidenav-label {
  font-family: 'Red Hat Text', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: 0px;
}
```

> **Google Font:** `Red Hat Text` must be loaded via `@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600&display=swap')` or equivalent if not already provided by the app shell.

> **No font-size variation** between Level 0 and Level 1 items. The visual hierarchy of child items is achieved solely through the `pl-[24px]` left-indent and the absence of a leading icon: not via smaller text.

---

## 4. Layout & Spacing

> **⚠ Gap:** The values in this section appear as raw Tailwind utility classes in Figma (`px-[12px]`, `gap-[8px]`, etc.) with **no named spacing/layout tokens**. This is a documentation gap in the design system. Recommend creating spacing tokens for these values so implementations can reference them semantically.

| Value | Figma class | px | Semantic token |
|---|---|---|---|
| Nav container horizontal padding | `px-[12px]` | 12 | **None** |
| Nav container vertical padding | `py-[14px]` | 14 | **None** |
| SideNav expanded width |: | 250 | **None** |
| SideNav collapsed width |: | 72 | **None**: breaks down as 12px left padding + 48px item + 12px right padding |
| Gap between nav items | `gap-[8px]` | 8 | **None** |
| SideNavMenu bottom padding | `pb-[24px]` | 24 | **None** |
| `Container.rowStart` horizontal padding | `px-[8px]` | 8 | **None** |
| `text.label` horizontal padding | `px-[6px]` | 6 | **None** |
| Level 1 `container.main` left indent | `pl-[24px]` | 24 | **None** |
| `indicator.stripe` width |: | 4 | **None** |
| `indicator.stripe` border-radius (right only) |: | `0 8px 8px 0` | Assumed `Border/S`: **unconfirmed** |
| Collapse row left padding | `pl-[12px]` | 12 | **None** |
| Collapse row right padding | `pr-[8px]` | 8 | **None** |
| `Collapse_Expand_Nav_Container` top padding / gap | `pt-[4px]` `gap-[4px]` | 4 | **None** |
| Icon.Leading inner size (nav items) |: | 14 | **None**: `Accessibility/Icon Wrapping/Large` covers 24px wrapper only |
| CollapseButton icon size (collapse/expand nav) |: | 18 | **None**: separate icon, distinct from nav item Icon.Leading (see §9) |
| `Container.RowEnd` dimensions |: | 40×24px | **None** |
| `Container.RowEnd.Icon` dimensions |: | 24×24px | `Accessibility/Icon Wrapping/Large` |
| Chevron icon size |: | 10pt | **None** |

---

## 5. Item Variants

### Level 0: Destination
- Has `Container.LeadingIcon` (24×24) with `Icon.Leading` (14pt fill-style icon)
- **No `Container.RowEnd`**: destinations omit the right-side container entirely. Only groupers have a `Container.RowEnd`.
- Interacts: click → sets active state

### Level 0: Grouper
- Has `Container.LeadingIcon` (24×24) with `Icon.Leading` (14pt fill-style icon)
- Has `Container.RowEnd` (40×24): **contains chevron** (10pt)
- Chevron direction: **▼ down** when collapsed, **▲ up** when expanded
- Interacts: click → toggles expand/collapse (does not navigate)

### Level 1: Child (always Destination)
- Uses `child.container` wrapper
- **No** `Container.LeadingIcon`, **no** icon of any kind
- `container.main` has `pl-[24px]` left indent to create visual hierarchy
- Same font (`Label/Menu/Large/Medium`) as Level 0
- Always a destination, never a grouper
- Only 2 levels of depth allowed

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
5. `indicator.stripe` color = `Icon/Contextual/NavItem/Active` (`#3555a0`): same token as icon active.

> **Standalone implementation rule: Trail-collapsed:** When a grouper is closed and any of its children is the active destination, apply **exactly the same 5 token values as Active state** to the grouper row: fill `#3555a014`, text `#051428`, icon `#3555a0`, stripe visible `#3555a0`. Trail-collapsed and Active are visually indistinguishable. The only difference is semantic: Active applies to a leaf destination; Trail-collapsed applies to a grouper whose active descendant is hidden. This rule applies whether the sidebar is 250px expanded or 72px collapsed.

---

## 7. `indicator.stripe` Sub-component

```
container.indicator (structural, 4px wide, full item height)
└── indicator.stripe (visible stripe)
    border-radius: 0 8px 8px 0   ← rounded on right only
    width: 4px
    color: var(--icon/contextual/navitem/active, #3555a0)
    padding: 4px 0  (top/bottom inset within container)
```

The `container.indicator` column is **always present** on every `SideNavItem` (Level 0 and Level 1). It is a structural 4px spacer. The `indicator.stripe` inside it is only visually painted when the item is in Active or Trail-collapsed state.

> **Implementation rule:** `container.indicator` must exist in the DOM / component tree at all times for every SideNavItem: it is not conditionally rendered. Only the visual paint of `indicator.stripe` is conditional (via `background: transparent` when hidden, `background: #3555a0` when visible). Removing the column from the DOM when hidden will cause layout shift as items jump 4px when the stripe appears.

---

## 8. SideNav Container

### 8.1 Surface
- Background: `Surface/Nav/Light` → `#fafafa`
- Right border: `1px solid` `Fill/Static/Info/Subtle` → `#edf0f9`

### 8.2 Dimensions & Padding
```
Expanded:  width 250px, padding 14px 12px
Collapsed: width  72px, padding 14px 12px (same, text hidden)
```
> No semantic tokens for width or padding: see §4 for gap documentation.

### 8.3 Transition
```
width: transition 0.36s cubic-bezier(0.4, 0, 0.2, 1)
```

**Label and chevron fade:** Item labels, chevrons, and the CollapseButton "Collapse" text are always present in the DOM. They fade out/in using `max-width` + `opacity` transitions so text does not pop-in at full opacity inside the still-narrow container during an expand animation.

| Element | Collapsed value | Expanded value | Transition |
|---|---|---|---|
| Label `max-width` | `0` | `200px` | `0.32s cubic-bezier(0.4,0,0.2,1)` |
| Label `opacity` | `0` | `1` | `0.18s ease` |
| Chevron `max-width` | `0` | `40px` | `0.32s cubic-bezier(0.4,0,0.2,1)` |
| Chevron `opacity` | `0` | `1` | `0.18s ease` |
| CollapseButton label `max-width` | `0` | `120px` | `0.32s cubic-bezier(0.4,0,0.2,1)` |
| CollapseButton label `opacity` | `0` | `1` | `0.18s ease` |

---

## 9. Collapse_Expand_Nav_Container

Sits at the **bottom of the scroll flow**: it scrolls with the nav items, it is not sticky/fixed.

```
Collapse_Expand_Nav_Container
├── Divider
│   height: 1px
│   background: Fill/Static/Info/Subtle (#edf0f9)
└── Collapse row
    container.rowStart: pl-[12px] pr-[8px]   ← note: different padding from SideNavItem
    └── container.main
        ├── Icon wrapper 24×24: collapse_nav icon (18pt)
        └── text.label px-[6px]: "Collapse"
    container.rowEnd: empty (no chevron)
```

**Key difference from `SideNavItem`:** The Collapse row does **not** have a `container.indicator` / `indicator.stripe` column. It also uses `pl-[12px]` instead of the item's `px-[8px]`.

**Visibility rule:** The CollapseButton is rendered at **all desktop and tablet breakpoints (≥768px)** regardless of whether the sidebar is expanded or collapsed. It is only hidden on mobile (<768px), where the TopNav hamburger is the sole toggle and there is no 72px rail state.

| Sidebar state | Button rendered? | Icon | Label |
|---|---|---|---|
| Expanded (250px, ≥768px) | ✓ Yes | `collapse_nav` | "Collapse": visible |
| Collapsed (72px rail, ≥768px) | ✓ Yes | `expand_nav` | Hidden (no room at 72px width) |
| Mobile overlay (<768px) | ✗ No |: |: |

Icons are fill-style from the design system (`collapse_nav`, `expand_nav`), not generic chevrons.

---

## 9.1 Overflow and scroll behaviour

The nav container uses `overflow-y: auto`. When the nav item list grows long enough to exceed the viewport height, a scrollbar appears inside the nav container.

### Expanded sidebar

- A vertical scrollbar appears inside the 250px nav container.
- All nav items remain accessible by scrolling.
- The **Collapse button scrolls with the content**: it is not sticky. As content grows, the button is pushed below the fold and requires scrolling to reach. This is acknowledged design debt; see §15.8.
- The scrollbar uses a 4px custom track (`background: rgba(0,0,0,0.12)`) and does not visually intrude on item layout.

### Collapsed sidebar

- Same `overflow-y: auto` behaviour. A scrollbar appears inside the 72px nav container.
- The scrollbar (4px) overlaps the right edge of the container but does not affect icon centering, as icons are centred within their 48×48px hit area with 12px padding each side.
- The **Collapse button (expand icon in this state) is again not sticky** and scrolls with content.

### Popovers and tooltips when the sidebar is scrolled

Because `CollapsedTooltip` and `CollapsedPopover` are rendered via portal (`document.body`) using `position: fixed` with coordinates from `getBoundingClientRect()`, their position is always relative to the **viewport**, not the scroll container.

This means:

- If the user opens a popover/tooltip and then scrolls the nav, the overlay does **not** follow the item: it stays at its original screen position until dismissed.
- In practice this is not an issue: the popover/tooltip is shown on hover and dismissed on mouse leave (300ms delay). A user cannot simultaneously hover an item and scroll the nav without triggering the leave event.
- If a scroll event causes an item to move out of view, the popover closes via the normal mouse-leave path.

### Figma gap

The overflow/scroll behaviour is not annotated in Figma. The nav container is designed at a fixed height showing all items in frame. The collapse button stickiness question (§15.8) is the primary open design decision in this area.

---

## 10. Sidebar Collapsed State

### 10.1 Container

| Property | Value | Token |
|---|---|---|
| Width | 72px | None: raw value |
| Padding | `12px` horizontal, `14px` vertical | None |
| Background | `#fafafa` | `Surface/Nav/Light` |
| Border-right | `0.5px solid #edf0f9` | `--border-width/xs` + `Fill/Static/Info/Subtle` |
| Item gap | `8px` | None |

The 72px breaks down as: 12px left padding + 48px item + 12px right padding. Items are 48×48px squares.

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
| **Destination** (no children) | Show `CollapsedTooltip`: label only, positioned to the right |
| **Grouper** (has children) | Show `PopoverMenu`: section label + children list |

Both appear with an **8px gap** from the container's right edge (`left: calc(100% + 8px)`).

#### CollapsedTooltip

| Property | Value | Token |
|---|---|---|
| Background | `white` | `Fill/Static/Neutral/White` |
| Border | `0.5px solid #f6f6f6` | `Stroke/Static/Neutral/Light` |
| Border radius | `8px` | `Border/Radius/S` |
| Shadow | `2px 2px 8px 0px rgba(0,0,0,0.03)` |: |
| Padding | `6px 8px` |: |
| Typography | 14px / 400 / 20px / 0.02px | `Text/Body/S/Regular` |
| Text colour | `#252525` | `Text/Static/Primary/Base` |
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
| Text colour (base) | `#363636` | `Text/Contextual/NavItem/Base` |
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

**Required implementation pattern:** The `CollapsedTooltip` and `CollapsedPopover` must be rendered outside the nav's DOM subtree (e.g. via `ReactDOM.createPortal` into `document.body`) using `position: fixed` with coordinates calculated at open time from `getBoundingClientRect()` on the trigger element. The hover-safe bridge element must also use `position: fixed` for the same reason.

This is a CSS architectural constraint, not a Figma design concern. No Figma annotation is needed.

---

## 11. Iconography

- All leading icons are **fill-style** (solid/filled, not outline)
- Icons live at `14×14pt` inside a `24×24pt` `Container.LeadingIcon` wrapper
- Icon source: [design system iconography page](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002909-32275)
- **Figma CDN asset URLs cannot be used directly in browsers**: they require auth headers that only the Figma MCP server provides. Implementations must either use the design system icon component library or embed SVG assets at build time.

### Accounting SideNav icon mapping

| Nav Item | Icon name | Grouper |
|---|---|---|
| Applications | `apps` | ✓ |
| Enter | `add_doc` |: |
| Manage | `tune` (Vector) |: |
| View | `view` (eye Vector) | ✓ |
| Reports | `reports` |: |
| Modify | `table_edit` | ✓ |
| Help | `help` (Vector) |: |

---

## 12. Interaction Patterns

| Trigger | Behavior |
|---|---|
| Click destination (L0 or L1) | Set that item as active |
| Click grouper (expanded sidebar) | Toggle expand/collapse |
| Click grouper (collapsed sidebar) | No expand: show flyout popover instead |
| Hover any item | Hover fill + hover text + hover icon |
| Hover grouper in collapsed sidebar | Show flyout popover with group label + children |
| Click Collapse button | Sidebar width transition to 72px |
| Click Expand button | Sidebar width transition to 250px |

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
| `Accessibility/Touch Target/Optimal/Size` | `48px` | Figma ✅ |
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
| Suggested focus style | `outline: 2px solid #3555a0; outline-offset: 2px;` (uses `Icon/Contextual/NavItem/Active`) |

> Figma does not contain a "focused" state variant in the `SideNavItem` component variants. This is a documentation gap: a focused state should be added to the component before production. See §15.

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
| Base | `Text/NavItem/Base` → `#363636` on `#fafafa` | ~11.6:1 | ✅ Pass |
| Hover | `Text/NavItem/Hover` → `#252525` on `≈#f5f5f5` | ~14.1:1 | ✅ Pass |
| Active | `Text/NavItem/Active` → `#051428` on `≈#eef1f8` | ~16.3:1 | ✅ Pass |
| Trail (expanded) | `Text/NavItem/Active` → `#051428` on `≈#f5f5f5` | ~17.9:1 | ✅ Pass |
| `indicator.stripe` | `Icon/NavItem/Active` → `#3555a0` on `#fafafa` | Non-text UI component | ✅ 3:1 (WCAG 1.4.11) |
| Focus ring (proposed) | `#3555a0` outline on `#fafafa` | Non-text UI component | ✅ 3:1: verify with tool |

> ⚠ Contrast ratios are approximated on the `#fafafa` nav surface. Alpha-blended fills (`rgba(...)`) will vary on other backgrounds.

---

### 13.7 Figma Accessibility Gaps

The ARIA pattern, keyboard tables, screen reader strings, and contrast ratios all live in this spec (single source of truth). Figma does not need to duplicate that content: it should link to this document instead.

The only things that genuinely need to be **done in Figma** (because they are design artifacts, not documentation):

| Gap | Priority | Action needed in Figma |
|---|---|---|
| No "focused" state variant in `SideNavItem` | HIGH | Design and add a focused variant to the component: suggested style: `2px solid #3555a0` outline, `2px` offset. This is a visual design decision that must exist in Figma. |
| No link to this spec in Dev Mode | HIGH | In Figma Dev Mode → Resources panel, add the spec URL: `https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/sidenav/sidenav-spec.md`. Takes 30 seconds and means devs always have one click to the full reference. |
| Accessibility section in Figma doc frame is outdated | MEDIUM | Replace with a short plain-text summary (component description, key decisions, any gaps that require design work) and a link to this spec. Do not duplicate tables. |

---

## 14. What to Pass Claude to Implement This Component

To implement SideNav from scratch with correct design system alignment, provide:

1. **This document**
2. **Figma variable export** from the [Pathway Design System file](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/): specifically the token values for `Fill/Contextual/NavItem/*`, `Text/Contextual/NavItem/*`, `Icon/Contextual/NavItem/*`, `Surface/Nav/Light`, `Fill/Static/Info/Subtle`, and `Component/NavItem/Large/Radius/Radius`
3. **Icon assets**: either the design system icon React component library, or SVG files for the fill-style icons embedded at build time
4. **Specific nav content**: the nav items, their labels, icon names, and which are groupers vs destinations

---

## 15. Figma Gaps: Blocks to Full Token-Driven Implementation

The following are gaps in the current Figma documentation that prevent a fully semantic implementation:

### 15.1 Missing spacing/layout tokens (HIGH priority)
No named tokens exist for: nav container padding (12px H / 14px V), item gap (8px), stripe width (4px), row padding (8px), child indent (24px), collapse row padding, nav widths (250px expanded / 72px collapsed), or `Container.RowEnd` dimensions. These are raw Tailwind values. **Recommend creating a spacing scale** and referencing it with semantic names like `Spacing/Nav/ContainerPaddingH`.

### 15.2 Primitive token names not surfaced (MEDIUM priority)
`get_variable_defs` (Figma MCP tool) resolves semantic token alias chains to their final hex value but does not expose intermediate primitive token names. The full chain `Semantic → Primitive → Hex` cannot be reconstructed from MCP alone. This blocks documentation of the full token lineage. **Recommend:** either expose primitives in a dedicated Figma frame/page, or use the Figma REST API (`GET /v1/files/:key/variables`) which does return the full alias chain.

### 15.4 Icon inner size token missing (LOW priority)
`Icon.Leading` inside `Container.LeadingIcon` renders at `14×14pt`. `Accessibility/Icon Wrapping/Large` documents the `24px` wrapper but there is no token for the inner icon size. Recommend `Accessibility/Icon/Leading/Size` or similar.

### 15.5 indicator.stripe border-radius unconfirmed (LOW priority)
The stripe uses `border-radius: 0 8px 8px 0` (rounded right only). The `8px` is assumed to match `Border/S` (same as the item radius token) but has not been explicitly confirmed in Figma.

### 15.7 Grouper collapsed with no active child: state unconfirmed (LOW priority)
The state matrix above specifies that a collapsed grouper with **no** active child shows in Base state. This should be explicitly documented in the Figma component annotations to avoid ambiguity.

### 15.8 Collapse/Expand control pattern: design debt (HIGH priority)

Flagged in Figma: [view annotation](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40004169-1511&t=C5AHPCaPqyhmnq3s-1)

The current collapse/expand control mirrors the existing production behavior: it is presented as a menu item at the bottom of the navigation list. This pattern is not recommended for the following reasons:

- It mixes a **layout control** with **navigation destinations**, violating the single-responsibility principle of the nav list
- It has **low discoverability**: it is easily overlooked at the bottom of the list
- It creates **inconsistent expectations for keyboard and screen-reader users**: a structural control appears as a peer item inside the `role="tree"` nav, where users expect only navigation destinations

This behavior is retained for the current release to minimise scope and risk. The collapse/expand control **must be revisited** in a future iteration and redesigned as a proper control (e.g. an Action Icon / button tied to the navigation container header, outside the tree), following established patterns for panel toggle controls.

---

## 16. Responsiveness

Figma reference: [SideNav Responsiveness (WIP)](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40005913-173454&t=C5AHPCaPqyhmnq3s-1)

### 16.1 Breakpoints

All four required breakpoints exist as Figma variables:

| Name | Value | Variable token |
|---|---|---|
| Mobile | 393px | `Mobile 393px` |
| Tablet | 768px | `Tablet 768px` |
| Small desktop / large tablet | 1024px | `Small Desktop 1024px` |
| Desktop | 1440px | `Desktop 1440px` |

The 1024px breakpoint is the collapse/overlay threshold (see §16.2).

A fifth value (>1900px) exists in the variables panel but is unused and unconfirmed. 1900px is not a standard value: the nearest standards are 1920px (Full HD) and 2560px (2K). For a desktop-primary product this breakpoint is unlikely to be needed and should be reviewed before use.

### 16.2 SideNav behaviour per breakpoint

| Viewport | Default state | Expanded state layout | Can be fully hidden |
|---|---|---|---|
| ≥1024px Desktop | Expanded (250px) | **Push**: content shifts right | No |
| 768px–1023px Tablet | Collapsed (72px) | **Overlay**: 250px panel floats above content, scrim behind | No |
| <768px Mobile | **Hidden** (default) | **Overlay (250px)**: same drawer width as tablet, scrim behind | Yes: hamburger/close in global top nav |

**Key rules:**

**Desktop (≥1024px): in-flow, always visible:** SideNav occupies layout space. Expanded (250px) by default; user can collapse to 72px via the in-nav collapse button. Content shifts to accommodate whichever width is active.

**Tablet (768–1023px): overlay, always visible:** SideNav is collapsed (72px) by default and always in-flow. User can expand it, which causes it to float as a 250px overlay above the page content (with a scrim behind). Collapsing returns it to the 72px in-flow rail. The nav cannot be hidden at tablet: only collapsed or expanded.

**Mobile (<768px): hidden by default:** The SideNav is fully hidden on initial load. The hamburger control in the global top nav reveals it as a **250px overlay** with a scrim (same width as tablet). Closing via the top-nav close icon or tapping the scrim hides it again. **There is no 72px collapsed rail state on mobile**: the icon-only rail is unsuitable for touch screens (hover popovers don't apply) and consumes too much of a narrow viewport. **There is no collapse button inside the mobile overlay**: the TopNav hamburger/close is the sole toggle.

**Push vs overlay:** At ≥1024px, the SideNav is in the page's layout flow: it takes up width. Below 1024px, the SideNav floats as an overlay above the content: it does not shift the page. This is a page-shell concern, not a SideNav component property.

> **Implementation rule: layout architecture:** At ≥1024px: the page shell is `display: flex; flex-direction: row`. SideNav is a sibling of the content area with `width: 250px | 72px` and `flex-shrink: 0`. Content fills the remaining space. At <1024px: SideNav uses `position: fixed; left: 0; top: 64px; bottom: 0; width: 250px; z-index: 100` for the overlay panel. The 72px in-flow rail at tablet is a separate element; the 250px overlay slides over it. At <768px: there is no in-flow rail at all: only the overlay panel.

**Top nav variant:** The global top nav shows its full desktop layout at ≥768px (no hamburger). Below 768px it switches to the mobile layout (hamburger/close, app icon, ellipsis, avatar). See §16.4 for details.

### 16.3 States below 1024px

#### Tablet (768–1023px): two states

**Collapsed rail (72px): default at tablet:** SideNav is always visible as a 72px icon-only rail. Content fills the remaining width. Tap a grouped item to get a popover menu; tap a destination to navigate. This matches the `SideNav.Collapsed` touch-interaction pattern: Figma includes "Mobile: Tap Main Item" and "Mobile: Tap Grouper" instances in the `SideNav Instances/Interaction` frame specifically documenting this. (The "Mobile" label refers to touch/pointer context, not viewport size.)

**Expanded overlay (250px): triggered at tablet:** User expands the nav via the expand control. SideNav slides over the page content as a 250px-wide overlay. A scrim appears behind it. Tapping the scrim or the collapse control dismisses the overlay and returns to the 72px rail.

#### Mobile (<768px): two states only (no 72px collapsed rail)

**Hidden: default at mobile:** The SideNav is fully hidden on load. The hamburger icon (≡) appears in the global top nav. **There is no 72px collapsed rail on mobile.** The icon-only rail pattern is not appropriate for touch-only screens: hover popovers don't trigger, icon-only navigation is ambiguous at phone scale, and 72px represents ~20% of a 390px viewport.

**250px overlay: triggered at mobile:** Tapping the hamburger slides the SideNav in as a 250px drawer with a scrim behind it. On a 393px phone this leaves 143px of dimmed content visible: enough for users to understand and tap outside to dismiss. The global top nav shows the close icon (×). Tapping the scrim or the close icon hides the nav (returns to hamburger ≡). The SideNav **does not show a collapse button** inside the mobile overlay: there is nothing to collapse to.

**Overlay dismiss:** On tablet, tapping the scrim or the in-nav collapse button closes the overlay. On mobile, the top-nav hamburger/close toggle or tapping the scrim are the dismiss mechanisms. No swipe-to-dismiss gesture is specified.

### 16.4 Global top nav (Unity Nav): out of scope, Figma reference

The global top navigation (Unity Nav) is a separate component not owned by this spec. Full component documentation, variants, tokens, and interaction specs are maintained on the [Global Navigation Figma page](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40005504-55845&t=C5AHPCaPqyhmnq3s-1).

For SideNav integration purposes only, the relevant behaviour is:

**At ≥768px (desktop/tablet layout):** Full nav bar: app switcher, org switcher, search bar, icon buttons, avatar. No hamburger control. SideNav cannot be hidden at these sizes.

**At <768px (mobile layout):** Simplified nav bar: hamburger/close toggle on the left, centred app icon, ellipsis and avatar on the right. Icon state: hamburger (≡) when the SideNav is hidden (default on load), close (×) when the 250px overlay is open. The toggle controls the hidden ↔ 250px-overlay transition only: there is no intermediate 72px collapsed state on mobile.

This spec does not prescribe anything about the top nav's visual design, tokens, or other interactions. For all top nav specs, refer to the Figma link above.

### 16.5 Figma component variant guidance

A single `SideNav.Local` component covers all breakpoints. No separate mobile or desktop variants are needed: the component structure and tokens are identical across all sizes.

For designers building screens, expose a `layout` component property with two values:

- `push`: use in desktop frames (≥1440px). SideNav sits in flow, content shifts right.
- `overlay`: use in tablet and mobile frames (<1024px). SideNav floats above content when expanded.

Pair this with a `state` property: `expanded` / `collapsed` / `hidden` to represent the three states in §16.3. This gives designers everything they need to accurately represent any SideNav state at any breakpoint without a separate component.

### 16.6 Overlay enter/exit animation

The overlay panel (`.overlay-panel`) uses CSS transitions rather than one-shot keyframe animations. The overlay container always remains in the DOM when `!isDesktop`, and `.overlay-panel--open` class is toggled to drive both the enter and exit transitions. This is intentional: keyframe animations only play on insertion; a CSS transition reverses smoothly when the class is removed, giving a proper exit without instant-removal flash.

The overlay uses **asymmetric enter/exit transitions**: the enter curve is slower and more eased (300–380ms, deceleration) to feel intentional; the exit is snappier (220–300ms, acceleration) to stay out of the user's way. This is achieved by placing the exit `transition` on the base class and the enter `transition` on the `--open` modifier: CSS always uses the destination state's transition property.

**Enter (`.overlay-panel--open` added):**

| Property | Value |
|---|---|
| Transform | `translateX(-110%)` → `translateX(0)`: 110% hides any shadow bleed |
| Opacity | `0` → `1` |
| Transform duration | `380ms` |
| Opacity duration | `300ms` |
| Easing | `cubic-bezier(0, 0, 0.2, 1)` (deceleration: eases into resting position) |

**Exit (`.overlay-panel--open` removed):**

| Property | Value |
|---|---|
| Transform | `translateX(0)` → `translateX(-110%)` |
| Opacity | `1` → `0` |
| Transform duration | `300ms` |
| Opacity duration | `220ms` |
| Easing | `cubic-bezier(0.4, 0, 0.6, 1)` (acceleration: exits with intent) |

**Scrim (`.overlay-scrim`):** Opacity `0` → `1` on show, `1` → `0` on dismiss. `280ms`, `cubic-bezier(0.4,0,0.2,1)`. `pointer-events: none` when invisible (no click-through).

**Reduced motion (`prefers-reduced-motion: reduce`):** Transform is suppressed (`transform: none !important`). Only opacity fades remain, shortened to `150ms linear`.

```css
.overlay-panel {
  position: fixed; left: 0; bottom: 0; z-index: 100;
  transform: translateX(-110%);
  opacity: 0; pointer-events: none;
  will-change: transform;
  /* EXIT transition: fires when .overlay-panel--open class is removed */
  transition:
    transform 300ms cubic-bezier(0.4, 0, 0.6, 1),
    opacity   220ms cubic-bezier(0.4, 0, 0.6, 1);
}
.overlay-panel--open {
  transform: translateX(0); opacity: 1; pointer-events: auto;
  /* ENTER transition: fires when .overlay-panel--open class is added */
  transition:
    transform 380ms cubic-bezier(0, 0, 0.2, 1),
    opacity   300ms cubic-bezier(0, 0, 0.2, 1);
}

.overlay-scrim {
  position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32); z-index: 99;
  opacity: 0; pointer-events: none;
  transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
}
.overlay-scrim--visible { opacity: 1; pointer-events: auto; }

@media (prefers-reduced-motion: reduce) {
  .overlay-panel, .overlay-panel--open { transform: none !important; transition: opacity 150ms linear; }
  .overlay-scrim { transition: opacity 150ms linear; }
}
```

**Figma:** Static states only. Animation is a code concern; it does not need Figma component variants. Use `overlay` + `expanded` variant to represent the open state in designs.

### 16.7 Scrim (backdrop overlay)

A semi-transparent scrim is shown behind the SideNav whenever it is in expanded-overlay mode (below 1024px viewport width). The scrim communicates that the page content is temporarily inaccessible and draws focus to the open SideNav panel.

**Scrim spec:**

| Property | Value | Notes |
|---|---|---|
| Colour | `rgba(0, 0, 0, 0.32)` | 32% black: standard modal-overlay opacity |
| Position | `position: fixed; top: 64px; left: 0; right: 0; bottom: 0` | Sits below the top nav bar |
| Z-index | `99` | Behind SideNav overlay (`z-index: 100`), above page content |
| Enter animation | Opacity `0` → `1`, `280ms`, `cubic-bezier(0.4,0,0.2,1)` | Synchronised with nav slide-in |
| Exit animation | Opacity `1` → `0`, same duration and easing | CSS transition reversal: scrim stays in DOM |

**Breakpoint rules:**

- **<768px (Mobile):** Scrim **shown**. The overlay is 250px wide, leaving page content visible to the right: the scrim dims that content and provides the tap-outside-to-dismiss affordance.
- **768px–1023px (Tablet):** Scrim shown. Same 250px overlay width; same scrim behaviour.
- **≥1024px:** No overlay mode; no scrim.

**Interaction:** Tapping the scrim dismisses the SideNav overlay (returns to 72px collapsed rail). This is the standard mobile drawer tap-outside pattern. The in-nav collapse button is the alternative dismiss path.

---

## 17. AI Agent Implementation Guide

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

> The CollapseButton renders at **all breakpoints ≥768px**, in **both** the 250px and 72px sidebar states. It is absent only on mobile (<768px).

| Sidebar state | Renders? | Icon | Label |
|---|---|---|---|
| Expanded 250px, ≥768px | ✓ Yes | `collapse_nav` | "Collapse": visible |
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
| Background | `Fill/Contextual/NavItem/Active` | `#3555a014` |
| Text | `Text/Contextual/NavItem/Active` | `#051428` |
| Icon | `Icon/Contextual/NavItem/Active` | `#3555a0` |
| `indicator.stripe` | visible | `#3555a0` |

This applies whether the sidebar is 250px or 72px. Full detail at §6 and §7.

---

### 17.6 Prompt template

```
Using components/sidenav/sidenav-figmamake.html as the visual reference and
components/sidenav/sidenav-spec.md as the specification, implement a responsive
prototype with TopNav + SideNav.

Nav items (in order):
[your list: see §17.2 for format]

Icons:
[your icon names / attach SVG files — nav item icons render at 14px inside 24px wrapper]

Requirements — implement all of these, do not skip any:

1. TopNav and SideNav together as a single shell. Never one without the other.

2. CollapseButton inside the SideNav at all breakpoints ≥768px, in both expanded
   and collapsed states. On mobile (<768px) it is hidden. In the collapsed 72px
   state it shows the expand icon with no label. In the expanded 250px state it
   shows the collapse icon + "Collapse" label. It sits at the bottom of the nav,
   scrolls with content, and has a 1px divider above it.

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

5. Collapsed sidebar width: 72px (not 64px). Expanded: 250px.

6. Nav item icons: 14px inside a 24×24 wrapper. CollapseButton icon: 18px.
   These are two different sizes — do not use 18px for nav item icons.

Match all spacing, colours, states, and responsive breakpoints from the spec.

Before submitting, verify this checklist — these two are the most commonly skipped:

[ ] CollapseButton is visible at the BOTTOM of the SideNav at all viewports
    >=768px. Check BOTH states: expanded 250px (shows icon + "Collapse" label)
    and collapsed 72px rail (shows icon only, no label). It must be absent only
    on mobile (<768px). If you cannot see a collapse/expand icon at the bottom
    of the nav in your desktop or tablet preview, it is missing.

[ ] At 768-1023px viewport the SideNav renders as a 72px icon-only rail in the
    normal page flow by default — it is NOT hidden, and NOT treated as mobile.
    The main content fills the remaining width to the right of the 72px rail.
    Only after the user taps the expand icon does the 250px overlay appear.
    Treating this breakpoint as mobile (hiding the nav entirely) is wrong.
```

