# THIS Interiors Storefront — Prompt 11: Search Overlay & Empty States
**Prompt 11 of 30**

## Depends on
**01** (tokens), **02** (primitives), **09** (ProductCard). Opened from the Header (03) and BottomNav
(05).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/components/SearchModal/SearchModal.js` (+ `.module.css`, `index.js`) is a full‑screen
search overlay: a search input, **category filter chips** (from the live top‑level category tree),
and a content area showing **Recent Searches** (localStorage, max 8) + **Trending Searches** when
empty, or **debounced (300ms) relevance‑scored results** (capped ~12) with a "View all results" →
`/products?search=…`. It lazily fetches + **caches** products/categories at module scope
(`apiService.products.getAll()` + `categories.getAll()`), uses `buildCategoryNav`/`resolveCategory`/
`matchesCategoryChip`/`scoreProduct`, locks body scroll, closes on `Esc`. Props: `open`, `onClose`.

## Objective
Restyle the search overlay into a **calm editorial search**: a serene full‑bleed surface, a large
refined search field, restrained category chips, elegant result rows/cards, and honest empty/no‑result
states — while keeping the relevance scoring, caching, recent/trending, category filtering, and "view
all" routing intact.

## Scope — files & areas to touch
- `src/components/SearchModal/SearchModal.js` — markup/structure + classes only; **keep** the search/
  scoring/cache/recent logic.
- `src/components/SearchModal/SearchModal.module.css` — full restyle to tokens.
- Reuse the restyled `ProductCard` (09) or a compact result row consistent with it.

## Brand & design requirements
- **Surface:** a serene overlay (warm `surface` with a soft tokenized backdrop), generous padding,
  serif section labels ("Recent", "Trending", "Results"), hairline dividers.
- **Search field:** large, quiet, with a brass focus ring and a clear affordance; the close affordance
  is understated.
- **Category chips:** restrained sand/greige pills (the active one brass‑outlined), from the **real**
  top‑level categories; filtering must still match a category slug + all descendant slugs.
- **Results:** elegant grid/rows using the editorial card aesthetic; show the real result count + a
  quiet "View all results" link. Decimal star ratings render correctly (the existing half‑fill).
- **Empty / no‑results:** honest, calm states — no fabricated "popular" claims beyond the real
  recent/trending data the component already uses.
- **Motion:** soft scale/fade in; reduced‑motion safe.

## Functional guardrails (must not break)
- Keep the **module‑level cache** + lazy fetch, the **debounced relevance scoring** (`scoreProduct`),
  the **recent searches** (localStorage, max 8, saved on navigate/select), **trending**, the
  **category chip** matching (slug + descendants), body‑scroll lock, and `Esc` close.
- Keep props `open`/`onClose`, the `index.js` export, and "View all results" → `/products?search=…`.
  Product clicks navigate via the product path and save the recent search.
- Tokenize colours. API‑driven; admin untouched; no schema changes.

## Implementation notes
- Touch structure/classes, not the search algorithm or cache. Reuse `ProductCard` or keep a compact
  result tile that matches it.
- Ensure keyboard flow: focus the input on open, results reachable by `Tab`, `Enter` on a result
  navigates, `Esc` closes; the overlay traps focus appropriately.

## Acceptance criteria
- [ ] Search overlay restyled to a calm editorial surface (serif labels, refined field, restrained
      chips, elegant results) — fully tokenized.
- [ ] Relevance scoring, caching, recent/trending, category‑chip (slug+descendant) filtering, and
      "view all" routing all still work; results capped as before.
- [ ] Honest empty/no‑results states; reduced‑motion + keyboard accessible; no hardcoded hex.

## Test & QA
- Open search from the header + bottom nav; type a query → debounced, relevance‑ordered results;
  filter by a category chip; click "View all" → `/products?search=…`; click a result → PDP + the query
  is saved to recent.
- Clear the field → recent + trending show; clear recent. Query with no matches → honest empty state.
- Keyboard: focus input on open, `Tab` through results, `Esc` closes. Reduced‑motion; dark mode;
  `/admin` untouched.
