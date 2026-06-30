# Spinner: Pathway Design System Component Spec

**Status:** `REVIEWED` (authored and reviewed by Jo Lopez, 2026-04-17)

Complete implementation reference for the Spinner component. Covers anatomy, the variant system, design tokens, motion, accessibility, usage guidance, and constraints. Use alongside the [Figma source](#figma-source) for a pixel-accurate build.

## Links

| Artefact | URL |
|---|---|
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006622-50003 |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-spinner--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/spinner/spinner.html |
| GitHub source | https://github.com/helloimjolopez-collab/pathway-ds/tree/main/components/spinner |

---

## 1. Component Overview

`Spinner` is an indeterminate progress indicator. It signals that a task is underway and that the user should wait, but it carries **no information about how long the task will take** and **no information about how close it is to finishing**. It is the right choice when the wait is short and the duration is unknown; it is the wrong choice for long, measurable operations (see §3 Decision Tree).

The component has a **single structural form** (a rotating sunburst built from a set of SVG paths) and a **variant system** (the `style` property) that selects which visual style is used. Today only one style exists, `progress-activity`, whose geometry is the 8-spoke sunburst drawn in the Figma source node. Additional styles (`bar`, `dots`, etc.) can be added later under the same `style` property without breaking the API.

Spinner is a **purely visual primitive**. It does not own the wait state, the label, or the network request. A consuming component is responsible for:

- Deciding **when** to show the spinner (request in flight, form submitting, etc.)
- Providing an accessible `label` that describes *what* is loading
- Setting `aria-busy="true"` on the surrounding region if appropriate
- Swapping the spinner out for the final content once the task completes

### Figma source

- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **Spinner component (progress-activity):** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/%E2%9D%87%EF%B8%8F--Pathway-Design-System--Master-File--MB-2.0-?node-id=40006622-50003)
- **Inner animated asset:** `progress-activity-animated` (node `40006622:50026`)

---

## 1.1 Governance: where things live

Use this table when you need to find or change something. Every row points to the single location that owns that decision.

| To change… | Owner | Where |
|---|---|---|
| Spinner SVG geometry (arc shape) | Figma: `progress-activity-animated` | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006622-50003) |
| Primitive or semantic token values (colours) | Figma: Variables panel | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) |
| Adding a new style value (e.g. `dots`) | Figma: add a new variant to the Spinner component | [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=40006622-50003) |
| Motion curve, duration, direction | This spec | §6 |
| Size contract (scaling rules) | This spec | §4 |
| Decision tree (when to use / when not to) | This spec | §3 |
| Accessibility requirements (role, labels, reduced motion) | This spec | §8 |
| Component API (props, CSS custom properties) | This spec | §5, §9 |
| Known design gaps | This spec | §11 |

**Rule:** if a decision isn't in the table above, check §11 (gaps). If it isn't there either, it hasn't been specified yet: add it to the spec before implementing.

---

## 2. Variant System

Spinner exposes a single variant property: **`style`**. It selects the visual treatment; everything else (size, colour, motion, accessibility) is the same across all styles.

### 2.1 Available values

| Value | Status | Description |
|---|---|---|
| `progress-activity` | ✅ Implemented | Classic 8-spoke sunburst: eight short line segments radiating from the centre at 45° intervals, with a staggered opacity ladder creating a "head + fading trail" read as the glyph rotates. The canonical Pathway indeterminate indicator. |

### 2.2 Default

`style` defaults to `"progress-activity"`. Consumers who don't care about which style is used can omit the prop and will always get the current Pathway default.

### 2.3 How to add a future style

When a new style is added (for example `dots` or `bar`), the change is:

1. **Figma:** Add a new variant to the Spinner component, author its geometry, and publish.
2. **Token mapping:** If the new style needs tokens that don't already exist (e.g. a stroke width for a `bar` variant), add them to the token file and document them in §7 of this spec.
3. **Spec:** Add a row to the §2.1 table and, if the new style has structural differences (multiple elements, different animation), add a §2.4 subsection describing them.
4. **Implementation:** Add the new value as a branch in the component's render — but keep every other part of the API identical (same `size`, `color`, `label` props, same `role="status"` wrapper, same reduced-motion handling).

A new style **must not** introduce size-specific variants, size props with limited values, or style-specific colour props. Those are properties of the Spinner as a whole, not of a given style.

### 2.4 What `style` does NOT do

