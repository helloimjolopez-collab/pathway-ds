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
    // then humans drop into Tokens → Components naturally.
    options: {
      storySort: {
        order: [
          "🤖 For AI Agents",
          "Tokens", ["Primitives", "Semantics"],
          "Components",
          "Library",
          "*",
        ],
      },
    },
  },
};

export default preview;
