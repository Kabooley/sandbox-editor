import type { iFile } from '../data/types';

/***
 * This utility is for bundler
 *
 * */
export const generateTreeForBundler = (files: iFile[]) => {
    const tree: { [key: string]: string } = {};
    files.forEach((f) => {
        tree[f.path] = f.value;
    });
    return tree;
};
