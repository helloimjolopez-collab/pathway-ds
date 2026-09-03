import { copyFileSync, mkdirSync } from "fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/tokens/tokens.css", "dist/tokens.css");
copyFileSync("src/tokens/primitives.css", "dist/primitives.css");
copyFileSync("src/tokens/type-classes.css", "dist/type-classes.css");
// Layout and spacing, modeless with the breakpoint in a media query. Added
// 2026-09-03 when Semantic: Layout & Units gained breakpoint modes.
copyFileSync("src/tokens/layout.css", "dist/layout.css");
copyFileSync("src/tokens/layout-contextual.css", "dist/layout-contextual.css");
mkdirSync("dist/themes", { recursive: true });
copyFileSync("src/tokens/themes/light.css", "dist/themes/light.css");
copyFileSync("src/tokens/themes/midnight.css", "dist/themes/midnight.css");
copyFileSync("src/tokens/tokens.js", "dist/tokens.js");
copyFileSync("tokens/pathway-design-tokens.json", "dist/tokens.json");
console.log("dist/ built: tokens.css, primitives.css, type-classes.css, layout.css, layout-contextual.css, themes/light.css, themes/midnight.css, tokens.js, tokens.json");
