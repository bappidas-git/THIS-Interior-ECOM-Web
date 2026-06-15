# THIS Interiors Storefront — Prompt 01: Brand Design System & Theme Tokens
**Prompt 1 of 30**

## Depends on
Nothing — this is the foundation. **Every later prompt consumes the tokens you define here.**

## Context
You are redesigning an existing CRA React storefront into **THIS Interiors** — Dubai's luxury
interior‑design studio extended into a curated home‑décor boutique (vases, candles, wall art,
mirrors, cushions, lamps, planters, trays, ceramics…). Aesthetic: **editorial, warm‑minimalist,
gallery calm** — generous whitespace, image‑forward, hairline rules, a restrained warm‑neutral
palette with deep charcoal and **one** brass/bronze accent. The app is token‑driven via
`src/theme/storefront-tokens.css` (`--sf-*`), `src/theme/tokens.js`, `src/theme/colors.js` (MUI), and
`src/context/ThemeContext.js` (toggles `body.dark`). Data stays API‑driven via the dual‑mode
`src/services/api.js` + `db.json`. **Logos:**
- Light: `https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO_fazfcq.png`
- White: `https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO-WHITE_vdltz8.png`

## Objective
Establish the complete THIS Interiors **design language as tokens**: a finalized warm‑neutral
palette (light + dark surface tokens), editorial type system (serif display + humanist sans, loaded),
refined spacing/radii/shadow/motion scales, the two brand logos + favicon wired, and the global page
background. After this prompt the whole storefront should already *read* warmer and calmer — and the
old purple/blue (`#667eea`/`#764ba2`) must be gone from the **token layer**.

## Scope — files & areas to touch
- `src/theme/storefront-tokens.css` — **primary**: redefine all `--sf-*` colour, type, radius,
  spacing, shadow, motion tokens (light `:root` + dark `body.dark`). Add new tokens you need
  (serif font var, accent, hairline border, hero overlay, etc.).
- `src/theme/colors.js` — the MUI `LIGHT`/`DARK` palettes + gradients; keep the exported shape
  (`primary/secondary/background/text/gradient/bodyBackground`) but replace values to match brand.
- `src/theme/tokens.js` — keep `TOKENS`/`STOREFRONT_CONFIG` shape; update the `TOKENS` mirror
  (radius/space/breakpoints) to match the CSS, and update any JS‑side values that feed inline styles.
- `src/context/ThemeContext.js` — update the MUI `createTheme` typography (`fontFamily`, h1–h6),
  button/card overrides, and the `body` background colours to brand values (keep the dark/light
  toggle behaviour + `body.dark` class logic intact).
- `public/index.html` — load brand fonts (Google Fonts `<link>` or self‑host), set `<title>` and
  `<meta name="theme-color">` to a brand value, point favicon to the brand mark.
- `public/manifest.json` — `short_name`/`name`/`theme_color`/`background_color` to brand.
- `public/favicon.svg` (+ `logo192.png`/`logo512.png` if you regenerate) — derive from the **light**
  logo mark.
- `src/index.css` / `src/App.css` — only if a global `font-family`/background needs to point at the
  new tokens (no component‑level styling here).

## Brand & design requirements
- **Sample the real brand** before finalizing: open the two logo PNGs and the live site
  `thisinteriors.com`; pick the exact hexes from the logo + photography. Direction to land on:
  - **Neutrals (light):** page `bg` warm off‑white/cream (e.g. ~`#F6F2EC`), `surface` near‑white
    (`#FFFFFF`/`#FCFAF6`), `surface-2` sand/greige (`#EFE9E0`), hairline `border` warm grey
    (`#E4DDD2`).
  - **Ink:** `text` deep charcoal/near‑black (`#1E1B17`/`#22201C`), `text-secondary` warm grey
    (`#6B6457`), `text-muted` lighter greige.
  - **Accent (one):** a muted **brass/bronze/taupe** sampled from the logo (e.g. ~`#A6855B` /
    `#9A7B4F`) → `--sf-color-primary` (CTAs, links, active states). Use **sparingly**. Provide
    `primary-dark`, `primary-light`, `primary-soft` tints + a readable `primary-contrast`.
  - **Dark sections** (`body.dark` and dark hero/footer surfaces): charcoal/near‑black backgrounds
    (`#1A1815`/`#211E1A`), warm off‑white text, the same brass accent slightly lightened for
    contrast. These dark surfaces are where the **white logo** is used.
  - Replace the loud `--sf-gradient-primary` purple gradient with either a **flat accent** or a very
    subtle warm‑tonal gradient; avoid loud gradients per the brand.
