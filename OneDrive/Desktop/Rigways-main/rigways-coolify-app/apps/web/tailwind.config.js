/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f3efe6',
        ink: '#15171b',
        rust: '#c45b2d',
        teal: '#1f6f78',
        steel: '#5f6b76'
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['Segoe UI', 'sans-serif']
      }
    },
  },
  plugins: [],
};
