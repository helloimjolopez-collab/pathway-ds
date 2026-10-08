/**
 * KPI Tile: the card. 18 Figma variants on Type x Breakpoint.
 *
 * A KPI Tile is ALWAYS a card. The cardless thing is KPI Number & Trend, which
 * is a building block this tile nests and a Widget nests too, and which has no
 * page of its own because it only ever appears nested.
 */
import React from "react";
import { KpiTile, ChangeChip, KPI_TILE_TYPES, KPI_TILE_SPECS } from "../../../../components/kpi-tile/kpi-tile.jsx";
import { MiniChart, SAMPLE_SERIES, SAMPLE_MARKERS, SAMPLE_LAYERS, curveFor } from "../../../../components/kpi-tile/mini-chart.jsx";
import { KpiNumberAndTrend, Change, CHANGE_TYPES } from "../../../../components/kpi-tile/kpi-number-trend.jsx";
import { TokenTables } from "../_shared/TokenTable.jsx";
import { Dropdown, DropdownItem, DropdownDivider } from "../../../../components/dropdown/dropdown.jsx";

const U = (n) => `var(--semantic-layout-units-${n})`;
const page = (children) => (
  <div style={{ padding: U("padding-relaxed"), background: "var(--semantic-color-fill-surface-canvas)",
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(388px, 388px))",
    gap: U("gap-base"), alignItems: "start" }}>{children}</div>
);
/** Captions every example with its measured box, so the page states what it
    is showing rather than leaving it to be inferred. */
const caption = (text) => (
  <code style={{ display: "block", marginBottom: U("gap-xxtight"),
    fontSize: "var(--semantic-type-font-size-xs)",
    color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{text}</code>
);

const chart = (s = "wavy-01", dir = "up") => (
  <MiniChart series={SAMPLE_SERIES[s]} direction={dir} curve={curveFor(s)} />
);

export default {
  title: "Library/KPI Tile",
  component: KpiTile,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "THE NINE FIGMA TYPES ARE NINE LAYOUTS, not three shapes. They differ in " +
      "root direction, padding, gap, heading weight, which _Change type they " +
      "carry, which featured icon, which chart, and their height: 90, 96, 144, " +
      "160, 162 and 244. Chart 04 is a card inside a card. The number is " +
      "weight 600 on every variant. Breakpoint is a WIDTH, 388 or 343, and the " +
      "tile is fluid, so it fills whatever column it is given." } },
  },
  argTypes: {
    type: { name: "Type", control: "select", options: KPI_TILE_TYPES },
    breakpoint: { name: "Breakpoint", control: "inline-radio", options: ["desktop", "mobile"] },
    heading: { name: "Heading", control: "text" },
    value: { name: "Value", control: "text" },
    changeValue: { name: "Change value", control: "text" },
    note: { name: "Comparison note", control: "text" },
    direction: { name: "Direction", control: "inline-radio", options: ["up", "down"] },
    favourable: { name: "Favourable (colour)", control: "inline-radio", options: [true, false, undefined] },
    icon: { name: "Featured icon override", control: "text" },
  },
};

export const Playground = {
  args: { type: "chart-01", breakpoint: "desktop", heading: "Views 24 hours",
    value: "2,000", changeValue: "100%", note: "vs last month", direction: "up" },
  render: (a) => page(
    <div>
      {caption(`type="${a.type}" \u00b7 ${a.breakpoint}`)}
      <KpiTile {...a} onMenu={() => {}} />
    </div>
  ),
};

