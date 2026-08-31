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

// Register a custom format for ES module export.
// NOTE: the name must NOT be "javascript/esm" — Style Dictionary v4 ships a
// built-in format of that name that emits the full NESTED token tree, which
// silently shadows this custom format and breaks every consumer that expects
// the flat { name: { value, type, path } } shape (resolve-tokens, all token
// stories). Keep this name unique. See CLAUDE.md §13.
StyleDictionary.registerFormat({
  name: "pathway/js-flat",
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

// ─── composite type → CSS classes ─────────────────────────────────────────────
// Semantic type tokens arrive from Figma as five separate variables per style
// (FontFamily, FontSize, FontWeight, LineHeight, LetterSpacing), and the Figma
// export nests the responsive mode as a path segment. Emitted through
// css/variables that becomes ten custom properties per style — five for
// desktop, five for mobile — which is ~1,110 properties for 111 real styles.
//
// A designer applies ONE text style. This format makes a developer apply one
// class. Mobile only emits the properties whose value actually differs from
// desktop (about 55 of 111 styles differ at all), so the media query stays thin.
//
// NOTE: this does NOT remove the existing custom properties — tokens.css is
// unchanged. This is an additive second output so nothing downstream breaks.
StyleDictionary.registerFormat({
  name: "pathway/type-classes",
  format: ({ dictionary }) => {
    const PREFIX = "pw-type";
    // Figma property key → CSS declaration
    const PROP = {
      fontfamily: "font-family",
      fontsize: "font-size",
      fontweight: "font-weight",
      lineheight: "line-height",
      letterspacing: "letter-spacing",
      textdecoration: "text-decoration",
      fontstyle: "font-style",
    };
    // CSS declaration order, so output is stable and diffable
    const ORDER = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "font-style", "text-decoration"];

    // Figma stores letter-spacing and line-height as 32-bit floats, so values
    // arrive as e.g. "0.30000001192092896px". Round to 4dp and drop trailing
    // zeros. Never round font-weight (unitless, always an integer already).
    const tidyNumber = (v) => {
      const m = String(v).match(/^(-?\d*\.?\d+)(px|rem|em|%)?$/);
      if (!m) return v;
      const n = Math.round(parseFloat(m[1]) * 1e4) / 1e4;
      return `${n}${m[2] ?? ""}`;
    };

    // A bare multi-word family name is fragile CSS and has no fallback. Route
    // every family through one custom property so changing the Figma primitive
    // still cascades, and give it a real fallback stack.
    const FAMILY_VAR = "--pw-font-family-brand";
    let familyValue = null;

    const tidy = (cssProp, v) => {
      if (cssProp === "font-family") {
        const raw = String(v).replace(/^["']|["']$/g, "");
        familyValue ??= /[\s]/.test(raw) ? `"${raw}", sans-serif` : `${raw}, sans-serif`;
        return `var(${FAMILY_VAR})`;
      }
      if (cssProp === "font-weight") return v;
      return tidyNumber(v);
    };

    // styleKey → mode → { cssProp: value }
    const styles = {};
    const unknownProps = new Set();

    for (const t of dictionary.allTokens) {
      const p = t.path.map((s) => String(s).toLowerCase());
      if (p[0] !== "semantic-type") continue;
      if (p.length < 4) continue;
      const mode = p[1];
      const cssProp = PROP[p[p.length - 1]];
      if (!cssProp) { unknownProps.add(p[p.length - 1]); continue; }
      const styleKey = p.slice(2, -1).join("-");
      styles[styleKey] ??= {};
      styles[styleKey][mode] ??= {};
      styles[styleKey][mode][cssProp] = t.$value ?? t.value;
    }

    const keys = Object.keys(styles).sort();
    const base = [];
    const mobile = [];

    for (const key of keys) {
      const modes = styles[key];
      // Desktop is the base layer; fall back to whatever single mode exists.
      const desktop = modes.desktop ?? modes[Object.keys(modes)[0]] ?? {};
      const mob = modes.mobile ?? null;

      const decls = ORDER.filter((d) => desktop[d] !== undefined)
        .map((d) => `  ${d}: ${tidy(d, desktop[d])};`);
      if (decls.length) base.push(`.${PREFIX}-${key} {\n${decls.join("\n")}\n}`);

      if (mob) {
        // Compare tidied values, so float noise alone never creates an override
        const diff = ORDER.filter(
          (d) => mob[d] !== undefined && tidy(d, mob[d]) !== tidy(d, desktop[d])
        ).map((d) => `    ${d}: ${tidy(d, mob[d])};`);
        if (diff.length) mobile.push(`  .${PREFIX}-${key} {\n${diff.join("\n")}\n  }`);
      }
    }

    const warn = unknownProps.size
      ? `/* unmapped type properties (ignored): ${[...unknownProps].join(", ")} */\n\n`
      : "";

    const familyBlock = familyValue
      ? `:root {\n  ${FAMILY_VAR}: ${familyValue};\n}\n\n`
      : "";

    return (
      `/**\n * Pathway type classes — generated by style-dictionary.config.js\n` +
      ` * ${keys.length} styles. Do not hand-edit.\n */\n\n` +
      warn +
      familyBlock +
      base.join("\n\n") +
      (mobile.length
        ? `\n\n@media (max-width: 767px) {\n${mobile.join("\n\n")}\n}\n`
        : "\n")
    );
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
        {
          destination: "type-classes.css",
          format: "pathway/type-classes",
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "src/tokens/",
      files: [
        {
          destination: "tokens.js",
          format: "pathway/js-flat",
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
