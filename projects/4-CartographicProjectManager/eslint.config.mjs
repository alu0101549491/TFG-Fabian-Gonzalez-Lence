import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended.map((config) => ({
      ...config,
      files: ['**/*.{ts,tsx}'],
    })),
    ...vuePlugin.configs['flat/recommended'],
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

        // Vue rules
        'vue/multi-word-component-names': 'off',
        'vue/html-indent': ['warn', 2],
        'vue/max-attributes-per-line': ['warn', {
          'singleline': 3,
          'multiline': 1,
        }],
      },
    },
    {
      files: ['**/*.vue'],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
        },
        parser: vueParser,
        parserOptions: {
          parser: tseslint.parser,
          ecmaVersion: 'latest',
          sourceType: 'module',
          extraFileExtensions: ['.vue'],
        },
      },
      rules: {
        // Prefer TypeScript for undefined-symbol checks
        'no-undef': 'off',

        // Vue SFCs can confuse the base rule; keep this non-blocking
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['jest.setup.cjs'],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.commonjs,
          ...globals.jest,
          ...globals.es2021,
        },
        sourceType: 'commonjs',
      },
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['tests/__mocks__/**/*.cjs'],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.commonjs,
          ...globals.es2021,
        },
        sourceType: 'commonjs',
      },
    },
    {
      ignores: ['**/dist/**', 'backend/**', 'node_modules/**', 'coverage/**', 'docs/**', 'eslint.config.mjs'],
    },
);
