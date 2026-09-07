# Pathway governance: pipelines, contracts, and who decides what

The one page to read before changing anything in this repo. It covers where each
kind of truth lives, how a change flows from Figma to a published package, what
is enforced automatically, and the rules that exist because breaking them has
already cost real time.

Detail lives elsewhere and is linked from each section. This page is the map.

## 1. The four sources of truth

Nothing here has one source of truth. Keeping them straight is most of the job.

| What | Truth lives in | Flows to |
|---|---|---|
| Colour, type, layout, breakpoint tokens | **Figma Variables panel** | `tokens/figma-export/pathwaytokens.json` → `sync-tokens` → Style Dictionary → `src/tokens/` → `dist/` → npm + NuGet |
| Motion tokens | **`docs/design-system-spec.md` §2** | `sync-motion-tokens` → `tokens/motion-tokens.json` → `motion.css` |
| Component visual design | **Figma component** | read by hand into this repo |
| Component implementation | **`components/<name>/<name>.jsx`** | the standalone `.html` demo and the Storybook stories both consume it |

When two disagree, the table decides. A token value in `src/tokens/` that
disagrees with Figma is stale output, not a second opinion: regenerate it. A spec
that disagrees with the Figma component means Figma moved and the repo has not
caught up; ask before rewriting either.

## 2. The token contract

**Eight CSS files. There is no `tokens.css`.**

| File | Holds | Consume it? |
|---|---|---|
| `primitives.css` | The raw ramp values | **Required, never named.** The themes point at these with `var()`, so it must load or every colour resolves to nothing. Product code must never name a `--primitive-*` |
| `themes/light.css`, `themes/midnight.css` | 326 semantic colour names, one name per token, mode by selector | **Yes.** This is the colour contract |
| `type.css` | The 41-token type scale: 1 family, 13 sizes, 18 line heights, 5 weights, 4 tracking steps | **Yes.** Compose the five properties at the call site |
| `layout.css` | Spacing, radius, border width, touch targets | **Yes** |
| `layout-contextual.css` | Component metrics under `--contextual-layout-units-*` | This repo's components. Product code should not |
| `motion.css` | Durations and easings | **Yes** |
| `breakpoints.css` | Breakpoint values | **Yes** |

Load order matters: `primitives.css` first, then exactly one theme, then the rest.

**Three things were retired and will not come back.** `tokens.css` (it emitted
every variable times every mode with the mode in the property name, 2,338
properties, and a developer reading it reasonably concluded the system was too
granular to adopt). `type-classes.css` and its 111 `.pw-type-*` classes. The
`--semantic-color-light-mode-*` name form. All three now fail the build.

### Naming

- Colour: `Fill|Foreground|Stroke|Scrim` / `Action|Static|Surface` / role / step.
- **Text and Icon are one tier called Foreground.** A control is one interactive
  surface; its label and its icon must not resolve through two ramps that can
  drift apart.
- **Surface sits under Fill**: `Fill/Surface/{Canvas,Sheet,Elevated}`.
- **There is no Contextual colour group.** A component reads the Action or Static
  ladder matching its role. Only its *metrics* are component-specific.
- Action states are `Rest`, `Hover`, `Pressed`, plus one `Disabled` per tier.
  Not `Base`.
- The graded Static ladder is `Faint, Subtle, Light, Medium, Contrast, Bold`,
  lightest to darkest in Light and inverted in Midnight. `White`, `Black` and
  `XLight` are inversion anchors, not rungs, and are exempt from that order.
- Status roles: `Warning` (Saffron), `Danger` (Orange), `Negative` (Red),
  `Positive` (Green), `Info` (Brand). `Alert` and `Tertiary` are gone, and so is
  every `*Inverse` variant.

**Inversion is a wrapper, not a token.** There are no `*Inverse` tokens because
an inverted region is the same modeless name inside a `[data-theme="midnight"]`
wrapper. Both themes compose in both directions, so a light island can sit inside
a dark island. That is what the top nav needs, being a dark bar with white
dropdown panels.

## 3. How a token change flows

