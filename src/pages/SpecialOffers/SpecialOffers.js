import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import { useDealsConfig } from "../../context/DealsConfigContext";
import apiService from "../../services/api";
import { ProductCard, PriceBlock } from "../../components/storefront";
import {
  getProductMinPrice,
  getProductMaxDiscount,
  buildCartItem,
  productPath,
  copyToClipboard,
  onImageError,
  PLACEHOLDER_IMG,
} from "../../utils/helpers";
import { resolveCountdownTarget, diffToParts } from "../../utils/dealsConfig";
import { MOTION_EASE } from "../../utils/constants";
import styles from "./SpecialOffers.module.css";

// ── Coupon display helpers ───────────────────────────────────────────────────
// Coupons shown here come from the same store the Admin manages and Checkout
// validates against (apiService.coupons), so every advertised code redeems.

// Compact rupee figure for promo copy — round values read cleaner without paise.
const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// Expiry shown on a coupon card — the same instant the checkout enforces.
const formatExpiry = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Headline figure on a coupon's stub: "20%" for percentage, "₹500" for fixed.
const couponHeadline = (c) => (c.type === "percentage" ? `${c.value}%` : rupees(c.value));

// Only advertise coupons a shopper can actually redeem right now: active, not
// past expiry, not usage-exhausted — the same gates checkout enforces.
// (minOrderAmount is order-dependent, so it's shown on the card instead.)
const isCouponValid = (c, now = new Date()) =>
  c &&
  c.isActive !== false &&
  (!c.expiresAt || new Date(c.expiresAt) > now) &&
  !(c.usageLimit && c.usedCount >= c.usageLimit);

// Resolve an ordered id selection against a list, preserving the admin order and
// dropping ids that no longer exist.
const pickByIds = (items, ids) => {
  const byId = new Map(items.map((it) => [String(it.id), it]));
  return (ids || []).map((id) => byId.get(String(id))).filter(Boolean);
};

const pad = (n) => String(n).padStart(2, "0");

// ── Countdown Hook (admin-configured) ────────────────────────────────────────
// Targets the admin's window (fixed end date, or end-of-day when none) and
// re-evaluates each second so a fixed end can expire live and honour onExpiry.
const computeCountdown = (timer) => {
  const r = resolveCountdownTarget(timer);
  if (!r.active) {
    return { show: false, ended: !!r.ended, parts: { hours: 0, minutes: 0, seconds: 0 } };
  }
  return { show: true, ended: false, parts: diffToParts(r.target) };
};

const useDealsCountdown = (timer) => {
  const [state, setState] = useState(() => computeCountdown(timer));
  const enabled = timer?.enabled;
  const endAt = timer?.endAt;
  const onExpiry = timer?.onExpiry;

  useEffect(() => {
    setState(computeCountdown({ enabled, endAt, onExpiry }));
    const id = setInterval(
      () => setState(computeCountdown({ enabled, endAt, onExpiry })),
      1000
    );
    return () => clearInterval(id);
  }, [enabled, endAt, onExpiry]);

  return state;
};