- It does **not** control size. Size is a continuous value, not a variant. See §4.
- It does **not** control colour. Colour is a continuous value inherited from `currentColor`. See §7.1.
- It does **not** control whether the spinner animates. All styles animate by default and all styles respect `prefers-reduced-motion`. See §6.4.

---

## 3. When to Use / When Not to Use

### 3.1 When to use

Use a Spinner for **short, indeterminate waits** where:

- The task duration is unknown or highly variable
- The expected wait is roughly **1–10 seconds**
- The user's attention is already on the component that's loading (in-button, in-card, in-row)
- No percentage, step count, or meaningful status text is available

### 3.2 When not to use

Do **not** use a Spinner for:

| Scenario | Use instead |
|---|---|
| Progress is measurable (upload %, step 3 of 5) | `ProgressBar` (determinate) |
| Wait is expected to exceed ~10 seconds | Skeleton state, progress bar, or a status message with ETA |
| Nothing is actually in flight (resting idle state) | Nothing — remove the UI entirely |
| Page-level initial load of content | Skeleton of the final content shape (reduces perceived latency) |
| The trigger was a user action that could fail quickly (click a button and 50 ms later show a result) | Nothing — 50 ms is too short to show a spinner; flashing one in and out is worse than no feedback |
| Error, success, or empty state | `EmptyState`, status icon, or toast (spinners imply *still working*) |

### 3.3 Decision tree

```
  User initiates a task that will not complete in the next frame
      │
      ▼
  Is the task duration measurable (percent, step count)?
      │
      ├── Yes ──► Use ProgressBar (determinate)
      │
      ▼ No
  Is the expected wait longer than ~10 seconds?
      │
      ├── Yes ──► Use a skeleton of the target content, OR a
      │          determinate progress bar with status text
      │
      ▼ No
  Is the wait between ~300 ms and ~10 seconds?
      │
      ├── No  ──► Show no loader (too fast: flashing in/out is worse
      │          than nothing). Optimistically render the result.
      │
      ▼ Yes
  Is the spinner replacing something visible (button label, card
  contents), or is it the only thing the user is waiting on?
      │
      ▼
  Use Spinner with style="progress-activity".
  Provide a label that names the task ("Saving", "Loading report").
  Set aria-busy="true" on the container being replaced.
```

---

## 4. Size Contract

Spinner scales **fluidly** to any CSS length. There are **no fixed size variants** (no `size="sm|md|lg"`, no `--size-24` classes). One component, any size.

### 4.1 Inputs

Consumers set size in one of three equivalent ways:

1. **`size` prop**: any CSS length passed to the component (e.g. `size={24}`, `size="2rem"`, `size="50%"`). A bare number is treated as pixels.
2. **CSS custom property**: set `--pds-spinner-size` on the component or any ancestor. Useful for layout-level sizing without touching the component call site.
3. **`font-size` inheritance**: if neither of the above is set, the spinner is `1em`, which inherits from the nearest text context. Spinners dropped inline in running copy scale with the copy.

All three routes resolve to the same internal CSS variable (`--pds-spinner-size`), so mixing them (e.g. component passes a default, outer utility class overrides) follows normal CSS cascade rules.

### 4.2 Output

The SVG is drawn in a `12×12` viewBox (the Figma source unit) but rendered at `width: 100%; height: 100%` of its wrapper. Scaling is therefore vector-smooth at every size — no blur at large sizes, no clipping at small ones. The stroke width is authored in viewBox units (1 out of 12), so it scales proportionally with the overall size: at 24 px the strokes render at ~2 px; at 96 px they render at ~8 px. This proportional scaling is correct for the sunburst form — fixed-px strokes would look chunky at small sizes and hairline at large ones.

### 4.3 Recommended sizes

These are **recommendations**, not enforced variants. Pick whichever is appropriate to the context; the component does not care.

| Context | Recommended size |
|---|---|
| Inside body copy (inline) | `1em` (inherits) |
| Inside a small button or input | `16px` |
| Inside a standard button | `16–20px` |
| Card or row loading indicator | `24px` |
| Empty-state centrepiece in a card | `40–64px` |
| Page-level loader (rare — prefer skeletons) | `64–96px` |

### 4.4 Minimum and maximum

There is **no hard minimum** below which the spinner breaks, but below `12px` the rotation becomes hard to perceive and the shape flattens visually. Avoid sizes smaller than `12px` unless the context demands it (e.g. dense tables) and reduced-motion users are explicitly handled (see §8.4).

