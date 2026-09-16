#!/usr/bin/env node

/**
 * assemble-figma-export.js
 *
 * Turns a paged dump read out of Figma through the MCP server into
 * tokens/figma-export/pathwaytokens.json — the exact shape the
 * "Variables Import Export" plugin produces.
 *
 * WHY THIS EXISTS
 * The old pipeline required a designer to open Figma, run a plugin, and save a
 * JSON file by hand. That step is gone: an agent session reads the variables
 * straight from Figma through the MCP server instead. But `sync-tokens.js` is
 * tested and battle-worn, and CLAUDE.md §2 and §13 both say the established
 * transform is the only one to use. So rather than reimplement DTCG conversion,
 * this script reproduces the plugin's OUTPUT shape from MCP-read data, and
 * sync-tokens.js then runs completely unchanged.
 *
 * WHY THE INPUT IS PAGED
 * MCP tool responses are capped at roughly 20KB. The panel is ~2,300
 * variable-mode rows, so a single read truncates silently at around 350 rows —
 * which is the dangerous failure, because a truncated page produces a token file
 * that looks plausible and is quietly missing hundreds of tokens. The agent
 * therefore reads in pages and appends each to a directory of .tsv files, and
 * this script assembles them. It REFUSES to run when the row count does not
 * match what the first page declared, so a dropped page is a hard error rather
 * than silent data loss.
 *
 * INPUT FORMAT
 * Pipe-delimited (a pipe cannot appear in a Figma variable name, a tab can be
 * mangled in transit). First page carries the header:
 *
 *   #T|2277                                          total rows expected
 *   #M|Primitive: Color|Mode 1|COLOR                 one per collection
 *   #M|Semantic: Color|Light Mode~Midnight Mode|COLOR
 *   #G|Primitive: Color|Mode 1                       group marker: collection + mode
 *   Cool Neutral/0|#ffffff                           name|value
 *   Cool Neutral/0 @ 6%|#ffffff/0.06                 alpha as hex/float
 *   Fill/Action/Primary/Strong/Rest|@Brand/450       alias, @-prefixed
 *   Unit/16|16                                       number
 *   Family/Brand|Red Hat Text                        string
 *   Font Size/R|@Primitive: Type::Size/16            alias, collection-qualified
 *   ~FLOAT|Weight/400|400                            per-row type, MIXED collections
 *
 * WHY A COLLECTION MAY NEED PER-ROW TYPES
 * `#M` used to give a whole collection one type, taken from its first variable.
 * Two collections are not homogeneous: `Primitive: Type` is 5 STRING and 74
 * FLOAT, `Semantic: Type` is 1 STRING and 40 FLOAT. In both, the first variable
 * happens to be `Family/Brand` — a STRING — so all 114 numbers were typed as
 * strings, and Style Dictionary's px transform skips strings. The emitted CSS
 * read `letter-spacing: 0.3` and `line-height: 48`, unitless, which a browser
 * drops for letter-spacing and reinterprets as a ratio for line-height. It
 * built clean and passed every checker, which is the same failure shape as the
 * `calc(4px * 1px)` checkbox bug.
 *
 * So `#M` may declare `MIXED`, and in a MIXED collection every data row carries
 * its own type as a `~TYPE|` prefix. The value is still everything after the
 * LAST structural pipe, so a value containing a pipe is unaffected.
 *
 * WHY AN ALIAS MAY NEED ITS COLLECTION
 * A Figma variable name is unique only WITHIN a collection, and the panel really
 * does reuse names across them: `Family/Brand`, `Letter Spacing/Compact` and
 * `Letter Spacing/Wide` each exist in both `Primitive: Type` and `Semantic: Type`.
 * A bare `@Family/Brand` is therefore ambiguous, and resolving it by a flat
 * name -> collection map (which is what this script did until 2026-09-14) picks
 * whichever collection was read last. That produced two kinds of damage:
 *
 *   - `Semantic: Type / Family/Brand -> @Family/Brand` resolved onto ITSELF, so
 *     Style Dictionary failed the whole build with "Circular definition cycle".
 *     Loud, and therefore the harmless one.
 *   - `Letter Spacing/Spacious -> @Letter Spacing/Wide` resolved to the SEMANTIC
 *     Wide (0.1) instead of the PRIMITIVE Wide (0.3). No error, no warning, just
 *     a wrong number. That is the one worth this comment. It was caught before
 *     release rather than after — the previous export, produced by the retired
 *     plugin, carried `$collectionName` per alias and so got it right — but only
 *     because the circular pair above stopped the build hard enough to look at
 *     the type output at all.
 *
 * So an ambiguous bare alias is now a hard error naming the collections it could
 * mean, and `@<collection>::<name>` is the form that disambiguates it. The dumper
 * should emit the qualified form whenever the target name lives in more than one
 * collection; unambiguous aliases stay bare so existing dumps keep working.
 *
 * Usage:
 *   node scripts/assemble-figma-export.js <dir-of-tsv-pages>
 *   node scripts/assemble-figma-export.js <dir> --check     validate only
 *   node scripts/assemble-figma-export.js <dir> --out <path>
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const DEFAULT_OUT = "tokens/figma-export/pathwaytokens.json";
const TYPE_MAP = { COLOR: "color", FLOAT: "float", STRING: "string" };

function die(msg) {
  console.error(`assemble-figma-export: ${msg}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const checkOnly = args.includes("--check");
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : DEFAULT_OUT;
if (!dir) die("usage: assemble-figma-export.js <dir-of-tsv-pages> [--check] [--out <path>]");
if (!existsSync(dir)) die(`no such directory: ${dir}`);

// Pages are read in filename order, so name them p1, p2 … or 01, 02 …
const pages = readdirSync(dir).filter((f) => f.endsWith(".tsv")).sort((a, b) => {
  const na = Number(a.replace(/\D/g, "")), nb = Number(b.replace(/\D/g, ""));
  return Number.isFinite(na) && Number.isFinite(nb) ? na - nb : a.localeCompare(b);
});
if (!pages.length) die(`no .tsv pages in ${dir}`);

let declaredTotal = null;
const meta = new Map();            // collection -> { modes: [], type }
const rows = [];                   // { collection, mode, name, value }
// name -> Set(collections). A Set rather than a single value because the panel
// reuses some names across collections; see "WHY AN ALIAS MAY NEED ITS
// COLLECTION" in the header. A flat map here silently mis-resolved aliases.
const nameToCollections = new Map();
const noteName = (name, coll) => {
  if (!nameToCollections.has(name)) nameToCollections.set(name, new Set());
  nameToCollections.get(name).add(coll);
};
const reuse = [];                  // { coll, mode, rows, hash, where } from #R lines

let currentCollection = null, currentMode = null;
for (const page of pages) {
  const text = readFileSync(join(dir, page), "utf-8");
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const where = `${page}:${i + 1}`;

    if (line.startsWith("#T|")) { declaredTotal = Number(line.slice(3)); continue; }

    if (line.startsWith("#M|")) {
      const [, name, modes, type] = line.split("|");
      if (!name || !modes || !type) die(`${where}: malformed #M line`);
      if (type !== "MIXED" && !(type in TYPE_MAP)) {
        die(`${where}: unknown collection type "${type}". Expected MIXED or one of ${Object.keys(TYPE_MAP).join(", ")}`);
      }
      meta.set(name, { modes: modes.split("~"), type });
      continue;
    }

    // #R|<collection>|<mode>|<rows>|<fnv> — reuse an unchanged branch from the
    // PREVIOUS export instead of re-reading it. Roughly half the panel is type,
    // which changes far less often than colour, so re-transcribing it through an
    // agent session every time is pure waste. The row count and hash are taken
    // from Figma at dump time; they are recomputed against the previous export
    // below and a mismatch is a hard error. A branch is reused because it was
    // PROVEN identical, never because it was assumed to be.
    if (line.startsWith("#R|")) {
      const [, coll, mode, rows, hash] = line.split("|");
      if (!coll || !mode || !rows || !hash) die(`${where}: malformed #R line`);
      reuse.push({ coll, mode, rows: Number(rows), hash, where });
      continue;
    }

    if (line.startsWith("#G|")) {
      const [, coll, mode] = line.split("|");
      if (!coll || !mode) die(`${where}: malformed #G line`);
      currentCollection = coll;
      currentMode = mode;
      continue;
    }

    if (!currentCollection) die(`${where}: a data row appeared before any #G group marker`);

    // A row may open with "~TYPE|" to carry its own type. Strip that first, so
    // the name/value split below still only has to honour the FIRST pipe — a
    // value can legitimately contain one.
    let body = line;
    let rowType = null;
    if (body.startsWith("~")) {
      const tsep = body.indexOf("|");
      if (tsep < 0) die(`${where}: "~" type prefix with no delimiter`);
      rowType = body.slice(1, tsep);
      if (!(rowType in TYPE_MAP)) {
        die(`${where}: unknown row type "${rowType}". Expected one of ${Object.keys(TYPE_MAP).join(", ")}`);
      }
      body = body.slice(tsep + 1);
    }

    const sep = body.indexOf("|");
    if (sep < 0) die(`${where}: no delimiter in data row`);
    const name = body.slice(0, sep);
    const value = body.slice(sep + 1);
    if (!name) die(`${where}: empty variable name`);

    // A MIXED collection has no single type to fall back on, so a row without
    // its own type there is a dump bug and must not be guessed at. Guessing is
    // exactly how 114 numbers were emitted as unitless strings.
    const collType = meta.get(currentCollection)?.type;
    if (collType === "MIXED" && !rowType) {
      die(
        `${where}: "${currentCollection}" is declared MIXED, so every row must carry a ` +
        `"~TYPE|" prefix. "${name}" has none.`
      );
    }

    rows.push({ collection: currentCollection, mode: currentMode, name, value, rowType });
    noteName(name, currentCollection);
  }
}

if (declaredTotal === null) die("no #T line found — the first page must declare the row total");
if (!meta.size) die("no #M lines found — the first page must declare the collections");

// The check that makes paging safe. A dropped or truncated page shows up here as
// a count mismatch instead of as a silently short token file.
if (rows.length !== declaredTotal) {
  die(
    `row count mismatch: the dump declares ${declaredTotal} rows but contains ${rows.length}. ` +
    `A page was truncated or missed. Re-read from offset ${rows.length}, append the page, and re-run.`
  );
}

const dupes = new Map();
for (const r of rows) {
  const k = `${r.collection} ${r.mode} ${r.name}`;
  dupes.set(k, (dupes.get(k) ?? 0) + 1);
}
const repeated = [...dupes.entries()].filter(([, n]) => n > 1);
if (repeated.length) {
  die(
    `${repeated.length} duplicated (collection, mode, name) rows — a page was appended twice. ` +
    `First: ${repeated[0][0].split(" ").join(" / ")}`
  );
}

/**
 * Resolve every #R branch against the PREVIOUS export, verifying as we go.
 *
 * The hash must be computed identically on both sides: "name|value" lines,
 * sorted, joined with "\n". Use Math.imul for the FNV multiply — a plain
 * `h * 0x01000193` overflows 2^53 in a double and silently loses precision.
 */
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Flatten a plugin-shaped branch back into the dump's "name|value" lines.
 *
 * `ambiguous` is the set of variable names that exist in more than one
 * collection. Those must come back out in the collection-qualified alias form,
 * because that is what the dumper emits for them — and this function's output is
 * hashed against the dumper's, so the two spellings have to agree or every #R
 * reuse of a type branch fails with a bogus "this branch changed".
 */
