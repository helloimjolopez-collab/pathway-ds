import "../src/tokens/primitives.css";
import "../src/tokens/themes/light.css";
import "../src/tokens/themes/midnight.css";
import "../src/tokens/layout.css";
import "../src/tokens/layout-contextual.css";
import "../src/tokens/type-classes.css";
import "../src/tokens/motion.css";
import "../src/tokens/breakpoints.css";
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