There is **no hard maximum**. At very large sizes (>128px) consider whether a spinner is still the right pattern — at that scale the user is probably looking at a full page load, which usually wants a skeleton instead (see §3.2).

---

## 5. Component Anatomy

```
Spinner (role="status", aria-live="polite", aria-label="{label}")
├── <svg> viewBox="0 0 12 12"                   ← the rotating element (animation lives here)
│   ├── <path d="M6 1V3"          opacity=1.00 >  ← 12 o'clock  — leading "head"
│   ├── <path d="M8.1 3.9L9.55 2.45" opacity=0.87 > ← 1:30
│   ├── <path d="M9 6H11"         opacity=0.75 >  ← 3 o'clock
│   ├── <path d="M8.1 8.1L9.55 9.55" opacity=0.62 > ← 4:30
│   ├── <path d="M6 9V11"         opacity=0.50 >  ← 6 o'clock
│   ├── <path d="M2.45 9.55L3.9 8.1" opacity=0.37 > ← 7:30
│   ├── <path d="M1 6H3"          opacity=0.25 >  ← 9 o'clock
│   └── <path d="M2.45 2.45L3.9 3.9" opacity=0.12 > ← 10:30 — fading "tail"
└── <span class="pds-spinner__sr-only">{label}</span>   ← visually-hidden copy of the label
```

All eight spokes share these stroke attributes (authored in Figma): `stroke: currentColor`, `stroke-width: 1`, `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none`. The coordinates above are **exact** — lifted verbatim from the Figma export (node `40006622:50026`, `progress-activity-animated`). Do not round, re-project, or "clean up" these numbers; the spokes are intentionally positioned at analytic 45° offsets from a centre of `(6, 6)` with an inner radius of `~1` and an outer radius of `~3` viewBox units.

### 5.1 Why the SVG rotates (not the spokes individually)

The `animation: spin var(--motion-duration-loop) var(--motion-easing-linear) infinite` declaration is applied to the `<svg>` element, not to each `<path>`. This keeps every spoke's coordinates static in the 12×12 space and means the SVG element is the single transform origin. Rotating each spoke individually would require setting transform-box and origin per path, and risks sub-pixel drift at small sizes — as well as multiplying the number of composited layers the browser has to keep.

### 5.2 Why the opacity ladder

Eight identical spokes at exactly 45° intervals are rotationally symmetric: rotating the SVG by any multiple of 45° returns to a visually identical frame. Under continuous rotation this would read as a static graphic (or, worse, would strobe at high frame rates). The staggered opacity (`1.00` → `0.87` → `0.75` → `0.62` → `0.50` → `0.37` → `0.25` → `0.12`) breaks the symmetry: one spoke is visibly brighter than its neighbours, so the rotation sweeps that "head" around the ring with a fading tail behind it. This is the classic iOS/macOS activity indicator pattern and is part of the component's structural design, not a theming choice. The opacity values are authored at component definition time; they do not animate.

### 5.3 Why `currentColor` on the spokes (and why it does NOT leak to arbitrary parents)

The spokes declare `stroke: currentColor`. `currentColor` resolves to the `color` property on the nearest ancestor that sets it. **Crucially, the nearest ancestor that sets `color` is the spinner wrapper itself** — `.pds-spinner[data-tone="…"][data-emphasis="…"]` sets `color` to the appropriate `--semantic-color-light-mode-icon-static-*` variable. So the stroke always resolves to the chosen semantic token, never to whatever `color` the surrounding button or paragraph happens to use. The `currentColor` mechanism here is an internal implementation detail, not a public inheritance path.

### 5.4 Why two labels

The wrapper has `aria-label="{label}"` **and** contains a visually-hidden `<span>` with the same text. Most screen readers announce the `aria-label`, but a small number of SR modes prefer in-DOM text. Providing both is a belt-and-braces fallback that costs nothing. The `<svg>` itself is marked `aria-hidden="true"` so it is not announced independently.

---

## 6. Motion Spec

Spinner motion is intentionally **boring**: one keyframe, one duration, one timing function, no easing, no pauses. The goal is that the user's peripheral vision reads "still working" the instant they glance at it.

### 6.1 Keyframe

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

### 6.2 Application

