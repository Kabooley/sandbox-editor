const filenameRegexp = /^([A-Za-z0-9\-\_\.]+)\.([a-zA-Z0-9]{1,9})$/;
const filenameWithoutExtension = /^([A-Za-z0-9\-\_]+)$/;

/***
 * Check if passed filename path is valid.
 *
 * https://google.github.io/styleguide/jsguide.html#file-name
 *
 * */
export const isFilenameValid = (path: string): boolean => {
    const result = filenameRegexp.test(path);
    if (result) return result;
    // in case passed path without period.
    if (path.split('.').length === 1) {
        return filenameWithoutExtension.test(path);
    }
    return false;
};

// // TEST
// const cases = [
//   { filename: 'sdfsadfa/dsafsdfs.fdsjkad/sadsa.js', shouldBe: false },
//   { filename: '222222.3333', shouldBe: true },
//   { filename: 'script2.js', shouldBe: true },
//   { filename: 'script2.js?', shouldBe: false },
//   { filename: 'script2.js.worker', shouldBe: true },
//   { filename: 'script2._.bundled', shouldBe: true },
//   { filename: 'script_3.js', shouldBe: true },
//   { filename: '-script.js', shouldBe: true },
//   { filename: '_script.js', shouldBe: true },
//   { filename: "sc'ript.js", shouldBe: false },
//   { filename: 'sc&ript.js', shouldBe: false },
//   { filename: 'sc^ript.js', shouldBe: false },
//   { filename: 'sc?ript.js', shouldBe: false },
//   { filename: 'sc!ript.js', shouldBe: false },
//   { filename: 'script', shouldBe: true },
//   { filename: '123', shouldBe: true },
//   { filename: 'script123', shouldBe: true },
//   { filename: 'script_', shouldBe: true },
//   { filename: 'script-', shouldBe: true },
// ];

// describe('Test isFilenameValid', () => {
//   cases.forEach((c) => {
//     test(`${c.filename} should be ${c.shouldBe}`, () => {
//       expect(isFilenameValid(c.filename)).toBe(c.shouldBe);
//     });
//   });
// });

// // sdfsadfa/dsafsdfs.fdsjkad/sadsa.js
// // 222222.3333
// // cript2.js
// // cript2.js?
// // script2.js.worker
// // cript2._.bundled
// // cript_3.js
// // script.js
// // script.js
// // c'ript.js
// // sc&ript.js
// // sc^ript.js
// // sc?ript.js
// // sc!ript.js
// // script
