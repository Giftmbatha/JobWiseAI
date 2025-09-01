// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF5EE',
        primary: '#1D503A',
        neutral: '#484848',
      },
    },
  },
  plugins: [],
}