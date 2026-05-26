# TopNav.Global — Agent Brief

A condensed, paste-friendly summary of the Pathway TopNav.Global for AI agents (Claude, Figma Make, v0, Cursor, etc.) building prototypes that include the global top navigation.

Read this **first**. The full spec is at [top-nav-spec.md](./top-nav-spec.md).

---

## What this is

`TopNav.Global` is the **fixed horizontal bar at the top of every Pathway page**. It is the only navigation element that persists across all modules and all screen sizes. It pairs with the SideNav as the application shell — never ship one without the other.

**Three jobs:** (1) ModuleSwitcher — which module you're in, (2) OrgSwitcher — which church/campus you're operating as, (3) Search + Notifications + Profile.

**Hard contract:**
- **Height: 56 px** (54 px on tablet per Figma; unified to 56 px in implementation)
- **Background: `Fill/Static/Brand/Base` → `#2d4889`** (brand blue, NOT dark navy)
- **Position: `fixed; top: 0; left: 0; right: 0; z-index: 100`**
- All icons are **Material Symbols Rounded** (Google Fonts CDN). Branded assets (Amplify Home icon, org logo) are SVGs/images.
- Three breakpoint variants: Desktop (1440px), Tablet (768px), Mobile (393px) — see §3 in the full spec.

Working code: [top-nav.html](./top-nav.html). Module: [top-nav.jsx](./top-nav.jsx). Full spec: [top-nav-spec.md](./top-nav-spec.md).

---

## The 8 rules an AI agent must not skip

1. **Ship TopNav and SideNav together as a single shell.** Never produce a prototype with only one of them.

2. **Use the brand-blue background.** `Fill/Static/Brand/Base` → `#2d4889`. Not dark navy (`#0a1223`). Not custom.

3. **Slot layout (left → right) is fixed:**
   - **Row Start:** SideNav hamburger (mobile only, hidden ≥768px) · ModuleSwitcher (Amplify Home icon + `expand_more` chevron, NO text) · OrgSwitcher (church logo 20×20 + org name + `expand_more` chevron, with `stroke/action/tertiary/base` border)
   - **Row End:** Search (48×48 wrapper → 32×32 circle with `cornerradius/full: 64px` + `search` icon) · Desktop: 2× `notifications` bells (48×48 each) | Tablet+Mobile: `more_vert` (48×48) · Profile (32×32 circle, `Fill/Static/Accent_Amethyst/Base` `#dcd9ef`, initials in `#221e3f`)

4. **The mobile hamburger lives in TopNav.** It calls `onSideNavToggle` to open the SideNav overlay. The TopNav owns this control, not the SideNav.

5. **Desktop shows 2 notification bells; tablet and mobile show `more_vert`.** Not the other way around. See Figma node `40007067:8151` (tablet) and `40007067:8205` (mobile).

6. **Profile is amethyst, always.** Background `Fill/Static/Accent_Amethyst/Base` (`#dcd9ef`), text `Text/Static/Accent-Amethyst/Contrast` (`#221e3f`). Initials, not photos.

7. **Search is a 32×32 circle, not a search field.** `cornerradius/full: 64px`. Click expands a dropdown/modal — the bar stays narrow at all times.

8. **All Material Symbols Rounded, no exceptions.** Specifically: `menu`, `expand_more`, `search`, `notifications`, `more_vert`. Use Google Fonts CDN: `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`.

---

## The exact tokens you need

```
--fill-static-brand-base:            #2d4889   /* TopNav background */
--fill-static-surface-white:         #ffffff   /* Search circle, Profile (if overridden) */
--fill-static-accent-amethyst-base:  #dcd9ef   /* Profile avatar background */
--text-static-accent-amethyst-contrast: #221e3f /* Profile initials text */
--stroke-action-tertiary-base:       rgba(255,255,255,0.16)  /* OrgSwitcher pill border */
--text-static-primary-inverse:       #ffffff   /* TopNav labels + icons */
```

Typography for org name and module label: `Label/Menu/Base/Medium` — `'Red Hat Text'`, 500 weight, 14px / 20px / 0.3px letter-spacing, white text.

### Cornerradius
```
cornerradius/medium:  8px    /* OrgSwitcher pill */
cornerradius/full:    64px   /* Search circle, Profile circle */
```

### Spacing
```
TopNav height:        56px   (54px on tablet per Figma; use 56px in code)
TopNav padding:       12px L/R on tablet · 16px L/R on desktop
SearchButton wrapper: 48×48
SearchButton inner:   32×32 (cornerradius full 64)
Bell wrapper:         48×48
Profile wrapper:      32×32 (cornerradius full 64)
Slot gap:             8px between siblings on the right
```

---

## Minimal usage

```jsx
import { TopNav } from "components/top-nav/top-nav.jsx";

<TopNav onSideNavToggle={handleHamburger} />
```

If the real `top-nav.jsx` module isn't available, copy the implementation block from [top-nav.html](./top-nav.html) — it's a self-contained React+Babel CDN demo that runs as-is.

---

## What "done" looks like (prototype checklist)

- [ ] TopNav is 56 px tall, brand-blue (`#2d4889`), fixed at top of viewport
- [ ] ModuleSwitcher shows Amplify Home icon + `expand_more`, no text label
- [ ] OrgSwitcher shows church logo + org name + `expand_more`, in a bordered pill
- [ ] Search is a 32×32 circle with `search` icon (not a text field)
- [ ] Desktop has TWO notification bells; tablet/mobile has one `more_vert`
- [ ] Profile is amethyst (`#dcd9ef` bg, `#221e3f` text), 32×32 circle, initials only
- [ ] Mobile (<768px): hamburger appears on the left, hidden at ≥768px
- [ ] All icons are Material Symbols Rounded from Google Fonts CDN
- [ ] SideNav is shipped alongside (use `components/sidenav/`)

---

## For Figma Make

Paste [`top-nav.html`](./top-nav.html) into the Figma Make prompt — it's already clean (no docs panel). Pair with this brief for the contract rules.

---

## Figma source

- **File:** Pathway Design System Master File MB 2.0 (`fileKey: 3sw45aVcngFAmpbP6cfrXP`)
- **Component:** [TopNav.Global in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40005504-55844)
- **Breakpoint variants:**
  - Desktop 1440px: `40007103:17678`
  - Tablet 768px: `40007067:8151`
  - Mobile 393px: `40007067:8205`

If anything in this brief disagrees with the full spec, **the full spec wins**.
