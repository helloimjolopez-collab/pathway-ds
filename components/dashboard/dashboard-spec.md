# Dashboard: Pathway Design System Component Spec

Status: REVIEWED
Reviewed: 2026-10-07, measured by driving the canonical demo

## Links

| What | Where |
|---|---|
| Canonical demo | https://helloimjolopez-collab.github.io/design-sandbox/phase-2/Widget%20Container%20Demo/ |
| Figma, widgets | `3sw45aVcngFAmpbP6cfrXP` node `40009622:39702` |
| Storybook | [Library/Dashboard](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-dashboard--docs) |
| Code Connect | none, and that is a gap: no Figma component exists for the dashboard, so there is nothing to map to. See the note below. |
| Component module | `components/dashboard/dashboard.jsx` |
| Widget spec | `components/widget/widget-spec.md` |

## 1. Component Overview

A board of widgets with a toolbar above it. The dashboard owns the grid, the
catalogue, the add and manage flows, and the draft that makes them reversible.
It owns no content: the host passes `renderWidget`.

### Figma source

There is no Figma component for the dashboard. Its behavioural source of truth
is the demo, read by driving it rather than looking at it. Every number in this
spec was measured from the running page.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| Grid columns, rows, gap, flow | Design | the demo, mirrored in `dashboard.jsx` |
| Per-size spans | Design | the demo, mirrored in `SIZE_GRID` |
| Add-widget flow and dialog | Design | the demo |
| Catalogue entries | Consumer | the `catalogue` prop |
| Widget content | Consumer | `renderWidget` |
| Draft, commit, cancel semantics | Engineering | `dashboard.jsx` |

Rule: the demo owns the flow. Where this repo differs from it, the difference is
a defect in this repo unless recorded here as deliberate.

## 2. Component Anatomy

```
page                      Fill/Surface/Canvas
  toolbar                 44 min height, wraps
    DashboardSelector     name, inline rename in manage, switcher
    WidgetFinder          filters what is ON the board
    Add widget            opens the dialog
    Refresh all           only when onRefreshAll is supplied
    Manage                enters manage mode
  .pw-dashboard-grid      12 / 8 / 4 columns, 48px rows, 16px gap, flow row
    Widget                one per entry, spans from SIZE_GRID
```

## 3. Design Tokens

### 3.1 Surface

| Element | Token | Value |
|---|---|---|
| Page | `Fill/Surface/Canvas` | `#fafafa` |
| Dialog, menus | `Fill/Surface/Elevated` | `#ffffff` |
| Card in the gallery | `Fill/Surface/Canvas` | `#fafafa` |
| Scrim | `Scrim/Base` | |

**The page and the widget card must not be the same token.** They both resolved
to `Fill/Static/Neutral/Base` once and nothing on the board read as a card.

### 3.2 Fill

| Element | Token |
|---|---|
| Button hover | `Fill/Action/Secondary/Hover` |
| Selected category | `Fill/Action/Primary/Subtle/Rest` |
| Primary button | `Fill/Action/Primary/Strong/Rest` and `/Hover` |
| App badge | `Fill/Static/Brand/Subtle` |

### 3.3 Text

| Element | Token |
|---|---|
| Dashboard name, card name | `Foreground/Static/Neutral/Bold` |
| Body, description | `Foreground/Static/Neutral/Base` |
| Counts, meta | `Foreground/Static/Neutral/Subtle` |
| Selected category | `Foreground/Action/Primary/On Subtle/Rest` |
| Primary button label | `Foreground/Action/Primary/On Strong` |
| App badge | `Foreground/Static/Brand/On Subtle` |

### 3.5 Geometry

| Property | Token | Value |
|---|---|---|
| Grid gap | `Gap/Base` | 16 |
| Radius | `CornerRadius/Base` | 8 |
| Dialog radius | `CornerRadius/Large` | 12 |

Row unit 48, dialog 900x660, category rail 186, toolbar min height 44. Measured
component metrics, not tokens.

## 4. Layout & Spacing

### The grid

| | Desktop ≥1024 | Tablet ≥768 | Mobile <768 |
|---|---|---|---|
| Columns | 12 | 8 | 4 |

Auto-rows 48px, gap 16px, `grid-auto-flow: row`, `align-content: start`.

| Size | Desktop | Tablet | Mobile | Rows |
|---|---|---|---|---|
| glance | 3 | 4 | 4 | 3 |
| detail | 6 | 8 | 4 | 8 |
| explore | 12 | 8 | 4 | 9 |
| band | 12 | 8 | 4 | 3 |

`row`, not `row dense`. See the Widget spec §4 for why.

### The toolbar

Find a widget, Add widget and Refresh all are **available without entering
manage mode**, which is how the demo works. Manage mode holds only the
destructive half: rearranging, resizing and removing.

Refresh all is drawn only when the host supplies `onRefreshAll`, because a board
whose widgets do not fetch has nothing to refresh and the button would be a lie.

## 5. Item / Variant Structure

The board has no variants. Each entry is `{ id, catalogueId, title, size }` and
each catalogue entry is `{ id, name, description, category, app, defaultSize,
supportedSizes, repeatable }`.

## 6. State Matrix

| State | Toolbar | Widgets |
|---|---|---|
| View | finder, Add, Refresh all, Manage | normal |
| Manage | Add, Cancel, Done | dashed outline, draggable |
| Filtered | finder has a clear button | only matches rendered |
| Dialog open | unchanged behind the scrim | unchanged |

### State logic rules

**Filtering is presentational only.** It never touches the draft, so finding a
widget cannot become an edit and clearing the box always brings the board back
whole.

