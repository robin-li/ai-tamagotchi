import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8E7',
        'cream-dark': '#F5E6C8',
        orange: {
          light: '#FFD580',
          DEFAULT: '#FFA500',
          dark: '#CC8400',
        },
        brown: {
          light: '#A0826D',
          DEFAULT: '#6B4226',
          dark: '#3E2315',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px #8B4513',
        'pixel-sm': '2px 2px 0px 0px #8B4513',
        'pixel-hover': '6px 6px 0px 0px #8B4513',
      },
      animation: {
        bounce: 'bounce 1s infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
        float: 'float 2s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pixel-blink': 'pixel-blink 1s steps(2, start) infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        'pixel-blink': {
          'to': { visibility: 'hidden' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
