# Pathway Tokens — Agent Brief

Read this **first** if you are an AI agent (Claude, Figma Make, v0, Cursor, etc.) about to invent any UI element that isn't already a documented Pathway component. This file tells you the rules for picking colours, typography, spacing, motion, and radii so the thing you build looks like it belongs to Pathway.

If a documented component exists for what you're building, **use the component** — see [`../AGENTS.md`](../AGENTS.md) and [`../components/manifest.json`](../components/manifest.json).

---

## The 5 hard rules

1. **Every colour you use must come from a semantic token.** Never raw hex. Never primitive tokens (`Blue/180`, `Cool-Neutral/130`, etc.). Never invented token names.

2. **Token names follow the pattern `Category/Subcategory/Variant/State`.** Examples: `Fill/Static/Brand/Base`, `Text/Contextual/NavItem/Active`, `Icon/Action/Primary/Hover`. If you propose a name that doesn't fit this pattern, it doesn't exist — pick a real one from this file.

3. **There are two scopes:** `Static` and `Contextual`.
   - `Static` tokens have one meaning across the whole product (e.g. `Fill/Static/Brand/Base = #2d4889`).
   - `Contextual` tokens belong to a specific component family (e.g. `Fill/Contextual/NavItem/Active`). They may share hex values with static tokens but are kept separate so they can diverge in future.

4. **Typography is `Red Hat Text`, weights 400/500/600.** No other font. No other weights. No display font.

5. **Use the type scale exactly as named.** `Label/Menu/Base/Medium` is 14/500/20px/0.3px letter-spacing. If you find yourself typing arbitrary px values for type, stop — find the scale entry.

---

## Where the real source of truth lives

