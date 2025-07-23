import { globalIgnores } from 'eslint/config';
import jasmine from 'eslint-plugin-jasmine';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import angular from 'angular-eslint';

const compat = new FlatCompat({
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default typescriptEslint.config([
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      typescriptEslint.configs.eslintRecommended,
      typescriptEslint.configs.recommendedTypeChecked,
      typescriptEslint.configs.strict,
      ...angular.configs.tsRecommended,
    ],
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
  },
  {
    extends: compat.extends('plugin:storybook/recommended'),
  },
  globalIgnores(['projects/**/*']),
  {
    plugins: {
      import: importPlugin,
      jasmine,
    },
  },
  {
    files: ['src/**/*.spec.ts'],

    languageOptions: {
      parserOptions: {
        project: './src/tsconfig.spec.json',
      },

      globals: {
        ...globals.jasmine,
      },
    },

    extends: compat.extends('plugin:jasmine/recommended'),

    rules: {
      'jasmine/new-line-before-expect': 'error',
      'jasmine/no-disabled-tests': 'error',
      'jasmine/new-line-between-declarations': 'error',
      'jasmine/no-spec-dupes': 'error',
      'jasmine/no-promise-without-done-fail': 'error',
      'jasmine/no-unsafe-spy': 'off',
      'jasmine/prefer-promise-strategies': 'off',
      'jasmine/prefer-toHaveBeenCalledWith': 'off',
    },
  },
  {
    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
        createDefaultProgram: true,
      },
    },

    extends: compat.extends('prettier', 'plugin:prettier/recommended'),

    rules: {
      '@typescript-eslint/dot-notation': 'off',

      '@typescript-eslint/explicit-member-accessibility': [
        'off',
        {
          accessibility: 'explicit',
        },
      ],

      'brace-style': ['error', '1tbs'],
      'id-blacklist': 'off',
      'id-match': 'off',
      'import/prefer-default-export': 'off',
      'import/no-import-module-exports': 'off',
      'no-underscore-dangle': 'off',
      'max-classes-per-file': 'off',

      'no-console': [
        'error',
        {
          allow: ['error'],
        },
      ],

      'import/no-default-export': 'error',

      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            ['internal', 'parent'],
            'sibling',
            'index',
          ],
        },
      ],

      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'pr',
          style: 'kebab-case',
          type: 'element',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'pr',
          style: 'camelCase',
          type: 'attribute',
        },
      ],

      '@angular-eslint/prefer-standalone': 'off',
      'import/no-cycle': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/use-lifecycle-interface': 'off',
      '@typescript-eslint/default-param-last': 'off',
      '@typescript-eslint/lines-between-class-members': 'off',
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-throw-literal': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/return-await': 'off',
      'array-callback-return': 'off',
      'brace-style': 'off',
      'class-methods-use-this': 'off',
      'consistent-return': 'off',
      'default-case': 'off',
      eqeqeq: 'off',
      'func-names': 'off',
      'global-require': 'off',
      'guard-for-in': 'off',
      'jsdoc/newline-after-description': 'off',
      'new-cap': 'off',
      'no-await-in-loop': 'off',
      'no-case-declarations': 'off',
      'no-constant-condition': 'off',
      'no-constructor-return': 'off',
      'no-continue': 'off',
      'no-control-regex': 'off',
      'no-else-return': 'off',
      'no-empty': 'off',
      'no-lonely-if': 'off',
      'no-multi-assign': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-promise-executor-return': 'off',
      'no-prototype-builtins': 'off',
      'no-restricted-globals': 'off',
      'no-restricted-properties': 'off',
      'no-restricted-syntax': 'off',
      'no-return-assign': 'off',
      'no-unneeded-ternary': 'off',
      'no-useless-catch': 'off',
      'no-useless-concat': 'off',
      'no-useless-escape': 'off',
      'no-useless-return': 'off',
      'no-var': 'off',
      'object-shorthand': 'off',
      'one-var': 'off',
      'operator-assignment': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
      'prefer-const': 'off',
      'prefer-destructuring': 'off',
      'prefer-exponentiation-operator': 'off',
      'prefer-object-spread': 'off',
      'prefer-promise-reject-errors': 'off',
      'prefer-regex-literals': 'off',
      'prefer-template': 'off',
      radix: 'off',
      'spaced-comment': 'off',
      'vars-on-top': 'off',
      yoda: 'off',
      'prettier/prettier': 'off',
    },
  },
  {
    rules: {
      // More rules to disable for now
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/valid-aria': 'off',
      '@angular-eslint/template/role-has-required-aria': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@angular-eslint/template/alt-text': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/no-negated-async': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-this-alias': 'off',
    },
  },
  {
    files: ['**/*.stories.ts', 'src/stories/*.ts'],

    rules: {
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@angular-eslint/component-selector': 'off',
      'storybook/prefer-pascal-case': 'error',
    },
  },
]);
