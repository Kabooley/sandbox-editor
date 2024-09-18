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
