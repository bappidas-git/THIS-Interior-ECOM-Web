# THIS Interiors Storefront — Prompt 03: Header & Structured Mega‑Menu
**Prompt 3 of 30**

## Depends on
**01** (tokens/fonts/logos), **02** (primitives). The mobile drawer/sidebar restyle is **05**; the
cart drawer it opens is **14** — keep their existing open/close wiring here.

## Context
THIS Interiors is an editorial luxury home‑décor boutique. The current `Header`
(`src/components/Header/Header.js` + `Header.module.css`) is a **dense, stock marketplace bar**:
a 3‑tier layout (top utility bar, main bar with a `ShoppingCart` icon + `APP_NAME` text logo + search
+ account/wishlist/cart, then a horizontal **category bar** with an "All Categories" dropdown and
"Today's Deals"). It fetches categories via `apiService.categories.getAll()` (refetches on window
focus) and uses `useAuth`, `useCart`, `useWishlist`, `useDealsConfig`, and `categoryParam()`. Data is
API‑driven (dual‑mode `api.js` + `db.json`). **Logos:** light
`…/THIS-LOGO_fazfcq.png`, white `…/THIS-LOGO-WHITE_vdltz8.png`.

## Objective
Replace the dense category bar with a **structured, editorial mega‑menu** — a high‑end boutique
header with a **prominent (centred) brand logo**, refined search/account/cart/wishlist affordances,
and **collection flyouts that group links under section headings** with room for an editorial feature
panel/image inside the menu. The header must read as a clear departure from the boilerplate while
keeping all dynamic, admin‑managed category data and the canonical category URL scheme intact.

## Scope — files & areas to touch
- `src/components/Header/Header.js` — restructure the layout + mega‑menu; keep all data hooks and
  navigation targets.
- `src/components/Header/Header.module.css` — full restyle to tokens; remove hardcoded
  `#667eea/#764ba2/#232f3e/#f5f7fa` etc.
- Import the brand logo source from Prompt 01 (replace the `ShoppingCart` icon + `APP_NAME` text mark
  at the logo `<Link>`).
- Do **not** re‑implement category grouping logic — reuse `src/utils/categories.js`
  (`getMainMenuCategories`, `orderCategoriesHierarchically`, `categoryParam`).

## Brand & design requirements
- **Composition:** a slim, calm header on a light/`surface` background. Prominent **centred logo**
  (light logo on the light header). A thin utility line may carry the assurance message + account/
  support, but keep it understated (hairline divider, muted ink) — far lighter than the current top
  bar.
- **Mega‑menu flyouts:** hovering/focusing a top‑level collection opens a **full‑width (or wide)
  panel** that groups its child categories under **section headings** (e.g. *Living Room*, *Lighting*,
  *Wall & Art*, *Tabletop*, *Textiles*), with generous spacing, hairline column rules, and a reserved
  **editorial feature panel** (image + short caption + "Shop the edit" link) on one side. Headings in
  serif; links in sans. Populate **from the real category tree** (parents = headings, their children =
  links), honouring `isActive`, `sortOrder`, and `showInMainMenu`/`menuOrder`.
- **Logo per background:** light logo here; if you add any dark/overlay header variant, switch to the
  white logo.
- **Search / account / cart / wishlist:** keep all four entry points but render them as quiet icons
  with the brass accent on hover; cart + wishlist **count badges** stay live. Search opens the
  existing `SearchModal`; account opens `AuthModal` or the account menu; cart opens `CartDrawer`.
- **Today's Deals** entry still appears only when `useDealsConfig().enabled`.
- **Motion:** slow, soft fade/slide for flyouts; honour `prefers-reduced-motion`. Optional refined
  sticky/condense‑on‑scroll behaviour (calm, no bounce).
- **Mobile:** the hamburger still opens `SidebarMenu` (restyled in 05); keep the trigger + the mobile
  search/cart affordances. Ensure the centred‑logo layout collapses gracefully.

## Functional guardrails (must not break)
- Keep **all** hooks and their usage: `useAuth` (login/menu), `useCart` (`getCartItemCount`, open
  drawer), `useWishlist` (`getWishlistCount`), `useDealsConfig` (`enabled`), `useTheme` (dark toggle),
  and `apiService.categories.getAll()` with the **refetch‑on‑window‑focus** behaviour (so admin
  category edits still appear live).
- **Canonical category URLs** must stay slug‑based via `categoryParam()` (e.g.
  `/products?category=<slug>`); the "All categories"/"Shop all" links and every flyout link must
  resolve to the same scheme the `Products` page reads.
- Preserve the cart/wishlist **badge counts**, the search‑modal and cart‑drawer **open triggers**, the
  account/login entry, the theme toggle, and the admin‑managed menu source. **No API signature
  changes.** Admin untouched.

## Implementation notes
- Reuse `getMainMenuCategories(categories)` for the top‑level menu items and
  `orderCategoriesHierarchically(categories)` (or `getCategoryScopeIds`/children lookups) to build
  each flyout's grouped links — do not hand‑roll a parallel tree.
- The editorial feature panel image can be a tokenized placeholder now (reuse the app's image
  fallback `onImageError`); real curated imagery can be seeded later. Keep it data‑light and honest
  (no fake "bestseller" claims).
- Keep keyboard access: top‑level items are focusable, flyouts open on focus, `Esc` closes, links are
  reachable by `Tab`, and the menu has appropriate `aria-haspopup`/`aria-expanded`/roles.
- Replace hardcoded colours with tokens; titles use `--sf-font-display`.

## Acceptance criteria
- [ ] Header shows a **prominent centred THIS Interiors logo** (light logo) and reads as an editorial
      boutique header, visibly different from the stock category bar.
- [ ] Top‑level collections open **grouped mega‑menu flyouts** (section headings + links + a feature
      panel), populated from the live category tree and honouring active/sort/menu flags.
- [ ] All flyout/"shop all" links use the canonical **slug** category URL scheme and land on the
      correct `Products` filter.
- [ ] Search, account, cart (live badge), wishlist (live badge), dark toggle, and conditional Today's
      Deals all work via their existing triggers.
- [ ] Mobile hamburger opens the sidebar; layout is responsive; flyouts honour reduced‑motion.
- [ ] No hardcoded hex left in `Header.module.css`; `/admin` unchanged.

## Test & QA
- Hover/focus each top‑level collection → grouped flyout appears with the right children; click a
  child → `Products` filters by that category (URL shows the slug).
- Add an item to cart and to wishlist → header badges update; open the cart drawer + search modal from
  the header.
- In `/admin → Categories`, toggle a category's "show in menu"/active or reorder, return to the
  storefront, refocus the window → the menu reflects the change.
- Test login/account entry + dark toggle. Resize to mobile/tablet/desktop. Keyboard‑navigate the menu
  and `Esc` to close. Confirm reduced‑motion. Confirm `/admin` untouched & functional.
