import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import apiService from "../../services/api";
import {
  formatCurrency,
  formatDate,
  normalizeOrderAddress,
  onImageError,
  PLACEHOLDER_IMG,
} from "../../utils/helpers";
import { enterProps } from "../../components/motion";
import styles from "./OrderConfirmation.module.css";

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  // Gate the staged Framer entrances for reduced-motion users (the token
  // transitions already zero out via storefront-tokens.css, and the success
  // medallion's draw/ring is gated in CSS behind prefers-reduced-motion).
  const prefersReducedMotion = useReducedMotion();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  // Scope the print stylesheet to this page: the body flag (read by the
  // @media print rules in the module) lets "Download invoice" print a clean
  // invoice with the site chrome hidden, without ever touching admin or other
  // pages — they never mount this component, so they never set the flag.
  useEffect(() => {
    document.body.classList.add("ocInvoicePrint");
    return () => document.body.classList.remove("ocInvoicePrint");
  }, []);

  const fetchOrder = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const response = await apiService.orders.getByOrderNumber(orderNumber);
      const data = response?.data || response?.order || response;
      setOrder(data || null);
    } catch (err) {
      // A failed request is not "order not found" — offer a retry instead.
      console.error("Failed to fetch order:", err);
      setOrder(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderNumber = () => {
    const text = order?.orderNumber || orderNumber;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDeliveryDate = (date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getEstimatedDelivery = () => {
    const created = new Date(order?.createdAt || Date.now());
    const delivery = new Date(created);
    delivery.setDate(delivery.getDate() + 5);
    return formatDeliveryDate(delivery);
  };

  // Print-to-PDF the invoice (see the @media print block + the body flag above).
  const handleDownloadInvoice = () => window.print();

  // Calm, reduced-motion-safe entrance preset from the shared motion vocabulary.
  const reveal = (delay = 0) => enterProps(prefersReducedMotion, delay);

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <span className="sf-spinner" aria-hidden="true" />
            <p>Preparing your confirmation…</p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch failed — distinct from "not found" so a flaky network never claims
  // the order doesn't exist.
  if (fetchError) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div className={styles.statePanel} {...reveal()}>
            <span className={`${styles.stateIcon} ${styles.stateIconDanger}`}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <h2 className={styles.stateTitle}>We couldn't load your order</h2>
            <p className={styles.stateText}>
              Something went wrong while fetching order {orderNumber}. Please
              check your connection and try again.
            </p>
            <div className={styles.stateActions}>
              <button className={styles.btnPrimary} onClick={fetchOrder}>
                Try Again
              </button>
              <button className={styles.btnSecondary} onClick={() => navigate("/orders")}>
                View Order History
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div className={styles.statePanel} {...reveal()}>
            <span className={styles.stateIcon}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <h2 className={styles.stateTitle}>Order not found</h2>
            <p className={styles.stateText}>
              We couldn't find the order you're looking for. It may have been
              placed in a different session.
            </p>
            <div className={styles.stateActions}>
              <button className={styles.btnPrimary} onClick={() => navigate("/")}>
                Continue Shopping
              </button>
              <button className={styles.btnSecondary} onClick={() => navigate("/orders")}>
                View Order History
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const orderItems = order.items || [];
  // Orders store taxAmount/shippingAmount/discountAmount (the canonical shape
  // checkout writes); older field names are kept as fallbacks.
  const taxAmount = order.taxAmount ?? order.tax ?? 0;
  const shippingAmount = order.shippingAmount ?? order.shipping ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const storeCreditUsed = order.storeCreditUsed ?? 0;
  const isPaymentPending = order.paymentStatus === "pending";
  const shippingAddr = normalizeOrderAddress(order.shippingAddress);
  const isDelivered = order.shippingStatus === "delivered";

  // Badge text mirrors the order's real paymentStatus — never a hardcoded
  // "successful". COD pending → "Pay on Delivery".
  const paymentStatusInfo = (() => {
    switch (order.paymentStatus) {
      case "paid":
        return { label: "Payment Successful", tone: styles.statusPaid };
      case "failed":
        return { label: "Payment Failed", tone: styles.statusFailed };
      case "refunded":
        return { label: "Payment Refunded", tone: styles.statusFailed };
      case "partially_refunded":
        return { label: "Payment Partially Refunded", tone: styles.statusPending };
      default:
        return {
          label:
            order.paymentMethod === "cod"
              ? "Payment Pending — Pay on Delivery"
              : "Payment Pending",
          tone: styles.statusPending,
        };
    }
  })();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Success moment — restrained brass medallion + serif thank-you */}
        <motion.section className={styles.success} aria-labelledby="oc-title" {...reveal(0)}>
          <span className={styles.medallion} aria-hidden="true">
            <svg
              className={styles.medallionCheck}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <p className={styles.eyebrow}>Order Confirmed</p>
          <h1 id="oc-title" className={styles.title}>
            Thank you for your order
          </h1>
          <p className={styles.subtitle}>
            {isPaymentPending
              ? "Your order is placed. You'll pay on delivery — we'll have it on its way to you shortly."
              : "Your payment was received and your pieces are being prepared with care."}
          </p>
        </motion.section>

        {/* Receipt bar — order number (quiet copy) + placed date */}
        <motion.div className={styles.receiptBar} {...reveal(0.05)}>
          <div className={styles.receiptOrder}>
            <span className={styles.receiptLabel}>Order Number</span>
            <div className={styles.receiptNumberRow}>
              <span className={styles.receiptNumber}>
                {order.orderNumber || orderNumber}
              </span>
              <button
                className={`${styles.btnCopy} ${copied ? styles.copied : ""}`}
                onClick={handleCopyOrderNumber}
                aria-label={copied ? "Order number copied" : "Copy order number"}
                title="Copy order number"
              >
                {copied ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className={styles.receiptPlaced}>
            <span className={styles.receiptLabel}>Placed On</span>
            <span className={styles.receiptValue}>{formatDate(order.createdAt)}</span>
          </div>
        </motion.div>

        {/* Delivery banner — quiet hairline */}
        <motion.div
          className={`${styles.deliveryBanner} ${isDelivered ? styles.deliveryDone : ""}`}
          {...reveal(0.1)}
        >
          <span className={styles.deliveryIcon} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </span>
          <div className={styles.deliveryText}>
            <span className={styles.deliveryLabel}>
              {isDelivered ? "Delivered" : "Estimated Delivery"}
            </span>
            <span className={styles.deliveryDate}>
              {isDelivered
                ? formatDeliveryDate(new Date(order.deliveredAt || order.updatedAt))
                : getEstimatedDelivery()}
            </span>
          </div>
        </motion.div>

        {/* Invoice / summary — hairline-ruled items + totals */}
        <motion.section className={styles.invoice} aria-label="Order summary" {...reveal(0.15)}>
          <div className={styles.invoiceHead}>
            <h2 className={styles.invoiceTitle}>Order Summary</h2>
            <span className={styles.invoiceCount}>
              {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          <ul className={styles.itemList}>
            {orderItems.map((item, index) => (
              <li key={index} className={styles.item}>
                <span className={styles.itemThumb}>
                  <img
                    src={item.image || PLACEHOLDER_IMG}
                    alt={item.name || item.productName || "Product"}
                    onError={onImageError}
                  />
                </span>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name || item.productName}</span>
                  {item.variantName && (
                    <span className={styles.itemVariant}>{item.variantName}</span>
                  )}
                  <span className={styles.itemQty}>Qty {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>
                  {formatCurrency(item.price * item.quantity, item.currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className={styles.totals}>
            <div className={styles.totalRow}>
              <dt>Subtotal</dt>
              <dd>{formatCurrency(order.subtotal)}</dd>
            </div>
            {discountAmount > 0 && (
              <div className={`${styles.totalRow} ${styles.totalDiscount}`}>
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd>-{formatCurrency(discountAmount)}</dd>
              </div>
            )}
            <div className={`${styles.totalRow} ${shippingAmount > 0 ? "" : styles.totalDiscount}`}>
              <dt>Shipping</dt>
              <dd>{shippingAmount > 0 ? formatCurrency(shippingAmount) : "Free"}</dd>
            </div>
            <div className={styles.totalRow}>
              <dt>Tax</dt>
              <dd>{formatCurrency(taxAmount)}</dd>
            </div>
            <div className={`${styles.totalRow} ${styles.totalGrand}`}>
              <dt>Total</dt>
              <dd>{formatCurrency(order.total)}</dd>
            </div>
            {storeCreditUsed > 0 && (
              <>
                <div className={`${styles.totalRow} ${styles.totalDiscount}`}>
                  <dt>Store Credit</dt>
                  <dd>-{formatCurrency(storeCreditUsed)}</dd>
                </div>
                <div className={`${styles.totalRow} ${styles.totalGrand}`}>
                  <dt>Amount Paid</dt>
                  <dd>
                    {formatCurrency(
                      order.amountPayable ?? Math.max(0, order.total - storeCreditUsed)
                    )}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </motion.section>

        {/* Shipping address + payment */}
        <div className={styles.detailGrid}>
          <motion.section className={styles.detailCard} aria-label="Shipping address" {...reveal(0.2)}>
            <h3 className={styles.detailTitle}>Shipping Address</h3>
            {shippingAddr ? (
              <address className={styles.address}>
                {shippingAddr.name && (
                  <span className={styles.addressName}>{shippingAddr.name}</span>
                )}
                {shippingAddr.line1 && <span>{shippingAddr.line1}</span>}
                {shippingAddr.line2 && <span>{shippingAddr.line2}</span>}
                {shippingAddr.cityLine && <span>{shippingAddr.cityLine}</span>}
                {shippingAddr.country && <span>{shippingAddr.country}</span>}
                {shippingAddr.phone && (
                  <span className={styles.addressPhone}>Phone: {shippingAddr.phone}</span>
                )}
              </address>
            ) : (
              <p className={styles.textMuted}>Shipping address not available</p>
            )}
          </motion.section>

          <motion.section className={styles.detailCard} aria-label="Payment" {...reveal(0.25)}>
            <h3 className={styles.detailTitle}>Payment</h3>
            <div className={styles.paymentMethod}>
              <span className={styles.paymentIcon} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2.5" y="5" width="19" height="14" rx="2" />
                  <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
                  <line x1="6" y1="14.5" x2="10" y2="14.5" />
                </svg>
              </span>
              <span className={styles.paymentName}>
                {order.paymentMethod
                  ? order.paymentMethod.replace(/_/g, " ").toUpperCase()
                  : "N/A"}
              </span>
            </div>
            <span className={`${styles.statusPill} ${paymentStatusInfo.tone}`}>
              {paymentStatusInfo.label}
            </span>
          </motion.section>
        </div>

        {/* Actions */}
        <motion.div className={styles.actions} {...reveal(0.3)}>
          <button className={styles.btnPrimary} onClick={() => navigate("/orders")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Track Order
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate("/")}>
            Continue Shopping
          </button>
          <button className={styles.btnGhost} onClick={handleDownloadInvoice}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Invoice
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
