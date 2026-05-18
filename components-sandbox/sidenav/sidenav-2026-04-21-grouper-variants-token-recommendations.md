# SideNav Grouper Variants — Token Recommendations

**Prototype:** `sidenav-2026-04-21-grouper-variants.html`
**Grounding:** `tokens/pathway-design-tokens.json` @ `98ee386`
**Created:** 2026-04-21
**Status:** Prototype ships with existing tokens. These are follow-up recommendations for the design system to consider after the prototype has been reviewed.

---

## Summary

The SideNav grouper prototype required four visual treatments that do not map to a dedicated semantic in the Pathway token set today. The prototype ships with the closest-available existing tokens (`text.static.secondary.base`, `semantic-type.desktop.label.dense.s.semibold`, `letter-spacing.wide`, and composed `primitive-unit.unit.*` spacing). This document describes the four semantic gaps, proposes a token for each, explains why it is worth adding, and evaluates whether the proposed addition **fits** the current token architecture or **contradicts** it.

The four recommendations are independent. Any of them can be adopted without adopting the others.

---

## 1. Dedicated semantic for section-label text color

### Proposed token

```
text.contextual.section-label.base   → {primitive-color.cool-neutral.150}  (#4b4b4b)
text.contextual.section-label.hover  → {primitive-color.cool-neutral.170}  (#363636)
```

Naming is open — `section-label` matches what the prototype renders; `eyebrow` is a common alternative used in other design systems.

### Why add it

The prototype currently uses `text.static.secondary.base` for the grouper label. That works visually (correct muted gray), but the semantic is a loose match:

- `text.static.secondary.*` is a **tonal role** (secondary vs. primary vs. tertiary emphasis). It tells you *how loud* the text is relative to other text.
- A section label is a **use-case role**. It tells you *what the text is for* — a category header introducing a group of items.

A component author reading `text.static.secondary.base` on a grouper cannot tell whether that was a deliberate choice or the closest-available token. A dedicated `text.contextual.section-label.base` removes that ambiguity and lets section labels evolve independently of "secondary body text" if the system ever needs to pull them apart (e.g. change section-label color in dark mode without changing all secondary body text).

### Does this match the current token architecture?

**Matches. Belongs in the `contextual` branch, not `static`.**

The system already distinguishes two branches under each color family:

- `text.static.*` — tonal roles (primary, secondary, info, warning, neutral, etc.). Values are role-based and component-agnostic.
- `text.contextual.*` — use-case semantics tied to specific components or contexts (navitem is the only existing example).

A `section-label` semantic belongs under `contextual`, not `static`, because it is a use-case (a specific element type in a specific layout pattern), not a tonal role. The existing `text.contextual.navitem.*` family is the closest precedent.

One note: `contextual` currently has only one entry (`navitem`), so the pattern is lightly established. Adding `section-label` as a second contextual family reinforces that pattern cleanly.

### Does not contradict

Adding to `contextual` does not disturb the `static` tree, does not rename anything, and does not introduce a new top-level namespace. It extends an existing branch along its existing pattern.

---

## 2. Dedicated typography semantic for section labels

### Proposed token

```
semantic-type.desktop.section-label.s.semibold {
  fontfamily:    {primitive-type.family.brand}
  fontsize:      {primitive-type.size.11}
  fontweight:    {primitive-type.weight.600}
  lineheight:    {primitive-type.line-height.11pt.single}
  letterspacing: {primitive-type.letter-spacing.caps}  ← see recommendation 3
}
```

Sizes `xs` (10px) and `base` (12px) could be added if the system ever needs larger or smaller section labels, following the existing `{xs, s, base, l}` pattern used by `label.dense.*`.

### Why add it

The prototype currently uses `semantic-type.desktop.label.dense.s.semibold`. The atomic values (11px / 600 / 16 line / wide letter-spacing) are exactly what a section label needs, but borrowing from the `label.*` family is semantically incorrect:

