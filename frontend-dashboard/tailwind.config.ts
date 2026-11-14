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
