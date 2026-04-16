# Component Pipeline: Figma to GitHub to Storybook

How a component goes from a Figma design to a shipped, interactive Storybook page. Every component — simple or complex — follows this sequence.

## Overview

```
Figma (design)
  │
  │  Designer completes the prep checklist (docs/figma-prep-checklist.md)
  ▼
Agent extracts from Figma via MCP tools
  │
  │  get_design_context · get_variable_defs · get_screenshot · get_metadata
  ▼
Three files created in components/<name>/
  │
  │  <name>.jsx   — React component module (importable by Storybook)
  │  <name>.html  — self-contained demo (CDN React + Babel)
  │  <name>-spec.md — authoritative specification
  ▼
Storybook stories created in src/stories/Library/<Name>/
  │
  │  <Name>.stories.jsx — interactive stories with controls
  │  <Name>.mdx         — rich docs page (spec highlights + demos)
  ▼
Build, commit, push → CI deploys Storybook
```

## File convention

```
components/<name>/
├── <name>.jsx              React component module
├── <name>.html             Standalone demo (CDN React)
├── <name>-spec.md          Authoritative specification
└── <name>-figmamake.html   AI-codegen variant (optional, auto-generated)

src/stories/Library/<Name>/
├── <Name>.stories.jsx      Storybook stories with controls
├── <Name>.mdx              Docs page (embedded spec + demos)
└── <name>.css              Component styles (if separate)
```

- **`<name>`** is lowercase kebab-case: `sidenav`, `spinner`, `date-picker`
- **`<Name>`** in `Library/` uses PascalCase (macOS case-insensitivity avoidance)

## The `.jsx` is the shared source of truth

The component module at `components/<name>/<name>.jsx` is the single implementation. Rules:

1. **Import only React** — no Storybook imports, no CSS file imports (consumers handle those)
2. **Export named components** — `export function SideNav(...)`, not `export default`
3. **Accept data as props** — navigation items, icons, active state are props, not hardcoded constants
4. **Internal state for UI concerns** — expand/collapse, hover, popover timers
5. **External state for application concerns** — `activeId`, `collapsed`, `onNavigate` are controlled props
6. **Token references** — use the `T` token constants object (hex values) or CSS custom properties from `tokens.css`

Both the standalone demo (`.html`) and the Storybook stories import or inline the same logic. When the component changes, both must be updated together.

## Step-by-step for a new component

### 1. Designer prepares Figma

Follow `docs/figma-prep-checklist.md`. All colours bound to semantic variables, variants in a Component Set with named properties, states documented, responsive layouts framed, accessibility annotated.

### 2. Agent creates the spec

`components/<name>/<name>-spec.md` following the structure of `components/sidenav/sidenav-spec.md`. At minimum:

1. Overview + Figma source links (node URL is load-bearing for reconciliation)
2. Governance table
3. Component anatomy
4. Variant system (if any)
5. Token mappings (colour, sizing, motion)
6. Decision tree (when to use / when not to use)
7. Accessibility (ARIA, keyboard, screen reader, reduced motion, contrast)
8. Motion spec (if animated)
9. HTML usage examples
10. Constraints
11. Gaps

### 3. Agent creates the component module

`components/<name>/<name>.jsx` — extract from Figma's design context. Map Figma variant properties → React props. Map Figma variables → token constants or CSS custom properties. Include all sub-components (each as a named export).

### 4. Agent creates the standalone demo

`components/<name>/<name>.html` — self-contained HTML file that loads React via CDN and renders the component with sample data. Follow the pattern of `components/sidenav/sidenav.html`.

### 5. Agent creates Storybook stories

`src/stories/Library/<Name>/<Name>.stories.jsx`:

- Import the component from `../../../../components/<name>/<name>.jsx`
- Map component props to `argTypes` (controls):
  - Boolean props → `{ control: { type: "boolean" } }`
  - Enum props → `{ control: { type: "select" }, options: [...] }`
  - Number props → `{ control: { type: "number", min, max, step } }`
  - String props → `{ control: { type: "text" } }`
- Create a `Default` story with all controls wired up
- Create showcase stories (all states, all variants, responsive)
- Create a `StandaloneDemo` story that iframes the `.html` for the full responsive experience

### 6. Agent creates the MDX docs page

`src/stories/Library/<Name>/<Name>.mdx`:

Embed the key spec sections inline (anatomy, state matrix, tokens, accessibility). Include `<Primary />`, `<Controls />`, `<Stories />`. Link to the full spec for everything else.

### 7. Verify and push

```
npx storybook build          # must pass
git add ...
git commit -m "add <name> component + stories"
git push                     # CI deploys Storybook
```

## Ongoing: token reconciliation

When the token library changes, the component reconciliation pass (CLAUDE.md §3) checks every component's files against the updated tokens and against the component's Figma node. See CLAUDE.md for the full algorithm.

## Ongoing: component updates from Figma

When a component's design changes in Figma, the user tells the agent to pull. The agent fetches the updated node via MCP tools and edits the `.jsx`, `.html`, and `-spec.md` together. See CLAUDE.md §3.6.
