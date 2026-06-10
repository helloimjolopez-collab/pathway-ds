<!--
  Pathway Component Spec — TEMPLATE

  Copy this file to components/<name>/<name>-spec.md and fill in every
  section. Keep section numbers and headings exactly as they are below —
  the `/pathway:spec-review` skill parses this structure.

  Prompts in [square brackets] are fill-in hints. Delete them once filled.

  Marker-comments (look like this) are reminders for the author and must
  be removed before the spec is considered Reviewed.
-->

# {Component} — Pathway Design System Component Spec

**Status:** `PENDING HUMAN REVIEW`
<!--
  Valid values (in order of maturity):
    PENDING HUMAN REVIEW   — draft (Claude-generated or early human-drafted; must not ship)
    UNDER REVIEW           — Spec Review skill is running; conflicts being resolved
    REVIEWED               — all conflicts resolved, human sign-off done; ready to consume
    DEPRECATED             — no longer in the system (keep file for history)

  The pipeline skill refuses to run on anything that is not REVIEWED.
-->

Complete implementation reference for the {Component} component. Covers anatomy, design tokens, states, spacing, interaction patterns, and accessibility. Use alongside the [Figma source](#figma-source) for a pixel-accurate build.

## Links
<!--
  CANONICAL STRUCTURE — the Links section is ALWAYS here, at the very top of the
  spec (immediately after the overview), never as a trailing section. Readers and
  agents must reach Figma / Storybook / demo / source without scrolling a long spec.
  Fill every row. Storybook docs slug = library-{name-without-hyphens}--docs.
-->

| Artefact | URL |
|---|---|
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id={nodeId} |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-{name}--docs |
| HTML demo | https://helloimjolopez-collab.github.io/pathway-ds/components/{name}/{name}.html |
| GitHub source | https://github.com/helloimjolopez-collab/pathway-ds/tree/main/components/{name} |

---

## 1. Component Overview

[Fill in: 2–4 paragraphs. What the component IS, what it is NOT, which problems it solves, where it fits in the system. Explicitly name the anti-patterns — "this is NOT used for X, Y, Z."]

### Figma source

- **File:** [Pathway Design System Master File MB 2.0](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/)
- **{Component}:** [Open in Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=[NODE_ID_HERE])

<!--
  The Figma source section is LOAD-BEARING. The readiness skill, spec review
  skill, pipeline skill, and token reconciliation pass all parse the node ID
  out of this URL. Do not change the format.
-->

---

## 1.1 Governance: where things live

[Fill in: a table mapping "to change X" → owner + location. See sidenav-spec §1.1 for the pattern. Every decision-making element of the component needs a row. When in doubt, add more rows.]

| To change… | Owner | Where |
|---|---|---|
| [What someone might want to change] | [Figma component / this spec / token library] | [link or section number] |

---

## 2. Component Anatomy

[Fill in: an ASCII tree of the component structure. Label every element with its size, padding, role. See sidenav-spec §2 for the pattern.]

```
{Component}.Container
├── [child element]
│   ├── [nested element]
│   └── [nested element]
└── [child element]
```

### {Sub-component} internal structure

[Repeat for each non-trivial sub-component if anatomy differs between variants or levels.]

---

## 3. Design Tokens

[Fill in: every colour, typography, surface, radius, shadow token this component uses. Group by category. Every row must cite a semantic token — never a raw hex, never a primitive. See sidenav-spec §3 for the pattern.]

### 3.1 Surface

| Semantic Token | Primitive | Resolved Value | Usage |
|---|---|---|---|
| `[token/path]` | `[primitive.path]` | `#hex` | [where it's applied] |

### 3.2 Fill

[Repeat for fill states — Base / Hover / Active / etc.]

### 3.3 Text

[Repeat for text states.]

### 3.4 Icon

[Repeat for icon states — if the component has icons.]

### 3.5 Geometry

[Radii, stroke widths, sizes bound to tokens.]

### 3.6 Typography

[Font family, weight, size, line-height, letter-spacing — bound to a `Label/*` or `Text/*` token.]

---

## 4. Layout & Spacing

[Fill in: every spacing value used by the component. Flag any that are **raw** (no semantic token) as a gap. See sidenav-spec §4 — the table includes a "Semantic token" column so gaps are obvious.]

| Value | Figma class or raw | px | Semantic token |
|---|---|---|---|
| [what it's used for] | `[class]` | [N] | [token path or "**None — raw value**"] |

---

## 5. Item / Variant Structure

[Fill in: every variant and its internal differences. For each variant describe what's rendered and what's different from the base. See sidenav-spec §5.]

### {Variant A}
- [description]

### {Variant B}
- [description]

---

## 6. State Matrix

[Fill in: every state × every token. Use a table like the sidenav-spec §6 State Matrix.]

| Condition | Fill | Text | Icon | [indicator / other] |
|---|---|---|---|---|
| **Base** | `[token]` | `[token]` | `[token]` | [value] |
| **Hover** | `[token]` | `[token]` | `[token]` | [value] |
| **Active** | `[token]` | `[token]` | `[token]` | [value] |

### State logic rules

[Numbered list: when each state applies. Be explicit about edge cases (e.g. "trail-collapsed applies when X AND Y").]

---

## 7. Sub-components / Decorations

[If applicable — indicator stripes, dividers, badges, anything that sits on or next to the main element.]

---

## 8. Container / Surface

[Fill in: the outer container's surface, dimensions, padding, transitions.]

### 8.1 Surface
- [bg / border / shadow]

### 8.2 Dimensions & Padding
- [widths / heights per state]

### 8.3 Transition
- [duration / easing / properties — must cite motion rules from `docs/design-system-spec.md` §Motion]

---

## 9. Interaction / Behaviour

[Fill in: every interaction — click, hover, focus, keyboard, touch. What the component does on each.]

---

## 10. Collapsed / Compact / Variant-specific State

[If applicable — modes where the component renders differently (mobile, collapsed, read-only).]

---

## 11. Iconography

[If applicable — what icons are used, what shape variant, size.]

---

## 12. Interaction Patterns

[If applicable — patterns that span multiple parts of the component (hover-safe bridges, debounce rules, keyboard sequences).]

---

## 13. Accessibility

[Fill in every subsection. Cite `docs/design-system-spec.md` §Accessibility for anything that's a system-wide rule vs. a component-specific override. See sidenav-spec §13 for depth.]

### 13.0 ARIA pattern

[Which ARIA pattern this component uses — `tree`, `menu`, `status`, etc. Link to the WAI-ARIA pattern.]

### 13.1 Touch & pointer targets

[Size tokens + WCAG citations.]

### 13.2 ARIA markup

```html
[Example markup with all required ARIA attributes.]
```

### 13.3 Keyboard interaction

| Key | Behaviour | Status |
|---|---|---|

### 13.4 Focus styles

[Focus ring spec + reduced-motion behaviour.]

### 13.5 Screen reader announcements

[What AT should say in each state.]

### 13.6 Colour contrast

[Ratios for every text-on-background combination, with WCAG pass/fail.]

---

## 14. Motion

[If applicable — every animation, keyframe, duration, easing. **Must be consistent with `docs/design-system-spec.md` §Motion.** If this component needs to deviate, flag it here and justify why; the Spec Review skill will confirm the override is intentional.]

| Property | Value | Why |
|---|---|---|
| Duration | [ms] | [reason] |
| Timing function | [bezier] | [reason] |
| Reduced motion | [what changes] | [reason] |

---

## 15. Responsiveness

[Per-breakpoint behaviour. Cite `docs/design-system-spec.md` §Breakpoints for the system-wide breakpoint values.]

| Viewport | State | Behaviour |
|---|---|---|

---

## 16. What to pass Claude to implement this component

[A short checklist of inputs the pipeline needs beyond this spec — nav items, icon mappings, sample data, anything component-specific.]

---

## 17. Gaps & deferred decisions

[Known limitations, Figma-side design debt, unconfirmed values. Mark each with priority: HIGH / MEDIUM / LOW.]

| Gap | Priority | Notes |
|---|---|---|

---

## 18. Storybook

[Short note about whether the component is in Storybook yet and which stories exist. Updated by the pipeline skill automatically.]

---

<!--
  Before flipping Status: to REVIEWED, the human must:
    1. Remove every [fill-in-hint] placeholder
    2. Remove every <!-- marker-comment -->
    3. Run the `/pathway:spec-review` skill and resolve every conflict it flags
    4. Confirm the Figma source URL in §1 resolves to the intended node
    5. Verify §3 cites only semantic tokens — no raw hex, no primitives
-->
