# Pathway Design System — Changelog

All notable changes to this design system are documented here. Dates reflect when changes were reviewed and merged to main.

---

## [Unreleased]

---

## SideNav — 2026-05-13

### Changed
- **NavHeader position:** The collapse/expand control moved from the **bottom** of the scroll flow to the **top** of the SideNav container. The component is now named `NavHeader` in code (previously `CollapseButton` / `Collapse_Expand_Nav_Container`).
- **NavHeader anatomy:** Removed the "Collapse" text label that previously appeared beside the action icon. The header now contains only `Slot.RowStart` (Module.Mark) in expanded state and the action icon in both states.
- **Motion curve:** Sidebar width transition updated from `cubic-bezier(0.34, 1.56, 0.64, 1)` at 500 ms (bouncy spring) to `cubic-bezier(0.32, 0.72, 0, 1)` at 380 ms (smooth spring, no overshoot). Label and chevron opacity/width transitions updated accordingly.
- **Backward compatibility:** The `CollapseButton` symbol remains exported in `sidenav.jsx` but is no longer rendered by `<SideNav />` itself.

---

## SideNav — 2026-05-12

### Changed
- **Spacing tokens updated** across SideNavItem rows following a Figma sync:
  - Row padding: `12px` → `8px` top/bottom (token: `Nav/Item/Padding/Y`)
  - Section gap (between direct SideNavMenu children): `8px` → `6px` (token: `Nav/Menu/Gap`)
  - Level 1 child indent: `16px` → `20px` left offset (token: `Nav/Item/Indent/L1`)
- **Spec reviewed:** 11 design decisions recorded (2 BLOCK, 4 ASK, 4 NIT + 1 rename). Status set to `REVIEWED`.

---

*This changelog covers component-level changes tracked in the Pathway design system repo. Token-only changes are tracked separately in the npm package release notes.*
