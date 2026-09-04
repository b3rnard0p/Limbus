/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        ink: "#241b16",
        vellum: "#f4e7c5",
        ember: "#b24a2d",
        laurel: "#557768",
        night: "#151820",
        gold: "#d2a648"
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', "serif"],
        sans: ['"Cinzel Decorative"', "serif"]
      },
      boxShadow: {
        map: "0 18px 60px rgba(14, 18, 24, 0.26)"
      }
    }
  },
  plugins: []
};
