# THIS Interiors Storefront — Prompt 10: Products Listing Page
**Prompt 10 of 30**

## Depends on
**01** (tokens), **02** (primitives), **09** (ProductCard). Uses `BottomDrawer` (05) for the mobile
filter sheet.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/Products/Products.js` (+ `Products.module.css`) is the catalogue listing:
`Breadcrumb` → desktop **filter sidebar** (categories hierarchical w/ descendant counts, price range,
rating, discount, brand checkboxes, in‑stock toggle, search) + main area (**sort bar**, grid/list
toggle, product grid, pagination, mobile filter sheet). It reads **URL params**: `category`
(comma‑separated **slugs**), `search`, `sort`, `page`, `per_page`, `min_price`, `max_price`; legacy
numeric category ids are canonicalized to slugs in‑place via `src/utils/categories.js`. Data via
`apiService.products.getAll()` + `apiService.categories.getAll()`; cards use `useCart`/`useWishlist`.
CSS currently hardcoded hex (no tokens).

## Objective
Restyle the listing into an **airy editorial catalogue**: refined filters, a calm sort/view bar,
generous grid (and a tidy list mode), elegant pagination, and breathing‑room breadcrumbs — while
keeping the full filter/sort/pagination logic and the **category‑slug URL scheme** exactly intact.

## Scope — files & areas to touch
- `src/pages/Products/Products.js` — markup/structure + class names only; **do not change** the
  filtering/sorting/pagination/URL‑param logic.
- `src/pages/Products/Products.module.css` — full restyle to `--sf-*` tokens (the file maps local
  aliases like `--card-bg`/`--accent` onto `--sf-*` per the UX guidelines — keep that pattern).
- Reuse the restyled `ProductCard` (09) for tiles; use `BottomDrawer` (05) for the mobile filter sheet
  if appropriate.

## Brand & design requirements
- **Filters (desktop sidebar):** quiet, hairline‑separated filter groups with serif group labels;
  restrained controls (tokenized checkboxes/radios, a calm price range, star‑rating filter, discount,
  brand list, in‑stock toggle). Keep counts but only **real** counts. Collapsible groups welcome.
- **Sort + view bar:** a slim bar with a refined sort `select` (Relevance, Price low/high, Newest,
  Rating, Popularity) and a grid/list toggle; show the result count and active‑filter chips
  (removable). Airy, hairline‑bottomed.
- **Grid:** fewer‑per‑row, larger cards with generous gutters (e.g. 2–4 columns responsive) — editorial,
  not a cramped 5‑up. **List mode:** a calm horizontal row (image left, details right).
- **Pagination:** understated numbered pagination with prev/next + ellipsis; brass active page.
- **Breadcrumbs:** airy `Home › Products › <Category>` using the shared `Breadcrumb`.
- **Empty/loading:** brand skeletons (from 02) + an honest "No products match" empty state with a
  "clear filters" action.

## Functional guardrails (must not break)
- **URL contract is sacred:** keep reading/writing `category` (comma‑separated **slugs**), `search`,
  `sort` (+ its aliases like `price_asc→price-low`), `page`, `per_page`, `min_price`, `max_price`; keep
  canonicalizing legacy numeric category ids → slugs in place. Deep links + back/forward must still
  work.
- Keep **hierarchical category filtering** (selecting a parent includes its descendants via
  `getCategoryScopeIds`/`getDescendantIds`) and the descendant‑inclusive counts.
- Keep sort/pagination math, the grid/list toggle, and the mobile filter sheet behaviour. Cards keep
  quick‑add (`buildCartItem` + `useCart`) and wishlist toggle.
- Tokenize colours; reuse `ProductCard`. API‑driven; admin untouched; no schema changes.

## Implementation notes
- Touch **structure/classes**, not logic — wrap/reorder existing elements; keep the existing state and
  effects that parse/update the query string.
- If you add active‑filter chips, derive them from current state and have "remove" update the same URL
  params the page already manages.
- Ensure the desktop sidebar is sticky and the mobile sheet uses the tokenized `BottomDrawer`.

## Acceptance criteria
- [ ] Listing restyled to an airy editorial catalogue (refined filters, slim sort/view bar, generous
      grid + tidy list, understated pagination, airy breadcrumbs) — fully tokenized.
- [ ] All filters/sort/pagination still work; the **category‑slug URL scheme** + legacy‑id
      canonicalization + hierarchical (descendant‑inclusive) filtering are intact.
- [ ] Cards (reused `ProductCard`) quick‑add + wishlist work; honest empty/loading states.
- [ ] Responsive (mobile filter sheet); reduced‑motion; no hardcoded hex; `/admin` untouched.

## Test & QA
- Deep‑link `/products?category=<slug>&sort=price-low&min_price=…&page=2` → correct filtered, sorted,
  paginated results; toggle grid/list; change sort/per‑page; add/remove filter chips; clear filters.
- Select a parent category → includes children's products; counts match. Search within listing.
- Quick‑add + wishlist from a card; open a PDP. Mobile: open the filter sheet, apply, close.
- Back/forward navigation preserves state. Reduced‑motion; dark mode; `/admin` untouched.
