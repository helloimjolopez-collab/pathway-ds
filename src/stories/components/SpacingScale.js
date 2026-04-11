import tokens from "../../tokens/tokens.js";

function getSpacingTokens() {
  const spacing = [];
  for (const [name, token] of Object.entries(tokens)) {
    if (token.type !== "number") continue;
    // Include primitive-spacing, primitive-unit, and semantic-units
    if (
      !name.startsWith("primitive-spacing-") &&
      !name.startsWith("primitive-unit-") &&
      !name.startsWith("semantic-units-")
    ) continue;
    if (typeof token.value !== "number" || token.value <= 0) continue;

    spacing.push({
      name,
      value: token.value,
      collection: token.path[0],
      label: token.path.slice(1).join(" / "),
    });
  }

  // Group by collection
  const groups = {};
  for (const s of spacing) {
    if (!groups[s.collection]) groups[s.collection] = [];
    groups[s.collection].push(s);
  }

  // Sort each group by value
  for (const group of Object.values(groups)) {
    group.sort((a, b) => a.value - b.value);
  }

  return groups;
}

export function createSpacingScale() {
  const groups = getSpacingTokens();
  const container = document.createElement("div");
  container.style.cssText = "display: flex; flex-direction: column; gap: 32px;";

  for (const [groupName, spacings] of Object.entries(groups)) {
    const section = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = groupName;
    heading.style.cssText = "font-family: sans-serif; font-size: 16px; margin: 0 0 12px 0; color: #333; text-transform: capitalize;";
    section.appendChild(heading);

    const list = document.createElement("div");
    list.style.cssText = "display: flex; flex-direction: column; gap: 8px;";

    const maxValue = Math.max(...spacings.map((s) => s.value), 1);

    for (const s of spacings) {
      const row = document.createElement("div");
      row.style.cssText = "display: flex; align-items: center; gap: 16px;";

      // Token name
      const label = document.createElement("div");
      label.textContent = s.label;
      label.style.cssText = "font-family: monospace; font-size: 12px; color: #555; min-width: 200px; flex-shrink: 0;";
      row.appendChild(label);

      // Visual bar
      const barContainer = document.createElement("div");
      barContainer.style.cssText = "flex: 1; display: flex; align-items: center; gap: 8px;";

      const bar = document.createElement("div");
      const widthPct = Math.max((s.value / maxValue) * 100, 2);
      bar.style.cssText = `width: ${widthPct}%; height: 24px; background: #3555A0; border-radius: 4px; transition: width 0.2s;`;
      barContainer.appendChild(bar);

      // Pixel value
      const px = document.createElement("div");
      px.textContent = `${s.value}px`;
      px.style.cssText = "font-family: monospace; font-size: 12px; color: #999; min-width: 50px;";
      barContainer.appendChild(px);

      row.appendChild(barContainer);
      list.appendChild(row);
    }

    section.appendChild(list);
    container.appendChild(section);
  }

  return container;
}
