/**
 * Responsive Scroll-to-Enable — a legal agreement that enables its own checkbox
 * once the reader has demonstrably reached the end of the text.
 *
 * SOURCE OF TRUTH
 * Figma Scroll-to-Enable (desktop) and Scroll-to-Enable (Mobile), on the page
 * "↳ ❇️ Scroll to Enable Checkbox", plus the interactive demo and technical
 * specification linked from that page's LIVE DEMO button:
 * https://quilt-clump-68826624.figma.site/
 *
 * The first version of this file was reasoned from first principles rather than
 * from either source, and was missing most of the pattern: no progress bar, no
 * percentage, no agreement heading, no Continue button, no scrim, no success
 * state, no error state and no mobile mode at all. Rebuilt 2026-10-02 against
 * the demo, state by state.
 *
 * THE TWO MODES ARE NOT A STYLING CHOICE. Below 768px the inline scroll box is
 * replaced by a bottom sheet, because an inline scroll container on a phone is a
 * scroll-within-scroll: the reader cannot tell whether a drag will move the
 * agreement or the page, and when the agreement already sits inside a modal the
 * inline box also stacks a dialog on a dialog. The sheet removes both. What does
 * NOT move into the sheet is the checkbox: it stays in the main interface,
 * because a reader who checks a box inside a drawer and then dismisses the
 * drawer cannot see what they agreed to, and a reader who dismisses without
 * checking has no idea the box exists.
 *
 * SEVEN DECISIONS THAT CARRY THE PATTERN, all from the specification:
 *
 *  1. The read flag is ONE-WAY. Once the end has been reached the control stays
 *     enabled: scrolling back up, closing the sheet, or re-opening it does not
 *     take the right to agree away again.
 *  2. The bottom threshold is 10px, not 0. Sub-pixel rounding and fractional
 *     device pixel ratios mean an element scrolled fully to the bottom routinely
 *     reports one or two pixels remaining, so an exact test never fires for some
 *     readers and the checkbox is unreachable.
 *  3. Content shorter than its box counts as read IMMEDIATELY. There is nothing
 *     to scroll, so requiring a scroll would be an unsatisfiable condition. It
 *     is re-measured on resize, because a narrow window can reflow short content
 *     into something that does scroll, and a wide one the reverse.
 *  4. The scroll region is keyboard operable: tabIndex 0 so it can be focused,
 *     which is what makes the arrow keys scroll it. Without that the pattern is
 *     completable by pointer only, and the agreement becomes impossible to
 *     accept with a keyboard.
 *  5. Only the PERCENTAGE is debounced, at 120ms. The read flag is set
 *     synchronously. Debouncing the flag too would leave a reader looking at the
 *     end of the agreement next to a checkbox that is still refusing them.
 *  6. The Continue action is gated on CHECKED, not on read. Reaching the end
 *     earns the right to agree; it is not itself agreement.
 *  7. The error is raised by trying to Continue too early, not by scrolling.
 *     Telling someone off for not having finished reading, while they are
 *     reading, is noise.
 *
 * TOKENS ONLY. Every colour, space, radius, duration and easing resolves through
 * a Pathway token. The two exceptions are documented at their call site: the
 * sheet height is a viewport percentage, which no token can express, and the
 * progress bar's width is a computed percentage of the reader's own progress.
 */
import React, { useRef, useState, useEffect, useCallback, useId } from "react";
import { Checkbox } from "./checkbox.jsx";
import { Button } from "../button/button.jsx";
import { Alert } from "../alert/alert.jsx";

const C = (p) => `var(--semantic-color-${p})`;
const U = (p) => `var(--semantic-layout-units-${p})`;
const Y = (p) => `var(--semantic-type-${p})`;
const M = (p) => `var(--motion-${p})`;

