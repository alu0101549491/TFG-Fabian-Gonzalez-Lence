import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      files: ['**/*.{ts,tsx}'],
      plugins: {
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
      },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
        },
        parserOptions: {
          project: './tsconfig.json',
          tsconfigRootDir: import.meta.dirname,
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      settings: {
        react: {
          version: 'detect',
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
        
        // TypeScript rules
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
            'format': ['camelCase', 'UPPER_CASE', 'PascalCase'],
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
        
        // React rules
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    {
      ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'docs/**'],
    },
);