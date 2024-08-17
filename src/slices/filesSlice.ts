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
import { files } from '../data/files';
import type { iFile } from '../data/types';
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

// const initialFiles: File[] = files.map(
//     (f) => new File(f.path, f.value, f.language, f.isFolder)
// );
// const defaultSelectedFilePath = 'src/App.tsx';
// const defaultFile = initialFiles.find(
//     (f) => f.path === defaultSelectedFilePath
// );
// defaultFile?.setSelected();
// defaultFile?.setOpening(true);

const getInitializedFiles = () => {
  const initialFiles: iFile[] = files.map((f) => {
    return Object.assign({}, f);
  });
  const selectedFile = initialFiles.find((f) => f.path === 'src/App.tsx');
  if (selectedFile !== undefined) {
    selectedFile.selected = true;
    selectedFile.opening = true;
  }
  return initialFiles;
};

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: getInitializedFiles(),
  },
  reducers: {
    // Add single file.
    // TODO: selected: trueにすること
    // TODO: 同名ファイルは追加できないようにすること
    addFile: (state, action: PayloadAction<iFilesActionPayload[Types.Add]>) => {
      const { requiredPath, isFolder } = action.payload;

      // Make sure requiredPath is already exist.
      if (state.files.map((f) => f.path).find((p) => p === requiredPath)) {
        throw new Error('[files] ADD_FILE: The required path is already exist');
      }

      // Add new folder:
      if (isFolder) {
        const language = isFolder ? '' : getFileLanguage(requiredPath);
        state.files.push({
          path: requiredPath,
          language: language === undefined ? '' : language,
          value: '',
          selected: false,
          opening: false,
          tabIndex: null,
          isFolder,
        });
        return;
      }

      // Add new file:
      const selectedFile = state.files.find((f) => f.selected);
      const l = getFileLanguage(requiredPath);
      const newFile = {
        path: requiredPath,
        language: l === undefined ? '' : l,
        value: '',
        selected: false,
        opening: false,
        tabIndex: null,
        isFolder,
      };
      newFile.selected = true;
      newFile.opening = true;

      // Unselect current selected file if exists.
      if (selectedFile !== undefined) {
        selectedFile.selected = false;
        state.files = [
          ...state.files.filter((f) => f.path !== selectedFile.path),
          selectedFile,
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

      state.files = state.files.filter((f) => f.path !== requiredPath);
    },
    // Delete more than one file.
    deleteMultipleFiles: (
      state,
      action: PayloadAction<iFilesActionPayload[Types.DeleteMultiple]>
    ) => {
      const { requiredPaths } = action.payload;

      state.files = state.files.filter((f) => {
        return requiredPaths.find((r) => r === f.path) === undefined
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
        if (f.path === targetFilePath) {
          if (changeProp.newPath !== undefined) {
            f.path = changeProp.newPath;
          }
          if (changeProp.newValue !== undefined) {
            f.value = changeProp.newValue;
          }
          if (changeProp.tabIndex !== undefined) {
            f.tabIndex = changeProp.tabIndex;
          }
          return f;
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
        const request = requests.find((r) => f.path === r.targetFilePath);
        if (request !== undefined) {
          if (request.changeProp.newPath !== undefined) {
            f.path = request.changeProp.newPath;
          }
          if (request.changeProp.newValue !== undefined) {
            f.value = request.changeProp.newValue;
          }
          if (request.changeProp.tabIndex !== undefined) {
            f.tabIndex = request.changeProp.tabIndex;
          }
          return f;
        } else return f;
      });
    },
    changeSelectedFile: (
      state,
      action: PayloadAction<iFilesActionPayload[Types.ChangeSelectedFile]>
    ) => {
      const { selectedFilePath } = action.payload;

      const targetFile = state.files.find((f) => f.path === selectedFilePath);

      // Return if the requested file is already selected.
      if (targetFile !== undefined && targetFile.selected) {
        return;
      }

      state.files = state.files.map((f) => {
        f.selected = f.path === selectedFilePath ? true : false;
        return f;
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
      const target = state.files.find((f) => f.path === path);
      const currentSelectedFile = state.files.find((f) => f.selected);

      const currentSelectedFilePath = currentSelectedFile
        ? currentSelectedFile.path
        : undefined;

      // Guard if it's folder or opening already.
      if (target?.isFolder || target?.opening) {
        return;
      }

      state.files = state.files.map((f) => {
        // Get file open and selected.
        if (f.path === path) {
          f.opening = true;
          f.selected = true;
          if (!f.tabIndex) {
            const tabIndexes = state.files
              .filter((f) => f.tabIndex !== null)
              .map((f) => f.tabIndex);
            f.tabIndex = findMax(tabIndexes) + 1;
          }
          return f;
        }
        // Get selected file to be unselected.
        else if (
          currentSelectedFilePath !== undefined &&
          f.path === currentSelectedFilePath
        ) {
          f.selected = false;
          return f;
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
      const target = state.files.find((f) => f.path === path);
      if (target?.isFolder || !target?.opening) {
        return;
      }

      // Choose next selected file if closing file is selected.
      let nextSelected: iFile | undefined;
      if (target.selected) {
        nextSelected = state.files.find((f) => f.opening && !f.selected);
      }

      state.files = state.files.map((f) => {
        // Close target file.
        if (f.path === path) {
          f.opening = false;
          f.tabIndex = null;
          f.selected = false;
          return f;
        }
        // Select another file if target file was selected file.
        else if (nextSelected !== undefined && f.path === nextSelected.path) {
          f.selected = true;
          return f;
        } else return f;
      });
    },
    closeAllFiles: (state) => {
      state.files = state.files.map((f) => {
        if (f.opening) {
          f.opening = false;
          return f;
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
