/**
 * check-stories-render.js — load every built story in headless Chrome and fail
 * if any of them renders nothing.
 *
 * WHY `storybook build` IS NOT ENOUGH. A module-level ReferenceError in a CSF
 * file blanks every story in that file while the build stays green. It has
 * happened three times in this repo:
 *
 *   - a leftover `TopNavSearchStory.storyName = …` after a rename blanked all
 *     nine Global Search stories;
 *   - a `BRAND_AXIS` reference left behind when preview.js was stripped;
 *   - `useState` used in kpi-number-trend.jsx without being imported, which
 *     blanked the Widget Glance configurations story.
 *
 * Webpack compiles all three happily. Only loading the page finds them.
 *
 * WHY THE EMPTINESS TEST IS WRITTEN THE WAY IT IS. The first version of this
 * sweep matched `<div id="storybook-root"…>(.*?)</div></body>` with a
 * `(.*)` fallback, and that fallback swallowed the document's whole tail. An
 * EMPTY root measured 1580 bytes and passed a "shorter than 200" test, so the
 * sweep reported 107 of 107 fine while one story rendered nothing. The root's
 * content is what sits between its own tag and the `storybook-docs` div that
 * follows it, and nothing else.
 *
 * Usage:
 *   npx storybook build
 *   node scripts/check-stories-render.js            (serves the build itself)
 *   node scripts/check-stories-render.js --port 8099 (reuse a running server)
 *
 * It needs Google Chrome on the machine. With no Chrome it SKIPS rather than
 * failing, because a missing browser is not a broken story, and says so.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "storybook-static");

const CHROMES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

/** Stories whose root is legitimately empty of text. */
const TEXTLESS_OK = [
  /--standalone-demo$/,        // an <iframe> of the component's own html demo
  /web-component/,             // shadow DOM: the content is not in the light tree
  /spinner--playground$/,      // an SVG with no text
];

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".map": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".ico": "image/x-icon", ".txt": "text/plain", ".md": "text/markdown",
};

function serve(dir) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
    const file = path.join(dir, rel || "index.html");
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, port: server.address().port })));
}

/** The root div's own content: between its tag and the storybook-docs div. */
function rootHtml(dump) {
  const m = dump.match(/<div id="storybook-root"[^>]*>/);
  if (!m) return null;
  const start = m.index + m[0].length;
  let end = dump.indexOf('<div id="storybook-docs"', start);
  if (end === -1) end = dump.indexOf("</body>", start);
  if (end === -1) return null;
  const inner = dump.slice(start, end);
  const close = inner.lastIndexOf("</div>");
  return inner.trimEnd().endsWith("</div>") && close !== -1 ? inner.slice(0, close) : inner;
}

const textOf = (h) =>
  h.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
   .replace(/<[^>]+>/g, " ")
   .replace(/\s+/g, " ")
   .trim();

async function main() {
  if (!fs.existsSync(path.join(BUILD, "index.json"))) {
    console.error("No storybook-static/index.json. Run `npx storybook build` first.");
    process.exit(1);
  }
  const chrome = CHROMES.find((p) => fs.existsSync(p));
  if (!chrome) {
    console.log("SKIPPED: no Chrome or Chromium on this machine, so no story could be loaded.");
    console.log("A missing browser is not a broken story. Install Chrome to run this check.");
    return;
  }

  const portArg = process.argv.indexOf("--port");
  let port, server;
  if (portArg !== -1) {
    port = Number(process.argv[portArg + 1]);
  } else {
    ({ server, port } = await serve(BUILD));
  }

  const entries = JSON.parse(fs.readFileSync(path.join(BUILD, "index.json"), "utf8")).entries || {};
  const ids = Object.keys(entries).filter((k) => entries[k].type === "story");

  const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || "/tmp", "pw-sweep-"));
  const broken = [];
  const blank = [];
  const textless = [];

  for (const id of ids) {
    let dump = "";
    try {
      const { stdout } = await execFileP(chrome, [
        "--headless=new", "--disable-gpu", "--no-sandbox",
        "--virtual-time-budget=5000", `--user-data-dir=${profile}`, "--dump-dom",
        `http://127.0.0.1:${port}/iframe.html?id=${id}&viewMode=story`,
      ], { maxBuffer: 64 * 1024 * 1024 });
      dump = stdout;
    } catch (e) {
      broken.push([id, `chrome failed: ${String(e.message).slice(0, 120)}`]);
      continue;
    }

    const seg = dump.split("sb-errordisplay");
    if (seg.length > 1 && !seg[1].slice(0, 300).includes("display: none")) {
      const m = dump.match(/id="error-message"[^>]*>([\s\S]*?)</);
      broken.push([id, (m ? m[1] : "error overlay shown").slice(0, 200).replace(/\s+/g, " ")]);
      continue;
    }
    const h = rootHtml(dump);
    if (h === null) { broken.push([id, "no storybook-root in the dump"]); continue; }
    if (h.trim().length < 80) { blank.push([id, h.trim().length]); continue; }
    if (textOf(h).length < 10 && !TEXTLESS_OK.some((re) => re.test(id))) {
      textless.push([id, h.trim().length]);
    }
  }

  if (server) server.close();
  fs.rmSync(profile, { recursive: true, force: true });

  const okCount = ids.length - broken.length - blank.length;
  console.log(`${okCount} of ${ids.length} stories render.`);
  for (const [id, why] of broken) console.error(`  ERRORED  ${id}\n             ${why}`);
  for (const [id, n] of blank) console.error(`  BLANK    ${id}  (root is ${n} bytes: the story rendered nothing)`);
  for (const [id, n] of textless) console.error(`  NO TEXT  ${id}  (root is ${n} bytes but has no readable text)`);

  if (broken.length || blank.length || textless.length) {
    console.error("\nA blank story means the build compiled and the page still shows nothing,");
    console.error("usually a module-level error in its CSF file. Open the id in Storybook.");
    process.exit(1);
  }
  console.log("Every story renders content.");
}

main();
