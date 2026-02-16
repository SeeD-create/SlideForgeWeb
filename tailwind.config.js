/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"游ゴシック"', '"Yu Gothic"', '"Hiragino Sans"', '"Meiryo"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
