import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { APP_NAME, APP_TAGLINE, WHY_CHOOSE_US } from "../../utils/constants";
import { revealProps, enterProps } from "../../components/motion";
import styles from "./AboutUs.module.css";

const AboutUs = () => {
  const reduce = useReducedMotion();

  // Subtle, reduced-motion-safe entrances, all from the shared motion vocabulary.
  // The hero plays on mount; sections below the fold rise gently into view.
  const heroRise = enterProps(reduce);
  const rise = (delay = 0) => revealProps(reduce, delay);

  // Illustrative milestones — page-local brand copy, not live data.
  const stats = [
    { number: "50K+", label: "Homes styled" },
    { number: "10K+", label: "Pieces curated" },
    { number: "500+", label: "Artisan partners" },
    { number: "24/7", label: "Concierge care" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.crumb}>
          <Breadcrumb items={[{ label: "About Us" }]} />
        </div>

        <motion.header className={styles.hero} {...heroRise}>
          <p className={styles.eyebrow}>{APP_TAGLINE}</p>
          <h1 className={styles.heroTitle}>
            The story of <em>{APP_NAME}</em>
          </h1>
          <p className={styles.heroLede}>
            We believe the spaces we live in should feel considered, calm and
            unmistakably our own — and that finding the pieces to make them so
            should feel just as effortless.
          </p>
        </motion.header>

        <motion.section
          className={styles.stats}
          aria-label="By the numbers"
          {...rise()}
        >
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </motion.section>

        <motion.section className={styles.story} {...rise()}>
          <p className={styles.kicker}>Our story</p>
          <div className={styles.prose}>
            <p>
              {APP_NAME} began as a small interior-design studio with a simple
              belief: that a well-made room is quietly transformative. Over time
              that studio grew into a curated boutique for the home — a place to
              find pieces chosen with the same care a designer brings to a space.
            </p>
            <p>
              We work closely with makers and ateliers who share our love of
              material and restraint — natural textures, honest craftsmanship and
              the kind of quiet detail that rewards a second look. Every piece is
              selected by hand, photographed with care, and sent to you ready to
              live with for years to come.
            </p>
          </div>
          <blockquote className={styles.pullQuote}>
            Good design is never loud. It is the warmth you feel when everything
            is exactly where it belongs.
          </blockquote>
        </motion.section>

        <motion.section className={styles.promise} {...rise()}>
          <header className={styles.sectionHead}>
            <p className={styles.kicker}>Our promise</p>
            <h2 className={styles.sectionTitle}>Why choose {APP_NAME}</h2>
          </header>
          <div className={styles.promiseGrid}>
            {WHY_CHOOSE_US.map((item) => (
              <div key={item.id} className={styles.promiseCard}>
                <span className={styles.promiseIcon} aria-hidden="true">
                  <Icon icon={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <motion.section className={styles.cta} {...rise()}>
        <div className={styles.ctaInner}>
          <p className={styles.ctaEyebrow}>Make it yours</p>
          <h2 className={styles.ctaTitle}>Bring it home</h2>
          <p className={styles.ctaText}>
            Explore a collection chosen for the way you want to live — calm,
            considered and made to last.
          </p>
          <Link to="/products" className={styles.ctaBtn}>
            Explore the collection
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;
