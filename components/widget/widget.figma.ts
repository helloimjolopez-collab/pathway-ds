// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40009622-39702
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/widget/widget.jsx
// component=Widget

import figma from "figma"

// SCOPE: this maps the CONTAINER and nothing else.
//
// Widget is a frame around a slot. What goes in the slot is not part of this
// mapping: Metric ships in the same module but is CONTENT, and Chart, Table and
// List are separate components that do not exist in the repo yet. Do not map
// MainContent.Slot, Slot.RowEnd or Slot.HoverIcons to anything.
//
// The four page-level compositions a Widget sits beside on a dashboard
// (PageHeading, PageTabs, PageToolbar, PageSection) belong to PageTemplate and
// are mapped from there, not here.
//
// NODE CHOICE: 40009622:39702 is the Widget inside SECTION "Amplify". An
// identical set exists in the other brand's section at 40016737:144022. Same
// name, same props, different brand, so the section is the only thing that
// tells them apart. This mapping is the Amplify one on purpose, and the other
// brand is NOT named in this file: Storybook publishes components/ to public
// GitHub Pages, so this file is served. See .storybook/preview.js for the same
// rule on token imports.

// Figma's Size axis carries three values. `Full` is NOT one of them: it is a
// separate Widget.Focus frame (40010500:6815), not a variant, so it cannot be
// reached from this component set. The component supports four sizes and a
// consumer picks `full` explicitly; nothing here can emit it.
const size = figma.selectedInstance.getEnum("Size", {
  Glance: "glance",
  Explore: "explore",
  Detail: "detail",
})

// Whether the hover-revealed info and go-to icons are present at all. In code
// they are driven by passing onInfo / onGoTo rather than by a boolean, because
// a revealed control with nothing to do is worse than no control. So the
// boolean decides whether the snippet includes those handlers.
const showHoverActions = figma.selectedInstance.getBoolean(
  "Show Hover Actions",
)

// Glance is flat and carries no content toolbar, so its snippet holds a Metric
// directly. Everything else layers a panel and gets a toolbar whose left side
// is the identity control that doubles as the heading.
export default {
  id: "Widget",
  imports: ['import { Widget, WidgetToolbar, Metric } from "./widget.jsx";'],
  example: figma.code`<Widget title="Giving by fund"${figma.helpers.react.renderProp(
    "size",
    size,
  )}${
    showHoverActions
      ? " onInfo={() => {}} onGoTo={() => {}}"
      : ""
  } onRefresh={() => {}} updatedLabel="Updated just now"${
    size === "glance"
      ? ""
      : " toolbar={<WidgetToolbar identity={<ScopeChip />} />}"
  }>
  ${
    size === "glance"
      ? '<Metric value="$48,210" delta="12.4%" deltaDirection="up" deltaNote="vs last month" />'
      : "{content}"
  }
</Widget>`,
}
