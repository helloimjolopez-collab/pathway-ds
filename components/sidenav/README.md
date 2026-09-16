# SideNav

The left navigation rail. Two depth levels, two widths (250 px expanded, 72 px collapsed rail), three responsive modes (push on desktop, overlay on tablet, hidden drawer on mobile).

**This page is the front door.** It answers the questions you have in the first thirty seconds and links to the detail. The full reference is [`sidenav-spec.md`](./sidenav-spec.md), which is 1,800 lines — do not start there.

---

## Links

| | |
|---|---|
| Live demo | https://helloimjolopez-collab.github.io/pathway-ds/components/sidenav/sidenav.html |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-sidenav--docs |
| Figma component set | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40004059-1374 |
| Full spec | [`sidenav-spec.md`](./sidenav-spec.md) |
| React module | [`sidenav.jsx`](./sidenav.jsx) |
| Web component | [`pathway-sidenav.js`](./pathway-sidenav.js) (`<pathway-sidenav>`) |

---

## Icons: Material Symbols Rounded

**Library:** Google Material Symbols, **Rounded** style. Never Outlined, never Sharp.

**Where the names come from:** https://github.com/google/material-design-icons — the folder name *is* the ligature string. Browse and filter Style = Rounded at https://fonts.google.com/icons.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
<span class="material-symbols-rounded">dashboard</span>
```

**Axis settings this component uses:** `'FILL' 0` (outlined, not solid), `'wght' 400`, `'GRAD' 0`, `'opsz' 20`. Icon **frame** is 16 px inside a 24 px wrapper — size by the frame, never the vector. See [design-system-spec §7.2](../../docs/design-system-spec.md).

**The two exceptions.** The collapse/expand control uses two custom 12×12 SVG paths (`right_panel_open`, `left_panel_open`) because no Material Symbol matches. They live at the bottom of `sidenav.jsx`. Everything else is a ligature.

---

## Tokens

Load `themes/light.css` + `themes/midnight.css`, `layout.css`, `layout-contextual.css` and `type.css`. Never reference a `--primitive-*`.

**Colour** — 13 tokens:

```
fill-surface-sheet                   the nav container (white)
fill-surface-elevated                PopoverMenu
fill-action-selection-hover          item hover
fill-action-selection-selected       item active
fill-action-selection-trail          ancestor-of-active trail
fill-action-primary-strong-pressed   the active indicator stripe
foreground-action-secondary-rest     label + icon + chevron, resting
foreground-action-secondary-hover    …hover
foreground-action-secondary-pressed  …active
foreground-action-disabled           disabled
foreground-static-neutral-base       section labels
stroke-static-neutral-base           container right border
stroke-static-neutral-faint          dividers, popover edges
```

Label, icon and chevron all resolve to the **same** token per state on purpose: a nav item is one interactive surface, so its foreground must not split across two ramps that can drift.

**Layout** — semantic, plus two component metrics:

```
--contextual-layout-units-sidenav-width-expanded    250px
--contextual-layout-units-sidenav-width-collapsed    72px
--semantic-layout-units-padding-base / -medium / -tight / -xtight / -xxtight / -xxwide
--semantic-layout-units-gap-xtight
--semantic-layout-units-cornerradius-medium
--semantic-layout-units-accessibility-touch-target-aa-height    44px
```

Still untokenised, and honest about it: leading-icon wrapper (24), icon frame (16), level-1 indent (24), stripe width (4). Tracked in [spec §16](./sidenav-spec.md#16-figma-gaps-blocks-to-full-token-driven-implementation).

**Motion** — tokens only, never a raw duration or curve:

| What | Duration | Easing |
|---|---|---|
| Panel width 250 ↔ 72 | `--motion-duration-6` | `--motion-easing-emphasized` |
| Label / chevron collapse | `--motion-duration-6` | `--motion-easing-emphasized` |
| Opacity | `--motion-duration-3` | `--motion-easing-standard` |
| Grouper accordion | `--motion-duration-6` | `--motion-easing-accordion` |

Reduced motion: see [spec §14](./sidenav-spec.md#14-motion).

---

## Accessibility, in short

`<nav aria-label>` wrapper · items are `<button>` or `<a>` by role · `aria-current="page"` on the active destination · `aria-expanded` on groupers · full keyboard traversal with roving focus · focus ring is `Stroke/FocusRing/Base`, never removed · the collapse control keeps an accessible name in both states · touch targets are 44 px minimum.

Full detail, including the screen-reader announcement table: [spec §13](./sidenav-spec.md#13-accessibility).

---

## Where to look for what

| Question | Go to |
|---|---|
| How do I install and consume it? | [spec §0](./sidenav-spec.md#0-consuming-this-component) |
| What are the parts called? | [spec §2](./sidenav-spec.md#2-component-anatomy) |
| Every token, with values | [spec §3](./sidenav-spec.md#3-design-tokens) |
| Spacing and layout numbers | [spec §4](./sidenav-spec.md#4-layout--spacing) |
| What states exist | [spec §6](./sidenav-spec.md#6-state-matrix) |
| Collapsed-rail behaviour | [spec §10](./sidenav-spec.md#10-sidebar-collapsed-state) |
| Icons | [spec §11](./sidenav-spec.md#11-iconography) |
| Click, hover, keyboard | [spec §12](./sidenav-spec.md#12-interaction-patterns) |
| Accessibility | [spec §13](./sidenav-spec.md#13-accessibility) |
| Motion | [spec §14](./sidenav-spec.md#14-motion) |
| Known gaps | [spec §16](./sidenav-spec.md#16-figma-gaps-blocks-to-full-token-driven-implementation) |
| Breakpoint behaviour | [spec §17](./sidenav-spec.md#17-responsiveness) |
| Building it with an agent | [spec §18](./sidenav-spec.md#18-ai-agent-implementation-guide) · [`agent-brief.md`](./agent-brief.md) |

---

## What every file in this folder is

The folder looks crowded because eight of the files are Code Connect mappings, one per sub-component. They are not documentation.

| File | What it is |
|---|---|
| `README.md` | This page |
| `sidenav-spec.md` | The full reference. Everything, in depth |
| `agent-brief.md` | A condensed brief for handing the component to an AI agent |
| `sidenav.jsx` | **Source of truth.** The React module Storybook and the demo both import |
| `sidenav.html` | Standalone demo, React + Babel over CDN. Inlines the same logic |
| `sidenav-figmamake.html` | **Derived.** Generated from `sidenav.html` by `scripts/build-component.py`. Never hand-edit |
| `pathway-sidenav.js` | `<pathway-sidenav>` web component wrapping `sidenav.jsx` |
| `pathway-sidenav.html` | Demo for the web component |
| `sidenav-*.figma.ts` (×8) | Figma Code Connect mappings, one per sub-component. Drive what Figma Dev Mode shows |

---

## Two rules that will surprise you

**This component is exempt from Figma overrides.** Token sync and the component pipeline pull from Figma normally for everything else, but SideNav is not re-synced unless someone explicitly asks in that session. A reconciliation run *will* report drift here, and that report is accurate — the correct action is still to leave the repo alone and ask. Why: the Figma collapse/expand icon was changed after the repo pulled it on 2026-05-12 and that change was rejected. See [CLAUDE.md §1.1](../../CLAUDE.md).

**The scrollbar is not ours.** When the menu is taller than the panel it scrolls via the system [`<Scrollable>`](../scrollbar/scrollbar-spec.md) component, which hides the native bar and draws a slim overlay thumb. SideNav nests it rather than rolling its own.
