/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2fcf5',
          100: '#e2f9ea',
          200: '#c6f2d6',
          300: '#97e6b2',
          400: '#60d187',
          500: '#38b566',
          600: '#299550',
          700: '#237742',
          800: '#1f5f37',
          900: '#1a4e2f',
          950: '#0a2c16',
        },
      },
    },
  },
  plugins: [],
}
