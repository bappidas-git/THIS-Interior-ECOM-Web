import React from "react";
import { Link } from "react-router-dom";
import styles from "./CTASection.module.css";

// =============================================================================
// CTASection — a quiet, editorial interstitial / closing band (THIS Interiors)
// =============================================================================
// An always-dark charcoal band with a serif headline, a short supporting line
// and a single brass CTA. Token-driven (--sf-*) — no stock gradients/hex — and
// stays charcoal in both light and dark mode (a deliberate "dark section", like
// the footer). Props are unchanged: title / subtitle / buttonText / link.
// =============================================================================

const CTASection = ({
  title = "Bring it home",
  subtitle = "Discover furniture and décor made to live with.",
  buttonText = "Shop the Collection",
  link = "/products",
}) => (
  <section className={styles.cta}>
    <div className={styles.content}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <Link to={link} className={styles.ctaBtn}>
        {buttonText}
      </Link>
    </div>
  </section>
);

export default CTASection;
