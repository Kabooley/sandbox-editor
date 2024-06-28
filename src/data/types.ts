export interface iFile {
    path: string;
    language: string;
    value: string;
    isFolder: boolean;
    //
    selected: boolean;
    opening: boolean;
    tabIndex: number | null;
}

export interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
    path: string;
    // Indicates that the file is now selected on editor.
    isSelected: boolean;
    // `isOpening` doesn't means folder is expanded (showing its items) in explorer.
    // This means the file related to this data is now on editor.
    // So isOpening is always false if this data is folder.
    // True is only for file which is on editor.
    isOpening?: boolean;
}

export type Language =
    | 'javascript'
    | 'typescript'
    | 'react'
    | 'react-typescript'
    | 'json'
    | 'css'
    | 'html'
    | 'markdown';

export type FileTypes =
    | Language
    | 'image'
    | 'svg'
    | 'folder'
    | 'markdown'
    | 'json'
    | 'blank-file';
