# Component Studio — Skill Reference Index

This file exists so the component studio skill can orient itself without crawling the repo. Read this first, then fetch the specific files you need for the phase you are in.

---

## Authoritative sources — what to read and when

| Domain | File in this repo | Fetch when |
|---|---|---|
| Overarching system rules (motion, a11y, token governance) | `docs/design-system-spec.md` | Step 3 (spec writing), Step 4 (Figma build), any time a motion or a11y question arises |
| Component spec template (all 17 sections) | `docs/component-spec-template.md` | Step 3 |
| Figma layer and frame conventions | `docs/figma-build-conventions.md` | Step 4 |
| Component pipeline (Figma → repo → Storybook) | `docs/component-pipeline.md` | Handoff and audit phases |
| Figma prep checklist | `docs/figma-prep-checklist.md` | Step 4 pre-flight |
| Token definitions (DTCG JSON) | `tokens/pathway-design-tokens.json` | Step 3 (token table), any token lookup |
| CSS token variables (generated) | `src/tokens/tokens.css` | Demo build — load via `<link>` in every HTML demo |
| Token agent brief | `tokens/agent-brief.md` | Any session involving token questions |

GitHub raw base: `https://raw.githubusercontent.com/helloimjolopez-collab/pathway-ds/main/`

---

## Demo build guide

Pathway component demos are standalone HTML files. No npm, no build step. React and Radix UI load from the `esm.sh` CDN. Pathway design tokens load from the repo's CSS file via a relative `<link>`.

### File location convention

- Draft iterations: `components-sandbox/<name>/<name>-demo-v1.html`, `v2.html`, `v3.html`, ...
- Final (post-Figma rebuild): `components-sandbox/<name>/<name>-demo-final.html`

---

