import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        mode: {
          none: "#64748B",
          mirror: "#8B5CF6",
          shadow: "#EAB308",
          parallel: "#EF4444",
          canary: "#3B82F6",
          cutover: "#10B981"
        }
      },
      borderRadius: {
        lg: "0.75rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
