import StyleDictionary from "style-dictionary";

// ─── number/px transform ───────────────────────────────────────────────────────
// Figma's variable export marks spacing, sizing, font-size, line-height, and
// letter-spacing tokens with $type: "number" rather than "dimension". Style
// Dictionary's built-in size/rem (and the removed size/px) only fire on
// "dimension"-typed tokens, so these come out as bare integers in tokens.css.
//
// Bare integers are invalid for most CSS length properties (e.g. padding:12 is
// ignored; font-size:16 is ignored → falls back to browser default). The one
// dangerous case is line-height: a unitless number IS valid CSS — it means
// "N × the element's font-size" — so line-height:22 at 13px = 286px tall.
//
// This transform adds "px" to every numeric-valued "number"-type token EXCEPT
// font-weight tokens (CSS font-weight accepts 100–900 without a unit).
StyleDictionary.registerTransform({
  name: "number/px",
  type: "value",
  filter: (token) => {
    const type = token.$type ?? token.type;
    if (type !== "number") return false;
    const value = token.$value ?? token.value;
    if (typeof value !== "number") return false;
    // Font-weight is intentionally unitless in CSS (300, 400, 500 …)
    const pathStr = token.path.join("/");
    if (pathStr.includes("weight") || pathStr.includes("fontweight")) return false;
    return true;
  },
  transform: (token) => {
    const value = token.$value ?? token.value;
    return `${value}px`;
  },
});

// Extend the built-in CSS transform group with our number/px pass.
StyleDictionary.registerTransformGroup({
  name: "css-with-px",
  transforms: [
    "attribute/cti",
    "name/kebab",
    "time/seconds",
    "html/icon",
    "size/rem",
    "color/css",
    "asset/url",
    "fontFamily/css",
    "cubicBezier/css",
    "strokeStyle/css/shorthand",
    "border/css/shorthand",
    "typography/css/shorthand",
    "transition/css/shorthand",
    "shadow/css/shorthand",
    "number/px", // ← append px to all numeric dimension/size/spacing tokens
  ],
});

// Register a custom format for ES module export
StyleDictionary.registerFormat({
  name: "javascript/esm",
  format: ({ dictionary }) => {
    const tokens = {};
    dictionary.allTokens.forEach((token) => {
      const cssName = token.path.join("-");
      tokens[cssName] = {
        value: token.$value ?? token.value,
        type: token.$type ?? token.type ?? "unknown",
        path: token.path,
      };
    });
    return `const tokens = ${JSON.stringify(tokens, null, 2)};\n\nexport default tokens;\n`;
  },
});

const config = {
  source: ["tokens/pathway-design-tokens.json", "tokens/motion-tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "css-with-px",
      buildPath: "src/tokens/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "src/tokens/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/esm",
          options: {
            outputReferences: false,
          },
        },
      ],
    },
  },
};

const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();
console.log("Style Dictionary build complete.");