export const T = {
  cardBg:        C("fill-surface-elevated"),
  cardBorder:    C("stroke-static-neutral-faint"),
  boxBg:         C("fill-surface-canvas"),
  boxBorder:     C("stroke-static-neutral-faint"),
  title:         C("foreground-static-neutral-bold"),
  meta:          C("foreground-static-neutral-base"),
  body:          C("foreground-static-neutral-base"),
  trackBg:       C("fill-static-neutral-base"),
  // The bar is brand while there is reading left to do and POSITIVE once there
  // is not, which is the demo's behaviour: the colour change is the first
  // signal that the control has unlocked, ahead of the hint text.
  fillReading:   C("fill-action-primary-strong-rest"),
  fillRead:      C("fill-static-positive-strong"),
  // The pill that rides the bottom of the scroll box while there is more to read.
  pillBg:        C("fill-surface-elevated"),
  pillBorder:    C("stroke-static-neutral-base"),
  pillText:      C("foreground-static-neutral-bold"),
  // Backdrop behind the sheet.
  scrim:         C("scrim-base"),
  sheetBg:       C("fill-surface-elevated"),
  sheetBorder:   C("stroke-static-neutral-faint"),
  handle:        C("fill-static-neutral-strong"),
};

export const L = {
  cardPad:      U("padding-relaxed"),
  cardGap:      U("padding-relaxed"),
  cardRadius:   U("cornerradius-large"),
  boxRadius:    U("cornerradius-base"),
  boxPadV:      U("padding-tight"),
  boxPadH:      U("padding-base"),
  stackGap:     U("gap-tight"),
  tightGap:     U("gap-xtight"),
  rowGap:       U("gap-medium"),
  trackH:       U("padding-xxxtight"),
  // The scrim that fades the last line of text under the pill. Tall enough to
  // read as a gradient rather than a band.
  scrimH:       U("padding-xxwide"),
  sheetRadius:  U("cornerradius-xlarge"),
  sheetPad:     U("padding-base"),
  handleW:      U("padding-xxwide"),
  handleH:      U("padding-xxxtight"),
  border:       U("borderwidth-base"),
};

/** The default inline box height. The specification's range is 240 to 320. */
export const BOX_HEIGHT = 280;

/** Below this width the inline box becomes a sheet. */
export const DRAWER_BREAKPOINT = 768;

/** Distance from the bottom, in px, that counts as having reached the end. */
export const BOTTOM_THRESHOLD = 10;

/** Percentage updates are debounced by this much; the read flag is not. */
export const PROGRESS_DEBOUNCE_MS = 120;

// ─── scroll tracking ──────────────────────────────────────────────────────────
/**
 * Watches one scrollable element and reports progress plus whether its end has
 * been reached. `onRead` fires once, synchronously; `percent` is debounced.
 */
function useReadProgress(ref, { active, onRead }) {
  const [percent, setPercent] = useState(0);
  const timer = useRef(null);
  const announced = useRef(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const scrollable = scrollHeight - clientHeight;

    // Decision 3: nothing to scroll is already read.
    if (scrollable <= BOTTOM_THRESHOLD) {
      setPercent(100);
      if (!announced.current) { announced.current = true; onRead(); }
      return;
    }

    const remaining = scrollHeight - scrollTop - clientHeight;
    // Decision 2: 10px, not 0.
    if (remaining < BOTTOM_THRESHOLD && !announced.current) {
      announced.current = true;
      onRead();                                   // decision 5: not debounced
    }

    const pct = Math.min(100, Math.max(0, Math.round((scrollTop / scrollable) * 100)));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPercent(pct), PROGRESS_DEBOUNCE_MS);
  }, [ref, onRead]);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      // Decision 3: a reflow can turn short content into long content.
      ro = new ResizeObserver(measure);
      ro.observe(el);
      Array.from(el.children).forEach((c) => ro.observe(c));
    }
    return () => {
      el.removeEventListener("scroll", measure);
      if (ro) ro.disconnect();
      clearTimeout(timer.current);
    };
  }, [active, measure, ref]);

  return percent;
}

