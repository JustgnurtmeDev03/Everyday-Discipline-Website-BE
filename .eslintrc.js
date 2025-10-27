module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@nestjs/recommended', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  rules: {
    // Add custom rules if needed, e.g., 'no-console': 'warn'
  },
};