```css
.pds-spinner__svg {
  animation: spin var(--motion-duration-loop) var(--motion-easing-linear) infinite;
}
```

The declaration uses the loop-duration family from design-system-spec §2.1 — `--motion-duration-loop` (1000 ms) + `--motion-easing-linear`, not hardcoded values. Implementations must not change the duration, timing function, or iteration count without a spec amendment.

### 6.3 Properties

| Property | Value | Why |
|---|---|---|
| Duration | `--motion-duration-loop` (1000 ms) | Matches the Material Symbols convention the Pathway icon family derives from. Fast enough to read as "active", slow enough not to strobe. The standard continuous-loop period (the in-button spinner uses `--motion-duration-loop-fast` 750 ms for tighter feedback). |
| Timing function | `--motion-easing-linear` | A spinner is a continuous loop, not a bounded motion. Any ease would create perceivable acceleration/deceleration at every wrap and read as a UI glitch. |
| Iteration count | `infinite` | The spinner runs until the consumer unmounts it. Spinners do not stop on their own. |
| Direction | `normal` (clockwise) | Matches the Figma source. Reversing direction is not a supported variant. |
| Delay | `0s` | No fade-in. The spinner is shown at full opacity as soon as it mounts; the consumer controls when to mount it. |
| Fill mode | (default) | No fill mode needed — the spinner is either animating or unmounted. |

### 6.4 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .pds-spinner__svg { animation: none; }
  .pds-spinner__spoke { opacity: 0.6 !important; }
}
```

When the user requests reduced motion, the rotation is removed **and** the opacity ladder is flattened so every spoke shares the same 0.6 opacity. The flattening is important: if the staggered opacities were left in place without rotation, the static graphic would look like a paused animation (frozen "head at 12 o'clock, tail at 10:30"). Equal opacity across all eight spokes reads as a neutral indicator glyph instead — a recognisable "in progress" mark that has no implied direction of motion. The `role="status"` and `aria-label` are unaffected, so assistive tech announces the activity exactly the same way.

**Do not:**

- Hide the spinner entirely under reduced motion — that strips the "loading" signal from users who still want to know *that* something is happening, just not *watch* it happening.
- Keep the opacity ladder without the rotation — a static "head + tail" reads as a stalled spinner.
- Replace the static glyph with text like "Loading…" — the same label text is already being announced via `aria-label`.
- Slow the animation as a compromise — the reduced-motion media query is a binary contract.

---

## 7. Token Mappings

### 7.1 Colour

Spinner's colour API is **locked to the `icon.static.*` semantic family**. The component exposes a `tone` prop (which family) and an `emphasis` prop (how strong). The two together resolve to a single semantic token; the token resolves to a primitive; the primitive resolves to a hex. Consumers never see the primitive or the hex.

**Hard rules:**

1. The spinner accepts **only** semantic tokens from `icon.static.<tone>.<emphasis>`.
2. It does **not** accept raw hex, RGB, or named CSS colours (no `color="#3555a0"`, no `color="red"`).
3. It does **not** accept primitive tokens (no `color="brand.300"`, no `var(--primitive-color-brand-300)`).
4. It does **not** accept made-up token names (no `icon/semantic/success`, no `semantic.error` — those categories do not exist in `tokens/pathway-design-tokens.json`).
5. It does **not** use `currentColor` inheritance from arbitrary parents. The colour comes from the named token only.
6. There is no `color` prop. There never will be.

#### 7.1.1 Allowed `tone` values

Verified against `tokens/pathway-design-tokens.json` → `semantic.light-mode.color.icon.static`:

| `tone` | Semantic token family | Default-emphasis primitive (`base`) | Resolved hex |
|---|---|---|---|
| `neutral` *(default)* | `icon.static.neutral.*` | `cool-neutral.150` | `#4b4b4b` |
| `brand` | `icon.static.brand.*` | `brand.300` | `#3555a0` |
| `info` | `icon.static.info.*` | `brand.90` | `#5e7dc9` |
| `warning` | `icon.static.warning.*` | `saffron.80` | `#d3aa43` |
| `danger` | `icon.static.danger.*` | `orange.80` | `#e2601c` |
| `negative` | `icon.static.negative.*` | `red.100` | `#c84040` |
| `positive` | `icon.static.positive.*` | `green.70` | `#558f5c` |
| `accent-amethyst` | `icon.static.accent-amethyst.*` | `amethyst.80` | `#736baa` |
| `accent-jade` | `icon.static.accent-jade.*` | `accent-jade.80` | `#1a8e84` |
| `accent-seabreeze` | `icon.static.accent-seabreeze.*` | `seabreeze.60` | `#4ba8cb` |

