/**
 * check-pairing-invariant.js — fail the build when a fill offers a variant its
 * paired foreground does not, or a foreground claims a pairing no fill offers.
 *
 * THE INVARIANT:
 *
 *   Wherever a tone has a Subtle fill, it has a paired On Subtle foreground.
 *   Wherever a tone has a Strong fill, it has a paired On Strong foreground.
 *   And the reverse: a foreground named On Subtle or On Strong must have the
 *   matching fill to sit on.
 *
 * WHY THIS EXISTS:
 *
 * The pairing model is the thing that stops an agent, or a designer in a hurry,
 * putting tone-coloured text on a tone-coloured block and getting 1.4:1. It only
 * works if the pairs are complete. On 2026-09-16 an audit found Static fully
 * compliant and Action broken in both directions:
 *
 *   Action/Primary, Action/Status/Negative and Action/Status/Positive each had a
 *   Strong fill and NO On Strong foreground, so a solid primary or a solid
 *   destructive button had no token for its own label.
 *
 *   Action/Status/Attention, Severe and Info each had a foreground named
 *   On Subtle over a fill with no Subtle variant at all — a name promising a
 *   pair that did not exist.
 *
 * Neither is visible to any other checker, because every name involved resolves
 * perfectly well. The defect is in what the SET of names does or does not offer,
 * which you only see by comparing tiers against each other.
 *
 * TWO DELIBERATE EXEMPTIONS, both recorded here rather than left implicit:
 *
 *   Neutral runs a LADDER (Mono, Faint, Subtle, Base, Bold, Strong) rather than
 *   a pair, in fill, foreground and stroke alike, because it carries most of the
 *   UI and a two-rung neutral would be useless. Its Subtle and Strong rungs are
 *   ladder positions, not pairing halves.
 *
 *   Action's On Strong is ONE token, not a per-state set, while On Subtle is
 *   per-state. A label on a solid fill does not change as the fill darkens, so
 *   three identical tokens would be a no-op variant — exactly what
 *   check-variant-distinctness.js exists to catch. On a pale fill the contrast
 *   genuinely shifts per state, so that half stays per-state.
 *
 * Usage:  node scripts/check-pairing-invariant.js [--verbose]
 * Exit 1 if the invariant is broken.
 */

import { readFileSync, existsSync } from "node:fs";

const verbose = process.argv.includes("--verbose");
const THEME = "src/tokens/themes/light.css";

if (!existsSync(THEME)) {
  console.error(`${THEME} not found. Run \`node style-dictionary.config.js\` first.`);
  process.exit(2);
}

// Read the emitted contract rather than the Figma panel: this runs in CI, where
// there is no Figma, and the emitted CSS is what consumers actually get.
const css = readFileSync(THEME, "utf8");
const names = new Set();
for (const m of css.matchAll(/^\s*--semantic-color-([a-z0-9-]+)\s*:/gim)) names.add(m[1]);

const has = (slashPath) => names.has(slashPath.toLowerCase().replace(/\//g, "-").replace(/ /g, "-"));

// Tones that run a ladder instead of a pair. See the header.
const LADDER_NOT_PAIR = new Set(["neutral"]);

const groups = new Set();
for (const n of names) {
  // fill-<tier>-<group…>-<subtle|strong>[-<state>]
  const m = n.match(/^fill-(static|action)-(.+?)-(subtle|strong)(?:-(rest|hover|pressed))?$/);
  if (m) groups.add(`${m[1]}|${m[2]}`);
}

const problems = [];
let checked = 0;
for (const key of [...groups].sort()) {
  const [tier, group] = key.split("|");
  if (LADDER_NOT_PAIR.has(group)) continue;
  checked++;
  const states = tier === "action" ? ["rest", "hover", "pressed"] : [null];
  const fillHas = (rung) => states.some((s) => has(`fill/${tier}/${group}/${rung}${s ? "/" + s : ""}`));
  const fgHas = (rung) =>
    // Action On Strong is a single token; On Subtle is per-state. Accept either
    // shape so the check does not force bloat it explicitly rejects.
    has(`foreground/${tier}/${group}/on ${rung}`) ||
    states.some((s) => has(`foreground/${tier}/${group}/on ${rung}${s ? "/" + s : ""}`));

  for (const rung of ["subtle", "strong"]) {
    if (fillHas(rung) && !fgHas(rung)) {
      problems.push({
        kind: "missing pair",
        detail: `${tier}/${group} has a ${rung} fill but no Foreground .../On ${rung}`,
      });
    }
    if (fgHas(rung) && !fillHas(rung)) {
      problems.push({
        kind: "unpaired name",
        detail: `${tier}/${group} has a Foreground .../On ${rung} but no ${rung} fill to sit on`,
      });
    }
  }
  if (verbose) {
    console.log(
      `  ${tier}/${group}`.padEnd(38) +
        `fill: ${fillHas("subtle") ? "Subtle " : "       "}${fillHas("strong") ? "Strong" : "      "}` +
        `   fg: ${fgHas("subtle") ? "OnSubtle " : "         "}${fgHas("strong") ? "OnStrong" : ""}`
    );
  }
}

if (problems.length) {
  console.error(`\n${problems.length} pairing problem(s):\n`);
  for (const p of problems) console.error(`  ${p.kind.toUpperCase().padEnd(14)} ${p.detail}`);
  console.error(
    "\nThe pairing model is what stops tone text landing on a tone block at 1.4:1.\n" +
      "Either add the missing half, or remove the name that promises a pair it does not have.\n" +
      "A tone that should run a ladder instead of a pair belongs in LADDER_NOT_PAIR, with a reason.\n"
  );
  process.exit(1);
}

console.log(`Pairing invariant holds across all ${checked} paired tone groups.`);