### HTML file template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[ComponentName] — Pathway Demo</title>

  <!-- Pathway design tokens -->
  <link rel="stylesheet" href="../../src/tokens/tokens.css">

  <!-- Material Symbols (Pathway icon library) -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--semantic-typography-font-family-base, system-ui, sans-serif);
      background: var(--semantic-color-surface-page, #ffffff);
      color: var(--semantic-color-text-primary, #111111);
      padding: 2rem;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="module">
    import { createElement as h, useState, useRef, useEffect } from 'https://esm.sh/react@18';
    import { createRoot } from 'https://esm.sh/react-dom@18/client';

    // Import the Radix primitive needed for this component
    import * as Dialog from 'https://esm.sh/@radix-ui/react-dialog@1';

    const styles = `
      .my-component {
        background: var(--semantic-color-surface-default);
        border-radius: var(--semantic-radius-md);
        padding: var(--semantic-spacing-4);
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    function MyComponent() {
      return h(Dialog.Root, null,
        // component tree — use Pathway CSS variables for all styling
      );
    }

    createRoot(document.getElementById('root')).render(h(MyComponent));
  </script>
</body>
</html>
```

---

### Radix UI — ESM imports for all common primitives

```js
import * as Dialog         from 'https://esm.sh/@radix-ui/react-dialog@1';
// Root, Trigger, Portal, Overlay, Content, Title, Description, Close

import * as DropdownMenu   from 'https://esm.sh/@radix-ui/react-dropdown-menu@2';
// Root, Trigger, Portal, Content, Item, Separator, Label, Group, Sub, SubTrigger, SubContent

import * as Select         from 'https://esm.sh/@radix-ui/react-select@2';
// Root, Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText, Separator, Label, Group, ScrollUpButton, ScrollDownButton

import * as Popover        from 'https://esm.sh/@radix-ui/react-popover@1';
// Root, Trigger, Portal, Content, Arrow, Close

import * as Tooltip        from 'https://esm.sh/@radix-ui/react-tooltip@1';
// Provider, Root, Trigger, Portal, Content, Arrow

import * as Accordion      from 'https://esm.sh/@radix-ui/react-accordion@1';
// Root (type="single"|"multiple"), Item, Trigger, Header, Content

import * as Tabs           from 'https://esm.sh/@radix-ui/react-tabs@1';
// Root, List, Trigger, Content

import * as Toggle         from 'https://esm.sh/@radix-ui/react-toggle@1';
// Root

import * as ToggleGroup    from 'https://esm.sh/@radix-ui/react-toggle-group@1';
// Root, Item

import * as NavigationMenu from 'https://esm.sh/@radix-ui/react-navigation-menu@1';
// Root, List, Item, Trigger, Content, Link, Indicator, Viewport

import * as Checkbox       from 'https://esm.sh/@radix-ui/react-checkbox@1';
// Root, Indicator

import * as RadioGroup     from 'https://esm.sh/@radix-ui/react-radio-group@1';
// Root, Item, Indicator

import * as Slider         from 'https://esm.sh/@radix-ui/react-slider@1';
// Root, Track, Range, Thumb

import * as Switch         from 'https://esm.sh/@radix-ui/react-switch@1';
// Root, Thumb

import * as ContextMenu    from 'https://esm.sh/@radix-ui/react-context-menu@2';
// Root, Trigger, Portal, Content, Item, Separator, Label, Sub, SubTrigger, SubContent
```

---

### Styling rules

Use only Pathway CSS variables. Never hardcode a value that exists as a token.

```css
/* Correct */
.dialog-content {
  background: var(--semantic-color-surface-elevated);
  border-radius: var(--semantic-radius-lg);
  padding: var(--semantic-spacing-6);
  box-shadow: var(--semantic-shadow-dialog);
}

/* Wrong — never hardcode */
.dialog-content {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}
```

Do not use Tailwind classes — they do not work in this environment.

---

### Motion — Radix data-state animations

Radix primitives expose `data-state` attributes (`open`/`closed`, `checked`/`unchecked`, `active`/`inactive`) for animation. Motion tokens are live in `src/tokens/tokens.css` — use them directly. For the full motion scale and rules see `docs/design-system-spec.md` §2.

```css
/* Overlay fade (Dialog, Drawer) */
.overlay[data-state="open"]  { animation: fade-in  var(--motion-duration-instant) var(--motion-easing-standard); }
.overlay[data-state="closed"] { animation: fade-out var(--motion-duration-instant) var(--motion-easing-standard); }

/* Panel/content scale (Dialog, Popover) */
.content[data-state="open"]  { animation: scale-in  var(--motion-duration-short) var(--motion-easing-spring); }
.content[data-state="closed"] { animation: scale-out var(--motion-duration-instant) var(--motion-easing-accelerate); }

/* Dropdown/select panel */
.dropdown[data-state="open"]  { animation: slide-in  var(--motion-duration-short) var(--motion-easing-spring); }
.dropdown[data-state="closed"] { animation: slide-out var(--motion-duration-instant) var(--motion-easing-accelerate); }

/* Accordion */
.accordion-content[data-state="open"]  { animation: accordion-open  var(--motion-duration-short) var(--motion-easing-accordion); }
.accordion-content[data-state="closed"] { animation: accordion-close var(--motion-duration-short) var(--motion-easing-accordion); }

@keyframes fade-in       { from { opacity: 0; }                        to { opacity: 1; } }
@keyframes fade-out      { from { opacity: 1; }                        to { opacity: 0; } }
@keyframes scale-in      { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes scale-out     { from { opacity: 1; transform: scale(1); }    to { opacity: 0; transform: scale(0.96); } }
@keyframes slide-in      { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-out     { from { opacity: 1; transform: translateY(0); }    to { opacity: 0; transform: translateY(-4px); } }
@keyframes accordion-open  { from { height: 0; }                              to { height: var(--radix-accordion-content-height); } }
@keyframes accordion-close { from { height: var(--radix-accordion-content-height); } to { height: 0; } }

/* Chevron rotation — standard easing, never spring */
.chevron[data-state="open"] { transform: rotate(180deg); transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1); }

/* Reduced motion — mandatory on every animated component */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

For the full motion scale (all durations, all easings, component overrides, bounce policy), see `docs/design-system-spec.md` §2.

---

### Material Symbols

Icons use Material Symbols loaded from Google Fonts. The icon renders as a text ligature.

```html
<span class="material-symbols-outlined">settings</span>
<span class="material-symbols-outlined">arrow_drop_down</span>
<span class="material-symbols-outlined">close</span>
```

```css
.material-symbols-outlined {
  font-size: 20px;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
  color: var(--semantic-color-icon-default);
  line-height: 1;
  user-select: none;
}

/* Filled variant */
.material-symbols-outlined.filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
}
```

Never use custom SVGs for standard UI icons. Never guess an icon name — read it from Figma's `get_design_context` output and use the exact string.

---

### If the token CSS file does not resolve

If `../../src/tokens/tokens.css` does not resolve (path depends on where the demo file sits relative to repo root), inline the critical tokens in the `<style>` block. Extract them from `tokens/pathway-design-tokens.json`. This is a fallback only — the linked file is the source of truth.