> **Note on "accent":** there is no single `accent` tone in the token file; accent is split into three families (`accent-amethyst`, `accent-jade`, `accent-seabreeze`), each of which is a distinct semantic tone. The spinner exposes all three.

> **Note on warning and danger:** both exist in the token file. `danger` (orange) and `negative` (red) are distinct tokens; `warning` (saffron/yellow) is yet a third. If you are prompting the user to stop and look, use `warning`; if something is failing but recoverable, use `danger`; if something has already failed, use `negative`. The spinner accepts all three for completeness — most product uses will only ever need `neutral` or `brand`.

#### 7.1.2 Allowed `emphasis` values

Every tone family defines these five emphases, in ascending contrast order:

| `emphasis` | Notes |
|---|---|
| `light` | Faintest usable value; for spinners on strongly tinted surfaces of the same tone. |
| `subtle` | One notch darker than `light`. |
| `base` *(default)* | The standard value — start here. |
| `contrast` | For spinners sitting on light-tinted surfaces of the same tone where `base` would be too close in value. |
| `bold` | Heaviest value — use sparingly. |

#### 7.1.3 Resolution rule

```
  css-variable = --semantic-color-light-mode-icon-static-{tone}-{emphasis}
  token-path   = semantic.light-mode.color.icon.static.{tone}.{emphasis}
```

Examples:

| `tone` | `emphasis` | CSS variable | Token path |
|---|---|---|---|
| `neutral` | `base` *(defaults)* | `--semantic-color-light-mode-icon-static-neutral-base` | `icon.static.neutral.base` |
| `brand` | `bold` | `--semantic-color-light-mode-icon-static-brand-bold` | `icon.static.brand.bold` |
| `accent-jade` | `light` | `--semantic-color-light-mode-icon-static-accent-jade-light` | `icon.static.accent-jade.light` |

The Figma source node authors the spinner at `icon.static.neutral.base` (`#4b4b4b`). That is the correct default for a generic, context-free spinner.

#### 7.1.4 Dark mode

The token file also emits `--semantic-color-dark-mode-icon-static-*` for every combination. The V1 spinner CSS only binds the `light-mode` variables; dark-mode support is deferred until the design system settles on a runtime theme-switching mechanism. See §11 Gaps.

#### 7.1.5 What happens with an invalid value

If `tone` or `emphasis` is passed a value not in the enum:

- The component logs `console.error("[Spinner] Invalid tone …")` / `Invalid emphasis …`.
- The CSS attribute selector does not match any rule, so the spinner's `color` resolves to `unset` (inherits from the parent or defaults to browser black). This is an intentionally broken render — the spinner is meant to stand out in QA, not silently pick a "reasonable" fallback.

Do not add fuzzy matching, string coercion, or "did you mean" fallbacks. A typo in a token name is a bug; catching it at authoring time is the point.

### 7.2 Sizing

No sizing tokens exist or are needed. The size input is a CSS length chosen by the consumer (see §4).

> **⚠ Gap (LOW priority):** The recommended sizes in §4.3 are not currently surfaced as a named scale in the token system. Teams that want semantic spinner sizes can alias their own spacing scale. Adding a formal `Component/Spinner/Size/*` scale would make these semantic but is not a blocker for shipping.

### 7.3 Motion

The spinner loop is token-driven: `--motion-duration-loop` (1000ms) paired with `--motion-easing-linear` (continuous rotation, no easing). The in-button spinner uses the tighter `--motion-duration-loop-fast` (750ms).

> **✓ Resolved:** A motion token scale now exists. `docs/design-system-spec.md` §2 is the source of truth; `scripts/sync-motion-tokens.js` emits the `--motion-*` CSS variables (an 8-step duration ladder, a dedicated loop-duration family, and seven easings). Every component — including this spinner — now references those tokens rather than hard-coding durations or cubic-bezier curves.

### 7.2 Sizing

No sizing tokens exist or are needed. The size input is a CSS length chosen by the consumer (see §4).

