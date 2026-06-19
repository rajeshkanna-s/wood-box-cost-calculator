/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        wood: {
          50:  '#fdf8ef',
          100: '#faecd5',
          200: '#f5d6a9',
          300: '#eebb73',
          400: '#e89c3f',
          500: '#e18321',
          600: '#d26a17',
          700: '#ae5016',
          800: '#8c3f19',
          900: '#723518',
          950: '#3d190a',
        },
        dark: {
          50:  '#f6f6f7',
          100: '#e2e3e5',
          200: '#c4c5ca',
          300: '#9fa1a8',
          400: '#7b7d86',
          500: '#61636c',
          600: '#4c4e56',
          700: '#3f4047',
          800: '#35363c',
          850: '#272830',
          900: '#1e1f25',
          925: '#191a20',
          950: '#111217',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(232, 156, 63, 0.15)' },
          '100%': { boxShadow: '0 0 30px rgba(232, 156, 63, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
