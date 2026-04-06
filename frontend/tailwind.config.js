/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef5ff',
          100: '#daeaff',
          200: '#bdd8ff',
          300: '#90bdff',
          400: '#5c9bff',
          500: '#3478f6',
          600: '#1d5feb',
          700: '#1649d0',
          800: '#183da9',
          900: '#193885',
          950: '#111f4d',
        },
        surface: {
          50:  '#f8f9fc',
          100: '#f1f3f8',
          200: '#e5e8f0',
          300: '#d0d5e3',
          400: '#9ba5be',
          500: '#6b7898',
          600: '#4d5b7a',
          700: '#374060',
          800: '#232c47',
          900: '#141a30',
          950: '#0b0f1e',
        },
        success: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
        warning: { 400: '#fbbf24', 500: '#f59e0b' },
        danger:  { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.08)',
        'card-lg': '0 4px 24px rgba(0,0,0,.15)',
        glow:    '0 0 0 3px rgba(52,120,246,.3)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        shimmer:  'shimmer 1.8s ease-in-out infinite',
        'fade-in':  'fadeIn .3s ease both',
        'slide-up': 'slideUp .4s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
}