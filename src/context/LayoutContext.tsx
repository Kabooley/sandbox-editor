/***
 *　Decides state of app Layout.
 *
 * TODO:
 * - previewの表示・非表示機能のせいで条件分岐とwidthの管理が複雑になった。もっと簡単にできないか。
 * - previewを閉じているときにeditor-sectionをresize可能にするべきかどうかの検討
 **/
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { textSpanContainsTextSpan } from 'typescript';

// --- Types ---

interface iState {
    // Flag of display or hide Pane section
    // openExplorer: boolean;
    // Enable or disable pointer events on iframe[title="preview"]
    pointerEventsOnPreviewIframe: boolean;
    currentContext: ViewContexts;
    // Switch status of displaying Preview
    isPreviewDisplay: boolean;
    // width of div.editor-section
    editorWidth: number;
    // width of div.pane
    paneWidth: number;
    // width of div.preview-section
    previewWidth: number;
}

type ViewContexts = 'explorer' | 'dependencies' | 'none';

enum Types {
    DisablePointerEventsOnIframe = 'DISABLE_POINTER_EVENTS_ON_IFRAME',
    EnablePointerEventsOnIframe = 'ENABLE_POINTER_EVENTS_ON_IFRAME',
    ChangeContext = 'CHANGE_CONTEXT',
    TogglePreview = 'TOGGLE_PREVIEW',
    UpdateEditorWidth = 'UPDATE_EDITOR_WIDTH',
    UpdatePaneWidth = 'UPDATE_PANE_WIDTH',
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

type iLayoutActionPayload = {
    [Types.DisablePointerEventsOnIframe]: {};
    [Types.EnablePointerEventsOnIframe]: {};
    [Types.ChangeContext]: {
        context: ViewContexts;
    };
    [Types.TogglePreview]: {};
    [Types.UpdateEditorWidth]: {
        width: number;
    };
    [Types.UpdatePaneWidth]: {
        width: number;
    };
};

type iLayoutActions =
    ActionMap<iLayoutActionPayload>[keyof ActionMap<iLayoutActionPayload>];

// --- Definitions ---

// https://stackoverflow.com/a/3437825/22007575
const getWindowWidth = () => {
    return window.screen.width;
};

const initialLayoutState = {
    editorLayout: {
        // NOTE: EditorSection.tsxにも同データがある。異なることがないように。
        defaultWidth: 600,
        minimumWidth: 100,
    },
    paneLayout: {
        // NOTE: Pane.tsxにも同データがある。異なることがないように。
        defaultWidth: 240,
        minimunWidth: 190,
        maximumWidth: 400,
    },
};

const LayoutContext = createContext<iState>({
    // openExplorer: true,
    pointerEventsOnPreviewIframe: true,
    currentContext: 'explorer',
    isPreviewDisplay: true,
    editorWidth: initialLayoutState.editorLayout.defaultWidth,
    paneWidth: initialLayoutState.paneLayout.defaultWidth,
    previewWidth:
        getWindowWidth() -
        48 -
        initialLayoutState.editorLayout.defaultWidth -
        initialLayoutState.paneLayout.defaultWidth,
});

const LayoutDispatchContext = createContext<Dispatch<iLayoutActions>>(
    () => null
);

function layoutReducer(state: iState, action: iLayoutActions) {
    switch (action.type) {
        case Types.DisablePointerEventsOnIframe: {
            return {
                ...state,
                pointerEventsOnPreviewIframe: false,
            };
        }
        case Types.EnablePointerEventsOnIframe: {
            return {
                ...state,
                pointerEventsOnPreviewIframe: true,
            };
        }
        case Types.ChangeContext: {
            const { context } = action.payload;
            // Close pane:
            if (state.currentContext === context) {
                if (!state.isPreviewDisplay) {
                    return {
                        ...state,
                        editorWidth: getWindowWidth() - 48,
                        currentContext: 'none',
                    };
                }
                return {
                    ...state,
                    currentContext: 'none',
                };
            }
            // Open pane
            else if (
                state.currentContext === 'none' &&
                !state.isPreviewDisplay
            ) {
                return {
                    ...state,
                    editorWidth: state.editorWidth - state.paneWidth,
                    currentContext: context,
                };
            }
            // Just change context
            else {
                return {
                    ...state,
                    currentContext: context,
                };
            }
        }
        case Types.TogglePreview: {
            // DEBUG:
            console.log(
                `[LayoutContext] toggle preview: set ${!state.isPreviewDisplay}`
            );

            // Close preview
            if (state.isPreviewDisplay) {
                const paneWidth =
                    state.currentContext === 'none' ? 0 : state.paneWidth;
                const editorWidth = getWindowWidth() - 48 - paneWidth;
                const previewWidth =
                    getWindowWidth() - 48 - paneWidth - state.editorWidth;
                // DEBUG:
                console.log(`[LayoutContext] editorWidth: ${editorWidth}`);
                console.log(`[LayoutContext] previewWidth: ${previewWidth}`);

                return {
                    ...state,
                    previewWidth: previewWidth,
                    editorWidth: editorWidth,
                    isPreviewDisplay: false,
                };
            }
            // Reopen preview
            else {
                const editorWidth = state.editorWidth - state.previewWidth;
                return {
                    ...state,
                    editorWidth: editorWidth,
                    isPreviewDisplay: true,
                };
            }
        }
        case Types.UpdateEditorWidth: {
            const { width } = action.payload;

            // TODO: previewを閉じているときは明示的にresize不可にするべきか確認

            return {
                ...state,
                editorWidth: width,
            };
        }
        case Types.UpdatePaneWidth: {
            const { width } = action.payload;

            let editorWidth = state.editorWidth;
            // Update editorWidth in case preview is closing.
            // NOTE: これって必要か？cssでどうにかならないか？editor-sectionはwidthは定められるからcssではどうにもできないかも
            if (!state.isPreviewDisplay) {
                editorWidth = getWindowWidth() - width - 48;
            }
            return {
                ...state,
                editorWidth: editorWidth,
                paneWidth: width,
            };
        }
        default: {
            throw Error('Unknown action: ' + (action.type as any));
        }
    }
}

const initialState: iState = {
    pointerEventsOnPreviewIframe: true,
    currentContext: 'explorer',
    isPreviewDisplay: true,
    editorWidth: initialLayoutState.editorLayout.defaultWidth,
    paneWidth: initialLayoutState.paneLayout.defaultWidth,
    previewWidth:
        getWindowWidth() -
        48 -
        initialLayoutState.editorLayout.defaultWidth -
        initialLayoutState.paneLayout.defaultWidth,
};

// https://stackoverflow.com/a/57253387/22007575
const LayoutStateProvider = ({ children }: { children: React.ReactNode }) => {
    const [layoutState, dispatch] = useReducer(layoutReducer, initialState);

    return (
        <LayoutContext.Provider value={layoutState}>
            <LayoutDispatchContext.Provider value={dispatch}>
                {children}
            </LayoutDispatchContext.Provider>
        </LayoutContext.Provider>
    );
};

// --- Hooks ---

function useLayoutState() {
    return useContext(LayoutContext);
}

function useLayoutDispatch() {
    return useContext(LayoutDispatchContext);
}

export {
    useLayoutState,
    useLayoutDispatch,
    LayoutStateProvider,
    // types
    Types,
    ViewContexts,
    iLayoutActions,
};
