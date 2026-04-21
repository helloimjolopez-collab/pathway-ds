import tokens from "../../tokens/tokens.js";

/**
 * Renders semantic layout tokens (button padding, corner radius, touch targets, etc.)
 * grouped by component/category.
 */
export function createSemanticLayout() {
  const groups = {};
  for (const [name, token] of Object.entries(tokens)) {
    if (token.path[0] !== "semantic-layout-units") continue;

    const category = token.path[1]; // button, navitem, accessibility, page, section, etc.
    if (!groups[category]) groups[category] = [];

    groups[category].push({
      name,
      value: token.value,
      label: token.path.slice(2).join(" / "),
      type: token.type,
    });
  }

  const container = document.createElement("div");
  container.style.cssText = "display: flex; flex-direction: column; gap: 32px;";

  for (const [category, items] of Object.entries(groups)) {
    const section = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = category;
    heading.style.cssText =
      "font-family: sans-serif; font-size: 16px; margin: 0 0 12px 0; color: #333; text-transform: capitalize;";
    section.appendChild(heading);

    const table = document.createElement("table");
    table.style.cssText =
      "width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px;";

    // Header row
    const thead = document.createElement("tr");
    thead.style.cssText = "border-bottom: 2px solid #ddd;";
    for (const col of ["Token", "Value", ""]) {
      const th = document.createElement("th");
      th.textContent = col;
      th.style.cssText =
        "text-align: left; padding: 6px 12px 6px 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;";
      thead.appendChild(th);
    }
    table.appendChild(thead);

    for (const t of items) {
      const tr = document.createElement("tr");
      tr.style.cssText = "border-bottom: 1px solid #f0f0f0;";

      const tdName = document.createElement("td");
      tdName.textContent = t.label;
      tdName.style.cssText =
        "padding: 8px 12px 8px 0; font-family: monospace; font-size: 12px; color: #555;";
      tr.appendChild(tdName);

      const tdValue = document.createElement("td");
      tdValue.textContent = typeof t.value === "number" ? `${t.value}px` : String(t.value);
      tdValue.style.cssText =
        "padding: 8px 12px 8px 0; font-family: monospace; font-size: 12px; color: #999;";
      tr.appendChild(tdValue);

      // Visual indicator for numeric values
      const tdVisual = document.createElement("td");
      tdVisual.style.cssText = "padding: 8px 0; width: 120px;";
      if (typeof t.value === "number" && t.value > 0 && t.value <= 200) {
        const bar = document.createElement("div");
        bar.style.cssText = `width: ${Math.min(t.value * 2, 120)}px; height: 16px; background: #3555A0; border-radius: 3px; opacity: 0.6;`;
        tdVisual.appendChild(bar);
      }
      tr.appendChild(tdVisual);

      table.appendChild(tr);
    }

    section.appendChild(table);
    container.appendChild(section);
  }

  return container;
}
