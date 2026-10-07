// url=https://www.figma.com/design/3sw45aVcngFAmpbP6cfrXP?node-id=40002486-13398
// source=https://github.com/helloimjolopez-collab/pathway-ds/blob/main/components/button/button.jsx
// component=ButtonSpinner

import figma from "figma"

// `Loading.Animation` 40002486:13398, nested 21 times inside the Button set and
// unmapped until 2026-10-07. Three variants:
//
//   Spinner Style     Loading
//   Animation Steps   Step 1 | Step 2 | Step 3
//
// THE STEPS ARE FRAMES OF AN ANIMATION, NOT STATES. Figma cannot animate a
// rotation, so it draws the spinner at three angles and a designer flips
// between them. In code there is one element and CSS rotates it, so there is
// nothing for `Animation Steps` to map to and no prop for it.
//
// The same shape explains why the standalone Spinner has no mapping at all:
// its Figma node is `Animated Spinner/Progress-Activity/Step 1`, one 12x12
// still with no properties and no parent page. Mapping the React spinner to a
// single animation frame would assert something false.
//
// Duration 0.75s in a button against the standalone spinner's 1s: tighter
// feedback for an action already in progress. Paired with easing-linear,
// because a loop that eases reads as stopping.
//
// ON LIGHT AND MIDNIGHT: a snippet is code, not a render, so the mode toggle
// cannot change it. Every colour here resolves through a MODE-AGNOSTIC token
// name switched by a `data-theme` ancestor, so the same markup renders both:
//   <div data-theme="midnight">  ...same markup, Midnight values...

export default {
  id: "ButtonSpinner",
  imports: ['import { ButtonSpinner } from "./button.jsx";'],
  example: figma.code`{/* The three Animation Steps are frames of one rotation, so there
    is no prop for them: CSS rotates a single element. It inherits currentColor,
    so the label and the spinner cannot disagree. */}
<ButtonSpinner size={20} />`,
  metadata: { nestable: true },
}
