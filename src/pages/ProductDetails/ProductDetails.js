import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Swal from "sweetalert2";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import apiService from "../../services/api";
import { categoryParam } from "../../utils/categories";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import { DEFAULT_CURRENCY } from "../../utils/constants";
import {
  ProductGallery,
  SocialProof,
  PriceBlock,
  VariantSelector,
  QuantityStepper,
  TrustBadges,
  DeliveryReturnsInfo,
  AddToCartBar,
  ReviewsSection,
  RelatedProducts,
  FrequentlyBoughtTogether,
} from "../../components/storefront";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import styles from "./ProductDetails.module.css";

// Short, privacy-friendly display name for a review, e.g. "Bappi D." — mirrors
// the convention used by Order History (Prompt 21) and the seeded reviews.
const reviewDisplayName = (user) => {
  const first = user?.firstName?.trim() || "";
  const last = user?.lastName?.trim() || "";
  if (first && last) return `${first} ${last[0].toUpperCase()}.`;
  return first || user?.email?.split("@")[0] || "Customer";
};

// Collapse the order's payment/fulfilment/shipping fields into a single display
// status (mirrors Order History's derivation) so the PDP can purchase-gate the
// "Write a review" entry to a delivered, kept order.
const deriveOrderStatus = (order) => {
  if (order.paymentStatus || order.fulfillmentStatus || order.shippingStatus) {
    if (order.fulfillmentStatus === "returned") return "returned";
    if (
      order.fulfillmentStatus === "cancelled" ||
      order.paymentStatus === "failed" ||
      order.paymentStatus === "refunded"
    ) {
      return "cancelled";
    }
    if (order.shippingStatus === "delivered") return "delivered";
    if (order.shippingStatus === "shipped") return "shipped";
    return "processing";
  }
  return order.status || "processing";
};

// The PDP's below-the-fold information tabs (Description / Details / Reviews).
const TAB_KEYS = ["description", "details", "reviews"];

// =============================================================================
// Product Detail Page (PDP)
// =============================================================================
// Assembled entirely from the reusable, themeable, domain-agnostic storefront
// component library (src/components/storefront). This page owns DATA (loading,
// variant/stock derivation, the reviews blend, cart wiring); the components own
// PRESENTATION + the UX principles. Everything here is API/db.json-driven — no
// hardcoded business content — and every persuasive element is bound to real
// data (see the ethics notes in STOREFRONT_UX_GUIDELINES.md).
// =============================================================================

// ─── Loading Skeleton ───────────────────────────────────────────────────────
const Skeleton = () => (
  <div className={styles.skeletonPage}>
    <div className={styles.skeletonBreadcrumb} />
    <div className={styles.skeletonLayout}>
      <div className={styles.skeletonMainImage} />
      <div className={styles.skeletonRight}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonRating} />
        <div className={styles.skeletonPrice} />
        <div className={styles.skeletonDesc} />
        <div className={styles.skeletonDesc} />
        <div className={styles.skeletonButtons} />
      </div>
    </div>
  </div>
);