> **⚠ Gap (LOW priority):** The recommended sizes in §4.3 are not currently surfaced as a named scale in the token system (unlike, say, `Accessibility/Touch Target/Optimal/Size = 48px` that the nav uses). Teams that want semantic spinner sizes can alias their own spacing scale (e.g. `--size-icon-s: 16px; <Spinner size="var(--size-icon-s)" />`). Adding a formal `Component/Spinner/Size/*` scale would make these semantic, but is not a blocker for shipping.

### 7.3 Motion

The spinner loop is token-driven: `--motion-duration-loop` (1000ms) paired with `--motion-easing-linear` (continuous rotation, no easing). The in-button spinner uses the tighter `--motion-duration-loop-fast` (750ms).

> **✓ Resolved:** A motion token scale now exists (see §7.3 above). The sidenav, button, and every other component now reference `--motion-*` tokens rather than hard-coding durations and cubic-bezier curves.

---

## 8. Accessibility

> **Legend used in this section:**
> - ✅ **Implemented**: present in the current reference demo (`spinner.html`)
> - 📋 **Required for production**: standard spec for this pattern, carry through into any consuming component

### 8.1 ARIA pattern

Spinner uses the **live-region status pattern**:

```html
<span role="status" aria-live="polite" aria-label="Loading">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="…"/>
  </svg>
  <span class="pds-spinner__sr-only">Loading</span>
</span>
```

| Attribute | Value | Why |
|---|---|---|
| `role="status"` | on the wrapper | Tells AT this region announces status updates. Equivalent to `aria-live="polite"` but with a well-known semantic. ✅ |
| `aria-live="polite"` | on the wrapper | Explicit announcement channel. `polite` (not `assertive`) because a spinner is not urgent — it should not interrupt the user's current announcement. ✅ |
| `aria-label="{label}"` | on the wrapper | The accessible name. Default `"Loading"`; consumers override with the task being performed (e.g. `"Saving report"`). ✅ |
| `aria-hidden="true"` | on the `<svg>` | Hides the graphic from AT so it is not announced as a separate unlabelled image. ✅ |
| `focusable="false"` | on the `<svg>` | IE11 compat — prevents the SVG becoming a tab stop in legacy browsers. Harmless in modern browsers. ✅ |

### 8.2 Visually-hidden label

The wrapper contains a `<span class="pds-spinner__sr-only">{label}</span>` that duplicates the `aria-label` text. The class implements the standard "visually hidden but screen-reader readable" pattern:

```css
.pds-spinner__sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

This is a belt-and-braces fallback: most screen readers read the `aria-label`, but a few configurations (VoiceOver + Safari in certain verbosity modes) prefer in-DOM text. Including both costs one hidden `<span>` and covers all cases.

### 8.3 Labels — required, not optional

Every Spinner instance in production code **must** have a meaningful label. `"Loading"` is a last-resort default; it is acceptable for a generic page-level loader but not for in-context spinners.

| Instance | Good label | Bad label |
|---|---|---|
| Submit button spinner | `"Saving"`, `"Submitting form"` | `"Loading"` (what's loading?) |
| Report card spinner | `"Loading report"` | `"Spinner"` (describes the UI, not the task) |
| Inline in body copy | `"Syncing"` | *(no label)* |
| Full-page load | `"Loading page"` | *(no label)* |

### 8.4 Reduced motion

See §6.4. The rotation is removed under `prefers-reduced-motion: reduce`; the static arc and the status announcement remain.

### 8.5 `aria-busy` on the surrounding region

Spinner itself does not set `aria-busy`. That attribute is owned by the region whose content is loading — a button, a card, a form. Consumers should set `aria-busy="true"` on that region while the spinner is visible and remove it (or set `"false"`) when content is ready.

```html
<button type="button" aria-busy="true" disabled>
  <Spinner size="16" color="#fff" label="Saving" />
  Saving…
</button>
```

### 8.6 Focus

Spinner is not focusable. It has no interactive behaviour. The consumer should ensure focus is managed on the surrounding interactive element (typically the button that triggered the wait stays focused and disabled).

### 8.7 Colour contrast

Spinner is a non-text UI component. WCAG 1.4.11 requires a `3:1` ratio between the spinner paint and its background. Using `Icon/Action/Primary/Base` (`#3555a0`) on `Surface/Canvas/Light` (`#fafafa`) gives `~6.5:1` — comfortably passing. Consumers placing the spinner on a coloured surface (brand-filled button, dark background, coloured card) must verify contrast against the specific background.

### 8.8 Screen reader announcements

