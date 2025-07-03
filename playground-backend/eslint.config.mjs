import globals from 'globals'
import jestPlugin from 'eslint-plugin-jest'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,

  {
    ignores: [
      '.build/*',
      '.serverless/*',
      '**/.serverless/*',
      'node_modules/*',
      'coverage/*',
      '**/coverage/*',
      'deploy.js',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.recommended,
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // enable jest rules on test files
    files: ['tests/**'],
    ...jestPlugin.configs['flat/recommended'],
  },
)
