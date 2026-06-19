/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--primary-color)',
          hover: 'var(--primary-hover)',
          glow: 'var(--primary-glow)',
          accent: 'var(--accent-color)'
        }
      }
    },
  },
  plugins: [],
}
