import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Warm shell — paper & stone */
        parchment: {
          DEFAULT: "#f3efe8",
          dark: "#e6dfd4",
        },
        /** Earth ink */
        umber: {
          DEFAULT: "#5c5348",
          deep: "#1f1b16",
        },
        /** Venetian red — Hagia Sophia / dome accents */
        oxide: {
          DEFAULT: "#9b2335",
          muted: "#b83a4a",
        },
        /** Cool stone / dusk */
        patina: {
          DEFAULT: "#4a5568",
          light: "#718096",
        },
        /** Dome gold */
        goldleaf: "#c6a04f",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.22em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        gallery:
          "0 28px 56px -16px rgba(31, 27, 22, 0.14), 0 8px 20px -8px rgba(31, 27, 22, 0.08)",
        "gallery-hover":
          "0 36px 72px -20px rgba(31, 27, 22, 0.18), 0 12px 28px -10px rgba(155, 35, 53, 0.08)",
      },
      backgroundImage: {
        "fibonacci-hint":
          "radial-gradient(ellipse 100% 70% at 12% 18%, rgba(155,35,53,0.07), transparent 52%), radial-gradient(circle at 88% 12%, rgba(198,160,79,0.12), transparent 38%), radial-gradient(circle at 70% 85%, rgba(74,85,104,0.06), transparent 45%)",
        "grain-fine":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up": "fadeUp 0.75s ease-out forwards",
        "hero-ken": "heroKen 8.5s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        heroKen: {
          "0%": { transform: "scale(1) translate(0%, 0%)" },
          "100%": {
            transform: "scale(1.07) translate(-1.5%, -1.2%)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
