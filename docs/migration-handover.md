# Pathway design tokens: migration handover

For the team taking this repository into the organisation account. It covers what the
public contract is, what changed in the 2026-09-03 restructure, what breaks, and what
is still open.

Read `docs/token-pipeline.md` alongside this for how tokens flow out of Figma.

## 1. The public contract

**407 public variables. 966 private.** The private ones are implementation detail and
carry no compatibility promise; their names and slot numbers move whenever a ramp is
retuned.

| Collection | Public | Private | Modes |
|---|---|---|---|
| Semantic: Color | 332 | 0 | Light Mode, Midnight Mode |
| Semantic: Layout & Units | 39 | 0 | Desktop 1440pt, Tablet 798pt, Mobile 393pt |
| Contextual: Layout & Units | 30 | 0 | Desktop, Tablet, Mobile |
| Breakpoints | 5 | 0 | Value |
| Semantic: Type | 1 | 553 | Desktop, Mobile |
| Primitive: Color | 0 | 302 | Mode 1 |
| Primitive: Type | 0 | 79 | Value |
| Primitive: Unit | 0 | 32 | Mode 1 |

Total public surface went from **936 to 407**. The emitted colour contract went from
**452 to 332** custom property names, measured off the built CSS.

`Contextual: Color` was deleted; see §3.10. `Contextual: Layout & Units` is public
because a token a designer cannot see in their library is not a token: nobody can lay
out a button or a nav item without `Button/Padding` and `NavItem/Large/Radius`.

### Why Semantic: Type shows 1 public variable

Type is consumed as **CSS classes**, never as individual custom properties. The 554
type variables build the classes and are otherwise internal, so 553 are private.

One is deliberately left public. A Figma collection with zero published variables
disappears from the consuming file's mode switcher, which would remove Desktop and
Mobile type switching from designers working in other files. 131 of the type variables
genuinely differ between those two modes, so the switch does real work. The single
published variable keeps the collection visible. Do not hide it.

### What a consumer may depend on

Only these:

- `--semantic-color-*` from `themes/light.css` and `themes/midnight.css`
- `--semantic-layout-units-*` from `layout.css`
- the `.pw-type-*` classes from `type-classes.css`

`layout-contextual.css` carries component internals (Button, Card, NavItem, Page,
focus ring metrics). The components in this repo consume it; product code should not.

Everything else, including every `--primitive-color-*` name, is internal.

## 2. Structure of the colour contract

Four families, each split into Action (interactive, carries states) and Static
(non-interactive, carries prominence).

```
Surface     Canvas, Sheet, Elevated/{Base,Medium}, Overlay/{Base,Medium}
Scrim       Base, Faint, Light, Subtle

Fill/Action        Primary, Primary Dim, Secondary, Field, Mono, Disabled,
                   Status/{Positive,Negative,Warning,Alert,Info} + a Dim of each,
                   Accent/{Amethyst,Jade,Lagoon,Mauve,Seabreeze} + a Dim of each
Fill/Static        Brand, Neutral, Status/*, Accent/*
Foreground/Action  Primary, Secondary, Mono, Disabled, Status/*, Accent/*
Foreground/Static  Brand, Neutral, Status/*, Accent/*
Stroke/Action      Primary, Secondary, Field, Mono, Disabled, Status/*, Accent/*
Stroke/Static      Brand, Neutral, Status/*, Accent/*
```

Action groups carry `Rest`, `Hover`, `Pressed`. Static groups carry prominence steps
(`Faint`, `Subtle`, `Medium`, `Bold`, `Contrast`).

There is one shared `Disabled` per family (`Fill/Action/Disabled`,
`Foreground/Action/Disabled`, `Stroke/Action/Disabled`) rather than a disabled state
inside every intent. Every disabled control in the system uses those three.

`Dim` is the pale companion to a solid fill: pale in Light Mode, deep in Midnight
Mode. It is the token for tonal buttons, selected rows, and tinted callouts.

## 3. What changed, and why

### 3.1 Public surface cut from 936 to 407

