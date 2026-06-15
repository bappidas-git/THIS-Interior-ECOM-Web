# THIS Interiors Storefront — Prompt 28: Responsive & Accessibility Pass
**Prompt 28 of 30**

## Depends on
All visual prompts (**03–24**, **27**). Run as a sweep after the surfaces exist.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). Breakpoints live as tokens/constants (`--sf-*`/`BREAKPOINTS` xs480/sm768/md1024/lg1280/
xl1440); the tap‑target token is `--sf-tap-target: 44px`. This pass makes **every storefront surface**
excellent across mobile/tablet/desktop and accessible — without changing any flow or data.

## Objective
A storefront‑wide **responsive + accessibility sweep**: verify and fix layout at every breakpoint,
semantic HTML, keyboard operability, visible focus, colour contrast, alt text, form labels, ARIA on
custom widgets, and reduced‑motion — leaving all functionality and the admin untouched.

## Scope — files & areas to touch
- Any storefront surface needing fixes: Header/mega‑menu (03), footer (04), mobile nav/drawers (05),
  home (06–08), product card (09), listing (10), search (11), PDP (12–13), cart/sticky bar (14),
  wishlist (15), offers (16), auth (17), account (18–20), order history (21), checkout (22),
  confirmation (23), static/legal (24). CSS modules + small markup/ARIA fixes only.
- `public/index.html` is fine as‑is; keep `<meta viewport>`.

## Brand & design requirements (quality bar)
- **Responsive:** no horizontal scroll/overflow at 320–1440px; grids reflow sensibly (cards 1→2→3→4);
  the mega‑menu collapses to the sidebar on mobile; sticky elements (header, cart footer, add‑to‑cart
  bar, sidebar filters) behave; images use correct aspect ratios and `srcset`/lazy where useful; text
  never clips; tap targets ≥44px.
- **Semantics:** one `<h1>` per page + logical heading order; `<nav>`/`<main>`/`<footer>`/`<section>`
  landmarks; lists for lists; buttons vs links used correctly (actions = `<button>`, navigation =
  `<a>`).
- **Keyboard:** everything operable by keyboard — mega‑menu flyouts, drawers, modals (focus trap +
  `Esc`), carousels (prev/next focusable), tabs (roving tabindex/`aria-selected`), accordions
  (`aria-expanded`/controls), swatches (radiogroup), pagination. Logical tab order; no keyboard traps.
- **Focus visible:** a clear brass focus ring (token) on every interactive element; never `outline:
  none` without a replacement.
- **Contrast:** brass‑on‑cream, ink‑on‑cream, and white/ink on dark sections all meet **WCAG AA** (4.5:1
  text / 3:1 large + UI). Don't rely on colour alone (badges/status carry text).
- **Alt text & labels:** meaningful `alt` on content images (empty `alt=""` on decorative); every form
  field has an associated `<label>`/`aria-label`; icon‑only buttons have accessible names.
- **Reduced motion:** confirm Prompt 27's guards hold everywhere.

## Functional guardrails (must not break)
- **No flow/data/logic changes** — visual/markup/ARIA only. Don't alter props, routes, money math,
  cart/line keys, or the API contract. Admin untouched.
- Fixes must not regress the redesign's look — keep it on‑brand while making it robust.

## Implementation notes
- Sweep methodically surface‑by‑surface at 360/768/1024/1280 widths; use the browser a11y inspector +
  keyboard‑only navigation + an axe/Lighthouse pass.
- Prefer fixing at the **token/primitive** layer (02) when an issue is global (focus ring, tap target,
  contrast) so it propagates.

## Acceptance criteria
- [ ] No overflow/broken layout at 320–1440px on any storefront surface; grids/sticky/images behave;
      tap targets ≥44px.
- [ ] Semantic landmarks + heading order correct; keyboard operates every widget (menus, drawers,
      modals, carousels, tabs, accordions, swatches, pagination) with focus trap/`Esc` where modal.
- [ ] Visible brass focus everywhere; AA contrast in light/dark + dark sections; status not colour‑only.
- [ ] Meaningful alt text + labelled fields + named icon buttons; reduced‑motion holds; admin untouched.

## Test & QA
- Resize each page through the breakpoints; rotate mobile. Keyboard‑only traverse a full purchase:
  browse → PDP (swatches/gallery) → add → cart drawer → checkout steps → place order → confirmation;
  and account/auth/wishlist/search/menus.
- Run Lighthouse/axe on Home, Products, PDP, Checkout → resolve serious a11y issues. Verify contrast on
  brass CTAs + dark footer. Screen‑reader spot‑check landmarks + icon buttons. `/admin` untouched.
