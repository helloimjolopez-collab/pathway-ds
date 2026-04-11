import tokens from "../../tokens/tokens.js";

function getTypeScaleSteps() {
  // Group semantic-type desktop tokens by type scale step
  const steps = {};
  for (const [name, token] of Object.entries(tokens)) {
    if (!name.startsWith("semantic-type-desktop-")) continue;

    const stepPath = token.path.slice(2, -1).join("/");
    const prop = token.path[token.path.length - 1];

    if (!steps[stepPath]) steps[stepPath] = { name: stepPath, props: {} };
    steps[stepPath].props[prop] = token.value;
  }

  return Object.values(steps).filter(
    (s) => s.props.fontsize !== undefined
  );
}

export function createTypographySamples() {
  const steps = getTypeScaleSteps();
  const container = document.createElement("div");
  container.style.cssText = "display: flex; flex-direction: column; gap: 24px;";

  for (const step of steps) {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; align-items: baseline; gap: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;";

    // Token name label
    const label = document.createElement("div");
    label.style.cssText = "min-width: 280px; flex-shrink: 0;";

    const nameEl = document.createElement("div");
    nameEl.textContent = step.name;
    nameEl.style.cssText = "font-family: monospace; font-size: 12px; color: #555; margin-bottom: 4px;";
    label.appendChild(nameEl);

    const meta = document.createElement("div");
    const parts = [];
    if (step.props.fontsize) parts.push(`${step.props.fontsize}px`);
    if (step.props.fontweight) parts.push(`w${step.props.fontweight}`);
    if (step.props.lineheight) parts.push(`/${step.props.lineheight}px`);
    meta.textContent = parts.join(" ");
    meta.style.cssText = "font-family: monospace; font-size: 11px; color: #999;";
    label.appendChild(meta);

    row.appendChild(label);

    // Live sample
    const sample = document.createElement("div");
    sample.textContent = "The quick brown fox jumps over the lazy dog";
    sample.style.cssText = [
      `font-size: ${step.props.fontsize || 16}px`,
      `font-weight: ${step.props.fontweight || 400}`,
      `line-height: ${step.props.lineheight || step.props.fontsize * 1.2}px`,
      `font-family: ${step.props.fontfamily || "Red Hat Text"}, sans-serif`,
      `letter-spacing: ${step.props.letterspacing || 0}px`,
      "color: #222",
      "flex: 1",
    ].join("; ");

    row.appendChild(sample);
    container.appendChild(row);
  }

  return container;
}
