import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import tsconfigNode from './tsconfig.node.json' with { type: 'json' };
import tsconfigWeb from './tsconfig.web.json' with { type: 'json' };

export default defineConfig(
    { ignores: ['**/node_modules', '**/dist', '**/out'] },
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    perfectionist.configs['recommended-alphabetical'],
    storybook.configs['flat/recommended'],
    {
        files: tsconfigNode.include,
        languageOptions: { globals: globals.node, parserOptions: { project: ['./tsconfig.node.json'] } },
    },
    {
        files: tsconfigWeb.include,
        languageOptions: { globals: globals.browser, parserOptions: { project: ['./tsconfig.web.json'] } },
    },
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    reactRefresh.configs.vite,
    reactHooks.configs['recommended-latest'],
    { settings: { react: { version: 'detect' } } },
    { rules: { 'react/jsx-curly-brace-presence': 'error', 'react/propTypes': 'off' } },
    importPlugin.flatConfigs.recommended,
    {
        rules: {
            // Disallow "as" casts
            '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { fixStyle: 'separate-type-imports', prefer: 'type-imports' },
            ],
            // It's convenient to use a one-line arrow function for expressions that return void
            '@typescript-eslint/no-confusing-void-expression': 'off',
            // It's convenient to pass an async function to a callback expecting a void return
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
            '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
            // ?? is not always necessary
            '@typescript-eslint/prefer-nullish-coalescing': 'off',
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
            // Annoying when using callback props
            '@typescript-eslint/unbound-method': 'off',
            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
            // TypeScript already checks this
            'import/no-unresolved': 'off',
            'no-console': ['error', { allow: ['error'] }],
            'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
            'no-return-await': 'error',
            'no-useless-rename': 'error',
            'object-shorthand': ['error', 'always'],
            'perfectionist/sort-imports': ['error', { newlinesBetween: 'never' }],
            'react-hooks/exhaustive-deps': ['error', { additionalHooks: '(useSelector)' }],
            'react-hooks/rules-of-hooks': 'error',
            'require-await': 'error',
        },
    },
    {
        extends: [tseslint.configs.disableTypeChecked],
        files: ['**/*.js', '**/*.cjs', '**/*.mjs', 'electron.vite.config.mts'],
    },
    // Allow module usage in CJS files
    {
        files: ['**/*.cjs'],
        languageOptions: { sourceType: 'commonjs' },
        rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
);
