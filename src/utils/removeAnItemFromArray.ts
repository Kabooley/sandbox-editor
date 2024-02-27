/***
 * 参考：
 * https://stackoverflow.com/a/5767357/22007575
 * */
export const removeAnItemFromArray = <T>(arr: Array<T>, value: T) => {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
};
