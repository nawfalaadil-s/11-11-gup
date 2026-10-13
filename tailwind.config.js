/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-ocean': '#0a0e1a',
        'midnight-green': '#0d1b2a',
        'metallic-gold': '#d4af37',
        'glow-red': '#ff0040',
        'glow-blue': '#00d4ff',
        'glow-emerald': '#00ff88',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
