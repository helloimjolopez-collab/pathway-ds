# SideNav — Agent Brief

A condensed, paste-friendly summary of the Pathway SideNav for AI agents (Claude, Figma Make, v0, Cursor, etc.) building prototypes that include navigation.

Read this **first**. If you need more detail on any rule, follow the link to the full spec section.

---

## What this is

The Pathway SideNav is a **persistent vertical navigation panel** used by every module in Ministry Brands Amplify. It is module-level navigation — not global app navigation, not action buttons, not a menu.

**Hard contract:**
- Two levels of depth max. Level 0 (parent, may have an icon) and Level 1 (child, no icon, indented). Level 1 items never have children — this is enforced at the data layer, not just visually.
- Two widths: **240 px expanded** and **72 px collapsed (icon-only rail)**.
- Three responsive modes: **push** at ≥1024 px, **overlay** at 768–1023 px, **overlay-or-hidden** at <768 px.

Full spec: [sidenav-spec.md](./sidenav-spec.md). Working code: [sidenav.html](./sidenav.html) (single-file React+Babel CDN demo, just open it in a browser). Module: [sidenav.jsx](./sidenav.jsx).

---

## The 10 rules an AI agent must not skip

1. **Use semantic tokens, never raw hex or primitives.** Every colour comes from a `Fill/Contextual/NavItem/*`, `Text/Contextual/NavItem/*`, or `Icon/Contextual/NavItem/*` token. See [§3](./sidenav-spec.md#3-design-tokens).

2. **The `indicator.stripe` column is always in the DOM**, 4 px wide, on every SideNavItem. Only its visual paint is conditional (transparent vs. `#2d4889`). Do not conditionally render the column — removing it causes a 4 px layout shift when an item becomes active. See [§7](./sidenav-spec.md#7-indicatorstripe-sub-component).

3. **Trail-collapsed state**: when a grouper is closed and one of its children is the active destination, the grouper itself shows **Active styling**: same fill (`#a0b5e629`), same text (`#1b2d57`), same icon (`#2d4889`), stripe visible. This applies whether the sidebar is 240 px or 72 px. See [§6](./sidenav-spec.md#6-state-matrix).

4. **Grouper expand/collapse is an accordion**, animated via `grid-template-rows: 0fr → 1fr` at **340 ms `cubic-bezier(0.22, 1, 0.36, 1)`** (easeOutQuart) with the children fading in at **240 ms / 60 ms delay**. The chevron rotates with the same 340 ms timing. **Only one grouper is open at a time** — opening a grouper auto-closes any other expanded grouper (single-open accordion). Children stay in the DOM when the sidebar is expanded so the collapse animation can play. See [§12.1](./sidenav-spec.md#121-grouper-accordion-expandcollapse-expanded-sidebar).

   The **sidebar width itself** (240↔72 px) animates at **380 ms `cubic-bezier(0.32, 0.72, 0, 1)`** (smooth-spring, no overshoot). Item labels and chevrons collapse at 360 ms with the same curve, opacity at 200 ms ease. Do **not** use the strongly-bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` — it overshoots and feels jaunty at panel scale. See [§8.3](./sidenav-spec.md#83-transition).

5. **In the 72 px collapsed rail, groupers do NOT accordion.** Hovering a grouper opens a `CollapsedPopover` flyout (8 px from the rail's right edge) with the group name and children as rows. See [§10.3](./sidenav-spec.md#103-hover-behaviour-destinations-vs-groupers).

6. **Section labels (`NavSectionLabel`) are OPTIONAL.** Use them only when a module needs to organise items into named groups ("MUSIC", "PEOPLE", etc.). When the sidebar collapses to 72 px, section labels become **`Divider` lines** (1 px, `#f6f6f6`) — not hidden. The first section has no divider above it. See [§2.3](./sidenav-spec.md#23-navsectionlabel).

7. **Section labels are flat siblings of nav items, never wrappers.** Wrapping items inside a section div breaks the parent `gap: 6 px` flex layout. See [§2.3](./sidenav-spec.md#23-navsectionlabel) "Implementation pattern."

8. **The CollapseButton renders at ALL breakpoints ≥768 px**, in both the 240 px and 72 px states. It is absent only on mobile (<768 px). At 72 px it shows the expand icon with no label. At 240 px it shows the collapse icon + "Collapse" label. It sits at the **bottom of the scroll flow**, scrolls with content, and has a 1 px divider above it. See [§9](./sidenav-spec.md#9-collapse_expand_nav_container).

9. **Responsive contract**:
   - **≥1024 px**: SideNav is in flow (`flex-shrink: 0`), 240 px or 72 px. Content shifts.
   - **768–1023 px**: 72 px rail in flow by default. Tapping expand → 240 px overlay with scrim.
   - **<768 px**: SideNav **hidden by default**. Hamburger in TopNav reveals a 240 px overlay with scrim. **No 72 px rail at all on mobile.**
   See [§17.2](./sidenav-spec.md#172-sidenav-behaviour-per-breakpoint).

10. **TopNav and SideNav ship together** as a single shell. Never implement one without the other. TopNav lives at `components/top-nav/` (or, until that lands, the inline reference in `sidenav.html`). The mobile hamburger lives in TopNav and calls `onSideNavToggle`.

---

## The exact tokens you need

Paste these into your CSS or token system **as-is**. The names match `tokens/pathway-design-tokens.json` exactly.

### Fill (item background)
```
--fill-contextual-navitem-base:   transparent       /* resting */
--fill-contextual-navitem-hover:  rgba(17,17,17,0.02)
--fill-contextual-navitem-active: rgba(160,181,230,0.16)   /* #a0b5e629 */
--fill-contextual-navitem-trail:  rgba(17,17,17,0.02)      /* expanded grouper */
```

### Text
```
--text-contextual-navitem-base:   #313131
--text-contextual-navitem-hover:  #252525
--text-contextual-navitem-active: #1b2d57   /* used for active AND all trail states */
```

### Icon
```
--icon-contextual-navitem-base:   #484848
--icon-contextual-navitem-hover:  #313131
--icon-contextual-navitem-active: #2d4889   /* icon + indicator stripe + collapsed-trail icon */
```

### Surface & stroke
```
--surface-nav-light:           #fafafa          /* nav background */
--stroke-static-neutral-light: #f6f6f6          /* nav border, NavHeader divider, rail section divider */
--stroke-static-neutral-subtle: #ededed         /* popover border */
```

### Section label (optional)
```
font:        11px/16px 'Red Hat Text', 600 SemiBold, 0.6px letter-spacing, UPPERCASE
color:       #606060   /* Text/Static/Secondary/Subtle */
height:      40px
padding:     8px 4px
```

### Geometry
```
border-radius (items):       8px      /* Component/NavItem/Large/Radius/Radius */
min-height (items):          48px     /* Accessibility/Touch Target/Optimal/Size */
icon wrapper:                24x24    /* Container.LeadingIcon */
icon glyph inside wrapper:   16x16
indicator stripe width:      4px
indicator stripe radius:     0 8px 8px 0   /* rounded on the right only */
expanded width:              240px
collapsed width:             72px
```

---

## Minimal nav-item data shape

```js
const NAV = [
  // Destination (Level 0, no children)
  { id: 'reports', label: 'Reports', icon: 'reports' },

  // Grouper (Level 0, has children — children are always Level 1 leaves)
  { id: 'view', label: 'View', icon: 'view', children: [
    { id: 'trial_balance',    label: 'Trial Balance' },
    { id: 'balance_sheet',    label: 'Balance Sheet' },
  ]},
];

// With optional sections:
const NAV_SECTIONS = [
  { section: 'Music',  items: [ /* ... */ ] },
  { section: 'People', items: [ /* ... */ ] },
];
```

Icons are **Material Symbols Outlined** in the demo. Replace with whatever icon system the prototype uses, but keep the **16 px inside 24 px wrapper** rule.

---

## What "done" looks like (prototype checklist)

Before submitting your prototype, confirm:

- [ ] SideNav uses `#fafafa` background and matches the 240 px / 72 px width contract
- [ ] Every item is 48 px min-height with an 8 px border-radius
- [ ] The 4 px indicator stripe column is always present on every item
- [ ] An active item shows: light blue fill, dark blue text, blue icon, visible stripe
- [ ] Trail-collapsed state works (collapse a grouper whose child is active — grouper shows active styling)
- [ ] Grouper expand/collapse animates via grid-template-rows (not max-height)
- [ ] At 72 px: hovering a grouper opens a popover, not an accordion
- [ ] CollapseButton appears at the bottom in both expanded and collapsed states (and is hidden only on mobile <768 px)
- [ ] Scrollbar is invisible at rest, appears only on hover (4 px wide)
- [ ] At <768 px: nav is hidden by default, hamburger in TopNav reveals 240 px overlay with scrim
- [ ] If sections are used: section labels become divider lines in the 72 px rail (not hidden)
- [ ] No raw hex, no primitive token names, no made-up token names in the code

---

## Where to go next

- **Full spec with every detail:** [sidenav-spec.md](./sidenav-spec.md) — 1,500+ lines, organised by section, governance table at the top tells you which decisions live where.
- **Runnable reference:** [sidenav.html](./sidenav.html) — open it in a browser, resize the window to see all breakpoints, copy any pattern that works.
- **React module to import:** [sidenav.jsx](./sidenav.jsx) — named exports, self-contained, drop-in for any React project.
- **Live Storybook:** https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/components-sidenav--docs
- **Figma source:** [SideNav in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003951-2927)

If anything in this brief disagrees with the full spec, **the full spec wins**. This brief is a condensed pointer, not the source of truth.
