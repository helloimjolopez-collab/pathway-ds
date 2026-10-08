/**
 * Every `of={Stories.X}` in an MDX page must name a real export, and every
 * `<Controls of={...} />` must name a story that actually HAS controls.
 *
 * WHY. A reference to a story that does not exist renders as an empty block
 * rather than an error, and `storybook build` stays green: the page simply has
 * a hole in it. And a `<Controls>` pointed at a story with no argTypes renders
 * an empty table under a heading promising controls, which is worse than
 * omitting the section, because the reader concludes the component has no
 * props. Both of those shipped on the Bar Chart page before this check existed.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.join(__dirname, "..", "src", "stories");
const mdx = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".mdx")) mdx.push(p);
  }
})(root);

let problems = 0;
for (const file of mdx) {
  const src = fs.readFileSync(file, "utf8");
  // Whatever alias the page imports its stories under.
  const imp = src.match(/import \* as (\w+) from "(\.[^"]+)"/);
  if (!imp) continue;
  const [, alias, rel] = imp;
  let storiesPath = path.join(path.dirname(file), rel);
  for (const ext of ["", ".jsx", ".js", ".ts", ".tsx"]) {
    if (fs.existsSync(storiesPath + ext)) { storiesPath += ext; break; }
  }
  if (!fs.existsSync(storiesPath)) {
    console.log(`  MISSING  ${path.relative(root, file)} imports ${rel}, which is not there`);
    problems++;
    continue;
  }
  const stories = fs.readFileSync(storiesPath, "utf8");
  const exports = new Set(
    [...stories.matchAll(/^export const (\w+)/gm)].map((m) => m[1]));

  const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const refs = [...src.matchAll(new RegExp(`of=\\{${esc}\\.(\\w+)\\}`, "g"))].map((m) => m[1]);
  for (const r of new Set(refs)) {
    if (!exports.has(r)) {
      console.log(`  BROKEN   ${path.relative(root, file)} -> ${alias}.${r} is not exported`);
      problems++;
    }
  }

  // A <Controls of={X}> whose story declares no argTypes renders an empty table.
  const ctl = [...src.matchAll(new RegExp(`<Controls\\s+of=\\{${esc}\\.(\\w+)\\}`, "g"))].map((m) => m[1]);
  for (const c of new Set(ctl)) {
    if (!exports.has(c)) continue;
    const body = stories.slice(stories.indexOf(`export const ${c}`));
    const end = body.search(/\n(export const|\/\*\*)/);
    const story = end === -1 ? body : body.slice(0, end);
    // argTypes may be declared on the story OR on the default export's meta,
    // which applies to every story in the file. Both count.
    const metaStart = stories.search(/^export default \{/m);
    const metaEnd = metaStart === -1 ? -1 : stories.indexOf("\n};", metaStart);
    const meta = metaStart === -1 ? "" : stories.slice(metaStart, metaEnd);
    if (!/argTypes\s*:/.test(story) && !/argTypes\s*:/.test(meta)) {
      console.log(`  NO CONTROLS  ${path.relative(root, file)} -> <Controls of={${alias}.${c}}> but that story declares no argTypes`);
      problems++;
    }
  }
}

if (problems) {
  console.log(`\n${problems} problem(s) across ${mdx.length} MDX pages.`);
  process.exit(1);
}
console.log(`${mdx.length} MDX pages: every story reference resolves and every Controls block has controls.`);
