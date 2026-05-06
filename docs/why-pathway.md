# Why Pathway

Pathway is Ministry Brands' design system. It is a platform layer, owned and maintained like our auth layer, our payment integration, and our database. This document exists so we do not relitigate what it is, why it exists, or whether we should "just use Material" every six months.

If you are about to ask "why don't we just adopt an off-the-shelf UI library and skip all this," read this first. The short answer is that we already do. The long answer is below.

---

## TL;DR

- **We already use off-the-shelf primitives.** Modern design systems are built on top of headless component libraries (Radix, shadcn, ariakit) that handle accessibility, keyboard behaviour, and focus management. Pathway sits on top of that foundation and adds our tokens, our composition, and our governance.
- **"Adopt Material" is not the alternative to a design system.** It is one. Adopting Material means importing Google's design language, then doing customization-on-top-of-Material to make it feel like Ministry Brands. That is not less design system work. It is the same work, with less control and more vendor coupling.
- **At our scale, ownership is non-negotiable.** A 5-person startup can adopt a third-party UI as-is and skate by. An organization with multiple product teams and millions of users cannot. Without an explicit, owned design system, we accumulate brand drift, accessibility debt, and inconsistency that becomes invisible until we are forced to re-platform.

---

## What Pathway actually is

Pathway is four things working together:

1. **Tokens.** Colours, typography, spacing, motion, all defined once in Figma and exported as variables that components and engineers consume. Tokens are the contract between design and code.
2. **Components.** React modules built on top of headless primitives (where suitable), styled with Pathway tokens, documented in a 17-section spec that covers anatomy, variants, states, accessibility, motion, responsiveness, and AI-agent integration.
3. **The Figma library.** The same components, organized so designers can drag them into screens with confidence that engineers will render the same thing.
4. **Governance.** The discipline of how tokens change, how components are added or updated, who reviews specs, how versions are released, and how downstream products consume the system.

The components are the visible part. The other three are the system. You can see one and not the other and still think you have a design system.

---

## What Pathway is not

Pathway is not a custom UI built from scratch.

We use established headless primitives (Radix, shadcn, ariakit, the W3C ARIA Authoring Practices) for the engineering work nobody benefits from re-inventing: ARIA roles, keyboard interaction, focus management, screen-reader semantics. These are solved problems. Solving them again is a waste.

What we add on top:

