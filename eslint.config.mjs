import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import sort from 'eslint-plugin-sort';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'node_modules',
    'dist',
    'coverage',
    '**/*.d.ts',
    'lib',
    'jupyterlite_terminal'
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, prettierRecommended],
    plugins: {
      '@stylistic': stylistic,
      sort
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: true }
        }
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@stylistic/quotes': [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: 'never' }
      ],
      curly: ['error', 'all'],
      eqeqeq: 'error',
      'prefer-arrow-callback': 'error',
      'sort/imports': [
        'warn',
        {
          caseSensitive: false,
          groups: [
            { regex: '^@', order: 0 },
            { regex: '^\\./', order: 20 },
            { regex: '^\\.\\./', order: 30 },
            { type: 'other', order: 10 }
          ],
          typeOrder: 'first'
        }
      ],
      'sort/import-members': ['error', { caseSensitive: false }]
    }
  }
]);
