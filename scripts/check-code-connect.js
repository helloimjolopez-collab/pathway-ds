/**
 * check-code-connect.js: verify what Code Connect itself never checks.
 *
 * WHY. Code Connect publishes a code snippet to a Figma component and verifies
 * NOTHING about it: not a token value, not a measurement, not a prop name, not
 * even that the module it imports exists. A component can be fully "connected"
 * and the snippet still be code a developer cannot run. That is the single
 * most repeated failure in this repo, and the reason the question "isn't this
 * meant to be code connected?" keeps coming up.
 *
 * So this checks the three things that are checkable from here:
 *
 *   1. The module a mapping imports exists, and exports the symbol it names.
 *   2. Every prop the snippet emits is a real prop of that component. A
 *      snippet that passes `collapsed` to a component whose prop is
 *      `isSidebarCollapsed` is worse than no snippet: it looks authoritative
 *      and does nothing.
 *   3. The snippet names no raw hex and no `--primitive-*`, and no
 *      `--semantic-color-light-mode-*`, the retired mode-in-name form.
 *
 * It CANNOT check that the mapping points at the right Figma node, or that the
 * values match the design. Only Figma knows that, and the MCP is
 * interactively authenticated. `npm run check-figma-nodes` lists the ids for
 * an agent session to verify.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".figma.ts")) out.push(p);
  }
  return out;
}

/** The destructured prop names of a component, including renamed ones. */
function propsOf(src, name) {
  const re = new RegExp(`export (?:function|const) ${name}\\s*=?\\s*\\(?\\s*\\{`);
  const m = src.match(re);
  if (!m) return null;
  // Balance braces from the opening one so nested defaults are included.
  let i = src.indexOf("{", m.index + m[0].length - 1);
  let depth = 0, end = i;
  for (; end < src.length; end++) {
    if (src[end] === "{") depth++;
    else if (src[end] === "}") { depth--; if (!depth) break; }
  }
  // STRIP COMMENTS FIRST. Several components document each prop with a JSDoc
  // block between the entries, and without this the comment text is parsed as
  // part of the next prop's name: KpiNumber's `numberStyle` was reported as
  // missing when it is right there, three lines under its own comment.
  const body = src.slice(i + 1, end)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  const out = new Set();
  let d = 0, cur = "";
  for (const ch of body) {
    if ("{[(".includes(ch)) d++;
    if ("}])".includes(ch)) d--;
    if (ch === "," && d === 0) { out.add(cur); cur = ""; continue; }
    cur += ch;
  }
  out.add(cur);
  return new Set([...out]
    // `expanded: expandedProp` is still the prop `expanded`; `size = "M"` is `size`.
    .map((p) => p.split("=")[0].split(":")[0].trim().replace(/^\.\.\./, ""))
    .filter(Boolean));
}

const files = walk(path.join(ROOT, "components"));
const problems = [];

for (const f of files) {
  const rel = path.relative(ROOT, f);
  const s = fs.readFileSync(f, "utf8");

  // 3. Forbidden colour forms, in the snippet a developer would copy.
  for (const [re, what] of [
    [/#[0-9a-fA-F]{6}\b(?![^`]*\*\/)/g, "a raw hex"],
    [/--primitive-[a-z0-9-]+/g, "a primitive token"],
    [/--semantic-color-light-mode-/g, "the retired mode-in-name token form"],
  ]) {
    // Only the example, never the explanatory comments above it.
    const ex = s.slice(s.indexOf("example:"));
    const hit = ex.match(re);
    if (hit) problems.push([rel, `snippet names ${what}: ${hit[0]}`]);
  }

  const imp = s.match(/imports: \['import \{ ([^}]+) \} from "([^"]+)"/);
  if (!imp) continue;
  const names = imp[1].split(",").map((x) => x.trim());
  const mod = path.resolve(path.dirname(f), imp[2]);
  if (!fs.existsSync(mod)) { problems.push([rel, `imports a module that does not exist: ${imp[2]}`]); continue; }
  const ms = fs.readFileSync(mod, "utf8");

  // 1. The symbol is exported.
  for (const n of names) {
    if (!new RegExp(`export (?:function|const|class) ${n}\\b`).test(ms)) {
      problems.push([rel, `${n} is not exported from ${path.basename(mod)}`]);
    }
  }

  // 2. Every emitted prop exists.
  const props = propsOf(ms, names[0]);
  if (!props) continue;
  const emitted = new Set([
    ...[...s.matchAll(/renderProp\("(\w+)"/g)].map((m) => m[1]),
    ...[...s.matchAll(/^\s{2}(\w+)=\{/gm)].map((m) => m[1]),
    ...[...s.matchAll(/^\s{2}(\w+)="/gm)].map((m) => m[1]),
  ]);
  const unknown = [...emitted].filter((e) => !props.has(e) && e !== "children").sort();
  if (unknown.length) {
    problems.push([rel, `${names[0]} has no prop(s): ${unknown.join(", ")}`]);
  }
}

console.log(`${files.length} Code Connect mappings checked.`);
if (problems.length) {
  for (const [f, w] of problems) console.error(`  ${f}\n      ${w}`);
  console.error(`\n${problems.length} problem(s). Code Connect would publish all of these happily.`);
  process.exit(1);
}
console.log("Every mapping imports a real module, names a real export, and emits only real props.");
