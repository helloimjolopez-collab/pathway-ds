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
  background: var(--semantic-color-fill-static-neutral-mono);
  color: var(--semantic-color-foreground-static-neutral-bold);
  border: 0.5px solid var(--semantic-color-stroke-static-neutral-base);
  border-radius: var(--semantic-layout-units-cornerradius-base);
  padding: var(--semantic-layout-units-padding-base);
}
```

Adopting tokens alone is worthwhile and needs no other change: your components
stay yours, they just stop guessing at colour and spacing. Dark mode comes free,
because you set `data-theme="midnight"` on any element and everything inside it
re-resolves.

See `docs/governance.md` §2 for the full contract and the naming rules.

## Choosing a token, and what the names do not promise

Most of the cost of adopting a token library is not installing it. It is
deciding which of 206 names belongs on the thing you already built. This
section is the rule, and then the list of things the names are NOT telling you.

### The one distinction that matters: emphasis or state

Both tiers carry a variant (`neutral`, `brand`, `negative`) and an emphasis rung
(`faint`, `subtle`, `base`, `bold`, `strong`). Only one of them carries state.

| | what it means | example |
|---|---|---|
| **Emphasis** | how loud this element is. You choose once and it never changes. | a divider is `stroke-static-neutral-faint`, permanently |
| **State** | where this element is in an interaction, right now. One element moves through all of them. | a button is `rest`, then `hover`, then `pressed` |

So the question is not how many values exist. It is:

> **Does this element's colour change because of something the user does to it?**

Yes, it is an **Action** token, and you will need its whole state set. No, it is
a **Static** token, and you pick one emphasis rung and stop.

`Static` having six rungs does not make it "multi-value" in the way Action is.
The rungs are a menu you choose from once. The states are a sequence one element
walks through.

### What the names do not promise

The names are deliberately descriptive enough to help you map an existing
codebase onto them. That legibility has a cost: a name can read like a promise
it is not making. Specifically:

**A token named `primary` is not your primary button.** It means *a* primary
action. Pathway has no opinion about your button component, because Pathway
ships no button. If your product's main call to action is visually quiet, the
loud primary token is the wrong one for it, however well the words line up.

**A component-shaped name is not a component contract.** `fill-action-field-*`
describes a field-like surface. It does not specify a field, guarantee that your
field will look like ours, or survive as a promise if your field is different.
Nothing in this package constrains component anatomy.

**Two tokens resolving to the same value are not interchangeable.** Several
pairs currently resolve identically in at least one theme. They still mean
different things, they are free to diverge in the next release, and if you pick
the one that reads right but means wrong, the day they diverge is the day your
UI changes and nobody can explain why. Where two names look equally correct,
pick by the rule above (does it change under interaction) rather than by which
value looks right today.

**`-on-strong` and `-on-subtle` are pairing constraints, not shades.**
`foreground-static-brand-on-strong` means "the foreground to use ON a strong
fill." It is a contrast guarantee about a combination, not a lightness. Using it
on a light surface is not a quiet variant, it is an accessibility failure. The
`on-` prefix always tells you what must be behind it.

**Absence is sometimes deliberate.** There is no foreground rung lighter than
`#484848`, because everything lighter fails WCAG AA on white. If you cannot find
a token for the grey you want, check whether the grey you want is legible before
concluding the set is incomplete. Report the gap; do not reach for a primitive.

### Where the boundary is

`dist/contract.json` lists every name you are meant to use. Everything else in
`dist/` is infrastructure that the consumable names resolve through, and it can
be renamed without a major version. Primitives in particular are published so
that bindings resolve, not so that you can apply them: every one of them carries
"Do not apply directly" in its description. If you find yourself naming a
`--primitive-color-*` in your own CSS, the token you actually want either exists
under a semantic name or does not exist yet, and we would rather hear which.

### If two names still look equally right

Tell us which two. A name that cannot be chosen between is a defect in this
library, not in your understanding of it, and it is the single most useful piece
of feedback a consuming team can send: we cannot see your mapping from here, so
a collision that confuses you is invisible to us until you say so.

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

### Slots

Your own markup, in three places.

| Slot | Where it lands |
|---|---|
| `slot="header"` | After the collapse toggle, in the pinned header. Hidden on the 72px rail, which only fits a centred icon. |
| unnamed children | Inside the scroll region, after the items. Scrolls with the list. |
| `slot="footer"` | Pinned below the scroll region. Stays put while the list scrolls; draws a divider only when it has content. |

```html
<pathway-sidenav active-id="overview" items='[...]'>
  <span slot="header">Giving</span>
  <p>anything unnamed scrolls with the items</p>
  <button slot="footer">Get support</button>
</pathway-sidenav>
```

**You do not need a module-specific nav.** `items` expresses everything
item-shaped (labels, icons, nesting, disabled rows), so every module passes its
own array and they all share one component. Ten modules, ten arrays, one
component. Slots exist for the things `items` cannot express: a usage meter, a
support button, a badge component you already own. Without them your only option
would be to rebuild the nav, which is the drift this component exists to
prevent.

An empty slot renders nothing at all, no wrapper, no padding, no divider, so omitting
one costs you nothing.

Slot content often arrives *after* the element upgrades, which is normal in
Angular and Blazor: the framework creates the element first and fills it on the
next change-detection pass. The element watches its own children and re-renders,
so late content still appears. You do not need to call anything.

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

The nav renders inside a shadow root, so your selectors cannot reach in and its
CSS cannot leak out. A host reset, a utility framework, or an opinionated
component library will not disturb it.

**But Shadow DOM blocks selectors, not inheritance,** and that distinction
matters more than it sounds. Measured on 2026-09-10:

| Your CSS does this | Reaches the nav's internals? |
|---|---|
| Matches a selector against nav internals | **No.** Nothing in your document can match a node inside the shadow root. |
| Sets a non-inherited property (`background`, `border`, `padding`) on the element | **No.** |
| Sets an **inherited** property (`font-family`, `color`, `letter-spacing`) on the element | **It used to.** Now blocked explicitly. |
| Styles slot content | **Yes, by design.** Those nodes are in your document. |

The inheritance row is the one that bit us. A rule like `* { font-family: X
!important }` matches the `<pathway-sidenav>` element itself, and inherited
properties flow from there through the boundary. Because backgrounds and borders
do *not* inherit, the layout stays intact and it looks fine. The nav just
quietly renders in your font at your tracking. Our own hostile-CSS demo missed
this for weeks because it was scoped to a sibling element and never actually
pointed at the nav. The component now resets inherited properties on its
shadow-root wrapper, and the Storybook story targets the nav for real.

**Slot content is the deliberate exception.** Anything you put in a slot stays
in your document, so your CSS and your framework keep owning it. That is the
point: it is how your own component can sit in the nav's footer and still behave
like yours. It also means slot content is yours to style, including adapting it
to the 72px collapsed rail:

```css
pathway-sidenav[collapsed] .my-footer-label { display: none; }
```

`collapsed` is reflected back onto the element as an attribute whenever the nav
collapses, so that selector needs no JavaScript.

Two further exceptions, both deliberate. The tooltip and the collapsed-group popover
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