Primitives and Semantic: Type were made private. Neither was ever meant to be a
contract: primitive slot numbers move when a ramp is retuned, so a consumer bound to
`Brand/450` breaks silently on any retune, and type is consumed as classes.

`Contextual: Layout & Units` was made private in the same pass and then **put back**,
because it made the component metrics invisible in a designer's Figma library. That is
the 374 → 407 difference; no tokens were added to get there.

### 3.2 Tertiary removed entirely

`Foreground/Action/Tertiary`, `Fill/Action/Tertiary` and `Stroke/Action/Tertiary` are
gone. Tertiary resolved to `Brand/50 -> 75 -> 100` while `Primary Dim` resolved to
`Brand/0 -> 50 -> 75`, so the two groups were the same colours offset by one ramp
step. 148 node bindings across 18 Figma pages were rebound to the surviving
equivalents before deletion, and no semantic token was still aliasing them at the
point of removal.

### 3.3 Alpha primitives rebuilt

Every family now carries the same opacity set at each anchor: **4, 8, 16, 24, 36, 50,
70**. Anchor counts are two for Brand, Cool Neutral and Warm Neutral, one for each
accent and status hue. 15 anchors times 7 opacities is 105 alpha primitives, replacing
120 that carried an inconsistent 8-value set including two values that were never part
of the specification.

They also render in ascending order now (by anchor, then by opacity). Figma's Plugin
API exposes no reorder method, so panel order is creation order; the only way to fix
order is to recreate the variables and repoint everything that aliased them, which is
what happened here.

### 3.4 Disabled states now pass AA

Disabled text was measuring 3.24:1 in Light Mode and 3.33:1 in Midnight Mode against
its own disabled fill, which is below the 4.5:1 threshold for body text.

| Mode | Before | After |
|---|---|---|
| Light | 3.24:1 | 5.88:1 |
| Midnight | 3.33:1 | 5.14:1 |

The fill moved to 8% and the foreground to 70% in Light, 50% in Midnight.

### 3.5 Neutral families given a rule

**Cool neutrals serve foreground. Warm neutrals serve surfaces and fills.** Applied
across `Fill/Action/Secondary`, `Fill/Static/Neutral`, `Fill/Action/Field`, the
disabled fill and stroke, and `Surface/Elevated` and `Surface/Overlay` in Light Mode.

Three deliberate exceptions:

- **Scrim** stays on cool neutral. A warm full-screen veil tints the entire viewport.
- **`Fill/Action/Mono`** stays pure white by definition.
- **Midnight `Surface/Elevated` and `Surface/Overlay`** stay on Brand (`/600` to
  `/800`). That indigo ladder is the identity of Midnight Mode and flattening it to
  warm grey removes it.

### 3.6 Brand light end respaced, and #fafafa moved out of it

`Brand/0` was `#fafafa`, which is achromatic: red, green and blue are all 250, chroma
0. A brand ramp step with no brand hue meant `Fill/Action/Primary Dim/Rest` rendered as
flat grey and then jumped to a visible blue on hover.

`#fafafa` is now `Cool Neutral/10`, and the Brand light end steps evenly:

```
Brand/0    #f9fafd  L*=98.3  C= 5
Brand/10   #eef2fb  L*=95.4  C=13   very light brand fill
Brand/25   #e2e9f7  L*=92.1  C=21
Brand/50   #ccd7f2  L*=86.0  C=38
Brand/75   #b6c6ec  L*=79.8  C=54
Brand/100  #a0b5e6  L*=73.7  C=70
```

Roughly 6 L\* per step with chroma climbing smoothly, replacing three steps bunched
inside a 7-point band followed by an 18-point cliff.

### 3.7 Surface hierarchy corrected in Light Mode

```
Surface/Sheet    #ffffff  L*=100.0   Cool Neutral/0
Surface/Canvas   #fafafa  L*= 98.3   Cool Neutral/10
```

Sheet is lighter than canvas, so sheets lift off the page.

### 3.8 Midnight primary foreground inverted

`Foreground/Action/Primary` in Midnight Mode resolved to `Brand/700 / 600 / 550`, all
dark navy, measuring 1.36:1 on its own Dim fill and about 1.5:1 on the canvas. It now
resolves to `Brand/100 / 75 / 50`, getting lighter as the state escalates.

