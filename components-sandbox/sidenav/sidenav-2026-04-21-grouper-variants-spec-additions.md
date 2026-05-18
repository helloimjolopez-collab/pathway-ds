# SideNav — Spec Additions (pending promotion)

**Prototype:** `sidenav-2026-04-21-grouper-variants-v4.html`
**Grounding:** `tokens/pathway-design-tokens.json` @ `98ee386`
**Created:** 2026-04-21
**Status:** Draft. Not yet applied to `components/sidenav/sidenav-spec.md`.

This document captures every spec-worthy decision from v1 → v4 of the grouper-variants prototype. It is not the production spec. When the prototype is ready to ship, the design system owner runs `/pathway:spec-review` to walk through each item below, confirm or revise, and promote the accepted ones into `sidenav-spec.md`.

The `/pathway:component-prototype` skill is **never** allowed to edit the production spec directly. That's a Pathway hard rule (`CLAUDE.md` §11).

---

## 1. Section Label — new component element

### 1.1 Purpose

A non-interactive label that visually groups a set of SideNav items under a category. Optional, module-driven. Modules that don't need sectioning continue to render a flat list.

### 1.2 Variants

**Single variant only.** Earlier prototype iterations (v1, v2) explored an expandable grouper variant that could toggle its children. That exploration was dropped in v3 because today's `SideNavItem` groupers (with children) already handle expand/collapse; duplicating that behavior in a second element type added complexity without user value.

### 1.3 Anatomy

```
SectionLabel (Level 0 — not a treeitem)
├── Container.labelRow (padding-v 6, padding-h 12, margin-top 16, margin-bottom 4)
│   ├── text.label (fontsize 11, fontweight 500, line-height 16,
│   │               letter-spacing wide 0.1, text-transform uppercase,
│   │               color text.static.secondary.subtle)
│   └── CollapseToggle slot (only on the first SectionLabel — see §3)
```

### 1.4 Token mappings

**New typography token to add** — decision on naming made 2026-04-22: nest under the existing `label.*` family as `label.section.*`. Peer to `label.button.*`, `label.input.*`, `label.dense.*`. Keeps all "text-that-names-something" tokens together in the Figma panel.

```
semantic-type.desktop.label.section.s.medium
├── fontfamily    → {primitive-type.family.brand}          → Red Hat Text
├── fontsize      → {primitive-type.size.11}               → 11
├── fontweight    → {primitive-type.weight.500}            → 500
├── lineheight    → {primitive-type.line-height.11pt.single} → 16
└── letterspacing → {primitive-type.letter-spacing.wide}   → 0.1
```

Start with this one variant. Don't scaffold `base`, `l`, `semibold` etc. until a real use case appears.

**Other per-component values** (not part of the typography token):

| Property | Token | Resolved |
|---|---|---|
| Label text color | `text.static.secondary.subtle` | `#6b6b6b` |
| Label text transform | CSS `uppercase` (not a token) | — |
| Row vertical padding | `primitive-unit.unit.6` | 6 |
| Row horizontal padding | `primitive-unit.unit.12` | 12 |
| Margin above | `primitive-unit.unit.16` | 16 |
| Margin below | `primitive-unit.unit.4` | 4 |

Color is kept outside the type token so the same typography can render in other contexts (e.g. `text.static.primary.base` on a dark surface) without introducing a second type token.

**Note on naming history:** earlier iterations of this doc explored naming the token `semantic-type.desktop.section-label.*` (top-level, not nested under label). Both are defensible. Nesting under `label.*` won on the grounds of file-panel organization consistency with existing sibling labels.

### 1.4.1 Contrast compliance

**`#6b6b6b` on `#fafafa` → 5.1:1**

- **WCAG AA (normal text, 4.5:1) — passes** ✓
- **WCAG AAA (normal text, 7:1) — fails** ✗

Section labels at 11pt / 500 are *normal text* per WCAG (not large text, which would require 14pt bold or 18pt regular).

**Treatment:** AA-compliance is the project target for section labels and all other non-primary chrome. Section labels are categorical/supporting text, not primary content. Shipping at `text.static.secondary.subtle`.

