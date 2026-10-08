/**
 * check-syntax.js: parse every component and story file.
 *
 * WHY, when `storybook build` already fails on a syntax error: the build takes
 * about three minutes and reports the error as a WARN line a long way above the
 * failure, so a typo costs three minutes and a scroll. This parses the same
 * files in about a second.
 *
 * It exists because of two real errors in one sitting, both of which a parser
 * catches instantly and neither of which is obvious by eye:
 *
 *   - A braced JSX comment in an arrow function's expression body, before the
 *     element starts. That position is not JSX yet, so the brace opens an
 *     expression and the parser wants a comma.
 *   - A block comment that QUOTED a closing JSX-comment delimiter. The
 *     delimiter inside the prose ended the comment three lines early and the
 *     rest of the prose parsed as code.
 *   - A braced JSX comment in ATTRIBUTE position, inside a tag's attribute
 *     list. Also not valid, also silent: it was in a demo's inline
 *     `type="text/babel"` script, which this check did not read, so the page
 *     published as a blank white document while every build stayed green and
 *     the only error was in a browser console nobody had open. That one was
 *     mine, introduced in 965ddb2 and live for about an hour: button.html had
 *     been rendering unstyled because of a separate broken token path, and the
 *     edit that was meant to note an accessibility fix stopped it rendering at
 *     all. The two failures looked identical from outside, which is why the
 *     first diagnosis blamed the token path for both.
 *
 * So it reads the inline Babel scripts in components/**\/*.html as well as the
 * .jsx and .js files. Those scripts are what the twelve hand-written standalone
 * demos are made of, and nothing else parses them.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as babel from "@babel/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOTS = ["components", "src"].map((d) => path.join(__dirname, "..", d));

const files = [];
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== "node_modules") walk(p); }
      else if (/\.(jsx|js)$/.test(e.name)) files.push(p);
      else if (/\.html$/.test(e.name)) files.push(p);
    }
  })(root);
}

/** Every <script type="text/babel"> body in an html file, with its line offset. */
function babelScripts(src) {
  const out = [];
  const re = /<script\b[^>]*type=["']text\/babel["'][^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(src))) {
    out.push({ code: m[1], line: src.slice(0, m.index).split("\n").length });
  }
  return out;
}

const bad = [];
for (const f of files) {
  if (/\.html$/.test(f)) {
    const src = fs.readFileSync(f, "utf8");
    const scripts = babelScripts(src);
    // A demo with no inline Babel script is a plain page; nothing to parse.
    for (const sc of scripts) {
      try {
        babel.transform(sc.code, {
          presets: [["@babel/preset-react"]], babelrc: false, configFile: false,
          filename: f,
        });
      } catch (e) {
        bad.push([f, `inline text/babel script near line ${sc.line}: ${String(e.message).split("\n")[0]}`]);
      }
    }
    continue;
  }
  try {
    babel.transformFileSync(f, { presets: [["@babel/preset-react"]], babelrc: false, configFile: false });
  } catch (e) {
    bad.push([f, String(e.message).split("\n")[0]]);
  }
}

const rel = (f) => path.relative(path.join(__dirname, ".."), f);
if (bad.length) {
  console.log("FILES THAT DO NOT PARSE\n");
  for (const [f, m] of bad) console.log(`  ${rel(f)}\n      ${m}`);
  console.log(`\n${bad.length} of ${files.length} files do not parse.`);
  process.exit(1);
}
console.log(`${files.length} component, story and demo files parse, inline Babel scripts included.`);
