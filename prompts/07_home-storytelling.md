# THIS Interiors Storefront — Prompt 07: Home Storytelling & Curated Discovery
**Prompt 7 of 30**

## Depends on
**01** (tokens), **02** (primitives), **06** (hero), **09** (ProductCard — run 09 first or in tandem;
this section renders product cards).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/Home/Home.js` currently has stock sections after the hero: a flash‑deals
horizontal scroll, a 6‑category grid with counts, a Featured grid (via `FeaturedProducts`), a "50%
OFF" promo banner, a Trending grid, a "Why Choose Us" block (from `WHY_CHOOSE_US` constants), and a
"Recently Viewed" scroll. It loads data via `apiService.products.getFeatured/getTrending` and
`apiService.categories.getAll()`; cards use `buildCartItem`, `useCart`, `useWishlist`, `productPath`.
`FeaturedProducts` (`src/components/FeaturedProducts/FeaturedProducts.js`) is the shared featured grid.

## Objective
Replace the dense stock sections with **curated, editorial discovery** that breathes: alternating
**image/text storytelling blocks**, a **"Shop by Room/Category"** set of large image tiles, one or two
**Featured / Curated Collections** rows, and a **"Style the Look"** curation block — generous
whitespace, large lifestyle imagery, hairline dividers, never dense card grids crammed edge‑to‑edge.

## Scope — files & areas to touch
- `src/pages/Home/Home.js` + `Home.module.css` — recompose the post‑hero sections into the editorial
  layout below; keep the existing data fetches (featured/trending/categories) but present them
  calmly.
- `src/components/FeaturedProducts/FeaturedProducts.js` + `.module.css` — restyle the shared featured
  grid to the editorial card rhythm (or wrap `ProductCard` in an airy row). Keep its props
  (`products`, `title`, `viewAllLink`) and cart/wishlist wiring.
- Reuse `src/components/storefront/ProductCard` (restyled in Prompt 09) for product tiles.
- `src/components/CTASection/CTASection.js` if you use it for an interstitial editorial band (keep its
  `title/subtitle/buttonText/link` props).

## Brand & design requirements
- **Alternating image/text blocks:** full‑width sections where a large lifestyle image sits beside a
  short serif heading (italic accent noun), a sentence of brand copy, and a quiet CTA — alternate the
  image left/right down the page for rhythm. Honest copy only.
- **Shop by Room/Category:** large **image tiles** (not tiny chips) built from the **real category
  tree** (`apiService.categories.getAll()`), each linking to the canonical slug filter
  (`/products?category=<slug>`); serif labels, hairline framing, hover lift. Prefer top‑level
  rooms/collections.
- **Featured / Curated Collections:** an airy row of `ProductCard`s from
  `apiService.products.getFeatured()` (and optionally a second curated/trending row), with a quiet
  "View all" → `/products`. Fewer, larger, well‑spaced cards — not an 8‑up dense grid.
- **"Style the Look":** a curation block pairing a styled room image with the products in it
  (resolved from real product data — e.g. a curated set of product ids or a category), each linking to
  its PDP. Keep it data‑driven and honest (no invented "as seen" claims).
- **Whitespace & dividers:** strong vertical rhythm, hairline rules between movements, restrained type
  scale. Keep "Why Choose Us" only if it fits as a quiet **"Our promise"** band (it can also move to
  Prompt 08's stepper) — avoid duplicating it.

## Functional guardrails (must not break)
- Keep the **data fetches** and their loading/empty states; cards keep **quick‑add** via `buildCartItem`
  + `useCart` (merging by the `${productId}-${variantId}` line key) and **wishlist toggle** via
  `useWishlist`; product links use `productPath` (slug‑aware).
- Category tiles must use the canonical **slug** URL scheme; counts (if shown) must come from real
  data, not invented.
- Preserve "Recently Viewed" behaviour if retained (localStorage `recentlyViewed`), or fold it into a
  calm row — but don't fabricate it.
- Tokenize all colours (kill the stock gradients/`#667eea`). API‑driven; admin untouched.

## Implementation notes
- Reuse the restyled `ProductCard` for every product tile so the card aesthetic is consistent.
- For "Style the Look", resolve products from existing data (a curated id list from a product's
  `relatedProductIds`, a category, or seeded featured ids) — do not hardcode fake products; the décor
  catalogue lands in Prompt 26.
- Lifestyle imagery: brand‑appropriate placeholders (Cloudinary/placeholder + `onImageError`); never
  reproduce THIS Interiors' copyrighted photos.
- Keep sections lazy/efficient; large images should lazy‑load.

## Acceptance criteria
- [ ] Post‑hero Home is recomposed into alternating image/text blocks + Shop by Room tiles + an airy
      Featured/Curated row + a Style‑the‑Look block, with generous whitespace and hairline dividers.
- [ ] Category tiles + product links use real data and the canonical slug/`productPath` URLs;
      quick‑add + wishlist still work.
- [ ] `FeaturedProducts` restyled with props/wiring intact; no dense edge‑to‑edge grids; no stock
      gradients/hex.
- [ ] Reduced‑motion respected; responsive; honest empty states when data is sparse.

## Test & QA
- Load `/`: confirm the editorial sections render in order, images alternate, and everything is airy.
- Click a Shop‑by‑Room tile → correct slug‑filtered `Products`; click a product card → correct PDP;
  quick‑add → cart updates + merges; wishlist heart toggles.
- Empty/sparse data (few featured) → honest layout, no broken grid.
- Responsive across breakpoints; reduced‑motion; dark mode; `/admin` untouched.
