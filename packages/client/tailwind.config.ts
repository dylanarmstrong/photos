import type { Config } from 'tailwindcss';

export default {
  content: [
    '../server/src/**/*.tsx',
    './src/**/*.ts',
  ],
  plugins: [],
  theme: {
    colors: {
      black: '#151515',
      blue: '#133dc8',
      purple: '#6034cc',
      red: '#e21352',
      white: '#fafafa',
    },
    extend: {
      gridTemplateColumns: {
        details: '1fr 400px',
        photo: '24px 1fr 24px',
      },
      gridTemplateRows: {
        details: '1fr auto',
        layout: 'auto 1fr auto',
      },
    },
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      serif: ['serif'],
    },
  },
} satisfies Config;
