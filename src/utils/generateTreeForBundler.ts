import type { File } from '../data/files';

/***
 * This utility is for bundler
 *
 * */
export const generateTreeForBundler = (files: File[]) => {
    const tree: { [key: string]: string } = {};
    files.forEach((f) => {
        tree[f.getPath()] = f.getValue();
    });
    return tree;
};