function flattenBranch(tree, prefix = "", ambiguous = new Set(), mixed = false) {
  const DTCG_TO_DUMP = { color: "COLOR", float: "FLOAT", string: "STRING" };
  const lines = [];
  for (const [key, node] of Object.entries(tree)) {
    if (node && typeof node === "object" && "$value" in node) {
      // A MIXED collection's rows carry their type, so reproduce that here or
      // the hash will not match the dumper's for the same unchanged branch.
      const tp = mixed ? `~${DTCG_TO_DUMP[node.$type] ?? "STRING"}|` : "";
      const v = node.$value;
      const isAlias = typeof v === "string" && v.startsWith("{") && v.endsWith("}");
      if (!isAlias) {
        lines.push(`${tp}${prefix}${key}|${String(v)}`);
        continue;
      }
      const target = v.slice(1, -1).split(".").join("/");
      const qualify = ambiguous.has(target) && node.$collectionName;
      lines.push(`${tp}${prefix}${key}|@${qualify ? node.$collectionName + "::" : ""}${target}`);
    } else if (node && typeof node === "object") {
      lines.push(...flattenBranch(node, `${prefix}${key}/`, ambiguous, mixed));
    }
  }
  return lines;
}

/** Every variable name that appears in more than one collection of an export. */
function ambiguousNamesIn(base) {
  const seen = new Map();
  const walk = (tree, coll, prefix = "") => {
    for (const [key, node] of Object.entries(tree)) {
      if (node && typeof node === "object" && "$value" in node) {
        const n = `${prefix}${key}`;
        if (!seen.has(n)) seen.set(n, new Set());
        seen.get(n).add(coll);
      } else if (node && typeof node === "object") {
        walk(node, coll, `${prefix}${key}/`);
      }
    }
  };
  for (const branch of base) {
    for (const [coll, body] of Object.entries(branch)) {
      for (const tree of Object.values(body.modes ?? {})) walk(tree, coll);
    }
  }
  return new Set([...seen].filter(([, s]) => s.size > 1).map(([n]) => n));
}

