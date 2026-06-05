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
- **`section-label`** / **`nav-section-label`** — small uppercase headings, exported as `SectionLabel` and `NavSectionLabel` from `components/sidenav/sidenav.jsx`. Not a standalone component folder — import directly from sidenav.
- **`checkbox`**, **`org-switcher`** — see manifest

**Every icon in this system uses Material Symbols Rounded.** Rules every agent must follow without exception:

- **Library:** Material Symbols Rounded only. Never Outlined, never Sharp, never a custom SVG for any icon that exists in the library.
- **CSS class:** `material-symbols-rounded`
- **Google Fonts CDN:** `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`
- **Icon name = Figma layer name.** When reading a component from Figma via `get_design_context`, the icon frame's `data-name` attribute (e.g. `data-name="search"`, `data-name="filter_alt"`) is the exact ligature string to use in code. Never guess an icon name from a visual description.
- **FILL is per-component — always read from Figma.** FILL=0 = outlined (hollow); FILL=1 = filled (solid). Do not assume a default. Check the Figma component to see which variant is used and match it exactly. Each component's spec documents its correct FILL value in its iconography section.
- **Variation settings:** `font-variation-settings: 'FILL' <0or1>, 'wght' 400, 'GRAD' 0, 'opsz' 20` (use `opsz: 24` for icons rendered above 20px)
- **Markup:** `<span class="material-symbols-rounded">icon_name</span>`

This rule applies to every component, demo, story, spec, prototype, and agent brief.

If you need a component that isn't in the manifest, use **[Radix UI](https://www.radix-ui.com/)** as the headless base (it handles ARIA, keyboard, and focus management correctly, and is the same foundation Pathway components are built on). Do **not** use Material UI — it carries Google's visual language and will conflict with Pathway tokens. Then apply all Pathway tokens to the Radix primitive: typography (Red Hat Text, using `Label/Button/*` or the appropriate type token), colours (semantic `Fill/*`, `Text/*`, `Icon/*`, `Stroke/*` tokens — never raw hex, never primitives), spacing (`Padding/*` and `Gap/*` tokens), radii (`CornerRadius/*` tokens), and border widths (`BorderWidth/*` tokens). See [`tokens/agent-brief.md`](./tokens/agent-brief.md) for the full token rules. Better: ask the user whether a Pathway component exists before reaching for a primitive.

---

## Implementation anti-patterns — things that will break and why

These are mistakes real agents (including Claude Code) have made when implementing Pathway components. Read these before writing any code.

### 1. Reimplementing a component instead of importing it

**Wrong:** Writing fresh CSS for a TopNav or SideNav from scratch when building a composite.
**Right:** Import from the `.jsx` module. Read the `agent-brief.md` for the import path.

Fresh CSS will miss rail alignment, transition curves, hover tokens, and state logic that the `.jsx` has already solved. One wrong token and everything is off.

**HTML demos are visual previews — not code to copy from.** See "What are the implementation artifacts?" above.

### 2. Reading any file other than .jsx + spec + tokens.css as the implementation reference

The implementation artifacts are: `.jsx` module + `src/tokens/tokens.css` + `NAME-spec.md`. Everything else (HTML demos, Storybook stories, Figma screenshots) is a visual reference. When any of these conflict with the `.jsx`, the `.jsx` wins.

**Specific risk:** The spec may have a "Migration note" section flagging that an old behaviour has changed. Search the spec for "Migration note" before writing any code.

### 3. Deriving layout from Figma tree structure, not measurements

**Wrong:** Reading that `Slot.RowStart` contains `ModuleSwitcher` then `OrgSwitcher` and assuming gap=0 because they share a flex container.
**Right:** Read the `x`, `y`, `width`, `height` from `get_metadata`. The gap = `OrgSwitcher.x - (ModuleSwitcher.x + ModuleSwitcher.width)`. Always use coordinate arithmetic for gaps, not assumptions.

### 4. Not wiring up interactive state that the spec describes

If a spec section says "tapping the search icon collapses the bar" — there must be an `onClick` on that icon that calls `collapse()`. Aria labels that say "Collapse search" are NOT sufficient. The interactive behaviour must be in the `onClick` handler, not just the label.

Always check: for every interactive element, is there a handler that matches what the spec says will happen?

### 5. Ignoring the `overflow: hidden` on parent containers

Active indicator stripes, tooltips, and dropdown panels often need to escape their parent container. If the parent has `overflow: hidden`, any absolutely-positioned child at a negative coordinate will be clipped. Either:
- Use `position: fixed` with `getBoundingClientRect()` for portals
- Or adjust the indicator position to stay inside the visible area

---

## What to do when you're uncertain

