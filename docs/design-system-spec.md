# Pathway Design System — Overarching Spec

**Status:** `REVIEWED` (living document — grows as the system grows)

System-wide rules that apply to **every** Pathway component. Individual component specs inherit from this document; when a component needs to deviate from a rule here, the deviation must be flagged in the component spec's §14 (Motion) or §13 (Accessibility) — wherever it applies — and approved by the Spec Review skill.

The `/pathway:spec-review` skill reads this document alongside every component spec it audits, and surfaces conflicts (e.g. a component says motion duration 500 ms while the system rule below is 300 ms).

---

## 1. Sources of truth

| Domain | Source of truth | Consumed by |
|---|---|---|
| Design tokens (primitives, semantics) | Figma library → exported to `tokens/figma-export/pathwaytokens.json` | Style Dictionary → `src/tokens/tokens.css` → components + Storybook |
| Component visual design (variants, anatomy, states) | Figma (each component's node) | Component `-spec.md` + `.jsx` module |
| Component implementation (HTML, CSS, props) | The `components/<name>/<name>.jsx` module in this repo | Storybook stories + standalone demo |
| Component behaviour rules (spec) | The `components/<name>/<name>-spec.md` file in this repo | Every downstream implementation |
| Overarching system rules | This document | Every component spec |

See `CLAUDE.md` §1 for the detailed governance rules agents follow.

---

## 2. Motion

Pathway motion follows a small, named scale. Components MUST use one of the documented durations (§2.1) and one of the documented easings (§2.2). Off-scale values are not allowed silently — if a component genuinely needs one, it goes in §2.3 as a contextual override with a one-sentence rationale.

This matches the industry-standard pattern for design system motion (Material 3, Carbon, Polaris): motion is a token family equal in weight to colour and typography. A small, well-documented scale beats infinite freedom.

### 2.1 Duration tokens

An ordered, numbered duration ladder, `--motion-duration-1` … `--motion-duration-8`. Components MUST use one of these tokens in CSS — never a hardcoded millisecond value. The ladder was derived from real component usage, so migrating onto it **preserves existing motion**: every prior hardcoded value lands on the nearest step (within ~30 ms, below the threshold of conscious perception for transition timing). The numbered scheme avoids semantic-name ordering conflicts and extends cleanly.

| Token | Value | Use for |
|---|---|---|
| `--motion-duration-1` | **100 ms** | Instant tap feedback, tiny opacity flickers |
| `--motion-duration-2` | **150 ms** | Hover fills, small opacity fades, colour transitions — the most common micro-interaction timing |
| `--motion-duration-3` | **200 ms** | Micro-interactions needing slightly more presence; small reveals, focus rings |
| `--motion-duration-4` | **300 ms** | Chevron / disclosure rotation, dropdown & popover content, in-component state |
| `--motion-duration-5` | **380 ms** | Panel state changes: accordions, expand/collapse, item enter/exit |
| `--motion-duration-6` | **460 ms** | Large physical-scale moves (e.g. SideNav width expand/collapse) |
| `--motion-duration-7` | **680 ms** | Cross-component transitions: page content sliding, large layout shifts |
| `--motion-duration-8` | **1100 ms** | Slowest transition step: very large layout shifts, deliberate full-screen moves |

**Off-scale durations require a §2.3 override entry.** If a component uses a value that isn't one of the eight steps and has no override row, that's a bug — align to the nearest step or open a spec PR to add the override. (Migration mapping: the former named steps are `instant`→`--motion-duration-3`, `short`→`--motion-duration-5`, `medium`→`--motion-duration-7`, `long`→`--motion-duration-8`.)

**Loop durations (continuous animations).** The numbered ladder above is for *one-shot transitions*. A spinner/shimmer is a continuous **loop** — a cycle *period*, a different motion concept — so loops use their own family, always paired with `--motion-easing-linear`:

| Token | Value | Use for |
|---|---|---|
| `--motion-duration-loop` | **1000 ms** | Standard continuous-loop period (standalone Spinner, skeleton shimmer) |
| `--motion-duration-loop-fast` | **750 ms** | Tighter loop for embedded/inline contexts (in-button spinner — faster reads as more responsive feedback) |

### 2.2 Easing tokens

Six canonical curves covering every Pathway motion. Use the named token in component CSS once tokens land (§2.5).

| Token | Curve | Use for |
|---|---|---|
| `--motion-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions — enters AND exits. Smooth, no overshoot. Default for colour, fill, opacity, focus rings. |
| `--motion-easing-spring` | `cubic-bezier(0.34, 1.04, 0.64, 1)` | **Signature Pathway curve.** Interactive element entrances: dropdown/popover panel opens. A whisper of overshoot (y2=1.04) — easeful, only *ever so slightly* alive. Softened 2026-06-08 from 1.08, which read as too bouncy. **Not for chevrons** — see chevron rule below. |
| `--motion-easing-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Enters where the element should glide in smoothly — overlay panels, popovers, anything appearing from outside. Pure ease-out, no bounce. |
| `--motion-easing-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Exits where the element leaves cleanly — dismissing overlays, scaling down. |
| `--motion-easing-emphasized` | `cubic-bezier(0.32, 0.72, 0, 1)` | Large physical-scale transitions: full-panel width changes, SideNav width. Smooth glide, no overshoot. |
| `--motion-easing-accordion` | `cubic-bezier(0.33, 1.03, 0.68, 1)` | Accordion settle — content reveal/hide, chevron rotation. The gentlest overshoot in the system (y2=1.03). Softened 2026-06-08 from 0.22,1.12,0.36,1, which was visibly bouncy. |
| `--motion-easing-linear` | `linear` | Continuous loops only (spinners, shimmer). Never for bounded transitions. |

**Bounce policy (2026-06-08):** Pathway motion is *easeful first, barely-bouncy second*. Overshoot (y2 > 1) is reserved for `spring` (1.04) and `accordion` (1.03) only, and never exceeds ~1.04. Anything that needs to feel substantial uses `emphasized`/`decelerate` (smooth, no overshoot) at a slightly longer duration — not a stronger bounce. A control-point y2 ≥ 1.08 anywhere in component CSS is now a bug.

**Chevron / disclosure-arrow rotation rule (2026-06-08):** Rotating chevrons (dropdowns, selects/inputs, org-switcher, module-switcher, accordion grouper triggers, anywhere a caret flips on open/close) use **`standard`** easing at **300 ms** — `transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1)`. No overshoot: a chevron that springs reads as an abrupt snap at small rotation distances. No `ease`/`ease-in-out` browser keywords, and nothing shorter than 300 ms (180–260 ms feels clipped and abrupt). The one exception is a chevron whose rotation is *visually coupled* to an accordion's height animation — it may match that animation's `accordion` duration/easing so the two finish together.

**Asymmetric enter/exit** (different curves per direction) is encouraged for overlays — typically `decelerate` on enter, `accelerate` on exit. See SideNav spec §16.6 for the reference pattern.

**Browser-default keywords are not in this scale.** `ease`, `ease-in`, `ease-out`, `ease-in-out` MUST NOT appear in component CSS. Use the named tokens above: `--motion-easing-decelerate` instead of `ease-out`, `--motion-easing-standard` instead of `ease`.

### 2.3 Component contextual overrides

Some components need values outside §2.1 or §2.2 because their physical scale or interaction semantics demand it. These are not exceptions — they are intentional contextual tokens, approved through the `/pathway:spec-review` process. Each override lives in its component's spec with a one-sentence rationale.

#### SideNav (approved 2026-05-12, revised 2026-05-19)

| Token | Duration | Easing | Standard | Rationale |
|---|---|---|---|---|
| `Motion/SideNav/Panel/Width` | **460 ms** | emphasized | short (380 ms) | Full-panel width transition; 300 ms reads as abrupt at this physical scale |
| `Motion/SideNav/Label/MaxWidth` | **440 ms** | emphasized | short (380 ms) | Label max-width must finish slightly ahead of panel width to prevent text flash |
| `Motion/SideNav/Accordion/Rows` | **420 ms** | accordion (spring) | short (380 ms) | Accordion expand/collapse and matching chevron rotation; 300 ms feels cut short, accordion easing gives the motion a satisfying land |
| `Motion/SideNav/Overlay/Enter` | **460 ms** | emphasized | short (380 ms) | Full-height panel entering viewport; 300 ms feels mechanical, 380 ms reads as deliberate |
| `Motion/SideNav/Overlay/Exit` | **380 ms** | standard | short (380 ms) | Exits are snappier than enters by design |

See SideNav spec §8.3 and §16.6 for implementation detail.

#### OrgSwitcher (approved 2026-05-19)

| Token | Duration | Easing | Standard | Rationale |
|---|---|---|---|---|
| `Motion/OrgSwitcher/Panel/Enter` | **280 ms** | spring | short (380 ms) | Small dropdown — 300 ms feels mechanical for a panel this size, 150 ms feels rushed |

See OrgSwitcher spec §Motion.

#### TopNav (approved 2026-05-19)

| Token | Duration | Easing | Standard | Rationale |
|---|---|---|---|---|
| `Motion/TopNav/Search/Expand` | **380 ms** | spring (softened) | short (380 ms) | Width expand from icon to 320px bar. Revised 2026-06-08: was 420 ms with an off-scale `0.34,1.2,0.64,1` curve that read as abrupt and bouncy. Now `short` duration + softened `spring` (y2=1.04) for an easeful glide with only a whisper of settle. |

See TopNav spec §Motion.

### 2.4 Reduced motion

`@media (prefers-reduced-motion: reduce)` is **mandatory** on every animated component. Skipping this rule is a WCAG 2.3.3 failure.

Under reduced motion:

- Transforms (slides, rotations, scales) are suppressed or replaced with opacity fades.
- Loops (spinners) stop rotating but remain visible as static glyphs — never hide them entirely.
- Durations shorten to **150 ms linear** maximum.
- If the component's meaning depends on motion, document an alternative cue (e.g. the spinner's uniform-opacity static glyph).

Minimum reduced-motion baseline in component CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Components MAY need additional reduced-motion handling (e.g. replacing a slide with a fade). Document any such fallback in the component spec's Motion section.

### 2.5 Token implementation status

Motion tokens are **live** in `src/tokens/tokens.css` and in the npm package (`dist/tokens.css`). They are sourced from `tokens/motion-tokens.json` — a hand-authored file that is never overwritten by Figma syncs.

**Components must now use `var(--motion-duration-*)` and `var(--motion-easing-*)` instead of hardcoded values.** Hardcoded millisecond values or cubic-bezier strings in component CSS are now a bug unless they are documented contextual overrides in §2.3.

**Figma Variables:** Motion tokens cannot be defined in Figma Variables (Figma does not support duration or cubicBezier types). `tokens/motion-tokens.json` is the permanent source of truth for motion token values. If a motion value needs to change, edit that file and run `npm run build-tokens`.

**Contextual overrides** (§2.3): component-specific durations and easings live in each component's spec. They are not yet emitted as separate CSS variables — components that need them still hardcode the override value with a comment referencing the spec.

---

## 3. Accessibility

### 3.1 Touch targets

Minimum **48 × 48 px** on every interactive element (WCAG 2.5.5). Bound to the semantic token `Accessibility/Touch Target/Optimal/Size`. Smaller targets are permitted only if (a) the element is not the primary interactive affordance and (b) the component spec explicitly annotates the reason.

### 3.2 Focus

Every focusable element must have a **visible focus ring** that is not `outline: none` without a replacement. Use `:focus-visible` (not `:focus`) to avoid painting on mouse click.

System default: `outline: 2px solid var(--semantic-color-light-mode-icon-action-primary-base); outline-offset: 2px;` (resolves to `#3555a0` / 2 px / 2 px offset in light mode).

