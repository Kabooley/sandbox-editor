import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
    isSameShallowObject,
    getDiffOfTwoShallowObjects,
    sortPropertiesByKey,
} from '../utils';
import {
    fetchModule,
    removeModules,
    fetchAnotherVersionModule,
} from './typingLibsSlice';
import { filesActions } from './filesSlice';

// -- types --

interface iState {
    snapshot: string;
    updatingDependencies: boolean;
    reflectingDependencies: boolean;
}

interface iPackageJsonProps {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
}

// -- definitions --

const packageJsonTemplate = `{
  "name": "react-typescript",
  "version": "1.0.0",
  "description": "React and TypeScript example starter project",
  "keywords": [
    "typescript",
    "react",
    "starter"
  ],
  "main": "src/index.tsx",
  "dependencies": {
  },
  "devDependencies": {
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  },
  "browserslist": [
    ">0.2%",
    "not dead",
    "not ie <= 11",
    "not op_mini all"
  ]
}`;

const initialState: iState = {
    snapshot: packageJsonTemplate,
    updatingDependencies: false,
    reflectingDependencies: false,
};

/***
 * Detect differences in package.json and reflect the differences in typingLibsSlice.
 *
 * Get the difference dependencies between the snapshot and package.json,
 * and dispatch the typingLibsSlice actions according to the each difference contents.
 *
 *    e.g. deleted dependencies found from differences
 *        --> dispatch(removeModules(deletedDependencies)).
 *
 * @param {string} packageJsonFile - package.json value from files.
 * @returns - Returns the Promise when all promise actions are completed
 *            so that the caller of this action can make then() call.
 *
 * */
export const updatePackageJson = createAsyncThunk(
    'packagejson/update',
    async (packageJsonFile: string, thunkAPI) => {
        try {
            // JSON構文エラーだとこのままcatchブロックへ移動する。
            const { dependencies, devDependencies } = JSON.parse(
                packageJsonFile
            ) as iPackageJsonProps;
            const { packageJson } = thunkAPI.getState() as RootState;
            const previous = JSON.parse(
                packageJson.snapshot
            ) as iPackageJsonProps;

            if (
                !isSameShallowObject(dependencies, previous.dependencies) ||
                !isSameShallowObject(devDependencies, previous.devDependencies)
            ) {
                const dependenciesDiff = getDiffOfTwoShallowObjects(
                    dependencies,
                    previous.dependencies
                );
                const devDependenciesDiff = getDiffOfTwoShallowObjects(
                    devDependencies,
                    previous.devDependencies
                );

                const deletionsDep = dependenciesDiff.deleted.map((d) => {
                    const key = Object.keys(d)[0];
                    return {
                        moduleName: key,
                        version: d[key],
                        devDependency: false,
                    };
                });
                const deletionsDev = devDependenciesDiff.deleted.map((d) => {
                    const key = Object.keys(d)[0];
                    return {
                        moduleName: key,
                        version: d[key],
                        devDependency: true,
                    };
                });
                const modifiedDep = dependenciesDiff.modifiedVal.map((d) => {
                    const key = Object.keys(d)[0];
                    return {
                        moduleName: key,
                        version: d[key].current,
                        prevVersion: d[key].prev,
                        devDependency: false,
                    };
                });
                const modifiedDev = devDependenciesDiff.modifiedVal.map((d) => {
                    const key = Object.keys(d)[0];
                    return {
                        moduleName: key,
                        version: d[key].current,
                        prevVersion: d[key].prev,
                        devDependency: true,
                    };
                });
                const createdDep = dependenciesDiff.created.map((d) => {
                    const key = Object.keys(d)[0];
                    return {
                        moduleName: key,
                        version: d[key],
                        devDependency: false,
                    };
                });
                const createdDev = devDependenciesDiff.created.map((d) => {
                    const key = Object.keys(d)[0];
                    return {
                        moduleName: key,
                        version: d[key],
                        devDependency: true,
                    };
                });

                return Promise.all([
                    thunkAPI.dispatch(
                        removeModules(deletionsDep.concat(deletionsDev))
                    ),
                    ...createdDep
                        .concat(createdDev)
                        .map((nd) => thunkAPI.dispatch(fetchModule(nd))),
                    ...modifiedDep.concat(modifiedDev).map((m) =>
                        thunkAPI.dispatch(
                            fetchAnotherVersionModule({
                                moduleName: m.moduleName,
                                version: m.version,
                                prevVersion: m.prevVersion,
                                devDependency: m.devDependency,
                            })
                        )
                    ),
                    thunkAPI.dispatch(
                        packageJsonActions.setSnapshot(packageJsonFile)
                    ),
                ]);
            }
        } catch (e) {
            throw e;
            // // json.parse中のエラーの場合、
            // if (e instanceof SyntaxError) {
            //   throw e;
            // } else {
            //   throw e;
            // }
        }
    }
);

