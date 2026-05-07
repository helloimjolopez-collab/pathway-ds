# Why Pathway

> Have you recently found yourself wondering, why do we even need a design system? Why don't we just use something off-the-shelf and get going?! - then this read is for you. (4 min read.)

Pathway is Ministry Brands' Design System. It is a platform layer, owned and maintained the same way an auth layer or a codebase is. It is the governance layer through which the product design function delivers a reliable, accessible, and scalable product experience across our product portfolio.

When a product organization grows past the point where one team can hold the entire user experience in their head, the outputs of the design function need explicit governance. Without it, decisions are made and remade per team, per feature, per quarter. Patterns drift. Accessibility implementation diverges. The shared vocabulary across teams erodes. The product experience becomes fragmented and inconsistent in ways that compound into accessibility liability, customer trust erosion, and the kind of debt that eventually demands a re-platform.

The design system is the governance layer that prevents this. It is the standards, contracts, and shared vocabulary the design function uses to deliver consistent product experiences across teams and across time. It is not a UI kit, and it is not a pile of components. It is the operational discipline of a design function at scale, expressed as artifacts (tokens, components, patterns, specs) and as processes (review, versioning, training, governance).


## What Pathway actually is

Pathway is 3 things working together:

1. **Design Tokens.** Colours, typography, spacing, motion, all defined once in Figma and exported as variables that components and engineers consume. Tokens are the contract between design and code.
2. **Components & Specs.** Built on top of headless primitives (where suitable), styled with Pathway tokens, documented in a spec that covers anatomy, variants, states, accessibility, motion, responsiveness, do's and don'ts, decision-making intelligence, and AI-agent integration.
3. **Governance.** The discipline of how tokens change, how components are added or updated, who reviews specs, how versions are released, and how downstream products consume the system.


## Pathway already uses off-the-shelf primitives

Pathway is not a custom UI built from scratch. We build on established headless component libraries (Radix, shadcn, ariakit) for the engineering work nobody benefits from re-implementing: ARIA roles, keyboard interaction, focus management, screen reader semantics. The components live in our codebase, so we own the code. If an upstream library pivots, gets acquired, or stops being maintained, we fork. We are not stuck.

On top of those primitives, the design function adds what no external library can provide:

- Our tokens (Pathway colours, typography, spacing, not Google's, not Tailwind defaults).
- Our composition rules (when to use a Card vs a Tile, when a destructive action gets a confirmation, what an empty state must include - this is our intelligent decision-making layer, the difference between an AI agent prompted with our design system making a really fabulous prototype and one making rookie mistakes that waste your usage credits).
- Our specific patterns (responsive shell architecture, the SideNav trail-collapsed state, our 48px touch target rule, our motion philosophy).
- The Figma library so designers and engineers work from the same source.
- The spec discipline so a component that lands in code matches the one in Figma matches the one in the documentation.

This is how every modern design system is built. The primitives are necessary. They are not sufficient. The system is what turns them into a coherent product experience at scale.


## TLDR

**We already use off-the-shelf primitives.** Pathway sits on top of headless component libraries (Radix, shadcn, ariakit) and adds our tokens, our composition, and our governance.

**"Just use Material" is not an alternative to a design system.** Adopting Material means importing Google's design language, then doing customization work to make it feel like Ministry Brands. That is not less design system work. It is the same work, with less control and more vendor coupling.

**At our scale, ownership is non-negotiable.** A 5-person startup can adopt a third-party UI as-is and skate by. An organization with multiple product teams and millions of users cannot. Without an explicit, owned design system, we accumulate brand drift, accessibility debt, and inconsistency that becomes invisible until we are forced to re-platform.


## "Pathway is slowing me down right now. Just let me use something off-the-shelf and ship."

The frustration is real. When the design system is half-built, every team that runs into a missing component, an unfinished spec, or a token that does not exist yet pays the cost. The instinct to grab whatever is available off-the-shelf and ship makes complete sense.

The instinct is correct. The conclusion is the wrong one.

Scrapping Pathway and adopting an off-the-shelf UI does not actually unblock anyone. The work covered above (tokens, composition rules, org-specific patterns, accessibility decisions, governance, training) still has to happen, and now it has to happen on top of someone else's foundation, with less control and a longer timeline. The frustration moves. It does not go away.

The right move is the opposite of "scrap it." **Invest in finishing Pathway.** The work to bring it to coverage and maturity is measured in months, not years. Every team that has been held back is the strongest argument for prioritising that investment now. Once Pathway is mature, everyone goes back to "just use what's there and move fast." Except what is there is ours, fits Ministry Brands, and does not silently produce the inconsistency that will cost us later.

The speed argument cuts both ways. You will not be faster long-term by skipping the design system. You will be faster long-term by investing in it now so it stops being half-built.


## "Why don't we just adopt Material, or buy a UI kit?"

Same answer for both: the work does not go away, it just changes who owns the source of the patterns. Customization, integration, training, and ongoing maintenance still fall to the design function, with less control and a different set of constraints. There is no version of "skip the design system" that holds at our scale. The choice is between owning the layer or renting it. Renting is sometimes the right call for smaller organizations on shorter horizons. At our scale, with our regulatory exposure and our integration surface, ownership is the operating decision that matches every other platform layer we own.


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

Product Experience is authored in Figma. That is where decisions become artifacts and where the design function does its work. The source of truth for the design system lives there because that is where it is made. This is a fact about the current toolchain, not the rationale for the system. Whatever the authoring environment is at any given moment, the design function needs ownership over its standards, its outputs, and its evolution. If the authoring environment changes (as it well may), the design system moves with it.


## "Don't AI tools make design systems unnecessary now?"

The opposite. AI codegen tools (v0, Lovable, Cursor, Figma Make) work by reading a system and generating against it. The clearer and more explicit and robust the system, the better the output. An AI tool pointed at "make this look modern" generates incoherent output. An AI tool pointed at "use Pathway tokens, follow the spec at components/card/card-spec.md" generates a component that fits the system. AI tools are why the system matters more, not less. The system is the input. Without it, AI tools accelerate inconsistency.


## Bottom line

Pathway is Ministry Brands' design system. Ministry Brands is past the size where implicit design works. The choice is not "design system or no design system." It is "explicit design system or implicit one." Implicit ones produce drift, accessibility debt, brand inconsistency, and re-platform risk. Explicit ones cost engineering and design capacity in exchange for predictable, scalable, owned product UI.
