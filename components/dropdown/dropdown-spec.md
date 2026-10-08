# Dropdown: Pathway Design System Component Spec

Status: REVIEWED
Reviewed: 2026-10-08, measured against Figma

A trigger and the menu it opens. Created 2026-10-08 to replace a FOREIGN
component the KPI Tiles set nested eighteen times, and to finally implement a
Pathway menu that had existed in Figma all along with no code behind it.

## Links

| What | Where |
|---|---|
| Figma, PopoverMenu | `3sw45aVcngFAmpbP6cfrXP` node `40005568:4207` |
| Figma, PopoverMenu.Item | `40005568:4191`, 3 variants on State |
| Figma, PopoverMenu.SectionLabel | `40005748:20503` |
| Figma, Menu.Divider | `40006377:69269` |
| Figma, the FOREIGN Dropdown it replaces | `40003188:9930`, remote |
| Storybook | [Library/Dropdown](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/library-dropdown--docs) |
| Module | `components/dropdown/dropdown.jsx` |
| Code Connect | `popover-menu.figma.ts`, `popover-menu-item.figma.ts`, `menu-divider.figma.ts` |
| Coverage report | `components/code-connect-coverage.md` |

## 1. Component Overview

### Why it exists

Two reasons, and the second is the interesting one.

**A foreign component was doing the trigger's job.** KPI Tiles nested
`Dropdown` 40003188:9930 eighteen times: a remote third-party component from
the same library as the `↳ Select` page in CLAUDE.md §8.1. It could not be Code
Connected from this repo, because a mapping publishes into the file that owns
the component.

**Pathway already had the menu and nothing had implemented it.** The
`↳ ❇️ Menu` page carries `PopoverMenu`, `PopoverMenu.Item`,
`PopoverMenu.SectionLabel` and `Menu.Divider`, fully specified and fully
tokenised. Meanwhile:

- `dashboard.jsx` grew a private `WidgetMenu`
- the KPI Tiles used the foreign component's `Open=True` half
- the first version of this file invented a third panel

Three implementations of a component the design system already owned. This one
is that component.

### What the foreign trigger actually was

Worth stating, because it changes what the work was. `Type=Icon, Open=False`
walks to:

```
Type=Icon, Open=False [COMPONENT 20x20]
  dots-vertical [INSTANCE 20x20]
```

No box, no fill, no border, no radius: a bare 20px glyph. So the trigger was
never the hard part, since Pathway already had `ActionIcon`. What was missing
was the menu.

## 1.1 Governance: where things live

| To change… | Owner | Where |
|---|---|---|
| The panel and its items | Design | Figma `↳ ❇️ Menu` page |
| Which trigger a surface uses | Consumer | the `type` prop |
| Open and close behaviour, focus, keys | Engineering | `dropdown.jsx` |
| The items themselves | Consumer | passed as `children` |

Rule: the `↳ ❇️ Menu` page owns what a menu looks like. This repo owns when it
opens.

## 2. Component Anatomy

```
trigger                 one of three types
  icon                  20x20, a bare 20px glyph. Figma's Type=Icon
  button                a pill with text and a chevron
  avatar                28x28 with initials
panel                   PopoverMenu, only when open
  Menu slot             VERTICAL, gap 8, pad 6
    DropdownItem        PopoverMenu.Item
    DropdownDivider     Menu.Divider
```

### Measured 2026-10-08

| Part | Measurement |
|---|---|
| Panel | 212 wide, VERTICAL, pad 8, r=8 |
| Panel fill | `Fill/Surface/Elevated` |
| Panel border | `Stroke/Static/Neutral/Base` |
| Panel shadow | `0 4 16 -2` at `a0.08`. See the gap below |
| Menu slot | VERTICAL, gap 8, pad 6 |
| Item | 200x40, HORIZONTAL, pad 6,14,6,14, r=8. **14 is not a rung**, see §13 |
| Item label | fs 14 |
| Label wrapper | gap 4, 8px inset |
| Leading icon | a 20 box holding a 14 glyph |
| Divider | a line with 6px above and below |
| Icon trigger | 20x20, glyph 20 |

## 3. Design Tokens

### 3.1 The panel

| Element | Token |
|---|---|
| Surface | `Fill/Surface/Elevated` |
| Border | `Stroke/Static/Neutral/Base` |
| Radius | `CornerRadius/Base` |
| Shadow | `--elevation-sheet` |

### 3.2 The item

**The label is an ACTION foreground, not a static one.** This is the detail most
worth carrying: the item is interactive, so `State=Base` takes
`Foreground/Action/Secondary/Rest` and `State=Hover` moves it to `/Hover`. A
static foreground would leave the label unchanged while the row lit up.

