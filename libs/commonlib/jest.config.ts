/* eslint-disable */
export default {
	displayName: 'commonlib',
	preset: '../../jest.preset.js',
	transform: {
		'^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'js'],
	coverageDirectory: '../../coverage/commonlib',
};
