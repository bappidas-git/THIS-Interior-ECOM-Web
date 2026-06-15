# THIS Interiors Storefront — Prompt 05: Mobile Nav, Sidebar & Drawer Shells
**Prompt 5 of 30**

## Depends on
**01** (tokens/fonts/logos), **02** (primitives), **03** (header, which triggers the sidebar).

## Context
THIS Interiors — editorial luxury home‑décor boutique on a token‑driven CRA app. The mobile shells:
- `src/components/BottomNav/BottomNav.js` — fixed bottom bar (Home, Categories, Search→modal, Wishlist
  w/ badge, Account); auto‑hides on scroll‑down.
- `src/components/SidebarMenu/SidebarMenu.js` — slide‑out panel: hero (brand mark + `APP_NAME` text +
  user/guest card), Discover quick‑links (Trending, Today's Deals [HOT], New Arrivals, Best Sellers,
  Special Offers), expandable "Shop by Category" (lazy `apiService.categories.getAll()`, hierarchical),
  My Account links, Settings (Help, Dark‑mode toggle), footer legal. Uses `useAuth`, `useDealsConfig`,
  category icon rules; props `open`, `onClose`, `onOpenAuth`.
- `src/components/BottomDrawer/BottomDrawer.js` — generic slide‑up sheet (`open`, `onClose`, `title`,
  `children`) used for mobile sheets (e.g. filters).

Data stays API‑driven (dual‑mode `api.js` + `db.json`). **Logos:** light `…/THIS-LOGO_fazfcq.png`
(light surfaces), white `…/THIS-LOGO-WHITE_vdltz8.png` (dark).

## Objective
Restyle these mobile shells into the calm editorial language: a refined bottom nav, an elegant
slide‑out sidebar with the correct logo and airy grouped navigation, and a tokenized bottom‑sheet —
all responsive, accessible, and reduced‑motion safe — while keeping their open/close wiring, the
admin‑managed category tree, the deals gating, the dark‑mode toggle, and the auth entry point.

## Scope — files & areas to touch
- `src/components/BottomNav/BottomNav.js` + `.module.css`
- `src/components/SidebarMenu/SidebarMenu.js` + `.module.css`
- `src/components/BottomDrawer/BottomDrawer.js` + `.module.css`
- Import the brand logo source (Prompt 01) for the sidebar hero (replace `ShoppingCart` icon +
  `APP_NAME`).

## Brand & design requirements
- **BottomNav:** quiet, hairline‑topped bar on `surface`; minimal line icons; active item marked with
  the brass accent; keep the wishlist **badge** and the search‑modal trigger; keep the
  hide‑on‑scroll‑down behaviour but make it smooth/slow.
- **SidebarMenu:** pick the logo to match the panel background (white logo if you make the hero a dark
  charcoal band; light logo on a cream panel). Replace the colourful tone‑chips (`toneIndigo`,
  `toneViolet`, …) with **restrained monochrome/brass** iconography. Group with serif section labels +
  hairline dividers; generous spacing. Keep the user/guest card, the expandable category tree (lazy
  load preserved), the quick‑links (deal links gated by `useDealsConfig`), My Account, Help, and the
  **Dark Mode toggle**.
- **BottomDrawer:** tokenized sheet — `surface` background, calm radius on the top corners, a quiet
  grab handle, serif title, hairline header divider.
- **Motion:** slow spring/slide; honour `prefers-reduced-motion`; keep body‑scroll‑lock + `Esc` close
  + focus management.

## Functional guardrails (must not break)
- Preserve **all props and wiring**: `SidebarMenu({open,onClose,onOpenAuth})`, `BottomDrawer({open,
  onClose,title,children})`, and `BottomNav`'s search‑modal + wishlist badge + route targets.
- Keep the sidebar's **lazy** `apiService.categories.getAll()` load, the hierarchical parent/child
  expand, and the canonical **slug** category links (`categoryParam`).
- Keep `useDealsConfig().enabled` gating on deal/special‑offer links, the `useAuth` user/guest states +
  logout, and the dark‑mode toggle behaviour.
- Tokenize colours (no `toneX` hardcoded gradients left as raw hex). Admin untouched; no API changes.

## Implementation notes
- Reuse the category helpers from `src/utils/categories.js`; don't duplicate tree logic.
- Keep the category **icon mapping** but recolour to monochrome/brass via tokens (a single accent, not
  a rainbow).
- Ensure tap targets ≥44px (`--sf-tap-target`) and that the active route is visually clear for a11y.

## Acceptance criteria
- [ ] BottomNav restyled (hairline, brass active, live wishlist badge, search trigger, smooth
      hide‑on‑scroll) and tokenized.
- [ ] SidebarMenu restyled with the **correct logo per its background**, restrained monochrome/brass
      icons, serif grouped labels, working category tree (lazy), deal gating, auth states, and dark
      toggle.
- [ ] BottomDrawer tokenized sheet with handle/title/divider.
- [ ] All props/wiring preserved; reduced‑motion + ≥44px targets + `Esc`/scroll‑lock intact; no raw
      hex; `/admin` unchanged.

## Test & QA
- On a mobile viewport: open the sidebar from the header hamburger; expand "Shop by Category" → lazy
  loads + navigates by slug; tap quick‑links; toggle dark mode; sign‑in entry opens `AuthModal`;
  logout works.
- Confirm BottomNav hides on scroll‑down/reappears on scroll‑up, wishlist badge is live, search opens
  the modal.
- Open a BottomDrawer (e.g. mobile filters once Products is built) to confirm the sheet styling.
- Disable deals in admin → deal links hide in the sidebar. Verify reduced‑motion, focus, `Esc`, and
  that `/admin` is untouched.
