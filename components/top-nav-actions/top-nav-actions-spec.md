# TopNavActions — Pathway Design System Component Spec

**Status:** `PENDING HUMAN REVIEW`

The right-side **action-icon group** of the TopNav, with responsive overflow. When there isn't room for every action icon, they collapse behind a single **ellipsis (`more_vert`)** trigger that opens a **dropdown menu** of the same actions. Always nested inside `TopNav` (like `TopNavSearch`), but specced and Storybooked as its own component. Search and the profile avatar are **not** part of this group and never collapse into it.

## Links

| Artefact | URL |
|---|---|
| Figma — trigger (in TopNav) | [TopNav.Global / Mobile](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40007067-6495) — the `more_vert` ellipsis is drawn here |
| Figma — **Open menu variant** | **Does not exist yet — to be added** (see §15) |
| Storybook | `?path=/docs/library-topnavactions--docs` *(pending — created by the pipeline run)* |
| HTML demo | `components/top-nav-actions/top-nav-actions.html` *(pending)* |
| Parent component | [components/top-nav/top-nav-spec.md](../top-nav/top-nav-spec.md) |

---

## Authorship

Design (Jo Lopez) owns and signs off on: Status, Purpose, Collapse rule, States, Token reference, Figma setup, Accessibility intent, Usage rules.
Engineering owns and signs off on: prop types, the menu's ARIA/keyboard implementation, browser behaviour.
Neither party signs off on the other's section.

---

## 1. Component Overview

### 1.1 What it is

`TopNavActions` is the cluster of **module action icons** that sits in the TopNav's RowEnd, between Search and the Profile avatar. It has two presentations driven entirely by available space:

- **Inline** — every action icon shown directly on the nav bar.
- **Collapsed** — the icons fold behind a single `more_vert` (⋮) ellipsis trigger that opens a **dropdown menu** listing the same actions (icon + label).

### 1.2 What it is **not** / boundaries

- **Search does not collapse into it.** Search has its own pattern (collapsed circle → expand on desktop, full-width takeover on mobile) and lifted query state. It stays a separate, fixed anchor.
- **Profile does not collapse into it.** The avatar (account, switch-org, sign-out) is a top-task and is always directly reachable.
- So the right cluster is always **`[search] · [action icons → ellipsis] · [profile]`** — search and profile are fixed; only this middle group flexes.
- Not a generic dropdown menu primitive, not a context (right-click) menu, not a kebab on arbitrary rows. It is specifically the TopNav action overflow.

### 1.3 The collapse rule

| Breakpoint | Behaviour |
|---|---|
| **Desktop** (≥1024px) | All action icons inline. No ellipsis. |
| **Tablet** (768–1023px) | Ellipsis **only if > 3** action icons; otherwise inline. |
| **Mobile** (<768px) | Ellipsis **if > 1** action icon. A single action stays inline. |

> **IMPLEMENTATION RULE: the ellipsis is a function of count × breakpoint, not a manual toggle.**
> Collapse is computed (`desktop → never; tablet → count > 3; mobile → count > 1`). There is no "show ellipsis" design property; it is runtime behaviour driven by how many actions the module registers and the current breakpoint.

---

## 2. Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Trigger glyph, collapsed/open visual | Design | Figma TopNav node 40007067-6495 + this spec §3–§6 |
| **Open menu variant** (surface, rows, states) | Design | Figma — to be added (§15) |
| Collapse-rule thresholds | Design + Product | §1.3 of this spec |
| Menu ARIA / keyboard implementation | Engineering | §10 of this spec |
| Prop types | Engineering | §4 of this spec |
| Reused dropdown-panel tokens | Design | `components/top-nav` `T` theme (shared with ModuleSwitcher/OrgSwitcher/Profile) |

---

## 3. Anatomy

