# THIS Interiors Storefront — Prompt 12: Product Detail — Gallery & Buy Box
**Prompt 12 of 30**

## Depends on
**01** (tokens), **02** (primitives), **09** (ProductCard for related rows in 13). The mobile sticky
bar + cart drawer are **14**; PDP secondary content is **13**.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/ProductDetails/ProductDetails.js` (+ `.module.css`) owns the PDP data and wires
the shared `src/components/storefront/*` library. Route: **`/products/:slug`** (slug canonical; resolve
`getBySlug` first, then `getById`, then **redirect** a legacy numeric id to its slug). Top half:
`Breadcrumb` (Home › Category › Product) and a two‑column layout — `ProductGallery` (left) and a **buy
box** (right): brand, name, clickable `SocialProof` (rating+count), `PriceBlock`, SKU/short
description, **`VariantSelector`** (visible swatches), `QuantityStepper`, stock status, **Add to
Cart** + **Buy Now** + Wishlist, `TrustBadges`, `DeliveryReturnsInfo`. These components mostly read
`--sf-*` tokens already. The cart line id is `` `${productId}-${variantId}` `` (or bare id);
Buy Now sets `openDrawer:false` + navigates `/checkout`. Settings/shipping feed the trust/delivery
panels via `apiService.settings` + `apiService.shipping`.

## Objective
Redesign the PDP's **gallery + buy box** into a gallery‑grade editorial product page: a large, calm
image gallery with zoom, a refined title/price block, elegant variant swatches and quantity control,
clear primary/secondary CTAs, and quiet trust + delivery info — while keeping variant logic, stock
derivation, the cart/Buy‑Now wiring, and slug routing exactly intact.

## Scope — files & areas to touch
- `src/pages/ProductDetails/ProductDetails.js` — layout/composition + classes; **keep** data loading,
  slug/id resolution + redirect, variant/stock derivation, cart wiring.
- `src/pages/ProductDetails/ProductDetails.module.css` — restyle to tokens.
- Shared components (presentation/token polish only, keep props/contracts):
  `src/components/storefront/ProductGallery.*`, `VariantSelector.*`, `QuantityStepper.*`,
  `PriceBlock.*`, `SocialProof.*`, `TrustBadges.*`, `DeliveryReturnsInfo.*` — clean any stray `#fff`
  hardcodes; tune spacing/typography to the editorial system.

## Brand & design requirements
- **Gallery:** large image‑forward gallery with a calm thumbnail rail (side on desktop, stacked on
  mobile), gentle desktop hover‑zoom (keep `STOREFRONT_CONFIG.gallery.zoom`), graceful single‑image
  handling, lazy‑loaded with alt text. Hairline framing, generous whitespace.
- **Buy box:** serif product name (italic accent allowed), brand in muted caps, `SocialProof`
  (clickable → reviews tab), `PriceBlock` (compare/savings honest). Variant swatches as **visible
  tiles/colour chips** (never dropdowns), grouped per attribute; real per‑variant price + availability;
  out‑of‑stock/impossible combos handled by the existing `variantUtils`. `QuantityStepper` clamped to
  stock. Honest "Only N left" only from real stock + the product's own `lowStockThreshold`.
- **CTAs:** primary brass **Add to Cart**, secondary **Buy Now**, quiet **Wishlist** heart/toggle —
  conventional copy, strong hierarchy, consistent storefront‑wide.
- **Trust + delivery:** `TrustBadges` + `DeliveryReturnsInfo` rendered from **live** `settings`/
  `shipping` data, restrained and upfront. No fabricated urgency.
- **Motion:** slow reveals; reduced‑motion safe.

## Functional guardrails (must not break)
- **Slug routing:** `/products/:slug` canonical; keep the `getBySlug → getById → redirect‑to‑slug`
  resolution and the canonical URL behaviour.
- **Variant + stock + cart:** keep variant selection, per‑variant price/stock, stock clamping, the cart
  line id `${productId}-${variantId}` (bare id when no variant) via `buildCartItem`/`useCart`, the
  **Buy Now** path (`openDrawer:false` + navigate `/checkout`), and wishlist toggle. Add‑to‑Cart opens
  the `CartDrawer` (restyled in 14) by default.
- Keep `apiService.settings` + `apiService.shipping` reads feeding trust/delivery; keep
  `getRelated`/`getFrequentlyBoughtTogether` reads for the secondary section (13).
- Keep "recently viewed" persistence if present (localStorage `recentlyViewed`).
- **Do not change** the shared components' props/exports (`storefront/index.js`) or `variantUtils`
  signatures. Tokenize colours; admin untouched; no schema changes.

## Implementation notes
- Most shared components already consume `--sf-*`, so they'll inherit Prompt 01's palette — your job is
  composition, spacing, type, and removing stray hardcodes. Don't fork them.
- Keep the buy box's first‑screen hierarchy: name → social proof → price → variants → CTA (UX
  guideline A).
- Ensure keyboard access on swatches (ARIA radiogroup is already there) and the gallery (arrow keys).

## Acceptance criteria
- [ ] PDP top half reads as a gallery‑grade editorial product page (large gallery + zoom, refined buy
      box) — tokenized, no stray `#fff`/hex.
- [ ] Variant swatches (visible, grouped), quantity clamping, stock/low‑stock honesty, Add to Cart
      (opens drawer), Buy Now (→ checkout), and Wishlist all work; slug routing + legacy‑id redirect
      intact.
- [ ] `TrustBadges`/`DeliveryReturnsInfo` render from live settings/shipping; shared component props
      unchanged.
- [ ] Responsive (thumb rail stacks on mobile), reduced‑motion safe, keyboard accessible.

## Test & QA
- Open a product by slug and by legacy numeric id (confirm redirect to slug). Switch variants → price/
  stock/SKU update; set quantity to stock max; add to cart → drawer opens + line merges; Buy Now →
  `/checkout` with the item. Toggle wishlist.
- Single‑image product → gallery degrades gracefully; out‑of‑stock variant → disabled add. Trust/
  delivery reflect `/admin → Settings`/`Shipping` values.
- Reduced‑motion; dark mode; mobile/tablet/desktop; `/admin` untouched.
