import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { StarRating, PriceBlock } from "../../components/storefront";
import {
  getProductMinPrice,
  getDefaultCartVariant,
  buildCartItem,
  productPath,
  onImageError,
  PLACEHOLDER_IMG,
} from "../../utils/helpers";
import styles from "./Wishlist.module.css";

const SORT_OPTIONS = [
  { value: "dateDesc", label: "Recently Added" },
  { value: "dateAsc", label: "Oldest First" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "ratingHigh", label: "Highest Rated" },
];

// ---------------------------------------------------------------------------
// Small inline icons — colour via currentColor so they inherit the tokenized
// text/brass colours (no hardcoded hex, no icon-library dependency).
// ---------------------------------------------------------------------------
const SyncIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 0 1-9 9c-2.5 0-4.77-1-6.4-2.6" />
    <path d="M3 12a9 9 0 0 1 9-9c2.5 0 4.77 1 6.4 2.6" />
    <polyline points="18 2 18.4 5.6 14.8 6" />
    <polyline points="6 22 5.6 18.4 9.2 18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HeartIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Brand skeleton — calm shimmer (sf-skeleton primitive) in the card silhouette.
const CardSkeleton = () => (
  <div className={styles.skeletonCard} aria-hidden="true">
    <div className={`sf-skeleton ${styles.skeletonMedia}`} />
    <div className={styles.skeletonBody}>
      <span className={`sf-skeleton sf-skeleton--text ${styles.skBrand}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skName}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skPrice}`} />
      <span className={`sf-skeleton ${styles.skBtn}`} />
    </div>
  </div>
);