### 3.3 Contrast

Non-text UI components: **3:1 minimum** (WCAG 1.4.11). Text: **4.5:1 minimum** at the default size (WCAG 1.4.3). Components must verify contrast for every text-on-background combination in §13.6 of their spec.

### 3.4 ARIA patterns

Prefer **native** semantic HTML elements (`<button>`, `<a>`, `<input>`) before ARIA roles. When native elements are insufficient, map to a **published** WAI-ARIA pattern — never invent a role. Common patterns in Pathway:

| Pattern | Used by |
|---|---|
| `role="tree"` + `role="treeitem"` | Hierarchical navigation (SideNav) |
| `role="status"` + `aria-live="polite"` | Indeterminate progress (Spinner) |
| `role="dialog"` + `aria-modal="true"` | Modals (future) |
| `role="tablist"` + `role="tab"` | Tabs (future) |

The component spec's §13.0 names which pattern is used; the Spec Review skill verifies the pattern exists and that the component's markup matches.

### 3.5 Screen reader announcements

Every state change the component triggers must have an intended screen-reader output. Document expected strings in the spec's §13.5 — approximate is fine ("Reports, current page, treeitem, 3 of 7") but must be specified.

---

## 4. Colour

### 4.1 Hierarchy

| Layer | Example | Consumers |
|---|---|---|
| Primitives | `Brand.300`, `Cool Neutral.150` | Aliased by semantics — **never** referenced directly by components |
| Static semantics | `Icon/Static/Neutral/Base` | Context-free; used by standalone components (Spinner) |
| Contextual semantics | `Icon/Contextual/NavItem/Base` | Bound to specific usage (NavItem, Button) |
| Action semantics | `Icon/Action/Primary/Base` | Interactive states — have matching Hover/Focused/Pressed/Disabled variants |

