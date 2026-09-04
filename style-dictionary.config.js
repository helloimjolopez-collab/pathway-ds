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
// The pathway/type-classes format was removed on 2026-09-03. It emitted 111
// .pw-type-* classes composed from the 554 composite type variables. Both the
// classes and those variables are gone: type is now a 41-variable SCALE, and the
// composite text styles live only as Figma text styles. Do not reinstate the
// classes without reinstating the composites, and do not reinstate either without
// asking — this was a deliberate architecture change.

// ─── mode as selector, not as a name segment ──────────────────────────────────
// The Figma export nests each mode as a path segment, so name/kebab folds it
// into the property name: --semantic-color-light-mode-fill-action-primary-base.
// That doubles every semantic colour token into two unrelated names and makes
// real theme switching impossible — a consumer has to pick a mode by name at
// author time. `mode` appears in 904 property names today.
//
// This transform drops the mode segment so both modes share ONE name, and the
// per-mode files below scope them with a selector instead.
// Breakpoint modes are stripped for exactly the same reason as colour modes.
// Semantic: Layout & Units gained Desktop/Tablet/Mobile modes on 2026-09-03, which
// put the breakpoint into every property name
// (--semantic-layout-units-desktop-1440pt-padding-base). That breaks every existing
// spacing reference AND makes responsive layout impossible by selector: a consumer
// would have to swap variable NAMES per breakpoint instead of letting the cascade
// resolve one name. The responsive format below scopes them with media queries.
const MODE_SEGMENTS = /^(light-mode|dark-mode|midnight-mode|desktop-1440pt|tablet-798pt|mobile-393pt|desktop|mobile)$/i;

// Which Figma mode maps to which media query. Desktop is the base (:root) because
// it is the widest; narrower breakpoints override it, so the file must emit them in
// this order for the cascade to land correctly.
const BREAKPOINT_MEDIA = [
  { mode: "tablet-798pt", query: "(max-width: 1023px)" },
  { mode: "mobile-393pt", query: "(max-width: 767px)" },
];
// Semantic: Type carries its own two modes, named differently from the layout ones.
const TYPE_MEDIA = [{ mode: "mobile", query: "(max-width: 767px)" }];

/**
 * Emit a modeless responsive stylesheet for a mode-per-breakpoint collection.
 *
 * `:root` carries the desktop value for every token. Each narrower breakpoint then
 * emits ONLY the tokens whose value actually differs from desktop, so the file
 * states the responsive intent instead of restating 39 identical declarations three
 * times. Today only the Page/Padding tokens differ, so the overrides are tiny.
 */
StyleDictionary.registerFormat({
  name: "pathway/layout-responsive",
  format: ({ dictionary, options }) => {
    const collection = options.collection;
    const baseMode = options.baseMode ?? "desktop-1440pt";
    const media = options.media ?? BREAKPOINT_MEDIA;
    // A SINGLE-mode collection has no mode segment in its path at all: sync-tokens
    // only inserts one when modeNames.length > 1. Semantic: Type became single-mode
    // when the Mobile mode was deleted on 2026-09-03, and this format silently
    // emitted an EMPTY file until it stopped looking for a mode level that is not
    // there. singleMode says "there is no mode segment, everything is the base".
    const singleMode = options.singleMode === true;
    const byMode = new Map();
    for (const t of dictionary.allTokens) {
      if (String(t.path[0]).toLowerCase() !== collection) continue;
      const mode = singleMode ? baseMode : String(t.path[1]).toLowerCase();
      if (!byMode.has(mode)) byMode.set(mode, new Map());
      byMode.get(mode).set(t.name, t.value ?? t.$value);
    }
    const desktop = byMode.get(baseMode);
    if (!desktop || !desktop.size) {
      return `/* ${collection}: no "${baseMode}" mode found, nothing emitted */\n`;
    }
    const tidy = (v) => {
      const m = String(v).match(/^(-?\d*\.?\d+)(px|rem|em|%)?$/);
      if (!m) return v;
      return `${Math.round(parseFloat(m[1]) * 1e4) / 1e4}${m[2] ?? ""}`;
    };
    const decl = (map) =>
      [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([n, v]) => `  --${n}: ${tidy(v)};`).join("\n");

    const out = [
      `/**`,
      ` * ${collection} — one name per token, breakpoint resolved by media query.`,
      ` * Generated by style-dictionary.config.js. Do not edit.`,
      ` *`,
      ` * :root is the desktop value. Narrower breakpoints override only what differs.`,
      ` */`,
      `:root {`,
      decl(desktop),
      `}`,
    ];
    for (const { mode, query } of media) {
      const m = byMode.get(mode);
      if (!m) continue;
      const diff = new Map([...m.entries()].filter(([n, v]) => desktop.get(n) !== v));
      if (!diff.size) {
        out.push(``, `/* ${mode}: identical to desktop, nothing to override */`);
        continue;
      }
      out.push(``, `@media ${query} {`, `  :root {`, decl(diff).replace(/^ {2}/gm, "    "), `  }`, `}`);
    }
    return out.join("\n") + "\n";
  },
});