```
TopNavActions
├── [Inline]  ActionIcon × N            48×48 touch target each, on the dark nav surface
│   └── button.pds-tna__icon            p-8, radius 8, monoBase icon (20px)
│
└── [Collapsed]
    ├── button.pds-tna__ellipsis        48×48, more_vert (⋮, 20px), aria-haspopup="menu"
    └── [open] div.pds-tna__menu        role="menu" — dropdown panel, right-anchored
        ├── div.pds-tna__tapcatcher     fixed inset:0, transparent — outside-tap dismissal
        └── button.pds-tna__item × N    role="menuitem" — icon (22px) + label (15px)
```

The menu reuses the **same dropdown-panel surface** as the TopNav's ModuleSwitcher / OrgSwitcher / Profile menus (white surface, border, shadow, radius, `z-index: 300`) — it is not a new surface.

---

## 4. API / Variant structure

No design-time *variant* properties — Inline vs Collapsed is computed (§1.3), and Open is a runtime **state** (§5), not a prop. The surface is:

| Prop | Type | Default | Description |
|---|---|---|---|
| `actions` | `Array<{ id, icon, label, onClick, badge? }>` | `[]` | The module's action icons. `icon` = Material Symbols Rounded ligature; `label` = menu-row text + `aria-label` when inline. |
| `breakpoint` | `"desktop" \| "tablet" \| "mobile"` | `"desktop"` | Drives the collapse rule (§1.3). Supplied by the parent `TopNav`. |
| `className` | `string` | `""` | Extra class on the root. |

Open/closed is internal state (`aria-expanded` reflects it). Per `CLAUDE.md §10.9`, this nests under TopNav as `TopNav.actions` (the parent passes `breakpoint`).

> **IMPLEMENTATION RULE: every action needs a label.** A menu row is icon + text; icon-only menu rows are an a11y failure. The same `label` doubles as the inline icon button's `aria-label`.

---

## 5. State matrix

| State | When | Treatment |
|---|---|---|
| **Inline – rest** | not collapsed | icons transparent bg, `monoBase` glyph |
| **Inline – hover** | pointer over an inline icon | bg `controlHover` |
| **Ellipsis – rest** | collapsed, menu closed | ⋮ transparent bg, `monoBase` |
| **Ellipsis – hover** | collapsed, hover | bg `controlHover` |
| **Ellipsis – open** | menu open | bg `controlPressed`, `aria-expanded="true"` |
| **Menu item – rest** | menu open | transparent, `itemText` label + `itemTextBase` icon |
| **Menu item – hover/focus** | pointer or keyboard focus | bg `activeItem` |

---

## 6. Design Tokens

All semantic. Trigger/inline icons sit on the **dark** nav surface (dark-mode control tokens); the open menu is a **light** panel (light-mode tokens) — same split TopNav already uses.

| Element | Property | Semantic token | Resolved |
|---|---|---|---|
| Inline icon / ellipsis glyph | colour | `dark-mode.icon.action.mono.base` | `#fbfbfb` |
| Icon button | hover bg | `dark-mode.fill.action.primaryinverse.hover` | `rgba(10,18,35,0.16)` |
| Ellipsis (open) | bg | `dark-mode.fill.action.primaryinverse.pressed` | `rgba(255,255,255,0.08)` |
| Menu panel | surface | `light-mode.fill.static.neutral.light` | `#ffffff` |
| Menu item | label | `light-mode.text.static.secondary.bold` | `#252525` |
| Menu item | leading icon | `light-mode.text.static.secondary.base` | `#484848` |
| Menu item | hover/focus bg | `light-mode.fill.action.tertiary.base` | `#eef2fb` |

| Geometry | Value | Token |
|---|---|---|
| Icon / ellipsis touch target | 48×48 | `Accessibility/Touch Target` (44 min) + nav padding |
| Icon button radius | 8 | `layout.units.cornerradius.medium` |
| Inline glyph size | 20 | — |
| Menu row height | 48 | `Accessibility/Touch Target` |
| Menu row leading icon | 22 | — |
| Menu label | 15 / 500 | `Label/Menu/*` (confirm scale step in Figma) |
| Menu width | 240 | — |
| Menu offset below trigger | 4 | `layout.units.padding.xxtight` (4) |
| Menu z-index | 300 | matches TopNav dropdowns |

