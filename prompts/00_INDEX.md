# THIS Interiors Storefront — Build Prompt Index (00)

This folder contains **30 sequential build prompts** that, run in order, transform the
existing React e‑commerce boilerplate into the **THIS Interiors** editorial luxury home‑décor
storefront — a complete visual redesign — while keeping **every existing feature, flow, and the
dual‑mode API/data contract working exactly as today**, and leaving the **admin panel untouched
(except a single logo swap)**.

> **How to use:** Run the prompts **one at a time, in numeric order**, each in its own session.
> Paste the file's contents as the task. Prompt 01 establishes the design tokens that every later
> prompt consumes, so **do not skip ahead**. Each prompt is self‑contained and restates the shared
> guardrails below.

---

## Stack reality (true for every prompt)
- **CRA / React 18**, MUI 5, framer‑motion 10, CSS Modules, SweetAlert2, `@iconify/react`.
- **Design tokens:** `src/theme/storefront-tokens.css` (the `--sf-*` CSS custom properties; light in
  `:root`, dark under `body.dark`), JS mirror + content config in `src/theme/tokens.js`, the MUI
  palette in `src/theme/colors.js`, toggled by `src/context/ThemeContext.js` (adds/removes
  `body.dark`). **Reality check:** many components/pages currently **bypass the tokens with
  hardcoded hex** (e.g. `#667eea`/`#764ba2` gradients, `#232f3e`, `#1e293b`). Part of this work is
  migrating those surfaces onto the new tokens.
- **Data is API‑driven** through `src/services/api.js` (`apiService.*`). It is **dual‑mode**: in
  mock mode (`IS_MOCK_API`, json‑server + `db.json`) it returns rows directly; in production it
  talks to a Laravel API returning `{ success, data, meta }` and the code unwraps via
  `extractData` / `extractMeta`. **Never change call signatures, the unwrap contract, or the
  `db.json` schema shapes.**
- **Money** is rendered with `formatCurrency(amount, currency)` (`src/utils/helpers.js`); today the
  store currency is `INR` (`₹`). Currency direction (AED) is handled only in Prompts 25–26.
- **Routing:** `src/App.js` — storefront under `/*`, admin under `/admin/*`. Product detail is
  slug‑based (`/products/:slug`, legacy numeric id redirects to slug). Category filtering uses a
  canonical **slug** URL scheme (`/products?category=<slug>`), built by `src/utils/categories.js`.

## Brand brief (condensed — embedded in design prompts)
**THIS Interiors** — Dubai's premier luxury interior‑design studio, here extended into a curated
home‑décor boutique selling **small décor items** (vases, candle holders, scented candles, wall
art, mirrors, cushions & throws, table lamps, planters, trays, decorative bowls, sculptures/objet,
photo frames, rugs, clocks, bookends, ceramics). Aesthetic: **editorial, warm‑minimalist**,
gallery/boutique calm — generous whitespace, image‑forward, hairline rules, restrained palette
(warm neutrals: off‑white/cream/sand/greige; deep charcoal/near‑black for text & dark sections; one
restrained **brass/bronze/taupe** accent used sparingly). Voice: refined, warm, aspirational —
anchor lines *"Crafting homes with a soul,"* *"Bringing beauty to every corner,"* *"Where style
meets comfort, every corner tells a story."* In display headings, set **key accent nouns in italic**
(e.g. "Bringing beauty to *every corner*"). Typography direction: a **high‑contrast editorial serif**
for display (Cormorant/Playfair/Canela‑style) + a **clean humanist sans** for body/UI
(Inter/Hanken‑style). Motion: subtle, slow, elegant; always honour `prefers-reduced-motion`.

## Logos (use exactly these)
- **Light logo** (for light backgrounds — headers on light surfaces):
  `https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO_fazfcq.png`
- **White logo** (for dark backgrounds — dark headers/footers/overlays):
  `https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO-WHITE_vdltz8.png`
- Derive the **favicon** and any small mark from the **light** logo. Use the correct logo per
  background everywhere.

---

## Shared Guardrails (every prompt restates a tailored subset)
1. **Preserve all functionality & the data/API contract.** Stay **API‑driven** through dual‑mode
   `api.js` + `db.json`. Do **not** alter `apiService.*` call signatures, response handling, the
   `extractData`/`extractMeta` `{success,data,meta}` Laravel‑branch contract, or the `db.json`
   schema (only Prompt 26 changes **seed content**, never shapes). Never break cart, checkout
   money‑math, auth, wishlist sync, store credit, coupons, reviews moderation, deals config, slug
   routing, or category navigation. **Visual/UX changes only.**
2. **Reuse & extend the theme token system** (`storefront-tokens.css` `--sf-*`, `tokens.js`,
   `colors.js`, `ThemeContext`). Define brand colour/type/spacing/radii/shadow/motion as **tokens**
   and consume `var(--sf-*)` everywhere. **No scattered hardcoded hex/fonts in components.**