export const Types = {
  name: "All nine types",
  render: () => page(
    <>
      {[
        ["simple",   "388x90 \u00b7 V pad16 gap2 \u00b7 heading 14/500 Base \u00b7 _Change 03"],
        ["icon-01",  "388x162 \u00b7 V gap24 \u00b7 lg Light outline, Positive, glyph On STRONG \u00b7 _Change 03"],
        ["icon-02",  "388x162 \u00b7 icon BESIDE a 16/600 heading \u00b7 bolt on Info \u00b7 _Change 01"],
        ["icon-03",  "388x162 \u00b7 lg MODERN chip above \u00b7 heading 14/500 Base \u00b7 _Change 02"],
        ["icon-04",  "388x96 \u00b7 root is HORIZONTAL \u00b7 md Modern chip \u00b7 _Change 03"],
        ["chart-01", "388x144 \u00b7 pad 24, the only one \u00b7 heading Strong \u00b7 112x56 Realistic 01"],
        ["chart-02", "388x160 \u00b7 eye in a Modern chip \u00b7 number and change INLINE \u00b7 128x56 Layers"],
        ["chart-03", "388x144 \u00b7 the nested KPI Number & Trend block \u00b7 100x52 Layers"],
        ["chart-04", "388x244 \u00b7 A CARD INSIDE A CARD: root on Neutral/Faint, inner r=12 Elevated"],
      ].map(([t, note]) => (
        <div key={t}>
          {caption(`type="${t}" \u00b7 ${note}`)}
          <KpiTile type={t} onMenu={() => {}} />
        </div>
      ))}
    </>
  ),
  parameters: { docs: { description: { story:
    "Six different heights: 90, 96, 144, 160, 162 and 244. A component with " +
    "three shapes cannot express that, which is what this file had until " +
    "2026-10-08. Note that the NUMBER is weight 600 on every variant, not 700, " +
    "and that Figma is inconsistent about the featured icon's glyph: Icon 01 " +
    "binds Positive/On STRONG while Icon 02 binds Info/On Subtle, for the same " +
    "Light outline type on a Subtle fill. Reproduced rather than normalised, " +
    "because Figma owns the visual design." } } },
};

/**
 * Breakpoint is a WIDTH, 388 or 343, and the heights differ per type too:
 * Icon 01 is 162 on desktop and 154 on mobile, Chart 01 is 144 and 138.
 */
export const Breakpoints = {
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", gap: U("gap-relaxed"),
      alignItems: "flex-start", background: "var(--semantic-color-fill-surface-canvas)" }}>
      {[["desktop", 388], ["mobile", 343]].map(([bp, w]) => (
        <div key={bp} style={{ display: "flex", flexDirection: "column", gap: U("gap-base") }}>
          {caption(`${bp} \u00b7 ${w} wide`)}
          {["icon-01", "chart-01", "simple"].map((t) => (
            <div key={t} style={{ width: w }}>
              <KpiTile type={t} breakpoint={bp} onMenu={() => {}} />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story:
    "The tile is FLUID and fills its column, so these widths are the Figma " +
    "frames rather than constraints in the component. The wrapper sets them." } } },
};

export const TheBuildingBlock = {
  name: "The building block it nests",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "flex", flexDirection: "column",
      gap: U("gap-relaxed"), background: "var(--semantic-color-fill-surface-canvas)" }}>
      <div>
        {caption("KpiNumberAndTrend, raw. No surface, no border, no radius.")}
        <div style={{ width: 388, background: "var(--semantic-color-fill-surface-elevated)",
          border: "1px dashed var(--semantic-color-stroke-static-neutral-base)" }}>
          <KpiNumberAndTrend eyebrow="Views per month" value="2,000"
            change={<Change value="100%" direction="up" note="vs last month" />}
            chart={<MiniChart series={SAMPLE_SERIES["wavy-01"]} direction="up" />} />
        </div>
      </div>
      <div>
        {caption("The same block inside a KPI Tile, which supplies the card.")}
        <div style={{ width: 388 }}>
          <KpiTile type="chart" heading="Views 24 hours" value="2,000"
            change={<ChangeChip value="100%" direction="up" />}
            chart={chart("wavy-01")} onMenu={() => {}} />
        </div>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story:
    "The dashed border is drawn by this story, not by the block, to show where " +
    "its edges are. Anything a widget puts in its content slot gets its card " +
    "from the widget, which is why a KPI Tile inside a widget would be three " +
    "nested cards and is never done." } } },
};

// ─── Tokens ───────────────────────────────────────────────────────────────────

/**
 * THE CARD ITSELF HAS NO HOVER OR PRESSED STATE, and that is a finding rather
 * than an omission: the Figma set's axes are Type, Breakpoint, Dropdown icon
 * and Featured icon, and there is no state axis on any of the nine. What every
 * variant DOES carry is a 44x44 TouchTarget inset 8 from the top-right corner
 * with a 20x20 Dropdown centred in it, so the tile's interaction is that menu.
 */
