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
    }
  })(root);
}

const bad = [];
for (const f of files) {
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
console.log(`${files.length} component and story files parse.`);
