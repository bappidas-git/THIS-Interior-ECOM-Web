# THIS Interiors Storefront — Prompt 30: Final QA & Feature Parity
**Prompt 30 of 30**

## Depends on
**All prior prompts (01–29).** This is the closing verification + polish pass.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). By now the storefront is fully redesigned, copy + data are rebranded (AED), motion +
responsiveness + a11y are polished, and the admin logo is swapped. This prompt confirms the result is
**cohesive + on‑brand** AND that **every existing feature still works, API‑driven**, with the **admin
untouched** (beyond the logo).

## Objective
Run a complete storefront walkthrough verifying brand consistency and full feature parity; fix any
last regressions, inconsistencies, stray hardcoded colours, or broken flows; and produce a **QA
checklist** documenting the verification. No new features — verify, polish, and document.

## Scope — files & areas to touch
- Any storefront file needing a **small** fix uncovered during QA (token slips, spacing, copy, broken
  link, a11y/motion miss). Prefer fixing at the token/primitive layer when global.
- Add a short `prompts/QA_CHECKLIST.md` (or `STOREFRONT_QA.md`) capturing the results below.
- **Do not** touch the admin (except confirm the logo) or change any API/data contract.

## Verification — brand & consistency
- [ ] Warm‑neutral + brass palette, editorial serif/sans type, hairline rules, and generous whitespace
      are consistent on **every** surface; **no stock purple/blue (`#667eea`/`#764ba2`) or stray
      hardcoded hex** remains in storefront CSS (grep to confirm).
- [ ] The **correct logo per background** (light on light, white on dark) everywhere; favicon + tab
      title are brand.
- [ ] Layout/structure reads as a bespoke luxury décor boutique — **clearly distinct** from the stock
      boilerplate (mega‑menu, cinematic hero, curated discovery, premium cart drawer, dark footer).
- [ ] Light + dark modes both look correct and on‑brand.

## Verification — feature parity (all API‑driven, dual‑mode `api.js`)
- [ ] **Catalogue/categories/search:** Home, mega‑menu (admin‑managed categories + slug URLs),
      `/products` filters/sort/pagination, search overlay (scoring/recent/trending).
- [ ] **PDP:** slug routing + legacy‑id redirect, gallery/zoom, variants/swatches + stock, qty,
      Add‑to‑Cart, Buy‑Now, trust/delivery from live settings/shipping, related + FBT, reviews
      (approved‑only + purchase‑gated).
- [ ] **Cart/checkout:** cart drawer (line key `${productId}-${variantId}`, free‑shipping progress),
      checkout Cart→Shipping→Payment(store credit + COD)→Review, coupon validate/auto‑remove, money
      math (`total = subtotal − discount + shipping + tax`, store credit last → amount payable),
      order creation + confirmation.
- [ ] **Auth/account:** login/register + Remember‑me, profile update, addresses CRUD/default, change
      password, **store‑credit wallet** ledger, order history (cancel cascade / return eligibility /
      track / review status).
- [ ] **Wishlist:** guest→sync, sort, add/move‑to‑cart. **Special Offers:** deals config toggle,
      countdown, coupons, deal‑of‑the‑day, category deals. **Newsletter/Support:** leads created.
- [ ] **Currency:** AED renders everywhere via `formatCurrency`; totals correct.

## Verification — admin untouched & functional
- [ ] `/admin` login works; Dashboard, Products, Categories, Orders, Returns, Payments, Users,
      Shipping, Coupons, Special Offers, Reviews, Leads, Settings all load + operate.
- [ ] Admin actions still cascade to the storefront (e.g. approve a review → shows on PDP; toggle deals
      → nav/page; edit a category → mega‑menu; cancel/refund an order → order history/wallet).
- [ ] `git diff` shows **no admin changes** beyond the two logo constants (Prompt 29).

## Verification — quality
- [ ] Responsive 320–1440px, keyboard‑accessible, AA contrast, visible focus, alt text,
      reduced‑motion safe (Prompts 27–28 hold).
- [ ] No console errors/warnings in a full walkthrough; images lazy‑load + fall back via `onImageError`;
      reasonable performance (Lighthouse spot‑check on Home/PDP/Checkout).

## Functional guardrails (must not break)
- This pass **must not introduce regressions** — only fix them. Keep all flows, the API/data contract,
  the cart/line keys, money math, slug routing, and the admin intact. No schema changes.

## Acceptance criteria
- [ ] All verification sections above pass (or each failure is fixed and re‑verified).
- [ ] A `QA_CHECKLIST` file records what was tested + the outcomes + any follow‑ups.
- [ ] The storefront is cohesive, beautiful, on‑brand, and feature‑complete; the admin is unchanged
      (beyond the logo) and fully functional.

## Test & QA
- Execute the full purchase + account + admin walkthroughs above in mock mode (`npm run dev`); toggle
  light/dark and reduced‑motion; test mobile + desktop. Grep storefront CSS for leftover stock hex.
- Optionally smoke‑test the production branch contract (`REACT_APP_USE_MOCK_API=false`) to confirm no
  `extractData`/`{success,data,meta}` assumptions were broken (no live backend needed — verify the
  code paths/build). Record results in the QA file.