```
Figma Variables panel                    docs/design-system-spec.md §2
  │  read through the Figma MCP,               │  scripts/sync-motion-tokens.js
  │  paged, into .figma-dump/*.tsv             │
  │  scripts/assemble-figma-export.js          ▼
  ▼                                     tokens/motion-tokens.json
tokens/figma-export/pathwaytokens.json          │
  │  scripts/sync-tokens.js                     │
  ▼                                             │
tokens/pathway-design-tokens.json  ◄────────────┘
  │  node style-dictionary.config.js
  ▼
src/tokens/   (the eight files + tokens.js)
  │  scripts/build-dist.js
  ▼
dist/  →  npm @helloimjolopez-pathway/pathway-tokens
       →  NuGet Pathway.DesignTokens
```

**`npm run build-dist` reads the intermediate, not the export.** Style Dictionary
consumes `pathway-design-tokens.json`. If you hand-patch
`figma-export/pathwaytokens.json`, run `npm run sync-tokens` first or the build
succeeds while emitting the previous values. That failure is silent, which makes
it easy to mistake for "my change didn't work". When in doubt:

```bash
npm run sync-tokens && npm run build-dist
```

From a fresh Figma read, `npm run sync-from-figma` chains the whole path.

**The paged read has a guard. Do not defeat it.** MCP responses cap around 20KB
against roughly 2,300 variable-mode rows, so a single read truncates silently at
about 350 rows, and a truncated page yields a token file that looks plausible,
is missing hundreds of tokens, and builds fine. The first page declares the
expected row total and `assemble-figma-export.js` refuses to run on a mismatch,
naming the offset to resume from. Never work around that by editing the total.

**Verify by digest, not by eye.** Both sides hash to the same FNV-1a digest per
collection and mode when they agree. Use `Math.imul` for the multiply on the
Figma side or the hash silently diverges.

## 4. What is enforced automatically

`npm run build-dist` runs three checks before it writes anything, and CI runs the
same command, so all three gate every push to `main`.

| Check | Catches |
|---|---|
| `check-demo-tokens.js` | A standalone demo that inlines values instead of linking the contract, or names a token the contract does not define |
| `check-token-refs.js` | Token names in **code**, including names built by template. It reads each file's own helper definitions and expands the calls |
| `check-token-names.js` | Token names written as **prose** in specs, MDX and agent briefs, skipping type styles and known non-token phrases |

Run them alone with `npm run check-tokens`.

**Why three and not one.** They fail in different places and the second and third
exist because the first was not enough. `check-demo-tokens` reported
"button.html: 4 tokens, all resolved" while Button carried 121 references to
tokens that no longer existed, because Button built its names by template and a
literal scan sees only the prefix. And prose never runs at all, so a spec can
name a token deleted a year ago while a developer or an agent reading it
faithfully reproduces a name that resolves to nothing. An unresolved `var()`
paints nothing and raises no error, so none of this fails loudly on its own.

## 5. Releasing

Both registries publish from the same generated output so a Blazor consumer gets
byte-identical CSS to a React consumer.

1. **Publish pathway-tokens to npm** (`workflow_dispatch`, choose the bump). It
   reads the highest version actually published to npm, bumps from that, builds,
   publishes, and commits the bumped `package.json` back to `main` with
   `[skip ci]`.
2. **Publish Pathway.DesignTokens to NuGet** runs after that succeeds, taking the
   version from `package.json`.

Reading npm's high-water mark rather than `package.json` is deliberate: two
workflows each owning their own counter is how the versions drifted apart before.

**Which bump.** Patch for token value changes. Minor for tokens added. **Major
for any name that disappears**, including a primitive custom property, because a
consumer may have named it even though they should not have.

## 6. Human review

Every Pathway skill asks before acting, one question at a time, and never
auto-advances a phase or flips a spec from `PENDING HUMAN REVIEW` to `REVIEWED`.
The pipeline skill refuses to run on a spec that is not `REVIEWED`. No skill
pushes or writes to Figma without being asked. If you are composing a larger
workflow you still stop at each gate; batching the questions is a bug, not an
optimisation. An explicit "just do it" from the user replaces that gate for that
action, not for the next one.

## 7. Rules that exist because breaking them cost time

- **Never respace a primitive ramp to even L\* steps.** The flat light ends are
  deliberate. Doing it once broke 316 tokens.
- **Never hand-edit derived files**: `pathway-design-tokens.json`, anything under
  `src/tokens/` or `dist/`, `sidenav-figmamake.html`. The one file in the chain a
  human may touch is the Figma export, and only to patch a value the panel
  already has.
- **Regenerate `tokens.js` only with `node style-dictionary.config.js`.** Every
  story and `resolve-tokens.js` are built for that exact output shape.
