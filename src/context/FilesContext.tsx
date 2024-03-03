/***
 * FilesContext
 *
 * Managing File state and provide its context.
 *
 * 型付けにおいて大いに参考になったサイト：
 * https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
 *
 * */
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { files, File } from '../data/files';
import { getFileLanguage, findMax } from '../utils';

// --- Types ---

enum Types {
    Delete = 'DELETE_FILE',
    DeleteMultiple = 'DELETE_MULTIPLE_FILES',
    Add = 'ADD_FILE',
    Change = 'CHANGE_FILE',
    ChangeMultiple = 'CHANGE_MULTIPLE_FILES',
    ChangeSelectedFile = 'CHANGE_SELECTED_FILE',
    // Actions from Explorer.
    Open = 'OPEN_FILE',
    Close = 'CLOSE_FILE',
}

type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
        ? {
              type: Key;
          }
        : {
              type: Key;
              payload: M[Key];
          };
};

type iFilesActionPayload = {
    [Types.Add]: {
        requiredPath: string;
        isFolder: boolean;
    };
    [Types.Delete]: {
        requiredPath: string;
    };
    [Types.DeleteMultiple]: {
        requiredPaths: string[];
    };
    [Types.Change]: {
        targetFilePath: string;
        changeProp: {
            newPath?: string;
            newValue?: string;
            tabIndex?: number;
        };
    };
    [Types.ChangeMultiple]: {
        targetFilePath: string;
        changeProp: {
            newPath?: string;
            newValue?: string;
            tabIndex?: number;
        };
    }[];
    [Types.ChangeSelectedFile]: {
        selectedFilePath: string;
    };
    [Types.Open]: {
        path: string;
    };
    [Types.Close]: {
        path: string;
    };
};

type iFilesActions =
    ActionMap<iFilesActionPayload>[keyof ActionMap<iFilesActionPayload>];

// --- Definitions ---

// To use context in class component,
// these created contexts are needed to be exported.
const FilesContext = createContext<File[]>([]);
const FilesDispatchContext = createContext<Dispatch<iFilesActions>>(() => null);

