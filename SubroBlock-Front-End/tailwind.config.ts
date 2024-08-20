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
          DEFAULT: "var(--color-background)",
          secondary: "var(--color-background-secondary)"
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)"
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          muted: "var(--color-accent-muted)",
          foreground: "var(--color-accent-foreground)",
          active: "var(--color-accent-active)"
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)"
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          foreground: "var(--color-warning-foreground)"
        },
        success: {
          DEFAULT: "var(--color-success)",
          foreground: "var(--color-success-foreground)"
        },

        // NOTICE: redundant variables, avoid using them. leftovers in components/ui are fine, those are external
        border: "var(--color-secondary)",
        input: "var(--color-input)",
        ring: "var(--color-accent)",
        card: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary)"
        },
        popover: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-primary-foreground)"
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
