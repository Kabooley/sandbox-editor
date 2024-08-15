/***
 * Limit given variable within specified range.
 * */
export const limitWithinRange = (val: number, _min: number, _max: number) => {
  return Math.max(_min, Math.min(val, _max))
}

// TEST
// const cases = [
//   { id: 1, min: 1, max: 10, val: 100, shouldBe: 10 },
//   { id: 2, min: 1, max: 10, val: 5, shouldBe: 5 },
//   { id: 3, min: 1, max: 10, val: -1, shouldBe: 1 },
//   { id: 4, min: 100, max: 500, val: 5, shouldBe: 100 },
//   { id: 5, min: 100, max: 500, val: 100, shouldBe: 100 },
//   { id: 6, min: 100, max: 500, val: 600, shouldBe: 500 },
// ];

// describe('Test clmapToRange', () => {
//   cases.forEach((c) => {
//     test(`id: ${c.id} : value: ${c.val} should be ${c.shouldBe} in range ${c.min} ~ ${c.max}`, () => {
//       expect(clampToRange(c.val, c.min, c.max)).toEqual(c.shouldBe);
//     });
//   });
// });
