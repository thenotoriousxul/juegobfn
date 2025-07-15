/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts,js}",
    "./src/**/*.component.{html,ts,js}"
  ],
  theme: {
    extend: {
      fontFamily: {
        pirate: ['"Pirate"', 'serif']
      }
    },
  },
  plugins: [],
}
