# Agent instructions for `pathwaytokens`

Persistent rules for any AI agent working on this repository. These apply across sessions — don't wait to be told them again. If a rule here conflicts with something in a specific conversation, follow the rule here unless the user explicitly overrides it in the moment.

## 1. Source of truth — who wins when sources disagree

Different layers of this system have different sources of truth. Keep them straight.

| What | Source of truth | Flow |
|---|---|---|
| **Design tokens** (primitives, semantics, modes) | **Figma** → exported to `tokens/figma-export/pathwaytokens.json` | Automatic. CI runs `sync-tokens.js` → `style-dictionary` → Storybook. |
| **Component implementations** (HTML demos, specs, stories) | **GitHub** (the files in this repo) | Manual. Designer changes a component in Figma → user asks agent to pull → agent uses Figma MCP tools to fetch the updated node → agent edits the component's files in this repo. |
| **Component visual design** (variants, frames, anatomy, variables-bound properties) | **Figma** | Same manual flow as above. Figma is the design artifact; this repo carries the implementation. |

**Practical implications:**

- When anything under `tokens/` conflicts with what's in `src/tokens/` or `pathway-design-tokens.json` — **Figma wins.** Regenerate the derived files; never hand-edit them.
- When anything in `components/<name>/<name>-spec.md` disagrees with what the component in Figma currently looks like — that means Figma was updated and this repo wasn't yet. Ask the user whether to pull. Don't assume either side is right.
- Never edit Figma programmatically. The Figma MCP server exposes `use_figma` and write tools; do **not** call them unless the user explicitly asks you to change Figma. Read-only tools (`get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`) are fine for any diagnostic.

## 2. Token sync — how Figma flows into this repo

The pipeline, in order:

```
Figma (source of truth for tokens)
  │
  │  Designer exports via "Variables Import Export" plugin
  ▼
tokens/figma-export/pathwaytokens.json          ← committed as-is
  │
  │  scripts/sync-tokens.js  (GitHub Action: sync-tokens.yml on push to figma-export/)
  ▼
tokens/pathway-design-tokens.json               ← DTCG-format derived file
  │
  │  node style-dictionary.config.js  (called by deploy-storybook.yml)
  ▼
src/tokens/tokens.css, src/tokens/tokens.js     ← consumed by Storybook + components
```

Rules:

- **The Figma export is authoritative.** If the user deletes a variable in Figma, the sync removes it from every derived file. If the user adds a variable, the sync adds it. **Never tell the user to fix broken aliases in Figma as a precondition to running the sync** — if a semantic token points at a deleted primitive, `sync-tokens.js` drops that token silently (with a warning in the CI log) and the build continues.
- **One-time data migrations are a separate class of work.** When Figma renames or restructures a primitive group (e.g. the historical `Indigo → Brand` rename), a one-off script or `sed` may be needed to rewrite stale references in already-imported data so the tree resolves. Those are ad-hoc jobs, requested explicitly by the user, run once, committed, and done. **Never** bake a one-time rewrite into the recurring sync, audit, or `/update-tokens` routines — a repeating rewrite masks real broken state once the migration is complete and makes future orphans invisible.
- **`pathway-design-tokens.json` is derived.** Do not hand-edit it. Changes made to it will be wiped by the next Figma sync.
- **`src/tokens/tokens.css` is derived.** Do not hand-edit it. Style Dictionary regenerates it on every build.
- If a broken alias matters (e.g. a component visibly breaks because its token disappeared), the fix goes **in Figma**, not in the repo.

### 2.1 Dark mode — TEMPORARILY EXCLUDED

**Dark-mode tokens are not imported from the Figma export right now.** Pathway is not shipping dark mode yet; importing those tokens produces ~1000 unused CSS variables that nobody references and that pollute the Storybook token pages.

