# Storybook Authoring Standards

Rules for every component's Storybook presence. These exist because the default Storybook output — controls under a buried Primary story, reference tables only, no visual anchor between a control and the thing it changes — is hard for humans to read. Every Pathway component's docs page must read like its spec: narrative prose, illustrated with live demos, with controls anchored to the component they control.

## The required structure for every component MDX

Every `src/stories/Library/<Name>/<Name>.mdx` follows this top-to-bottom sequence. Skip a section only if it genuinely doesn't apply to the component.

```mdx
import { Meta, Title, Canvas, Controls } from "@storybook/blocks";
import * as Stories from "./<Name>.stories.jsx";

<Meta of={Stories} />

<Title />

### Resources

- 🖼️ **[Live HTML demo](https://helloimjolopez-collab.github.io/pathway-ds/components/<name>/<name>.html)**
- 📄 **[Spec](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/<name>/<name>-spec.md)**
- 🎨 **[Figma](https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/?node-id=<nodeId>)** — node `<nodeId>`
- 💻 **[React module](https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/<name>/<name>.jsx)**

{/* 0. RESOURCES / LINKS BLOCK — ALWAYS the first thing after <Title />, before prose.
       Links live at the TOP, never buried at the bottom of a long page. A reader (or
       agent) must reach the Figma node, spec, demo, and source without scrolling. */}

---

{/* 1. Two-to-four paragraphs of prose: what this is, when to use it,
       what it's NOT. Same register as the spec overview. */}

---

## Try it

<Canvas of={Stories.Playground} />
<Controls of={Stories.Playground} />

{/* 2. Playground story + its controls, always at the top. The user
       sees the component FIRST, not a reference table. */}

---

## Anatomy

{/* 3. ASCII tree or labelled diagram, with prose explaining WHY the
       structure is what it is. */}

---

## States

<Canvas of={Stories.StateMatrix} />

{/* 4. State matrix rendered as LIVE COMPONENTS in a grid, not a
       markdown table. Each state shown visibly with the tokens that
       drive it listed below. Prose explains state logic rules. */}

---

## Explore a single unit

<Canvas of={Stories.ElementExplorer} />
<Controls of={Stories.ElementExplorer} />

{/* 5. An isolation story — the smallest unit of the component with
       its own controls. Lets users experiment with label / state /
       single-variant without the full-component noise. */}

---

## Token mappings

{/* 6. Tokens shown as rows: semantic name · swatch · hex. Never as a
       dense text table. Split into Fill / Text / Icon / Surface /
       Geometry / Typography sections as needed. */}

<Canvas of={Stories.TokensFill} />
<Canvas of={Stories.TokensText} />
<Canvas of={Stories.TokensIcon} />

---

## Responsive behaviour

{/* 7. Per-breakpoint summary + iframed standalone demo for hands-on
       resize testing. */}

<Canvas of={Stories.StandaloneDemo} />

---

## Accessibility

{/* 8. Table + prose. Describe what AT announces, what keyboard does,
       what focus looks like. Cite the overarching design-system spec
       (docs/design-system-spec.md §Accessibility) for system-wide
       rules rather than duplicating them. */}

---

## Full specification

{/* 9. Link to the component's -spec.md. */}

The authoritative spec lives at [`components/<name>/<name>-spec.md`](...).
```

## Hard rules

