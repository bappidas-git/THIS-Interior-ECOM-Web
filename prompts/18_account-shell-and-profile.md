# THIS Interiors Storefront — Prompt 18: Account Shell & My Profile
**Prompt 18 of 30**

## Depends on
**01** (tokens), **02** (primitives). Sibling tabs are **19** (addresses/password) and **20** (wallet).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/pages/Profile/Profile.js` (+ `.module.css`) is the account hub with a sidebar/tabbed
layout: **My Profile** (firstName, lastName, email read‑only, phone → `updateUser`), My Addresses, My
Orders (→ `/orders`), **Store Credit** wallet, My Wishlist (→ `/wishlist`), **Change Password**, and
Logout (confirm). It uses `useAuth` (`user`, `isLoading`, `updateUser`, `logout`), a desktop user card
(avatar via `getInitials`), a mobile tab layout, and an auto‑dismiss feedback toast. Unauthenticated
users are bounced home after auth settles (no flash on reload).

## Objective
Restyle the **account shell** (sidebar/tab navigation, user card, page chrome, feedback toast) and the
**My Profile** tab into the editorial language — calm, hairline‑ruled, serif‑headed — while keeping the
tab navigation, the auth‑gate/redirect, and the profile update flow intact. (Addresses, password, and
wallet tabs are restyled in 19–20; keep them functional here.)

## Scope — files & areas to touch
- `src/pages/Profile/Profile.js` — the shell/tab nav + user card + the My Profile form structure/
  classes; keep all state, the `updateUser` flow, the redirect, and the other tabs' wiring.
- `src/pages/Profile/Profile.module.css` — restyle the shell + profile tab to tokens (19/20 continue
  the same stylesheet for their tabs).

## Brand & design requirements
- **Shell:** a serene account layout — a quiet left rail (desktop) of tabs with a brass active marker
  and serif labels, collapsing to a tidy tab row/select on mobile. A refined **user card** (monogram
  avatar via `getInitials`, name, email) with hairline framing.
- **My Profile form:** tokenized inputs in an airy two‑column (name) + single‑column layout, email
  shown read‑only/muted, a brass "Save changes" button, and the existing success/error **feedback
  toast** restyled (auto‑dismiss kept).
- **Logout:** keep the confirm (SweetAlert, themed in 02).
- **Motion:** calm tab transitions; reduced‑motion safe.

## Functional guardrails (must not break)
- Keep the **auth gate**: unauthenticated users redirect home after `isLoading` settles, with no flash
  for logged‑in users on reload.
- Keep `updateUser` (firstName/lastName/phone) with email read‑only, the validation (phone format), and
  the feedback toast. Keep tab navigation + the links to `/orders` and `/wishlist`.
- Don't break the Addresses / Change Password / Store Credit tabs (restyled next) — they must remain
  selectable and functional.
- Tokenize colours; admin untouched; no API/schema changes.

## Implementation notes
- Touch shell + profile tab structure/classes; leave the other tabs' internals to 19/20 but ensure the
  shared shell styles them consistently.
- Keep the desktop sidebar / mobile tabs responsive switch.

## Acceptance criteria
- [ ] Account shell restyled (serene tab rail + refined user card + tokenized chrome + restyled
      feedback toast) consistent across desktop/mobile + light/dark.
- [ ] My Profile updates firstName/lastName/phone via `updateUser` (email read‑only), with validation +
      toast; auth‑gate/redirect intact; other tabs still work.
- [ ] Tokenized; reduced‑motion safe; responsive.

## Test & QA
- Visit `/profile` logged out → redirected home (no flash when logged in on reload). Logged in: edit
  name/phone → Save → toast + persisted (reload to confirm). Navigate every tab; My Orders → `/orders`,
  My Wishlist → `/wishlist`; Logout → confirm.
- Reduced‑motion; dark mode; mobile/desktop; `/admin` untouched.
