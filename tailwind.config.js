/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foquinha: {
          azul: '#1e3a8a',
          amarelo: '#facc15'
        }
      }
    },
  },
  plugins: [],
}