import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import PriceBlock from "./PriceBlock";
import {
  getProductMinPrice,
  buildCartItem,
  productPath,
  truncateText,
  PLACEHOLDER_IMG,
  onImageError,
} from "../../utils/helpers";
import styles from "./ProductCard.module.css";

// =============================================================================
// ProductCard — the signature, reusable storefront product tile
// =============================================================================
// One card, used by every product surface (home rows, listing grid + list,
// search, wishlist, special offers, related/you-may-also-like, bundles). It is
// domain-agnostic: it renders whatever real product data it's given.
//
// Editorial signature: image-forward and minimal — a large, calm image on a
// surface ground with hairline framing and generous whitespace. Hover (desktop)
// brings a slow image zoom, a quiet cross-fade to a second image when one
// exists, a subtle lift, and a refined "Add to Cart" that resolves up from the
// image; on touch the quick-add is always reachable. A small wishlist heart sits
// in a corner. Badges are restrained (one chip — a real discount %, else a real
// "New") and ratings are honest: stars + count show ONLY when there are real
// reviews, never a hollow "(0)".
//
// Accessibility: the whole tile is a SINGLE link to the PDP (the product name,
// stretched across the card via ::after). The wishlist/quick-add controls are
// DOM siblings layered above that link — not nested inside the anchor — so there
// is no nested-interactive pitfall; each control also stops the click from
// reaching the link. Motion honours prefers-reduced-motion (no scale/lift).
//
// It owns NO cart/wishlist state: it delegates to the callbacks. Callers build
// the cart line via buildCartItem (line key `${productId}-${variantId}`) so a
// quick-add merges with PDP adds; the heart toggles via the caller's wishlist.
//
// Props (unchanged contract — every surface passes these):
//   product           object  (required)
//   onAddToCart       fn      (cartItem) => void  — omit to hide the quick-add
//   onToggleWishlist  fn      (product)  => void  — omit to hide the heart
//   isWishlisted      boolean
//   showAddToCart     boolean default true (when onAddToCart given)
// =============================================================================

// "New" is gated on a REAL signal — the product's own createdAt within the last
// 30 days — so it can never become a permanent, hollow label. No date (or an
// older one) simply shows no chip; a discount always takes the single slot.
const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const isRecentlyAdded = (createdAt) => {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  return Number.isFinite(t) && t <= Date.now() && Date.now() - t < NEW_WINDOW_MS;
};

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  showAddToCart = true,
}) => {
  if (!product) return null;

  const { sellingPrice, originalPrice, discount } = getProductMinPrice(product);
  const ratingCount = Number(product.totalReviews) || 0;
  const rating = Number(product.rating) || 0;
  const outOfStock = product.stock === 0;

  // Image-forward: a calm primary image with an optional second image that
  // cross-fades in on hover. Single-image products never render the second
  // <img>, so the cross-fade gracefully no-ops.
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const primaryImg = images[0] || product.image || PLACEHOLDER_IMG;
  const secondImg = images[1] || null;

  // At most one restrained chip: a real discount %, else a real "New" signal.
  const showDiscount = discount > 0;
  const showNew = !showDiscount && isRecentlyAdded(product.createdAt);

  // Keep the nested controls from triggering the card's stretched PDP link (and
  // any onClick a consumer might wrap the card in).
  const stopCardActivation = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img
          className={styles.primaryImg}
          src={primaryImg}
          alt={product.name}
          loading="lazy"
          onError={onImageError}
        />
        {secondImg && (
          <img
            className={styles.secondaryImg}
            src={secondImg}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={onImageError}
          />
        )}

        {showDiscount && (
          <span className={`${styles.badge} ${styles.badgeDiscount}`}>
            {discount}% off
          </span>
        )}
        {showNew && <span className={styles.badge}>New</span>}

        {onToggleWishlist && (
          <button
            type="button"
            className={`${styles.wishlist} ${isWishlisted ? styles.wishlisted : ""}`}
            onClick={(e) => {
              stopCardActivation(e);
              onToggleWishlist(product);
            }}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        )}

        {showAddToCart && onAddToCart && (
          <div className={`${styles.quickAdd} ${outOfStock ? styles.quickAddStatic : ""}`}>
            <button
              type="button"
              className={styles.quickAddBtn}
              disabled={outOfStock}
              onClick={(e) => {
                stopCardActivation(e);
                onAddToCart(buildCartItem(product));
              }}
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.body}>
        {product.brand && <span className={styles.brand}>{product.brand}</span>}

        <h3 className={styles.name}>
          <Link to={productPath(product)} className={styles.nameLink}>
            {truncateText(product.name, 48)}
          </Link>
        </h3>

        {ratingCount > 0 && (
          <span className={styles.rating}>
            <StarRating rating={rating} size={13} />
            <span className={styles.ratingCount}>({ratingCount.toLocaleString()})</span>
          </span>
        )}

        <PriceBlock
          price={sellingPrice}
          comparePrice={originalPrice}
          size="sm"
          showSavings={false}
        />
      </div>
    </article>
  );
};

export default ProductCard;
