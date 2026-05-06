# Figma Build Conventions

How a Pathway component must look in Figma so that:

- The spec MD can be extracted, verified, or kept in sync programmatically.
- The pipeline can ingest the component without ambiguity.
- AI agents (Figma Make, Cursor, v0, Lovable) can interpret it correctly.
- Designers across the org produce consistently-built components.

**Source-of-truth boundary.** The component spec MD in GitHub (`components/<name>/<name>-spec.md`) owns all **content** — anatomy, governance, motion, accessibility, dos/don'ts, responsiveness, AI-agent integration. This doc only covers Figma's **containers and conventions** — what frames must exist, what layers must be named, how tokens must be applied, how variants must be declared. Content references back to the spec, never duplicated.

For the spec content structure itself, see `docs/component-spec-template.md`. For prep checks before handoff, see `docs/figma-prep-checklist.md`. This doc is upstream of both.

---

## 1. The component Figma page

Every component lives on its own dedicated Figma page in the master file. The page name follows the format used in the master file (the SideNav reference page is named `❇️ ↳ Local Navigation`). Pages contain **five required sections** plus optional frames:

| # | Section | Required | Purpose |
|---|---|---|---|
| 1 | `<Name> Instances - Interaction` | Yes | Live interactive examples — real-world usage states with annotation labels |
| 2 | `<Name> Components` | Yes | Master component + all variants laid out for inspection |
| 3 | `<Name> Documentation` | Yes | Visual summary — references spec §1–§14 |
| 4 | `<Name> Governance` | Yes | Where-things-live map — references spec §1.1 |
| 5 | `<Name> Responsiveness` | Yes | Responsive variants + breakpoint behaviour — references spec §16 |
| 6 | `FigmaMake Playground` | Optional | Sandbox frame for AI codegen iteration |

Sections must be **Figma sections** (not regular frames) so they appear in the layers panel as collapsible separators. Section names match exactly — including the dash and spacing — so extraction tooling can find them by string match.

### 1.1 Section ordering

Left to right, top to bottom on the canvas, in the order listed above. Instances → Components → Documentation → Governance → Responsiveness → FigmaMake Playground (if present).

### 1.2 What goes on the page vs. what goes in the spec

The Figma page is **not** the source of truth for textual content. It is a visual reference. Every documentation/governance/responsiveness frame in Figma must include a small text block at the top that says:

```
Source of truth: components/<name>/<name>-spec.md §<section>
```

If the Figma frame disagrees with the spec, the spec wins. This is the same rule as `CLAUDE.md` §1: "Component visual design (variants, frames, anatomy, variables-bound properties) → Figma; Component implementations (HTML demos, specs, stories) → GitHub." The spec is implementation-adjacent and lives in GitHub.

---

## 2. Layer naming conventions

Layer names are programmatic. Tooling extracts content based on exact name matches. Get them wrong and Studio + the pipeline cannot find what they need.

### 2.1 Universal layer names

These names appear on every component page and must match exactly:

| Layer name | What it is | Where it appears |
|---|---|---|
| `Main Container` | Outer wrapper of a documentation/governance/responsiveness section's content | Inside each doc-style section, depth 1 |
| `Logo Container` | Pathway brand header (logo + page title) | Top of `Main Container` |
| `Content Container` | Wrapper holding the section's body | Below `Logo Container` |
| `Text Container` | Wrapper holding title + prose | Inside `Content Container` |
| `Title Container` | Section heading frame | Inside `Text Container` |
| `Description` | The long-form prose text node | Inside `Text Container`, below `Title Container` |
| `Source of truth` | The "see spec §X" reference text node | Top of `Description` or its own small frame |

Doc, Governance, and Responsiveness sections all share this nesting. Instances and Components sections do not — see §3.

### 2.2 Component layer names

Inside the `<Name> Components` section, the master component frame must be named exactly `<Name>` (PascalCase, e.g. `SideNav`, `Spinner`, `TopNav`).

Sub-component frames are named `<Name>.<SubComponent>` — dot-separated PascalCase. SideNav uses:

- `SideNav.Container` (the master)
- `SideNav.Item` (sub)
- `SideNav.Item.Collapsed` (sub variant in some places)
- `Indicator.Stripe` (sub-component)
- `Collapse_Expand_Nav_Container` (snake-case underscore is permitted only when the sub is multi-word and needs disambiguation; prefer dot-PascalCase otherwise)

Anatomy parts inside a component (icon wrappers, label slots, row-end controls) use lowercase descriptive names: `text.label`, `Container.LeadingIcon`, `Button Container`. These are anatomy primitives, not variants, and follow no global rule beyond "be descriptive."

### 2.3 Variant property names

