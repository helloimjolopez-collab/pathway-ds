import StyleDictionary from "style-dictionary";

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
  source: ["tokens/pathway-design-tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "css",
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