**If a module needs AAA compliance** (regulated industries, explicit procurement requirements), substitute `text.static.secondary.base` (`#4b4b4b`) — contrast ~7.6:1. Trade-off: `#4b4b4b` is the same color as `icon.contextual.navitem.base`, so the section label visually flattens against nav icons. Only use this fallback when AA is not enough.

### 1.5 Rail state behavior (72px) — **explicit spec rule**

**When the sidenav is in rail state, every SectionLabel is replaced by a thin horizontal divider.**

- Divider height: 1px
- Divider color: `fill.static.info.subtle` (`#edf0f9`) — same token already used for the panel's right border
- Margin top and bottom: 12px (`primitive-unit.unit.12`)
- The divider is purely decorative — it preserves visual sectioning at the rail width without forcing space for a label that can't be shown

**Rationale:** flattening all nav items into a single 72px-wide list in the rail eliminates the user's ability to see where one conceptual group ends and the next begins. A muted divider is the lowest-cost way to restore that grouping without introducing rail-specific text, icons, or interaction.

**Applies to all SectionLabels, not just the first.** The first SectionLabel's hosted collapse toggle moves to the `RailHeader` in rail state (see §3.3); the label itself still becomes a divider like any other.

### 1.6 Interaction

- `cursor: default`
- No hover state
- No focus ring (not a tab stop)
- Not a `treeitem` — does not participate in the `role="tree"` hierarchy
- If the first SectionLabel hosts the collapse toggle (§3), that toggle *is* a tab stop and *does* have hover + focus; but the label text around it is still inert

### 1.7 Accessibility — screen reader behavior

**Do not mark the section label as a heading.** These are not page-content headings; treating them as `role="heading"` would pollute the page's heading outline (which should represent *content* structure) and inject nav chrome into heading-jump navigation (`h` key in JAWS/NVDA).

Three valid approaches, ordered by recommendation:

**Preferred — labeled group.** Each section's items are grouped under a `role="group"` whose accessible name comes from the visible section label. Screen readers announce the group when a user enters it, without treating the label as standalone spoken content.

```html
<nav aria-label="Primary navigation">
  <div role="group" aria-labelledby="sn-workspace">
    <span id="sn-workspace" class="pds-sidenav__section-label">Workspace</span>
    <ul>
      <li><a href="/apps">Applications</a></li>
      <li><a href="/enter">Enter</a></li>
    </ul>
  </div>
  <div role="group" aria-labelledby="sn-accounting">
    <span id="sn-accounting" class="pds-sidenav__section-label">Accounting</span>
    <ul>...</ul>
  </div>
</nav>
```

Expected screen-reader output while arrowing through the nav:

| Focused item | SR announces |
|---|---|
| First item in Workspace group | *"Applications, link, Workspace group"* |
| Second item in Workspace group | *"Enter, link"* (group name not repeated) |
| First item in Accounting group (group crossed) | *"View, link, Accounting group"* |

**Acceptable fallback — purely decorative.** If the grouping is arbitrary and carries no user value (rare), mark the label `aria-hidden="true"`. SR users experience a flat list. Use only when grouping genuinely doesn't inform the user.

**Forbidden — `role="heading"`.** Never. This creates a fake heading that gets caught in heading-jump navigation and misrepresents the page outline.

### 1.7.1 Compatibility with `role="tree"`

Pathway's current SideNav uses the WAI-ARIA tree pattern (`role="tree"` on the root, `role="treeitem"` on each item, `role="group"` on children of groupers). SectionLabels fit this pattern as follows:

- Each section's **top-level** items (what sit directly under the label) become children of the nav's implicit structure — they remain `role="treeitem"`.
- The SectionLabel itself is *not* a treeitem. It sits as a sibling DOM node whose presence is accessible via `aria-labelledby` on the containing group, not via tree position.
- A SectionLabel must never be focusable, never participate in `ArrowUp`/`ArrowDown` treeitem navigation, and never carry `aria-expanded`.

If the tree is expressed with an outer `<ul role="tree">`, each section becomes its own `<ul role="tree" aria-labelledby="<section-label-id>">` with the label as a preceding sibling. Multiple trees per nav is acceptable in the ARIA spec provided each tree has its own accessible name.