> **Inherited token gaps (from TopNav, already flagged P2):** the panel **border** (`rgba(45,72,137,0.12)`) and **shadow** have no semantic tokens yet. TopNavActions reuses TopNav's values, so it inherits the same gap — do not invent new ones here; close them once at the TopNav level.

---

## 7. Iconography

Material Symbols Rounded, always.

| Use | Ligature | Size | FILL |
|---|---|---|---|
| Overflow trigger | `more_vert` (⋮) | 20 | confirm in Figma |
| Menu rows / inline icons | per action (e.g. `notifications`, `campaign`) | 22 (menu) / 20 (inline) | confirm in Figma |

> Trigger is `more_vert` (vertical ⋮) to match the TopNav Mobile Figma frame. (If the system prefers horizontal `more_horiz` (⋯), that is a one-line change — confirm.)

---

## 8. Behaviour & interaction

- **Open:** tap/click or `Enter`/`Space` on the ⋮ opens the menu, right-anchored below the trigger; `aria-expanded` → true.
- **Dismiss:** outside tap (a transparent full-screen tap-catcher catches touch reliably), `Escape`, or selecting an item. Focus returns to the ⋮ on Escape/select.
- **Mobile-optimal, not mobile-first:** an anchored dropdown (consistent with the SideNav/search overlay family), **not** a bottom sheet — but tuned for touch: 48px rows, 240px width, transparent tap-catcher, **no dimming scrim**. (Rationale: these are low-priority actions and nothing else in the system uses bottom sheets; a true mobile-first pass is a future, system-wide decision.)
- **One panel at a time:** opening this menu closes any other open TopNav panel (ModuleSwitcher/OrgSwitcher/Profile), per TopNav §5 rule.
- **Interaction with search takeover:** when search does its mobile full-width takeover it covers the whole bar (including the ⋮); closing search restores `[search] [⋮] [profile]`. No shared slot, no conflict.

---

## 9. Responsiveness

See the collapse rule (§1.3). The group only ever renders **inline** (desktop, or low count) or **collapsed** (tablet >3, mobile >1). The open menu is right-anchored at every breakpoint where it appears (tablet + mobile), so it never collides with the left cluster. Search and profile positions are unaffected by collapse (the ellipsis occupies one 48px slot just as a single icon would).

---

## 10. Accessibility

- **Trigger:** `<button aria-haspopup="menu" aria-expanded={open} aria-label="More actions">`.
- **Menu:** `role="menu"`; each item `role="menuitem"`, `tabindex="-1"`, activated by click / `Enter` / `Space`.
- **Keyboard:** `↓`/`↑` move focus between items (wrapping); `Escape` closes and returns focus to the ⋮; `Tab` closes the menu and moves on. On open, focus moves to the first item.
- **Inline icons:** each is a `<button aria-label="{label}">` (e.g. "Notifications").
- **Touch targets:** 48×48 trigger and inline icons; 48px menu rows — all ≥ WCAG 2.5.5 (44px).
- **Reduced motion:** the open animation is removed under `prefers-reduced-motion: reduce`; the menu appears instantly. Behaviour unaffected.
- **Contrast:** ellipsis glyph `#fbfbfb` on the brand-navy nav surface, and menu label `#252525` on `#ffffff` (16.1:1) — both pass. Confirm the ellipsis-on-navy ratio in engineering.

### Screen-reader announcements

| Action | Announcement |
|---|---|
| Ellipsis focused (closed) | "More actions, collapsed, button" |
| Ellipsis opened | "More actions, expanded, button" |
| Item focused | "{label}, menu item, N of M" |

---

## 11. Motion

