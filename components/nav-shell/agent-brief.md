# NavShell — Agent Brief

Condensed summary of the Pathway application shell for AI agents building any Amplify screen.

Read this first. Full spec: [nav-shell-spec.md](./nav-shell-spec.md).
Storybook story (canonical demo): `src/stories/Library/NavShell/NavShell.stories.jsx` — this imports the real TopNav and SideNav modules.

---

## What it is

The outermost layout that wraps every page in Ministry Brands Amplify. It composes:
- **TopNav** (`components/top-nav/top-nav.jsx`) — fixed top bar, 56px, brand blue
- **SideNav** (`components/sidenav/sidenav.jsx`) — left navigation panel
- **Content area** — scrollable region right of SideNav

## Import the real modules — do not reimplement

```javascript
import { TopNav, DEFAULT_MODULES } from './components/top-nav/top-nav.jsx';
import { SideNav }                  from './components/sidenav/sidenav.jsx';
```

Do not write fresh CSS for TopNav or SideNav. Import them. Fresh CSS will be wrong.

## Layout structure

```
html/body: height: 100%; overflow: hidden;

TopNav:    position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 56px;

SideNav:   position: fixed; top: 56px; left: 0; bottom: 0; z-index: 50;
           width: 220px (expanded) | 72px (collapsed rail) | 0 (mobile hidden)
           transition: width var(--motion-duration-6) var(--motion-easing-emphasized)

Main:      margin-left: [SideNav width]; padding-top: 56px;
           overflow-y: auto;
           Same transition as SideNav width
```

## Breakpoints

| Viewport | SideNav | TopNav changes |
|---|---|---|
| ≥1024px desktop | 220px expanded OR 72px collapsed (user toggles) | Full labels, 2× bells |
| 768–1023px tablet | Always 72px rail | Module label hidden, bells → more_vert |
| <768px mobile | Hidden by default, 220px overlay on hamburger | Hamburger visible, abbreviated labels |

## Customisation — change only these values

```javascript
// Module
const module = { id: "giving", label: "Amplify Giving", icon: "volunteer_activism" };

// Organisation
const org = { name: "NorthPoint Church", campus: "" };

// User (for profile avatar)
const user = { name: "Jo Lopez", initials: "JL", email: "jo@northpoint.org" };

// SideNav items
const navItems = [
  { id: "home",    label: "Home",    icon: "home",   active: true },
  { id: "teams",   label: "Teams",   icon: "group" },
  { id: "projects",label: "Projects",icon: "folder" },
];
```

All icons are **Material Symbols Rounded, FILL=1** (filled). Icon name = Figma layer `data-name`.

## Content area tokens

```
Background:         surface.canvas.light = #fafafa
Page padding:       px:36 pt:12 pb:56
Section gap:        gap-relaxed = 24px
Card bg:            fill.static.neutral.light = #ffffff
Card border:        0.5px stroke.action.secondary-inverse.base = #d2d2d2
Card radius:        8px (contextual.card.cornerradius)
```

## What the HTML demo is for

`nav-shell.html` is a **visual preview** for designers — open it in a browser to see the shell in context. It is NOT the implementation reference. For implementation, use the `.jsx` modules above.
