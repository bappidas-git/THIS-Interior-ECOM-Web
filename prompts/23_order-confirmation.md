# THIS Interiors Storefront — Prompt 23: Order Confirmation & Invoice
**Prompt 23 of 30**

## Depends on
**01** (tokens), **02** (primitives), **22** (checkout).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/OrderConfirmation/OrderConfirmation.js` (+ `.module.css`), route
`/order-confirmation/:orderNumber`: a success animation, the order number (copyable) + placed date, a
delivery banner (est. date = created + 5 days, or "Delivered"), the items list + totals (subtotal,
discount w/ code, shipping, tax, total, store credit, **amount paid**), the shipping address, a
payment‑method badge + status indicator (paid/pending/failed/refunded; COD → "Pay on Delivery"), and
action buttons (Track → `/orders`, Continue Shopping → `/`, Download Invoice [placeholder]). Reads
`apiService.orders.getByOrderNumber` (handles array/object/direct); has distinct error vs not‑found
states; reads legacy field fallbacks (`taxAmount ?? tax`, `shippingAmount ?? shipping`).

## Objective
Restyle the confirmation page into a calm, reassuring editorial "thank you" — a tasteful success
moment, a clean order summary/invoice block, a clear delivery + payment status, and refined actions —
while keeping the order data reads and the totals/legacy‑field handling intact.

## Scope — files & areas to touch
- `src/pages/OrderConfirmation/OrderConfirmation.js` — structure/classes only; keep the fetch, the
  status logic, and the totals/fallbacks.
- `src/pages/OrderConfirmation/OrderConfirmation.module.css` — restyle to tokens.

## Brand & design requirements
- **Success moment:** a restrained, elegant confirmation (a calm checkmark/reveal — not confetti‑loud;
  honour reduced‑motion), a serif "Thank you" line in brand voice, the order number with a quiet copy
  affordance and the placed date.
- **Delivery banner:** a quiet hairline banner with the estimated delivery date (or "Delivered").
- **Invoice/summary block:** a clean, hairline‑ruled itemized summary (items, subtotal, discount +
  code, shipping, tax, store credit, total, **amount paid**) via `formatCurrency`; the shipping address
  in a calm card; a tokenized **payment‑method + status** indicator (warm semantic tokens; COD → "Pay
  on Delivery").
- **Actions:** brass **Track order** (→ `/orders`), quiet **Continue shopping** (→ `/`), and the
  **Download invoice** affordance (keep its current placeholder behaviour unless trivially printable).
- **States:** distinct, honest **error** vs **not‑found** states with a retry/back action.

## Functional guardrails (must not break)
- Keep `orders.getByOrderNumber` (with its array/object/direct handling) and the **error vs not‑found**
  distinction + retry.
- Keep the totals rendering incl. the **legacy fallbacks** (`taxAmount ?? tax`,
  `shippingAmount ?? shipping`) and the store‑credit "amount paid" line; keep currency via
  `formatCurrency` (AED in 25–26).
- Keep the status mapping (paid/pending/failed/refunded; COD copy) and the action routes. Tokenize
  colours; admin untouched; no schema changes.

## Implementation notes
- Touch structure/classes only; do not change the fetch or totals math.
- If you make the invoice printable, do it via a print‑stylesheet/`window.print()` without altering the
  data — otherwise keep the existing placeholder.
- Keep the success animation behind a reduced‑motion check.

## Acceptance criteria
- [ ] Confirmation restyled (restrained success moment, clean invoice/summary block, clear delivery +
      payment status, refined actions) — tokenized.
- [ ] Order fetch + error/not‑found/retry, totals incl. legacy fallbacks + amount‑paid line, status
      mapping, and action routes all intact.
- [ ] Reduced‑motion safe; responsive; `/admin` untouched.

## Test & QA
- Place an order (Prompt 22) → land here: success moment is calm, order number copyable, totals match
  what was paid (incl. store credit "amount paid"), status correct for the method (COD → "Pay on
  Delivery"); Track → `/orders`, Continue → `/`.
- Hit `/order-confirmation/<unknown>` → honest not‑found; simulate a fetch error → error + retry.
- Reduced‑motion (no loud animation); dark mode; responsive; `/admin` untouched.
