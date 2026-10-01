/**
 * sync-demo-module-icon.js — keep the demos' inline ModuleIcon in step with the
 * shipped module.
 *
 * WHY THIS EXISTS
 * A demo is a self-contained React-plus-Babel CDN page, so it cannot resolve a
 * bare import and has to carry the artwork inline. Three demos carried it:
 * top-nav.html, nav-shell.html and module-icon.html, and all three held a
 * byte-identical 35kB hand-copy. When Figma moved the Module.Icon canvas from
 * 24x24 to 16x16 on 2026-10-01 the shipped .jsx was updated and all three
 * copies silently kept drawing the old marks. Nothing failed: the pages built,
 * the gate passed, and the icons were simply wrong.
 *
 * So the copies are now GENERATED from components/module-icon/module-icon.jsx,
 * which is the single source. Run it after any change to the artwork. The
 * generated region is fenced by markers; everything outside them is the demo's
 * own code and is untouched.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "components/module-icon/module-icon.jsx";
const TARGETS = [
  "components/top-nav/top-nav.html",
  "components/nav-shell/nav-shell.html",
  "components/module-icon/module-icon.html",
];
const BEGIN = "/* BEGIN GENERATED module-icon — npm run sync-demo-module-icon */";
const END = "/* END GENERATED module-icon */";

const src = readFileSync(SRC, "utf8");

/** Lift an exported object literal out of the module by brace matching. */
function lift(name) {
  const at = src.indexOf(`export const ${name} = {`);
  if (at < 0) throw new Error(`${name} not found in ${SRC}`);
  const open = src.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced braces in ${name}`);
}

const identity = lift("MODULE_IDENTITY");
const art = lift("ART");
const labels = lift("MODULE_LABELS");
// MODULES is an array, not an object, so it is lifted with its own matcher.
const modulesList = (() => {
  const at = src.indexOf("export const MODULES = [");
  if (at < 0) throw new Error("MODULES not found");
  const open = src.indexOf("[", at);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error("unbalanced brackets in MODULES");
})();
const viewbox = /export const VIEWBOX = (\d+);/.exec(src)?.[1];
if (!viewbox) throw new Error("VIEWBOX not found");
// EQUIP_GRADIENT is now nested per treatment, so the brace matcher is needed.
const grad = (() => {
  const at = src.indexOf("const EQUIP_GRADIENT = {");
  if (at < 0) throw new Error("EQUIP_GRADIENT not found");
  const open = src.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error("unbalanced braces in EQUIP_GRADIENT");
})();
if (!grad) throw new Error("EQUIP_GRADIENT not found");

// The demo copy is the same logic as the module, written against React from the
// CDN global rather than an import.
const block = `${BEGIN}
/* Generated from ${SRC}. Do NOT edit here — edit the module and re-run. */
const MODULE_IDENTITY = ${identity};
const MODULES = ${modulesList};
const MODULE_LABELS = ${labels};
const VIEWBOX = ${viewbox};
const EQUIP_GRADIENT = ${grad};
const ART = ${art};

function moduleFill(module, role, color, gradId) {
  if (color === "mono") return "currentColor";
  if (role === "g") return "url(#" + gradId + ")";
  const key = color === "one-color" ? "base" : (role === "s" ? "subtle" : "base");
  return "var(--module-" + module + "-" + key + ", var(--module-" + module + "-base))";
}

function ModuleIcon({ module, size = VIEWBOX, color = "two-color", treatment = "base", title, style, ...rest }) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = "pw-equip-" + uid;
  const set = ART[treatment] || ART.base;
  const paths = set[module];
  if (!paths) return null;
  let resolved = color === "full" ? "two-color" : color;
  if (treatment === "rippled" && resolved === "one-color") resolved = "two-color";
  const needsGradient = resolved !== "mono" && paths.some(([role]) => role === "g");
  const vars = resolved === "mono" ? {} : MODULE_IDENTITY;
  const grad = EQUIP_GRADIENT[treatment] || EQUIP_GRADIENT.base;
  return (
    <svg width={size} height={size} viewBox={"0 0 " + VIEWBOX + " " + VIEWBOX}
      fill="none" xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: "block", flex: "0 0 auto", ...vars, ...style }}
      {...rest}>
      {title && <title>{title}</title>}
      {needsGradient && (
        <defs>
          <linearGradient id={gradId}
            x1={grad.x1} y1={grad.y1} x2={grad.x2} y2={grad.y2}
            gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--module-equip-from)" />
            <stop offset="1" stopColor="var(--module-equip-to)" />
          </linearGradient>
        </defs>
      )}
      {paths.map(([role, d], i) => (
        <path key={i} d={d} fill={moduleFill(module, role, resolved, gradId)} />
      ))}
    </svg>
  );
}
${END}`;

let written = 0;
for (const target of TARGETS) {
  let html = readFileSync(target, "utf8");
  if (html.includes(BEGIN)) {
    const a = html.indexOf(BEGIN);
    const b = html.indexOf(END) + END.length;
    html = html.slice(0, a) + block + html.slice(b);
  } else {
    // First run: replace the hand-copied region, from MODULE_IDENTITY to the
    // end of the ModuleIcon function, found by brace matching.
    const a = html.indexOf("const MODULE_IDENTITY = {");
    if (a < 0) throw new Error(`no MODULE_IDENTITY in ${target}`);
    const fn = html.indexOf("function ModuleIcon(", a);
    if (fn < 0) throw new Error(`no ModuleIcon in ${target}`);
    const open = html.indexOf("{", html.indexOf(")", fn));
    let depth = 0, b = -1;
    for (let i = open; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) { b = i + 1; break; }
      }
    }
    if (b < 0) throw new Error(`unbalanced ModuleIcon in ${target}`);
    html = html.slice(0, a) + block + html.slice(b);
  }
  writeFileSync(target, html);
  written++;
}
// Counted by scanning the literal rather than JSON.parse: the lifted source is
// JavaScript with trailing commas, which is not valid JSON.
const treatments = (art.match(/^\s{2}[a-z]+: \{/gm) || []).length;
const moduleCount = (art.match(/^\s{4}"[a-z-]+": \[/gm) || []).length;
const pathCount = (art.match(/^\s{6}\["[bsg]",/gm) || []).length;
console.log(
  `module-icon: ${written} demos regenerated from ${SRC} ` +
    `(viewBox ${viewbox}, ${treatments} treatments, ${moduleCount} module entries, ${pathCount} paths).`,
);
