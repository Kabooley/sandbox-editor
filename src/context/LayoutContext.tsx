/***
 *　Decides state of app Layout.
 *
 * */
import React, { createContext, useContext, useReducer, Dispatch } from 'react';

// --- Types ---

type ViewContexts = 'explorer' | 'dependencies' | 'none';

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
    // width of div.pane. This will 0 when pane is close
    paneWidth: number;
    // width of div.pane when it will close
    paneWidthOnClose: number;
    // width of div.preview-section when it will close
    previewWidthOnClose: number;
}

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

const getWindowWidth = () => {
    return window.innerWidth;
};

const initialLayout = {
    editorLayout: {
        // NOTE: EditorSection.tsxにも同データがある。異なることがないように。
        defaultWidth: 600,
        minimumWidth: 100,
        maximumWidth: window.screen.width * 0.7,
    },
    paneLayout: {
        // NOTE: Pane.tsxにも同データがある。異なることがないように。
        defaultWidth: 240,
        minimunWidth: 190,
        maximumWidth: window.screen.width * 0.26,
    },
    // TODO: cssの値と整合性とるように。cssの方は`4.8rem`である。
    navigation: {
        width: 48,
    },
};

const navigationWidth = initialLayout.navigation.width;

const LayoutContext = createContext<iState>({
    pointerEventsOnPreviewIframe: true,
    currentContext: 'dependencies',
    isPreviewDisplay: true,
    editorWidth: initialLayout.editorLayout.defaultWidth,
    paneWidth: initialLayout.paneLayout.defaultWidth,
    paneWidthOnClose: initialLayout.paneLayout.defaultWidth,
    previewWidthOnClose:
        getWindowWidth() -
        initialLayout.editorLayout.defaultWidth -
        initialLayout.paneLayout.defaultWidth -
        navigationWidth,
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
        /***
         *
         * */
        case Types.ChangeContext: {
            const { context } = action.payload;
            // On close pane:
            if (context === state.currentContext) {
                const _paneWidth = state.paneWidth;
                // Expand editorWidth to fit screen excluding Navigation if preview is closing.
                if (!state.isPreviewDisplay) {
                    return {
                        ...state,
                        currentContext: 'none',
                        paneWidthOnClose: _paneWidth,
                        paneWidth: 0,
                        editorWidth: getWindowWidth() - navigationWidth,
                    };
                }
                // Share pane width with editorWidth and preview width if preview is not closing.
                else {
                    return {
                        ...state,
                        currentContext: 'none',
                        paneWidthOnClose: _paneWidth,
                        paneWidth: 0,
                    };
                }
            }
            // On open pane or just change context:
            if (state.currentContext === 'none') {
                // In case preview is closing:
                // pane occupies width with state.paneWidthOnClose, Navigation is navigationWidth, editorWidth is rest when preview is closing.
                if (!state.isPreviewDisplay) {
                    return {
                        ...state,
                        currentContext: context,
                        paneWidth: state.paneWidthOnClose,
                        editorWidth:
                            getWindowWidth() -
                            navigationWidth -
                            state.paneWidthOnClose,
                    };
                }
                // In case preview is opening:
                else {
                    let _editorWidth = state.editorWidth;
                    // In order not to let editorWidth over its maximumWidth limit.
                    if (
                        _editorWidth > initialLayout.editorLayout.maximumWidth
                    ) {
                        _editorWidth = initialLayout.editorLayout.maximumWidth;
                    }
                    return {
                        ...state,
                        currentContext: context,
                        paneWidth: state.paneWidthOnClose,
                        editorWidth: _editorWidth,
                    };
                }
            }
            // Just change context except "none"
            return {
                ...state,
                currentContext: context,
            };
        }
        /***
         *
         * */
        case Types.TogglePreview: {
            // DEBUG:
            console.log('[LayoutContext] toggle preview:');

            // on close preview:
            if (state.isPreviewDisplay) {
                const _previewWidthOnClose =
                    getWindowWidth() -
                    navigationWidth -
                    state.paneWidth -
                    state.editorWidth;
                if (state.currentContext === 'none') {
                    // In case pane is closing
                    // Editor expand to fill screen excluding navigation.
                    return {
                        ...state,
                        isPreviewDisplay: false,
                        previewWidthOnClose: _previewWidthOnClose,
                        editorWidth: getWindowWidth() - navigationWidth,
                    };
                } else {
                    // In case pane is opening
                    // Editor expand to fill part of preview-section.
                    return {
                        ...state,
                        isPreviewDisplay: false,
                        previewWidthOnClose: _previewWidthOnClose,
                        editorWidth:
                            getWindowWidth() -
                            navigationWidth -
                            state.paneWidth,
                    };
                }
            }
            // On open preview:
            else {
                if (state.currentContext === 'none') {
                    // In case pane is closing
                    // EditorSection width shrink to length of the preview and navigation removed.
                    const _editorWidth =
                        getWindowWidth() -
                        navigationWidth -
                        state.previewWidthOnClose;
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
                        navigationWidth -
                        state.paneWidth -
                        state.previewWidthOnClose;
                    // In order not to let editor width be less tan its minimum size.
                    if (
                        _editorWidth < initialLayout.editorLayout.minimumWidth
                    ) {
                        _editorWidth = initialLayout.editorLayout.minimumWidth;
                    }
                    return {
                        ...state,
                        isPreviewDisplay: true,
                        editorWidth: _editorWidth,
                    };
                }
            }
        }
        /****
         *
         ***/
        case Types.UpdateEditorWidth: {
            const { width } = action.payload;
            return {
                ...state,
                editorWidth: width,
            };
        }
        case Types.UpdatePaneWidth: {
            const { width } = action.payload;
            // Fit editor-section width fill width except navigation in case preview is closing
            let _editorWidth = state.editorWidth;
            if (!state.isPreviewDisplay) {
                _editorWidth = getWindowWidth() - navigationWidth - width;
            }
            return {
                ...state,
                paneWidth: width,
                editorWidth: _editorWidth,
            };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const initialState: iState = {
    pointerEventsOnPreviewIframe: true,
    currentContext: 'dependencies',
    isPreviewDisplay: true,
    editorWidth: initialLayout.editorLayout.defaultWidth,
    paneWidth: initialLayout.paneLayout.defaultWidth,
    paneWidthOnClose: initialLayout.paneLayout.defaultWidth,
    previewWidthOnClose:
        getWindowWidth() -
        initialLayout.editorLayout.defaultWidth -
        initialLayout.paneLayout.defaultWidth -
        navigationWidth,
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
