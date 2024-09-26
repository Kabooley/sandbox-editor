import { describe, it, expect } from 'vitest';
import { removeFirstSlash } from '../../src/utils/removeFirstSlash';

const cases = [
  {
    description: '/model/16 should be model/16',
    path: '/model/16',
    shouldBe: 'model/16',
  },
  {
    description: '/src/index.tsx should be src/index.tsx',
    path: '/src/index.tsx',
    shouldBe: 'src/index.tsx',
  },
  {
    description: 'string start without slash should be no changes',
    path: 'public/js/jctajr.min.js',
    shouldBe: 'public/js/jctajr.min.js',
  },
];

describe('Test removeFirstSlash()', () => {
  cases.forEach((c) => {
    it(c.description, () => {
      expect(removeFirstSlash(c.path)).toEqual(c.shouldBe);
    });
  });
});
