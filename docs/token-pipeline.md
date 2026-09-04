# Pathway token architecture and pipeline

How design tokens get from Figma into a running application, what each tier is
for, and which names a consuming team can safely depend on.

**If you are consuming Pathway, read sections 1, 2 and 7.** Sections 3 to 6 are
for whoever maintains the pipeline.

---

## 1. What you install and what you load

```
npm install pathway-tokens          # React, Vue, plain web
dotnet add package Pathway.DesignTokens   # Blazor, Razor
```

Both packages ship the same generated files from the same commit and carry the
same version number, so `pathway-tokens@5.4.0` and
`Pathway.DesignTokens 5.4.0` contain byte-identical CSS.

Load two stylesheets for colour and one for type:

```html
<link rel="stylesheet" href="…/themes/light.css" />
<link rel="stylesheet" href="…/themes/midnight.css" />
<link rel="stylesheet" href="…/type-classes.css" />
```

Then reference tokens:

```css
.card {
  background: var(--semantic-color-fill-surface-sheet);
  color: var(--semantic-color-foreground-static-neutral-bold);
  border: 1px solid var(--semantic-color-stroke-static-neutral-subtle);
  border-radius: var(--semantic-layout-units-cornerradius-medium);
}
```

Type is a class, never five separate properties:

```html
<span class="pw-type-label-menu-base-medium">Donations</span>
```

### The five outputs

| File | Contains | Depend on it? |
|---|---|---|
| `themes/light.css` + `themes/midnight.css` | Every semantic colour, one name per token, value chosen by selector | **Yes.** This is the colour contract |
| `type-classes.css` | One `.pw-type-*` class per text style, with a mobile media query | **Yes** |
| `tokens.css` | Everything, with the mode baked into each name (`--semantic-color-light-mode-…`) | No. Legacy, being retired |
| `primitives.css` | Raw ramp values | No. See §2 |
| `tokens.json` | DTCG JSON | Only for tooling |

---

## 2. What is a contract and what is internal

**Safe to depend on:** `--semantic-color-*`, `--semantic-layout-units-*`, and
the `.pw-type-*` classes. These are named for their job, so their meaning
survives a rebrand or a colour retune.

**Not safe to depend on:** `--primitive-color-*`. Primitive names carry a family
and a slot number (`--primitive-color-brand-450`) and those slot numbers move
whenever a ramp is retuned. On 2026-09-02 a single retuning pass renamed 109 of
them. Nothing outside the token build should reference a primitive.

This is why `primitives.css` is shipped as a separate file rather than mixed into
the theme files: so a reviewer can see at a glance whether a consumer is reaching
past the contract.

### Why the naming is shaped the way it is

Every semantic token reads `<layer>/<tier>/<intent>/<step>`:

```
Fill      / Action    / Primary   / Hover
Foreground/ Static    / Neutral   / Bold
Stroke    / Static    / Negative  / Subtle
Fill      / Contextual/ NavItem   / Trail
```

- **Layer** is what gets painted: `Fill`, `Stroke`, `Foreground`, `Surface`,
  `Elevation`, `Scrim`. `Foreground` covers text and icons together, because an
  icon and its label in the same control must never drift apart.
