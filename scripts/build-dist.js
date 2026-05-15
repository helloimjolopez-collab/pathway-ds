import { copyFileSync, mkdirSync } from "fs";

mkdirSync("dist", { recursive: true });
copyFileSync("src/tokens/tokens.css", "dist/tokens.css");
copyFileSync("src/tokens/tokens.js", "dist/tokens.js");
copyFileSync("tokens/pathway-design-tokens.json", "dist/tokens.json");
console.log("dist/ built: tokens.css, tokens.js, tokens.json");
