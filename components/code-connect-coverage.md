# Code Connect coverage

What is connected, what is not, and why. Measured 2026-10-07 by walking each
Figma node this repo implements and collecting every main component nested
inside it, then comparing that set against the published mappings.

**Why a document rather than a number in a README.** "Code connected" sounds
binary and is not. The denominator is every Figma component a repo component
nests, and it was 47 nodes against 17 mappings, so **36%**. A parent mapped
while its nested pieces are not is not connected, and that is the state the
system was in while every component carried a Code Connect file.

## What Code Connect does and does not do

It publishes a code snippet to a Figma component, one way, repo to Figma. It
verifies **nothing**: not a token value, not a measurement, not a prop name,
not that the module it imports exists. A component can be fully mapped and the
snippet still be code a developer cannot run. `npm run check-code-connect`
checks the three things that are checkable from here: the module exists, the
export exists, and every prop the snippet emits is a real prop.

## Light and Midnight in a Code Connect snippet

A snippet is text. Flipping the mode in Figma cannot change it, and nothing is
wrong when it does not.

What makes a component respond at runtime is that **no colour it names carries
a mode**. There is one token name per colour, and the value is chosen by a
`data-theme` ancestor:

```jsx
<div data-theme="midnight">
  {/* the same markup, Midnight values */}
  <Widget title="Bank Balances" size="detail">…</Widget>
</div>
```

`--semantic-color-light-mode-*` is the retired form and resolves to nothing;
`check-token-refs` fails the build on one. Every mapping now says this, because
the snippet is the only place a developer looks.

## Icons

Icons had **no path and no link anywhere**, because there was nothing to link
to: six components each carried a private `Icon` or `Glyph` helper and none was
importable. `components/icon/icon.jsx` is now the one implementation.

A Pathway icon is **a font, not a file**. There is no per-icon asset.

| What | Where |
|---|---|
| Font | Material Symbols **Rounded**, a single variable font |
| Stylesheet | `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200` |
| Name catalogue | https://fonts.google.com/icons (set Style = Rounded) |
| Source repo | https://github.com/google/material-design-icons |
| Web symbols | https://github.com/google/material-design-icons/tree/master/symbols/web |
| One icon | `<Icon name="arrow_forward" size="M" />` |

The name you write is the folder name in that repo. The axes are font axes:
`FILL` 0 outlined or 1 solid, **read from Figma per component and never
assumed**; `wght` 400 and `GRAD` 0 everywhere; `opsz` matched to the font size,
because a 16px glyph at `opsz 20` draws visibly too light.

**Size is the FRAME, never the vector.** Figma nests a wrapper (24), an icon
frame (16) and the drawn vector (~12). `size` is the frame. Passing the
vector's ~12 ships an icon a third too small.

## Mapped

36 mappings. Every one is verified by `check-code-connect`.

| Figma | Node | Code |
|---|---|---|
| Iconography | `48:1153` | `components/icon/icon.jsx` |
| Action Icon | `40006794:19891` | `components/icon/action-icon.jsx` |
| DisplayIcon | `40006522:26547` | `components/icon/display-icon.jsx` |
| Button Icon | `1884:5171` | `button.jsx`, `showText={false}` |
| PW_Button | `40003293:93741` | `button.jsx` |
| Loading.Animation | `40002486:13398` | `button.jsx`, `ButtonSpinner` |
| PW_Checkbox | `40002324:54532` | `checkbox.jsx` |
| SideNav.Container | `40004059:1375` | `sidenav.jsx` |
| SideNavItem | `40003954:284` | `sidenav.jsx` |
| SideNavItem.Collapsed | `40005607:25240` | `sidenav.jsx` |
| SideNavItem.List | `40007332:6995` | `sidenav.jsx` |
| SideNav.ListSection | `40007332:8034` | `sidenav.jsx` |
| SectionLabel | `40006794:5975` | `sidenav.jsx` |
| indicator.stripe | `40004035:27057` | `sidenav.jsx` |
| SideBar Expand/Collapse | `40006793:3783` | `sidenav.jsx`, `CollapseButton` |
| TopNav.Global | `40007067:6508` | `top-nav.jsx` |
| TopNav.Actions | `40007082:7313` | `top-nav.jsx` |
| TopNav.Profile | `40016590:37966` | `top-nav.jsx` |
| ModuleSwitcher | `40006819:14578` | `top-nav.jsx` |
| SideNav.Control | `40007082:7703` | `action-icon.jsx` at Size=Large |
| TopNav.Search | `40007095:4048` | `search.jsx` |
| Org Switcher | `40006819:14583` | `org-switcher.jsx` |
| Avatar | `68:659` | `org-switcher.jsx`, one corner, see below |
| Module.Icon | `40006876:42134` | `module-icon.jsx` |
| Widget | `40009622:39702` | `widget.jsx` |
| Widget.Heading | `40017333:34481` | `widget.jsx` |
| KPI Tiles | `40009415:27750` | `kpi-tile.jsx` |
| KPI Number & Trend | `40017320:247` | `kpi-number-trend.jsx` |
| KPI Number | `40017333:37612` | `kpi-number-trend.jsx` |
| _Change | `40009415:28112` | `kpi-number-trend.jsx` |
| trend.comparisoncontrol | `40017320:361` | `kpi-number-trend.jsx` |
| _Chart mini | `40009415:27919` | `mini-chart.jsx` |
| _Chart data | `40009417:13029` | `bar-chart.jsx` |
| _Legend | `40009417:13729` | `bar-chart.jsx` |
| _X-axis and its labels | `40009417:12966` | `bar-chart.jsx` |
| `<pathway-sidenav>` | `40004059:1375` | `pathway-sidenav.js` |

