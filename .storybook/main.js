import remarkGfm from "remark-gfm";

/** @type {import('@storybook/react-webpack5').StorybookConfig} */
const config = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-webpack5-compiler-babel",
    {
      // remark-gfm enables GitHub-flavoured markdown in MDX — notably tables.
      // Without it, every `| … |` table renders as raw pipes (Welcome,
      // Iconography, Scrollbar docs).
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  // Serve the components/ tree at /components/* so stories can iframe each
  // component's standalone HTML demo (e.g. /components/sidenav/sidenav.html).
  // Do not mount the repo root — storybook-static/ is a subfolder of it and
  // copying a folder into itself fails with EINVAL.
  staticDirs: [{ from: "../components", to: "/components" }],
  docs: {},
};

export default config;