function filesReducer(files: File[], action: iFilesActions) {
    switch (action.type) {
        // Add single file.
        case 'ADD_FILE': {
            const { requiredPath, isFolder } = action.payload;

            console.log(`[FilesContext] ADD_FILE: ${requiredPath}`);

            // Make sure requiredPath is already exist.
            if (files.map((f) => f.getPath()).find((p) => p === requiredPath)) {
                throw new Error(
                    '[ADD_FILE] The required path is already exist'
                );
            }
            const language = isFolder ? '' : getFileLanguage(requiredPath);
            return [
                ...files,
                new File(
                    requiredPath,
                    '',
                    language ? '' : language === undefined ? '' : language,
                    isFolder
                ),
            ];
        }
        // Delete single File
        case 'DELETE_FILE': {
            const { requiredPath } = action.payload;

            console.log(`[FilesContext] DELETE_FILE: ${requiredPath}`);

            const updatedFiles: File[] = files.filter(
                (f) => f.getPath() !== requiredPath
            );
            return [...updatedFiles];
        }
        // Delete more than one file.
        case 'DELETE_MULTIPLE_FILES': {
            const { requiredPaths } = action.payload;

            console.log(
                `[FilesContext] DELETE_MULTIPLE_FILES: ${requiredPaths}`
            );

            const updatedFiles: File[] = files.filter((f) => {
                return requiredPaths.find((r) => r === f.getPath()) ===
                    undefined
                    ? true
                    : false;
            });

            return [...updatedFiles];
        }
        // Change file property.
        case 'CHANGE_FILE': {
            const { targetFilePath, changeProp } = action.payload;

            console.log(`[FilesContext] CHANGE_FILE: ${targetFilePath}`);

            const updatedFiles = files.map((f) => {
                if (f.getPath() === targetFilePath) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    changeProp.newPath !== undefined &&
                        clone.setPath(changeProp.newPath);
                    changeProp.newValue !== undefined &&
                        clone.setValue(changeProp.newValue);
                    if (changeProp.tabIndex !== undefined) {
                        clone.setTabIndex(changeProp.tabIndex);
                    }
                    return clone;
                } else return f;
            });

            // DEBUG:

            return [...updatedFiles];
        }
        // Change multiple files property.
        case 'CHANGE_MULTIPLE_FILES': {
            console.log(`[FilesContext] DELETE_MULTIPLE_FILES`);

            const requests = action.payload;
            const updatedFiles = files.map((f) => {
                const request = requests.find(
                    (r) => f.getPath() === r.targetFilePath
                );
                if (request !== undefined) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    request.changeProp.newPath !== undefined &&
                        clone.setPath(request.changeProp.newPath);
                    request.changeProp.newValue !== undefined &&
                        clone.setValue(request.changeProp.newValue);
                    if (request.changeProp.tabIndex !== undefined) {
                        clone.setTabIndex(request.changeProp.tabIndex);
                    }
                    return clone;
                } else return f;
            });

            return [...updatedFiles];
        }
        case 'CHANGE_SELECTED_FILE': {
            const { selectedFilePath } = action.payload;

            console.log(
                `[FilesContext] CHANGE_SELECTED_FILE: To be ${selectedFilePath}`
            );

            const updatedFiles = files.map((f) => {
                const clone: File = Object.assign(
                    Object.create(Object.getPrototypeOf(f)),
                    f
                );
                f.getPath() === selectedFilePath
                    ? clone.setSelected()
                    : clone.unSelected();
                return clone;
            });

            return [...updatedFiles];
        }
        /***
         * OPEN FILE:
         *
         * - Set Opening flag as true
         * - Give TabIndex if it's null.
         * - Set selected to be true.
         *
         * TabIndex will be same as number of current tabs.
         *
         * TODO: 予め必ずいずれかのファイルがselected: trueになっていることが前提になっている。selected: trueのファイルがない場合に対応させること。
         * */
        case 'OPEN_FILE': {
            const { path } = action.payload;
            const target = files.find((f) => f.getPath() === path);
            const currentSelectedFile = files.find((f) => f.isSelected());

            const currentSelectedFilePath = currentSelectedFile
                ? currentSelectedFile.getPath()
                : undefined;

            // Guard if it's folder or opening already.
            if (target?.isFolder() || target?.isOpening()) {
                return files;
            }

            console.log(
                `[FilesContext] OPEN_FILE: ${path} Previous selected file: ${currentSelectedFilePath}`
            );

            const updatedFiles = files.map((f) => {
                // Get file open and selected.
                if (f.getPath() === path) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.setOpening(true);
                    clone.setSelected();
                    if (!clone.getTabIndex()) {
                        const tabIndexes = files
                            .filter((f) => f.getTabIndex !== null)
                            .map((f) => f.getTabIndex());
                        const currentTabTail = findMax(tabIndexes) + 1;
                        clone.setTabIndex(currentTabTail);
                    }
                    return clone;
                }
                // Get selected file to be unselected.
                else if (
                    currentSelectedFilePath !== undefined &&
                    f.getPath() === currentSelectedFilePath
                ) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.unSelected();
                    return clone;
                } else return f;
            });

            return [...updatedFiles];
        }
        /**
         * Close file:
         * - `isSelected: true`のファイルをクローズしたときはいずれかの`isOpening:true`のファイルを選ぶ
         * */
        case 'CLOSE_FILE': {
            const { path } = action.payload;
            // Guard if it's folder or closing already.
            const target = files.find((f) => f.getPath() === path);
            if (target?.isFolder() || !target?.isOpening()) {
                return files;
            }

            console.log(`[FilesContext] CLOSE_FILE: ${path}`);

            // Was target file `isSelected` true?
            let nextSelected: File | undefined;
            if (target.isSelected()) {
                nextSelected = files.find(
                    (f) => f.isOpening() && !f.isSelected()
                );
            }

            const updatedFiles = files.map((f) => {
                // Close target file.
                if (f.getPath() === path) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.setOpening(false);
                    clone.setTabIndex(null);
                    clone.unSelected();
                    return clone;
                }
                // Select another file if target file was selected file.
                else if (
                    nextSelected &&
                    f.getPath() === nextSelected.getPath()
                ) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.setSelected();
                    return clone;
                } else return f;
            });

            return [...updatedFiles];
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

/***
 * Initialize State:
 *
 * - Set file selected prop to true.
 * - Give tab index to selected file.
 *
 * */

const initialFiles: File[] = files.map(
    (f) => new File(f.path, f.value, f.language, f.isFolder)
);
const defaultSelectedFilePath = 'src/App.tsx';
const defaultFile = initialFiles.find(
    (f) => f.getPath() === defaultSelectedFilePath
);
defaultFile?.setSelected();
defaultFile?.setOpening(true);

// https://stackoverflow.com/a/57253387/22007575
const FilesProvider = ({ children }: { children: React.ReactNode }) => {
    const [files, dispatch] = useReducer(filesReducer, initialFiles);

    return (
        <FilesContext.Provider value={files}>
            <FilesDispatchContext.Provider value={dispatch}>
                {children}
            </FilesDispatchContext.Provider>
        </FilesContext.Provider>
    );
};

// --- Hooks ---

function useFiles() {
    return useContext(FilesContext);
}

function useFilesDispatch() {
    return useContext(FilesDispatchContext);
}

export {
    useFiles,
    useFilesDispatch,
    FilesProvider,
    FilesContext,
    FilesDispatchContext,
    // Types
    Types,
    iFilesActions,
};
