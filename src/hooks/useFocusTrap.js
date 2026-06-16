import { useEffect } from "react";

// =============================================================================
// useFocusTrap — keep Tab focus inside an open modal/drawer
// =============================================================================
// While `active` is true, Tab and Shift+Tab cycle within `containerRef` so
// keyboard focus can never leak to the page behind an overlay. It pairs with
// each surface's own Escape handling, body-scroll lock and focus-in-on-open —
// this hook only owns the focus *containment* so those callers don't each
// re-implement the wrap logic. Matches the inline trap already used by the
// search and auth dialogs, kept in one place so they never drift.
//
// Requirements at the call site (so the trap actually engages):
//   • move focus INTO the container when it opens (e.g. focus the panel, which
//     should carry tabIndex={-1}), otherwise Tab starts outside the trap.
//
// No-op when inactive, so a closed overlay never touches the keydown stream.
export default function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const root = containerRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey) {
        if (activeEl === first || !root.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}
