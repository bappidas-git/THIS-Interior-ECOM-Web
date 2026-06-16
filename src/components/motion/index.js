import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  MOTION_EASE,
  MOTION_DURATION,
  MOTION_VIEWPORT,
  MOTION_RISE,
  MOTION_SPRING,
} from "../../utils/constants";

// =============================================================================
// Shared storefront motion helpers
// =============================================================================
// One reveal pattern, reused everywhere, so the whole storefront fades/lifts in
// with the same slow, elegant cadence. Everything reads from the MOTION_* tokens
// (src/utils/constants.js) which mirror the CSS --sf-ease-editorial / transition
// tokens, so the JS and CSS motion layers never drift.
//
//   • revealProps(reduce, delay, opts)  — props for a scroll-triggered reveal
//       (whileInView, fires once). Returns {} under reduced motion so the element
//       renders in its final, static state.
//   • enterProps(reduce, delay, opts)   — props for an on-mount entrance
//       (above-the-fold heroes/headers that shouldn't wait for scroll).
//   • <Reveal as delay y …>             — a drop-in wrapper that owns the
//       useReducedMotion() call for you. `as` picks the motion element
//       ("div" | "section" | "li" | …); extra props pass straight through.
//
// Reduced motion is honoured in ONE place (here) rather than re-guarded by every
// caller — nothing depends on motion to be usable.
// =============================================================================

// Re-export the shared tokens so a surface can grab everything it needs for a
// bespoke animation from a single import.
export {
  MOTION_EASE,
  MOTION_DURATION,
  MOTION_VIEWPORT,
  MOTION_RISE,
  MOTION_SPRING,
};

// Props for a gentle scroll-reveal (small rise + slow fade). `reduce` is the
// value from useReducedMotion(); when true we return {} so the element is shown
// immediately, in place, with no animation.
export const revealProps = (reduce, delay = 0, opts = {}) => {
  if (reduce) return {};
  const {
    y = MOTION_RISE,
    duration = MOTION_DURATION.slow,
    viewport = MOTION_VIEWPORT,
  } = opts;
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition: { duration, delay, ease: MOTION_EASE },
  };
};

// Props for an on-mount entrance (plays immediately rather than on scroll).
export const enterProps = (reduce, delay = 0, opts = {}) => {
  if (reduce) return {};
  const { y = 18, duration = MOTION_DURATION.slow } = opts;
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: MOTION_EASE },
  };
};

// Drop-in wrapper around revealProps so a surface doesn't have to call
// useReducedMotion() itself. Polymorphic via `as`; all other props (className,
// style, onClick, aria-*, an explicit initial/transition override …) pass
// through to the underlying motion element.
export const Reveal = React.forwardRef(function Reveal(
  { as = "div", delay = 0, y, duration, viewport, children, ...rest },
  ref
) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      ref={ref}
      {...revealProps(reduce, delay, { y, duration, viewport })}
      {...rest}
    >
      {children}
    </MotionTag>
  );
});
