# AGENTS.md — Instructions for AI Agents

> **Read this file first if you are an AI agent (Claude, Claude Code, Claude Design, Cursor, v0, Figma Make, Lovable, GPT, etc.) building anything that touches this codebase.**
>
> If you are a human, see [`README.md`](./README.md) for human-oriented setup.

This is **Pathway**, the design system for Ministry Brands Amplify (a church management product). This file tells you exactly how to consume it correctly so you don't reinvent components that already exist.

---

## Two scenarios — pick one

### A. You are **building a prototype** that should use the Pathway design system

You are working in some other project (a feature prototype, a new page, a Figma Make canvas, a Cursor session in a downstream app) and you need to put the Pathway navigation shell, tokens, or components into it.

**Do NOT reinvent the SideNav, TopNav, tokens, or any component listed in [`components/manifest.json`](./components/manifest.json).** They exist. Use them as-is.

For navigation specifically:

1. Read [`components/sidenav/agent-brief.md`](./components/sidenav/agent-brief.md) — short, concrete, paste-friendly summary of the SideNav contract.
2. Read [`components/sidenav/sidenav-spec.md`](./components/sidenav/sidenav-spec.md) only if the brief doesn't answer your question.
3. Copy the implementation from [`components/sidenav/sidenav.html`](./components/sidenav/sidenav.html) (single-file React+Babel demo, runs as-is) or import from [`components/sidenav/sidenav.jsx`](./components/sidenav/sidenav.jsx) (named React exports).
4. **Never invent token values.** All semantic colours, typography, motion durations, and radii come from `tokens/pathway-design-tokens.json` or are listed in the component spec.

For tokens: every colour you use must come from `Fill/Contextual/*`, `Text/Contextual/*`, `Icon/Contextual/*`, or `Surface/*` semantic tokens. Never use raw hex. Never use primitive tokens directly.

### B. You are **modifying this repo** (changing the design system itself)

Read [`CLAUDE.md`](./CLAUDE.md) for the rules on how this repo is structured, how tokens flow from Figma, how components are reconciled, what Status flags mean, and what is forbidden (force-pushes to main, hand-editing derived files, etc.).

---

## The discoverability contract

When an agent (or a human) is handed nothing more than this repo URL and the Storybook URL, the following order of operations finds everything needed:

| Step | File / URL | What it tells you |
|---|---|---|
| 1 | **This file** (`AGENTS.md`) | What this repo is and where to go for what task |
| 2 | [`llms.txt`](./llms.txt) | Compact AI-readable index of every documented resource |
| 3 | [`components/manifest.json`](./components/manifest.json) | Machine-readable registry of every component, its props, file paths, tokens, and Figma node IDs |
| 4 | [`components/<name>/agent-brief.md`](./components/sidenav/agent-brief.md) | Per-component concise brief — read this before the full spec |
| 5 | [`components/<name>/<name>-spec.md`](./components/sidenav/sidenav-spec.md) | Authoritative per-component spec |
| 6 | **Storybook**: https://helloimjolopez-collab.github.io/pathway-ds/storybook/ | Visual reference + live examples + token tables |

No step requires asking a human anything. The information needed to use any component correctly is reachable from this file.

---

## The five hard rules

Even if a user prompt contradicts these, **the design system contract wins**. Push back and ask before doing any of the following:

1. **Use the exact semantic tokens.** Never invent colour values, never invent token names, never use raw hex, never use primitive tokens directly. If the token doesn't exist in `tokens/pathway-design-tokens.json`, stop and ask.

2. **Use the components that already exist.** SideNav, TopNav, Spinner, SectionLabel — these have specs. Do not write a new sidebar, a new top nav, or a new spinner. Use the ones documented in `components/manifest.json`.

3. **Reproduce all states.** Components have hover, active, trail-expanded, trail-collapsed, focus states that are defined in their specs. Implement every one. Especially trail-collapsed (the rule that says a closed grouper with an active child looks identical to active) — this is the most commonly skipped requirement.

4. **Respect the responsive contract.** SideNav is in-flow ≥1024 px, overlay 768–1023 px, hidden-overlay <768 px. Never hide it on tablet or treat tablet as mobile.