0. **Resources/links block at the very top.** A `### Resources` list (HTML demo, spec, Figma node, React module) goes immediately after `<Title />`, before any prose — never at the bottom of the page. The reader must reach the artefacts without scrolling. The same applies to `*-spec.md`: a `## Links` section sits near the top, right after the overview, not as a trailing numbered section.
1. **Playground at the top, never the bottom.** Readers see the component before the reference material.
2. **Controls anchored to visible demos.** Use `<Controls of={Stories.SomeStory} />` — never let `<Controls />` float disconnected from its target.
3. **State matrices are rendered components.** A table of strings like "NavItem/Hover → #1111110a" is not enough. Render the actual item in each state. Show the tokens beneath it as inline code chips, not as another table cell.
4. **Token rows have three columns.** Semantic name (as code), a real colour swatch sized to be visible, the hex value (as code). Nothing else on the row.
5. **No "see the spec for details" punts.** Either explain it here with a visual, or don't include the section. The Full Specification link at the bottom is for depth, not for delegating every explanation.
6. **Prose explains why, not what.** A reader can see what the component does from the Canvas. The text should explain why it does it that way — design rationale, trade-offs, edge cases.
7. **Stories render the REAL component — never a reimplementation.** Import the component from `components/<name>/<name>.jsx` and render it. Do not re-build the component's markup inside the stories file (a "mock" nav/card/etc.). A thin adapter that maps flat Controls args onto the real component's props is fine; a parallel reimplementation is a bug — it drifts from the shipped component and silently lies about what users get. If the real component lacks a hook the stories need (e.g. pre-opening a panel for a snapshot story), add a small prop to the real component (`initialOpenPanel`, `defaultOpen`, …) rather than forking its markup.
8. **One prop per Figma variant property, named after the property.** Each Figma *variant property* (`Type`, `Size`, `Breakpoint`, …) maps to one prop of the **same name**, whose value is the Figma value (`type="static"`, `size="XS"`, `breakpoint="mobile"`). Do NOT collapse them into a generic `variant` prop — it's ambiguous when a component has more than one axis. **`State`** (hover/pressed/focus/disabled) is the exception: in Figma it's a variant for documentation, but in code it's runtime (CSS/interaction), not a prop. **Non-variant component properties** (boolean "Show X", instance-swap, text) become their own props named after the property. **Nested-instance properties** are namespaced with the nested component's name on the parent (e.g. `TopNav`'s `moduleSwitcherType` surfaces the nested ModuleSwitcher's `type`). The argType `description` and a dedicated visible story must convey *why* the property exists (its context), not just that it exists.

## argType annotation rules

Every prop exposed as a control has:

- A human-readable `name` (not the raw prop name)
- A `description` that explains what the prop does AND its effect
- A clear `control` type with `options` enumerated for enums

Example:

```js
argTypes: {
  activeId: {
    name: "Active item",
    control: { type: "select" },
    options: ALL_ITEM_IDS,
    description: "ID of the destination that's currently active. Sets aria-current=\"page\" on the matching item.",
  },
  collapsed: {
    name: "Sidebar collapsed?",
    control: { type: "boolean" },
    description: "Toggle between 250 px expanded and 72 px icon-only rail.",
  },
}
```

## Story structure — what stories every component ships with

At minimum:

| Story | Required? | Purpose |
|---|---|---|
| `Playground` | Always | Full interactive demo with all controls |
| `StateMatrix` | If multi-state | Live renders of every state side by side |
| `ElementExplorer` | If complex | Smallest unit of the component with isolated controls |
| `TokensFill` / `TokensText` / `TokensIcon` | If the component binds those tokens | Swatch rows |
| `StandaloneDemo` | If responsive | Iframe to the `.html` standalone for hands-on resize |

Other stories are welcome (showcase, real-context placements, reduced-motion) but must have a clear purpose — don't duplicate.

## What's forbidden

- `tags: ["autodocs"]` on a `.stories.jsx` that has a matching `.mdx` — causes a build error.
- `<Primary />` + `<Controls />` + `<Stories />` without explicit `of={Stories.X}` — floats disconnected.
- Importing the spec `.md` as raw text and dumping it into MDX. The MDX should read better than the `.md`, not identical to it.
- Reference-table-only sections (no demo, no prose, just a table). Always pair tables with either a live canvas or prose explaining the rule.

## Sources to copy from

- `src/stories/Library/SideNav/SideNav.mdx` — organism-level, full pattern
- `src/stories/Library/Spinner/Spinner.mdx` — atom-level, same pattern scaled down

Both of these were hand-authored to this standard; copy their structure and tone for new components.
