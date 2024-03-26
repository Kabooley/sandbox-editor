import type { iExplorer } from "../data/types";

/***
 * Get all descendants tree object's path.
 * 
 * @param {iExplorer} exp - Tree object that has nested object.
 * @return {Array<string>} - Retrieved all nested descendant's path.
 *
 * */
export const getAllDescendantsPath = (exp: iExplorer): string[] => {
  const descendantsPaths: string[] = [];

  const collectDescendantsPaths = (exp: iExplorer) => {
    if (exp.items.length) {
      exp.items.forEach((item) => {
        descendantsPaths.push(item.path);
        if (item.items.length) {
          collectDescendantsPaths(item);
        }
      });
    } else return;
  };

  if (exp.items.length) {
    collectDescendantsPaths(exp);
  }
  return descendantsPaths;
};

// const explorer = {
//   id: '1',
//   name: 'root',
//   isFolder: true,
//   items: [
//     {
//       id: '2',
//       name: 'public',
//       isFolder: true,
//       items: [
//         {
//           id: '6',
//           name: 'index.html',
//           isFolder: false,
//           items: [],
//           path: 'public/index.html',
//           isOpening: false,
//           isSelected: false,
//         },
//       ],
//       path: 'public',
//       isOpening: false,
//       isSelected: false,
//     },
//     {
//       id: '3',
//       name: 'soMuchLongDirectoryName',
//       isFolder: true,
//       items: [
//         {
//           id: '7',
//           name: 'superUltraHyperTooLongBaddaaasssssFile.txt',
//           isFolder: false,
//           items: [],
//           path: 'soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt',
//           isOpening: false,
//           isSelected: false,
//         },
//       ],
//       path: 'soMuchLongDirectoryName',
//       isOpening: false,
//       isSelected: false,
//     },
//     {
//       id: '4',
//       name: 'src',
//       isFolder: true,
//       items: [
//         {
//           id: '8',
//           name: 'App.tsx',
//           isFolder: false,
//           items: [],
//           path: 'src/App.tsx',
//           isOpening: true,
//           isSelected: true,
//         },
//         {
//           id: '9',
//           name: 'index.tsx',
//           isFolder: false,
//           items: [],
//           path: 'src/index.tsx',
//           isOpening: false,
//           isSelected: false,
//         },
//         {
//           id: '10',
//           name: 'styles.css',
//           isFolder: false,
//           items: [],
//           path: 'src/styles.css',
//           isOpening: false,
//           isSelected: false,
//         },
//       ],
//       path: 'src',
//       isOpening: false,
//       isSelected: false,
//     },
//     {
//       id: '5',
//       name: 'package.json',
//       isFolder: false,
//       items: [],
//       path: 'package.json',
//       isOpening: false,
//       isSelected: false,
//     },
//     {
//       id: '11',
//       name: 'tsconfig.json',
//       isFolder: false,
//       items: [],
//       path: 'tsconfig.json',
//       isOpening: false,
//       isSelected: false,
//     },
//   ],
//   path: '',
//   isOpening: false,
//   isSelected: false,
// };

// const cases = [
//   { exp: explorer.items[0], shouldBe: ['public/index.html'] },
//   {
//     exp: explorer.items[1],
//     shouldBe: [
//       'soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt',
//     ],
//   },
//   {
//     exp: explorer.items[2],
//     shouldBe: ['src/App.tsx', 'src/index.tsx', 'src/styles.css'],
//   },
//   {
//     exp: explorer,
//     shouldBe: [
//       'public',
//       'public/index.html',
//       'soMuchLongDirectoryName',
//       'soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt',
//       'src',
//       'src/App.tsx',
//       'src/index.tsx',
//       'src/styles.css',
//       'package.json',
//       'tsconfig.json',
//     ],
//   },
// ];

// describe('Test getAllDescendantsPath', () => {
//   cases.forEach((c) => {
//     test(`Getting from ${c.exp.name} should output ${c.shouldBe.join(
//       ', '
//     )}`, () => {
//       console.log(c.exp);
//       expect(getAllDescendantsPath(c.exp)).toEqual(c.shouldBe);
//     });
//   });
// });