| File | What it is |
|---|---|
| [`pathway-design-tokens.json`](./pathway-design-tokens.json) | DTCG-format derived from Figma. **Authoritative.** Every token in production. |
| [`figma-export/pathwaytokens.json`](./figma-export/pathwaytokens.json) | Raw Figma Variables export. Source of `pathway-design-tokens.json`. |
| [`../src/tokens/tokens.css`](../src/tokens/tokens.css) | Style Dictionary CSS output — import this to get all CSS custom properties. |
| [`../src/tokens/tokens.js`](../src/tokens/tokens.js) | Style Dictionary JS output. |
| [Storybook → Tokens](https://helloimjolopez-collab.github.io/pathway-ds/storybook/?path=/docs/tokens-primitives-color--docs) | Visual swatches with hex values. |

When the spec says a value, the spec wins over your training data. When the token JSON says a value, the JSON wins over the spec. Tokens flow Figma → JSON → CSS — never the other direction.

---

## Token families — the families that exist

### Surface (page-level backgrounds)
```
Surface/Nav/Light            #fafafa   /* SideNav panel */
Surface/Canvas/Light         #fafafa   /* page / viewport background */
Surface/Canvas/Dark          (dark-mode equivalent)
Fill/Static/Surface/White    #ffffff   /* cards, popovers, tooltips */
```

### Brand
```
Fill/Static/Brand/Base       #2d4889   /* TopNav, primary button, brand accents */
Text/Static/Primary/Inverse  #ffffff   /* text on brand-blue */
Icon/Static/Brand            #2d4889   /* brand-coloured icons */
Icon/Static/Brand/Inverse    #ffffff   /* icons on brand-blue */
```

### Text
```
Text/Static/Primary/Base     #202020   /* high-emphasis body text */
Text/Static/Secondary/Base   /* mid-emphasis */
Text/Static/Secondary/Light  #7b7b7b   /* PopoverMenu.SectionLabel */
Text/Static/Secondary/Subtle #606060   /* NavSectionLabel (uppercase headings) */
Text/Static/Disabled         /* disabled state */
Text/Static/Primary/Inverse  #ffffff   /* on dark/brand backgrounds */

/* Contextual — for NavItem family specifically */
Text/Contextual/NavItem/Base    #313131
Text/Contextual/NavItem/Hover   #252525
Text/Contextual/NavItem/Active  #1b2d57
```

### Icon (same naming pattern as Text)
```
Icon/Static/Brand                  #2d4889
Icon/Static/Neutral/Base           /* default neutral icon */
Icon/Static/Neutral/Subtle         /* dim neutral icon */
Icon/Action/Primary/Base           /* primary action icon */
Icon/Action/Secondary/Base         /* secondary action icon */
Icon/Action/Secondary Inverse/Base #6b6b6b
Icon/Action/Tertiary/Base
/* Plus accent variants — jade (success), garnet (danger), citrine (warning), sapphire (info) */
Icon/Contextual/NavItem/Base    #484848
Icon/Contextual/NavItem/Hover   #313131
Icon/Contextual/NavItem/Active  #2d4889   /* also indicator stripe colour */
```

### Fill (component-level backgrounds)
```
Fill/Static/Brand/Base       #2d4889   /* primary button, TopNav */
Fill/Static/Surface/White    #ffffff
Fill/Static/Accent_Amethyst/Base #dcd9ef  /* Profile avatar background */
Fill/Action/Primary/Base     /* primary button rest */
Fill/Action/Primary/Hover
Fill/Action/Primary/Active
Fill/Action/Tertiary/Base    /* outline / subtle button */
/* Plus accent fills — jade, garnet, citrine, sapphire — for status surfaces */

/* Contextual — NavItem family */
Fill/Contextual/NavItem/Base     #fafafa
Fill/Contextual/NavItem/Hover    rgba(17,17,17,0.02)
Fill/Contextual/NavItem/Active   rgba(160,181,230,0.16)
Fill/Contextual/NavItem/Trail    rgba(17,17,17,0.02)
```

### Stroke (borders)
```
Stroke/Static/Neutral/Light   #f6f6f6   /* nav border, NavHeader divider, rail section divider */
Stroke/Static/Neutral/Subtle  #ededed   /* popover border, list-section bottom border */
Stroke/Static/Neutral/Default /* form input border */
Stroke/Action/Primary/Base    /* primary-action focus ring */
Stroke/Action/Tertiary/Base   rgba(255,255,255,0.16)  /* OrgSwitcher pill border on brand-blue */
```

### Typography (semantic type scale)
```
Label/Menu/Base/Medium         14px / 500 / 20px / 0.3px  Red Hat Text
                               → SideNavItem label, PopoverMenu.Item, primary button
Label/Menu/Base/Regular        14px / 400 / 20px / 0.02px Red Hat Text
                               → PopoverMenu.SectionLabel (in flyout, not uppercase)
Label/Section/Small/Semibold   11px / 600 / 16px / 0.6px UPPERCASE Red Hat Text
                               → NavSectionLabel (in-nav uppercase headings)
Text/Body/S/Regular            14px / 400 / 20px / 0.02px Red Hat Text
                               → SideNavTooltip text, body copy
Text/Body/XSmall/Regular       12px / 400 / 18px / 0.6px Red Hat Text
                               → SideNavListSection ListItem text, captions
Heading/H1                     /* defined in tokens.json — see Storybook Typography page */
Heading/H2
Heading/H3
```

All text uses `'Red Hat Text', sans-serif`. Load via Google Fonts:
```html
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600&display=swap" />
```

### Radius
```
Border/Radius/XS   4px    /* Checkbox box */
Border/Radius/S    8px    /* Buttons, nav items, popovers, tooltips */
Border/Radius/M    12px   /* Cards */
Border/Radius/L    16px   /* Large cards, dialogs */
Border/Radius/Full 64px+  /* Circles (avatars, search button) */

Component/NavItem/Large/Radius  8px  /* SideNavItem specifically */
```

### Spacing (no full token scale yet — work in progress)
Spacing is currently not fully tokenized. Use these standard values until a scale exists:
```
2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64
```
Component-specific spacing values are documented in each component's spec under §4 (Layout & Spacing).

### Motion (durations + easing)
```
/* Standard categories from docs/design-system-spec.md §2 */
instant   150ms   /* hover, focus, colour swaps */
short     300ms   /* small structural moves, modal enter */
medium    600ms   /* page transitions */
long      900ms+  /* hero animations (rare) */

/* Component-specific overrides (registered, do NOT invent your own) */
Motion/SideNav/Panel/Width    380ms · cubic-bezier(0.32, 0.72, 0, 1)  /* 240↔72 px */
Motion/SideNav/Label/Fade     360ms · same curve · 200ms opacity
Motion/SideNav/Accordion      340ms · cubic-bezier(0.22, 1, 0.36, 1)  /* grouper expand */
Motion/SideNav/Overlay/Enter  380ms · cubic-bezier(0, 0, 0.2, 1)
Motion/SideNav/Overlay/Exit   300ms · cubic-bezier(0.4, 0, 0.6, 1)

/* Easing curves */
Standard:    cubic-bezier(0.4, 0, 0.2, 1)
Decelerate:  cubic-bezier(0, 0, 0.2, 1)   /* enters */
Accelerate:  cubic-bezier(0.4, 0, 0.6, 1) /* exits */
SmoothSpring:cubic-bezier(0.32, 0.72, 0, 1)  /* SideNav width */
EaseOutQuart:cubic-bezier(0.22, 1, 0.36, 1)  /* accordion */
```

**Always respect `prefers-reduced-motion: reduce`** — collapse all transforms to instant opacity fades at 150ms linear.

### Accessibility tokens
```
Accessibility/Touch Target/Optimal   48px   /* item min-height */
Accessibility/Touch Target/Minimum   44px   /* absolute minimum, WCAG 2.5.5 */
Accessibility/Icon Wrapping/Small    16px
Accessibility/Icon Wrapping/Medium   20px
Accessibility/Icon Wrapping/Large    24px
```

---

## When you have to invent a new UI element

If no component exists for what you need (e.g. a custom card, a banner, a confirmation message):

1. **Background:** pick from the Surface or Fill families. White cards use `Fill/Static/Surface/White`. Subtle grey panels use `Surface/Canvas/Light` (`#fafafa`). Don't invent new surface colours.

2. **Border:** `Stroke/Static/Neutral/Subtle` (`#ededed`) for separating elements, `Stroke/Static/Neutral/Light` (`#f6f6f6`) for very subtle structural dividers.

3. **Radius:** 8px (`Border/Radius/S`) for almost anything. 12px (`Border/Radius/M`) for cards. 64px+ for circles. Never invent radii.

4. **Padding:** use the spacing scale numbers above. Standard card padding is 16 or 24. Standard form-row gap is 8 or 12.

5. **Typography:** `Label/Menu/Base/Medium` for buttons and emphasised labels. `Text/Body/S/Regular` for body. `Label/Section/Small/Semibold` for section headings. Never use arbitrary px sizes.

6. **Motion:** 150ms for hover/colour. 300ms for entering/leaving. Standard easing curve for almost everything. Reduced-motion always respected.

7. **Accessibility:** all interactive elements have a visible focus ring (use brand-blue `#2d4889` outline 2px with 2px offset). All touch targets at minimum 44×44. All text passes WCAG AA contrast on its intended background.

If you find yourself reaching for a colour, size, or motion value that isn't in the families above, stop and ask the user. Don't make it up.

---

## What to do when you can't find a token

1. **Search [`pathway-design-tokens.json`](./pathway-design-tokens.json) by name fragment.** Most components reference token names verbatim in their spec — the name is reachable from there.

2. **Search Storybook's token pages.** The Tokens section under `Semantics/` has full swatches with hex values and CSS variable names.

3. **Check the Figma file directly via MCP.** File key `3sw45aVcngFAmpbP6cfrXP`. The Variables panel is the absolute source of truth.

4. **Ask the user.** Don't invent. If a token is missing, that's a real gap in the design system that the user (or design team) needs to fill in Figma.
