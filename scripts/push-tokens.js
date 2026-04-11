#!/usr/bin/env node

/**
 * push-tokens.js
 *
 * Commits tokens/pathway-design-tokens.json and pushes to GitHub
 * if there are any changes. If nothing changed, exits quietly.
 *
 * Usage:  npm run push-tokens
 */

import { execSync } from "node:child_process";

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
}

function main() {
  // Check if there are changes to the token file
  try {
    run("git diff --quiet tokens/pathway-design-tokens.json");
    // Also check if untracked
    const status = run("git status --porcelain tokens/pathway-design-tokens.json");
    if (!status) {
      console.log("No token changes to push.");
      return;
    }
  } catch {
    // git diff --quiet exits with 1 if there are changes — that's what we want
  }

  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  console.log("Staging token file…");
  run("git add tokens/pathway-design-tokens.json");

  console.log("Committing…");
  run(`git commit -m "chore: sync tokens from Figma ${timestamp}"`);

  console.log("Pushing to GitHub…");
  execSync("git push", { stdio: "inherit" });

  console.log("\nDone! Tokens are now on GitHub.");
}

main();
