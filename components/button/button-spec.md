# Button — Component Spec

**Status:** REVIEWED  
**Version:** v1  
**Last updated:** 2026-05-25  
**Figma node:** `40003293:93741` (PW_Button)

---

## Authorship

Design owns and signs off on: Status, Purpose, Variants, States, Token reference, Figma setup, Accessibility intent, Usage rules.  
Engineering owns and signs off on: prop types, ARIA implementation in code, browser-specific behaviour.  
Neither signs off on the other's section.

---

## §1 Purpose

A Button is a discrete, tappable/clickable affordance that causes something to happen: saving a form, triggering an action, advancing a flow, opening a panel. It is the primary carrier of *actionable intent* in the Pathway design system.

The Button is **not** a navigation element. It does not route users to a new URL. If pressing the element navigates, use an `<a>` or router `<Link>` styled with Button tokens. The semantic distinction matters for screen readers and keyboard users.

---

## Links

| Artefact | URL |
|---|---|
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003293-93741 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/components-button--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/button/button.html |

---

## §2 Governance

| Artefact | Location | Who edits |
|---|---|---|
| Figma component | `PW_Button` node `40003293:93741` | Designer |
| This spec | `components/button/button-spec.md` | DS owner |
| React module | `components/button/button.jsx` | Pipeline |
| HTML demo | `components/button/button.html` | Pipeline |
| Stories | `src/stories/Library/Button/Button.stories.jsx` | Pipeline |
| MDX docs | `src/stories/Library/Button/Button.mdx` | Pipeline |
| Manifest | `components/manifest.json` | Pipeline |
| Token source | `tokens/figma-export/pathwaytokens.json` (Figma → export) | Designer |

### Figma source

- **File:** [Pathway Design System](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **Button component:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40003293-93741)

---

## §3 Anatomy

### DOM structure

```
<button type="button"                    ← outer — touch-target zone
  disabled? aria-disabled aria-busy aria-label>
  <span class="pw-button__container">   ← Container.Main — visible surface
    <span class="material-symbols-rounded  pw-button__icon--leading">  ← LeadingIcon slot (optional)
    <span class="pw-button__label">      ← Label
    <span class="material-symbols-rounded  pw-button__icon--trailing"> ← TrailingIcon slot (optional)
  </span>
</button>
```

**Loading state** replaces all slot content with a spinner:

```
<button type="button" disabled aria-busy="true">
  <span class="pw-button__container">
    <ButtonSpinner />                    ← inline 8-spoke SVG
  </span>
</button>
```

### Why two layers?

The outer `<button>` carries interactive semantics and enforces the WCAG 2.5.5 touch target (48 × 48 px minimum). It is visually transparent. The inner `Container.Main` span is the visual button — it carries the background colour, border, radius, padding, and focus ring. This separation means the visible button can be exactly content-sized while the touch target is always 48 px minimum.

---

## §4 Variant system

Three axes combine:

```
Style        × Type          × Size
─────────────────────────────────────
Fill           Primary         L
Outlined       Secondary       M (default)
Naked          Tertiary        S
               Negative
```

Plus orthogonal state dimensions:

- **Interaction state:** base · hover · pressed · focused · disabled · loading
- **Icon configuration:** no icons · leading icon only · trailing icon only · both · icon-only (showText=false)

### Style definitions

**Fill** — solid background, highest visual weight. Use for the primary action on a surface (one Fill/Primary per page section is the guideline).

**Outlined** — transparent background + 1.5 px border. Secondary weight. Use for supporting actions adjacent to a Fill button, or when a solid fill would be too heavy.

**Naked** — no background, no border. Lowest visual weight. Use for tertiary or contextual actions within prose, toolbars, or action rows. Works on both light and dark surfaces (brand-blue top nav uses Naked/Primary with dark-mode tokens).

### Type definitions

**Primary** — brand blue (`fill.action.primary.*`). The default. Reserve for the most important action.  
**Secondary** — neutral/muted (`fill.action.secondary.*`). Supporting actions.  
**Tertiary** — lightest weight (`fill.action.tertiary.*`). Inline or low-priority.  
**Negative** — destructive intent (`fill.action.negative.*`). Delete, revoke, remove. Use sparingly; its presence should always indicate danger, not just rejection.

