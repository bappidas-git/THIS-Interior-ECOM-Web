import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import {
  formatCurrency,
  truncateText,
  productPath,
  PLACEHOLDER_IMG,
  onImageError,
} from "../../utils/helpers";
import {
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_CURRENCY,
  MOTION_EASE,
} from "../../utils/constants";
import { resolveTrustBadgeDetail } from "../../theme/tokens";
import styles from "./CartDrawer.module.css";

// Flat shipping shown while below the free threshold, in AED. Mirrors the
// Standard method's flatRate in db.json (set in 26); the free-shipping cutoff
// itself comes from the shared FREE_SHIPPING_THRESHOLD constant (same source as
// Header + Checkout).
const FLAT_SHIPPING = 25;

const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const cart = cartItems || [];
  const cartCount = getCartItemCount ? getCartItemCount() : 0;
  const cartTotal = getCartTotal ? getCartTotal() : 0;
  // Format money in the line currency. Every cart line carries its own currency
  // (stamped by buildCartItem / normalizeCartItem → DEFAULT_CURRENCY = AED), and
  // the fallback covers an empty cart so the free-shipping line still formats.
  const currency = cart[0]?.currency || DEFAULT_CURRENCY.code;

  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const shippingProgress = Math.min(
    100,
    (cartTotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  // Quiet, policy-level reassurance. The returns window is resolved from the
  // shared config (never hardcoded); it hides itself if the store offers none.
  const returnsLabel = resolveTrustBadgeDetail("easyReturns");

  // Lock body scroll while the drawer is open and let Escape dismiss it.
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  // Reduced-motion-safe panel/backdrop transitions.
  const panelInitial = reduceMotion ? { opacity: 0 } : { x: "100%" };
  const panelAnimate = reduceMotion ? { opacity: 1 } : { x: 0 };
  const panelExit = reduceMotion ? { opacity: 0 } : { x: "100%" };
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", damping: 34, stiffness: 320 };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop scrim */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
          >
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.headerTitle}>
                <h2 className={styles.title} id="cart-drawer-title">
                  Your Cart
                </h2>
                {cartCount > 0 && (
                  <span className={styles.itemCount}>
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close cart"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            {/* Free-shipping qualifier */}
            {cart.length > 0 && (
              <div className={styles.shippingBanner}>
                {amountToFreeShipping > 0 ? (
                  <p className={styles.shippingText}>
                    You're{" "}
                    <strong>
                      {formatCurrency(amountToFreeShipping, currency)}
                    </strong>{" "}
                    away from complimentary shipping
                  </p>
                ) : (
                  <p className={`${styles.shippingText} ${styles.shippingUnlocked}`}>
                    <svg
                      className={styles.checkIcon}
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    You've unlocked <strong>complimentary shipping</strong>
                  </p>
                )}
                <div
                  className={styles.progressBarTrack}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(shippingProgress)}
                >
                  <motion.div
                    className={styles.progressBarFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className={styles.itemsContainer}>
              {cart.length === 0 ? (
                <div className={styles.emptyState}>
                  <motion.div
                    className={styles.emptyStateInner}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
                  >
                    <svg
                      className={styles.emptyIcon}
                      width="56"
                      height="56"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <h3 className={styles.emptyTitle}>Your cart is empty</h3>
                    <p className={styles.emptyText}>
                      Curated pieces you add will be gathered here.
                    </p>
                    <button
                      className={styles.continueShoppingBtn}
                      onClick={() => handleNavigate("/")}
                    >
                      Continue shopping
                    </button>
                  </motion.div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((item) => {
                    const hasDiscount =
                      item.comparePrice && item.comparePrice > item.price;
                    const lineTotal = item.price * item.quantity;
                    const atStockLimit =
                      typeof item.stock === "number" &&
                      item.stock > 0 &&
                      item.quantity >= item.stock;
                    const productHref = productPath(item);

                    return (
                      <motion.div
                        key={item.id}
                        className={styles.cartItem}
                        layout={!reduceMotion}
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, x: 28 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : {
                                opacity: 0,
                                x: -28,
                                height: 0,
                                paddingTop: 0,
                                paddingBottom: 0,
                                overflow: "hidden",
                              }
                        }
                        transition={{
                          duration: reduceMotion ? 0 : 0.28,
                          ease: MOTION_EASE,
                        }}
                      >
                        <button
                          type="button"
                          className={styles.itemImage}
                          onClick={() => handleNavigate(productHref)}
                          aria-label={`View ${item.name}`}
                        >
                          <img
                            src={item.image || PLACEHOLDER_IMG}
                            alt={item.name}
                            onError={onImageError}
                          />
                        </button>

                        <div className={styles.itemDetails}>
                          <div className={styles.itemHead}>
                            <div className={styles.itemMeta}>
                              <h4
                                className={styles.itemName}
                                onClick={() => handleNavigate(productHref)}
                              >
                                {truncateText(item.name, 45)}
                              </h4>
                              {item.variantName && (
                                <span className={styles.itemVariant}>
                                  {item.variantName}
                                </span>
                              )}
                            </div>
                            <button
                              className={styles.removeBtn}
                              onClick={() => handleRemoveItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>

                          <div className={styles.itemPricing}>
                            <span className={styles.itemPrice}>
                              {formatCurrency(item.price, currency)}
                            </span>
                            {hasDiscount && (
                              <span className={styles.itemComparePrice}>
                                {formatCurrency(item.comparePrice, currency)}
                              </span>
                            )}
                          </div>

                          <div className={styles.itemBottom}>
                            <div className={styles.quantityControl}>
                              <button
                                className={styles.quantityBtn}
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                              </button>
                              <span className={styles.quantityValue}>
                                {item.quantity}
                              </span>
                              <button
                                className={styles.quantityBtn}
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity + 1)
                                }
                                disabled={atStockLimit}
                                title={
                                  atStockLimit ? "No more stock available" : undefined
                                }
                                aria-label="Increase quantity"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                              </button>
                            </div>

                            <span className={styles.lineTotal}>
                              {formatCurrency(lineTotal, currency)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Quiet trust row */}
            {cart.length > 0 && (
              <div className={styles.trustRow}>
                <span className={styles.trustItem}>
                  <svg
                    className={styles.trustIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Secure payment
                </span>
                {returnsLabel && (
                  <span className={styles.trustItem}>
                    <svg
                      className={styles.trustIcon}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                    </svg>
                    {returnsLabel}
                  </span>
                )}
              </div>
            )}

            {/* Footer summary */}
            {cart.length > 0 && (
              <div className={styles.footer}>
                <div className={styles.summarySection}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Subtotal</span>
                    <span className={styles.summaryValue}>
                      {formatCurrency(cartTotal, currency)}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>
                      Estimated shipping
                    </span>
                    <span
                      className={`${styles.summaryValue} ${
                        shippingCost === 0 ? styles.freeShipping : ""
                      }`}
                    >
                      {shippingCost === 0
                        ? "Free"
                        : formatCurrency(shippingCost, currency)}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.checkoutBtn}
                  onClick={() => handleNavigate("/checkout")}
                >
                  Checkout
                </button>
                <button
                  className={styles.viewCartBtn}
                  onClick={() => handleNavigate("/checkout")}
                >
                  View cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
