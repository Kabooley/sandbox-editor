/***
 *　Decides state of app Layout.
 *
 * TODO: createSlice内部はImmerを使っているので直接変更する文法に書き直すこと（可読性のために）
 * */
import React from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mustache } from '../utils';
import { $initialLayout } from '../constants';
import { RootState } from '../store';

// --- Types ---

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

type ViewContexts = 'explorer' | 'dependencies' | 'none';

enum ModalTypes {
    DeleteAFile = 'DELETE_A_FILE',
    DeleteAFolder = 'DELETE_A_FOLDER',
}

/***
 * Determines dialog buttons style.
 * */
enum ModalButtonStyles {
    Danger = 'danger',
    Normal = 'normal',
    Transparent = 'transparent',
}

type iModalRequestedAction = {
    [ModalTypes.DeleteAFile]: {
        // deletion target
        deletionFilePath: string;
        // used for description
        filename: string;
    };
    [ModalTypes.DeleteAFolder]: {
        // deletion target
        deletionFilesPath: string[];
        // used for description
        filename: string;
    };
};

type iModalActions =
    ActionMap<iModalRequestedAction>[keyof ActionMap<iModalRequestedAction>];

/****
 * Determines dialogs action button
 * */
interface iModalAction {
    label: string;
    requiredAction: iModalActions;
    style?: ModalButtonStyles;
}

/***
 * Determines all contents in Dialog.
 * */
interface iModalDataTemplate {
    message: string;
    description: string;
    actions: iModalAction[];
}

interface iState {
    // Flag of display or hide Pane section
    // openExplorer: boolean;
    // Enable or disable pointer events on iframe[title="preview"]
    pointerEventsOnPreviewIframe: boolean;
    currentContext: ViewContexts;
    // Switch status of displaying Preview
    isPreviewDisplay: boolean;
    // Switch status of displaying Sidebar
    isSidebarDisplay: boolean;
    // width of div.editor-section
    editorWidth: number;
    // width of div.pane. This will 0 when pane is close
    paneWidth: number;
    // width of div.pane when it will close
    paneWidthOnClose: number;
    // width of div.preview-section when it will close
    previewWidthOnClose: number;
    // Show modal if true
    showModal: boolean;
    // This data will be passed to modal dialog
    modalDataSet: iModalDataTemplate;
}

const initialState: iState = {
    pointerEventsOnPreviewIframe: true,
    currentContext: 'explorer',
    isPreviewDisplay: true,
    isSidebarDisplay: true,
    editorWidth: $initialLayout.editorLayout.defaultWidth,
    paneWidth: $initialLayout.paneLayout.defaultWidth,
    paneWidthOnClose: $initialLayout.paneLayout.defaultWidth,
    previewWidthOnClose:
        window.innerWidth -
        $initialLayout.editorLayout.defaultWidth -
        $initialLayout.paneLayout.defaultWidth,
    showModal: false,
    modalDataSet: {
        message: '',
        description: '',
        actions: [],
    },
};

const getWindowWidth = () => window.innerWidth;

const modalDataTemplate: Record<ModalTypes, Readonly<iModalDataTemplate>> = {
    DELETE_A_FILE: {
        message: 'Are you sure you want to delete this file?',
        description: "The file '{{FILENAME}}' will be removed permanently.",
        actions: [],
    },
    DELETE_A_FOLDER: {
        message: 'Are you sure you want to delete this file?',
        description:
            "The folder '{{FOLDERNAME}}' and descendants will be removed permanently.",
        actions: [],
    },
};

