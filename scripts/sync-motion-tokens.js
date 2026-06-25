#!/usr/bin/env node
/**
 * sync-motion-tokens.js
 *
 * Reads motion values from docs/design-system-spec.md §2 (the single source
 * of truth for motion) and writes tokens/motion-tokens.json so Style Dictionary
 * can emit --motion-* CSS variables.
 *
 * Run automatically as part of `npm run sync-tokens`. Also run standalone via
 * `npm run sync-motion-tokens` after editing motion values in design-system-spec.md.
 *
 * Never edit tokens/motion-tokens.json directly — it is derived from the spec.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = resolve(__dirname, "..", "docs", "design-system-spec.md");
const OUTPUT_PATH = resolve(__dirname, "..", "tokens", "motion-tokens.json");

const spec = readFileSync(SPEC_PATH, "utf8");

// ─── helpers ────────────────────────────────────────────────────────────────

function extractSection(text, heading) {
  const start = text.indexOf(heading);
  if (start === -1) throw new Error(`Section not found in spec: "${heading}"`);
  const nextHeading = text.indexOf("\n###", start + heading.length);
  return nextHeading === -1 ? text.slice(start) : text.slice(start, nextHeading);
}

function parseTableRows(sectionText) {
  return sectionText
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .map((l) => l.split("|").map((c) => c.trim()).filter(Boolean))
    .filter((cells) => {
      const first = cells[0];
      return (
        cells.length >= 2 &&
        !first.startsWith("-") &&
        !first.toLowerCase().startsWith("token")
      );
    });
}

function parseDuration(raw) {
  const match = raw.replace(/\*/g, "").replace(/\s/g, "").match(/(\d+)ms/i);
  if (!match) throw new Error(`Cannot parse duration value: "${raw}"`);
  return `${match[1]}ms`;
}

function parseEasing(raw) {
  const cleaned = raw.replace(/`/g, "").trim();
  if (cleaned === "linear") return [0, 0, 1, 1];
  const match = cleaned.match(/cubic-bezier\(\s*([^)]+)\)/);
  if (!match) throw new Error(`Cannot parse easing value: "${raw}"`);
  return match[1].split(",").map((n) => parseFloat(n.trim()));
}

function cleanDescription(raw) {
  return raw
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

// ─── parse §2.1 durations ───────────────────────────────────────────────────

const durationRows = parseTableRows(extractSection(spec, "### 2.1 Duration tokens"));
const durations = {};

for (const cells of durationRows) {
  const tokenMatch = cells[0].match(/`(--motion-duration-[^`]+)`/);
  if (!tokenMatch) continue;
  const key = tokenMatch[1].replace("--motion-duration-", "");
  durations[key] = {
    $type: "duration",
    $value: parseDuration(cells[1]),
    $description: cleanDescription(cells[2] || ""),
  };
}

// ─── parse §2.2 easings ─────────────────────────────────────────────────────

const easingRows = parseTableRows(extractSection(spec, "### 2.2 Easing tokens"));
const easings = {};

for (const cells of easingRows) {
  const tokenMatch = cells[0].match(/`(--motion-easing-[^`]+)`/);
  if (!tokenMatch) continue;
  const key = tokenMatch[1].replace("--motion-easing-", "");
  easings[key] = {
    $type: "cubicBezier",
    $value: parseEasing(cells[1]),
    $description: cleanDescription(cells[2] || ""),
  };
}

// ─── write output ───────────────────────────────────────────────────────────

const output = { motion: { duration: durations, easing: easings } };
writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `motion-tokens.json written from spec: ${Object.keys(durations).length} durations, ${Object.keys(easings).length} easings.`
);