Component variant properties use **PascalCase** with single-word values where possible:

```
State: Base | Hover | Active | Trail-Expanded | Trail-Collapsed
Size: Small | Medium | Large
Layout: Push | Overlay
Sidebar: Expanded | Collapsed | Hidden
```

Compound values use hyphens (e.g. `Trail-Expanded`) — never spaces, never underscores in the value. The property name itself is single-word PascalCase.

**Boolean properties** are named as a yes/no question without a verb: `Disabled`, `Loading`, `Hidden` — not `IsDisabled`, `HasLoading`.

**Instance-swap properties** are named after the slot: `Icon`, `LeadingIcon`, `TrailingControl`. Match the slot's anatomical name.

### 2.4 Layer names that BREAK extraction

Common mistakes that break Studio + the pipeline:

- ❌ Auto-generated names left in (`Frame 47`, `Group 1073714265`, `Rectangle 12`)
- ❌ Casing drift (`sidenav.container` instead of `SideNav.Container`)
- ❌ Spaces where dots/hyphens are required (`SideNav Container` instead of `SideNav.Container`)
- ❌ Renaming a slot from `Description` to `Body` or `Text Block` — the literal name `Description` is what extraction looks for
- ❌ Variant property values with mixed casing (`Active`, `active`, `ACTIVE` all in the same property set)

Run the readiness audit before declaring done — it flags these.

---

## 3. Section-specific structure

### 3.1 `<Name> Instances - Interaction`

Live examples showing real states. Mix `instance` nodes (component instances) with `text` annotation labels.

**Required content:**

