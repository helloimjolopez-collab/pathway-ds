/**
 * check-component-tables.js: a component that keeps its measurements in a
 * lookup table must not name a key the table cannot resolve.
 *
 * WHY. `kpi-tile.jsx` describes its nine types as data, which is the right
 * shape: nine layouts side by side are readable where nine branches of JSX are
 * not. But a data table trades one failure for another. `"chart-03"` named its
 * gap `gapChart03`, nothing defined that key in `L`, and `L["gapChart03"]`
 * is `undefined`. React drops an undefined style value, CSS falls back to no
 * gap, nothing throws, `storybook build` stays green and the render check
 * passes because the story is not blank. The tile simply had no gap where
 * Figma has 24, for as long as nobody compared it to the drawing.
 *
 * So the check is narrow and mechanical: for every `KEY: { ... prop: "name" }`
 * entry in a spec table, the quoted name must exist in the constants object
 * the component looks it up in.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "components");

/** Each table, the object it resolves against, and which fields are lookups. */
const TABLES = [
  {
    file: "kpi-tile/kpi-tile.jsx",
    table: "KPI_TILE_SPECS",
    lookup: "L",
    fields: ["pad", "gap"],
  },
];

let problems = 0;

for (const t of TABLES) {
  const full = path.join(root, t.file);
  if (!fs.existsSync(full)) {
    console.log(`  MISSING  ${t.file} is listed here and is not on disk`);
    problems++;
    continue;
  }
  const src = fs.readFileSync(full, "utf8");

  // The constants object: `export const L = { ... };` or `const L = { ... };`
  const lm = src.match(new RegExp(`(?:export )?const ${t.lookup} = \\{([\\s\\S]*?)\\n\\};`));
  if (!lm) {
    console.log(`  NO OBJECT  ${t.file}: cannot find \`${t.lookup}\``);
    problems++;
    continue;
  }
  const keys = new Set(
    [...lm[1].matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm)].map((m) => m[1]));

  // The spec table.
  const tm = src.match(new RegExp(`(?:export )?const ${t.table} = \\{([\\s\\S]*?)\\n\\};`));
  if (!tm) {
    console.log(`  NO TABLE  ${t.file}: cannot find \`${t.table}\``);
    problems++;
    continue;
  }

  let checked = 0;
  for (const f of t.fields) {
    for (const m of tm[1].matchAll(new RegExp(`\\b${f}:\\s*"([^"]+)"`, "g"))) {
      checked++;
      if (!keys.has(m[1])) {
        console.log(`  UNRESOLVED  ${t.file}: ${t.table} names ${f}: "${m[1]}", which is not a key of \`${t.lookup}\``);
        problems++;
      }
    }
  }
  console.log(`  ok  ${t.file}: ${checked} lookup(s) in ${t.table} all resolve against ${t.lookup} (${keys.size} keys)`);
}

if (problems) {
  console.log(`\n${problems} unresolved table lookup(s). Each one renders as nothing and throws no error.`);
  process.exit(1);
}
console.log(`\n${TABLES.length} component table(s) checked. Every named value resolves.`);
