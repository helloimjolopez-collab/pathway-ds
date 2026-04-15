/** @type {import('@storybook/html-webpack5').StorybookConfig} */
const config = {
  stories: ["../src/stories/**/*.mdx", "../src/stories/**/*.stories.@(js|ts)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/html-webpack5",
    options: {},
  },
  // Serve the repo root at /demos/* so stories can iframe the component HTML
  // demos (e.g. /demos/components/sidenav/sidenav.html) without duplicating the
  // React/Babel setup inside Storybook.
  staticDirs: [{ from: "../", to: "/demos" }],
  docs: {},
};

export default config;
