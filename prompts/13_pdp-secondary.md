# THIS Interiors Storefront — Prompt 13: Product Detail — Tabs, Reviews & AOV
**Prompt 13 of 30**

## Depends on
**01** (tokens), **02** (primitives), **09** (ProductCard), **12** (PDP top half).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). Below the buy box, `ProductDetails` renders: **tabs** (Description with a spec table +
Reviews), `ReviewsSection`, `FrequentlyBoughtTogether` (curated bundle), and `RelatedProducts`. Plus
the customer **`ReviewModal`** (`src/components/ReviewModal/ReviewModal.js`) used to write/edit a
review. Reviews are **approved‑only** on the storefront (`apiService.products.getReviews` filters
`status:"approved"`) and **purchase‑gated** (submitted with `orderId`/`orderNumber`/`isVerifiedPurchase`
via `apiService.reviews.submit`, re‑entering `pending` moderation). Related/FBT come from
`apiService.products.getRelated` / `getFrequentlyBoughtTogether` (curated `relatedProductIds` /
`frequentlyBoughtTogetherIds` first). PDP blends the product's base `rating` with real approved
reviews for the display average.

## Objective
Restyle the PDP's **secondary content** — description/specs tabs, the reviews/social‑proof section,
the curated "frequently bought together" bundle, and related products — into the editorial language,
while keeping the moderation gating, the honest rating blend, and the AOV data contracts intact.

## Scope — files & areas to touch
- `src/pages/ProductDetails/ProductDetails.js` — the tabs + secondary section composition/classes
  (keep the data wiring).
- `src/pages/ProductDetails/ProductDetails.module.css` — restyle tabs/specs to tokens.
- Shared components (presentation/token polish, keep props): `src/components/storefront/ReviewsSection.*`,
  `FrequentlyBoughtTogether.*`, `RelatedProducts.*`, `StarRating.*`, `SocialProof.*`.
- `src/components/ReviewModal/ReviewModal.js` + `.module.css` — restyle the review form to brand
  (keep its props: `open`, `onClose`, `product`, `existing`, `onSubmit`, `isDarkMode`).

## Brand & design requirements
- **Tabs:** quiet editorial tabs (Description / Reviews [+ a Details/Specs view]). Description in
  comfortable serif/sans with airy line length; the **spec table** as a clean hairline‑ruled
  key/value list (brand, SKU, weight, dimensions, category, tags) — render only fields that exist.
- **Reviews section:** a refined summary (real average + star distribution) and review cards (verified
  badge, stars, title, body, optional UGC photos), with honest **empty/loading/error** states and a
  clear "Write a review" entry (which opens `ReviewModal`). Star colour from `--sf-color-star`.
- **Frequently Bought Together:** the curated bundle as elegant tiles + a calm checklist and a real
  combined total ("Add N to cart"); renders **nothing** when there are no curated companions.
- **Related products:** an airy horizontal row of restyled `ProductCard`s ("You may also like");
  renders nothing when empty.
- **ReviewModal:** brand surface, serif title, a refined star picker, tokenized inputs, brass submit;
  keep the edit‑existing behaviour.
- **Motion:** slow reveals; reduced‑motion safe.

## Functional guardrails (must not break)
- **Reviews stay approved‑only + purchase‑gated.** Keep `getReviews` (approved filter) for display and
  `reviews.submit` for create/edit (which re‑enters `pending`); keep the honest rating **blend** of
  product `rating`/`totalReviews` with real approved reviews. **Never** render unmoderated/fabricated
  reviews.
- Keep `getRelated` / `getFrequentlyBoughtTogether` reads + their "curated ids first, else
  category/tag fallback, else nothing" behaviour. FBT total math must stay correct and add the real
  bundle to cart via the standard line‑key add.
- Keep `ReviewModal` props/`onSubmit` contract; the order‑history "your review" status flow depends on
  it (Prompt 21).
- Tokenize colours; keep shared component props/exports + `variantUtils` intact. Admin untouched; no
  schema changes.

## Implementation notes
- Touch composition/classes, not the data blend or moderation logic. Reuse restyled `ProductCard` in
  the related row.
- Spec table: iterate only present fields so sparse products don't show empty rows.
- Ensure tabs are keyboard‑accessible (roving tabindex / `aria-selected`), and the reviews empty state
  is honest ("No reviews yet — be the first").

## Acceptance criteria
- [ ] Tabs + spec table restyled (hairline key/values, present‑fields only); reviews section refined
      with honest empty/loading/error states + a working "Write a review" → `ReviewModal`.
- [ ] FBT renders only with curated companions and computes a real total; Related row renders only when
      non‑empty; both add to cart via the standard line key.
- [ ] Reviews remain approved‑only on display + purchase‑gated on submit; rating blend honest;
      `ReviewModal` restyled with props intact.
- [ ] Tokenized, reduced‑motion safe, keyboard accessible.

## Test & QA
- On a product with approved reviews → summary + cards render; a product with none → honest empty
  state. Open `ReviewModal` (from a delivered order in 21, or the PDP entry), submit → it enters
  `pending` (verify in `/admin → Reviews`) and drops off the storefront until approved.
- Product with `frequentlyBoughtTogetherIds` → bundle + correct total + add works; without → hidden.
  Related row appears only when non‑empty.
- Tabs by keyboard; reduced‑motion; dark mode; responsive; `/admin` untouched.
