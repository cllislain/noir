/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        "j-bg-base":       "var(--j-bg-base)",
        "j-bg-surface":    "var(--j-bg-surface)",
        "j-bg-elevated":   "var(--j-bg-elevated)",
        "j-sidebar-bg":    "var(--j-sidebar-bg)",
        "j-sidebar-border":"var(--j-sidebar-border)",
        "j-text-primary":  "var(--j-text-primary)",
        "j-text-secondary":"var(--j-text-secondary)",
        "j-text-muted":    "var(--j-text-muted)",
        "j-border":        "var(--j-border)",
        "j-accent":        "var(--j-accent)",
        "j-accent-hover":  "var(--j-accent-hover)",
        "j-accent-text":   "var(--j-accent-text)",
        "j-ring":          "var(--j-ring)",
      },
    },
  },
  plugins: [],
};
