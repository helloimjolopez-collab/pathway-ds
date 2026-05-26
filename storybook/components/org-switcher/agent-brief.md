# Org Switcher — Agent Brief

A condensed, paste-friendly summary of the Pathway Org Switcher for AI agents (Claude, Figma Make, v0, Cursor, etc.).

Read this **first**. The full spec is at [org-switcher-spec.md](./org-switcher-spec.md). Status: `PENDING HUMAN REVIEW` — provisional but implemented and consumable.

---

## What this is

`OrgSwitcher` is a **contextual navigation control** that shows the user's current organisation + campus, and lets them switch. It lives inside the TopNav.Global, in the left slot, between ModuleSwitcher and the search/notifications area.

**Do NOT use it for:**
- Module-level navigation (that's SideNav)
- Settings access
- User-profile menu actions
- A generic dropdown / select control — it is **specifically scoped to org+campus switching**

It has two distinct display modes driven by viewport:

- **Desktop / Tablet (≥768px)**: full pill with logo + org name + chevron, e.g. `[🏠 logo] Sacred Heart Church-ITD | Knoxville  ⌄`
- **Mobile (<768px)**: collapsed to logo + truncated name (max 80 px) + chevron, hides separator and campus name

Working code: [org-switcher.html](./org-switcher.html). Module: [org-switcher.jsx](./org-switcher.jsx). Full spec: [org-switcher-spec.md](./org-switcher-spec.md). Mobile abbreviation rules: see Appendix A of the spec.

---

## The 7 rules an AI agent must not skip

1. **Always inside TopNav.Global.** Don't render it outside the TopNav, don't put it on a page, don't make it standalone.

2. **The logo is the org logo, not the product logo.** It's a 20×20 image (or a fallback initial-letter avatar if no logo is set). Source per-org.

3. **The org name is `Org` then `|` then `Campus`.** "Sacred Heart Church-ITD | Knoxville" is the format. On mobile it truncates org with ellipsis at 80 px max-width and may drop the `|Campus` portion.

4. **Bordered pill, not a button.** Border is `stroke/action/tertiary/base` (semi-transparent white on the brand-blue TopNav background). Radius `cornerradius/medium: 8px`.

5. **Chevron is `expand_more` from Material Symbols Rounded.** Same icon family as the rest of the TopNav. 20px size, white.

6. **Click opens a dropdown panel** with searchable org list + campus list. Don't substitute a modal, full page, or inline switcher. The dropdown is anchored to the OrgSwitcher pill.

7. **The pill colour responds to TopNav theme.** Text and chevron use `Text/Static/Primary/Inverse` (`#ffffff`) on the brand-blue TopNav. Don't use dark text.

---

## Tokens

```
/* Pill */
--stroke-action-tertiary-base:   rgba(255,255,255,0.16)
--text-static-primary-inverse:   #ffffff   /* org name */
--cornerradius-medium:           8px

/* Logo */
20×20 px image, no border, rendered inline within the pill

/* Chevron */
expand_more · Material Symbols Rounded · 20px · white

/* Dropdown panel (when open) */
--fill-static-surface-white:     #ffffff
--stroke-static-neutral-subtle:  #ededed
--cornerradius-medium:           8px
shadow: 2px 2px 8px 4px rgba(0,0,0,0.06)
```

### Layout
```
Pill height:          32px (matches Profile circle height)
Pill internal gap:    8px between logo, text, chevron
Pill padding:         0 12px
Mobile max-width:     80px on the org name (truncated with ellipsis)
```

### Typography
```
Org+campus label: 'Red Hat Text' Medium · 14px / 20px / 0.3px letter-spacing
```

---

## Minimal usage

```jsx
import { OrgSwitcher } from "components/org-switcher/org-switcher.jsx";

<OrgSwitcher
  org={{ name: "Sacred Heart Church-ITD", logoUrl: "/orgs/sacred-heart.png" }}
  campus={{ name: "Knoxville" }}
  onSwitch={handleOrgSwitch}
/>
```

If no logo is provided, render a 20×20 circle with the first letter of `org.name` in `Fill/Static/Accent_Amethyst/Base` (same pattern as the Profile avatar).

---

## Accessibility

- Trigger button has `aria-haspopup="listbox"` and `aria-expanded` reflecting dropdown state
- Dropdown is a `role="listbox"` with org and campus options as `role="option"`
- Focus moves to the dropdown on open; Esc closes and returns focus to the trigger
- Tab cycles through orgs first, then campuses

---

## For Figma Make

Paste [`org-switcher.html`](./org-switcher.html) into the Figma Make prompt — already clean, no docs panel.

---

## Figma source

- **File:** Pathway Design System Master File MB 2.0 (`fileKey: 3sw45aVcngFAmpbP6cfrXP`)
- **Component:** see `org-switcher-spec.md` for the Figma node URL
