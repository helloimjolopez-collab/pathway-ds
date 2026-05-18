# SideNav Update — Pipeline Handover

**For:** whoever (human or AI) picks up the SideNav update from here on.
**Written:** 2026-04-24
**Status:** Ready for `/pathway:tokens-sync` → `/pathway:spec-review` → `/pathway:component-pipeline --mode=update`

Read this before you touch `components/sidenav/**`, `tokens/**`, or the Storybook files. Everything you need to know is referenced from here.

---

## TL;DR

The SideNav is getting a substantial update, driven by a prototype exploration that ran from v1 → v6 in `components-sandbox/sidenav/`. Changes span a new token, a new component element (SectionLabel), a nav-item typography change, the removal of the old CollapseButton in favor of an in-sidenav CollapseToggle, a width reduction, a scrollbar fix, a bottom scroll clearance, responsive overlay behavior at <1024px, and a TopNav hamburger that's visible only at tablet and mobile. All visual decisions resolve to real tokens; the only net-new token is `semantic-type.desktop.label.section.s.medium`.

---

## Read first

Three documents in `components-sandbox/sidenav/`:

1. **[sidenav-2026-04-21-grouper-variants-v6.html](./sidenav-2026-04-21-grouper-variants-v6.html)** — the canonical prototype. It's a self-contained working implementation of every change. Open it in a browser, resize above and below 1024px to observe both breakpoints. Read the embedded Token Coverage Report at the bottom of the HTML for the full token list.

2. **[sidenav-2026-04-21-grouper-variants-spec-additions.md](./sidenav-2026-04-21-grouper-variants-spec-additions.md)** — every spec-worthy decision, written in the structure the real `sidenav-spec.md` should absorb. Organized into sections 1–7; see the "Rules summary" section 7 for the one-page rollup. **This is the primary input for `/pathway:spec-review`.**

3. **[sidenav-2026-04-21-grouper-variants-token-recommendations.md](./sidenav-2026-04-21-grouper-variants-token-recommendations.md)** — token-level recommendations beyond the one new token being added. These are system-level suggestions (a dedicated letter-spacing primitive for all-caps, a scrollbar thumb color semantic, etc.) — all optional, all documented with architecture-fit analysis. Not required for this update but worth the design system owner's review.

---

## Figma source

Every Figma change for this update was made on 2026-04-24. Relevant nodes:

- Main SideNav component page: `node-id=40003951:2927`
- Accounting example / demo: `node-id=40004790:47259`
- New SectionLabel + CollapseToggle additions: `node-id=5469:7546` (the node the user referenced in handover)

File: `https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP/`
File key: `3sw45aVcngFAmpbP6cfrXP`

---

## Sequence

Each step below is a separate skill invocation with its own human approval gates. Do not try to compress.

### Step 1. `/pathway:tokens-sync`

**Why:** pulls the updated Figma token export, regenerates `tokens/pathway-design-tokens.json` + derived CSS/JS files, redeploys Storybook.

**What should land in the token file after this runs:**

New token:
```
semantic-type.desktop.label.section.s.medium
├── fontfamily    → {primitive-type.family.brand}          → "Red Hat Text"
├── fontsize      → {primitive-type.size.11}               → 11
├── fontweight    → {primitive-type.weight.500}            → 500
├── lineheight    → {primitive-type.line-height.11pt.single} → 16
└── letterspacing → {primitive-type.letter-spacing.wide}   → 0.1
```

Rationale for naming (nested under `label.*`, not top-level `section-label.*`): keeps all "text that names something" tokens in one branch of the panel. Peer to `label.button.*`, `label.input.*`, `label.dense.*`. See spec-additions §1.4 for the full decision history.

**Optional but recommended:** if Figma's variables export carries `$description` (verify in `tokens/figma-export/pathwaytokens.json` after the export), keep it. If it's on one sub-variable of the compound (our convention: put it on `fontsize`), have `sync-tokens.js` hoist it to the parent as `$description`. See the conversation's earlier exchange on this pattern.

