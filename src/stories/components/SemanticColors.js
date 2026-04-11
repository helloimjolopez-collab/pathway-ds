import tokens from "../../tokens/tokens.js";

/**
 * Renders semantic color tokens for a specific mode ("light-mode" or "dark-mode").
 */
export function createSemanticColors(mode) {
  const groups = {};
  for (const [name, token] of Object.entries(tokens)) {
    if (token.path[0] !== "semantic-color") continue;
    if (token.path[1] !== mode) continue;

    // Group by the semantic category (path[2] = text, fill, icon, stroke, surface, overlay, etc.)
    const category = token.path[2];
    if (!groups[category]) groups[category] = [];

    groups[category].push({
      name,
      value: token.value,
      label: token.path.slice(3).join(" / ") || token.path[2],
      isAlias: typeof token.value === "string" && token.value.startsWith("{"),
    });
  }

  const isDark = mode === "dark-mode";
  const container = document.createElement("div");

  for (const [category, colors] of Object.entries(groups)) {
    const section = document.createElement("div");
    section.style.cssText = "margin-bottom: 32px;";

    const heading = document.createElement("h3");
    heading.textContent = category;
    heading.style.cssText =
      "font-family: sans-serif; font-size: 16px; margin: 0 0 12px 0; color: #333; text-transform: capitalize;";
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.style.cssText =
      "display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;";

    for (const color of colors) {
      const card = document.createElement("div");
      card.style.cssText = `display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; background: ${isDark ? "#1a1a1a" : "#fff"}; border: 1px solid #e0e0e0;`;

      const square = document.createElement("div");
      const displayValue = color.isAlias ? "#ccc" : color.value;
      square.style.cssText = `width: 40px; height: 40px; flex-shrink: 0; background: ${displayValue}; border-radius: 6px; border: 1px solid #e0e0e0;`;
      card.appendChild(square);

      const info = document.createElement("div");
      info.style.cssText = "overflow: hidden;";

      const nameEl = document.createElement("div");
      nameEl.textContent = color.label;
      nameEl.style.cssText = `font-family: monospace; font-size: 11px; color: ${isDark ? "#ccc" : "#555"}; word-break: break-all;`;
      info.appendChild(nameEl);

      const valueEl = document.createElement("div");
      valueEl.textContent = color.value;
      valueEl.style.cssText = `font-family: monospace; font-size: 11px; color: ${isDark ? "#888" : "#999"}; word-break: break-all;`;
      info.appendChild(valueEl);

      card.appendChild(info);
      grid.appendChild(card);
    }

    section.appendChild(grid);
    container.appendChild(section);
  }

  return container;
}