- **Tier** is how the value behaves:
  - `Action` has interaction states and only appears on interactive things.
  - `Static` has a prominence ramp and no states.
  - `Contextual` belongs to one named component that needs states nothing else
    has (the side nav item's open-ancestor trail, for example).
- **Intent** is meaning: `Primary`, `Secondary`, `Tertiary`, `Negative`,
  `Positive`, `Warning`, `Alert`, `Brand`, `Neutral`, an accent.
- **Step** is either an interaction state (`Rest`, `Hover`, `Pressed`,
  `Disabled`) or a prominence step (`Faint`, `Light`, `Subtle`, `Medium`,
  `Contrast`, `Bold`, `Black`).

Two rules fall out of this and are enforced by review:

1. **`Primary` and `Secondary` exist only in the `Action` tier.** They describe
   call-to-action priority, which is a property of interactive elements. A static
   foreground has prominence, not priority.
2. **A group draws from exactly one primitive family.** A `Negative` button
   cannot take its hover from Red and its disabled state from Cool Neutral; the
   result is a control that changes hue as you use it.

---

## 3. Modes

Colour has two modes, **Light Mode** and **Midnight Mode**. The dark mode is
called Midnight throughout the design source and in `themes/midnight.css`.

Theming is done by **selector, not by name**. One token name resolves to
different values depending on an ancestor's `data-theme`:

```html
<html data-theme="midnight">
```

`data-theme="dark"` is also emitted, so a consuming team does not have to adopt
Pathway's vocabulary.

Because it is selector-based, one region can opt into the opposite theme, which
is how a dark top bar sits on an otherwise light page:

```html
<header data-theme="midnight"> … </header>
```

An earlier approach put the mode in the name
(`--semantic-color-light-mode-fill-…`). That form is still emitted in
`tokens.css` so existing consumers keep working, but it cannot express the
example above: a name resolves to one value, so a component styled that way is
frozen into one theme. New code should not use it.

Two other collections have modes that are **not** themes:

- `Semantic: Layout & Units` has Desktop / Tablet / Mobile.
- `Semantic: Type` has Desktop / Mobile.

Those resolve by viewport, and `type-classes.css` emits the mobile values inside
a `max-width: 767px` media query.

---

## 4. Where values come from

```
Figma Variables panel                     docs/design-system-spec.md §2
  (colour, type, layout, units)                    (motion)
        │                                              │
        │  agent session, Figma MCP server             │  scripts/sync-motion-tokens.js
        ▼                                              ▼
  .figma-dump/*.tsv  (paged, ~350 rows a page)   tokens/motion-tokens.json
        │
        │  scripts/assemble-figma-export.js
        ▼
  tokens/figma-export/pathwaytokens.json
        │
        │  scripts/sync-tokens.js
        ▼
  tokens/pathway-design-tokens.json
        │
        └──────────────┬───────────────────────────────┘
                       │  node style-dictionary.config.js
                       ▼
        src/tokens/themes/light.css
        src/tokens/themes/midnight.css
        src/tokens/type-classes.css
        src/tokens/primitives.css
        src/tokens/tokens.css        (legacy)
        src/tokens/tokens.js
                       │
                       │  scripts/build-dist.js
                       ▼
                     dist/  →  npm + NuGet
```

Everything below the Figma panel is **generated**. Do not hand-edit
`pathway-design-tokens.json`, anything in `src/tokens/`, or `motion-tokens.json`.
The next sync overwrites them.

### Why there is a paging step

Figma has no REST variables access on this plan, so the panel is read through the
Figma MCP server from an agent session. MCP tool responses are capped at roughly
20KB and the panel is around 2,300 variable-mode rows, so a single read truncates
silently at about 350 rows.

Silent truncation is the dangerous failure: it produces a token file that looks
plausible and is quietly missing hundreds of tokens, and the build succeeds. So
the read is paged, the first page declares the expected row total, and
`assemble-figma-export.js` **refuses to run on a count mismatch**. A dropped page
is a hard error naming the offset to resume from, rather than data loss.

This replaced a manual step where a designer ran the "Variables Import Export"
plugin and saved a file by hand.

---

## 5. Running a sync

```bash
# 1. An agent session reads Figma in pages, writing .figma-dump/p1.tsv, p2.tsv, …
# 2. Then:
npm run assemble-export .figma-dump    # fails loudly if a page is missing
npm run sync-tokens                    # → pathway-design-tokens.json
npm run build-dist                     # → src/tokens/, then dist/
```

Or as one step once the dump is in place:

```bash
npm run sync-from-figma
```

`build-dist` runs two guards, and both are build failures rather than warnings:

- **`check-demo-tokens.js`** verifies every component demo links the real built
  CSS, inlines no token declarations of its own, and references only tokens that
  exist. It checks `var()` references, `t("…")` calls, and names built by the
  `c()` / `u()` helpers. All three matter: a hand-copied token subset drifts
  silently, and a wrong colour looks like a design decision rather than a bug.
- **`check-secrets.js`** fails on any credential in a tracked file. This exists
  because a codegen tool read the git remote URL, found an embedded token, and
  wrote it into seven generated files with no warning.

---

## 6. Publishing

| Registry | Workflow | Trigger |
|---|---|---|
| npm | `publish-tokens.yml` | Manual, with a patch/minor/major choice |
| NuGet | `publish-nuget.yml` | Automatically after a successful npm publish, or manual |

The npm workflow bumps from **npm's highest published version**, not from
`package.json`. That is deliberate: reading `package.json` caused a version
regression in June 2026 when main was stale. The NuGet workflow then reads the
version out of `package.json`, so it follows rather than keeping its own counter.
Two workflows each owning a counter is how registries drift apart.

Choosing a bump:

- **patch** — token values changed, no names added or removed
- **minor** — tokens added
- **major** — tokens renamed or removed, which breaks consumers

---

## 7. What is guaranteed and what is not

**Guaranteed across a minor or patch release:**

- Every `--semantic-color-*` name keeps its meaning
- Every `.pw-type-*` class keeps its meaning
- `data-theme="midnight"` and `data-theme="dark"` keep working
- npm and NuGet carry identical CSS at the same version

**Not guaranteed:**

- Primitive names and slot numbers. These move when a ramp is retuned
- Exact colour values. A retune changes values without changing names, which is
  the entire point of the semantic tier
- `tokens.css` and its `-light-mode-` name form, which is being retired

**Reporting a problem.** If a semantic name disappears without a major version
bump, that is a bug in this repo. If a colour value changed and your layout broke,
that is expected and the fix is on your side: you were probably depending on a
specific value rather than on its role.
