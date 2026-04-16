# Designer's Figma Prep Checklist

Complete these before handing off a component for implementation. Each item directly enables a step in the pipeline — skipping one means the agent has to guess or come back and ask you.

## 1. Component structure

- [ ] Component is published to the Figma library (not a local component)
- [ ] Component uses Auto Layout (not absolute positioning) — enables accurate spacing extraction
- [ ] Component variants are organized in a **Component Set** with named properties (not loose frames)
- [ ] Every variant property has a descriptive name (`State=Active`, `Size=Large` — not `Variant 2`)

**Why it matters:** the agent uses `get_design_context` and `get_context_for_code_connect` to extract the component. Unnamed variants produce meaningless prop names in the generated code.

## 2. Variables and tokens

- [ ] All colours are bound to **semantic** variables (not raw hex fills, not primitives)
- [ ] All spacing values use Figma variables or are annotated with their intended token name
- [ ] All typography uses Figma text styles bound to variables
- [ ] Border radius, border width, and shadow values use variables where tokens exist
- [ ] No fills reference primitive variables directly — only semantic variables

**Why it matters:** the agent calls `get_variable_defs` to extract the component's token bindings. Missing variable bindings mean the agent must guess the token mapping or use raw hex (which violates the colour rules in CLAUDE.md §6).

## 3. States and interactions

- [ ] Every interactive state has its own variant or is clearly documented: **Base, Hover, Active, Focused, Disabled**
- [ ] State transitions (hover timing, animation curves) are annotated on the component page
- [ ] Reduced-motion behaviour is noted (what changes under `prefers-reduced-motion: reduce`)

**Why it matters:** the state matrix in the spec (see sidenav-spec.md §6 for the canonical example) comes directly from these variants. Missing states produce gaps in the spec.

## 4. Responsive behaviour

- [ ] Breakpoint-specific layouts are represented as separate variants or frames
- [ ] Width constraints (`min`/`max`/`fixed`/`hug`) are set on all key containers
- [ ] The component page documents which breakpoints exist and what changes at each

**Why it matters:** the responsive behaviour table in the spec needs this. Missing breakpoint frames mean the agent cannot determine how the component behaves on tablet or mobile.

## 5. Accessibility

- [ ] Minimum touch target size (48 × 48 px) is met or annotated as intentionally smaller
- [ ] Focus order is documented (if non-obvious from visual layout)
- [ ] ARIA role and label are annotated for non-obvious elements
- [ ] Colour contrast ratios are verified for all text-on-background combinations

**Why it matters:** the accessibility section of the spec (§13 in sidenav-spec) cites these directly. Missing annotations mean the agent must make assumptions about focus order, ARIA roles, and contrast — which it will usually get wrong.

## 6. Handoff metadata

- [ ] The component's Figma **node URL** is recorded and will go into the spec's "Figma source" section. This is load-bearing — the reconciliation pipeline (CLAUDE.md §3) uses it to find the component when tokens change.
- [ ] Icon assets are exported as SVG or use the shared icon library
- [ ] The component page has a title and description
- [ ] Any known gaps or deferred decisions are listed on the component page (they'll be transferred to §11 "Gaps" in the spec)

## Quick self-test

Before handing off, ask yourself:

> "If I select this component in Figma and an AI agent runs `get_design_context` + `get_variable_defs` + `get_screenshot`, will it get back everything it needs to build the spec and the React component without messaging me?"

If the answer is no, fill the gap before handing off. Every round-trip costs more than doing it up front.
