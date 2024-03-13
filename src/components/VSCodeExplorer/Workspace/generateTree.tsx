import type { iExplorer } from '../../../data/types';
import { File } from '../../../data/files';

/**
 * Generate Explorer data based on File data.
 *
 * @param {Array<File>} entries - Explorer data will be generated based on this data.
 * @param {string} root - Name of Top entry of Explorer tree data.
 *
 * Process are concist of three part.
 * 1: Generate folders which has files inside of it.
 * 2: Generate files
 * 3: Generate empty folders.
 *
 * Generating folders should be done before generating files because files are belongs some folder.
 *
 * */
export const generateTreeNodeData = (
    entries: File[] = [],
    root: string = 'root'
): iExplorer => {
    entries.sort(function (a: File, b: File) {
        let aPath = a.getPath().toLowerCase(); // ignore upper and lowercase
        let bPath = b.getPath().toLowerCase(); // ignore upper and lowercase
        if (aPath < bPath) return -1;
        if (aPath > bPath) return 1;
        return 0;
    });

    let currentKey = 1;
    const rootNode = {
        id: `${currentKey}`,
        name: root,
        isFolder: true,
        items: [],
        path: '',
        isOpening: false,
        // NOTE: Experimental
        isSelected: false
    };

    /**
     * Generate folders which has some files.
     * 
     * TODO: itemsが空でないフォルダはこの段階で生成されるのでこの段階でselectedやopeningは付与したい
     * */
    entries.forEach((entry: File) => {
        if (entry.isFolder()) return;

        console.log(`[generateTree][phase 1] ${entry.getPath()}`);

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        for (let i = 0; i < pathLen; i++) {
            let name = pathArr[i];
            let index = i;
            
            console.log(`[generateTree][phase 1] ${entry.getPath()}`);

            // If the child node doesn't exist, create it
            let child = current.items.find((item) => item.name === name);

            // if(child === undefined && index < ( pathLen - 1) && entry.isFolder()){
            if (child === undefined && index < pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: true,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                    isOpening: false,
                    isSelected: false
                };
                current.items.push(child);
            }
            current = child!;
        }
    });

    /**
     * Generate files.
     *
     * Assuming that Generating folders have been completed before this process.
     * */
    entries.forEach((entry: File) => {
        if (entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        // Generate files which is belongs top of explorer tree data.
        if (pathLen === 1) {
            let name = pathArr[0];
            currentKey = currentKey += 1;
            let node = {
                id: `${currentKey}`,
                name: name,
                isFolder: false,
                items: [],
                path: pathArr[0],
                isOpening: entry.isOpening(),
                isSelected: entry.isSelected()
            };
            current.items.push(node);
            return;
        }

        // Generate files which is under some folders
        pathArr.forEach((name, index) => {
            let child = current.items.find((item) => item.name === name);

            if (child === undefined && index === pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: false,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                    isOpening: entry.isOpening(),
                    isSelected: entry.isSelected()
                };
                current.items.push(child);
            } else if (child === undefined) {
                return;
            } else {
                current = child;
            }
        });
    });

    /**
     * Generate empty folders.
     *
     * Assuming that generating folders and files have been completed already.
     * */
    entries.forEach((entry: File) => {
        if (!entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        pathArr.forEach((name, index) => {
            let child: iExplorer | undefined = current.items.find(
                (item) => item.name === name
            );

            if (child === undefined && index === pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: !index ? pathArr[0] : pathArr[index],
                    isFolder: true, // As this is folder.
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                    isSelected: false
                };
                current.items.push(child);
            } else if (child === undefined) {
                return;
            } else {
                current = child;
            }
        });
    });

    /***
     * TODO: set opening and selected properties for folder
     * - set selected as true if folder's explorerData has selected file in its items.
     * - 
     * */ 

    return rootNode;
};