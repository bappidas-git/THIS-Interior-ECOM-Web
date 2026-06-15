import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../storefront/ProductCard";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import styles from "./FeaturedProducts.module.css";

// =============================================================================
// FeaturedProducts — the shared featured / curated row
// =============================================================================
// Restyled to the editorial card rhythm: an airy, generously spaced row of the
// shared storefront <ProductCard> (so the card aesthetic stays identical across
// the home, listing and PDP surfaces) — never a dense, edge-to-edge grid.
//
// Props (unchanged contract + additive editorial extras):
//   products     array   the items to show (quick-add + wishlist wired below)
//   title        string  section heading (serif display)
//   viewAllLink  string  the quiet "View all" target (omit to hide)
//   eyebrow      string  optional uppercase kicker above the title
//   subtitle     string  optional supporting line
//   loading      bool    render the header + a calm skeleton row
//   skeletonCount number how many skeleton cards to show while loading
//
// Cart/wishlist wiring is intact: <ProductCard> builds the variant-aware line
// (buildCartItem) and hands it to addToCart, which merges by the
// `${productId}-${variantId}` key; the heart toggles via the wishlist context.
// =============================================================================

const CardSkeleton = () => (
  <div className={styles.skeletonCard} aria-hidden="true">
    <div className={`sf-skeleton ${styles.skeletonMedia}`} />
    <div className={styles.skeletonBody}>
      <span className={`sf-skeleton sf-skeleton--text ${styles.skeletonBrand}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skeletonName}`} />
      <span className={`sf-skeleton sf-skeleton--text ${styles.skeletonPrice}`} />
    </div>
  </div>
);

const FeaturedProducts = ({
  products = [],
  title = "Featured Products",
  viewAllLink = "/products",
  eyebrow,
  subtitle,
  loading = false,
  skeletonCount = 4,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Honest empty state: once loaded, render nothing when there's no real data.
  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.heading}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {viewAllLink && !loading && (
            <Link to={viewAllLink} className={styles.viewAll}>
              View all
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
        </div>

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={isInWishlist(product.id)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
