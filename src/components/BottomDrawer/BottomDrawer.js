import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./BottomDrawer.module.css";

// Generic slide-up sheet for mobile surfaces (filters, pickers, sort menus).
// Props are intentionally minimal and unchanged: { open, onClose, title, children }.
const BottomDrawer = ({ open, onClose, title, children }) => {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape and move focus into the sheet for keyboard / screen-reader
  // users once it opens.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  // Slow editorial slide-up; collapses to a plain fade under reduced motion.
  const sheetMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", damping: 34, stiffness: 280 },
      };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Sheet"}
            tabIndex={-1}
            {...sheetMotion}
          >
            <div className={styles.handle} aria-hidden="true" />
            {title && (
              <div className={styles.drawerHeader}>
                <h3 className={styles.title}>{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.closeBtn}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            )}
            <div className={styles.drawerContent}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomDrawer;
