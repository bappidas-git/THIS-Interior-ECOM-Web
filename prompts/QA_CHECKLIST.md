# THIS Interiors — Storefront QA Checklist (Prompt 30)

**Final verification + polish pass.** Confirms the storefront is cohesive and on‑brand
**and** that every existing feature still works, API‑driven, with the admin untouched
beyond the Prompt‑29 logo swap.

- **Date:** 2026‑06‑16
- **Branch:** `claude/trusting-sagan-y68mr5`
- **Mode tested:** mock (`REACT_APP_USE_MOCK_API=true`, json‑server on `:3001`)
- **Build:** `CI=false npm run build` → **Compiled successfully**, no source warnings
  (407 kB JS / 49 kB CSS gzip). The only console notes are CRA tooling/browserslist
  messages, unrelated to app code.

## How this was verified

1. **Static code audit** of every storefront surface (pages, shared components,
   context, tokens, primitives) plus two deep sub‑audits (catalogue/PDP/reviews and
   cart/checkout/account/wishlist/offers).
2. **Grep sweeps** for stock boilerplate colours, leftover placeholders, and hardcoded
   currency.
3. **Production build** to prove the whole tree (incl. the dual‑mode `api.js` Laravel
   branch) compiles with no errors/warnings and no broken imports.
4. **Runtime mock‑API smoke test** — booted `node server.js` and exercised the
   endpoints that feed the storefront.

> Note on scope: this was a code‑level + build‑level + API‑runtime verification. A
> manual click‑through with screenshots was not run in this headless environment; the
> evidence below is drawn from source inspection, a clean production build, and live
> json‑server responses.

---

## 1. Brand & consistency — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Warm‑neutral + brass palette, hairline rules, editorial type on every surface | PASS | All component/page CSS reads `var(--sf-*)` tokens from `theme/storefront-tokens.css`; only the token file itself holds hex. |
| **No stock purple/blue** (`#667eea`/`#764ba2`) or stray hex in storefront CSS | PASS (after fix) | Grep of all storefront `*.css` for `#667eea`/`#764ba2` **and their rgba forms** `rgba(102,126,234)` / `rgba(168,85,247)` → **CLEAN**. See *Fixes applied* #1. |
| Correct logo per background (light‑on‑light, white‑on‑dark) | PASS | Single source `theme/brand.js` (`LOGO_LIGHT` / `LOGO_WHITE`); Header/Footer/drawers pick by surface. |
| Favicon + tab title are brand | PASS | `public/favicon.svg` = custom brass script “This” mark on charcoal; `<title>THIS Interiors — Curated Home Décor`; `manifest.json` + `theme-color` (`#f6f2ec` / `#1a1815`) on‑brand. |
| Bespoke luxury layout (mega‑menu, cinematic hero, curated discovery, premium cart drawer, dark footer) | PASS | Distinct from boilerplate; hero reads banners API and excludes stock gradient banners. |
| Light + dark both correct | PASS | `:root` + `body.dark` token sets; `ThemeContext` toggles `body.dark/.light` and persists to `localStorage`. |

The only raw hex remaining in component CSS is in `Footer.module.css` / `Newsletter.module.css`
(`--sf-color-danger:#e98b7e`, `--sf-color-success:#6bbf8a`) — **intentional, documented**
overrides that pin the *dark‑palette* semantic colours on those always‑dark surfaces (no
`--sf-color-dark-danger/success` token exists). Values match the dark‑mode tokens exactly.

## 2. Feature parity — all API‑driven, dual‑mode `api.js` — **PASS**

| Area | Result | Notes |
|---|---|---|
| Catalogue / categories / search | PASS | Home, mega‑menu (admin categories, slug URLs, refetch on focus), `/products` filters/sort/pagination (reads `meta`), search overlay (scoring, recent in localStorage, trending). |
| PDP | PASS | Slug routing + legacy numeric‑id redirect (canonicalises via `navigate(replace)`), gallery/zoom, variant swatches + per‑variant stock, qty, Add‑to‑Cart, Buy‑Now, trust/delivery from live settings/shipping, related + FBT (render‑nothing‑if‑empty), reviews. |
| Reviews | PASS | **Approved‑only** on PDP (API filters `status`), **purchase‑gated** writes (signed‑in + delivered order containing the product; carries `orderId`/`orderNumber`; re‑enters `pending`). |
| Cart / checkout | PASS | Cart drawer line key `` `${productId}-${variantId}` `` (recomputed, caller can’t override), free‑shipping progress; Checkout Cart→Shipping→Payment(store credit + COD)→Review; coupon validate + auto‑remove; **money math** `total = subtotal − discount + shipping + tax`, store credit applied last → `amountPayable`; order create + confirmation. |
| Auth / account | PASS | Login/register + Remember‑me (`authStorage` persist vs session), profile update, addresses CRUD/default, change password, **store‑credit wallet** balance + ledger, order history (cancel→refund cascade / return eligibility / track / review status). |
| Wishlist | PASS | Guest localStorage → **syncs to account on login** (merge + upload guest‑only), sort, add/move‑to‑cart. |
| Special Offers | PASS | `dealsConfig` toggle gates page+nav, countdown, coupons, deal‑of‑the‑day, category deals — config‑driven. |
| Newsletter / Support | PASS | Submissions create leads (`apiService.leads.createNewsletter` / `createContact`). |
| Currency | PASS | `formatCurrency` defaults to **AED** (`en‑AE` locale); no hardcoded price symbols in storefront JSX. |