- `sync-tokens.js` filters out any Figma mode whose slug is in its `EXCLUDED_MODES` list. Currently: `dark-mode`, `dark`.
- The light-mode tokens come through normally.
- This is a temporary switch. **Do not re-enable dark mode imports until the user explicitly tells you to.** When they do, remove the mode from `EXCLUDED_MODES` and also remove the "TEMPORARILY EXCLUDED" note from the top of the script.
- If the user asks for dark-mode support for any reason (a component needs a dark-mode variant, a story wants to preview dark, etc.), **stop and confirm** before re-enabling — they may want a different scope (e.g. one component only, or component-level overrides rather than token-level).

## 3. Component reconciliation after token changes

When the token library changes — every time `sync-tokens.js` runs and modifies `tokens/pathway-design-tokens.json` or the CSS variable set — every component in `components/**` that references those tokens must be reconciled against Figma.

**Principle:** the source of truth for *which tokens a component uses* is Figma, not the component's current GitHub files. If Figma says the SideNav uses `fill/contextual/navitem/base` and the repo says it uses some other token, Figma wins. If a token the repo mentions no longer exists, the fix comes from Figma.

### 3.1 When to run reconciliation

- After every run of `sync-tokens.js` that changes the derived token set (adds, removes, or renames tokens).
- On user request (`"reconcile the components"`, `"check components against Figma"`, etc.).
- **Not** on every session start. Reconciliation is a sync-adjacent job, not a routine health check.

### 3.2 Algorithm

