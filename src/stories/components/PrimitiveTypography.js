import { createTokenTable } from "./TokenTable.js";

export function createPrimitiveTypography() {
  return createTokenTable({
    filter: (name, token) => token.path[0] === "primitive-type",
    groupBy: (token) => token.path[1],
    label: (token) => token.path.slice(2).join(" / ") || token.path[1],
    renderValue: (token) => {
      const el = document.createElement("span");
      el.style.cssText = "font-family: monospace; font-size: 12px; color: #999;";
      el.textContent = String(token.value);
      return el;
    },
  });
}
