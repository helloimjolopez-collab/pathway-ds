# Scrollbar — Pathway Design System (system-wide)

**Status:** `REVIEWED`

A single, reusable overlay scrollbar that looks and behaves **identically on macOS, Windows, iOS, and Android**. Use it for every internal scroll surface in Pathway (SideNav, dropdown panels, dialogs, long lists, etc.) instead of the native browser scrollbar.

## Links

| Artefact | URL |
|---|---|
| React module | [components/scrollbar/scrollbar.jsx](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/scrollbar/scrollbar.jsx) |
| Storybook | [Library/Scrollbar](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-scrollbar--docs) |
| HTML demo | [components/scrollbar/scrollbar.html](https://helloimjolopez-collab.github.io/pathway-ds/components/scrollbar/scrollbar.html) |
| First consumer | `components/sidenav/sidenav.jsx` (SideNav menu) |

---

## 1. Why this exists

Native scrollbars **cannot** be made consistent across platforms, and styling them is a losing game:

- **Windows (Chromium/Edge)** renders a chunky, **space-taking** bar with corner/track boxes. CSS can thin it but cannot make it overlay — so it shifts content and changes padding.
- **macOS** uses a thin overlay bar (doesn't take space) — already different from Windows.
- **Firefox** exposes only `scrollbar-width` / `scrollbar-color` (no px control, no overlay).
- **iOS / Android** use auto-hiding overlay bars that are not reliably stylable.

So Pathway **hides the native scrollbar entirely** and draws its own thumb. That is the only way to get one elegant, semitransparent, overlay scrollbar that is the same everywhere and never affects layout.

## 2. Behaviour

- **Overlay, never layout-affecting.** The thumb is absolutely positioned over the content's right edge. It takes **zero** layout width — it never pushes content, changes padding, or resizes the container, in any state or at any breakpoint.
- **Always hugs the right edge.** The thumb sits `gutter` (2 px) from the right edge of the `<Scrollable>` wrapper, in every state and at every breakpoint, on any scroll surface — not only the SideNav. For it to land on the *visible* edge, the wrapper must reach that edge (see §4 implementation rules).
- **Semitransparent + quiet.** Thumb is `rgba(10,18,35,0.22)` at rest, `rgba(10,18,35,0.38)` while hovered/dragged. No track, no arrows, no corner boxes — just a rounded pill.
- **Reveal on activity.** Hidden (opacity 0) when idle; fades in (240 ms) on hover or while scrolling; fades out ~900 ms after scrolling stops. On touch devices it appears while scrolling.
- **Draggable** with the pointer; also responds to wheel, keyboard, and touch scroll on the underlying content (the content scrolls natively — only the *visual* bar is custom).
- **Auto-sizing.** Thumb length = viewport/content ratio (min 28 px); recomputes on content and container resize (`ResizeObserver`).

## 3. Tokens & constants

No semantic token maps to a scrollbar thumb, so these are documented implementation constants (in `SCROLL` exported from `scrollbar.jsx`):

| Constant | Value | Meaning |
|---|---|---|
| `thumbWidth` | 6 px | thumb thickness |
| `thumbRadius` | 6 px | fully rounded |
| `thumbMin` | 28 px | minimum thumb length |
| `gutter` | 2 px | inset from the right edge |
| `thumbRest` | `rgba(10,18,35,0.22)` | resting colour (semitransparent) |
| `thumbHover` | `rgba(10,18,35,0.38)` | hover/drag colour |
| `fadeMs` | 240 ms | reveal/hide + colour transition |
| `idleHideMs` | 900 ms | hide delay after scrolling stops |

## 4. API

```jsx
import { Scrollable } from "components/scrollbar/scrollbar.jsx";

<Scrollable style={{ flex: 1, minHeight: 0 }}>
  …tall content…
</Scrollable>
```

| Prop | Type | Description |
|---|---|---|
| `children` | node | The scrollable content. |
| `style` | object | Style for the wrapper (the positioning context). Use `flex:1; minHeight:0` inside a flex column so it fills and can scroll. |
| `className` | string | Extra class on the wrapper. |
| `viewStyle` | object | Style for the inner scroll view (e.g. the content's flex layout, gap, padding). |
| `viewClassName` | string | Extra class on the inner scroll view. |

**Implementation rules**
- The component injects one global `<style id="pds-scrollable-base">` that hides the native scrollbar on `.pds-scrollable__view` (scrollbars can't be hidden via inline styles). Scoped to that class — it never touches other scrollbars.
- The wrapper must be allowed to size to its container (`minHeight:0` in a flex column) so the inner view can overflow and scroll.
- **Put content padding on `viewStyle` (inside the scroll view), never on an outer wrapper**, so the thumb sits at the true edge. If a consumer wraps `<Scrollable>` in a padded container, the thumb floats inward by that padding. The SideNav rail hit exactly this: the nav's 12 px `border-box` right padding pushed the thumb ~14 px in on the 72 px rail. The fix is to bleed the scroll region out to the real edge and re-add the inset inside the view:
  ```jsx
  <Scrollable
    style={{ flex: 1, minHeight: 0, marginRight: -pad }}   // bleed to the true right edge
    viewStyle={{ paddingRight: pad }}                       // keep content inset inside the view
  >
  ```
  The thumb then hugs the edge while the content keeps its padding — in both expanded and collapsed states.

### Figma

**None — by design.** The scrollbar has no Figma node and never will. It exists *because* native scrollbars cannot be made consistent across platforms; its job is entirely runtime (hide the OS bar, draw an overlay thumb, fade on activity, hug the edge), with no variants or design properties to bind. Its source of truth is this spec plus `components/scrollbar/scrollbar.jsx`. The token-reconciliation flow in `CLAUDE.md §3.4` (which keys off a per-component Figma node) does not apply to this component.

## 5. Accessibility

The underlying content scrolls natively, so keyboard scrolling, focus, and screen-reader behaviour are unchanged. The thumb is decorative (`aria-hidden`) — it is a visual affordance, not the scroll mechanism. Reduced-motion users still get the bar; only the fade is cosmetic.

## 6. Adoption

| Component | Uses `<Scrollable>`? |
|---|---|
| SideNav (menu, expanded + 72px rail) | ✅ |
| Dropdown / popover panels, dialogs, long lists | should adopt as they're built/updated |

Any new component with an internal scroll region uses `<Scrollable>` — do not fall back to a raw `overflow-y: auto` with native scrollbars.
