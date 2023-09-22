/***
 *　Decides state of app Layout.
 *
 *
 * */
import React, { createContext, useContext, useReducer, Dispatch } from 'react';

// --- Types ---

interface iState {
    openExplorer: boolean;
}

export enum Types {
    SlideExplorer = 'SLIDE_EXPLORER',
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
    [Types.SlideExplorer]: {};
};

export type iLayoutActions =
    ActionMap<iLayoutActionPayload>[keyof ActionMap<iLayoutActionPayload>];

// --- Definitions ---

const LayoutContext = createContext<iState>({ openExplorer: true });
const LayoutDispatchContext = createContext<Dispatch<iLayoutActions>>(
    () => null
);

function layoutReducer(state: iState, action: iLayoutActions) {
    // DEBUG:

    switch (action.type) {
        case 'SLIDE_EXPLORER': {
            // DEBUG:
            console.log(
                `[LayoutContext] slide explorer ${!state.openExplorer}`
            );

            return {
                ...state,
                openExplorer: !state.openExplorer,
            };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const initialState: iState = {
    openExplorer: true,
};

// https://stackoverflow.com/a/57253387/22007575
export const LayoutStateProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
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

export function useLayoutState() {
    return useContext(LayoutContext);
}

export function useLayoutDispatch() {
    return useContext(LayoutDispatchContext);
}
