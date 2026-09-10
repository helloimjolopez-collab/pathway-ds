import tokens from "../../tokens/tokens.js";
import { TYPE_SIZES, DENSITIES, WEIGHTS, TRACKING, rankBy } from "./tokenOrder.js";

/**
 * SemanticTypography — renders the `Semantic: Type` SCALE.
 *
 * WHY THIS WAS REWRITTEN (2026-09-09): the previous version took a `mode`
 * argument ("desktop" / "mobile") and grouped tokens into composite steps by
 * reading `token.props.fontsize`. Both assumptions died with the type rework on
 * 2026-09-03:
 *
 *   - Semantic Type went from 554 composite variables to 41 flat ones. No token
 *     carries `props` any more, so the old `.filter(s => s.props.fontsize !==
 *     undefined)` matched zero rows and BOTH typography pages rendered blank.
 *   - There is no Desktop/Mobile mode on type. The 111 composite text styles
 *     live only as Figma text styles now; code composes from the scale.
 *
 * That failure was invisible to every token checker in the repo, because those
 * verify that a token NAME resolves and this file names none — it iterates.
 * A generator that finds nothing and renders an empty div passes a name check,
 * passes the build, and ships a blank page. `scripts/check-story-yield.js`
 * exists to close that hole; see its header.
 *
 * The page is a reference for composing type, so it shows each axis separately
 * rather than inventing composite rows. A developer sets five custom properties
 * at the call site and needs to see what values are available for each.
 */

const ALL = Object.entries(tokens)
  .filter(([, t]) => t.path[0] === "semantic-type")
  .map(([name, t]) => ({ name, path: t.path, value: t.value }));

const axis = (category) => ALL.filter((t) => t.path[1] === category);

const CSS_VAR = (name) => `--${name}`;

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "'Red Hat Text', system-ui, sans-serif";

function el(tag, css, text) {
  const n = document.createElement(tag);
  if (css) n.style.cssText = css;
  if (text !== undefined) n.textContent = text;
  return n;
}

function section(title, blurb) {
  const s = el("section", "margin: 0 0 40px 0;");
  s.appendChild(el("h3", `font-family:${SANS}; font-size:18px; font-weight:600; margin:0 0 4px 0; color:#1a1a1a;`, title));
  if (blurb) {
    s.appendChild(el("p", `font-family:${SANS}; font-size:13px; line-height:1.5; margin:0 0 16px 0; color:#666; max-width:60ch;`, blurb));
  }
  return s;
}

/** A table whose first column is the CSS custom property a developer copies. */
function table(rows, { sampleFor } = {}) {
  const t = el("div", "display:flex; flex-direction:column; border-top:1px solid #e6e6e6;");
  for (const row of rows) {
    const r = el(
      "div",
      "display:flex; align-items:center; gap:16px; padding:10px 0; border-bottom:1px solid #f0f0f0;"
    );
    r.appendChild(el("code", `font-family:${MONO}; font-size:11px; color:#3555a0; flex:0 0 300px; word-break:break-all;`, CSS_VAR(row.name)));
    r.appendChild(el("span", `font-family:${MONO}; font-size:12px; color:#111; flex:0 0 90px;`, row.display));
    if (sampleFor) {
      const sample = el("div", "flex:1; min-width:0; color:#1a1a1a; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;");
      sample.textContent = row.sampleText || "Grace and peace to you";
      sample.style.cssText += sampleFor(row);
      r.appendChild(sample);
    }
    t.appendChild(r);
  }
  return t;
}