### Partial, and said so

**Avatar `68:659`** is 26 variants on Size x Content x Shape x Style. This repo
implements one corner: the org logo in the OrgSwitcher trigger, Square +
Stroke + Image with a placeholder. The mapping says which corner exists. A
general Avatar covering all 26 is separate work, and building one to lift a
coverage number would repeat the Badge and PageTemplate mistake: an
implementation that did not match Figma and had to be deleted.

## Not mapped, with the reason

Nothing here is an oversight. Each is a decision, and each would be wrong to
map as things stand.

### Foreign components, not Pathway's

These are nested inside Pathway components but come from a remote third-party
library, almost certainly Untitled UI, the same source as the `↳ Select` page
in CLAUDE.md §8.1. They cannot be mapped from this repo, because a mapping
publishes into the file that owns the component.

| Figma | Node | Nested in | Evidence |
|---|---|---|---|
| Featured icon | `40003806:3550` | KPI Tiles, 10x | 84 variants, `Color: Brand/Gray/Error/Warning/Success` and `Type: Light/Glass/Modern neue`. Pathway has no `Gray` or `Error` tone; the names are Static/Neutral and Static/Negative |
| Dropdown | `40003188:9930` | KPI Tiles, 18x | remote. `Type` is Button, Icon or Avatar |
| Org Dropdown_V4 | `40007336:10275` | Org Switcher, 2x | remote |
| `add`, `search`, `expand_more`, `expand_less`, `moving` | various | everywhere | remote glyph components. In code these are a `name` string on `<Icon>`, so there is nothing per glyph to map. `icon.figma.ts` carries the explanation |

**This is a real finding, not a technicality.** The KPI Tile's featured icon and
its dropdown are foreign components inside a Pathway component. Either they get
rebuilt as Pathway components or the tile stops using them. Until then the tile
is not fully ours.

### Deliberately not implemented in this repo

| Figma | Node | Why |
|---|---|---|
| Badge | `40017025:88008` | 96 variants. A Badge was built and **removed at the owner's instruction** because it did not match Figma. Mapping it would point at code that is gone |
| Search, general | `40006978:23446` | 11 variants on State x Has Filter. This repo implements the TOPNAV search bar, which is a different component with its own tokens and behaviour. Conflating the two is what made the Search page wrong before |
| Help Text | `31938:27802` | 19 variants, nested 24x in Checkbox. No implementation. Checkbox renders its own label and no help text |
| Tabs, ToolBar, Page Heading, Page Section | `40006716:4292`, `40006537:42570`, `40006538:42661`, `40006528:39636` | Nested in ScreenTemplate. The PageTemplate component was removed from this repo because the implementation was wrong; NavShell was kept and is a composition, not a module |
| ScreenTemplate | `40009709:26016` | NavShell has no `nav-shell.jsx`: it is assembled in its stories out of TopNav, SideNav and a page area. A mapping would point a Figma component at a story, which is not importable. Closing this means writing the module first |
| Animated Spinner / Step 1 | `40006622:50003` | One 12x12 frame of an animation, no properties, no parent page. Mapping the React spinner to a single still would assert something false. `Loading.Animation` carries the explanation |

## What this cost in defects

Mapping these found four real bugs that the token checks, the build and Code
Connect itself all passed:

1. **SideNav.Control** was a hand-rolled button with a 22px glyph and no state
   layer, against a design that is an `Action Icon` at Size=Large: a 48 target,
   a 32 layer and a 16 glyph, with three states. It had one.
2. **ActionIcon** was a private helper inside `widget.jsx`, so the Figma set
   nested 30 times in that very component had nothing to point at, and the KPI
   Tile could not reuse it.
3. **The chart axis titles** did not exist in code. Figma draws `_Y-axis label`
   and `_X-axis label` on the Explore variant; the chart had ticks and month
   labels but nothing saying what was measured.
4. **DisplayIcon's Color axis has no tokens behind it in Figma.** The variant
   binds no fill and the nested glyph's fill is unbound, so the seven colours
   are unbound in the file. The code's mapping is this repo's, derived from the
   tone names, and the Figma side needs binding.