/** True while the viewport is narrower than the drawer breakpoint. */
export function useIsNarrow(breakpoint = DRAWER_BREAKPOINT) {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [breakpoint]);
  return narrow;
}

// ─── pieces ───────────────────────────────────────────────────────────────────
function ProgressRow({ percent, read, label = "Reading Progress" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: L.tightGap }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
        gap: L.rowGap }}>
        <span style={{ fontSize: Y("font-size-xs"), lineHeight: Y("line-height-xs-single"),
          letterSpacing: Y("letter-spacing-spacious"), color: T.meta }}>{label}</span>
        <span style={{ fontSize: Y("font-size-xs"), lineHeight: Y("line-height-xs-single"),
          letterSpacing: Y("letter-spacing-spacious"), color: T.meta,
          fontVariantNumeric: "tabular-nums" }}>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{ height: L.trackH, borderRadius: U("cornerradius-full"),
          background: T.trackBg, overflow: "hidden" }}
      >
        <div style={{
          // The one computed length in the component: it IS the reader's
          // progress, so no token can express it.
          width: `${percent}%`,
          height: "100%", borderRadius: U("cornerradius-full"),
          background: read ? T.fillRead : T.fillReading,
          transition: `width ${M("duration-2")} ${M("easing-standard")}, background ${M("duration-3")} ${M("easing-standard")}`,
        }} />
      </div>
    </div>
  );
}

/**
 * The scrollable agreement. Used inline on desktop and inside the sheet on
 * narrow, so the scroll detection and the keyboard affordance are identical in
 * both modes rather than implemented twice.
 */
const ScrollRegion = React.forwardRef(function ScrollRegion(
  { children, height, regionLabel, showScrim, scrimLabel, bordered = true }, ref) {
  return (
    <div style={{ position: "relative", minHeight: 0, flex: height ? undefined : 1 }}>
      <div
        ref={ref}
        role="region"
        aria-label={regionLabel}
        // Decision 4: focusable, which is what makes the arrow keys work.
        tabIndex={0}
        style={{
          height, maxHeight: height ? undefined : "100%", overflowY: "auto",
          background: T.boxBg,
          border: bordered ? `${L.border} solid ${T.boxBorder}` : "none",
          borderRadius: bordered ? L.boxRadius : 0,
          padding: `${L.boxPadV} ${L.boxPadH}`,
          color: T.body,
          fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
          letterSpacing: Y("letter-spacing-spacious"),
          // Keep the overscroll inside the box so a flick at the end of the
          // agreement does not scroll the page behind it.
          overscrollBehavior: "contain",
        }}
      >
        {children}
      </div>

      {/* Fade plus pill, together. The gradient says "there is more below"; the
          pill says what to do about it. Both disappear the moment the end is
          reached, because an instruction that has been followed is clutter.
          pointerEvents none so neither can swallow a drag meant for the text. */}
      {showScrim && (
        <div aria-hidden="true" style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: L.scrimH, pointerEvents: "none",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: U("padding-xxtight"),
          borderBottomLeftRadius: bordered ? L.boxRadius : 0,
          borderBottomRightRadius: bordered ? L.boxRadius : 0,
          background: `linear-gradient(to bottom, transparent, ${T.boxBg})`,
        }}>
          <span style={{
            background: T.pillBg, color: T.pillText,
            border: `${L.border} solid ${T.pillBorder}`,
            borderRadius: U("cornerradius-full"),
            padding: `${U("padding-xxxtight")} ${U("padding-tight")}`,
            fontSize: Y("font-size-xxs"), lineHeight: Y("line-height-xxs-single"),
            letterSpacing: Y("letter-spacing-spacious"),
            boxShadow: "var(--elevation-lift)",
          }}>{scrimLabel}</span>
        </div>
      )}
    </div>
  );
});

