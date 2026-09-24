/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F1F0EB",
        sheet: "#F8F7F3",
        ink: "#16181D",
        soft: "#565B63",
        rule: "#CFCCC2",
        prussian: "#24466B",
        verified: "#2F7A5B",
        pending: "#B9822B",
        breach: "#A3332B",
      },
      fontFamily: {
        serif: ["var(--font-boska)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-general-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        archival: "0 1px 3px rgba(22, 24, 29, 0.05), 0 4px 12px rgba(22, 24, 29, 0.03)",
        sheet: "0 0 0 1px #CFCCC2, 0 2px 8px rgba(22, 24, 29, 0.04)",
        elevated: "0 0 0 1px #CFCCC2, 0 8px 24px rgba(22, 24, 29, 0.06)",
      },
    },
  },
  plugins: [],
};
