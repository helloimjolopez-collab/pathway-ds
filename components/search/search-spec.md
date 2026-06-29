# Search — Pathway Design System Component Spec

**Status:** `REVIEWED`

Complete implementation reference for the Search Input and TopNavSearch components. Covers anatomy, design tokens, states, spacing, interaction patterns, and accessibility for both the base search bar and its top-navigation wrapper. Use alongside the [Figma source](#figma-source) for a pixel-accurate build.

## Links

| Artefact | URL |
|---|---|
| Figma — SearchInput | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006978-23158 |
| Figma — TopNav.Search | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007095-4048 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-search--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/search/search.html |
| GitHub source | https://github.com/helloimjolopez-collab/pathway-ds/tree/main/components/search |

---

## Authorship

Design (Jo Lopez) owns and signs off on: Status, Purpose, Variants, States, Token reference, Figma setup, Accessibility intent, Usage rules.
Engineering owns and signs off on: prop types, ARIA implementation in code, browser-specific behaviour.
Neither party signs off on the other's section.

---

## 1. Component Overview

### v1 scope — search bar only

**This release covers the search bar trigger and its states. The results dropdown / open panel is explicitly out of scope for v1 and is deferred.** The existing production dropdown remains unchanged. A future version will give the open panel its own design pass, spec, and release.

| Sub-component | v1 scope | Notes |
|---|---|---|
| **SearchInput** — the bar itself | IN SCOPE | All states: idle, hover, focused, with-value, filter-active, disabled, error |
| **TopNavSearch** — collapsed + expanded | IN SCOPE | Collapsed icon button + spring-expand animation |
| **Open state / results dropdown** | OUT OF SCOPE | Production dropdown unchanged. Agents building products should use [Radix UI `Combobox`](https://www.radix-ui.com/primitives/docs/components/combobox) or `Command` with Pathway tokens applied for any dropdown they need to build. |

---

The **Search** family consists of two components:

1. **SearchInput** — the base search bar. A pill-shaped input with a leading search icon, a free-text field, optional trailing clear button, and optional trailing filter button. Lives on light surfaces in page bodies, drawers, and command bars. Standalone or composed into TopNavSearch.

2. **TopNavSearch** — a wrapper that hosts SearchInput inside the top navigation bar. The component has two shipped modes: **Collapsed** (a 48×48 icon button on the dark nav surface) and **Expanded** (the full search bar slides in with a spring animation). The search icon inside the bar doubles as the collapse trigger. The Open mode (expanded plus results dropdown) is deferred — see v1 scope above.

The filter button is an affordance that navigates the user to a separate filter page or panel. It is NOT a dropdown toggle. When the user returns from the filter page with filters applied, the bar enters a **filter-active** state: highlighted funnel pill, dot badge on the funnel, input still fully active.

**Not used for:**
- Inline filtering of a visible list (use a filter bar or chip group instead)
- Command palettes (different pattern, different affordances)
- Autocomplete fields in forms (use Combobox instead)
- Global persistent state — the open/closed state of TopNavSearch is ephemeral

### Figma source

- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **SearchInput:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006978-23158)
- **FilterSelected state:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007351-13533)
- **TopNavSearch:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007095-4048)

---

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Visual appearance of any state | Design | Figma node 40006978-23158 |
| Filter-active state treatment | Design | Figma node 40007351-13533 |
| TopNavSearch collapsed/expanded/open states | Design | Figma node 40007095-4048 |
| Token assignments (colour, radius, type) | Design | §3 of this spec + Figma variable bindings |
| Expand/collapse animation spec | Design | §14 of this spec |
| Prop names, types, default values | Engineering | §5 of this spec |
| ARIA implementation detail | Engineering | §13 of this spec |
| When to show filter-active state | Product | §9 of this spec |
| Open state (dropdown) design | Design | Deferred — production dropdown unchanged, future v2 pass. See §17. |

---

## 2. Component Anatomy

### SearchInput

