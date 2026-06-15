import React, { createContext, useState, useContext, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LIGHT, DARK } from "../theme/colors";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};

// Alias for useTheme to match naming convention
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeContextProvider");
  }
  return { mode: context.isDarkMode ? "dark" : "light", toggleTheme: context.toggleTheme };
};

// THIS Interiors type system: a high-contrast editorial serif for display
// headings (its italic is the brand's accent device) + a clean humanist sans
// for UI/body. Mirrors --sf-font-display / --sf-font-family in
// storefront-tokens.css. The serif's italic face is loaded in public/index.html.
const SANS =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
const SERIF =
  '"Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif';

// Shared by both the light and dark MUI themes: h1–h4 are the serif display
// scale, h5–h6 + body are the sans. Refined (lighter, calmer) for the editorial
// luxury voice rather than the old bold/marketplace scale.
const typography = {
  fontFamily: SANS,
  h1: { fontFamily: SERIF, fontSize: "3.25rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.01em" },
  h2: { fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.01em" },
  h3: { fontFamily: SERIF, fontSize: "2rem", fontWeight: 500, lineHeight: 1.2 },
  h4: { fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.3 },
  h5: { fontFamily: SANS, fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
  h6: { fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5, letterSpacing: "0.02em" },
  button: { textTransform: "none", fontWeight: 500, letterSpacing: "0.02em" },
};

// Small icon buttons (admin table actions, input adornments, dialog controls)
// keep their compact desktop density but get a padded ≥40px hit area on
// touch-sized screens. Shared by the light and dark themes.
const iconButtonTouchOverrides = {
  styleOverrides: {
    sizeSmall: {
      "@media (max-width: 768px)": {
        padding: 11,
      },
    },
  },
};

// ── Brand primitives, shared by the light & dark MUI themes ────────────────
// These are kept visually identical to the `.sf-*` CSS-Module classes in
// theme/storefront-primitives.css, so MUI-based and CSS-module buttons/inputs/
// cards look the same. Colours read from the --sf-* tokens (which flip under
// body.dark), so a single definition serves both themes and no hex is hardcoded.
//
//   MUI variant → brand role:  contained → primary,
//                              outlined  → secondary / ghost,
//                              text      → tertiary link.
const buttonOverrides = {
  styleOverrides: {
    root: {
      minHeight: "var(--sf-tap-target)",
      borderRadius: "var(--sf-radius-md)",
      padding: "0 var(--sf-space-6)",
      fontSize: "var(--sf-text-sm)",
      fontWeight: 500,
      // Editorial calm: a slow tonal shift, no scale.
      transition:
        "background var(--sf-transition), color var(--sf-transition), border-color var(--sf-transition), box-shadow var(--sf-transition)",
      "&:hover": { transform: "none" },
    },
    // Letter-spaced uppercase labels for an editorial feel (opt-in).
    sizeLarge: { padding: "0 var(--sf-space-8)" },
    contained: {
      background: "var(--sf-color-primary)",
      color: "var(--sf-color-primary-contrast)",
      boxShadow: "none",
      "&:hover": {
        background: "var(--sf-color-primary-dark)",
        boxShadow: "var(--sf-shadow-sm)",
      },
    },
    outlined: {
      borderColor: "var(--sf-color-border)",
      color: "var(--sf-color-text)",
      "&:hover": {
        borderColor: "var(--sf-color-primary)",
        color: "var(--sf-color-primary)",
        background: "var(--sf-color-primary-soft)",
      },
    },
    text: {
      color: "var(--sf-color-primary)",
      "&:hover": {
        background: "transparent",
        color: "var(--sf-color-primary-dark)",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      },
    },
  },
};

const cardOverrides = {
  styleOverrides: {
    root: {
      borderRadius: "var(--sf-radius-lg)",
      backgroundColor: "var(--sf-color-surface)",
      backgroundImage: "none",
      // Flat surface + hairline border (not a heavy shadow); soft lift on hover.
      border: "var(--sf-border-hairline)",
      boxShadow: "var(--sf-shadow-xs)",
      transition:
        "box-shadow var(--sf-transition), border-color var(--sf-transition)",
      "&:hover": {
        borderColor: "var(--sf-color-border-strong)",
        boxShadow: "var(--sf-shadow-sm)",
      },
    },
  },
};

const textFieldOverrides = {
  styleOverrides: {
    root: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "var(--sf-radius-md)",
        backgroundColor: "var(--sf-color-surface)",
        "& fieldset": { borderColor: "var(--sf-color-border)" },
        "&:hover fieldset": { borderColor: "var(--sf-color-border-strong)" },
        "&.Mui-focused fieldset": {
          borderColor: "var(--sf-color-primary)",
          borderWidth: "1px",
        },
        // Brass focus ring, matching .sf-input.
        "&.Mui-focused": { boxShadow: "var(--sf-shadow-focus)" },
        "&.Mui-error.Mui-focused": {
          boxShadow: "0 0 0 3px var(--sf-color-danger-bg)",
        },
      },
    },
  },
};

export const ThemeContextProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.body.style.backgroundColor = isDarkMode ? DARK.background.default : LIGHT.background.default;

    // Add/remove .dark class on body for CSS selectors
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [isDarkMode]);

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: LIGHT.primary,
      secondary: LIGHT.secondary,
      background: LIGHT.background,
      text: LIGHT.text,
      action: {
        hover: `rgba(157, 110, 46, 0.08)`,
      },
    },
    typography,
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: buttonOverrides,
      MuiCard: cardOverrides,
      MuiTextField: textFieldOverrides,
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "rgba(252, 250, 246, 0.92)",
            backdropFilter: "blur(20px)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "rgba(252, 250, 246, 0.9)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 1px 0 rgba(38, 32, 23, 0.06)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiIconButton: iconButtonTouchOverrides,
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: DARK.primary,
      secondary: DARK.secondary,
      background: DARK.background,
      text: DARK.text,
      action: {
        hover: "rgba(201, 160, 90, 0.16)",
      },
    },
    typography,
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: buttonOverrides,
      MuiCard: cardOverrides,
      MuiTextField: textFieldOverrides,
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "rgba(33, 30, 26, 0.95)",
            backdropFilter: "blur(20px)",
          },
        },
      },
      MuiIconButton: iconButtonTouchOverrides,
    },
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
