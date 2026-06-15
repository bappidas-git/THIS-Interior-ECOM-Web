# THIS Interiors Storefront — Prompt 25: Brand Copy, Microcopy & Currency
**Prompt 25 of 30**

## Depends on
**01** (tokens/identity). Pairs with **26** (data/`settings`). Many surfaces read these constants, so
run before/with the data prompt.

## Context
THIS Interiors — Dubai's luxury interior‑design studio extended into a curated home‑décor boutique
(token‑driven CRA app, dual‑mode `api.js` + `db.json`). Storefront copy is centralized in
`src/utils/constants.js`: `APP_NAME` (from `REACT_APP_NAME` env, default "My Store"), `APP_TAGLINE`,
`APP_DESCRIPTION`, `SOCIAL_LINKS`, `SUPPORT_EMAIL/PHONE/ADDRESS/HOURS`, `POLICY_LAST_UPDATED`,
`FAQ_ITEMS`, `WHY_CHOOSE_US`, `TRUST_BADGES`, `CURRENCIES` (INR/USD/EUR/GBP), `DEFAULT_CURRENCY`,
`FREE_SHIPPING_THRESHOLD`. `formatCurrency(amount, currency="INR")` lives in `src/utils/helpers.js`
(locale `en-IN` for INR else `en-US`); `buildCartItem` stamps `currency:"INR"` on cart lines; the
document title/meta live in `public/index.html` + `manifest.json`. The brand is **Dubai‑based →
prefers AED**.

## Objective
Rewrite the storefront's **brand copy and microcopy** to the THIS Interiors voice, and set
**currency/locale to AED** — adding AED to the currency map while keeping `formatCurrency` and all
money math working. This is the single "wordmark + voice + currency" pass; later data lives in 26.

## Scope — files & areas to touch
- `src/utils/constants.js` — `APP_NAME`/`APP_TAGLINE`/`APP_DESCRIPTION`, `SUPPORT_*`, `SOCIAL_LINKS`,
  `WHY_CHOOSE_US`, `FAQ_ITEMS`, `TRUST_BADGES`, and the currency block (add **AED**; set
  `DEFAULT_CURRENCY`).
- `src/utils/helpers.js` — `formatCurrency`: add AED handling (locale `en-AE`, symbol/format) **without
  breaking** INR/USD/EUR/GBP; consider `buildCartItem`'s hardcoded `currency:"INR"` (see guardrails).
- `public/index.html` + `public/manifest.json` — document `<title>`, meta description/OG/Twitter,
  `theme-color`/names → THIS Interiors (favicon already set in 01).
- `.env` / `.env.example` — set `REACT_APP_NAME="THIS Interiors"` (so `APP_NAME` resolves to the brand;
  keep the env‑override pattern).
- Empty‑state / toast / button microcopy that's **inline** in components (only where it's plainly the
  stock voice and not data) — keep changes light and on‑brand.

## Brand & design requirements
- **Voice:** refined, warm, aspirational. `APP_TAGLINE` and key lines should echo the brand anchors —
  *"Crafting homes with a soul," "Bringing beauty to every corner," "Where style meets comfort, every
  corner tells a story," "Crafted spaces, enriching lives."* Short, elegant sentences. Use italic
  accent nouns in display copy where surfaces render it.
- **Support identity:** a Dubai‑appropriate `SUPPORT_ADDRESS`, brand email/phone, sensible hours, and
  real‑looking social handles (kept blank‑hides where unknown).
- **FAQ / Why‑Choose‑Us / Trust badges:** rewrite to décor‑boutique substance (delivery, returns,
  authenticity, care/material guidance) in brand voice — honest, not hypey.
- **Currency (AED):** add `AED: { symbol: "AED" (or "د.إ"), code: "AED", name: "UAE Dirham" }` to
  `CURRENCIES`, set `DEFAULT_CURRENCY = CURRENCIES.AED`, and make `formatCurrency` format AED with
  `en-AE`. Keep `FREE_SHIPPING_THRESHOLD` sensible for AED (re‑base the number, mirrored in the
  Standard shipping method `freeAbove` in 26).

## Functional guardrails (must not break)
- **`formatCurrency` must keep working for every existing currency** and for any amount; only **add**
  AED — don't remove INR/USD/EUR/GBP. Money math is numeric and currency‑agnostic; you're changing the
  **symbol/locale**, not the arithmetic.
- **Cart line currency:** `buildCartItem` currently stamps `currency:"INR"`. To switch the displayed
  currency to AED coherently, prefer driving currency from one source (store `settings.currency` or
  `DEFAULT_CURRENCY`); if you change `buildCartItem`, keep the field present and a string so cart/
  checkout/summary keep rendering. Do **not** break the line‑item shape.
- Note: `api.js` writes some **internal admin audit strings** with a `₹` literal (order/refund
  timelines). Those are server‑side‑style notes, not customer currency rendering — **leave api.js
  untouched** (no signature/string‑contract changes); the data prompt (26) sets `settings.store
  .currency/currencySymbol` for the store.
- Keep `APP_NAME` resolving via the env override; keep `constants.js` export names. Admin untouched
  (the admin reads `settings`/its own copy — don't touch admin code).

## Implementation notes
- Centralize currency: if a `getCurrency()`‑style read from `settings`/`DEFAULT_CURRENCY` is easy, use
  it so 26's `settings.store.currency = "AED"` lines up; otherwise set `DEFAULT_CURRENCY = AED` and
  ensure `formatCurrency` defaults sensibly.
- Keep changes surgical and grep for stray "My Store"/stock copy in the storefront (not admin) to
  rebrand consistently.

## Acceptance criteria
- [ ] `APP_NAME`/tagline/description, `SUPPORT_*`, `SOCIAL_LINKS`, `WHY_CHOOSE_US`, `FAQ_ITEMS`,
      `TRUST_BADGES` rewritten to THIS Interiors voice; document title/meta/manifest rebranded.
- [ ] **AED** added to `CURRENCIES`, `DEFAULT_CURRENCY = AED`, and `formatCurrency` formats AED
      (`en-AE`) while still handling INR/USD/EUR/GBP; `FREE_SHIPPING_THRESHOLD` re‑based for AED.
- [ ] Cart/checkout/summary render the brand currency coherently; line‑item shape intact; `api.js`
      untouched; admin untouched; app compiles with no console errors.

## Test & QA
- Grep the storefront for "My Store"/stock taglines → none remain (admin excluded). Document tab shows
  the brand title.
- Prices across cards, PDP, cart drawer, checkout, confirmation, and the wallet render in **AED** with
  correct formatting; totals still compute correctly; free‑shipping threshold reflects the AED number.
- Switch `formatCurrency` test calls for INR/USD → still format. Confirm `/admin` unchanged and
  functional.
