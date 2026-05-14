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
        /** Warm shell — stretched linen / raw canvas */
        parchment: {
          DEFAULT: "#f4efe6",
          warm: "#efe6d8",
          dark: "#e2d9cb",
          ink: "#c9bdb0",
        },
        /** Earth ink */
        umber: {
          DEFAULT: "#5a5248",
          deep: "#1a1714",
          mist: "#8a8177",
        },
        /** Venetian red — Hagia Sophia / dome accents */
        oxide: {
          DEFAULT: "#922f3d",
          muted: "#b54856",
          deep: "#6e1f2a",
        },
        /** Cool stone / dusk */
        patina: {
          DEFAULT: "#4f5866",
          light: "#7a8598",
        },
        /** Dome gold — oil highlights */
        goldleaf: "#c9a85a",
        /** Burnt umber wash — shadows in paint film */
        sienna: {
          DEFAULT: "#7d4c3a",
          muted: "#a07262",
        },
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
          "0 26px 52px -14px rgba(26, 23, 20, 0.18), 0 10px 24px -10px rgba(125, 76, 58, 0.12), inset 0 1px 0 rgba(255,252,245,0.45)",
        "gallery-hover":
          "0 34px 68px -18px rgba(26, 23, 20, 0.22), 0 14px 32px -12px rgba(146, 47, 61, 0.12), inset 0 0 0 1px rgba(255,252,245,0.48), inset 0 1px 0 rgba(255,252,245,0.55)",
        header:
          "0 12px 40px -12px rgba(26, 23, 20, 0.08), inset 0 -1px 0 rgba(201, 168, 90, 0.12)",
      },
      backgroundImage: {
        /** Atmospheric washes — fibonacci-weighted focal points */
        /** Rectilinear wash — reads squarer than soft ellipses on the darker base */
        "fibonacci-hint":
          "linear-gradient(180deg, rgba(201,168,90,0.09) 0%, transparent 22%), linear-gradient(0deg, rgba(125,76,58,0.07) 0%, transparent 18%), linear-gradient(90deg, rgba(26,23,20,0.05) 0%, transparent 10%, transparent 90%, rgba(26,23,20,0.05) 100%), linear-gradient(180deg, transparent 62%, rgba(146,47,61,0.04) 100%)",
        "grain-fine":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.042'/%3E%3C/svg%3E\")",
        "canvas-vignette":
          "radial-gradient(ellipse 85% 55% at 50% 45%, transparent 30%, rgba(26,23,20,0.04) 100%)",
        "hero-lamp":
          "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(255,252,245,0.55), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 25%, rgba(201,168,90,0.08), transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.75s ease-out forwards",
        "hero-ken": "heroKen 8.5s ease-out forwards",
        /** Very slow ambient drift for hero wash (respect motion-reduce in markup). */
        "hero-atmosphere": "heroAtmosphere 32s ease-in-out infinite",
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
        heroAtmosphere: {
          "0%, 100%": { opacity: "0.88", transform: "translate(0, 0) scale(1)" },
          "50%": { opacity: "1", transform: "translate(-12px, 8px) scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
