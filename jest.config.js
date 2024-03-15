/** @type {import('ts-jest').JestConfigWithTsJest} */
// export default {
module.exports = {
    roots: ['<rootDir>/src'],
    testEnvironment: 'jest-environment-jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                // ts-jest configuration goes here
                useESM: true,
            },
        ],
        '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    },
    // testファイルを検出するために用いられるパターンで、
    // .(spec|test).(js|ts|jsx|tsx)の様なパターンが該当する
    // `testRegex`と`testMatch`の両方の使用はできない。
    // testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
    ],
    // 以下のプロパティは非推奨になったらしく、`setupFilesAfterEnv`にしろと言われる
    // setupTestFrameworkScriptFile: ['<rootDir>/src/__tests__/setup-jest.js'],
    //
    // 推奨：よく用いる拡張子は配列の初めの方に記述すること
    moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup-jest.js'],
    //
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    transformIgnorePatterns: ['/node_modules/.*'],
};
