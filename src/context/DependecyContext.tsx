/****************************************************
 * NOTE: MonacoEditor, Explorer, SearchDependencyにまたがって提供されなくてはならない。
 * NOTE: files情報が必ず必要なので、FilesContextよりも下位でProviderを提供しなくてはならないかも。
 * **************************************************/ 
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { usePackageJson } from '../hooks/usePackageJson';

export interface iDependency {
    // moduleName: version
    [moduleName: string]: string;
}

export enum Types {
    AddDependency = 'ADD_DEPENDENCY',
    RemoveDependency = 'REMOVE_DEPENDENCY',
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

type iDependencyActionsPayload = {
    // ひとまず一つのmoduleにたいしてのみdispatchするという仕様にする
    [Types.AddDependency]: {
        moduleName: string;
        version: string;
        // dependencies: {
        //     // module name: version
        //     [name: string]: string;
        // }
    };
    [Types.RemoveDependency]: {
        moduleName: string;
        version: string;
    };
};


const initialDependencies: iDependency = usePackageJson();

export type iDependencyActions =
    ActionMap<iDependencyActionsPayload>[keyof ActionMap<iDependencyActionsPayload>];

export const DependencyContext = createContext<iDependency>({});
export const DependencyDispatchContext = createContext<
    Dispatch<iDependencyActions>
>(() => null);

function dependenciesReducer(
    dependencies: iDependency,
    action: iDependencyActions
) {
    switch (action.type) {
        case Types.AddDependency: {
            // DEBUG:
            console.log(`[DependencyContext] ${Types.AddDependency}`);
            
            const { moduleName, version } = action.payload;

            console.log(`Fetch ${action.payload.moduleName}@${action.payload.version}`);

            // Check same name + version is exist
            if (Object.keys(dependencies).find((m) => m === moduleName)) {
                // 今のところモジュール名が同じということだけでエラーとする
                throw new Error(
                    'Error: Required module about to add to dependency is already exist'
                );
            }

            // NOTE: call fetchLibs.worker
            // Add module If worker did not return error
            return Object.assign({}, dependencies, { moduleName: version });
        }
        case Types.RemoveDependency:
            {
                const { moduleName, version } = action.payload;
                if (
                    !Object.keys(dependencies).find(
                        (m) =>
                            `${m}@${dependencies[m]}` ===
                            `${moduleName}@${version}`
                    )
                ) {
                    throw new Error(
                        'Error: Required module that about to remove is not exist on dependencies.'
                    );
                }

                // delete dependencies[moduleName];
                const updatedDependencies = Object.assign({}, dependencies);
                delete updatedDependencies[moduleName];
                return updatedDependencies;
            }
        default: {
                throw new Error('Unknown action ');
            }
    }
}


export const DependenciesProvider = ({ children }: { children: React.ReactNode }) => {
    const [dependencies, dispatch] = useReducer(
        dependenciesReducer,
        initialDependencies
    );

    return (
        <DependencyContext.Provider value={dependencies}>
            <DependencyDispatchContext.Provider value={dispatch}>
                {children}
            </DependencyDispatchContext.Provider>
        </DependencyContext.Provider>
    );
};

// --- Hooks ---

export function useDependencies() {
    return useContext(DependencyContext);
}

export function useDependencyDispatch() {
    return useContext(DependencyDispatchContext);
}
