import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useOrder } from "../../context/OrderContext";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import apiService from "../../services/api";
import { formatCurrency, onImageError, PLACEHOLDER_IMG } from "../../utils/helpers";
import { MOTION_EASE } from "../../utils/constants";
import styles from "./Checkout.module.css";

const STEPS = ["Cart", "Shipping", "Payment", "Review"];

const PAYMENT_OPTIONS = [
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  { id: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm" },
  { id: "net_banking", label: "Net Banking", desc: "All major banks supported" },
  { id: "wallet", label: "Wallet", desc: "Paytm, PhonePe, Amazon Pay" },
  { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
];

/* Editorial line icons (currentColor, hairline stroke) — keeps the payment and
   wallet treatments on-brand instead of emoji. Purely presentational. */
const CheckMark = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m20 6-11 11-5-5" />
  </svg>
);

const WalletGlyph = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H17a1 1 0 0 1 1 1v1.5" />
    <path d="M3 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-2.5" />
    <path d="M21 11h-4a2 2 0 0 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z" />
  </svg>
);

const PAYMENT_GLYPHS = {
  card: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
      <line x1="6" y1="14.5" x2="10" y2="14.5" />
    </svg>
  ),
  upi: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" />
    </svg>
  ),
  net_banking: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 9.5 12 4l8.5 5.5" />
      <line x1="5.5" y1="10.5" x2="5.5" y2="18" />
      <line x1="10" y1="10.5" x2="10" y2="18" />
      <line x1="14" y1="10.5" x2="14" y2="18" />
      <line x1="18.5" y1="10.5" x2="18.5" y2="18" />
      <line x1="3.5" y1="20" x2="20.5" y2="20" />
    </svg>
  ),
  wallet: <WalletGlyph />,
  cod: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.4" />
      <line x1="6" y1="9.5" x2="6" y2="9.51" />
      <line x1="18" y1="14.5" x2="18" y2="14.51" />
    </svg>
  ),
};

// Discount for an applied coupon at the current subtotal. Derived (never
// stored), so qty changes can't leave a stale amount and re-applying a coupon
// can't stack. `capped` flags when maxDiscount limited the raw value.
const couponDiscountFor = (coupon, amount) => {
  if (!coupon) return { discount: 0, capped: false };
  const raw =
    coupon.type === "percentage"
      ? Math.round((amount * coupon.value) / 100)
      : coupon.value;
  const cap = coupon.maxDiscount || Infinity;
  return { discount: Math.max(0, Math.min(raw, cap, amount)), capped: raw > cap };
};

