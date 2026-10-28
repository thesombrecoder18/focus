/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          light: '#4F46E5',
          dark: '#818CF8',
          DEFAULT: '#4F46E5',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#161922',
        },
        background: {
          light: '#F7F8FA',
          dark: '#0F1117',
        },
        border: {
          light: '#E5E7EB',
          dark: '#262B35',
        },
        text: {
          primary: {
            light: '#111827',
            dark: '#F3F4F6',
          },
          secondary: {
            light: '#6B7280',
            dark: '#9CA3AF',
          }
        },
        sidebar: {
          light: '#FFFFFF',
          dark: '#131721',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '10px',
        'xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.15s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