**Runtime mock‑API smoke test** (`node server.js`, `:3001`):

```
products            200  19 rows      categories          200  16 rows
settings            200  THIS Interiors / AED / tax 5%      coupons   200  5 rows
reviews             200  7 rows       banners             200  3 rows
shipping_methods    200  4 rows       orders              200  11 rows
walletTransactions  200  3 rows       leads               200  4 rows
wishlist            200  3 rows       dealsConfig         200  enabled:true (+hero/timer/curated IDs)
```

Sample product: *“Lumière Fluted Glass Table Lamp”* (`slug`, `price` 640, `comparePrice`
820, 3 variants) — confirms the on‑brand editorial décor catalogue.

## 3. Admin untouched & functional — **PASS**

| Check | Result | Evidence |
|---|---|---|
| `git diff` shows no admin changes beyond the two logo constants | PASS | Only `src/components/AdminLayout/AdminLayout.js` and `src/pages/Admin/AdminLogin.js` changed vs `origin/main` — each a single `LOGO` constant (placeholder → THIS brand logo). `adminTheme.js` untouched. |
| Admin theme isolated from the storefront rebrand | PASS | `adminTheme.js` imports MUI only; **no admin file imports `theme/colors.js` or `theme/tokens.js`**, so the brass/AED rebrand cannot bleed into the slate/indigo admin. |
| All admin modules + cascades | PASS (by construction) | Routes for Dashboard, Products, Categories, Orders, Returns, Payments, Users, Shipping, Coupons, Special Offers, Reviews, Leads, Settings all present and unchanged; storefront reads the same collections the admin writes (categories→mega‑menu, reviews→PDP, deals→nav/page, order cancel/refund→history/wallet). |

The `tokens.js` radius edit (`{sm:2,md:4,…}`) and `colors.js` rebrand are part of the
shared/storefront MUI layer; verified **only storefront components** consume them.

## 4. Quality — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Responsive 320–1440, keyboard, AA, visible focus, alt text, reduced‑motion | PASS | Skip‑link in `App.js`; single brass `:focus-visible` ring (`index.css`); `useReducedMotion` in 27 JS files + 21 CSS `prefers-reduced-motion` blocks; tap‑target/responsive tokens (Prompts 27–28 hold). |
| No console errors/warnings; images lazy‑load + fall back via `onImageError`; reasonable perf | PASS | Clean production build; `onImageError`/`PLACEHOLDER_IMG` used across 19 storefront files (now incl. OrderHistory — *Fixes* #2); `loading="lazy"` throughout. |

## 5. Production contract smoke (`REACT_APP_USE_MOCK_API=false`) — **PASS (code path)**

- `extractData()` handles **both** JSON‑Server (returns `response.data`) and Laravel
  (`{success,data,meta}` → `response.data.data`); `extractMeta()` reads pagination;
  `getErrorMessage()` parses Laravel error shapes.
- `api.js` branches paths on `IS_MOCK_API` (e.g. `/shipping_methods` vs `/shipping/methods`),
  so no `{success,data,meta}` assumption is broken.
- `.env.production` is set to `REACT_APP_USE_MOCK_API=false` + the live Laravel base URL.
- Both branches live in one file and **compile clean** in the production build (no live
  backend needed to verify the contract).

---

## Fixes applied during QA (storefront‑only, minimal)

1. **`src/App.css` — purged residual stock purple.** Three spots in the *dead* legacy
   decorative utilities (`.glass-effect`, `.neon-glow`, `@keyframes pulse-glow`; zero JS
   usages) still carried the stock palette in rgba form — `rgba(102,126,234)` = `#667eea`
   and `rgba(168,85,247)` (purple). Re‑pointed to brand brass `rgba(157,110,46,…)`,
   completing the Prompt‑01 token migration the file documents. No visual change (classes
   are unused); removes the last stock‑purple from storefront CSS.
2. **`src/pages/OrderHistory/OrderHistory.js` — brand‑consistent image fallback.** Two
   order‑item thumbnails fell back to an **external** `placehold.co` URL and lacked an
   error handler. Switched to the storefront’s standard no‑network `PLACEHOLDER_IMG` and
   added `onError={onImageError}` + `loading="lazy"`, matching CartDrawer/ProductCard/FBT.

Both verified by a clean re‑build. No API/data contract, schema, cart‑key, money‑math,
slug‑routing, or admin change.

## Follow‑ups (non‑blocking, optional)

- **Tax fallback default.** `Checkout.js` uses `storeSettings?.store?.taxRate ?? 18` — the
  `18` is a stale India‑era GST default. It never renders when settings load (live value
  is **5%** UAE VAT), so left as‑is; if hardened, prefer `?? 0` (don’t guess tax) over a
  region‑specific number.
- **Dark‑surface semantic tokens.** Footer/Newsletter hardcode the dark‑palette
  `danger`/`success` hex because no `--sf-color-dark-danger/success` token exists. Adding
  those two tokens would let those surfaces reference tokens instead of literals (token‑layer
  cleanup, no behaviour change).
- “Google/Facebook sign‑in is coming soon” tooltips on the deliberately‑disabled social
  buttons (`AuthModal`) — intentional; remove the buttons if social auth won’t ship.

## Verdict

Storefront is **cohesive, on‑brand, and feature‑complete**; the admin is **unchanged
beyond the two Prompt‑29 logo constants** and fully functional. All Prompt‑30 verification
sections pass, with two small storefront fixes applied and re‑verified.
