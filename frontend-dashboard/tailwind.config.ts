import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: "#0B0F19",
          stone: "#F8FAFC",
        },
        terminal: {
          slate: "#0F172A",
          elevated: "#1E293B",
          border: "#334155",
          subtle: "#1F2937",
        },
        accent: {
          cobalt: "#2563EB",
          hover: "#1D4ED8",
        },
        // Single accent ramp. 600 is the documented --accent-cobalt.
        cobalt: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        status: {
          crimson: "#EF4444",
          amber: "#F59E0B",
          emerald: "#10B981",
        },
        nightmare: {
          bg: "#0B0F19",
          surface: "#1E293B",
          border: "#1F2937",
          muted: "#94A3B8",
          text: "#F8FAFC",
          crimson: "#EF4444",
          amber: "#F59E0B",
          emerald: "#10B981",
          cyan: "#38BDF8",
        },
        // slate.500 lifted from #64748b to #8494ab: 4.5:1+ on every dark surface at 10px.
        // Rule 03 keeps slate-400 as the lighter muted tier; this only fixes the failing tier.
        slate: {
          500: "#8494ab",
        },
        // Dual-Surface Perceptual OKLCH Semantic Ink Tokens (src/styles/typography.css)
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
          statutory: "var(--ink-statutory)",
          numeric: "var(--ink-numeric)",
          crimson: "var(--ink-crimson)",
          amber: "var(--ink-amber)",
          emerald: "var(--ink-emerald)",
          cobalt: "var(--ink-cobalt)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
      },
      fontSize: {
        "display-lg": [
          "2.0rem",
          {
            lineHeight: "2.375rem",
            letterSpacing: "var(--ls-display-lg)",
            fontWeight: "var(--fw-display-lg)",
          },
        ],
        "display-md": [
          "1.5rem",
          {
            lineHeight: "1.875rem",
            letterSpacing: "var(--ls-display-md)",
            fontWeight: "var(--fw-display-md)",
          },
        ],
        "heading-sm": [
          "1.0rem",
          {
            lineHeight: "1.375rem",
            letterSpacing: "var(--ls-heading-sm)",
            fontWeight: "var(--fw-heading-sm)",
          },
        ],
        "body-default": [
          "0.875rem",
          {
            lineHeight: "1.25rem",
            letterSpacing: "var(--ls-body-default)",
            fontWeight: "var(--fw-body-default)",
          },
        ],
        "body-dense": [
          "0.8125rem",
          {
            lineHeight: "1.125rem",
            letterSpacing: "var(--ls-body-dense)",
            fontWeight: "var(--fw-body-dense)",
          },
        ],
        "mono-data": [
          "0.75rem",
          {
            lineHeight: "1.0rem",
            letterSpacing: "var(--ls-mono-data)",
            fontWeight: "var(--fw-mono-data)",
          },
        ],
        "caption-mono": [
          "0.6875rem",
          {
            lineHeight: "0.875rem",
            letterSpacing: "var(--ls-caption-mono)",
            fontWeight: "var(--fw-caption-mono)",
          },
        ],
      },
    },
  },
  plugins: [],
};

export default config;