> IMPLEMENTATION RULE: Style and Type are independent axes.
> A Naked/Negative button is valid — it is a low-visual-weight destructive action. Never conflate Type with visual weight (that is Style's job).

---

## §5 Token mappings

### 5.1 Fill tokens (background)

| Style | Type | Base | Hover | Pressed | Disabled |
|---|---|---|---|---|---|
| Fill | Primary | `fill.action.primary.base` | `fill.action.primary.hover` | `fill.action.primary.pressed` | `fill.action.primary.disabled` |
| Fill | Secondary | `fill.action.secondary.base` | `fill.action.secondary.hover` | `fill.action.secondary.pressed` | `fill.action.secondaryinverse.disabled` |
| Fill | Tertiary | `fill.action.tertiary.base` | `fill.action.tertiary.inverse.hover` | `fill.action.tertiary.inverse.pressed` | `fill.action.tertiary.disabled` |
| Fill | Negative | `fill.action.negative.base` | `fill.action.negative.hover` | `fill.action.negative.pressed` | `fill.action.negative.disabled` |
| Outlined / Naked | Primary | `transparent` | `fill.action.primaryinverse.hover` | `fill.action.primaryinverse.pressed` | `transparent` |
| Outlined / Naked | Secondary | `transparent` | `fill.action.secondary.hover` | `fill.action.secondary.pressed` | `transparent` |
| Outlined / Naked | Tertiary | `fill.action.tertiary.inverse.base` | `fill.action.tertiary.inverse.hover` | `fill.action.tertiary.inverse.pressed` | `transparent` |
| Outlined / Naked | Negative | `transparent` | `fill.action.negativeinverse.hover` | `fill.action.negativeinverse.pressed` | `transparent` |

### 5.2 Text tokens (label colour)

**Fill buttons** use *inverse* text (white on coloured surface):

| Type | Base | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | `text.action.primaryinverse.base` | `text.action.primaryinverse.hover` | `text.action.primaryinverse.pressed` | `text.action.primaryinverse.disabled` |
| Secondary | `text.action.secondary.base` | `text.action.secondary.hover` | `text.action.secondary.pressed` | `text.action.secondary.disabled` |
| Tertiary | `text.action.tertiary.base` | `text.action.tertiary.hover` | `text.action.tertiary.pressed` | `text.action.tertiary.disabled` |
| Negative | `text.action.mono.base` | `text.action.mono.hover` | `text.action.mono.pressed` | `text.action.mono.disabled` |

**Outlined and Naked** use direct-type text (coloured on transparent surface):

| Type | Base | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | `text.action.primary.base` | `text.action.primary.hover` | `text.action.primary.pressed` | `text.action.primary.disabled` |
| Secondary | `text.action.secondary.base` | `text.action.secondary.hover` | `text.action.secondary.pressed` | `text.action.secondary.disabled` |
| Tertiary | `text.action.tertiary.base` | `text.action.tertiary.hover` | `text.action.tertiary.pressed` | `text.action.tertiary.disabled` |
| Negative | `text.action.negative.base` | `text.action.negative.hover` | `text.action.negative.pressed` | `text.action.negative.disabled` |

### 5.3 Icon tokens

Mirror the text token pattern exactly, substituting `icon` for `text`. Icon colours always match label colours within the same style/type/state.

Fill/Primary uses `icon.action.primaryinverse.*`. Fill/Negative uses `icon.action.mono.*`.
Outlined and Naked use `icon.action.{type}.*`.

### 5.4 Stroke tokens (Outlined only)

| Type | Base | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | `stroke.action.primary.base` | `stroke.action.primary.hover` | `stroke.action.primary.pressed` | `stroke.action.primary.disabled` |
| Secondary | `stroke.action.secondary.inverse.base` | `stroke.action.secondary.inverse.hover` | `stroke.action.secondary.inverse.pressed` | `stroke.action.secondary.inverse.disabled` |
| Tertiary | `stroke.action.tertiary.base` | `stroke.action.tertiary.hover` | `stroke.action.tertiary.pressed` | `stroke.action.tertiary.disabled` |
| Negative | `stroke.action.negative.base` | `stroke.action.negative.hover` | `stroke.action.negative.pressed` | `stroke.action.negative.disabled` |

Border width: `--semantic-layout-units-contextual-button-border-width-base-base` (1.5 px).

> IMPLEMENTATION RULE: Fill and Naked buttons have `border: none`.
> Only Outlined has a border. Never apply the stroke token to Fill or Naked — it would create an extra visual weight that conflicts with style intent.

### 5.5 Layout tokens

| Property | Token | Value |
|---|---|---|
| Border radius | `--semantic-layout-units-contextual-button-radius-radius` | 8 px |
| Gap (icon ↔ label) | `--semantic-layout-units-contextual-button-gap-horizontal` | 8 px |
| Border width (Outlined) | `--semantic-layout-units-contextual-button-border-width-base-base` | 0.75 px |
| Padding L horizontal | `--semantic-layout-units-contextual-button-padding-large-horizontal` | 14 px |
| Padding L vertical | `--semantic-layout-units-contextual-button-padding-large-vertical` | 12 px |
| Padding M horizontal | `--semantic-layout-units-contextual-button-padding-medium-horizontal` | 12 px |
| Padding M vertical | `--semantic-layout-units-contextual-button-padding-medium-vertical` | 10 px |
| Padding S horizontal | `--semantic-layout-units-contextual-button-padding-small-horizontal` | 8 px |
| Padding S vertical | `--semantic-layout-units-contextual-button-padding-small-vertical` | 6 px |
| Padding XS horizontal | `--semantic-layout-units-contextual-button-padding-xsmall-horizontal` | 8 px |
| Padding XS vertical | `--semantic-layout-units-contextual-button-padding-xsmall-vertical` | 6 px |

### 5.6 Focus ring

```css
box-shadow:
  0 0 0 6px #ffffff,
  0 0 0 8px var(--semantic-color-light-mode-stroke-contextual-focusring-base);
```

The inner halo (6 px white) provides contrast against any button surface colour. The outer band (2 px brand ring) is the visible focus indicator. This meets WCAG 2.4.11 (Focus Appearance) at all states.

> IMPLEMENTATION RULE: The focus ring lives on Container.Main via `box-shadow`, not on the outer `<button>`.
> `outline: none` is set on the outer `<button>`. This preserves the visual design (ring tightly wraps the visible button surface) while the native focus semantics remain on the button element.

### 5.7 Typography tokens

Typography tokens are per-size.

| Size | Font size | Font family | Font weight | Line height | Letter spacing |
|---|---|---|---|---|---|
| L | `--semantic-type-desktop-label-button-l-fontsize` | `--semantic-type-desktop-label-button-l-fontfamily` | `--semantic-type-desktop-label-button-l-fontweight` | `--semantic-type-desktop-label-button-l-lineheight` | `--semantic-type-desktop-label-button-l-letterspacing` |
| M | `--semantic-type-desktop-label-button-base-fontsize` | `--semantic-type-desktop-label-button-base-fontfamily` | `--semantic-type-desktop-label-button-base-fontweight` | `--semantic-type-desktop-label-button-base-lineheight` | `--semantic-type-desktop-label-button-base-letterspacing` |
| S | `--semantic-type-desktop-label-button-s-fontsize` | `--semantic-type-desktop-label-button-s-fontfamily` | `--semantic-type-desktop-label-button-s-fontweight` | `--semantic-type-desktop-label-button-s-lineheight` | `--semantic-type-desktop-label-button-s-letterspacing` |

---

## §6 Interaction states

### State priority

```
loading → disabled → pressed → hovered → focused → base
```

`loading` and `disabled` are terminal. When `loading={true}`, the button behaves as disabled (no click, `aria-busy="true"`, cursor: `not-allowed`). When both `loading` and `disabled` are true, `loading` wins visually.

### State definitions

| State | Trigger | Visual change |
|---|---|---|
| base | default | Fill/Outlined/Naked resting appearance |
| hover | `mouseenter` | Background/border/text shift to hover tokens |
| pressed | `mousedown` / `Space` / `Enter` keydown | Background/border/text shift to pressed tokens |
| focused | `onFocus` (keyboard or programmatic) | Focus ring applied via `box-shadow` on Container.Main |
| disabled | `disabled={true}` | Disabled tokens, `cursor: not-allowed`, no interaction |
| loading | `loading={true}` | Spinner replaces all content, implicit disabled |

Transition: `--motion-duration-2` + `--motion-easing-standard` (150 ms, `cubic-bezier(0.4,0,0.2,1)`) on `background-color`, `border-color`, `box-shadow`, `color`. See §10.

---

## §7 Icon slots

### Slot sizes

| Button size | Icon slot (wrap) | Icon render size |
|---|---|---|
| L | 26 × 26 px | 18 px |
| M | 24 × 24 px | 16 px |
| S | 20 × 20 px | 14 px |

Icons are always **Material Symbols Rounded**. The slot wrapper constrains the icon; the font-size controls the glyph size. Icon colour comes from the current icon token (identical to text colour within the same type).

### Icon-only buttons

When `showText={false}`: the label span is hidden, the button renders as a square surface sized to its single icon slot. `ariaLabel` is **required** — without it, the button has no accessible name.

> IMPLEMENTATION RULE: Never render a button with neither label nor aria-label.
> The pipeline must validate: if `showText=false` and `ariaLabel` is empty, log a warning.

---

## §8 Loading state

The loading state is a complete content replacement:

1. All slot content (label, leading icon, trailing icon) disappears.
2. A `ButtonSpinner` component appears — an 8-spoke SVG with `stroke: currentColor`, inheriting colour from the container's `color` property (= current icon token).
3. The button is implicitly `disabled` — click handler suppressed, cursor becomes `not-allowed`.
4. `aria-busy="true"` is set.

Spinner size: `iconInner × 1.2` (M = 19.2 px, rounded to `~20 px`).

### Spinner spec

```
@keyframes pw-btn-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
animation: pw-btn-spin var(--motion-duration-loop-fast) var(--motion-easing-linear) infinite;

@media (prefers-reduced-motion: reduce) {
  .pw-btn-spinner { animation: none !important; }
}
```

Duration 0.75 s (faster than the standalone Spinner's 1 s — tighter feedback for an action in progress). `prefers-reduced-motion`: animation stops.

---

## §9 Touch target

Outer `<button>` has:

```css
padding: 6px;       /* gap between hit zone and visible surface */
min-height: 48px;
min-width: 48px;
```

This ensures a 48 × 48 px touch target for every button size (including Size S which is ~34 px tall without padding). The 6 px outer padding creates visual breathing room and keeps the touch edge away from adjacent interactive elements.

> IMPLEMENTATION RULE: Never reduce the 6px outer padding.
> It is both the touch-target clearance and the focus-ring breathing room. At less than 6px, the white halo of the focus ring clips against adjacent elements.

---

## §10 Motion

All button state transitions share one motion pairing: **`--motion-duration-2` (150 ms) + `--motion-easing-standard`** — no hardcoded values.

| Property | Token | Resolved |
|---|---|---|
| Background colour | `--motion-duration-2` + `--motion-easing-standard` | 150 ms, `cubic-bezier(0.4,0,0.2,1)` |
| Border colour | `--motion-duration-2` + `--motion-easing-standard` | 150 ms, standard |
| Text / icon colour | `--motion-duration-2` + `--motion-easing-standard` | 150 ms, standard |
| Box shadow (focus ring) | `--motion-duration-2` + `--motion-easing-standard` | 150 ms, standard |
| Spinner rotation *(continuous loop)* | `--motion-duration-loop-fast` + `--motion-easing-linear` | 750 ms, linear |

> **Spinner loop:** the in-button spinner rotates at **`--motion-duration-loop-fast`** (750 ms — tighter than the standalone Spinner's `--motion-duration-loop` 1000 ms; faster reads as more responsive feedback for an in-progress action). Loop periods are their own motion family (see design-system-spec §2.1), distinct from the one-shot transition ladder, always paired with `--motion-easing-linear`. `prefers-reduced-motion: reduce` stops the spinner; colour transitions are not suppressed (not vestibular triggers).

---

## §11 Usage rules

### When to use

- Primary action on a form (Submit, Save, Confirm)
- Triggering an action that affects data (Delete, Publish, Archive)
- Advancing a multi-step flow (Next, Continue, Apply)
- Opening panels, dialogs, or drawers (when the semantic action is "open [X]", not "go to [X]")

### When NOT to use

- Link text that routes to a new page → use `<a>` or `<Link>` with Button tokens if needed
- Toggle state (on/off) → use a toggle or checkbox
- Tab switching → use a tab component
- Contextual menu item → use a menu item component (see Radix DropdownMenu)
- Form reset → prefer explicit "Cancel" with a Naked button, not a native reset

### Hierarchy rules

- **One Fill/Primary button per page section.** Multiple Fill/Primary buttons on the same surface compete for attention and dilute the primary action signal.
- **Negative should appear alone or as the secondary of a pair.** Never place two Negative buttons side by side.
- **Naked buttons in prose** must have sufficient surrounding context — a Naked button without a label or icon is invisible.

---

## §12 Responsive behaviour

The Button itself has no breakpoint-specific layout changes. It is an inline element that sizes to its content. The **touch target floor** (48 × 48 px) applies at all breakpoints — do not reduce it for mobile.

Producers of button-containing layouts should ensure adequate spacing between adjacent buttons at narrow widths (≥ 8 px gap at S, ≥ 12 px at M/L).

---

## §13 Accessibility

### ARIA pattern

```html
<button type="button"
  disabled?                       ← when disabled or loading
  aria-disabled="true"?           ← mirrors disabled prop
  aria-busy="true"?               ← when loading
  aria-label="…"?                 ← overrides accessible name (required for icon-only)
>
```

### Keyboard

| Key | Action |
|---|---|
| `Tab` | Move focus to button |
| `Enter` | Activate |
| `Space` | Activate |
| No other keys trigger action |  |

Native `<button>` provides all keyboard handling. Do not override with `onKeyDown` beyond the pressed-state simulation.

### Screen reader announcements

- Default: "Button label, button" (`role=button` is implicit from `<button>`)
- Loading: "Button label, dimmed, busy" (screen reader announces disabled+busy)
- Disabled: "Button label, dimmed" (disabled attribute suppresses interaction)

### Focus ring

6 px white halo + 2 px brand ring on Container.Main. Ring wraps the visible button surface, not the touch target. Meets WCAG 2.4.11 Focus Appearance.

### Contrast

- Fill/Primary label on blue background: `text.action.primaryinverse` is guaranteed ≥ 4.5:1 against `fill.action.primary` by token design.
- Disabled buttons intentionally fall below 3:1 — this is acceptable per WCAG 1.4.3 (disabled UI components are exempt).

### Reduced motion

Spinner animation stops under `prefers-reduced-motion: reduce`. Colour transitions continue (not vestibular triggers).

### WCAG conformance

| Criterion | Level | Conformance |
|---|---|---|
| 1.4.3 Contrast (Minimum) | AA | Pass (non-disabled) / Exempt (disabled) |
| 1.4.11 Non-text Contrast | AA | Pass — focus ring + border at 3:1 |
| 2.1.1 Keyboard | A | Pass — native button |
| 2.4.11 Focus Appearance | AA | Pass — 6+2px ring |
| 2.5.5 Target Size | AAA | Pass — 48×48 minimum |
| 4.1.2 Name, Role, Value | A | Pass — native button + aria-label for icon-only |

---

## §14 Implementation checklist (for pipeline)

When regenerating this component, confirm:

- [ ] All FILL/TEXT/ICON/STROKE token tables are present and match §5
- [ ] SIZES table uses `SL("contextual-button-padding-large-*")` for L padH/padV
- [ ] SIZES table uses `ST("label-button-l-fontsize")` etc. for all font sizes
- [ ] `ButtonSpinner` uses `stroke: currentColor` and `@keyframes pw-btn-spin var(--motion-duration-loop-fast) var(--motion-easing-linear)`
- [ ] Outer `<button>` has `padding: 6px`, `min-height: 48`, `min-width: 48`
- [ ] `aria-hidden="true"` on Container.Main span (decorative — accessible name is on the button)
- [ ] `ariaLabel` takes precedence; fallback to `text` when `showText=false`
- [ ] `disabled || loading` → `cursor: not-allowed`, suppress `onClick`, set `aria-disabled`
- [ ] Loading → `aria-busy="true"`, content replaced by spinner only
- [ ] `prefers-reduced-motion` keyframe suppression present
- [ ] Material Symbols font loaded (in HTML demo; in Storybook via preview.js or story link)

---

## §15 Token gaps

All previously-flagged HIGH gaps are resolved as of the 2026-05-26 token sync.

### RESOLVED (2026-05-26)

| Token | Status |
|---|---|
| `--semantic-layout-units-contextual-button-padding-large-horizontal` | ✓ Added to Figma & synced |
| `--semantic-layout-units-contextual-button-padding-large-vertical` | ✓ Added to Figma & synced |
| `--semantic-layout-units-contextual-button-radius-radius` | ✓ Added to Figma & synced |
| `--semantic-type-desktop-label-button-l-fontsize` | ✓ Exists in token file |
| `--semantic-type-desktop-label-button-base-fontsize` | ✓ Exists in token file |
| `--semantic-type-desktop-label-button-s-fontsize` | ✓ Exists in token file |
| Secondary fill tokens now use `fill.action.secondaryinverse.*` (warm neutral) | ✓ Fixed |
| Secondary stroke tokens now use `stroke.action.secondary.*` (warm neutral) | ✓ Fixed |

### RESOLVED (2026-06-11 — XS size)

| Token | Status |
|---|---|
| `--semantic-layout-units-contextual-button-padding-xsmall-horizontal` (8 px) | ✓ Added to Figma & synced |
| `--semantic-layout-units-contextual-button-padding-xsmall-vertical` (6 px) | ✓ Added to Figma & synced |
| `--semantic-type-desktop-label-button-xs-*` (12 px / 18 lh / 500) | ✓ Exists in token file |

### OPEN — Figma-side (do not block the repo; for the designer)

| Item | Detail | Action |
|---|---|---|
| No XS Tertiary variant | Figma defines XS for Primary / Secondary / Negative only (Fill / Outlined / Naked). The code renders `size="XS" type="Tertiary"` with XS dims + Tertiary colours, but Figma has no canonical reference for it. | Decide whether XS should support Tertiary; add the variant in Figma, or document XS+Tertiary as unsupported. |
| Malformed variant name | Node `40008225:24444` is named `Style=PW_Button, Size=Naked, Type=XS, State=Primary` — properties scrambled. By grid position it is `Style=Naked, Size=XS, Type=Primary, State=Focused`. | Rename the variant in Figma so the property axes are correct. |

---

## §16 Responsiveness

The button has no responsive layout variants. The single rule is: **touch target floor ≥ 48 × 48 px at all breakpoints**. This is enforced by the outer `<button>` `min-height`/`min-width`.

Producers (page/form authors) are responsible for:
- Adequate spacing between adjacent buttons (8 px minimum, 12 px recommended)
- Ensuring full-width buttons in constrained layouts use `width: 100%` on the outer button

---

## §17 AI agent implementation guide

### Reference files (read in this order)

1. `components/button/button.jsx` — authoritative React implementation
2. `components/button/button.html` — self-contained CDN demo with all tokens inlined
3. `src/tokens/tokens.css` — all `--semantic-*` CSS variables (source of truth for variable names)
4. `components/sidenav/sidenav.jsx` — architecture reference (T/L export pattern)
5. `components/checkbox/checkbox.jsx` — CSS var helper pattern (`SC()`, `SL()`, `ST()`)

### Content structure

```
button.jsx exports:
  T            — layout constants (radius, border, gap, touch, focusShadow)
  SIZES        — per-size table (padH, padV, iconWrap, iconInner, fontSize, font*)
  ButtonSpinner — 8-spoke SVG spinner (standalone, exported for reuse)
  Button       — main component (default export + named export)
```

### Common pitfalls

1. **All SIZES values are now CSS var strings.** `padH`, `padV`, and `fontSize` all use `SL()` or `ST()` helpers. Do not use numeric values.
2. **Spinner inherits colour via `currentColor`.** The container's `color` property is set to `iconColor`. Do not set a separate `color` on the spinner.
4. **`aria-hidden` on Container.Main.** The inner span is decorative; all semantics live on the outer `<button>`.
5. **Style=Naked/Tertiary has a non-transparent base fill.** `fill.action.tertiary.inverse.base` is a subtle tinted colour, not transparent. All other Naked types are `transparent` at base.

### Implementation prompt template

```
Build the Pathway Button using:
- components/button/button.jsx as the exact implementation reference
- tokens from src/tokens/tokens.css (never invent or hardcode colours)
- Material Symbols Rounded for all icons
- Outer <button> as touch target (min 48×48, 6px padding)
- Inner Container.Main span for all visual styling
- focus ring via box-shadow on Container.Main
- Loading state: spinner only, aria-busy=true, implicit disabled
- All transitions --motion-duration-2 · --motion-easing-standard (spinner loop: --motion-duration-loop-fast · --motion-easing-linear)
```
