/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palet pentadbiran profesional
        brand: {
          50: '#eef4fb',
          100: '#d9e6f5',
          200: '#b3cdec',
          300: '#7fa8de',
          400: '#4d83cf',
          500: '#2f63b5',
          600: '#1e4a8f',
          700: '#1a3b73',
          800: '#162e57',
          900: '#0f1f3d',
        },
        accent: {
          // emerald — warna aksen "tenang & produktif"
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
