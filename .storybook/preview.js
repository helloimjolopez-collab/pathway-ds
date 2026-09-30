// The eight-file contract, in order. primitives.css MUST come first: every
// semantic token resolves through it, and an unresolved var() paints nothing
// with no console error, so omitting it renders Storybook silently unstyled.
import "../src/tokens/primitives.css";
import "../src/tokens/themes/light.css";
import "../src/tokens/themes/midnight.css";
import "../src/tokens/layout.css";
import "../src/tokens/layout-contextual.css";
import "../src/tokens/layout-responsive.css";
import "../src/tokens/type.css";
import "../src/tokens/motion.css";
import "../src/tokens/breakpoints.css";

// NewCo is deliberately absent. `primitives-newco.css`, `themes/newco-light.css`
// and `themes/newco-dark.css` are built and shipped in the npm and NuGet
// packages, but they are NOT imported here and must not be referenced by any
// story or MDX page: Storybook deploys to GitHub Pages, which is public and
// indexable. Adding a NewCo import or a brand toolbar item would publish an
// unannounced brand. Keep the brand axis out of this file.

/**
 * Theme toggle. `themes/midnight.css` matches
 * `[data-theme="midnight"], [data-theme="dark"]`, so flipping the attribute on
 * <html> is the whole mechanism — no per-story wiring, and region theming still
 * composes because a nested [data-theme] wrapper wins over the root.
 */
const THEMES = {
  light: { name: "Light", attr: "light" },
  midnight: { name: "Midnight", attr: "midnight" },
};

/** @type {import('@storybook/react').Preview} */
const preview = {
  globalTypes: {
    theme: {
      description: "Pathway colour theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: Object.entries(THEMES).map(([value, t]) => ({
          value,
          title: t.name,
          icon: value === "light" ? "sun" : "moon",
        })),
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const theme = THEMES[context.globals.theme] ? context.globals.theme : "light";
      const root = document.documentElement;
      root.setAttribute("data-theme", THEMES[theme].attr);
      // The canvas is painted from the token rather than a hard-coded hex so the
      // surrounding chrome tracks the theme the same way a real page would.
      document.body.style.background = "var(--semantic-color-fill-surface-canvas)";
      document.body.style.color = "var(--semantic-color-foreground-static-neutral-base)";
      return Story();
    },
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Backgrounds are driven by the Theme toolbar above, not by the backgrounds
    // addon, so the two cannot disagree about what "dark" means.
    backgrounds: { disable: true },
    // Order the sidebar so the AI-agent intro is the first thing visitors see,
    // then humans drop into Tokens → Library naturally. Every real component
    // lives under "Library" (single canonical group — no split "Components").
    // Within each component, the first story is always "Playground" (the "Try it"
    // section), so it is the first thing shown — per docs/storybook-authoring.md.
    options: {
      storySort: {
        order: [
          "Welcome",
          "Tokens", ["Primitives", "Semantics"],
          "Library",
          "*",
        ],
      },
    },
  },
};

export default preview;
