import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./stories/**/*.{js,ts,jsx,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "#51667D",         // white, main background color
          secondary: "#0D1C2C"        // gray, background of background
        },
        primary: {
          DEFAULT: "#F6F6F6",         // black 200 text color. most text is bland unless explicitly DARK needed, then use 300
          foreground: "#FFFFFF"       // black 300
        },
        secondary: { // or muted
          DEFAULT: "#51667D",         // black 50
          foreground: "#F6F6F6"       // black 100
        },
        accent: {
          DEFAULT: "#FFF4E9",         // orange 100, background
          muted: "#FFE7D2",           // orange 200
          foreground: "#FE891D",      // orange 300, text
          active: "#FF6B00"           // orange 400
        },

        destructive: {
          DEFAULT: "#FF2B00",         // red 200
          foreground: "#FFE7E4"       // red 100, same as 200 but 15% opacity
        },
        warning: {
          DEFAULT: "#FFB525",         // yellow 200
          foreground: "#FFF4DF"       // yellow 100
        },
        success: {
          DEFAULT: "#2FC385",         // green 200
          foreground: "#E0F6ED"       // green 100
        },

        // NOTICE: redundant variables, avoid using them. leftovers in components/ui are fine, those are external
        border: "#51667D",            // black 50, same as secondary
        input: "#51667D",             // black 50, same as secondary
        ring: "#FFF4E9",              // accent
        card: {
          DEFAULT: "#E5E5E5",         // black 50, same as secondary
          foreground: "#E5E5E5"       // black 50, same as secondary
        },
        popover: {
          DEFAULT: "#51667D",         // black 50, same as secondary
          foreground: "#FFFFFF"       // black 300(?), is that correct color here?
        }
      },
      borderRadius: {       // 'rounded-*' classes
        full: "50%",        // full circle
        xxl: "1.5rem",      // 24px
        xl: "1rem",         // 16px
        lg2: "0.75rem",     // 12px
        lg1: "0.625rem",    // 10px
        lg: "0.5rem",       // 8px
        DEFAULT: "0.5rem",  // 8px
        md: "0.375rem",     // 6px
        sm: "0.25rem",      // 4px
        xs: "0.125rem",     // 2px
        none: "0"           // 0
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans]
      },
      fontSize: {
        // px / 16 = font size, other sizes are px / 4
        "3xl": ["1.75rem", "120%"],   // 28px
        "2xl": ["1.375rem", "120%"],  // 22px
        xl: ["1.125rem", "120%"],     // 18px
        lg: ["1rem", "120%"],         // 16px
        base: ["0.875rem", "130%"],   // 14px
        sm: ["0.75rem", "130%"]       // 12px
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;

export default config;