| | fill | text | contrast |
|---|---|---|---|
| Rest | `#22386b` | `#a0b5e6` | 5.55:1 |
| Hover | `#2d4889` | `#b6c6ec` | 5.12:1 |
| Pressed | `#345499` | `#ccd7f2` | 5.08:1 |

Primary text now measures 9.65:1 on Canvas, 9.12:1 on Sheet, 7.57:1 on Elevated and
5.55:1 on Overlay. `Stroke/Action/Primary` was moved to match.

### 3.9 Stroke split for inputs versus buttons

An input border and a secondary button border are different weights, so they are
separate public tokens:

- `Stroke/Action/Field` for inputs (`#7b7b7b` to `#606060`, 4.1:1 to 6.0:1)
- `Stroke/Action/Secondary` for buttons (`#c4c4c4` to `#a6a6a6`, 1.7:1 to 2.3:1)

### 3.10 Contextual colour became a public Selection group

`Contextual: Color` held three variables, all `NavItem/Fill/*`, and it was private.
That was wrong twice over. A private token is invisible in a designer's library, so
the nav item could not be styled at all; and those three values were never
nav-specific — by inspection they serve nav rows, popover rows, open select and
search panels, and chips.

They are now **`Fill/Action/Selection/{Hover, Selected, Trail}`**, public, and the
collection is deleted.

| token | Light | Midnight |
|---|---|---|
| `Selection/Hover` | `Warm Neutral/800 @ 4%` | `Warm Neutral/25 @ 8%` |
| `Selection/Selected` | `Brand/100 @ 16%` | `Brand/100 @ 16%` |
| `Selection/Trail` | `Warm Neutral/800 @ 8%` | `Warm Neutral/25 @ 16%` |

Two bugs were fixed in the move: they were on **cool** neutrals when a fill wash
should be warm (§3.5), and Hover and Trail resolved to the **same value** in Light,
so an open group was indistinguishable from a hovered row. Trail is now double the
hover weight.

`Selection/Selected` also works as a `::selection` background — body text measures
15.7 to 16.3:1 on it across every surface — so there is no separate text-selection
token.

### 3.11 Layout gained breakpoint modes, and needed the colour treatment

`Semantic: Layout & Units` gained Desktop/Tablet/Mobile modes, which put the
breakpoint into every property name
(`--semantic-layout-units-desktop-1440pt-padding-base`). That breaks every spacing
reference and forces a consumer to swap variable *names* per breakpoint instead of
letting the cascade resolve one name.

`layout.css` and `layout-contextual.css` now strip the breakpoint and scope it with a
media query, emitting only the values that actually differ. Today that is just the
page padding, so the override blocks are four declarations total.

## 4. Breaking changes

| Removed or renamed | Use instead |
|---|---|
| `Foreground/Action/Tertiary/{Rest,Hover,Pressed}` | `Foreground/Action/Primary/{...}` |
| `Fill/Action/Tertiary/{Rest,Hover,Pressed}` | `Fill/Action/Primary Dim/{...}` |
| `Stroke/Action/Tertiary/{Rest,Hover,Pressed}` | `Stroke/Action/Primary Dim/{...}` |
| `Fill/Action/Tertiary Dim/*` | `Fill/Action/Primary Dim/*` |
| `*/Secondary Inverse/*` | `*/Secondary/*` |
| `*/Inverse/*` | `*/Dim/*` |
| `*/Base` (action states) | `*/Rest` |
| `Foreground/Static/Mono` | `Foreground/Static/Neutral/White` |
| `Foreground/Static/Info` | `Foreground/Static/Brand` |
| any `*/Extra/*` group | removed, no replacement |
| all `--primitive-color-*` | not a contract; move to a semantic token |
| individual `--semantic-type-*` | `.pw-type-*` classes |

Renames preserve Figma bindings because bindings are by ID. Deletions detach nodes,
which is why every deletion in this pass was preceded by a rebind.

## 5. Taking this to the organisation account

