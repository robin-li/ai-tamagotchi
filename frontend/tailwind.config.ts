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
      animation: {
        bounce: 'bounce 1s infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
        float: 'float 2s ease-in-out infinite',
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
      },
    },
  },
  plugins: [],
} satisfies Config;