1. **Diff the token set.** Compare `tokens/pathway-design-tokens.json` at `HEAD` against its state before the sync. Classify each change: *added*, *removed*, *renamed* (a disappeared name + a new name whose value matches are probably a rename — flag as a rename candidate for the user to confirm; don't auto-rename aggressively).

2. **Find components that reference changed tokens.** For each file under `components/**`, `src/stories/Library/**`, and any `src/tokens/tokens.*` consumer, grep for:
   - CSS variable names like `--semantic-color-light-mode-icon-static-neutral-base`
   - Token-path mentions in Markdown like `icon.static.neutral.base` or `Icon/Contextual/NavItem/Base`
   - Any direct hex values that the spec claimed came from a token (these indicate a hand-copy that's now stale)
   If the mentioned token appears in the *removed* or *renamed* set, the component is a reconciliation candidate.

3. **For each candidate component, fetch Figma truth.** Open the component's Figma node (see §3.4 for where its node ID lives) and call:
   - `get_variable_defs(nodeId)` — returns every variable currently bound to that node and its descendants
   - `get_design_context(nodeId)` — the current reference code with token bindings
   Compare the set of tokens returned by Figma against the set the component's GitHub files reference.

4. **Reconcile in this order:**
   - If Figma's token set matches the repo's updated token set: update the component's GitHub files to use the new token names / values. Update HTML, CSS, stories, spec — all of them, together. Verify Storybook still builds.
   - If Figma's token set *also* references a missing token (Figma itself is out of sync with the newly-updated tokens): add this component to the "needs manual attention" list (see §3.5). Do not rewrite the component to use a different token as a guess.
   - If the Figma fetch fails (node deleted, MCP error after retry): add the component to the list. Do not guess.

5. **Commit reconciled components.** One commit per logical component update, with a message that says *why* the change was needed (e.g. "reconcile spinner: icon.static.brand-warm renamed to icon.static.brand").

6. **Report unresolved items** at the end of the run. Format (one line per item):
   ```
   <component-name>  ·  <file-path>  ·  <stale-token-name>  ·  <reason>
   ```
   Where reason is `removed-from-tokens`, `renamed-to-<new>`, `figma-also-stale`, or `figma-fetch-failed`. The user fixes these in Figma, re-exports, and re-runs the sync.

### 3.3 What reconciliation does NOT do

- It does not propose alternative tokens when Figma is itself stale. Guessing at a replacement masks the real problem.
- It does not rewrite the token file or attempt to resurrect deleted tokens. Figma is still the source of truth for tokens themselves (see §1).
- It does not change component *behaviour* — only the specific token names, values, and examples that are now wrong. If the behaviour needs to change, that's a component update (§3.6), not a token reconciliation.

### 3.4 Every component must expose its Figma node ID

For reconciliation to work without asking the user every time, every `components/<name>/<name>-spec.md` must contain a "Figma source" section with the file key and the root node ID in a parseable form. The existing sidenav and spinner specs follow this convention:

```markdown
### Figma source
- **File:** [<display name>](https://www.figma.com/design/<fileKey>/...)
- **<Component> component:** [Open in Figma](https://www.figma.com/design/<fileKey>/...?node-id=<nodeId>)
```

Reconciliation agents extract `<fileKey>` and `<nodeId>` from the URLs with a regex. Do not remove those links or change their format. When adding a new component, copy the pattern exactly.

### 3.5 Reporting unresolved reconciliation items

When a component can't be reconciled cleanly, emit a short block at the end of the run. Example:

```
Reconciliation — 2 components need manual attention:

  spinner
    file:   components/spinner/spinner-spec.md
    stale:  icon.static.accent-jade.base
    reason: removed-from-tokens
    next:   delete the accent-jade branch from the Figma spinner node,
            or restore the accent-jade tokens in Figma

  sidenav
    file:   components/sidenav/sidenav-spec.md §3.3
    stale:  text.contextual.navitem.active
    reason: figma-also-stale  (Figma still aliases this to {Blue.180},
            which no longer exists)
    next:   open sidenav in Figma, re-bind the Active text variable
            to a real primitive, re-export, re-run sync-tokens
```

Keep entries short. The user decides which ones to act on; your job is to surface the list accurately, not to fix it silently.

### 3.6 Updating a component from Figma (unrelated to token changes)

When the user says *"I changed the spinner in Figma, update GitHub"* or *"pull the new sidenav design"* — i.e. the **component itself** changed, not just its tokens — follow this flow. It's related to but distinct from §3.2 (which runs in response to token changes).

1. **Identify the Figma node.** Use the spec's Figma source section (§3.4); ask for a URL if one isn't there.
2. **Fetch the current state** via the Figma MCP server:
   - `get_design_context` — reference code + variable bindings
   - `get_metadata` — structural overview for large nodes
   - `get_screenshot` — visual reference
   - `get_variable_defs` — resolved token values bound to the node
3. **Extract raw assets when needed.** For SVG geometry, `get_design_context` returns a `figma.com/api/mcp/asset/<uuid>` URL; `curl` it. If it 500s, retry a few times before giving up.
4. **Diff against the current files** in `components/<name>/`. Update the HTML demo, the `-spec.md`, and any `src/stories/Library/<Name>/` files together — they must stay consistent.
5. **Keep the spec structure intact.** See §5 for the required spec sections.
6. **Verify.** Rebuild Storybook locally (`npx storybook build`) before committing. A broken Storybook build blocks CI.

## 4. File layout and naming

- Every component lives at `components/<name>/`. `<name>` is **lowercase kebab-case** — `sidenav`, `spinner`, `top-nav`, `date-picker`.
- Inside each component folder:
  - `<name>.html` — self-contained React+Babel demo, mirrors the conventions in `components/sidenav/sidenav.html`
  - `<name>-spec.md` — authoritative specification, mirrors the structure of `components/sidenav/sidenav-spec.md`
  - Optionally `<name>-figmamake.html` if the component ships an AI-codegen-friendly variant (SideNav does; Spinner doesn't need one)
- Cross-component docs live in `docs/`. See `docs/README.md`.
- Storybook stories for each component live at `src/stories/Library/<Name>/` (PascalCase inside `Library/` because macOS APFS is case-insensitive and collides with `src/stories/components/` — see the folder name there for why).
- New files always follow **kebab-case, lowercase**. Never PascalCase or snake_case for file names inside `components/` or `docs/`. The Storybook `src/stories/` tree uses PascalCase folders to match the existing convention there — don't change that.

## 5. Component specs

Every `<name>-spec.md` must follow the structure of `components/sidenav/sidenav-spec.md`. At minimum it has:

1. **Component Overview** — what it is, what it isn't, decision boundaries
2. **Governance table** — "where things live" mapping (Figma nodes, this spec, token files)
3. **Anatomy** — DOM structure, key elements
4. **Variant system** — if the component has variants, how they compose
5. **Token mappings** — every colour/size/motion must cite a semantic token. Never reference primitives or raw hex directly in specs.
6. **Decision tree** — when to use / when not to use
7. **Accessibility** — role, ARIA, keyboard, screen reader announcements, reduced motion, contrast
8. **Motion spec** (if animated) — keyframe, duration, easing, direction, reduced-motion behaviour
9. **HTML usage examples** — real markup, at least one minimal + one in-context
10. **Constraints** — hard rules that must not be broken
11. **Gaps** — known problems, flagged by priority

New components that don't yet need every section can omit, but match the depth of sidenav-spec for the ones they do include.

## 6. Colour rules for components

Components resolve colour **only through semantic tokens** — never raw hex, never primitive tokens, never invented semantic names.

- Icons (including indicators like the spinner): **`icon.static.<tone>.<emphasis>`** or **`icon.action.<role>.<state>`** — both exist as real token families in `tokens/pathway-design-tokens.json`. Any `tone` must match a real child of the family in that file. See `components/spinner/spinner-spec.md` §7.1 for the complete allowed list.
- Text: `text.static.*` or `text.action.*` or `text.contextual.*` — same rule.
- Fills, strokes, surfaces: same rule applied to the right family.

**Forbidden in any component CSS or spec:**

- Raw hex (`color: #3555a0`) — *always wrong*, always replace with a semantic var
- Primitive vars (`var(--primitive-color-brand-300)`) — *always wrong*, primitives are building blocks not contracts
- Made-up tokens (`icon/semantic/success`, `color/brand/primary`) — if the name isn't in the JSON, it doesn't exist

Before writing any colour into a component, grep `tokens/pathway-design-tokens.json` to confirm the token name and family exist.

## 7. Naming, casing, and slugs

- Token names in `pathway-design-tokens.json` are always lowercase with dots (`semantic-color.light-mode.icon.static.neutral.base`). `sync-tokens.js` slugifies the Figma export to this form automatically. Do not override.
- CSS custom properties derived by Style Dictionary replace dots with hyphens (`--semantic-color-light-mode-icon-static-neutral-base`). Consume these exactly as emitted.
- Component class names use BEM-lite kebab (`.pds-spinner__svg`). Never PascalCase or camelCase in CSS selectors.
- File names: lowercase kebab (see §4).
- Git commit messages: imperative mood, first line under 72 chars, body explains *why* not *what*.

## 8. Non-Pathway content belongs elsewhere

If files accumulate at the repo root that don't belong to the design system (one-off audits, scratch prototypes, unrelated assets), move them to the sibling repo:

- `https://github.com/helloimjolopez-collab/pathway-sandbox` (private)

Don't let the design system repo become a junk drawer.

## 9. Deployment and CI

Three GitHub Actions live in `.github/workflows/`:

1. **`sync-tokens.yml`** — fires on push to `tokens/figma-export/**`. Runs `sync-tokens.js`, commits the result.
2. **`sync-component.yml`** — fires on push to `components/sidenav/sidenav.html`. Regenerates `sidenav-figmamake.html`.
3. **`deploy-storybook.yml`** — fires on push to `tokens/`, `src/`, `.storybook/`, `components/`, `docs/`, or config. Runs Style Dictionary + Storybook build, commits the output to `/storybook/` on `main`, GitHub Pages serves it.

The deployed Storybook lives at:

- https://helloimjolopez-collab.github.io/pathwaytokens/storybook/

Data flows one way: **GitHub → Storybook.** Nothing ever flows from Storybook back to GitHub. If Storybook appears out of date, the fix is a push to `main`, not a Storybook rebuild.

## 10. Things that are always wrong

- Committing `node_modules/`, `storybook-static/`, `.env`, `.claude/`, or `.DS_Store` (all in `.gitignore`).
- Hand-editing derived files (`pathway-design-tokens.json`, `src/tokens/tokens.css`, `src/tokens/tokens.js`, `components/sidenav/sidenav-figmamake.html`).
- Force-pushing to `main`.
- Amending a commit that's already on `origin/main`.
- Using `rm -rf` on anything not clearly scratch.
- Re-enabling dark-mode token imports without explicit user authorization (see §2.1).
