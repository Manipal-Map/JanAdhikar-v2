/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beige palette (Canvas & Surfaces)
        beige: {
          50: '#FBF9F5',
          100: '#F5F0E6',
          200: '#EBE3D3',
          300: '#DCD0B8',
          800: '#4A4438',
          900: '#2C271E',
        },
        // Very Light Saffron palette (Primary Brand & Highlights)
        saffron: {
          50: '#FFF9F0',
          100: '#FFF3E0', // Very Light Saffron
          200: '#FFE0B2',
          300: '#FFCC80',
          500: '#FF9933', // Deep Saffron Accent
          700: '#D97706',
        },
        // Very Light Blue palette (Secondary Accents & Highlights)
        iceblue: {
          50: '#F4F8FC',
          100: '#EBF5FF', // Very Light Blue
          200: '#D6E8FA',
          300: '#B5D8F8',
          600: '#2563EB',
          800: '#1E40AF',
        },
      },
    },
  },
  plugins: [],
}