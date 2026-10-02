/**
 * Responsive Scroll-to-Enable.
 *
 * Built from Figma's Scroll-to-Enable and Scroll-to-Enable (Mobile) component
 * sets plus the interactive demo linked from that page:
 * https://quilt-clump-68826624.figma.site/
 *
 * Playground is the desktop mode. Drawer forces the narrow mode so the bottom
 * sheet can be exercised without resizing the window, because the real switch
 * is a 768px media query and a story cannot resize the viewport for you.
 */
import React from "react";
import {
  ScrollToEnable,
  DRAWER_BREAKPOINT,
  BOTTOM_THRESHOLD,
  BOX_HEIGHT,
} from "../../../../components/checkbox/scroll-to-enable.jsx";

/** The real agreement text from the demo, so the scroll length is realistic. */
const CLAUSES = [
  ["", "Welcome to our service. By using this application, you agree to be bound by the following terms and conditions. Please read these terms carefully before proceeding."],
  ["1. Acceptance of Terms", "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."],
  ["2. Use License", "Permission is granted to temporarily download one copy of the materials on our service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."],
  ["3. Disclaimer", "The materials on our service are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement."],
  ["4. Limitations", "In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our service."],
  ["5. Privacy Policy", "Your privacy is important to us. Our privacy policy explains how we collect, use, and protect your personal information. By using this service, you consent to our privacy practices."],
  ["6. Modifications", "We may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then-current version of these terms and conditions."],
];

const Agreement = () => (
  <>
    {CLAUSES.map(([h, p], i) => (
      <div key={i} style={{ display: "flex", flexDirection: "column",
        gap: "var(--semantic-layout-units-gap-xtight)" }}>
        {h && (
          <strong style={{ color: "var(--semantic-color-foreground-static-neutral-bold)",
            fontSize: "var(--semantic-type-font-size-s)",
            fontWeight: "var(--semantic-type-weight-semibold)" }}>{h}</strong>
        )}
        <p style={{ margin: 0 }}>{p}</p>
      </div>
    ))}
    <p style={{ margin: 0, color: "var(--semantic-color-foreground-static-neutral-bold)",
      fontWeight: "var(--semantic-type-weight-semibold)" }}>
      End of Agreement - Thank you for reading to the bottom.
    </p>
  </>
);

const frame = (children, width = 560) => (
  <div style={{ maxWidth: width, padding: "var(--semantic-layout-units-padding-relaxed)" }}>
    {children}
  </div>
);

export default {
  title: "Library/Checkbox/Scroll to Enable",
  component: ScrollToEnable,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component:
      "A legal agreement that enables its own checkbox once the reader has " +
      "demonstrably reached the end of the text. Above " + DRAWER_BREAKPOINT +
      "px the text sits in an inline scroll box; below it, the box is replaced " +
      "by a bottom sheet, because an inline scroll container on a phone is a " +
      "scroll-within-scroll and, inside a modal, a dialog on a dialog. The " +
      "checkbox never moves into the sheet. Reaching the end is a one-way " +
      "change, the bottom threshold is " + BOTTOM_THRESHOLD + "px to survive " +
      "sub-pixel rounding, and content shorter than its box counts as read." } },
  },
};

/** Desktop: inline scroll box, progress bar, scrim, success state. */
export const Playground = {
  args: {
    title: "User Agreement",
    contentTitle: "Terms and Conditions",
    boxHeight: BOX_HEIGHT,
    size: "default",
  },
  argTypes: {
    title:        { name: "Card heading", control: "text" },
    contentTitle: { name: "Agreement heading", control: "text",
                    description: "Also names the scroll region and the sheet for a screen reader." },
    boxHeight:    { name: "Inline box height (px)", control: { type: "range", min: 160, max: 420, step: 20 },
                    description: "The specification's range is 240 to 320." },
    size:         { name: "Checkbox size", control: "inline-radio", options: ["default", "s"] },
    forceNarrow:  { table: { disable: true } },
  },
  render: (args) => frame(
    <ScrollToEnable {...args} forceNarrow={false}>
      <Agreement />
    </ScrollToEnable>
  ),
};

/**
 * Narrow mode, forced. Tap Read Agreement to open the sheet; the checkbox stays
 * out here, which is the point of the pattern.
 */
export const Drawer = {
  name: "Drawer (narrow)",
  render: () => frame(
    <ScrollToEnable forceNarrow>
      <Agreement />
    </ScrollToEnable>,
    380
  ),
  parameters: { docs: { description: { story:
    "Forced into sheet mode so it can be exercised at any window width. The " +
    "sheet traps focus, closes on Escape or on the backdrop, locks body " +
    "scroll, and returns focus to the trigger. Done Reading stays disabled " +
    "until the end of the text is reached, and the enabled state survives " +
    "closing and re-opening the sheet." } } },
};

/**
 * The edge case the specification calls out: there is nothing to scroll, so
 * requiring a scroll would be an unsatisfiable condition. Enabled on mount.
 */
export const ShortContentIsAlreadyRead = {
  name: "Short content is already read",
  render: () => frame(
    <ScrollToEnable forceNarrow={false} boxHeight={BOX_HEIGHT}>
      <p style={{ margin: 0 }}>
        This agreement is shorter than its own box, so there is nothing to
        scroll and the checkbox is enabled immediately.
      </p>
    </ScrollToEnable>
  ),
};

/** Keyboard only: Tab to the region, then arrow keys. */
export const KeyboardOnly = {
  name: "Keyboard only",
  tags: ["!dev"],
  render: () => frame(
    <ScrollToEnable forceNarrow={false}>
      <Agreement />
    </ScrollToEnable>
  ),
  parameters: { docs: { description: { story:
    "The scroll region carries tabIndex 0, which is what makes the arrow keys " +
    "scroll it. Without that the pattern would be completable by pointer " +
    "only and the agreement impossible to accept with a keyboard." } } },
};