- **Look first at the manifest.** It's machine-readable and exhaustive.
- **Then at the agent-brief for the relevant component.** It's the fastest authoritative summary.
- **Then the full spec.** Use the spec's Table of Contents to jump to the section you need.
- **Then Figma.** The Pathway file key is `3sw45aVcngFAmpbP6cfrXP`. Use the Figma MCP server (`mcp__Figma__*` or `mcp__c5ffa7b0-*__*`) to fetch design context for any node ID listed in the manifest.

Do not guess values from your training data. Do not ask the user "what colour should the active state be" — that colour is defined.

---

## What are the implementation artifacts?

HTML demos (`*.html`) are **visual previews for designers** — open them in a browser to see how a component looks and behaves in context. They are not implementation references. Do not copy code from them.

**For implementing a component (whether you are a developer, Claude, Lovable, Figma Make, or any other agent):**

| What you need | Where to find it |
|---|---|
| The component itself (React) | `components/NAME/NAME.jsx` — import from this |
| Token CSS variables | `src/tokens/tokens.css` — import or link this |
| Rules, states, props | `components/NAME/NAME-spec.md` |
| Quick copy-paste reference | `components/NAME/agent-brief.md` |
| Visual verification | Storybook: https://helloimjolopez-collab.github.io/pathway-ds/storybook/ |

**Storybook is for visual verification.** HTML demos are for designer preview. Neither is the implementation artifact. The implementation artifacts are the `.jsx` module + `tokens.css` + spec.

---

## A note on Figma Make

Figma Make lives inside Figma. To implement Pathway components accurately in Figma Make:

1. **Paste the `agent-brief.md`** for the component you need — it contains the import contract, token names, props, and key rules in a compact paste-friendly format.
2. **Reference the Figma components** directly in the [Pathway Figma file](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/) — they exist as proper Figma instances with variables bound.
3. **Do not paste the `.html` demo source** — HTML demos are visual previews, not implementation references.

| Component | Agent brief |
|---|---|
| SideNav | [`components/sidenav/agent-brief.md`](./components/sidenav/agent-brief.md) |
| TopNav | [`components/top-nav/agent-brief.md`](./components/top-nav/agent-brief.md) |
| OrgSwitcher | [`components/org-switcher/agent-brief.md`](./components/org-switcher/agent-brief.md) |
| Search | [`components/search/agent-brief.md`](./components/search/agent-brief.md) |
| NavShell | [`components/nav-shell/agent-brief.md`](./components/nav-shell/agent-brief.md) |
| Button | [`components/button/agent-brief.md`](./components/button/agent-brief.md) |
| Spinner | [`components/spinner/agent-brief.md`](./components/spinner/agent-brief.md) |
| Checkbox | [`components/checkbox/agent-brief.md`](./components/checkbox/agent-brief.md) |

Figma Code Connect is **not** set up. When it is, this section should point at the Code Connect mapping instead.

---

## When a component you need doesn't exist

If you need to build something and **no entry exists in [`components/manifest.json`](./components/manifest.json) for it** — a Button, a Modal, a Card, a Table row, whatever — do not invent a new component. Do this instead:

1. **Build it once, in place, with semantic tokens only.** Use the recipe in [`tokens/agent-brief.md`](./tokens/agent-brief.md) under "What if no Pathway component exists". Every colour, radius, spacing, and motion value must come from the documented token families. Never hardcode hex. Never invent token names.

2. **Mark it visibly.** Add a comment in your code: `// [NEW COMPONENT — needs DS owner review]`. In any spec or handoff you produce, flag it under a "**Design system gaps**" section so the human reviewing the work can see what needs to be promoted into the system.

3. **Surface the gap to the human.** Say plainly: "I needed a `<thing>` but no Pathway component exists for it. I've built it ad-hoc with semantic tokens — the design system owner should review whether this should become a real component." This is how gaps get fixed, not how they hide.

**Never invent a new component silently.** A custom button styled with `Fill/Action/Primary/Base` is a visible gap the DS owner can promote into the system. A custom button styled with `#2d4889` is a bug that disappears into the prototype and quietly breaks the system over time.

---

## How this repo is published

| Channel | URL | What's there |
|---|---|---|
| Repo | https://github.com/helloimjolopez-collab/pathway-ds | Source code, specs, this file |
| Storybook | https://helloimjolopez-collab.github.io/pathway-ds/storybook/ | Live component playgrounds, token tables, MDX docs |
| Live demos | https://helloimjolopez-collab.github.io/pathway-ds/components/&lt;name&gt;/&lt;name&gt;.html | Self-contained runnable demos (e.g. `/components/sidenav/sidenav.html`) |
| Figma | https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP | Source of truth for tokens and visual design |

All four are public. An AI agent given any one of these can navigate to the others through the manifest.
