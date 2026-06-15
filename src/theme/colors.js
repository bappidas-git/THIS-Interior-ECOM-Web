// =====================================================================
// GLOBAL COLOR THEME — Edit this file to restyle the entire storefront
// =====================================================================
// All colors used by the MUI front-end layer come from here. The admin panel
// uses its own palette (src/theme/adminTheme.js) and is NOT affected by changes
// to this file.
//
// THIS Interiors brand — warm neutrals + ONE brass accent, sampled from the
// logo gold (≈ #CC9444). Keep these hexes in sync with the --sf-* tokens in
// src/theme/storefront-tokens.css (the CSS-Module layer reads those; MUI reads
// this file). The exported shape (primary/secondary/background/text/gradient/
// bodyBackground) must stay stable — ThemeContext and a few storefront bits and
// the admin layer read these keys.
//
// HOW TO USE:
//   1. Change the hex values below.
//   2. Save the file — hot-reload picks up the changes instantly in dev.
//   3. Rebuild for production: `npm run build`.
// =====================================================================

// ---------------------
// LIGHT MODE PALETTE
// ---------------------
export const LIGHT = {
  // Primary brand color — brass accent for buttons, links, active states.
  // Deepened from the logo gold so white text on a brass fill passes AA.
  primary: {
    main:  "#9d6e2e",
    light: "#c9974b", // the bright logo gold — decorative / large display
    dark:  "#7c5520",
  },
  // Secondary — a warm taupe/greige (not a second loud colour).
  secondary: {
    main:  "#7a6e5c",
    light: "#9c8f7b",
    dark:  "#5c5141",
  },
  // Page and component backgrounds
  background: {
    default: "#f6f2ec", // warm cream
    paper:   "#ffffff",
  },
  // Text colors
  text: {
    primary:   "#1e1b17", // deep charcoal ink
    secondary: "#6b6457", // warm grey
  },
  // Gradient used for contained buttons, hero accents, etc. The brand avoids
  // loud gradients — this is a barely-there warm-tonal brass.
  gradient: {
    primary:        "linear-gradient(135deg, #9d6e2e 0%, #7c5520 100%)",
    primaryReverse: "linear-gradient(135deg, #7c5520 0%, #9d6e2e 100%)",
    // Editorial hero ground: warm charcoal (the white logo sits on this).
    hero: "linear-gradient(135deg, #1a1815 0%, #211e1a 55%, #2a2620 100%)",
  },
  // Body background applied on initial HTML load (before React mounts)
  bodyBackground: "linear-gradient(180deg, #f6f2ec 0%, #fbf8f3 100%)",
};

// ---------------------
// DARK MODE PALETTE
// ---------------------
export const DARK = {
  primary: {
    main:  "#c9a05a", // brass, lifted for dark surfaces
    light: "#ddb877",
    dark:  "#b0863f",
  },
  secondary: {
    main:  "#b8ae9e",
    light: "#cdc4b6",
    dark:  "#8c8273",
  },
  background: {
    default: "#1a1815", // warm charcoal / near-black
    paper:   "#211e1a",
  },
  text: {
    primary:   "#f2ece2", // warm off-white
    secondary: "#b8ae9e",
  },
  gradient: {
    primary:        "linear-gradient(135deg, #c9a05a 0%, #b0863f 100%)",
    primaryReverse: "linear-gradient(135deg, #b0863f 0%, #c9a05a 100%)",
    hero: "linear-gradient(135deg, #16130f 0%, #1a1815 55%, #211e1a 100%)",
  },
  bodyBackground: "linear-gradient(180deg, #1a1815 0%, #211e1a 100%)",
};
