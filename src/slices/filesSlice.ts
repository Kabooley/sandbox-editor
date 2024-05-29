/***
 * FilesContext
 *
 * Managing File state and provide its context.
 *
 * 型付けにおいて大いに参考になったサイト：
 * https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
 *
 * */
import React from 'react';
import { files, File } from '../data/files';
import { getFileLanguage, findMax } from '../utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

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
    CloseAll = 'CLOSE_ALL',
}

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
    [Types.CloseAll]: {};
};

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

const filesSlice = createSlice({
    name: 'files',
    initialState: {
        files: initialFiles,
    },
    reducers: {
        // Add single file.
        // TODO: selected: trueにすること
        // TODO: 同名ファイルは追加できないようにすること
        addFile: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.Add]>
        ) => {
            const { requiredPath, isFolder } = action.payload;

            // Make sure requiredPath is already exist.
            if (
                state.files
                    .map((f) => f.getPath())
                    .find((p) => p === requiredPath)
            ) {
                throw new Error(
                    '[files] ADD_FILE: The required path is already exist'
                );
            }
            const language = isFolder ? '' : getFileLanguage(requiredPath);

            // Add new folder:
            if (isFolder) {
                state.files.push(
                    new File(
                        requiredPath,
                        '',
                        language ? '' : language === undefined ? '' : language,
                        isFolder
                    )
                );
            }

            // Add new file:
            const selectedFile = state.files.find((f) => f.isSelected());
            const newFile = new File(
                requiredPath,
                '',
                language ? '' : language === undefined ? '' : language,
                isFolder
            );
            newFile.setOpening(true);
            newFile.setSelected();

            // Unselect selected file if exists.
            if (selectedFile !== undefined) {
                const clone: File = Object.assign(
                    Object.create(Object.getPrototypeOf(selectedFile)),
                    selectedFile
                );
                clone.unSelected();
                state.files = [
                    ...state.files.filter(
                        (f) => f.getPath() !== selectedFile.getPath()
                    ),
                    clone,
                    newFile,
                ];
            } else {
                state.files = [...state.files, newFile];
            }
        },
        // Delete single File
        deleteFile: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.Delete]>
        ) => {
            const { requiredPath } = action.payload;
            state.files = state.files.filter(
                (f) => f.getPath() !== requiredPath
            );
        },
        // Delete more than one file.
        deleteMultipleFiles: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.DeleteMultiple]>
        ) => {
            const { requiredPaths } = action.payload;

            state.files = state.files.filter((f) => {
                return requiredPaths.find((r) => r === f.getPath()) ===
                    undefined
                    ? true
                    : false;
            });
        },
        // Change a file's property
        // TODO: 同一pathがないか検査すること
        changeFile: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.Change]>
        ) => {
            const { targetFilePath, changeProp } = action.payload;

            state.files = state.files.map((f) => {
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
        },
        // Change multiple files property.
        // TODO: 同一pathがないか検査すること
        changeMultipleFiles: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.ChangeMultiple]>
        ) => {
            const requests = action.payload;
            state.files = state.files.map((f) => {
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
        },
        changeSelectedFile: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.ChangeSelectedFile]>
        ) => {
            const { selectedFilePath } = action.payload;

            const targetFile = state.files.find(
                (f) => f.getPath() === selectedFilePath
            );

            if (targetFile !== undefined && targetFile.isSelected()) {
                return;
            }

            state.files = state.files.map((f) => {
                const clone: File = Object.assign(
                    Object.create(Object.getPrototypeOf(f)),
                    f
                );
                f.getPath() === selectedFilePath
                    ? clone.setSelected()
                    : clone.unSelected();
                return clone;
            });
        },
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
        openFile: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.Open]>
        ) => {
            const { path } = action.payload;
            const target = state.files.find((f) => f.getPath() === path);
            const currentSelectedFile = state.files.find((f) => f.isSelected());

            const currentSelectedFilePath = currentSelectedFile
                ? currentSelectedFile.getPath()
                : undefined;

            // Guard if it's folder or opening already.
            if (target?.isFolder() || target?.isOpening()) {
                return;
            }

            state.files = state.files.map((f) => {
                // Get file open and selected.
                if (f.getPath() === path) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.setOpening(true);
                    clone.setSelected();
                    if (!clone.getTabIndex()) {
                        const tabIndexes = state.files
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
        },
        /**
         * Close file:
         * - `isSelected: true`のファイルをクローズしたときはいずれかの`isOpening:true`のファイルを選ぶ
         * */
        closeFile: (
            state,
            action: PayloadAction<iFilesActionPayload[Types.Close]>
        ) => {
            const { path } = action.payload;
            // Guard if it's folder or closing already.
            const target = state.files.find((f) => f.getPath() === path);
            if (target?.isFolder() || !target?.isOpening()) {
                return;
            }

            // Was target file `isSelected` true?
            let nextSelected: File | undefined;
            if (target.isSelected()) {
                nextSelected = state.files.find(
                    (f) => f.isOpening() && !f.isSelected()
                );
            }

            state.files = state.files.map((f) => {
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
        },
        closeAllFiles: (state) => {
            state.files = state.files.map((f) => {
                if (f.isOpening()) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );

                    clone.setOpening(false);
                    clone.unSelected();
                    clone.setTabIndex(null);
                    return clone;
                } else return f;
            });
        },
    },
});

// actions
export const {
    addFile,
    deleteFile,
    deleteMultipleFiles,
    changeFile,
    changeMultipleFiles,
    changeSelectedFile,
    openFile,
    closeFile,
    closeAllFiles,
} = filesSlice.actions;
// select state
export const selectFiles = (state: RootState) => state.files;
export const filesActions = filesSlice.actions;
export default filesSlice.reducer;
