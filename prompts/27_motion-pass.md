# THIS Interiors Storefront — Prompt 27: Motion & Micro‑Interactions Pass
**Prompt 27 of 30**

## Depends on
All visual prompts (**03–24**). Best run after the surfaces exist.

## Context
THIS Interiors — editorial luxury home‑décor boutique (token‑driven CRA app, dual‑mode `api.js` +
`db.json`). The app uses **framer‑motion 10** (shared variants in `src/utils/constants.js`
`ANIMATION_VARIANTS`; `AnimatePresence` wraps storefront routes in `App.js`) plus CSS transitions via
`--sf-transition*` tokens (Prompt 01 tuned these slow + reduced‑motion already zeroes them). Brand
motion is **subtle, slow, elegant** — gentle fades/reveals, soft hover lifts, refined easing — and
must always honour `prefers-reduced-motion`.

## Objective
A cohesive motion polish across the storefront: tasteful **scroll‑reveal** entrances, light parallax on
hero media, refined hover/press micro‑interactions, smooth drawer/modal/menu transitions, and
satisfying add‑to‑cart/qty feedback — unified, calm, and fully reduced‑motion safe. No layout/logic
changes.

## Scope — files & areas to touch
- Shared motion: `src/utils/constants.js` `ANIMATION_VARIANTS` (tune to slow/elegant easing) and any
  small shared reveal helper (e.g. a reusable `useInView`/`whileInView` wrapper) you introduce.
- Hero (06), home sections (07–08), product card (09), listing (10), PDP (12–13), drawers/menus
  (03/05/14), modals (11/17), checkout steps (22), confirmation (23) — apply consistent reveals/hovers.
- `App.js` route transition (the existing `AnimatePresence`) — keep it subtle; don't re‑plumb routing.

## Brand & design requirements
- **Scroll‑reveal:** sections fade/lift in gently as they enter the viewport (small translate, slow
  duration, soft easing); stagger groups of cards subtly. Never bouncy or fast.
- **Parallax:** a light, optional parallax on hero/large media — disabled under reduced‑motion.
- **Hover/press:** soft lifts on cards/buttons (small `translateY` + shadow via tokens), quiet image
  scale on product cards, brass underline grows on links. Consistent easing/duration from tokens.
- **Drawers/menus/modals:** smooth, slow slide/fade for the mega‑menu flyouts, cart drawer, sidebar,
  search/auth modals; calm backdrops.
- **Commerce micro‑feedback:** keep/refine "Added ✓" on add‑to‑cart, the qty stepper tick, the
  free‑shipping bar fill, and toast entrances — immediate but elegant.
- **Reduced‑motion:** with `prefers-reduced-motion: reduce`, all reveals/parallax/auto‑advance become
  instant/disabled (the token override + explicit guards on framer‑motion). Nothing should depend on
  motion to be usable.

## Functional guardrails (must not break)
- **Presentation only** — no changes to data, props, routes, or flows. Carousels/auto‑advance must
  still pause on hover/focus and stop under reduced‑motion.
- Don't regress accessibility: focus states remain visible, motion never traps focus or blocks
  interaction, and content is fully usable with motion off.
- Keep performance sane (transform/opacity‑based animation; avoid layout thrash). Admin untouched.

## Implementation notes
- Prefer a single shared reveal pattern (framer‑motion `whileInView` with `viewport={{ once: true }}`
  or a small `IntersectionObserver` hook) reused everywhere for consistency.
- Centralize easing/durations in tokens/variants so the whole site feels unified.
- Audit for any leftover fast/janky stock animations and calm them.

## Acceptance criteria
- [ ] Consistent, slow, elegant scroll‑reveals + hovers + transitions across the storefront, driven by
      shared tokens/variants.
- [ ] Hero parallax + carousels + reveals fully disable under `prefers-reduced-motion`; carousels pause
      on hover/focus.
- [ ] No layout/logic/route changes; focus/a11y intact; performant; `/admin` untouched.

## Test & QA
- Scroll every major page → sections reveal calmly; hover cards/buttons/links → soft, consistent
  feedback; open drawers/menus/modals → smooth. Add to cart → "Added ✓"; cross free‑shipping threshold
  → bar fills.
- Enable reduced‑motion (DevTools → Rendering) → reveals/parallax/auto‑advance off, everything still
  usable. Check no dropped frames on a mid‑tier profile. Dark mode; `/admin` untouched.