Existing tokens used unchanged:
- `text.static.secondary.subtle` (#6b6b6b) — color applied at component level, not baked into type token
- `fill.static.info.subtle` (#edf0f9) — rail-state dividers, scrim reference
- `primitive-color.cool-neutral.220-8` / `-18` / `-32` / `-45` — scrollbar thumb opacity values

### Step 2. `/pathway:spec-review`

**Why:** the component pipeline refuses to run on any spec not marked `Status: REVIEWED` (CLAUDE.md §11). Spec-review walks through every rule change, one by one, with human sign-off.

**Input:** `components/sidenav/sidenav-spec.md` (existing) + `components-sandbox/sidenav/sidenav-2026-04-21-grouper-variants-spec-additions.md` (new rules to absorb).

**Rules to present for approval** (numbered per the spec-additions doc):

| # | Rule | Section |
|---|---|---|
| 1 | **SectionLabel** — new non-interactive element type. 11pt / 500 / uppercase / `text.static.secondary.subtle`. Used for visual grouping of nav items. Passes WCAG AA (5.1:1) on the nav surface. | §1 |
| 1.5 | **Rail-state rule:** SectionLabels render as thin `fill.static.info.subtle` dividers at 72px rail width. Non-negotiable. | §1.5 |
| 1.7 | **Accessibility:** screen readers use the `role="group" aria-labelledby` pattern, not `role="heading"`. Three-way pattern (labeled-group preferred, decorative `aria-hidden` fallback, heading-role forbidden) documented in detail. | §1.7 |
| 2 | **Nav item typography** drops from 16pt / 22 line-height to 14pt / 20 line-height. Denser nav; more items fit per viewport. | §2 |
| 3 | **CollapseToggle** replaces the old bottom `CollapseButton`. Inline, icon-only, 28×28. Lives in the sidenav header. Fixes production spec §15.8 design debt (button scrolled with content and got pushed below the fold). | §3 |
| 3b | **Tooltip on hover** (500ms delay) for the CollapseToggle. Uses the same visual style as CollapsedTooltip (white bg, subtle border, soft shadow). Text mirrors aria-label ("Expand navigation" / "Collapse navigation"). Implemented in v6. | §3 (pending confirmation) |
| 4 | **SideNav width** reduced from 250px to **220px**. Label max-width reduced from 200 to 168. Fits "Background Checks" and "My Outstanding" as destinations; groupers with long labels need shorter copy (see naming rules). | §4 |
| 4.2 | **Naming recommendations** (destinations ≤17ch, groupers ≤12ch, section labels ≤14ch). Enforced at product-copy review. Lists anti-patterns to reject. | §4.2 |
| 5 | **Scrollbar spec**: 6px thin, state-based thumb opacity ramp, `scrollbar-gutter: stable` reserves layout space, **margin-right 12px on scroll-container children** guarantees visual gap between nav item fills and scrollbar thumb (this is the critical rule — padding alone doesn't work). | §5 |
| 6 | **96px bottom scroll padding** for floating-element (e.g. "What's New" bubble) clearance. Always applied, even on modules without a floating element. | §6 |
| 6b | **TopNav hamburger placement — Option A:** visible only at <1024px. On desktop the sidenav owns its own collapse toggle (no redundancy). Rejected alternatives (Option B, Option C) documented. | §6b |
| 6c | **Responsive overlay** at <1024px: SideNav becomes `position: fixed`, hidden by default, revealed via TopNav hamburger. Scrim (rgba(0,0,0,0.32)) behind. Asymmetric enter/exit motion (380ms/300ms decelerate enter, 300ms/220ms ease-in-out exit). In-sidenav CollapseToggle hidden at this breakpoint. **Focus trap noted as deferred** — required for a11y, must be added before shipping. | §6c |

**What spec-review should do with each item:** read the proposed rule, check for conflicts with existing `sidenav-spec.md` content, present any conflicts to the human with options, record the decision. When all rules are resolved, flip `Status: REVIEWED` (and only then).

### Step 3. `/pathway:component-pipeline --mode=update`

**Why:** the SideNav already exists in the repo; this is an update, not a create. The pipeline will fetch the updated Figma design, regenerate the code artifacts, commit, and push.

**What should regenerate:**

#### 3.1 `components/sidenav/sidenav.jsx`

The shared source of truth (per `CLAUDE.md` §10). The .html demo imports its logic from here.

- **Add `SectionLabel` exported component.** Props: `label: string`, `isSidebarCollapsed: boolean`. Render as described in spec §1.
- **Add `CollapseToggle` exported component** (replaces the old `CollapseButton`). Props: `isSidebarCollapsed: boolean`, `onToggle: () => void`. Includes tooltip on hover (§3b). Hidden at <1024px via the consuming wrapper's CSS class.
- **Add `RailHeader` exported component.** Props: `onToggle: () => void`. Used only at desktop rail state and as the top-of-rail header.
- **Update `SideNavItem`** typography: `fontSize: 14`, `lineHeight: "20px"` (down from 16/22).
- **Update `SideNav` container**:
  - Width: 220 (was 250)
  - Label max-width: 168 (was 200)
  - Remove the old bottom `CollapseButton` mount entirely
  - Render `CollapseToggle` in the top header row at ≥1024px; render `RailHeader` at 72px rail
  - Accept a new `section-label` item type in the nav tree (or accept SectionLabels as a sibling array — implementation detail)
  - Add `className="pds-sidenav-root"` + conditional `is-open` class for the overlay state
  - Add responsive overlay behavior CSS (position: fixed at <1024px, transform + opacity transitions, prefers-reduced-motion handled)
  - Overlay-open state must be controllable externally (new prop) so the TopNav hamburger can toggle it
- **Add `SideNavScrim` component** — portal-rendered to `document.body`, class `pds-sidenav-scrim`, visible only at <1024px when overlay is open.
- **Update the module's exports** — add `SectionLabel`, `CollapseToggle`, `RailHeader`, `SideNavScrim`. Remove `CollapseButton` if it was publicly exported.
- **Remove the old `CollapseButton` component.**
- **Keep `CollapsedTooltip`, `CollapsedPopover`, `PopoverRow`, `IndicatorStripe`** unchanged.

#### 3.2 `components/sidenav/sidenav.html`

Mirror the .jsx logic one-to-one (it's a self-contained demo). The sandbox v6 file is a close approximation of what the final `sidenav.html` should look like, minus:
- The prototype banner (remove)
- The mock "What's New" floating bubble (keep as a demo control — it illustrates the 96px clearance)
- The TOKEN COVERAGE REPORT HTML comment at the bottom (keep — the production file also has one)

The existing `sidenav.html` has a full TopNav + docs pane + token table in the canvas. Preserve that structure; replace the actual `SideNav`-related code with v6's implementation.

#### 3.3 `components/sidenav/sidenav-spec.md`

Absorb every approved rule from `sidenav-2026-04-21-grouper-variants-spec-additions.md` into the real spec. Treat the spec-additions doc as the source of truth for what sections 1–7 should say (subject to whatever edits happened during spec-review).

Sections to update or add:
- §5 Item Variants → add SectionLabel variant
- §6 State Matrix → add SectionLabel idle state (no other states); note that SectionLabel has no Active / Trail / Hover
- §8 Layout & Motion → update width from 250 to 220; typography 16→14
- §9 Collapse_Expand_Nav_Container → REPLACE the old CollapseButton architecture with CollapseToggle (§3 of spec-additions)
- §10 Sidebar Collapsed State → add rule that SectionLabel renders as divider at 72px rail (§1.5); note that in-sidenav CollapseToggle hides at <1024px (§6c)
- §11 Scrollbar Spec → NEW SECTION (not in existing spec); absorb §5 of spec-additions wholesale
- §12 Bottom Scroll Clearance → NEW SECTION; absorb §6 of spec-additions
- §13 Naming Recommendations → NEW SECTION; absorb §4.2 of spec-additions
- §15.8 (design debt — CollapseButton stickiness) → **MARK AS RESOLVED**, reference §9's new architecture
- §16 Responsive Behavior → extend existing mobile section with tablet (§6c of spec-additions). Document the TopNav hamburger placement (§6b).

#### 3.4 `src/stories/Library/SideNav/SideNav.stories.jsx`

Add stories for the new variants:
- `Default` — at desktop width with a section-labeled tree
- `RailState` — at 72px collapsed state, showing dividers where SectionLabels were
- `OverlayClosed` — at <1024px with overlay hidden
- `OverlayOpen` — at <1024px with overlay revealed + scrim
- `LongLabels` — demo tree including "Background Checks" and "My Outstanding" to verify 220px width fit
- `WithFloatingBubble` — demonstrates the 96px bottom clearance

#### 3.5 `src/stories/Library/SideNav/SideNav.mdx`

Narrative + reference docs. Update:
- Introduction: mention new SectionLabel element, new CollapseToggle, 220px width, responsive overlay behavior
- Variants page: describe Destination (unchanged), Grouper (unchanged), **SectionLabel (new)**
- States: update State Matrix (typography change, no new states on existing variants)
- Breakpoints: new section describing desktop push / tablet+mobile overlay
- Accessibility: update with the SectionLabel screen-reader pattern (§1.7 of spec-additions) and the Responsive overlay a11y notes (§6c.5 focus-trap requirement)
- Tokens: update token table with `label.section.s.medium` + the color/transform combination for SectionLabel

#### 3.6 `src/stories/Library/SideNav/sidenavDemoData.jsx`

Update the demo tree to include section labels and longer labels for verification:

```jsx
export const NAV_ITEMS = [
  { id: "applications", label: "Applications", icon: Icons.apps, children: [...] },
  { id: "enter", label: "Enter", icon: Icons.add_doc },
  { id: "manage", label: "Manage", icon: Icons.tune },
  { id: "background_checks", label: "Background Checks", icon: Icons.view },
  { id: "my_outstanding", label: "My Outstanding", icon: Icons.add_doc },
  { id: "label_accounting", type: "section-label", label: "Accounting" },
  { id: "view", label: "View", icon: Icons.view, children: [...] },
  // ...
];
```

#### 3.7 `components/manifest.json`

Update the `sidenav` entry:
- Bump `version` if you track per-component versions
- Add new exports: `SectionLabel`, `CollapseToggle`, `RailHeader`, `SideNavScrim`
- Remove `CollapseButton` from exports
- Update `tokens` array: add `label.section.s.medium`, add `text.static.secondary.subtle`
- Update `props` table for `SideNav` to reflect new props (overlay state, etc.)

---

## Open decisions to resolve during spec-review

These did not land fully during prototyping. The spec-review conversation should close them out.

1. **Focus trap on the overlay at <1024px** — required for full a11y (WCAG 2.4.3), not implemented in v6. Pick an approach (library like `focus-trap`, `react-focus-lock`, or hand-roll) and document in the spec. Owner assignment needed.

2. **Escape key dismisses overlay at <1024px** — natural pattern, ties into focus trap. Confirm and document.

3. **Swipe-to-dismiss gesture on mobile overlay** — not required for launch. Confirm deferral or include in v1.

4. **Scrim color token** — prototype uses raw `rgba(0,0,0,0.32)`. Closest existing primitive is `cool-neutral.220-30` (uses #111 not #000, close but not identical). Decide: (a) accept the mismatch and use the primitive, (b) add a `fill.static.scrim.base` semantic token.

5. **Scrollbar thumb hover + active color values** — the jumps from 0.18 → 0.32 → 0.45 alpha have no matching primitives. Decide: (a) add `220-32` and `220-45` primitives, (b) rescale to existing `220-30` and `220-50` (small visual drift), (c) introduce a `fill.contextual.scrollbar.*` semantic family.

6. **SectionLabel Figma description export** — check whether the $description field made it through the export. If yes, make sure `sync-tokens.js` preserves it. If no, decide how descriptions will be maintained (sidecar file, manual JSON edit, etc.).

---

## Verification checklist (after pipeline runs)

Storybook (auto-redeploys from the pipeline's push):
- [ ] SideNav stories load without errors
- [ ] Default story shows SectionLabels at 11pt / 500 / uppercase / muted gray
- [ ] Trial Balance story shows Trail-collapsed state correctly (grouper Active stripe + fill)
- [ ] RailState story shows SectionLabels collapsed to thin dividers
- [ ] OverlayOpen story shows scrim + slide-in animation
- [ ] LongLabels story shows "Background Checks" fully (no truncation)

Repo:
- [ ] `components/sidenav/sidenav.jsx` exports SectionLabel, CollapseToggle, RailHeader, SideNavScrim
- [ ] `components/sidenav/sidenav.html` renders without console errors
- [ ] `components/sidenav/sidenav-spec.md` has `Status: REVIEWED`
- [ ] `components/manifest.json` sidenav entry updated
- [ ] `tokens/pathway-design-tokens.json` contains `semantic-type.desktop.label.section.s.medium`
- [ ] `src/tokens/tokens.css` / `tokens.js` regenerated with the new variable
- [ ] No references to the old `CollapseButton` remain anywhere

A11y smoke test:
- [ ] Screen reader announces section labels as "{label} group" when entering the group
- [ ] Keyboard navigation skips section labels (tab/arrow keys go between tree items only)
- [ ] Overlay at <1024px: focus trap works (tab doesn't leak to obscured page)
- [ ] Overlay at <1024px: Escape key closes overlay (if that decision landed)
- [ ] All interactive elements reach WCAG AA contrast minimum

---

## Provenance / conversation references

If future agents need to reconstruct the "why" behind any decision, the decision log is in the v1 → v6 prototype iterations and the spec-additions doc. Key decision pivots:

- v1 → v2: **scrapped "expandable grouper" variant** — redundant with today's SideNav groupers, would have created two ways to represent the same concept.
- v2 → v3: **rejected "flatten the tree" approach** (Option 2 from user's decision) — ran against the 2-level-depth spec rule and made the demo harder to reason about. v3 restored today's SideNav structure and just added SectionLabel as an additive element.
- v4: **decided not to support inline-with-first-section-label variant of the CollapseToggle** — kept it as a possible future variant, but the default is a standalone header row.
- v5: **Option A locked in** for hamburger placement (tablet/mobile only, hidden on desktop).
- v6: **Full responsive overlay behavior** (position: fixed at <1024px, scrim, asymmetric motion). **Scrollbar fix pivot** — v5's container paddingRight didn't prevent overlap; v6 switched to `margin-right: 12px` on scroll container children.

If any decision above needs revisiting, the rationale is in the spec-additions doc, not in tribal knowledge.

---

## Do not skip

- Do not skip spec-review. The pipeline refuses unreviewed specs.
- Do not hand-edit `pathway-design-tokens.json` or derived token files. Figma is the source of truth (CLAUDE.md §2).
- Do not commit the prototype files into `components/sidenav/`. They live in `components-sandbox/` and stay there until explicitly archived.
- Do not skip the a11y items. Focus trap + keyboard nav are non-negotiable for production.