- One instance per documented state (Base, Hover, Active, Trail-Expanded, Trail-Collapsed for SideNav-class components — copy the state list from your component's spec §6 State Matrix)
- Text label above or beside each instance naming the state (`Hover (Main Item)`, `Active (Grouper)`, `Hover Popover` — match the state name from the spec exactly)
- Instances of every responsive state (Expanded, Collapsed, Overlay-open, Hidden if applicable) — at the actual viewport width they apply to
- For groupers/parents: at least one instance showing children, one showing collapsed-with-active-child trail state

**Layer naming:** the master component instances retain their auto-generated `<Name>.Container` instance names (Figma manages this). Annotation labels are plain `text` nodes whose name matches the state being annotated.

### 3.2 `<Name> Components`

The component definition itself, plus variant grids. Visual layout, no required nesting beyond what Figma's component system imposes.

**Required content:**

- The master component frame named `<Name>`
- All declared variants laid out in a grid (Figma's variant property panel manages the grid automatically)
- Sub-component frames if the component has them (`SideNav.Item`, `Indicator.Stripe`)
- Helper text labels naming each variant or variant group (`Base Label`, etc.)

**Auto-layout:** the master component must use auto-layout. Spacing values must come from semantic spacing tokens (e.g. `Spacing/Nav/Item-Gap`) or, where no token exists, the value must be flagged in the spec §15 Figma Gaps as design debt.

### 3.3 `<Name> Documentation`

Visual summary of the component. Content surfaces a digest of spec §1–§14. The detailed spec lives in the MD; this section is for designers browsing Figma.

**Required structure:**

```
section
└── frame: Main Container
    ├── frame: Logo Container          ← page header (logo + title)
    ├── frame: Content                 ← optional intro
    └── frame: Content Container
        └── frame: Text Container
            ├── frame: Title Container ← H1 of this section
            ├── text:  Description     ← the prose summary
            └── frame: Content         ← optional supplementary blocks
```

**Required text blocks at the top of `Description`:**

```
Source of truth: components/<name>/<name>-spec.md
This Figma section is a visual summary. The spec is authoritative.
```

**Content guidance:** keep it short. 200–400 words covering: what the component is, when to use it, when not to use it, key anatomy. Not a duplicate of spec §2 — a digest.

### 3.4 `<Name> Governance`

Same nesting as Documentation. Surfaces spec §1.1 Governance: where things live.

**Required content:**

- The exact governance table from spec §1.1, rendered as a Figma table or text block
- A "How to change something" callout: "If you need to change X, the owner is Y, edit it at Z." Mirrors the table semantically.
- A small note: `Source of truth: components/<name>/<name>-spec.md §1.1`

This is the only section where designers can copy the spec table verbatim into Figma — because the table itself is short and the source is explicitly cross-referenced.

### 3.5 `<Name> Responsiveness`

REQUIRED. Even if your component has trivial responsive behaviour, this section must exist and explicitly say so.

**Required content:**

- A breakpoint table (or text block) listing the four standard Pathway breakpoints (393 / 768 / 1024 / 1440px) and the component's behaviour at each
- Visual examples of the component at each breakpoint where behaviour differs (e.g. SideNav shows Push at ≥1024px, Overlay at <1024px, Hidden at <768px — three frames)
- Annotation text near each viewport frame naming the breakpoint and behaviour
- A reference to spec §16 at the top: `Source of truth: components/<name>/<name>-spec.md §16`

If the component is genuinely viewport-agnostic (e.g. an icon, a chip, a token), the section still exists and contains a single text block: `This component is viewport-independent. Responsive guidance covered at the page-shell level. See spec §16.`

### 3.6 `FigmaMake Playground` (optional)

A frame (not a section — a frame) for design-side iteration with Figma Make or other AI codegen tools.

**Purpose:** lets the designer ask Figma Make / AI to generate variations or extensions without polluting the canonical sections.

**NOT the same as `<name>-figmamake.html` in the repo.** That file is auto-generated from `<name>.html` on every push and consumed by AI agents reading the repo. The Figma frame is a separate sandbox for in-Figma exploration only.

---

## 4. Token-applying conventions

Every fill, stroke, text colour, border-radius, shadow, and (where tokens exist) spacing/size value must bind to a Figma variable. Raw hex, raw px values, and primitive variables are forbidden in production-ready components.

### 4.1 Token family rules

| Surface | Token family | Example |
|---|---|---|
| Component fills (backgrounds) | `Fill/Contextual/<component>/<state>` or `Fill/Static/<role>/<emphasis>` | `Fill/Contextual/NavItem/Active` |
| Text colour | `Text/Contextual/<component>/<state>` or `Text/Static/<tone>/<emphasis>` or `Text/Action/<role>/<state>` | `Text/Contextual/NavItem/Hover` |
| Icon colour | `Icon/Contextual/<component>/<state>` or `Icon/Static/<tone>/<emphasis>` or `Icon/Action/<role>/<state>` | `Icon/Contextual/NavItem/Active` |
| Strokes / borders | Same family rules as fills | |
| Border radius | `Component/<name>/<size>/Radius/Radius` or `Border/<size>` | `Border/S` |
| Surface (large background areas) | `Surface/<role>/<emphasis>` | `Surface/Nav/Light` |

The rule from `CLAUDE.md` §6 is absolute: **components resolve colour only through semantic tokens.** Never raw hex, never primitive tokens (`Brand.300`), never invented names that aren't in `tokens/pathway-design-tokens.json`.

### 4.2 When a token doesn't exist

Some properties have no semantic token yet — most often spacing, container padding, stripe widths. The rule:

1. **Use the raw value in Figma** (e.g. enter `12` for padding) — Figma allows unbound numeric values.
2. **Document the gap in spec §15** — name the property, propose a token name (`Spacing/Nav/ContainerPaddingH`), set priority (HIGH/MEDIUM/LOW).
3. **Do not invent a token in Figma to fill the gap.** Ad-hoc tokens proliferate and are worse than a documented gap.

The SideNav spec §15 has 6 such gaps documented. They are tracked, not silently ignored.

### 4.3 Token binding verification

After applying tokens, the readiness audit (`/pathway:component-readiness`) reads the component via `get_variable_defs` and confirms every paint/stroke is bound to a real semantic. Run it before considering the component done.

---

## 5. Variant declaration patterns

### 5.1 When to use which property type

| Use case | Property type | Example |
|---|---|---|
| Mutually exclusive states | Variant | `State: Base / Hover / Active` |
| Two-way toggle | Boolean | `Disabled: true / false` |
| Swappable element (icon, slot content) | Instance Swap | `LeadingIcon: <icon component>` |
| Free-form text | Text | `Label: "<string>"` |

Rule of thumb: if the property changes the component's visual structure significantly, it's a Variant. If it adds/removes a single feature, it's a Boolean. If it lets a designer pick from a library of options at runtime, it's Instance Swap.

### 5.2 Component property naming

PascalCase, single-word where possible. Multi-word property names use camelCase: `ItemDepth`, `IconPosition`. Property values follow the casing rules in §2.3.

### 5.3 Required minimum variants

Every component must declare at minimum:

- A `default` variant (the canonical resting state)
- Variants for every state in the spec's State Matrix (§6)
- Variants for every responsive mode if behaviour changes structurally (Push/Overlay/Hidden, Expanded/Collapsed)

Optional but recommended: variants for size scales, colour modes, density modes — driven by the spec.

---

## 6. Annotation conventions

Annotations are text nodes (and sometimes lines/arrows) that label parts of the component for the viewer.

### 6.1 Where annotations go

- **Inside Instances - Interaction:** label every instance with the state it shows (above or to the left).
- **Inside Components:** label major variant groups (`Base`, `Hover`, `Active states`).
- **Inside Anatomy callouts (optional):** number callouts (1, 2, 3...) pointing at component parts, with a key beside the component listing what each number means.

### 6.2 Annotation styling

Annotations use the design system's text styles (`Body/S/Regular`, `Label/Small/Medium`). They don't use raw font properties. They use `Text/Static/Neutral/Subtle` as their colour token. They sit at the same depth on the canvas as the thing they annotate, never on top of it.

### 6.3 What annotations don't do

Annotations don't replace the spec. If you find yourself writing more than ~50 words in a single annotation, that content belongs in the spec MD. Annotations are short, glanceable cues — not embedded documentation.

---

## 7. Frame dimensions

Doc/governance/responsiveness sections share canonical widths so the master file looks visually coherent. From the SideNav reference:

| Section | Typical width |
|---|---|
| Documentation `Main Container` | 2311 px |
| Governance `Main Container` | 2311 px |
| Responsiveness section | 4202 px (wider — accommodates side-by-side viewport frames) |
| Components section | 3649 px |
| Instances - Interaction | 4269 px |

These are guidelines, not hard requirements — components with very different visual weight (e.g. an icon vs. a sidenav) will need different widths. The rule is: keep the four doc-style sections (Documentation, Governance) at ~2311 px so they read as the same visual class. Responsiveness can be wider if your component has many viewports.

Heights are determined by content; let auto-layout grow vertically.

---

## 8. The two demos in the repo

These are not Figma artifacts — they live in the repo. Understanding them matters because Studio coaches designers about both.

| File | Purpose | Authored by | Synced how |
|---|---|---|---|
| `components/<name>/<name>.html` | The full demo with annotation panel (the human-facing showcase) | Pipeline (generated) — designer never edits | Manually committed by pipeline |
| `components/<name>/<name>-figmamake.html` | The annotation-stripped demo for AI codegen tools | Auto-derived from `<name>.html` | `.github/workflows/sync-component.yml` regenerates on every push to `<name>.html` |

The designer's job in Figma never includes authoring either of these files. They are pipeline outputs.

The Figma `FigmaMake Playground` frame (§3.6) is a separate concern — it's an in-Figma sandbox for design-side AI experimentation.

---

## 9. Verifying compliance

Before declaring a component "ready for handoff," run the readiness audit:

```
/pathway:component-readiness
```

It checks:

- Section-name matches (§1)
- Layer-name matches (§2)
- Token bindings complete (§4)
- Variant declarations meet the minimum (§5)
- Annotations follow conventions (§6)
- Responsiveness section exists (§3.5)
- Spec source-of-truth note present at the top of each doc section (§1.2)

The audit produces a report classifying issues as P0 (blocks pipeline), P1 (should fix), P2 (polish). Resolve P0s before the pipeline can ship. P1/P2 are negotiable per spec §15 (Figma Gaps).

---

## 10. Summary checklist

Use this as the at-a-glance checklist when prepping a component for handoff. Studio enforces every point.

```
COMPONENT FIGMA PAGE — STRUCTURAL CHECKLIST

Sections (all five required, in order):
  [ ] <Name> Instances - Interaction
  [ ] <Name> Components
  [ ] <Name> Documentation
  [ ] <Name> Governance
  [ ] <Name> Responsiveness
  [ ] FigmaMake Playground (optional)

Universal layer names (in every doc-style section):
  [ ] Main Container
  [ ] Logo Container
  [ ] Content Container
  [ ] Text Container
  [ ] Title Container
  [ ] Description (with "Source of truth: ..." reference)

Component-level naming:
  [ ] Master component named <Name> (PascalCase)
  [ ] Sub-components named <Name>.<SubComponent>
  [ ] Variant properties PascalCase, single-word values, hyphens for compound

Tokens:
  [ ] Every fill, stroke, text, icon, radius bound to a semantic
  [ ] No raw hex, no primitives in component CSS
  [ ] Untokenised values flagged in spec §15

Variants:
  [ ] Default variant declared
  [ ] All State Matrix states represented
  [ ] All responsive modes represented (where structural)

Annotations:
  [ ] Each instance labeled with its state
  [ ] Text styles use design system tokens
  [ ] No more than ~50 words per annotation

Cross-references:
  [ ] Each doc/governance/responsiveness section has the "Source of truth" note
  [ ] Spec §1.1 governance table reproduced in Governance section
  [ ] Spec §16 responsiveness summary reproduced in Responsiveness section
  [ ] Spec §17 (AI Agent Implementation Guide) exists in the spec MD
```

If any of these are red, run `/pathway:component-readiness` to see the specifics.
