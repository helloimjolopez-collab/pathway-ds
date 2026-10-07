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
      // remark-gfm enables GitHub-flavoured markdown in MDX, notably tables.
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
  // Do not mount the repo root, storybook-static/ is a subfolder of it and
  // copying a folder into itself fails with EINVAL.
  staticDirs: [{ from: "../components", to: "/components" }],
  docs: {},
  // THE BRAND AXIS IS OPT-IN AT BUILD TIME, and that is a privacy control, not
  // a convenience. Storybook deploys to GitHub Pages, which is public and
  // indexable, so a NewCo toolbar in the published build would announce the
  // brand. The Pages workflow runs a bare `storybook build` and therefore never
  // sets this; the local dev and local-build scripts do. See preview.js.
  // The brand axis is attached here or not at all. Referencing brand-axis.js
  // conditionally means a bare `storybook build` never hands the file to
  // webpack, so the published bundle contains no NewCo values and no NewCo
  // toolbar. Gating inside preview.js does not achieve that: a dynamic import()
  // still emits its chunk. See .storybook/brand-axis.js.
  previewAnnotations: process.env.PATHWAY_BRAND_AXIS ? ["./.storybook/brand-axis.js"] : [],
};

export default config;
