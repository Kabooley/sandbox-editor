import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mustache } from '../../src/utils/mustache';

interface iPropsOfMustacheCase {
  describe: string;
  target: string;
  replacements: { [key: string]: string };
  shouldBe: string;
}

const cases: iPropsOfMustacheCase[] = [
  {
    describe: `'{{FILENAME}}' and '{{FOLDERNAME}}' in passed string should be replaced as 'Counter.ts' and 'Counter/'`,
    target: "The file '{{FILENAME}}' will be removed from '{{FOLDERNAME}}'",
    replacements: { FILENAME: 'Counter.ts', FOLDERNAME: 'Counter/' },
    shouldBe: "The file 'Counter.ts' will be removed from 'Counter/'",
  },
  {
    describe: `Empty mustach '{{}}' should be returned without any replacement.`,
    target: "The file '{{}}' will be removed from '{{}}'",
    replacements: { DUMMY: 'DUMMY' },
    shouldBe: "The file '{{}}' will be removed from '{{}}'",
  },
];

describe('Test mustache()', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      expect(mustache(c.target, c.replacements)).toEqual(c.shouldBe);
    });
  });
});