// DEBUG: output example
// const deleteFileDialogTemplate: iModalDataTemplate = {
//     message: modalDataTemplate.DELETE_A_FILE.message,
//     description: mustache(
//         modalDataTemplate.DELETE_A_FILE.description,
//         { FILENAME: "getModalDataSet/parameter/filename" }
//     ),
//     actions: [
//         ...modalDataTemplate.DELETE_A_FILE.actions,
//         {
//             label: "Delete",
//             requiredAction: {
//                 type: ModalTypes.DeleteAFile,
//                 payload: {
//                     deletionFilePath: "getModalDataSet/parameter/filename",
//                     filename: "aaa"
//                 }
//             },
//             style: ModalButtonStyles.Danger
//         }
//     ]
// };
const getModalDataSet = ({
    type,
    payload,
}: iModalActions): iModalDataTemplate => {
    switch (type) {
        case ModalTypes.DeleteAFile: {
            const template = modalDataTemplate[type];
            const actions: iModalAction[] = [
                ...template.actions,
                {
                    label: 'Delete',
                    requiredAction: {
                        type: type,
                        payload: payload,
                    },
                    style: ModalButtonStyles.Danger,
                },
            ];
            const description = mustache(template.description, {
                FILENAME: payload.filename,
            });

            return {
                message: template.message,
                description: description,
                actions: actions,
            };
        }
        case ModalTypes.DeleteAFolder: {
            const template = modalDataTemplate[type];
            const actions: iModalAction[] = [
                ...template.actions,
                {
                    label: 'Delete',
                    requiredAction: {
                        type: type,
                        payload: payload,
                    },
                    style: ModalButtonStyles.Danger,
                },
            ];
            const description = mustache(template.description, {
                FOLDERNAME: payload.filename,
            });

            return {
                message: template.message,
                description: description,
                actions: actions,
            };
        }
    }
};

