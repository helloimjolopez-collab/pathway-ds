import { copyFileSync, mkdirSync, rmSync } from "fs";

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
// Layout and spacing, modeless with the breakpoint in a media query. Added
// 2026-09-03 when Semantic: Layout & Units gained breakpoint modes.
copyFileSync("src/tokens/layout.css", "dist/layout.css");
copyFileSync("src/tokens/layout-contextual.css", "dist/layout-contextual.css");
mkdirSync("dist/themes", { recursive: true });
copyFileSync("src/tokens/themes/light.css", "dist/themes/light.css");
copyFileSync("src/tokens/themes/midnight.css", "dist/themes/midnight.css");
copyFileSync("src/tokens/tokens.js", "dist/tokens.js");
copyFileSync("tokens/pathway-design-tokens.json", "dist/tokens.json");
console.log("dist/ built: themes/light.css, themes/midnight.css, layout.css, layout-contextual.css, type.css, motion.css, breakpoints.css, primitives.css, tokens.js, tokens.json");
