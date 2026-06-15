# THIS Interiors Storefront — Prompt 24: Static, Support & Legal Pages
**Prompt 24 of 30**

## Depends on
**01** (tokens), **02** (primitives). Brand copy values in `constants.js` are finalized in **25** —
read from constants, don't inline brand text.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). The content pages (all `src/pages/*`, with hardcoded‑hex CSS modules today):
- **AboutUs** — hero (`APP_TAGLINE`/`APP_NAME`), a stats row, a story, "Why Choose Us"
  (`WHY_CHOOSE_US`), a CTA banner.
- **HelpCenter** — header + search, 6 help‑topic cards, a searchable **FAQ** (`FAQ_ITEMS`), a contact
  banner (`SUPPORT_EMAIL`/`SUPPORT_PHONE`).
- **Support** — a contact form (→ `apiService.leads.createContact`) + info sidebar.
- **PrivacyPolicy / TermsOfService / CookiePolicy / RefundPolicy** — sectioned legal copy using
  `APP_NAME` + `POLICY_LAST_UPDATED`; Cookie has a types table; Refund has steps + eligible/not‑eligible
  + a refund‑timeline table.
- Shared `FAQ` component (`src/components/FAQ/FAQ.js`) renders `FAQ_ITEMS`.

## Objective
Restyle all static/support/legal pages into the editorial language — calm hero bands, airy long‑form
typography, hairline‑ruled sections and tables, refined FAQ accordions, and a tasteful Support form —
reading brand values from `constants.js` (rebranded in 25), while keeping the Support lead submission
and all routes intact.

## Scope — files & areas to touch
- `src/pages/AboutUs/*`, `src/pages/HelpCenter/*`, `src/pages/Support/*`,
  `src/pages/PrivacyPolicy/*`, `src/pages/TermsOfService/*`, `src/pages/CookiePolicy/*`,
  `src/pages/RefundPolicy/*` — structure/classes + CSS → tokens.
- `src/components/FAQ/FAQ.js` + `.module.css` — restyle the shared accordion.
- Read copy from `src/utils/constants.js` (`APP_NAME`, `APP_TAGLINE`, `WHY_CHOOSE_US`, `FAQ_ITEMS`,
  `SUPPORT_*`, `POLICY_LAST_UPDATED`) — don't hardcode brand specifics here.

## Brand & design requirements
- **Long‑form typography:** generous measure, serif headings with the occasional italic accent, calm
  sans body, hairline section dividers, comfortable line‑height — gallery‑grade reading.
- **AboutUs:** an editorial hero (brand voice), a quiet stats band, a story told in the brand's warm
  tone, "Our promise"/Why‑Choose‑Us as restrained cards, and a calm closing CTA.
- **HelpCenter:** a serene header + search, restrained topic cards, and a refined searchable FAQ
  accordion (keep the client‑side filter); a quiet contact banner.
- **Support:** a tasteful contact form (tokenized fields, brass submit) with the same validation, a
  success state, and a calm info sidebar (email/phone/hours/quick links).
- **Legal pages:** clean documents — quiet "last updated", numbered/anchored sections, hairline tables
  (Cookie types; Refund timeline), and the Refund steps/eligibility as elegant lists.
- **Motion:** subtle; reduced‑motion safe.

## Functional guardrails (must not break)
- **Support form** must still submit via `apiService.leads.createContact(formData)` with the same
  validation (required name/email/subject/message, email format, phone, message min length) and a
  success state. Email pre‑fill for logged‑in users stays.
- Keep the **FAQ search/accordion** behaviour and `FAQ_ITEMS` source; keep all internal links (Help →
  topics, Refund/Track, etc.) and `POLICY_LAST_UPDATED` consistency across legal pages.
- Read brand copy from `constants.js`. Tokenize colours; admin untouched; no schema changes.

## Implementation notes
- Touch structure/classes; keep page logic. Use the shared `Breadcrumb`/primitives from 02.
- Don't duplicate the contact info — it comes from `constants.js` so it stays in sync with header/
  footer.

## Acceptance criteria
- [ ] All seven content pages + the `FAQ` component restyled to the editorial language (calm heroes,
      airy long‑form type, hairline sections/tables, refined accordions) — tokenized, no hardcoded hex.
- [ ] Support submits a `contact` lead with validation + success; FAQ search/accordion works; legal
      pages read `APP_NAME`/`POLICY_LAST_UPDATED` from constants; all routes intact.
- [ ] Reduced‑motion safe; responsive.

## Test & QA
- Visit `/about`, `/help`, `/support`, `/privacy`, `/terms`, `/cookies`, `/refund` → on‑brand,
  readable, responsive. Submit the Support form (valid + invalid) → `contact` lead appears in
  `/admin → Leads`. Search the FAQ; expand/collapse items.
- Confirm contact details match header/footer (single source). Reduced‑motion; dark mode; `/admin`
  untouched.
