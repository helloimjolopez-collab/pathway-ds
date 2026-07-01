# Agent instructions for `pathway-ds`

Persistent rules for any AI agent working on this repository. These apply across sessions — don't wait to be told them again. If a rule here conflicts with something in a specific conversation, follow the rule here unless the user explicitly overrides it in the moment.

## 1. Source of truth — who wins when sources disagree

Different layers of this system have different sources of truth. Keep them straight.

| What | Source of truth | Flow |
|---|---|---|
| **Design tokens** (primitives, semantics, modes) | **Figma** → exported to `tokens/figma-export/pathwaytokens.json` | Automatic. CI runs `sync-tokens.js` → `style-dictionary` → Storybook. |
| **Motion tokens** (durations, easings) | **`docs/design-system-spec.md` §2** | `scripts/sync-motion-tokens.js` reads §2.1 and §2.2 tables → writes `tokens/motion-tokens.json` → Style Dictionary emits `--motion-*` CSS variables. Run as part of `build-tokens`. |
| **Component implementations** (HTML demos, specs, stories) | **GitHub** (the files in this repo) | Manual. Designer changes a component in Figma → user asks agent to pull → agent uses Figma MCP tools to fetch the updated node → agent edits the component's files in this repo. |
| **Component visual design** (variants, frames, anatomy, variables-bound properties) | **Figma** | Same manual flow as above. Figma is the design artifact; this repo carries the implementation. |

**Practical implications:**

- When anything under `tokens/` conflicts with what's in `src/tokens/` or `pathway-design-tokens.json` — **Figma wins.** Regenerate the derived files; never hand-edit them.
- When anything in `components/<name>/<name>-spec.md` disagrees with what the component in Figma currently looks like — that means Figma was updated and this repo wasn't yet. Ask the user whether to pull. Don't assume either side is right.
- Never edit Figma programmatically. The Figma MCP server exposes `use_figma` and write tools; do **not** call them unless the user explicitly asks you to change Figma. Read-only tools (`get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`) are fine for any diagnostic.

## 2. Token sync — how Figma flows into this repo

The pipeline, in order:

```
Figma (source of truth for primitives/semantics)       docs/design-system-spec.md §2 (source of truth for motion)
  │                                                       │
  │  Designer exports via "Variables Import Export"       │  scripts/sync-motion-tokens.js
  ▼                                                       ▼
tokens/figma-export/pathwaytokens.json          tokens/motion-tokens.json   ← both are derived, never hand-edit
  │                                                       │
  │  scripts/sync-tokens.js                               │
  ▼                                                       │
tokens/pathway-design-tokens.json                        │
  │                                                       │
  └──────────────────────────┬────────────────────────────┘
                             │  node style-dictionary.config.js
                             ▼
              src/tokens/tokens.css, src/tokens/tokens.js  ← consumed by Storybook + components
```

Rules:

- **The Figma export is authoritative.** If the user deletes a variable in Figma, the sync removes it from every derived file. If the user adds a variable, the sync adds it. **Never tell the user to fix broken aliases in Figma as a precondition to running the sync** — if a semantic token points at a deleted primitive, `sync-tokens.js` drops that token silently (with a warning in the CI log) and the build continues.
- **One-time data migrations are a separate class of work.** When Figma renames or restructures a primitive group (e.g. the historical `Indigo → Brand` rename), a one-off script or `sed` may be needed to rewrite stale references in already-imported data so the tree resolves. Those are ad-hoc jobs, requested explicitly by the user, run once, committed, and done. **Never** bake a one-time rewrite into the recurring sync, audit, or `/update-tokens` routines — a repeating rewrite masks real broken state once the migration is complete and makes future orphans invisible.
- **`pathway-design-tokens.json` is derived.** Do not hand-edit it. Changes made to it will be wiped by the next Figma sync.
- **`tokens/motion-tokens.json` is derived.** Do not hand-edit it. `scripts/sync-motion-tokens.js` regenerates it from `docs/design-system-spec.md` §2 on every build. To change a motion value, edit the spec — the JSON updates automatically.
- **Any edit to motion values in `docs/design-system-spec.md` §2 must be followed immediately — in the same operation, same commit — by running `node scripts/sync-motion-tokens.js && node style-dictionary.config.js` and committing the resulting `tokens/motion-tokens.json` and `src/tokens/tokens.css` alongside the spec change.** Never commit a spec-only motion edit. The spec and the CSS variables are one change, not two.
- **`src/tokens/tokens.css` is derived.** Do not hand-edit it. Style Dictionary regenerates it on every build.
- If a broken alias matters (e.g. a component visibly breaks because its token disappeared), the fix goes **in Figma**, not in the repo.

