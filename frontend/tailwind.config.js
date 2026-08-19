/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          maroon: '#881337',
          maroonHover: '#701A75',
        },
        ashoka: {
          navy: '#0F172A',
          navyHover: '#1E293B',
        },
        saffron: {
          deep: '#C2410C',
        },
        statutory: {
          green: '#065F46',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'draw-line': 'drawHanddrawnLine 1.2s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawHanddrawnLine: {
          '0%': { strokeDashoffset: '450', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { strokeDashoffset: '0', opacity: '1' },
        }
      },
    },
  },
  plugins: [],
}
