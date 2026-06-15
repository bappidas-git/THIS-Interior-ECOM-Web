# THIS Interiors Storefront — Prompt 19: My Addresses & Change Password
**Prompt 19 of 30**

## Depends on
**01** (tokens), **02** (primitives), **18** (account shell).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). Within `src/pages/Profile/Profile.js` two tabs:
- **My Addresses:** list + add/edit/delete/set‑default. Canonical address shape `{ id, label
  (Home/Work/Other), firstName, lastName, phone, addressLine1, addressLine2, city, state, postalCode,
  country, isDefault }`. New rows use `generateId()`; the first row auto‑defaults; default is exclusive
  and gets promoted on delete; edit normalizes legacy `fullName`/`zipCode`. Persisted through
  `updateUser` (the `addresses[]` array on the user). Validation: required fields + phone format.
- **Change Password:** current / new (strength meter + requirements checklist: 8+, upper, lower, digit,
  special) / confirm, via `useAuth`→`apiService.auth.changePassword` (mock returns success).

## Objective
Restyle these two tabs into the editorial language — elegant address cards, a refined address form, a
calm default‑selector, and a tasteful password form with a strength meter and requirements checklist —
while keeping the address CRUD/default logic, the canonical address shape, and the password flow
intact.

## Scope — files & areas to touch
- `src/pages/Profile/Profile.js` — the Addresses + Change Password tab structure/classes; keep all CRUD,
  default‑promotion, normalization, and password logic.
- `src/pages/Profile/Profile.module.css` — restyle these tabs to tokens (shared with the shell from 18).

## Brand & design requirements
- **Addresses list:** elegant address **cards** with the `label` as a quiet chip, a brass "Default"
  marker on the default, hairline framing, and quiet Edit/Delete/"Set default" actions. An airy "Add
  new address" affordance.
- **Address form:** tokenized inputs in an airy grid (name row, phone, line1, line2, city/state/postal,
  country, label, default checkbox), a brass Save + quiet Cancel; clear inline validation.
- **Change Password:** tokenized current/new/confirm fields with eye toggles, a refined strength meter,
  and a calm **requirements checklist** that ticks live; brass "Update password" with success/error
  feedback.
- **Motion:** calm; reduced‑motion safe.

## Functional guardrails (must not break)
- Keep the **canonical address shape and field names** exactly; keep add/edit/delete, the exclusive
  default + promotion‑on‑delete, the first‑row auto‑default, the legacy `fullName`/`zipCode`
  normalization, and persistence via `updateUser(addresses)`. Checkout reads these addresses — don't
  change their shape.
- Keep the password flow via `apiService.auth.changePassword` (`{ currentPassword, newPassword,
  confirmPassword }`) and the requirements/strength validation. (Mock mode returns success without real
  persistence — keep that behaviour.)
- Keep validation (required fields + `isValidPhone`). Tokenize colours; admin untouched; no schema
  changes.

## Implementation notes
- Touch structure/classes only; do not alter the address normalization or default logic.
- Reuse the password strength component/util used in `AuthModal`/`Profile` for consistency.

## Acceptance criteria
- [ ] Addresses tab restyled (elegant cards + default marker + refined form) with CRUD, exclusive
      default, promotion‑on‑delete, normalization, and `updateUser` persistence intact + canonical
      shape unchanged.
- [ ] Change Password tab restyled (tokenized fields + strength meter + live requirements checklist)
      with the existing flow + validation intact.
- [ ] Tokenized; reduced‑motion safe; responsive.

## Test & QA
- Add an address (becomes default if first), add a second, set it default (exclusive), edit one, delete
  the default (next promoted). Reload → persisted. Place a checkout and confirm the saved/default
  address still flows through.
- Change password: wrong/mismatch/weak → errors; valid → success. Requirements checklist ticks live.
- Reduced‑motion; dark mode; mobile/desktop; `/admin` untouched.