/***
 * NOTE: This method should be invoked everytime typingLibsSclie.dependencies has been updated.
 *
 * typingLibs.state.dependenciesをもとにfilesのpackage.jsonファイルの`dependencies`を更新する
 *
 * e.g.
 * dispatch(typingLibsSlice.removeModules()).unwrap().then(() => reflectDependenciesToPackageJson())のように。
 * */
export const reflectDependenciesToPackageJson = createAsyncThunk(
    'packagejson/reflect',
    async (arg, thunkAPI) => {
        const { typingLibs, files } = thunkAPI.getState() as RootState;
        const newDependencies = typingLibs.dependencies
            .filter((dep) => dep.state === 'loaded')
            .map((d) => ({
                moduleName: d.moduleName,
                version: d.version,
                devDependency: d.devDependency,
            }));
        const packageJsonFile = files.files.find(
            (f) => f.path === 'package.json'
        );
        if (packageJsonFile === undefined) {
            throw new Error(
                'Something went wrong. Cannot find package.json file.'
            );
        }

        try {
            const parsed = JSON.parse(packageJsonFile!.value);
            const devDependencies: Record<string, string> = {};
            const dependencies: Record<string, string> = {};
            newDependencies.forEach((nd) => {
                if (nd.devDependency) {
                    devDependencies[nd.moduleName] = nd.version;
                } else {
                    dependencies[nd.moduleName] = nd.version;
                }
            });
            const updated = {
                ...parsed,
                dependencies: sortPropertiesByKey(dependencies),
                devDependencies: sortPropertiesByKey(devDependencies),
            };
            const updatedPackageJson = JSON.stringify(updated, null, 2);
            await thunkAPI.dispatch(
                filesActions.changeFile({
                    targetFilePath: 'package.json',
                    changeProp: { newValue: updatedPackageJson },
                })
            );
            return updatedPackageJson;
        } catch (e) {
            throw e;
        }
    }
);

const packageJsonSlice = createSlice({
    name: 'packagejson',
    initialState,
    reducers: {
        setSnapshot: (state, action: PayloadAction<string>) => {
            state.snapshot = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updatePackageJson.pending, (state) => {
                state.updatingDependencies = true;
            })
            .addCase(updatePackageJson.fulfilled, (state) => {
                state.updatingDependencies = false;
            })
            .addCase(updatePackageJson.rejected, (state, action) => {
                state.updatingDependencies = false;
                console.error(action.error.message);
            });
        builder
            .addCase(reflectDependenciesToPackageJson.pending, (state) => {
                state.reflectingDependencies = true;
            })
            .addCase(
                reflectDependenciesToPackageJson.fulfilled,
                (state, action) => {
                    state.snapshot = action.payload;
                    state.reflectingDependencies = false;
                }
            )
            .addCase(
                reflectDependenciesToPackageJson.rejected,
                (state, action) => {
                    console.error(action.error.message);
                    state.reflectingDependencies = false;
                }
            );
    },
});

export const packageJsonActions = packageJsonSlice.actions;
export const selectPackageJson = (state: RootState) => state.packageJson;
export default packageJsonSlice.reducer;
