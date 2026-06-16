import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { onImageError, PLACEHOLDER_IMG } from "../../utils/helpers";
import { MOTION_EASE } from "../../utils/constants";
import styles from "./ReviewModal.module.css";

// Interactive 1–5 star picker with hover preview. Brass fill (via the
// --sf-color-star token); the hover lift is disabled under reduced motion.
const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={styles.starInput} role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((s) => {
        const active = (hover || value) >= s;
        return (
          <button
            key={s}
            type="button"
            className={`${styles.starBtn} ${active ? styles.starActive : ""}`}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(s)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(s)}
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
            aria-checked={value === s}
            role="radio"
          >
            {active ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
};

// Rate / review (or edit an existing review for) a purchased product. Used from
// Order History and the PDP reviews entry — eligibility (purchase-gated, kept
// order) is decided by the CALLER; this is purely the form. Submitting (or
// editing) (re)enters the `pending` state for admin moderation, which the caller
// communicates. Themed entirely from the --sf-* tokens (which flip under
// body.dark); the isDarkMode prop sets color-scheme for native controls.
//
// Props (unchanged contract): open, onClose, product, existing, onSubmit, isDarkMode
const ReviewModal = ({ open, onClose, product, existing, onSubmit, isDarkMode }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      setRating(existing?.rating || 0);
      setTitle(existing?.title || "");
      setBody(existing?.body || "");
      setError("");
      // Move focus into the dialog for keyboard users.
      requestAnimationFrame(() => modalRef.current?.focus());
    }
  }, [open, existing]);

  // Close on Escape while the dialog is open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ rating, title: title.trim(), body: body.trim() });
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalMotion = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { scale: 0.96, opacity: 0, y: 12 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.97, opacity: 0 },
      };

  return (
    <AnimatePresence>
      <motion.div
        className={`${styles.overlay} ${isDarkMode ? styles.dark : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          className={styles.modal}
          tabIndex={-1}
          {...modalMotion}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: MOTION_EASE }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            &times;
          </button>

          <h3 className={styles.heading} id="review-modal-title">
            {existing ? "Edit your review" : "Write a review"}
          </h3>

          <div className={styles.productRow}>
            <img
              src={product?.image || PLACEHOLDER_IMG}
              alt={product?.name || "Product"}
              onError={onImageError}
            />
            <span className={styles.productName}>{product?.name}</span>
          </div>

          {existing && (
            <p className={styles.editNote}>
              Editing resubmits your review for approval before it shows on the product page.
            </p>
          )}

          <label className={styles.label} id="review-rating-label">
            Your rating <span aria-hidden="true">*</span>
          </label>
          <StarInput value={rating} onChange={setRating} />

          <label className={styles.label} htmlFor="review-title">
            Title
          </label>
          <input
            id="review-title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum it up in a line"
            maxLength={80}
          />

          <label className={styles.label} htmlFor="review-body">
            Review
          </label>
          <textarea
            id="review-body"
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you like or dislike? How is the quality and the finish?"
            rows={4}
            maxLength={1000}
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : existing ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
