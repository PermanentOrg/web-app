import { globalIgnores } from 'eslint/config';
import jasmine from 'eslint-plugin-jasmine';
import globals from 'globals';
import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import angular from 'angular-eslint';
import love from 'eslint-config-love';
import prettier from 'eslint-config-prettier';

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
			love,
			...angular.configs.tsRecommended,
			prettier,
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
		files: [
			'src/**/*.spec.ts',
			'src/**/test.ts',
			'src/**/*.stories.ts',
			'src/**/shared-test-classes.ts',
			'src/**/shared-mocks.ts',
		],
		rules: {
			// Right now we need to use empty functions for mocks in various
			// test contexts.  Ideally we would use jasmine spies more elegantly
			// but that is a separate refactor that will involve care.
			'@typescript-eslint/no-empty-function': 'off',
		},
	},
	{
		files: ['**/*.ts'],
		rules: {
			'import/prefer-default-export': 'off',
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
			'class-methods-use-this': 'off',
			'jsdoc/newline-after-description': 'off',
			'new-cap': 'off',
			'no-await-in-loop': 'off',
			'no-case-declarations': 'off',
			'no-constant-condition': 'off',
			'no-constructor-return': 'off',
			'no-else-return': 'off',
			'no-lonely-if': 'off',
			'no-multi-assign': 'off',
			'no-param-reassign': 'off',
			'no-promise-executor-return': 'off',
			'no-prototype-builtins': 'off',
			'no-restricted-globals': 'off',
			'no-restricted-properties': 'off',
			'no-restricted-syntax': 'off',
			'no-return-assign': 'off',
			'no-unneeded-ternary': 'off',
			'no-useless-concat': 'off',
			'no-useless-escape': 'off',
			'object-shorthand': 'off',
			'one-var': 'off',
			'operator-assignment': 'off',
			'prefer-arrow/prefer-arrow-functions': 'off',
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
			'@typescript-eslint/prefer-readonly': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/strict-boolean-expressions': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
			'promise/avoid-new': 'off',
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/prefer-destructuring': 'off',
			'@typescript-eslint/prefer-optional-chain': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/init-declarations': 'off',
			'max-lines': 'off',
			'@typescript-eslint/init-declarations': 'off',
			'@typescript-eslint/array-type': 'off',
			'@typescript-eslint/switch-exhaustiveness-check': 'off',
			complexity: 'off',
			'@typescript-eslint/max-params': 'off',
			'@typescript-eslint/consistent-generic-constructors': 'off',
			'@typescript-eslint/no-deprecated': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/method-signature-style': 'off',
			'@typescript-eslint/class-methods-use-this': 'off',
			'max-nested-callbacks': 'off',
			'@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
			'@typescript-eslint/no-unnecessary-template-expression': 'off',
			'@typescript-eslint/consistent-indexed-object-style': 'off',
			'@typescript-eslint/consistent-type-assertions': 'off',
			'@typescript-eslint/no-unnecessary-type-parameters': 'off',
			'n/handle-callback-err': 'off',
			'logical-assignment-operators': 'off',
			'@typescript-eslint/prefer-regexp-exec': 'off',
			'@typescript-eslint/no-misused-spread': 'off',
			'@typescript-eslint/no-unnecessary-type-conversion': 'off',
			'import/no-duplicates': 'off',
			'max-depth': 'off',
			'@typescript-eslint/no-unnecessary-type-arguments': 'off',
			'@typescript-eslint/consistent-type-exports': 'off',
			'promise/param-names': 'off',
			'consistent-this': 'off',
			'eslint-comments/require-description': 'off',
			'@angular-eslint/prefer-inject': 'off',
			'preserve-caught-error': 'off',
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
