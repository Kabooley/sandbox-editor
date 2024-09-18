import { describe, it, expect } from 'vitest';
import { getDiffOfTwoShallowObjects } from '../../src/utils/getDiffOfTwoShallowObjects';

type iObj = { [key: string]: string };

const scenario = [
  {
    describe: 'No differences because data1 and data2 are equal',
    target: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-editor': '^0.45.0',
      react: '18.2.0',
      'react-dom': '18.2.0',
      semver: '^7.5.4',
      typescript: '^5.3.3',
    } as iObj,
    compareWith: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-editor': '^0.45.0',
      react: '18.2.0',
      'react-dom': '18.2.0',
      semver: '^7.5.4',
      typescript: '^5.3.3',
    } as iObj,
    result: {
      deleted: [],
      created: [],
      modifiedVal: [],
    },
  },
  {
    describe: 'Deleted semver and renamed react. Created `raaact`.',
    target: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-editor': '^0.45.0',
      raaaact: '18.2.0',
      'react-dom': '18.2.0',
      typescript: '^5.3.3',
    } as iObj,
    compareWith: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-editor': '^0.45.0',
      react: '18.2.0',
      'react-dom': '18.2.0',
      semver: '^7.5.4',
      typescript: '^5.3.3',
    } as iObj,
    result: {
      deleted: [{ react: '18.2.0' }, { semver: '^7.5.4' }],
      created: [{ raaaact: '18.2.0' }],
      modifiedVal: [],
    },
  },
  {
    describe: 'Create react-dom and monaco-eddddd. Deleted monaco-editor',
    target: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-eddddd': '^0.45.0',
      react: '18.2.0',
      'react-dom': '18.2.0',
      semver: '^7.5.4',
      typescript: '^5.3.3',
    } as iObj,
    compareWith: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-editor': '^0.45.0',
      react: '18.2.0',
      semver: '^7.5.4',
      typescript: '^5.3.3',
    } as iObj,
    result: {
      deleted: [{ 'monaco-editor': '^0.45.0' }],
      created: [{ 'monaco-eddddd': '^0.45.0' }, { 'react-dom': '18.2.0' }],
      modifiedVal: [],
    },
  },
  {
    describe: 'Modified typescript version and ',
    target: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-editor': '^0.45.0',
      react: '18.2.0',
      'react-dom': '18.2.0',
      semver: '^7.5.4',
      typescript: '^5.3.333333',
    } as iObj,
    compareWith: {
      '@types/react': '18.2.52',
      '@types/react-dom': '18.2.18',
      '@types/semver': '^7.5.6',
      'idb-keyval': '^6.2.1',
      'monaco-editor': '^0.45.0',
      react: '18.2.0',
      'react-dom': '18.2.0',
      semver: '^7.5.4',
      typescript: '^5.3.3',
    } as iObj,
    result: {
      deleted: [],
      created: [],
      modifiedVal: [{ typescript: { current: '^5.3.333333', prev: '^5.3.3' } }],
    },
  },
];

describe('Test getDiffOfTwoShallowObjects', () => {
  scenario.forEach((test) => {
    // この構文だと`test`を使うとエラーになる
    it(test.describe, () => {
      expect(getDiffOfTwoShallowObjects(test.target, test.compareWith)).toEqual(
        test.result
      );
    });
  });
});
