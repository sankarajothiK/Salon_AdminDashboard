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
        // Official Royal White & Wine Palette
        wine: {
          50: '#fdf2f7',
          100: '#fce7f1',
          200: '#fbcfe5',
          300: '#f8a7cf',
          400: '#ea9d9d', // Blush / Rose Gold
          500: '#bd5579', // Berry Rose Accent
          600: '#9e355c',
          700: '#7d2347',
          800: '#601d49', // Primary Deep Royal Wine
          900: '#481436',
          950: '#2e0a22',
        },
        champagne: {
          50: '#fffcf2',
          100: '#fff8e1',
          200: '#ffebb8', // Warm Champagne Cream
          300: '#ffd580',
          400: '#ffbe4d',
        },
      },
      boxShadow: {
        'wine-sm': '0 2px 10px -1px rgba(96, 29, 73, 0.2)',
        'wine-md': '0 6px 20px -2px rgba(96, 29, 73, 0.28)',
        'card-subtle': '0 1px 3px 0 rgba(96, 29, 73, 0.06), 0 1px 2px -1px rgba(96, 29, 73, 0.04)',
        'card-elevated': '0 10px 25px -5px rgba(96, 29, 73, 0.09), 0 8px 10px -6px rgba(96, 29, 73, 0.05)',
      }
    },
  },
  plugins: [],
}
