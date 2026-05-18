# Pathway Search System

**Status:** Sandbox spec, ready for Figma execution.
**Created:** 2026-04-28.
**For:** anyone (designer, engineer, AI agent) deciding which search-like component to use, building one in Figma, or implementing one in code.

---

## How to use this document

Reading order:
1. **§1 Frame** — what "search" actually means in Pathway (it's four different jobs).
2. **§2 Decision tree** — how to pick the right component for your context.
3. **§3 Component map** — quick lookup table.
4. **§4 Atomic decomposition** — the building blocks for the entire system. This is the Figma setup map.
5. **§5 Search spec** and **§6 OmniSearch spec** — full anatomy, variants, states, tokens.
6. **§7 Related components** — Combobox / MultiSelect / Autocomplete / CommandPalette / ColumnFilter / AdvancedSearch (lighter specs since they're not the focus of this iteration).
7. **§8 Token coverage** — what tokens are needed, what exists, what's missing.
8. **§9 Figma component recommendation** — how to structure the variants in the Figma file.
9. **§10 Build sequence** — what to make first, what depends on what.

---

## 1. Frame: search is four different jobs

People say "I need to add search," but they actually mean one of four things:

| Job | What user is doing | Component family |
|---|---|---|
| **Find content** | Looking for things (records, files, modules, people) | `Search` / `OmniSearch` |
| **Pick a value** | Filling a form field by typing-and-choosing from options | `Combobox` / `Autocomplete` |
| **Pick many values** | Tagging, multi-selecting, with search to filter and option to add new | `MultiSelect` |
| **Run a command** | Triggering an action by typing its name | `CommandPalette` |

A fifth pattern, **per-column table filtering**, is part of `DataTable`'s `ColumnFilter`, not a search component proper.

These look similar (all have a magnifying-glass icon and a text input) but solve different problems. Mixing them creates confusion. Build them as separate components that share underlying atoms.

---

## 2. Decision tree

Read top-down. First match wins.

```
START: I need to add a "search" somewhere.

│
├── User is RUNNING A COMMAND or shortcut by typing its name
│       (Cmd+K palette, action runners)
│   → use CommandPalette
│
├── User is FILTERING ROWS of a structured table by one column's value
│       (column header dropdown filters)
│   → use ColumnFilter (built into DataTable)
│
├── User is PICKING a value to set in a form
│   ├── pick exactly one ────► use Combobox / Autocomplete
│   └── pick zero or many, possibly add new ────► use MultiSelect
│
└── User is FINDING content
    │
    ├── across all of Amplify (cross-platform)
    │   → use OmniSearch (lives in TopNav only)
    │
    └── within a defined scope (a list, table, module, page)
        → use Search, configured by:
        │
        ├── WHERE: where it lives drives size + tone
        │   ├── inside SideNav of a module ──► size="s", tone="default"
        │   ├── above a list / table (toolbar) ──► size="m", tone="default"
        │   ├── as a form field ──► size="m", tone="default", withLabel withHelpText
        │   ├── inside a modal / dialog picker ──► size="m" or "s", tone="default"
        │   └── on a dark surface (rare; usually only TopNav-adjacent) ──► tone="inverse"
        │
        ├── FILTERS: does the user need to filter results in addition to typing?
        │   ├── No filters ──► filters="none"
        │   ├── A handful of filterable dimensions ──► filters="chips"
        │   └── Many or complex (AND/OR, saved sets) ──► filters="advanced"
        │           (button opens AdvancedSearch component)
        │
        └── MODE: what should typing do?
            ├── filter the parent's content live ──► mode="filter"
            ├── nothing until Enter is pressed ──► mode="submit"
            └── show typeahead dropdown of suggestions ──► mode="typeahead"
```

---

## 3. Component map

| Context | Component | Recommended config |
|---|---|---|
| TopNav cross-platform global | `OmniSearch` | (no variants — single component) |
| Module SideNav | `Search` | `size="s"`, `mode="filter"` |
| Toolbar above list / table | `Search` | `size="m"`, `filters="chips"`, `mode="filter"` |
| Form field | `Search` | `size="m"`, `withLabel`, `withHelpText`, `mode="submit"` |
| Modal picker | `Search` | `size="m"`, `mode="typeahead"` |
| Compact card / widget | `Search` | `size="s"`, `mode="filter"` |
| Form: pick one option | `Combobox` | (separate component — see §7) |
| Form: pick many + add new | `MultiSelect` | (separate component — see §7) |
| Form: free text + suggestions | `Autocomplete` | (separate component — see §7) |
| Cmd+K verb-driven palette | `CommandPalette` | (separate component — see §7) |
| Per-column table filter | `ColumnFilter` | (built into `DataTable` — see §7) |
| Complex filter screen | `AdvancedSearch` | (separate component — see §7) |

---

## 4. Atomic decomposition (Figma setup map)

This is the build map for setting up the system in Figma. Build in order: atoms → molecules → organisms → templates. Higher levels depend on lower levels via instances or component properties.

### 4.1 Atoms (level 0)

The smallest reusable parts. Build these first as Figma components with their own variants.

| Atom | Purpose | Variants | Tokens used |
|---|---|---|---|
| `Icon/Search` | Magnifying-glass icon | size: 14 / 16 / 18 / 20; color: from icon tokens | `icon.action.secondary.base`, `icon.contextual.navitem.*`, etc. |
| `Icon/Close` | Clear / dismiss X | size: 12 / 14 / 16 | same icon tokens |
| `Icon/Filter` | Filter funnel | size: 14 / 16 | same |
| `Icon/Plus` | Add / "+ filter" | size: 14 / 16 | same |
| `Icon/Sparkles` | AI suggestion indicator | size: 14 / 16 | `icon.static.brand.*` |
| `Icon/ChevronRight` | "advanced search →" link | size: 12 / 14 | same |
| `SearchInputChrome` | The pill: rounded container + icon slot + input slot + clear slot | size: s / m / l; tone: default / inverse | fills, strokes, type, radii |
| `FilterChip` | One removable filter pill | tone: default / brand / etc.; with-X | fill, text, icon tokens |
| `SuggestionRow` | One row in a typeahead / overlay dropdown | with-icon / no-icon; with-meta / no-meta | text, icon, fill tokens |
| `SectionHeader` | Group label inside dropdown ("Recent searches", "People") | uses the SectionLabel typography from the SideNav system | `label.section.s.medium` text token |

### 4.2 Molecules (level 1)

Combinations of atoms. Used by organisms.

| Molecule | Composition | Used by |
|---|---|---|
| `SearchPill / Empty` | `SearchInputChrome` + `Icon/Search` (left) | All Search organisms idle state |
| `SearchPill / WithValue` | `SearchInputChrome` + `Icon/Search` + value text + `Icon/Close` (right) | All Search organisms after typing |
| `SearchPill / WithChips` | `SearchInputChrome` + `Icon/Search` + (n × `FilterChip`) + value text + `Icon/Close` | Search with filters="chips" |
| `SearchPill / WithChipsAndAdd` | Above + "+ filter" affordance at right | Search with filters="chips" idle |
| `SearchPill / WithAdvanced` | `SearchInputChrome` + `Icon/Search` + value + small "Advanced" link + `Icon/Close` | Search with filters="advanced" |
| `DropdownPanel` | Surface + padding + scroll behavior | Wraps SuggestionRow / SectionHeader content |
| `OverlayHeader` | Back arrow + `SearchPill` (full width) | Mobile OmniSearch overlay |
| `LabelAndHelp` | Label above + help text below | Wraps a `SearchPill` in form-field flavor |

### 4.3 Organisms (level 2)

Full components. These are what consumers reference in product designs.

| Organism | Composition | Spec section |
|---|---|---|
| `Search` | `SearchPill/*` (variant by `filters`) ± `LabelAndHelp` ± `DropdownPanel` (when typeahead) | §5 |
| `OmniSearch` | `SearchPill` + responsive morph + `DropdownPanel` (always, with grouped content) + overlay | §6 |
| `Combobox` | Form-field chrome + `SearchPill` + `DropdownPanel` of options | §7.1 |
| `MultiSelect` | Form-field chrome + `SearchPill` with chips + `DropdownPanel` | §7.2 |
| `Autocomplete` | Form-field chrome + `SearchPill` + `DropdownPanel` of free-text suggestions | §7.3 |
| `CommandPalette` | Modal scrim + `SearchPill` + `DropdownPanel` of actions, grouped | §7.4 |
| `ColumnFilter` | Anchored popover + filter UI specific to column type | §7.5 |
| `AdvancedSearch` | Full-screen / panel + filter conditions + AND/OR builder + saved sets | §7.6 |

### 4.4 Templates (level 3)

Full screens / layouts that show organisms in context. These are the "examples" in the spec — useful for designers to copy-paste as starting points.

| Template | Shows |
|---|---|
| `TopNav with OmniSearch` | TopNav at desktop and mobile breakpoints |
| `List screen with toolbar Search` | Page header + toolbar with Search + list below |
| `Module screen with SideNav Search` | SideNav with Search at top + main canvas |
| `Form with Search field` | Form layout with a Search input as a labeled field |
| `Modal picker` | Modal with Search at top + scrollable result rows |
| `AdvancedSearch screen` | Full-screen filter builder with AND/OR logic |

---

## 5. `Search` component — full spec

### 5.1 Anatomy

```
Search (the organism)
├── (optional) Label                  ← shown when withLabel
├── SearchPill                        ← molecule
│   ├── Container (the pill)          ← atom: SearchInputChrome
│   │   ├── padding                   ← per size
│   │   ├── radius                    ← per size
│   │   └── fill                      ← per tone
│   ├── LeadingIcon                   ← atom: Icon/Search
│   ├── (optional) FilterChips        ← when filters="chips"
│   │   └── chip × N (atom: FilterChip)
│   ├── Input                         ← native <input>
│   │   ├── placeholder text          ← when empty
│   │   └── value text                ← when typed
│   ├── (optional) AdvancedLink       ← when filters="advanced"
│   ├── (optional) AddFilter          ← when filters="chips"
│   ├── (optional) ClearButton        ← when value.length > 0
│   └── (optional) LoadingSpinner     ← when loading
└── (optional) HelpText               ← shown when withHelpText
```

### 5.2 Props / variants

| Prop | Values | Default | What it controls |
|---|---|---|---|
| `tone` | `default`, `inverse` | `default` | white-on-light vs translucent-on-dark |
| `size` | `s` (28px row), `m` (36px), `l` (44px) | `m` | Row height + leading icon size + type ramp |
| `filters` | `none`, `chips`, `advanced` | `none` | Filter UX |
| `mode` | `filter`, `submit`, `typeahead` | `filter` | What happens on typing |
| `withLabel` | boolean | `false` | Adds Label above |
| `withHelpText` | boolean | `false` | Adds help text below |
| `placeholder` | string | `"Search…"` | Placeholder copy |
| `value` | string (controlled) | `""` | External value binding |
| `onChange` | function(value) | required | Called on every keystroke |
| `onSubmit` | function(value) | optional | Called on Enter (mode="submit") |
| `onSuggest` | function(query) → suggestions[] | optional | Called on type (mode="typeahead") |
| `disabled` | boolean | `false` | Greyed, non-interactive |
| `loading` | boolean | `false` | Spinner replaces leading icon |
| `error` | string \| null | `null` | Sets error state + message (with `withHelpText`) |
| `aria-label` | string | required when no `withLabel` | Accessible name |

### 5.3 Sizes (atomic values)

| Size | Row height | Radius | Padding H | Icon size | Type token |
|---|---|---|---|---|---|
| `s` | 28 | 999 (pill) | 10 | 14 | `label.input.s.medium` (12 / 500 / 16 / wide) |
| `m` | 36 | 999 (pill) | 14 | 16 | `label.input.base.medium` (14 / 500 / 20 / wide) |
| `l` | 44 | 999 (pill) | 16 | 18 | `body.base.regular` (16 / 400 / 22 / wide) |

Padding values are symmetric (left = right). When ClearButton is present, the input area shrinks; padding to outer edge stays constant.

### 5.4 States

Every variant must support every state.

| State | Trigger | Visual change |
|---|---|---|
| `idle` | default, no value, not focused | placeholder visible, leading search icon |
| `hover` | mouse over (interactive only) | container fill brightens by ~6% |
| `focused-empty` | focused, no value | focus ring (2px outline using brand token) + placeholder |
| `with-value` | `value.length > 0`, focused or not | typed text + ClearButton visible at right |
| `loading` | `loading=true` | spinner replaces leading icon; input still editable |
| `disabled` | `disabled=true` | greyed container + greyed text + cursor: not-allowed |
| `error` | `error` is non-null | red border (1.5px), error message in HelpText slot, error icon optional |

For `tone="inverse"`:
- Hover/focus brighten the translucent fill
- Disabled muted further
- Error border still red but the red token resolves to a contrast-correct on-dark variant

### 5.5 Filter behaviors

#### `filters="none"`
No filter UI. Just the search bar. Filtering happens upstream (e.g., toggles or facets the parent app provides).

#### `filters="chips"`
- **Empty state:** input shows placeholder. At the right edge of the pill, a small "+ filter" affordance with `Icon/Plus` + small text.
- **Adding a filter:** click "+ filter" → opens a small dropdown listing available filter dimensions. Click a dimension → opens a value picker (text input, multi-select, date range, etc., depending on dimension type).
- **One filter applied:** chip renders inline before the input, value text continues after. Chip has its own X to remove. "+ filter" stays at right.
- **Multiple chips:** render in order of application. If chips + input would exceed available width, oldest chip(s) collapse to "+N" summary chip; clicking expands a popover showing the full list.
- **Clearing:** chip X removes that chip only. ClearButton at right (when value present) clears typed value only. To clear all filters and value, use a separate "Clear all" affordance in the parent toolbar.

#### `filters="advanced"`
- A small "Advanced" text link sits at the right edge of the pill (left of ClearButton when value is present).
- Click "Advanced" opens the `AdvancedSearch` component (see §7.6) — a full-screen or side panel with:
  - All filter dimensions as form rows
  - AND/OR logic between conditions
  - Saved filter sets
  - "Apply" + "Save as…" actions
- After applying, the search bar shows a count: "3 filters applied" with a small Clear-all X.

### 5.6 Mode behaviors

#### `mode="filter"`
- Typing fires `onChange(value)` on every keystroke.
- Parent app filters its visible content reactively.
- No dropdown surface from Search itself.
- Enter is a no-op (or focuses first filtered result if parent provides one).

#### `mode="submit"`
- Typing fires `onChange(value)` to update the input.
- No filtering happens on type.
- On Enter, fires `onSubmit(value)` — typically navigates to a results page.
- No dropdown surface from Search.
- Best for slow searches over large datasets where live filtering is infeasible.

#### `mode="typeahead"`
- Typing fires `onChange(value)` AND `onSuggest(query)`.
- Parent returns a list of suggestions (grouped or flat).
- A `DropdownPanel` opens below the bar showing suggestions.
- Arrow keys navigate, Enter selects highlighted suggestion.
- Click outside closes the dropdown.

### 5.7 Tokens used by Search

| Element | Default tone | Inverse tone |
|---|---|---|
| Pill fill | `fill.static.surface.white` (#fff) | `fill.action.inverse.translucent` (proposed; primitive `cool-neutral.0-16`) |
| Pill border (idle) | `stroke.action.secondaryinverse.base` (#d2d2d2) | none |
| Pill border (focus) | `stroke.action.primary.focus` (or focus ring token) | brand-tinted ring |
| Pill border (error) | `stroke.action.danger.base` | tone-correct red |
| Leading icon | `icon.action.secondary.base` (#363636) | `icon.action.secondaryinverse.base` (rgba 255,255,255,0.85) |
| Placeholder text | `text.action.secondaryinverse.base` (#6b6b6b) | rgba 255,255,255,0.85 |
| Value text | `text.action.secondary.base` (#363636) | `#fff` |
| Clear icon | `icon.action.secondary.base` (#363636) | rgba 255,255,255,0.85 |
| Filter chip fill | `fill.static.info.subtle` or `fill.contextual.chip.base` | TBD when inverse-translucent chip needed |
| Filter chip text | `text.action.primary.base` | white |
| Help text | `text.action.secondaryinverse.base` | white at 0.7 |
| Error text | `text.static.negative.base` | tone-correct red |
| Label | `text.action.secondary.base` | white |

### 5.8 Accessibility

- **Role:** the input is a native `<input type="search">`. The clear button is a `<button>` with `aria-label="Clear search"`.
- **Label:** if `withLabel`, the Label is `<label for={inputId}>`. If not, `aria-label` on the input is required.
- **Help text:** if `withHelpText`, the help/error text has an id, and the input has `aria-describedby={helpId}`.
- **Error:** when in error state, input has `aria-invalid="true"`.
- **Loading:** spinner has `aria-live="polite"` text "Searching…" off-screen for SR users.
- **Filter chips:** each chip has `role="button"` with `aria-label="Remove {dimension}: {value} filter"`. Pressing Backspace from an empty input removes the rightmost chip (Linear / GitHub convention).
- **Keyboard:**
  - Tab focuses the input
  - Tab again moves to clear / advanced / + filter affordances (if present)
  - In `filter` mode, Enter is a no-op or focuses first result
  - In `submit` mode, Enter calls `onSubmit`
  - In `typeahead` mode, ↑/↓ navigates suggestions, Enter selects
  - Esc closes typeahead dropdown / clears value (configurable)

### 5.9 Examples

#### Sidenav search
```jsx
<Search
  size="s"
  placeholder="Search settings…"
  value={query}
  onChange={setQuery}
  mode="filter"
  aria-label="Filter settings" />
```

#### Toolbar search with chips
```jsx
<Search
  size="m"
  placeholder="Search invoices…"
  value={query}
  onChange={setQuery}
  filters="chips"
  appliedFilters={[
    { dimension: "Status", value: "Open" },
    { dimension: "Owner", value: "Me" },
  ]}
  filterDimensions={[
    { id: "status", label: "Status", type: "multi-select", options: [...] },
    { id: "owner", label: "Owner", type: "user-picker" },
    { id: "date", label: "Date range", type: "date-range" },
  ]}
  onFiltersChange={setFilters}
  mode="filter"
  aria-label="Search invoices" />
```

#### Form field search with label
```jsx
<Search
  size="m"
  withLabel
  withHelpText
  label="Find a member"
  helpText="Searches active members and staff"
  placeholder="Type a name or email"
  value={query}
  onChange={setQuery}
  mode="submit"
  onSubmit={runSearch} />
```

#### Modal picker with typeahead
```jsx
<Search
  size="m"
  placeholder="Find someone to invite"
  value={query}
  onChange={setQuery}
  mode="typeahead"
  onSuggest={query => fetchPeopleSuggestions(query)}
  onSelect={person => onPersonSelected(person)}
  aria-label="Find a person to invite" />
```

---

## 6. `OmniSearch` component — full spec

### 6.1 Anatomy

```
OmniSearch (the organism)
├── ResponsiveTrigger
│   ├── Desktop (≥1024px): always-expanded SearchPill (inline in TopNav)
│   └── Mobile/Tablet (<1024px): circular pill icon (Icon/Search)
├── DropdownPanel (desktop) or FullScreenOverlay (mobile/tablet)
│   ├── (when query is empty)
│   │   ├── SectionHeader: "Recent searches"
│   │   │   └── SuggestionRow × N (recent queries)
│   │   ├── SectionHeader: "Quick links"
│   │   │   └── SuggestionRow × N (modules / common destinations)
│   │   └── (when aiEnabled) SectionHeader: "Ask AI" + AI input prompt row
│   └── (when query has value)
│       ├── SectionHeader: "Top results"
│       │   └── SuggestionRow × N (highest-scoring matches)
│       ├── SectionHeader: "People"
│       │   └── SuggestionRow × N (matching members)
│       ├── SectionHeader: "Records" (filterable by module)
│       │   └── SuggestionRow × N
│       ├── (when aiEnabled) SectionHeader: "AI suggestions"
│       │   └── AI-generated rows
│       └── Footer:
│           ├── "See all results for '{query}'" link → results page
│           └── "Advanced search →" link → AdvancedSearch screen
```

### 6.2 Props

| Prop | Values | Default | What it controls |
|---|---|---|---|
| `placeholder` | string | `"Search across Amplify…"` | Placeholder copy |
| `recentSearches` | string[] | `[]` | Previously run queries |
| `quickLinks` | array | `[]` | Always-visible destinations (modules, etc.) |
| `aiEnabled` | boolean | `false` | Toggles the AI section |
| `onSuggest` | function(query) → grouped results | required | Suggestion fetcher |
| `onSelect` | function(item) | required | Called when user picks a row |
| `onSubmit` | function(query) | required | Called on Enter — navigate to "all results" page |
| `onAdvancedSearch` | function | optional | Called when user clicks "Advanced search →" |
| `keyboardShortcut` | string | `"cmd+k"` | Global shortcut to open the overlay |

OmniSearch has NO `tone`, `size`, `filters`, or `mode` props. It's a single configuration. The dropdown content is the only thing that varies (driven by query state).

### 6.3 States

| State | Trigger | Visual |
|---|---|---|
| `collapsed-icon` | viewport < 1024px, overlay closed | Circular pill icon visible in TopNav |
| `expanded-empty` | viewport ≥ 1024px, no value | Inline pill in TopNav, placeholder visible. Click → focus, dropdown opens with recents + quick links |
| `expanded-with-value` | viewport ≥ 1024px, value typed | Pill shows value + clear X. Dropdown shows grouped results |
| `overlay-empty` | viewport < 1024px, overlay open, no value | Full-screen takeover: back arrow + pill + recents + quick links |
| `overlay-with-value` | viewport < 1024px, overlay open, value typed | Full-screen takeover: back arrow + pill + grouped results |
| `loading` | suggestions fetching | Spinner replaces leading icon; previous results dim |

### 6.4 Tokens

Same as `Search tone="inverse"` for the pill chrome. Dropdown surface uses standard surface tokens (`fill.static.surface.white`, soft shadow). Section headers use `label.section.s.medium` (the new token from the SideNav v6 work).

### 6.5 Keyboard

- `Cmd+K` / `Ctrl+K` — opens overlay (mobile/tablet) or focuses inline pill (desktop)
- `Esc` — closes overlay or clears focus
- `↑` / `↓` — navigate suggestion rows
- `Enter` — select highlighted row OR submit if no row highlighted
- `Tab` — moves focus through dropdown sections in source order

### 6.6 AI mode

When `aiEnabled`:
- A "Ask AI" or sparkles section appears in the dropdown when query is empty (a prompt to write a question)
- When query is typed, the dropdown gets an additional "AI suggestions" section that calls a separate model endpoint
- AI rows visually distinct (sparkles icon at left, possibly different fill tint)
- AI suggestions are advisory; the user still picks a row from any section

---

## 7. Related components (lighter specs)

These are separate components that may share atoms with `Search` but solve different problems. Each gets its own future spec; below is enough detail to scope them and to understand how they relate.

### 7.1 `Combobox`

**Job:** pick exactly one option from a known list, with typeahead filtering.

**Anatomy:** form-field chrome (label + help text) + `SearchPill` + dropdown of options.

**Differences from `Search`:**
- The output is a *selected option* (a structured value), not a free-text query.
- The dropdown shows only matching options from a closed list.
- On selection, the input value renders the option's label, not the user's typed query.
- Keyboard: Enter selects the highlighted option.

**Use when:** picking a category, a country, an owner, a status — anything from a fixed set.

### 7.2 `MultiSelect`

**Job:** pick zero or more options from a list, with typeahead filtering. Optionally allows adding new options.

**Anatomy:** form-field chrome + `SearchPill` with chips representing selected values + dropdown of options.

**Differences from `Search`:**
- The output is an *array of selected values*.
- Selected values render as chips inside the input, like `Search filters="chips"` but the chips represent VALUES, not filter dimensions.
- Backspace from empty input removes the rightmost chip.
- `allowCreate=true` adds a "Create '…{query}…'" row in the dropdown so the user can add new options on the fly.

**Use when:** tagging, assigning multiple owners, picking multiple statuses, adding skills.

### 7.3 `Autocomplete`

**Job:** free-text input with typeahead suggestions. Unlike Combobox, the user is NOT constrained to the list — they can submit any value.

**Anatomy:** form-field chrome + `SearchPill` + dropdown of suggested completions.

**Differences from `Combobox`:**
- The user can submit a custom value not in the list.
- Dropdown shows suggestions only, not authoritative options.

**Use when:** location auto-complete, address suggestions, name suggestions for a free-text field.

### 7.4 `CommandPalette`

**Job:** trigger an action by typing its name. Verb-driven, not query-driven.

**Anatomy:** modal scrim + `SearchPill` + dropdown of grouped *actions* (each with a keyboard shortcut hint).

**Differences from `OmniSearch`:**
- Items are *actions* (functions), not content.
- Selecting a row runs the action, doesn't navigate.
- Often grouped by command category (Navigation, Edit, View, etc.).
- Keyboard shortcuts displayed alongside each command.

**Use when:** power-user shortcut layer for the whole app. `Cmd+K` is the canonical trigger.

### 7.5 `ColumnFilter`

**Job:** narrow a `DataTable` by one column's value.

**Anatomy:** small filter icon in the column header → opens a popover with column-type-specific UI (text input for strings, multi-select for enums, date range for dates, number range for numbers).

**Differences from `Search`:**
- Lives in a column header, not a toolbar.
- Filter type depends on the column's data type.
- Per-column, not free-text across all columns.

**Owner:** `DataTable` component, not Search system.

### 7.6 `AdvancedSearch`

**Job:** complex multi-condition filter UI for power users.

**Anatomy:** full-screen or side panel containing:
- Header with title, save/load filter set buttons
- Condition rows: `{dimension} {operator} {value}` × N
- AND/OR logic between conditions
- "Add condition" button
- "Apply" + "Cancel" actions in footer

**Triggered by:** `Search` with `filters="advanced"` clicking the "Advanced" link.

**Use when:** filtering needs go beyond inline chips — saved filter sets, AND/OR logic, complex value pickers.

---

## 8. Token coverage report

### 8.1 Tokens needed but not in Pathway today

| Token (proposed) | Used by | Resolves to | Why |
|---|---|---|---|
| `fill.action.inverse.translucent.base` | Search inverse pill, OmniSearch pill | primitive `cool-neutral.0-16` (rgba 255,255,255,0.16) | No semantic exists; flagged in prior prototypes |
| `fill.action.inverse.translucent.hover` | Search inverse pill on hover | `cool-neutral.0-30` (rgba 255,255,255,0.30) | Same family, hover state |
| `fill.action.inverse.translucent.focus` | Search inverse pill on focus | `cool-neutral.0-30` or tuned | Same |
| `text.contextual.placeholder.base` | All Search placeholder text | `cool-neutral.120` (#6b6b6b) on light, `0-85`-equivalent on dark | No semantic placeholder color exists |
| `fill.contextual.chip.base` | FilterChip resting fill | TBD | Chips need their own family (could reuse `fill.static.info.subtle`) |
| `fill.contextual.chip.hover` | FilterChip hover | TBD | |
| `text.contextual.chip.base` | FilterChip label | TBD | |

### 8.2 Tokens used and already exist

- `fill.static.surface.white` — Search default pill fill
- `stroke.action.secondaryinverse.base` — Search default pill border
- `text.action.secondary.base` — Search value text + leading icon
- `text.action.secondaryinverse.base` — placeholder fallback
- `text.static.secondary.subtle` — section labels (from SideNav v6 work)
- `semantic-type.desktop.label.section.s.medium` — section header type
- `label.input.base.medium` (14/500/20/wide) — Search size m input type
- `body.base.regular` (16/400/22/wide) — Search size l input type
- All icon families — for the icon atoms
- All radius primitives — pill radius is 999

### 8.3 Things to add in Figma BEFORE building these components

In order:
1. `fill.action.inverse.translucent.base` (and hover/focus) — required for inverse Search and OmniSearch
2. `text.contextual.placeholder.base` — required for Search placeholder accessibility (current AA contrast assumes specific values; making this a token locks them in)
3. `fill.contextual.chip.*` family — required for FilterChip when filters="chips"
4. (Optional) `letter-spacing.caps` mid-tier primitive — already proposed in SideNav work; not required but improves all-caps types

Do these BEFORE running `/pathway:tokens-sync`, then sync, then build the components.

---

## 9. Figma component structure recommendation

### 9.1 What to make a Figma component vs a variant of one

A Figma component represents one "thing" with its variants captured as Component Properties. Use these rules:

- If the **behavior** differs significantly → separate component.
- If only the **appearance** or content differs → same component, different variants.

Applying:

| Pathway component | Figma structure |
|---|---|
| `Search` | ONE component, with variants for `tone`, `size`, `filters`, `mode`, `withLabel`, `withHelpText`, state |
| `OmniSearch` | ONE component, with variants for state (collapsed-icon, expanded-empty, expanded-with-value, overlay) |
| `Combobox` | ONE component, variants for state |
| `MultiSelect` | ONE component, variants for state, `allowCreate` |
| `Autocomplete` | ONE component, variants for state |
| `CommandPalette` | ONE component, variants for state |
| `ColumnFilter` | ONE component PER column type (text / enum / date / number) — they're behaviorally different |
| `AdvancedSearch` | ONE component (full-screen template), variants for "saved set / no saved set" |

Atoms (search icon, close icon, filter chip, etc.) are their own Figma components, used as instance children inside the organisms.

### 9.2 Search component variant tree (for Figma Component Properties)

Set up `Search` with these properties:

- **tone:** Variant — `default` | `inverse`
- **size:** Variant — `s` | `m` | `l`
- **filters:** Variant — `none` | `chips` | `advanced`
- **mode:** Variant (informational only — affects dropdown presence) — `filter` | `submit` | `typeahead`
- **state:** Variant — `idle` | `hover` | `focused-empty` | `with-value` | `loading` | `disabled` | `error`
- **withLabel:** Boolean
- **withHelpText:** Boolean
- **placeholder:** Text
- **value:** Text (only meaningful when state="with-value")
- **chipCount:** Number (only meaningful when filters="chips")

Total raw combinations is large, but Figma allows hidden variants — only build the combinations that are realistically used. Suggested coverage:
- All `state` × all `tone` × `size=m` × `filters=none` × `mode=filter` × `withLabel=false` (the minimum baseline)
- Add `size=s` and `size=l` versions of idle and with-value
- Add `filters=chips` and `filters=advanced` versions of with-value at size=m
- Add `withLabel=true withHelpText=true` versions of idle, with-value, error at size=m

Plan to spend a real day on Search's Figma setup. It's the single most-reused component in the system.

### 9.3 Naming convention in Figma

- File path: existing master file
- Page: "Library / Inputs / Search"
- Component name (parent): `Search`
- Variant property names: lowercase camel: `tone`, `size`, `filters`, `mode`, `state`, `withLabel`, `withHelpText`
- Variant value names: lowercase: `default`, `inverse`, `s`, `m`, `l`, `none`, `chips`, `advanced`, `idle`, `hover`, etc.
- Atom components live on a sibling page: "Library / Inputs / Search / Atoms"

This matches Pathway's existing component naming (`SideNav`, `Spinner`).

---

## 10. Build sequence

### 10.1 What to do BEFORE building Search in Figma

1. **Add the missing tokens (§8.3)** in Figma's Variables panel.
2. **Run `/pathway:tokens-sync`** to get them into the repo.
3. **Add description metadata** to the new tokens so AI agents reading the JSON can pick them by purpose.

### 10.2 Build order in Figma

1. **Atoms** (in order of dependency)
   - Icons (Search, Close, Filter, Plus, Sparkles, ChevronRight) — one-day exercise
   - SearchInputChrome — half day
   - FilterChip — half day
   - SuggestionRow — half day
   - SectionHeader — quick (reuses SideNav SectionLabel)

2. **Molecules**
   - SearchPill / Empty, WithValue, WithChips, WithAdvanced — half day
   - DropdownPanel — half day
   - LabelAndHelp — quick

3. **Organisms**
   - `Search` (the component, with all variants) — full day, this is the heavy one
   - `OmniSearch` — half day
   - The selection components (`Combobox`, `MultiSelect`, `Autocomplete`) — one day each, but DEFER until after Search ships
   - `CommandPalette` — defer
   - `AdvancedSearch` — defer

4. **Templates**
   - TopNav with OmniSearch — quick (extend existing TopNav design)
   - List screen with toolbar Search — quick
   - SideNav with Search — extend existing SideNav v6
   - Form with Search field — quick
   - Modal picker — quick

### 10.3 Ship order

Phase 1 (this iteration): `Search` + `OmniSearch`, plus required tokens. Ships everything needed for the TopNav and ~80% of in-app search needs.

Phase 2 (next iteration): `Combobox` + `MultiSelect`. Closes form-field gaps.

Phase 3: `Autocomplete` + `CommandPalette` + `ColumnFilter` + `AdvancedSearch` as needs surface.

---

## Appendix A — props quick-reference card for engineers / AI agents

If you only read one section, read this.

**`Search`** — go-to component for "find content within a scope":
- `<Search size="s" />` — sidenav search
- `<Search size="m" filters="chips" />` — toolbar search with filterable chips
- `<Search size="m" withLabel withHelpText />` — form field search
- `<Search size="m" mode="typeahead" onSuggest={...} />` — modal picker search

**`OmniSearch`** — go-to component for "search across all of Amplify in the TopNav":
- `<OmniSearch onSuggest={fetchAll} onSelect={navigate} />` — that's it, one config

**Anything else (selection, commands, column filters, advanced filtering)** — different component, see §7.

---

## Appendix B — what NOT to build

For clarity, things that do NOT exist as components and shouldn't be added:

- `TopNavSearch` — too tied to location; use `OmniSearch`.
- `SidenavSearch` / `ToolbarSearch` / `FormSearch` — context-specific names; use `Search` with appropriate config.
- `GlobalSearch` — naming overlaps with `OmniSearch` for the same job.
- `SearchInput` — Pathway uses concise nouns (`SideNav`, `Spinner`); `Search` is enough.
- `FilterBar` — that's just `Search filters="chips"`.
- `QuickFind` — ambiguous; if it's verb-driven it's `CommandPalette`, if noun-driven it's `OmniSearch`.

If you want to add something to this list, add a name + reason at the bottom of this doc. The point is to keep the API surface small and findable.
