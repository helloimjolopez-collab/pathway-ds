import "../src/tokens/tokens.css";

/** @type {import('@storybook/react').Preview} */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
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
