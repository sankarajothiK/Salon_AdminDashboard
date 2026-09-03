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
        // User Specified Palette: #FFEBB8 (Cream), #EA9D9D (Blush), #BD5579 (Berry Rose), #601D49 (Deep Plum/Burgundy)
        plum: {
          50: '#fbf4f8',
          100: '#f5e7f0',
          200: '#edd1e3',
          300: '#e1afd0',
          400: '#cf81b4',
          500: '#b85a97',
          600: '#9d3f7d',
          700: '#812f65',
          800: '#6c2854',
          900: '#601D49', // Primary Deep Burgundy / Wine
          950: '#3d0d2d',
        },
        berry: {
          50: '#fbf4f7',
          100: '#f7eaf0',
          200: '#f0d6e2',
          300: '#e4b6cc',
          400: '#d38fb0',
          500: '#BD5579', // Mid Berry Rose
          600: '#aa4266',
          700: '#8e3251',
          800: '#762b44',
          900: '#65273c',
          950: '#3d1221',
        },
        blush: {
          50: '#fdf7f7',
          100: '#fbeff0',
          200: '#f8e1e2',
          300: '#f2cacd',
          400: '#eaabae',
          500: '#EA9D9D', // Soft Coral / Rose Blush
          600: '#d77273',
          700: '#b55455',
          800: '#964748',
          900: '#7e3e3f',
          950: '#451e1f',
        },
        cream: {
          50: '#fffef9',
          100: '#fffcf0',
          200: '#fff8df',
          300: '#fff2c7',
          400: '#FFEBB8', // Warm Champagne Cream
          500: '#f5d68c',
          600: '#dcaf57',
          700: '#b68837',
          800: '#936a2e',
          900: '#7a5528',
          950: '#442d11',
        },
      },
      boxShadow: {
        'plum-sm': '0 2px 10px -1px rgba(96, 29, 73, 0.15)',
        'plum-md': '0 6px 20px -2px rgba(96, 29, 73, 0.25)',
        'berry-sm': '0 2px 10px -1px rgba(189, 85, 121, 0.18)',
        'cream-sm': '0 2px 10px -1px rgba(255, 235, 184, 0.4)',
        'card-subtle': '0 1px 3px 0 rgba(96, 29, 73, 0.04), 0 1px 2px -1px rgba(96, 29, 73, 0.04)',
        'card-elevated': '0 10px 25px -5px rgba(96, 29, 73, 0.08), 0 8px 10px -6px rgba(96, 29, 73, 0.04)',
      }
    },
  },
  plugins: [],
}
