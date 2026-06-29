# Checkbox: Pathway Design System Component Spec

**Status:** `PENDING HUMAN REVIEW`

Complete implementation reference for the Checkbox component. Covers anatomy, design tokens, states, variant system, accessibility, and known gaps.

## Links

| Artefact | URL |
|---|---|
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002324-54532 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-checkbox--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/checkbox/checkbox.html |
| GitHub source | https://github.com/helloimjolopez-collab/pathway-ds/tree/main/components/checkbox |

---

## 1. Component Overview

`Checkbox` is a selection-control component used for **multi-select scenarios** — when the user can pick zero or more independent options from a set. It is NOT used for single-select (use Radio), nor for binary on/off mode switches (use Toggle unless the setting is part of a form submission, in which case Checkbox is correct).

### Figma source
- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **Checkbox component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002324-54532)

### When to use
- Multi-select: user can enable zero or more options independently
- "Select all" patterns with an indeterminate parent
- Form fields submitted on Save/Submit (not immediate effect)
- "Agree to terms" before submission

### When NOT to use
- Single-select from a set → use **Radio**
- Binary on/off that takes immediate effect → use **Toggle**
- Card/tile selection → use **Choice Tile** (radio or checkbox semantics, different presentation)
- Do NOT use Checkbox for mutually exclusive options

---

## 1.1 Governance

| To change… | Owner | Where |
|---|---|---|
| Checkbox colours, border, radius, icon | Figma: Checkbox component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40002324-54532) |
| Semantic token values | Figma: Variables panel | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) |
| Interaction behaviour, keyboard, ARIA | This spec | §9 |
| When to use checkbox vs radio vs toggle | This spec | §1 (decision tree) |
| Highlight variant visual design | Figma: Checkbox component | Highlight rows in the component matrix |

---

## 2. Anatomy

```
Checkbox (root — 44×44px touch target)
├── state-layer (44×44px, rounded-full — holds hover/focus ring)
│   └── container (18×18px, 4px radius, 1.5px border)
│       └── icon (checkmark SVG or indeterminate dash — visible when checked/indeterminate)
└── label (optional, 14pt Red Hat Text Regular, line-height 20px)
```

**Sizes:**

| Size | Control box | Touch target | Label font |
|---|---|---|---|
| Default | 18×18px | 44×44px | 14pt / 20 lh |
| S | ~16×16px | 44×44px | 14pt / 20 lh |

The touch target is always 44×44px regardless of visual size (WCAG 2.5.5).

---

## 3. Variant system

### 3.1 Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | `false` | Whether the checkbox is checked |
| `indeterminate` | `boolean` | `false` | Shows dash; overrides `checked` visually |
| `error` | `boolean` | `false` | Error/negative styling |
| `highlight` | `boolean` | `false` | Highlight background on the state-layer |
| `secondary` | `boolean` | `false` | Secondary indeterminate variant (muted colour) |
| `disabled` | `boolean` | `false` | Disabled — non-interactive |
| `size` | `"default" \| "s"` | `"default"` | Visual size of the control |
| `label` | `string` | — | Optional visible label |
| `onChange` | `(checked: boolean) => void` | — | Called on user interaction |
| `id` | `string` | — | For `<label htmlFor>` association |
| `name` | `string` | — | For form grouping |
| `value` | `string` | — | Form value |
| `className` | `string` | `""` | Additional CSS class on the root |

### 3.2 Type matrix (from Figma)

| Type | `checked` | `indeterminate` | `error` | `highlight` | `secondary` |
|---|---|---|---|---|---|
| Unselected | false | false | false | false | false |
| Selected | true | false | false | false | false |
| Indeterminate | — | true | false | false | false |
| Error Unselected | false | false | true | false | false |
| Error Selected | true | false | true | false | false |
| Error Indeterminate | — | true | true | false | false |
| Highlight Unselected | false | false | false | true | false |
| Highlight Hovered | (hover state) | — | false | true | false |
| Hhighlight Focused | (focus state) | — | false | true | false |
| Hhighlight Pressed | (pressed state) | — | false | true | false |
| Secondary Indeterminate | — | true | false | false | true |

> **Note:** Figma names "Hhighlight Focused" and "Hhighlight Pressed" have a double-h — this is a Figma typo, not an intentional variant. The implementation treats them as `highlight + focused` and `highlight + pressed` states.

> **[TBD — needs user]:** What is the `Secondary Indeterminate` variant used for? It appears to be a muted/secondary colour indeterminate state. Confirm intended use case before shipping.

---

## 4. States

| State | Trigger |
|---|---|
| Active (default) | No interaction |
| Hovered | Mouse over |
| Focused | Keyboard focus |
| Pressed | Mouse/touch held down |
| Disabled | `disabled={true}` |

Hover, focus, and pressed states show on the **state-layer** (44×44px background), not the checkbox box itself. The box colour changes on hover/focus for the border.

---

## 5. Token mappings

### 5.1 Standard (primary) — unchecked / checked

