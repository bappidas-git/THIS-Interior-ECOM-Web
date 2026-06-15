# THIS Interiors Storefront — Prompt 21: Order History & Order Cards
**Prompt 21 of 30**

## Depends on
**01** (tokens), **02** (primitives), **13** (ReviewModal restyle).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/OrderHistory/OrderHistory.js` (+ `.module.css`): a search + status filter tabs
(All/Processing/Shipped/Delivered/Cancelled), a paginated order list (5/page). Each **order card** has
a header (order# + copy, date, status badge), a thumbnail row (+N more, total), action buttons
(**Track**, **View Details**, **Return/Exchange** if eligible, **Cancel** if cancellable), a
collapsible **tracking** section (tracking#/url, status, refund status), and a collapsible **details**
section (per‑item with a **review** button/status chip, address, payment method, order summary). Logic:
status derived from `(fulfillmentStatus, paymentStatus, shippingStatus)`; **cancellable** while
"processing"; **return‑eligible** when "delivered" within 7 days; **reviewable** when delivered + kept.
Uses `useAuth` (gated), `useOrder`, `apiService.orders.getByUserId`/`cancel`, `reviews.getMine`/
`submit`, and the `ReviewModal`. Cancel runs the shared `performCancel` cascade (payment‑aware refund/
void, restock, coupon restore, store‑credit return) via `apiService.orders.cancel`.

## Objective
Restyle order history into an elegant editorial orders ledger — refined order cards, calm status
badges, tasteful collapsible tracking/details, and clear lifecycle actions — while keeping the order
lifecycle actions, the review gating/status flow, and the cancel cascade exactly intact.

## Scope — files & areas to touch
- `src/pages/OrderHistory/OrderHistory.js` — structure/classes only; keep status derivation,
  eligibility logic, pagination, and all action wiring.
- `src/pages/OrderHistory/OrderHistory.module.css` — restyle to tokens.
- `ReviewModal` is restyled in 13 — just keep invoking it here.

## Brand & design requirements
- **List chrome:** a serif page title, a quiet search field, and restrained **status filter tabs**
  (brass active). Understated pagination.
- **Order card:** a calm card (hairline border) — header with order# (quiet copy affordance), date, and
  a tokenized **status badge** (warm semantic tokens, not loud); a tidy thumbnail strip + total; a row
  of quiet actions (Track / View Details / Return / Cancel) with brass on the primary action.
- **Collapsible sections:** tracking + details expand with a calm transition; details show per‑item
  rows with a quiet **"Write/Edit review"** action and the review **status chip** (Pending/Approved/
  Rejected), plus the address, payment method, and an itemized order summary.
- **States:** honest empty ("No orders yet" + Explore) + loading skeletons; payment‑aware cancel
  confirmation copy preserved.
- **Motion:** calm collapses; reduced‑motion safe.

## Functional guardrails (must not break)
- Keep the **status derivation** and the eligibility gates: Cancel only while "processing"; Return/
  Exchange only when delivered within 7 days; Review only when delivered + kept. Keep the
  payment‑aware **cancel** via `apiService.orders.cancel` (the full `performCancel` cascade — refund/
  void, restock, coupon restore, store‑credit return) and its SweetAlert confirmation.
- Keep **review gating**: `reviews.getMine` keyed by productId, `reviews.submit` with `orderId`/
  `orderNumber`/`isVerifiedPurchase`, the Pending/Approved/Rejected chip, and the edit flow
  (re‑enters pending). Approved‑only reviews show on the PDP.
- Keep Track (tracking#/url/status/refund status), View Details, copy‑order‑number, the
  search/filter/pagination, and the auth gate (redirect when logged out).
- Tokenize colours; admin untouched; no schema changes.

## Implementation notes
- Touch structure/classes, not the lifecycle/eligibility logic or the cancel cascade.
- Keep the Return/Exchange entry routing to `/support` (or wherever it currently sends) unchanged.
- Ensure collapsibles are keyboard‑accessible (`aria-expanded`/controls) and badges have text (not
  colour‑only) for a11y.

## Acceptance criteria
- [ ] Order history restyled (serif title, restrained filter tabs, refined order cards, tokenized
      status badges, calm collapsible tracking/details, clear actions) — fully tokenized.
- [ ] Cancel (payment‑aware cascade), Return eligibility, Track, View Details, copy, search/filter/
      pagination, and the auth gate all work unchanged.
- [ ] Review write/edit + status chip + approved‑only PDP visibility intact; honest empty/loading
      states.
- [ ] Reduced‑motion safe; responsive; keyboard accessible.

## Test & QA
- As a user with orders: filter/search; expand tracking + details; copy an order number. Cancel a
  "processing" order → confirm the cascade (refund/void, restock, coupon/store‑credit) reflects in
  `/admin → Orders/Payments` and the customer badge. Try cancelling a shipped order (not allowed).
- Write a review on a delivered item → Pending chip; approve it in `/admin → Reviews` → it appears on
  the PDP and the chip flips to Approved; edit it → back to Pending.
- Reduced‑motion; dark mode; responsive; `/admin` untouched.
