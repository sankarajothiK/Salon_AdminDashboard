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
        // Luxury Gold & Dark Accent (#161826) Palette
        dark: {
          50: '#F5F6FA',
          100: '#EAECEF',
          200: '#D5D8DF',
          300: '#A9B0C3',
          400: '#737C9B',
          500: '#4B5372',
          600: '#343B54',
          700: '#252A3F',
          800: '#1D2132',
          900: '#161826', // Exact Dark Accent specified by user
          950: '#0E101A',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F9F2D6',
          200: '#F2E1A7',
          300: '#E8CC73',
          400: '#DFB847',
          500: '#D4AF37', // Luxury Gold
          600: '#C5A059',
          700: '#9E7D23',
          800: '#7D631C',
          900: '#5C4915',
          950: '#3B2E0C',
        },
      },
      boxShadow: {
        'gold-sm': '0 2px 10px -1px rgba(212, 175, 55, 0.25)',
        'gold-md': '0 6px 20px -2px rgba(212, 175, 55, 0.35)',
        'dark-sm': '0 2px 10px -1px rgba(22, 24, 38, 0.2)',
        'dark-md': '0 6px 24px -2px rgba(22, 24, 38, 0.35)',
        'card-subtle': '0 1px 3px 0 rgba(22, 24, 38, 0.06), 0 1px 2px -1px rgba(22, 24, 38, 0.04)',
        'card-elevated': '0 10px 25px -5px rgba(22, 24, 38, 0.08), 0 8px 10px -6px rgba(212, 175, 55, 0.06)',
      }
    },
  },
  plugins: [],
}
