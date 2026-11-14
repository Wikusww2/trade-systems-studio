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
      },
      fontFamily: {
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
        serif: [
          "Newsreader",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
