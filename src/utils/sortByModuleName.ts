interface iDependencyState {
    moduleName: string;
    version: string;
    state: 'loading' | 'loaded' | 'failed';
}

/***
 * `moduleName`昇順でdependenciesをソートする。
 *
 * https://stackoverflow.com/a/34779158
 * */
export const sortByModuleName = (dependencies: iDependencyState[]) => {
    return dependencies.sort(function (a, b) {
        if (
            a.moduleName.localeCompare(b.moduleName, undefined, {
                numeric: true,
            }) > 0
        ) {
            return 1;
        }
        if (
            a.moduleName.localeCompare(b.moduleName, undefined, {
                numeric: true,
            }) < 0
        ) {
            return -1;
        }
        // if (
        //     !a.moduleName.localeCompare(b.moduleName, undefined, {
        //         numeric: true,
        //     })
        // ) {
        //     return 0;
        // }
        return 0;
    });
};

// import { describe, expect, test, it } from '@jest/globals';

// /***
//  * Objectのpropertiesをkeyをもとに並べ替える
//  *
//  * 参考：
//  * https://stackoverflow.com/a/31102605
//  * */

// const unorderedDependencies: iDependencyState[] = [
//   { moduleName: 'idb-keyval', version: '6.2.1', state: 'loaded' },
//   { moduleName: '@types/semver', version: '7.5.6', state: 'loaded' },
//   { moduleName: '@types/react-dom', version: '19.0.0', state: 'loaded' },
//   { moduleName: 'react-dom', version: '18.2.0', state: 'loaded' },
// ];

// const orderedDependencies: iDependencyState[] = [
//   { moduleName: '@types/react-dom', version: '19.0.0', state: 'loaded' },
//   { moduleName: '@types/semver', version: '7.5.6', state: 'loaded' },
//   { moduleName: 'idb-keyval', version: '6.2.1', state: 'loaded' },
//   { moduleName: 'react-dom', version: '18.2.0', state: 'loaded' },
// ];

// describe('Test sort', () => {
//   test('dependencies array should be sorted by key', () => {
//     const result = sortByModuleName(unorderedDependencies);

//     console.log(result);

//     expect(result).toEqual(orderedDependencies);
//   });
// });