### 2.1 Dark mode — ENABLED (2026-05-05)

**Dark-mode tokens are now imported from the Figma export.** The `EXCLUDED_MODE_SLUGS` set in `sync-tokens.js` is empty — all modes come through, including dark.

- Light-mode and dark-mode tokens both land in `tokens/pathway-design-tokens.json` and are emitted as CSS variables in `src/tokens/tokens.css`.
- If the user asks to re-disable dark mode, add `"dark-mode"` and `"dark"` back to `EXCLUDED_MODE_SLUGS` in `sync-tokens.js`.

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

0. **Links** (CANONICAL — always at the very top, immediately after the one-paragraph overview, **never** as a trailing section). A `## Links` table with Figma node, Storybook (`?path=/docs/library-<name>--docs`), HTML demo, and GitHub source. A reader or agent must reach every artefact without scrolling. `org-switcher` uses an equivalent top `## Resources` table — either heading is acceptable as long as it is at the top. This rule is baked into `docs/component-spec-template.md`; copy it from there.
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

- https://helloimjolopez-collab.github.io/pathway-ds/storybook/

Data flows one way: **GitHub → Storybook.** Nothing ever flows from Storybook back to GitHub. If Storybook appears out of date, the fix is a push to `main`, not a Storybook rebuild.

## 10. Component pipeline: Figma to GitHub to Storybook

Every new component follows the sequence documented in `docs/component-pipeline.md`. The key points for agents:

1. **The `.jsx` is the shared source of truth.** `components/<name>/<name>.jsx` exports the React component. Storybook stories import from it; the standalone `.html` demo inlines the same logic. When the component changes, update both.
2. **File convention:** `<name>.jsx` + `<name>.html` + `<name>-spec.md` in `components/<name>/`. Stories at `src/stories/Library/<Name>/`.
3. **Map Figma variants → Storybook argTypes.** Boolean props → boolean control. Enum props → select control. Number props → number control with min/max.
4. **MDX docs follow `docs/storybook-authoring.md`** — narrative prose, Playground + Controls at the top, state matrices as live components (not tables), token rows as name/swatch/hex, accessibility section that cites the overarching spec for system-wide rules. Never bury the Playground below reference tables.
5. **`components/manifest.json`** is the machine-readable component registry. Update it when adding or changing a component.
6. **Designer prep:** the designer must complete `docs/figma-prep-checklist.md` before handoff. If they haven't, run the `/pathway:component-readiness` skill (or send them the checklist) — don't guess.
7. **The overarching design-system spec** (`docs/design-system-spec.md`) defines system-wide rules for motion, accessibility, colour, spacing, typography, naming. Every component spec inherits from it. Conflicts between a component spec and the overarching spec are resolved by the `/pathway:spec-review` skill, which requires explicit human sign-off on any deviation.
8. **Storybook stories render the REAL component — never a reimplementation.** Stories `import` the component from `components/<name>/<name>.jsx` and render it. A thin adapter mapping flat Controls args → the component's props is fine; a parallel "mock" reimplementation of the component's markup inside the stories file is a bug (it drifts and misrepresents what ships). If a story needs a hook the component lacks (pre-opening a panel for a snapshot, etc.), add a small prop to the real component instead of forking its markup. See `docs/storybook-authoring.md` hard-rule #7.
9. **Props mirror Figma properties — one prop per variant property, named after it.** Each Figma *variant property* (`Type`, `Size`, `Breakpoint`, …) becomes one prop of the same name; the value is the Figma value (`type="static"`, `size="XS"`). Never collapse multiple axes into a generic `variant` prop. `State` (hover/pressed/focus/disabled) is runtime, not a prop. Non-variant component properties (boolean "Show X", instance-swap, text) get their own prop named after the property. Nested-instance properties are namespaced with the nested component's name on the parent (e.g. `TopNav.moduleSwitcherType` → nested ModuleSwitcher's `type`). Every such prop must be documented with the rationale for *why* it exists (spec Properties table + Usage-by-context table; Storybook argType description + a visible story). See `docs/storybook-authoring.md` hard-rule #8.

