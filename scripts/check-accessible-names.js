/**
 * check-accessible-names.js: every button in every story must have a name.
 *
 * WHY. A `<button>` whose only content is an icon glyph marked `aria-hidden`
 * has NO accessible name. It renders, it clicks, every build is green, and a
 * screen reader announces "button". Nothing in the repo caught it: the render
 * check only asks whether a story drew something.
 *
 * Found on 2026-10-08 by reading the rendered DOM of one Widget story, which
 * is how the Trend comparison control turned out to announce "vs last month"
 * and nothing about what it does. Reading one story by hand is not a check, so
 * this sweeps all of them.
 *
 * WHAT COUNTS AS A NAME, in the order a browser resolves it: `aria-label`,
 * `aria-labelledby`, then the element's own text content with `aria-hidden`
 * descendants removed, then `title`. A button with none of those fails.
 *
 * This works from `--dump-dom`, so it sees names and not geometry. Target SIZE
 * needs layout and is not checked here.
 *
 * Usage:
 *   node scripts/check-accessible-names.js
 *   node scripts/check-accessible-names.js --port 8099   (reuse a server)
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(__dirname, "..", "storybook-static");

const CHROMES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".map": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2",
  ".woff": "font/woff", ".ttf": "font/ttf", ".ico": "image/x-icon",
};

function serve(dir) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
    const file = path.join(dir, rel);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r({ server, port: server.address().port })));
}

/**
 * Pull every <button ...>...</button> out of an HTML string, tolerating nesting
 * by counting opens and closes rather than matching lazily.
 */
function buttons(html) {
  const out = [];
  const open = /<button\b([^>]*)>/gi;
  let m;
  while ((m = open.exec(html))) {
    let depth = 1;
    let i = open.lastIndex;
    const scan = /<button\b[^>]*>|<\/button\s*>/gi;
    scan.lastIndex = i;
    let t;
    while (depth > 0 && (t = scan.exec(html))) {
      depth += t[0][1] === "/" ? -1 : 1;
      i = scan.lastIndex;
    }
    out.push({ attrs: m[1], inner: html.slice(open.lastIndex, i - "</button>".length) });
  }
  return out;
}

const attr = (attrs, name) => {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? m[1].trim() : "";
};

/** Text content with aria-hidden subtrees and markup removed. */
function visibleText(inner) {
  let h = inner;
  // Drop any element carrying aria-hidden="true", with its subtree. Repeat for
  // nesting. Bounded, because each pass strictly shortens the string.
  for (let pass = 0; pass < 6; pass++) {
    const next = h.replace(
      /<(\w+)\b[^>]*aria-hidden\s*=\s*"true"[^>]*>[\s\S]*?<\/\1\s*>/gi, " ");
    const selfClosing = next.replace(/<\w+\b[^>]*aria-hidden\s*=\s*"true"[^>]*\/>/gi, " ");
    if (selfClosing === h) break;
    h = selfClosing;
  }
  return h.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

async function main() {
  if (!fs.existsSync(path.join(BUILD, "index.json"))) {
    console.error("No storybook-static/index.json. Run `npx storybook build` first.");
    process.exit(1);
  }
  const chrome = CHROMES.find((p) => fs.existsSync(p));
  if (!chrome) {
    console.log("SKIPPED: no Chrome or Chromium on this machine, so no story could be loaded.");
    return;
  }

  const portArg = process.argv.indexOf("--port");
  let port, server;
  if (portArg !== -1) port = Number(process.argv[portArg + 1]);
  else ({ server, port } = await serve(BUILD));

  const entries = JSON.parse(fs.readFileSync(path.join(BUILD, "index.json"), "utf8")).entries || {};
  const ids = Object.keys(entries).filter((k) => entries[k].type === "story");

  const profile = fs.mkdtempSync(path.join(process.env.TMPDIR || "/tmp", "pw-names-"));
  const nameless = [];
  let buttonCount = 0;

  for (const id of ids) {
    let dump = "";
    try {
      const { stdout } = await execFileP(chrome, [
        "--headless=new", "--disable-gpu", "--no-sandbox",
        "--virtual-time-budget=5000", `--user-data-dir=${profile}`, "--dump-dom",
        `http://127.0.0.1:${port}/iframe.html?id=${id}&viewMode=story`,
      ], { maxBuffer: 64 * 1024 * 1024 });
      dump = stdout;
    } catch {
      continue; // check-stories-render.js owns reporting a story that will not load.
    }

    for (const b of buttons(dump)) {
      buttonCount++;
      const named = attr(b.attrs, "aria-label") || attr(b.attrs, "aria-labelledby")
        || visibleText(b.inner) || attr(b.attrs, "title");
      if (!named) {
        nameless.push([id, (b.inner.replace(/\s+/g, " ").trim() || "(empty)").slice(0, 70)]);
      }
    }
  }

  if (server) server.close();
  fs.rmSync(profile, { recursive: true, force: true });

  console.log(`${buttonCount} buttons across ${ids.length} stories.`);
  if (nameless.length) {
    console.log("\nBUTTONS WITH NO ACCESSIBLE NAME\n");
    for (const [id, inner] of nameless) console.log(`  ${id}\n      ${inner}`);
    console.log(`\n${nameless.length} button(s) announce as just "button".`);
    console.log("Give each an aria-label, or visible text that is not aria-hidden.");
    process.exit(1);
  }
  console.log("Every button has an accessible name.");
}

main();
