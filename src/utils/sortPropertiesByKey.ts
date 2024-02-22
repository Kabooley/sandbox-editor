/**
 * Sort object properties by key.
 *
 * https://stackoverflow.com/a/31102605
 * */
export const sortPropertiesByKey = (unordered: { [key: string]: string }) => {
    const initial: { [key: string]: string } = {};
    return Object.keys(unordered)
        .sort()
        .reduce((obj, key) => {
            obj[key] = unordered[key];
            return obj;
        }, initial);
};

// const unorderedObject = {
//   '@types/semver': '7.5.6',
//   'idb-keyval': '6.2.1',
//   '@types/react-dom': '18.2.18',
//   semver: '7.5.4',
//   react: '18.2.0',
//   'react-dom': '18.2.0',
//   '@types/react': '18.2.52',
// };

// const orderedObject = {
//   '@types/react': '18.2.52',
//   '@types/react-dom': '18.2.18',
//   '@types/semver': '7.5.6',
//   'idb-keyval': '6.2.1',
//   react: '18.2.0',
//   'react-dom': '18.2.0',
//   semver: '7.5.4',
// };

// import { describe, expect, test, it } from '@jest/globals';

// describe('Sort properties in object by object key', () => {
//   test('unorderedObject should be sorted as orderedObject', () => {
//     const result = sortObjectPropertiesByKey(unorderedObject);
//     console.log(result);
//     expect(result).toEqual(orderedObject);
//   });
// });
