/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      spacing: {
        '6.5': '76rem',
      },
      colors: {
        'light-yellow': '#FFE99D',
      },
    },
  },
  plugins: [],
}

