import tokens from "../../tokens/tokens.js";
import { compareColorPaths, ANCHORS, TIERS, rankBy } from "./tokenOrder.js";

/**
 * SemanticColors — renders the 326-name colour contract for one mode.
 *
 * WHY THIS WAS REWRITTEN (2026-09-09):
 *
 *   - It took mode "light-mode" or "dark-mode". The dark mode was renamed to
 *     Midnight on 2026-08-28, so `createSemanticColors("dark-mode")` matched
 *     zero tokens and the page rendered blank. "Dark mode" is also banned
 *     vocabulary everywhere except the CSS selector.
 *   - It grouped on `path[2]` alone and described the categories as "text, fill,
 *     icon, stroke, surface, overlay". Text and Icon merged into Foreground,
 *     Surface moved under Fill, and Overlay became Scrim. Four of the six names
 *     in that comment no longer exist.
 *   - It rendered groups in Object.entries order, which is Figma panel order,
 *     which is creation order. That is the disorder where Neutral reads
 *     "faint, subtle, medium, contrast, bold, xlight, white, light". The panel
 *     cannot be reordered (no setter on variableIds), so ordering has to happen
 *     here. See tokenOrder.js.
 *
 * The mode argument is the token path segment, so it is "light-mode" or
 * "midnight-mode" and nothing else. An unknown mode renders a loud message
 * rather than an empty page — a blank page is how this file hid a rename for
 * a fortnight.
 */

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "'Red Hat Text', system-ui, sans-serif";

const ALL = Object.entries(tokens).filter(([, t]) => t.path[0] === "semantic-color");
const MODES = [...new Set(ALL.map(([, t]) => t.path[1]))];

// Reverse index hex -> primitive names, so a row can say which rung of which
// ramp it actually lands on. tokens.js resolves aliases to hex and keeps no
// `original`, so the reference has to be recovered by value. A hex used by more
// than one primitive is reported as ambiguous rather than guessed.
const PRIMITIVE_BY_HEX = new Map();
for (const [name, t] of Object.entries(tokens)) {
  if (t.path[0] !== "primitive-color") continue;
  if (typeof t.value !== "string") continue;
  const hex = t.value.toLowerCase();
  const label = t.path.slice(1).join("/");
  if (!PRIMITIVE_BY_HEX.has(hex)) PRIMITIVE_BY_HEX.set(hex, []);
  PRIMITIVE_BY_HEX.get(hex).push(label);
}

