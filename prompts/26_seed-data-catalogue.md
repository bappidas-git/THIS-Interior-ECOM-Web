# THIS Interiors Storefront — Prompt 26: Décor Catalogue & Supporting Seed Data
**Prompt 26 of 30**

## Depends on
**01** (identity), **25** (currency/copy → AED). This is a **content‑only** data prompt.

## Context
THIS Interiors — Dubai luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). In mock mode the storefront + admin read **`db.json`** via json‑server; in production the
same shapes come from a Laravel API. **You may rewrite the seed *content* to household décor, but you
must keep every field name and shape byte‑for‑byte compatible** so the storefront and admin keep
working. Top‑level collections (current counts): `banners(3)`, `users(3)`, `admins(1)`,
`categories(16)`, `products(19)`, `cart(0)`, `orders(11)`, `returns(2)`, `payments(9)`, `refunds(3)`,
`shipping_methods(4)`, `coupons(5)`, `reviews(7)`, `wishlist(3)`, `leads(4)`, `settings(object)`,
`walletTransactions(3)`, `dealsConfig(object)`.

## Objective
Replace the boilerplate's generic catalogue with a cohesive **THIS Interiors home‑décor** dataset —
décor products with categories, variants where sensible, AED prices, SKUs, descriptions and
placeholder imagery, ratings, featured/trending flags, an approved‑reviews set, brand coupons, AED
shipping labels, `dealsConfig`, and brand `settings` — **using the exact existing schema shapes**, so
the whole app stays functional and the redesign shows real décor content.

## Scope — files & areas to touch
- `db.json` — **only**. Rewrite the **content** of `categories`, `products`, `reviews`, `coupons`,
  `shipping_methods`, `banners`, `dealsConfig`, and `settings`. Refresh `users`/`orders`/`payments`/
  `refunds`/`returns`/`walletTransactions`/`wishlist`/`leads` references so they stay internally
  consistent (or leave structurally valid sample rows that point at real new product/category ids).
- Do **not** touch any `src/` code, `api.js`, or the schema/keys. Do **not** change `admins`
  credentials/shape.

## Required content (keep shapes identical)
- **categories (tree):** décor rooms/collections. Parents (root, `parentId: null`) like *Living Room,
  Lighting, Wall & Art, Tabletop, Textiles, Decorative Objects, Mirrors, Planters & Greenery* with
  children (e.g. Lighting → Table Lamps, Floor Lamps, Candles & Holders). **Every category keeps:**
  `id, name, slug (unique, canonical URL), description, image, parentId, isActive, sortOrder,
  showInMainMenu, menuOrder, createdAt, updatedAt`. Set `showInMainMenu`/`menuOrder` so the mega‑menu
  (Prompt 03) groups well.
- **products (~19+):** vases, candle holders, scented candles, wall art, mirrors, cushions & throws,
  table lamps, planters, trays, decorative bowls, sculptures/objet, photo frames, rugs, clocks,
  bookends, ceramics. **Each product keeps every field:** `id, name, slug (unique), sku,
  shortDescription, description, categoryId (→ a real category id), brand, images[] (first = card
  thumb), price, comparePrice, costPrice, stock, lowStockThreshold, weight, dimensions{length,width,
  height}, variants[] , tags[], featured, trending, hot, isActive, rating, totalReviews, metaTitle,
  metaDescription, createdAt, updatedAt`, plus the optional `relatedProductIds[]` and
  `frequentlyBoughtTogetherIds[]` (use them — they drive Related + FBT). Give **some** products real
  `variants` (e.g. colour/finish/size) with `id` unique‑within‑product, `name`, `price`, `stock`,
  `sku`, and (preferred) structured `attributes{}` + optional `swatchHex` for colour swatches; leave
  others `variants: []`. Prices in **AED** magnitudes (consistent with Prompt 25).
- **reviews (approved + a few pending):** keep `id, productId (→ real), userId (or null), userName,
  rating(1–5), title, body, status ("approved" mostly, a couple "pending"), isVerifiedPurchase,
  helpfulCount, optional photos[], createdAt, updatedAt`. These feed the PDP + home carousel (real data
  only).
- **coupons (~5):** brand codes (e.g. `WELCOME10`, `STYLE100`). Keep `id, code, description, type
  ("fixed"|"percentage"), value, minOrderAmount, maxDiscount, usageLimit, usedCount, perUserLimit,
  isActive, expiresAt, createdAt, updatedAt` — AED magnitudes; at least some active + unexpired.
