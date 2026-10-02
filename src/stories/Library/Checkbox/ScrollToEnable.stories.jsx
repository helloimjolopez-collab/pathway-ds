// Scroll-to-Enable — Storybook stories (React framework)
//
// Module is components/checkbox/scroll-to-enable.jsx; nothing is redefined
// here. It lives in the checkbox folder because it is not a new control: it is
// the Checkbox plus a precondition, and it composes the real Checkbox.
//
// Figma reference: page '↳ ❇️ Scroll to Enable Checkbox' (40003300:17495),
// which is documentation and screenshots rather than a component set.

import React, { useState } from "react";
import { ScrollToEnableCheckbox, ScrollToEnableKeyframes } from "../../../../components/checkbox/scroll-to-enable.jsx";

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;

const PAGE = { padding: SU("padding-base"), background: SC("fill-surface-canvas"), maxWidth: 560 };
const EYEBROW = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-semibold"),
  fontSize: ST("font-size-xs"), letterSpacing: ST("letter-spacing-extraspacious"),
  textTransform: "uppercase", color: SC("foreground-static-neutral-faint"),
  margin: `${SU("gap-relaxed")} 0 ${SU("gap-tight")}`,
};
const META = {
  fontFamily: ST("family-brand"), fontSize: ST("font-size-xs"),
  color: SC("foreground-static-neutral-faint"), margin: 0,
};
const P = { margin: `0 0 ${SU("gap-tight")}` };

const TERMS = [
  "These terms govern your use of the giving and accounting services provided to your organisation.",
  "Payouts settle to the bank account on file. Where a payout fails, the funds are returned to the originating batch and the batch is reopened for correction.",
  "Fees are deducted before settlement. A statement of fees is available for every batch and is retained for seven years.",
  "You are responsible for the accuracy of the donor records you import. Records that cannot be matched are held in a review queue rather than being discarded.",
  "Refunds issued more than one hundred and twenty days after the original gift are processed as a separate disbursement and appear on the following statement.",
  "Either party may end this agreement with thirty days written notice. Outstanding payouts complete after termination.",
  "By continuing you confirm you have authority to accept these terms on behalf of your organisation.",
];

export default {
  title: "Library/Checkbox/Scroll to Enable",
  component: ScrollToEnableCheckbox,
  argTypes: {
    label: { name: "Label", control: "text" },
    hint: { name: "Locked hint", control: "text" },
    readyHint: { name: "Unlocked hint", control: "text" },
    height: { name: "Box height (px)", control: { type: "range", min: 80, max: 420, step: 10 } },
    tolerance: { name: "Bottom tolerance (px)", control: { type: "range", min: 0, max: 16, step: 1 } },
    error: { name: "Error", control: "boolean" },
  },
  args: {
    label: "I have read and agree to the above",
    hint: "Scroll to the end to continue",
    readyHint: "",
    height: 220,
    tolerance: 2,
    error: false,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A block of content the user must actually reach the end of before the checkbox beneath it " +
          "can be ticked. It lives in the checkbox folder because it is not a new control. " +
          "Four decisions make or break it. " +
          "Once the end is reached the checkbox STAYS enabled: scrolling up to re-read a clause must " +
          "not punish the careful reader, and re-locking would let the control flicker as the page " +
          "moves. " +
          "The scroll region is KEYBOARD OPERABLE, with tabIndex 0 and a real overflow container, so " +
          "arrow keys, Page Down and End all reach the end. Without that a keyboard-only or switch " +
          "user could never satisfy the precondition and could never submit, which turns a gate into " +
          "a hard block; this is the part implementations usually miss. " +
          "Content SHORTER than its box counts as read, because a box with no bottom to reach would " +
          "otherwise lock the form forever on a tall screen. " +
          "And it RE-MEASURES on resize, because a font loading, a window resize or late content all " +
          "change whether the end has been reached, and measuring once on mount is how this breaks " +
          "in production.",
      },
    },
  },
};

export const Playground = (args) => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={PAGE}>
      <ScrollToEnableKeyframes />
      <ScrollToEnableCheckbox {...args} checked={checked} onChange={setChecked}>
        {TERMS.map((t, i) => <p key={i} style={P}>{t}</p>)}
      </ScrollToEnableCheckbox>
      <p style={{ ...META, marginTop: SU("padding-base") }}>
        Checked: {String(checked)}. Try it with the keyboard: Tab into the box, then End.
      </p>
    </div>
  );
};

export const KeyboardOnly = () => {
  const [checked, setChecked] = useState(false);
  const [reached, setReached] = useState(false);
  return (
    <div style={PAGE}>
      <ScrollToEnableKeyframes />
      <p style={EYEBROW}>Reach the end without a mouse</p>
      <ScrollToEnableCheckbox
        checked={checked}
        onChange={setChecked}
        onReachEnd={() => setReached(true)}
        readyHint="You can now agree"
      >
        {TERMS.map((t, i) => <p key={i} style={P}>{t}</p>)}
      </ScrollToEnableCheckbox>
      <p style={{ ...META, marginTop: SU("padding-base") }}>
        Reached the end: {String(reached)}. Tab focuses the scroll region, then End jumps to the
        bottom and the checkbox unlocks. If this did not work the pattern would be a hard block for
        anyone not using a mouse.
      </p>
    </div>
  );
};

export const ShortContentIsAlreadyRead = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={PAGE}>
      <ScrollToEnableKeyframes />
      <p style={EYEBROW}>Nothing to scroll, so enabled immediately</p>
      <ScrollToEnableCheckbox checked={checked} onChange={setChecked} height={220}>
        <p style={P}>
          By continuing you confirm you have authority to accept these terms on behalf of your
          organisation.
        </p>
      </ScrollToEnableCheckbox>
      <p style={{ ...META, marginTop: SU("padding-base") }}>
        The content is shorter than its box, so there is no end to reach and the checkbox is enabled
        on mount. A box that can never be scrolled to the bottom because it has no bottom would
        otherwise lock the form forever, which is exactly what happens on a tall screen.
      </p>
    </div>
  );
};

export const ErrorState = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={PAGE}>
      <ScrollToEnableKeyframes />
      <p style={EYEBROW}>Submitted without agreeing</p>
      <ScrollToEnableCheckbox
        checked={checked}
        onChange={setChecked}
        error
        height={160}
        readyHint="You must agree before continuing"
      >
        {TERMS.slice(0, 5).map((t, i) => <p key={i} style={P}>{i + 1}. {t}</p>)}
      </ScrollToEnableCheckbox>
    </div>
  );
};
