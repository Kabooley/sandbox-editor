export interface iFile {
    path: string;
    language: string;
    value: string;
    isFolder: boolean;
}

export interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
    path: string;
    // NOTE: new added
    // `isOpening` doesn't means folder is expanded (showing its items) in explorer.
    // This means the file related to this data is now on editor.
    // So isOpening is always false if this data is folder.
    // True is only for file which is on editor.
    isOpening?: boolean;
}