- **Typography:** load a high‑contrast **editorial serif** for display (Cormorant Garamond / Playfair
  Display / similar) and a **clean humanist sans** for body/UI (Inter / Hanken Grotesk). Add
  `--sf-font-display` (serif) and keep `--sf-font-family` (sans) for body. Establish a clear type
  scale (keep the existing `--sf-text-*` names; you may extend with a larger display size for hero).
  The serif's **italic** is the brand's accent device for headline nouns — make sure the italic face
  is loaded.
- **Radii:** soften to editorial restraint (smaller, calmer corners than the stock 16–22px); e.g.
  `sm 2px / md 4px / lg 8px / xl 12px / pill 999px`. Decide and keep names.
- **Shadows:** lighter, warmer, more diffuse than stock; prefer hairline borders over heavy shadows.
- **Motion:** keep the `--sf-transition*` names but tune to **slow & elegant** (e.g. `0.5s` slow);
  keep the existing `prefers-reduced-motion` override that zeroes them.
- **Logos:** add the two logo URLs as the single source of truth (e.g. exported constants in a small
  `src/theme/brand.js` **or** documented `--sf-logo-*` not needed for `<img>` — prefer JS constants
  the Header/Footer import). Derive favicon from the light mark.

## Functional guardrails (must not break)
- **Token names already in use must keep working.** Components/pages read `var(--sf-color-primary)`,
  `--sf-color-bg`, `--sf-color-surface`, `--sf-color-text`, `--sf-color-border`, `--sf-text-*`,
  `--sf-radius-*`, `--sf-space-*`, `--sf-shadow-*`, `--sf-transition*`, `--sf-color-star`,
  `--sf-color-price`, `--sf-color-discount*`, etc. **Rename nothing**; only change values and **add**
  new tokens. Removing a token would break existing CSS.
- Keep `colors.js` exports `LIGHT`/`DARK` with the same nested keys; MUI (admin + a few storefront
  bits) and `ThemeContext` read them. **Do not touch `src/theme/adminTheme.js`** — the admin palette
  stays as‑is.
- Keep `ThemeContext`'s dark/light toggle, `localStorage('theme')`, and the `body.dark`/`body.light`
  class logic exactly.
- API‑driven, admin untouched. No data/schema changes.

## Implementation notes
- Do the colour work primarily in `storefront-tokens.css`; mirror brand hexes into `colors.js` so the
  MUI layer matches (the file's own comment says keep them in sync).
- Keep the dark‑mode block (`body.dark`) overriding **only** colour tokens; structural tokens stay in
  `:root`.
- Fonts: prefer Google Fonts `<link rel="preconnect">` + stylesheet in `index.html` for speed; set
  `font-display: swap`. Update `--sf-font-family` and add `--sf-font-display`.
- Leave a short comment block at the top of `storefront-tokens.css` documenting the THIS Interiors
  palette so future clients can re‑skin (mirrors the existing doc style).

## Acceptance criteria
- [ ] `storefront-tokens.css` light + dark blocks fully express the warm‑neutral + brass palette; **no
      `#667eea`/`#764ba2`/purple remains** in the token layer.
- [ ] `--sf-font-display` (serif) and `--sf-font-family` (sans) are defined and the fonts (incl.
      serif **italic**) actually load (visible in the Network tab / rendered).
- [ ] `colors.js` `LIGHT`/`DARK` updated to brand values with unchanged export shape; `ThemeContext`
      typography + body background use brand values; dark/light toggle still works.
- [ ] `index.html` title/theme‑color/favicon + `manifest.json` reflect THIS Interiors; favicon derives
      from the light logo.
- [ ] The two logo URLs exist as a single importable source for later prompts.
- [ ] App compiles; existing pages render with the new palette (even if individual layouts are still
      stock — those come later).

## Test & QA
- `npm start`; load `/`, `/products`, a product page, `/checkout`, `/profile`. Confirm warmer palette
  everywhere tokens are honoured; toggle dark mode (header toggle) and confirm dark surfaces are
  warm charcoal, not navy/purple.
- Confirm the browser tab shows the THIS Interiors favicon + title.
- Verify `prefers-reduced-motion` still zeroes transitions (DevTools → Rendering → emulate).
- Open `/admin` and confirm the **admin is visually unchanged** and still loads (admin palette is
  independent).
- Confirm no console errors and no broken `var(--sf-*)` references.
