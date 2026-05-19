# Pathway Tokens — Agent Brief

Read this **first** if you are an AI agent (Claude, Figma Make, v0, Cursor, etc.) about to invent any UI element that isn't already a documented Pathway component. This file tells you the rules for picking colours, typography, spacing, motion, and radii so the thing you build looks like it belongs to Pathway.

If a documented component exists for what you're building, **use the component** — see [`../AGENTS.md`](../AGENTS.md) and [`../components/manifest.json`](../components/manifest.json).

---

## The 5 hard rules

1. **Every colour you use must come from a semantic token.** Never raw hex. Never primitive tokens (`Blue/180`, `Cool-Neutral/130`, etc.). Never invented token names.

2. **Semantic colour token names follow `Role / Scope / Variant / State`.** Examples: `Fill/Static/Brand/Base`, `Text/Contextual/NavItem/Active`, `Icon/Action/Primary/Hover`. Type token names follow `Category/Subcategory/Size/Weight` (e.g. `Heading/Display/XL/Bold`, `Label/Button/Base`). Layout token names follow `Category/Size` (e.g. `BorderWidth/Base`, `CornerRadius/Medium`). If you propose a name that isn't in this file, it doesn't exist — look it up.

3. **There are three scopes:** `Static`, `Action`, and `Contextual`.
   - `Static` — fixed meaning across the whole product, not tied to interaction state (e.g. `Fill/Static/Brand/Base = #2d4889`, `Text/Static/Primary/Inverse = #ffffff`).
   - `Action` — for interactive elements; always come with states (`Base`, `Hover`, `Pressed`, `Disabled`) and variants (`Primary`, `Secondary`, `Tertiary`). Use these on buttons, links, focus rings, and interactive controls (e.g. `Fill/Action/Primary/Base`, `Fill/Action/Primary/Hover`, `Stroke/Action/Tertiary/Base`).
   - `Contextual` — scoped to a specific component family; they may share hex values with other scopes today but are kept separate so they can diverge independently (e.g. `Fill/Contextual/NavItem/Active`, `Icon/Contextual/NavItem/Hover`).

4. **Typography is `Red Hat Text`, weights 400/500/600/700.** No other font. No other weights. No display font.

5. **Use the type scale exactly as named.** `Label/Menu/Base/Medium` is 14/500/20px/0.3px letter-spacing. If you find yourself typing arbitrary px values for type, stop — find the scale entry.

---

## Where the real source of truth lives

