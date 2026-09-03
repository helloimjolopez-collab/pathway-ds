#!/usr/bin/env node

/**
 * check-demo-tokens.js
 *
 * The standalone demos must consume the REAL built token CSS, never a
 * hand-copied subset.
 *
 * They used to inline a copy of the token layer so the file would open with no
 * build step. That copy was a hand-maintained duplicate of generated data and it
 * drifted: 59 declarations across button, spinner and checkbox resolved to a
 * different colour than src/tokens/tokens.css, so three demos were rendering
 * colours that are not in the design system. Nobody noticed because a wrong
 * colour looks like a design decision.
 *
 * Every demo now links ../../src/tokens/tokens.css instead. This script fails
 * the build if that regresses.
 *
 * It enforces four things per demo:
 *   1. a real <link> to the built token CSS exists
 *   2. no --semantic-*, --primitive-* or --motion-* declaration is inlined
 *   3. every var(--semantic|primitive|motion-…) it references actually exists
 *      in tokens.css
 *   4. every t("Some/Token/Name") call resolves to a real token
 *
 * Rule 3 skips names ending in "-", which are the prefixes of runtime-
 * interpolated names such as `var(--semantic-color-light-mode-${p})` in
 * components/button/button.jsx. Those cannot be checked statically.
 *
 * WHY RULE 4 EXISTS
 * `tokens/resolve-tokens.js` returns the token id UNCHANGED when it cannot
 * resolve a name. So `t("Text/Contextual/NavItem/Base")` on a renamed token
 * emits `color: "Text/Contextual/NavItem/Base"` — invalid CSS that the browser
 * silently drops, leaving the element with an inherited colour and no error
 * anywhere. On 2026-09-02 the shipped sidenav had been doing exactly that for
 * nine tokens after the Text/Icon tiers were merged into Foreground, and rules
 * 1 to 3 all passed the whole time because they only look at var() references.
 * A silent wrong colour looks like a design decision, which is why this has to
 * be a build failure rather than a warning.
 *
 * Usage:  node scripts/check-demo-tokens.js
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

/**
 * Tokens that EXIST in the Figma Variables panel but are not yet in the built
 * CSS, because the panel has moved ahead of the last token sync.
 *
 * These are reported as a warning rather than a build failure. That is a
 * deliberate, narrow exception: the alternative is either hand-editing derived
 * CSS (which the next sync wipes) or pinning a component to token names that no
 * longer exist in the design source, which is the exact silent-failure this
 * script was written to catch.
 *
 * THIS LIST MUST BE EMPTIED BY THE NEXT SYNC. If an entry is still here after a
 * sync has run, the token does NOT exist in Figma and the component is wrong.
 *
 * Added 2026-09-03, pending the token sync that follows the semantic-colour
 * restructure. `foreground-action-secondary-*` are real and current.
 * `fill-contextual-navitem-*` moved to the private Contextual: Color collection
 * and will change prefix. `foreground-action-secondary-inverse-rest` is gone
 * entirely — that one is a component fix, not a sync fix.
 */
const PENDING_SYNC = new Set([
  "semantic-color-surface-sheet",
  "semantic-color-surface-canvas",
  "semantic-color-fill-contextual-navitem-hover",
  "semantic-color-fill-contextual-navitem-pressed",
  "semantic-color-fill-contextual-navitem-trail",
  "semantic-color-foreground-action-secondary-rest",
  "semantic-color-foreground-action-secondary-hover",
  "semantic-color-foreground-action-secondary-pressed",
  "semantic-color-foreground-action-secondary-disabled",
  "semantic-color-foreground-action-secondary-inverse-rest",
  "semantic-color-foreground-static-neutral-subtle",
]);

