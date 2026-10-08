/**
 * check-figma-nodes.js, collect every Figma node id cited in the repo and
 * write them to a file an agent can verify against the live file.
 *
 * WHY. On 2026-10-07 a sweep of all 50 cited node ids found four defects that
 * had each survived for months:
 *   - `40002909:32275` and `40004169:1511`, cited by sidenav-spec.md, do not
 *     exist in the file at all.
 *   - Search's manifest `nodeId` was `40006978:23158`, a 2594x1680 FRAME named
 *     "Frame 633379". A layout frame, not a component.
 *   - NavShell's was `40006538:43236`, a VARIANT of a set rather than the set,
 *     so `componentPropertyDefinitions` could not be read from it.
 *
 * None of those could be caught locally, because only Figma knows whether an
 * id resolves and what type it is. So this script does the half that CAN be
 * automated: it finds every citation, says where each one is, and classifies
 * what KIND of thing each one is expected to be. An agent then reads the ids
 * through the Figma MCP and compares. `--list` prints the ids for pasting into
 * such a script.
 *
 * It deliberately does not call Figma itself. The MCP is interactively
 * authenticated and absent from headless runs, which is the same reason the
 * token read cannot be a cron job (CLAUDE.md §2).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SCAN = ["components", "docs", "src/stories"];
const EXT = new Set([".md", ".json", ".ts", ".jsx", ".mdx"]);

/** A citation that says "this is the set" must point at a COMPONENT_SET. */
const EXPECT_SET = /\bset\b|component_set|the SET/i;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walk(rel, out);
    else if (EXT.has(path.extname(e.name))) out.push(rel);
  }
  return out;
}

const cites = new Map(); // id -> [{file, line, text}]
for (const f of SCAN.flatMap((d) => (fs.existsSync(path.join(ROOT, d)) ? walk(d) : []))) {
  const lines = fs.readFileSync(path.join(ROOT, f), "utf8").split("\n");
  lines.forEach((text, i) => {
    const found = [
      ...text.matchAll(/node-id=(\d{3,})[-:](\d+)/g),
      ...text.matchAll(/"(\d{6,}):(\d+)"/g),
    ];
    for (const m of found) {
      const id = `${m[1]}:${m[2]}`;
      if (!cites.has(id)) cites.set(id, []);
      cites.get(id).push({ file: f, line: i + 1, text: text.trim().slice(0, 120) });
    }
  });
}

const ids = [...cites.keys()].sort();

if (process.argv.includes("--list")) {
  console.log(ids.join(" "));
  process.exit(0);
}

console.log(`${ids.length} distinct Figma node ids cited across ${SCAN.join(", ")}.\n`);
let expectSet = 0;
for (const id of ids) {
  const where = cites.get(id);
  const wantsSet = where.some((w) => EXPECT_SET.test(w.text));
  if (wantsSet) expectSet++;
  console.log(`${id}  ${wantsSet ? "expect COMPONENT_SET" : ""}`);
  for (const w of where.slice(0, 3)) console.log(`    ${w.file}:${w.line}`);
}
console.log(`\n${expectSet} of them are cited as a set and must resolve to a COMPONENT_SET.`);

/**
 * VERIFIED TYPES, read through the Figma Plugin API. This script cannot reach
 * Figma itself, so the read is done by hand and the ANSWER is recorded here.
 * That turns a standing question into a check: a new id cited as a set, or an
 * id whose recorded type no longer matches what it is cited as, fails the run
 * instead of printing a reminder that nobody acts on.
 *
 * Re-verify with:
 *   node scripts/check-figma-nodes.js --list
 * then read those ids through the Figma MCP and update this map.
 */
const VERIFIED = {
  "40004059:1375": { type: "COMPONENT_SET", name: "SideNav.Container", on: "2026-10-08" },
  "40007095:4048": { type: "COMPONENT_SET", name: "TopNav.Search",     on: "2026-10-08" },
  "40009415:27750": { type: "COMPONENT_SET", name: "KPI Tiles",        on: "2026-10-08" },
  "40009709:26016": { type: "COMPONENT_SET", name: "ScreenTemplate",   on: "2026-10-08" },
  // Cited as a set until 2026-10-08, when the read showed it is the Mode=Base
  // VARIANT of 40004059:1375. The three citations in sidenav-spec.md were
  // repointed at the set, which is what they claimed to be.
  "40004059:1374": { type: "COMPONENT", name: "Mode=Base", on: "2026-10-08" },
};

let failures = 0;
for (const id of ids) {
  const wantsSet = cites.get(id).some((w) => EXPECT_SET.test(w.text));
  if (!wantsSet) continue;
  const v = VERIFIED[id];
  if (!v) {
    console.log(`\n  UNVERIFIED  ${id} is cited as a component set and has never been read.`);
    failures++;
  } else if (v.type !== "COMPONENT_SET") {
    console.log(`\n  WRONG TYPE  ${id} is cited as a component set but is a ${v.type} ("${v.name}").`);
    failures++;
  }
}

if (failures) {
  console.log(`\n${failures} id(s) cited as a component set are unverified or wrong.`);
  process.exit(1);
}
console.log(`${expectSet} verified as COMPONENT_SET through the Figma API; see VERIFIED in this file.`);
