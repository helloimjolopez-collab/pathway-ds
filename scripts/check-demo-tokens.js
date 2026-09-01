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
 * It enforces three things per demo:
 *   1. a real <link> to the built token CSS exists
 *   2. no --semantic-*, --primitive-* or --motion-* declaration is inlined
 *   3. every var(--semantic|primitive|motion-…) it references actually exists
 *      in tokens.css
 *
 * Rule 3 skips names ending in "-", which are the prefixes of runtime-
 * interpolated names such as `var(--semantic-color-light-mode-${p})` in
 * components/button/button.jsx. Those cannot be checked statically.
 *
 * Usage:  node scripts/check-demo-tokens.js
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const TOKENS_CSS = "src/tokens/tokens.css";
const TOKEN_DECL = /^\s*--(?:semantic|primitive|motion)-[a-z0-9-]+\s*:/;
const REAL_LINK = /<link[^>]*tokens\.css/;
const VAR_USE = /var\(--((?:semantic|primitive|motion)-[a-z0-9-]+)/g;

const defined = new Set();
for (const line of readFileSync(TOKENS_CSS, "utf-8").split("\n")) {
  const m = line.match(/^\s*--([a-z0-9-]+)\s*:/);
  if (m) defined.add(m[1]);
}
if (!defined.size) {
  console.error(`No custom properties in ${TOKENS_CSS}. Run build-tokens first.`);
  process.exit(2);
}

const demos = [];
for (const d of readdirSync("components", { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const f = join("components", d.name, `${d.name}.html`);
  if (existsSync(f)) demos.push(f);
}

let failures = 0;
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
  const missing = [...used].filter((n) => !defined.has(n)).sort();
  if (missing.length) {
    problems.push(`${missing.length} unresolved token(s): ${missing.slice(0, 5).join(", ")}`);
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
if (failures) {
  console.log(`${failures} demo(s) failed. Demos must consume the built token CSS.`);
  process.exit(1);
}
console.log(`All ${demos.length} demos link the built token CSS and inline nothing.`);