StyleDictionary.registerTransform({
  name: "name/pathway-modeless",
  type: "name",
  transform: (token) =>
    token.path
      .filter((s) => !MODE_SEGMENTS.test(String(s)))
      .join("-")
      .toLowerCase(),
});

// Same as css-with-px, but names have the mode stripped. Kept as a separate
// group so the existing tokens.css output is untouched.
StyleDictionary.registerTransformGroup({
  name: "css-modeless",
  transforms: [
    "attribute/cti",
    "name/pathway-modeless",
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
    "number/px",
  ],
});

const isSemanticColor = (t) => String(t.path[0]).toLowerCase() === "semantic-color";
const inMode = (t, re) => re.test(String(t.path[1]));

const config = {
  source: ["tokens/pathway-design-tokens.json", "tokens/motion-tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "css-with-px",
      buildPath: "src/tokens/",
      files: [
        // tokens.css is GONE (retired 2026-09-03). It emitted every variable
        // times every mode with the mode baked into the name — 2,338 custom
        // properties — and it was the file every demo, Storybook and the package
        // actually loaded, so the restructured 329-name contract was invisible to
        // anyone reading the CSS. The replacement is themes/*.css + layout*.css +
        // type-classes.css + motion.css + breakpoints.css, all modeless.
        // Do not reinstate it: scripts/check-demo-tokens.js deliberately omits it
        // from CSS_SOURCES so a stale legacy name fails instead of silently passing.
        {
          // Motion and breakpoints carry no modes, so their names are already
          // final. They lived only in tokens.css, which is why that file could not
          // be retired: 797 component references would have broken. Emitting them
          // standalone is what makes retiring tokens.css possible.
          destination: "motion.css",
          format: "css/variables",
          filter: (t) => String(t.path[0]).toLowerCase() === "motion",
          options: { outputReferences: false },
        },
        {
          destination: "breakpoints.css",
          format: "css/variables",
          filter: (t) => String(t.path[0]).toLowerCase() === "breakpoints",
          options: { outputReferences: false },
        },
        {
          // Primitives on their own. NOT "private" in the sense of removed —
          // every semantic token resolves THROUGH these at runtime, so this file
          // must still be loaded or all 452 colours break. Private means: not
          // documented for consumers, not in the typed union, and flagged by
          // lint if referenced directly from product code (CLAUDE.md §6).
          destination: "primitives.css",
          format: "css/variables",
          filter: (t) => String(t.path[0]).toLowerCase().startsWith("primitive"),
          options: { outputReferences: false },
        },
      ],
    },
    // Theme files: one name per token, resolved by selector.
    // Additive — tokens.css still carries the old mode-in-name properties, so
    // both name sets are live and nothing downstream breaks yet.
    //
    // THE THEMES REFERENCE PRIMITIVES. Do not inline them.
    //
    // These files are filtered to semantic-color only, so Style Dictionary warns
    // "filtered out token references were found". That warning is expected: the
    // primitives they point at live in primitives.css, which a consumer loads
    // alongside. Every referenced primitive resolves; none are missing.
    //
    // Inlining was tried on 2026-09-03 and reverted at Jo's instruction. It made
    // the colour layer self-contained and dropped 232 names from the payload, but
    // it also destroyed the semantic-to-primitive chain: a developer inspecting an
    // element saw a bare hex instead of var(--primitive-color-brand-400), and a
    // consumer lost the ability to override a primitive at runtime. Marking a
    // variable private in the FIGMA panel only means designers are not offered it
    // when styling; it is not a statement that the value should be absent from the
    // CSS. Those are different layers and inlining conflated them.
    //
    // So primitives.css is REQUIRED, not optional. It must be in every demo's link
    // list, in .storybook/preview.js, and in the package exports.
    cssThemes: {
      transformGroup: "css-modeless",
      buildPath: "src/tokens/",
      files: [
        {
          destination: "themes/light.css",
          format: "css/variables",
          filter: (t) => isSemanticColor(t) && inMode(t, /light/i),
          // ":root" alone only matches <html>, which makes region theming one-way:
          // you could scope a dark island inside a light page, but not a light
          // island inside that dark island. top-nav is exactly that case — a dark
          // bar with white dropdown panels — so light must be addressable by
          // selector too, or the panels inherit midnight.
          options: { selector: ':root, [data-theme="light"]', outputReferences: true },
        },
        {
          // Figma calls this mode "Midnight Mode", so the file is named for it.
          // Both selectors are emitted: "midnight" is the Pathway name, "dark"
          // is what every CSS framework and prefers-color-scheme uses, and a
          // consumer should not have to know our brand vocabulary to theme.
          destination: "themes/midnight.css",
          format: "css/variables",
          filter: (t) => isSemanticColor(t) && inMode(t, /dark|midnight/i),
          options: {
            selector: '[data-theme="midnight"], [data-theme="dark"]',
            outputReferences: true,
          },
        },
      ],
    },
    // Layout and spacing, modeless, breakpoint resolved by media query. Same
    // reasoning as cssThemes above: the mode belongs in a selector, never in the
    // property name. Contextual layout gets its own file because it is component
    // internals — a product dev never references it, but the components in this
    // repo do, and designers need it in Figma (which is why it is published).
    //
    // EXPECTED WARNING: "token collisions were found" on both files. That IS the
    // point — three breakpoint modes collapse onto one property name, and the
    // format below picks the desktop value for :root and emits the narrower modes
    // as media-query overrides. Do not "fix" this by putting the mode back in the
    // name; that is the regression this format exists to undo.
    cssLayout: {
      transformGroup: "css-modeless",
      buildPath: "src/tokens/",
      files: [
        {
          destination: "layout.css",
          format: "pathway/layout-responsive",
          filter: (t) => String(t.path[0]).toLowerCase() === "semantic-layout-units",
          options: { collection: "semantic-layout-units" },
        },
        {
          destination: "layout-contextual.css",
          format: "pathway/layout-responsive",
          filter: (t) => String(t.path[0]).toLowerCase() === "contextual-layout-units",
          options: { collection: "contextual-layout-units" },
        },
        {
          // Type is a SCALE now, not 111 composites. Semantic: Type went from 554
          // variables to 41 on 2026-09-03: one family, 13 sizes, 18 line heights
          // (size x density), 5 weights, 4 tracking steps. The composite text styles
          // live in Figma text styles only, which is where a designer applies them.
          //
          // The pathway/type-classes format that used to emit 111 .pw-type-* classes
          // is GONE, at Jo's instruction. A developer composes from the scale:
          //   font: var(--semantic-type-weight-medium) var(--semantic-type-font-size-s)
          //         / var(--semantic-type-line-height-s-single)
          //         var(--semantic-type-family-brand);
          destination: "type.css",
          format: "pathway/layout-responsive",
          filter: (t) => String(t.path[0]).toLowerCase() === "semantic-type",
          options: { collection: "semantic-type", baseMode: "desktop", media: [], singleMode: true },
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
