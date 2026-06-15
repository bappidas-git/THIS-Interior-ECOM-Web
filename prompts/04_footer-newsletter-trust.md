# THIS Interiors Storefront — Prompt 04: Footer, Newsletter, Trust & Payment Marks
**Prompt 4 of 30**

## Depends on
**01** (tokens/fonts/logos), **02** (primitives). Newsletter is also reused by the Home closing CTA
(**08**) — keep its API wiring reusable.

## Context
THIS Interiors — editorial luxury home‑décor boutique on a token‑driven CRA app (`--sf-*` tokens,
dual‑mode `api.js` + `db.json`). The current `Footer` (`src/components/Footer/Footer.js` +
`Footer.module.css`) renders: a newsletter block (hardcoded `linear-gradient(135deg,#1e293b,#334155)`),
a 4‑column grid (About with `APP_NAME` text + social icons from `SOCIAL_LINKS`; Quick Links; Customer
Service; Contact from `SUPPORT_*` constants), a **trust/payment bar** (Visa/Mastercard/UPI/COD SVGs +
trust badges), and a bottom legal bar (Terms/Privacy/Cookies). Newsletter submits via
`apiService.leads.createNewsletter()`; deal links hide when `useDealsConfig().enabled` is false. There
is also a standalone `Newsletter` component (`src/components/Newsletter/Newsletter.js`). **White logo
(dark background):** `…/THIS-LOGO-WHITE_vdltz8.png`.

## Objective
Restyle the footer into a **refined dark editorial footer** with the **white logo**, a calm newsletter
sign‑up, brand contact/social, a restrained trust + payment‑marks strip, and quiet legal links — warm
charcoal, generous spacing, hairline rules. Keep every link target and the newsletter submit flow.

## Scope — files & areas to touch
- `src/components/Footer/Footer.js` + `Footer.module.css` — full restyle to tokens; swap the text
  brand for the **white logo**; remove hardcoded slate gradient/greys and payment‑SVG colours where
  they should be tokenized (payment brand marks may keep their official brand colours — see notes).
- `src/components/Newsletter/Newsletter.js` + `Newsletter.module.css` — restyle the standalone
  newsletter to the same brand pattern (used elsewhere/Home).
- Pull contact/social from `src/utils/constants.js` (`SOCIAL_LINKS`, `SUPPORT_EMAIL`, `SUPPORT_PHONE`,
  `SUPPORT_ADDRESS`, `SUPPORT_HOURS`) — values themselves are rebranded in **Prompt 25**, so read
  them, don't hardcode.

## Brand & design requirements
- **Dark editorial surface:** warm charcoal/near‑black background (from Prompt 01 dark tokens), warm
  off‑white text, hairline dividers, brass accent on hovers/links. The **white logo** sits in the
  brand column with a short brand line (e.g. *"Crafting homes with a soul."*).
- **Newsletter:** calm headline (serif, with an italic accent noun), one short supporting line, a
  single email field + understated brass "Subscribe" button; honest success/error states (the
  current 4–5s success message pattern is fine). Keep the email validation (`isEmailValid`).
- **Columns:** keep the four content groups but with airier spacing and serif column headings; the
  Quick Links / Customer Service / Contact links keep their existing routes. Deal links still hide
  when deals are disabled.
- **Trust + payment strip:** restrained row — payment marks (Visa/Mastercard/UPI/COD and, once
  currency is AED in 25–26, you may add relevant marks) + the brand's reassurance badges. Keep it
  understated; no loud badges.
- **Social icons:** render only entries with a non‑empty URL (current behaviour) so blank socials hide.
- **Bottom bar:** quiet copyright (brand name + year) + Terms/Privacy/Cookie links.

## Functional guardrails (must not break)
- **Newsletter submit** must still call `apiService.leads.createNewsletter(email)` (and the standalone
  `Newsletter` likewise) and show success/error — do not change the API call or its payload.
- Keep `useDealsConfig().enabled` gating for deal links; keep all existing route targets
  (`/products`, `/special-offers`, `/orders`, `/help`, `/support`, `/refund`, `/terms`, `/privacy`,
  `/cookies`, etc.).
- Read contact/social from `constants.js` (don't inline brand values here — Prompt 25 owns them).
- Tokenize colours; **white logo on the dark surface**. Admin untouched; no schema changes.

## Implementation notes
- Payment‑brand SVGs: it's acceptable to keep each card brand's **official** colour (Visa blue, etc.)
  since those are brand marks, but wrap them on a tokenized surface and keep them small/quiet. The
  surrounding chrome must be tokenized.
- The footer is dark regardless of light/dark site mode (it's a dark section) — ensure text/passes
  contrast in both modes and the **white** logo is used.
- Reuse the `Newsletter` component pattern so Home's closing CTA (Prompt 08) can compose it.

## Acceptance criteria
- [ ] Footer is a refined **dark** editorial footer using the **white** THIS Interiors logo and brand
      tokens (no stock slate gradient / stray greys in the chrome).
- [ ] Newsletter (footer + standalone component) submits via `apiService.leads.createNewsletter`, with
      validation + honest success/error.
- [ ] Four content groups + trust/payment strip + legal bar present, airy, on‑brand; deal links hide
      when deals are disabled; blank socials hide.
- [ ] Contact/social read from `constants.js`. Reduced‑motion respected. `/admin` unchanged.

## Test & QA
- Subscribe with a valid + an invalid email → success + validation error; confirm a `newsletter` lead
  appears in `/admin → Leads`.
- Click every footer link → correct routes; disable special offers in `/admin → Special Offers` and
  confirm deal links hide.
- Check the white logo renders on the dark footer in both light + dark site modes; check contrast and
  responsive stacking (mobile → single column). Confirm `/admin` untouched.