| Element | State | Token | CSS variable |
|---|---|---|---|
| Box fill | All unchecked | transparent | — |
| Box fill | Checked / Indeterminate | `fill.action.primary.base` | `--semantic-color-light-mode-fill-action-primary-base` |
| Box fill | Checked hover | `fill.action.primary.hover` | `--semantic-color-light-mode-fill-action-primary-hover` |
| Box fill | Checked focused | `fill.action.primary.hover` | `--semantic-color-light-mode-fill-action-primary-hover` |
| Box fill | Checked pressed | `fill.action.primary.pressed` | `--semantic-color-light-mode-fill-action-primary-pressed` |
| Box fill | Disabled checked | `fill.action.primary.disabled` | `--semantic-color-light-mode-fill-action-primary-disabled` |
| Box border | Unchecked default | `stroke.action.secondary.base` | `--semantic-color-light-mode-stroke-action-secondary-base` |
| Box border | Unchecked hover | `stroke.action.secondary.hover` | `--semantic-color-light-mode-stroke-action-secondary-hover` |
| Box border | Unchecked focused | `stroke.action.secondary.hover` | `--semantic-color-light-mode-stroke-action-secondary-hover` |
| Box border | Unchecked pressed | `stroke.action.secondary.pressed` | `--semantic-color-light-mode-stroke-action-secondary-pressed` |
| Box border | Checked (all states) | same as fill | (border hidden under fill) |
| Box border | Disabled unchecked | `stroke.action.secondary.disabled` | `--semantic-color-light-mode-stroke-action-secondary-disabled` |
| Checkmark / dash icon | Checked / indeterminate | `icon.action.primaryinverse.base` | `--semantic-color-light-mode-icon-action-primaryinverse-base` |
| State-layer fill | Unchecked hover | `fill.action.secondary.hover` | `--semantic-color-light-mode-fill-action-secondary-hover` |
| State-layer fill | Unchecked focused | `fill.action.secondary.hover` | `--semantic-color-light-mode-fill-action-secondary-hover` |
| State-layer fill | Checked hover | `fill.action.primaryinverse.hover` | `--semantic-color-light-mode-fill-action-primaryinverse-hover` |
| State-layer fill | Checked focused | `fill.action.primaryinverse.hover` | `--semantic-color-light-mode-fill-action-primaryinverse-hover` |
| State-layer fill | Checked pressed | `fill.action.primaryinverse.pressed` | `--semantic-color-light-mode-fill-action-primaryinverse-pressed` |
| Label text | All | `text.static.secondary.base` | `--semantic-color-light-mode-text-static-secondary-base` |
| Border radius | Box | `cornerradius.xsmall` | `--semantic-layout-units-cornerradius-xsmall` |

### 5.2 Error (negative) — error unchecked / error checked

| Element | State | Token |
|---|---|---|
| Box fill | Error checked | `fill.action.negative.base` |
| Box fill | Error checked hover | `fill.action.negative.hover` |
| Box fill | Error checked focused | `fill.action.negative.hover` |
| Box fill | Error checked pressed | `fill.action.negative.pressed` |
| Box fill | Error disabled checked | `fill.action.negative.disabled` |
| Box border | Error unchecked | `stroke.action.negative.base` |
| Box border | Error unchecked hover | `stroke.action.negative.hover` |
| Box border | Error unchecked focused | `stroke.action.negative.hover` |
| Box border | Error unchecked pressed | `stroke.action.negative.pressed` |
| Box border | Error disabled unchecked | `stroke.action.negative.disabled` |
| Checkmark icon | Error checked | `icon.action.negativeinverse.base` |
| State-layer | Error unchecked hover | `fill.action.negativeinverse.hover` |
| State-layer | Error checked hover | `fill.action.negativeinverse.hover` |

### 5.3 Token gaps — needs Figma update

These tokens appear in the Figma component but are **not yet in `pathway-design-tokens.json`**. The component uses the nearest available token as a fallback (noted below). These must be added to Figma variables and re-synced before the component is considered fully token-compliant.

| Missing token | Figma value | Fallback used | Priority |
|---|---|---|---|
| `fill.action.secondaryinverse.hover` | `#f6f6f6` | `fill.action.secondary.hover` | HIGH |
| `fill.action.secondaryinverse.hover` (focused state) | `#f6f6f6` | `fill.action.secondary.hover` | HIGH |
| `fill.action.secondaryinverse.pressed` | `#ededed` | `fill.action.secondary.base` | HIGH |
| `stroke.action.secondaryinverse.base` | `#d2d2d2` | `stroke.action.secondary.base` | MEDIUM |
| `stroke.action.secondaryinverse.disabled` | `#e1e1e1` | `stroke.action.secondary.disabled` | MEDIUM |
| `icon.action.monoinverse.base` | `#ffffff` | `icon.action.primaryinverse.base` | LOW (same value) |
| `border-radius.xs` | `4px` | `cornerradius.xsmall` | LOW (same value) |
| `border-width.m` | `1.5px` | hardcoded `1.5px` | MEDIUM |

---

## 6. Visual design

### Box geometry
- Size (Default): 18×18px
- Border width: 1.5px
- Border radius: 4px (`cornerradius.xsmall`)
- Touch target: 44×44px (state-layer, `border-radius: 100px`)

