// Widget — Storybook stories (React framework)
//
// The resizable dashboard building block. Module is
// components/widget/widget.jsx; nothing is redefined here.
//
// Figma: component set `Widget` (Amplify 40009622:39702, NewCo mirror
// 40016737:144022). Three Size variants there (Glance, Detail, Explore) plus a
// separate Widget.Focus frame for Full.

import React, { useState } from "react";
import {
  Widget, WidgetKeyframes, WidgetToolbar, WidgetTopMetric,
  Metric, DeltaPill, SIZES, SIZE_LABEL, CONTENT_COLS, isFlat,
} from "../../../../components/widget/widget.jsx";
import { SkeletonKeyframes } from "../../../../components/skeleton/skeleton.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const SEQ = (i) => SC(`fill-chart-sequential-${String(i).padStart(2, "0")}`);

const FUNDS = [
  { label: "General", v: 21400, display: "$21,400", seq: 4 },
  { label: "Missions", v: 9100, display: "$9,100", seq: 6 },
  { label: "Building", v: 7300, display: "$7,300", seq: 8 },
  { label: "Youth", v: 5200, display: "$5,200", seq: 10 },
  { label: "Benevolence", v: 3100, display: "$3,100", seq: 12 },
  { label: "Other", v: 2110, display: "$2,110", seq: 14 },
];

/* A donut on the real sequential tokens, so the story is also the proof that
   Fill/Chart/Sequential resolves. Its centre total is the content's natural
   total, which is exactly why these widgets carry no top-metric strip. */
function Donut({ size = 132 }) {
  const r = size / 2 - 11, C = 2 * Math.PI * r;
  const sum = FUNDS.reduce((s, x) => s + x.v, 0);
  let off = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Giving by fund">
        {FUNDS.map((s, i) => {
          const dash = (s.v / sum) * C;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={SEQ(s.seq)} strokeWidth={20}
              strokeDasharray={`${dash.toFixed(2)} ${C.toFixed(2)}`}
              strokeDashoffset={(-off).toFixed(2)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          );
          off += dash; return el;
        })}
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
          fontSize: ST("font-size-m"), color: SC("foreground-static-neutral-strong") }}>$48,210</span>
        <span style={{ fontFamily: ST("family-brand"), fontSize: ST("font-size-xs"),
          color: SC("foreground-static-neutral-faint") }}>total</span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SU("gap-xxtight"), minWidth: 0, flex: 1 }}>
      {FUNDS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: SU("gap-tight"), minWidth: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: SU("cornerradius-small"),
            background: SEQ(s.seq), flex: "0 0 auto" }} />
          <span style={{ fontFamily: ST("family-brand"), fontSize: ST("font-size-xs"),
            color: SC("foreground-static-neutral-base"), flex: 1, minWidth: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
          <span style={{ fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
            fontSize: ST("font-size-xs"), fontVariantNumeric: "tabular-nums",
            color: SC("foreground-static-neutral-strong"), flex: "0 0 auto" }}>{s.display}</span>
        </div>
      ))}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      fontFamily: ST("family-brand"), fontWeight: ST("weight-medium"),
      fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
      display: "inline-flex", alignItems: "center",
      minHeight: SU("accessibility-touch-target-desktop-only-height"),
      padding: `0 ${SU("padding-xtight")}`,
      borderRadius: SU("cornerradius-base"),
      border: `var(--semantic-layout-units-borderwidth-base) solid ${SC("stroke-static-neutral-base")}`,
      color: SC("foreground-static-neutral-strong"),
    }}>{children}</span>
  );
}

/** The content a Widget holds at each size, so resizing in the Playground shows
 *  the depth change rather than a scaled copy of the same thing. */
function Content({ size }) {
  if (isFlat(size)) {
    return <Metric value="$48,210" delta="12.4%" deltaDirection="up" deltaNote="vs last month" />;
  }
  const side = CONTENT_COLS[size] === 2;
  return (
    <div style={{
      display: "flex", flexDirection: side ? "row" : "column",
      alignItems: side ? "center" : "stretch",
      gap: SU("gap-medium"), padding: SU("padding-medium"), flex: 1, minHeight: 0,
    }}>
      <Donut size={side ? 132 : 148} />
      <Legend />
    </div>
  );
}

function Demo({ size, ...rest }) {
  const [s, setS] = useState(size);
  React.useEffect(() => setS(size), [size]);
  return (
    <>
      <WidgetKeyframes />
      <SkeletonKeyframes />
      <div className="pw-dashboard-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(var(--pw-dash-cols, 12), minmax(0, 1fr))",
        gridAutoRows: "48px", gridAutoFlow: "row dense", gap: SU("gap-base"),
        background: SC("fill-static-neutral-base"), padding: SU("padding-base"),
      }}>
        <Widget
          {...rest}
          title={rest.title}
          size={s}
          onResize={setS}
          toolbar={!isFlat(s) ? <WidgetToolbar identity={<Chip>All funds</Chip>} /> : undefined}
        >
          <Content size={s} />
        </Widget>
      </div>
      <style>{`.pw-dashboard-grid{--pw-dash-cols:4}@media(min-width:768px){.pw-dashboard-grid{--pw-dash-cols:8}}@media(min-width:1024px){.pw-dashboard-grid{--pw-dash-cols:12}}`}</style>
    </>
  );
}

