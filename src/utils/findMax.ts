// https://stackoverflow.com/a/1379560
export const findMax = (arr: number[]) => {
    return Math.max.apply(Math, arr);
};