### 1.7.2 Keyboard navigation

- SectionLabels are not focusable. Arrow keys skip them entirely.
- Tab order and keyboard navigation within the nav are unaffected by section labels.
- Focus rings only appear on treeitems and the CollapseToggle.

### 1.8 Canonical DOM

```html
<nav aria-label="Primary navigation">
  <ul role="tree" aria-labelledby="sn-workspace">
    <span id="sn-workspace" class="pds-sidenav__section-label">Workspace</span>
    <li role="treeitem" ...>Applications</li>
    <li role="treeitem" aria-expanded="false">Enter</li>
  </ul>
  <ul role="tree" aria-labelledby="sn-accounting">
    <span id="sn-accounting" class="pds-sidenav__section-label">Accounting</span>
    <li role="treeitem" aria-expanded="true">
      View
      <ul role="group">
        <li role="treeitem">Trial Balance</li>
        ...
      </ul>
    </li>
    ...
  </ul>
</nav>
```

Each section is its own `<ul role="tree">` with the SectionLabel as its accessible name via `aria-labelledby`. This is valid WAI-ARIA: multiple trees per `<nav>` are permitted when each has a distinct accessible name.

If the implementation needs a single tree (due to existing keyboard-nav logic that assumes one tree root), fall back to the `role="group"` pattern in §1.7 with a single outer tree. Both are valid; the multi-tree form reads more cleanly.

---

## 2. Nav item typography change

**Change:** `SideNavItem` label drops from 16pt / 500 / 22 line-height to **14pt / 500 / 20 line-height**. Affects all Level 0 destinations, Level 0 groupers, and Level 1 children. The CollapseButton label (now inline — see §3) matches.

| Property | Old | New | Token |
|---|---|---|---|
| Font size | 16 | 14 | `primitive-type.size.14` |
| Line height | 22 | 20 | `primitive-type.line-height.14pt.single` |
| Letter spacing | 0.02px | 0.02px | (inline value, pre-existing — no token match) |
| Weight | 500 | 500 | `primitive-type.weight.500` |

**Rationale:**
- Denser nav — more items visible per viewport
- Brings Pathway in line with contemporary SaaS nav sizing (Linear, Notion, Figma use ~13–14pt)
- Enables the sidebar width reduction in §4

**Letter-spacing note:** the existing SideNav uses `0.02px` tracking, which does not correspond to any `primitive-type.letter-spacing.*` token (`compact = -0.01`, `standard = 0`, `wide = 0.1`). This was a pre-existing inline value in production and is preserved here to avoid a visible tracking shift. Recommendation: retune this to `standard` (0) or add a `letter-spacing.tight` primitive at 0.02 — see token recommendations doc.

---

## 3. Collapse toggle — replaces `CollapseButton` (fixes §15.8 design debt)

### 3.1 Problem this solves

Production spec §15.8 flags the current `CollapseButton` as design debt:

> "The Collapse button scrolls with the content: it is not sticky. As content grows, the button is pushed below the fold and requires scrolling to reach."

Making it `position: sticky` or `position: absolute` at the bottom fixes the scroll problem but adds layout complexity (z-index management, scroll-shadow, content padding to avoid the button covering the last nav item). Moving it **out of the scroll flow entirely**, into the sidenav header, solves both problems and reduces visual weight.

### 3.2 New element: `CollapseToggle`

A small icon-only button. Lives in the sidenav header (not in the scrollable content area).