**Adding and swapping enter manage mode.** Both are changes to the board, so
they go through the draft and Cancel puts the original back.

## 7. Sub-components / Decorations

| Part | Export |
|---|---|
| Toolbar button | `Button` |
| Board finder | `WidgetFinder` |
| Name and switcher | `DashboardSelector` |
| Add dialog | `AddWidgetModal` |
| Swap picker | internal `SwapSheet` |

## 8. Container / Surface

### 8.2 Dimensions & Padding

Page padding `Padding/Tight` vertical and `Padding/Relaxed` horizontal. Dialog
900x660 with a 186px rail and the gallery filling the rest.

## 9. Interaction / Behaviour

### 9.1 Adding a widget

Trigger: Add widget, from either mode.

Behaviour: a dialog opens, 900x660, `role="dialog"`, `aria-modal="true"`,
labelled "Add widget".

- Header: `dashboard_customize` glyph at 19px, the title, a close button.
- Body: a 186px category rail beside the gallery.
- Rail: **All widgets**, then **Added (n)**, then a separator, then one entry
  per category found in the catalogue, each with a count of how many of that
  category are already on the board.
- **Added appears only when the count is above zero.** A filter for an empty set
  is a dead end.
- Gallery: a search field and a grid/list toggle above the cards.
- Card: app badge, name, description, and an Add button. The whole card is a
  button, `role="button"` with `tabindex="0"`, and the Add button is the visible
  label for that, which is the demo's arrangement rather than a duplication.
- A non-repeatable widget already on the board reads "Added" and is disabled.
- Picking one adds it at its default size, closes the dialog, and enters manage
  mode so the addition can be cancelled.
- Focus is trapped, Escape closes, body scroll is locked, and focus returns on
  close.

### 9.2 Finding a widget

The toolbar field filters the widgets **already on the board** by title, with a
clear button present whenever there is a query.

This is a different question from the gallery's search. "Where is my cash
widget" is the board finder; "what widgets exist" is the gallery. They were one
control once and it was the wrong one.

### 9.3 Swapping a widget

Every widget title is a swap control. See the Widget spec §9.

### 9.4 Rearranging

Manage mode only. Drag a widget onto another to take its place in the order.
Authored order is what the grid renders, so reordering is reordering the array.

### 9.5 Refreshing

Refresh all fans out to every widget's own refresh. Individual refresh is a
widget-level action.

## 10. Collapsed / Compact / Variant-specific State

None. A dashboard has no collapsed state. What looks like one is MANAGE MODE,
which is a mode rather than a state: it is entered deliberately, it swaps the
toolbar, and it holds a draft so Cancel puts the board back. See §9.

The board does respond to width, but that is the grid reflowing from 12 columns
to 8 to 4, not a variant. See the Widget spec's flex grid section.

## 11. Iconography

| Action | Ligature |
|---|---|
| Add widget | `add` |
| Refresh all | `refresh` |
| Manage | `tune` |
| Dialog title | `dashboard_customize` |
| Close | `close` |
| Switch dashboard | `expand_more` |
| Grid view | `grid_view` |
| List view | `view_list` |
| Selected | `check` |
| Find | `search` |

## 12. Interaction Patterns

Standard Pathway patterns only, plus §9. Two parts delegate their behaviour
rather than reimplementing it:

- The widget menu is `Dropdown`, so Escape, click-outside and the ARIA wiring
  come from `components/dropdown/dropdown-spec.md` §9.
- The add-widget dialog follows Pathway's own modal conventions: focus trapped,
  Escape closes, body scroll locked while open.

## 13. Accessibility

- The dialog is a real dialog: `role`, `aria-modal`, a label, a focus trap,
  Escape to close, body scroll locked, focus returned on close.
- Category buttons carry `aria-pressed`.
- The view toggle carries `aria-pressed` and an `aria-label` each.
- Gallery cards are keyboard operable: `role="button"`, `tabindex="0"`, and
  Enter or Space activates them. A disabled card drops to `tabindex="-1"` and
  carries `aria-disabled`.
- The switcher is `aria-haspopup="listbox"` with `aria-expanded`, and its
  options carry `aria-selected`.
- The finder is labelled, and its clear button is labelled separately.

## 14. Storybook

Sidebar-visible, matching the untagged exports in `Dashboard.stories.jsx` exactly:

| Export | Name |
|---|---|
| `Playground` | Add widget flow |
| `AddWidgetFlow` | Add widget flow |
| `SwapAndManage` | Swap and manage |
| `StateMatrix` | State matrix |
| `ElementExplorer` | Element explorer |
| `ThePattern` | The pattern: every flow |

Reference, `!dev`-tagged:

| Export | Name |
|---|---|
| `TokensFill` | Tokens: fill |
| `TokensStroke` | Tokens: stroke |
| `TokensText` | Tokens: text |
| `TokensTypography` | Tokens: typography |
| `TokensSpacing` | Tokens: spacing |
| `TokensRadius` | Tokens: radius |
| `TokensMotion` | Tokens: motion |
| `TokensElevation` | Tokens: elevation |

Every token row resolves its name against the live document rather than
restating a hex, so a row reads `unresolved` only when the token itself is
wrong.

No `StandaloneDemo` story: the `Playground` and `ThePattern` stories ARE the
hands-on demo, and every flow is reachable from them rather than from an iframe.

The `.mdx` page follows `docs/storybook-authoring.md` and was added 2026-10-08,
along with `StateMatrix`, `ElementExplorer` and the split `Tokens*` set.