const reusedBranches = new Map();   // collection -> { modes: { mode: tree } }
if (reuse.length) {
  if (!existsSync(outPath)) {
    die(
      `${reuse.length} #R line(s) ask to reuse branches from ${outPath}, but that file ` +
      `does not exist. Re-dump those collections in full instead of reusing them.`
    );
  }
  let base;
  try { base = JSON.parse(readFileSync(outPath, "utf-8")); }
  catch (e) { die(`cannot parse ${outPath} to reuse branches from: ${e.message}`); }

  const baseBranches = new Map();
  for (const branch of base) {
    for (const [coll, body] of Object.entries(branch)) baseBranches.set(coll, body.modes ?? {});
  }
  // Computed from the base export rather than from the dumped rows: a reused
  // branch's own names are not in nameToCollections yet, so a name shared
  // between a reused collection and a dumped one would look unambiguous here.
  const baseAmbiguous = ambiguousNamesIn(base);

  for (const r of reuse) {
    const modes = baseBranches.get(r.coll);
    if (!modes) die(`${r.where}: ${outPath} has no "${r.coll}" branch to reuse`);
    const tree = modes[r.mode];
    if (!tree) die(`${r.where}: ${outPath} has no "${r.coll}" / "${r.mode}" mode to reuse`);

    const lines = flattenBranch(tree, "", baseAmbiguous, meta.get(r.coll)?.type === "MIXED").sort();
    const gotHash = fnv1a(lines.join("\n"));
    if (lines.length !== r.rows || gotHash !== r.hash) {
      die(
        `${r.where}: "${r.coll}" / "${r.mode}" does NOT match Figma and cannot be reused.\n` +
        `  Figma reports  ${r.rows} rows, hash ${r.hash}\n` +
        `  ${outPath} has ${lines.length} rows, hash ${gotHash}\n` +
        `  This branch changed. Re-dump it as real #G rows instead of an #R line.`
      );
    }
    if (!reusedBranches.has(r.coll)) reusedBranches.set(r.coll, { modes: {} });
    reusedBranches.get(r.coll).modes[r.mode] = tree;
    // aliases elsewhere may target these names, so they must resolve
    for (const line of lines) noteName(line.slice(0, line.indexOf("|")), r.coll);
  }
}

