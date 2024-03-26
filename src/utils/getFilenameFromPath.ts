export const getFilenameFromPath = (path: string): string => {
    return path.replace(/^.*[\\\/]/,'');
};

// TEST:
// 
// const cases = [
//     { path: 'File:///src/components/Counter.tsx', shouldBe: 'Counter.tsx' },
//     {
//       path: 'File:///src/components/Counter.test.tsx',
//       shouldBe: 'Counter.test.tsx',
//     },
//     { path: 'File:///src/utils/$asshole.ts', shouldBe: '$asshole.ts' },
//     { path: 'Barbie.tsx', shouldBe: 'Barbie.tsx' },
//     { path: 'Barbie', shouldBe: 'Barbie' },
//   ];
  
//   describe('TEst getFileNameFromPath', () => {
//     test('getFileNameFromPath should output cases.shouldBe value on passed cases.path', () => {
//       cases.forEach((c) => {
//         expect(getFilenameFromPath(c.path)).toEqual(c.shouldBe);
//       });
//     });
//   });