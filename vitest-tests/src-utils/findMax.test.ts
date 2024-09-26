import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { findMax } from '../../src/utils/findMax';

/***
 * 修正内容： 引数の型をanyからnumberにした
 * */
describe('Test findMax', () => {
  test('Should return "11" from "1, 3, 5, 10, 11"', () => {
    expect(findMax([1, 3, 5, 10, 11])).toBe(11);
  });
});