/** Convert one raw value into the plugin's leaf shape. */
function leafFor(value, resolvedType) {
  const leaf = { $type: TYPE_MAP[resolvedType] ?? "string" };

  if (value.startsWith("@")) {
    const body = value.slice(1);
    if (body === "MISSING") return null;            // alias to a deleted variable

    // "@<collection>::<name>" pins the target collection explicitly. Required
    // when the target name exists in more than one collection, optional otherwise.
    const qualified = body.indexOf("::");
    let target, collection;
    if (qualified > 0) {
      collection = body.slice(0, qualified);
      target = body.slice(qualified + 2);
      if (!meta.has(collection)) {
        die(
          `alias "${value}" names collection "${collection}", which has no #M line. ` +
          `Declared collections: ${[...meta.keys()].join(", ")}`
        );
      }
    } else {
      target = body;
      const candidates = nameToCollections.get(target);
      if (!candidates) {
        // Not a fatal error on its own: the target may be declared later in the
        // dump. Leave $collectionName empty, exactly as before, and let
        // sync-tokens report it.
        collection = "";
      } else if (candidates.size === 1) {
        collection = [...candidates][0];
      } else {
        die(
          `alias "@${target}" is ambiguous: "${target}" exists in ` +
          `${[...candidates].map((c) => `"${c}"`).join(" and ")}. ` +
          `Re-dump it as "@<collection>::${target}" so the target is unambiguous. ` +
          `Guessing here is what would have given Letter Spacing/Spacious the wrong value.`
        );
      }
    }

    leaf.$collectionName = collection;
    leaf.$libraryName = "";
    leaf.$value = `{${target.split("/").join(".")}}`;
    return leaf;
  }

  if (resolvedType === "COLOR") {
    const slash = value.lastIndexOf("/");
    if (slash > 0) {
      const hex = value.slice(0, slash);
      const alpha = Number(value.slice(slash + 1));
      if (!Number.isFinite(alpha)) die(`bad alpha in colour value ${value}`);
      // the plugin writes 8-digit hex for a translucent colour
      leaf.$value = hex + Math.round(alpha * 255).toString(16).padStart(2, "0");
    } else {
      leaf.$value = value;
    }
    return leaf;
  }

  if (resolvedType === "FLOAT") {
    const n = Number(value);
    if (!Number.isFinite(n)) die(`expected a number for a FLOAT variable, got ${value}`);
    leaf.$value = n;
    return leaf;
  }

  leaf.$value = value;
  return leaf;
}

