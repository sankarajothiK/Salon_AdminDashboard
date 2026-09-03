/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Alata', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        alata: ['Alata', 'sans-serif'],
      },
      colors: {
        // Complete Emerald Green & White Palette
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Primary vibrant emerald
          700: '#047857',
          800: '#065f46',
          900: '#064e3b', // Deep forest emerald
          950: '#022c22',
        },
        mint: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        }
      },
      boxShadow: {
        'emerald-sm': '0 2px 10px -1px rgba(5, 150, 105, 0.2)',
        'emerald-md': '0 6px 20px -2px rgba(5, 150, 105, 0.25)',
        'card-subtle': '0 1px 3px 0 rgba(5, 150, 105, 0.05), 0 1px 2px -1px rgba(5, 150, 105, 0.05)',
        'card-elevated': '0 10px 25px -5px rgba(5, 150, 105, 0.08), 0 8px 10px -6px rgba(5, 150, 105, 0.04)',
      }
    },
  },
  plugins: [],
}