Approximate strings; exact wording varies by screen reader and browser.

| Scenario | Expected announcement |
|---|---|
| Spinner appears with default label | *"Loading"* |
| Spinner appears with custom label | *"Saving report"* |
| Spinner is unmounted (task complete) | *(nothing — the region simply stops announcing)* |
| Spinner in a region with `aria-busy="true"` | *"busy, Saving"* — the busy state is a separate announcement from the status |

---

## 9. HTML Usage Examples

The full spoke markup is repetitive. For brevity the examples below abbreviate the eight `<path>` elements as `<!-- 8 spokes -->`; the real markup is shown once, in §9.1.

### 9.1 Full markup — all eight spokes

Inherits size from the surrounding font-size (`1em`), inherits colour from the parent's `color`, and uses the default `"Loading"` label.

```html
<span class="pds-spinner" role="status" aria-live="polite" aria-label="Loading">
  <svg class="pds-spinner__svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false"
       xmlns="http://www.w3.org/2000/svg">
    <path class="pds-spinner__spoke" d="M6 1V3"            opacity="1.00"/>
    <path class="pds-spinner__spoke" d="M8.1 3.9L9.55 2.45"  opacity="0.87"/>
    <path class="pds-spinner__spoke" d="M9 6H11"           opacity="0.75"/>
    <path class="pds-spinner__spoke" d="M8.1 8.1L9.55 9.55"  opacity="0.62"/>
    <path class="pds-spinner__spoke" d="M6 9V11"           opacity="0.50"/>
    <path class="pds-spinner__spoke" d="M2.45 9.55L3.9 8.1"  opacity="0.37"/>
    <path class="pds-spinner__spoke" d="M1 6H3"            opacity="0.25"/>
    <path class="pds-spinner__spoke" d="M2.45 2.45L3.9 3.9"  opacity="0.12"/>
  </svg>
  <span class="pds-spinner__sr-only">Loading</span>
</span>
```

### 9.2 Explicit tone + emphasis + size

```html
<span class="pds-spinner"
      data-tone="brand" data-emphasis="base"
      role="status" aria-live="polite" aria-label="Loading report"
      style="--pds-spinner-size: 32px">
  <svg class="pds-spinner__svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <!-- 8 spokes -->
  </svg>
  <span class="pds-spinner__sr-only">Loading report</span>
</span>
```

The `data-tone`/`data-emphasis` attributes are what CSS uses to resolve the correct `--semantic-color-light-mode-icon-static-{tone}-{emphasis}` variable. The consuming app does not pick a hex; it picks a tone.

### 9.3 Inside a button

```html
<button type="button" class="btn btn--primary" aria-busy="true" disabled>
  <span class="pds-spinner"
        data-tone="neutral" data-emphasis="light"
        role="status" aria-live="polite" aria-label="Saving"
        style="--pds-spinner-size: 16px">
    <svg class="pds-spinner__svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <!-- 8 spokes -->
    </svg>
    <span class="pds-spinner__sr-only">Saving</span>
  </span>
  Saving…
</button>
```

> **⚠ Gap:** A brand-filled primary button wants a white spinner, but `icon.static.*` has no inverse track — the closest match is `neutral.light` (`#7b7b7b`). This is a known gap; see §11. Until an inverse track is added, either (a) use `neutral.light` and accept the lower contrast, or (b) use a different loading pattern (disabled button with a text-only "Saving…" label).

### 9.4 Inline in running copy

```html
<p style="font-size: 16px; color: #051428;">
  Syncing your data
  <span class="pds-spinner"
        data-tone="brand" data-emphasis="base"
        role="status" aria-live="polite" aria-label="Syncing">
    <svg class="pds-spinner__svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <!-- 8 spokes -->
    </svg>
    <span class="pds-spinner__sr-only">Syncing</span>
  </span>
  please don't close this tab.
</p>
```

Size (`1em` = 16px) is inherited from the paragraph's font-size. The paragraph's `color` is **not** used by the spinner — the spinner is painted by `icon.static.brand.base` regardless of what colour the surrounding text is.

### 9.5 Explicit variant via `style` prop (forward-compat)

```html
<!-- Today `style="progress-activity"` is the only valid value and also the default. -->
<Spinner style="progress-activity" size="24" tone="brand" emphasis="base" label="Loading" />
```

---

## 10. Constraints

Hard rules. Breaking any of these breaks the component's contract.