3. **Do NOT modify the admin panel** (`src/pages/Admin/*`, `src/components/AdminLayout/*`,
   `src/theme/adminTheme.js`) except the single dedicated admin‑logo‑swap prompt (29). Admin must
   stay fully functional.
4. **Brand consistency + minimalism** on every surface; correct light/dark logo per background. The
   structure must follow the editorial luxury DTC language and be **clearly distinct** from the
   boilerplate's stock marketplace layout — not a recolour.
5. **Responsive** (mobile/tablet/desktop) and **accessible** (semantic HTML, keyboard nav, visible
   focus, sufficient contrast, alt text, `prefers-reduced-motion`).
6. **No fabricated trust signals** — ratings/reviews/social proof render only from seeded/real data,
   with honest empty states.
7. **Test before done** and confirm **no regressions** to existing flows or the admin.

> **Cart/line‑item contract** (do not break): a cart line id is `` `${productId}-${variantId}` ``
> (bare `productId` when no variant), built by `buildCartItem`/`CartContext.lineKey`. Quick‑add from
> any card must merge with PDP adds. **Checkout math:** `total = subtotal − discount + shipping +
> tax`; **store credit is applied last** against the grand total, producing `amountPayable`.

---

## The 30 prompts (ordered, with dependencies)

### A. Foundation & design system
| # | File | Delivers | Depends on |
|---|------|----------|-----------|
| 01 | `01_design-system-and-tokens.md` | Finalize brand palette + typography (sample logos + live site), spacing/radii/shadow/motion scales, load fonts, wire logos + favicon, light/dark surface tokens in `storefront-tokens.css`/`tokens.js`/`colors.js`/`ThemeContext`. | — |
| 02 | `02_global-ui-primitives.md` | Restyle shared primitives (buttons, inputs/selects, badges/chips, cards/shells, tabs, SweetAlert toasts, loaders/skeletons, Breadcrumb, ErrorBoundary) to the new tokens. | 01 |
| 03 | `03_header-mega-menu.md` | Rebuild `Header` into a structured **mega‑menu** (prominent/centred logo; grouped flyouts + feature panel); keep dynamic admin‑managed categories + canonical URLs + cart/wishlist/account/search/deals wiring. | 01, 02 |
| 04 | `04_footer-newsletter-trust.md` | Brand‑restyle `Footer` + `Newsletter` + trust bar + payment marks; white logo, brand contact/social. | 01, 02 |
| 05 | `05_mobile-nav-drawers.md` | Restyle the mobile shells: `BottomNav`, `SidebarMenu`, `BottomDrawer`, drawer scaffolding; responsive + correct logo. | 01, 02, 03 |

### B. Home & discovery
| # | File | Delivers | Depends on |
|---|------|----------|-----------|
| 06 | `06_home-hero.md` | Cinematic full‑bleed **image/video‑capable** hero (italic‑accent headline, refined CTAs, slim assurance strip, scroll‑reveal) — rebuilds the `HeroSection`/Home hero. | 01, 02, 03 |
| 07 | `07_home-storytelling.md` | Alternating editorial image/text blocks, "Shop by Room/Category" image tiles, Featured/Curated collections, "Style the Look" — restyle `FeaturedProducts` usage; airy. | 01, 02, 06, 09 |
| 08 | `08_home-social-proof-and-cta.md` | Honest "As featured in / Trusted by" strip, testimonial/review **carousel** (seeded data only), a "Styling in 3 steps / Our promise" stepper, large closing brand CTA + newsletter above the dark footer. | 01, 02, 04, 07 |
| 09 | `09_product-card.md` | The signature `storefront/ProductCard` — image‑forward, minimal, refined hover + quick‑add; keep props/cart/wishlist contract. | 01, 02 |
| 10 | `10_products-listing.md` | `Products` page — refined filters, sort, grid/list, pagination, breadcrumbs, airy; keep category/slug filtering + URL scheme. | 01, 02, 09 |
| 11 | `11_search-overlay.md` | `SearchModal` overlay + empty/no‑results — brand restyle; keep relevance scoring, recent/trending, category chips, cache. | 01, 02, 09 |

### C. Product & conversion
| # | File | Delivers | Depends on |
|---|------|----------|-----------|
| 12 | `12_pdp-buybox-and-gallery.md` | `ProductDetails` top half: `ProductGallery` + zoom, title/price (`PriceBlock`/`SocialProof`), `VariantSelector`, `QuantityStepper`, Add‑to‑Cart/Buy‑Now, `TrustBadges`, `DeliveryReturnsInfo`; keep variant/cart logic + slug routing. | 01, 02, 09 |
| 13 | `13_pdp-secondary.md` | PDP tabs (description/specs), `ReviewsSection`, `FrequentlyBoughtTogether`, `RelatedProducts`, `ReviewModal`; keep purchase‑gated, approved‑only reviews. | 01, 02, 12 |
| 14 | `14_cart-drawer-and-sticky-bar.md` | Premium sticky `CartDrawer` (free‑shipping progress, trust badges, line items, subtotal, checkout CTA) + mobile `AddToCartBar`; keep all cart logic + money math. | 01, 02, 03 |
| 15 | `15_wishlist.md` | `Wishlist` page — brand restyle; keep guest→sync logic + sort + move‑to‑cart. | 01, 02, 09 |
| 16 | `16_special-offers.md` | `SpecialOffers` / Today's Deals — keep admin‑managed `dealsConfig` (hero copy, countdown, featured coupons/products). | 01, 02, 09 |

