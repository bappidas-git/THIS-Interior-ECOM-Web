# THIS Interiors Storefront — Prompt 06: Home Cinematic Hero
**Prompt 6 of 30**

## Depends on
**01** (tokens/fonts/logos), **02** (primitives), **03** (header). Later home sections are **07–08**.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). The home page is `src/pages/Home/Home.js` (+ `Home.module.css`), which currently opens
with the `HeroSection` component (`src/components/HeroSection/HeroSection.js`) — an auto‑sliding banner
**carousel** with hardcoded purple/blue gradients (`#667eea→#764ba2`, etc.), promo side‑cards, and a
bottom category strip, fed by `apiService.banners.getAll()` (with hardcoded fallbacks) and
`apiService.categories.getAll()`. This is the stock marketplace hero and must be replaced.

## Objective
Build a **cinematic, full‑bleed hero** that can display a large lifestyle **image or background
video**, with a restrained editorial headline (an **italic accent noun**), one short supporting line,
and one–two refined CTAs, plus a slim **assurance strip** (free shipping / easy returns / secure
payment) just beneath — all with a slow scroll‑reveal. It must feel like a high‑end DTC boutique and
be clearly different from the stock carousel.

## Scope — files & areas to touch
- `src/components/HeroSection/HeroSection.js` + `HeroSection.module.css` — rebuild as the cinematic
  hero (or repurpose into an editorial hero). Keep it driven by `apiService.banners.getAll()` where
  sensible so admin‑managed banners still feed it, with an on‑brand fallback.
- `src/pages/Home/Home.js` + `Home.module.css` — the hero region + the assurance strip placement;
  remove the stock hero chrome. (Other Home sections are handled in 07–08 — don't rebuild them here,
  but you may leave them temporarily until those prompts run.)
- Reuse the image fallback `onImageError`/`PLACEHOLDER_IMG` from `src/utils/helpers.js`.

## Brand & design requirements
- **Full‑bleed media:** a single calm, warm, styled lifestyle image **or** a muted background video
  (autoplay, muted, loop, `playsInline`, with a poster image and a reduced‑motion fallback to a still
  image). A subtle dark **overlay** (use the overlay token) so text stays legible — when the overlay
  is dark, any logo/wordmark over it uses the **white** logo.
- **Editorial headline:** large serif display (`--sf-font-display`) with **one italic accent noun**,
  e.g. *"Bringing beauty to **every corner**."* One short sans supporting sentence in the brand voice
  (*"Crafted spaces, enriching lives."*). Keep copy short and confident.
- **CTAs:** one primary brass button (e.g. "Shop the Collection" → `/products`) + one quiet
  ghost/text link (e.g. "Explore Rooms" → a category). Conventional, restrained.
- **Assurance strip:** a slim hairline‑separated row just below the hero — free shipping / easy
  returns / secure payment — quiet icons + micro‑labels, tokenized. Keep it honest (policy‑level, not
  fabricated demand).
- **Space & motion:** lots of negative space; a slow fade/lift reveal on load; optional gentle
  parallax on the media. Honour `prefers-reduced-motion` (no video autoplay, no parallax).

## Functional guardrails (must not break)
- If you keep `apiService.banners.getAll()` feeding the hero, preserve the call + its empty/fallback
  handling (banners may be `[]`). CTA links must resolve to real routes (`/products`,
  `/products?category=<slug>`).
- Don't break the rest of `Home.js` data loading (featured/trending/categories fetches) that later
  prompts rely on — only replace the hero region.
- Tokenize everything (no purple gradients). API‑driven; admin untouched; no schema changes.

## Implementation notes
- Prefer CSS `background-image`/`<video>` with `object-fit: cover` for the full‑bleed media; gate
  `<video>` autoplay behind a `prefers-reduced-motion` check (render the poster image instead).
- Headline accent: wrap the accent noun in `<em>`/a class that renders the serif **italic**.
- Use the assurance items as a small tokenized component or inline row; you may reuse `TrustBadges`
  semantics but keep the hero strip visually minimal.
- Real hero/video assets can be brand‑appropriate placeholders now (Cloudinary/placeholder), wired so
  a future admin banner or `settings` value can supply the real asset; **do not** use THIS Interiors'
  copyrighted project photos.

## Acceptance criteria
- [ ] The home hero is a **full‑bleed image/video‑capable** cinematic hero with a serif **italic‑accent**
      headline, a short supporting line, 1–2 refined CTAs, and a slim assurance strip beneath.
- [ ] Video (if used) is muted/looped/`playsInline` with a poster and a reduced‑motion still fallback;
      overlay keeps text legible; white logo used over dark overlay if a logo appears there.
- [ ] CTAs route correctly; banners API call (if retained) still handled with fallback.
- [ ] No hardcoded purple/blue gradients remain in the hero; scroll‑reveal respects reduced‑motion.

## Test & QA
- Load `/`: hero fills the viewport, headline + CTAs render, assurance strip sits beneath; click both
  CTAs → correct routes.
- Toggle reduced‑motion: video stops autoplaying (poster shows) and parallax/reveal disable.
- Resize mobile/tablet/desktop: media stays covered, headline scales, CTAs stack gracefully.
- Toggle dark mode: hero overlay/text remain legible. Confirm no console errors and `/admin`
  untouched.