// ── Countdown — tasteful hairline digit blocks (calm, never a loud timer) ─────
// Honest: it renders whatever the configured window resolves to. Hours can run
// past 24 for a multi-day fixed end — that's intentional, not clamped.
const Countdown = ({ parts }) => {
  const units = [
    { value: parts.hours, label: "Hrs" },
    { value: parts.minutes, label: "Min" },
    { value: parts.seconds, label: "Sec" },
  ];
  return (
    <div className={styles.countdown} role="timer" aria-label="Time left on these offers">
      <span className={styles.countdownLabel}>Offer ends in</span>
      <div className={styles.countdownBlocks}>
        {units.map((u, i) => (
          <React.Fragment key={u.label}>
            {i > 0 && <span className={styles.countdownSep} aria-hidden="true">:</span>}
            <span className={styles.countdownUnit}>
              <span className={styles.countdownNum}>{pad(u.value)}</span>
              <span className={styles.countdownUnitLabel}>{u.label}</span>
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ── Responsive Category Tabs ─────────────────────────────────────────────────
// Horizontally scrollable strip that never hides a tab: edge-fade affordances +
// scroll buttons appear when there's more off-screen, and the active tab is
// scrolled into view. Buttons are hidden on touch/mobile (CSS) where the strip
// scrolls by swipe. Tokenized — no hardcoded hex.
const CategoryTabs = ({ categories, activeTab, onChange }) => {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 1);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, categories.length]);

  // Keep the active tab visible when it changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeTab]);

  const scrollByDir = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(180, el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <div className={styles.tabBarWrap}>
      <button
        type="button"
        className={`${styles.tabScrollBtn} ${styles.tabScrollLeft} ${atStart ? styles.tabScrollHidden : ""}`}
        onClick={() => scrollByDir(-1)}
        aria-label="Scroll categories left"
        tabIndex={atStart ? -1 : 0}
      >
        &#8249;
      </button>
      <div className={`${styles.tabFade} ${styles.tabFadeLeft} ${atStart ? styles.tabFadeHidden : ""}`} />

      <div className={styles.tabBar} ref={scrollRef}>
        <button
          type="button"
          data-active={activeTab === "all"}
          className={`${styles.tab} ${activeTab === "all" ? styles.tabActive : ""}`}
          onClick={() => onChange("all")}
        >
          All Deals
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            data-active={activeTab === cat.id}
            className={`${styles.tab} ${activeTab === cat.id ? styles.tabActive : ""}`}
            onClick={() => onChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className={`${styles.tabFade} ${styles.tabFadeRight} ${atEnd ? styles.tabFadeHidden : ""}`} />
      <button
        type="button"
        className={`${styles.tabScrollBtn} ${styles.tabScrollRight} ${atEnd ? styles.tabScrollHidden : ""}`}
        onClick={() => scrollByDir(1)}
        aria-label="Scroll categories right"
        tabIndex={atEnd ? -1 : 0}
      >
        &#8250;
      </button>
    </div>
  );
};

// ── Skeleton Loaders — calm shimmer (sf-skeleton primitive) in each silhouette ─

const CouponSkeleton = () => (
  <div className={styles.couponCard} aria-hidden="true">
    <div className={`sf-skeleton ${styles.couponSkeletonValue}`} />
    <div className={styles.couponBody}>
      <span className={`sf-skeleton sf-skeleton--text ${styles.skMedium}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skShort}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skShort}`} />
      <span className={`sf-skeleton ${styles.couponSkeletonCode}`} />
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className={styles.skeletonCard} aria-hidden="true">
    <div className={`sf-skeleton ${styles.skeletonMedia}`} />
    <div className={styles.skeletonBody}>
      <span className={`sf-skeleton sf-skeleton--text ${styles.skBrand}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skName}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skPrice}`} />
    </div>
  </div>
);

// ── Quiet inline icons (stroke = currentColor, no icon-library dependency) ────

const PauseMark = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <line x1="10" y1="9" x2="10" y2="15" />
    <line x1="14" y1="9" x2="14" y2="15" />
  </svg>
);

const TagMark = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ── Main Component ───────────────────────────────────────────────────────────

const SpecialOffers = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const prefersReducedMotion = useReducedMotion();
  // The whole page is admin-managed via this config (master toggle, hero,
  // timer, featured coupon/product selections).
  const { config, loading: configLoading } = useDealsConfig();
  const enabled = config.enabled !== false;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);

  const countdown = useDealsCountdown(config.timer);

  // Fetch products (for deals), categories (for accurate tabs) and the real
  // coupons (so advertised codes match what checkout accepts) in one pass. Only
  // when the page is actually enabled — no point fetching for a hidden page.
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, couponsData] = await Promise.all([
          apiService.products.getAll(),
          apiService.categories.getAll(),
          apiService.coupons.getActive(),
        ]);
        if (cancelled) return;
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setCoupons(Array.isArray(couponsData) ? couponsData : []);
      } catch (error) {
        console.error("Error fetching offers data:", error);
        if (cancelled) return;
        setProducts([]);
        setCategories([]);
        setCoupons([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Coupons to advertise: the admin's ordered selection (kept to valid ones), or
  // — when nothing is selected — every valid active coupon (automatic).
  const featuredCoupons = useMemo(() => {
    const valid = coupons.filter((c) => isCouponValid(c));
    if (config.featuredCouponIds?.length) {
      return pickByIds(valid, config.featuredCouponIds);
    }
    return valid;
  }, [coupons, config.featuredCouponIds]);

  // Discounted products, highest discount first — the automatic deal pool.
  const discountedProducts = useMemo(() => {
    return products
      .filter((p) => getProductMaxDiscount(p) > 0)
      .sort((a, b) => getProductMaxDiscount(b) - getProductMaxDiscount(a));
  }, [products]);

  // Deal of the Day: the admin's ordered picks, else the top 3 by discount.
  const dealOfTheDay = useMemo(() => {
    if (config.dealOfTheDayIds?.length) return pickByIds(products, config.dealOfTheDayIds);
    return discountedProducts.slice(0, 3);
  }, [products, discountedProducts, config.dealOfTheDayIds]);

  // Deals grid: the admin's ordered picks, else every discounted product.
  const gridProducts = useMemo(() => {
    if (config.featuredProductIds?.length) return pickByIds(products, config.featuredProductIds);
    return discountedProducts;
  }, [products, discountedProducts, config.featuredProductIds]);

  // Category tabs = real categories represented in the grid, in catalogue order.
  const dealCategories = useMemo(() => {
    const ids = new Set(gridProducts.map((p) => p.categoryId).filter((id) => id != null));
    return categories.filter((c) => ids.has(c.id));
  }, [gridProducts, categories]);

  // Filtered by active tab (tab value is a categoryId, or "all").
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return gridProducts;
    return gridProducts.filter((p) => p.categoryId === activeTab);
  }, [gridProducts, activeTab]);

  // If the active tab's category drops out of the deal set, fall back to "all".
  useEffect(() => {
    if (activeTab !== "all" && !dealCategories.some((c) => c.id === activeTab)) {
      setActiveTab("all");
    }
  }, [dealCategories, activeTab]);

  // Handlers
  const handleCopyCode = useCallback(async (code) => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  }, []);

  // buildCartItem produces the same id scheme (and default variant/price) the
  // product page uses, so offer adds merge with PDP adds instead of duplicating.
  // The shared ProductCard builds the cart item itself, so the grid passes
  // addToCart directly; Deal-of-the-Day uses this product-shaped helper.
  const handleAddDeal = useCallback(
    (product) => addToCart(buildCartItem(product), 1),
    [addToCart]
  );

  // ── Master toggle: page hidden ───────────────────────────────────────────────
  // While the config is still loading we show a neutral loader so a disabled
  // page never flashes its content first.
  if (configLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageLoader}>
          <div className="sf-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  // ── Master toggle off → a serene "short pause" state (nav entry hides too,
  // driven by the same config in the Header/SidebarMenu/Footer). ──────────────
  if (!enabled) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.section
            className={styles.stateBox}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: MOTION_EASE }}
          >
            <span className={styles.stateMark}>
              <PauseMark />
            </span>
            <h1 className={styles.stateTitle}>Offers are taking a short pause</h1>
            <p className={styles.stateText}>
              Our edit of seasonal offers is resting for the moment. Fresh deals will return
              soon — until then, the full collection is waiting to be explored.
            </p>
            <Link to="/products" className={styles.stateBtn}>
              Browse the collection
            </Link>
          </motion.section>
        </div>
      </div>
    );
  }

  const showCountdown = config.timer?.enabled !== false && countdown.show;
  const timerEnded = config.timer?.enabled !== false && countdown.ended;
  const noContent = !loading && gridProducts.length === 0 && dealOfTheDay.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* ── Hero — a quiet editorial band ─────────────────────────────────── */}
      <header className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: MOTION_EASE }}
        >
          {config.hero?.tag && <span className={styles.heroTag}>{config.hero.tag}</span>}
          <h1 className={styles.heroTitle}>
            {config.hero?.title || "Special Offers & Deals"}
          </h1>
          {config.hero?.subtitle && (
            <p className={styles.heroSubtitle}>{config.hero.subtitle}</p>
          )}
          {showCountdown ? (
            <Countdown parts={countdown.parts} />
          ) : timerEnded ? (
            <p className={styles.heroEnded}>
              These offers have ended — a fresh edit is on its way.
            </p>
          ) : null}
        </motion.div>
      </header>

      <div className={styles.container}>
        {/* ── Coupons ─────────────────────────────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>To redeem</span>
            <h2 className={styles.sectionTitle}>Coupons &amp; codes</h2>
            <p className={styles.sectionSubtitle}>Copy a code and apply it at checkout.</p>
          </div>

          {loading ? (
            <div className={styles.couponGrid}>
              {Array.from({ length: 4 }, (_, i) => (
                <CouponSkeleton key={i} />
              ))}
            </div>
          ) : featuredCoupons.length > 0 ? (
            <div className={styles.couponGrid}>
              {featuredCoupons.map((coupon) => {
                const isCopied = copiedCode === coupon.code;
                return (
                  <div key={coupon.id ?? coupon.code} className={styles.couponCard}>
                    <div className={styles.couponValue}>
                      <span className={styles.couponHeadline}>{couponHeadline(coupon)}</span>
                      <span className={styles.couponOff}>Off</span>
                    </div>
                    <div className={styles.couponBody}>
                      <p className={styles.couponDesc}>
                        {coupon.description || `${couponHeadline(coupon)} off your order`}
                      </p>
                      <p className={styles.couponMeta}>
                        {coupon.minOrderAmount > 0
                          ? `On orders over ${rupees(coupon.minOrderAmount)}`
                          : "No minimum order"}
                        {coupon.type === "percentage" && coupon.maxDiscount
                          ? ` · up to ${rupees(coupon.maxDiscount)} off`
                          : ""}
                      </p>
                      <p className={styles.couponMeta}>
                        {coupon.expiresAt ? `Valid until ${formatExpiry(coupon.expiresAt)}` : "No expiry"}
                      </p>
                      <div className={styles.couponCodeRow}>
                        <code className={styles.couponCode}>{coupon.code}</code>
                        <button
                          type="button"
                          className={`${styles.copyBtn} ${isCopied ? styles.copied : ""}`}
                          onClick={() => handleCopyCode(coupon.code)}
                          aria-label={isCopied ? "Code copied" : `Copy coupon code ${coupon.code}`}
                        >
                          {isCopied ? (
                            <>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            "Copy"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.inlineEmpty}>
              No codes are live right now — please check back soon.
            </p>
          )}
        </section>

        {/* ── Deal of the Day — a curated trio ──────────────────────────────── */}
        {!loading && dealOfTheDay.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitleRow}>
                <span className={styles.eyebrow}>Today only</span>
                {showCountdown && (
                  <span className={styles.dealTimer}>
                    Ends in {pad(countdown.parts.hours)}:{pad(countdown.parts.minutes)}:{pad(countdown.parts.seconds)}
                  </span>
                )}
              </div>
              <h2 className={styles.sectionTitle}>Deal of the day</h2>
              <p className={styles.sectionSubtitle}>A handful of pieces at their lowest.</p>
            </div>

            <div className={styles.dealGrid}>
              {dealOfTheDay.map((product, idx) => {
                const minPrice = getProductMinPrice(product);
                const maxDiscount = getProductMaxDiscount(product);
                const primaryImg =
                  product.images?.[0] || product.image || PLACEHOLDER_IMG;
                return (
                  <motion.article
                    key={product.id}
                    className={styles.dealCard}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.5,
                      delay: prefersReducedMotion ? 0 : idx * 0.08,
                      ease: MOTION_EASE,
                    }}
                  >
                    <div className={styles.dealMedia}>
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className={styles.dealImage}
                        loading="lazy"
                        onError={onImageError}
                      />
                      {maxDiscount > 0 && (
                        <span className={styles.dealBadge}>{maxDiscount}% off</span>
                      )}
                    </div>
                    <div className={styles.dealInfo}>
                      <h3 className={styles.dealName}>
                        <Link to={productPath(product)} className={styles.dealNameLink}>
                          {product.name}
                        </Link>
                      </h3>
                      <PriceBlock
                        price={minPrice.sellingPrice}
                        comparePrice={minPrice.originalPrice}
                        currency={minPrice.currency}
                        size="md"
                        showSavings
                      />
                      <button
                        type="button"
                        className={styles.dealBtn}
                        onClick={() => handleAddDeal(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Deals by Category ─────────────────────────────────────────────── */}
        {!loading && gridProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>The edit</span>
              <h2 className={styles.sectionTitle}>
                {dealCategories.length > 0 ? "Deals by category" : "All deals"}
              </h2>
              <p className={styles.sectionSubtitle}>
                {filteredProducts.length} piece{filteredProducts.length !== 1 ? "s" : ""} on offer
              </p>
            </div>

            {dealCategories.length > 0 && (
              <CategoryTabs
                categories={dealCategories}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            )}

            <motion.div
              key={activeTab}
              className={styles.productsGrid}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: MOTION_EASE }}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={isInWishlist(product.id)}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* ── Loading skeletons ─────────────────────────────────────────────── */}
        {loading && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>The edit</span>
              <h2 className={styles.sectionTitle}>Deals by category</h2>
            </div>
            <div className={styles.productsGrid}>
              {Array.from({ length: 8 }, (_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state — honest, serene ──────────────────────────────────── */}
        {noContent && (
          <section className={styles.stateBox}>
            <span className={styles.stateMark}>
              <TagMark />
            </span>
            <h2 className={styles.stateTitle}>No deals on the table just yet</h2>
            <p className={styles.stateText}>
              There aren't any active offers at the moment. New pieces are added often —
              do come back soon.
            </p>
            <Link to="/products" className={styles.stateBtn}>
              Browse the collection
            </Link>
          </section>
        )}
      </div>
    </div>
  );
};

export default SpecialOffers;
