/**
 * The NewCo brand axis for Storybook. LOCAL ONLY, BY CONSTRUCTION.
 *
 * This file is not imported by preview.js. It is added as a preview annotation
 * in main.js, and only when PATHWAY_BRAND_AXIS is set, which means webpack never
 * sees it in a bare `storybook build`. That matters more than it looks:
 *
 * The first attempt at this gated the imports at RUNTIME, inside
 * `if (BRAND_AXIS) { import("...newco.css") }` in preview.js. That does not
 * work. A dynamic import() always emits its chunk whether or not the branch is
 * ever reached, so the published bundle still contained
 * `[data-brand="newco"]` and NewCo's own primitive values. Verified by grepping
 * a NewCo-only hex out of the built output. Gating has to happen before the
 * bundler, not inside the bundle.
 *
 * Why it is gated at all: Storybook deploys to GitHub Pages, which is public and
 * indexable, and NewCo is unannounced. `npm run storybook` and
 * `npm run build-storybook:brands` set the flag; `npm run build-storybook`,
 * which is what .github/workflows/deploy-pages.yml runs, does not.
 *
 * If NewCo is ever announced, or the Storybook moves behind access control, the
 * fix is to drop the flag from main.js, not to copy anything out of here.
 */

// Layered ON TOP of the Pathway contract that preview.js loads, never instead of
// it: these redefine the same property names under [data-brand="newco"]. The
// dark file matches [data-theme="dark"] AND [data-theme="midnight"], so the
// existing Theme toolbar keeps working on both brands.
import "../src/tokens/primitives-newco.css";
import "../src/tokens/themes/newco-light.css";
import "../src/tokens/themes/newco-dark.css";
import "../src/tokens/layout-contextual-newco.css";

const BRANDS = {
  pathway: { name: "Pathway", attr: null },
  newco:   { name: "NewCo",   attr: "newco" },
};

export const globalTypes = {
  brand: {
    description: "Brand token layer",
    defaultValue: "pathway",
    toolbar: {
      title: "Brand",
      icon: "paintbrush",
      items: Object.entries(BRANDS).map(([value, b]) => ({ value, title: b.name })),
      dynamicTitle: true,
    },
  },
};

export const decorators = [
  (Story, context) => {
    const brand = BRANDS[context.globals.brand] ? context.globals.brand : "pathway";
    const attr = BRANDS[brand].attr;
    const root = document.documentElement;
    // REMOVED rather than set to "pathway": every NewCo rule is written as
    // [data-brand="newco"], so Pathway is the absence of the attribute, not a
    // value of it.
    if (attr) root.setAttribute("data-brand", attr);
    else root.removeAttribute("data-brand");
    return Story();
  },
];