export function createSemanticTypography() {
  const container = el("div", `font-family:${SANS};`);

  // ---- Family -------------------------------------------------------------
  const families = axis("family");
  if (families.length) {
    const s = section(
      `Family (${families.length})`,
      "One family. Pathway does not ship a second face, so a component never chooses a family — it names this token."
    );
    s.appendChild(
      table(
        families.map((t) => ({ name: t.name, display: String(t.value), sampleText: "Grace and peace to you" })),
        { sampleFor: (r) => `font-family:'${r.display}', system-ui, sans-serif; font-size:20px;` }
      )
    );
    container.appendChild(s);
  }

  // ---- Font size ----------------------------------------------------------
  const sizes = axis("font-size");
  if (sizes.length) {
    const bySize = rankBy(TYPE_SIZES);
    sizes.sort((a, b) => bySize(a.path[2], b.path[2]));
    const s = section(
      `Font size (${sizes.length})`,
      "R is the base step at 16px. Steps below R are for dense UI and metadata; steps above R are display sizes. The sample is rendered at the real value."
    );
    s.appendChild(
      table(
        sizes.map((t) => ({ name: t.name, display: `${t.value}px`, step: t.path[2] })),
        { sampleFor: (r) => `font-size:${parseFloat(r.display)}px; line-height:1.25;` }
      )
    );
    container.appendChild(s);
  }

  // ---- Line height --------------------------------------------------------
  const lineHeights = axis("line-height");
  if (lineHeights.length) {
    const bySize = rankBy(TYPE_SIZES);
    const byDensity = rankBy(DENSITIES);
    lineHeights.sort(
      (a, b) => bySize(a.path[2], b.path[2]) || byDensity(a.path[3], b.path[3])
    );
    const s = section(
      `Line height (${lineHeights.length})`,
      "Line heights are keyed to a size AND a density, so they are named size/density rather than by a ratio. Tight is for a single line in a control, single for body copy, relaxed for long-form reading. Not every size has all three: only the combinations the system actually uses exist."
    );
    s.appendChild(
      table(
        lineHeights.map((t) => ({
          name: t.name,
          display: `${t.value}px`,
          pair: `${t.path[2]} / ${t.path[3]}`,
        })),
        {
          sampleFor: (r) => {
            const px = parseFloat(r.display);
            return `font-size:14px; line-height:${px}px; white-space:normal; background:linear-gradient(#f4f6fb,#f4f6fb); box-shadow:inset 0 0 0 1px #e6ebf5;`;
          },
        }
      )
    );
    container.appendChild(s);
  }

  // ---- Weight -------------------------------------------------------------
  const weights = axis("weight");
  if (weights.length) {
    const byWeight = rankBy(WEIGHTS);
    weights.sort((a, b) => byWeight(a.path[2], b.path[2]));
    const s = section(
      `Weight (${weights.length})`,
      "Only weights Red Hat Text actually ships are defined, so a weight token can never name a face the browser would synthesise or silently fall back from."
    );
    s.appendChild(
      table(
        weights.map((t) => ({ name: t.name, display: String(t.value) })),
        { sampleFor: (r) => `font-size:18px; font-weight:${r.display};` }
      )
    );
    container.appendChild(s);
  }

  // ---- Letter spacing -----------------------------------------------------
  const tracking = axis("letter-spacing");
  if (tracking.length) {
    const byTracking = rankBy(TRACKING);
    tracking.sort((a, b) => byTracking(a.path[2], b.path[2]));
    const s = section(
      `Letter spacing (${tracking.length})`,
      "Compact is 0 and is the default for body copy. The wider steps exist for small uppercase labels, where the default tracking closes up too much to stay legible."
    );
    s.appendChild(
      table(
        tracking.map((t) => ({
          name: t.name,
          // Figma stores these as floats with binary drift (0.10000000149).
          // Rounding here is a DISPLAY decision only; the emitted CSS keeps the
          // exact value so it still matches Figma to the bit.
          display: `${Math.round(Number(t.value) * 100) / 100}px`,
          sampleText: "SECTION LABEL",
        })),
        { sampleFor: (r) => `font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:${parseFloat(r.display)}px;` }
      )
    );
    container.appendChild(s);
  }

  // ---- How to compose -----------------------------------------------------
  const how = section(
    "Composing a text style",
    "There are no composite type tokens and no .pw-type-* classes; both were retired on 2026-09-03. A call site names five custom properties. The 111 named text styles still exist in Figma, which is where a designer applies them."
  );
  const pre = el(
    "pre",
    `font-family:${MONO}; font-size:12px; line-height:1.6; background:#f7f8fa; border:1px solid #e6e6e6; border-radius:6px; padding:14px; overflow-x:auto; margin:0;`,
    [
      ".card__title {",
      "  font-family:     var(--semantic-type-family-brand);",
      "  font-size:       var(--semantic-type-font-size-m);",
      "  font-weight:     var(--semantic-type-weight-semibold);",
      "  line-height:     var(--semantic-type-line-height-m-single);",
      "  letter-spacing:  var(--semantic-type-letter-spacing-compact);",
      "}",
    ].join("\n")
  );
  how.appendChild(pre);
  container.appendChild(how);

  if (!ALL.length) {
    container.appendChild(
      el("p", "font-family:sans-serif; color:#b00;", "No semantic-type tokens found. Run `node style-dictionary.config.js`.")
    );
  }

  return container;
}