```
SearchInput.TouchTarget              48px height, 100% width, flex column, justify center
└── SearchInput.Inner                min-height 36px, pill shape (border-radius 64px), flex row
    ├── SearchInput.LeadSlot         flex-shrink 0
    │   └── SearchInput.IconButton   24×24px, border-radius 12px, tap target wrapper
    │       └── SearchInput.IconPill full circle 64px radius, 4px padding
    │           └── <svg> search     16×16px
    ├── SearchInput.LabelSlot        flex 1, min-width 0
    │   └── <input type="text">      flex 1, transparent bg, no border
    └── SearchInput.TrailingSlot     flex-shrink 0, flex row, align center
        ├── [SearchInput.CancelBtn]  24×24px, icon-pill — shown only when input has text
        └── [SearchInput.FilterWrap] border-left 0.75px divider + 4px padding-left
            └── SearchInput.FilterBtn 24×24px, icon-pill
                └── <svg> funnel     16×16px
                [SearchInput.Badge]  6×6px dot, absolute top-right of badge-wrap
```

The `CancelBtn` and `FilterWrap` are conditional — see variant rules in §5.

### TopNavSearch

```
TopNavSearch.Container               position relative, FIXED 48×48 footprint (never
│                                     changes — the expanded bar is absolutely positioned)
├── TopNavSearch.CollapsedBtn        48×48px touch target, border-radius 12px (transparent)
│   └── TopNavSearch.Circle          32×32px, border-radius 50% — a PERFECT CIRCLE (not a
│       │                            pill/rounded-square). Fixed square so the radius always
│       │                            yields a circle regardless of flex context.
│       └── <svg> search             20×20px
└── TopNavSearch.ExpandedBar         position ABSOLUTE, right:0 — anchored to the collapsed
    │                                control's right edge, so it grows LEFTWARD and NEVER
    │                                pushes the elements to its right. 320px wide.
    └── SearchInput                  320px wide, all standard slots
        (search icon inside = collapse trigger)

> **IMPLEMENTATION RULE (collapsed shape):** The collapsed control is a perfect circle —
> a fixed 32×32 box with `border-radius: 50%`. Do NOT size it with `width: 100%` + a fixed
> height (that yields a rounded rectangle in a flex row).
>
> **IMPLEMENTATION RULE (expand direction):** The expanded bar is absolutely positioned and
> right-anchored. Expanding must NEVER change the nav layout or push sibling elements (search
> icon, notifications, profile) — it overlays the nav space to its left. The container's
> in-flow footprint stays 48×48 whether collapsed or expanded.
>
> **RESPONSIVE — collision / full-width takeover:** On **desktop** the expanded bar is the
> 320px right-anchored overlay (above). On **non-desktop** breakpoints — where a 320px overlay
> would collide with the left cluster (ModuleSwitcher + OrgSwitcher) — the search instead
> **takes over full-width**: the SearchInput fills the entire nav bar (covering the left
> cluster) on the brand-blue surface, with the search icon as the collapse trigger. This is
> orchestrated by **TopNav** (the `<nav>` is the positioning context); `TopNavSearch` suppresses
> its own inline 320px bar via the `breakpoint` prop and TopNav renders the takeover overlay.
> The query value is shared (lifted to TopNav) so it persists between the collapsed icon and
> the takeover.
```

---

## 3. Design Tokens

### 3.1 Surface / Fill

| Semantic token | CSS variable | Resolved | Usage |
|---|---|---|---|
| `fill.static.neutral.light` | `--semantic-color-light-mode-fill-static-neutral-light` | #ffffff | Bar background (all states except disabled) |
| `fill.action.tertiary.base` | `--semantic-color-light-mode-fill-action-tertiary-base` | #eef2fb | Filter pill background when filter-active |
| `fill.action.secondaryinverse.hover` | `--semantic-color-light-mode-fill-action-secondaryinverse-hover` | rgba(17,17,17,0.02) | Icon pill hover state |
| `fill.action.secondaryinverse.pressed` | `--semantic-color-light-mode-fill-action-secondaryinverse-pressed` | #f6f6f6 | Icon pill pressed state |
| `fill.action.primary.base` | `--semantic-color-light-mode-fill-action-primary-base` | #3555a0 | Badge dot fill |
| `fill.action.primaryinverse.base` | `--semantic-color-light-mode-fill-action-primaryinverse-base` | rgba(160,181,230,0.08) | TopNavSearch collapsed button background (dark surface) |
| `fill.static.info.light` | `--semantic-color-light-mode-fill-static-info-light` | #f0f4ff | Page/demo surface |