- **Our tokens** (Pathway colours, typography, spacing, not Google's, not Tailwind defaults).
- **Our composition rules** (when to use a Card vs a Tile, when a destructive action gets a confirmation, what an empty state must include).
- **Our specific patterns** (responsive shell architecture, the SideNav trail-collapsed state, our 48px touch target rule, our motion philosophy).
- **The Figma library** so designers and engineers work from the same source.
- **The spec discipline** so a component that lands in code matches the one in Figma matches the one in the documentation.

The primitives we depend on live in our repo. We own the code. If an upstream library pivots, gets acquired, or stops being maintained, we fork. We are not stuck.

---

## Why Ministry Brands needs this layer

Ministry Brands operates multiple product lines, multiple product teams, and serves a customer base that depends on consistent, accessible interfaces across long workflows. The reasons this needs an explicit design system are not aesthetic. They are operational.

### Scale produces drift unless something prevents it

When five teams ship buttons independently, you end up with five buttons. When you operate at scale without an enforced shared layer, every team makes its own micro-decisions. Padding drifts. Hover states diverge. Typography goes off-system. Six months later, screenshots from two products look like they belong to two companies. This is invisible to the people building it and obvious to customers.

### Accessibility debt is not a backlog item, it is a liability

Accessibility is not a feature you can defer. It is a requirement under WCAG 2.1 AA, increasingly under regulation, and a baseline expectation for the kinds of organizations that buy Ministry Brands software. Without a shared component layer that builds in correct ARIA, keyboard interaction, focus management, and contrast, every product team is responsible for getting it right independently. That does not happen. Bugs accumulate. Audits find them. Remediation is expensive and reputational.

### Brand drift erodes trust slowly

A consistent UI is a trust signal. Customers do not articulate this; they feel it. A product that feels coherent feels reliable. A product that feels stitched-together feels risky. At Ministry Brands' scale, where customers run mission-critical operations on our software, this matters more than it does for a consumer app.

### Maintaining anything we do not own at this scale costs more

This is the core argument and the one most often missed. The reason we own auth, payments, and our database is not that we could not buy them. We could. The reason is that at our scale, with our regulatory exposure and our integration surface, owning these layers is cheaper, safer, and more flexible over a multi-year horizon than renting them. Design system primitives are no different.

When you adopt Material wholesale, you inherit Google's release cadence, Google's deprecations, Google's design philosophy changes, and Google's customization ceiling. The ones we do not control will drive timelines we did not choose. With our own owned layer built on top of well-chosen primitives, the only thing we do not control is the primitive itself, and we have isolated that risk to a small, well-scoped surface that we can fork if we need to.

---

## The recurring questions

### "Why don't we just use Material Design?"

Material is a design language. It is not a substitute for a design system; it is one. Adopting Material means:

- Customizing colour, typography, density, and component variants to feel like Ministry Brands rather than Google. (Design system work.)
- Documenting our org-specific patterns Material does not cover. (Design system work.)
- Maintaining compatibility with Material updates that may or may not align with our roadmap. (Design system work, with extra constraint.)
- Training designers on Material's rules and conventions. (Design system work.)

The work does not go away. It moves, with less control. We trade ownership for the appearance of speed, and the appearance does not survive contact with a real product roadmap.

### "Why don't we just buy a UI kit?"

Same answer, different vendor. A purchased UI kit is fine for a small team building one product on a six-month horizon. At our scale, on a multi-year horizon, the costs of vendor coupling, customization ceilings, deprecation cycles, and licensing renegotiations add up faster than the cost of owning the layer ourselves. We have the engineering and design capacity to own this. The question is whether we use it.

### "Why don't we just use shadcn or Radix and skip the system layer?"

We do use them. They are the foundation Pathway is built on. They give us accessibility, keyboard behaviour, and focus management for free. They do not give us:

- A token system specific to Ministry Brands.
- A Figma library so designers can build screens.
- Composition rules (when to use a Card vs a Modal vs an Inline Drawer).
- Org-specific patterns (responsive shell architecture, SideNav trail state, our touch target rules).
- A spec discipline so what ships in code matches what is in Figma matches what is documented.
- Governance so changes are versioned, reviewed, and communicated.
- Training so the org uses the system the way it was intended.

The primitives are necessary. They are not sufficient. The design system is the work that turns primitives into a coherent product UI at scale.

### "Why does Figma matter? Engineers don't use Figma."

Designers do, and design happens before engineering. Without a Figma library that mirrors the code library, designers either invent components that do not exist (creating handoff conflicts), or they spend their time replicating components that already exist (wasting design capacity), or they hand off PNGs and hope (creating implementation drift). The Figma library is what makes design and engineering work from the same vocabulary. It is not optional for an org that has designers.

### "Why doesn't engineering own this?"

Engineering owns the runtime. Design owns the visual language. Both must be expressed in the system. A design system owned only by engineering produces components that work but feel inconsistent or off-brand. A design system owned only by design produces beautiful Figma files that engineering does not implement faithfully. Pathway has explicit co-authorship: design owns the spec sections about visual decisions, accessibility intent, and usage rules; engineering owns the prop types, ARIA implementation, and browser-specific behaviour. Neither signs off on the other's section. This is not a compromise. It is the model.

### "Don't AI tools make design systems unnecessary now?"

The opposite. AI codegen tools (v0, Lovable, Cursor, Figma Make) work by reading a system and generating against it. The clearer and more explicit the system, the better the output. An AI tool pointed at "make this look modern" generates incoherent output. An AI tool pointed at "use Pathway tokens, follow the spec at components/card/card-spec.md" generates a component that fits the system. AI tools are why the system matters more, not less. The system is the input. Without it, AI tools accelerate inconsistency.

---

## What happens if we do not own this layer

The failure mode is familiar to anyone who has watched it happen. It looks like this:

1. A team adopts Material (or shadcn, or Tailwind UI) without a token strategy.
2. A second team adopts the same library but customizes differently.
3. A third team builds custom components because the library does not cover their case.
4. Six months in, screenshots of three products look like three different companies.
5. Accessibility audits find inconsistent ARIA usage across products. Remediation is per-team, not centralized.
6. A new brand refresh lands. Each team has to rebrand independently, on different timelines, with different fidelity.
7. Customer feedback starts using words like "clunky" and "inconsistent" without being able to point at why.
8. Eighteen months in, leadership commissions a "design system initiative" to clean up the drift. The cost is several engineers, several designers, and 12 to 18 months of opportunity cost.

Pathway is the proactive version of that initiative. Doing it now is much cheaper than doing it later.

---

## Bottom line

Pathway exists because Ministry Brands is past the size where implicit design works. The choice is not "design system or no design system." It is "explicit design system or implicit one." Implicit ones produce drift, accessibility debt, brand inconsistency, and re-platform risk. Explicit ones cost engineering and design capacity in exchange for predictable, scalable, owned product UI.

We use off-the-shelf primitives. We layer our tokens, our specs, our Figma library, and our governance on top. We own the layer because at our scale, anything we do not own controls our timeline.

If a future version of this question gets raised, point at this document.

---

## When to revisit this question

This document gets revisited when:

- Ministry Brands changes scale by an order of magnitude (much smaller or much larger).
- The economics of headless primitives change materially (e.g., a vendor offers a fully maintained, tokenized, governance-included UI layer for less than the cost of our team).
- The accessibility regulatory environment shifts in a way that changes our calculus.
- We hit a sustained pattern where the design system is producing more cost than value (in which case we audit specifically what is broken, not whether the system should exist).

Until one of those conditions is met, the answer is the same: we own the layer because we have to.
