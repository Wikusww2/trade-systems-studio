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
        nightmare: {
          bg: "#121212",
          surface: "#1A1D24",
          border: "#2A2F3A",
          muted: "#94A3B8",
          text: "#E2E8F0",
          crimson: "#FF3B30",
          amber: "#F59E0B",
          emerald: "#10B981",
          cyan: "#38BDF8",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
