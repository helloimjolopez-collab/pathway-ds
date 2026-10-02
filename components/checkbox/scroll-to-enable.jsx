import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Checkbox } from "./checkbox.jsx";

/**
 * scroll-to-enable.jsx — the Scroll-to-Enable pattern.
 *
 * A block of content the user must actually reach the end of before the
 * checkbox beneath it can be ticked. Terms, a policy, a consent statement:
 * anything where agreeing without having seen it is the thing to prevent.
 *
 * It lives in components/checkbox/ rather than in its own folder because it is
 * not a new control. It is the Checkbox plus a precondition, and it composes
 * the real Checkbox rather than restyling one.
 *
 * FIGMA
 * Page '↳ ❇️ Scroll to Enable Checkbox' 40003300:17495. That page is
 * documentation and screenshots: there is no COMPONENT or COMPONENT_SET on it,
 * so there was nothing to transcribe variant by variant. The behaviour here
 * comes from the pattern and the control it wraps, and the page is linked in
 * the manifest as the reference rather than as the source.
 *
 * THE FOUR DECISIONS THAT MAKE OR BREAK IT
 *
 * 1. ONCE REACHED, IT STAYS ENABLED. Scrolling back up does not re-disable the
 *    checkbox. Re-locking it would mean a user who scrolls up to re-read a
 *    clause is punished for reading carefully, and it would let the control
 *    flicker between states while the page moves.
 *
 * 2. THE SCROLL REGION IS KEYBOARD OPERABLE. tabIndex 0 and a real overflow
 *    container, so a keyboard user can reach the end with the arrow keys, Page
 *    Down, or End. Without this the pattern is a hard block: a keyboard-only
 *    or switch user could never satisfy the precondition and could never
 *    submit the form. This is the part implementations usually miss.
 *
 * 3. CONTENT SHORTER THAN ITS BOX IS ALREADY READ. If there is nothing to
 *    scroll, the checkbox is enabled immediately. A box that can never be
 *    scrolled to the bottom because it has no bottom would otherwise lock the
 *    form forever, and that is exactly what happens on a tall screen.
 *
 * 4. IT RE-MEASURES. The container is watched with a ResizeObserver, because
 *    a font loading, a window resize, or content arriving late all change
 *    whether the end has been reached. Measuring once on mount is how this
 *    pattern breaks in production.
 *
 * The readiness change is announced politely through a live region, so a screen
 * reader user is told the checkbox has become available rather than discovering
 * it by trying.
 */

const SC = (n) => `var(--semantic-color-${n})`;
const SU = (n) => `var(--semantic-layout-units-${n})`;
const ST = (n) => `var(--semantic-type-${n})`;
const MO = (n) => `var(--motion-${n})`;

export const T = {
  surface:    SC("fill-surface-elevated"),
  border:     SC("stroke-static-neutral-base"),
  borderFocus: SC("stroke-focusring-base"),
  body:       SC("foreground-static-neutral-base"),
  hint:       SC("foreground-static-neutral-faint"),
  scrim:      SC("fill-surface-elevated"),
};

export const L = {
  radius:     SU("cornerradius-base"),
  border:     SU("borderwidth-base"),
  padH:       SU("padding-medium"),
  padV:       SU("padding-medium"),
  gap:        SU("gap-tight"),
  stackGap:   SU("gap-medium"),
  fade:       32,
  focusWidth: "var(--contextual-layout-units-focusring-width)",
  focusOffset:"var(--contextual-layout-units-focusring-offset)",
};

const TYPE_BODY = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
  fontSize: ST("font-size-s"), lineHeight: ST("line-height-s-single"),
  letterSpacing: ST("letter-spacing-wide"),
};
const TYPE_HINT = {
  fontFamily: ST("family-brand"), fontWeight: ST("weight-regular"),
  fontSize: ST("font-size-xs"), lineHeight: ST("line-height-xs-single"),
  letterSpacing: ST("letter-spacing-extraspacious"),
};

/**
 * @param {node}    children       the content that must be scrolled
 * @param {string}  label          the checkbox label
 * @param {boolean} checked
 * @param {func}    onChange
 * @param {number}  height         the scroll box height in px
 * @param {number}  tolerance      px from the bottom that counts as the end.
 *                                 Not zero: sub-pixel layout and elastic
 *                                 scrolling mean an exact comparison can never
 *                                 be satisfied on some devices.
 * @param {string}  hint           one line shown while still locked. The only
 *                                 prose this component renders, and it earns
 *                                 its place: without it a disabled checkbox
 *                                 with no reason looks broken.
 * @param {string}  readyHint      optional line shown once unlocked
 * @param {boolean} error
 * @param {func}    onReachEnd     fired once, when the end is first reached
 */
