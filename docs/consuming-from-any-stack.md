# Consuming Pathway from any stack

For teams on Radzen, Blazor, Angular, Vue, React, or an older library. The goal is
that you adopt Pathway piece by piece without giving up the component library you
already use, and without rebuilding our components against it.

## Two things you can take

**Tokens** work anywhere. They are plain CSS custom properties.

**Shell components** ship as custom elements: one HTML tag, no framework
required. Today that is the side nav, with the top bar to follow.

## Tokens

```bash
npm install @helloimjolopez-pathway/pathway-tokens
```

or for a .NET host:

```
dotnet add package Pathway.DesignTokens
```

or straight from the CDN:

```html
<!-- primitives FIRST: the themes reference it via var(), so without it every
     colour resolves to nothing -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/primitives.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/themes/light.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/type.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@helloimjolopez-pathway/pathway-tokens/dist/layout.css">
```

Then use the names, never the values:

```css
.my-card {
  background: var(--semantic-color-fill-surface-sheet);
  color: var(--semantic-color-foreground-static-neutral-bold);
  border: 0.5px solid var(--semantic-color-stroke-static-neutral-subtle);
  border-radius: var(--semantic-layout-units-cornerradius-medium);
  padding: var(--semantic-layout-units-padding-base);
}
```

Adopting tokens alone is worthwhile and needs no other change: your components
stay yours, they just stop guessing at colour and spacing. Dark mode comes free,
because you set `data-theme="midnight"` on any element and everything inside it
re-resolves.

See `docs/governance.md` §2 for the full contract and the naming rules.

## The side nav as a custom element

```html
<link rel="stylesheet" href=".../dist/primitives.css">
<link rel="stylesheet" href=".../dist/themes/light.css">

<!-- fonts on the host page: they are document-scoped, so they reach inside -->
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">

<script type="module" src=".../dist/pathway-sidenav.js"></script>

<pathway-sidenav
  active-id="overview"
  items='[
    {"id":"applications","label":"Applications","icon":"apps","children":[
      {"id":"overview","label":"Overview"},
      {"id":"installed","label":"Installed"}
    ]},
    {"id":"manage","label":"Manage","icon":"tune"}
  ]'></pathway-sidenav>
```

That is the whole integration. 51 kB gzipped, self-contained.

### Attributes

| Attribute | Type | Notes |
|---|---|---|
| `items` | JSON array | Nav data. `icon` is a Material Symbols ligature string, e.g. `"tune"` |
| `sections` | JSON array | Use instead of `items` for grouped navs |
| `list-section` | JSON object | Optional trailing list section |
| `active-id` | string | Which item reads as current |
| `default-expanded` | JSON object | e.g. `{"applications": true}` |
| `collapsed` | boolean | Present means collapsed to the 72px rail |
| `hide-collapse-button` | boolean | Hides the collapse control |

A boolean attribute is true when present, unless set to `"false"` or `"0"`.

### Properties

If your host runs JavaScript, set `items`, `sections`, `listSection`,
`defaultExpanded`, `activeId` and `collapsed` as properties with real values and
skip the JSON entirely. Properties take precedence over attributes.

### Events

```js
const nav = document.querySelector("pathway-sidenav");
nav.addEventListener("pathway-navigate", (e) => route(e.detail.id));
nav.addEventListener("pathway-collapse-change", (e) => save(e.detail.collapsed));
```

Both are `composed`, so they cross the shadow boundary and every framework's
normal event binding works. The element reflects its own collapse state to the
`collapsed` attribute, so your state can follow the DOM.

### Per-framework notes

**Blazor / Radzen.** Write the tag in your `.razor` file with the JSON attribute.
No JS interop needed for rendering. For events, either `@onpathway-navigate` where
your version supports custom events, or a small `JSInterop` listener. Reference
the CSS from the NuGet package at
`_content/Pathway.DesignTokens/primitives.css`.

**Angular.** Add `CUSTOM_ELEMENTS_SCHEMA` to the module so Angular stops
complaining about the unknown tag, then bind normally:
`[attr.active-id]="id"` and `(pathway-navigate)="onNav($event)"`.

**React.** React 19 passes unknown props to custom elements as attributes, so
`active-id` works directly. On React 18, set object props through a `ref`, as the
Storybook stories do.

**Vue.** Add `pathway-sidenav` to `compilerOptions.isCustomElement`.

**Plain HTML / jQuery / older frameworks.** Just the tag. Nothing else.

## What Shadow DOM does and does not protect

The nav renders inside a shadow root, so your CSS cannot reach in and its CSS
cannot leak out. A host reset, a utility framework, or an opinionated component
library will not disturb it. There is a Storybook story that proves this by
forcing Comic Sans, magenta and dashed borders on `*` with `!important` next to an
untouched nav.

Two exceptions, both deliberate. The tooltip and the collapsed-group popover
render through portals to `document.body`, so those two overlays sit outside the
shadow root. Tokens still resolve for them, but a host page with very aggressive
global CSS could reach them.

One thing the shadow root needs from you: the **fonts** must be loaded on the host
page. `@font-face` is document-scoped so the font files reach in, and the element
injects the `.material-symbols-rounded` class rule itself. Without the font links,
icons fall back to their ligature text.

## What does not port this way

Being honest about the boundary:

- Anything that has to interleave with your layout system, like a grid or a
  form row, is better served by taking the tokens and building it with your own
  library.
- Form controls that must participate in your validation. A custom element can do
  it via `ElementInternals`, but it is real work and rarely worth it against a
  library you already trust.

Shell components are the sweet spot precisely because they own a region of the
page and do not interleave: nav, top bar, modals, toasts.

## Where the source lives

`components/sidenav/sidenav.jsx` is the single source of truth. The custom element
in `components/sidenav/pathway-sidenav.js` wraps it rather than reimplementing it,
so the element and the React component cannot drift. `npm run build-dist` rebuilds
the bundle, so it never lags the component.
