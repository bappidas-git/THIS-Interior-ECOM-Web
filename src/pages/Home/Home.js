import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import apiService from "../../services/api";
import { categoryParam } from "../../utils/categories";
import HeroSection from "../../components/HeroSection/HeroSection";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";
import CTASection from "../../components/CTASection/CTASection";
import {
  formatCurrency,
  getProductMinPrice,
  truncateText,
  buildCartItem,
  productPath,
  PLACEHOLDER_IMG,
  onImageError,
} from "../../utils/helpers";
import styles from "./Home.module.css";

// ── Constants ─────────────────────────────────────────────────────────────────

// Must match the key written by ProductDetails.js so viewing a product
// populates this list end-to-end.
const RECENTLY_VIEWED_KEY = "recentlyViewed";

const EASE = [0.22, 1, 0.36, 1];

// Brand-appropriate lifestyle imagery for the editorial bands. These are free
// stock placeholders (Unsplash) — NOT THIS Interiors' copyrighted project
// photography — wired with onImageError so a missing asset degrades gracefully,
// and so a future admin/Prompt-26 asset can replace them. Never product data.
const unsplash = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const LIFESTYLE = {
  story: [
    unsplash("1493809842364-78817add7ffb"), // calm living room
    unsplash("1567538096630-e0c55bd6374c"), // styled shelf / objects
  ],
  look: unsplash("1505693416388-ac5ce068fe85", 1100), // styled bedroom
  rooms: [
    unsplash("1586023492125-27b2c045efd7", 900),
    unsplash("1556909114-f6e7ad7d3136", 900),
    unsplash("1538688525198-9b88f6f53126", 900),
    unsplash("1567016432779-094069958ea5", 900),
    unsplash("1513506003901-1e6a229e2d15", 900),
    unsplash("1532372320572-cda25653a26d", 900),
  ],
};

// Honest, brand-voice storytelling (no fabricated demand/claims). The italic
// accent noun is the brand's serif accent device (mirrors the hero headline).
const STORY_BLOCKS = [
  {
    eyebrow: "The THIS edit",
    lead: "Designed for the way you",
    accent: "live",
    trail: ".",
    body:
      "Furniture and décor chosen for warmth and longevity — calm, considered pieces that settle into a home and stay a while.",
    cta: { label: "Shop the Collection", to: "/products" },
    image: LIFESTYLE.story[0],
    alt: "A warmly styled living room with soft natural light",
    side: "left",
  },
  {
    eyebrow: "Considered craft",
    lead: "Pieces with a",
    accent: "soul",
    trail: ".",
    body:
      "From the first sketch to the final finish, every piece is selected to bring a little beauty to every corner — and to live well, day after day.",
    cta: { label: "Explore the Range", to: "/products" },
    image: LIFESTYLE.story[1],
    alt: "A styled shelf with curated decorative objects",
    side: "right",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list = stored ? JSON.parse(stored) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

// The current seed category images are stock placeholders (placehold.co, which
// also carry the old #667eea). Detect those so a real Prompt-26 category image
// flows straight through, while today's stock placeholders are stood in with
// brand-appropriate lifestyle imagery (and no stock gradient reaches the page).
const STOCK_IMG_RE = /placehold\.co|placeholder\.com|via\.placeholder|dummyimage/i;
const isStockPlaceholder = (url) => !url || STOCK_IMG_RE.test(url);
const tileImage = (cat, i) =>
  cat && cat.image && !isStockPlaceholder(cat.image)
    ? cat.image
    : LIFESTYLE.rooms[i % LIFESTYLE.rooms.length];

// Slow fade/lift reveal props — collapses to a static render under
// prefers-reduced-motion (matches the hero's motion contract).
const reveal = (reduce, delay = 0) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.7, ease: EASE, delay },
      };

// ── Presentational pieces ──────────────────────────────────────────────────────

const Divider = () => <div className={styles.divider} aria-hidden="true" />;

