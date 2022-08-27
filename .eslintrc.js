'use strict';

module.exports = {
	env: {
		es6: true,
		node: true,
	},
	extends: 'eslint:recommended',
	parserOptions: {
		// See https://node.green/#ES2020
		ecmaVersion: 2020,
	},
	/* eslint-disable array-bracket-newline */
	rules: {
		'array-bracket-newline': [
			'error',
			{ multiline: true },
		],
		'array-bracket-spacing': [
			'error',
			'always',
			{ objectsInArrays: false },
		],
		'array-callback-return': [
			'error',
			{ allowImplicit: true, checkForEach: true },
		],
		'arrow-body-style': [
			'error',
			'always',
		],
		'arrow-parens': [
			'error',
			'always',
		],
		'arrow-spacing': [
			'error',
		],
		'block-spacing': [
			'error',
		],
		'brace-style': [
			'error',
		],
		'capitalized-comments': [
			'warn',
			'always',
			{ ignoreConsecutiveComments: true },
		],
		'comma-dangle': [
			'error',
			{
				arrays: 'always-multiline',
				objects: 'always-multiline',
				functions: 'never',
				imports: 'never',
				exports: 'never',
			},
		],
		'comma-spacing': [
			'error',
		],
		'comma-style': [
			'error',
		],
		'consistent-return': [
			'error',
		],
		curly: [
			'error',
		],
		'default-case-last': [
			'error',
		],
		'eol-last': [
			'error',
		],
		eqeqeq: [
			'error',
		],
		'func-call-spacing': [
			'error',
		],
		'func-names': [
			'error',
		],
		'func-style': [
			'error',
			'declaration',
		],
		'grouped-accessor-pairs': [
			'error',
			'getBeforeSet',
		],
		'guard-for-in': [
			'error',
		],
		'implicit-arrow-linebreak': [
			'error',
		],
		indent: [
			'error',
			'tab',
			{ SwitchCase: 1 },
		],
		'key-spacing': [
			'error',
			{ beforeColon: false, afterColon: true },
		],
		'keyword-spacing': [
			'error',
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		'lines-between-class-members': [
			'error',
			'always',
			{ exceptAfterSingleLine: true },
		],
		'max-statements-per-line': [
			'error',
			{ max: 1 },
		],
		'new-cap': [
			'error',
		],
		'new-parens': [
			'error',
		],
		'newline-per-chained-call': [
			'error',
		],
		'no-await-in-loop': [
			'error',
		],
		'no-bitwise': [
			'warn',
		],
		'no-caller': [
			'error',
		],
		'no-console': [
			'warn',
		],
		'no-constant-binary-expression': [
			'error',
		],
		'no-duplicate-imports': [
			'error',
		],
		'no-else-return': [
			'error',
		],
		'no-eq-null': [
			'error',
		],
		'no-eval': [
			'error',
		],
		'no-extend-native': [
			'error',
		],
		'no-floating-decimal': [
			'error',
		],
		'no-implicit-coercion': [
			'error',
		],
		'no-implied-eval': [
			'error',
		],
		'no-invalid-this': [
			'error',
		],
		'no-lonely-if': [
			'error',
		],
		'no-loop-func': [
			'error',
		],
		'no-mixed-operators': [
			'warn',
		],
		'no-multi-assign': [
			'error',
		],
		'no-multi-spaces': [
			'error',
		],
		'no-nested-ternary': [
			'error',
		],
		'no-new-wrappers': [
			'error',
		],
		'no-plusplus': [
			'error',
		],
		'no-promise-executor-return': [
			'error',
		],
		'no-return-assign': [
			'error',
		],
		'no-return-await': [
			'error',
		],
		'no-sequences': [
			'error',
		],
		'no-shadow': [
			'error',
			{ builtinGlobals: true, hoist: 'all' },
		],
		'no-template-curly-in-string': [
			'error',
		],
		'no-throw-literal': [
			'error',
		],
		'no-trailing-spaces': [
			'error',
		],
		'no-undefined': [
			'error',
		],
		'no-underscore-dangle': [
			'error',
		],
		'no-unmodified-loop-condition': [
			'error',
		],
		'no-unreachable-loop': [
			'error',
		],
		'no-unused-expressions': [
			'error',
		],
		'no-useless-computed-key': [
			'error',
		],
		'no-useless-concat': [
			'error',
		],
		'no-useless-constructor': [
			'error',
		],
		'no-useless-return': [
			'error',
		],
		'no-use-before-define': [
			'error',
			{ functions: false, classes: false },
		],
		'no-var': [
			'error',
		],
		'no-warning-comments': [
			'warn',
			{ location: 'anywhere' },
		],
		'no-whitespace-before-property': [
			'error',
		],
		'object-curly-newline': [
			'error',
			{ multiline: true },
		],
		'object-curly-spacing': [
			'error',
			'always',
		],
		'object-shorthand': [
			'error',
			'always',
		],
		'operator-assignment': [
			'error',
			'never',
		],
		'operator-linebreak': [
			'error',
			'before',
		],
		// Prevents programmer errors mistakenly refering to the wrong `this`.
		'prefer-arrow-callback': [
			'error',
			{
				allowNamedFunctions: true,
				allowUnboundThis: false,
			},
		],
		'prefer-const': [
			'error',
		],
		'prefer-numeric-literals': [
			'error',
		],
		'prefer-promise-reject-errors': [
			'error',
		],
		'prefer-rest-params': [
			'error',
		],
		quotes: [
			'error',
			'single',
			{ avoidEscape: true, allowTemplateLiterals: true },
		],
		'quote-props': [
			'error',
			'as-needed',
		],
		radix: [
			'error',
		],
		'require-atomic-updates': [
			'error',
		],
		'require-await': [
			'error',
		],
		'rest-spread-spacing': [
			'error',
			'never',
		],
		semi: [
			'error',
			'always',
		],
		'semi-spacing': [
			'error',
		],
		'spaced-comment': [
			'error',
		],
		'space-before-blocks': [
			'error',
		],
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'never',
			},
		],
		'space-in-parens': [
			'error',
		],
		'space-infix-ops': [
			'error',
		],
		'space-unary-ops': [
			'error',
			{ words: true, nonwords: false },
		],
		strict: [
			'error',
		],
		'switch-colon-spacing': [
			'error',
		],
		'template-curly-spacing': [
			'error',
			'always',
		],
		'template-tag-spacing': [
			'error',
			'always',
		],
		'wrap-iife': [
			'error',
			'outside',
		],
	},
	/* eslint-enable array-bracket-newline */
};
