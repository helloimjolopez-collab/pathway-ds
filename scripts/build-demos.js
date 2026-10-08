/**
 * build-demos.js: generate a standalone .html demo per component by BUNDLING
 * the real module.
 *
 * WHY, when eight components already have one. Each of those eight is
 * hand-written, and the top of its script block says so: "Mirrors
 * components/<name>/<name>.jsx exactly. Keep the two in step." That is a second
 * implementation of a shipped component, kept correct by somebody remembering.
 * The token CSS in those files is LINKED from src/tokens and therefore cannot
 * drift; the component is copied and can.
 *
 * Widget, KPI Tile and Dashboard went without a standalone demo for exactly
 * that reason, which left them the only components on the shelf with no
 * hands-on resize page and no `StandaloneDemo` story. Generating is the way to
 * have both: esbuild bundles `<name>-demo.jsx`, which imports the real
 * component, and this writes an html that loads the bundle and links the same
 * nine token files every other demo links. One implementation, and a demo that
 * cannot fall behind it.
 *
 * The eight hand-written demos are left alone. Converting them is a separate
 * job with its own review, and a rewrite of a working page is not something to
 * fold into an unrelated change.
 *
 * TOKENS ARE COPIED INTO components/_demo/tokens/ AND LINKED FROM THERE, which
 * looks like the duplication this script exists to avoid. It is not, because
 * the copies are generated on every build and `--check` fails when they drift,
 * the same guarantee as the bundle. The reason not to link src/tokens directly
 * is that the path does not resolve where these pages are served:
 *
 *   - In the built Storybook, `staticDirs` mounts components/ and nothing else,
 *     so `../../src/tokens/primitives.css` from an iframed demo is a 404.
 *   - On GitHub Pages, the workflow copies components/ and puts the token
 *     contract at /tokens/, so the same link is a 404 there too. Verified
 *     against the live site on 2026-10-08: /src/tokens/primitives.css was 404
 *     while /tokens/primitives.css was 200. Every one of the eight existing
 *     demos has therefore been published with no tokens at all, rendering on
 *     fallback colours. The deploy workflow now also copies src/tokens so
 *     those eight resolve; this script does not depend on that fix.
 *
 * Mounting src/tokens in staticDirs would fix the first case and is the wrong
 * fix: staticDirs takes a directory, so it would also publish
 * primitives-newco.css and both NewCo themes to a public, indexable site.
 * components/_demo/tokens/ holds the nine public files and nothing else.
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Every generated demo. `title` is the <title>; the page's own H1 is the harness's. */
const DEMOS = [
  { dir: "widget", entry: "widget-demo.jsx", out: "widget.html", title: "Pathway Widget" },
  { dir: "kpi-tile", entry: "kpi-tile-demo.jsx", out: "kpi-tile.html", title: "Pathway KPI Tile" },
  { dir: "dashboard", entry: "dashboard-demo.jsx", out: "dashboard.html", title: "Pathway Dashboard" },
];

/* The nine-file token contract, in load order. primitives FIRST: the themes
   reference it through var(), so a theme loaded first resolves to nothing.
   Copied from the link list every existing demo carries, so a demo and
   Storybook resolve identical values. NewCo is deliberately absent: these
   pages ship to GitHub Pages, which is public. */
const TOKEN_CSS = [
  "primitives.css",
  "themes/light.css",
  "themes/midnight.css",
  "layout.css",
  "layout-contextual.css",
  "layout-responsive.css",
  "type.css",
  "motion.css",
  "breakpoints.css",
];

/* Files a demo needs that do not live in components/, copied in beside the
   demos so every link resolves wherever the page is served. `dist/` is not
   published and not served: `pathway-sidenav.html` loaded
   `../../dist/pathway-sidenav.js`, which is 404 on the live site, so that page
   has been shipping as a blank document. */
const COPY_IN = [
  { from: "dist/pathway-sidenav.js", to: "pathway-sidenav.js" },
];

/* The nine public files, copied next to the demos so the link resolves wherever
   the page is served. NewCo is excluded by construction: this is a list, not a
   directory copy, and `check` below fails if a copy falls behind its source. */
