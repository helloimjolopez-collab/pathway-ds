/**
 * check-ladder-order.js — fail the build when a ladder's NAMES disagree with its
 * VALUES.
 *
 * WHY THIS EXISTS:
 *
 * On 2026-09-15 the tone ladders were shifted so that Strong ends every ladder
 * instead of Bold. The rename was applied positionally, group by group, and two
 * groups came out backwards: Foreground/Static/Neutral and
 * Foreground/Static/Jade ended up with `Bold` darker than `Strong`. Both had
 * been authored in a different order in the panel, so a rule that mapped
 * "the fourth rung" to a name mapped the wrong rung.
 *
 * Nothing caught it. Every other check in this repo verifies that a token NAME
 * resolves:
 *
 *   check-token-refs.js    a var() names something the contract declares
 *   check-token-names.js   prose names something that exists
 *   check-story-yield.js   a docs page renders rows at all
 *
 * All of those passed, because `foreground-static-neutral-strong` is a perfectly
 * real token. It was just the lighter of the two. A ladder whose names run
 * lightest-to-heaviest while its values do not is worse than a missing token: a
 * missing token paints nothing and gets noticed, while an inverted ladder paints
 * a heading in the subtitle's grey and looks merely a bit off.
 *
 * So this check reads the EMITTED CSS, resolves each semantic down to its
 * primitive hex, and asserts that sorting a group by name order and sorting it
 * by luminance produce the same sequence.
 *
 * It reads light.css only. Midnight inverts the values but not the names, so its
 * ladders run heaviest-to-lightest by design and the same assertion would be
 * false there for the right reasons.
 *
 * Usage:  node scripts/check-ladder-order.js [--verbose]
 * Exit 1 if any ladder is out of order.
 */

import { readFileSync } from "node:fs";

const verbose = process.argv.includes("--verbose");

// Lightest to heaviest. A rung absent from a group is skipped, so this list can
// name every rung in the system without every group having to carry them all.
// Keep in step with LADDER in src/stories/components/tokenOrder.js.
const LADDER = [
  "mono", "white", "xlight", "faint", "subtle", "base",
  "medium", "contrast", "bold", "strong", "strongest", "black",
];

// Rungs that describe a PAIRING rather than a position. `on-strong` is the mono
// anchor, so it is near-white and would read as the lightest rung on a ladder
// it does not belong to. Ordering these against tones is meaningless.
const NOT_A_RUNG = new Set(["on-subtle", "on-strong"]);

const primitives = readFileSync(new URL("../src/tokens/primitives.css", import.meta.url), "utf8");
const light = readFileSync(new URL("../src/tokens/themes/light.css", import.meta.url), "utf8");

const primValue = new Map();
for (const m of primitives.matchAll(/^\s*(--primitive-[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
  primValue.set(m[1], m[2].trim());
}

/** Resolve a declaration down to a hex, following one var() hop at a time. */
function resolve(raw, depth = 0) {
  if (depth > 8) return null;
  const v = raw.trim();
  const ref = v.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]*)?\)$/i);
  if (ref) {
    const next = primValue.get(ref[1]) ?? semValue.get(ref[1]);
    return next === undefined ? null : resolve(next, depth + 1);
  }
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) return hex[1];
  // rgba()/color-mix() carry an alpha, and an alpha-bearing token is a wash
  // rather than a rung. Returning null drops it from the comparison.
  return null;
}

const semValue = new Map();
for (const m of light.matchAll(/^\s*(--semantic-color-[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
  semValue.set(m[1], m[2].trim());
}

function luminance(hex) {
  const h = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

// Group by everything up to the final segment, where the final segment is a
// known rung. A token whose last segment is a state (rest/hover/pressed) or a
// pairing name is not part of a tone ladder.
const groups = new Map();
for (const [name, raw] of semValue) {
  const parts = name.replace("--semantic-color-", "").split("-");
  const rung = parts[parts.length - 1];
  if (NOT_A_RUNG.has(rung) || NOT_A_RUNG.has(parts.slice(-2).join("-"))) continue;
  if (!LADDER.includes(rung)) continue;
  const hex = resolve(raw);
  if (!hex) continue;
  const group = parts.slice(0, -1).join("-");
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push({ rung, L: luminance(hex), hex });
}

const problems = [];
let checked = 0;
for (const [group, rungs] of groups) {
  if (rungs.length < 3) continue; // two rungs cannot be out of order in a way worth naming
  checked++;
  const byName = [...rungs].sort((a, b) => LADDER.indexOf(a.rung) - LADDER.indexOf(b.rung));
  const byLight = [...rungs].sort((a, b) => b.L - a.L);
  const named = byName.map((r) => r.rung).join(" > ");
  const actual = byLight.map((r) => r.rung).join(" > ");
  if (named !== actual) problems.push({ group, named, actual, rungs: byName });
  else if (verbose) console.log(`  ok    ${group}   ${named}`);
}

if (problems.length) {
  console.error(`\n${problems.length} ladder(s) are named in an order their values do not follow:\n`);
  for (const p of problems) {
    console.error(`  ${p.group}`);
    console.error(`    named:  ${p.named}`);
    console.error(`    actual: ${p.actual}   (lightest first, by relative luminance)`);
    for (const r of p.rungs) console.error(`      ${r.rung.padEnd(10)} #${r.hex}   L=${r.L.toFixed(3)}`);
  }
  console.error(
    "\nThe fix is in Figma, not here: exchange the names on the rungs that are crossed,\n" +
      "re-dump, and re-run the sync. Renaming a variable preserves its id, so bindings follow.\n"
  );
  process.exit(1);
}

console.log(`All ${checked} tone ladders run lightest to heaviest, as their names claim.`);