/** sRGB relative luminance, per WCAG 2.1. */
function luminance(hex) {
  const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const ch = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function el(tag, css, text) {
  const n = document.createElement(tag);
  if (css) n.style.cssText = css;
  if (text !== undefined) n.textContent = text;
  return n;
}

const TITLE = {
  foreground: "Foreground",
  fill: "Fill",
  stroke: "Stroke",
  scrim: "Scrim",
};

const TIER_BLURB = {
  foreground:
    "Text and icons. These were two separate tiers until 2026-09-03; they merged because every single pair held the same value, so the split doubled the contract without ever letting the two diverge.",
  fill: "Backgrounds, including page ground under Fill/Surface. Surface/Elevated has one step, not two: a header band inside an elevated widget uses Fill/Static/Neutral instead.",
  stroke: "Borders and dividers, plus the single focus-ring token.",
  scrim: "The veil behind a modal or drawer. Four opacities, no hue choice.",
};

const GROUP_BLURB = {
  static:
    "The graded ladder. Faint through Bold runs lightest to heaviest and the VALUES invert in Midnight while the names hold, which is what lets one name serve both modes. White, XLight and Black are inversion anchors: they keep their value across modes, so they are not rungs.",
  action:
    "Interactive states. Rest, Hover and Pressed per tier, with one Disabled token per tier rather than one per role.",
  surface: "Page ground, flattest to most raised.",
  focusring: "One token, used by every focusable component.",
};

export function createSemanticColors(mode) {
  const container = el("div", `font-family:${SANS};`);

  const rows = ALL.filter(([, t]) => t.path[1] === mode);

  if (!rows.length) {
    container.appendChild(
      el(
        "div",
        "font-family:sans-serif; padding:16px; border-radius:8px; background:#fff4f4; border:1px solid #e6b8b8; color:#8a1f1f;",
        `No semantic colour tokens for mode "${mode}". Modes present in tokens.js: ${MODES.join(", ") || "(none)"}.`
      )
    );
    return container;
  }

  const isMidnight = mode === "midnight-mode";
  // The ground each foreground token is measured against for the contrast
  // badge. Foreground/*/Faint sitting at 4.3:1 is a real finding, and it only
  // shows up if the badge is computed rather than asserted.
  const ground = isMidnight ? "#000000" : "#ffffff";

  // Bucket by tier, then group, preserving canonical order at every level.
  const tree = new Map();
  for (const [name, t] of rows) {
    const rel = t.path.slice(2); // drop ["semantic-color", mode]
    const tier = rel[0], group = rel[1];
    if (!tree.has(tier)) tree.set(tier, new Map());
    if (!tree.get(tier).has(group)) tree.get(tier).set(group, []);
    // The KEY in tokens.js carries the mode
    // (semantic-color-midnight-mode-foreground-static-neutral-bold), but the
    // emitted custom property does NOT: themes/light.css and
    // themes/midnight.css both declare the modeless name and the selector picks
    // the value. So the name is rebuilt from the mode-stripped path.
    //
    // Printing the raw key was a real bug in the first version of this file: it
    // published `--semantic-color-midnight-mode-*`, which is the retired
    // tokens.css form and resolves to nothing. A reader copying it would get no
    // colour, from the very page that exists to tell them the right name.
    const cssName = `semantic-color-${rel.join("-")}`;
    tree.get(tier).get(group).push({ name: cssName, key: name, rel, value: t.value });
  }

  const byTier = rankBy(TIERS);
  const tierNames = [...tree.keys()].sort(byTier);

  const summary = el(
    "p",
    `font-family:${SANS}; font-size:13px; line-height:1.6; color:#555; max-width:70ch; margin:0 0 28px 0;`,
    `${rows.length} names in this mode. One name carries one value per mode, resolved by selector, so a component never writes a mode into a property name. Ladder order below is imposed by the docs, not by the Figma panel, which cannot be reordered.`
  );
  container.appendChild(summary);

  for (const tier of tierNames) {
    const tierEl = el("section", "margin:0 0 44px 0;");
    tierEl.appendChild(
      el("h2", `font-size:20px; font-weight:600; margin:0 0 4px 0; color:#1a1a1a;`, TITLE[tier] || tier)
    );
    if (TIER_BLURB[tier]) {
      tierEl.appendChild(
        el("p", `font-size:13px; line-height:1.55; color:#666; margin:0 0 18px 0; max-width:66ch;`, TIER_BLURB[tier])
      );
    }

    const groups = tree.get(tier);
    const groupNames = [...groups.keys()].sort(
      rankBy(["static", "surface", "action", "focusring", "base", "faint", "light", "subtle"])
    );

    for (const group of groupNames) {
      const list = groups.get(group);
      list.sort((a, b) => compareColorPaths(a.rel, b.rel));

      const groupEl = el("div", "margin:0 0 26px 0;");
      groupEl.appendChild(
        el(
          "h3",
          "font-size:14px; font-weight:600; margin:0 0 2px 0; color:#333; text-transform:capitalize;",
          `${tier} / ${group}  ·  ${list.length}`
        )
      );
      if (GROUP_BLURB[group]) {
        groupEl.appendChild(
          el("p", `font-size:12px; line-height:1.5; color:#777; margin:0 0 12px 0; max-width:66ch;`, GROUP_BLURB[group])
        );
      }

      const tableEl = el("div", "display:flex; flex-direction:column; border-top:1px solid #e6e6e6;");

      for (const row of list) {
        const label = row.rel.slice(2).join(" / ") || row.rel[1];
        const leaf = row.rel[row.rel.length - 1];
        const hex = typeof row.value === "string" ? row.value : String(row.value);
        const isAlias = typeof row.value === "string" && row.value.startsWith("{");

        const r = el(
          "div",
          "display:flex; align-items:center; gap:14px; padding:8px 0; border-bottom:1px solid #f2f2f2;"
        );

        // Swatch on the ground of the mode being documented, so a near-white
        // token on a white card is still visible by its border.
        const sw = el(
          "div",
          `width:36px; height:36px; flex:0 0 36px; border-radius:6px; background:${isAlias ? "#ddd" : hex}; box-shadow:inset 0 0 0 1px rgba(0,0,0,.14);`
        );
        const swWrap = el("div", `padding:4px; border-radius:9px; background:${ground}; box-shadow:inset 0 0 0 1px #e0e0e0; flex:0 0 auto;`);
        swWrap.appendChild(sw);
        r.appendChild(swWrap);

        const info = el("div", "flex:1 1 auto; min-width:0;");
        info.appendChild(el("div", "font-size:13px; color:#1a1a1a; font-weight:500;", label));
        info.appendChild(
          el("code", `font-family:${MONO}; font-size:10.5px; color:#3555a0; word-break:break-all; display:block;`, `--${row.name}`)
        );
        r.appendChild(info);

        const meta = el("div", "flex:0 0 190px; text-align:right;");
        meta.appendChild(el("div", `font-family:${MONO}; font-size:11px; color:#111;`, hex));

        const prim = PRIMITIVE_BY_HEX.get(hex.toLowerCase());
        if (prim) {
          const txt = prim.length === 1 ? prim[0] : `${prim[0]} (+${prim.length - 1} share this value)`;
          meta.appendChild(el("div", `font-family:${MONO}; font-size:10px; color:#999;`, txt));
        }
        r.appendChild(meta);

        // Badges: anchor status, and contrast for foreground tokens only —
        // a contrast number on a Fill token would invite reading it as a text
        // ratio, which it is not.
        const badges = el("div", "flex:0 0 118px; display:flex; gap:6px; justify-content:flex-end;");
        if (ANCHORS.has(leaf)) {
          badges.appendChild(
            el(
              "span",
              `font-family:${MONO}; font-size:9.5px; padding:2px 6px; border-radius:99px; background:#eef1f7; color:#3555a0;`,
              "anchor"
            )
          );
        }
        if (tier === "foreground" && !isAlias) {
          const ratio = contrast(hex, ground);
          if (ratio) {
            const pass = ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA lg" : "fail";
            const bg = ratio >= 4.5 ? "#eaf6ec" : ratio >= 3 ? "#fdf4e3" : "#fdeaea";
            const fg = ratio >= 4.5 ? "#1f6b2c" : ratio >= 3 ? "#8a5a00" : "#8a1f1f";
            badges.appendChild(
              el(
                "span",
                `font-family:${MONO}; font-size:9.5px; padding:2px 6px; border-radius:99px; background:${bg}; color:${fg}; white-space:nowrap;`,
                `${ratio.toFixed(2)}:1 ${pass}`
              )
            );
          }
        }
        r.appendChild(badges);

        tableEl.appendChild(r);
      }

      groupEl.appendChild(tableEl);
      tierEl.appendChild(groupEl);
    }

    container.appendChild(tierEl);
  }

  return container;
}