function syncTokens({ check }) {
  const dest = path.join(root, "components", "_demo", "tokens");
  fs.mkdirSync(path.join(dest, "themes"), { recursive: true });
  let stale = 0;
  for (const f of TOKEN_CSS) {
    const from = path.join(root, "src", "tokens", f);
    const to = path.join(dest, f);
    const want = fs.readFileSync(from, "utf8");
    const have = fs.existsSync(to) ? fs.readFileSync(to, "utf8") : null;
    if (want === have) continue;
    if (check) { console.error(`  STALE  components/_demo/tokens/${f}`); stale++; continue; }
    fs.writeFileSync(to, want);
  }
  for (const c of COPY_IN) {
    const from = path.join(root, c.from);
    const to = path.join(root, "components", "_demo", c.to);
    if (!fs.existsSync(from)) {
      // build-dist emits it before this script runs. On a fresh clone with no
      // build, say so rather than writing a demo that cannot load.
      console.error(`  NOT BUILT  ${c.from} is missing; run \`npm run build-elements\` first`);
      stale++;
      continue;
    }
    const want = fs.readFileSync(from);
    const have = fs.existsSync(to) ? fs.readFileSync(to) : null;
    if (have && want.equals(have)) continue;
    if (check) { console.error(`  STALE  components/_demo/${c.to}`); stale++; continue; }
    fs.writeFileSync(to, want);
  }

  // Anything in the destination that is NOT on the list is removed, which is
  // what keeps a NewCo file from surviving a rename of this list.
  for (const dir of [dest, path.join(dest, "themes")]) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) continue;
      const relName = dir === dest ? e.name : `themes/${e.name}`;
      if (TOKEN_CSS.includes(relName)) continue;
      if (check) { console.error(`  EXTRA  components/_demo/tokens/${relName}`); stale++; }
      else fs.rmSync(path.join(dir, e.name));
    }
  }
  return stale;
}

const page = ({ title, bundle }) => `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>

<!-- GENERATED by scripts/build-demos.js from ${bundle.replace(/\.js$/, ".jsx")}.
     Do not edit this file: the next build overwrites it. The component it shows
     is the real module, bundled, so there is no copy here to keep in step. -->

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />

${TOKEN_CSS.map((f) => `<link rel="stylesheet" href="../_demo/tokens/${f}" />`).join("\n")}

<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--semantic-color-fill-surface-canvas);
    color: var(--semantic-color-foreground-static-neutral-base);
    font-family: "Red Hat Text", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .material-symbols-rounded {
    font-family: "Material Symbols Rounded";
    font-weight: normal; font-style: normal;
    line-height: 1; letter-spacing: normal; text-transform: none;
    display: inline-block; white-space: nowrap; word-wrap: normal;
    direction: ltr; -webkit-font-feature-settings: "liga"; font-feature-settings: "liga";
  }
</style>
</head>
<body>
<div id="root"></div>
<script type="module" src="./${bundle}"></script>
</body>
</html>
`;

const check = process.argv.includes("--check");
let stale = syncTokens({ check });

for (const d of DEMOS) {
  const entry = path.join(root, "components", d.dir, d.entry);
  if (!fs.existsSync(entry)) {
    console.error(`  MISSING  components/${d.dir}/${d.entry}`);
    process.exit(1);
  }
  const bundleName = d.entry.replace(/\.jsx$/, ".js");
  const bundlePath = path.join(root, "components", d.dir, bundleName);
  const htmlPath = path.join(root, "components", d.dir, d.out);

  const before = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath, "utf8") : null;

  execFileSync("npx", [
    "esbuild", entry,
    "--bundle", "--format=esm", "--minify",
    "--loader:.jsx=jsx", "--jsx=automatic",
    "--define:process.env.NODE_ENV=\"production\"",
    `--outfile=${bundlePath}`,
  ], { cwd: root, stdio: ["ignore", "ignore", "inherit"] });

  const after = fs.readFileSync(bundlePath, "utf8");
  const html = page({ title: d.title, bundle: bundleName });
  const htmlBefore = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : null;

  if (check) {
    if (before !== after || htmlBefore !== html) {
      console.error(`  STALE  components/${d.dir}/${d.out} is behind its source`);
      stale++;
    }
    if (before !== null && before !== after) fs.writeFileSync(bundlePath, before);
    continue;
  }

  fs.writeFileSync(htmlPath, html);
  const kb = (Buffer.byteLength(after) / 1024).toFixed(1);
  console.log(`  components/${d.dir}/${d.out}  (bundle ${kb}kb)`);
}

if (check && stale) {
  console.error(`\n${stale} generated demo(s) are stale. Run \`npm run build-demos\`.`);
  process.exit(1);
}
if (!check) {
  console.log(`${DEMOS.length} standalone demos generated from their real modules, ` +
              `with ${TOKEN_CSS.length} public token files beside them.`);
}
