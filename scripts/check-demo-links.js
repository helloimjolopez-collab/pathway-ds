/**
 * check-demo-links.js: every stylesheet and script a standalone demo links must
 * resolve to a file that is actually served where that page is served.
 *
 * WHY. All twelve demos linked `../../src/tokens/*.css`, which resolves inside
 * the repo and nowhere else:
 *
 *   - In the built Storybook, `staticDirs` mounts components/ only, so from an
 *     iframed demo that path is a 404.
 *   - On GitHub Pages, the workflow copies components/ and puts the token
 *     contract at /tokens/, so it is a 404 there too. Checked against the live
 *     site on 2026-10-08: /src/tokens/primitives.css returned 404 while
 *     /tokens/primitives.css returned 200.
 *
 * So every `StandaloneDemo` story and every published demo URL had been loading
 * nine 404s and rendering on fallback colours instead of Pathway's. The build
 * was green throughout, because a 404 stylesheet is not a build error and
 * nothing in the repo opened these pages.
 *
 * `pathway-sidenav.html` was the worse case: its script, not a stylesheet, so
 * the page rendered nothing at all.
 *
 * They now link `../_demo/tokens/`, which sits inside components/ and so is
 * served in both places. This check keeps it that way: it reads every demo's
 * links and fails on one that points outside components/ or at a missing file.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const COMPONENTS = path.join(root, "components");

const demos = [];
for (const dir of fs.readdirSync(COMPONENTS, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(COMPONENTS, dir.name))) {
    if (f.endsWith(".html")) demos.push(path.join(COMPONENTS, dir.name, f));
  }
}

let problems = 0;
let checked = 0;

for (const demo of demos) {
  const src = fs.readFileSync(demo, "utf8");
  const rel = path.relative(root, demo);
  const refs = [
    ...[...src.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]),
    ...[...src.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]),
  ].filter((h) => !/^(https?:)?\/\//.test(h) && !h.startsWith("data:"));

  for (const href of refs) {
    checked++;
    const resolved = path.resolve(path.dirname(demo), href.split("?")[0]);

    // A demo is served from inside components/. Anything above it is not there.
    if (!resolved.startsWith(COMPONENTS + path.sep)) {
      console.log(`  OUTSIDE  ${rel}\n      ${href}`);
      console.log(`           resolves to ${path.relative(root, resolved)}, which is not served from components/`);
      problems++;
      continue;
    }
    if (!fs.existsSync(resolved)) {
      console.log(`  MISSING  ${rel}\n      ${href}  ->  ${path.relative(root, resolved)}`);
      problems++;
    }
  }
}

if (problems) {
  console.log(`\n${problems} broken reference(s) across ${demos.length} demos.`);
  console.log("A 404 stylesheet is not a build error: the page renders on fallback colours.");
  process.exit(1);
}
console.log(`${demos.length} standalone demos: ${checked} local references all resolve inside components/.`);