**Rules:**

1. Components resolve colour only through **semantic** tokens, never primitives, never raw hex. See `CLAUDE.md` §6.
2. Prefer **contextual** tokens for component-specific usage; fall back to **static** tokens only when no contextual family fits.
3. When adding a new component that needs a new contextual token family, add the tokens in Figma first, not in code.

### 4.2 Modes

Pathway is light-mode only right now. Dark-mode tokens are exported from Figma but filtered out of the sync (`CLAUDE.md` §2.1). Components target `--semantic-color-light-mode-*` variables explicitly; once dark-mode ships system-wide, components will switch to unprefixed variables in a coordinated migration.

---

## 5. Spacing & layout

### 5.1 Spacing & layout scale

Pathway has a semantic **layout-units** token family, generated from Figma alongside colour and emitted as `--semantic-layout-units-*` CSS variables. These resolve down to a primitive `--primitive-unit-unit-<n>` scale. Components should consume these tokens rather than raw px — never hard-code a spacing value that exists as a token.

| Family | CSS prefix | Steps |
|---|---|---|
| Padding | `--semantic-layout-units-padding-*` | `xxxtight → xxtight → xtight → tight → base → medium → relaxed → wide → xwide → xxwide → ginormous → collosal` |
| Gap | `--semantic-layout-units-gap-*` | `xxxtight → xxtight → xtight → tight → base → medium → relaxed → wide` |
| Corner radius | `--semantic-layout-units-cornerradius-*` | `xsmall → small → medium → large → full` |
| Border width | `--semantic-layout-units-borderwidth-*` | `xthin → thin → base → medium → thick → xthick → xxthick` |
| Touch target | `--semantic-layout-units-accessibility-touch-*` | min / optimal hit-area sizes |