export const StateMatrix = {
  name: "State matrix",
  render: () => page(
    <>
      {caption(
        "The dropdown is the only interactive element the design gives this card. " +
        "Its states belong to the Dropdown component, shown in place so the corner " +
        "can be checked: the BUTTON is the 44x44 target and the glyph inside it is " +
        "20, which is what Figma's TouchTarget frame means. It was a 44x44 span " +
        "around a 20x20 button until 2026-10-08, so only the middle 20px of the " +
        "corner responded.")}
      <div style={{ display: "flex", gap: U("gap-relaxed"), flexWrap: "wrap" }}>
        {[["Menu closed", false], ["Menu open", true]].map(([label, open]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column",
            gap: U("gap-xxtight") }}>
            <code style={{ fontSize: "var(--semantic-type-font-size-xs)",
              color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>{label}</code>
            {/* The open panel is absolutely positioned, so the row it sits in
                reserves height for it rather than letting it cover the next
                card. */}
            <div style={{ width: 388, marginBottom: open ? 180 : 0 }}>
              <KpiTile type="simple" heading="Views 24 hours" value="2,000"
                changeValue="100%" direction="up"
                defaultMenuOpen={open}
                menuItems={<>
                  <DropdownItem label="Open the full view" icon="open_in_full" />
                  <DropdownItem label="Refresh" icon="refresh" />
                  <DropdownDivider />
                  <DropdownItem label="Remove from this dashboard" danger />
                </>} />
            </div>
          </div>
        ))}
      </div>
      {caption(
        "With the dropdown suppressed, which is what Figma's `Dropdown icon=false` " +
        "gives a tile placed somewhere a menu would have nothing to do.")}
      <div style={{ width: 388 }}>
        <KpiTile type="simple" heading="Views 24 hours" value="2,000"
          changeValue="100%" direction="up" onMenu={false} />
      </div>
      {caption("Both breakpoints, side by side. Mobile is not a narrower desktop: " +
               "Icon 04 goes from 96 tall and horizontal to 146 and stacked.")}
      <div style={{ display: "flex", gap: U("gap-relaxed"), alignItems: "flex-start" }}>
        <div style={{ width: 388 }}>
          <KpiTile type="icon-04" breakpoint="desktop" heading="Views 24 hours"
            value="2,000" changeValue="100%" direction="up" />
        </div>
        <div style={{ width: 240 }}>
          <KpiTile type="icon-04" breakpoint="mobile" heading="Views 24 hours"
            value="2,000" changeValue="100%" direction="up" />
        </div>
      </div>
    </>
  ),
  parameters: { docs: { description: { story:
    "Hover and press the dropdown. The state layer is 28x28 at r=8 inside a " +
    "44x44 target, and it fills with Fill/Action/Primary/Subtle, a light blue " +
    "rather than the neutral grey this shipped with until 2026-10-08." } } },
};

/**
 * The smallest unit of this component is the Change chip, which is where
 * direction and sentiment are kept apart. Isolating it with its own controls is
 * the only way to see that a falling cost is Positive.
 */
export const ElementExplorer = {
  name: "Element explorer",
  args: { value: "100%", direction: "up", favourable: true, type: "03", note: "vs last month" },
  argTypes: {
    value: { name: "Value", control: "text" },
    direction: { name: "Direction, which the ARROW follows",
      control: "inline-radio", options: ["up", "down"] },
    favourable: { name: "Favourable, which the COLOUR follows", control: "boolean" },
    type: { name: "Figma Change type", control: "inline-radio", options: CHANGE_TYPES },
    note: { name: "Note beside the chip", control: "text" },
  },
  render: (a) => page(
    <>
      {caption(
        `Type ${a.type}. 01 and 02 are naked, 03 is a bordered pill at r=6, 04 is a ` +
        "tinted badge at r=12. 01 draws arrow_upward/arrow_downward; 02 draws " +
        "moving/trending_down, which is a different glyph pair and not a weight " +
        "variant of the first.")}
      <div style={{ display: "inline-flex", alignItems: "center",
        outline: "1px dashed var(--semantic-color-stroke-static-neutral-base)",
        alignSelf: "flex-start", padding: 2 }}>
        <Change value={a.value} direction={a.direction} favourable={a.favourable}
          type={a.type} note={a.note} />
      </div>
      {caption(
        "Set Direction to down and leave Favourable on, which is a cost that fell: " +
        "the arrow points down and the colour stays positive. Collapsing the two " +
        "props into one paints every rising number green.")}
    </>
  ),
};

