/*********************************************************
 Tailwind config for DuckWire
**********************************************************/
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        tablet: "768px",
        desktop: "1280px",
      },
      fontSize: {
        12: "12px",
        16: "16px",
        14: "14px",
        15: "15px",
        18: "18px",
        22: "22px",
        32: "32px",
        42: "42px",
      },
      lineHeight: {
        14: "3.5rem",
        18: "4.5rem",
      },
      spacing: {
        marginmobile: "1rem",
      },
      zIndex: {
        1: "1",
      },
      scale: {
        80: ".8",
      },
      colors: {
        brand: {
          ink: "var(--brand-ink)",
          accent1: "var(--brand-accent-1)",
          accent2: "var(--brand-accent-2)",
        },
        light: {
          primary: "#d1d5db",
          light: "#f3f4f6",
          heavy: "#e5e7eb",
        },
        dark: {
          primary: "#111827",
          light: "#1f2937",
        },
        secondary: {
          neutral: "#9ca3af",
        },
        tertiary: {
          light: "#e5e7eb",
        },
        "ground-new-dark-red": "#7f1d1d",
        "ground-new-dark-blue": "#1e3a8a",
        bias: {
          left: {
            900: "#8b0000",
            500: "#d64545",
            300: "#ef9a9a"
          },
          center: {
            700: "#4b5563",
            400: "#9ca3af",
            200: "#e5e7eb"
          },
          right: {
            900: "#0b3d91",
            500: "#3b82f6",
            300: "#93c5fd"
          }
        }
      }
    }
  },
  plugins: [],
}
