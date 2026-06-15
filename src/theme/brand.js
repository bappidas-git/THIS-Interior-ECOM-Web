// =====================================================================
// THIS Interiors — brand identity constants (single source of truth)
// =====================================================================
// The two brand logos live here so every consumer (Header, Footer, mobile
// drawers, the admin logo swap, etc.) imports the SAME URL instead of pasting
// it. Pick the correct logo for the background it sits on:
//
//   • LOGO_LIGHT  → the gold/brass wordmark, for LIGHT surfaces
//     (light headers, cream sections).
//   • LOGO_WHITE  → the white wordmark, for DARK surfaces
//     (dark headers/footers, image overlays, the loading screen).
//
// The favicon + app icons (public/) are derived from this mark.
// =====================================================================

export const LOGO_LIGHT =
  "https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO_fazfcq.png";

export const LOGO_WHITE =
  "https://res.cloudinary.com/dn9gyaiik/image/upload/v1781508520/THIS-LOGO-WHITE_vdltz8.png";

export const BRAND = {
  name: "THIS Interiors",
  shortName: "THIS",
  // Natural pixel dimensions of the logo assets (300 × 148) — handy for an
  // intrinsic aspect-ratio so the wordmark never reflows the header on load.
  logoAspectRatio: 300 / 148,
  logo: {
    light: LOGO_LIGHT, // for light backgrounds
    white: LOGO_WHITE, // for dark backgrounds
  },
  // The brand voice anchor lines (used by hero/closing CTA copy in later
  // prompts; kept here so the brand's single source also documents the tone).
  taglines: [
    "Crafting homes with a soul",
    "Bringing beauty to every corner",
    "Where style meets comfort, every corner tells a story",
  ],
};

export default BRAND;
