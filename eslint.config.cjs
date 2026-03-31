module.exports = [
  {
    ignores: ['node_modules/**', '**/dist/**', '**/.vite/**'],
  },
  {
    files: ['agriprice-ghana/backend/**/*.js', 'agriprice-ghana/frontend/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['*.js', 'src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs'
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
];