/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#111111',
          light: '#FFFFFF',
          gray: '#F5F5F5',
          muted: '#777777',
          border: '#E5E5E5',
          subtle: '#FAFAFA'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'Inter', 'sans-serif']
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.2em'
      }
    },
  },
  plugins: [],
}
