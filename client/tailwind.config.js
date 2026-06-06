/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      },
      colors: {
        // Full scale built around the exact TFC logo blue: #04436E
        brand: {
          50:  "#EEF6FB",
          100: "#D3E9F5",
          200: "#A7D2EA",
          300: "#6AAFC8",
          400: "#3887AE",
          500: "#1A6696",
          600: "#085580",
          700: "#04436E",  // ← exact logo color
          800: "#033358",
          900: "#022242",
          950: "#011629",
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)",
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)"
      }
    }
  },
  plugins: []
};