Disabled background uses primitive fallback pending token addition: `--primitive-color-cool-neutral-10` (#fbfbfb). See §17.

### 3.2 Stroke

| Semantic token | CSS variable | Resolved | Usage |
|---|---|---|---|
| `stroke.static.neutral.light` | `--semantic-color-light-mode-stroke-static-neutral-light` | #f6f6f6 | Default border (0.75px) |
| `stroke.action.primary.hover` | `--semantic-color-light-mode-stroke-action-primary-hover` | #86a0dd | Hover border (1px) |
| `stroke.action.primary.pressed` | `--semantic-color-light-mode-stroke-action-primary-pressed` | #6e8bd4 | Focused / with-value / filter-active border (1px) |
| `stroke.action.secondary-inverse.base` | `--semantic-color-light-mode-stroke-action-secondary-inverse-base` | #d2d2d2 | Cancel–filter divider (0.75px) |
| `stroke.action.negative.base` | `--semantic-color-light-mode-stroke-action-negative-base` | #b03a3a | Error state border (1px) |

Disabled border uses primitive fallback: `--primitive-color-cool-neutral-30` (#ededed). See §17.

TopNavSearch collapsed button border (dark surface): `rgba(251,251,251,0.14)` — no semantic token exists yet. See §17.

### 3.3 Text

| Semantic token | CSS variable | Resolved | Usage |
|---|---|---|---|
| `text.static.secondary.subtle` | `--semantic-color-light-mode-text-static-secondary-subtle` | #606060 | Placeholder text |
| `text.static.secondary.bold` | `--semantic-color-light-mode-text-static-secondary-bold` | #202020 | Input value text |

### 3.4 Icon

| Semantic token | CSS variable | Resolved | Usage |
|---|---|---|---|
| `icon.action.secondaryinverse.base` | `--semantic-color-light-mode-icon-action-secondary-inverse-base` | #6b6b6b | Search + cancel + filter icon — idle |
| `icon.action.secondaryinverse.hover` | `--semantic-color-light-mode-icon-action-secondary-inverse-hover` | #545454 | All icons — hover |
| `icon.action.secondary.disabled` | `--semantic-color-light-mode-icon-action-secondary-disabled` | #979797 | All icons — disabled |
| `icon.action.negative.base` | `--semantic-color-light-mode-icon-action-negative-base` | #b03a3a | Search icon — error state |

### 3.5 Geometry

| Value | Source | px | Token |
|---|---|---|---|
| Bar border-radius | `cornerradius.full` | 64 | `--primitive-unit-unit-64` × 1px |
| Icon button border-radius | `cornerradius.focused-element` | 12 | `--primitive-unit-unit-12` × 1px |
| TopNavSearch collapsed button radius | `cornerradius.medium` | 12 | `--primitive-unit-unit-12` × 1px |
| Default border width | `borderwidth.thin` | 0.75 | `--primitive-unit-unit-0-point-75` × 1px |
| Active border width | `borderwidth.base` | 1 | `--primitive-unit-unit-1` × 1px |
| Filter divider width | `borderwidth.thin` | 0.75 | same as default border |
| Touch target height | hard-coded | 48 | none — 44px min WCAG rule + 4px nav clearance |
| Inner pill min-height | hard-coded | 36 | none |
| Icon size | hard-coded | 16 | none |
| TopNavSearch collapsed icon | hard-coded | 20 | none |
| Badge dot size | hard-coded | 6 | none |

> IMPLEMENTATION RULE: Unit tokens are unitless numbers.
> All `--primitive-unit-*` and `--semantic-layout-units-*` tokens resolve to bare numbers (e.g. `64`, not `64px`). Always wrap with `calc(var(--primitive-unit-unit-XX) * 1px)` to produce a valid CSS length. Never assign them directly to dimensional properties.

### 3.6 Typography

| Property | Token | Resolved |
|---|---|---|
| Font family | `type.desktop.label.input.base.regular.fontfamily` | Red Hat Text |
| Font weight | 400 (regular) | — |
| Font size | `type.desktop.label.input.base.regular.fontsize` | 14px (via `--primitive-type-size-14`) |
| Line height | `type.desktop.label.input.base.regular.lineheight` | 20px (via `--primitive-type-line-height-14pt-single`) |
| Letter spacing | `type.desktop.label.input.base.regular.letterspacing` | 0.3px (via `--primitive-type-letter-spacing-wide`) |

---

## 4. Layout and Spacing

| Value | Used for | px | Semantic token |
|---|---|---|---|
| Inner gap | Between children of `.search__inner` | 8 | `layout.units.gap.xtight` |
| Inner padding-inline | Left/right padding on the pill | 8 | `layout.units.padding.xtight` |
| Icon pill padding | Padding inside each 24×24 icon button | 4 | `layout.units.padding.xxtight` |
| Filter divider gap | `padding-left` on `.search__filter-wrap` | 4 | `layout.units.padding.xxtight` |
| TopNavSearch container padding | Wraps the collapsed btn / expanded bar | 4 | `layout.units.padding.xxtight` |

> IMPLEMENTATION RULE: The filter divider is a left border on the filter-wrap element, not a separate element.
> `.search__filter-wrap` carries `border-left: 0.75px solid <stroke.action.secondary-inverse.base>` and `padding-left: 4px`. The cancel button before it has no border. Do not separate the divider into its own DOM element.

---

## 5. Variant Structure

### 5.1 SearchInput props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | `""` | Controlled input value |
| `placeholder` | `string` | `"Search..."` | Placeholder text |
| `showFilter` | `boolean` | `false` | Renders the trailing filter button |
| `filterActive` | `boolean` | `false` | Filter-active visual state (blue border, highlighted funnel) |
| `filterBadge` | `boolean` | `false` | Shows the dot badge on the funnel (typically tied to filterActive) |
| `disabled` | `boolean` | `false` | Disables the component |
| `error` | `boolean` | `false` | Error visual state |
| `onSearch` | `(value: string) => void` | — | Called on Enter or search icon click (standalone use) |
| `onSearchIconClick` | `() => void` | — | When provided, overrides the search icon button's onClick. TopNavSearch passes `collapse` here so tapping the icon inside the expanded bar collapses it instead of firing a search. |
| `onFilterClick` | `() => void` | — | Called when filter button tapped |
| `onChange` | `(value: string) => void` | — | Called on every keystroke |
| `onClear` | `() => void` | — | Called when clear (X) button tapped |
| `className` | `string` | `""` | Additional CSS class on root |
| `id` | `string` | — | For label association |

### 5.2 TopNavSearch props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `expanded` | `boolean` | `false` | Controlled expanded state |
| `onExpandChange` | `(expanded: boolean) => void` | — | Called on expand or collapse |
| `searchProps` | `SearchInputProps` | — | All SearchInput props forwarded |
| `className` | `string` | `""` | Additional CSS class on root |

### 5.3 Variant rules

- The cancel (clear) button appears whenever `value.length > 0`, regardless of `filterActive` state.
- The filter wrap (funnel + divider) appears only when `showFilter = true`.
- When `filterActive = true`: bar gets blue border, funnel pill gets `fill.action.tertiary.base` background, input remains fully interactive.
- When `disabled = true`: entire touch target at 38% opacity. All sub-elements non-interactive.
- `error` and `disabled` are mutually exclusive. `error` wins if both are somehow set.

---

## 6. State Matrix

States apply to the pill (`.search__inner`). All token names are semantic.

### SearchInput state matrix

| State | Bar border | Bar bg | Icon colour | Text colour | Filter pip bg |
|---|---|---|---|---|---|
| **Idle** | `stroke.static.neutral.light` 0.75px | `fill.static.neutral.light` | `icon.action.secondaryinverse.base` | placeholder: `text.static.secondary.subtle` | — |
| **Hover** | `stroke.action.primary.hover` 1px | `fill.static.neutral.light` | `icon.action.secondaryinverse.hover` | (same) | — |
| **Focused** | `stroke.action.primary.pressed` 1px | `fill.static.neutral.light` | (same as hover) | (same) | — |
| **With-value** | `stroke.action.primary.pressed` 1px | `fill.static.neutral.light` | (base) | `text.static.secondary.bold` | — |
| **Filter-active** | `stroke.action.primary.pressed` 1px | `fill.static.neutral.light` | (base) | (placeholder or bold) | `fill.action.tertiary.base` |
| **Disabled** | primitive fallback 1px | primitive fallback | `icon.action.secondary.disabled` | (38% opacity) | — |
| **Error** | `stroke.action.negative.base` 1px | `fill.static.neutral.light` | `icon.action.negative.base` | (placeholder) | — |

### State logic rules

1. Idle is the default — no modifier.
2. Hover applies on `mouseenter` when the field is not focused.
3. Focused applies on `focus` and takes precedence over hover.
4. With-value applies on `blur` when value is non-empty. Focused takes precedence when the field is active.
5. Filter-active applies when the user has returned from the filter page with active filters. The input remains interactive.
6. Disabled applies when `disabled = true`. All pointer events removed. Opacity 0.38 on the whole touch target.
7. Error applies when `error = true` and `disabled` is false.
8. Filter-active + with-value can coexist (user has text AND active filters). The bar uses the filter-active border and the funnel is highlighted.

> IMPLEMENTATION RULE: Filter-active does not disable the input.
> The `filterActive` state applies visual treatment (blue border, highlighted funnel pill) but does NOT set `disabled` on the `<input>`. The user must be able to type in the search field even while filters are applied.

---

## 7. Sub-components and Decorations

### Cancel button

- Rendered as a `<button>` with `aria-label="Clear"`.
- Visibility: `display: none` until `value.length > 0`.
- No divider between cancel and the text field.
- When clicked: clears value, hides self, returns focus to input.

### Filter wrap and divider

- `.search__filter-wrap` carries the left-border divider. Token: `stroke.action.secondary-inverse.base` (#d2d2d2), 0.75px, 4px padding-left.
- The funnel icon button (`aria-label="Open filters"` or `aria-label="Open filters (filters active)"`) is inside.
- A 6×6px dot badge sits `position: absolute; top: 1px; right: 1px` relative to the badge-wrap. Fill: `fill.action.primary.base`. Border: 1.5px solid `fill.static.neutral.light` (white ring). Visible only when `filterBadge = true`.

### Badge

- Must have `aria-hidden="true"` — the badge is decorative. The accessible state is communicated via `aria-label` change on the filter button.

---

## 8. Container and Surface

### 8.1 SearchInput container

- Touch target: height 48px, width 100% (or fixed 320px in TopNavSearch). Display flex-column, justify-center.
- Pill inner: min-height 36px, border-radius 64px (full), overflow clip.
- Background: `fill.static.neutral.light` (#ffffff).

### 8.2 TopNavSearch container

- `overflow: hidden` on the wrapping element to clip the sliding bar.
- Padding: 4px around both the collapsed button and the expanded bar.
- Lives on a dark nav surface (#1b2a4a or equivalent nav fill token).

### 8.3 TopNavSearch collapsed button dimensions

- Size: 48×48px outer.
- Border-radius: 12px (`cornerradius.medium`).
- Background: `fill.action.primaryinverse.base` = rgba(160,181,230,0.08).
- Border: 1.5px solid rgba(251,251,251,0.14). No semantic token — flagged in §17.
- Icon: 20×20px search SVG, fill rgba(251,251,251,0.9).

---

## 9. Interaction and Behaviour

### SearchInput interaction

- Clicking anywhere on the pill focuses the input.
- The search icon button (`aria-label="Search"`) triggers `onSearch` with the current value.
- Typing updates `onChange` on every keystroke. The clear button appears once any character is entered.
- Pressing Enter in the input triggers `onSearch`.
- Clicking clear triggers `onClear`, empties the field, returns focus to the input, hides the clear button.
- Clicking the filter button triggers `onFilterClick`. Navigation to the filter panel is the caller's responsibility.
- On `blur`, if value is non-empty, the bar transitions to with-value state.

### TopNavSearch interaction

- Tapping the collapsed button expands the bar with a spring animation (see §14). Focus moves to the search input after 120ms (after the animation has started).
- Tapping the search icon inside the expanded bar collapses it. Input value persists.
- Re-expanding shows the same input value that was there when collapsed.
- Pressing Escape while expanded collapses the bar and returns focus to the collapsed button.

---

## 10. Collapsed state (TopNavSearch)

The collapsed state is the default for TopNavSearch on page load. It renders a single 48×48 icon button on the dark nav surface. The button is not a toggle in the ARIA sense until the panel behind it is implemented — for now `aria-expanded` reflects whether the bar is expanded.

The collapsed button is hidden (opacity 0, pointer-events none) while the bar is expanded. The transition is managed by the width animation on the bar container — the button fades out as the bar slides in.

---

## 11. Iconography

All icons use **Material Symbols Rounded** — rendered in code as font characters, not as SVG paths.

| Icon | Figma layer name | Material Symbols ligature | Size in bar | Size in collapsed btn |
|---|---|---|---|---|
| Search (magnifying glass) | `search` | `search` | 16×16px | 20×20px |
| Clear (circle-X) | `cancel` | `cancel` | 16×16px | — |
| Filter (funnel) | `filter_alt` | `filter_alt` | 16×16px | — |

**Convention:** The Figma layer name IS the ligature string. When reading this component via `get_design_context`, the icon frame's `data-name` attribute gives the exact ligature to use in code. No SVG paths. No guessing.

**In code:**
```html
<span class="material-symbols-rounded">search</span>
<span class="material-symbols-rounded">cancel</span>
<span class="material-symbols-rounded">filter_alt</span>
```

Font variation settings: `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20` — Figma uses the filled Rounded variant (FILL=1). This is specific to the search bar; other components may use FILL=0.

`aria-hidden="true"` on all icon spans — labels are carried by the parent button.

---

## 12. Interaction Patterns

### Hover-safe bridge

The icon buttons (search, clear, filter) are 24×24px with 12px border-radius, centered inside the 48px touch target. Hover state on the icon pill does not require hovering the exact 16px icon — the full 24×24 button is the hover zone.

### Clear button appearance

The clear button uses `display: none` / `display: ''` toggling (not opacity) so it does not take up space when hidden. This prevents layout shift in the trailing slot.

### Filter-wrap divider

The divider is always visible when `showFilter = true`, regardless of whether the cancel button is present. The cancel button sits to the LEFT of the filter-wrap, with no divider between cancel and the text field.

---

## 13. Accessibility

### 13.0 ARIA pattern

SearchInput uses the [Searchbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) for the input element (`role="searchbox"` or `type="search"`). TopNavSearch uses a disclosure pattern for the collapsed/expanded state.

### 13.1 Touch and pointer targets

- Touch target for the whole bar: 48×48px minimum height (WCAG 2.5.5 AAA).
- Each icon button inside the bar: 24×24px visual, 44×44px effective (achieved by the 48px bar height + centered alignment). Engineering must confirm the effective target meets 44×44px by inspecting computed hit areas.
- TopNavSearch collapsed button: 48×48px — meets WCAG 2.5.5 AAA.

### 13.2 ARIA markup

```html
<!-- SearchInput -->
<div class="search" role="search" aria-label="Search">
  <div class="search__inner">
    <button class="search__icon-btn" aria-label="Search" type="button">
      <!-- search icon -->
    </button>
    <input
      class="search__input"
      type="search"
      placeholder="Search..."
      autocomplete="off"
      aria-label="Search"
    />
    <!-- when value non-empty: -->
    <button class="search__cancel" aria-label="Clear search" type="button">
      <!-- X icon -->
    </button>
    <!-- when showFilter: -->
    <div class="search__filter-wrap">
      <button
        class="search__filter-btn"
        aria-label="Open filters"          <!-- or "Open filters (filters active)" -->
        type="button"
      >
        <!-- funnel icon -->
      </button>
      <!-- when filterBadge: -->
      <span class="search__badge" aria-hidden="true"></span>
    </div>
  </div>
</div>

<!-- TopNavSearch -->
<div class="topnav-search">
  <!-- collapsed state: -->
  <button
    class="topnav-search__btn"
    aria-label="Open search"
    aria-expanded="false"
    type="button"
  >
    <!-- search icon -->
  </button>
  <!-- expanded state: -->
  <div class="topnav-search__bar" aria-hidden="true">  <!-- hidden when collapsed -->
    <!-- SearchInput with search icon aria-label="Collapse search" -->
  </div>
</div>
```

### 13.3 Keyboard interaction

| Key | Behaviour |
|---|---|
| `Tab` | Moves focus through: search icon btn → input → clear btn (if present) → filter btn (if present) |
| `Enter` (in input) | Triggers `onSearch` |
| `Escape` (in TopNavSearch expanded) | Collapses the bar, returns focus to collapsed button |
| `Space` / `Enter` on any button | Activates the button |

### 13.4 Focus styles

The browser default focus ring is preserved on the input. Icon buttons use `border-radius: 12px` as the focus shape — engineering must apply a `focus-visible` outline that matches this radius (e.g. `outline: 2px solid #3555a0; outline-offset: 2px; border-radius: 12px`). The 12px radius aligns with `cornerradius.focused-element`.

Reduced motion: TopNavSearch expand/collapse removes the spring animation and uses a simple `opacity` fade. See §14.

### 13.5 Screen reader announcements

| State | Announcement |
|---|---|
| Bar focused | "Search, search box" (from `type="search"` + label) |
| Filter button — idle | "Open filters, button" |
| Filter button — filter active | "Open filters (filters active), button" |
| Clear button | "Clear search, button" |
| TopNavSearch collapsed btn | "Open search, button, collapsed" (aria-expanded false) |
| TopNavSearch expanded | "Open search, button, expanded" (aria-expanded true) |

### 13.6 Colour contrast

| Pair | Ratio | WCAG |
|---|---|---|
| Placeholder `#606060` on `#ffffff` | 5.74:1 | AA pass |
| Input value `#202020` on `#ffffff` | 16.1:1 | AAA pass |
| Search icon `#6b6b6b` on `#ffffff` | 4.61:1 | AA pass (graphic) |
| Error border `#b03a3a` on `#ffffff` | — | Confirmed AA, TBD exact ratio |
| TopNav icon `rgba(251,251,251,0.9)` on `#1b2a4a` | TBD | [Needs engineering verification] |

---

## 14. Motion

Applies to TopNavSearch expand/collapse only.

Applies to TopNavSearch expand/collapse only. All motion resolves through `--motion-*` tokens — no hardcoded ms/curves.

| Property | Token | Why |
|---|---|---|
| Expand | `--motion-duration-4` + `--motion-easing-spring` | 300 ms with a whisper of overshoot — the bar springs open (the `pwSearchExpand` keyframe). |
| Collapse | `--motion-duration-4` + `--motion-easing-accelerate` | Same duration, clean accelerating exit — closing retreats cleanly. |
| Animated property | `width` (0 → 336px) + `opacity` (0 → 1) | Width drives the layout shift. Opacity fades content in so it doesn't cut on. |
| Focus delay | 120 ms after expand starts (timer, not a transition) | Enough time for the animation to start before focus moves, so the input doesn't flash. |
| Reduced motion | opacity fade only; `width` changes instantly | `prefers-reduced-motion: reduce` via media query. |

> **IMPLEMENTATION RULE: the expand uses `--motion-easing-spring`, not a strong bounce.**
> Earlier this was a spec-locked `cubic-bezier(0.34, 1.56, 0.64, 1)` (a large overshoot past 336px). That violates the system bounce policy (overshoot capped at ~1.04; y2 ≥ 1.08 is a bug — design-system-spec §2.2). It is now the system `--motion-easing-spring` (1.04): a barely-there overshoot, easeful not bouncy. Do not reintroduce a strong-overshoot curve.

---

## 15. Responsiveness

| Viewport | Component | Behaviour |
|---|---|---|
| ≥ 1024px (desktop) | SearchInput standalone | 320px fixed width or 100% in container |
| ≥ 1024px (desktop) | TopNavSearch | Collapsed by default. Expands to 336px (320px bar + 8px container padding × 2) inline in the nav. |
| < 1024px (tablet/mobile) | TopNavSearch | Same collapsed/expanded behaviour. Expanded bar may overlay nav items — caller is responsible for layout. Detailed mobile spec deferred to v2 (see §17). |
| Any | SearchInput height | Always 48px touch target, 36px visual pill. Never shrinks. |

---

## 16. What to pass to implement this component

1. This spec (all sections).
2. The HTML demo: `components/search/search.html` — the production reference. Every state, every interaction is live and inspectable.
3. Figma nodes: 40006978-23158 (base), 40007351-13533 (filter-active), 40007095-4048 (TopNavSearch).
4. Token file: `src/tokens/tokens.css` — all semantic CSS variables, already resolved.
5. Icon ligature names: `search`, `cancel`, `filter_alt` — all Material Symbols Rounded, rendered as font characters.

---

## 17. Gaps and deferred decisions

### Intentional deferrals (v1 scope decision)

| Gap | Priority | Notes |
|---|---|---|
| Open state / results dropdown | DEFERRED | Production dropdown is unchanged and remains as-is. Future v2 pass will design, spec, and release the panel. Figma shows a placeholder only. Agents building products: use [Radix UI `Combobox`](https://www.radix-ui.com/primitives/docs/components/combobox) or `Command` primitive with Pathway semantic tokens applied. |
| Mobile TopNavSearch layout | DEFERRED | Behaviour when the expanded bar overlaps nav content on narrow viewports is not specified for v1. Product + design decision for a future pass. |

### Token gaps (action needed in Figma before next sync)

| Gap | Priority | Notes |
|---|---|---|
| TopNavSearch collapsed button border token | HIGH | `rgba(251,251,251,0.14)` has no semantic token. Needs a dark-mode stroke token from design. |
| Disabled state border/bg tokens | HIGH | Uses primitive tokens `--primitive-color-cool-neutral-30` and `-10` as fallbacks. Must be replaced with semantic equivalents when added to the token file. |
| TopNavSearch dark-surface icon tokens | MEDIUM | Icon fill `rgba(251,251,251,0.9)` and placeholder colour `rgba(255,255,255,0.45)` are raw values. No dark-mode semantic tokens exist for these yet. |
| Badge dot border width | MEDIUM | The dot's white ring uses 1.5px border. `borderwidth.base` = 1px. 1.5px has no semantic token — raw value for now. |
| Icon pill hover/pressed fill | MEDIUM | `fill.action.secondaryinverse.hover` resolves to `warm-neutral-200` (#f7f5f3) — a visible warm cream on white surfaces. Intended behavior is a subtle transparent overlay. Using `rgba(0,0,0,0.06)` and `rgba(0,0,0,0.10)` as fallbacks until a correct semantic token exists. |

---

## 18. Storybook

Not yet in Storybook. The pipeline skill will generate `SearchInput.stories.jsx` and `TopNavSearch.stories.jsx` after this spec reaches `Status: REVIEWED`.

The HTML demo at `components/search/search.html` is the production visual reference until stories exist.

---

## Changelog

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-05-13 | Jo Lopez + Claude | Initial draft. Base search input + TopNavSearch. All states from Figma 40006978-23158, 40007351-13533, 40007095-4048. Filter-active: blue border + tertiary-base funnel fill, input active (not disabled). Spring expand animation locked. |