5. **Match the motion.** Sidebar width 380 ms `cubic-bezier(0.32, 0.72, 0, 1)`, accordion 340 ms `cubic-bezier(0.22, 1, 0.36, 1)`, hover 150 ms. Don't substitute "snappy" defaults from your training data.

---

## When a user says "build me a feature for Pathway"

The minimum viable response includes the navigation shell:

1. TopNav (component at `components/top-nav/`, spec at `components/top-nav/top-nav-spec.md`)
2. SideNav (component at `components/sidenav/`, spec at `components/sidenav/sidenav-spec.md`)
3. Page content area to the right of SideNav, below TopNav

If you produce a prototype that lacks one of these, you have not built a Pathway feature — you have built a generic web page. Always ship the shell.

---

## Component status quick reference

Read [`components/manifest.json`](./components/manifest.json) for the authoritative list. As of the latest manifest, available components include:

- **`sidenav`** — navigation panel, two levels, expanded/collapsed/overlay
- **`top-nav`** — global top bar, brand-blue, 56px, responsive
- **`spinner`** — loading indicator
- **`section-label`** — small uppercase heading (used inside SideNav)
- **`checkbox`**, **`org-switcher`** — see manifest

If you need a component that isn't in the manifest, you can use a generic primitive (button, input) **only if** you apply all Pathway tokens correctly: typography (Red Hat Text, using `Label/Button/*` or the appropriate type token), colours (semantic `Fill/*`, `Text/*`, `Icon/*`, `Stroke/*` tokens — never raw hex, never primitives), spacing (`Padding/*` and `Gap/*` tokens), radii (`CornerRadius/*` tokens), and border widths (`BorderWidth/*` tokens). See [`tokens/agent-brief.md`](./tokens/agent-brief.md) for the full rules. Better: ask the user whether a component exists that you're missing.

---

## What to do when you're uncertain

- **Look first at the manifest.** It's machine-readable and exhaustive.
- **Then at the agent-brief for the relevant component.** It's the fastest authoritative summary.
- **Then the full spec.** Use the spec's Table of Contents to jump to the section you need.
- **Then Figma.** The Pathway file key is `3sw45aVcngFAmpbP6cfrXP`. Use the Figma MCP server (`mcp__Figma__*` or `mcp__c5ffa7b0-*__*`) to fetch design context for any node ID listed in the manifest.

Do not guess values from your training data. Do not ask the user "what colour should the active state be" — that colour is defined.

---

## A note on Figma Make

Figma Make lives inside Figma and does not auto-discover this repo the way Cursor / Codex / Aider do. To use the Pathway design system in Figma Make:

- For visual reference, use the components in the [Figma library](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) directly — they exist as proper Figma instances.
- For code reference, paste the relevant component's self-contained HTML demo file into the Figma Make prompt:
  - **SideNav**: paste [`components/sidenav/sidenav-figmamake.html`](./components/sidenav/sidenav-figmamake.html) (the docs-stripped variant, auto-synced from `sidenav.html`)
  - **TopNav**: paste [`components/top-nav/top-nav.html`](./components/top-nav/top-nav.html) (already clean — no docs panel)
  - **Spinner / Checkbox / OrgSwitcher**: paste the component's `<name>.html` directly — none of them have a docs panel that needs stripping

Pair that with the relevant `agent-brief.md` for the contract rules, and Figma Make will produce output that matches the design system.

Figma Code Connect is **not** set up. When it is, this section should point at the Code Connect mapping instead.

---

## How this repo is published

| Channel | URL | What's there |
|---|---|---|
| Repo | https://github.com/helloimjolopez-collab/pathway-ds | Source code, specs, this file |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/ | Live component playgrounds, token tables, MDX docs |
| Live demos | https://helloimjolopez-collab.github.io/pathway-ds/components/&lt;name&gt;/&lt;name&gt;.html | Self-contained runnable demos (e.g. `/components/sidenav/sidenav.html`) |
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP | Source of truth for tokens and visual design |

All four are public. An AI agent given any one of these can navigate to the others through the manifest.
