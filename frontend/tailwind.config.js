/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glass: "0 20px 50px rgba(17, 24, 39, 0.24)",
      },
      borderRadius: {
        card: "1.25rem",
      },
      colors: {
        brand: {
          50: "#e6f4ff",
          100: "#cce9ff",
          200: "#99d3ff",
          300: "#66bdff",
          400: "#33a7ff",
          500: "#0a88f7",
          600: "#056ec8",
          700: "#05579d",
          800: "#0a4376",
          900: "#0d355c"
        }
      },
      keyframes: {
        routePulse: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        routePulse: "routePulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