export const TokensFill = {
  name: "Tokens: fill",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Fill",
        note: "The chart ramp is the dedicated fifteen-step sequential ramp, not " +
              "the blue brand ramp: the bars are categories, so nothing in them is " +
              "good or bad. An earlier version bound Fill/Static/Brand and came out " +
              "navy where the design is violet.",
        rows: [
          ["--semantic-color-fill-surface-elevated",
           "Card surface, and the chip's own fill"],
          ["--semantic-color-fill-static-positive-subtle",
           "Featured icon circle, favourable"],
          ["--semantic-color-fill-static-negative-subtle",
           "Featured icon circle, unfavourable"],
          ["--semantic-color-fill-chart-sequential-07",
           "Bottom series in a stacked bar"],
          ["--semantic-color-fill-chart-sequential-09",
           "Middle series, bound in Figma"],
          ["--semantic-color-fill-chart-sequential-11",
           "Top series, bound in Figma"],
        ] },
    ]} />
  ),
};

export const TokensStroke = {
  name: "Tokens: stroke",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Stroke",
        note: "The mini chart's LINE genuinely strokes with " +
              "Stroke/Static/Positive/Strong, so it belongs here rather than under " +
              "fill. The axis line and the card border are both Base width.",
        rows: [
          ["--semantic-color-stroke-static-neutral-base",
           "Card border, and the chip's border"],
          ["--semantic-color-stroke-static-positive-strong",
           "The mini chart's LINE vector only, which genuinely strokes with this"],
          ["--semantic-color-stroke-static-negative-strong",
           "The same, falling"],
          ["--semantic-color-stroke-action-secondary-rest",
           "Trend filter pill border"],
          ["--semantic-layout-units-borderwidth-base",
           "Card, chip and axis line, 1"],
        ] },
    ]} />
  ),
};

export const TokensText = {
  name: "Tokens: text",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Text",
        note: "Four heading treatments across the nine types share three foreground " +
              "tokens. The number is always Strong.",
        rows: [
          ["--semantic-color-foreground-static-neutral-strong",
           "Heading on Chart, the number, and the chip's text"],
          ["--semantic-color-foreground-static-neutral-subtle",
           "Eyebrow in the nested block"],
          ["--semantic-color-foreground-static-positive-on-subtle",
           "Favourable trend text and arrow"],
          ["--semantic-color-foreground-static-negative-on-subtle",
           "Unfavourable trend text and arrow"],
        ] },
    ]} />
  ),
};

export const TokensIcon = {
  name: "Tokens: icon",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Icon",
        note: "Featured Icon paints the glyph with the on-subtle foreground of its " +
              "own tone, so a Positive circle gets Positive text. Type icon-01 " +
              "overrides that to on-strong, which is the one place the pair is " +
              "deliberately broken.",
        rows: [
          ["--semantic-color-foreground-static-neutral-base",
           "Heading on Simple and Icon"],
        ] },
    ]} />
  ),
};

export const TokensTypography = {
  name: "Tokens: typography",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Typography",
        note: "The number is 32 at weight 600. It has no line-height token: the " +
              "ladder goes 30, 40, 44, and the design is 36, so the implementation " +
              "names that as a gap rather than rounding to a rung that would move " +
              "the card's height.",
        rows: [
          ["--semantic-type-font-size-xxl",
           "The number, 32"],
          ["--semantic-type-font-size-s",
           "Heading and chip, 14"],
          ["--semantic-type-font-size-xxxs",
           "Eyebrow, 10"],
          ["--semantic-type-font-size-xxs",
           "Chart axis and legend labels"],
          ["--semantic-type-weight-bold",
           "The number"],
          ["--semantic-type-line-height-xxl-single",
           "The number"],
          ["--semantic-type-letter-spacing-spacious",
           "Heading, chip and labels"],
          ["--semantic-type-letter-spacing-wide",
           "Eyebrow"],
        ] },
    ]} />
  ),
};

export const TokensSpacing = {
  name: "Tokens: spacing",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Spacing",
        note: "Icon's gap and Chart's padding read 20 in Figma, and 20 is not a " +
              "rung: the ladder goes 16 then 24. Nineteen bindings across the set " +
              "pointed straight at the Unit/20 primitive and were rebound to " +
              "Relaxed, 24, on 2026-10-07, which is why Chart is 144 tall rather " +
              "than 136.",
        rows: [
          ["--semantic-layout-units-padding-base",
           "Simple and Icon padding, 16"],
          ["--semantic-layout-units-padding-relaxed",
           "Chart padding, 24"],
          ["--semantic-layout-units-gap-relaxed",
           "Icon gap, 24"],
          ["--semantic-layout-units-gap-base",
           "Number row gap, 16"],
          ["--semantic-layout-units-gap-tight",
           "Chart gap, 8"],
          ["--semantic-layout-units-gap-xxxtight",
           "Simple gap, 2"],
        ] },
    ]} />
  ),
};

