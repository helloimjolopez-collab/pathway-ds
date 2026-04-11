/** @type {import('@storybook/html-webpack5').StorybookConfig} */
const config = {
  stories: ["../src/stories/**/*.mdx", "../src/stories/**/*.stories.@(js|ts)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/html-webpack5",
    options: {},
  },
  docs: {},
};

export default config;
