import { copyFileSync, mkdirSync } from "fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/tokens/tokens.css", "dist/tokens.css");
copyFileSync("src/tokens/type-classes.css", "dist/type-classes.css");
mkdirSync("dist/themes", { recursive: true });
copyFileSync("src/tokens/themes/light.css", "dist/themes/light.css");
copyFileSync("src/tokens/themes/midnight.css", "dist/themes/midnight.css");
copyFileSync("src/tokens/tokens.js", "dist/tokens.js");
copyFileSync("tokens/pathway-design-tokens.json", "dist/tokens.json");
console.log("dist/ built: tokens.css, type-classes.css, themes/light.css, themes/midnight.css, tokens.js, tokens.json");
