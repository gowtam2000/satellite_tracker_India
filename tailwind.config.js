/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#0a1628',
          100: '#0d1f38',
          200: '#112845',
          300: '#163152',
          400: '#1a3a5f',
          500: '#1f446d',
          600: '#234d7a',
          700: '#285787',
          800: '#2c6094',
          900: '#306aa1',
        },
        cyan: {
          neon: '#00f0ff',
          bright: '#00c8ff',
          deep: '#0080ff',
        },
        lime: {
          neon: '#00ff88',
        }
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'tech': ['Rajdhani', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