### D. Account & checkout
| # | File | Delivers | Depends on |
|---|------|----------|-----------|
| 17 | `17_auth-modal.md` | `AuthModal` (login/signup) — keep flows + Remember‑me + password strength + validation. | 01, 02 |
| 18 | `18_account-shell-and-profile.md` | `Profile` shell + My Profile tab — keep update logic + tab nav. | 01, 02 |
| 19 | `19_addresses-and-password.md` | My Addresses + Change Password tabs — keep address CRUD/default logic + password rules. | 01, 02, 18 |
| 20 | `20_store-credit-wallet.md` | Store‑credit wallet tab — keep ledger/balance read. | 01, 02, 18 |
| 21 | `21_order-history.md` | `OrderHistory` + order cards (cancel / return‑exchange / track / review) — keep order lifecycle actions + review gating. | 01, 02, 13 |
| 22 | `22_checkout.md` | `Checkout` (Cart→Shipping→Payment incl. store credit + COD→Review) + Order Summary — keep money math, store‑credit apply, coupon; restyle stepper/forms. | 01, 02, 14 |
| 23 | `23_order-confirmation.md` | `OrderConfirmation` + invoice block — keep data reads, restyle. | 01, 02, 22 |

### E. Content, copy & data
| # | File | Delivers | Depends on |
|---|------|----------|-----------|
| 24 | `24_static-and-legal-pages.md` | About, Help Center, Support, FAQ, Privacy, Terms, Cookie, Refund — brand restyle + brand copy. | 01, 02 |
| 25 | `25_brand-copy-and-currency.md` | Brand copy/microcopy in `constants.js` + document title/favicon/meta + empty/toast/button copy → THIS Interiors voice; add **AED** to the currency map keeping `formatCurrency` working. | 01 |
| 26 | `26_seed-data-catalogue.md` | Rewrite `db.json` **content** to household décor (products, categories tree, featured/trending flags, approved reviews, coupons, shipping labels, `dealsConfig`, `settings`/currency) — **identical field shapes**. | 01, 25 |

### F. Polish & QA
| # | File | Delivers | Depends on |
|---|------|----------|-----------|
| 27 | `27_motion-pass.md` | Restrained, elegant scroll‑reveal & micro‑interactions; reduced‑motion safe. | all visual prompts |
| 28 | `28_responsive-and-a11y.md` | Responsive + accessibility sweep across every storefront surface. | all visual prompts |
| 29 | `29_admin-logo-swap.md` | **Admin logo only** — swap the `LOGO` constant in `AdminLayout.js` + `AdminLogin.js`; change nothing else in admin. | 01 |
| 30 | `30_final-qa-and-parity.md` | Full storefront walkthrough: brand consistency + every feature still works API‑driven; light/dark; perf; QA checklist; verify admin untouched. | all |

---

## Coverage map (route / surface → prompt)
- `/` Home → 06, 07, 08 (+ `HeroSection` 06, `FeaturedProducts` 07, `ProductCard` 09)
- `/products` → 10 · `/products/:slug` → 12, 13
- `/checkout` → 22 · `/order-confirmation/:orderNumber` → 23
- `/orders` → 21 · `/profile` → 18, 19, 20 · `/wishlist` → 15 · `/special-offers` → 16
- `/help` `/support` `/about` `/privacy` `/terms` `/cookies` `/refund` → 24
- `Header` → 03 · `Footer`/`Newsletter` → 04 · `BottomNav`/`SidebarMenu`/`BottomDrawer` → 05
- `CartDrawer` + `AddToCartBar` → 14 · `SearchModal` → 11 · `AuthModal` → 17 · `ReviewModal` → 13
- Shared `storefront/*` commerce components → 09 (card), 12–14 (PDP/cart), inherit tokens from 01–02
- Global primitives + `Breadcrumb` + `ErrorBoundary` → 02
- Tokens/fonts/logo/favicon → 01 · copy/currency → 25 · data → 26
- Admin (untouched except logo) → 29

## Author's notes
- **Design system first.** Every later prompt consumes Prompt 01's tokens; do not introduce new
  raw hex in components — add a token in `storefront-tokens.css` and reference it.
- **Data prompt is content‑only.** Prompt 26 keeps every field name/shape identical so the app and
  admin keep working; it only swaps in décor catalogue content + brand `settings`.
- When unsure about the repo's real structure or the brand's exact values, **verify against the
  actual files / the two logo assets / the live site `thisinteriors.com`** rather than guessing.
