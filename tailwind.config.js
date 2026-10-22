/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: { 50:'#e8f8f6',100:'#c5ede9',200:'#8fdcd4',300:'#55c7bd',400:'#26b0a5',500:'#0f9d94',600:'#0b7f78',700:'#09645f',800:'#074d49',900:'#053a37' },
        amber: { 50:'#fff8e6',100:'#ffecb8',200:'#ffdc80',300:'#ffc94d',400:'#ffb81f',500:'#f5a000',600:'#c98100',700:'#9a6200' },
        ink: { 900:'#14232b', 700:'#33464f', 500:'#5d717b', 300:'#a9b8bf', 100:'#e6edf0', 50:'#f4f8f9' }
      },
      fontFamily: { sans: ['"Nunito"', 'system-ui', '"Noto Sans Devanagari"', 'sans-serif'] },
      boxShadow: {
        chunk: '0 4px 0 0 var(--chunk, #09645f)',
        chunkAmber: '0 4px 0 0 #9a6200'
      }
    }
  },
  plugins: []
};
