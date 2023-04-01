module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es2021: true,
	},
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.min.js'],
	overrides: [
		{
			files: ['*.tsx'],
			env: {
				browser: true,
				es2021: true,
				'react-native/react-native': true,
			},
			extends: [
				'eslint:recommended',
				'plugin:react/recommended',
				'plugin:react-hooks/recommended',
				'plugin:@typescript-eslint/recommended',
				'prettier',
			],
			plugins: ['react', 'react-hooks', 'react-native', '@typescript-eslint'],
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			settings: {
				react: {
					version: 'detect',
				},
			},
		},
		{
			files: ['*.js', '*.ts', '*.tsx'],
			rules: {
				/* FIX ME */
				'react/prop-types': 'warn',
				'react/no-unescaped-entities': 'warn',
				'react-hooks/rules-of-hooks': 'error',
				'react-hooks/exhaustive-deps': 'off',
				//
				'@typescript-eslint/no-loss-of-precision': 'warn',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'@typescript-eslint/no-inferrable-types': 'off',
				'@typescript-eslint/ban-types': [
					'error',
					{
						types: {
							String: true,
							Boolean: true,
							Number: true,
							Symbol: true,
							'{}': true,
							Object: true,
							object: true,
							Function: false,
						},
						extendDefaults: true,
					},
				],
				'@typescript-eslint/no-empty-function': 'warn',
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/ban-ts-comment': 'off',
				//
				'no-var': 'warn',
				'no-useless-escape': 'off',
				'prefer-const': 'warn',
				'no-control-regex': 'warn',
				'no-empty': 'warn',
				'no-case-declarations': 'warn',
				'no-duplicate-case': 'warn',
				'no-async-promise-executor': 'warn',
			},
		},
	],
}
