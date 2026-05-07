# Why Pathway

Pathway is Ministry Brands' Design System. It is a platform layer, owned and maintained - think about it like an auth layer or a codebase.

It is the governance layer through which the product design function delivers a reliable, accessible, and scalable product experience across our product portfolio. This document explains what it is and why an organization at our scale operates one.

When a product organization grows past the point where one team can hold the entire user experience in their head, the outputs of the design function need explicit governance. Without it, decisions are made and remade per team, per feature, per quarter. Patterns drift. Accessibility implementation diverges. The shared vocabulary across teams erodes. The product experience becomes inconsistent, and fragmented in ways that compound into accessibility liability, customer trust erosion, and the kind of debt that eventually demands a re-platform.

The design system is the governance layer that prevents this. It is the standards, contracts, and shared vocabulary that the design function uses to deliver consistent product experiences across teams and across time. It is not a UI kit, and it is not a pile of components. It is the operational discipline of a design function at scale, expressed as artifacts (tokens, components, patterns, specs) and as processes (review, versioning, training, governance).


## What Pathway actually is

Pathway is 3 things working together:

1. **Design Tokens.** Colours, typography, spacing, motion, all defined once in Figma and exported as variables that components and engineers consume. Tokens are the contract between design and code.
2. **Components & Specs.** Built on top of headless primitives (where suitable), styled with Pathway tokens, documented in a spec that covers anatomy, variants, states, accessibility, motion, responsiveness, do's and don'ts, decision making intelligence, and AI-agent integration.
3. **Governance.** The discipline of how tokens change, how components are added or updated, who reviews specs, how versions are released, and how downstream products consume the system.


## Pathway already uses off-the-shelf primitives

Pathway is not a custom UI built from scratch.

We do not invent UI components from scratch. We build on established headless component libraries (Radix, shadcn, ariakit) for the engineering work that nobody benefits from re-implementing: ARIA roles, keyboard interaction, focus management, screen reader semantics. The components live in our codebase, so we own the code. If an upstream library pivots, we are not stuck.

On top of those primitives, the design function delivers what no external library can provide: our tokens, our composition rules, our org-specific patterns, our accessibility decisions, our content standards, our governance, and the training that turns the system into something the org can actually use. This is how every modern design system is built. The primitives are necessary. They are not sufficient. The system is what turns them into a coherent product experience at scale.

What we add on top:

- Our tokens (Pathway colours, typography, spacing, not Google's, not Tailwind defaults).
- Our composition rules (when to use a Card vs a Tile, when a destructive action gets a confirmation, what an empty state must include, this is our intelligent decision making layer - makes the difference between an AI agent prompted with our design system, making a really fabulous prototype and one making rookie mistakes and wasting away your usage).
- Our specific patterns (responsive shell architecture, the SideNav trail-collapsed state, our 48px touch target rule, our motion philosophy).
- The Figma library so designers and engineers work from the same source.
- The spec discipline so a component that lands in code matches the one in Figma matches the one in the documentation.

The primitives we depend on live in our repo. We own the code. If an upstream library pivots, gets acquired, or stops being maintained, we fork. We are not stuck.


## TLDR

**We already use off-the-shelf primitives.** Modern design systems are built on top of headless component libraries (Radix, shadcn, ariakit) that handle accessibility, keyboard behaviour, and focus management. Pathway sits on top of that foundation and adds our tokens, our composition, and our governance.

**"Just Use Material" is not an alternative to a design system.** Adopting Material means importing Google's design language, then doing customization-on-top-of-Material to make it feel like Ministry Brands. That is not less design system work. It is the same work, with less control and more vendor coupling.

**At our scale, ownership is non-negotiable.** A 5-person startup can adopt a third-party UI as-is and skate by. An organization with multiple product teams and millions of users cannot. Without an explicit, owned design system, we accumulate brand drift, accessibility debt, and inconsistency that becomes invisible until we are forced to re-platform.


## Why Ministry Brands needs this layer

Ministry Brands operates multiple product lines, multiple product teams, and serves a customer base that depends on consistent, accessible interfaces across long workflows. The reasons this needs an explicit design system are not aesthetic. They are operational.


### Scale produces drift unless something prevents it

When five teams ship buttons independently, you end up with five buttons. When you operate at scale without an enforced shared layer, every team makes its own micro-decisions. Padding drifts. Hover states diverge. Typography goes off-system. Six months later, screenshots from two products look like they belong to two companies. This is invisible to the people building it and obvious to customers.


### Accessibility debt is not a backlog item, it is a liability

Accessibility is not a feature you can defer. It is a requirement under WCAG 2.1 AA, increasingly under regulation, and a baseline expectation for the kinds of organizations that buy Ministry Brands software. Without a shared component layer that builds in correct ARIA, keyboard interaction, focus management, and contrast, every product team is responsible for getting it right independently. That does not happen. Bugs accumulate. Audits find them. Remediation is expensive and reputational.


### Brand drift erodes trust slowly

A consistent UI is a trust signal. Customers do not articulate this; they feel it. A product that feels coherent feels reliable. A product that feels stitched-together feels risky. At Ministry Brands' scale, where customers run mission-critical operations on our software, this matters more than it does for a consumer app.


## "Pathway is slowing me down right now. Just let me use something off-the-shelf and ship."

The frustration is real. When the design system is half-built, every team that runs into a missing component, an unfinished spec, or a token that does not exist yet pays the cost. The instinct to grab whatever is available off-the-shelf and ship makes complete sense.

The instinct is correct. The conclusion is the wrong one.

Scrapping Pathway and adopting an off-the-shelf UI does not actually unblock anyone. The work covered above (tokens, composition rules, org-specific patterns, accessibility decisions, governance, training) still has to happen, and now it has to happen on top of someone else's foundation, with less control and a longer timeline. The frustration moves. It does not go away.

The right move is the opposite of "scrap it." **Invest in finishing Pathway.** The work to bring it to coverage and maturity is measured in months, not years. Every team that has been held back is the strongest argument for prioritising that investment right now. Once Pathway is mature, everyone goes back to "just use what's there and move fast." Except what is there is ours, fits Ministry Brands, and does not silently produce the inconsistency that will cost us later.

The speed argument cuts both ways. You will not be faster long-term by skipping the design system. You will be faster long-term by investing in it now so it stops being half-built.


## "Why don't we just use Material Design?"

Adopting Material means:

- Customizing colour, typography, density, and component variants to feel like Ministry Brands rather than Google. (Design system work.)
- Documenting our org-specific patterns Material does not cover. (Design system work.)
- Maintaining compatibility with Material updates that may or may not align with our roadmap. (Design system work, with extra constraint.)
- Training designers on Material's rules and conventions. (Design system work.)

The work does not go away. It moves, with less control. We trade ownership for the appearance of speed, and the appearance does not survive contact with a real product roadmap.


## "Why don't we just buy a UI kit?"

Same answer, different vendor. Adopting Material, or any other comprehensive design system from another organization, does not eliminate the design function or its governance work. It changes who owns the source of the patterns. The work of customization, integration, training, and ongoing maintenance still falls to the design function, with less control and a different set of constraints. There is no version of "skip the design system" that holds at our scale. The choice is between owning the layer or renting it. Renting is sometimes the right call for smaller organizations on shorter horizons. At our scale, with our regulatory exposure and our integration surface, ownership is the operating decision that matches every other platform layer we own.


## "Why don't we just use shadcn or Radix and skip the system layer?"

We do use them. They are the foundation Pathway is built on. They give us accessibility, keyboard behaviour, and focus management for free. They do not give us:

- A token system specific to Ministry Brands.
- A Figma library so designers can build screens.
- Composition rules (when to use a Card vs a Modal vs an Inline Drawer).
- Org-specific patterns (responsive shell architecture, SideNav trail state, our touch target rules).
- A spec discipline so what ships in code matches what is in Figma matches what is documented.
- Governance so changes are versioned, reviewed, and communicated.
- Training so the org uses the system the way it was intended.

The primitives are necessary. They are not sufficient. The design system is the work that turns primitives into a coherent product UI at scale.


## "Why does Figma matter? Engineers don't use Figma."

Product Experience is authored in Figma. That is where decisions become artifacts and where the design function does its work. The source of truth for the design system lives there because that is where it is made. This is a fact about the current toolchain, not the rationale for the system. The rationale for owning a design system is the same as the rationale for owning a design function: at our scale, the work produces outcomes the organization depends on, and the function needs the means to do it well. Whatever the authoring environment is at any given moment, the design function needs ownership over its standards, its outputs, and its evolution.

If the authoring environment changes (as it well may), the design system moves with it. The argument for an owned, governed design system does not depend on any particular tool.


## "Don't AI tools make design systems unnecessary now?"

The opposite. AI codegen tools (v0, Lovable, Cursor, Figma Make) work by reading a system and generating against it. The clearer and more explicit and robust the system, the better the output. An AI tool pointed at "make this look modern" generates incoherent output. An AI tool pointed at "use Pathway tokens, follow the spec at components/card/card-spec.md" generates a component that fits the system. AI tools are why the system matters more, not less. The system is the input. Without it, AI tools accelerate inconsistency.


## Still, what if we do not do it?

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


## Bottom line

Mature organizations do not relitigate whether they need a research function, a legal function, or a design function. The functions exist because the work they do is required at the scale the organization operates. What each function produces needs governance. The governance is named differently for each one: research has methodology and ethics review, legal has compliance and contracts, design has the design system.

Pathway is Ministry Brands' design system. Ministry Brands is past the size where implicit design works. The choice is not "design system or no design system." It is "explicit design system or implicit one." Implicit ones produce drift, accessibility debt, brand inconsistency, and re-platform risk. Explicit ones cost engineering and design capacity in exchange for predictable, scalable, owned product UI.
