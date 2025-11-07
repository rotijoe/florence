import rootConfig from '../../eslint.config.js';

export default [
  ...rootConfig,
  {
    files: ['**/*.{js,ts}'],
    rules: {
      // Node.js/API specific rules
      'no-console': 'off', // APIs often use console.log
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

