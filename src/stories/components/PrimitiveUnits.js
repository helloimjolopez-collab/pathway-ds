import tokens from "../../tokens/tokens.js";

export function createPrimitiveUnits() {
  const units = [];
  for (const [name, token] of Object.entries(tokens)) {
    if (token.path[0] !== "primitive-unit") continue;
    if (typeof token.value !== "number" || token.value <= 0) continue;
    units.push({ name, value: token.value, label: token.path.slice(1).join(" / ") });
  }
  units.sort((a, b) => a.value - b.value);

  const container = document.createElement("div");
  container.style.cssText = "display: flex; flex-direction: column; gap: 8px;";

  const maxValue = Math.max(...units.map((u) => u.value), 1);

  for (const u of units) {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; align-items: center; gap: 16px;";

    const label = document.createElement("div");
    label.textContent = u.label;
    label.style.cssText =
      "font-family: monospace; font-size: 12px; color: #555; min-width: 160px; flex-shrink: 0;";
    row.appendChild(label);

    const barWrap = document.createElement("div");
    barWrap.style.cssText = "flex: 1; display: flex; align-items: center; gap: 8px;";

    const bar = document.createElement("div");
    const pct = Math.max((u.value / maxValue) * 100, 2);
    bar.style.cssText = `width: ${pct}%; height: 24px; background: #3555A0; border-radius: 4px;`;
    barWrap.appendChild(bar);

    const px = document.createElement("div");
    px.textContent = `${u.value}px`;
    px.style.cssText = "font-family: monospace; font-size: 12px; color: #999; min-width: 50px;";
    barWrap.appendChild(px);

    row.appendChild(barWrap);
    container.appendChild(row);
  }

  return container;
}
