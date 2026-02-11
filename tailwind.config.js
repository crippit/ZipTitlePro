
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D0BCFF',
        'on-primary': '#381E72',
        'primary-container': '#EADDFF',
        'on-primary-container': '#21005D',
        secondary: '#CCC2DC',
        'secondary-container': '#332D41',
        tertiary: '#EFB8C8',
        surface: '#1C1B1F',
        'on-surface': '#E6E1E5',
        'surface-container': '#2B2930',
        outline: '#49454F',
        error: '#F2B8B5',
        'on-error': '#601410',
        success: '#B2FF59',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Bebas Neue', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
