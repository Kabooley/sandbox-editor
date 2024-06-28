/***
 * Generate comparer function which sorts objects descending according to specified property's key for Array.prototype.sort().
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sorting_array_of_objects
 *
 * NOTE: Reactコンポーネントで呼び出す場合、useCallback()等でラップしないと余計な生成を何度もすることになるので注意
 * */
export const ascendingOrderComparerFactory = <T = Record<string, string>>(
    key: keyof T
) => {
    const comparer = (a: T, b: T): number => {
        const nameA = (a[key] as string).toUpperCase(); // ignore upper and lowercase
        const nameB = (b[key] as string).toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        // names must be equal
        return 0;
    };
    return comparer;
};

// TEST

// comparerFactoryは他のインタフェイスのデータを受け入れることができるのか確かめる
//
// interface iDep {
//     moduleName: string;
//     version: string;
//     dev?: boolean;
// }

// const dep: iDep = {
//     moduleName: 'react',
//     version: '17.0.2',
//     dev: false,
// };

// const cmp = comparerFactory<iDep>('moduleName');

// const _arr: iDep[] = [
//   { moduleName: '@types/react', version: '18.3.3.' },
//   { moduleName: 'react', version: '18.2.0.' },
//   { moduleName: '@types/', version: '18.3.3.' },
//   { moduleName: 'loader-utils', version: '3.2.1' },
//   { moduleName: 'react', version: '18.2.0' },
//   { moduleName: 'react-dom', version: '18.2.0' },
//   { moduleName: 'react-scripts', version: '5.0.1' },
//   { moduleName: '@types/react', version: '18.0.25' },
//   { moduleName: '@types/react-dom', version: '18.0.9' },
//   { moduleName: 'typescript', version: '4.4.2' },
// ];

// const _shouldBe: iDep[] = [
//   { moduleName: '@types/', version: '18.3.3.' },
//   { moduleName: '@types/react', version: '18.3.3.' },
//   { moduleName: '@types/react', version: '18.0.25' },
//   { moduleName: '@types/react-dom', version: '18.0.9' },
//   { moduleName: 'loader-utils', version: '3.2.1' },
//   { moduleName: 'react', version: '18.2.0.' },
//   { moduleName: 'react', version: '18.2.0' },
//   { moduleName: 'react-dom', version: '18.2.0' },
//   { moduleName: 'react-scripts', version: '5.0.1' },
//   { moduleName: 'typescript', version: '4.4.2' },
// ];

// describe('TEST sortArrayByStringProperty', () => {
//   test('_str shuold be _shouldBe ', () => {
//     expect(sortArrayByStringProperty(_arr, 'moduleName')).toEqual(_shouldBe);
//   });
// });

// describe('TEST sortArrayByStringProperty', () => {
//     const comparer = comparerFactory<iDep>('moduleName');
//     test('_str shuold be _shouldBe ', () => {
//       // expect(sortArrayByStringProperty(_arr)).toEqual(_shouldBe);
//       expect(_arr.sort(comparer)).toEqual(_shouldBe);
//     });
//   });
