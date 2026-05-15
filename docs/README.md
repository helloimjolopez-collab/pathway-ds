# docs/

Cross-component design-system documentation. Everything in this folder applies to the system as a whole, not to any one component. Component-specific specs live in `components/<name>/<name>-spec.md`.

This folder is intentionally empty to start. As the system grows, add markdown files here for:

- **`overview.md`** — what Pathway is, what it covers, what it doesn't, for whom
- **`../tokens/README.md`** — primitives → semantic layers, alias chains, naming rules (already exists)
- **`contributing.md`** — how to add a component, review gates, commit conventions
- **`governance.md`** — ownership model, who decides what, deprecation policy, versioning
- **`accessibility.md`** — baseline AA/AAA expectations, pattern library
- **`motion.md`** — motion principles (once motion tokens exist; see spinner-spec §7.3)
- **`changelog.md`** — release notes (or migrate to GitHub releases)

Any markdown file dropped in here can be surfaced in Storybook by creating an `.mdx` page under `src/stories/Overview/` that imports and renders it.
