import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import apiService from "../../services/api";
import { onImageError, formatCurrency } from "../../utils/helpers";
import { FREE_SHIPPING_THRESHOLD } from "../../utils/constants";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import styles from "./HeroSection.module.css";

// =============================================================================
// HeroSection — cinematic, full-bleed editorial hero (THIS Interiors)
// =============================================================================
// A single calm, warm lifestyle image (or a muted background video) under a
// restrained serif headline whose accent noun is set in serif italic, one short
// supporting line, a brass primary CTA + a quiet ghost link, and a slim
// assurance strip beneath. Everything reads from the --sf-* design tokens (no
// hardcoded hex, no purple gradients) and honours prefers-reduced-motion.
//
// Still admin-driven: apiService.banners.getAll() feeds the hero. A banner only
// takes over when it carries real media (image/video) — the stock marketplace
// banners in db.json (gradient + promo copy, no media) are intentionally ignored
// so the on-brand fallback shows and no gradient ever reaches this hero. A future
// admin hero banner (or settings asset) with an image/video flows straight in.

// On-brand fallback. Imagery is a brand-appropriate placeholder (Unsplash, free
// licence) wired so a real admin asset can replace it — NOT THIS Interiors'
// copyrighted project photography. onImageError degrades to PLACEHOLDER_IMG.
const HERO_PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=80";

const FALLBACK_HERO = {
  eyebrow: "Curated Home Décor",
  // Split so the accent noun renders in serif italic (the brand accent device).
  headlineLead: "Bringing beauty to",
  headlineAccent: "every corner",
  headlineTrail: ".",
  subline: "Crafted spaces, enriching lives.",
  primaryCta: { label: "Shop the Collection", to: "/products" },
  secondaryCta: { label: "Explore Rooms", to: "/products?category=home-garden" },
  image: HERO_PLACEHOLDER_IMG,
  poster: HERO_PLACEHOLDER_IMG,
  video: null, // an admin banner may supply a muted/looping background video
  alt: "A calm, warmly styled living room",
};