/**
 * The bottom sheet. role=dialog + aria-modal, focus trapped, Escape closes,
 * backdrop closes, focus returns to the trigger, body scroll locked while open.
 * All of that is required rather than polish: without the trap a screen reader
 * walks straight out of the sheet into the page it is covering.
 */
function Sheet({ open, onClose, title, children, footer, returnFocusRef }) {
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";     // body scroll lock
    const prevFocus = document.activeElement;

    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    // Focus the panel itself rather than its first control, so a screen reader
    // reads the sheet's title before offering an action.
    requestAnimationFrame(() => panel.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      // returnFocusRef may be a wrapper around the trigger (see the narrow-mode
      // trigger below), so prefer a focusable control inside it.
      const el = returnFocusRef?.current;
      const back = (el && (el.matches?.("button,[tabindex]") ? el : el.querySelector?.("button,[tabindex]")))
        || prevFocus;
      if (back && typeof back.focus === "function") back.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex",
      flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: T.scrim,
          animation: `pwSteFade ${M("duration-3")} ${M("easing-standard")} both` }}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          position: "relative",
          // The one viewport unit in the component. The specification asks for
          // 85% of the viewport so the page stays visible above the sheet, and
          // no token can express a proportion of the viewport.
          height: "85vh",
          display: "flex", flexDirection: "column",
          background: T.sheetBg,
          borderTopLeftRadius: L.sheetRadius, borderTopRightRadius: L.sheetRadius,
          borderTop: `${L.border} solid ${T.sheetBorder}`,
          boxShadow: "var(--elevation-lift)",
          outline: "none",
          animation: `pwSteSheetIn ${M("duration-5")} ${M("easing-emphasized")} both`,
        }}
      >
        {/* Handle bar: the affordance that says this panel is draggable and
            dismissible, which is what a reader expects of a bottom sheet. */}
        <div aria-hidden="true" style={{ display: "flex", justifyContent: "center",
          paddingTop: U("padding-xxtight"), paddingBottom: U("padding-xxtight") }}>
          <div style={{ width: L.handleW, height: L.handleH, borderRadius: U("cornerradius-full"),
            background: T.handle, opacity: 0.4 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: L.rowGap, padding: `0 ${L.sheetPad} ${U("padding-xxtight")}`,
          borderBottom: `${L.border} solid ${T.sheetBorder}` }}>
          <h2 style={{ margin: 0, color: T.title,
            fontSize: Y("font-size-m"), lineHeight: Y("line-height-m-single"),
            fontWeight: Y("weight-semibold"), letterSpacing: Y("letter-spacing-spacious") }}>
            {title}
          </h2>
          <Button buttonStyle="Naked" size="S" type="Tertiary"
            leadingIcon="close" showLeadingIcon showText={false}
            ariaLabel="Close" onClick={onClose} />
        </div>

        {children}

        {footer && (
          <div style={{ padding: L.sheetPad,
            borderTop: `${L.border} solid ${T.sheetBorder}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export const ScrollToEnableKeyframes = () => (
  <style>{`
@keyframes pwSteFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes pwSteSheetIn { from { transform: translateY(100%) } to { transform: translateY(0) } }
@media (prefers-reduced-motion: reduce) {
  @keyframes pwSteSheetIn { from { transform: none } to { transform: none } }
  @keyframes pwSteFade { from { opacity: 1 } to { opacity: 1 } }
}
  `}</style>
);

// ─── component ────────────────────────────────────────────────────────────────
/**
 * @param {string}   title            Card heading, e.g. "User Agreement".
 * @param {string}   contentTitle     Heading of the agreement itself, and the
 *                                    accessible name of the scroll region and
 *                                    the sheet.
 * @param {node}     children         The agreement body.
 * @param {string}   label            Checkbox label.
 * @param {string}   continueLabel    Primary action label.
 * @param {string}   readLabel        Narrow-mode trigger label.
 * @param {string}   doneLabel        Sheet footer label.
 * @param {string}   hint             Shown once the end has been reached.
 * @param {string}   errorText        Shown when Continue is pressed too early.
 * @param {number}   boxHeight        Inline box height in px.
 * @param {number}   breakpoint       Below this width, use the sheet.
 * @param {boolean}  forceNarrow      Force sheet mode, for stories and tests.
 * @param {function} onContinue       Called with no arguments once checked.
 * @param {function} onReadChange     Called once, when the end is reached.
 * @param {string}   size             Checkbox size: "default" | "s".
 */
export function ScrollToEnable({
  title = "User Agreement",
  contentTitle = "Terms and Conditions",
  children,
  label = "I have read and agree to the terms and conditions",
  continueLabel = "Continue",
  readLabel = "Read Agreement",
  doneLabel = "Done Reading",
  hint = "You may now agree",
  errorText = "Please scroll through and read the entire text to continue",
  boxHeight = BOX_HEIGHT,
  breakpoint = DRAWER_BREAKPOINT,
  forceNarrow,
  onContinue,
  onReadChange,
  size = "default",
  className = "",
  style,
}) {
  const autoNarrow = useIsNarrow(breakpoint);
  const narrow = forceNarrow === undefined ? autoNarrow : forceNarrow;

  const [read, setRead]       = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError]     = useState(false);
  const [sheet, setSheet]     = useState(false);

  const inlineRef  = useRef(null);
  const sheetRef   = useRef(null);
  const triggerRef = useRef(null);

  const hintId  = useId();
  const errorId = useId();

  // Decision 1: one-way.
  const markRead = useCallback(() => {
    setRead((was) => { if (!was) onReadChange?.(true); return true; });
    // The error says "scroll through and read the entire text". Once that has
    // happened the instruction has been followed, so it clears itself rather
    // than waiting to be dismissed by the next click. Same principle as the
    // scroll pill disappearing at the end of the text.
    setError(false);
  }, [onReadChange]);

  // Only the region that is actually on screen is tracked, so the inline box
  // does not report progress while the sheet is the thing being read.
  const inlinePct = useReadProgress(inlineRef, { active: !narrow, onRead: markRead });
  const sheetPct  = useReadProgress(sheetRef,  { active: narrow && sheet, onRead: markRead });
  const percent   = read ? 100 : (narrow ? sheetPct : inlinePct);

  const onToggle = (next) => { setChecked(next); if (next) setError(false); };

  const handleContinue = () => {
    // A backstop only. Continue is disabled until the box is checked, so in
    // practice this cannot be reached; it exists so a consumer that renders its
    // own action cannot skip the guard.
    if (!read || !checked) { setError(true); return; }
    onContinue?.();
  };

  // DECISION 7, CORRECTED. The error was first wired to Continue, which made it
  // unreachable: Continue is disabled until the box is checked, and the box
  // cannot be checked until the text has been read, so the branch could never
  // run. Figma's Error variant says "Please scroll through and read the entire
  // text to continue", which names the real moment: someone has gone for the
  // checkbox before finishing the agreement. A disabled input fires no events,
  // so the attempt is caught on the wrapper in the capture phase.
  const onReachForCheckbox = (e) => {
    if (read) return;
    e.preventDefault();
    e.stopPropagation();
    setError(true);
  };

  // The agreement heading is shown INSIDE the scroll box on desktop, where the
  // box has no chrome of its own to name it. In the sheet it is omitted,
  // because the sheet's own header already carries it and repeating it puts the
  // same words twice in a row at the top of the panel.
  const body = (withHeading) => (
    <>
      {withHeading && (
        <h3 style={{ margin: 0, color: T.title,
          fontSize: Y("font-size-s"), lineHeight: Y("line-height-s-single"),
          fontWeight: Y("weight-semibold"), letterSpacing: Y("letter-spacing-spacious") }}>
          {contentTitle}
        </h3>
      )}
      {children}
    </>
  );

  return (
    <div className={`pw-scroll-to-enable ${className}`} style={{
      display: "flex", flexDirection: "column", gap: L.cardGap,
      padding: L.cardPad, background: T.cardBg,
      border: `${L.border} solid ${T.cardBorder}`, borderRadius: L.cardRadius,
      ...style,
    }}>
      <ScrollToEnableKeyframes />

      <div style={{ display: "flex", flexDirection: "column", gap: L.stackGap }}>
        <h2 style={{ margin: 0, color: T.title,
          fontSize: Y("font-size-m"), lineHeight: Y("line-height-m-single"),
          fontWeight: Y("weight-semibold"), letterSpacing: Y("letter-spacing-spacious") }}>
          {title}
        </h2>

        {/* The progress row belongs to the INLINE mode only. In sheet mode the
            text is not on this surface, so a progress bar here would be
            reporting on something the reader cannot see. The demo does the
            same. */}
        {!narrow && <ProgressRow percent={percent} read={read} />}
      </div>

      {narrow ? (
        // The ref sits on a wrapper rather than on the Button, because Button
        // is not a forwardRef: passing it one would warn and silently fail,
        // and the sheet would then return focus to the body instead of to the
        // control that opened it. Sheet looks inside this element for a button.
        <div ref={triggerRef} style={{ display: "grid" }}>
          <Button
            buttonStyle="Fill" size="M" type="Secondary"
            text={readLabel} trailingIcon="arrow_forward" showTrailingIcon
            onClick={() => setSheet(true)}
          />
        </div>
      ) : (
        <ScrollRegion
          ref={inlineRef}
          height={boxHeight}
          regionLabel={contentTitle}
          showScrim={!read}
          scrimLabel="↓ Scroll to continue"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: L.stackGap }}>
            {body(true)}
          </div>
        </ScrollRegion>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: L.stackGap }}>
        <div onClickCapture={onReachForCheckbox}>
          <Checkbox
            checked={checked}
            disabled={!read}
            error={error}
            size={size}
            label={label}
            onChange={onToggle}
            describedBy={error ? errorId : (read ? hintId : undefined)}
          />
        </div>

        {/* Success and error are mutually exclusive and occupy the same slot, so
            the layout does not jump as the state changes. */}
        {error && (
          <Alert type="error" id={errorId}>{errorText}</Alert>
        )}
        {!error && read && (
          <Alert type="success" id={hintId}>{hint}</Alert>
        )}
      </div>

      {/* display:grid so the Button stretches to the card's width. Button hugs
          its own label by design, and in the demo this action spans the card. */}
      <div style={{ display: "grid" }}>
      <Button
        buttonStyle="Fill" size="M" type="Primary"
        text={continueLabel}
        // Decision 6: gated on agreement, not on reading.
        disabled={!checked}
        onClick={handleContinue}
      />
      </div>

      <Sheet
        open={narrow && sheet}
        onClose={() => setSheet(false)}
        title={contentTitle}
        returnFocusRef={triggerRef}
        footer={
          <div style={{ display: "grid" }}>
            <Button
              buttonStyle="Fill" size="M" type="Primary"
              text={doneLabel}
              disabled={!read}
              onClick={() => setSheet(false)}
            />
          </div>
        }
      >
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <ScrollRegion
            ref={sheetRef}
            regionLabel={contentTitle}
            showScrim={!read}
            scrimLabel="↓ Scroll to continue"
            bordered={false}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: L.stackGap }}>
              {body(false)}
            </div>
          </ScrollRegion>
        </div>
      </Sheet>

      {/* The enable is announced once, politely. A reader using a screen reader
          otherwise has no way to know the checkbox stopped refusing them: the
          colour change and the hint are both visual. */}
      <span aria-live="polite" style={{
        position: "absolute", width: 1, height: 1, overflow: "hidden",
        clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0, padding: 0, margin: -1,
      }}>
        {read ? hint : ""}
      </span>
    </div>
  );
}

export default ScrollToEnable;
