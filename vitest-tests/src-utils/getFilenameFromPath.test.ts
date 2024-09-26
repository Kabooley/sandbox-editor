import { describe, it, expect } from 'vitest';
import { getLasComponentFromPath } from '../../src/utils/getLasComponentFromPath';

const cases = [
  {
    describe: 'Should get filename from absolute path',
    path: 'File:///src/components/Counter.tsx',
    shouldBe: 'Counter.tsx',
  },
  {
    describe: 'Should get filename from related path',
    path: './components/Counter.tsx',
    shouldBe: 'Counter.tsx',
  },
  {
    describe: 'Should return empty string if path is end with slash',
    path: './components/Counter/',
    shouldBe: '',
  },
  {
    describe:
      'Should allow characters which is allowed to use as directory name',
    path: `!"#$%/&'()=-^/~/|?/;*+:`,
    shouldBe: ';*+:',
  },
  {
    describe:
      'Should get filename from path using back-slash (slashed\\by\\backslash)',
    path: 'slashed\\by\\backslash',
    shouldBe: 'backslash',
  },
];

/****
 * 関数名称変更した方がいいかも
 * filenameを取得するものというか、pathの最後を取り出すものという方が正しい気がする
 *
 *
 * */
describe('Test getLasComponentFromPath()', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      expect(getLasComponentFromPath(c.path)).toEqual(c.shouldBe);
    });
  });
});
