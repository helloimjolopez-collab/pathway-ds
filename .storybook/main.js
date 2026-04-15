/** @type {import('@storybook/html-webpack5').StorybookConfig} */
const config = {
  stories: ["../src/stories/**/*.mdx", "../src/stories/**/*.stories.@(js|ts)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/html-webpack5",
    options: {},
  },
  // Serve the components/ tree at /components/* so stories can iframe each
  // component's standalone HTML demo (e.g. /components/sidenav/sidenav.html)
  // without duplicating the React/Babel setup inside Storybook.
  // Note: do not mount the repo root — Storybook's build output lives in
  // storybook-static/, which is a subfolder of the root, and copying a folder
  // into itself fails with EINVAL.
  staticDirs: [{ from: "../components", to: "/components" }],
  docs: {},
};

export default config;
