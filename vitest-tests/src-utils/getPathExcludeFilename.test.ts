import { describe, it, beforeEach } from 'vitest';
import { getPathExcludeFilename } from '../../src/utils/getPathExcludeFilename';

const cases = [
  {
    describe:
      '`File:///src/components/Counter.tsx` should return `File:///src/components/`',
    path: 'File:///src/components/Counter.tsx',
    shouldBe: 'File:///src/components/',
  },
  {
    describe:
      '`File:///path/to/file/Counter.tsx` should return `File:///path/to/file/`',
    path: 'File:///path/to/file/Counter.tsx',
    shouldBe: 'File:///path/to/file/',
  },
  {
    describe: '`path/to/file/Counter.tsx` should return `path/to/file/`',
    path: 'path/to/file/Counter.tsx',
    shouldBe: 'path/to/file/',
  },
  {
    describe: 'should null if passed filename only',
    path: 'Counter.tsx',
    shouldBe: null,
  },
];

// `/`を含むかどうかも確認
// filenameだけ渡されたらnullを返すことの確認
describe('test getPathExcludeFilename', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      expect(getPathExcludeFilename(c.path)).toEqual(c.shouldBe);
    });
  });
});
