/**
 * check-state-distinctness.js — fail the build when an interaction state is
 * indistinguishable from another state of the same token group.
 *
 * WHY THIS EXISTS:
 *
 * On 2026-09-14 three groups shipped with `rest` and `hover` bound to the same
 * primitive:
 *
 *   fill-action-status-positive     light   rest = hover   green-500
 *   stroke-action-status-positive   light   rest = hover   green-500
 *   foreground-action-status-info   light   rest = hover   amethyst-400
 *
 * The third of those names no longer exists: Attention, Severe and Info left the
 * Action tier entirely on 2026-09-16. It is kept here because the example is
 * about the SHAPE of the defect, which any future tone can repeat.
 *
 * A hover that paints the same colour as rest is a hover that does nothing. The
 * component is correct, the token name resolves, the contrast passes, the build
 * is clean and Storybook renders — so every existing checker was happy:
 *
 *   check-demo-tokens        does the demo name a token that resolves?
 *   check-token-refs         does the code name a token that resolves?
 *   check-token-names        does the prose name a token that exists?
 *   check-story-yield        does the docs page render anything?
 *
 * All four ask about NAMES. None of them can see that two names hold the same
 * VALUE, which is the whole defect. That is the gap this file closes.
 *
 * Both collisions arrived the same way, and it is worth naming because the
 * pattern will recur: a value was changed for a good local reason without
 * checking its neighbours. `positive/rest` was darkened to Green/500 to clear
 * AA against white text, and Green/500 was already `hover`. `Info` was moved off
 * Brand onto Amethyst by nearest-value, and Brand/400 and Brand/450 both round
 * to Amethyst/400, so rest and hover converged. Neither edit was wrong on its
 * own terms; both were wrong about the group.
 *
 * WHAT THIS DOES NOT CHECK
 * It compares the primitive each state resolves to, not the rendered colour, so
 * two different primitives holding identical hex would pass. That is deliberate:
 * a duplicate hex in the ramp is a primitives problem, and flagging it here
 * would report the same fault once per consuming semantic.
 *
 * Usage:  node scripts/check-state-distinctness.js [--verbose]
 * Exit 1 on any collision.
 */

import { readFileSync, existsSync } from "node:fs";

const THEMES = [
  ["light", "src/tokens/themes/light.css"],
  ["midnight", "src/tokens/themes/midnight.css"],
];

// Only states that a pointer moves BETWEEN need to look different from each
// other. `disabled` is excluded on purpose: it is terminal rather than a step,
// and it legitimately shares a value with a neutral rest in some groups.
// `selected` is excluded because a selected-and-resting control genuinely may
// match its own rest in groups where selection is carried by a stroke instead.
const STATES = ["rest", "hover", "pressed"];
const STATE_RE = new RegExp(`^(--semantic-color-.*)-(${STATES.join("|")})$`);

const verbose = process.argv.includes("--verbose");

function aliasMap(file) {
  if (!existsSync(file)) {
    console.error(`${file} not found. Run \`node style-dictionary.config.js\` first.`);
    process.exit(2);
  }
  const css = readFileSync(file, "utf8");
  const out = new Map();
  // Only var() aliases are comparable. A literal value means the token does not
  // go through the ramp, and those are rare enough to leave alone.
  for (const m of css.matchAll(/(--semantic-color-[a-z0-9-]+)\s*:\s*var\((--primitive-color-[a-z0-9-]+)\)/g)) {
    out.set(m[1], m[2]);
  }
  return out;
}

const collisions = [];
let groupsChecked = 0;

for (const [mode, file] of THEMES) {
  const map = aliasMap(file);

  const groups = new Set();
  for (const name of map.keys()) {
    const m = name.match(STATE_RE);
    if (m) groups.add(m[1]);
  }

  for (const group of [...groups].sort()) {
    const present = STATES.filter((s) => map.has(`${group}-${s}`));
    if (present.length < 2) continue;
    groupsChecked++;

    const byPrimitive = new Map();
    for (const s of present) {
      const p = map.get(`${group}-${s}`);
      if (!byPrimitive.has(p)) byPrimitive.set(p, []);
      byPrimitive.get(p).push(s);
    }
    for (const [primitive, states] of byPrimitive) {
      if (states.length < 2) continue;
      collisions.push({
        group: group.replace("--semantic-color-", ""),
        mode,
        states,
        primitive: primitive.replace("--primitive-color-", ""),
      });
    }
  }
}

if (collisions.length) {
  const width = Math.max(...collisions.map((c) => c.group.length));
  console.error(
    `\n${collisions.length} interaction state${collisions.length === 1 ? "" : "s"} ` +
      `indistinguishable from another state in the same group:\n`
  );
  for (const c of collisions) {
    console.error(
      `  ${c.group.padEnd(width)}  ${c.mode.padEnd(9)} ` +
        `${c.states.join(" = ").padEnd(16)} both resolve to ${c.primitive}`
    );
  }
  console.error(
    `\nA state that paints the same colour as another state does nothing the user\n` +
      `can see. Fix it in the FIGMA panel, not here: re-alias the later state one\n` +
      `step further along its ramp, then re-dump and rebuild. Check the whole group\n` +
      `when you change one state's value — that is how all of these got in.\n`
  );
  process.exit(1);
}

console.log(
  `All ${groupsChecked} state group${groupsChecked === 1 ? "" : "s"} across ` +
    `${THEMES.length} modes have distinct rest/hover/pressed values.`
);
if (verbose) {
  console.log(`States compared: ${STATES.join(", ")} (disabled and selected excluded by design)`);
}
