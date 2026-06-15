# THIS Interiors Storefront — Prompt 20: Store‑Credit Wallet
**Prompt 20 of 30**

## Depends on
**01** (tokens), **02** (primitives), **18** (account shell).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). The **Store Credit** tab in `src/pages/Profile/Profile.js` shows a balance card + a
transaction ledger. Data: `apiService.wallet.getBalance(userId)` (summed from the ledger — the source
of truth) and `apiService.wallet.getTransactions(userId)` (newest first). Each
`walletTransactions` row: `{ id, userId, type: "credit"|"debit", amount, reason, orderId, orderNumber,
refundId, refundNumber, balanceBefore, balanceAfter, createdAt }`. Credits come from refunds; debits
from applying store credit at checkout. The denormalised `user.storeCredit` mirrors the ledger.

## Objective
Restyle the wallet into an elegant "Store Credit" panel — a refined balance card and a calm,
hairline‑ruled transaction ledger with clear credit/debit treatment and order links — while keeping the
balance/ledger reads exactly intact (read‑only surface).

## Scope — files & areas to touch
- `src/pages/Profile/Profile.js` — the Store Credit tab structure/classes; keep the wallet reads.
- `src/pages/Profile/Profile.module.css` — restyle the wallet tab to tokens (shared stylesheet).

## Brand & design requirements
- **Balance card:** a serene card with the available balance in a large serif figure (formatted via
  `formatCurrency`), a quiet caption (e.g. "Available store credit"), and a one‑line note on how credit
  is earned/used. Brass accent used sparingly.
- **Ledger:** a calm list/table with hairline row rules — each row shows the reason, date
  (`formatDate`/relative), the linked order number (link to that order where available), and the
  signed amount with **credit** in the success/positive token and **debit** in muted/negative
  treatment; optionally the running `balanceAfter`.
- **Empty/loading:** honest empty state ("No store‑credit activity yet") + brand skeletons.
- **Motion:** calm; reduced‑motion safe.

## Functional guardrails (must not break)
- **Read‑only:** keep `wallet.getBalance` (ledger‑summed) + `wallet.getTransactions` (newest first);
  do not mutate the wallet here. The balance shown must equal the ledger (don't compute a parallel
  number).
- Keep currency via `formatCurrency` (AED lands in 25–26); keep order links resolving to the right
  order. Tokenize colours; admin untouched; no schema changes.

## Implementation notes
- Touch structure/classes only. If you link an order number, route to the order (e.g.
  `/order-confirmation/:orderNumber` or `/orders`) consistent with how the app links orders elsewhere.
- Keep credit/debit semantics obvious but restrained (no loud red/green — use the warm semantic
  tokens).

## Acceptance criteria
- [ ] Wallet restyled (refined balance card + calm hairline ledger with credit/debit treatment + order
      links) — tokenized.
- [ ] Balance + transactions read from the existing wallet API unchanged; balance equals the ledger;
      honest empty/loading states.
- [ ] Reduced‑motion safe; responsive; `/admin` untouched.

## Test & QA
- With a user who has wallet activity (seed/refund), open the wallet → balance matches the ledger sum;
  rows show reason/date/order/amount with correct credit/debit treatment; an order link navigates
  correctly. A user with no activity → honest empty state.
- Place an order applying store credit (Checkout) → return here and confirm a new **debit** row +
  reduced balance. Reduced‑motion; dark mode; responsive; `/admin` untouched.