- **Figma cannot reorder variables.** Panel order is creation order; there is no
  move or sort in the API. A mis-ordered ramp can only be fixed by dragging in
  the panel, or by recreating in order and re-pointing every alias. Budget for
  that before promising to tidy the panel.
- **`valuesByMode` can carry stale mode ids the collection no longer declares.**
  Always iterate `collection.modes`.
- **Re-map the mode id when an alias crosses collections.** `Primitive: Color`
  has one mode; keeping the semantic mode id makes every lookup return null.
- **Icons are sized by the frame, never the vector.** See §8.
- **A low-alpha neutral wash cannot look warm.** Composited chroma over white
  across the whole Warm Neutral ramp peaks at 2 of 255. If a warm hover is
  wanted the lever is a solid Warm Neutral step or a higher opacity, never a
  different neutral anchor.

## 8. Icons: which number to implement

This is the most repeated bug in the system, so it gets its own section.

Figma nests three boxes and they are all different sizes:

```
Container.LeadingIcon   24x24, padding 4     <- the slot
  INSTANCE "add"        16x16                <- THE FRAME. this is the number.
    VECTOR "_shape"      9x9                 <- the visible mark. never this.
```

**Implement the frame.** For the M button that is 16, so `font-size: 16px` on a
span sized to the 24px slot. Material Symbols glyphs sit inside their em box with
the grid's own padding, so a 16px font reproduces Figma's inset automatically and
the visible mark lands where the designer put it. Implement the vector's 9px and
the icon ships far too small; drop the slot and set the glyph to the slot's 24px
and it ships too large.

**Why this keeps going wrong.** Designers resize an icon by padding its wrapper
and setting the instance to fill, rather than by resizing the instance. The
instance still reports 16x16 while the visible mark is smaller, so a developer
reading either the wrapper or the mark gets a different answer than a developer
reading the frame. All three numbers are visible in Figma and only one is right.

**Per-size table** (see `docs/design-system-spec.md` §7.2 for the full model):

| Size | Slot | Frame = `font-size` |
|---|---|---|
| L | 26 | 18 |
| M | 24 | 16 |
| S | 20 | 14 |
| XS | 16 | 12 |

Always Material Symbols **Rounded**, with `'wght' 400, 'GRAD' 0, 'opsz' 20`.
**Read `FILL` from Figma per component, never assume it** — 0 is outlined, 1 is
filled. `opsz` must match the rendered size band or the strokes render wrong; all
button icon sizes sit below the axis minimum of 20, so 20 is correct there.

For non-font SVG implementations, keep the un-cropped grid
(`viewBox="0 0 24 24"` or `0 -960 960 960`, never trimmed to content), render at
the frame size, and bake in Rounded / wght 400 / opsz 20 / the correct FILL at
export. Handing a team the cropped vector ships an icon that is too small and
breaks consistency across every icon.

**The durable fix is to stop asking developers to pick.** Ship the slot and
frame pair as one thing, so the numbers live in the design system rather than in
each consumer's head.

## 9. Consuming Pathway from another stack

Teams on Radzen, Angular, Blazor, React and older libraries should not have to
rebuild a component to use it.

- **Tokens** are plain CSS custom properties and work anywhere. Load the eight
  files, or `npm install @helloimjolopez-pathway/pathway-tokens`, or the NuGet
  package for a Blazor host.
- **Shell components** (side nav, top bar) are the right things to hand over
  whole. They own a region of the page and do not interleave with a host's layout
  or form validation, which is exactly what makes them portable as custom
  elements with Shadow DOM. Style encapsulation runs both ways, and CSS custom
  properties pierce the shadow boundary, so the token contract keeps working
  inside without extra plumbing. Fonts are document-scoped, so Red Hat Text and
  Material Symbols load once on the host page.
- **What does not port well**: anything that must interleave with a host's layout
  system, and form controls that must participate in a host's validation.

## Where to go next

| For | Read |
|---|---|
| Token pipeline detail | `docs/token-pipeline.md` |
| Component pipeline | `docs/component-pipeline.md` |
| System-wide rules (motion, a11y, spacing, type) | `docs/design-system-spec.md` |
| Storybook authoring | `docs/storybook-authoring.md` |
| Figma hygiene before handoff | `docs/figma-prep-checklist.md`, `docs/figma-build-conventions.md` |
| Agent rules for this repo | `CLAUDE.md`, `AGENTS.md` |
