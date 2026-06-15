# THIS Interiors Storefront — Prompt 08: Home Social Proof, Explainer & Closing CTA
**Prompt 8 of 30**

## Depends on
**01** (tokens), **02** (primitives), **04** (footer/newsletter), **07** (home storytelling).

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). This prompt finishes the home page **above the dark footer** with honest social proof and
a brand close. Reviews come from real data via `apiService.products.getReviews` / `reviews` collection
(approved‑only); the `Newsletter` component (Prompt 04) is reused for sign‑up. The brand's authenticity
rule is strict: **no fabricated press, ratings, or testimonials** — render only from seeded/real data
with honest empty states.

## Objective
Add the closing home movements: an honest **"As featured in / Trusted by"** logo strip, a
**testimonial/review carousel** (seeded/real data only), an **explainer stepper** ("Styling in 3
steps" / "Our promise"), and a large **closing brand CTA + newsletter** that sits just above the dark
footer.

## Scope — files & areas to touch
- `src/pages/Home/Home.js` + `Home.module.css` — append the social‑proof, explainer, and closing CTA
  sections.
- Reuse `src/components/Newsletter/Newsletter.js` for the sign‑up in the closing CTA.
- Optionally reuse `src/components/storefront/StarRating` + `SocialProof` for testimonial ratings, and
  `src/components/CTASection/CTASection.js` for the closing band.
- Source testimonials from real review data (e.g. `apiService.products.getReviews` across featured
  products, or a dedicated read of approved `reviews`). Do not invent.

## Brand & design requirements
- **"As featured in / Trusted by" strip:** a quiet, monochrome logo row on a calm band. Because press
  logos are not real, treat this as a **brand/partners or materials** strip sourced from data/config,
  **or** omit it gracefully with an honest empty state — never fabricate publications. Keep it
  understated.
- **Testimonial/review carousel:** a slow, elegant carousel of **real approved reviews** (name/initial,
  star rating, short quote, optional verified badge). If there are too few approved reviews, show a
  smaller set or an honest empty state ("Reviews from our community will appear here") — **never**
  pad with fake quotes. Star ratings come from real `rating` values only.
- **Explainer stepper ("Styling in 3 steps" / "Our promise"):** 3 steps, each with an image/icon, a
  serif step title, and one line of copy (e.g. *Discover → Style → Live beautifully*). This can absorb
  the old "Why Choose Us" content (`WHY_CHOOSE_US`) reframed in brand voice.
- **Closing brand CTA + newsletter:** a large warm band (can be a dark section using the **white**
  logo) with an italic‑accent headline, one line, and the reused `Newsletter` sign‑up — leading the
  eye into the dark footer.
- **Motion/space:** slow reveals, generous whitespace, hairline framing; reduced‑motion safe.

## Functional guardrails (must not break)
- **Reviews are approved‑only and real.** Use the existing API reads; never render unmoderated or
  invented reviews. Honest empty states required (the `SocialProof`/`ReviewsSection` ethic).
- **Newsletter** must submit via `apiService.leads.createNewsletter` (don't change the call).
- Carousel must be keyboard‑accessible (prev/next focusable, `aria-roledescription`), pause on
  hover/focus, and honour reduced‑motion (no auto‑advance when reduced).
- Tokenize colours; white logo on any dark band. API‑driven; admin untouched; no schema changes.

## Implementation notes
- To gather testimonials, read approved reviews from real products (e.g. iterate a few featured
  product ids → `getReviews`, or read the `reviews` collection filtered to `status: "approved"`); cap
  the count and shuffle gently. Keep it cheap (no N+1 storms — batch/limit).
- If you add a brand/partners strip, drive it from `settings`/config or a small seeded list (Prompt 26
  can supply it); otherwise hide it. Never hardcode fake press names.
- Reuse `Newsletter` rather than re‑implementing the form.

## Acceptance criteria
- [ ] A testimonial/review carousel renders **only real approved reviews** with honest empty/sparse
      states; star values are real.
- [ ] An honest "Trusted by/Featured" strip is data/config‑driven or gracefully omitted — no
      fabricated press.
- [ ] A 3‑step explainer ("Styling in 3 steps / Our promise") renders in brand voice.
- [ ] A large closing brand CTA + reused `Newsletter` sits above the dark footer (white logo on dark
      band); newsletter submits via the API.
- [ ] Carousel is keyboard‑accessible + reduced‑motion safe; no fabricated data; tokenized; responsive.

## Test & QA
- Load `/`: confirm the closing sections render in order; the carousel advances slowly, pauses on
  hover/focus, and is keyboard‑navigable; reduce data (few approved reviews) → honest state.
- Subscribe via the closing newsletter → success + a `newsletter` lead in `/admin → Leads`.
- Verify reduced‑motion stops auto‑advance; responsive across breakpoints; dark mode; `/admin`
  untouched.
