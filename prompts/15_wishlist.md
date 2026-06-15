# THIS Interiors Storefront — Prompt 15: Wishlist Page
**Prompt 15 of 30**

## Depends on
**01** (tokens), **02** (primitives), **09** (ProductCard).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/Wishlist/Wishlist.js` (+ `.module.css`): an optional **guest banner** ("saved
on this device, log in to sync" + login), a header (title, count, sort dropdown, "clear all"), and a
grid of saved items (image, remove ✕, discount badge, name/brand, rating+count, price, stock status,
**Add to Cart** + **Move to Cart**). It uses `useWishlist` (guest→synced; rows carry `productId`),
`useCart`, `useAuth`, `buildCartItem` (with `id: item.productId`), `productPath`. Sorts: Recently
Added / Oldest / Price low‑high / high‑low / Highest Rated. Remove animates out; Move‑to‑Cart adds then
silently removes.

## Objective
Restyle the wishlist into the editorial language — an airy "saved pieces" gallery with a quiet guest
banner, refined sort, and elegant cards — while keeping the device→sync wishlist logic, sorting,
add/move‑to‑cart, and honest stock states intact.

## Scope — files & areas to touch
- `src/pages/Wishlist/Wishlist.js` — structure/classes only; keep the wishlist/cart/auth wiring.
- `src/pages/Wishlist/Wishlist.module.css` — restyle to tokens.
- Reuse the restyled `ProductCard` (09) where it fits, or keep the bespoke wishlist card but bring it
  to the same aesthetic (it has Add + Move‑to‑Cart, which the shared card doesn't — keep those).

## Brand & design requirements
- **Header:** serif "Saved pieces" (or similar) with the live count, a restrained sort `select`, and a
  quiet "Clear all" (with the existing confirm). Airy, hairline‑bottomed.
- **Guest banner:** a calm, low‑pressure note that items are saved on this device + a quiet "Sign in to
  sync" — shown only to guests (not while auth is loading).
- **Cards:** image‑forward editorial tiles with a quiet remove ✕, honest stock status ("In stock" /
  "Out of stock"), restrained discount badge, and two clear actions: **Add to Cart** (brass) and
  **Move to Cart** (quiet). Remove animates out gently.
- **Empty/loading:** serene empty state (a line of brand copy + "Explore the collection" → `/products`)
  + brand skeletons.
- **Motion:** slow; reduced‑motion safe.

## Functional guardrails (must not break)
- Keep `useWishlist` (guest→synced; merge on login; optimistic add/remove with rollback;
  `isInWishlist`, `removeFromWishlist({silent})`, `clearWishlist`, `getWishlistCount`) and the
  device‑level localStorage persistence.
- Keep **Add to Cart** and **Move to Cart** building the cart line via `buildCartItem` with
  `id: item.productId` (so it merges by the canonical line key) and **Move** doing a **silent** remove.
- Keep all five sort options + the stock derivation (cheapest variant stock, else product stock; null
  treated as in‑stock for legacy rows) and `productPath` links.
- Tokenize colours; admin untouched; no schema changes.

## Implementation notes
- If reusing `ProductCard`, extend the wishlist card composition to include Move‑to‑Cart and the remove
  ✕ without changing the shared card's props.
- Keep the remove exit animation but gate it behind reduced‑motion.

## Acceptance criteria
- [ ] Wishlist restyled to an airy editorial "saved pieces" gallery (serif header, restrained sort,
      quiet guest banner, elegant cards with Add + Move‑to‑Cart + remove).
- [ ] Device→sync wishlist logic, all sorts, add/move‑to‑cart (merge by line key, silent move), and
      honest stock states intact.
- [ ] Honest empty/loading states; tokenized; reduced‑motion safe; responsive.

## Test & QA
- As a guest: add items from cards/PDP → appear here with the guest banner; sort; remove (animates);
  Add to Cart + Move to Cart (move removes silently). Log in → guest items sync (verify in
  `/admin → Users`/wishlist or by reload). Out‑of‑stock item shows the right state + disabled add.
- Clear all (confirm). Empty state → "Explore the collection". Reduced‑motion; dark mode; responsive;
  `/admin` untouched.
