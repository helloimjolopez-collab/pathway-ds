# Scrollable (Scrollbar) — Pathway Design System Component Spec

**Status:** `REVIEWED`

The canonical, reusable overlay scrollbar for Pathway. `<Scrollable>` wraps any internal scroll region, hides the native OS scrollbar, and draws one slim, liquid-glass thumb so scrolling looks and behaves **identically on macOS, Windows, iOS, and Android** and never takes layout width or shifts padding. It is a **system-wide primitive** — every internal scroll surface (SideNav, dropdown/popover panels, dialogs, long lists) uses it instead of the native browser scrollbar.

## Links

| Artefact | URL |
|---|---|
| **Figma** | **None — by design** (code-only primitive; see §1.2). There is no Figma node and never will be. |
| Storybook | [Library/Scrollbar](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-scrollbar--docs) |
| HTML demo | [components/scrollbar/scrollbar.html](https://helloimjolopez-collab.github.io/pathway-ds/components/scrollbar/scrollbar.html) |
| React module | [components/scrollbar/scrollbar.jsx](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/scrollbar/scrollbar.jsx) |
| System-wide doc | [docs/scrollbar-spec.md](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/docs/scrollbar-spec.md) (cross-component adoption + rationale) |

---

## Authorship

Design (Jo Lopez) owns and signs off on: Status, Purpose, States, Token reference, Accessibility intent, Usage rules.
Engineering owns and signs off on: prop types, the native-scrollbar-hide implementation, browser-specific backdrop-filter behaviour.
Neither party signs off on the other's section.

---

## 1. Component Overview

### 1.1 What it is / what it isn't

`<Scrollable>` is a wrapper that gives any overflowing region **one consistent overlay scrollbar**. The native bar is hidden; a custom thumb is drawn over the content's right edge. The content still scrolls natively (wheel, keyboard, touch, drag) — only the *visible* bar is custom.

- **It is:** the standard way to make an internal region scroll in Pathway.
- **It is not:** a layout primitive, a virtualized list, or a horizontal-scroll widget (vertical only in v1). It does not own the content's padding — see §8.

### 1.2 Why there is no Figma (and why that's correct)

Every other Pathway component has a Figma source of truth. The scrollbar deliberately does not, and that is **the right call, not an omission**:

> **IMPLEMENTATION RULE: the scrollbar is a code-only primitive.**
> Its entire job is runtime behaviour — hide the OS bar, draw an overlay thumb, refract content through a backdrop blur, fade on activity, hug the edge, auto-size to the scroll ratio. None of that is a static visual a Figma frame can hold, and it has no variants or design properties to bind. Its source of truth is **this spec + `components/scrollbar/scrollbar.jsx`**. The token-reconciliation flow in `CLAUDE.md §3.4` (which keys off a per-component Figma node) does not apply here — there is intentionally nothing to reconcile against.

### 1.3 Why it exists at all

Native scrollbars **cannot** be made consistent across platforms, and styling them is a losing game:

- **Windows (Chromium/Edge)** renders a chunky, space-**taking** bar with corner/track boxes. CSS can thin it but cannot make it overlay, so it shifts content and changes padding.
- **macOS** uses a thin overlay bar (no space taken) — already different from Windows.
- **Firefox** exposes only `scrollbar-width` / `scrollbar-color` (no px control, no overlay).
- **iOS / Android** use auto-hiding overlay bars that are not reliably stylable.

Pathway hides the native bar entirely and draws its own thumb. That is the only way to get one elegant, semitransparent, overlay scrollbar that is identical everywhere and never affects layout.

---

## 2. Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Thumb appearance, behaviour, motion | Design + Eng | This spec §6, §8, §11 + `scrollbar.jsx` `SCROLL` constants |
| Token bindings (colour, units) | Design | §6 of this spec + the semantic tokens in Figma's variable collection |
| Component API / prop types | Engineering | §4 of this spec |
| The native-scrollbar-hide rule | Engineering | `scrollbar.jsx` injected `<style id="pds-scrollable-base">` |
| System-wide adoption guidance | Design | [docs/scrollbar-spec.md](../../docs/scrollbar-spec.md) |
| Figma | — | N/A — no Figma node (see §1.2) |

---

## 3. Anatomy

```
div.pds-scrollable                      position: relative   (the positioning context)
├── div.pds-scrollable__view            overflow-y: auto; native bar hidden; holds content padding
│   └── {children}                      the tall content
└── div[aria-hidden="true"]             the custom thumb — position: absolute; overlay only
                                        width 6px · fully-rounded · liquid-glass · 0 layout width
```

The native scrollbar is hidden once, globally, by a single injected stylesheet (`<style id="pds-scrollable-base">`) scoped to `.pds-scrollable__view` (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`). Scrollbars cannot be hidden via inline React styles, so this one rule is the only global the component relies on; it never touches scrollbars outside that class.

---

## 4. API / Variant structure

`<Scrollable>` has **no visual variants** — it is one component with runtime states (§5). Its surface is its props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | node | — | The scrollable content. |
| `style` | object | `{}` | Style for the wrapper (the positioning context). Use `flex:1; minHeight:0` inside a flex column so it fills and can scroll. |
| `viewStyle` | object | `{}` | Style for the inner scroll view — **put the content's padding/layout here**, not on the wrapper (see §8). |
| `className` | string | `""` | Extra class on the wrapper. |
| `viewClassName` | string | `""` | Extra class on the inner scroll view. |

```jsx
import { Scrollable } from "components/scrollbar/scrollbar.jsx";

<Scrollable style={{ flex: 1, minHeight: 0 }}>
  …tall content…
</Scrollable>
```

The `SCROLL` object (also exported) carries the tuning constants in §6 so consumers never hardcode them.

---

## 5. State matrix

The thumb has runtime states only (no design-time variants). All are driven by user activity, not props.

| State | When | Thumb |
|---|---|---|
| **Hidden** | idle, or content fits (no overflow) | `opacity: 0`, `pointer-events: none` |
| **Revealed** | **while scrolling**, or when the **mouse is within ~16 px of the right edge** (so it can be grabbed) | fades in at `scrim/faint` |
| **Hot** | mouse over the grab strip, or dragging | colour steps up to `scrim/light` |
| **Fading out** | ~900 ms after scrolling stops / the mouse leaves the bar (and not dragging) | fades to hidden |

> **IMPLEMENTATION RULE: reveal is scroll + edge-proximity, NOT panel hover.** Hovering the body of the panel does **not** show the thumb — it appears while you scroll, and when the cursor approaches the right-edge bar. (This is the standard overlay-scrollbar behaviour and fixes the earlier "shows on any hover" bug.)
> **IMPLEMENTATION RULE: the thumb never appears when there's nothing to scroll.** If `scrollHeight ≤ clientHeight`, it is not rendered at all.

---

## 6. Design Tokens

Every colour and unit resolves through a **semantic** Pathway token (in `SCROLL`, exported from `scrollbar.jsx`) — no primitives, no hardcoded hex/px. Colour uses the `scrim` overlay family; geometry uses the semantic `layout-units` tokens.

| Constant | Semantic token | Resolved | Usage |
|---|---|---|---|
| `thumbWidth` | `--semantic-layout-units-padding-xtight` | 6 px | thumb thickness |
| `thumbRadius` | `--semantic-layout-units-cornerradius-full` | pill | fully rounded ends |
| `thumbMin` | — *(numeric)* | 28 px | minimum thumb length, used in JS layout math (no semantic step exists between `gap-relaxed` 24 and `gap-wide` 36) |
| `gutter` | `--semantic-layout-units-padding-xxxtight` | 2 px | inset from the right edge |
| `grabZone` | — *(numeric)* | 16 px | invisible **mouse** grab strip width — the 6px thumb alone is too thin to catch; also the edge-proximity reveal distance |
| `thumbRest` | `--semantic-color-light-mode-scrim-faint` | `rgba(17,17,17,0.16)` | resting overlay (black 16%) |
| `thumbHover` | `--semantic-color-light-mode-scrim-light` | `rgba(17,17,17,0.30)` | hover / drag overlay (black 30%) |
| `thumbEdge` | `--semantic-color-light-mode-fill-static-neutral-light` @ 35% (via `color-mix`) | white, 35% | hairline glass edge highlight |
| `thumbBlur` | — *(effect, not a colour)* | `blur(8px) saturate(180%)` | backdrop-filter — the "glass" that refracts content beneath |
| `fadeIn` | `--motion-duration-3` + `--motion-easing-decelerate` | 200 ms glide-in | appear transition — snappy, responsive |
| `fadeOut` | `--motion-duration-5` + `--motion-easing-standard` | 380 ms | disappear transition — graceful, clearly a fade (not an abrupt cut) |
| `idleHideMs` | — *(numeric)* | 500 ms | hide delay after scrolling stops / mouse leaves the bar (a timeout, not a transition) |

> **Mode-aware:** `scrim/faint` resolves to **black 16%** in light mode (a faint dark sliver on light surfaces) and **white 16%** in dark mode, so the thumb stays visible against either surface with no component change. `scrim/faint` was added specifically for faint overlay controls — it sits below the existing `light`/`subtle`/`base` scrim steps.

---

## 7. Layout & spacing

| Value | Used for | px | Token |
|---|---|---|---|
| Thumb width | thumb thickness | 6 | `layout.units.padding.xtight` |
| Gutter | inset from the wrapper's right edge | 2 | `layout.units.padding.xxxtight` |
| Grab strip width | invisible mouse-drag target around the thumb | 16 | none (JS constant) |
| Min thumb length | shortest the thumb shrinks to | 28 | none (JS constant) |
| Thumb radius | fully-rounded pill | — | `layout.units.cornerradius.full` |

### 7.1 Sizing / proportionality

The thumb's **height represents the visible fraction of the content** — the standard scrollbar proportionality. The track is the full visible height of the scroll region (`clientHeight`):

```
thumbHeight = max(28px, (clientHeight / scrollHeight) × clientHeight)
                         └── visible ÷ total ──┘   └─ track ─┘
```

- **More content → shorter thumb; barely overflowing → near-full-height thumb.** Content 2× the viewport → thumb ≈ half the track; 5× → ≈ a fifth.
- **28 px floor:** on very long lists the proportional height would shrink to an ungrabbable sliver, so it's clamped to 28 px. When clamped, the **position** mapping compensates so the thumb still travels exactly top-to-bottom: `top = (scrollTop / (scrollHeight − clientHeight)) × (clientHeight − thumbHeight)`.
- **Recomputed** on content change and container resize (`ResizeObserver`) — collapsing the SideNav rail, adding nav items, or resizing the window all re-fit the thumb.

---

## 8. Behaviour & interaction

- **Overlay, never layout-affecting.** The thumb is absolutely positioned over the content's right edge. It takes **zero** layout width — never pushes content, changes padding, or resizes the container, in any state or at any breakpoint.
- **Always hugs the right edge.** The thumb sits `gutter` (2 px) from the right edge of the `<Scrollable>` wrapper, in every state, at every breakpoint, on any scroll surface. For it to land on the *visible* edge, the wrapper must reach that edge.
- **Liquid glass.** Barely-tinted thumb + `backdrop-filter: blur(8px) saturate(180%)` so it refracts the content beneath it rather than sitting opaquely on top, plus a 0.5 px white inner highlight for the glass edge. No track, no arrows, no corner boxes.
- **Reveal on activity** (see §5 / §11).
- **Draggable** with the pointer; the underlying content also responds to wheel, keyboard, and touch scroll natively.
- **Auto-sizing** to the viewport/content ratio.

> **IMPLEMENTATION RULE: content padding goes on `viewStyle`, never on an outer wrapper.**
> If a consumer wraps `<Scrollable>` in a padded container, the thumb floats inward by that padding. The SideNav rail hit exactly this: the nav's 12 px `border-box` right padding pushed the thumb ~14 px in on the 72 px rail. The fix is to bleed the scroll region out to the real edge and re-add the inset inside the view:
> ```jsx
> <Scrollable
>   style={{ flex: 1, minHeight: 0, marginRight: -pad }}   // bleed to the true right edge
>   viewStyle={{ paddingRight: pad }}                       // keep content inset inside the view
> >
> ```
> The thumb then hugs the edge while the content keeps its padding — in both expanded and collapsed states.

---

## 9. Iconography

**None.** The scrollbar uses no icons — the thumb is a plain rounded rectangle. (Listed for parity with the canonical spec structure.)

---

## 10. Accessibility

- The underlying content scrolls **natively**, so keyboard scrolling (arrows, Page Up/Down, Home/End, Space), focus order, and screen-reader behaviour are completely unchanged.
- The thumb is **decorative**: `aria-hidden="true"`. It is a visual affordance, never the scroll mechanism — there is no scenario where a user must operate the custom thumb to scroll.
- **No focus trap, no tab stop** introduced — the wrapper adds no interactive element to the tab order.
- **Reduced motion:** reduced-motion users still get the bar; only the fade transition is cosmetic and may be shortened/removed. Scrolling and visibility are unaffected.
- **Contrast:** the thumb is a non-essential decorative indicator (not text or a meaningful graphic), so WCAG 1.4.11 non-text-contrast does not gate it; the native scroll affordance remains the accessible mechanism.

---

## 11. Motion

All motion resolves through `--motion-*` tokens (durations/easings from `design-system-spec.md §2`) — no hardcoded ms/curves. The fade is **asymmetric**: snappy in, graceful out.

| Property | Token | Value | Why |
|---|---|---|---|
| Fade **in** (appear) | `--motion-duration-3` + `--motion-easing-decelerate` | 200 ms, ease-out glide | responsive — the bar is there the moment you scroll |
| Fade **out** (disappear) | `--motion-duration-5` + `--motion-easing-standard` | 380 ms, smooth | a clearly visible graceful fade, never an abrupt cut |
| Colour (rest ↔ hover) | `--motion-duration-3` + `--motion-easing-standard` | 200 ms | rest → hover/drag colour step |
| Idle hide delay | — *(timeout)* | 500 ms | short pause after you stop scrolling / leave the bar, then it fades |
| Reduced motion | — | fade removed; visibility logic unchanged | `prefers-reduced-motion: reduce` |

Opacity fades use the **standard / decelerate** easings (per the design-system-spec rule that opacity uses `standard`), not the spring curve — overshoot on opacity would clamp and read oddly.

---

## 12. Responsiveness

The scrollbar is **breakpoint-agnostic** — it behaves identically at Mobile (393), Tablet (768), Small Desktop (1024) and Desktop (1440), because it never participates in layout:

- The overlay thumb adds **0** width at every breakpoint, so a region's padding and alignment are identical whether or not it overflows (unlike a native Windows bar, which would shift content inward by ~15 px).
- It works in both **expanded and collapsed** consumers — e.g. the SideNav's 240 px expanded menu **and** its 72 px collapsed rail (the thumb hugs the rail's true right edge in both).
- **Mode-aware colour** (§6): the same component is correct in light and dark mode with no breakpoint-specific or mode-specific code.

---

## 13. HTML / usage examples

**Minimal — fill a flex column and scroll:**
```jsx
<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
  <Header />
  <Scrollable style={{ flex: 1, minHeight: 0 }}>
    <LongContent />
  </Scrollable>
</div>
```

**In context — SideNav menu (padding inside the view, region bled to the edge):**
```jsx
<Scrollable
  style={{ flex: 1, minHeight: 0, marginRight: collapsed ? -L.navColPadH : -L.navPadH }}
  viewStyle={{ display: "flex", flexDirection: "column", gap: L.menuGap,
    paddingTop: L.menuPadT, paddingRight: collapsed ? L.navColPadH : L.navPadH }}
>
  {navItems}
</Scrollable>
```

---

## 14. Constraints

Hard rules:

1. **Never use a raw native scrollbar for an internal scroll region.** Use `<Scrollable>`. Native bars differ per OS and shift content on Windows.
2. **Content padding belongs on `viewStyle`, never on an outer wrapper** (§8) — otherwise the thumb floats off the edge.
3. **The wrapper must be allowed to size to its container** (`minHeight: 0` inside a flex column) so the inner view can overflow.
4. **The thumb is decorative and `aria-hidden`** — native scrolling must always work underneath; never make the thumb the only scroll mechanism.
5. **`SCROLL` constants are the contract** — width, gutter, colours, and timings are shared system-wide; don't override them per consumer.
6. **Colour resolves through semantic tokens only** — no primitives, no raw hex (§6).
7. **Vertical only** in v1 — no horizontal custom thumb yet (see §15).

---

## 15. Gaps

| Gap | Priority | Notes |
|---|---|---|
| Horizontal scrollbar | LOW | v1 is vertical-only (`overflow-x: hidden` on the view). A horizontal thumb would be a future addition with the same token/behaviour model. |
| `backdrop-filter` fallback | LOW | Browsers without `backdrop-filter` show the flat tint only (no refraction) — graceful, still visible. No action needed. |
| Contrast in dark mode | LOW | `scrim/faint` resolves to white 16% in dark mode; visually verified on the brand-navy nav surface; revisit if a much lighter dark surface is introduced. |

---

## 16. Storybook

- **Docs page:** [Library/Scrollbar](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-scrollbar--docs) — `src/stories/Library/Scrollbar/Scrollbar.mdx`.
- **Stories:** `Scrollbar.stories.jsx` — `Playground` and `NoLayoutShift` (an overflowing vs non-overflowing comparison proving the thumb adds zero width).

---

## Changelog

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-06-23 | Jo Lopez + Claude | Canonical component spec authored in `components/scrollbar/` (was previously only the system-wide `docs/scrollbar-spec.md`). Documents the code-only / no-Figma model, semantic-token bindings (`scrim/faint` rest, `scrim/light` hover), liquid-glass thumb, edge-hug rule, accessibility, responsiveness, motion. |
