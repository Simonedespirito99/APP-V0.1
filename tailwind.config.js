
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#067ff9",
        "background-dark": "#0f1923",
        "surface-dark": "#16202c",
        "surface-darker": "#0a1118",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(6, 127, 249, 0.3)',
        'neon-strong': '0 0 25px rgba(6, 127, 249, 0.5)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
