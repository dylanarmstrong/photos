import eslint from '@dylanarmstrong/eslint-config';

export default [
  ...eslint,
  {
    rules: {
      camelcase: 'off',
    },
  },
];
