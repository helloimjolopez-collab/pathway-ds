# Spinner — Agent Brief

A condensed, paste-friendly summary of the Pathway Spinner for AI agents (Claude, Figma Make, v0, Cursor, etc.).

Read this **first**. The full spec is at [spinner-spec.md](./spinner-spec.md).

---

## What this is

`Spinner` is an **indeterminate progress indicator**. It signals that something is happening, but says nothing about how long it will take or how close it is to finishing.

**Use it when:** the wait is short (< ~10 s), duration is unknown, and you cannot show a meaningful percentage.

**Do NOT use it when:**
- Duration is known or measurable → use a determinate progress bar
- Wait exceeds ~10 s → use a skeleton or status message
- No wait is happening → don't show a spinner just for decoration

The component is a **rotating sunburst built from SVG paths**. Single structural form, with a `style` property that today has one value (`progress-activity`). Future styles (`bar`, `dots`) may be added without breaking the API.

Working code: [spinner.html](./spinner.html). Full spec: [spinner-spec.md](./spinner-spec.md).

---

## The 6 rules an AI agent must not skip

1. **Use the documented semantic icon tokens.** The spinner's colour comes from `Icon/Static/*` or `Icon/Action/*` semantic tokens. Never raw hex, never a primitive. Allowed tones are listed in §7.1 of the spec.

2. **The geometry is fixed.** Don't reinvent the sunburst — it's an 8-spoke rotating SVG with specific path data. Copy from [spinner.html](./spinner.html).

3. **Animation: smooth continuous rotation, no easing.** `animation: rotate var(--motion-duration-loop) var(--motion-easing-linear) infinite` is the canonical value. Don't ease in/out — it must feel mechanical and constant or it looks like it's stopping.

4. **Respect `prefers-reduced-motion: reduce`.** Replace the rotation with a static dot pulse or simply a static icon. Never strip the wait signal entirely.

5. **The spinner is a primitive — it doesn't own the wait state.** The consuming component is responsible for the surrounding label ("Loading..."), the network request, and the announce-to-screen-reader logic. The spinner just spins.

6. **Sizes come from `Accessibility/Icon Wrapping/*` tokens.** Don't pick arbitrary px values.

---

## Tokens

```
/* Colour — pick one tone per usage */
icon-static-brand           /* primary brand spinner */
icon-static-neutral-base    /* neutral grey spinner */
icon-static-neutral-subtle  /* extra-subtle */
icon-action-primary-base    /* on action buttons */
icon-action-secondary-base  /* secondary action spinner */
/* Plus accent tokens for status (success, danger, warning, info) — see §7.1 */
```

### Sizes
```
Accessibility/Icon Wrapping/Small:    16px
Accessibility/Icon Wrapping/Medium:   20px
Accessibility/Icon Wrapping/Large:    24px
/* Larger sizes (32px, 48px) are also tokenized — see spec */
```

### Motion
```
animation:  rotate var(--motion-duration-loop) var(--motion-easing-linear) infinite
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
```

---

## Minimal usage

```jsx
import { Spinner } from "components/spinner/spinner.html"; // or wherever exported

<Spinner size={24} tone="brand" />
```

Or inline the SVG from [spinner.html](./spinner.html) — same result.

---

## Accessibility

- `role="status"` (or `aria-live="polite"`) wrapping the spinner + its label
- Include a visually-hidden `<span>` with text (e.g. "Loading...") so screen readers announce the wait
- Don't put `role="status"` on the spinner SVG itself — put it on the container that has the label

---

## For Figma Make

Paste [`spinner.html`](./spinner.html) into the Figma Make prompt — already clean, no docs panel.

---

## Figma source

- **File:** Pathway Design System Master File MB 2.0 (`fileKey: 3sw45aVcngFAmpbP6cfrXP`)
- **Component:** see `spinner-spec.md` §1 for the Figma node URL
