# Skill update: pathway-component-studio
## Non-negotiable execution rules to add

Add this section to `SKILL.md` immediately after `## Working principles` and before `## The 7 phases`.

Also apply the two targeted edits that follow (Phase 4 iteration paragraph and failure modes table).

---

## Non-negotiable execution rules

These four rules are absolute constraints that apply across every phase. They cannot be traded off for speed. Violating any one of them invalidates the entire output regardless of how good the rest of the work is.

---

### Rule 1: Figma MCP first -- stop if it fails, never approximate

Before writing a single line of a demo, spec, or component file, you must successfully call `get_design_context` (and `get_variable_defs` and `get_screenshot`) on the relevant Figma node. If any of those calls fail:

1. Stop immediately. Do not build from memory, inference, or a prior summary of the design.
2. Tell the user exactly which call failed and show the error message verbatim.
3. Ask the user to fix the root cause: Figma desktop open, logged in, MCP connected, correct node ID.
4. Do not proceed until you have a live, successful Figma MCP response in hand.

**Why this matters:** a component built from an approximation of the design looks plausible but is wrong. It will be used, duplicated into products, and break things. A gap is visible and fixable. A fabrication is invisible until production. There is no acceptable excuse for building without Figma data when a Figma MCP is available.

**Never fall through to "I'll use what I know from context."** Context summaries, prior screenshots, and metadata parses are not a substitute for a live `get_design_context` call. If the MCP is broken, say so and wait.

---

### Rule 2: Always link the real token file -- never inline approximated values

Every HTML demo must load the Pathway token file via a relative `<link>` tag:

```html
<link rel="stylesheet" href="../../src/tokens/tokens.css">
```

Adjust the path depth to wherever the demo file actually lives. Never copy-paste token resolved values into a `<style>` block. Never write `color: #0a1223` when a semantic token exists. Never approximate what a token resolves to and inline it.

If the tokens file does not yet exist or has not been synced, say so and run `pathway:tokens-sync` first. Do not proceed with fake tokens.

**Why this matters:** inlined values go stale the moment the token file changes. A demo that links the real file stays correct automatically and can be verified against the spec's token table. A demo with hardcoded approximations lies silently and costs time to debug.

---

### Rule 3: Demos are shown in Claude Preview -- never ask the user to open anything manually

Every HTML demo is shown to the user as a live rendered screenshot inside the conversation. You never ask the user to open a file path, navigate to localhost, or look at anything in a separate browser window.

The preview flow is:

1. Write the file to `components-sandbox/<name>/<name>-<date>-v<N>.html`.
2. Start the `pathway-sandbox` server via `mcp__Claude_Preview__preview_start` using the server named `pathway-sandbox` in `.claude/launch.json` (serves the repo root on port 4321). If the config is missing, create it before proceeding.
3. Navigate to the file via `mcp__Claude_Preview__preview_eval` with `window.location.href = 'http://localhost:4321/components-sandbox/<name>/...'`.
4. Take a screenshot at desktop width (1440px) via `mcp__Claude_Preview__preview_resize` then `mcp__Claude_Preview__preview_screenshot`, and show it in the conversation.
5. Take a second screenshot at mobile width (375px) and show it.
6. Test every interactive state by firing full pointer event sequences via `mcp__Claude_Preview__preview_eval` and screenshot each result.
7. Only after all states are verified do you tell the user the demo is ready.

**Why this matters:** the user should never have to leave the conversation to see what you built. Asking them to "open localhost:4321" means they have to context-switch, find a terminal, navigate a path, and come back -- that is friction the preview tools exist to eliminate. The preview is not optional or "nice to have." It is the output.

---

### Rule 4: Use existing repo components -- never reinvent what already exists

Before writing any sub-component from scratch, check `components/manifest.json`. If a sub-component already exists in the repo:

- In a `.jsx` demo or production file: import it directly by path.
- In a standalone `.html` demo: copy the component's actual CSS token references and markup structure from the existing source file verbatim. Do not paraphrase or approximate it.

If the existing component is a PLACEHOLDER (spec status not REVIEWED), note that gap in the spec's §15 Gaps section but still use it. Do not duplicate it.

**Why this matters:** inventing a custom version of a component that already exists in the repo produces two divergent implementations. Future consumers cannot tell which one is canonical. Every invented sub-component is a maintenance liability.

---

## Targeted edits

### Edit 1: Phase 4 iteration paragraph

Replace:

> Build a first version, write it to the repo so the user can open it in the browser. Ask for feedback. Iterate based on what the user sees. Track versions: v1, v2, v3. Write a one-line note per version describing what changed.

With:

> Build a first version, write it to the repo, then immediately show it to the user as a live rendered screenshot via `mcp__Claude_Preview__preview_screenshot` (see Non-negotiable Rule 3 for the exact preview flow). Never ask the user to open anything manually. Show desktop and mobile widths. Screenshot every interactive state. Ask for feedback. Iterate based on what the user sees in the conversation. Track versions: v1, v2, v3. Write a one-line note per version describing what changed.

---

### Edit 2: Failure modes table -- add these four rows before the existing Figma MCP row

| Situation | What Studio does |
|---|---|
| Figma MCP call fails or returns no data | Stops immediately. Shows the exact error verbatim. Does NOT build from approximation, context, or prior summaries. Waits for a live MCP response before writing anything. (Non-negotiable Rule 1.) |
| Demo built with inlined token values instead of linking `src/tokens/tokens.css` | Treat as a broken demo. Rewrite it with the real token file linked before showing it to the user. No exceptions. (Non-negotiable Rule 2.) |
| User is asked to open localhost or a file path | This is always wrong. The demo must be rendered in Claude Preview and shown as a screenshot in the conversation. Fix the preview flow; never ask the user to navigate manually. (Non-negotiable Rule 3.) |
| Sub-component already exists in `components/manifest.json` but a new version was written from scratch | Treat as a duplicate. Delete the invented version. Wire up the existing component. (Non-negotiable Rule 4.) |
