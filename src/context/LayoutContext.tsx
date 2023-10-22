/***
 *　Decides state of app Layout.
 * */
import React, { createContext, useContext, useReducer, Dispatch } from 'react';

// --- Types ---

interface iState {
    // Flag of display or hide Pane section
    // openExplorer: boolean;
    // Enable or disable pointer events on iframe[title="preview"]
    pointerEventsOnPreviewIframe: boolean;
    currentContext: ViewContexts;
}

type ViewContexts = 'explorer' | 'dependencies' | 'none';

enum Types {
    // iframe[title="preview"]のこと
    DisablePointerEventsOnIframe = 'DISABLE_POINTER_EVENTS_ON_IFRAME',
    EnablePointerEventsOnIframe = 'ENABLE_POINTER_EVENTS_ON_IFRAME',
    ChangeContext = 'CHANGE_CONTEXT',
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
};

type iLayoutActions =
    ActionMap<iLayoutActionPayload>[keyof ActionMap<iLayoutActionPayload>];

// --- Definitions ---

const LayoutContext = createContext<iState>({
    // openExplorer: true,
    pointerEventsOnPreviewIframe: true,
    currentContext: 'explorer',
});
const LayoutDispatchContext = createContext<Dispatch<iLayoutActions>>(
    () => null
);

function layoutReducer(state: iState, action: iLayoutActions) {
    // DEBUG:

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
            return {
                ...state,
                currentContext: context,
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