const SectionHead = ({ eyebrow, lead, accent, trail = ".", subtitle }) => (
  <div className={styles.sectionHead}>
    {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
    <h2 className={styles.sectionTitle}>
      {lead}
      {accent && (
        <>
          {" "}
          <em className={styles.accent}>{accent}</em>
        </>
      )}
      {trail}
    </h2>
    {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
  </div>
);

// Alternating image/text storytelling block.
const StoryBlock = ({ block, reduce }) => (
  <section
    className={`${styles.story} ${block.side === "right" ? styles.storyReverse : ""}`}
  >
    <div className={styles.storyInner}>
      <motion.div className={styles.storyMedia} {...reveal(reduce)}>
        <img
          className={styles.storyImg}
          src={block.image}
          alt={block.alt}
          loading="lazy"
          decoding="async"
          onError={onImageError}
        />
      </motion.div>

      <motion.div className={styles.storyContent} {...reveal(reduce, 0.08)}>
        <span className={styles.eyebrow}>{block.eyebrow}</span>
        <h2 className={styles.storyTitle}>
          {block.lead} <em className={styles.accent}>{block.accent}</em>
          {block.trail}
        </h2>
        <p className={styles.storyBody}>{block.body}</p>
        <Link
          to={block.cta.to}
          className={`sf-btn sf-btn--secondary sf-btn--uppercase ${styles.storyCta}`}
        >
          {block.cta.label}
        </Link>
      </motion.div>
    </div>
  </section>
);

// One "Style the Look" line item — a real product linking to its PDP, with
// quick-add + wishlist wired exactly like the cards.
const LookItem = ({ product, onAddToCart, onToggleWishlist, isWishlisted }) => {
  const { sellingPrice } = getProductMinPrice(product);
  const image = product.images?.[0] || product.image || PLACEHOLDER_IMG;

  return (
    <li className={styles.lookItem}>
      <Link
        to={productPath(product)}
        className={styles.lookThumb}
        aria-label={product.name}
      >
        <img
          className={styles.lookThumbImg}
          src={image}
          alt={product.name}
          loading="lazy"
          onError={onImageError}
        />
      </Link>

      <div className={styles.lookInfo}>
        {product.brand && <span className={styles.lookBrand}>{product.brand}</span>}
        <Link to={productPath(product)} className={styles.lookName}>
          {truncateText(product.name, 42)}
        </Link>
        <span className={styles.lookPrice}>{formatCurrency(sellingPrice)}</span>
      </div>

      <div className={styles.lookActions}>
        <button
          type="button"
          className={styles.lookAdd}
          onClick={() => onAddToCart(product)}
        >
          Add
        </button>
        <button
          type="button"
          className={`${styles.lookWish} ${isWishlisted ? styles.lookWished : ""}`}
          onClick={() => onToggleWishlist(product)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
    </li>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// HOME PAGE — editorial storytelling & curated discovery
// ══════════════════════════════════════════════════════════════════════════════

const Home = () => {
  const reduce = useReducedMotion();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Data fetching (unchanged sources: featured / trending / categories) ────
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, featured, trending] = await Promise.all([
          apiService.categories.getAll().catch(() => []),
          apiService.products.getFeatured(8).catch(() => []),
          apiService.products.getTrending(8).catch(() => []),
        ]);
        if (!active) return;
        setCategories(Array.isArray(cats) ? cats : []);
        setFeaturedProducts(Array.isArray(featured) ? featured : []);
        setTrendingProducts(Array.isArray(trending) ? trending : []);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    setRecentlyViewed(getRecentlyViewed());
    return () => {
      active = false;
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  // Variant-aware line whose id/price match the PDP (buildCartItem) so quick-adds
  // merge by the `${productId}-${variantId}` key instead of duplicating.
  const handleAddToCart = useCallback(
    (product) => addToCart(buildCartItem(product), 1),
    [addToCart]
  );
  // Wishlist works for guests (persisted to localStorage) — no auth gate.
  const handleToggleWishlist = useCallback(
    (product) => toggleWishlist(product),
    [toggleWishlist]
  );

  // ── Derived data ─────────────────────────────────────────────────────────────

  // Shop-by-Room tiles: prefer the real top-level categories (rooms/collections).
  const roomCategories = useMemo(
    () => categories.filter((c) => c.parentId == null).slice(0, 6),
    [categories]
  );

  // "Style the Look": a curated edit resolved from real catalogue data (the
  // seeded featured + trending pool, deduped) — never invented products.
  const lookProducts = useMemo(() => {
    const seen = new Set();
    const out = [];
    [...featuredProducts, ...trendingProducts].forEach((p) => {
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    });
    return out.slice(0, 4);
  }, [featuredProducts, trendingProducts]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className={styles.homePage}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 1. Hero — cinematic, full-bleed; renders its own assurance strip. */}
      <HeroSection />

      {/* 2. Storytelling block — image left / text right. */}
      <StoryBlock block={STORY_BLOCKS[0]} reduce={reduce} />

      <Divider />

      {/* 3. Shop by Category — large image tiles from the real category tree. */}
      {(loading || roomCategories.length > 0) && (
        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHead
              eyebrow="Explore"
              lead="Shop by"
              accent="Category"
              subtitle="Find your space — browse the collections that shape a home."
            />
            <div className={styles.roomGrid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.roomTile} aria-hidden="true">
                      <div className={`sf-skeleton ${styles.roomMedia}`} />
                    </div>
                  ))
                : roomCategories.map((cat, i) => (
                    <motion.div key={cat.id || i} {...reveal(reduce, (i % 3) * 0.06)}>
                      <Link
                        to={`/products?category=${categoryParam(cat)}`}
                        className={styles.roomTile}
                      >
                        <div className={styles.roomMedia}>
                          <img
                            className={styles.roomImg}
                            src={tileImage(cat, i)}
                            alt={cat.name}
                            loading="lazy"
                            decoding="async"
                            onError={onImageError}
                          />
                          <span className={styles.roomScrim} aria-hidden="true" />
                        </div>
                        <span className={styles.roomBody}>
                          <span className={styles.roomName}>{cat.name}</span>
                          <span className={styles.roomMeta}>
                            Explore
                            <svg
                              width="14"
                              height="14"
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
                          </span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
            </div>
          </div>
        </section>
      )}

      <Divider />

      {/* 4. Featured Collection — an airy row of the shared ProductCard. */}
      <FeaturedProducts
        loading={loading}
        eyebrow="Curated"
        title="Featured Collection"
        subtitle="A considered selection, handpicked from the studio."
        products={featuredProducts.slice(0, 4)}
        viewAllLink="/products"
      />

      {/* 5. Storytelling block — image right / text left. */}
      <StoryBlock block={STORY_BLOCKS[1]} reduce={reduce} />

      {/* 6. Style the Look — a styled room beside the pieces to compose it. */}
      {(loading || lookProducts.length >= 2) && (
        <section className={styles.look}>
          <div className={styles.lookInner}>
            <motion.div className={styles.lookMedia} {...reveal(reduce)}>
              <img
                className={styles.lookImg}
                src={LIFESTYLE.look}
                alt="A styled bedroom composed from curated décor"
                loading="lazy"
                decoding="async"
                onError={onImageError}
              />
            </motion.div>

            <motion.div className={styles.lookContent} {...reveal(reduce, 0.08)}>
              <span className={styles.eyebrow}>Curated edit</span>
              <h2 className={styles.lookTitle}>
                Style the <em className={styles.accent}>Look</em>
              </h2>
              <p className={styles.lookLede}>
                A curated edit of pieces that work beautifully together — start
                with one, build the whole space.
              </p>

              {loading ? (
                <ul className={styles.lookList}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li className={styles.lookItem} key={i} aria-hidden="true">
                      <span className={`sf-skeleton ${styles.lookThumb}`} />
                      <span className={styles.lookInfo}>
                        <span className="sf-skeleton sf-skeleton--text" style={{ width: "70%" }} />
                        <span className="sf-skeleton sf-skeleton--text" style={{ width: "35%" }} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.lookList}>
                  {lookProducts.map((product) => (
                    <LookItem
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={isInWishlist(product.id)}
                    />
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </section>
      )}

      <Divider />

      {/* 7. Trending — a second airy curated row. */}
      <FeaturedProducts
        loading={loading}
        eyebrow="In our edit"
        title="Trending Now"
        subtitle="Pieces catching our eye this season."
        products={trendingProducts.slice(0, 4)}
        viewAllLink="/products"
      />

      {/* 8. Recently Viewed — folded into a calm row when present. */}
      {recentlyViewed.length > 0 && (
        <>
          <Divider />
          <FeaturedProducts
            eyebrow="Pick up where you left off"
            title="Recently Viewed"
            products={recentlyViewed.slice(0, 4)}
            viewAllLink="/products"
          />
        </>
      )}

      {/* 9. Closing editorial band. */}
      <CTASection
        title="Bring it home"
        subtitle="Discover furniture and décor made to live with — crafted spaces, enriching lives."
        buttonText="Shop the Collection"
        link="/products"
      />
    </motion.div>
  );
};

export default Home;