// Quiet line icons — the same visual vocabulary as <TrustBadges/>.
const ASSURANCE_ICONS = {
  truck: (
    <>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  rotate: (
    <>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </>
  ),
};

// Honest, policy-level reassurance (no fabricated demand/scarcity). The free
// shipping threshold + returns window read from the same sources the rest of the
// storefront uses, so the copy can never drift.
const ASSURANCE_ITEMS = [
  {
    id: "shipping",
    icon: "truck",
    label: "Complimentary Delivery",
    detail: `On orders over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}`,
  },
  {
    id: "returns",
    icon: "rotate",
    label: "Easy Returns",
    detail:
      STOREFRONT_CONFIG.returnsWindowDays > 0
        ? `${STOREFRONT_CONFIG.returnsWindowDays}-day window`
        : null,
  },
  {
    id: "secure",
    icon: "lock",
    label: "Secure Payment",
    detail: "Encrypted checkout",
  },
];

// Map an admin banner onto hero overrides — but ONLY when it carries real media.
// Returns null otherwise, so banners without an image/video (e.g. the stock
// gradient banners) leave the editorial fallback untouched. `gradient` is never
// read, so no purple gradient can reach this hero.
const heroFromBanner = (banner) => {
  if (!banner) return null;
  const image = banner.image || banner.imageUrl || banner.media || null;
  const video = banner.video || banner.videoUrl || null;
  if (!image && !video) return null;

  const next = {};
  if (banner.eyebrow || banner.kicker) next.eyebrow = banner.eyebrow || banner.kicker;
  if (banner.title) {
    next.headlineLead = banner.title;
    next.headlineAccent = banner.titleAccent || "";
    next.headlineTrail = banner.titleAccent ? "." : "";
  }
  if (banner.subtitle) next.subline = banner.subtitle;
  if (banner.cta && banner.link) next.primaryCta = { label: banner.cta, to: banner.link };
  if (banner.secondaryCta && banner.secondaryLink) {
    next.secondaryCta = { label: banner.secondaryCta, to: banner.secondaryLink };
  }
  if (image) next.image = image;
  if (banner.poster || image) next.poster = banner.poster || image;
  if (video) next.video = video;
  if (banner.alt) next.alt = banner.alt;
  return next;
};

const EASE = [0.22, 1, 0.36, 1];

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef(null);
  const [banners, setBanners] = useState([]);

  // Preserve the admin-managed banners feed (and its empty/error fallback).
  useEffect(() => {
    let active = true;
    const fetchBanners = async () => {
      try {
        const data = await apiService.banners.getAll();
        if (active && Array.isArray(data)) setBanners(data);
      } catch {
        // Keep the on-brand fallback hero on any error.
      }
    };
    fetchBanners();
    return () => {
      active = false;
    };
  }, []);

  const hero = useMemo(() => {
    const fromBanner = banners.map(heroFromBanner).find(Boolean);
    return fromBanner ? { ...FALLBACK_HERO, ...fromBanner } : FALLBACK_HERO;
  }, [banners]);

  // Background video only autoplays when motion is allowed; otherwise the poster
  // still image stands in.
  const showVideo = Boolean(hero.video) && !reduceMotion;
  const stillSrc = hero.image || hero.poster;

  // Gentle parallax on the media; the MotionValue is simply not applied when the
  // user prefers reduced motion.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // Slow fade/lift reveal — collapses to an instant, static state when the user
  // prefers reduced motion.
  const group = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.15,
      },
    },
  };
  const rise = reduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 26 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
      };

  return (
    <section className={styles.hero}>
      <div className={styles.stage} ref={stageRef}>
        {/* Full-bleed media (parallax wrapper is taller than the stage). */}
        <motion.div
          className={styles.media}
          style={reduceMotion ? undefined : { y: mediaY }}
          initial={{ scale: reduceMotion ? 1 : 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.6, ease: EASE }}
        >
          {showVideo ? (
            <video
              className={styles.mediaAsset}
              autoPlay
              muted
              loop
              playsInline
              poster={hero.poster}
              aria-hidden="true"
            >
              <source src={hero.video} type="video/mp4" />
            </video>
          ) : (
            <img
              className={styles.mediaAsset}
              src={stillSrc}
              alt={hero.alt}
              decoding="async"
              onError={onImageError}
            />
          )}
        </motion.div>

        {/* Legibility scrim — the overlay token (deepens in dark mode). */}
        <div className={styles.overlay} aria-hidden="true" />

        <div className={styles.inner}>
          <motion.div
            className={styles.content}
            variants={group}
            initial="hidden"
            animate="visible"
          >
            {hero.eyebrow && (
              <motion.span className={styles.eyebrow} variants={rise}>
                {hero.eyebrow}
              </motion.span>
            )}

            <motion.h1 className={styles.headline} variants={rise}>
              {hero.headlineLead}
              {hero.headlineAccent && (
                <>
                  {" "}
                  <em className={styles.accent}>{hero.headlineAccent}</em>
                </>
              )}
              {hero.headlineTrail}
            </motion.h1>

            {hero.subline && (
              <motion.p className={styles.subline} variants={rise}>
                {hero.subline}
              </motion.p>
            )}

            <motion.div className={styles.ctas} variants={rise}>
              <Link
                to={hero.primaryCta.to}
                className={`sf-btn sf-btn--primary sf-btn--uppercase ${styles.ctaPrimary}`}
              >
                {hero.primaryCta.label}
              </Link>
              {hero.secondaryCta && (
                <Link to={hero.secondaryCta.to} className={styles.ctaGhost}>
                  {hero.secondaryCta.label}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Slim assurance strip — hairline-separated, quiet, policy-level. */}
      <div className={styles.assurance}>
        <ul className={styles.assuranceInner} aria-label="Our promises">
          {ASSURANCE_ITEMS.map((item) => (
            <li className={styles.assuranceItem} key={item.id}>
              <span className={styles.assuranceIcon} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ASSURANCE_ICONS[item.icon]}
                </svg>
              </span>
              <span className={styles.assuranceText}>
                <span className={styles.assuranceLabel}>{item.label}</span>
                {item.detail && (
                  <span className={styles.assuranceDetail}>{item.detail}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HeroSection;
