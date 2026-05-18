# Search · TopNav placement rationale

**Decision (locked 2026-04-28):** the omnisearch trigger lives on the **right side of the TopNav, immediately to the left of the action cluster** (help / settings / notifications), between the org switcher and those action icons. At desktop (≥1024px) it renders as an always-expanded inline pill input; at tablet/mobile (<1024px) it collapses to a circular pill icon that opens a full-screen overlay.

This document records why search is placed on the right rather than centered, and why specifically position B (left of action icons) was chosen over position C (right of action icons, between them and avatar).

---

## Why right, not center

### 1. The TopNav already has a structural grammar — context on the left, actions on the right

Pathway's TopNav reads like every other modern productivity platform: brand and context on the far left (home icon → module switcher → org switcher), account anchor on the far right (avatar), tools clustered between context and account. Search is a tool. Placing it among the other tools (help, settings, notifications) keeps the left side semantically pure as "where am I" and the right side as "what can I do." Centering search would break this grammar by introducing a third zone that doesn't fit either category.

### 2. Search is a secondary navigation method in Amplify, not the primary one

Centering search sends a strong signal that the product is search-driven. Google, NPM, GitHub repository search, and most content directories center their search bars because finding the right thing is the *first* job users do. Amplify works differently. Users land in a known module (Accounting, Background Checks, etc.), navigate via the SideNav within that module, and reach for search only when they want something cross-module or hard to find directly. Search is an *escape hatch*, not the front door. Right-side placement matches that ergonomic reality. It says "search is here when you need it" rather than "search is how you use this app."

### 3. Visual weight competition

A centered search bar pulls the centerline of the TopNav, which competes with the centered focal points of the page below (hero sections, modals, page titles). Right-side placement keeps the TopNav off-axis to the page content, which avoids the optical tension of stacked centered elements. Linear, Notion, Asana, Slack, and Microsoft Teams all place search on the right for this reason.

### 4. Scanning behavior

Western users scan TopNavs along a Z or F pattern: top-left first to identify "where am I," then sweeping right to find action affordances. Search at the natural endpoint of that scan (right cluster) lines up with how the eye is already moving. A centered search interrupts the scan: users encounter it before they've finished establishing context, which is a cognitive misordering. Right placement respects the scan order.

### 5. Responsive collapse has a clean home

At <1024px the search collapses to its circular pill icon and stays anchored in the same right-cluster spot, just before where the action cluster collapses to the overflow `⋮`. The mental model is consistent across breakpoints: "the right side is for tools, the left for context." A centered search has no natural place to go when the layout compresses. It would either need to jump positions on collapse (jarring) or fight a centered logo for the same space (visually noisy).

### 6. Industry alignment

Productivity platforms with module-based workflows almost universally place search on the right:

| Product | Search placement | Notes |
|---|---|---|
| Linear | Right cluster | Just left of the workspace switcher |
| Notion | Right cluster | At the leftmost end of the right-side controls |
| Asana | Right cluster | Adjacent to inbox + help |
| Slack | Center-leaning right | Functionally a right-cluster element |
| Microsoft Teams | Center, but the entire app frame is centered | Edge case |
| Atlassian (Jira / Confluence) | Right cluster | Same pattern |
| Salesforce | Right cluster | |
| Monday.com | Right cluster | |

Center placement is dominant in:

| Product | Why centered makes sense |
|---|---|
| Google Search / NPM / GitHub repo search | Product is search-first |
| Stripe Dashboard | Single-purpose admin panel; less context to anchor |
| Amazon | Catalog / e-commerce; finding products IS the job |

Amplify is the first kind of product, not the second.

---

## Why position B (left of action icons), not position C (right of action icons)

Within the right cluster there were two reasonable spots for search:

- **B**: between the org switcher and the action icons (chosen)
- **C**: between the action icons and the avatar (rejected)

### B wins on prominence

Search is the most important tool in the right cluster. Burying it after help/settings/notifications puts it at the *end* of the right-side reading order. By the time the eye gets there, it has already passed the action icons and is approaching the avatar (an end-of-row anchor). Position B places search where it gets discovered first within the right cluster. Action icons are secondary; they can sit further right.

### B has more horizontal room when expanded

At desktop the always-expanded search bar can be wider when it sits before the action cluster, because the cluster takes ~120px of fixed space to its right. Position C would be sandwiched between the action cluster and the avatar, leaving only ~50–80px before bumping into the avatar — too tight for a usable text input.

### B keeps the avatar adjacent to the user-account-related controls

The avatar is the user's account anchor. Help, settings, and notifications are user-facing operations. Keeping those adjacent to the avatar (right of search, immediately before the avatar) groups them as a coherent "your account / your alerts / your settings" cluster. Search is system-wide and doesn't share that semantic; it sits one step to the left of that cluster.

### C felt unconventional

In every product surveyed above, when search lives in the right cluster, it sits to the left of action icons, not to the right of them. C would have been a quiet break from convention with no payoff.

---

## When right placement would NOT be the right answer

This decision is contextual to Amplify. If a future Pathway product has any of these characteristics, search may belong centered or differently placed:

- **Search-first product** (catalog, directory, support knowledge base). If the user's primary intent on every visit is to find something specific, center the search and de-emphasize navigation chrome.
- **No left-side context to protect.** Products that don't carry a module/org/identity stack on the left have nothing to "preserve" by putting search elsewhere; centering is fine.
- **Single-page applications with no navigation hierarchy.** If there's no SideNav and no module switcher, the TopNav is mostly empty space and centering search fills it well.

For Amplify and any future Pathway product that follows the same shell architecture (module + org context on the left, account on the right, actions in between), right-side search is the right call.

---

## Summary

Right-side placement, left of action icons, because:

1. Preserves the TopNav's left=context / right=tools grammar
2. Matches Amplify's actual usage pattern (search is secondary, not primary)
3. Avoids visual competition with centered page content
4. Aligns with the natural Z-pattern scan
5. Has a clean responsive collapse path
6. Matches every comparable productivity platform
7. Within the right cluster, position B (before action icons) gives search the prominence it deserves and the horizontal room it needs at desktop

This rationale should travel with the Search component spec when it ships, and should inform any future placement decisions for related TopNav elements (e.g., command palette trigger, AI assistant).
