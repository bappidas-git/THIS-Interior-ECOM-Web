# THIS Interiors Storefront — Prompt 14: Premium Cart Drawer & Mobile Add‑to‑Cart Bar
**Prompt 14 of 30**

## Depends on
**01** (tokens), **02** (primitives), **03** (header opens the drawer). Checkout is **22**.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/components/CartDrawer/CartDrawer.js` (+ `.module.css`) is the slide‑in mini‑cart:
header + item count, a **free‑shipping progress bar** (toward `FREE_SHIPPING_THRESHOLD` from
`constants.js`), a scrollable item list (image, name, variant, price/discount, ± quantity, line total,
remove) with an empty state, and a sticky footer (subtotal + estimated shipping + "View Cart" +
"Checkout" → `/checkout`). It reads `useCart` (`cartItems`, `getCartTotal`, `getCartItemCount`,
`updateQuantity`, `removeFromCart`), uses `FLAT_SHIPPING` (99) when below threshold, and `formatCurrency`
+ `productPath`. Props: `open`, `onClose`. The mobile **`AddToCartBar`** (`src/components/storefront/
AddToCartBar.js`) is the sticky PDP buy bar revealed when the buy box scrolls off (IntersectionObserver),
with an "Added ✓" state.

## Objective
Elevate the mini‑cart into a **premium sticky cart drawer** — free‑shipping qualifier, quiet trust
badges, elegant line items, clear subtotal and a confident checkout CTA — and restyle the mobile
sticky add‑to‑cart bar to match, all while keeping the exact cart logic, money math, and quantity
handling.

## Scope — files & areas to touch
- `src/components/CartDrawer/CartDrawer.js` + `.module.css` — restyle structure/classes to tokens;
  optionally add a restrained trust‑badge row.
- `src/components/storefront/AddToCartBar.js` + `.module.css` — restyle to brand; keep the reveal +
  "Added ✓" behaviour and props.
- Reuse `TrustBadges` (storefront) for the drawer's reassurance row if desired (keep it quiet).

## Brand & design requirements
- **Drawer:** a calm `surface` panel sliding from the right, hairline header with a serif "Your Cart"
  title + item count, understated close. Generous spacing; line items as quiet rows (image on
  `surface‑2`, name in refined type, variant in muted caps, ± stepper tokenized, remove as a quiet
  icon). Empty state: serene, with a "Continue shopping" link.
- **Free‑shipping progress:** a refined, slim progress qualifier ("You're £X away from complimentary
  shipping" / "You've unlocked complimentary shipping") using the brass accent; the bar fills smoothly.
  Keep the threshold from `FREE_SHIPPING_THRESHOLD`.
- **Trust row:** a small, quiet row of reassurance badges (secure payment / easy returns) — policy‑level,
  not fabricated.
- **Footer:** subtotal + estimated shipping clearly itemized; a confident brass **Checkout** CTA + a
  quiet "View cart" link. Sticky at the bottom.
- **AddToCartBar (mobile):** a slim sticky bar with thumb + name + price + a brass Add (and optional Buy
  Now); keep the "Added ✓" micro‑feedback; reduced‑motion safe.
- **Motion:** smooth slide/backdrop; honour `prefers-reduced-motion`.

## Functional guardrails (must not break)
- Keep **all cart logic**: `useCart` (`cartItems`, `getCartTotal`, `getCartItemCount`, `updateQuantity`,
  `removeFromCart`), quantity clamping to `item.stock`, line total = `price × quantity`, discount
  display (`comparePrice` vs `price`), and the empty state.
- Keep the **money math** and the **free‑shipping threshold** (`FREE_SHIPPING_THRESHOLD`) + the
  below‑threshold `FLAT_SHIPPING` estimate; the drawer's estimate must stay consistent with checkout's
  shipping logic. Use `formatCurrency` (currency comes from the items/store — AED lands in 25–26).
- Keep props `open`/`onClose`, the "Checkout" → `/checkout` and "View Cart" navigation, and the header
  open‑trigger wiring.
- Keep `AddToCartBar` props (`anchorRef`, `price`, `comparePrice`, `currency`, `image`, `name`,
  `disabled`, `ctaLabel`, `onAddToCart`, `onBuyNow`) + the IntersectionObserver reveal + "Added ✓".
- Tokenize colours (remove `#1a1d2e`/`#e4e6f0` hardcodes). Admin untouched; no schema changes.

## Implementation notes
- Touch presentation only; do not re‑plumb the cart context or the debounced API sync.
- If you add a trust row, source any dynamic numbers (free‑shipping threshold, returns window) the same
  way `TrustBadges`/`resolveTrustBadgeDetail` does — never hardcode.
- Keep currency formatting via `formatCurrency`/the line `currency` field so the AED switch later just
  works.

## Acceptance criteria
- [ ] Cart drawer restyled to a premium editorial panel: free‑shipping qualifier, quiet trust row,
      elegant line items with working ± / remove, itemized subtotal + shipping, confident Checkout CTA.
- [ ] Money math, quantity clamping, discount display, threshold logic, and empty state all unchanged
      and correct.
- [ ] `AddToCartBar` restyled with reveal + "Added ✓" + props intact.
- [ ] Tokenized (no `#1a1d2e`/stray hex), reduced‑motion safe, responsive; `/admin` untouched.

## Test & QA
- Add items → open drawer: progress bar fills toward free shipping; cross the threshold → shipping
  estimate goes free; change quantities (clamped to stock) and remove items → totals update; empty the
  cart → empty state; Checkout → `/checkout`.
- On a PDP mobile viewport, scroll past the buy box → `AddToCartBar` reveals; tap Add → "Added ✓" +
  cart updates.
- Verify the drawer's subtotal/shipping match what checkout computes. Reduced‑motion; dark mode;
  `/admin` untouched.