const TOKENS_CSS = "src/tokens/tokens.css";
const TOKEN_DECL = /^\s*--(?:semantic|primitive|motion)-[a-z0-9-]+\s*:/;
const REAL_LINK = /<link[^>]*tokens\.css/;
const VAR_USE = /var\(--((?:semantic|primitive|motion)-[a-z0-9-]+)/g;
// t("Fill/Contextual/NavItem/Hover") — a slash is required, so this cannot match
// an unrelated one-argument function that happens to be called t.
const T_CALL = /\bt\(\s*["']([A-Za-z0-9 _&]+(?:\/[A-Za-z0-9 _&%.]+)+)["']/g;

// The house helpers that build a custom-property name from a suffix:
//   c("fill-contextual-navitem-hover")  -> var(--semantic-color-…)
//   u("padding-base", 16)               -> var(--semantic-layout-units-…, 16px)
// These MUST be checked explicitly. They assemble the name by interpolation, so
// the VAR_USE regex only ever sees the literal prefix "--semantic-color-" and
// skips it as a runtime-built name — meaning a typo or a renamed token would sail
// straight through rules 1 to 3.
const HELPER_CALL = /\b([cu])\(\s*["']([a-z0-9-]+)["']/g;
const HELPER_PREFIX = { c: "semantic-color-", u: "semantic-layout-units-" };

/**
 * Mirror the key-building in tokens/resolve-tokens.js: lowercase each "/"
 * segment, and for a segment containing spaces try both space→hyphen and
 * space→removed, since Style Dictionary has emitted both forms historically
 * ("Secondary Inverse" → secondary-inverse, "SecondaryInverse" → secondaryinverse).
 * Returns every candidate custom-property suffix for one token id.
 */
function candidateSuffixes(tokenId) {
  const segments = tokenId.split("/").map((s) => s.toLowerCase().trim());
  let combos = [[]];
  for (const seg of segments) {
    const variants = seg.includes(" ")
      ? [seg.replace(/\s+/g, "-"), seg.replace(/\s+/g, "")]
      : [seg];
    combos = combos.flatMap((prefix) => variants.map((v) => [...prefix, v]));
  }
  return combos.map((parts) => parts.join("-"));
}

// Read every emitted stylesheet, not just the legacy one. themes/light.css and
// themes/midnight.css carry the mode-less names (--semantic-color-surface-sheet)
// that new code is supposed to use, while tokens.css carries the legacy
// mode-in-name form. Checking only tokens.css would wrongly flag every correct
// modern reference as unresolved.
const CSS_SOURCES = [
  TOKENS_CSS,
  "src/tokens/themes/light.css",
  "src/tokens/themes/midnight.css",
  "src/tokens/primitives.css",
];

const defined = new Set();
for (const file of CSS_SOURCES) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf-8").split("\n")) {
    const m = line.match(/^\s*--([a-z0-9-]+)\s*:/);
    if (m) defined.add(m[1]);
  }
}
if (!defined.size) {
  console.error(
    `No custom properties found in any of:\n  ${CSS_SOURCES.join("\n  ")}\n` +
    `Run \`npm run build-tokens\` first.`
  );
  process.exit(2);
}

const demos = [];
for (const d of readdirSync("components", { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const f = join("components", d.name, `${d.name}.html`);
  if (existsSync(f)) demos.push(f);
}

let failures = 0;
const warnings = [];
for (const file of demos) {
  const src = readFileSync(file, "utf-8");
  const problems = [];

  if (!REAL_LINK.test(src)) {
    problems.push("no <link> to src/tokens/tokens.css — this demo has no tokens at all");
  }

  const inlined = src.split("\n").filter((l) => TOKEN_DECL.test(l));
  if (inlined.length) {
    problems.push(
      `${inlined.length} inlined token declaration(s). Delete them and rely on the link; ` +
      `a hand-copied subset drifts silently.`
    );
  }

  const used = new Set();
  for (const m of src.matchAll(VAR_USE)) if (!m[1].endsWith("-")) used.add(m[1]);
  for (const m of src.matchAll(HELPER_CALL)) used.add(HELPER_PREFIX[m[1]] + m[2]);
  const unresolved = [...used].filter((n) => !defined.has(n)).sort();
  const missing = unresolved.filter((n) => !PENDING_SYNC.has(n));
  const pending = unresolved.filter((n) => PENDING_SYNC.has(n));
  if (missing.length) {
    problems.push(`${missing.length} unresolved token(s): ${missing.slice(0, 5).join(", ")}`);
  }
  if (pending.length) {
    warnings.push(
      `${basename(file)}: ${pending.length} token(s) awaiting the next sync — ` +
      `${pending.slice(0, 3).join(", ")}${pending.length > 3 ? ", …" : ""}`
    );
  }

  // Rule 4: t("A/B/C") must resolve. resolve-tokens returns the id unchanged on a
  // miss, so an unresolvable name ships as a silent wrong colour.
  const tCalls = new Set();
  for (const m of src.matchAll(T_CALL)) tCalls.add(m[1]);
  const deadTokens = [...tCalls]
    .filter((id) => {
      const suffixes = candidateSuffixes(id);
      // A colour token can appear with or without the legacy mode segment.
      return !suffixes.some((s) =>
        defined.has(`semantic-color-${s}`) ||
        defined.has(`semantic-color-light-mode-${s}`) ||
        defined.has(`semantic-layout-units-${s}`) ||
        defined.has(`semantic-type-desktop-${s}`) ||
        defined.has(s)
      );
    })
    .sort();
  if (deadTokens.length) {
    problems.push(
      `${deadTokens.length} t() call(s) resolve to nothing, which ships as a silent ` +
      `wrong colour: ${deadTokens.slice(0, 5).join(", ")}` +
      (deadTokens.length > 5 ? ` … and ${deadTokens.length - 5} more` : "")
    );
  }

  if (problems.length) {
    failures++;
    console.log(`FAIL  ${basename(file)}`);
    for (const p of problems) console.log(`        ${p}`);
  } else {
    console.log(`ok    ${basename(file)}  (${used.size} tokens, all resolved)`);
  }
}

console.log("");
if (warnings.length) {
  console.log("Awaiting the next token sync (not a failure):");
  for (const w of warnings) console.log(`  ${w}`);
  console.log(
    "  These names exist in the Figma Variables panel but not yet in the built CSS.\n" +
    "  Run the sync to resolve them, then remove them from PENDING_SYNC.\n"
  );
}
if (failures) {
  console.log(`${failures} demo(s) failed. Demos must consume the built token CSS.`);
  process.exit(1);
}
console.log(`All ${demos.length} demos link the built token CSS and inline nothing.`);
