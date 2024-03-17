/** @type {import('ts-jest').JestConfigWithTsJest} */
// export default {
module.exports = {
    roots: ['<rootDir>/src'],
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: './tsconfig.jest.json',
            },
        ],
        // TODO: 以下の定義ではだめなのか？
        // '^.+\\.(js|jsx)$': 'babel-jest',
        '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    },
    // glob patterns to detect test files:
    // jestはglobという正規表現を用いてテストファイルを検出する。
    // micromatchというglobの一種を採用している。
    // 今回`setup-jest.js`は/__tests__/以下に保存しているため
    // テストファイルパターンから除外している
    //
    // 他にテストファイルを検出するためのコンフィグがあって
    // `testRegex`というが、こちらはglobパターンではない模様。
    // また、`testRegex`と`testMatch`は併用不可能でどちらか一つを選ぶ必要がある
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
        '!**/__tests__/setup-jest.js',
    ],
    // jestのsetupファイルの指定：
    // 以下のプロパティは非推奨になったらしく、`setupFilesAfterEnv`にしろと言われる
    // setupTestFrameworkScriptFile: ['<rootDir>/src/__tests__/setup-jest.js'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup-jest.js'],
    // モジュールが使用するファイルの拡張子群
    // 推奨：よく用いる拡張子は配列の初めの方に記述すること
    moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'node'],
    //
    // moduleDirectories: ['node_modules'],
    //
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    // `transform`処理の対象外をここに含める
    // ここに含まれたリソースは`transform`設定が適用されない
    transformIgnorePatterns: ['/node_modules/.*'],
    // (テストから)もみ消していい対象をここに含める
    // 例えばcssファイルやassets群はテストに関係ないのでここに含めたりする
    // moduleNameMapper: []
};