1. **No size variants.** Do not add `size="sm|md|lg"` props, do not add CSS classes that hard-code a size, do not create separate `SpinnerSmall`/`SpinnerLarge` components. The component scales fluidly via one CSS custom property.

2. **No motion variants.** All styles animate at `1s linear infinite`. Do not expose a `speed` prop, a `paused` prop, or a "slow" variant. If a use case seems to need a slower spinner, the use case actually needs a different component (progress bar, skeleton, static icon).

3. **No `style` prop for visual overrides.** The `style` prop on this component is the variant selector (`progress-activity`, etc.) — **not** the HTML `style` attribute. Do not repurpose it for inline CSS. If a consumer wants to style the spinner, they use `color`, the `size` prop, or a wrapping element. In raw HTML usage, the component's root is still a regular element and accepts a regular `style` attribute, but the component API does not expose one.

4. **No `pause on hover`.** The spinner runs until unmounted. Pausing on hover implies the animation is decorative; it isn't — it is the affordance that communicates "still working".

5. **No fade-in.** The spinner appears at full opacity when mounted. Any entrance animation (opacity fade, scale-in) delays the user's understanding that something is happening. The consumer controls *when* to mount the spinner; that is the only timing concern.

6. **No text baked into the SVG.** The label lives in `aria-label` and the visually-hidden span, not inside the graphic. This keeps the SVG infinitely resizable and keeps translations simple.

7. **SVG must be inline.** Do not source the spinner from an external `.svg` file via `<img>` or `background-image`. External images cannot use `currentColor`, cannot be animated via CSS on the path, and add a network round-trip for a handful of bytes of markup.

8. **Exactly eight spokes (for `progress-activity`).** The `progress-activity` style is eight `<path>` elements inside one `<svg>` with a `12×12` viewBox. Do not add a background ring, do not add a centre dot, do not change the spoke count, do not animate the opacities individually, do not swap strokes for fills. The opacity ladder (`1.00` → `0.12`) is the structural part of the design, not a theme — keep it exactly as authored. Other styles (future) may have different structure, but `progress-activity` is fixed.

9. **Reduced motion is mandatory, not optional.** Every build must ship the `@media (prefers-reduced-motion: reduce)` rule from §6.4. Skipping it is a WCAG 2.3.3 failure.

10. **Label is mandatory in production.** `label` has a default of `"Loading"` for developer ergonomics during prototyping, but production code must pass a task-specific label (see §8.3).

---

## 11. Gaps and Deferred Decisions

| Gap | Priority | Notes |
|---|---|---|
| No `motion` tokens in `pathway-design-tokens.json` | MEDIUM | Duration (`1s`) and easing (`linear`) are hard-coded. Recommend adding a motion token category (see §7.3). Blocks cross-component consistency, not this component's ship. |
| No `icon.static.*` inverse track | MEDIUM | Spinners sitting on dark/brand-filled surfaces (primary buttons, brand banners) have no matching semantic token — the closest is `neutral.light` (`#7b7b7b`). Recommend adding an inverse track or a dedicated `icon.static.on-brand.*` family. See §9.3. |
| No dark-mode runtime switch | MEDIUM | The token file emits `dark-mode` variables but no theme-switching mechanism exists yet. Spinner binds `light-mode` only. Revisit when the broader DS picks a theme-switching strategy (`[data-theme="dark"]`, `prefers-color-scheme`, …). |
| No semantic `Component/Spinner/Size/*` scale | LOW | Sizes in §4.3 are advisory only. Adding named sizes would let teams reference `var(--component-spinner-size-s)` etc. Not a blocker. |
| Only one `style` value exists | LOW | `progress-activity` is the only style today. Add more only when a real use case appears — don't speculate. |
| No determinate-progress companion | MEDIUM | This spec covers indeterminate progress only. A `ProgressBar` spec (determinate) is out of scope here and should be authored separately when the component is introduced. |

---

## 12. Storybook

> **Note for the team:** this component should be added to Storybook once component stories are being introduced. Right now the repo's Storybook build contains tokens only — no component stories have been authored yet. When that work begins, Spinner is a good first candidate: it has a single narrow API surface (`style`, `size`, `color`, `label`), a clean set of story permutations (default, in-button, inline, reduced-motion, custom colour, large/small), and no external dependencies. The `spinner.html` demo in this repo can be lifted almost directly into stories.
