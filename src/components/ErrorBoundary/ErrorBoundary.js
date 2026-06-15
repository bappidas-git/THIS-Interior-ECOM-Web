import React from "react";

// Brand-themed fallback. Colours are read from the --sf-* design tokens (defined
// on :root / body.dark via the imported CSS, independent of React), so the
// fallback adopts the storefront's warm palette and flips with dark mode without
// depending on the React context tree above it.

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("=== CAUGHT ERROR ===", error);
    console.error("Component stack:", info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // Full navigation resets the broken React tree, even outside the Router.
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const btnBase = {
      minHeight: "var(--sf-tap-target)",
      padding: "0 var(--sf-space-6)",
      borderRadius: "var(--sf-radius-md)",
      fontSize: "var(--sf-text-sm)",
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "var(--sf-font-family)",
      transition: "var(--sf-transition)",
    };

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--sf-space-6)",
          background: "var(--sf-color-bg)",
          fontFamily: "var(--sf-font-family)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: "var(--sf-color-surface)",
            border: "1px solid var(--sf-color-border)",
            borderRadius: "var(--sf-radius-lg)",
            padding: "var(--sf-space-12) var(--sf-space-8)",
            textAlign: "center",
            boxShadow: "var(--sf-shadow-md)",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              lineHeight: 1,
              marginBottom: "var(--sf-space-4)",
            }}
          >
            <span role="img" aria-label="warning">
              ⚠️
            </span>
          </div>
          <h1
            style={{
              margin: "0 0 var(--sf-space-3)",
              fontFamily: "var(--sf-font-display)",
              fontSize: "var(--sf-text-2xl)",
              fontWeight: 500,
              color: "var(--sf-color-text)",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: "0 0 var(--sf-space-8)",
              fontSize: "var(--sf-text-base)",
              lineHeight: "var(--sf-leading-relaxed)",
              color: "var(--sf-color-text-secondary)",
            }}
          >
            An unexpected error occurred while rendering this page. You can try
            reloading, or head back to the homepage.
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--sf-space-3)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                ...btnBase,
                border: "1px solid var(--sf-color-primary)",
                color: "var(--sf-color-primary-contrast)",
                background: "var(--sf-color-primary)",
              }}
            >
              Reload Page
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              style={{
                ...btnBase,
                background: "transparent",
                color: "var(--sf-color-text)",
                border: "1px solid var(--sf-color-border)",
              }}
            >
              Go Home
            </button>
          </div>

          {this.state.error && (
            <details
              style={{
                marginTop: "var(--sf-space-8)",
                textAlign: "left",
                color: "var(--sf-color-text-secondary)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "var(--sf-text-sm)",
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                Error details
              </summary>
              <pre
                style={{
                  marginTop: "var(--sf-space-3)",
                  padding: "var(--sf-space-4)",
                  borderRadius: "var(--sf-radius-md)",
                  background: "var(--sf-color-surface-2)",
                  color: "var(--sf-color-danger)",
                  fontSize: "var(--sf-text-xs)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "240px",
                  overflow: "auto",
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
