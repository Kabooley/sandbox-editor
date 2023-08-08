/****************************************************
 * TODO: sortObjectByKeys
 * TODO: add, removeをなくしてすべてupdateに統一する
 *
 *  initializeDependenciesを初期化するためにpackage.jsonの情報が必要
 *  依存関係リストを更新するたびにpackage.jsonファイルを内部的に更新する必要があるので
 *
 * 実際のモジュールの取得は、EditorContainer.tsx::fetchLibs.workerの仕事で、
 * こっちは依存関係のリストの更新と提供を仕事とする。
 *
 * 本当はそのモジュール名称とバージョンが一致するのか検証してから追加したいのだけどね、困難である。
 * **************************************************/
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import semver from 'semver';
import { sortObjectByKeys } from '../utils';

export interface iDependency {
    // moduleName: version
    [moduleName: string]: string;
}

export enum Types {
    AddDependency = 'ADD_DEPENDENCY',
    RemoveDependency = 'REMOVE_DEPENDENCY',
    UpdatePackageJson = 'UPDATE_PACKAGEJSON',   // package.jsonの変更を反映させるので正しくはUpdateAsPackageJson?

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
    [Types.UpdatePackageJson]: {
        dependencies: iDependency;
    };
};

export type iDependencyActions =
    ActionMap<iDependencyActionsPayload>[keyof ActionMap<iDependencyActionsPayload>];

// Thus Error occured:
//
// Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
// 1. You might have mismatching versions of React and the renderer (such as React DOM)
// 2. You might be breaking the Rules of Hooks
// 3. You might have more than one copy of React in the same app
// See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
// const packageJson = usePackageJson();
// const packageJsonCode = JSON.parse(packageJson.getValue());

export const DependencyContext = createContext<iDependency>({});
export const DependencyDispatchContext = createContext<
    Dispatch<iDependencyActions>
>(() => null);

function dependenciesReducer(
    dependencies: iDependency,
    action: iDependencyActions
) {
    switch (action.type) {
        /**
         * Always fetches requested module even if the module is already exists.
         *
         * DON'T CASE the version of module is exist or not.
         *
         * Semantic version.
         * */
        case Types.AddDependency: {
            // DEBUG:
            console.log(`[DependencyContext] ${Types.AddDependency}`);

            const { moduleName, version } = action.payload;

            const guessedVersion = semver.valid(version)
                ? `${semver.major(version)}.${semver.minor(version)}`
                : 'latest';

            const updatedDeps = Object.assign({}, dependencies);
            updatedDeps[moduleName] = guessedVersion;

            return sortObjectByKeys(updatedDeps);
        }
        case Types.RemoveDependency: {
            const { moduleName, version } = action.payload;
            if (
                !Object.keys(dependencies).find(
                    (m) =>
                        `${m}@${dependencies[m]}` === `${moduleName}@${version}`
                )
            ) {
                throw new Error(
                    'Error: Required module that about to remove is not exist on dependencies.'
                );
            }

            // delete dependencies[moduleName];
            const updatedDeps = Object.assign({}, dependencies);
            delete updatedDeps[moduleName];

            return sortObjectByKeys(updatedDeps);
        }
        case Types.UpdatePackageJson: {
            // package.jsonの変更はそのまま反映させる
            const updatedDeps = sortObjectByKeys(action.payload.dependencies);
            Object.keys(updatedDeps).forEach(key => {
                
                const guessedVersion = semver.valid(updatedDeps[key])
                    ? `${semver.major(updatedDeps[key])}.${semver.minor(updatedDeps[key])}`
                    : 'latest';
                updatedDeps[key] = guessedVersion;
            });
            return updatedDeps;
        }
        default: {
            throw new Error('Unknown action ');
        }
    }
};

const initialDependencies: iDependency = {};

export const DependenciesProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
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