// build one branch per collection per mode
const out = [];
const dropped = [];
for (const [collection, info] of meta) {
  const modes = {};
  const reused = reusedBranches.get(collection);
  for (const mode of info.modes) {
    // a verified #R branch drops straight in; anything else starts empty and is
    // filled from the dumped rows below
    modes[mode] = reused && reused.modes[mode] ? reused.modes[mode] : {};
  }
  for (const r of rows) {
    if (r.collection !== collection) continue;
    if (!(r.mode in modes)) die(`row references mode "${r.mode}" not declared for ${collection}`);
    const leaf = leafFor(r.value, r.rowType ?? info.type);
    if (!leaf) { dropped.push(`${collection} / ${r.mode} / ${r.name}`); continue; }

    const segments = r.name.split("/");
    let node = modes[r.mode];
    for (const seg of segments.slice(0, -1)) {
      if (node[seg] && typeof node[seg] !== "object") die(`path collision building ${r.name}`);
      node = node[seg] ??= {};
    }
    node[segments[segments.length - 1]] = leaf;
  }
  out.push({ [collection]: { modes } });
}

const leaves = rows.length - dropped.length;
console.log(`pages read      : ${pages.length} (${pages.join(", ")})`);
console.log(`collections     : ${meta.size}`);
console.log(`rows dumped     : ${rows.length} — matches the declared total`);
if (reuse.length) {
  const reusedRows = reuse.reduce((n, r) => n + r.rows, 0);
  console.log(`branches reused : ${reuse.length} (${reusedRows} rows) — row count AND hash verified against Figma`);
  for (const r of reuse) console.log(`    ${r.coll} / ${r.mode}  ${r.rows} rows  ${r.hash}`);
}
console.log(`leaves written  : ${leaves}`);
if (dropped.length) {
  console.log(`aliases dropped : ${dropped.length} (target variable no longer exists)`);
  for (const d of dropped.slice(0, 10)) console.log(`    ${d}`);
  if (dropped.length > 10) console.log(`    … and ${dropped.length - 10} more`);
}

if (checkOnly) {
  console.log("--check passed; nothing written");
  process.exit(0);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log(`wrote           : ${outPath}`);
console.log(`next            : npm run sync-tokens && npm run build-dist`);
