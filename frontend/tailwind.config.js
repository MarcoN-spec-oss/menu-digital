/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad9ad',
          300: '#f6bf7a',
          400: '#f19d44',
          500: '#ed8019',
          600: '#e0620f',
          700: '#bc470e',
          800: '#953612',
          900: '#772d11',
          950: '#3f1406',
        },
      },
    },
  },
  plugins: [],
}