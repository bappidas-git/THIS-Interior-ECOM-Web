// App Info (override via .env — keep the env pattern so each deployment can
// rename without a code change; the default is the brand wordmark).
export const APP_NAME = process.env.REACT_APP_NAME || "THIS Interiors";
export const APP_TAGLINE = "Crafting homes with a soul";
export const APP_DESCRIPTION =
  "From Dubai's interior-design studio — a curated boutique of vases, candles, wall art, mirrors and lamps, chosen to bring beauty to every corner.";

// Routes
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:slug",
  PROFILE: "/profile",
  ORDERS: "/orders",
  ORDER_CONFIRMATION: "/order-confirmation",
  CHECKOUT: "/checkout",
  WISHLIST: "/wishlist",
  SUPPORT: "/support",
  HELP: "/help",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  REFUND: "/refund",
  COOKIES: "/cookies",
  SPECIAL_OFFERS: "/special-offers",
};

// Product flags
export const PRODUCT_FLAGS = {
  FEATURED: "featured",
  TRENDING: "trending",
  HOT: "hot",
  NEW: "new",
  SALE: "sale",
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: "card",
  UPI: "upi",
  COD: "cod",
  WALLET: "wallet",
  NET_BANKING: "net_banking",
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  REFUNDED: "refunded",
};

// Fulfillment statuses
export const FULFILLMENT_STATUS = {
  UNFULFILLED: "unfulfilled",
  PARTIALLY_FULFILLED: "partially_fulfilled",
  FULFILLED: "fulfilled",
  RETURNED: "returned",
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
  REFUNDED: "refunded",
  VOIDED: "voided",
};

// Return statuses
export const RETURN_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  RECEIVED: "received",
  REFUNDED: "refunded",
};

// Return reasons
export const RETURN_REASONS = [
  { value: "defective", label: "Defective / Damaged" },
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "not_as_described", label: "Not As Described" },
  { value: "changed_mind", label: "Changed Mind" },
  { value: "size_fit", label: "Size / Fit Issue" },
  { value: "quality", label: "Quality Not Satisfactory" },
  { value: "other", label: "Other" },
];

// Currencies. AED is the brand (Dubai) currency and the default; the others
// stay supported so `formatCurrency` keeps working for any code. AED's symbol
// is the Latin "AED" — it matches what Intl renders in the en-AE locale and is
// the most broadly readable; swap to "د.إ" if a fully localised glyph is wanted.
export const CURRENCIES = {
  AED: { symbol: "AED", code: "AED", name: "UAE Dirham" },
  INR: { symbol: "₹", code: "INR", name: "Indian Rupee" },
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound" },
};
// Single source of truth for the storefront currency. `formatCurrency`,
// `buildCartItem` and the storefront components all default to this, so the
// whole store renders one currency coherently (mirrored by `settings.store
// .currency = "AED"` on the data side in 26).
export const DEFAULT_CURRENCY = CURRENCIES.AED;

// Shipping
// Single source of truth for the free-shipping threshold, re-based for AED.
// Mirrors the Standard shipping method's `freeAbove` value in db.json (set to
// AED 200 in 26) and is shared by the Header banner and the CartDrawer progress
// bar.
export const FREE_SHIPPING_THRESHOLD = 200;

// Social links (sensible defaults — update per project). The Footer renders an
// icon only for entries with a non-empty URL, so blanking one here hides it
// instead of leaving a dead link.
export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com/thisinteriors",
  // Décor lives on Instagram; Twitter/YouTube are left blank so the Footer
  // hides them rather than linking to an empty handle.
  TWITTER: "",
  INSTAGRAM: "https://instagram.com/thisinteriors",
  YOUTUBE: "",
  WHATSAPP: "https://wa.me/971555538800",
};

// Store contact — Dubai studio identity. Single source so the Header top bar,
// Footer, Help Center and Support page all stay in sync.
export const SUPPORT_EMAIL = "hello@thisinteriors.com";
export const SUPPORT_PHONE = "+971 4 553 8800";
export const SUPPORT_ADDRESS =
  "Building 6, Dubai Design District (d3), Dubai, United Arab Emirates";
export const SUPPORT_HOURS = "Mon – Sat: 10:00 AM – 8:00 PM (GST)";

// Date the legal/policy pages were last reviewed. Single source so the Privacy,
// Terms, Cookie and Refund pages never show contradictory "last updated" dates.
export const POLICY_LAST_UPDATED = "June 1, 2026";

// FAQs
export const FAQ_ITEMS = [
  {
    id: 1,
    question: "How long will my order take to arrive?",
    answer:
      "Across the UAE, standard delivery arrives within 2–4 working days, with next-day delivery available in Dubai and Abu Dhabi. Larger pieces — mirrors, lamps and framed art — are hand-packed with extra care, so they may take a little longer to reach you flawlessly.",
  },
  {
    id: 2,
    question: "What is your return policy?",
    answer:
      "If a piece doesn't feel right at home, you may return it within 14 days of delivery in its original, undamaged condition and packaging. We'll arrange collection and process your refund within 5–7 working days.",
  },
  {
    id: 3,
    question: "Are your pieces authentic?",
    answer:
      "Every piece is chosen by our studio and sourced directly from the maker or their authorised partner. What you see is what arrives — genuine materials and considered craftsmanship, never mass-produced for the sake of it.",
  },
  {
    id: 4,
    question: "How should I care for my pieces?",
    answer:
      "Each order arrives with simple care notes. As a rule: dust ceramics and glass with a soft, dry cloth, keep candles away from draughts, and shield natural materials such as wood and rattan from direct sun. Reach out any time for piece-specific guidance.",
  },
  {
    id: 5,
    question: "Which payment methods do you accept, and is checkout secure?",
    answer:
      "We accept all major cards and cash on delivery across the UAE, with prices shown in AED. Every payment is protected by industry-standard encryption, so your details stay private.",
  },
  {
    id: 6,
    question: "Can you help me style a room?",
    answer:
      "Yes. Behind the boutique is a full interior-design studio. Share your space and we'll suggest pieces that work beautifully together — just reach out to our team and we'll help you compose it.",
  },
];

// Why choose us
export const WHY_CHOOSE_US = [
  {
    id: 1,
    title: "Curated by Our Studio",
    description:
      "Every piece is hand-selected by our Dubai studio — chosen with a gallery eye for form, material and light.",
    icon: "mdi:diamond-stone",
  },
  {
    id: 2,
    title: "Delivered With Care",
    description:
      "Hand-packed and delivered across the UAE, so each piece arrives exactly as it was meant to.",
    icon: "mdi:truck-fast",
  },
  {
    id: 3,
    title: "Fourteen-Day Returns",
    description:
      "Live with a piece for two weeks. If it isn't right, we'll arrange collection and refund.",
    icon: "mdi:backup-restore",
  },
  {
    id: 4,
    title: "Studio Support",
    description:
      "Styling guidance and care advice from our team — long after your order arrives.",
    icon: "mdi:hand-heart-outline",
  },
];

// Framer Motion animation variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  },
  slideDown: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 50, opacity: 0 },
  },
  slideLeft: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  },
  slideRight: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
};

// Breakpoints
export const BREAKPOINTS = {
  XS: 480,
  SM: 768,
  MD: 1024,
  LG: 1280,
  XL: 1440,
};

// Trust badges
export const TRUST_BADGES = [
  "Curated by Our Dubai Studio",
  "14-Day Easy Returns",
  "Secure Checkout · AED",
  "Delivered Across the UAE",
];
