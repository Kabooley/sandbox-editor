import { createDefaultEsmPreset } from 'ts-jest';

const defaultPreset = createDefaultEsmPreset({
  tsconfig: 'tsconfig-esm.spec.json',
});

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...defaultPreset,
  globals: {
    window: true,
  },
  displayName: 'test-react-typescript-esm',
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
    '!**/__tests__/setup-jest.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    ...defaultPreset.transform,
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransformer.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)':
      '<rootDir>/config/jest/fileTransformer.js',
  },
  // デフォルト値と順番を変えてts tsxをはじめのほうに並べ替えた
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'mjs',
    'cjs',
    'jsx',
    'json',
    'node',
  ],
  moduleNameMapper: {
    'monaco-editor':
      '<rootDir>/node_modules/monaco-editor/esm/vs/editor/editor.api.js',
  },
  transformIgnorePatterns: ['/node_modules/(?!(monaco-editor)/)'],
};