- **shipping_methods (keep 4):** keep `id, name, carrier, description, rateType ("flat"|"free"|…),
  flatRate, freeAbove, estimatedDays, isActive, createdAt`. Re‑base `flatRate`/`freeAbove` to AED;
  the Standard method's `freeAbove` must match `FREE_SHIPPING_THRESHOLD` (Prompt 25). Names/ETAs in
  brand voice (e.g. "Complimentary Standard", "Express").
- **banners (3):** brand hero/banner copy + links to real category slugs; keep `id, title, subtitle,
  cta, link, gradient` (use warm, brand‑appropriate gradient values, not the stock purple).
- **dealsConfig:** keep `enabled, hero{tag,title,subtitle}, timer{enabled,endAt,onExpiry},
  featuredCouponIds[], dealOfTheDayIds[], featuredProductIds[], updatedAt` — point id arrays at real
  new coupon/product ids; brand hero copy.
- **settings:** keep the full nested object (`store, shipping, payment, notifications, seo, social`).
  Set `store.name = "THIS Interiors"`, `tagline`, brand `email/phone/address`, **`currency: "AED"`**,
  **`currencySymbol`** to match `formatCurrency` (Prompt 25), `timezone: "Asia/Dubai"`, sensible
  `taxRate`/`taxIncluded`, `payment.codEnabled`/limits in AED, brand `seo`, and `social` links. Keep
  every key present.

## Functional guardrails (must not break)
- **Schema is frozen.** Keep **every field name, nesting, and type** exactly as today; only change
  values. Adding the already‑optional `relatedProductIds`/`frequentlyBoughtTogetherIds`/
  `variants[].attributes`/`swatchHex`/`reviews[].photos`/`lowStockThreshold` is fine (they're
  additive + backward‑compatible). **Do not add new top‑level collections or remove existing ones.**
- **Referential integrity:** `products.categoryId` → a real `categories.id`; `dealsConfig`/featured ids
  → real ids; `orders.items[].productId`/`variantId`, `userId`, `reviews.productId`, `wishlist`,
  `walletTransactions.userId/orderId` must all resolve. `variants[].id` unique within a product.
  Category `slug` and product `slug` unique (canonical URLs). Don't orphan rows (admin category‑delete
  guards on references).
- Keep `admins` untouched (login must still work). Keep at least one working `users` account for
  testing (you may keep the existing test user's credentials/shape).
- Currency values should be **AED magnitudes** consistent with Prompt 25; `freeAbove` mirrors
  `FREE_SHIPPING_THRESHOLD`. No `src/` or `api.js` changes.

## Implementation notes
- Imagery: use the app's existing fallback approach — Cloudinary/`placehold.co`/placeholder URLs that
  load, with `onImageError` covering failures. **Do not** reproduce THIS Interiors' real copyrighted
  project photos. Tasteful, décor‑appropriate placeholders are fine.
- Validate the JSON (it's one big file) — a syntax slip breaks json‑server. Pretty‑print and lint.
- Keep the dataset cohesive: featured/trending flags, curated `relatedProductIds`/`frequentlyBought
  TogetherIds`, and `dealsConfig` ids should reference each other so Home/PDP/Offers look full.
- After editing, restart json‑server (`npm run server`) so it reloads `db.json`.

## Acceptance criteria
- [ ] `db.json` is valid JSON with **identical top‑level collections + field shapes**; only content
      changed to THIS Interiors décor.
- [ ] Décor categories tree + ~19+ décor products (some with structured variants/swatches), approved
      reviews, brand coupons, AED shipping labels, brand banners, `dealsConfig`, and `settings`
      (currency AED, Dubai brand) all present and internally consistent (no orphan references).
- [ ] The storefront renders décor content end‑to‑end; admin lists/edits the same data without errors;
      `admins` login still works.

## Test & QA
- Restart json‑server; browse Home, mega‑menu, `/products` (filter by décor categories via slug), a
  PDP (variants/swatches, related, FBT, reviews), Special Offers (coupons/deals from config). Confirm
  AED prices everywhere.
- Place a test order end‑to‑end (coupon + store credit if available) → confirmation + records in
  `/admin → Orders/Payments`. Confirm a seeded approved review shows on its PDP and the home carousel.
- In `/admin`: Products/Categories/Coupons/Reviews/Settings/Special Offers all load + edit the new
  data; try deleting a referenced category (blocked) to confirm integrity. No console/JSON errors.
