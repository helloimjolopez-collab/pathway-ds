# Scrollbar — system-wide overlay scrollbar (Pathway)

**Status:** `REVIEWED`

A single, reusable overlay scrollbar (`<Scrollable>`) that looks and behaves **identically on macOS, Windows, iOS, and Android**. This page is the **system-wide reference**: why the primitive exists and where it must be adopted. The **canonical component spec** (anatomy, API, tokens, states, accessibility, responsiveness, motion) lives with the component.

## Links

| Artefact | URL |
|---|---|
| **Canonical component spec** | [components/scrollbar/scrollbar-spec.md](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/scrollbar/scrollbar-spec.md) — full spec |
| React module | [components/scrollbar/scrollbar.jsx](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/scrollbar/scrollbar.jsx) |
| Storybook | [Library/Scrollbar](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-scrollbar--docs) |
| HTML demo | [components/scrollbar/scrollbar.html](https://helloimjolopez-collab.github.io/pathway-ds/components/scrollbar/scrollbar.html) |
| Figma | **None — by design** (code-only primitive; see the canonical spec §1.2) |

---

## Why this exists

Native scrollbars **cannot** be made consistent across platforms, and styling them is a losing game:

- **Windows (Chromium/Edge)** renders a chunky, space-**taking** bar with corner/track boxes. CSS can thin it but cannot make it overlay — so it shifts content and changes padding.
- **macOS** uses a thin overlay bar (doesn't take space) — already different from Windows.
- **Firefox** exposes only `scrollbar-width` / `scrollbar-color` (no px control, no overlay).
- **iOS / Android** use auto-hiding overlay bars that are not reliably stylable.

So Pathway **hides the native scrollbar entirely** and draws its own thumb. That is the only way to get one elegant, liquid-glass, overlay scrollbar that is the same everywhere and never affects layout.

## No Figma — and that's correct

This is the one component with no Figma node, intentionally. Its entire job is runtime behaviour (hide the OS bar, draw an overlay thumb, refract through a backdrop blur, fade on activity, hug the edge, auto-size) — none of which a static Figma frame can express, and there are no variants to bind. Source of truth is the canonical spec + `scrollbar.jsx`. The token-reconciliation flow (`CLAUDE.md §3.4`) does not apply. See the canonical spec §1.2.

## Adoption — use it everywhere

Any component with an internal scroll region uses `<Scrollable>` — never a raw `overflow-y: auto` with native scrollbars.

| Component | Uses `<Scrollable>`? |
|---|---|
| SideNav (menu — expanded 240px + collapsed 72px rail) | ✅ |
| Dropdown / popover panels, dialogs, long lists, sheets | should adopt as they're built/updated |
| Any future component with an internal scroll region | required |

> For everything else — anatomy, props, the semantic-token table (`scrim/faint` rest, `scrim/light` hover), the edge-hug implementation rule, accessibility, responsiveness, motion — see the **[canonical component spec](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/scrollbar/scrollbar-spec.md)**.
