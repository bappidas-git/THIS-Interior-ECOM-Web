# THIS Interiors Storefront — Prompt 29: Admin Logo Swap (ONLY)
**Prompt 29 of 30**

## Depends on
**01** (brand/logo source). Independent of the storefront prompts.

## Context
THIS Interiors — the admin panel is shared, fully functional, and **must stay exactly as‑is except its
logo**. The admin renders a placeholder logo from a single `LOGO` constant in two files:
- `src/components/AdminLayout/AdminLayout.js` — `const LOGO = "https://placehold.co/160x40/4f46e5/ffffff?text=LOGO";`
  used in the drawer header `<img src={LOGO} … style={{ height: 32 }}/>`.
- `src/pages/Admin/AdminLogin.js` — `const LOGO = "https://placehold.co/210x70/4f46e5/ffffff?text=LOGO";`
  used in the login card `<img src={LOGO} … style={{ height: 56 }}/>`.

**Logos:** light `https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO_fazfcq.png`,
white `https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO-WHITE_vdltz8.png`.

## Objective
Swap the two admin placeholder logos for the **correct THIS Interiors logo per its background** — and
change **nothing else** in the admin. This is the single allowed admin change in the whole project.

## Scope — files & areas to touch
- `src/components/AdminLayout/AdminLayout.js` — the `LOGO` constant only.
- `src/pages/Admin/AdminLogin.js` — the `LOGO` constant only.
- Nothing else under `src/pages/Admin/*`, `src/components/AdminLayout/*`, or `src/theme/adminTheme.js`.

## Brand & design requirements
- Replace each `LOGO` value with the THIS Interiors logo URL (or the brand source exported in Prompt
  01). **Pick the logo that suits each surface's background:** verify the admin drawer + login card
  backgrounds (admin uses its own `adminTheme.js` palette). Use the **light** logo on light surfaces
  and the **white** logo on dark surfaces. If a surface can be either (light/dark admin mode), choose
  the variant that stays legible, or use the light logo as the safe default on the (typically light)
  admin chrome.
- Keep the existing `<img>` sizing (`height: 32` drawer, `height: 56` login) and `width:auto` so aspect
  ratio is preserved; the logo should sit cleanly without distortion. Adjust **only** the height if the
  brand logo's aspect ratio needs it to fit — no layout restructuring.

## Functional guardrails (must not break)
- **Admin must remain 100% functional and otherwise visually identical.** Do not touch admin layout,
  navigation, colours, `adminTheme.js`, any admin page, auth, or data wiring.
- No storefront changes here. No API/schema changes.

## Acceptance criteria
- [ ] Both admin `LOGO` constants point at the THIS Interiors logo, each using the variant that's
      legible on its background.
- [ ] Logo renders crisp (no distortion) in the admin drawer + login card; sizing preserved.
- [ ] No other admin file changed; admin still loads + functions exactly as before.

## Test & QA
- Open `/admin` → login card shows the brand logo (legible on its background); sign in → the sidebar
  drawer shows the brand logo. Toggle any admin light/dark if applicable → logo stays legible.
- Click through admin sections (Dashboard, Products, Orders, etc.) → all work unchanged. Confirm
  `git diff` touches **only** the two `LOGO` lines.
