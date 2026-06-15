# THIS Interiors Storefront — Prompt 09: Signature Product Card
**Prompt 9 of 30**

## Depends on
**01** (tokens/fonts), **02** (primitives). Consumed by Home (07), Products (10), Search (11),
Wishlist (15), Special Offers (16), Related/FBT (12–13).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/components/storefront/ProductCard.js` (+ `ProductCard.module.css`) is the **signature,
reused** product tile. Current props: `product` (required), `onAddToCart`, `onToggleWishlist`,
`isWishlisted`, `showAddToCart`. It renders image, brand, name (truncated ~48 chars), `StarRating` +
count (only when reviews exist), `PriceBlock`, an add‑to‑cart button (disabled when out of stock), a
discount badge and a wishlist heart. It already consumes `--sf-*` tokens (a couple of `#fff` left in
`.discountBadge`). The card is exported from `src/components/storefront/index.js`.

## Objective
Redesign the product card into the **signature editorial tile**: image‑forward, minimal, lots of
whitespace, hairline framing, a refined hover with a quiet **quick‑add**, and restrained badges —
while keeping its exact prop contract and the cart/wishlist behaviour every page relies on.

## Brand & design requirements
- **Image‑forward:** a large, calm product image on a `surface`/`surface‑2` ground with a consistent
  aspect ratio; minimal chrome. On hover: a slow image scale/cross‑fade (to a second image if present)
  and a subtle lift — no loud shadows.
- **Quiet metadata:** brand in muted micro‑caps, product name in a refined serif or clean sans
  (consistent with the type system), price via `PriceBlock`. `StarRating` + count only when real
  reviews exist (honest — never a hollow `0.0`).
- **Quick‑add:** a refined "Add to Cart" that appears/*resolves* on hover (desktop) and is always
  reachable on touch; a small wishlist heart in a corner. Disabled/"Out of stock" state when stock is
  0. Use the brass accent sparingly.
- **Badges:** restrained discount `%`/"New" chips using `--sf-color-discount*` / `--sf-color-badge-bg`;
  remove the stray `#fff` hardcodes in favour of tokens.
- **Motion:** slow, elegant; honour `prefers-reduced-motion` (no scale on reduce).

## Functional guardrails (must not break)
- **Keep the exact props**: `product`, `onAddToCart`, `onToggleWishlist`, `isWishlisted`,
  `showAddToCart`. Pages pass these — do not rename/remove. Keep the default export + the
  `storefront/index.js` re‑export.
- The card must keep delegating add/wishlist to the **callbacks** (it does not own cart state); callers
  build the cart line via `buildCartItem` (line key `${productId}-${variantId}`) — don't change that
  contract or the card's expectations.
- Keep using `PriceBlock`, `StarRating`, `onImageError`/`PLACEHOLDER_IMG`, and `productPath` for the
  product link. Reviews/ratings stay real‑data‑gated.
- Tokenize all colours. Admin untouched; no API/schema changes.

## Implementation notes
- The "second image on hover" should gracefully no‑op when a product has a single image.
- Keep the name truncation behaviour (or adjust the length) but don't break layout when names are
  long.
- Ensure the whole card is a single, accessible link to the PDP with the add/wishlist controls as
  nested buttons (avoid nested‑interactive a11y pitfalls — e.g. stop propagation on the buttons).
- Verify the card looks right in **every** consumer (Home rows, Products grid + list mode, Search
  results, Wishlist, Special Offers, Related/FBT) — it's shared.

## Acceptance criteria
- [ ] The card is image‑forward + minimal with a refined hover quick‑add and a corner wishlist heart;
      badges + ratings are restrained and real‑data‑gated.
- [ ] Props/exports unchanged; add‑to‑cart and wishlist callbacks fire correctly; out‑of‑stock state
      handled.
- [ ] No hardcoded hex (incl. the old `.discountBadge #fff`); reduced‑motion respected; PDP link uses
      `productPath`.
- [ ] Looks correct in all consuming surfaces (grid + list).

## Test & QA
- On Home/Products/Search/Wishlist/Special Offers: hover a card (quick‑add + image transition), click
  the name/image → correct PDP, click add → cart updates + merges by line key, toggle wishlist heart.
- Out‑of‑stock product → disabled add + "Out of stock"; product with no reviews → no rating shown.
- List vs grid mode on Products. Reduced‑motion + keyboard focus on the card's controls. Dark mode.
  `/admin` untouched.
