# Pathway

Design system for Ministry Brands Amplify. Tokens + components + specifications, all versioned in one place, with Storybook deployed from `main`.

> **Looking for the tokens?** → **[TOKENS.md](TOKENS.md)**, where the CSS lives, which
> of the 284 names you may use, and what to link in what order.

## Using the tokens

**The colour contract is 186 names. Your full working vocabulary is 284.**

That is the number worth knowing, because adding up every declaration in the token
folder gives 966 and the retired `tokens.css` used to emit 2,338. Neither is the
contract. The difference is that primitives ship but are not named, and the modes share
one name set rather than each having their own.

| | Count | Name these? |
|---|---|---|
| Colour (`themes/light.css`, `themes/midnight.css`, same names) | **186** | Yes |
| Type scale (`type.css`) | 41 | Yes |
| Spacing, radii, borders (`layout.css`) | 40 | Yes |
| Motion (`motion.css`) | 17 | Yes |
| Sheet and TopNav padding (`layout-responsive.css`) | 6 | Yes |
| Breakpoints (`breakpoints.css`) | 5 | Yes |
| **Working vocabulary** | **284** | |
| Raw ramps (`primitives.css`) | 350 | **No**, but you must load it |
| Component metrics (`layout-contextual.css`) | 26 | This repo's components |

**The CSS lives in [`src/tokens/`](src/tokens/), and that folder has its own README**
covering load order, theming, the primitives question and the traps. Read it before
wiring anything up. The published package carries the same guidance in `dist/README.md`,
plus `dist/contract.json` listing every consumable name if you want to lint against it.

### Install

```bash
npm install @helloimjolopez-pathway/pathway-tokens
```

NuGet: `Pathway.DesignTokens`.

```js
// Every stylesheet is a named subpath export. primitives.css MUST come first, // the themes resolve through it, so without it all colour resolves to nothing
// and the page renders unstyled with no console error.
import "@helloimjolopez-pathway/pathway-tokens/primitives.css";
import "@helloimjolopez-pathway/pathway-tokens/themes/light.css";
import "@helloimjolopez-pathway/pathway-tokens/themes/midnight.css";
import "@helloimjolopez-pathway/pathway-tokens/type.css";
import "@helloimjolopez-pathway/pathway-tokens/layout.css";
import "@helloimjolopez-pathway/pathway-tokens/layout-responsive.css";
import "@helloimjolopez-pathway/pathway-tokens/motion.css";
import "@helloimjolopez-pathway/pathway-tokens/breakpoints.css";

// JS token object, and the raw DTCG JSON for tooling
import tokens from "@helloimjolopez-pathway/pathway-tokens";
import tokenJson from "@helloimjolopez-pathway/pathway-tokens/json";
import contract from "@helloimjolopez-pathway/pathway-tokens/contract.json";
```

There is deliberately no single `/css` entry point. One combined file was what
`tokens.css` used to be: it emitted every token times every mode with the mode baked
into the property name, 2,338 custom properties, and it is the reason this system read
as too granular to adopt. Retired 2026-09-03 and not coming back.

### Without a bundler

```html
<!-- primitives first: the themes reference these via var(), so this must load -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/primitives.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/themes/light.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/themes/midnight.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/type.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/layout.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/layout-responsive.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/motion.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/breakpoints.css" />
```

`@main` tracks the latest. Pin a tag instead if you need a fixed version.

### Using a token

```css
.card {
  background: var(--semantic-color-fill-static-neutral-mono);
  color:      var(--semantic-color-foreground-static-neutral-strong);
  border:     var(--semantic-layout-units-borderwidth-base) solid
              var(--semantic-color-stroke-static-neutral-base);
  border-radius: var(--semantic-layout-units-cornerradius-base);
}
```

One name carries both modes. Set `data-theme="midnight"` on `<html>` to flip the page,
or on any element to flip just that subtree. Never write a mode into a property name, `--semantic-color-light-mode-*` resolves to nothing.

### Can I use a primitive?

Yes, and nothing stops you. But `Primitive: Color` has exactly one mode, so a primitive
holds one value forever and will **not** respond to `data-theme`. Reach for one only
when you specifically want a fixed value. Full reasoning in
[`src/tokens/README.md`](src/tokens/README.md).

## Layout

