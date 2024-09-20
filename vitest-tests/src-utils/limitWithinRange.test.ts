import { describe, it, expect } from 'vitest';
import { limitWithinRange } from '../../src/utils/limitWithinRange';

const cases = [
  {
    describe: '100 should be 10 if 1 < range < 10.',
    min: 1,
    max: 10,
    val: 100,
    shouldBe: 10,
  },
  {
    describe: '5 should be 5 if 1 < range < 10.',
    min: 1,
    max: 10,
    val: 5,
    shouldBe: 5,
  },
  {
    describe: '-1 should be 1 if 1 < range < 10.',
    min: 1,
    max: 10,
    val: -1,
    shouldBe: 1,
  },
  {
    describe: '5 should be 100 if 100 < range < 500.',
    min: 100,
    max: 500,
    val: 5,
    shouldBe: 100,
  },
  {
    describe: '100 should be 100 if 100 < range < 500.',
    min: 100,
    max: 500,
    val: 100,
    shouldBe: 100,
  },
  {
    describe: '600 should be 500 if 100 < range < 500.',
    min: 100,
    max: 500,
    val: 600,
    shouldBe: 500,
  },
];

describe('Test limitWithinRange()', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      expect(limitWithinRange(c.val, c.min, c.max)).toBe(c.shouldBe);
    });
  });
});
