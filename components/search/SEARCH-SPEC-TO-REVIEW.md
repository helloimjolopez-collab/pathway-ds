# Search — Spec to Review
### Pathway Design System · Handoff Package · 2026-05-14

**From:** Jo Lopez (Design)
**To:** DS Owner (Engineering)
**Status:** `PENDING HUMAN REVIEW`

This file contains everything needed to implement the Search component end to end.
Nothing is missing. Nothing links out to a file you have to go find.

---

## What's in here

1. [The spec](#the-spec) — complete design spec, all states, tokens, anatomy, accessibility, motion
2. [Figma links](#figma-links) — clickable URLs to the exact frames
3. [Token reference](#token-reference) — every CSS variable used, with resolved hex values
4. [Icon paths](#icon-paths) — the three SVG paths, ready to paste
5. [HTML demo](#html-demo) — the full working demo file, paste-ready

---

## The Spec

### Overview

Two components ship together:

**SearchInput** — pill-shaped search bar with leading icon, free-text field, optional clear button, optional filter button. Used on light surfaces in page bodies, drawers, command bars.

**TopNavSearch** — wrapper that hosts SearchInput in the top nav. Three modes: Collapsed (48×48 dark-surface icon button), Expanded (bar slides in with spring animation), Open (bar + results dropdown — design TBD, not shipped yet).

**Filter-active state:** when the user returns from a filter page with filters applied — blue border on bar, `fill.action.tertiary.base` (#eef2fb) background on funnel pill, dot badge on funnel, **input stays fully active and interactive**.

**Not used for:** inline list filtering, command palettes, form autocomplete, global persistent nav state.

---

### Governance

| To change… | Owner | Where |
|---|---|---|
| Visual appearance of any state | Design | Figma (see links below) |
| Token assignments | Design | Token reference section below |
| Expand/collapse animation | Design | Motion section below |
| Prop names, types, defaults | Engineering | Props section below |
| ARIA implementation | Engineering | Accessibility section below |
| Open state dropdown | Design | Not yet designed — flagged in Gaps |

---

### Anatomy

#### SearchInput

```
SearchInput.TouchTarget              48px height, full width, flex column, justify center
└── SearchInput.Inner                min-height 36px, border-radius 64px pill, flex row, overflow clip
    ├── SearchInput.LeadSlot         flex-shrink 0
    │   └── SearchInput.IconButton   24×24px, border-radius 12px
    │       └── SearchInput.IconPill 64px radius, 4px padding
    │           └── <svg> search     16×16px
    ├── SearchInput.LabelSlot        flex 1, min-width 0
    │   └── <input type="text">      flex 1, transparent bg, no border, no outline
    └── SearchInput.TrailingSlot     flex-shrink 0, flex row, align center, gap 0
        ├── [CancelBtn]              24×24px — visible only when input has text
        └── [FilterWrap]             border-left 0.75px + 4px padding-left
            └── FilterBtn            24×24px icon-pill
                └── <svg> funnel     16×16px
                [Badge]              6×6px dot, absolute top-right of button
```

#### TopNavSearch

```
TopNavSearch.Container               overflow hidden, padding 4px, flex row align center
├── CollapsedBtn                     48×48px, border-radius 12px — shown when collapsed
│   └── IconPill                     36×36px inner
│       └── <svg> search             20×20px
└── ExpandedBar                      width: 0 → 336px animated
    └── SearchInput                  320px wide
        (search icon = collapse trigger)
```

---

### Props

#### SearchInput

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | `""` | Controlled |
| `placeholder` | `string` | `"Search..."` | |
| `showFilter` | `boolean` | `false` | Renders filter button + divider |
| `filterActive` | `boolean` | `false` | Blue border + highlighted funnel |
| `filterBadge` | `boolean` | `false` | Dot badge on funnel |
| `disabled` | `boolean` | `false` | 38% opacity, non-interactive |
| `error` | `boolean` | `false` | Red border + icon |
| `onSearch` | `(value: string) => void` | — | Enter or search icon tap |
| `onFilterClick` | `() => void` | — | Filter button tap |
| `onChange` | `(value: string) => void` | — | Every keystroke |
| `onClear` | `() => void` | — | Clear button tap |
| `className` | `string` | `""` | |
| `id` | `string` | — | For label association |

#### TopNavSearch

| Prop | Type | Default | Notes |
|---|---|---|---|
| `expanded` | `boolean` | `false` | Controlled |
| `onExpandChange` | `(expanded: boolean) => void` | — | |
| `searchProps` | `SearchInputProps` | — | All SearchInput props forwarded |
| `className` | `string` | `""` | |

---

### States

| State | Bar border | Border width | Bar bg | Icon | Filter pill bg |
|---|---|---|---|---|---|
| **Idle** | `#d2d2d2` | 0.75px | `#ffffff` | `#6b6b6b` | — |
| **Hover** | `#c4c4c4` | 1px | `#ffffff` | `#606060` | — |
| **Focused** | `#a0b5e6` | 1px | `#ffffff` | `#606060` | — |
| **With-value** | `#a0b5e6` | 1px | `#ffffff` | `#6b6b6b` | — |
| **Filter-active** | `#a0b5e6` | 1px | `#ffffff` | `#6b6b6b` | `#eef2fb` |
| **Disabled** | `#ededed` | 1px | `#fbfbfb` | `#979797` | — |
| **Error** | `#b03a3a` | 1px | `#ffffff` | `#b03a3a` | — |

**State rules:**
1. Idle = default
2. Hover = mouseenter, not focused
3. Focused = on focus, overrides hover
4. With-value = on blur with text in field
5. Filter-active = filters applied by user returning from filter page. Input stays active.
6. Disabled = opacity 0.38 on whole touch target, pointer-events none
7. Error = overrides everything except disabled
8. Filter-active + with-value can coexist

> **IMPLEMENTATION RULE — filter-active does not disable the input.**
> `filterActive` applies visual treatment only. Never set `disabled` on the `<input>` when filter is active. The user must be able to type while filters are applied.

---

### Sub-components

**Cancel button**
- `<button aria-label="Clear search">`
- Hidden (`display: none`) until `value.length > 0`
- No divider between cancel and text field
- On click: clear value, hide self, refocus input

**Filter wrap + divider**
- `border-left: 0.75px solid #c0ceef` + `padding-left: 4px` on the wrap element
- Divider is a CSS border, not a separate DOM element
- Funnel aria-label: `"Open filters"` or `"Open filters (filters active)"`

**Badge dot**
- 6×6px, `position: absolute; top: 1px; right: 1px` on the badge-wrap
- Fill: `#345499` (`fill.action.primary.base`)
- Border: `1.5px solid #ffffff` (white ring)
- `aria-hidden="true"` — accessible state communicated via aria-label change on button

---

### Layout and spacing

| What | Value | Token |
|---|---|---|
| Gap between pill children | 8px | `layout.units.gap.xtight` |
| Pill padding-inline | 8px | `layout.units.padding.xtight` |
| Icon pill padding | 4px | `layout.units.padding.xxtight` |
| Filter divider gap (padding-left) | 4px | `layout.units.padding.xxtight` |
| TopNavSearch container padding | 4px | `layout.units.padding.xxtight` |

> **IMPLEMENTATION RULE — unit tokens are unitless.**
> Every `--primitive-unit-*` token is a bare number (`64`, not `64px`). Always use `calc(var(--primitive-unit-unit-XX) * 1px)` to get a valid CSS length.

---

### Geometry

| What | Value | How |
|---|---|---|
| Bar border-radius | 64px | `calc(var(--primitive-unit-unit-64) * 1px)` |
| Icon button radius | 12px | `calc(var(--primitive-unit-unit-12) * 1px)` |
| Collapsed button radius | 12px | same |
| Default border | 0.75px | `calc(var(--primitive-unit-unit-0-point-75) * 1px)` |
| Active border | 1px | `calc(var(--primitive-unit-unit-1) * 1px)` |
| Touch target height | 48px | hard-coded |
| Pill min-height | 36px | hard-coded |
| Icon size (bar) | 16×16px | hard-coded |
| Icon size (collapsed btn) | 20×20px | hard-coded |

---

### Typography

| Property | Value | How |
|---|---|---|
| Font family | Red Hat Text | `var(--semantic-type-desktop-label-input-base-regular-fontfamily)` |
| Weight | 400 | — |
| Size | 14px | `calc(var(--primitive-unit-unit-14) * 1px)` |
| Line height | 20px | `calc(var(--primitive-type-line-height-14pt-single) * 1px)` |
| Letter spacing | 0.3px | `calc(var(--primitive-type-letter-spacing-wide) * 1px)` |

---

### TopNavSearch container

**Collapsed button:**
- 48×48px, border-radius 12px
- Background: `rgba(160,181,230,0.08)` → `fill.action.primaryinverse.base`
- Border: `1.5px solid rgba(251,251,251,0.14)` — no semantic token yet (flagged in Gaps)
- Icon fill: `rgba(251,251,251,0.9)` — no dark-mode token yet (flagged in Gaps)

**Expanded bar:**
- `overflow: hidden` on container clips the slide-in
- Padding: 4px wrap
- SearchInput width: 320px fixed

---

### Motion

Applies to TopNavSearch expand/collapse only.

| Property | Value |
|---|---|
| Expand duration | 350ms |
| Collapse duration | 300ms |
| Expand easing | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Collapse easing | `ease-in` |
| Animated properties | `width` (0 → 336px) + `opacity` (0 → 1) |
| Focus delay | 120ms after expand starts |
| Reduced motion | `opacity` fade only, 150ms ease, width instant |

> **IMPLEMENTATION RULE — the spring overshoot is intentional and spec-locked.**
> `cubic-bezier(0.34, 1.56, 0.64, 1)` makes the bar overshoot slightly before settling. This is a deliberate design decision. Do not smooth it out.

---

### Accessibility

**ARIA pattern:** SearchInput uses the Searchbox pattern (`type="search"`). TopNavSearch uses disclosure pattern.

**Touch targets:** 48×48px on bar (WCAG 2.5.5 AAA). 48×48px on collapsed button. Icon buttons inside bar are 24×24px visual — engineering to confirm 44×44px effective hit area.

**Keyboard:**

| Key | Behaviour |
|---|---|
| Tab | search icon → input → clear (if present) → filter (if present) |
| Enter (in input) | triggers onSearch |
| Escape (expanded) | collapses, returns focus to collapsed button |
| Space / Enter (buttons) | activates |

**Focus ring:** `outline: 2px solid #3555a0; outline-offset: 2px; border-radius: 12px` on icon buttons.

**ARIA markup:**

```html
<!-- SearchInput -->
<div class="search" role="search" aria-label="Search">
  <div class="search__inner">
    <button class="search__icon-btn" aria-label="Search" type="button"><!-- search svg --></button>
    <input class="search__input" type="search" placeholder="Search..." autocomplete="off" aria-label="Search" />
    <!-- when value non-empty: -->
    <button class="search__cancel" aria-label="Clear search" type="button"><!-- X svg --></button>
    <!-- when showFilter: -->
    <div class="search__filter-wrap">
      <button class="search__filter-btn" aria-label="Open filters" type="button"><!-- funnel svg --></button>
      <!-- when filterBadge: -->
      <span class="search__badge" aria-hidden="true"></span>
    </div>
  </div>
</div>

<!-- TopNavSearch -->
<div class="topnav-search">
  <button class="topnav-search__btn" aria-label="Open search" aria-expanded="false" type="button">
    <!-- search svg -->
  </button>
  <div class="topnav-search__bar" aria-hidden="true">
    <!-- SearchInput — search icon aria-label="Collapse search" -->
  </div>
</div>
```

**Screen reader announcements:**

| State | Reads as |
|---|---|
| Bar focused | "Search, search box" |
| Filter button idle | "Open filters, button" |
| Filter button active | "Open filters (filters active), button" |
| Clear button | "Clear search, button" |
| Collapsed button | "Open search, button, collapsed" |
| Expanded | "Open search, button, expanded" |

**Contrast:**

| Pair | Ratio | Pass |
|---|---|---|
| Placeholder `#606060` on `#ffffff` | 5.74:1 | AA |
| Input value `#202020` on `#ffffff` | 16.1:1 | AAA |
| Icon `#6b6b6b` on `#ffffff` | 4.61:1 | AA (graphic) |
| Error `#b03a3a` on `#ffffff` | ~5.5:1 | AA |
| TopNav icon on `#1b2a4a` | TBD | Engineering to verify |

---

### Gaps — needs resolution before shipping

| Gap | Priority | What to do |
|---|---|---|
| Open state dropdown | HIGH | Design not done. This spec ships Collapsed + Expanded only. |
| Collapsed button border token | HIGH | `rgba(251,251,251,0.14)` has no semantic token. Add dark-mode stroke token in Figma or approve raw value as debt. |
| Disabled state tokens | HIGH | Using primitives as fallback. Replace when semantic tokens exist. |
| Mobile expanded bar layout | MEDIUM | Overlapping nav content on narrow viewports — product decision needed. |
| Dark-surface icon tokens | MEDIUM | `rgba(251,251,251,0.9)` and `rgba(255,255,255,0.45)` are raw — no dark-mode semantic tokens yet. |
| `type="search"` vs `type="text"` | LOW | `type="search"` shows native browser clear on some platforms. Engineering to decide. |

---

## Figma Links

All three live in the **Pathway Design System Master File MB 2.0.**

| What | URL |
|---|---|
| SearchInput — all states | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/Pathway-Design-System-Master-File-MB-2.0?node-id=40006978-23158 |
| Filter-selected state | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/Pathway-Design-System-Master-File-MB-2.0?node-id=40007351-13533 |
| TopNavSearch (collapsed / expanded / open) | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/Pathway-Design-System-Master-File-MB-2.0?node-id=40007095-4048 |

---

## Token Reference

Every CSS variable this component uses. Source: `src/tokens/tokens.css`.

```css
/* ── Resolved primitives ─────────────────────────────────── */
--primitive-color-cool-neutral-0:   #ffffff;   /* white */
--primitive-color-cool-neutral-10:  #fbfbfb;   /* near-white / disabled bg fallback */
--primitive-color-cool-neutral-20:  #f6f6f6;   /* icon pressed */
--primitive-color-cool-neutral-30:  #ededed;   /* disabled border fallback */
--primitive-color-cool-neutral-50:  #d2d2d2;   /* idle border */
--primitive-color-cool-neutral-60:  #c4c4c4;   /* hover border */
--primitive-color-cool-neutral-90:  #979797;   /* disabled icon */
--primitive-color-cool-neutral-120: #6b6b6b;   /* idle icon */
--primitive-color-cool-neutral-130: #606060;   /* placeholder text / hover icon */
--primitive-color-cool-neutral-190: #202020;   /* input value text */
--primitive-color-cool-neutral-220-2: rgba(17,17,17,0.02);  /* icon hover bg */
--primitive-color-brand-0:          #fafafa;
--primitive-color-brand-10:         #eef2fb;   /* filter pill active bg */
--primitive-color-brand-40:         #c0ceef;   /* cancel-filter divider */
--primitive-color-brand-50:         #a0b5e6;   /* focused/active/filter border */
--primitive-color-brand-400:        #345499;   /* badge dot fill */
--primitive-color-red-50:           #e29f9f;
--primitive-color-red-100:          #b03a3a;   /* error border + icon */

/* ── Semantic tokens — colour ────────────────────────────── */
--semantic-color-light-mode-fill-static-neutral-light:      var(--primitive-color-cool-neutral-0);    /* #ffffff — bar bg */
--semantic-color-light-mode-fill-action-tertiary-base:      var(--primitive-color-brand-10);          /* #eef2fb — filter pill active */
--semantic-color-light-mode-fill-action-secondaryinverse-hover:    var(--primitive-color-cool-neutral-220-2); /* rgba(17,17,17,0.02) — icon hover */
--semantic-color-light-mode-fill-action-secondaryinverse-pressed:  var(--primitive-color-cool-neutral-20);    /* #f6f6f6 — icon pressed */
--semantic-color-light-mode-fill-action-primary-base:       var(--primitive-color-brand-400);         /* #345499 — badge dot */
--semantic-color-light-mode-fill-action-primaryinverse-base: var(--primitive-color-brand-0);          /* rgba(160,181,230,0.08) — topnav collapsed btn bg */
--semantic-color-light-mode-stroke-action-secondary-inverse-base:  var(--primitive-color-cool-neutral-50);  /* #d2d2d2 — idle border */
--semantic-color-light-mode-stroke-action-secondary-inverse-hover: var(--primitive-color-cool-neutral-60);  /* #c4c4c4 — hover border */
--semantic-color-light-mode-stroke-action-primary-inverse-pressed: var(--primitive-color-brand-50);   /* #a0b5e6 — focused/filter-active border */
--semantic-color-light-mode-stroke-action-primary-inverse-base:    var(--primitive-color-brand-40);   /* #c0ceef — cancel-filter divider */
--semantic-color-light-mode-stroke-action-negative-base:    var(--primitive-color-red-100);           /* #b03a3a — error border */
--semantic-color-light-mode-text-static-secondary-subtle:   var(--primitive-color-cool-neutral-130);  /* #606060 — placeholder */
--semantic-color-light-mode-text-static-secondary-bold:     var(--primitive-color-cool-neutral-190);  /* #202020 — input value */
--semantic-color-light-mode-icon-action-secondary-inverse-base:  var(--primitive-color-cool-neutral-120); /* #6b6b6b — idle icon */
--semantic-color-light-mode-icon-action-secondary-inverse-hover: var(--primitive-color-cool-neutral-130); /* #606060 — hover icon */
--semantic-color-light-mode-icon-action-secondary-disabled:  var(--primitive-color-cool-neutral-90);  /* #979797 — disabled icon */
--semantic-color-light-mode-icon-action-negative-base:       var(--primitive-color-red-100);          /* #b03a3a — error icon */

/* ── Unit tokens (all unitless — multiply by 1px in CSS) ─── */
--primitive-unit-unit-0-point-75: 0.75;   /* 0.75px border */
--primitive-unit-unit-1:          1;      /* 1px border */
--primitive-unit-unit-4:          4;      /* 4px padding */
--primitive-unit-unit-8:          8;      /* 8px gap / padding */
--primitive-unit-unit-12:         12;     /* 12px radius */
--primitive-unit-unit-14:         14;     /* 14px font size */
--primitive-unit-unit-64:         64;     /* 64px pill radius */

/* ── Type tokens (also unitless) ────────────────────────── */
--primitive-type-line-height-14pt-single: 20;               /* 20px line-height */
--primitive-type-letter-spacing-wide:     0.3;              /* 0.3px letter-spacing */
```

---

## Icon Paths

Three SVG paths. All rendered at `viewBox="0 0 24 24"`. Inline SVG, `aria-hidden="true"`.

**Search (magnifying glass) — 16×16 in bar, 20×20 in collapsed button:**
```svg
<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
</svg>
```

**Clear / Cancel (filled circle-X) — 16×16:**
```svg
<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
</svg>
```

**Filter (funnel) — 16×16:**
```svg
<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
  <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/>
</svg>
```

---

## HTML Demo

The full working demo. Self-contained. Save as `search.html` and open in any browser.
Every state is visible. The interactive section at the bottom is live — type, tap filter, tap clear.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Search — Pathway Component Demo</title>
  <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500&display=swap" rel="stylesheet">
  <style>
    /* ── Token bridge: unitless → px ──────────────────────── */
    :root {
      --s-radius-full:       64px;
      --s-radius-medium:     12px;
      --s-bw-thin:           0.75px;
      --s-bw-base:           1px;
      --s-gap-xtight:        8px;
      --s-pad-xtight:        8px;
      --s-pad-xxtight:       4px;
      --s-font-size-input:   14px;
      --s-line-height-input: 20px;
      --s-letter-spacing:    0.3px;

      /* Colour tokens */
      --c-bar-bg:            #ffffff;
      --c-bar-border-idle:   #d2d2d2;
      --c-bar-border-hover:  #c4c4c4;
      --c-bar-border-active: #a0b5e6;
      --c-bar-border-error:  #b03a3a;
      --c-bar-bg-disabled:   #fbfbfb;
      --c-bar-border-disabled: #ededed;
      --c-filter-active-bg:  #eef2fb;
      --c-divider:           #c0ceef;
      --c-icon-base:         #6b6b6b;
      --c-icon-hover:        #606060;
      --c-icon-disabled:     #979797;
      --c-icon-error:        #b03a3a;
      --c-text-placeholder:  #606060;
      --c-text-value:        #202020;
      --c-icon-hover-bg:     rgba(17,17,17,0.02);
      --c-icon-pressed-bg:   #f6f6f6;
      --c-badge:             #345499;
      --c-page-bg:           #eef2fb;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--c-page-bg);
      font-family: 'Red Hat Text', sans-serif;
      padding: 40px;
      min-height: 100vh;
    }
    .page-title {
      font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--c-text-placeholder); margin-bottom: 32px;
    }
    .grid { display: flex; flex-direction: column; gap: 0; margin-bottom: 48px; }
    .grid-row { display: flex; gap: 40px; align-items: center; padding: 0 0 16px; }
    .grid-row:last-child { padding-bottom: 0; }
    .grid-label {
      font-size: 11px; font-weight: 500; letter-spacing: 0.06em;
      text-transform: uppercase; color: var(--c-text-placeholder); width: 72px; flex-shrink: 0;
    }
    .grid-cols { display: flex; gap: 40px; }
    .section-divider { border: none; border-top: 0.75px solid #c0ceef; margin: 32px 0; }
    .section-label {
      font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--c-text-placeholder); margin-bottom: 24px;
    }
    .demo-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
    .demo-note { font-size: 11px; color: var(--c-text-placeholder); letter-spacing: 0.02em; }

    /* ── Search component ──────────────────────────────────── */
    .search {
      height: 48px; min-height: 48px; min-width: 48px; width: 320px;
      display: flex; flex-direction: column; align-items: flex-start;
      justify-content: center; flex-shrink: 0;
    }
    .search__inner {
      display: flex; flex-direction: row; align-items: center;
      gap: var(--s-gap-xtight); padding-inline: var(--s-pad-xtight);
      min-height: 36px; width: 100%; border-radius: var(--s-radius-full);
      overflow: clip; border-style: solid; border-width: var(--s-bw-thin);
      border-color: var(--c-bar-border-idle); background: var(--c-bar-bg);
    }
    .search--hover .search__inner { border-width: var(--s-bw-base); border-color: var(--c-bar-border-hover); }
    .search--focused .search__inner { border-width: var(--s-bw-base); border-color: var(--c-bar-border-active); }
    .search--with-value .search__inner { border-width: var(--s-bw-base); border-color: var(--c-bar-border-active); }
    .search--disabled { opacity: 0.38; }
    .search--disabled .search__inner { border-width: var(--s-bw-base); border-color: var(--c-bar-border-disabled); background: var(--c-bar-bg-disabled); }
    .search--error .search__inner { border-width: var(--s-bw-base); border-color: var(--c-bar-border-error); }
    /* filter-active: blue border, funnel pill highlighted, input stays active */
    .search--filter-active .search__inner { border-width: var(--s-bw-base); border-color: var(--c-bar-border-active); }
    .search--filter-active .search__filter-btn .icon-pill { background: var(--c-filter-active-bg); }

    .search__lead { display: flex; align-items: center; flex-shrink: 0; }
    .search__icon-btn {
      width: 24px; height: 24px; border-radius: var(--s-radius-medium);
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; cursor: pointer; padding: 0; flex-shrink: 0;
    }
    .icon-pill {
      width: 100%; height: 100%; display: flex; align-items: center;
      justify-content: center; padding: var(--s-pad-xxtight); border-radius: var(--s-radius-full);
    }
    .search__icon-btn:hover .icon-pill { background: var(--c-icon-hover-bg); }
    .search__icon-btn:active .icon-pill { background: var(--c-icon-pressed-bg); }
    .search__icon-btn svg { width: 16px; height: 16px; fill: var(--c-icon-base); flex-shrink: 0; display: block; }
    .search--hover .search__icon-btn svg { fill: var(--c-icon-hover); }
    .search--disabled .search__icon-btn svg { fill: var(--c-icon-disabled); }
    .search--error .search__icon-btn svg { fill: var(--c-icon-error); }

    .search__label { flex: 1; min-width: 0; display: flex; align-items: center; }
    .search__input {
      flex: 1; min-width: 0; border: none; outline: none; background: transparent;
      font-family: 'Red Hat Text', sans-serif; font-size: var(--s-font-size-input);
      font-weight: 400; line-height: var(--s-line-height-input); letter-spacing: var(--s-letter-spacing);
      color: var(--c-text-value);
    }
    .search__input::placeholder { color: var(--c-text-placeholder); }
    .search__text {
      font-family: 'Red Hat Text', sans-serif; font-size: var(--s-font-size-input);
      font-weight: 400; line-height: var(--s-line-height-input); letter-spacing: var(--s-letter-spacing);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .search__text--placeholder { color: var(--c-text-placeholder); }
    .search__text--value { color: var(--c-text-value); }

    .search__cancel {
      width: 24px; height: 24px; border-radius: var(--s-radius-medium); display: flex;
      align-items: center; justify-content: center; border: none; background: transparent;
      cursor: pointer; padding: 0; flex-shrink: 0;
    }
    .search__cancel:hover .icon-pill { background: var(--c-icon-hover-bg); }
    .search__cancel:active .icon-pill { background: var(--c-icon-pressed-bg); }
    .search__cancel svg { width: 16px; height: 16px; fill: var(--c-icon-base); flex-shrink: 0; display: block; }

    .search__filter-wrap {
      display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0;
      border-left: var(--s-bw-thin) solid var(--c-divider); padding-left: var(--s-pad-xxtight);
    }
    .search__filter-btn {
      width: 24px; height: 24px; border-radius: var(--s-radius-medium); display: flex;
      align-items: center; justify-content: center; border: none; background: transparent;
      cursor: pointer; padding: 0; flex-shrink: 0;
    }
    .search__filter-btn:hover .icon-pill { background: var(--c-icon-hover-bg); }
    .search__filter-btn:active .icon-pill { background: var(--c-icon-pressed-bg); }
    .search__filter-btn svg { width: 16px; height: 16px; fill: var(--c-icon-base); flex-shrink: 0; display: block; }

    .search__badge-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
    .search__badge {
      position: absolute; top: 1px; right: 1px; width: 6px; height: 6px;
      border-radius: 50%; background: var(--c-badge);
      border: 1.5px solid var(--c-bar-bg); display: none;
    }
    .search--filter-active .search__badge { display: block; }

    /* ── TopNavSearch ──────────────────────────────────────── */
    .topnav-bar {
      background: #1b2a4a; border-radius: 16px; padding: 16px 20px;
      display: flex; align-items: center; gap: 12px; margin-bottom: 48px; overflow: hidden;
    }
    .topnav-wordmark { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); letter-spacing: 0.04em; flex-shrink: 0; }
    .topnav-spacer { flex: 1; }
    .topnav-search-wrap { display: flex; align-items: center; overflow: hidden; }
    .topnav-collapsed-btn {
      width: 48px; height: 48px; border-radius: 12px; border: 1.5px solid rgba(251,251,251,0.14);
      background: rgba(160,181,230,0.08); cursor: pointer; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.15s;
    }
    .topnav-expanded-bar {
      width: 0; opacity: 0; overflow: hidden;
      transition: width 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      display: flex; align-items: center;
    }
    .topnav-expanded-bar .search { width: 320px; flex-shrink: 0; }
    .topnav-expanded-bar .search__inner { background: rgba(255,255,255,0.06); border-color: rgba(251,251,251,0.14); border-width: 1.5px; }
    .topnav-expanded-bar .search__icon-btn svg,
    .topnav-expanded-bar .search__cancel svg { fill: rgba(251,251,251,0.9); }
    .topnav-expanded-bar .search__input { color: rgba(255,255,255,0.9); }
    .topnav-expanded-bar .search__input::placeholder { color: rgba(255,255,255,0.45); }
    .topnav-nav-icons { display: flex; gap: 8px; flex-shrink: 0; }
    .topnav-icon-btn {
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;
    }
    @media (prefers-reduced-motion: reduce) {
      .topnav-expanded-bar { transition: opacity 0.15s ease; }
    }
  </style>
</head>
<body>

  <p class="page-title">Search — Pathway Component States</p>

  <div style="display:flex; gap:40px; margin-bottom:8px; padding-left:112px;">
    <div style="width:320px; font-size:11px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:#606060;">No Filter</div>
    <div style="width:320px; font-size:11px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:#606060;">Has Filter</div>
  </div>

  <div class="grid">

    <!-- Idle -->
    <div class="grid-row">
      <span class="grid-label">Idle</span>
      <div class="grid-cols">
        <div class="search"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
        </div></div>
        <div class="search"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
          <div class="search__filter-wrap"><button class="search__filter-btn" aria-label="Open filters"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button></div>
        </div></div>
      </div>
    </div>

    <!-- Hover -->
    <div class="grid-row">
      <span class="grid-label">Hover</span>
      <div class="grid-cols">
        <div class="search search--hover"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
        </div></div>
        <div class="search search--hover"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
          <div class="search__filter-wrap"><button class="search__filter-btn" aria-label="Open filters"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button></div>
        </div></div>
      </div>
    </div>

    <!-- Focused -->
    <div class="grid-row">
      <span class="grid-label">Focused</span>
      <div class="grid-cols">
        <div class="search search--focused"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
        </div></div>
        <div class="search search--focused"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
          <div class="search__filter-wrap"><button class="search__filter-btn" aria-label="Open filters"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button></div>
        </div></div>
      </div>
    </div>

    <!-- With value -->
    <div class="grid-row">
      <span class="grid-label">With value</span>
      <div class="grid-cols">
        <div class="search search--with-value"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--value">Input</span></div>
          <button class="search__cancel" aria-label="Clear search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></span></button>
        </div></div>
        <div class="search search--with-value"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--value">Input</span></div>
          <button class="search__cancel" aria-label="Clear search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></span></button>
          <div class="search__filter-wrap"><button class="search__filter-btn" aria-label="Open filters"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button></div>
        </div></div>
      </div>
    </div>

    <!-- Filter active -->
    <div class="grid-row">
      <span class="grid-label">Filter active</span>
      <div class="grid-cols">
        <div style="width:320px; font-size:11px; color:#606060; align-self:center;">N/A — filter only applies when showFilter=true</div>
        <div class="search search--filter-active"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
          <div class="search__filter-wrap"><div class="search__badge-wrap"><button class="search__filter-btn" aria-label="Open filters (filters active)"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button><span class="search__badge" aria-hidden="true"></span></div></div>
        </div></div>
      </div>
    </div>

    <!-- Disabled -->
    <div class="grid-row">
      <span class="grid-label">Disabled</span>
      <div class="grid-cols">
        <div class="search search--disabled"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search" disabled><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
        </div></div>
        <div class="search search--disabled"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search" disabled><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
          <div class="search__filter-wrap"><button class="search__filter-btn" aria-label="Open filters" disabled><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button></div>
        </div></div>
      </div>
    </div>

    <!-- Error -->
    <div class="grid-row">
      <span class="grid-label">Error</span>
      <div class="grid-cols">
        <div class="search search--error"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
        </div></div>
        <div class="search search--error"><div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><span class="search__text search__text--placeholder">Search...</span></div>
          <div class="search__filter-wrap"><button class="search__filter-btn" aria-label="Open filters"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button></div>
        </div></div>
      </div>
    </div>

  </div>

  <hr class="section-divider">
  <p class="section-label">Interactive — try it</p>
  <div style="margin-bottom:48px;">
    <div class="demo-row">
      <div class="search" id="bar-a">
        <div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><input class="search__input" id="input-a" type="text" placeholder="Search..." autocomplete="off"></div>
          <button class="search__cancel" id="cancel-a" aria-label="Clear search" style="display:none"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></span></button>
        </div>
      </div>
      <span class="demo-note">No filter</span>
    </div>
    <div class="demo-row">
      <div class="search" id="bar-b">
        <div class="search__inner">
          <div class="search__lead"><button class="search__icon-btn" aria-label="Search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
          <div class="search__label"><input class="search__input" id="input-b" type="text" placeholder="Search..." autocomplete="off"></div>
          <button class="search__cancel" id="cancel-b" aria-label="Clear search" style="display:none"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></span></button>
          <div class="search__filter-wrap"><div class="search__badge-wrap"><button class="search__filter-btn" id="filter-b" aria-label="Open filters"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg></span></button><span class="search__badge" id="badge-b" aria-hidden="true"></span></div></div>
        </div>
      </div>
      <span class="demo-note" id="note-b">Has filter — tap funnel to toggle filter-active</span>
    </div>
  </div>

  <hr class="section-divider">
  <p class="section-label">TopNav Search — interactive</p>
  <div class="topnav-bar">
    <div class="topnav-wordmark">Ministry Brands</div>
    <div class="topnav-spacer"></div>
    <div class="topnav-search-wrap">
      <button id="topnav-btn" class="topnav-collapsed-btn" aria-label="Open search" aria-expanded="false">
        <span style="width:36px;height:36px;border-radius:64px;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" style="fill:rgba(251,251,251,0.9)" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </span>
      </button>
      <div id="topnav-bar" class="topnav-expanded-bar">
        <div class="search">
          <div class="search__inner" style="background:rgba(255,255,255,0.06);border-color:rgba(251,251,251,0.14);border-width:1.5px;">
            <div class="search__lead"><button id="topnav-collapse" class="search__icon-btn" aria-label="Collapse search"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true" style="fill:rgba(251,251,251,0.9)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span></button></div>
            <div class="search__label"><input id="topnav-input" class="search__input" type="text" placeholder="Search..." autocomplete="off" style="color:rgba(255,255,255,0.9)"></div>
            <button id="topnav-cancel" class="search__cancel" aria-label="Clear search" style="display:none"><span class="icon-pill"><svg viewBox="0 0 24 24" aria-hidden="true" style="fill:rgba(255,255,255,0.7)"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></span></button>
          </div>
        </div>
      </div>
    </div>
    <div class="topnav-nav-icons">
      <button class="topnav-icon-btn" aria-label="Notifications"><svg width="18" height="18" viewBox="0 0 24 24" style="fill:rgba(255,255,255,0.5)" aria-hidden="true"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></button>
      <button class="topnav-icon-btn" aria-label="Account"><svg width="18" height="18" viewBox="0 0 24 24" style="fill:rgba(255,255,255,0.5)" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></button>
    </div>
  </div>

  <script>
    // Bar A — no filter
    (function(){
      const bar=document.getElementById('bar-a'),input=document.getElementById('input-a'),cancel=document.getElementById('cancel-a');
      function upd(){cancel.style.display=input.value.length>0?'':'none';}
      input.addEventListener('focus',()=>{bar.classList.remove('search--with-value');bar.classList.add('search--focused');});
      input.addEventListener('blur',()=>{bar.classList.remove('search--focused');if(input.value.length>0)bar.classList.add('search--with-value');});
      input.addEventListener('input',upd);
      cancel.addEventListener('click',e=>{e.stopPropagation();input.value='';cancel.style.display='none';bar.classList.remove('search--with-value');input.focus();});
    })();

    // Bar B — has filter
    (function(){
      const bar=document.getElementById('bar-b'),input=document.getElementById('input-b'),cancel=document.getElementById('cancel-b'),filterBtn=document.getElementById('filter-b'),badge=document.getElementById('badge-b'),note=document.getElementById('note-b');
      let fa=false;
      function upd(){cancel.style.display=input.value.length>0?'':'none';}
      input.addEventListener('focus',()=>{if(!fa){bar.classList.remove('search--with-value');bar.classList.add('search--focused');}});
      input.addEventListener('blur',()=>{bar.classList.remove('search--focused');if(input.value.length>0&&!fa)bar.classList.add('search--with-value');});
      input.addEventListener('input',upd);
      cancel.addEventListener('click',e=>{e.stopPropagation();input.value='';upd();if(!fa)input.focus();});
      filterBtn.addEventListener('click',e=>{e.stopPropagation();fa=!fa;if(fa){bar.classList.add('search--filter-active');bar.classList.remove('search--focused','search--with-value','search--hover');badge.style.display='block';note.textContent='Filter active — blue border, funnel highlighted, input still active. Tap funnel to clear.';}else{bar.classList.remove('search--filter-active');badge.style.display='none';note.textContent='Has filter — tap funnel to toggle filter-active';upd();input.focus();}});
      upd();
    })();

    // TopNavSearch
    (function(){
      const btn=document.getElementById('topnav-btn'),bar=document.getElementById('topnav-bar'),collapse=document.getElementById('topnav-collapse'),input=document.getElementById('topnav-input'),cancel=document.getElementById('topnav-cancel');
      let expanded=false;
      btn.addEventListener('click',()=>{expanded=true;btn.style.display='none';bar.style.width='336px';bar.style.opacity='1';btn.setAttribute('aria-expanded','true');setTimeout(()=>input.focus(),120);});
      collapse.addEventListener('click',e=>{e.stopPropagation();expanded=false;bar.style.width='0';bar.style.opacity='0';setTimeout(()=>{btn.style.display='flex';},200);btn.setAttribute('aria-expanded','false');});
      input.addEventListener('input',()=>{cancel.style.display=input.value.length>0?'':'none';});
      cancel.addEventListener('click',e=>{e.stopPropagation();input.value='';cancel.style.display='none';input.focus();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded){collapse.click();}});
    })();
  </script>
</body>
</html>
```
