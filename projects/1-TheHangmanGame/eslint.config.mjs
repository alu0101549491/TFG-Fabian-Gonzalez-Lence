import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      // Keep a JS-friendly parserOptions at top-level
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Google Style Guide rules
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'max-len': ['error', {code: 100, ignoreUrls: true}],
      'no-trailing-spaces': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'never'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', {
        'anonymous': 'never',
        'named': 'never',
        'asyncArrow': 'always',
      }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
      }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          'selector': 'default',
          'format': ['camelCase'],
        },
        {
          'selector': 'variable',
          'format': ['camelCase', 'UPPER_CASE'],
        },
        {
          'selector': 'typeLike',
          'format': ['PascalCase'],
        },
        {
          'selector': 'enumMember',
          'format': ['UPPER_CASE'],
        },
      ],
    },
    // Ignore common config and test files that are not part of the TS project
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'docs/**', 'tests/**', 'jest.config.*', 'jest.setup.*', 'eslint.config.*', 'vite.config.*', 'tests/**', '**/__mocks__/**'],
  },
  // TypeScript-only override: inject the TypeScript parser/plugin and the
  // type-checked rules from typescript-eslint, but only for source files.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    // Bring in the parser and plugin from the package's base config
    languageOptions: {
      parser: tseslint.configs.recommendedTypeChecked[0].languageOptions.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    plugins: tseslint.configs.recommendedTypeChecked[0].plugins,
    // Use only the type-checked rules object from the package and apply them
    // in this override so they run only for TS source files.
    rules: tseslint.configs.recommendedTypeChecked[2].rules,
  },
);