The menu open/close reuses the **TopNav dropdown-panel motion** (same as ModuleSwitcher/OrgSwitcher/Profile — see `top-nav-spec.md §14`): a short fade + slight scale/translate from the trigger, ~150–180ms, reduced-motion → instant. Do not give this menu a bespoke curve; it should feel identical to the other TopNav dropdowns.

---

## 12. HTML / usage examples

**Inline (desktop):**
```jsx
<TopNavActions breakpoint="desktop" actions={[
  { id:"notifications", icon:"notifications", label:"Notifications", onClick: openNotifs },
  { id:"alerts",        icon:"campaign",      label:"Alerts",        onClick: openAlerts },
]} />
```

**Collapsed (mobile, >1 action → ellipsis + menu):**
```jsx
<TopNavActions breakpoint="mobile" actions={moduleActions} />
// renders the ⋮; tapping it opens the dropdown menu of the same actions
```

---

## 13. What to pass to implement (pipeline checklist)

1. This spec.
2. The studio demo: `components-sandbox/top-nav-actions-demo.html` (closed + open, all breakpoints, the collapse toggles).
3. TopNav `T` theme tokens (reuse — don't redefine).
4. Material Symbols ligatures: `more_vert` + each action's icon.
5. The Figma Open-variant once added (§15).

---

## 14. Constraints

1. **Only action icons collapse** — never search, never profile.
2. **Every action has a label** (menu row + inline `aria-label`).
3. **Reuse the TopNav dropdown panel** surface/motion — do not invent a new menu surface.
4. **Anchored dropdown, not a bottom sheet** — consistent with the system; revisit only in a deliberate mobile-first pass.
5. **Collapse is computed** from count × breakpoint — not a manual prop.
6. **Semantic tokens only.**

---

## 15. Figma gaps — what to add

| Gap | Priority | Notes |
|---|---|---|
| **Open menu variant** | HIGH | Figma shows only the closed ⋮ trigger (node 40007067-6495). Add an **Open** state/variant: the dropdown panel (reuse the ModuleSwitcher/OrgSwitcher panel component) with the action rows (icon + label), at the menu sizing in §6, anchored under the ⋮. This is what gives 1:1 Figma↔repo parity. |
| **Action labels** | HIGH | Each action icon needs a text label for its menu row (Notifications, Alerts, …). Add to the Figma actions. |
| **Collapse-rule annotation** | MEDIUM | Document the count×breakpoint rule (§1.3) in a Figma doc frame so designers represent the right state per breakpoint. |
| **Trigger FILL axis** | LOW | Confirm `more_vert` FILL (0 vs 1) in Figma so code matches. |
| **Badge roll-up** | LOW (future) | If a collapsed action carries an unread badge, the ⋮ should surface a single roll-up dot. Notification badges aren't designed yet (TopNav §17) — defer with that work. |

---

## 16. AI agent implementation guide

- **Reference files:** `components/top-nav/top-nav.jsx` (existing `TopNavActions` export + `T`/`L`), `components-sandbox/top-nav-actions-demo.html` (behaviour), this spec.
- **Content structure:** extract `TopNavActions` to `components/top-nav-actions/top-nav-actions.{jsx,html}`; TopNav imports it (nested, like TopNavSearch).
- **Common pitfalls:** don't fork the dropdown-panel styling (reuse TopNav's); don't let the ellipsis or menu shift the search/profile slots; keep the menu right-anchored; preserve focus return on Escape.
- **Verify:** Storybook story with a `breakpoint` control + an `actions` count, showing inline / collapsed / open; computed touch targets ≥ 44px.

---

## Changelog

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-06-25 | Jo Lopez + Claude | Initial draft from the studio demo. Only action icons collapse; ellipsis (`more_vert`) → anchored dropdown menu reusing the TopNav panel; mobile-optimal (48px rows, tap-catcher, no sheet); collapse rule desktop=inline / tablet>3 / mobile>1. Figma Open-variant + labels flagged as the parity gap. |