```
pathway-ds/
├── docs/                        Cross-component design-system docs
├── components/                  One folder per component
│   ├── sidenav/
│   │   ├── sidenav.html         Live React demo + annotated spec panel
│   │   ├── sidenav-figmamake.html  AI-codegen-friendly demo (auto-synced)
│   │   └── sidenav-spec.md      Authoritative specification
│   └── spinner/
│       ├── spinner.html
│       └── spinner-spec.md
├── tokens/                      Source-of-truth token JSON
│   ├── figma-export/            Raw Figma export (sync target)
│   └── pathway-design-tokens.json   W3C DTCG format
├── src/
│   ├── tokens/                  Built output (the 8-file contract + tokens.js)
│   └── stories/                 Storybook sources
│       ├── Primitives/          Token primitives (Color, Typography, Units)
│       ├── Semantics/           Semantic tokens (light/dark, layout, typography)
│       └── Library/             Component stories (one folder per component)
├── .storybook/
├── .github/workflows/           Token sync · component sync · Storybook deploy
├── scripts/                     Token sync/audit/fix + component build scripts
```

## Governance: where things live

| To change… | Where |
|---|---|
| Published token package | [`@helloimjolopez-pathway/pathway-tokens`](https://www.npmjs.com/package/@helloimjolopez-pathway/pathway-tokens) |
| Token values | [`tokens/pathway-design-tokens.json`](tokens/pathway-design-tokens.json) (source-of-truth, synced from Figma) |
| Built CSS consumed by Storybook | the eight files in [`src/tokens/`](src/tokens/) (auto-regenerated by Style Dictionary) |
| Component geometry, tokens, accessibility rules | [`components/<name>/<name>-spec.md`](components/) |
| Component reference implementation | [`components/<name>/<name>.html`](components/) |
| How a component appears in Storybook | [`src/stories/Library/<Name>/`](src/stories/Library/) |
| Storybook chrome / addons | [`.storybook/main.js`](.storybook/main.js) · [`.storybook/preview.js`](.storybook/preview.js) |
| CI behaviour | [`.github/workflows/`](.github/workflows/) |

## CI

Three workflows in `.github/workflows/`:

1. **`sync-tokens.yml`**, fires when `tokens/figma-export/**` changes. Normalises the Figma export into the W3C DTCG JSON and commits `tokens/pathway-design-tokens.json`.
2. **`sync-component.yml`**, fires when `components/sidenav/sidenav.html` changes. Regenerates the `sidenav-figmamake.html` variant and commits it.
3. **`deploy-pages.yml`**, fires on every push to `main`. Builds Style Dictionary and Storybook fresh and deploys a clean `_site` artifact through the official Pages actions. Nothing is committed back to `main`. (`deploy-storybook.yml` is the retired predecessor, kept manual-only; it committed 14MB of build output per push.)

Source of truth is always the repo on `main`; Storybook is a downstream artifact.

## Typography (brand fonts)

Pathway uses **Red Hat Text** (all UI text) and **Red Hat Display** (headings H1H3 only). Both are open-source Google Fonts.

**Load via CDN (web/prototypes):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@600&family=Red+Hat+Text:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**Download font files (for Claude Design, Figma, or offline tools):**
- Red Hat Text: https://fonts.google.com/specimen/Red+Hat+Text → click **Download family**
- Red Hat Display: https://fonts.google.com/specimen/Red+Hat+Display → click **Download family**

Licensed under the [SIL Open Font License](https://scripts.sil.org/OFL). Free for any use.

## The components

Everything in the library, with the four things you need for each: what it is
specified as, what implements it, where to see it running, and which Figma node
it was measured from. This table is generated from
[`components/manifest.json`](components/manifest.json) by
`npm run build-component-index`, so it cannot drift from the registry.

<!-- BEGIN component-index (generated by scripts/build-component-index.js) -->

**16 components with their own page, 2 building blocks that only exist nested.**

| Component | Spec | Module | Storybook | Figma node | Code Connect files |
|---|---|---|---|---|---|
| **SideNav** | [spec](components/sidenav/sidenav-spec.md) | [`sidenav.jsx`](components/sidenav/sidenav.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-sidenav--docs) | `40004059:1375` | 9 |
| **Scrollable** | [spec](components/scrollbar/scrollbar-spec.md) | [`scrollbar.jsx`](components/scrollbar/scrollbar.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-scrollbar--docs) | repo only, not in Figma | 0 |
| **Checkbox** | [spec](components/checkbox/checkbox-spec.md) | [`checkbox.jsx`](components/checkbox/checkbox.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-checkbox--docs) | `40002324:54532` | 1 |
| **OrgSwitcher** | [spec](components/org-switcher/org-switcher-spec.md) | [`org-switcher.jsx`](components/org-switcher/org-switcher.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-orgswitcher--docs) | `40006819:14583` | 2 |
| **TopNav.Global** | [spec](components/top-nav/top-nav-spec.md) | [`top-nav.jsx`](components/top-nav/top-nav.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-topnav--docs) | `40007067:6508` | 4 |
| **Spinner** | [spec](components/spinner/spinner-spec.md) | [`spinner.jsx`](components/spinner/spinner.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-spinner--docs) | `40006622:50003` | 0 |
| **Button** | [spec](components/button/button-spec.md) | [`button.jsx`](components/button/button.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-button--docs) | `40003293:93741` | 3 |
| **Search** | [spec](components/search/search-spec.md) | [`search.jsx`](components/search/search.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-global-search-top-nav--docs) | `40007095:4048` | 1 |
| **NavShell** | [spec](components/nav-shell/nav-shell-spec.md) | composed, see its stories | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-navshell--docs) | `40009709:26016` | 0 |
| **Widget** | [spec](components/widget/widget-spec.md) | [`widget.jsx`](components/widget/widget.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-widget--docs) | `40009622:39702` | 2 |
| **KPI Tile** | [spec](components/kpi-tile/kpi-tile-spec.md) | [`kpi-tile.jsx`](components/kpi-tile/kpi-tile.jsx)<br>[`kpi-number-trend.jsx`](components/kpi-tile/kpi-number-trend.jsx)<br>[`mini-chart.jsx`](components/kpi-tile/mini-chart.jsx)<br>[`bar-chart.jsx`](components/kpi-tile/bar-chart.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-kpi-tile--docs) | 7 sets on page `40009862:10309` | 9 |
| **Dashboard** | [spec](components/dashboard/dashboard-spec.md) | [`dashboard.jsx`](components/dashboard/dashboard.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-dashboard--docs) | no Figma component | 0 |
| **Icon** | [spec](components/icon/icon-spec.md) | [`icon.jsx`](components/icon/icon.jsx)<br>[`action-icon.jsx`](components/icon/action-icon.jsx)<br>[`display-icon.jsx`](components/icon/display-icon.jsx)<br>[`featured-icon.jsx`](components/icon/featured-icon.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-icon--docs) | `48:1153` | 4 |
| **Dropdown** | [spec](components/dropdown/dropdown-spec.md) | [`dropdown.jsx`](components/dropdown/dropdown.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-dropdown--docs) | `40005568:4207` | 3 |
| **Mini Chart** | [spec](components/kpi-tile/mini-chart-spec.md) | [`mini-chart.jsx`](components/kpi-tile/mini-chart.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-mini-chart--docs) | `40009415:27919` | 1 |
| **Bar Chart** | [spec](components/kpi-tile/bar-chart-spec.md) | [`bar-chart.jsx`](components/kpi-tile/bar-chart.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-bar-chart--docs) | `40009417:13029` | 3 |

Building blocks. Each is mapped for Code Connect and specced, but has no page
of its own because it only ever appears as a nested instance inside the
component above it.

| Component | Spec | Module | Storybook | Figma node | Code Connect files |
|---|---|---|---|---|---|
| **ModuleIcon** | [spec](components/module-icon/module-icon-spec.md) | [`module-icon.jsx`](components/module-icon/module-icon.jsx) | nested only | `40006876:42134` | 1 |
| **TopNav.Actions** | [spec](components/top-nav-actions/top-nav-actions-spec.md) | [`top-nav.jsx`](components/top-nav/top-nav.jsx) | [open](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-topnav--docs) | `40007082:7313` | 1 |

<!-- END component-index -->

### What is checked, and what is not

Two suites. `npm run build-dist` runs the token-integrity checks, and
`npm run check-tokens` runs the documentation and story checks, so both fail a
build rather than relying on someone noticing.

In `build-dist`:

| Check | What it catches |
|---|---|
| `check-demo-tokens` | a document naming a token that does not exist |
| `check-token-refs` | a reference to the retired `--semantic-color-light-mode-*` form |
| `check-token-names` | a name that is not kebab-case lowercase |
| `check-token-object-refs` | a `T`/`L` object key referenced but never defined |
| `check-ladder-order` | a ladder whose names disagree with its resolved luminance |
| `check-state-distinctness` | an interaction state indistinguishable from another state in its group |
| `check-variant-distinctness` | a component prop that has stopped changing anything |
| `check-fill-foreground-pairs` | a fill with no paired `On Subtle` / `On Strong` foreground, or the reverse |
| `check-motion-coverage` | a state change with no transition, or a partial one |
| `fix-stale-doc-hex --check` | a hand-copied hex in a doc that no longer matches its token |
| `check-story-yield` | a token docs page rendering less content than its floor |

In `check-tokens`, additionally:

| Check | What it catches |
|---|---|
| `build-component-index --check` | the component table above out of step with the manifest, and a Storybook link in it that is not in the build |
| `check-spec-stories` | a spec whose Storybook section names a story that does not exist, or omits one that does |

And one that needs a built Storybook, so it is its own command,
`npm run verify-storybook`:

| Check | What it catches |
|---|---|
| `check-stories-render` | a story that renders NOTHING while the build stays green |

**That last one matters more than it sounds.** A module-level error in a CSF
file blanks every story in that file and webpack compiles it happily. It has
happened three times here: a leftover `storyName` assignment after a rename
blanked all nine Global Search stories, a dangling `BRAND_AXIS` reference
blanked more, and `useState` used without being imported blanked the Widget
Glance configurations story. The check loads all 107 stories in headless Chrome
and fails on an empty root. It was verified by breaking a story on purpose: the
build reported no errors and the check reported the blank page.

**What is NOT checked, and why it matters.**

- **Code Connect verifies nothing.** It publishes a code snippet to a Figma
  component. It never compares a token value, a measurement or a layout, and it
  flows repo to Figma only. A component can be fully mapped and completely
  wrong.
- **The token checks confirm that a name RESOLVES, not that it is the right
  name.** `check-fill-foreground-pairs` proves every fill HAS a paired
  foreground; nothing measures the pair a component actually uses against a
  contrast ratio per mode. Button's Primary and Negative labels sat on the mono
  anchor at 3.04:1 and 2.85:1 in Midnight while every check passed.
- **Nothing can verify a Figma node id from here.** Only Figma knows whether an
  id resolves and what kind of thing it is, and the MCP is interactively
  authenticated, so this needs an agent session.
  `npm run check-figma-nodes` does the half that can be automated: it lists
  every id the repo cites, where each is cited, and which are cited as a set.

So drift between Figma and this repo is the normal state, not the exception,
and only measurement finds it. A sweep on 2026-10-07 found four defects of that
class that had each survived months: two cited ids that do not exist in the
file at all, Search's node pointing at a 2594x1680 layout frame rather than a
component, and NavShell's pointing at a variant rather than its set.

### Walking through one

Take Widget as the shape of it. Open [`components/widget/widget-spec.md`](components/widget/widget-spec.md)
for the anatomy, the token table, the size ladder and the grid; open the
Storybook page for the same thing running, with a Playground, a size ladder at
the exact Figma boxes, and two token listings that resolve against the live
document; open [`components/widget/widget.jsx`](components/widget/widget.jsx)
for the implementation, where every measurement carries the Figma node it came
from. The Code Connect file next to it is what makes the Figma component offer
this code, and it publishes repo to Figma only.

Widget, KPI Tile and Dashboard are three components, not three views of one.
A Widget is a container that does not know what it holds. A KPI Tile is a card
in its own right. Both nest the same building block, `KpiNumberAndTrend`, which
has no card of its own and gets one from whatever nests it.

## Component-to-token map

`tokens/component-token-map.json` maps every component element to its CSS variable. Use this file to answer "which token does X use?" without reading specs.

## Known token gaps

| Gap | Fix needed |
|---|---|
| Font-size tokens are unitless numbers | Use `calc(var(--...-fontsize) * 1px)` in CSS |
| No `Red Hat Display` token | Add `family-display: Red Hat Display` in Figma Variables, re-export |
