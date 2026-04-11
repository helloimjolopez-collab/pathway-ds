import tokens from "../../tokens/tokens.js";

/**
 * Generic token table renderer.
 * Filters tokens by a predicate and renders name + value rows.
 * Options:
 *   - filter(name, token): return true to include
 *   - groupBy(token): return a string group key (optional)
 *   - renderValue(token): return an HTMLElement for the value cell (optional)
 *   - label(token): display name (defaults to full token name)
 */
export function createTokenTable({ filter, groupBy, renderValue, label }) {
  const matches = [];
  for (const [name, token] of Object.entries(tokens)) {
    if (filter(name, token)) {
      matches.push({ name, ...token });
    }
  }

  if (matches.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No tokens found in this category.";
    empty.style.cssText = "font-family: sans-serif; color: #999;";
    return empty;
  }

  const groups = {};
  for (const t of matches) {
    const key = groupBy ? groupBy(t) : "_all";
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  const container = document.createElement("div");
  container.style.cssText = "display: flex; flex-direction: column; gap: 32px;";

  for (const [groupName, items] of Object.entries(groups)) {
    const section = document.createElement("div");

    if (groupName !== "_all") {
      const heading = document.createElement("h3");
      heading.textContent = groupName;
      heading.style.cssText =
        "font-family: sans-serif; font-size: 16px; margin: 0 0 12px 0; color: #333; text-transform: capitalize;";
      section.appendChild(heading);
    }

    const table = document.createElement("table");
    table.style.cssText =
      "width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px;";

    for (const t of items) {
      const tr = document.createElement("tr");
      tr.style.cssText = "border-bottom: 1px solid #eee;";

      const tdName = document.createElement("td");
      tdName.textContent = label ? label(t) : t.name;
      tdName.style.cssText =
        "padding: 8px 12px 8px 0; font-family: monospace; font-size: 12px; color: #555; white-space: nowrap;";
      tr.appendChild(tdName);

      const tdValue = document.createElement("td");
      tdValue.style.cssText = "padding: 8px 0;";
      if (renderValue) {
        tdValue.appendChild(renderValue(t));
      } else {
        tdValue.textContent = String(t.value);
        tdValue.style.fontFamily = "monospace";
        tdValue.style.fontSize = "12px";
        tdValue.style.color = "#999";
      }
      tr.appendChild(tdValue);

      table.appendChild(tr);
    }

    section.appendChild(table);
    container.appendChild(section);
  }

  return container;
}
