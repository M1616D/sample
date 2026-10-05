import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
      },
      screens: {
        "2xl": "1360px",
      },
    },
    extend: {
      colors: {
        // Graphite / machine-casing dark tones
        ink: {
          50: "#f5f6f7",
          100: "#e7e9ec",
          200: "#c9cdd4",
          300: "#a2a9b3",
          400: "#6f7885",
          500: "#4d5560",
          600: "#3a4049",
          700: "#2b3038",
          800: "#1c2025",
          900: "#12151a",
          950: "#0a0c0f",
        },
        // Cool steel neutrals for light surfaces
        steel: {
          50: "#f7f8f9",
          100: "#eef0f2",
          200: "#e0e3e7",
          300: "#cbd0d6",
          400: "#9aa2ac",
          500: "#6d7580",
          600: "#545b65",
          700: "#424852",
          800: "#343941",
          900: "#2a2e35",
        },
        // Industrial signal accent
        accent: {
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#c2410c",
          700: "#9a3412",
          800: "#7c2d12",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      borderRadius: {
        // Deliberately restrained — industrial UI is not pill-shaped
        card: "0.25rem",
      },
      boxShadow: {
        panel: "0 1px 2px 0 rgb(10 12 15 / 0.06), 0 1px 3px 0 rgb(10 12 15 / 0.08)",
        raised: "0 4px 16px -4px rgb(10 12 15 / 0.14), 0 2px 6px -2px rgb(10 12 15 / 0.10)",
        header: "0 1px 0 0 rgb(18 21 26 / 0.06)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