| Element | Base | Hover |
|---|---|---|
| Fill | `Fill/Surface/Elevated` | `Fill/Action/Selection/Hover` |
| Label | `Foreground/Action/Secondary/Rest` | `Foreground/Action/Secondary/Hover` |

**Selection, not Secondary.** The hover fill is `Fill/Action/Selection/Hover`.
A menu row is a selection surface, and the first version of this file used
`Fill/Action/Secondary/Hover`, which is the button family.

| Element | Token |
|---|---|
| Destructive label | `Foreground/Static/Negative/On Subtle` |
| Divider | `Stroke/Static/Neutral/Base` |
| Item note | `Foreground/Static/Neutral/Subtle` |

**The divider strokes with BASE, not Faint.** Faint is the rung for a divider
inside a surface; a menu rule separates groups of actions.

### 3.3 The triggers

| Trigger | Tokens |
|---|---|
| icon | `Foreground/Action/Secondary/Rest`, moving to `/Hover` |
| button | `Fill/Surface/Elevated` with `Stroke/Action/Secondary/Rest` |
| avatar | `Fill/Action/Primary/Subtle/Rest` with its `On Subtle/Rest` foreground |

## 4. Layout & Spacing

See §2.

## 5. Item / Variant Structure

Figma's axes are `Type` (Button | Icon | Avatar) and `Open` (False | True), and
both are reproduced: `type` and `open`.

`open` is controlled when given and internal when not, so a story can hold the
panel up to look at and a product can own the state.

## 6. State Matrix

| State | Trigger | Panel |
|---|---|---|
| Rest | rest foreground | absent |
| Hover | hover foreground | absent |
| Open | hover foreground | present, `aria-expanded="true"` |
| Item hover | n/a | selection fill, hover label |

## 7. Sub-components / Decorations

| Part | Export |
|---|---|
| Panel and trigger | `Dropdown` |
| An entry | `DropdownItem` |
| A rule | `DropdownDivider` |

`PopoverMenu.SectionLabel` 40005748:20503 exists in Figma and has **no
implementation here**. Nothing in the repo groups menu items under a heading
yet, and building it to satisfy a count is how the Badge and PageTemplate
implementations ended up deleted. Recorded in §13.

## 8. Container / Surface

See §3.1.

## 9. Interaction / Behaviour

- Escape closes.
- A click outside closes.
- The trigger carries `aria-haspopup="menu"`, `aria-expanded` and, while open,
  `aria-controls` pointing at the panel.
- The panel is `role="menu"` and its entries are `role="menuitem"`.
- The panel aligns to the trigger's END edge by default. A trigger at the top
  right of a card with a start-aligned panel pushes the panel off the card.

## 10. Collapsed / Compact / Variant-specific State

None.

## 11. Iconography

Material Symbols Rounded through the shared `Icon`. The icon trigger draws
`more_vert`, which is Figma's `dots-vertical`. A leading icon in an item is a
14px glyph in a 20px box, Figma's `Leading.Icon` swap.

## 12. Interaction Patterns

Standard Pathway patterns only, plus §9.

## 13. Gaps

| Gap | Detail |
|---|---|
| Item horizontal padding is 14 in Figma | 14 is not a Pathway rung: the ladder goes 12 then 16. Mapped to `Padding/Tight`, 12, the nearest, rather than inventing a token. The same call as the nineteen `Unit/20` gap bindings fixed in the KPI Tiles |
| Panel shadow has no exact token | Figma is `0 4 16 -2` at `a0.08`. `--elevation-sheet` is `0 4 32 -8`: same offset, softer blur, and the nearest that exists. Used rather than inventing a token |
| `PopoverMenu.SectionLabel` is unimplemented | 40005748:20503. Nothing in the repo groups items under a heading yet |
| `State=Active` is unimplemented | `PopoverMenu.Item` has three states and this renders Base and Hover. Active is a pressed or current-item treatment with no consumer yet |
| The foreign `Dropdown` is still in the Figma KPI Tiles | 40003188:9930, eighteen instances. The CODE no longer uses it; swapping the Figma instances is a change to a shared component set and is a design decision |

## 14. Storybook

Sidebar-visible, matching the untagged exports in `Dropdown.stories.jsx`
exactly:

| Export | Name |
|---|---|
| `Playground` | Playground |
| `Types` | Types |
| `Open` | Open: the panel |
| `InACard` | In a card, where a KPI tile puts it |

No `StandaloneDemo` story and no `dropdown.html`: a menu is only meaningful on
the surface that opens it, and the KPI Tile and Dashboard pages both show it in
place.
