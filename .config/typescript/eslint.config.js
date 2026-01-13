module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './.config/typescript/tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'prettier', // Must be last
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'sonarjs',
  ],
  rules: {
    // ============ SOLID PRINCIPLES ENFORCEMENT ============

    // Single Responsibility Principle
    'sonarjs/cognitive-complexity': ['error', 15],  // Max complexity per function
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],

    // Open/Closed Principle
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',

    // Liskov Substitution Principle
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'warn',

    // Interface Segregation Principle
    '@typescript-eslint/prefer-readonly': 'warn',

    // Dependency Inversion Principle
    '@typescript-eslint/no-parameter-properties': 'off', // Allow DI via constructor

    // ============ DEPENDENCY INJECTION BEST PRACTICES ============
    'no-new': 'error',  // Prefer factory functions
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',  // Allow mutable params for DI

    // ============ CIRCULAR DEPENDENCIES ============
    'import/no-cycle': ['error', { maxDepth: Infinity, ignoreExternal: true }],
    'import/no-self-import': 'error',

    // ============ CODE QUALITY ============
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-collapsible-if': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',

    // ============ IMPORT ORGANIZATION ============
    'import/order': ['error', {
      'groups': [
        'builtin',    // Node.js built-in modules
        'external',   // npm packages
        'internal',   // Internal modules
        'parent',     // Parent directories
        'sibling',    // Same directory
        'index',      // Index files
      ],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc', caseInsensitive: true },
    }],
    'import/no-duplicates': 'error',

    // ============ GENERAL BEST PRACTICES ============
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './.config/typescript/tsconfig.json',
      },
    },
  },
};