export const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        DisablePointerEventsOnIframe: (state) => {
            state.pointerEventsOnPreviewIframe = false;
        },
        EnablePointerEventsOnIframe: (state) => {
            state.pointerEventsOnPreviewIframe = true;
        },
        ChangeContext: (state, action: PayloadAction<ViewContexts>) => {
            const context = action.payload;
            // On close pane:
            if (context === state.currentContext) {
                const _paneWidth = state.paneWidth;
                // Expand editorWidth to fit screen excluding Navigation if preview is closing.
                if (!state.isPreviewDisplay) {
                    state.currentContext = 'none';
                    state.paneWidthOnClose = _paneWidth;
                    state.paneWidth = 0;
                    state.editorWidth = getWindowWidth();
                }
                // Share pane width with editorWidth and preview width if preview is not closing.
                else {
                    state.currentContext = 'none';
                    state.paneWidthOnClose = _paneWidth;
                    state.paneWidth = 0;
                }
            }
            // On open pane or just change context:
            else if (state.currentContext === 'none') {
                // In case preview is closing:
                // pane occupies width with state.paneWidthOnClose, Navigation is navigationWidth, editorWidth is rest when preview is closing.
                if (!state.isPreviewDisplay) {
                    state.currentContext = context;
                    state.paneWidth = state.paneWidthOnClose;
                    state.editorWidth =
                        getWindowWidth() - state.paneWidthOnClose;
                }
                // In case preview is opening:
                else {
                    let _editorWidth = state.editorWidth;
                    // In order not to let editorWidth over its maximumWidth limit.
                    if (
                        _editorWidth > $initialLayout.editorLayout.maximumWidth
                    ) {
                        _editorWidth = $initialLayout.editorLayout.maximumWidth;
                    }
                    state.currentContext = context;
                    state.paneWidth = state.paneWidthOnClose;
                    state.editorWidth = _editorWidth;
                }
            }
            // Just change context except "none"
            else {
                state.currentContext = context;
            }
        },
        TogglePreview: (state) => {
            // on close preview:
            if (state.isPreviewDisplay) {
                const _previewWidthOnClose =
                    getWindowWidth() - state.paneWidth - state.editorWidth;
                if (state.currentContext === 'none') {
                    // In case pane is closing
                    // Editor expand to fill screen excluding navigation.
                    return {
                        ...state,
                        isPreviewDisplay: false,
                        previewWidthOnClose: _previewWidthOnClose,
                        editorWidth: getWindowWidth(),
                    };
                } else {
                    // In case pane is opening
                    // Editor expand to fill part of preview-section.
                    return {
                        ...state,
                        isPreviewDisplay: false,
                        previewWidthOnClose: _previewWidthOnClose,
                        editorWidth: getWindowWidth() - state.paneWidth,
                    };
                }
            }
            // On open preview:
            else {
                if (state.currentContext === 'none') {
                    // In case pane is closing
                    // EditorSection width shrink to length of the preview and navigation removed.
                    const _editorWidth =
                        getWindowWidth() - state.previewWidthOnClose;
                    return {
                        ...state,
                        isPreviewDisplay: true,
                        editorWidth: _editorWidth,
                    };
                } else {
                    // In case pane is opening.
                    // EditorSection width shrink to length of the preview and pane, navigation removed.
                    let _editorWidth =
                        getWindowWidth() -
                        state.paneWidth -
                        state.previewWidthOnClose;
                    // In order not to let editor width be less tan its minimum size.
                    if (
                        _editorWidth < $initialLayout.editorLayout.minimumWidth
                    ) {
                        _editorWidth = $initialLayout.editorLayout.minimumWidth;
                    }
                    return {
                        ...state,
                        isPreviewDisplay: true,
                        editorWidth: _editorWidth,
                    };
                }
            }
        },

        ToggleSidebar: (state) => {
            // On close sidebar:
            if (state.isSidebarDisplay) {
                const _paneWidth = state.paneWidth;
                // Expand editorWidth to fit screen excluding Navigation if preview is closing.
                if (!state.isPreviewDisplay) {
                    return {
                        ...state,
                        paneWidthOnClose: _paneWidth,
                        paneWidth: 0,
                        editorWidth: getWindowWidth(),
                        isSidebarDisplay: false,
                    };
                }
                // Share pane width with editorWidth and preview width if preview is not closing.
                else {
                    return {
                        ...state,
                        paneWidthOnClose: _paneWidth,
                        paneWidth: 0,
                        isSidebarDisplay: false,
                    };
                }
            }
            // On open sidebar
            else {
                // In case preview is closing:
                // pane occupies width with state.paneWidthOnClose, Navigation is navigationWidth, editorWidth is rest when preview is closing.
                if (!state.isPreviewDisplay) {
                    return {
                        ...state,
                        paneWidth: state.paneWidthOnClose,
                        editorWidth: getWindowWidth() - state.paneWidthOnClose,
                        isSidebarDisplay: true,
                    };
                }
                // In case preview is opening:
                else {
                    let _editorWidth = state.editorWidth;
                    // In order not to let editorWidth over its maximumWidth limit.
                    if (
                        _editorWidth > $initialLayout.editorLayout.maximumWidth
                    ) {
                        _editorWidth = $initialLayout.editorLayout.maximumWidth;
                    }
                    return {
                        ...state,
                        paneWidth: state.paneWidthOnClose,
                        editorWidth: _editorWidth,
                        isSidebarDisplay: true,
                    };
                }
            }
        },
        UpdateEditorWidth: (state, action: PayloadAction<number>) => {
            state.editorWidth = action.payload;
        },
        UpdatePaneWidth: (state, action: PayloadAction<number>) => {
            const width = action.payload;
            // Fit editor-section width fill width except navigation in case preview is closing
            let _editorWidth = state.editorWidth;
            if (!state.isPreviewDisplay) {
                _editorWidth = getWindowWidth() - width;
            }
            return {
                ...state,
                paneWidth: width,
                editorWidth: _editorWidth,
            };
        },
        ShowModal: (state, action: PayloadAction<iModalActions>) => {
            state.showModal = true;
            state.modalDataSet = getModalDataSet(action.payload);
        },
        RemoveModal: (state) => {
            state.showModal = false;
            state.modalDataSet.message = '';
            state.modalDataSet.description = '';
            state.modalDataSet.actions = [];
        },
    },
});

export {
    // enums
    ModalTypes,
    ModalButtonStyles,
    // types
    iModalAction,
};
export const layoutActions = layoutSlice.actions;
export const selectLayoutState = (state: RootState) => state.layout;
export default layoutSlice.reducer;

/*
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectLayoutState, layoutSlice, layoutActions } from '../slices/layoutSlice';

    const { paneWidth, isSidebarDisplay } = useAppSelector(selectLayoutState);
    const dispatch = useAppDispatch();


*/
