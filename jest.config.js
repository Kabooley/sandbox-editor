/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                // ts-jest configuration goes here
            },
        ],
    },
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup-jest.js'],
};
