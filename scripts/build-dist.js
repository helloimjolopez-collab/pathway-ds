import { copyFileSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";

// Wipe dist/ first. This build used to be purely additive, which meant a file that
// stopped being emitted stayed behind and kept shipping: after tokens.css was
// retired, a stale 225kB dist/tokens.css was still in `npm pack`, so consumers
// would have received the very file the retirement was meant to remove.
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
copyFileSync("src/tokens/primitives.css", "dist/primitives.css");
copyFileSync("src/tokens/type.css", "dist/type.css");
copyFileSync("src/tokens/motion.css", "dist/motion.css");
copyFileSync("src/tokens/breakpoints.css", "dist/breakpoints.css");
// The only layout file with real media queries: sheet and TopNav padding are
// the only tokens in the system that change by breakpoint.
copyFileSync("src/tokens/layout-responsive.css", "dist/layout-responsive.css");
// Layout and spacing, modeless with the breakpoint in a media query. Added
// 2026-09-03 when Semantic: Layout & Units gained breakpoint modes.
copyFileSync("src/tokens/layout.css", "dist/layout.css");
copyFileSync("src/tokens/layout-contextual.css", "dist/layout-contextual.css");
mkdirSync("dist/themes", { recursive: true });
copyFileSync("src/tokens/themes/light.css", "dist/themes/light.css");
copyFileSync("src/tokens/themes/midnight.css", "dist/themes/midnight.css");

// NewCo ships in the PACKAGES ONLY: never in Storybook, never on GitHub Pages,
// never referenced from a story or MDX page, because Pages is public and
// indexable. It lives under brands/ so nothing can pick it up by globbing
// dist/*.css or dist/themes/*.css, which is what the eight-file contract and
// every demo's <link> list do.
//
// The shape mirrors the pathway files: primitives-newco.css redefines the SAME
// property names under [data-brand="newco"], so a consumer loads the pathway
// contract and then layers the brand on. That only works because both files
// emit modeless names; see the css platform note in style-dictionary.config.js
// for the day it did not.
mkdirSync("dist/brands/newco/themes", { recursive: true });
copyFileSync("src/tokens/primitives-newco.css", "dist/brands/newco/primitives.css");
copyFileSync("src/tokens/layout-contextual-newco.css", "dist/brands/newco/layout-contextual.css");
copyFileSync("src/tokens/themes/newco-light.css", "dist/brands/newco/themes/light.css");
copyFileSync("src/tokens/themes/newco-dark.css", "dist/brands/newco/themes/dark.css");
// The flat JS map, split from tokens.js so the public Storybook bundle cannot
// pick NewCo up. Both files use the same modeless keys, which is exactly why
// they have to be separate files rather than one merged map.
copyFileSync("src/tokens/tokens-newco.js", "dist/brands/newco/tokens.js");

copyFileSync("src/tokens/tokens.js", "dist/tokens.js");
// dist/tokens.json must carry EVERY token, motion included.
//
// pathway-design-tokens.json is generated from the Figma export, and motion is
// the one family whose source of truth is not Figma (it comes from
// docs/design-system-spec.md section 2 via sync-motion-tokens.js). Style
// Dictionary reads both files, which is why motion.css and tokens.js have all
// 17 motion tokens. A straight copy of pathway-design-tokens.json therefore
// shipped a tokens.json with ZERO motion tokens, silently: a consumer taking
// the JSON as their contract got no durations and no easings at all, and
// nothing failed to tell them.
//
// Merge, and fail loudly if motion is missing rather than shipping a partial
// contract again.
{
  const design = JSON.parse(readFileSync("tokens/pathway-design-tokens.json", "utf8"));
  const motion = JSON.parse(readFileSync("tokens/motion-tokens.json", "utf8"));
  const merged = { ...design, ...motion };

  const count = (o) => {
    let n = 0;
    const walk = (x) => {
      for (const v of Object.values(x)) {
        if (v && typeof v === "object") ("$value" in v || "value" in v) ? n++ : walk(v);
      }
    };
    walk(o);
    return n;
  };
  const motionCount = count(motion);
  if (motionCount === 0) {
    console.error("Refusing to write dist/tokens.json: motion-tokens.json is empty.");
    console.error("Run `node scripts/sync-motion-tokens.js` first.");
    process.exit(1);
  }
  writeFileSync("dist/tokens.json", JSON.stringify(merged, null, 2) + "\n");
  console.log(`dist/tokens.json: ${count(design)} design tokens + ${motionCount} motion tokens`);
}
console.log("dist/ built: themes/light.css, themes/midnight.css, layout.css, layout-contextual.css, layout-responsive.css, type.css, motion.css, breakpoints.css, primitives.css, tokens.js, tokens.json");
