/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional minimal palette: black, white, pastel lilac
        primary: {
          50: '#faf8fc',
          100: '#f3f0f8',
          200: '#e8e1f1',
          300: '#d6c9e5',
          400: '#bfa8d4',
          500: '#a687c0',  // Pastel lilac - main brand color
          600: '#8b6aa8',
          700: '#73578b',
          800: '#604a73',
          900: '#51405f',
          950: '#33263d',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