const Wishlist = () => {
  // Honour reduced motion for the JS-driven entrance/exit (the token-based CSS
  // transitions already zero out via storefront-tokens.css, but Framer needs to
  // be told explicitly).
  const prefersReducedMotion = useReducedMotion();
  const { wishlistItems, isLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user, isLoading: authLoading, openAuthModal } = useAuth();

  const [sortBy, setSortBy] = useState("dateDesc");
  const [removingId, setRemovingId] = useState(null);

  const getSortedItems = () => {
    const items = [...wishlistItems];
    switch (sortBy) {
      case "dateAsc":
        return items.sort((a, b) => new Date(a.addedAt || 0) - new Date(b.addedAt || 0));
      case "dateDesc":
        return items.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
      case "priceLow":
        return items.sort(
          (a, b) => getProductMinPrice(a).sellingPrice - getProductMinPrice(b).sellingPrice
        );
      case "priceHigh":
        return items.sort(
          (a, b) => getProductMinPrice(b).sellingPrice - getProductMinPrice(a).sellingPrice
        );
      case "ratingHigh":
        return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return items;
    }
  };

  const handleRemove = async (e, productId) => {
    e.stopPropagation();
    setRemovingId(productId);
    // Let the gentle exit play before the row leaves the list; instant when the
    // user prefers reduced motion.
    setTimeout(() => {
      removeFromWishlist(productId);
      setRemovingId(null);
    }, prefersReducedMotion ? 0 : 300);
  };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    // Same normalized line shape as card/PDP quick-adds (same default variant
    // and id scheme) so a wishlist add merges into the existing cart line. The
    // wishlist row's product id lives in `productId`, not `id`.
    addToCart(buildCartItem({ ...item, id: item.productId }), 1);
  };

  const handleMoveToCart = async (e, item) => {
    e.stopPropagation();
    handleAddToCart(e, item);
    setRemovingId(item.productId);
    setTimeout(() => {
      // Silent: keeps the "Added to Cart" toast on screen instead of
      // replacing it with a "Removed" toast mid-move.
      removeFromWishlist(item.productId, { silent: true });
      setRemovingId(null);
    }, prefersReducedMotion ? 0 : 300);
  };

  const sortedItems = getSortedItems();

  // Guests keep a fully working wishlist (saved on this device) — the same open
  // access as the heart toggles on cards/PDP. This banner is the single login
  // entry point and opens the global AuthModal (there is no /login route); on
  // login the local items merge into the account's wishlist. Hidden while the
  // session restore is pending so it doesn't flash on reload.
  const guestBanner = !user && !authLoading && (
    <motion.div
      className={styles.guestBanner}
      initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
    >
      <SyncIcon />
      <p className={styles.guestText}>
        Your saved pieces are kept on this device.
      </p>
      <button
        type="button"
        className={styles.guestLink}
        onClick={() => openAuthModal("login")}
      >
        Sign in to sync
      </button>
    </motion.div>
  );

  // ---- Loading: serif header + brand skeletons --------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Saved pieces</h1>
            </div>
          </header>
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Empty: a serene line of brand copy + a way into the collection ----
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          {guestBanner}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Saved pieces</h1>
              <span className={styles.count}>0 items</span>
            </div>
          </header>
          <motion.div
            className={styles.empty}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          >
            <span className={styles.emptyMark}>
              <HeartIcon />
            </span>
            <h2 className={styles.emptyTitle}>Nothing saved just yet</h2>
            <p className={styles.emptyText}>
              Tap the heart on any piece to keep it here — a quiet place to
              gather the things you love.
            </p>
            <Link to="/products" className={styles.emptyBtn}>
              Explore the collection
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---- Saved pieces gallery ---------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {guestBanner}

        {/* Header — serif title, live count, restrained sort, quiet clear */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Saved pieces</h1>
            <span className={styles.count}>
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className={styles.headerActions}>
            <label className={styles.sortField}>
              <span className={styles.sortLabel}>Sort</span>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort saved pieces"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearWishlist}
              title="Remove all saved pieces"
            >
              Clear all
            </button>
          </div>
        </header>

        {/* Gallery */}
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item, index) => {
              const priceInfo = getProductMinPrice(item);
              const hasDiscount = priceInfo.discount > 0;
              // Stock of what "Add to Cart" would add: the default (cheapest)
              // variant when the product has variants, else the product itself.
              // Unknown stock (older saved rows) is treated as in-stock.
              const defaultVariant = getDefaultCartVariant(item);
              const stockValue = defaultVariant ? defaultVariant.stock : item.stock;
              const inStock =
                stockValue == null || stockValue === "" || Number(stockValue) > 0;
              const ratingCount = Number(item.totalReviews) || 0;

              return (
                <motion.article
                  key={item.productId}
                  className={`${styles.card} ${removingId === item.productId ? styles.cardRemoving : ""}`}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.96, y: 10 }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                          delay: Math.min(index * 0.04, 0.28),
                        }
                  }
                >
                  {/* Media */}
                  <div className={styles.media}>
                    <Link
                      to={productPath(item)}
                      className={styles.mediaLink}
                      aria-label={item.name}
                    >
                      <img
                        className={styles.image}
                        src={item.image || PLACEHOLDER_IMG}
                        alt={item.name}
                        loading="lazy"
                        onError={onImageError}
                      />
                    </Link>

                    {hasDiscount && (
                      <span className={styles.badge}>{priceInfo.discount}% off</span>
                    )}

                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={(e) => handleRemove(e, item.productId)}
                      aria-label={`Remove ${item.name} from wishlist`}
                      title="Remove from wishlist"
                    >
                      <CloseIcon />
                    </button>
                  </div>

                  {/* Body */}
                  <div className={styles.body}>
                    {item.brand && <span className={styles.brand}>{item.brand}</span>}

                    <h3 className={styles.name}>
                      <Link to={productPath(item)} className={styles.nameLink}>
                        {item.name}
                      </Link>
                    </h3>

                    {ratingCount > 0 && (
                      <span className={styles.rating}>
                        <StarRating rating={item.rating || 0} size={13} />
                        <span className={styles.ratingCount}>
                          ({ratingCount.toLocaleString()})
                        </span>
                      </span>
                    )}

                    <PriceBlock
                      price={priceInfo.sellingPrice}
                      comparePrice={priceInfo.originalPrice}
                      size="sm"
                      showSavings={false}
                    />

                    <span
                      className={`${styles.stock} ${inStock ? styles.inStock : styles.outOfStock}`}
                    >
                      <span className={styles.stockDot} aria-hidden="true" />
                      {inStock ? "In stock" : "Out of stock"}
                    </span>

                    {/* Two clear actions: Add (brass) + Move (quiet) */}
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.addBtn}
                        onClick={(e) => handleAddToCart(e, item)}
                        disabled={!inStock}
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        className={styles.moveBtn}
                        onClick={(e) => handleMoveToCart(e, item)}
                        disabled={!inStock}
                      >
                        Move to Cart
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
