# Button — Agent Brief

A condensed, paste-friendly summary of the Pathway Button for AI agents building anything that needs a clickable action trigger.

Read this **first**. Full spec: [button-spec.md](./button-spec.md). Working code: [button.html](./button.html). Module: [button.jsx](./button.jsx).

---

## What this is

The Pathway Button is the **only correct element for triggering actions** — saving, submitting, deleting, loading, confirming. It is not a navigation element. If pressing it routes the user to a new URL, use an `<a>` or router `<Link>` styled with Button tokens instead.

---

## The 8 rules an agent must not skip

1. **Use the existing component.** Import from `components/button/button.jsx` or copy `button.html`. Do not write a custom button.

2. **Three styles, four types — they compose.** Style (`Fill` / `Outlined` / `Naked`) × Type (`Primary` / `Secondary` / `Tertiary` / `Negative`) × Size (`L` / `M` / `S`). Every combination is valid. Default is `Fill` + `Primary` + `M`.

3. **One Fill/Primary per action group.** `Fill` is the strongest visual signal. Use it once per primary action. Supporting actions get `Outlined`. Tertiary or inline actions get `Naked`.

4. **Negative type for destructive actions only.** Delete, revoke, sign out, permanent removes. Never use it for cancellation or secondary de-emphasis.

5. **Touch target is always 48 × 48 px minimum.** The outer `<button>` carries 6 px transparent padding on all sides. The visible surface (`pw-button__container`) is smaller. Do not remove the padding.

6. **Loading state is semantic, not just visual.** `loading={true}` sets `aria-busy="true"` + `disabled`, replaces all content with a spinner, and prevents double-submission. Never fake it with a disabled state alone.

7. **Icon-only buttons require `ariaLabel`.** When `showText={false}`, the `ariaLabel` prop becomes the accessible name. Without it the button fails WCAG 4.1.2.

8. **All icons are Material Symbols Rounded.** CSS class `material-symbols-rounded`. Never Outlined, Sharp, or custom SVG for any icon that exists in that library.

---

## Props (React — `button.jsx`)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `style` | `"Fill"` \| `"Outlined"` \| `"Naked"` | `"Fill"` | Visual weight |
| `type` | `"Primary"` \| `"Secondary"` \| `"Tertiary"` \| `"Negative"` | `"Primary"` | Semantic intent |
| `size` | `"L"` \| `"M"` \| `"S"` | `"M"` | — |
| `text` | string | `"Button"` | Label text |
| `showText` | boolean | `true` | Set false for icon-only |
| `leadingIcon` | string | `""` | Material Symbols ligature name |
| `trailingIcon` | string | `""` | Material Symbols ligature name |
| `loading` | boolean | `false` | Replaces content with spinner, sets aria-busy |
| `disabled` | boolean | `false` | — |
| `ariaLabel` | string | `""` | Required when `showText={false}` |
| `onClick` | function | — | — |

---

## Exact tokens

All values via CSS custom properties from `src/tokens/tokens.css`.

### Radius & border
```
--semantic-layout-units-contextual-button-radius-radius       → 8px
--semantic-layout-units-contextual-button-border-width-base-base → 0.75px
```

### Padding
```
--semantic-layout-units-contextual-button-padding-large-horizontal  → 14px
--semantic-layout-units-contextual-button-padding-large-vertical    → 12px
--semantic-layout-units-contextual-button-padding-medium-horizontal → 12px
--semantic-layout-units-contextual-button-padding-medium-vertical   → 8px
--semantic-layout-units-contextual-button-padding-small-horizontal  → 10px
--semantic-layout-units-contextual-button-padding-small-vertical    → 6px
```

### Typography
```
--semantic-type-desktop-label-button-l-fontsize     → 18px
--semantic-type-desktop-label-button-base-fontsize  → 16px
--semantic-type-desktop-label-button-s-fontsize     → 14px
```

### Focus ring
```
box-shadow: 0 0 0 6px #ffffff,
            0 0 0 8px var(--semantic-color-light-mode-stroke-contextual-focusring-base)
```

---

## Two-layer anatomy

```
<button type="button">                   ← touch target (min 48×48px, transparent)
  <span class="pw-button__container">   ← visible surface (bg, border, radius, focus ring)
    <span class="material-symbols-rounded pw-button__icon--leading">
    <span class="pw-button__label">
    <span class="material-symbols-rounded pw-button__icon--trailing">
  </span>
</button>
```

The outer `<button>` has `padding: 6px` to guarantee the touch target floor. The inner `pw-button__container` holds all visible styling.

---

## Quick usage (HTML demo / standalone)

```html
<!-- Minimal: primary fill, medium, no icons -->
<button type="button" class="pw-btn" data-style="Fill" data-type="Primary" data-size="M">
  Save changes
</button>

<!-- Destructive with leading icon -->
<button type="button" class="pw-btn" data-style="Fill" data-type="Negative" data-size="M">
  <span class="material-symbols-rounded">delete</span>
  Delete record
</button>
```

For the full interactive React version, copy `button.html` directly — it is self-contained and runs as-is in any browser.

---

## Links

| Artefact | URL |
|---|---|
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003293-93741 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-button--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/button/button.html |
| Full spec | components/button/button-spec.md |