### Checkmark icon
- SVG checkmark, white on primary fill
- Indeterminate: horizontal dash (−), same colour
- Both centre-aligned within the 18×18px box

### Label
- Font: Red Hat Text, 400 weight, 14px, line-height 20px
- Colour: `text.static.secondary.base`
- 16px gap between box and label

### Spacing
- State-layer is centred on the box: extends 13px on each side
- Label aligns vertically centred to the state-layer

---

## 7. Highlight variant

The `highlight` prop adds a tinted background on the state-layer even in the resting state. Used to visually associate the checkbox with an interactive surface (e.g. a selectable row).

> **[TBD — needs user]:** Confirm the highlight background token. Figma shows `Fill/Action/SecondaryInverse/Base` on the state-layer for highlight resting state. This token is missing from the token file — see §5.3.

---

## 8. Secondary Indeterminate variant

The `secondary` prop combined with `indeterminate` renders a muted indeterminate state. The icon appears to use secondary/muted colour rather than primary.

> **[TBD — needs user]:** Confirm the exact token for the secondary indeterminate icon and fill. Figma node `40002991:2784` represents this variant. Add the token if it's missing.

---

## 9. Accessibility

### ARIA
```html
<input type="checkbox" role="checkbox" aria-checked="false | true | mixed" aria-label="Label text" aria-disabled="true|false" />
```

Use `aria-checked="mixed"` for the indeterminate state (NOT `false`).

### Keyboard
| Key | Behaviour |
|---|---|
| `Space` | Toggle checked state |
| `Tab` | Move focus to next focusable element |
| `Shift+Tab` | Move focus to previous focusable element |

Checkboxes are NOT navigated with arrow keys (that is Radio's pattern). Each checkbox is independently focusable.

### Focus ring
Visible focus ring on the state-layer (44×44px). Uses the `Focused State-Error` effect from Figma for error checkboxes: `box-shadow: 0 0 0 3px rgba(170, 54, 54, 0.1)`.

Standard focused state: browser default outline or design system focus ring — uses `stroke.action.secondary.hover` on the box border (focused states share the hover color; the focus ring is a separate visual effect).

### Screen reader announcements
| State | Announcement |
|---|---|
| Unchecked | "[Label], checkbox, unchecked" |
| Checked | "[Label], checkbox, checked" |
| Indeterminate | "[Label], checkbox, partially checked" |
| Disabled | "[Label], checkbox, dimmed" (or "grayed out" per platform) |
| Error | Error message should be associated via `aria-describedby` |

### Contrast
- Checked fill (`fill.action.primary.base` = `#345499`) on white: ≥ 3:1 for non-text UI (WCAG 1.4.11 ✓)
- Label text (`text.static.secondary.base` = `#4b4b4b`) on white: ≥ 4.5:1 (WCAG 1.4.3 ✓)
- Error fill (`fill.action.negative.base` = `#9d2d2d`) on white: ≥ 3:1 ✓

### Touch target
44×44px minimum on all variants (WCAG 2.5.5 ✓).

---

## 10. Motion

No animation on the checkmark itself — it appears immediately on state change. Transitions use `--motion-*` tokens: the state-layer background fades with `--motion-duration-3` + `--motion-easing-standard`; the box fill/border with `--motion-duration-2` + `--motion-easing-decelerate`.

Reduced motion: no change needed (no animation to remove).

---

## 11. Constraints

- Never use raw hex. Every colour must be a semantic token CSS variable.
- The indeterminate state must use `aria-checked="mixed"` — not `false` and not `true`.
- Touch target must always be 44×44px. Do not reduce for size=S.
- Error state requires an associated error message via `aria-describedby` in production use.
- Disabled checkboxes must still be accessible to screen readers (do not use `aria-hidden`).
- The `secondary` indeterminate variant should not appear without a parent "Select all" context.

---

## 12. Usage examples

### Minimal
```jsx
<Checkbox label="Include background checks" onChange={setChecked} checked={checked} />
```

### Error with message
```jsx
<Checkbox
  label="Agree to terms"
  checked={agreed}
  error={!agreed && submitted}
  onChange={setAgreed}
  aria-describedby="terms-error"
/>
<span id="terms-error">You must agree to continue.</span>
```

### Indeterminate "Select all"
```jsx
<Checkbox
  label="Select all"
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onChange={handleSelectAll}
/>
```

---

## 13. Gaps

| Issue | Priority | Next step |
|---|---|---|
| 5 token families missing from token file (`secondaryinverse`, `monoinverse`, `border-width.m`) | HIGH | Add missing tokens to Figma variables, re-export, re-sync |
| Secondary Indeterminate use case unclear | MEDIUM | Confirm with design: what triggers this variant? |
| Highlight variant resting-state token missing | MEDIUM | Confirm `fill.action.secondaryinverse.base` in Figma, sync |
| Focus ring token not defined for standard (non-error) state | MEDIUM | Design: add `focused-state` effect token to Figma |
| No link to this spec in Figma Dev Mode | LOW | Add spec URL in Figma Dev Mode → Resources: `https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/checkbox/checkbox-spec.md` |
