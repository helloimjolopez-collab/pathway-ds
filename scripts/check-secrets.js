#!/usr/bin/env node

/**
 * check-secrets.js
 *
 * Fails if any tracked file contains something that looks like a credential.
 *
 * WHY THIS EXISTS
 * On 2026-09-02 `figma connect migrate` read the git remote URL, found a GitHub
 * OAuth token embedded in it, and wrote that token into a `// source=` comment
 * in all 7 files it generated. Nothing warned about it. Those files were one
 * `git add` away from being committed, pushed, and uploaded to Figma.
 *
 * The token has since been removed from the remote URL, so the specific cause
 * is gone. This guard exists because the general shape of the problem is not:
 * a codegen tool that reads local git config can copy a secret into source at
 * any time, and a `// source=` comment is not somewhere a human looks.
 *
 * Scans tracked files only — untracked scratch files are the author's business,
 * and node_modules is excluded for speed.
 *
 * Usage:  node scripts/check-secrets.js
 */

import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const PATTERNS = [
  { name: "GitHub OAuth token",       re: /\bgho_[A-Za-z0-9]{20,}/ },
  { name: "GitHub personal token",    re: /\bghp_[A-Za-z0-9]{20,}/ },
  { name: "GitHub fine-grained PAT",  re: /\bgithub_pat_[A-Za-z0-9_]{20,}/ },
  { name: "GitHub app/refresh token", re: /\b(ghu|ghs|ghr)_[A-Za-z0-9]{20,}/ },
  { name: "credential in a URL",      re: /https?:\/\/[A-Za-z0-9._~-]+:[^@\s/]+@/ },
  { name: "token in a URL",           re: /https?:\/\/(gho|ghp|ghu|ghs|ghr)_[A-Za-z0-9]+@/ },
  { name: "Figma personal token",     re: /\bfigd_[A-Za-z0-9_-]{20,}/ },
  { name: "Anthropic API key",        re: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: "AWS access key id",        re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "npm token",                re: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { name: "private key block",        re: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
];

// This file necessarily contains the patterns it searches for.
const SELF = "scripts/check-secrets.js";
const SKIP_DIRS = ["node_modules/", "storybook/", "storybook-static/", "dist/"];
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|pdf|zip|mp4|mov)$/i;
const MAX_BYTES = 2_000_000;

let files;
try {
  files = execSync("git ls-files -z", { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 })
    .split("\0")
    .filter(Boolean);
} catch (err) {
  console.error(`check-secrets: could not list tracked files (${err.message})`);
  process.exit(2);
}

const findings = [];
let scanned = 0;

for (const file of files) {
  if (file === SELF) continue;
  if (SKIP_DIRS.some((d) => file.startsWith(d))) continue;
  if (BINARY.test(file)) continue;
  try {
    if (statSync(file).size > MAX_BYTES) continue;
  } catch {
    continue; // deleted but still in the index
  }

  let text;
  try {
    text = readFileSync(file, "utf-8");
  } catch {
    continue;
  }
  scanned += 1;

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const { name, re } of PATTERNS) {
      if (re.test(lines[i])) {
        // Never print the match itself — that would put the secret in CI logs.
        findings.push({ file, line: i + 1, name });
      }
    }
  }
}

if (findings.length) {
  console.error(`\ncheck-secrets: ${findings.length} possible credential(s) in tracked files.\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  ${f.name}`);
  }
  console.error(
    `\nThe matched text is deliberately not printed. Open each location, remove the\n` +
    `credential, and revoke it at the provider — a secret that reached a file is\n` +
    `already worth rotating even if it was never pushed.\n`
  );
  process.exit(1);
}

console.log(`check-secrets: ${scanned} tracked files scanned, nothing found.`);