export default {
  title: "Library/Widget",
  component: Widget,
  argTypes: {
    title: { name: "Title", control: { type: "text" } },
    size: {
      name: "Size",
      description:
        "Size is DEPTH, not scale. Resizing changes the content and how much of it there is. " +
        "Glance is a number plus its one directional signal; Explore one view wide and short; " +
        "Detail one view tall, deliberately one internal column even though it has the width " +
        "for two; Full the only size that shows two views side by side.",
      control: { type: "inline-radio" }, options: SIZES,
    },
    state: {
      name: "State",
      description: "Loading keeps the header live and replaces the content. Empty and Error are mutually exclusive end states: Error always offers Retry, Empty never does.",
      control: { type: "inline-radio" }, options: ["ready", "loading", "empty", "error"],
    },
    manage: { name: "Manage mode", description: "Dashboard-global, not per widget. Dashed border, drag handle, and the overflow swaps to the layout actions.", control: { type: "boolean" } },
    updatedLabel: { name: "Freshness label", control: { type: "text" } },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The resizable dashboard building block. Figma component set `Widget` " +
          "(Amplify `40009622:39702`, NewCo mirror `40016737:144022`). " +
          "A KPI tile is not a separate component: it is Widget at Glance holding a Metric. " +
          "Flat versus layered is driven by the presence of content controls, not by size: " +
          "Glance has no content toolbar so the header and content share one surface. " +
          "The container is never itself a click target; the user interacts with the controls inside it.",
      },
    },
  },
};

export const Playground = (args) => <Demo {...args} />;
Playground.args = {
  title: "Giving by fund", size: "detail", state: "ready",
  manage: false, updatedLabel: "Updated just now",
};

export const Sizes = () => (
  <>
    <WidgetKeyframes />
    <SkeletonKeyframes />
    <div className="pw-dashboard-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(var(--pw-dash-cols, 12), minmax(0, 1fr))",
      gridAutoRows: "48px", gridAutoFlow: "row dense", gap: SU("gap-base"),
      background: SC("fill-static-neutral-base"), padding: SU("padding-base"),
    }}>
      {SIZES.map((s) => (
        <Widget key={s} title={SIZE_LABEL[s]} size={s}
          toolbar={!isFlat(s) ? <WidgetToolbar identity={<Chip>All funds</Chip>} /> : undefined}>
          <Content size={s} />
        </Widget>
      ))}
    </div>
    <style>{`.pw-dashboard-grid{--pw-dash-cols:4}@media(min-width:768px){.pw-dashboard-grid{--pw-dash-cols:8}}@media(min-width:1024px){.pw-dashboard-grid{--pw-dash-cols:12}}`}</style>
  </>
);
Sizes.parameters = {
  docs: { description: { story: "All four sizes in one grid, so the column spans and row counts tile the way they do on a real dashboard. Glance is flat; the rest layer a content panel over the header." } },
};

export const States = () => (
  <>
    <WidgetKeyframes />
    <SkeletonKeyframes />
    <div className="pw-dashboard-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(var(--pw-dash-cols, 12), minmax(0, 1fr))",
      gridAutoRows: "48px", gridAutoFlow: "row dense", gap: SU("gap-base"),
      background: SC("fill-static-neutral-base"), padding: SU("padding-base"),
    }}>
      {["ready", "loading", "empty", "error"].map((st) => (
        <Widget key={st} title={st} size="explore" state={st}
          emptyLine="No gifts in this period. Widen the period to see earlier gifts."
          onRetry={() => {}}
          toolbar={<WidgetToolbar identity={<Chip>All funds</Chip>} />}>
          <Content size="explore" />
        </Widget>
      ))}
    </div>
    <style>{`.pw-dashboard-grid{--pw-dash-cols:4}@media(min-width:768px){.pw-dashboard-grid{--pw-dash-cols:8}}@media(min-width:1024px){.pw-dashboard-grid{--pw-dash-cols:12}}`}</style>
  </>
);
States.parameters = {
  docs: { description: { story: "The four lifecycle states. The single line of copy in the empty state is the only prose this component ever renders; everything else is a control label." } },
};

export const SequentialChartTokens = () => (
  <div style={{ padding: SU("padding-base"), background: SC("fill-static-neutral-base") }}>
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 48, borderRadius: SU("cornerradius-small"), background: SEQ(i + 1) }}
          title={`fill-chart-sequential-${String(i + 1).padStart(2, "0")}`} />
      ))}
    </div>
  </div>
);
SequentialChartTokens.parameters = {
  docs: { description: { story: "`Fill/Chart/Sequential/01` to `15` as the theme resolves them. In Amplify these are the Amethyst ladder; in NewCo they are Seabreeze." } },
};
