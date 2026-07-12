/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        'bg-elevated': '#151513',
        card: '#1A1A18',
        'card-hover': '#201F1C',
        border: {
          DEFAULT: '#2B2A26',
          soft: '#232220',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E9CC72',
          dim: '#8A7128',
        },
        ink: {
          DEFAULT: '#F3F1E9',
          secondary: '#A6A297',
          muted: '#6E6B62',
        },
        success: { DEFAULT: '#5FA97C', bg: 'rgba(95,169,124,.13)' },
        danger: { DEFAULT: '#C4574C', bg: 'rgba(196,87,76,.13)' },
        warning: { DEFAULT: '#D4913A', bg: 'rgba(212,145,58,.13)' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        control: '10px',
      },
      boxShadow: {
        card: '0 12px 32px rgba(0,0,0,.4)',
        'card-sm': '0 4px 14px rgba(0,0,0,.3)',
        gold: '0 4px 14px rgba(212,175,55,.25)',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        riseIn: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        modalIn: { from: { opacity: 0, transform: 'translateY(10px) scale(.98)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
        toastIn: { from: { opacity: 0, transform: 'translateX(30px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
      animation: {
        fadeUp: 'fadeUp .35s ease',
        riseIn: 'riseIn .6s cubic-bezier(.16,1,.3,1)',
        modalIn: 'modalIn .25s cubic-bezier(.16,1,.3,1)',
        toastIn: 'toastIn .25s ease',
      },
    },
  },
  plugins: [],
};
