# THIS Interiors Storefront — Prompt 16: Special Offers / Today's Deals
**Prompt 16 of 30**

## Depends on
**01** (tokens), **02** (primitives), **09** (ProductCard).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/SpecialOffers/SpecialOffers.js` (+ `.module.css`) is gated by the
admin‑managed **`dealsConfig`** (via `useDealsConfig()` / `apiService.deals.getConfig`):
`{ enabled, hero:{tag,title,subtitle}, timer:{enabled,endAt,onExpiry}, featuredCouponIds,
dealOfTheDayIds, featuredProductIds }`. When `enabled` is false the page shows an unavailable state.
Sections: a **hero** (tag/title/subtitle + a **countdown timer** when enabled, computed by
`src/utils/dealsConfig.js` `resolveCountdownTarget`/`diffToParts`), a **coupons** grid (featured ids or
all valid active coupons via `apiService.coupons.getActive`, with copy‑to‑clipboard), a **Deal of the
Day** (admin ids or top‑3 by discount), and **Deals by Category** (category tabs + product grid).
Coupons display headline (percentage `%` or fixed), min order, max discount, expiry.

## Objective
Restyle the Special Offers page into a refined editorial "Edit / Offers" page — a calm hero with a
tasteful countdown, elegant coupon cards, a curated Deal‑of‑the‑Day trio, and airy category‑filtered
deals — while keeping the entire admin‑managed deals config, countdown logic, coupon validity, and
copy‑to‑clipboard intact.

## Scope — files & areas to touch
- `src/pages/SpecialOffers/SpecialOffers.js` — structure/classes only; keep all config/timer/coupon
  logic.
- `src/pages/SpecialOffers/SpecialOffers.module.css` — restyle to tokens.
- Reuse the restyled `ProductCard` (09) for the product grids.

## Brand & design requirements
- **Hero:** a quiet editorial band — the `hero.tag` as a micro‑caps eyebrow, `hero.title` in serif
  (italic accent allowed), `hero.subtitle` in sans, and a **tasteful countdown** (hairline digit
  blocks, not a loud timer) shown only when `timer.enabled`. Honest — the countdown reflects the real
  configured target.
- **Coupons:** elegant cards (sand/greige surface, hairline border) with the real headline (`%`/fixed),
  min order, max discount, expiry, and a refined copy‑to‑clipboard with quiet "Copied" feedback. Show
  only **valid** coupons (active, not expired, not exhausted).
- **Deal of the Day:** a curated trio of large cards (real min price, original, discount %, savings) —
  airy, not crammed.
- **Deals by Category:** restrained category tabs (the existing scrollable tabs, tokenized) + an airy
  `ProductCard` grid filtered by the active tab.
- **States:** when `enabled` is false → a serene "Offers are taking a short pause" state; no coupons /
  no deals → honest empty states; loading → brand skeletons.
- **Motion:** slow; reduced‑motion safe.

## Functional guardrails (must not break)
- Keep the **master toggle** (`enabled`) gating the whole page **and** the nav entry (driven by the
  same config). Keep the hero copy + the **countdown** logic (`resolveCountdownTarget`/`diffToParts`,
  end‑of‑day rollover / hide on expiry).
- Keep coupon sourcing (`featuredCouponIds` ordered, else all valid via `coupons.getActive`) and the
  **validity filtering** (active, not past `expiresAt`, `usedCount < usageLimit`); keep
  copy‑to‑clipboard.
- Keep Deal‑of‑the‑Day (`dealOfTheDayIds` else top‑3 by discount) and the featured/category product
  grids (`featuredProductIds` else all discounted), with cards' quick‑add + wishlist.
- Tokenize colours; reuse `ProductCard`. API‑driven; admin untouched; no schema changes.

## Implementation notes
- Touch structure/classes, not the config normalization or timer math (`src/utils/dealsConfig.js`).
- Coupons + deals reference real ids; the décor catalogue/coupons land in Prompt 26 — keep it
  data‑driven so seeded ids "just work".
- Keep the category tabs' scroll‑into‑view + edge‑fade behaviour, just tokenized.

## Acceptance criteria
- [ ] Special Offers restyled (editorial hero + tasteful countdown, elegant valid‑only coupon cards,
      curated Deal‑of‑the‑Day, airy category‑filtered deals) — fully tokenized.
- [ ] `enabled` toggle still hides the page + nav entry; countdown reflects the real config; coupon
      validity + copy‑to‑clipboard intact; product cards quick‑add + wishlist work.
- [ ] Honest empty/disabled/loading states; reduced‑motion safe; responsive.

## Test & QA
- In `/admin → Special Offers`: toggle enabled off → storefront page + nav entry hide; toggle on, set
  hero copy + a timer `endAt` + featured coupon/product ids → the page reflects them; clear ids → auto
  fallbacks (all valid coupons / top‑3 deals / all discounted).
- Copy a coupon code (quiet "Copied"); switch category tabs; quick‑add a deal; expired/exhausted
  coupons don't show.
- Reduced‑motion stops timer flashiness; dark mode; responsive; `/admin` untouched.
