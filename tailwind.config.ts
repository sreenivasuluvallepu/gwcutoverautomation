import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F4F7FA",
          100: "#E7EDF5",
          200: "#D5DEEA",
          300: "#A9BED8",
          400: "#7897BF",
          500: "#4F78A9",
          600: "#3B5F8B",
          700: "#304C70",
          800: "#273D5A",
          900: "#1D2F46",
          950: "#131F30"
        },
        teal: {
          400: "#2CC0B5",
          500: "#18A69B",
          600: "#0E7D75"
        },
        amber: {
          400: "#F3B23F",
          500: "#D99100",
          600: "#A66D00"
        },
        danger: {
          400: "#F67272",
          500: "#DA4A4A",
          600: "#B23333"
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(8, 20, 40, 0.16)",
        card: "0 8px 20px rgba(10, 35, 66, 0.12)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      fontFamily: {
        sans: ["Space Grotesk", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
