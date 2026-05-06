# Why Pathway

This document exists to kill one recurring question: "why don't we just use Material / shadcn / something off-the-shelf instead of building Pathway?"

We already do.

Pathway is built on top of headless component libraries (Radix, shadcn, ariakit). They provide the engineering foundations nobody benefits from re-implementing: ARIA, keyboard interaction, focus management, screen reader semantics. Pathway adds what those libraries cannot: our tokens, our composition rules, our org-specific patterns, our accessibility decisions, our content standards, and the governance that holds them together.

Adopting Material wholesale is not the alternative to having a design system. It is one. It just means inheriting Google's design system and customizing it. The work of customization, integration, training, and governance does not disappear. The choice is between owning that work or renting it. At Ministry Brands' scale, ownership is the same operating decision we make for every other platform layer.

That is the answer.