| File | What it is |
|---|---|
| [`pathway-design-tokens.json`](./pathway-design-tokens.json) | DTCG-format derived from Figma. **Authoritative.** Every token in production. |
| [`figma-export/pathwaytokens.json`](./figma-export/pathwaytokens.json) | Raw Figma Variables export. Source of `pathway-design-tokens.json`. |
| [`../src/tokens/tokens.css`](../src/tokens/tokens.css) | Style Dictionary CSS output — all CSS custom properties. |
| [`../src/tokens/tokens.js`](../src/tokens/tokens.js) | Style Dictionary JS output. |
| **npm: `@helloimjolopez-pathway/pathway-tokens`** | **`npm install @helloimjolopez-pathway/pathway-tokens` — ships `dist/tokens.css`, `dist/tokens.js`, `dist/tokens.json`.** |
| **[tokens.css (live URL)](https://helloimjolopez-collab.github.io/pathway-ds/storybook/tokens.css)** | Directly importable CSS without npm — updated on every deploy. |
| [Storybook → Tokens](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/tokens-primitives-color--docs) | Visual swatches with hex values. |

When the spec says a value, the spec wins over your training data. When the token JSON says a value, the JSON wins over the spec. Tokens flow Figma → JSON → CSS — never the other direction.

---

## Token collections — what actually exists in Figma

Pathway tokens are organised into **six Figma variable collections**. Three are primitive (raw values), three are semantic (purpose-named aliases). Always use semantic tokens in components; primitives exist only to be aliased.

---

### Primitive: Color

Raw colour palettes. Higher step numbers = darker. Most palettes also have alpha variants at common opacities (e.g. `Brand / 50 @ 16%`).

| Palette | Range | Notes |
|---------|-------|-------|
| Cool Neutral | 0–240 | White → near-black. The main neutral. |
| Warm Neutral | 0–980 | Warm off-white → warm near-black. |
| Brand | 0–950 | Blue family. `500 = #2d4889` is the primary brand blue. |
| Red | 0–210 | Negative / error. |
| Orange | 0–210 | Danger / warning. |
| Green | 0–190 | Positive / success. |
| Seabreeze | 10–190 | Light blue-cyan. |
| Lagoon | 10–190 | Teal-cyan. |
| Jade | 10–190 | Green-teal. |
| Amethyst | 0–180 | Purple. `30 = #dcd9ef`, `150 = #221e3f` (profile avatar). |
| Saffron | 0–210 | Amber-yellow. Alert range. |
| Mauve | 0–200 | Pink-purple. |

Primitives are **never referenced in components**. They are only aliased by semantic tokens.

---

### Primitive: Type

Raw typographic values, referenced by semantic type tokens. Do not use directly.

- `Family / Brand` → `"Red Hat Text"` (the only typeface)
- `Weight` → 300 · 400 · 500 · 600 · 700
- `Size` → 10 · 11 · 12 · 14 · 16 · 18 · 20 · 24 · 32 · 36 · 40 · 48 · 56
- `Line Height` → per size · per density: Tight · Single · Relaxed · Spacious
- `Letter Spacing` → Compact · Standard · Wide · ExtraWide

---

### Primitive: Unit

Raw numeric values: 1, 2, 4, 6, 8, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120 (plus 0.5, 0.75, 1.5). Referenced by semantic layout tokens. Do not use directly.

---

### Semantic: Color

**Two modes: Light Mode · Dark Mode.**

Token path: `Role / Scope / Variant / State`

**Roles** — what the token colours:

| Role | Usage |
|------|-------|
| `Text` | Foreground text |
| `Fill` | Component background fills |
| `Icon` | Icon colour |
| `Stroke` | Borders, outlines, focus rings |
| `Surface` | Page-level backgrounds (no Scope level — path is `Surface / Nav / Base`, `Surface / Canvas / Light`) |
| `Scrim` | Overlay backgrounds (no Scope level — path is `Scrim / Light`, `Scrim / Subtle`, `Scrim / Base`) |

**Scopes** (apply to Text, Fill, Icon, Stroke):

**`Static`** — fixed value, not interaction-state dependent.
```
Variants: Neutral · Brand · Info · Warning · Danger · Negative · Positive
          Accent_Amethyst · Accent_Jade · Accent_Seabreeze · Accent_Lagoon
States:   Light · Subtle · Base · Contrast · Bold · Dark · Black
          (not every variant has every state — check the JSON)

Examples:
  Fill / Static / Brand / Base     → #2d4889  (TopNav, primary button)
  Fill / Static / Neutral / Light  → #ffffff  (cards, popovers)
  Fill / Static / Neutral / Subtle → #fbfbfb  (subtle backgrounds)
  Fill / Static / Accent_Amethyst / Base → #dcd9ef  (profile avatar)
  Text / Static / Primary / Base   → #202020
  Text / Static / Primary / Inverse → #ffffff  (text on dark/brand)
  Icon / Static / Brand / Bold     → #2d4889
  Stroke / Static / Neutral / Light  → #f6f6f6  (nav borders, dividers)
  Stroke / Static / Neutral / Subtle → #ededed  (popover borders)
  Surface / Nav / Light  → #fafafa
  Surface / Canvas / Light → #fafafa
```

**`Action`** — interactive elements. Always have interaction states.
```
Variants: Primary · PrimaryInverse · Secondary · SecondaryInverse · Tertiary · TertiaryInverse
          Mono · Warning · WarningInverse · Danger · DangerInverse
          Negative · NegativeInverse · Positive · PositiveInverse
          Alert · Accent_Amethyst · Accent_Amethyst_Inverse · Accent_Jade · Accent_Jade_Inverse
States:   Base · Hover · Pressed · Disabled (sometimes Selected)

Examples:
  Fill / Action / Primary / Base    → {Brand.400}   (primary button rest)
  Fill / Action / Primary / Hover   → {Brand.200}   (primary button hover)
  Fill / Action / Primary / Pressed → {Brand.500}
  Fill / Action / Primary / Disabled → {Brand.40}
  Fill / Action / Secondary / Base  → {Cool Neutral.20}
  Stroke / Action / Tertiary / Base → rgba(255,255,255,0.16)  (OrgSwitcher pill)
  Icon / Action / Primary / Base    → {Brand.400}
  Icon / Action / Secondary Inverse / Base → #6b6b6b
```

**`Contextual`** — scoped to a specific component family.
```
Text / Contextual / NavItem / Base|Hover|Focused|Active|Disabled
Fill / Contextual / NavItem / Base|Hover|Focused|Active|Trail
Icon / Contextual / NavItem / Base|Hover|Focused|Active|Disabled
Stroke / Contextual / FocusRing / Base

Examples (Light Mode):
  Fill / Contextual / NavItem / Base   → transparent
  Fill / Contextual / NavItem / Hover  → rgba(17,17,17,0.02)
  Fill / Contextual / NavItem / Active → rgba(160,181,230,0.16)
  Text / Contextual / NavItem / Base   → #313131
  Text / Contextual / NavItem / Active → #1b2d57
  Icon / Contextual / NavItem / Active → #2d4889
```

---

### Semantic: Layout & Units

**Single mode.**

**Global tokens** — `Category / Size`:

| Category | Sizes |
|----------|-------|
| `BorderWidth` | XThin · Thin · Base · Medium · Thick · XThick · XXThick |
| `CornerRadius` | XSmall (2px) · Small (4px) · Medium (8px) · Large (16px) · Full (64px) |
| `Gap` | XXXTight (2) · XXTight (4) · XTight (6) · Tight (8) · Medium (12) · Base (16) · Relaxed (24) · Wide (36) |
| `Padding` | XXXTight (2) → Collosal (120), 12 steps |

**Contextual tokens** — `Contextual / Component / Property / …`:
- `Contextual / Button / Gap · Padding · Border Width`
- `Contextual / NavItem / Large / Padding · Radius · Stroke Width`
- `Contextual / Page / Padding · Gap`
- `Contextual / Page Heading / Padding · Gap`
- `Contextual / Section Heading / Padding · Gap`
- `Contextual / Section / Padding · Gap`
- `Contextual / ToolBar / Padding · Gap`
- `Contextual / Focused Element / CornerRadius · BorderWidth`
- `Contextual / Card / Gap · Padding · Border Width · CornerRadius`

**Accessibility tokens** — `Accessibility / Touch Target / Size / Dimension`:
- Optimal: 48×48px · Mobile Minimum: 44×44px · Desktop Minimum: 36×36px

---

### Semantic: Type

**Two modes: Desktop · Mobile** (values can differ).

Token path: `Category / Subcategory / Size / Weight`

**`Heading`**
```
Display / XL | L | Base    — Bold · Semibold     — 56 / 48 / 40px
Page    / XL | L | Base    — Bold · Semibold     — 36 / 32 / 24px
Section / L | Base | S | XS — Medium · Semibold · Bold — 20 / 18 / 16 / 14px
Local   / Base | S | XS    — Semibold · Bold     — 14 / 12 / 11px
```

**`Text`**
```
Body      / Large | Base | Small | XSmall — Regular · Medium · Semibold — 18 / 16 / 14 / 12px
Supporting / Base | Small | XSmall         — Regular · Semibold          — 12 / 11 / 10px
Dense      / Base | Small | XSmall         — Regular · Semibold          — 12 / 11 / 10px (tight line-height)
```

**`Label`**
```
Button   / Base | L | S | XS   — Medium weight          — 16 / 18 / 14 / 12px
Input    / Base | L | S        — Regular · Medium · Semibold — 14 / 16 / 12px
Option   / Base | L | S        — Regular · Medium · Semibold — 14 / 16 / 12px
Tab      / Base | S            — Regular · Medium · Semibold — 14 / 12px
Menu     / Base | L | S        — Regular · Medium           — 14 / 16 / 12px
Progress / Base | S            — Regular · Semibold          — 14 / 12px
Badge    / Small | Base | Large — Regular · Medium · Semibold — 11 / 12 / 14px
Section  / Small | Base | Large — Regular · Medium · Semibold — 11 / 12 / 14px
```

Specific px values: `Label/Menu/Base/Medium` = 14px / 500 / 20px line-height / 0.3px letter-spacing.

All type uses `'Red Hat Text', sans-serif`. Load via Google Fonts:
```html
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:ital,wght@0,400;0,500;0,600;0,700&display=swap" />
```

---

### Motion (not a Figma variable collection — documented separately)
```
instant   150ms   /* hover, focus, colour swaps */
short     300ms   /* small structural moves, modal enter */
medium    600ms   /* page transitions */
long      900ms+  /* hero animations (rare) */

/* Component-specific (registered — do NOT invent your own) */
Motion/SideNav/Panel/Width    380ms · cubic-bezier(0.32, 0.72, 0, 1)
Motion/SideNav/Label/Fade     360ms · same curve · 200ms opacity
Motion/SideNav/Accordion      340ms · cubic-bezier(0.22, 1, 0.36, 1)
Motion/SideNav/Overlay/Enter  380ms · cubic-bezier(0, 0, 0.2, 1)
Motion/SideNav/Overlay/Exit   300ms · cubic-bezier(0.4, 0, 0.6, 1)

Standard easing:    cubic-bezier(0.4, 0, 0.2, 1)
Decelerate (enter): cubic-bezier(0, 0, 0.2, 1)
Accelerate (exit):  cubic-bezier(0.4, 0, 0.6, 1)
```

**Always respect `prefers-reduced-motion: reduce`** — collapse all transforms to instant opacity fades at 150ms linear.

---

## When you have to invent a new UI element

If no component exists for what you need (e.g. a custom card, a banner, a confirmation message):

1. **Background:** pick from the Surface or Fill families. White cards use `Fill/Static/Surface/White`. Subtle grey panels use `Surface/Canvas/Light` (`#fafafa`). Don't invent new surface colours.

2. **Border:** `Stroke/Static/Neutral/Subtle` (`#ededed`) for separating elements, `Stroke/Static/Neutral/Light` (`#f6f6f6`) for very subtle structural dividers.

3. **Radius:** 8px (`Border/Radius/S`) for almost anything. 12px (`Border/Radius/M`) for cards. 64px+ for circles. Never invent radii.

4. **Padding:** use the spacing scale numbers above. Standard card padding is 16 or 24. Standard form-row gap is 8 or 12.

5. **Typography:** `Label/Menu/Base/Medium` for buttons and emphasised labels. `Text/Body/S/Regular` for body. `Label/Section/Small/Semibold` for section headings. Never use arbitrary px sizes.

6. **Motion:** 150ms for hover/colour. 300ms for entering/leaving. Standard easing curve for almost everything. Reduced-motion always respected.

7. **Accessibility:** all interactive elements have a visible focus ring (use brand-blue `#2d4889` outline 2px with 2px offset). All touch targets at minimum 44×44. All text passes WCAG AA contrast on its intended background.

If you find yourself reaching for a colour, size, or motion value that isn't in the families above, stop and ask the user. Don't make it up.

---

## What to do when you can't find a token

1. **Search [`pathway-design-tokens.json`](./pathway-design-tokens.json) by name fragment.** Most components reference token names verbatim in their spec — the name is reachable from there.

2. **Search Storybook's token pages.** The Tokens section under `Semantics/` has full swatches with hex values and CSS variable names.

3. **Check the Figma file directly via MCP.** File key `3sw45aVcngFAmpbP6cfrXP`. The Variables panel is the absolute source of truth.

4. **Ask the user.** Don't invent. If a token is missing, that's a real gap in the design system that the user (or design team) needs to fill in Figma.

---

## Anti-patterns — common mistakes

These are the mistakes AI agents make most often when consuming this design system. Each one looks reasonable in isolation; together they corrode the system.

**❌ Hardcoded hex**
```jsx
<button style={{ color: "#2d4889", background: "#ffffff" }}>Save</button>
```
**✅ Semantic token**
```jsx
<button style={{
  color: "var(--text-action-primary-base)",
  background: "var(--fill-static-surface-white)"
}}>Save</button>
```

**❌ Primitive token used directly**
```css
color: var(--primitive-color-blue-180);
```
Primitives are building blocks for *the design system itself*. Components never consume them directly — they consume the semantic token that wraps the primitive. If the primitive is renamed in Figma, your component breaks. If you use the semantic, it doesn't.

**✅ Semantic token**
```css
color: var(--text-static-brand-base);
```

**❌ Invented token name**
```jsx
color: "var(--text-primary)"
color: "var(--color-brand)"
color: "var(--icon-success)"
```
If the name isn't in [`pathway-design-tokens.json`](./pathway-design-tokens.json), it doesn't exist. Don't pattern-match from other design systems you've seen.

**✅ Real token from this system**
```jsx
color: "var(--text-static-primary-base)"
color: "var(--fill-static-brand-base)"
color: "var(--icon-static-success-base)"
```

**❌ Arbitrary px size for type**
```css
font-size: 15px;
font-weight: 500;
line-height: 22px;
```
**✅ Type scale entry from the spec**
```
Use `Label/Menu/Base/Medium` — that's 14/500/20px/0.3px letter-spacing.
```

**❌ Inter / system-ui / SF Pro**
```css
font-family: Inter, system-ui, -apple-system, sans-serif;
```
**✅ Red Hat Text**
```css
font-family: "Red Hat Text", sans-serif;
```
There is no other font in Pathway. No display font, no monospace font. If you need monospace for code, that's a real DS gap — surface it, don't invent.

**❌ Arbitrary radius**
```css
border-radius: 6px;  /* or 4px, or 10px */
```
**✅ Radius scale entry**
```css
border-radius: 8px;   /* CornerRadius/S — almost anything */
border-radius: 12px;  /* CornerRadius/M — cards */
```

**❌ Custom motion timing**
```css
transition: all 250ms ease-in-out;
```
**✅ Pathway motion**
```css
transition: background-color 150ms ease-out;       /* hover/colour */
transition: transform 300ms cubic-bezier(0.4,0,0.2,1);  /* enter/leave */
```

**❌ Inventing accessibility patterns**
```jsx
<div onClick={save} style={{ cursor: "pointer" }}>Save</div>
```
**✅ Real interactive elements**
```jsx
<button onClick={save}>Save</button>
```
Use real HTML semantics. `<button>` for actions. `<a>` for navigation. `<input>` for inputs. Never `<div role="button">` when a `<button>` will do.

---

## When you've made one of these mistakes

If you catch yourself reaching for any of these anti-patterns, stop. The right move is either:

- Find the real token / type entry / motion value in the spec, or
- Surface the gap to the user: *"There's no token for `<X>` in Pathway — I'm flagging it as a DS gap rather than inventing a value."*

A flagged gap gets fixed. A silent invention spreads.