- `semantic-type.desktop.label.*` in the current system covers **form-field labels, button labels, and input labels**. It is a family of semantics for *controls*.
- A section label is a **structural element**, not a control label. It introduces and groups controls; it is not one.

A `section-label` typography family makes the distinction explicit and lets the two evolve independently. If the design system ever increases the density or weight of form-field labels (a very common evolution — think shrinking label sizes as forms get denser), section labels should not change in lockstep.

### Does this match the current token architecture?

**Matches, with one check required.**

The typography tree under `semantic-type.desktop.*` is organised by **element category**:

- `heading.display.*`, `heading.page.*`, `heading.section.*`, `heading.section-heading.*`
- `body.*`, `body.supporting.*`, `body.dense.*`
- `label.button.*`, `label.input.*`, `label.dense.*`
- `helper.*`, `link.*`, etc.

Adding `section-label.*` as a new top-level category fits the pattern cleanly: a named element type with its own size/weight axes.

**Check before adding:** the file already contains categories named `section-heading` (line 4154) and `section` (lines 4168, 4593, 6655). Confirm whether "section label" is meaningfully distinct from those, or whether it fits under one of them. If `section.label.*` reads naturally as a child of an existing `section.*` namespace, that is arguably a cleaner home than a new top-level `section-label.*` category.

### Does not contradict

Whether the token is named `section-label.*` or `section.label.*`, both options extend the existing element-category taxonomy. Neither renames, reshapes, or competes with another branch.

### Risk

If `section-label` ends up duplicating something that already exists under `section.*`, adopting it creates two overlapping semantics for the same use case, which is worse than the current state. This is the only recommendation in this document where the answer depends on a question (is `section-label` genuinely new?) that needs to be resolved before the token is added.

---

## 3. Mid-tier letter-spacing primitive for all-caps text

### Proposed token

```
primitive-type.letter-spacing.caps  → 0.3   (or 0.4 — to be tuned against a specimen)
```

### Why add it

The system has four letter-spacing primitives today:

| Primitive | Value |
|---|---|
| `compact` | -0.01 |
| `standard` | 0 |
| `wide` | 0.1 |
| `extrawide` | 0.6 |

The gap between `wide` (0.1) and `extrawide` (0.6) is six times the size of the gap between `standard` and `wide`. For all-caps text at 10–12px, typographic convention calls for ~0.3–0.5px of tracking to improve legibility (letters crowd visually when their space is inherited from proportional lowercase defaults). Today the prototype uses `wide` because `extrawide` is visibly too loose.

Adding a mid-tier value closes the gap without forcing designers to choose between under-tuned and over-tuned.

### Does this match the current token architecture?

**Matches, perfectly.**

The existing primitive list is a scale (compact → standard → wide → extrawide). Adding an entry between `wide` and `extrawide` extends the scale along its existing dimension. It does not introduce a new axis, rename anything, or change the shape of the tree.

**Naming note:** `caps` is one option; alternatives that fit the existing pattern include `widest` (simple progression) or `emphasized` (descriptive, use-case-oriented). All three are consistent with the current naming conventions. `wider` would fit the comparative progression best but might be confusing next to `wide`.

### Does not contradict

No existing primitive is renamed, removed, or re-valued. The new token is purely additive. Any component that currently uses `wide` or `extrawide` continues to resolve correctly.

---

## 4. Compact-row height semantic for non-interactive rows

### Proposed token

```
component.sidenav.grouper-row.min-height  → 32  (composed from 8 + 16 + 8)
```

OR

```
layout.row.compact.height  → 32  (generic — usable by any non-interactive compact row)
```

Either location works. The second is more reusable. The first is more discoverable if a future reader is looking at SideNav-specific tokens.

### Why add it

The SideNav component today uses `L.itemH = 48px` (the `accessibility.touchtarget.optimal` token) as a hard-coded layout constant for the nav item row height. That token is correct because nav items are touch targets.

Groupers are **not** touch targets:

- Default groupers are not interactive at all.
- Expandable groupers are interactive but are section controls, not destinations, and are visited much less frequently than nav items.

Using `touchtarget.optimal` for a grouper would be wrong (it inflates a visual section label to nav-item height, defeating the purpose of distinguishing the two). The prototype uses a composed 32px value (`padding-v: 8` + `line-height: 16` + `padding-v: 8`). This works but leaves a system gap: there is no named token for "compact label row" or "non-touch-target row height."

### Does this match the current token architecture?

**Partially matches; some open questions.**

The current token file has three spacing-adjacent namespaces:

- `primitive-unit.unit.*` — raw spacing scale (4, 8, 12, 16, 24, 32, …). This is a pure numeric scale, no semantics.
- `accessibility.touchtarget.*` — touch-target sizes (optimal, minimum). Semantic, accessibility-driven.
- Component-specific constants live in `<component>.jsx` files as `L.*` layout constants — not tokens.

There is **no existing "layout row height" semantic** in the token file. Layout constants today are all per-component JavaScript constants. Adopting a `component.sidenav.grouper-row.min-height` or `layout.row.compact.height` token would establish a new pattern in the token file.

This is neither aligned nor misaligned with the current architecture — it is additive to a pattern that does not yet exist.

### Does it contradict?

**It does not contradict existing tokens,** but it does contradict a current convention: the design system today treats layout values (widths, row heights, padding between components) as component code, not as design tokens. Only color, type, spacing scale, and accessibility touch-targets are tokenized.

Whether to extend tokenization to row-heights is a design-system architecture decision the team should make explicitly. Three options:

- **(a) Don't tokenize; keep the composition in component code.** Simplest. Current convention. Works fine for the prototype. Future components that need a compact row have to rewrite the composition.
- **(b) Add a generic `layout.row.compact.height` semantic.** Broadest value. Establishes a new token category. Consistent with the principle that any value referenced by more than one component deserves a token.
- **(c) Add component-scoped `component.sidenav.grouper-row.min-height`.** Scoped to SideNav. Establishes a precedent for component-scoped layout tokens, which the system does not have yet.

Of the three, (a) or (b) are most aligned with the current architecture. (c) introduces a new concept (per-component layout tokens) that should be a deliberate system decision, not a side-effect of one prototype.

### Risk

Adding (b) or (c) without a broader architecture decision could cause an inconsistent mix where some row heights are tokens and some are not. Recommend treating this as an agenda item for a design-system review, not a drop-in addition.

---

## Priority summary

If the team wants to act on any subset of these, priority order (highest-value-first):

1. **Recommendation 3 (mid-tier letter-spacing primitive).** Smallest change, clean fit, unlocks correct all-caps tracking for this prototype *and* any future section-label or caps-styled element. Architecturally cost-free.

2. **Recommendation 2 (section-label typography semantic).** Medium effort. Clean fit *provided* the `section-label` vs. `section.*` naming question is resolved. High ongoing value: form-label and section-label evolution decouples cleanly.

3. **Recommendation 1 (section-label text color).** Medium effort. Clean fit. Value depends on whether the system ever needs section-label color to diverge from `text.static.secondary.base`. Lower urgency than 2 because color is less likely to need to change than type.

4. **Recommendation 4 (compact row-height token).** Lowest priority and highest architectural cost. The real question is whether row-heights should be tokens at all. Defer until that broader decision is made.

---

## What happens next

- These recommendations are suggestions, not commitments. The design system owner decides which (if any) to adopt.
- None of the four blocks the prototype. The prototype ships with existing tokens as noted in the Token Coverage Report embedded in the HTML file.
- If any recommendation is adopted: the change happens in Figma first (`letter-spacing.caps` as a new primitive, `text.contextual.section-label.*` as a new semantic family, etc.), then flows into the repo via `/pathway:tokens-sync` per `CLAUDE.md` §2. The prototype can then be updated to use the new tokens and re-saved as a `-v2` iteration.
