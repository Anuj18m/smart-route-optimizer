/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // toggle via .dark class on <html>
  theme: {
    extend: {
      colors: {
        glass: {
          dark:  'rgba(15, 23, 42, 0.65)',
          light: 'rgba(255, 255, 255, 0.55)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'dash': 'dash 1.5s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
      },
      keyframes: {
        dash: {
          to: { 'stroke-dashoffset': '-20' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        slideLeft: {
          from: { opacity: 0, transform: 'translateX(-24px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
        slideRight: {
          from: { opacity: 0, transform: 'translateX(24px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
