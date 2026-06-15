# THIS Interiors Storefront — Prompt 02: Global UI Primitives Restyle
**Prompt 2 of 30**

## Depends on
**Prompt 01** (design system & tokens) — consume its `--sf-*` tokens and the serif/sans fonts.

## Context
THIS Interiors is an editorial, warm‑minimalist luxury home‑décor storefront built on a token‑driven
CRA React app (`--sf-*` tokens in `src/theme/storefront-tokens.css`, MUI in `src/theme/colors.js` +
`ThemeContext`). Data stays API‑driven via dual‑mode `src/services/api.js` + `db.json`. This prompt
makes the **shared, low‑level UI vocabulary** feel like THIS Interiors so every later page inherits a
consistent, refined baseline.

## Objective
Restyle the **global primitives and shared building blocks** to the new tokens: buttons, form
inputs/selects/checkboxes, badges/chips/pills, card/panel shells, tabs, the SweetAlert2 toast theme,
and loaders/skeletons — plus the shared `Breadcrumb` and the `ErrorBoundary` fallback. Establish the
calm, hairline‑ruled, brass‑accented look that the rest of the build relies on.

## Scope — files & areas to touch
- `src/theme/storefront-tokens.css` — add any **shared component tokens** still missing (focus ring,
  chip bg, skeleton shimmer, hairline divider) so primitives never hardcode hex.
- `src/components/Breadcrumb/Breadcrumb.module.css` (+ `.js` only if markup needs semantics) — airy,
  hairline‑separated breadcrumb with brass hover.
- `src/components/ErrorBoundary/ErrorBoundary.js` — restyle the fallback UI to brand (it currently
  uses its own inline light/dark colours); keep the reload/go‑home actions.
- **SweetAlert2 theme:** create/extend a shared helper (e.g. `src/utils/swal.js` if absent, or a
  global CSS override targeting `.swal2-*`) so all `Swal.fire` toasts/confirms (used in
  `OrderHistory`, `Profile`, `Checkout`, contexts) adopt brand colours, serif titles, brass confirm
  button, calm radius. Do **not** change any call sites' logic — only the theme.
- **Shared skeletons/loaders:** the inline skeletons/spinners used across pages (e.g.
  `Products`, `Wishlist`, `SpecialOffers`, `SearchModal`) — define a tokenized shimmer so later
  prompts reuse it. Where a reusable skeleton/spinner doesn't exist, add a tiny shared CSS utility in
  the token/global layer; do not over‑engineer.
- `src/App.css` / `src/index.css` — only global element defaults (focus‑visible ring, selection
  colour, link colour, base body type) → tokens.

## Brand & design requirements
- **Buttons:** primary = solid **brass accent** (`--sf-color-primary`) with `--sf-color-primary-
  contrast` text, calm radius (`--sf-radius-md`), generous horizontal padding, **letter‑spacing on
  uppercase labels** for an editorial feel; subtle hover (slight darken/lift, slow transition).
  Secondary = "ghost"/outline with a hairline `--sf-color-border` and brass text on hover. Tertiary =
  quiet text link with a thin underline on hover. No loud gradients.
- **Inputs/selects/textareas:** white/`surface` fill, **hairline border**, brass focus ring
  (`--sf-shadow-focus`), comfortable height (≥44px tap target), muted placeholder, serif **labels**
  optional but body text in sans. Error state uses `--sf-color-danger`.
- **Badges/chips/pills:** restrained — sand/greige fill (`--sf-color-surface-2` / `--sf-color-badge-
  bg`), uppercase micro‑label, used for "New", discount %, category chips. Discount/savings keep
  `--sf-color-discount*`. **Never** invent urgency styling.
- **Cards/panels/shells:** flat `surface` with a **hairline border** instead of heavy shadow; on
  hover, a soft lift using `--sf-shadow-sm`. Calm radii.
- **Tabs:** quiet underline/active‑ink style (used by PDP, Checkout steps, Profile, Help). Active =
  brass underline; inactive = muted ink.
- **Toasts/dialogs (SweetAlert):** brand surface, serif title, brass primary action, hairline
  borders, calm motion.
- **Skeletons:** warm greige base with a subtle shimmer; respect reduced‑motion.

## Functional guardrails (must not break)
- **Visual only.** Do not change any component's props, exported names, event handlers, or the
  `Swal.fire(...)` option keys that callers pass — only theme/CSS. The confirm/cancel **return
  values** SweetAlert produces must be unchanged so cancel/return/logout flows still work.
- `ErrorBoundary` must still catch errors and offer reload / go‑home.
- `Breadcrumb` keeps its `items` prop contract (`[{ label, link? }]`).
- Consume `var(--sf-*)`; **add tokens rather than hardcoding hex**. Do not touch the admin or
  `adminTheme.js`. No API/data changes.

## Implementation notes
- Prefer a small number of **reusable CSS Module classes / utility classes** over per‑page bespoke
  buttons; later prompts will reference these. If the repo lacks a shared `Button` component (it
  relies on MUI `Button` + CSS‑module buttons), then: (a) tune the MUI `MuiButton` overrides in
  `ThemeContext` for the MUI‑based buttons, and (b) define brand button classes in the token/global
  CSS for the CSS‑module buttons. Document both so later prompts pick the right one.
- Keep MUI overrides in `ThemeContext` aligned with the CSS‑module styles so MUI and module buttons
  look identical.
- Reduced‑motion: ensure shimmer/transitions collapse when `prefers-reduced-motion: reduce`.

## Acceptance criteria
- [ ] Primary/secondary/tertiary button styles exist and read as brass‑accented editorial buttons,
      tokenized, consistent across MUI + CSS‑module buttons.
- [ ] Inputs/selects/checkboxes show hairline borders + brass focus ring + ≥44px targets.
- [ ] Badges/chips, cards/panels, and tabs match the calm hairline aesthetic via tokens.
- [ ] SweetAlert dialogs/toasts are brand‑themed but return the same values; `ErrorBoundary` and
      `Breadcrumb` restyled with contracts intact.
- [ ] No new hardcoded hex in touched files; reduced‑motion respected.

## Test & QA
- Trigger a few primitives in context: add to cart (toast), a `Profile` save (toast), an
  `OrderHistory` cancel confirm (SweetAlert), a form focus (ring). Verify brand look + that the
  confirm/cancel outcomes still fire the right actions.
- Force an error (temporarily throw in a component) to view the `ErrorBoundary` fallback, then revert.
- Check focus‑visible outlines via keyboard `Tab`; check contrast of brass‑on‑cream and ink‑on‑cream.
- Toggle dark mode; confirm primitives adapt. Confirm `/admin` unchanged and functional.
