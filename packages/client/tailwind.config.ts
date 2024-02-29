import type { Config } from 'tailwindcss';

// eslint-disable-next-line import/no-unused-modules
export default {
  content: [
    '../server/views/*.pug',
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
    extend: {},
    fontFamily: {
      sans: ['Mukta', 'Helvetica Neue', 'sans-serif'],
    },
    gridTemplateRows: {
      layout: 'auto 1fr auto',
    },
  },
} satisfies Config;
