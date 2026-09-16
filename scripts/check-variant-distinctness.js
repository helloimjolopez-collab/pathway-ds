/**
 * check-variant-distinctness.js — fail the build when a component prop stops
 * doing anything.
 *
 * WHY THIS EXISTS:
 *
 * On 2026-09-16 the tone ladders were cut from five rungs to a single
 * canvas-readable foreground per tone (`Foreground/Static/<Tone>/On Subtle`).
 * The Spinner exposes an `emphasis` prop with five values, and after that change
 * nine of its ten tones resolved ALL FIVE values to the same token. The prop was
 * a no-op, its Storybook control did nothing, and its spec described a
 * five-level ladder that no longer existed.
 *
 * Nothing caught it, and the reason is worth stating: every other checker in
 * this repo asks whether a token NAME resolves.
 *
 *   check-demo-tokens.js        a demo names a real var()
 *   check-token-refs.js         helper-expanded names resolve
 *   check-token-names.js        prose names something live
 *   check-state-distinctness.js rest/hover/pressed differ IN THE TOKEN SET
 *   check-ladder-order.js       a ladder's names match its values
 *
 * All of those passed. `--semantic-color-foreground-static-negative-on-subtle`
 * is a perfectly real token, and the CSS was valid. The defect was that five
 * different selectors pointed at it, which is invisible unless you compare
 * selectors to each other.
 *
 * check-state-distinctness.js is the closest relative but looks at the wrong
 * layer: it compares tokens within a GROUP in the token set. This one compares
 * the tokens a COMPONENT's variant selectors resolve to.
 *
 * A no-op variant is worse than a missing one. It tells a developer, a designer
 * reading Storybook controls, and an agent generating code that a distinction
 * exists when it does not.
 *
 * HOW IT WORKS: parse each component stylesheet for rules carrying both a
 * `[data-<axis>="<value>"]` selector and a colour declaration, group by the
 * OTHER axes, and report any axis whose values all collapse to one token.
 *
 * ALLOWLIST: a collapse is sometimes correct. `tone="brand"` legitimately has
 * one value. Each entry needs a reason, so the list stays a set of decisions
 * rather than a place to hide failures.
 *
 * Usage:  node scripts/check-variant-distinctness.js [--verbose]
 * Exit 1 if an un-allowlisted variant axis is a no-op.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const verbose = process.argv.includes("--verbose");

/**
 * Known-good collapses. Key is `<file>::<axis>::<context>`, value is why.
 *
 * The Spinner's `emphasis` collapsed on every non-neutral tone when tone
 * ladders went to one rung each. The prop is kept so existing call sites keep
 * working, and both the spec and the MDX say plainly that it only affects
 * neutral. That is a documented decision, not a regression, so it is listed
 * here rather than left to fail the build every time.
 */
const ALLOWED = new Map([
  ["spinner.css::emphasis", "A tone carries one canvas foreground since 2026-09-16; only neutral kept a ladder. Documented in spinner-spec.md 7.1.2 and Spinner.mdx."],
]);

const ROOTS = ["src/stories/Library", "components"];
const files = [];
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (extname(p) === ".css") files.push(p);
  }
}
for (const r of ROOTS) walk(r);

/** Split a stylesheet into top-level rules without a full CSS parser. */
function rules(css) {
  const out = [];
  let depth = 0, start = 0, sel = null;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      if (depth === 0) { sel = css.slice(start, i); start = i + 1; }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) { out.push({ selector: sel || "", body: css.slice(start, i) }); start = i + 1; sel = null; }
    }
  }
  return out;
}

const findings = [];
for (const file of files) {
  const short = file.split("/").pop();
  const css = readFileSync(file, "utf8");

  // token -> the set of (axis,value) combinations that resolve to it
  const combos = [];
  for (const { selector, body } of rules(css)) {
    const axes = {};
    for (const m of selector.matchAll(/\[data-([a-z-]+)="([^"]+)"\]/g)) axes[m[1]] = m[2];
    if (!Object.keys(axes).length) continue;
    const colour = body.match(/(?:^|[\s;])color:\s*var\((--[a-z0-9-]+)\)/);
    if (!colour) continue;
    combos.push({ axes, token: colour[1] });
  }
  if (!combos.length) continue;

  const allAxes = [...new Set(combos.flatMap((c) => Object.keys(c.axes)))];
  for (const axis of allAxes) {
    // Group by every OTHER axis, so "does emphasis matter, holding tone fixed?"
    const groups = new Map();
    for (const c of combos) {
      if (!(axis in c.axes)) continue;
      const key = allAxes.filter((a) => a !== axis).map((a) => `${a}=${c.axes[a] ?? "*"}`).join(",");
      if (!groups.has(key)) groups.set(key, new Map());
      groups.get(key).set(c.axes[axis], c.token);
    }
    const collapsed = [];
    let live = 0;
    for (const [context, values] of groups) {
      if (values.size < 2) continue;              // one value cannot collapse
      const distinct = new Set(values.values()).size;
      if (distinct === 1) collapsed.push({ context, levels: values.size, token: [...values.values()][0] });
      else live++;
    }
    if (!collapsed.length) continue;
    const allowKey = `${short}::${axis}`;
    findings.push({
      file, axis, collapsed, live,
      allowed: ALLOWED.has(allowKey),
      reason: ALLOWED.get(allowKey) || null,
    });
  }
}

let failed = 0;
for (const f of findings) {
  const tag = f.allowed ? "note" : "FAIL";
  if (!f.allowed) failed++;
  console.log(
    `  ${tag}  ${f.file}  [data-${f.axis}]  ` +
      `${f.collapsed.length} context(s) collapse to a single token, ${f.live} still vary`
  );
  if (f.allowed) console.log(`        allowed: ${f.reason}`);
  if (verbose || !f.allowed) {
    for (const c of f.collapsed.slice(0, 6)) {
      console.log(`        ${c.context || "(no other axis)"}: ${c.levels} values -> ${c.token}`);
    }
    if (f.collapsed.length > 6) console.log(`        …and ${f.collapsed.length - 6} more`);
  }
}

if (failed) {
  console.error(
    `\n${failed} variant axis/axes do nothing.\n` +
      "A prop whose values all resolve to one token lies to developers, to the\n" +
      "Storybook controls panel, and to any agent generating code from the spec.\n" +
      "Either give the values distinct tokens, or remove the axis, or allowlist it\n" +
      "in ALLOWED with a reason AND say so in the component's spec and MDX.\n"
  );
  process.exit(1);
}

console.log(
  findings.length
    ? `\nNo un-allowlisted no-op variants. ${findings.length} documented collapse(s).`
    : "\nEvery variant axis changes at least one token."
);
