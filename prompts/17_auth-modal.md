# THIS Interiors Storefront — Prompt 17: Auth Modal (Login / Sign Up)
**Prompt 17 of 30**

## Depends on
**01** (tokens/fonts), **02** (primitives).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). `src/components/AuthModal/AuthModal.js` (+ `.module.css`) is the login/signup dialog
(bottom sheet on mobile, centred card on desktop): **Login** (email, password + eye toggle, **Remember
me**, disabled "Forgot password?", submit, disabled social buttons, switch to Sign Up) and **Sign Up**
(first/last name, email, +91 phone, password + **strength meter**, confirm, terms checkbox, submit). It
uses `useAuth` (`login`, `register`, `isLoading`) which returns `{success,error}`, shows success toast
then closes, validates via `isEmailValid` etc. Props: `open`, `onClose`, `defaultTab`. It's opened
globally via `AuthContext` (`openAuthModal(tab)`).

## Objective
Restyle the auth modal into a calm, premium THIS Interiors dialog — serif welcome headings, tokenized
inputs, a refined tab switch, and an elegant password‑strength indicator — while keeping the login/
register flows, **Remember me**, validation, and success/error handling exactly intact.

## Scope — files & areas to touch
- `src/components/AuthModal/AuthModal.js` — structure/classes only; keep all form state, validation,
  and `useAuth` wiring.
- `src/components/AuthModal/AuthModal.module.css` — restyle to tokens (replace `#0a0e27`/`#667eea`
  hardcodes; keep social brand colours only on the still‑disabled social buttons or drop them).

## Brand & design requirements
- **Surface:** a serene `surface` card (cream/charcoal per mode) with a hairline border, serif
  headings ("Welcome back" / "Create your account" — italic accent allowed), and a short brand line.
- **Tabs:** quiet underline tab switch (Login / Sign Up) with a brass active indicator and a calm
  slide between panels.
- **Inputs:** tokenized fields (hairline border, brass focus ring, ≥44px), eye toggles as quiet icons,
  the +91 phone prefix understated.
- **Password strength:** a refined 4‑segment meter using semantic tokens (weak→strong), calm labels.
- **Buttons:** brass primary submit (with the existing loading spinner state), quiet "switch mode"
  links; keep the disabled social/forgot affordances visually subdued (or remove if cleaner) — but
  don't change their disabled behaviour.
- **Feedback:** brand success toast + tokenized error/info banners (the existing animated banners).
- **Motion:** soft dialog spring; reduced‑motion safe.

## Functional guardrails (must not break)
- Keep `useAuth().login`/`register` calls, the `{success,error}` handling, the **Remember me** →
  `authStorage`/localStorage‑vs‑sessionStorage behaviour, and the success‑then‑close timing.
- Keep all **validation** (email valid, password min length, confirm match, terms required, phone) and
  the field‑level error display + the password strength scoring.
- Keep props `open`/`onClose`/`defaultTab` and the global `openAuthModal`/`closeAuthModal` wiring;
  keep the disabled state of the not‑yet‑implemented social/forgot controls.
- Tokenize colours. Admin untouched; no API/schema changes.

## Implementation notes
- Touch markup/classes, not the auth logic. Keep the mobile bottom‑sheet vs desktop‑card responsive
  behaviour.
- Ensure focus moves into the dialog on open, `Esc` closes, focus is trapped, and the tab switch is
  keyboard accessible.

## Acceptance criteria
- [ ] Auth modal restyled to a calm premium dialog (serif headings, tokenized inputs, refined tabs,
      elegant strength meter, brass submit) in both light/dark + mobile sheet/desktop card.
- [ ] Login + Sign Up flows, Remember me, validation, password strength, and success/error handling all
      work unchanged; props + global open/close wiring intact.
- [ ] Tokenized (no `#0a0e27`/`#667eea`); reduced‑motion + focus‑trap + `Esc` intact.

## Test & QA
- Open via the header account entry; log in (with + without Remember me — verify session persists
  across reload only when checked); register a new account (validation + strength meter + duplicate‑email
  error); switch tabs; trigger field errors; success toast → modal closes.
- Keyboard: focus trap, `Esc`, tab switch. Reduced‑motion; dark mode; mobile sheet vs desktop card;
  `/admin` untouched.
