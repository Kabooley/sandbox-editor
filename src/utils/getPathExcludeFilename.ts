/***
 * Method that returns the path without the filename and extension from a given path string.
 * 
 * @param {string} path - path including filename.
 * @retunrs {string|null} - Path without filename
 * 
 * NOTE: Returned string includes `/` at its tail.
 * */ 
export const getPathExcludeFilename = (path: string): string | null => {
    const matched = /^.*[\\\/]/.exec(path);
    return matched ? matched[0] : null;
};

// TEST:
//   const cases = [
//     {
//       path: 'File:///src/components/Counter.tsx',
//       shouldBe: 'File:///src/components/',
//     },
//     {
//       path: 'File:///src/components/Counter.test.tsx',
//       shouldBe: 'File:///src/components/',
//     },
//     { path: 'File:///src/utils/$asshole.ts', shouldBe: 'File:///src/utils/' },
//     { path: 'src/utils/$asshole.ts', shouldBe: 'src/utils/' },
//     { path: 'Barbie.tsx', shouldBe: null },
//     { path: 'Barbie', shouldBe: null },
//   ];

//   describe('Test getPathExcludeFileName', () => {
//     test('Should output cases.shouldBe value on passed cases.path', () => {
//       cases.forEach((c) => {
//         expect(getPathExcludeFileName(c.path)).toEqual(c.shouldBe);
//       });
//     });
//   });
