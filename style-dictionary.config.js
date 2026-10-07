import StyleDictionary from "style-dictionary";

// ─── number/px transform ───────────────────────────────────────────────────────
// Figma's variable export marks spacing, sizing, font-size, line-height, and
// letter-spacing tokens with $type: "number" rather than "dimension". Style
// Dictionary's built-in size/rem (and the removed size/px) only fire on
// "dimension"-typed tokens, so these come out as bare integers in tokens.css.
//
// Bare integers are invalid for most CSS length properties (e.g. padding:12 is
// ignored; font-size:16 is ignored → falls back to browser default). The one
// dangerous case is line-height: a unitless number IS valid CSS: it means
// "N × the element's font-size": so line-height:22 at 13px = 286px tall.
//
// This transform adds "px" to every numeric-valued "number"-type token EXCEPT
// font-weight tokens (CSS font-weight accepts 100 to 900 without a unit).
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
// NOTE: the name must NOT be "javascript/esm", Style Dictionary v4 ships a
// built-in format of that name that emits the full NESTED token tree, which
// silently shadows this custom format and breaks every consumer that expects
// the flat { name: { value, type, path } } shape (resolve-tokens, all token
// stories). Keep this name unique. See CLAUDE.md §13.
StyleDictionary.registerFormat({
  name: "pathway/js-flat",
  format: ({ dictionary }) => {
    const tokens = {};
    dictionary.allTokens.forEach((token) => {
      // The key MUST have the mode stripped, and this format has to do it
      // itself: it builds the key from token.path directly, so the
      // name/pathway-modeless transform never touches it. When Primitive: Color
      // and Contextual: Layout & Units gained Pathway/NewCo modes on
      // 2026-09-29 this silently started emitting
      // "contextual-layout-units-pathway-topnav-height", so every story and
      // every resolve-tokens lookup asking for the modeless key got undefined
      //: and it ALSO compiled the NewCo names into the public Storybook
      // bundle, which is what made the leak visible at all.
      //
      // Strip the BRAND only, and keep every other mode. A blanket
      // MODE_SEGMENTS filter here is wrong: it collapses amplify-light onto
      // amplify-dark (one key, whichever emitted last wins, so every semantic
      // colour silently reported its dark value) and collapses the three
      // Responsive: Layout breakpoints onto each other the same way. So:
      //   pathway | newco              -> dropped
      //   amplify-light | newco-light  -> light      (theme kept, brand removed)
      //   amplify-dark  | newco-dark   -> dark
      //   desktop-1440pt | tablet-798pt | mobile-393pt -> kept verbatim
      // Because the brand is gone from the key, Pathway and NewCo collide, so
      // the two MUST be emitted as separate files. See the js platform below.
      const cssName = token.path
        .map((s) => {
          const seg = String(s).toLowerCase();
          const themed = seg.match(/^(?:amplify|pathway|newco)-(light|dark)$/);
          return themed ? themed[1] : s;
        })
        .filter((s) => !/^(?:amplify|pathway|newco)$/i.test(String(s)))
        .join("-");
      tokens[cssName] = {
        value: token.$value ?? token.value,
        type: token.$type ?? token.type ?? "unknown",
        // The full path is kept, mode included, so a consumer that needs to
        // know which brand or theme a value came from still can.
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
// css/variables that becomes ten custom properties per style, five for
// desktop, five for mobile: which is ~1,110 properties for 111 real styles.
//
// A designer applies ONE text style. This format makes a developer apply one
// class. Mobile only emits the properties whose value actually differs from
// desktop (about 55 of 111 styles differ at all), so the media query stays thin.
//
// NOTE: this does NOT remove the existing custom properties, tokens.css is
// unchanged. This is an additive second output so nothing downstream breaks.
// The pathway/type-classes format was removed on 2026-09-03. It emitted 111
// .pw-type-* classes composed from the 554 composite type variables. Both the
// classes and those variables are gone: type is now a 41-variable SCALE, and the
// composite text styles live only as Figma text styles. Do not reinstate the
// classes without reinstating the composites, and do not reinstate either without
// asking: this was a deliberate architecture change.

// ─── mode as selector, not as a name segment ──────────────────────────────────
// The Figma export nests each mode as a path segment, so name/kebab folds it
// into the property name: --semantic-color-light-mode-fill-action-primary-base.
// That doubles every semantic colour token into two unrelated names and makes
// real theme switching impossible: a consumer has to pick a mode by name at
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
// 2026-09-28: colour gained a BRAND axis on top of the theme axis. Semantic: Color
// now carries four modes (pathway-light, pathway-dark, newco-light, newco-dark) and
// Primitive: Color and Contextual: Layout & Units each carry two (pathway, newco).
// All of those slugs have to be stripped here or every property name doubles again,
// which is the exact regression this regex exists to prevent. Elevation's light/dark
// are stripped for the same reason and fold into the theme files below.
const MODE_SEGMENTS = /^(light-mode|dark-mode|midnight-mode|amplify-light|amplify-dark|pathway-light|pathway-dark|newco-light|newco-dark|amplify|pathway|newco|light|dark|desktop-1440pt|tablet-798pt|mobile-393pt|desktop|mobile)$/i;

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

    // A brand-scoped file needs its own selector instead of :root, so the NewCo
    // contextual overrides land under [data-brand="newco"] rather than replacing
    // Pathway's at the document root.
    const root = options.selector ?? ":root";
    const out = [
      `/**`,
      ` * ${collection}: one name per token, breakpoint resolved by media query.`,
      ` * Generated by style-dictionary.config.js. Do not edit.`,
      ` *`,
      ` * ${root} is the desktop value. Narrower breakpoints override only what differs.`,
      ` */`,
      `${root} {`,
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
      out.push(``, `@media ${query} {`, `  ${root} {`, decl(diff).replace(/^ {2}/gm, "    "), `  }`, `}`);
    }
    return out.join("\n") + "\n";
  },
});

StyleDictionary.registerTransform({
  name: "name/pathway-modeless",
  type: "name",
  // ANCHORED TO INDEX 1. sync-tokens emits <collection>.<mode>.<rest>, so the
  // mode is always the second segment and nowhere else. Filtering EVERY segment
  // that looks like a mode also ate real rung names: `Scrim/Light` became
  // --semantic-color-scrim, so scrollbar and SideNav referenced a property that
  // was never emitted, and an unresolved var() paints nothing with no error.
  // Single-mode collections omit the mode entirely, and their index 1 is a real
  // name that does not match MODE_SEGMENTS, so anchoring is safe for them too.
  transform: (token) =>
    token.path
      .filter((s, i) => !(i === 1 && MODE_SEGMENTS.test(String(s))))
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

// A token belonging to the NewCo brand, on either axis: the brand mode on
// Primitive: Color and Contextual: Layout & Units is "newco", and on
// Semantic: Color it is "newco-light" / "newco-dark". Anchored so it cannot
// match "pathway-light", which is the mistake the theme filters were written to
// avoid. Used to keep NewCo out of every public-facing output.
const isNewCoToken = (t) => /^newco(-light|-dark)?$/.test(String(t.path[1]).toLowerCase());

// Anything under Deprecated/ in the Figma panel is excluded from every emitted
// file. The variables still EXIST in Figma on purpose: they were renamed rather
// than deleted so that any node still bound to one keeps rendering, because
// three separate binding scans of that file disagreed and deleting would have
// been betting on the unreliable one. Excluding them here means the shipped
// contract shrinks immediately while the panel stays safe, and the final delete
// becomes a no-op for consumers.
const isDeprecated = (t) => t.path.some((s) => String(s).toLowerCase() === "deprecated");
const inMode = (t, re) => re.test(String(t.path[1]));
const isElevation = (t) => String(t.path[0]).toLowerCase() === "elevation";
// The mode slug for a multi-mode collection, lowercased. Compared with === rather
// than a regex so "light" can never match "pathway-light".
const themeMode = (t) => String(t.path[1]).toLowerCase();

const config = {
  source: ["tokens/pathway-design-tokens.json", "tokens/motion-tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      // MUST be the modeless group. Primitive: Color gained Pathway/NewCo modes
      // on 2026-09-29, and with "name/kebab" the brand landed in the property
      // name: primitives.css defined --primitive-color-PATHWAY-brand-75-16 while
      // themes/light.css still referenced --primitive-color-brand-75-16. Every
      // semantic colour then resolved to nothing, the build stayed green and no
      // console error fired, because an unresolved var() simply paints nothing.
      // It also made primitives-newco.css inert: it emitted
      // --primitive-color-NEWCO-* under [data-brand="newco"], which can never
      // override a differently-named property, so the brand switch was a no-op.
      // Motion and Breakpoints are single-mode, so stripping changes nothing there.
      transformGroup: "css-modeless",
      buildPath: "src/tokens/",
      files: [
        // tokens.css is GONE (retired 2026-09-03). It emitted every variable
        // times every mode with the mode baked into the name, 2,338 custom
        // properties: and it was the file every demo, Storybook and the package
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
          // Primitives on their own. NOT "private" in the sense of removed, // every semantic token resolves THROUGH these at runtime, so this file
          // must still be loaded or all 452 colours break. Private means: not
          // documented for consumers, not in the typed union, and flagged by
          // lint if referenced directly from product code (CLAUDE.md §6).
          // Pathway's primitives. Primitive: Type and Primitive: Unit carry no mode
          // so they have no mode segment; Primitive: Color carries amplify|newco, and
          // only the pathway half belongs at :root.
          destination: "primitives.css",
          format: "css/variables",
          filter: (t) =>
            String(t.path[0]).toLowerCase().startsWith("primitive") &&
            String(t.path[1]).toLowerCase() !== "newco",
          options: { outputReferences: false },
        },
        {
          // NewCo's primitives, same names, scoped to the brand. Because the theme
          // files reference primitives by name with outputReferences, re-scoping the
          // primitive values here is what makes the brand switch work at runtime:
          // one semantic name resolves to a different colour under [data-brand].
          destination: "primitives-newco.css",
          format: "css/variables",
          filter: (t) =>
            String(t.path[0]).toLowerCase() === "primitive-color" &&
            String(t.path[1]).toLowerCase() === "newco",
          options: { selector: '[data-brand="newco"]', outputReferences: false },
        },
      ],
    },
    // Theme files: one name per token, resolved by selector.
    // Additive, tokens.css still carries the old mode-in-name properties, so
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
        // Two axes now: brand (amplify|newco) and theme (light|dark). The mode
        // filters MUST be anchored. The old /light/i matched amplify-light AND
        // newco-light, which would have collapsed both brands onto one name with
        // whichever file emitted last silently winning.
        {
          destination: "themes/light.css",
          format: "css/variables",
          filter: (t) =>
            !isDeprecated(t) &&
            ((isSemanticColor(t) && themeMode(t) === "amplify-light") ||
              (isElevation(t) && themeMode(t) === "light")),
          // ":root" alone only matches <html>, which makes region theming one-way:
          // you could scope a dark island inside a light page, but not a light
          // island inside that dark island. top-nav is exactly that case: a dark
          // bar with white dropdown panels: so light must be addressable by
          // selector too, or the panels inherit dark.
          options: { selector: ':root, [data-theme="light"]', outputReferences: true },
        },
        {
          // The Figma mode is called "Amplify Dark" (renamed from "Pathway Dark"
          // on 2026-09-30: Pathway is the design system, Amplify and NewCo are its
          // brand themes, so a mode names the brand). This file keeps the
          // midnight.css name: it is referenced by 20+ files, .storybook/preview.js
          // and the package exports, so renaming it is a breaking change for
          // consumers and is not worth doing silently. Both selectors are emitted.
          destination: "themes/midnight.css",
          format: "css/variables",
          filter: (t) =>
            !isDeprecated(t) &&
            ((isSemanticColor(t) && themeMode(t) === "amplify-dark") ||
              (isElevation(t) && themeMode(t) === "dark")),
          options: {
            selector: '[data-theme="dark"], [data-theme="midnight"]',
            outputReferences: true,
          },
        },
        {
          // NewCo's semantic layer differs from Pathway's by ALIAS TARGET, not just
          // by primitive value, so re-scoping primitives alone cannot express it.
          // That is why NewCo needs its own theme files rather than riding on
          // primitives-newco.css. Brand with no theme attribute means NewCo light.
          destination: "themes/newco-light.css",
          format: "css/variables",
          filter: (t) => isSemanticColor(t) && !isDeprecated(t) && themeMode(t) === "newco-light",
          options: {
            selector: '[data-brand="newco"], [data-brand="newco"][data-theme="light"]',
            outputReferences: true,
          },
        },
        {
          destination: "themes/newco-dark.css",
          format: "css/variables",
          filter: (t) => isSemanticColor(t) && !isDeprecated(t) && themeMode(t) === "newco-dark",
          options: {
            selector:
              '[data-brand="newco"][data-theme="dark"], [data-brand="newco"][data-theme="midnight"]',
            outputReferences: true,
          },
        },
      ],
    },
    // Layout and spacing, modeless, breakpoint resolved by media query. Same
    // reasoning as cssThemes above: the mode belongs in a selector, never in the
    // property name. Contextual layout gets its own file because it is component
    // internals: a product dev never references it, but the components in this
    // repo do, and designers need it in Figma (which is why it is published).
    //
    // EXPECTED WARNING: "token collisions were found" on both files. That IS the
    // point: three breakpoint modes collapse onto one property name, and the
    // format below picks the desktop value for :root and emits the narrower modes
    // as media-query overrides. Do not "fix" this by putting the mode back in the
    // name; that is the regression this format exists to undo.
    cssLayout: {
      transformGroup: "css-modeless",
      buildPath: "src/tokens/",
      files: [
        {
          // Single mode as of 2026-09-14: not one of these 39 tokens differed by
          // breakpoint, so the Desktop/Tablet/Mobile axis was 117 cells carrying
          // 39 values. singleMode skips the media-query machinery entirely.
          destination: "layout.css",
          format: "pathway/layout-responsive",
          filter: (t) => String(t.path[0]).toLowerCase() === "semantic-layout-units",
          options: { collection: "semantic-layout-units", media: [], singleMode: true },
        },
        {
          // Also single mode now. The three sheet-padding tokens that DID vary
          // moved to Responsive: Sheet below, which is the only collection that
          // still earns a breakpoint axis.
          // Contextual gained pathway|newco modes on 2026-09-28, because Pathway keeps
          // a heavier Button/BorderWidth/Selected than NewCo. Only two tokens actually
          // differ, but the mode has to be filtered or both brands collide on one name.
          destination: "layout-contextual.css",
          format: "pathway/layout-responsive",
          filter: (t) =>
            String(t.path[0]).toLowerCase() === "contextual-layout-units" &&
            String(t.path[1]).toLowerCase() !== "newco",
          options: { collection: "contextual-layout-units", media: [], singleMode: true },
        },
        {
          destination: "layout-contextual-newco.css",
          format: "pathway/layout-responsive",
          filter: (t) =>
            String(t.path[0]).toLowerCase() === "contextual-layout-units" &&
            String(t.path[1]).toLowerCase() === "newco",
          options: {
            collection: "contextual-layout-units",
            media: [],
            singleMode: true,
            selector: '[data-brand="newco"]',
          },
        },
        {
          // The only genuinely responsive layout tokens in the system: sheet
          // padding, which really does tighten on smaller screens. Keeping them
          // in their own collection is what let the other 66 drop the axis.
          destination: "layout-responsive.css",
          format: "pathway/layout-responsive",
          filter: (t) => String(t.path[0]).toLowerCase() === "responsive-layout",
          options: { collection: "responsive-layout" },
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
          // Pathway ONLY. Storybook imports this file through
          // src/stories/components/*, and Storybook deploys to public GitHub
          // Pages, so anything in here is published and indexable. Before the
          // filter existed the bundle shipped every
          // contextual-layout-units-newco-* and semantic-color-newco-*-* name.
          destination: "tokens.js",
          format: "pathway/js-flat",
          filter: (t) => !isNewCoToken(t),
          options: { outputReferences: false },
        },
        {
          // NewCo, same modeless keys, separate file. Copied to
          // dist/brands/newco/tokens.js by build-dist.js and exported from the
          // package. Must never be imported by .storybook/preview.js, a story
          // or an MDX page.
          destination: "tokens-newco.js",
          format: "pathway/js-flat",
          filter: isNewCoToken,
          options: { outputReferences: false },
        },
      ],
    },
  },
};

const sd = new StyleDictionary(config);
await sd.buildAllPlatforms();
console.log("Style Dictionary build complete.");