> **Migration note:** the scale exists in the token pipeline, but several components still inline the px value while citing the token *name* in a comment (e.g. SideNav's `navPadH: 16 // Padding/Base`). Migrating those to `var(--semantic-layout-units-…)` is a low-priority cleanup; the values already match.

See `tokens/pathway-design-tokens.json` for exact resolved values.

### 5.2 Breakpoints

| Name | Width | Used for |
|---|---|---|
| Mobile | **≥ 393 px** | Phones |
| Tablet | **≥ 768 px** | Small tablets; layout switches from overlay to overlay-with-rail |
| Small Desktop | **≥ 1024 px** | Layout switches to push (in-flow sidebars) |
| Desktop | **≥ 1440 px** | Default design canvas |

Components describe responsive behaviour in their §15 (Responsiveness) section against these breakpoints. A component that needs a different breakpoint must document why.

### 5.3 Contextual layout tokens

Beyond the generic scale, Figma ships **contextual** layout-units families that pre-compose padding / gap / radius / border-width for specific surfaces, so a component doesn't re-derive them. Emitted as `--semantic-layout-units-contextual-<context>-*`:

| Context | CSS prefix | Covers |
|---|---|---|
| Card | `--semantic-layout-units-contextual-card-*` | padding (small/medium), gap, corner radius, border-width (base/thick) |
| Button | `--semantic-layout-units-contextual-button-*` | button padding, gap, radius |
| Nav item | `--semantic-layout-units-contextual-navitem-*` | nav-item padding / gap |
| Page | `--semantic-layout-units-contextual-page-*` | page margins / gutters |
| Section | `--semantic-layout-units-contextual-section-*` | section spacing |
| Toolbar | `--semantic-layout-units-contextual-toolbar-*` | toolbar dimensions |
| Focused element | `--semantic-layout-units-contextual-focused-*` | focus-ring geometry |

**Card family (resolved):**

| Token | Resolves to |
|---|---|
| `--semantic-layout-units-contextual-card-cornerradius-cornerradius` | `unit-8` (8px) |
| `--semantic-layout-units-contextual-card-gap-gap` | `unit-12` (12px) |
| `--semantic-layout-units-contextual-card-padding-small-*` | `unit-14` (14px) |
| `--semantic-layout-units-contextual-card-padding-medium-*` | `unit-16` (16px) |
| `--semantic-layout-units-contextual-card-border-width-base-base` | `borderwidth-xthin` |
| `--semantic-layout-units-contextual-card-border-width-thick-thick` | `borderwidth-thin` |

> **Card is layout-only — there is no contextual *colour* for cards.** The only `contextual` colour families are `navitem` and `focusring`. A card's **background** comes from a `surface/*` or `fill/static/*` token, its **border** from a `stroke/static/*` token; only its geometry (padding, gap, radius, border-width) comes from the `contextual/card` layout family. Do not reach for a `fill/contextual/card` token — it does not exist.

---

## 6. Typography

### 6.1 Families

| Family | Source | Used for |
|---|---|---|
| `Red Hat Text` | Google Fonts | All UI text (default) |
| `Red Hat Display` | Google Fonts | Headings only (H1–H3) |

Both loaded via `@import url('https://fonts.googleapis.com/css2?…&display=swap')`.

### 6.2 Scale

All type styles are bound to semantic tokens in the `Label/*`, `Heading/*`, or `Body/*` families. Raw `font-size` / `font-weight` / `line-height` values are not permitted in component CSS — reference the token bundle.

### 6.3 Weight

Pathway uses **400 (Regular)**, **500 (Medium)**, **600 (SemiBold)**. Italics and weights outside this range require an explicit exception in the component spec.

---

## 7. Iconography

### 7.0 Library — Material Symbols Rounded

**Every icon in Pathway uses Material Symbols Rounded.** No other icon library, icon set, or custom SVG is permitted for standard UI icons. This applies to every component, every HTML demo, every Storybook story, every spec illustration, and every prototype.

**Source of truth for available icons:**
- **GitHub repo:** `https://github.com/google/material-design-icons`
- **Interactive browser (set Style = Rounded):** `https://fonts.google.com/icons`

The folder name in the repo (e.g. `arrow_forward`, `check`, `close`) is the ligature string used in markup. Always verify the icon name against this repo before shipping.

### 7.1 Usage

```html
<!-- Correct — Rounded variant, ligature text content -->
<span class="material-symbols-rounded">arrow_forward</span>

<!-- Wrong — never use Outlined or Sharp -->
<span class="material-symbols-outlined">arrow_forward</span>
```

| Property | Value |
|---|---|
| Font family | `Material Symbols Rounded` |
| CSS class | `material-symbols-rounded` |
| Google Fonts CDN | `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200` |
| font-family in CSS | `'Material Symbols Rounded'` |
| Default variation settings | `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20` |

`opsz` (optical size) should match the rendered icon size: use `opsz: 20` for 14–20 px icons, `opsz: 24` for 21–28 px icons. Mismatched `opsz` causes slightly wrong stroke weight.

**`FILL` is per-component, not system-wide.** FILL=0 = outlined (hollow); FILL=1 = filled (solid). Always read the FILL value from the Figma component — do not assume a default. When writing a component spec or generating code, check the Figma design context to confirm which variant is used and document it explicitly in the component's iconography section.

### 7.2 Sizes

| Component size | Icon slot (wrapper) | **Icon size** | opsz |
|---|---|---|---|
| L | 26 × 26 px | **18 px** | 20 |
| M | 24 × 24 px | **16 px** | 20 |
| S | 20 × 20 px | **14 px** | 20 |

The slot wrapper (`<span>` / frame with explicit width/height) is the layout box and hit-area padding. The **icon size** is the number you set on the icon itself. E.g. the SideNav leading icon is a `16 px` icon inside a `24 × 24` wrapper (M).

#### The em-box model — read this before choosing a size

There are **three** boxes in the Figma icon, and only one of them is the size you implement:

| Figma layer | What it is | What you set in code |
|---|---|---|
| `Container.LeadingIcon` (e.g. 24 × 24) | the icon **slot / wrapper** — layout padding around the icon | the wrapper's width/height (24) |
| `Icon.Leading` frame (e.g. 16 × 16) | the icon's **em-box / design grid** — the sizing contract | **the icon size (16)** ✅ |
| the vector inside (e.g. ~12 × 12) | the **visible glyph**, inset by the grid's built-in ~2 px padding | **nothing — this is an output, never an input** |

> **GOLDEN RULE — size icons by the *frame*, never the *vector*.** The `Icon.Leading` frame size (16) is the number you implement, whether as a font `font-size` or an SVG `width`/`height`. Material Symbols are drawn to fill ~12 of a 16-unit grid; that ~2 px of padding is built into the glyph (it normalises wide and tall icons to one consistent box). Measuring the visible vector (~12) and implementing *that* re-applies the padding at a smaller scale and ships an icon that is too small. **The visible ~12 px is a consequence of asking for 16, not a size you request.**

#### 7.2.1 Icon-font implementations (Material Symbols web font — the default)

Set **`font-size` = the icon-frame size** from the table (16 px for M). The font's metrics reproduce the ~2 px padding automatically, so the visible glyph lands at ~12 px, centred in the 24 wrapper — a pixel match to Figma. Set `opsz` to track the rendered px (see §7.1). Never set `font-size` to the vector size.

#### 7.2.2 SVG implementations (teams on frameworks without the icon font)

Some teams cannot load the variable font and must ship exported SVGs. They match the font **only if they keep the design grid** — the trap is exporting the *cropped* vector.

1. **Export/keep the SVG on its full Material Symbols grid** — the downloaded SVG (from `fonts.google.com/icons` or the GitHub repo) already carries the padded grid, typically `viewBox="0 -960 960 960"` or `0 0 24 24`. **Do not crop, trim, or "fit to content."** The padding in the viewBox is the same padding the font's em-box carries.
2. **Render the SVG at the icon-frame size from the table** — the *same* number as `font-size`: `width="16" height="16"` for a SideNav leading icon (M). The viewBox stays the full grid; only the rendered size is 16. This produces the same ~12 px visible mark, centred identically in the 24 wrapper.
3. **Bake the axes in at export** — an SVG is a static snapshot, so pick **Rounded, weight 400, grade 0, optical size 20**, and the **correct `FILL`** for that component (read it from Figma — see §7.1) *before* downloading. You cannot change weight/fill on the SVG afterwards.
4. **Wrap it in the same slot** — center the SVG in the same 24 × 24 (M) wrapper the font version uses, so layout, padding, and hit-area are identical.

> **Do NOT hand an SVG team the trimmed 12 × 12 vector and tell them "use 12."** Two failures: (a) it ships too small once re-centred with its own bearing, and (b) each icon's cropped bounding box differs, so a set sized to a single "12" renders at inconsistent visual weights and widths. Always give them the **padded grid + the frame size (16)** — identical to what the font uses.

**One-line answer for a partner team:** *"Use the un-cropped Material Symbols SVG (keep its `0 0 24 24` / `0 -960 960 960` viewBox), render it at `width/height: 16px` (18 for L, 14 for S), Rounded / wght 400 / opsz 20 / FILL per the component, centred in a 24×24 wrapper."*

### 7.3 What is not allowed

- `material-symbols-outlined` or `Material Symbols Outlined` — if this class appears anywhere, it is a bug
- `material-symbols-sharp` or any Sharp variant
- Custom SVG files for any icon that exists in the Material Symbols Rounded library
- Icon font classes from Font Awesome, Heroicons, Phosphor, or any other icon library
- Emoji as icons

Branded assets that do not exist as Material Symbols (org logos, product-specific glyphs) must be delivered as `<img>` or inline SVG — never as an icon font.

### 7.4 CLAUDE.md cross-reference

See `CLAUDE.md §12` for the full iconography rules that agents must follow during code generation. The rules here and in `CLAUDE.md §12` are identical; `CLAUDE.md §12` is the agent-facing enforcement copy.

---

## 8. Naming

### 8.1 File & folder names

Lowercase kebab-case for component folders and files: `components/sidenav/sidenav.jsx`, never `SideNav.jsx` or `side_nav.jsx`. Storybook story folders use PascalCase (`src/stories/Library/SideNav/`) to avoid macOS APFS case-insensitivity collisions — see `CLAUDE.md` §4.

### 8.2 Token names

Lowercase with dots in JSON (`semantic-color.light-mode.icon.static.neutral.base`); style-dictionary emits hyphens for CSS (`--semantic-color-light-mode-icon-static-neutral-base`). Components consume the CSS variable form.

### 8.3 Component prop names

Camel-case: `activeId`, `onNavigate`, `hideCollapseButton`. Boolean props that represent visibility or state use verb-ish names (`isOpen`, `hideX`) — not ambiguous ones (`open`, `hidden`).

---

## 9. Documentation

Every component ships with:

1. A `-spec.md` following `docs/component-spec-template.md`
2. A `.jsx` React component module
3. A `.html` standalone demo
4. Storybook stories (`.stories.jsx`) with interactive controls
5. An MDX docs page (`.mdx`) following `docs/storybook-authoring.md`
6. A row in `components/manifest.json`

Skipping any of the six is grounds for the pipeline skill to refuse to proceed.

---

## 10. Human review

**Every skill in the Pathway pipeline requires explicit human review at every gate.** See `CLAUDE.md` §11. No skill auto-promotes a spec from `PENDING HUMAN REVIEW` to `REVIEWED`; no skill commits without user confirmation; no skill pushes without user confirmation. Claude can draft and recommend — humans decide.

---

## 11. Gaps & deferred decisions

| Gap | Priority | Notes |
|---|---|---|
| Motion tokens not in the token file | HIGH | Duration and easing are hardcoded in component CSS. Blocks cross-component consistency. |
| Spacing tokens not in the token file | MEDIUM | Raw px values in every spec. |
| Dark mode filtered from token sync | MEDIUM | By design, temporary. See `CLAUDE.md` §2.1. |
| No `icon.static.*` inverse track | MEDIUM | White spinners on brand-filled buttons have no matching semantic token. |
| No runtime theme-switching mechanism | MEDIUM | Dark/light mode switch is not implemented even though tokens for both exist. |
