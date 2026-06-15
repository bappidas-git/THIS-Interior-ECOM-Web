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
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            padding: "10px 22px",
            fontSize: "0.95rem",
            // Editorial calm: no lift, no glow — just a tonal shift.
            transition:
              "background 0.35s ease, color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
            "&:hover": {
              transform: "none",
              boxShadow: "none",
            },
          },
          contained: {
            background: LIGHT.gradient.primary,
            color: "#ffffff",
            boxShadow: "none",
            "&:hover": {
              background: LIGHT.gradient.primaryReverse,
              boxShadow: "0 6px 16px rgba(38, 32, 23, 0.14)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            border: "1px solid #e4ddd2",
            boxShadow: "0 1px 2px rgba(38, 32, 23, 0.05)",
            transition: "box-shadow 0.35s ease, border-color 0.35s ease",
            "&:hover": {
              borderColor: "#d6ccbc",
              boxShadow: "0 8px 24px rgba(38, 32, 23, 0.08)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "&:hover fieldset": {
                borderColor: LIGHT.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: LIGHT.primary.main,
                borderWidth: "1.5px",
              },
            },
          },
        },
      },
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
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            padding: "10px 22px",
            fontSize: "0.95rem",
            transition:
              "background 0.35s ease, color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
            "&:hover": {
              transform: "none",
              boxShadow: "none",
            },
          },
          contained: {
            background: DARK.gradient.primary,
            // Dark-mode brass is light, so its fill takes ink (not white) text.
            color: "#1a1815",
            boxShadow: "none",
            "&:hover": {
              background: DARK.gradient.primaryReverse,
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            background: "rgba(33, 30, 26, 0.8)",
            backdropFilter: "blur(10px)",
            border: `1px solid rgba(201, 160, 90, 0.18)`,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            transition: "box-shadow 0.35s ease, border-color 0.35s ease",
            "&:hover": {
              borderColor: "rgba(201, 160, 90, 0.34)",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "&:hover fieldset": {
                borderColor: DARK.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: DARK.primary.main,
                borderWidth: "1.5px",
              },
            },
          },
        },
      },
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