**Anatomy:**
- 28×28 button target
- 18×18 icon glyph inside (new icon — sidebar/panel outline with a vertical rule)
- 6px border radius
- `aria-label="Expand navigation"` or `"Collapse navigation"` based on state
- Hover: `fill.contextual.navitem.hover` background fill
- Idle icon color: `icon.static.neutral.subtle` (#606060)
- Hover icon color: `text.contextual.navitem.hover` (#252525)

### 3.3 Placement rules

**Default — toggle in a standalone header row, no label next to it:**

- **Expanded state (width >72px):** A dedicated header row sits at the top of the sidenav content (padding 8v × 12h on the left side, 4px on the right, min-height 32). The toggle is right-aligned within this row. No label, no other content.
- **Rail state (72px):** A dedicated RailHeader row at the top of the rail: 40px tall, centered, containing only the CollapseToggle. Followed by a standard `fill.static.info.subtle` divider.

This is the behavior every module gets unless it opts into the variant below.

**Variant — toggle hosted inside the first SectionLabel:**

If a module wants to save vertical space and the first nav item happens to be a SectionLabel, it can embed the CollapseToggle inside that SectionLabel row (right-aligned). This was explored in an earlier iteration of this prototype but is not the default — most modules don't have a natural label at the very top of the nav, and forcing one to get the toggle is worse than keeping the toggle in its own row.

Implementation of this variant (if ever adopted) would use the same CollapseToggle component, just rendered in the SectionLabel's row container. Rail state still falls back to RailHeader regardless.

**Visibility:**
- All desktop + tablet breakpoints (≥768px)
- Hidden on mobile (<768px) where the TopNav hamburger is the sole toggle

### 3.4 Icon glyph

A rounded-rectangle outline with a vertical rule. The rule sits on the **left** side when the sidenav is expanded (signals "collapse toward left") and on the **right** when it's in rail (signals "expand toward right"). 1.25 stroke width, 18×18 viewBox.

**Production note:** the prototype ships with an inline SVG. Production should commission a matching Pathway fill-style icon (`sidebar_left_filled`, `sidebar_right_filled`, or similar naming) and reference that from the Pathway icon package.

### 3.5 Old `CollapseButton` removed

- The bottom `Collapse_Expand_Nav_Container` row, its top divider, and its associated spacing tokens (`collapseGap`, `colPadL`, `colPadR`) are removed from the component entirely.
- Any consumer currently relying on the old CollapseButton's DOM structure must update.

---

## 4. SideNav width reduction — 250 → 220

### 4.1 Change

| Property | Old | New |
|---|---|---|
| Expanded width | 250 | 220 |
| Rail width | 72 | 72 (unchanged) |
| Internal label `max-width` | 200 | 168 |

The 220px figure was derived to fit the two longest real-world labels Ministry Brands currently uses at nav-item scope:

- **"Background Checks"** — 17 characters, renders ~115–120px at 14pt / 500 / Red Hat Text
- **"My Outstanding"** — 14 characters, renders ~88–95px at the same settings

At 220px sidebar width with `padding-h: 12` per side (= 24px chrome) and `stripe 4 + rowPadH 8 + iconWrap 24 + textPad 6 + rowPadH 8 = 50` per destination row, the effective label area is **146px** — enough for "Background Checks" with ~25px of headroom.

For **groupers** (which add a 40px right-side chevron cluster), the effective label area is **106px**. This is tight for "Background Checks" as a grouper label. The v4 demo places "Background Checks" as a destination, not a grouper, so it fits. If a module ever needs "Background Checks" as a *grouper* (a parent with children), the label will truncate — flagged below as a naming-recommendation constraint.

### 4.2 Naming recommendations (spec the team should enforce)

**For destinations (leaf nav items):**
- ≤ 17 characters (worst case: "Background Checks")
- 1–2 words preferred
- Title Case
- Avoid generic words that require qualifiers ("Manage Things" → "Manage" if the section context makes it clear)

**For groupers (parents with children):**
- ≤ 12 characters (the chevron eats ~40px of the label area)
- 1 word strongly preferred
- If a domain term is genuinely longer, consider whether it needs to be a grouper at all — most can be flattened to a section of destinations under a SectionLabel

**For SectionLabels:**
- ≤ 14 characters at 11pt with `wide` letter-spacing uppercase
- 1 word strongly preferred (WORKSPACE, ACCOUNTING, SUPPORT)
- Avoid articles and prepositions — section labels are categorical, not grammatical

**Anti-patterns to reject at product-copy review:**
- ❌ "Background Screenings and Verifications" — too long
- ❌ "The Workspace" — articles belong in body copy, not nav
- ❌ "Applications and Plugins" — use a single word if possible ("Applications") and put "Plugins" under it if distinction matters
- ❌ Using the CollapsedTooltip as an escape hatch for long labels — rail-state tooltips are for accessibility, not as a recovery mechanism for truncated labels in expanded state

---

## 5. Scrollbar spec (replaces default browser scrollbar)

### 5.1 Problem

The default browser scrollbar on Windows / older Chrome is ~15–17px wide, chunky, and reads as 1990s-era system chrome. On macOS it hides and overlays, which is fine. Pathway should prescribe a consistent, modern, thin scrollbar across all platforms.

### 5.2 Applies to

The vertical scroll container inside `SideNav` (the nav menu list, not the page content behind the sidenav). Consumer apps may choose to apply the same tokens to their own scroll containers, but that's out of scope for this spec.

### 5.3 Visual spec

| Property | Value | Token / rationale |
|---|---|---|
| Track | transparent | blends with `surface.nav.light` |
| Track margin (top, bottom) | 4px each | prevents thumb from touching panel edges |
| Thumb width | 6px | thin — readable, not chunky |
| Thumb radius | 999px (fully rounded) | |
| Thumb color — rest | `rgba(17,17,17,0.08)` | `primitive-color.cool-neutral.220-8` |
| Thumb color — over rail hover | `rgba(17,17,17,0.18)` | between 220-16 and 220-20 primitives — **recommend adding `220-18` or rescaling to `220-20`** |
| Thumb color — thumb hover (direct) | `rgba(17,17,17,0.32)` | **no matching primitive — see gap below** |
| Thumb color — active (dragging) | `rgba(17,17,17,0.45)` | **no matching primitive — see gap below** |
| Thumb transition | `background 0.15s ease` | matches component motion tokens |

### 5.4 Cross-browser implementation

**Two CSS rules are required together. One alone is not sufficient.**

**Rule 1 — Scrollbar styling (thin, subtle, state-based):**

WebKit (Chrome, Safari, Edge):
```css
.pds-sidenav-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(17,17,17,0.08) transparent;
  scrollbar-gutter: stable;
}
.pds-sidenav-scroll::-webkit-scrollbar { width: 6px; }
.pds-sidenav-scroll::-webkit-scrollbar-track { background: transparent; margin: 4px 0; }
.pds-sidenav-scroll::-webkit-scrollbar-thumb {
  background: rgba(17,17,17,0.08);
  border-radius: 999px;
  transition: background 0.15s ease;
}
.pds-sidenav-scroll:hover::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.18); }
.pds-sidenav-scroll::-webkit-scrollbar-thumb:hover { background: rgba(17,17,17,0.32); }
.pds-sidenav-scroll::-webkit-scrollbar-thumb:active { background: rgba(17,17,17,0.45); }
```

Firefox uses `scrollbar-width: thin` + `scrollbar-color` from the rule above. Firefox does not support per-state thumb colors; the resting-state color is used at all times. Platform limitation — not worth working around.

**Rule 2 — Layout gap between nav items and scrollbar (required):**

```css
.pds-sidenav-scroll > * {
  margin-right: 12px;
}
```

Every direct child of the scroll container gets a 12px right margin. This is the **only reliable way to guarantee a gap** between nav item hover/active/trail fills and the scrollbar thumb.

**Why this is required:** `scrollbar-gutter: stable` reserves the 6px of scrollbar width in the content area, but browsers differ on where the visible thumb renders *within* that reservation. In WebKit, the thumb often renders on the inner edge of the reserved space — right up against the edge of any 100%-wide child element. Applying `padding-right` on the scroll container alone doesn't help because the padding and the reserved gutter can collapse visually into one zone.

The 12px margin-right on children guarantees the item's right edge is 12px inside the scroll container's content edge, regardless of where the browser positions the scrollbar thumb. Combined with `scrollbar-gutter: stable`, you get a predictable layout: items always 12px narrower than content area, scrollbar always reserved, no overlap at any state (hover, active, trail).

This rule is what was missing in v5, where only the container's `padding-right` was used — visual overlap persisted because the scrollbar and padding occupied overlapping zones. v6 replaces container padding with child margin.

### 5.5 Accessibility

- The scrollbar remains keyboard-accessible via standard `PageUp`, `PageDown`, `ArrowUp`, `ArrowDown`, `Home`, `End` when the scroll container has focus.
- Visual contrast: rest-state thumb (8% opacity on #111 over #fafafa background) yields ~92% vs 95% luminance — below WCAG 3:1 contrast for UI components. **Acceptable** because:
  - The scrollbar is not a control users must find to operate the UI — scroll wheel, trackpad, and keyboard all work without targeting it
  - On hover / active, contrast ramps up
  - Firefox's inability to change contrast on hover is the limiting factor; the resting color is tuned to balance subtlety with visibility
- If a stricter-contrast mode is ever added, switch to `rgba(17,17,17,0.2)` at rest with a `.scrollbar-strong` modifier class.

### 5.6 Gaps — recommended tokens

- Add `primitive-color.cool-neutral.220-18` (or rescale rail-hover to `220-20`)
- Add `primitive-color.cool-neutral.220-32` (thumb direct-hover)
- Add `primitive-color.cool-neutral.220-45` (thumb active)

OR, introduce a semantic family:

- `fill.contextual.scrollbar.thumb.rest` → 220-8
- `fill.contextual.scrollbar.thumb.hover` → 220-32
- `fill.contextual.scrollbar.thumb.active` → 220-45
- `fill.contextual.scrollbar.track` → transparent

Semantic-token route is cleaner if Pathway expects to scroll-style non-sidenav containers. Primitive-token route is cheaper if this is only ever used on the sidenav.

---

## 6. Bottom scroll clearance

### 6.1 Problem

Ministry Brands apps commonly render a floating "What's new" or chat bubble at the **bottom-left** of the viewport (~56px × 56px, 20px from the edges). This bubble sits *over* the sidenav. Without clearance, the last nav item is obscured and un-clickable when the user scrolls to the end of a long nav.

### 6.2 Rule

The scrollable container inside `SideNav` must apply a **bottom padding of 96px** (`primitive-unit.unit.96`) so the last nav item can scroll fully above the bubble.

Derivation: bubble height (56px) + bubble bottom offset (20px) + breathing room (20px) = 96px.

### 6.3 Implementation

```css
.pds-sidenav-scroll {
  overflow-y: auto;
  padding-bottom: 96px;
}
```

### 6.4 If the module has no floating bubble

Leave the 96px padding anyway. It serves as generic "bottom breathing room" and costs nothing when there's no bubble — the user simply has a slightly longer scroll with some space at the end. Consistent padding across all modules is easier to reason about than conditional padding tied to runtime presence of a specific component.

### 6.5 If the bubble moves or grows

Update the padding value in the component, not in each consumer. If the bubble is repositioned (e.g. bottom-right), the sidenav can keep the 96px padding or reduce it — at that point the bubble is no longer overlapping the nav.

---

## 6b. TopNav hamburger — nav trigger placement (Option A, decided 2026-04-22)

### 6b.1 Rule

The TopNav hamburger is the nav trigger at **tablet and mobile breakpoints (<1024px) only**. At desktop (≥1024px) it is hidden; the in-sidenav collapse toggle (§3) is the sole trigger.

This is Pathway's locked-in pattern. Rejected alternatives are noted below for the record.

### 6b.2 Why Option A

- Redundant triggers dilute affordance. On desktop the sidenav is always visible (expanded or rail), and its own collapse toggle sits at the top of its header — exactly where the eye lands when the sidenav is in focus. Adding a second trigger in the TopNav competes with it for no functional gain.
- Tablet and mobile need an always-visible trigger because the sidenav is overlay (hidden by default). The TopNav is the only chrome that's guaranteed visible at all times at those breakpoints, so the hamburger belongs there.
- Industry precedent supports this split: Google Workspace, Apple Mail, and Notion all hide the hamburger on desktop and surface it on mobile/tablet. Slack and Linear keep it everywhere (Option B in the exploration), but their sidenav on desktop is narrower or has different collapse UX — not directly applicable.

### 6b.3 Rejected alternatives

- **Option B** (hamburger at every breakpoint, in-sidenav toggle also on desktop). Valid, used by Slack. Rejected: redundancy on desktop without clear user benefit.
- **Option C** (hamburger everywhere, remove in-sidenav toggle). Valid, simpler conceptually. Rejected: removes affordance from the sidenav's own chrome, where users already look for collapse controls on desktop.

### 6b.4 Implementation

**CSS:**
```css
.topnav-hamburger { display: flex; }
@media (min-width: 1024px) {
  .topnav-hamburger { display: none; }
}
```

**Breakpoint map:**

| Breakpoint | SideNav mode | TopNav hamburger | In-sidenav toggle |
|---|---|---|---|
| Desktop (≥1024px) | Push (220/72) | Hidden | Visible — sole trigger |
| Tablet (768–1023px) | Overlay | Visible — sole trigger | Hidden (not used) |
| Mobile (<768px) | Overlay | Visible — sole trigger | Hidden (not used) |

### 6b.5 Additional considerations (not yet implemented in v5)

The v5 prototype hides the hamburger at desktop but does not fully implement the overlay sidenav behavior at tablet/mobile. When promoting to production, also implement:

- Sidenav switches from `position: relative` (push) to `position: fixed` (overlay) at <1024px
- A scrim (`rgba(0,0,0,0.32)`, fades 220–300ms) appears behind the overlay
- The in-sidenav collapse toggle is hidden at <1024px (no rail state to toggle into)
- Clicking the scrim or swiping left dismisses the overlay
- `aria-expanded` on the hamburger reflects overlay state; focus is trapped in the overlay when open

See the current production sidenav.html's `.overlay-panel` / `.overlay-scrim` CSS for reference patterns.

---

## 6c. Responsive overlay behavior at tablet + mobile (<1024px)

Locked in 2026-04-22 with v6. Extends §6b (hamburger placement) into the full overlay behavior for tablet and mobile.

### 6c.1 Layout mode change

At **≥1024px (desktop)** the SideNav is **push layout**: part of the document flow, always visible, rail/expanded states controlled by the in-sidenav toggle.

At **<1024px (tablet + mobile)** the SideNav is **overlay layout**:
- `position: fixed` (removed from document flow)
- Full height below the TopNav + prototype banner offset (`top: 97px` in the prototype; in production it's `top: <topnav-height>`)
- Hidden by default — `transform: translateX(-110%)`, `opacity: 0`, `pointer-events: none`
- When revealed, slides in and fades up — `transform: translateX(0)`, `opacity: 1`, `pointer-events: auto`

### 6c.2 Asymmetric enter/exit motion

**Enter** (revealing the overlay):
- `transform` 380ms, cubic-bezier(0, 0, 0.2, 1) (decelerate)
- `opacity` 300ms, cubic-bezier(0, 0, 0.2, 1) (decelerate)

**Exit** (hiding the overlay):
- `transform` 300ms, cubic-bezier(0.4, 0, 0.6, 1) (ease-in-out)
- `opacity` 220ms, cubic-bezier(0.4, 0, 0.6, 1) (ease-in-out)

The enter animation is slower and decelerates to feel intentional (you asked for this, the system is presenting it to you). The exit is snappier to stay out of the user's way. This mirrors the pattern already used by `.overlay-panel` in the production sidenav.html.

Place the enter transition on the `.is-open` modifier class and the exit transition on the base class so CSS picks the right curve automatically based on the destination state (CSS always uses the destination's `transition` property).

### 6c.3 Scrim

A semi-transparent backdrop between the overlay and the page content. Rendered only at <1024px.

```css
.pds-sidenav-scrim {
  position: fixed;
  top: <topnav-height>;
  left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.32);  /* primitive-color.cool-neutral.220-30 is close; see gap */
  opacity: 0;
  pointer-events: none;
  transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 99;  /* one below the overlay */
}
.pds-sidenav-scrim.is-visible {
  opacity: 1;
  pointer-events: auto;
}
@media (min-width: 1024px) {
  .pds-sidenav-scrim { display: none; }
}
```

**Token gap:** `rgba(0,0,0,0.32)` doesn't map to any existing Pathway primitive (`cool-neutral.220-30` is close at 0.3 alpha but uses `#111111` not `#000000`). Acceptable to use `cool-neutral.220-30` as a near match, or add a `fill.static.scrim.base` semantic for clarity. Either works.

### 6c.4 Dismissal paths

In order of user expectation:

1. **Tap the scrim** — standard pattern. Always supported.
2. **Tap the hamburger again** — user who opened with hamburger expects it to close the same way.
3. **Tap a destination inside the overlay** — closes the overlay after navigating (implemented via the `handleNavigate` wrapper in v6).
4. **Swipe left** — advanced gesture, not required for v1 launch. Add later if mobile usage warrants.
5. **Press `Escape`** — keyboard accessibility. Add when focus trap is also added.

### 6c.5 Focus trap (deferred to post-v6)

When the overlay is open, keyboard focus should be trapped inside it — Tab cycles through overlay contents, doesn't leak to the obscured page content behind the scrim. Shift+Tab works in reverse. The Escape key closes the overlay and restores focus to the hamburger.

This is required for full a11y compliance (WCAG 2.4.3 Focus Order) but was **not implemented in the v6 prototype** — marked here so it isn't forgotten when shipping. The production implementation should add focus trap via a library (`focus-trap`, `react-focus-lock`) or a hand-rolled implementation.

### 6c.6 The in-sidenav collapse toggle hides at <1024px

The in-sidenav collapse toggle (introduced in v4) is desktop-only. At <1024px there is no rail state to toggle into — the sidenav is either fully visible (overlay open) or hidden (overlay closed). A "collapse" control has no meaning.

```css
@media (max-width: 1023px) {
  .pds-sidenav-header-row { display: none; }
}
```

---

## 7. Rules summary (for quick reference)

1. **SectionLabel is additive.** Any existing SideNav implementation works unchanged; SectionLabel is opt-in.
2. **SectionLabels become thin dividers in rail state**, using `fill.static.info.subtle`. This is non-negotiable — it preserves sectioning at 72px.
3. **Nav items are 14pt** (down from 16pt).
4. **The bottom CollapseButton is removed.** The collapse toggle lives in the header — inside the first SectionLabel (expanded) or as a standalone centered button (rail).
5. **SideNav width is 220px** (down from 250px). Rail width unchanged (72px).
6. **Labels must fit: destinations ≤17ch, groupers ≤12ch, section labels ≤14ch.** Enforce at copy review.
7. **Scrollbar is 6px thin, fully rounded, rgba-black-low-alpha.** No system default chunky scrollbars.
8. **Bottom padding is 96px** on the scroll container. Always, regardless of whether the module has a floating bubble.
9. **Section labels never carry active or trail state.** Trail-collapsed (spec §6) still applies to groupers only.
10. **Everything else from today's production spec is preserved**: grouper chevrons right, 2-level depth, indicator stripe, trail-expanded fill, rail flyouts, 300ms popover close delay, ARIA tree pattern.

---

## 8. What this doc does not cover

- **Left-chevron on groupers** — discussed during iteration, rejected. Groupers keep right-chevron because they have a leading icon that would crowd a left-chevron. See v3 conversation notes.
- **Fill-on-hover icon variants** — deferred to a separate prototype. Adds design-system cost (every icon needs an outline + fill variant, component state logic, consistent cross-component rollout) without being blocked by this iteration.
- **Dark mode** — out of scope until Pathway reenables dark-mode token imports (`sync-tokens.js` `EXCLUDED_MODES`). SectionLabel, CollapseToggle, and scrollbar colors will all need dark-mode counterparts when that happens.
- **Mobile (<768px)** — the v4 prototype only tests the desktop + tablet (≥768px) case. Mobile overlay behavior is unchanged from today's production spec.

---

## 9. Promotion path

When this prototype is ready to ship:

1. **Update Figma** — add the SectionLabel component, the new CollapseToggle icon, update SideNav width, retune nav item type token.
2. **Run `/pathway:tokens-sync`** — regenerate the derived token files.
3. **Run `/pathway:spec-review`** on a draft update to `sidenav-spec.md` that incorporates sections 1–7 of this doc. The skill will walk through every conflict between this draft and the current spec; the DS owner signs off on each.
4. **Run `/pathway:component-pipeline` in update mode** — regenerates `.jsx`, `.html`, stories, MDX, manifest from the updated Figma + spec.
5. **Archive the sandbox file** — move `sidenav-2026-04-21-grouper-variants-v4.html` and this doc to `components-sandbox/archived/`. Update `components-sandbox/README.md` status to `Shipped`.