export const TokensRadius = {
  name: "Tokens: radius",
  tags: ["!dev"],
  render: () => (
    <TokenTables groups={[
      { title: "Radius",
        note: "XLarge on the card, Base on the chip, XSmall on the bar caps.",
        rows: [
          ["--semantic-layout-units-cornerradius-xlarge",
           "Card radius, 16"],
          ["--semantic-layout-units-cornerradius-base",
           "Chip radius"],
          ["--semantic-layout-units-cornerradius-xsmall",
           "Bar cap radius"],
        ] },
    ]} />
  ),
};

export const ChangeTypes = {
  name: "Change: all four Figma types",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "grid",
      gridTemplateColumns: "auto auto auto 1fr", gap: U("gap-base"),
      alignItems: "center", justifyItems: "start",
      background: "var(--semantic-color-fill-surface-elevated)" }}>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>TYPE</code>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>POSITIVE</code>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>NEGATIVE</code>
      <code style={{ fontSize: "var(--semantic-type-font-size-xxs)",
        color: "var(--semantic-color-foreground-static-neutral-subtle)" }}>MEASURED</code>
      {[
        ["01", "55x20, arrow_upward / arrow_downward, no container, glyph AND text in the trend"],
        ["02", "55x20, moving / trending_down, no container, glyph AND text in the trend"],
        ["03", "73x28, north_east / south_east, bordered pill r=6, GLYPH in the trend and text Neutral/Strong"],
        ["04", "52x16, moving / trending_down, tinted Badge r=12, Subtle fill with its Subtle stroke"],
      ].map(([t, note]) => (
        <React.Fragment key={t}>
          <code style={{ fontSize: "var(--semantic-type-font-size-xs)" }}>{t}</code>
          <Change type={t} value="100%" direction="up" />
          <Change type={t} value="100%" direction="down" />
          <span style={{ fontSize: "var(--semantic-type-font-size-xs)",
            color: "var(--semantic-color-foreground-static-neutral-base)" }}>{note}</span>
        </React.Fragment>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story:
    "One Figma set, four Types. Direction drives the ARROW and favourable " +
    "drives the COLOUR, which is why they are separate props: expenses up is " +
    "a rising arrow and a red one. The negative glyph is not the positive " +
    "rotated: Figma draws moving for up and trending_down for down." } } },
};

/**
 * Figma `_Chart mini` 40009415:27919, all twelve Types at both Trends.
 */
export const ChartShapes = {
  name: "Mini chart: all twelve Figma shapes",
  render: () => (
    <div style={{ padding: U("padding-relaxed"), display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: U("gap-base"),
      background: "var(--semantic-color-fill-surface-elevated)" }}>
      {Object.keys(SAMPLE_SERIES).map((k) => (
        <div key={k}>
          {caption(`${k} \u00b7 ${curveFor(k)} \u00b7 marker ${SAMPLE_MARKERS[k].join(", ") || "none"}`)}
          <div style={{ display: "flex", gap: U("gap-base") }}>
            {["up", "down"].map((d) => (
              <div key={d} style={{ width: 112, height: 56 }}>
                <MiniChart series={SAMPLE_SERIES[k]} direction={d} curve={curveFor(k)}
                  markerIndex={SAMPLE_MARKERS[k]} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Layers is the twelfth type and a DIFFERENT drawing: 128x56, two
          translucent areas at 0.10, no stroke and no marker. */}
      <div>
        {caption("layers \u00b7 two filled areas \u00b7 no line, no marker")}
        <div style={{ display: "flex", gap: U("gap-base") }}>
          {["up", "down"].map((d) => (
            <div key={d} style={{ width: 128, height: 56 }}>
              <MiniChart layers={SAMPLE_LAYERS} direction={d} />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story:
    "112x56 at Glance scale. The line is 2px with round caps in " +
    "Stroke/Static/{Positive,Negative}/Strong; the area under it is the same " +
    "colour faded downward; the marker is a 19px ring with an 11px " +
    "Fill/Surface/Elevated dot. CURVE IS PART OF THE SHAPE: Figma's Wavy and " +
    "Layers paths are beziers and its Realistic paths are polylines, and " +
    "drawing all twelve as polylines made every Wavy look like a Realistic." } } },
};
