/***************************************************************
 * Make sure
 * - Vitest works
 * - Vitest can test ESM file
 *
 * ************************************************************/
import { describe, test, expect, it } from 'vitest';
import { moveInArray } from '../../src/utils/moveInArray';

const cases = [
  {
    id: 1,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 2,
    newIndex: 0,
    arrShouldBe: [3, 1, 2, 4, 5],
  },
  {
    id: 2,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 4,
    newIndex: 4,
    arrShouldBe: [1, 2, 3, 4, 5],
  },
  {
    id: 3,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 2,
    newIndex: 2,
    arrShouldBe: [1, 2, 3, 4, 5],
  },
  {
    id: 3,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 2,
    newIndex: 5,
    arrShouldBe: [1, 2, 4, 5, undefined, 3],
  },
];
const cases2 = [
  {
    id: 4,
    arr: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    oldIndex: 2,
    newIndex: 5,
    arrShouldBe: ['a', 'b', 'd', 'e', 'f', 'c', 'g'],
  },
  {
    id: 4,
    arr: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    oldIndex: 6,
    newIndex: 6,
    arrShouldBe: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  },
];

const cases3 = [
  {
    id: 1,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 2,
    newIndex: 0,
    arrShouldBe: [3, 1, 2, 4, 5],
  },
  {
    id: 2,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 4,
    newIndex: 4,
    arrShouldBe: [1, 2, 3, 4, 5],
  },
  {
    id: 3,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 2,
    newIndex: 2,
    arrShouldBe: [1, 2, 3, 4, 5],
  },
  {
    id: 3,
    arr: [1, 2, 3, 4, 5],
    oldIndex: 2,
    newIndex: 5,
    arrShouldBe: [1, 2, 3, 4, 5],
  },
];
const cases4 = [
  {
    id: 4,
    arr: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    oldIndex: 2,
    newIndex: 5,
    arrShouldBe: ['a', 'b', 'd', 'e', 'f', 'c', 'g'],
  },
  {
    id: 4,
    arr: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    oldIndex: 6,
    newIndex: 6,
    arrShouldBe: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  },
  {
    id: 4,
    arr: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    oldIndex: 6,
    newIndex: 7,
    arrShouldBe: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  },
];

describe('Test moveInArray', () => {
  cases3.forEach((c) => {
    test(`test id: ${c.id} arr ${c.arr} should be ${c.arrShouldBe}`, () => {
      expect(moveInArray<number>(c.arr, c.oldIndex, c.newIndex)).toEqual(
        c.arrShouldBe
      );
    });
  });

  cases4.forEach((c) => {
    test(`test id: ${c.id} arr ${c.arr} should be ${c.arrShouldBe}`, () => {
      expect(moveInArray<string>(c.arr, c.oldIndex, c.newIndex)).toEqual(
        c.arrShouldBe
      );
    });
  });
});
