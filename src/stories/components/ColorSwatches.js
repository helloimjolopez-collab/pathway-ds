import tokens from "../../tokens/tokens.js";

function groupColors() {
  const groups = {};
  for (const [name, token] of Object.entries(tokens)) {
    if (token.type !== "color") continue;
    // Group by collection + palette (first two path segments)
    const groupKey = token.path.slice(0, 2).join(" / ");
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ name, value: token.value, step: token.path.slice(2).join("-") || name });
  }
  return groups;
}

export function createColorSwatches() {
  const groups = groupColors();
  const container = document.createElement("div");

  for (const [groupName, colors] of Object.entries(groups)) {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom: 32px;";

    const heading = document.createElement("h3");
    heading.textContent = groupName;
    heading.style.cssText = "font-family: sans-serif; font-size: 16px; margin: 0 0 12px 0; color: #333; text-transform: capitalize;";
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;";

    for (const color of colors) {
      const swatch = document.createElement("div");
      swatch.style.cssText = "display: flex; flex-direction: column; gap: 4px;";

      const square = document.createElement("div");
      square.style.cssText = `width: 100%; aspect-ratio: 1; background: ${color.value}; border-radius: 8px; border: 1px solid #e0e0e0;`;
      swatch.appendChild(square);

      const tokenName = document.createElement("div");
      tokenName.textContent = color.step;
      tokenName.style.cssText = "font-family: monospace; font-size: 11px; color: #555; word-break: break-all;";
      swatch.appendChild(tokenName);

      const hexValue = document.createElement("div");
      hexValue.textContent = color.value;
      hexValue.style.cssText = "font-family: monospace; font-size: 11px; color: #999;";
      swatch.appendChild(hexValue);

      grid.appendChild(swatch);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }

  return container;
}
