/**
 * check-spec-stories.js, assert each spec's Storybook section names the
 * stories that actually exist.
 *
 * WHY. widget-spec.md §14 listed `Title is a swap control`, a story that was
 * never written, and omitted `Glance configurations` plus both token stories.
 * Nothing caught it: a spec is prose, and prose does not get compiled. The
 * pipeline skill's own spec audit says §14 must cross-reference the stories
 * file "names and counts must match exactly", and that audit only runs when
 * someone invokes it.
 *
 * So this does the mechanical half. For every component whose manifest entry
 * has both a spec and a stories file, it reads the untagged and `!dev`-tagged
 * exports out of the stories file and checks that the spec's Storybook section
 * mentions each one, by export name or by display name. It does NOT check
 * ordering or prose, because those are judgement.
 *
 * A spec with no Storybook section is reported, not failed: several specs
 * predate the template.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => p && fs.existsSync(path.join(ROOT, p));

/** Every `export const Foo`, with its `name:` and whether it is `!dev`-tagged. */
function storyExports(src) {
  const out = [];
  // Both CSF forms: `export const X = { … }` and the older
  // `export const X = () => (…)`. Search.stories.jsx uses the second for 7 of
  // its 8 stories, so matching only the object form found one of them.
  const re = /export const (\w+)\s*=\s*(?:\{|\(\s*\)\s*=>)/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    // The story's own object literal, bounded by the next top-level export.
    const next = src.indexOf("\nexport const", m.index + 1);
    const body = src.slice(m.index, next === -1 ? src.length : next);
    // Only a `name:` in the story object's own first few lines is the story's
    // display name. A Tokens story's body contains token rows with their own
    // `name:` fields, and the first match there is a token, not the story:
    // SideNav's TokensSpacing came out as "Panel width".
    const head = body.split("\n").slice(0, 4).join("\n");
    const display = head.match(/\bname:\s*["']([^"']+)["']/);
    out.push({
      export: name,
      display: display ? display[1] : null,
      dev: /tags:\s*\[[^\]]*!dev/.test(body),
    });
  }
  return out;
}

/** The spec's Storybook section, whatever it is numbered. */
function storybookSection(spec) {
  // Section numbering is not consistent across specs: "## 14. Storybook",
  // "## 19. Storybook" and button's "## §18 Storybook" all occur.
  const m = spec.match(/^#{2,3}\s*(?:§?\d+\.?\s*)?Storybook\b.*$/im);
  if (!m) return null;
  const start = m.index;
  const after = spec.slice(start + m[0].length);
  const nextHeading = after.search(/^#{2}\s/m);
  return after.slice(0, nextHeading === -1 ? undefined : nextHeading);
}

const { components } = JSON.parse(read("components/manifest.json"));
let failures = 0;
let noSection = 0;

const sharedStories = new Map();
for (const [key, c] of Object.entries(components)) {
  if (c.stories) sharedStories.set(c.stories, (sharedStories.get(c.stories) || []).concat(key));
}

for (const [key, c] of Object.entries(components)) {
  if (!exists(c.spec) || !exists(c.stories)) continue;
  // A building block pointed at its parent's stories file is listed in the
  // PARENT's spec; holding its own spec to that list would be wrong.
  const owners = sharedStories.get(c.stories) || [];
  if (owners.length > 1 && !c.stories.toLowerCase().includes(key.replace(/-/g, ""))) {
    console.log(`  shares ${path.basename(c.stories)}  ${key}  (listed in ${owners.filter((o) => o !== key).join(", ")})`);
    continue;
  }
  const stories = storyExports(read(c.stories));
  if (!stories.length) continue;
  const section = storybookSection(read(c.spec));
  if (section === null) {
    console.log(`  no Storybook section   ${key}  (${stories.length} stories)`);
    noSection++;
    continue;
  }
  const missing = stories.filter(
    (s) => !section.includes(s.export) && !(s.display && section.includes(s.display)),
  );
  // A story named in the spec that no longer exists is the worse direction:
  // it sends a reader to a page that is not there.
  const names = new Set(stories.flatMap((s) => [s.export, s.display].filter(Boolean)));
  // Only the LIST counts as a citation: a table row, or the `!dev` line.
  // Surrounding prose legitimately names components (`KpiNumberAndTrend`) and
  // legitimately says a story is absent ("No `StandaloneDemo` story"), and
  // treating either as a citation makes the check cry wolf.
  const listLines = section.split("\n").filter(
    (l) => /^\s*\|/.test(l) || /!dev`?-?tagged/i.test(l) || /^Sidebar-visible:/i.test(l),
  );
  const quoted = listLines.flatMap((l) => [...l.matchAll(/`([A-Z]\w+)`/g)].map((m) => m[1]));
  const phantom = [...new Set(quoted)].filter((q) => !names.has(q));

  if (!missing.length && !phantom.length) {
    console.log(`  ok                     ${key}  (${stories.length} stories)`);
    continue;
  }
  failures++;
  console.error(`  MISMATCH               ${key}`);
  for (const s of missing) {
    console.error(`      spec never names:   ${s.export}${s.display ? ` ("${s.display}")` : ""}${s.dev ? " [!dev]" : ""}`);
  }
  for (const p of phantom) {
    console.error(`      spec names a story that does not exist: ${p}`);
  }
}

console.log("");
if (noSection) console.log(`${noSection} spec(s) have no Storybook section. Not a failure; several predate the template.`);
if (failures) {
  console.error(`${failures} spec(s) disagree with their stories file.`);
  process.exit(1);
}
console.log("Every spec with a Storybook section names the stories that exist.");