### 10.1 The Pathway skills

The component pipeline is broken into four skills so different audiences can use what applies to them:

| Skill | Audience | What it does | Touches repo? |
|---|---|---|---|
| `/pathway:component-readiness` | Any designer | Runs Figma prep checklist against a component, reports findings | ❌ read-only |
| `/pathway:component-spec-maker` | Any designer | Drafts a `-spec.md` from a Figma component using the template; marks `Status: PENDING HUMAN REVIEW` | ❌ local only |
| `/pathway:spec-review` | Any designer | Reads a draft spec + the overarching spec; walks the user through every conflict; flips `Status:` to `REVIEWED` only when all resolved | ❌ local only |
| `/pathway:component-pipeline` | DS owner | `--mode=create` or `--mode=update`. Composes the three skills above → generates `.jsx` + `.html` + stories + MDX + manifest → commits + pushes | ✅ writes + pushes |
| `/pathway:tokens-sync` | DS owner | Syncs Figma token export, rebuilds Style Dictionary + Storybook, commits + pushes | ✅ writes + pushes |

All five skills ship in the [`JoLopez-Product-Plugins`](https://github.com/helloimjolopez-collab/JoLopez-Product-Plugins) plugin (Claude Code). To install:
```
/plugin marketplace add helloimjolopez-collab/JoLopez-Product-Plugins
/plugin install pathway@jolopez-product-plugins
```

Token sync (`update-tokens`) is separate — it runs on token changes, independent of component work.

## 11. Human review at every step

**Non-negotiable principle:** every Pathway skill requires explicit human approval at every gate. Claude drafts, recommends, flags — humans decide.

### 11.1 What this means in practice

- Skills ask questions **one at a time**, never batched. If a skill realises it needs many questions, it opens with: *"I'll need to ask you ~N questions. Want the full list up front or one-by-one?"* and waits for the user's choice.
- Skills announce each action before performing it and wait for explicit approval: *"I'm about to commit files X, Y, Z. Confirm?"*
- Skills never auto-flip `Status: PENDING HUMAN REVIEW` to `REVIEWED`. Only the `/pathway:spec-review` skill, after walking the human through every conflict, flips the status — and only when the human has explicitly signed off on each decision.
- The pipeline skill refuses to run on any spec that is not `Status: REVIEWED`.
- No skill `git push`es without confirming with the user first.
- No skill modifies a file in Figma (via `use_figma` or similar) without the user explicitly asking for a Figma write.

### 11.2 What this means for agents

Any agent working on a Pathway task must preserve these gates. If you're composing a larger workflow (e.g. "create a dashboard with the design system"), you still pause at each gate. Skipping a gate to "save time" breaks the principle; a batched-questions implementation is a bug, not an optimisation.

### 11.3 When the user is explicit

If the user says *"just do it, don't ask me"* for a specific action, proceed with that action — their explicit permission replaces the gate. But the next gate still applies unless they've scoped the permission broadly ("do the whole thing, don't ask me").

## 12. Iconography — Material Symbols Rounded, always

**Every icon in Pathway uses Material Symbols Rounded.** This is non-negotiable and applies to every component, every demo, every story, every spec, every agent-brief, and every prototype built from this system.

### Source of truth for available icons

**GitHub repo:** `https://github.com/google/material-design-icons`

This is the canonical source for every icon name, ligature string, and preview. To find or verify an icon:
- Browse by category at `https://github.com/google/material-design-icons/tree/master/symbols/web`
- Each icon folder contains the Rounded variant (and others — always use Rounded)
- The folder name is the ligature string you put inside the `<span>` (e.g. folder `arrow_forward` → `<span class="material-symbols-rounded">arrow_forward</span>`)
- Google's interactive search at `https://fonts.google.com/icons` lets you filter by style (set Style = Rounded) and copy the ligature name directly

### Usage in code

- **Font family:** `Material Symbols Rounded` (not Outlined, not Sharp)
- **CSS class:** `material-symbols-rounded`
- **Markup:** `<span class="material-symbols-rounded">icon_name</span>`
- **Google Fonts CDN URL:** `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`
- **font-family in CSS:** `'Material Symbols Rounded'`
- **Font variation settings:** `'wght' 400, 'GRAD' 0, 'opsz' 20` — use these for every icon. **The `FILL` axis must be read from Figma per component — never assumed.** FILL=0 means outlined (hollow); FILL=1 means filled (solid). Figma is the source of truth: check how the icons look in the component's Figma node via `get_design_context` and match that fill in code. Document the correct FILL value in the component spec's iconography section.

If you see `material-symbols-outlined`, `material-symbols-sharp`, or `Material Symbols Outlined` anywhere in this repo, it is a bug. Replace it with the Rounded variant.

Never use Outlined, Sharp, or any other Material Symbols variant. Never use custom SVGs for standard UI icons — if it's in the Material Symbols Rounded library, use the ligature. If it's a branded asset (org logo, Amplify Home icon), use an `<img>` or inline SVG instead.

### Sizing — by the frame, never the vector

Figma nests three boxes: `Container.LeadingIcon` (e.g. 24×24, the wrapper) → `Icon.Leading` frame (e.g. 16×16, the em-box) → the visible vector inside (e.g. ~12×12, inset by the grid's built-in ~2px padding). **The icon size you implement is the *frame* (16), never the vector (~12).** Setting `font-size: 16px` reproduces the padding automatically → the visible glyph lands at ~12px, matching Figma. Setting it to the vector's ~12 ships an icon that is too small. See `docs/design-system-spec.md` §7.2 for the full model and the per-size table (L=18 / M=16 / S=14 inside 26 / 24 / 20 wrappers).

For **non-font (SVG) implementations** (partner teams on older frameworks): keep the un-cropped Material Symbols SVG on its full grid (`viewBox="0 0 24 24"` or `0 -960 960 960` — never trim to content), render it at the same frame size (`width/height: 16px` for M), bake in Rounded / wght 400 / opsz 20 / correct FILL at export, and centre it in the same wrapper. Handing a team the cropped ~12px vector is a bug — it ships too small and breaks cross-icon consistency.

## 13. Things that are always wrong

- Committing `node_modules/`, `storybook-static/`, `.env`, `.claude/`, or `.DS_Store` (all in `.gitignore`).
- Hand-editing derived files (`pathway-design-tokens.json`, `src/tokens/tokens.css`, `src/tokens/tokens.js`, `components/sidenav/sidenav-figmamake.html`).
- Force-pushing to `main`.
- Amending a commit that's already on `origin/main`.
- Using `rm -rf` on anything not clearly scratch.
- Re-enabling dark-mode token imports without explicit user authorization (see §2.1).
- **Regenerating `src/tokens/tokens.js` with any command other than `node style-dictionary.config.js`.** This is the only command whose output `resolve-tokens.js` and every Storybook story are built to consume. Any other tool — the SD CLI, `@tokens-studio/sd-transforms` directly, any other script — may produce a structurally different output that silently breaks every color, fill, text, and icon lookup across the entire system.

## 13. PRs are always merged immediately — this is a solo repo

This repository has no team reviewers. A PR that is not merged is identical to nothing happening. **A PR is not "done." Merged to `main` is done.**

### Rules that apply in every session, no exceptions:

1. **Never open a PR and stop.** After `gh pr create`, always run `gh pr merge --merge --delete-branch` in the same session, immediately.
2. **Never present a Storybook link as reflecting changes** until those changes are on `main` and CI has been triggered. If you give a Storybook URL, say explicitly whether CI has fired yet or not.
3. **Bug fixes and doc-only changes** (no new component, no API change): push directly to `main` — no branch, no PR. One commit, one push.
4. **New components or breaking changes**: cut a branch, open a PR, then immediately merge it in the same operation. The branch exists only as a PR audit trail, not as a review gate.
5. If you ever find yourself in a state where a branch exists, a PR is open, but `main` has not been updated — **merge it before doing anything else in that session.** Check `git branch` and `gh pr list` at session start if context is unclear.