1. **Decide the scope and package identity.** `package.json` is currently
   `@helloimjolopez-pathway/pathway-tokens`. The NuGet package id
   `Pathway.DesignTokens` in `nuget/Pathway.DesignTokens.csproj` is a **placeholder**
   pending the organisation name. Both must be set before the first publish.
2. **Git history is clean.** All 507 commits were scanned; no credential is present in
   any tracked file at any revision, so the repository can migrate without a history
   rewrite.
3. **`scripts/check-secrets.js` runs in the build** and fails on any credential in a
   tracked file. Keep it wired in. It exists because a Code Connect migration once
   wrote an OAuth token into seven generated files.
4. **npm and NuGet publish in lockstep.** The `.csproj` reads its version from
   `package.json`, so the two cannot drift. `.github/workflows/publish-nuget.yml`
   handles the NuGet side.
5. **Three GitHub Actions** need their secrets recreated in the new account:
   `sync-tokens.yml`, `sync-component.yml`, `deploy-storybook.yml`. See §9 of
   `CLAUDE.md`.
6. **Storybook deploys to GitHub Pages** from `/storybook/` on `main`. The URL changes
   with the account and is referenced in component specs, so it needs a find and
   replace.

## 6. Still open

These are known and deliberate, not oversights.

| Item | Detail |
|---|---|
| ~~Repo not yet synced~~ | **DONE.** Synced 2026-09-03. 1,178 rows dumped from Figma plus 1,219 hash-verified reused rows = all 2,397. |
| ~~`PENDING_SYNC` allowlist~~ | **DONE.** Emptied. All 9 demos resolve every token they reference. |
| ~~Component reconciliation~~ | **DONE.** 306 stale references migrated across 20 files by `scripts/migrate-token-names.js`, which validates every replacement against the emitted CSS and refuses to write a name that does not exist. Storybook builds clean. |
| 9 primitive references in a draft | `components/search/SEARCH-SPEC-TO-REVIEW.md` documents a raw primitive palette whose slot numbers no longer exist. It is a pending-review draft, so it was left alone rather than rewritten. Per `CLAUDE.md` §8 it is a candidate for deletion or the sandbox repo. |
| Code Connect not published | All 7 mapping files under `components/sidenav/` parse cleanly and point at the right source, but were never published. Publishing needs a Figma token with Code Connect write scope, or it can go through the Figma MCP server. |
| Solid ramp order | `Cool Neutral/10`, `/50`, `/400`, `/800`, `/900` and `Brand/10` render after `/700` in the panel. Same no-reorder-API cause as the alphas. Fixing needs recreate and repoint, and unlike the alphas these steps are aliased by hundreds of semantics. |
| Colour docs page | Holds swatches bound to deleted tokens. Needs a `pathway-color-docs-sync` run. |
| Side Nav raw values | 7 nodes on the Side Nav page carry raw `#a0b5e6` with no binding, on active nav items. There is no NavItem foreground token in Contextual: Color, and `Foreground/Action/Primary/Rest` is wrong for a dark surface, so this needs a design decision rather than a guess. |
| Semantic Type reduction | 554 variables serve 111 styles. About 160 are removable with no visual change, but 104 text styles bind them and need repointing first. One style, `Text/Dense/Small/Regular`, is cross-wired. |
| Static prominence duplicates | Some Static ramps still hold duplicate values, for example `Foreground/Static/Status/Warning` where Bold, Contrast and Faint resolve alike. |

## 7. Verified properties

Measured, not assumed:

- Zero collapsed Action states (no intent where two states resolve to the same value)
- All 13 interactive intents pass AA in both modes against their paired Dim fill
- Disabled text passes AA in both modes (5.88:1 Light, 5.14:1 Midnight)
- Primary text passes AA on all four Midnight surfaces (5.55:1 to 9.65:1)
- Cool Neutral and Warm Neutral carry identical ladders at 20 steps each
- Every family obeys the four-dark-steps rule (600, 700, 800, 900 and nothing else)
- Alpha opacity set is identical at every anchor and renders in ascending order
- Surface ladder climbs monotonically in Midnight Mode
