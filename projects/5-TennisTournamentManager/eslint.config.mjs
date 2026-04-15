/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file eslint.config.mjs
 * @desc ESLint flat configuration following the Google Style Guide with TypeScript support.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended.map((config) => ({
      ...config,
      files: ['**/*.{ts,tsx}'],
    })),
    {
      files: ['**/*.{ts,tsx}'],
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
        },
      },
      rules: {
        // Google Style Guide rules
        'indent': ['warn', 2],
        'linebreak-style': ['warn', 'unix'],
        'quotes': ['warn', 'single'],
        'semi': ['warn', 'always'],
        'max-len': ['warn', {code: 140, ignoreUrls: true}],
        'no-trailing-spaces': 'warn',
        'comma-dangle': ['warn', 'always-multiline'],
        'object-curly-spacing': ['warn', 'never'],
        'array-bracket-spacing': ['warn', 'never'],
        'space-before-function-paren': ['warn', {
          'anonymous': 'never',
          'named': 'never',
          'asyncArrow': 'always',
        }],

        // Prefer TypeScript for undefined-symbol checks
        'no-undef': 'off',

        // Disable base rule in favor of TS-aware rule
        'no-unused-vars': 'off',

        // TypeScript rules
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', {
          'argsIgnorePattern': '^_',
        }],
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            'selector': 'default',
            'format': ['camelCase'],
          },
          {
            'selector': 'variable',
            'format': ['camelCase', 'UPPER_CASE', 'PascalCase'],
          },
          {
            'selector': 'objectLiteralProperty',
            'format': ['camelCase', 'UPPER_CASE'],
            'filter': {
              'regex': '^\\.',
              'match': false,
            },
          },
          {
            'selector': 'typeLike',
            'format': ['PascalCase'],
          },
          {
            'selector': 'enumMember',
            'format': ['UPPER_CASE'],
          },
          {
            'selector': 'interface',
            'format': ['PascalCase'],
            'prefix': ['I'],
          },
        ],
      },
    },
    {
      ignores: [
        'dist/',
        'node_modules/',
        'coverage/',
        'docs/',
        'playwright-report/',
        'test-results/',
      ],
    },
);
