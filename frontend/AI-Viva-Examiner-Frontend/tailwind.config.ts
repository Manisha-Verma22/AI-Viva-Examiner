import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        white: "var(--white)",

        blue: {
          50: "var(--blue-50)",
          100: "var(--blue-100)",
          200: "var(--blue-200)",
          300: "var(--blue-300)",
          400: "var(--blue-400)",
          500: "var(--blue-500)",
        },

        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",

        success: "var(--success)",
        danger: "var(--danger)",
      },

      boxShadow: {
        soft: "var(--shadow-soft)",
        pressed: "var(--shadow-pressed)",
      },

      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
    },
  },

  plugins: [],
} satisfies Config;