const Checkout = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { cartItems, getCartTotal, getCartItemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { createOrder } = useOrder();

  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingError, setShippingError] = useState("");
  const [storeSettings, setStoreSettings] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  // Store-credit wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [applyStoreCredit, setApplyStoreCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState(0); // amount the customer chose to apply

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    phone: user?.phone || "", addressLine1: "", addressLine2: "",
    city: "", state: "", postalCode: "", country: "India",
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [useExistingAddress, setUseExistingAddress] = useState(null);

  useEffect(() => {
    const loadShipping = async () => {
      try {
        // Storefront endpoint (active methods only) — never the admin-scoped
        // method, which needs an admin token on the Laravel branch.
        const methods = await apiService.shipping.getMethods();
        const active = methods.filter((m) => m.isActive !== false);
        setShippingMethods(active);
        if (active.length > 0) setSelectedShipping(active[0]);
      } catch (e) { console.error("Load shipping methods error:", e); }
    };
    const loadSettings = async () => {
      try {
        const settings = await apiService.settings.get();
        setStoreSettings(settings);
      } catch (e) { console.error("Load store settings error:", e); }
    };
    loadShipping();
    loadSettings();
  }, []);

  // Load the signed-in customer's store-credit balance so it can be applied here.
  useEffect(() => {
    if (!user?.id) { setWalletBalance(0); return; }
    let active = true;
    (async () => {
      try {
        const balance = await apiService.wallet.getBalance(user.id);
        if (active) setWalletBalance(Number(balance) || 0);
      } catch (e) { console.error("Load wallet balance error:", e); }
    })();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        phone: prev.phone || user.phone || "",
      }));
      if (user.addresses?.length > 0) {
        const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setUseExistingAddress(defaultAddr);
      }
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ── Order math ────────────────────────────────────────────────────────────
  // total = subtotal − discount + shipping + tax, with tax on the discounted
  // subtotal. The same rounded figures are stored on the order so Confirmation,
  // Order History and Admin all display exactly what was charged.
  const subtotal = getCartTotal();
  const { discount: couponDiscount, capped: couponCapped } = couponDiscountFor(couponApplied, subtotal);
  const shippingCost = selectedShipping
    ? selectedShipping.rateType === "free" || (selectedShipping.freeAbove && subtotal >= selectedShipping.freeAbove) ? 0 : selectedShipping.flatRate
    : 0;
  const taxRatePct = storeSettings?.store?.taxRate ?? 18;
  const taxAmount = Math.round(Math.max(0, subtotal - couponDiscount) * (taxRatePct / 100));
  const total = subtotal - couponDiscount + shippingCost + taxAmount;

  // Store credit is applied LAST, against the grand total (it behaves like a
  // prepaid gift card — after discounts, shipping and tax). The customer can
  // apply up to their balance, capped by the order total; the remainder, if
  // any, is collected via the chosen payment method. (See PR notes.)
  const maxApplicableCredit = Math.min(walletBalance, total);
  const storeCreditApplied = applyStoreCredit
    ? Math.min(Math.max(0, Math.round(creditAmount)), maxApplicableCredit)
    : 0;
  const amountPayable = Math.max(0, total - storeCreditApplied);
  const fullyCovered = storeCreditApplied > 0 && amountPayable === 0;

  // COD availability comes from store settings, bounded by the amount actually
  // collected on delivery (the payable remainder after store credit).
  const paymentCfg = storeSettings?.payment;
  const codEnabled = paymentCfg?.codEnabled !== false;
  const codMinOrder = paymentCfg?.codMinOrder ?? 0;
  const codMaxOrder = paymentCfg?.codMaxOrder ?? null;
  const codAvailable = codEnabled && amountPayable > 0 &&
    amountPayable >= codMinOrder && (codMaxOrder == null || amountPayable <= codMaxOrder);

  // If totals shift (qty/coupon/shipping) and COD falls out of range, move the
  // selection back to card rather than letting an invalid method be submitted.
  useEffect(() => {
    if (paymentMethod === "cod" && !codAvailable) setPaymentMethod("card");
  }, [paymentMethod, codAvailable]);

  // Keep the chosen credit amount within the current applicable maximum — e.g.
  // when the cart total drops after removing an item or a coupon — so the input
  // never displays (or submits) more than can actually be applied.
  useEffect(() => {
    if (applyStoreCredit && creditAmount > maxApplicableCredit) {
      setCreditAmount(maxApplicableCredit);
    }
  }, [applyStoreCredit, creditAmount, maxApplicableCredit]);

  // A coupon only stays applied while the cart still meets its minimum.
  useEffect(() => {
    if (couponApplied && subtotal < (couponApplied.minOrderAmount || 0)) {
      setCouponApplied(null);
      setCouponCode("");
      setCouponError(
        `${couponApplied.code} was removed — it needs a minimum order of ${formatCurrency(couponApplied.minOrderAmount)}.`
      );
    }
  }, [subtotal, couponApplied]);

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) { setCouponError("Enter a coupon code"); return; }
    try {
      const coupon = await apiService.coupons.validate(couponCode.trim(), subtotal);
      setCouponApplied(coupon);
    } catch (e) {
      setCouponError(e.message || "Invalid coupon");
      setCouponApplied(null);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(null);
    setCouponError("");
  };

  const validateAddress = () => {
    const addr = useExistingAddress || shippingAddress;
    const errs = {};
    if (!addr.firstName?.trim()) errs.firstName = "Required";
    if (!addr.lastName?.trim()) errs.lastName = "Required";
    if (!addr.phone?.trim()) errs.phone = "Required";
    if (!addr.addressLine1?.trim()) errs.addressLine1 = "Required";
    if (!addr.city?.trim()) errs.city = "Required";
    if (!addr.state?.trim()) errs.state = "Required";
    if (!addr.postalCode?.trim()) errs.postalCode = "Required";
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0) {
      if (cartItems.length === 0) return;
      if (!isAuthenticated) { openAuthModal("login"); return; }
      setStep(1);
    } else if (step === 1) {
      if (!validateAddress()) return;
      if (!selectedShipping) { setShippingError("Please select a shipping method."); return; }
      setShippingError("");
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      placeOrder();
    }
  };

  const placeOrder = async () => {
    setIsProcessing(true);
    try {
      const addr = useExistingAddress || shippingAddress;
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId, variantId: item.variantId,
          name: `${item.name}${item.variantName ? ` - ${item.variantName}` : ""}`,
          image: item.image, sku: item.sku || "", price: item.price,
          quantity: item.quantity, subtotal: item.price * item.quantity,
        })),
        shippingAddress: addr,
        billingAddress: addr,
        subtotal,
        discountAmount: couponDiscount,
        couponCode: couponApplied?.code || null,
        shippingAmount: shippingCost,
        taxAmount,
        total,
        // Store credit applied at checkout, and what's left for the gateway.
        storeCreditUsed: storeCreditApplied,
        amountPayable,
        // A fully store-credit order needs no further payment, so it is "paid"
        // via store credit; otherwise the chosen method settles the remainder.
        paymentMethod: fullyCovered ? "store_credit" : paymentMethod,
        paymentStatus: fullyCovered ? "paid" : paymentMethod === "cod" ? "pending" : "paid",
        fulfillmentStatus: "unfulfilled",
        shippingStatus: "pending",
        trackingNumber: null,
        notes: "",
      };

      const result = await createOrder(orderData);
      if (result.success) {
        setOrderPlaced(result.order);
        clearCart({ silent: true });
        const orderNum = result.order.orderNumber || result.order.id;
        navigate(`/order-confirmation/${orderNum}`);
      }
    } catch (e) {
      console.error("Order error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (addressErrors[name]) setAddressErrors((prev) => ({ ...prev, [name]: "" }));
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.statePanel}>
            <span className={styles.stateIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor"
                strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2.5 3h2.2l2.1 12.3a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" />
              </svg>
            </span>
            <h2 className={styles.stateTitle}>Your cart is empty</h2>
            <p className={styles.stateText}>
              Add a few considered pieces to your cart, then return here to complete checkout.
            </p>
            <Link to="/products" className={styles.btnPrimary}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const reviewAddress = useExistingAddress || shippingAddress;
  const selectedPaymentOption = PAYMENT_OPTIONS.find((pm) => pm.id === paymentMethod);

  // Calm vertical fade between steps; collapses to a quiet opacity cross-fade
  // (no transform) when the user prefers reduced motion.
  const stepMotion = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 },
    transition: { duration: reduceMotion ? 0 : 0.4, ease: MOTION_EASE },
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Breadcrumb items={[{ label: "Checkout" }]} />

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Secure checkout</p>
          <h1 className={styles.pageTitle}>Complete your order</h1>
        </header>

        {/* Progress stepper */}
        <ol className={styles.stepper} aria-label="Checkout progress">
          {STEPS.map((label, i) => {
            const isComplete = i < step;
            const isCurrent = i === step;
            return (
              <li
                key={label}
                className={`${styles.stepperItem} ${isComplete ? styles.stepComplete : ""} ${isCurrent ? styles.stepCurrent : ""}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className={styles.stepMarker} aria-hidden="true">
                  {isComplete ? <CheckMark size={14} /> : i + 1}
                </span>
                <span className={styles.stepName}>{label}</span>
              </li>
            );
          })}
        </ol>

        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.main}>
            <AnimatePresence mode="wait">
              {/* Step 1: Cart Review */}
              {step === 0 && (
                <motion.div key="cart" {...stepMotion}>
                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>Your cart</h2>
                    <span className={styles.sectionCount}>{getCartItemCount()} {getCartItemCount() === 1 ? "item" : "items"}</span>
                  </div>

                  <div className={styles.lineItems}>
                    {cartItems.map((item) => (
                      <div key={item.id} className={styles.lineItem}>
                        <div className={styles.lineThumb}>
                          <img src={item.image || PLACEHOLDER_IMG} alt={item.name} onError={onImageError} />
                        </div>
                        <div className={styles.lineInfo}>
                          <h4 className={styles.lineName}>{item.name}</h4>
                          {item.variantName && <p className={styles.lineVariant}>{item.variantName}</p>}
                          <p className={styles.linePrice}>{formatCurrency(item.price)} each</p>
                        </div>
                        <div className={styles.quantityControl}>
                          <button type="button" className={styles.quantityBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                          <span className={styles.quantityValue}>{item.quantity}</span>
                          <button type="button" className={styles.quantityBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                        </div>
                        <div className={styles.lineTotal}>{formatCurrency(item.price * item.quantity)}</div>
                        <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name} from cart`}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className={styles.couponSection}>
                    <h3 className={styles.blockTitle}>Have a coupon?</h3>
                    {couponApplied ? (
                      <div className={styles.couponApplied}>
                        <span className={styles.couponAppliedText}>
                          <CheckMark size={15} />
                          <span>
                            <strong>{couponApplied.code}</strong> applied (−{formatCurrency(couponDiscount)})
                            {couponCapped && (
                              <em className={styles.couponCapNote}> · capped at max discount {formatCurrency(couponApplied.maxDiscount)}</em>
                            )}
                          </span>
                        </span>
                        <button type="button" className={styles.couponRemove} onClick={removeCoupon}>Remove</button>
                      </div>
                    ) : (
                      <div className={styles.couponForm}>
                        <input
                          type="text"
                          className={styles.couponInput}
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        />
                        <button type="button" className={styles.couponApply} onClick={applyCoupon}>Apply</button>
                      </div>
                    )}
                    {couponError && <p className={styles.fieldError}>{couponError}</p>}
                  </div>

                  {!isAuthenticated && (
                    <div className={styles.loginPrompt}>
                      <p>Please sign in to continue with checkout.</p>
                      <button type="button" className={styles.btnSecondary} onClick={() => openAuthModal("login")}>
                        Log in / Sign up
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Shipping */}
              {step === 1 && (
                <motion.div key="shipping" {...stepMotion}>
                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>Shipping address</h2>
                  </div>

                  {user?.addresses?.length > 0 && (
                    <div className={styles.savedAddresses}>
                      {user.addresses.map((addr, i) => {
                        const selected = useExistingAddress?.id === addr.id;
                        return (
                          <label key={i} className={`${styles.selectCard} ${selected ? styles.selectCardActive : ""}`}>
                            <input type="radio" name="savedAddress" className={styles.radio} checked={selected}
                              onChange={() => { setUseExistingAddress(addr); setAddressErrors({}); }} />
                            <span className={styles.selectBody}>
                              <span className={styles.selectTopRow}>
                                <strong className={styles.selectTitle}>{addr.label || "Address"}</strong>
                                {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                              </span>
                              <span className={styles.selectMeta}>{addr.firstName} {addr.lastName}, {addr.addressLine1}, {addr.city}, {addr.state} − {addr.postalCode}</span>
                              <span className={styles.selectMeta}>{addr.phone}</span>
                            </span>
                          </label>
                        );
                      })}
                      <button
                        type="button"
                        className={`${styles.addAddressBtn} ${!useExistingAddress ? styles.addAddressActive : ""}`}
                        onClick={() => setUseExistingAddress(null)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add a new address
                      </button>
                    </div>
                  )}

                  {!useExistingAddress && (
                    <div className={styles.addressForm}>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>First name *</label>
                          <input type="text" name="firstName" value={shippingAddress.firstName} onChange={handleAddressChange} className={`${styles.input} ${addressErrors.firstName ? styles.inputError : ""}`} />
                          {addressErrors.firstName && <span className={styles.fieldError}>{addressErrors.firstName}</span>}
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Last name *</label>
                          <input type="text" name="lastName" value={shippingAddress.lastName} onChange={handleAddressChange} className={`${styles.input} ${addressErrors.lastName ? styles.inputError : ""}`} />
                          {addressErrors.lastName && <span className={styles.fieldError}>{addressErrors.lastName}</span>}
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Phone *</label>
                        <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} placeholder="+91 9876543210" className={`${styles.input} ${addressErrors.phone ? styles.inputError : ""}`} />
                        {addressErrors.phone && <span className={styles.fieldError}>{addressErrors.phone}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Address line 1 *</label>
                        <input type="text" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleAddressChange} placeholder="House / Flat No., Building, Street" className={`${styles.input} ${addressErrors.addressLine1 ? styles.inputError : ""}`} />
                        {addressErrors.addressLine1 && <span className={styles.fieldError}>{addressErrors.addressLine1}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Address line 2</label>
                        <input type="text" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleAddressChange} placeholder="Landmark, Area (optional)" className={styles.input} />
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>City *</label>
                          <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} className={`${styles.input} ${addressErrors.city ? styles.inputError : ""}`} />
                          {addressErrors.city && <span className={styles.fieldError}>{addressErrors.city}</span>}
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>State *</label>
                          <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} className={`${styles.input} ${addressErrors.state ? styles.inputError : ""}`} />
                          {addressErrors.state && <span className={styles.fieldError}>{addressErrors.state}</span>}
                        </div>
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Postal code *</label>
                          <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} className={`${styles.input} ${addressErrors.postalCode ? styles.inputError : ""}`} />
                          {addressErrors.postalCode && <span className={styles.fieldError}>{addressErrors.postalCode}</span>}
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Country</label>
                          <input type="text" value={shippingAddress.country} readOnly className={`${styles.input} ${styles.readOnly}`} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Method */}
                  <h3 className={styles.subTitle}>Shipping method</h3>
                  <div className={styles.optionList}>
                    {shippingMethods.map((method) => {
                      const isFree = method.rateType === "free" || (method.freeAbove && subtotal >= method.freeAbove);
                      const selected = selectedShipping?.id === method.id;
                      return (
                        <label key={method.id} className={`${styles.selectCard} ${selected ? styles.selectCardActive : ""}`}>
                          <input type="radio" name="shipping" className={styles.radio} checked={selected} onChange={() => { setSelectedShipping(method); setShippingError(""); }} />
                          <span className={styles.selectBody}>
                            <strong className={styles.selectTitle}>{method.name}</strong>
                            {method.description && <span className={styles.selectMeta}>{method.description}</span>}
                          </span>
                          <span className={`${styles.optionPrice} ${isFree ? styles.optionFree : ""}`}>{isFree ? "Free" : formatCurrency(method.flatRate)}</span>
                        </label>
                      );
                    })}
                    {shippingMethods.length === 0 && (
                      <p className={styles.emptyNote}>No shipping methods available right now. Please try again later.</p>
                    )}
                  </div>
                  {shippingError && <p className={styles.fieldError}>{shippingError}</p>}
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 2 && (
                <motion.div key="payment" {...stepMotion}>
                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>Payment</h2>
                  </div>

                  {/* Store credit */}
                  {walletBalance > 0 && (
                    <div className={styles.storeCredit}>
                      <div className={styles.storeCreditHeader}>
                        <div className={styles.storeCreditInfo}>
                          <span className={styles.storeCreditIcon} aria-hidden="true"><WalletGlyph /></span>
                          <div>
                            <h3 className={styles.blockTitle}>Store credit</h3>
                            <p className={styles.storeCreditBalance}>
                              Available balance <strong>{formatCurrency(walletBalance)}</strong>
                            </p>
                          </div>
                        </div>
                        <label className={styles.storeCreditToggle}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={applyStoreCredit}
                            onChange={(e) => {
                              const on = e.target.checked;
                              setApplyStoreCredit(on);
                              setCreditAmount(on ? maxApplicableCredit : 0);
                            }}
                          />
                          <span>Apply to this order</span>
                        </label>
                      </div>

                      {applyStoreCredit && (
                        <div className={styles.storeCreditApply}>
                          <div className={styles.storeCreditAmountRow}>
                            <label className={styles.label}>Amount to apply</label>
                            <div className={styles.storeCreditInputWrap}>
                              <span className={styles.storeCreditCurrency}>₹</span>
                              <input
                                type="number"
                                min="0"
                                max={maxApplicableCredit}
                                value={creditAmount}
                                onChange={(e) => {
                                  const n = Number(e.target.value);
                                  setCreditAmount(Number.isFinite(n) ? Math.max(0, n) : 0);
                                }}
                              />
                              <button type="button" onClick={() => setCreditAmount(maxApplicableCredit)}>
                                Use max
                              </button>
                            </div>
                          </div>
                          <div className={styles.storeCreditSummaryRow}>
                            <span>Store credit applied</span>
                            <span className={styles.storeCreditAppliedAmt}>−{formatCurrency(storeCreditApplied)}</span>
                          </div>
                          <div className={`${styles.storeCreditSummaryRow} ${styles.storeCreditPayableRow}`}>
                            <span>Remaining to pay</span>
                            <span className={styles.storeCreditPayable}>{formatCurrency(amountPayable)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {fullyCovered && (
                    <div className={styles.fullyCoveredNote}>
                      <CheckMark size={16} /> Your store credit covers this order in full — no further payment needed.
                    </div>
                  )}

                  {!fullyCovered && (<>
                    <div className={styles.optionList}>
                      {PAYMENT_OPTIONS.map((pm) => {
                        const isCod = pm.id === "cod";
                        const isDisabled = isCod && !codAvailable;
                        const codHint = !codEnabled
                          ? "Currently unavailable"
                          : `Available for orders ${codMinOrder > 0 ? `from ${formatCurrency(codMinOrder)} ` : ""}up to ${formatCurrency(codMaxOrder ?? 0)}`;
                        const selected = paymentMethod === pm.id;
                        return (
                          <label key={pm.id} className={`${styles.selectCard} ${selected ? styles.selectCardActive : ""} ${isDisabled ? styles.selectCardDisabled : ""}`}>
                            <input type="radio" name="payment" className={styles.radio} value={pm.id} checked={selected} disabled={isDisabled} onChange={() => setPaymentMethod(pm.id)} />
                            <span className={styles.paymentIcon} aria-hidden="true">{PAYMENT_GLYPHS[pm.id]}</span>
                            <span className={styles.selectBody}>
                              <strong className={styles.selectTitle}>{pm.label}</strong>
                              <span className={styles.selectMeta}>{isDisabled ? codHint : pm.desc}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {paymentMethod === "card" && (
                      <div className={styles.paymentForm}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Card number</label>
                          <input type="text" className={styles.input} placeholder="1234 5678 9012 3456" maxLength={19} />
                        </div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}><label className={styles.label}>Expiry</label><input type="text" className={styles.input} placeholder="MM/YY" maxLength={5} /></div>
                          <div className={styles.formGroup}><label className={styles.label}>CVV</label><input type="password" className={styles.input} placeholder="•••" maxLength={4} /></div>
                        </div>
                        <div className={styles.formGroup}><label className={styles.label}>Name on card</label><input type="text" className={styles.input} placeholder="Full name" /></div>
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div className={styles.paymentForm}>
                        <div className={styles.formGroup}><label className={styles.label}>UPI ID</label><input type="text" className={styles.input} placeholder="name@upi" /></div>
                      </div>
                    )}

                    {paymentMethod === "net_banking" && (
                      <div className={styles.paymentForm}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Select bank</label>
                          <select className={styles.input}>
                            <option>State Bank of India</option>
                            <option>HDFC Bank</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                            <option>Punjab National Bank</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className={styles.codInfo}>
                        <p>
                          Pay with cash when your order is delivered. Available for orders
                          {codMinOrder > 0 ? ` from ${formatCurrency(codMinOrder)}` : ""}
                          {codMaxOrder != null ? ` up to ${formatCurrency(codMaxOrder)}` : ""}.
                        </p>
                      </div>
                    )}
                  </>)}
                </motion.div>
              )}

              {/* Step 4: Review & Confirm */}
              {step === 3 && (
                <motion.div key="review" {...stepMotion}>
                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>Review your order</h2>
                  </div>

                  <div className={styles.reviewItems}>
                    {cartItems.map((item) => (
                      <div key={item.id} className={styles.reviewItem}>
                        <div className={styles.reviewThumb}>
                          <img src={item.image || PLACEHOLDER_IMG} alt={item.name} onError={onImageError} />
                        </div>
                        <div className={styles.lineInfo}>
                          <h4 className={styles.lineName}>{item.name}</h4>
                          {item.variantName && <p className={styles.lineVariant}>{item.variantName}</p>}
                          <p className={styles.linePrice}>Qty {item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                        <div className={styles.lineTotal}>{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewBlock}>
                      <div className={styles.reviewBlockHeader}>
                        <h3 className={styles.reviewBlockTitle}>Deliver to</h3>
                        <button type="button" className={styles.editLink} onClick={() => setStep(1)}>Edit</button>
                      </div>
                      <p className={styles.reviewName}>{reviewAddress.firstName} {reviewAddress.lastName}</p>
                      <p className={styles.reviewMeta}>{reviewAddress.addressLine1}{reviewAddress.addressLine2 ? `, ${reviewAddress.addressLine2}` : ""}</p>
                      <p className={styles.reviewMeta}>{reviewAddress.city}, {reviewAddress.state} − {reviewAddress.postalCode}</p>
                      <p className={styles.reviewMeta}>{reviewAddress.country}</p>
                      <p className={styles.reviewMeta}>{reviewAddress.phone}</p>
                    </div>

                    <div className={styles.reviewBlock}>
                      <div className={styles.reviewBlockHeader}>
                        <h3 className={styles.reviewBlockTitle}>Shipping method</h3>
                        <button type="button" className={styles.editLink} onClick={() => setStep(1)}>Edit</button>
                      </div>
                      <p className={styles.reviewName}>{selectedShipping?.name}</p>
                      {selectedShipping?.description && <p className={styles.reviewMeta}>{selectedShipping.description}</p>}
                      <p className={`${styles.reviewCost} ${shippingCost === 0 ? styles.optionFree : ""}`}>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</p>
                    </div>

                    <div className={styles.reviewBlock}>
                      <div className={styles.reviewBlockHeader}>
                        <h3 className={styles.reviewBlockTitle}>Payment</h3>
                        <button type="button" className={styles.editLink} onClick={() => setStep(2)}>Edit</button>
                      </div>
                      {fullyCovered ? (
                        <>
                          <p className={styles.reviewName}><span className={styles.reviewPayIcon}><WalletGlyph size={18} /></span> Store credit</p>
                          <p className={styles.reviewMeta}>Paid in full with store credit ({formatCurrency(storeCreditApplied)}).</p>
                        </>
                      ) : (
                        <>
                          <p className={styles.reviewName}><span className={styles.reviewPayIcon}>{PAYMENT_GLYPHS[paymentMethod]}</span> {selectedPaymentOption?.label}</p>
                          {storeCreditApplied > 0 && (
                            <p className={styles.reviewMeta}>Store credit applied: −{formatCurrency(storeCreditApplied)}</p>
                          )}
                          {paymentMethod === "cod" ? (
                            <p className={styles.reviewMeta}>Pay {formatCurrency(amountPayable)} in cash on delivery.</p>
                          ) : (
                            <p className={styles.reviewMeta}>You will be charged {formatCurrency(amountPayable)}.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className={styles.navButtons}>
              {step > 0 && (
                <button type="button" className={styles.btnBack} onClick={() => setStep(step - 1)} disabled={isProcessing}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  Back
                </button>
              )}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleNext}
                disabled={isProcessing || cartItems.length === 0}
              >
                {isProcessing
                  ? "Processing…"
                  : step === 3
                  ? fullyCovered
                    ? "Place order"
                    : `Place order · ${formatCurrency(amountPayable)}`
                  : step === 0 && !isAuthenticated
                  ? "Log in to continue"
                  : "Continue"}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order summary</h3>
              <div className={styles.summaryItems}>
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <span className={styles.summaryItemName}>{item.name} <span className={styles.summaryItemQty}>× {item.quantity}</span></span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                {cartItems.length > 3 && <p className={styles.moreItems}>+{cartItems.length - 3} more {cartItems.length - 3 === 1 ? "item" : "items"}</p>}
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {couponDiscount > 0 && <div className={`${styles.summaryRow} ${styles.discount}`}><span>Discount ({couponApplied.code})</span><span>−{formatCurrency(couponDiscount)}</span></div>}
              <div className={styles.summaryRow}><span>Shipping</span><span className={shippingCost === 0 ? styles.optionFree : ""}>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span></div>
              <div className={styles.summaryRow}><span>Tax ({taxRatePct}% GST)</span><span>{formatCurrency(taxAmount)}</span></div>
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}><span>Total</span><span>{formatCurrency(total)}</span></div>
              {storeCreditApplied > 0 && (
                <>
                  <div className={`${styles.summaryRow} ${styles.discount}`}><span>Store credit</span><span>−{formatCurrency(storeCreditApplied)}</span></div>
                  <div className={styles.summaryDivider} />
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}><span>Amount payable</span><span>{formatCurrency(amountPayable)}</span></div>
                </>
              )}
            </div>

            <div className={styles.trustRow}>
              <span className={styles.trustItem}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.trustIcon}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                Secure payment
              </span>
              <span className={styles.trustItem}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.trustIcon}><path d="M1 3h13v13H1z" /><path d="M14 8h4l3 3v5h-7" /><circle cx="5.5" cy="18.5" r="1.8" /><circle cx="17.5" cy="18.5" r="1.8" /></svg>
                Fast delivery
              </span>
              <span className={styles.trustItem}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.trustIcon}><path d="M3 7v6a9 9 0 0 0 9 9 9 9 0 0 0 9-9" /><path d="M3 7l4-4M3 7l4 4" /></svg>
                Easy returns
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
