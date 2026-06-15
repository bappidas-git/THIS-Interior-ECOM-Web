import React, { useState, useEffect } from "react";
import apiService from "../../services/api";
import { isEmailValid } from "../../utils/helpers";
import styles from "./Newsletter.module.css";

// Calm dark editorial sign-up band, sharing the Footer's brand pattern. Kept
// self-contained (no theme flag — it's an always-dark section) and API-wiring
// reusable so the Home closing CTA (Prompt 08) can compose it as-is.
const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset back to the form a few seconds after a successful subscribe so the
  // visitor can add another address (mirrors the Footer's behaviour).
  useEffect(() => {
    if (status !== "success") return undefined;
    const t = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid(email.trim())) { setStatus("error"); return; }
    setIsSubmitting(true);
    try {
      await apiService.leads.createNewsletter(email.trim());
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.newsletter}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Newsletter</p>
        <h2 className={styles.title}>
          Bring beauty <em>home</em>
        </h2>
        <p className={styles.subtitle}>
          Be first to see new collections, considered edits and private
          previews — a quiet note, never noise.
        </p>
        {status === "success" ? (
          <div className={styles.successMsg} role="status">
            Thank you — you're on the list.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              aria-label="Email address"
              aria-invalid={status === "error"}
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status) setStatus(null); }}
              className={`${styles.input} ${status === "error" ? styles.inputError : ""}`}
            />
            <button type="submit" className={styles.button} disabled={isSubmitting}>
              {isSubmitting ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className={styles.errorMsg} role="alert">Please enter a valid email address.</p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
