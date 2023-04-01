module.exports = {
	testEnvironment: 'node',
	coverageDirectory: 'coverage',
	coverageReporters: ['text'],
	reporters: ['default'],
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	moduleNameMapper: {
		'^@common': '<rootDir>/src/common',
		'^@services': '<rootDir>/src/services',
		'^@routes': '<rootDir>/src/routes',
	},
}