export function ScrollToEnableCheckbox({
  children,
  label = "I have read and agree to the above",
  checked = false,
  onChange,
  height = 220,
  tolerance = 2,
  hint = "Scroll to the end to continue",
  readyHint,
  error = false,
  disabled = false,
  onReachEnd,
  size,
  style,
  className = "",
  ...rest
}) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const scrollRef = useRef(null);
  const firedRef = useRef(false);
  const hintId = useId();

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Content shorter than its box has no end to reach, so it counts as read.
    const scrollable = el.scrollHeight - el.clientHeight > tolerance;
    const done = !scrollable
      || el.scrollTop + el.clientHeight >= el.scrollHeight - tolerance;
    setAtBottom(done);
    if (done && !firedRef.current) {
      firedRef.current = true;
      setReachedEnd(true);
      onReachEnd?.();
    }
  }, [tolerance, onReachEnd]);

  // Re-measure on mount AND on resize. A font loading, a window resize or
  // content arriving late all change whether the end has been reached, and
  // measuring once on mount is how this pattern breaks in production.
  useEffect(() => {
    measure();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure]);

  const locked = !reachedEnd;
  const boxDisabled = disabled || locked;

  return (
    <div
      className={`pw-scroll-to-enable ${className}`}
      data-reached-end={reachedEnd || undefined}
      style={{ display: "flex", flexDirection: "column", gap: L.stackGap, minWidth: 0, ...style }}
      {...rest}
    >
      <div style={{ position: "relative", minWidth: 0 }}>
        <div
          ref={scrollRef}
          onScroll={measure}
          onFocus={() => setFocusWithin(true)}
          onBlur={() => setFocusWithin(false)}
          // Keyboard operable on purpose. Without tabIndex a keyboard-only user
          // can never reach the end, so can never tick the box, so can never
          // submit. That makes the pattern a hard block rather than a gate.
          tabIndex={0}
          role="region"
          aria-label="Terms to read"
          style={{
            height, overflowY: "auto", minWidth: 0,
            padding: `${L.padV} ${L.padH}`,
            background: T.surface,
            border: `${L.border} solid ${focusWithin ? T.borderFocus : T.border}`,
            borderRadius: L.radius,
            outline: focusWithin ? `${L.focusWidth} solid ${T.borderFocus}` : "none",
            outlineOffset: L.focusOffset,
            ...TYPE_BODY,
            color: T.body,
            transition: `border-color ${MO("duration-2")} ${MO("easing-standard")}`,
          }}
        >
          {children}
        </div>

        {/* A fade at the foot while there is more to read. Decorative: the hint
            below carries the same information in text, so this is never the
            only cue. */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute", left: L.border, right: L.border, bottom: L.border,
            height: L.fade, pointerEvents: "none",
            borderBottomLeftRadius: L.radius, borderBottomRightRadius: L.radius,
            backgroundImage: `linear-gradient(to top, ${T.scrim}, transparent)`,
            opacity: atBottom ? 0 : 1,
            transition: `opacity ${MO("duration-3")} ${MO("easing-standard")}`,
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: L.gap, minWidth: 0 }}>
        {/* Checkbox takes the label as a PROP and the description id as
            `describedBy`, not as children and aria-describedby. Passing them
            the React way rendered an unlabelled box. */}
        <Checkbox
          checked={checked}
          disabled={boxDisabled}
          error={error}
          size={size}
          label={label}
          onChange={onChange}
          describedBy={locked ? hintId : undefined}
        />

        {/* Polite live region: a screen reader user is told the checkbox has
            become available rather than discovering it by trying. */}
        <span
          id={hintId}
          role="status"
          aria-live="polite"
          style={{ ...TYPE_HINT, color: T.hint, minWidth: 0 }}
        >
          {locked ? hint : (readyHint || "")}
        </span>
      </div>
    </div>
  );
}

export const ScrollToEnableKeyframes = () => (
  <style>{`
@media (prefers-reduced-motion: reduce) {
  .pw-scroll-to-enable * { transition: none !important; }
  .pw-scroll-to-enable [role="region"] { scroll-behavior: auto !important; }
}
`}</style>
);

export default ScrollToEnableCheckbox;
