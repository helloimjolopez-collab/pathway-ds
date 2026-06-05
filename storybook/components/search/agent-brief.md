# Search — Agent Brief

Condensed summary of the Pathway Search component for AI agents building prototypes or production features.

Read this first. Full spec: [search-spec.md](./search-spec.md). React module: [search.jsx](./search.jsx).

---

## What it is

Two named exports from the same module:

- **`SearchInput`** — the pill-shaped search bar. Use anywhere you need a free-text search input (toolbar, drawer, modal, command bar).
- **`TopNavSearch`** — specifically for use inside `TopNav.Global`. A 48×48 icon button that springs open into a 320px `SearchInput` bar on click. Do not use `TopNavSearch` outside of `TopNav`.

## Import

```javascript
import { SearchInput, TopNavSearch } from './components/search/search.jsx';
```

## SearchInput props

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `value` | string | `""` | Controlled value — wire to your state |
| `onChange` | function | — | `(value) => void` — update your state |
| `onClear` | function | — | `() => void` — called when X is tapped |
| `onSearch` | function | — | `(value) => void` — called on Enter |
| `placeholder` | string | `"Search..."` | Input placeholder |
| `showFilter` | boolean | `false` | Shows the trailing funnel filter button |
| `filterActive` | boolean | `false` | Highlights the funnel, activates border |
| `filterBadge` | boolean | `false` | Shows the dot badge on the funnel |
| `disabled` | boolean | `false` | 38% opacity, non-interactive |
| `error` | boolean | `false` | Negative border + icon colour |

## TopNavSearch props

| Prop | Type | Purpose |
|---|---|---|
| `expanded` | boolean | Controlled — is the bar open? |
| `onExpandChange` | function | `(expanded: boolean) => void` |
| `searchProps` | object | All `SearchInput` props forwarded |

## Icons

All three icons use **Material Symbols Rounded, FILL=1** (filled):
- Search icon: `search`
- Clear icon: `cancel`
- Filter icon: `filter_alt`

Read the icon name from the Figma layer's `data-name` attribute. Never guess.

## Tokens

```
Bar border idle:    --semantic-color-light-mode-stroke-static-neutral-light     #f6f6f6
Bar border hover:   --semantic-color-light-mode-stroke-action-primary-hover      #86a0dd
Bar border active:  --semantic-color-light-mode-stroke-action-primary-pressed    #6e8bd4
Bar bg:             --semantic-color-light-mode-fill-static-neutral-light        #ffffff
Icon idle:          --semantic-color-light-mode-icon-action-secondary-inverse-base #6b6b6b
Icon hover:         --semantic-color-light-mode-icon-action-secondary-inverse-hover #545454
Filter active fill: --semantic-color-light-mode-fill-action-tertiary-base        #eef2fb
```

## Key rules

1. `SearchInput` is controlled — always supply `value` + `onChange`.
2. `TopNavSearch` is specifically for TopNav. Do not use it as a generic expandable search.
3. The search icon inside the expanded `TopNavSearch` bar **collapses** the bar (calls `collapse()`). Wire `onSearchIconClick={collapse}` on the `SearchInput`.
4. Escape key collapses `TopNavSearch`. This is already implemented in the component.
5. The input uses `type="text" role="searchbox"` — not `type="search"` (which triggers browser native clear button).
6. v1: Open state (dropdown results) is deferred. Use Radix `Combobox` for that.
