# THIS Interiors Storefront — Prompt 22: Checkout (Cart → Shipping → Payment → Review)
**Prompt 22 of 30**

## Depends on
**01** (tokens), **02** (primitives), **14** (cart drawer). Confirmation is **23**.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/Checkout/Checkout.js` (+ `.module.css`) is a 4‑step flow with an order summary:
**0 Cart** (review items, ± qty, **coupon** apply/remove) → **1 Shipping** (saved addresses radio or new
address form; **shipping method** select) → **2 Payment** (**store‑credit** wallet section; payment
method options card/UPI/net‑banking/wallet/**COD** with conditional forms) → **3 Review** (read‑only,
edit‑back) → place order. Money math: `total = subtotal − discount + shipping + tax` (tax on the
post‑coupon subtotal); **store credit applied last** against the grand total → `amountPayable`; COD
gated by min/max on the payable amount. Coupon validated server‑side via `apiService.coupons.validate`
(min order, max cap, usage, expiry, active), auto‑removed if the cart drops below `minOrderAmount`.
Uses `useCart`, `useAuth`, `useOrder` (`createOrder`), `apiService.shipping.getMethods`,
`apiService.wallet.getBalance`. `createOrder` posts the full order payload (subtotal, discountAmount,
couponCode, shippingAmount, taxAmount, total, storeCreditUsed, amountPayable, paymentMethod,
paymentStatus, fulfillmentStatus, shippingStatus, addresses, items).

## Objective
Restyle checkout into a serene, confidence‑building editorial flow — a refined step indicator,
tokenized forms, elegant shipping/payment cards, a clear store‑credit + coupon treatment, and a calm
sticky **order summary** — while keeping the **money math, store‑credit apply, coupon validation, COD
gating, and order creation exactly intact**.

## Scope — files & areas to touch
- `src/pages/Checkout/Checkout.js` — structure/classes + step composition only; **do not change** any
  math, the store‑credit/coupon logic, the COD gating, or the `createOrder` payload.
- `src/pages/Checkout/Checkout.module.css` — restyle to tokens.

## Brand & design requirements
- **Step indicator:** a refined, hairline progress stepper (serif step labels, brass active/complete)
  for Cart → Shipping → Payment → Review.
- **Cart step:** quiet line‑item rows with ± steppers + remove; a calm **coupon** field with apply/
  remove and clear applied/error states.
- **Shipping step:** elegant **saved‑address cards** (radio‑select, default marked) + an "Add new
  address" form (tokenized), and **shipping method** options as quiet selectable cards (name, ETA, cost
  / free).
- **Payment step:** a clear **store‑credit** panel (balance, an apply field capped to
  `min(balance, total)`, the resulting "Amount payable") + payment method options as selectable cards
  (Card/UPI/Net Banking/Wallet/COD) with their conditional fields; **COD** disabled when not available
  for the payable amount, with an honest note.
- **Review step:** read‑only summaries with quiet "Edit" links back to each step, then a confident
  brass **Place order**.
- **Order summary:** a calm sticky panel — subtotal, discount (with code), shipping, tax, store credit,
  total/amount payable — itemized and legible, via `formatCurrency`.
- **Motion:** calm step transitions; reduced‑motion safe.

## Functional guardrails (must not break)
- **Money math is sacred:** keep `total = subtotal − discount + shipping + tax` (tax on post‑coupon
  subtotal), **store credit applied last** → `amountPayable`, and the shipping‑free logic
  (`rateType:"free"` or `freeAbove` met else `flatRate`). Do not alter any calculation.
- Keep **coupon** validation via `coupons.validate` (min order, max cap, usage, expiry, active) + the
  auto‑remove when the cart drops below `minOrderAmount`; keep the applied‑coupon display.
- Keep **store credit**: `wallet.getBalance`, the apply cap (`min(balance, total)`), and writing
  `storeCreditUsed`/`amountPayable` onto the order (the wallet debit + ledger happen in `orders.create`).
- Keep **COD** gating on the payable amount and the per‑method `paymentStatus` outcome (card/UPI/
  net‑banking → "paid", COD → "pending", fully store‑credit → "paid"). Keep the **address** shape and
  saved‑address selection. Keep the `createOrder` payload field names exactly.
- Tokenize colours; admin untouched; no schema changes.

## Implementation notes
- Touch composition/classes and the step chrome only — leave the reducers/handlers, validation, and the
  order payload untouched.
- Keep the empty‑cart guard (redirect/empty state) and the post‑order navigation to
  `/order-confirmation/:orderNumber`.
- Currency stays via `formatCurrency` so the AED switch (25–26) flows through automatically.

## Acceptance criteria
- [ ] Checkout restyled (refined stepper, tokenized forms, elegant shipping/payment cards, clear
      store‑credit + coupon treatment, calm sticky summary) across all four steps.
- [ ] Money math, coupon validation/auto‑remove, store‑credit apply (cap + amount payable), COD gating,
      per‑method payment status, address selection, and the `createOrder` payload are all unchanged and
      correct.
- [ ] Tokenized; reduced‑motion safe; responsive; honest empty‑cart + error states.

## Test & QA
- Build a cart and walk Cart → Shipping → Payment → Review → Place order. Verify the summary math at
  each step (subtotal/discount/shipping/tax/total). Apply a valid coupon (+ one below min → rejected;
  remove an item below min → auto‑removed). Apply store credit (capped) → amount payable drops; place a
  fully‑store‑credit order. Try COD above the COD max → disabled.
- Place orders with card/UPI/COD/store‑credit and confirm `paymentStatus` + the records in
  `/admin → Orders/Payments` (and the wallet debit in Prompt 20). Land on the confirmation page.
- Reduced‑motion; dark mode; mobile/desktop; `/admin` untouched.
