// SideNav — Storybook stories (HTML framework)
//
// The SideNav reference demo is a self-contained React + Babel app in
// components/sidenav/sidenav.html. Rather than duplicate that app inside
// Storybook's HTML framework, these stories iframe the demo files directly.
// `.storybook/main.js` serves the repo root at `/demos`, so the paths below
// resolve whether Storybook is running locally or built to static HTML.

function iframe({ src, height = 720, title }) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "display:flex;flex-direction:column;gap:8px;font-family:'Red Hat Text',sans-serif;";

  const bar = document.createElement("div");
  bar.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;" +
    "font-size:12px;color:#8890b0;padding:0 2px;";
  bar.innerHTML =
    `<span>${title}</span>` +
    `<a href="${src}" target="_blank" rel="noopener" ` +
      `style="color:#3555a0;text-decoration:none;font-weight:500;">Open in new tab ↗</a>`;

  const f = document.createElement("iframe");
  f.src = src;
  f.title = title;
  f.style.cssText =
    `width:100%;height:${height}px;border:1px solid #edf0f9;border-radius:12px;background:#fafafa;`;

  wrap.appendChild(bar);
  wrap.appendChild(f);
  return wrap;
}

export default {
  title: "Components/SideNav",
  // Docs page is supplied by SideNav.mdx — no autodocs tag.
  parameters: {
    docs: {
      description: {
        component:
          "Persistent vertical navigation panel — the primary organism of every " +
          "Ministry Brands Amplify module. See `components/sidenav/sidenav-spec.md` for the full spec " +
          "(anatomy, state matrix, tokens, responsiveness, accessibility, Figma gaps).",
      },
    },
    layout: "fullscreen",
  },
};

// ───── Stories ────────────────────────────────────────────────────────────────
export const ReferenceDemo = () =>
  iframe({
    src: "/demos/components/sidenav/sidenav.html",
    title: "sidenav.html — reference implementation with annotated spec panel",
    height: 900,
  });
ReferenceDemo.parameters = {
  docs: {
    description: {
      story:
        "The full reference demo. Includes a working component above and a specification " +
        "panel below with the state matrix, token table, and typography token. Responsive — " +
        "resize the iframe to see the expanded/collapsed/overlay breakpoints.",
    },
  },
};

export const FigmaMakeDemo = () =>
  iframe({
    src: "/demos/components/sidenav/sidenav-figmamake.html",
    title: "sidenav-figmamake.html — AI-tool-friendly demo (no spec panel)",
    height: 900,
  });
FigmaMakeDemo.parameters = {
  docs: {
    description: {
      story:
        "Same component as `ReferenceDemo`, stripped of the spec panel so AI codegen tools " +
        "(Figma Make, v0, Lovable, …) can read the component in isolation.",
    },
  },
};