// ─── Not Found State ────────────────────────────────────────────────────────
const NotFound = () => (
  <div className={styles.notFound}>
    <div className={styles.notFoundIcon}>404</div>
    <h2>Product Not Found</h2>
    <p>The product you are looking for does not exist or has been removed.</p>
    <Link to="/products" className={styles.notFoundLink}>
      Browse Products
    </Link>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
const ProductDetails = () => {
  // Route is /products/:slug (slug canonical; legacy numeric id still resolves).
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const prefersReducedMotion = useReducedMotion();
  const tabsRef = useRef(null);
  const tabRefs = useRef({}); // roving-tabindex refs, keyed by tab id
  const buyBoxRef = useRef(null); // anchor for the sticky mobile Add-to-Cart bar

  // ── State ──────────────────────────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [bundle, setBundle] = useState([]);
  const [category, setCategory] = useState(null);
  const [settings, setSettings] = useState(null);
  const [shipping, setShipping] = useState([]);
  // Reviews authoring (purchase-gated): the shopper's own review for this
  // product (for the edit flow) + the most recent delivered order it can be
  // reviewed from. Both stay null until they're a signed-in, verified buyer.
  const [myReview, setMyReview] = useState(null);
  const [reviewableOrder, setReviewableOrder] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotice, setReviewNotice] = useState("");

  // ── Fetch product ──────────────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const isLegacyId = /^\d+$/.test(String(slug));
      let data = isLegacyId
        ? await apiService.products.getById(slug)
        : await apiService.products.getBySlug(slug);

      if (!data) {
        data = isLegacyId
          ? await apiService.products.getBySlug(slug).catch(() => null)
          : await apiService.products.getById(slug).catch(() => null);
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      // Canonicalise the URL to the slug form so old links never 404.
      if (data.slug && String(slug) !== String(data.slug)) {
        navigate(`/products/${data.slug}`, { replace: true });
      }

      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setQuantity(1);

      // Recently viewed (key must match what Home.js reads).
      try {
        const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const filtered = viewed.filter((item) => String(item.id) !== String(data.id));
        filtered.unshift({
          id: data.id,
          slug: data.slug,
          name: data.name,
          brand: data.brand,
          image: data.images?.[0] || data.image,
          images: data.images,
          price: data.price,
          comparePrice: data.comparePrice,
          variants: data.variants,
          rating: data.rating,
          totalReviews: data.totalReviews,
          viewedAt: new Date().toISOString(),
        });
        localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 20)));
      } catch (e) {
        /* ignore localStorage errors */
      }

      if (data.categoryId) {
        apiService.categories
          .getById(data.categoryId)
          .then(setCategory)
          .catch(() => {});
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  // ── Fetch reviews (approved only — enforced by the API) ─────────────────
  const fetchReviews = useCallback(async () => {
    const productId = product?.id;
    if (!productId) return;
    try {
      setReviewsLoading(true);
      setReviewsError(false);
      const data = await apiService.products.getReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setReviewsError(true);
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id]);

  // ── Related + bundle (AOV) — real catalogue data only ───────────────────
  const fetchAov = useCallback(async () => {
    if (!product) return;
    const cfg = STOREFRONT_CONFIG.aov;
    if (cfg.relatedProducts) {
      apiService.products
        .getRelated(product, cfg.maxRelated)
        .then(setRelatedProducts)
        .catch(() => setRelatedProducts([]));
    }
    if (cfg.frequentlyBoughtTogether) {
      apiService.products
        .getFrequentlyBoughtTogether(product, cfg.maxBundle - 1)
        .then(setBundle)
        .catch(() => setBundle([]));
    }
  }, [product]);

  // ── Review eligibility (purchase-gated) — verified buyers only ──────────
  // For a signed-in shopper, find their existing review for this product (to
  // drive the edit flow) and the most recent DELIVERED order containing it (the
  // proof of purchase the moderation pipeline requires). Anonymous shoppers
  // fetch nothing; the "Write a review" entry then routes them to sign in.
  const fetchReviewEligibility = useCallback(async () => {
    if (!product?.id || !isAuthenticated || !user?.id) {
      setMyReview(null);
      setReviewableOrder(null);
      return;
    }
    try {
      const [orders, mine] = await Promise.all([
        apiService.orders.getByUserId(user.id).catch(() => []),
        apiService.reviews.getMine(user.id).catch(() => []),
      ]);
      const existing =
        (Array.isArray(mine) ? mine : []).find(
          (r) => String(r.productId) === String(product.id)
        ) || null;
      setMyReview(existing);
      const order =
        (Array.isArray(orders) ? orders : [])
          .filter((o) => deriveOrderStatus(o) === "delivered")
          .find((o) =>
            (o.items || []).some((it) => String(it.productId) === String(product.id))
          ) || null;
      setReviewableOrder(order);
    } catch (error) {
      setMyReview(null);
      setReviewableOrder(null);
    }
  }, [product?.id, isAuthenticated, user?.id]);

  // ── Public store data for trust signals + transparent delivery info ─────
  useEffect(() => {
    apiService.settings.get().then(setSettings).catch(() => {});
    apiService.shipping.getMethods().then((m) => setShipping(Array.isArray(m) ? m : [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [fetchProduct]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchAov();
    }
  }, [product, fetchReviews, fetchAov]);

  // Re-run whenever the product or the auth/user identity changes (e.g. sign-in).
  useEffect(() => {
    fetchReviewEligibility();
  }, [fetchReviewEligibility]);

  // ── Derived values ─────────────────────────────────────────────────────
  const images =
    product?.images?.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  const currentPrice = selectedVariant ? selectedVariant.price : product?.price || 0;
  const comparePrice = product?.comparePrice || 0;
  const discount =
    comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : 0;
  const currentSku = selectedVariant?.sku || product?.sku || "";

  // Stock for the active selection — variant stock, else product stock (never
  // silently 0). Low-stock uses the product's REAL threshold (not a magic 5).
  const currentStock = selectedVariant
    ? typeof selectedVariant.stock === "number"
      ? selectedVariant.stock
      : product?.stock
    : product?.stock;
  const hasStockInfo = typeof currentStock === "number";
  const isOutOfStock = hasStockInfo && currentStock <= 0;
  const lowStockThreshold = Number(product?.lowStockThreshold) || 5;
  const isLowStock = !isOutOfStock && hasStockInfo && currentStock <= lowStockThreshold;
  const STOCK_UNKNOWN_MAX = 10;
  const maxQuantity = hasStockInfo ? Math.max(1, currentStock) : STOCK_UNKNOWN_MAX;

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), maxQuantity));
  }, [maxQuantity]);

  // ── Reviews blend (consistent average across the page) ──────────────────
  const baseRating = Number(product?.rating) || 0;
  const baseCount = Number(product?.totalReviews) || 0;
  const reviewSum = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  const totalRatingsCount = baseCount + reviews.length;
  const displayAvg =
    totalRatingsCount > 0
      ? (baseRating * baseCount + reviewSum) / totalRatingsCount
      : baseRating;

  // ── Cart wiring ────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    (options) => {
      if (!product) return;
      if (product.variants?.length > 0 && !selectedVariant) return;

      const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
      const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
      const cartItem = {
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : String(product.id),
        productId: product.id,
        slug: product.slug || null,
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || null,
        name: product.name,
        image: product.images?.[0] || product.image || "",
        price: effectivePrice,
        comparePrice: product.comparePrice || 0,
        currency: DEFAULT_CURRENCY.code,
        ...(effectiveStock != null && effectiveStock !== ""
          ? { stock: Number(effectiveStock) }
          : {}),
      };
      return addToCart(cartItem, quantity, options);
    },
    [product, selectedVariant, quantity, addToCart]
  );

  // Primary CTA with a brief, satisfying "Added ✓" confirmation (the cart toast
  // + mini-cart drawer also fire from CartContext).
  const handleAddClick = useCallback(() => {
    if (isOutOfStock) return;
    handleAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }, [handleAddToCart, isOutOfStock]);

  const handleBuyNow = useCallback(async () => {
    await handleAddToCart({ openDrawer: false });
    navigate("/checkout");
  }, [handleAddToCart, navigate]);

  const scrollToReviews = useCallback(() => {
    setActiveTab("reviews");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ── "Write a review" entry — gated, but discoverable for everyone ────────
  // Anonymous → sign in. Verified buyer (or a shopper editing their existing
  // review) → open the form. Signed in without a delivered order → an honest
  // explanation, never a dead button.
  const handleWriteReview = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal?.("login");
      return;
    }
    if (myReview || reviewableOrder) {
      setReviewNotice("");
      setReviewModalOpen(true);
      return;
    }
    setReviewNotice(
      "Only verified buyers can write a review. You'll be able to review this once your order is delivered."
    );
  }, [isAuthenticated, openAuthModal, myReview, reviewableOrder]);

  // Submit (or edit) — carries the proof of purchase and (re)enters `pending`
  // moderation, so it won't appear on the storefront until an admin approves it.
  const handleSubmitReview = useCallback(
    async ({ rating, title, body }) => {
      if (!product) return;
      const orderId = reviewableOrder?.id ?? myReview?.orderId ?? null;
      const orderNumber = reviewableOrder?.orderNumber ?? myReview?.orderNumber ?? null;
      await apiService.reviews.submit({
        productId: product.id,
        userId: user.id,
        userName: reviewDisplayName(user),
        rating,
        title,
        body,
        orderId,
        orderNumber,
        isVerifiedPurchase: true,
      });
      const wasEditing = !!myReview;
      setReviewModalOpen(false);
      // Refresh the author's own review (so the entry now reads "Edit your
      // review") and re-pull approved reviews (the new one stays hidden until
      // moderated — by design).
      fetchReviewEligibility();
      fetchReviews();
      Swal.fire({
        icon: "success",
        title: wasEditing ? "Review updated" : "Review submitted",
        text: "Thanks! Your review will appear on the product page once it's approved.",
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    },
    [product, user, reviewableOrder, myReview, fetchReviewEligibility, fetchReviews]
  );

  // Roving tabindex: arrow / Home / End move focus + selection across the tabs.
  const handleTabKeyDown = useCallback(
    (e) => {
      const idx = TAB_KEYS.indexOf(activeTab);
      let nextIdx = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIdx = (idx + 1) % TAB_KEYS.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        nextIdx = (idx - 1 + TAB_KEYS.length) % TAB_KEYS.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = TAB_KEYS.length - 1;
      if (nextIdx == null) return;
      e.preventDefault();
      const key = TAB_KEYS[nextIdx];
      setActiveTab(key);
      requestAnimationFrame(() => tabRefs.current[key]?.focus());
    },
    [activeTab]
  );

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) return <Skeleton />;
  if (notFound || !product) return <NotFound />;

  const wishlisted = isInWishlist(product.id);

  // Slow, reduced-motion-safe reveal for the active tab panel.
  const panelMotion = prefersReducedMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      };

  // Spec table — build only the rows that have real values, so sparse products
  // never show empty key/value pairs.
  const dims = product.dimensions;
  const dimensionsText = dims
    ? typeof dims === "object"
      ? [dims.length, dims.width, dims.height].filter((v) => v != null && v !== "").join(" × ")
      : dims
    : "";
  const specRows = [
    product.brand && ["Brand", product.brand],
    currentSku && ["SKU", currentSku],
    product.weight && ["Weight", product.weight],
    dimensionsText && ["Dimensions", dimensionsText],
    category?.name && ["Category", category.name],
    product.tags && product.tags.length > 0 && ["Tags", product.tags.join(", ")],
  ].filter(Boolean);

  const TABS = [
    { key: "description", label: "Description" },
    { key: "details", label: "Details" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`${styles.page} ${isDarkMode ? styles.dark : ""}`}
    >
      <div className={styles.container}>
        {/* ── Breadcrumb (orientation) ──────────────────────────────────── */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>&rsaquo;</span>
          {category ? (
            <>
              <Link
                to={`/products?category=${categoryParam(category)}`}
                className={styles.breadcrumbLink}
              >
                {category.name}
              </Link>
              <span className={styles.breadcrumbSep}>&rsaquo;</span>
            </>
          ) : null}
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        {/* ── Above the fold: media + buy box ───────────────────────────── */}
        <div className={styles.mainLayout}>
          <div className={styles.gallerySection}>
            <ProductGallery images={images} alt={product.name} discount={discount} />
          </div>

          <div className={styles.infoSection}>
            {product.brand && <span className={styles.brand}>{product.brand}</span>}
            <h1 className={styles.productName}>{product.name}</h1>

            {/* Social proof — real ratings only, jumps to reviews */}
            <SocialProof
              rating={displayAvg}
              count={totalRatingsCount}
              onReviewsClick={scrollToReviews}
            />

            {/* Price — honest compare/discount + transparent tax note */}
            <PriceBlock
              price={currentPrice}
              comparePrice={comparePrice}
              currency={DEFAULT_CURRENCY.code}
              size="lg"
              taxNote={
                settings?.store?.taxIncluded === false
                  ? "Exclusive of taxes — calculated at checkout"
                  : "Inclusive of all taxes"
              }
            />

            {currentSku && (
              <div className={styles.skuLine}>
                SKU: <span>{currentSku}</span>
              </div>
            )}

            {product.shortDescription && (
              <p className={styles.shortDescription}>{product.shortDescription}</p>
            )}

            <div className={styles.divider} aria-hidden="true" />

            {/* Variant selection — visible swatches/tiles, never a dropdown */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                value={selectedVariant}
                onChange={setSelectedVariant}
                productStock={product.stock}
                currency={DEFAULT_CURRENCY.code}
              />
            )}

            {/* Quantity + honest stock status */}
            <div className={styles.purchaseRow}>
              <div className={styles.quantityBlock}>
                <span className={styles.quantityLabel}>Quantity</span>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={maxQuantity}
                  disabled={isOutOfStock}
                />
              </div>
              <div className={styles.stockStatus}>
                {isOutOfStock ? (
                  <span className={styles.stockOut}>Out of Stock</span>
                ) : isLowStock ? (
                  <span className={styles.stockLow}>
                    Only {currentStock} left — order soon!
                  </span>
                ) : hasStockInfo ? (
                  <span className={styles.stockIn}>In Stock</span>
                ) : null}
              </div>
            </div>

            {/* Primary / secondary CTAs (standard copy, clear hierarchy:
                brass Add to Cart + quiet wishlist, then secondary Buy Now) */}
            <div className={styles.actions} ref={buyBoxRef}>
              <div className={styles.primaryRow}>
                <button
                  className={`${styles.addToCartBtn} ${added ? styles.addToCartDone : ""}`}
                  onClick={handleAddClick}
                  disabled={isOutOfStock}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  {isOutOfStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
                </button>
                <button
                  className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistBtnActive : ""}`}
                  onClick={() => toggleWishlist(product)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wishlisted}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                Buy Now
              </button>
            </div>

            {/* Trust signals near the decision point (config + live data) */}
            <TrustBadges settings={settings} shipping={shipping} variant="grid" />

            {/* Transparent delivery, COD & returns — REAL data, shown upfront */}
            <DeliveryReturnsInfo shipping={shipping} settings={settings} currency={DEFAULT_CURRENCY.code} />
          </div>
        </div>

        {/* ── Below the fold: quiet editorial tabs ──────────────────────── */}
        <div className={styles.tabsSection} ref={tabsRef}>
          <div
            className={styles.tabNav}
            role="tablist"
            aria-label="Product information"
            onKeyDown={handleTabKeyDown}
          >
            {TABS.map((t) => {
              const selected = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  id={`pdp-tab-${t.key}`}
                  ref={(el) => {
                    tabRefs.current[t.key] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="pdp-tabpanel"
                  tabIndex={selected ? 0 : -1}
                  className={`${styles.tabButton} ${selected ? styles.tabButtonActive : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div
            className={styles.tabContent}
            id="pdp-tabpanel"
            role="tabpanel"
            aria-labelledby={`pdp-tab-${activeTab}`}
            tabIndex={0}
          >
            {activeTab === "description" && (
              <motion.div key="description" {...panelMotion} className={styles.descriptionPanel}>
                <p className={styles.prose}>
                  {product.description || "No description available."}
                </p>
              </motion.div>
            )}

            {activeTab === "details" && (
              <motion.div key="details" {...panelMotion} className={styles.detailsPanel}>
                {specRows.length > 0 ? (
                  <dl className={styles.specList}>
                    {specRows.map(([label, value]) => (
                      <div className={styles.specRow} key={label}>
                        <dt className={styles.specLabel}>{label}</dt>
                        <dd className={styles.specValue}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className={styles.prose}>No additional details available.</p>
                )}
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div key="reviews" {...panelMotion}>
                <ReviewsSection
                  reviews={reviews}
                  displayAvg={displayAvg}
                  totalRatingsCount={totalRatingsCount}
                  loading={reviewsLoading}
                  error={reviewsError}
                  onRetry={fetchReviews}
                  onWriteReview={handleWriteReview}
                  hasReviewed={!!myReview}
                  reviewNotice={reviewNotice}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* ── AOV: curated bundle, then similar products (data-driven) ──── */}
        <FrequentlyBoughtTogether
          anchor={product}
          companions={bundle}
          onAddToCart={addToCart}
          currency={DEFAULT_CURRENCY.code}
        />

        <RelatedProducts
          title="You may also like"
          products={relatedProducts}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist}
        />
      </div>

      {/* ── Sticky mobile Add-to-Cart (mobile-first) ──────────────────────── */}
      <AddToCartBar
        anchorRef={buyBoxRef}
        price={currentPrice}
        comparePrice={comparePrice}
        currency={DEFAULT_CURRENCY.code}
        image={product.images?.[0] || product.image}
        name={selectedVariant?.name || product.name}
        disabled={isOutOfStock}
        onAddToCart={handleAddClick}
        onBuyNow={handleBuyNow}
      />

      {/* ── Write / edit a review (purchase-gated; re-enters moderation) ──── */}
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={{
          productId: product.id,
          name: product.name,
          image: product.images?.[0] || product.image,
        }}
        existing={myReview}
        onSubmit={handleSubmitReview}
        isDarkMode={isDarkMode}
      />
    </motion.div>
  );
};

export default ProductDetails;
