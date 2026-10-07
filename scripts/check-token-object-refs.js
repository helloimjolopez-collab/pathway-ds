/**
 * check-token-object-refs.js, fail the build when a component reads a key that
 * its token object does not have.
 *
 * WHY THIS EXISTS
 * The token objects (T, L, ST) are plain nested literals, so `T.foreground.x`
 * on an object whose keys are `text` and `icon` is not a syntax error and not a
 * type error. esbuild bundles it, Style Dictionary is untouched, every token
 * check passes, Storybook builds with nothing but size warnings. It throws only
 * when React renders, and the failure mode is a BLANK PAGE.
 *
 * That is not hypothetical. `T.foreground.actionSecondary` was referenced in
 * six places across sidenav.html, sidenav.jsx and SideNav.stories.jsx while T
 * had only `fill`, `surface`, `text`, `icon`, `indicator` and `radius`. It
 * almost certainly arrived with the historical token merge, where `text.*` and
 * `icon.*` became `foreground.*` in the token set and the call sites were
 * renamed but the object's own keys were not. The result: the flagship SideNav
 * demo and EVERY SideNav story rendered nothing, and both were committed and
 * shipped that way, because nothing in the pipeline looks at property access.
 *
 * In SideNav.stories.jsx the bad read sat in a module-level array, so it threw
 * at import time and took down all sixteen stories at once.
 *
 * Cross-file is the point: the stories file imports T from sidenav.jsx, so a
 * check that only looked at objects declared in the same file (the first
 * version of this sweep) missed the worst instance.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve as resolvePath, dirname } from "node:path";

const ROOTS = ["components", "src/stories"];
const EXTS = [".jsx", ".html", ".js"];

function files(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) files(p, out);
    else if (EXTS.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

// Top-level keys of `const <name> = { ... }`, by brace matching so nested
// objects and template strings inside the literal do not confuse it.
function objectKeys(src, name) {
  const m = new RegExp(`const ${name}\\s*=\\s*\\{`).exec(src);
  if (!m) return null;
  const start = src.indexOf("{", m.index);
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) { end = i; break; }
  }
  if (end === -1) return null;
  const body = src.slice(start, end + 1);
  const keys = new Set();
  let d = 0;
  for (const line of body.split("\n")) {
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    if (d === 1) { const km = line.match(/^\s*([A-Za-z_$][\w$]*)\s*:/); if (km) keys.add(km[1]); }
    d += opens - closes;
  }
  return keys;
}

const all = ROOTS.flatMap((r) => files(r));
const sources = new Map(all.map((p) => [p, readFileSync(p, "utf8")]));

// Where each object is DECLARED, so an importer can be resolved back to it.
const declared = new Map(); // "path:name" -> Set(keys)
for (const [p, src] of sources) {
  for (const name of ["T", "L", "ST", "SCROLL"]) {
    const k = objectKeys(src, name);
    if (k && k.size) declared.set(`${p}:${name}`, k);
  }
}

const problems = [];
for (const [p, src] of sources) {
  // Which declaration does each name in this file point at? Local wins;
  // otherwise follow the relative import it was named in.
  const origin = new Map();
  for (const name of ["T", "L", "ST", "SCROLL"]) {
    if (declared.has(`${p}:${name}`)) { origin.set(name, `${p}:${name}`); continue; }
    for (const im of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)) {
      const names = im[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop());
      if (!names.includes(name)) continue;
      if (!im[2].startsWith(".")) continue;
      const target = resolvePath(dirname(p), im[2]);
      for (const cand of [target, target + ".jsx", target + ".js"]) {
        const rel = cand.replace(process.cwd() + "/", "");
        if (declared.has(`${rel}:${name}`)) { origin.set(name, `${rel}:${name}`); break; }
      }
    }
  }
  for (const [name, key] of origin) {
    const keys = declared.get(key);
    const seen = new Set();
    for (const m of src.matchAll(new RegExp(`\\b${name}\\.([A-Za-z_$][\\w$]*)\\.`, "g"))) {
      const prop = m[1];
      if (keys.has(prop) || seen.has(prop)) continue;
      seen.add(prop);
      const line = src.slice(0, m.index).split("\n").length;
      problems.push({ p, line, name, prop, keys: [...keys].sort(), from: key.split(":")[0] });
    }
  }
}

if (!problems.length) {
  console.log(`token object refs: ok (${declared.size} objects, ${sources.size} files, cross-file imports followed)`);
  process.exit(0);
}
console.error(`token object refs: ${problems.length} reference(s) to a key that does not exist.\n`);
for (const x of problems) {
  console.error(`  ${x.p}:${x.line}`);
  console.error(`    reads ${x.name}.${x.prop}.* but ${x.name} (declared in ${x.from}) has no "${x.prop}" key`);
  console.error(`    available: ${x.keys.join(", ")}\n`);
}
console.error("This builds clean and throws at render time, so the page goes blank. Fix before shipping.");
process.exit(1);
