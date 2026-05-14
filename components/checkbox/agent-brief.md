# Checkbox — Agent Brief

A condensed, paste-friendly summary of the Pathway Checkbox for AI agents (Claude, Figma Make, v0, Cursor, etc.).

Read this **first**. The full spec is at [checkbox-spec.md](./checkbox-spec.md). Status: `PENDING HUMAN REVIEW` — the spec is provisional but the component is implemented and ready to consume.

---

## What this is

`Checkbox` is a **multi-select selection control**. Use it when the user can pick zero or more independent options from a set.

**Do NOT use it for:**
- **Single-select** between mutually exclusive options → use Radio
- **Binary on/off mode** outside a form (e.g. dark mode toggle, notifications enabled) → use Toggle
- **A boolean inside a form submission** → Checkbox is correct here

Working code: [checkbox.html](./checkbox.html). Module: [checkbox.jsx](./checkbox.jsx). Full spec: [checkbox-spec.md](./checkbox-spec.md).

---

## The 5 rules an AI agent must not skip

1. **Three checked states exist:** `unchecked`, `checked`, and `indeterminate` (the parent-of-a-mixed-selection state). Don't omit indeterminate — it appears in any tree/list checkbox.

2. **All four interaction states must be implemented:** base, hover, focus, disabled. Plus the three checked states above = 12 combinations. The spec has the full matrix.

3. **Touch target is 24×24 visually but 44×44 minimum hit area.** Wrap the visible 24×24 box in a 44×44 label or padded container. WCAG 2.5.5.

4. **The label is part of the click target.** Clicking the text toggles the box. Don't make the label a separate non-interactive sibling.

5. **Use semantic tokens for the fill, stroke, and check icon.** The check icon is `Icon/Static/Brand/Inverse` (white on brand-blue fill when checked). Never hardcode.

---

## Tokens (semantic — read the spec for the full list)

```
/* Box fill */
--fill-action-primary-base       /* checked fill */
--fill-static-surface-white      /* unchecked fill */

/* Box stroke */
--stroke-static-neutral-default  /* unchecked stroke */
--stroke-action-primary-base     /* checked + indeterminate stroke */

/* Check icon */
--icon-static-brand-inverse      /* the check itself (white on blue) */

/* Text label */
--text-static-primary-base       /* enabled label */
--text-static-primary-disabled   /* disabled label */
```

### Geometry
```
Visible size:       24×24
Touch target:       44×44 minimum (around the visible 24×24)
Border radius:      4px  (Border/Radius/XS)
Stroke width:       1.5px
Gap label↔box:      8px
```

---

## Minimal usage

```jsx
import { Checkbox } from "components/checkbox/checkbox.jsx";

<Checkbox
  checked={value}
  onChange={setValue}
  label="I agree to the terms"
/>

// Indeterminate (parent of partial selection):
<Checkbox checked="indeterminate" onChange={handleSelectAll} label="Select all" />
```

---

## Accessibility

- Use a native `<input type="checkbox">` underlying the visual — never recreate the input semantic with `<div role="checkbox">`
- `aria-checked` is `true | false | "mixed"` (mixed = indeterminate)
- The label must be programmatically associated (wrap with `<label>` or use `aria-labelledby`)
- Focus ring required and must be visible — never `outline: none` without a replacement

---

## For Figma Make

Paste [`checkbox.html`](./checkbox.html) into the Figma Make prompt — already clean, no docs panel.

---

## Figma source

- **File:** Pathway Design System Master File MB 2.0 (`fileKey: 3sw45aVcngFAmpbP6cfrXP`)
- **Component:** [Checkbox in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002324-54532)
