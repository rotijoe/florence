import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/build/**',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/jest.setup.js',
    ],
  },

  // Base rules for all packages
  {
    rules: {
      // Standard.js style rules
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      camelcase: ['error', { properties: 'always' }],

      'comma-dangle': ['error', 'never'],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // General best practices
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
    },
  },

  // Prettier must be last to override formatting rules
  prettier
)
