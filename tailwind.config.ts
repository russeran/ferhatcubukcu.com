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
        /** Warm paper — digital portfolio base */
        parchment: {
          DEFAULT: "#f6f6f4",
          dark: "#e8e8e4",
        },
        /** Primary ink */
        umber: {
          DEFAULT: "#52525b",
          deep: "#18181b",
        },
        /** Accent — links & primary actions */
        oxide: {
          DEFAULT: "#2563eb",
          muted: "#3b82f6",
        },
        /** Secondary text / UI chrome */
        patina: {
          DEFAULT: "#64748b",
          light: "#94a3b8",
        },
        /** Highlights (admin, key labels) */
        goldleaf: "#06b6d4",
      },
      fontFamily: {
        serif: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "site-grid":
          "linear-gradient(to right, rgb(24 24 27 / 0.045) 1px, transparent 1px), linear-gradient(rgb(24 24 27 / 0.045) 1px, transparent 1px)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
