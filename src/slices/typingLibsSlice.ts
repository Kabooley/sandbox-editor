/****************************************************************************
 * Responsible for communication with the worker that acquires the type file
 * and registers the type file to extraLibs of monaco-editor.
 *
 * NOTEs:
 * - NOTE: fetchLibs.worker.tsのインスタンスをここで維持する。メッセージのやり取りはComlinkに任せる
 * - NOTE: deleteModulesはpackage.jsonファイルを更新しない
 * - NOTE: state.requestingDependenciesは使わないことにした。代わりにworkerのキャッシュを確認するようにした。
 *
 *
 * TODOs:
 * - TODO: エラー処理
 * - TODO: Comlink.wrap(worker)で呼び出すapiのエラー処理。
 * - TODO: fetchLibs.pendingの時点でモジュールはdependenciesに加えるべきか？
 *
 * DEBUG:
 * - たぶんstackblitzでインストールすると面倒なのでmonacoをコメントアウトしている
 * *************************************************************************/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import * as Comlink from 'comlink';
import * as monaco from 'monaco-editor';
// import type { PayloadAction } from '@reduxjs/toolkit';

import type { iFetchLibsApi } from '../worker/fetchLibs.worker';

// --- Types ---

enum LoadingStatus {
    LOADING = 'loading',
    LOADED = 'loaded',
    IDLE = 'idle',
    FAILED = 'failed',
}

export interface iDependency {
    moduleName: string;
    version: string;
    state: LoadingStatus.LOADING | LoadingStatus.LOADED | LoadingStatus.FAILED;
    devDependency: boolean;
}

interface iRequestingDependency extends iDependency {
    existVersion?: string;
}

interface iState {
    dependencies: iDependency[];
    snapshot: string;
    requestingDependencies: iRequestingDependency[];
}

interface ModuleAndVersion {
    moduleName: string;
    version: string;
    devDependency: boolean;
}

// --- definitions --

const packageJsonNecessary = `
       {
         "name": "empty package json template",
         "version": "0.0.0",
         "private": false,
         "dependencies": {},
         "scripts": {},
         "devDependencies": {}
       }
       `;

const initialState: iState = {
    dependencies: [],
    snapshot: packageJsonNecessary,
    requestingDependencies: [],
};

/***
 * stores pair of fetched moudleName and its monaco disposable for cache purpose.
 **/
const typingLibs = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();

/***
 * NOTE: vite環境ではwebpack環境と異なるcomlinkの生成方法となる
 * webpackの場合：
 * */
const worker = new Worker(
    new URL('../worker/fetchLibs.worker.ts', import.meta.url),
    { type: 'module' }
);
// Stackblitz asshole don't understand this comlink instance
const api: Comlink.Remote<iFetchLibsApi> = Comlink.wrap<iFetchLibsApi>(worker);

// --- helpers ---

/***
 * Register path and code to monaco.language.[type|java]script addExtraLibs.
 * Reset code if passed path has already been registered.
 * */
const addExtraLibs = (code: string, path: string) => {
    const cachedLib = typingLibs.get(path);
    if (cachedLib) {
        cachedLib.js.dispose();
        cachedLib.ts.dispose();
    }
    // Monaco Uri parsing contains a bug which escapes characters unwantedly.
    // This causes package-names such as `@expo/vector-icons` to not work.
    // https://github.com/Microsoft/monaco-editor/issues/1375
    let uri = monaco.Uri.from({
        scheme: 'file',
        path: path,
    }).toString();
    if (path.includes('@')) {
        uri = uri.replace('%40', '@');
    }

    const js = monaco.languages.typescript.javascriptDefaults.addExtraLib(
        code,
        uri
    );
    const ts = monaco.languages.typescript.typescriptDefaults.addExtraLib(
        code,
        uri
    );
    typingLibs.set(path, { js, ts });
};

/***
 * Dispose the file matching the argument path from monaco extraLibs.
 *
 * @param {string} path - File's path to be disposed.
 * */
const removeExtraLibs = (path: string) => {
    const cachedLib = typingLibs.get(path);
    if (cachedLib) {
        cachedLib.js.dispose();
        cachedLib.ts.dispose();
    }
};

/***
 * Call this when app unmount.
 * */
export const terminateFetchLibsWorker = () => {
    api[Comlink.releaseProxy]();
    worker.terminate();
};

/***
 * 現在のtypingLibsSlice.state.dependenciesの
 * 各モジュールに対してfetchModule()を行う。
 * まるで`npm install`するような処理である
 * */
const fetchCurrentDependencies = (dependencies: iDependency[]) => {
    return Promise.all([
        ...dependencies.map((dep) =>
            api.getCachedModule(dep.moduleName, dep.version)
        ),
    ]);
};

// --- Redux logics ---

/****
 * @param {string} moduleName - Requested moudle's name
 * @param {string} version - and its version.
 *
 * - Returns cached module if already exists.
 * - Fetch requested module if not cached.
 *
 * */
export const fetchModule = createAsyncThunk(
    'typingLibs/fetchModule',
    async ({ moduleName, version, devDependency }: ModuleAndVersion) => {
        return api
            .isAlreadyExist(moduleName, version)
            .then((isExist: boolean) => {
                if (isExist) {
                    // response.vfs: Map<path, code> --> vfs: [path, code][]
                    return api
                        .getCachedModule(moduleName, version)
                        .then(
                            (response: {
                                moduleName: string;
                                version: string;
                                vfs: Map<string, string>;
                            }) => ({
                                moduleName: response.moduleName,
                                version: response.version,
                                vfs: Array.from(response.vfs.entries()),
                                devDependency,
                            })
                        );
                } else {
                    // response.vfs: Map<path, code> --> vfs: [path, code][]
                    return api
                        .fetchLibs(moduleName, version)
                        .then(
                            (response: {
                                moduleName: string;
                                version: string;
                                vfs: Map<string, string>;
                            }) => ({
                                moduleName: response.moduleName,
                                version: response.version,
                                vfs: Array.from(response.vfs.entries()),
                                devDependency,
                            })
                        );
                }
            });
    }
);

/****
 * 同名別バージョンがダウンロード済の場合、extraLibsから該当の方ファイルを削除し、
 *
 * @param {string} moduleName - Requested moudle's name
 * @param {string} version - and its version.
 * @param {string} prevVersion - Previous version.
 *
 * - Returns cached module if already exists.
 * - Fetch requested module if not cached.
 *
 * */
export const fetchAnotherVersionModule = createAsyncThunk(
    'typingLibs/fetchModule',
    async ({
        moduleName,
        version,
        prevVersion,
        devDependency,
    }: {
        moduleName: string;
        version: string;
        prevVersion: string;
        devDependency: boolean;
    }) => {
        const isCached = await api.isAlreadyExist(moduleName, version);
        // const isPrevCached = await api.isAlreadyExist(moduleName, prevVersion);

        // リクエストバージョンがキャッシュ済の場合
        if (isCached) {
            return api
                .getCachedModule(moduleName, version)
                .then(
                    (response: {
                        moduleName: string;
                        version: string;
                        vfs: Map<string, string>;
                    }) => ({
                        moduleName: response.moduleName,
                        version: response.version,
                        vfs: Array.from(response.vfs.entries()),
                        devDependency,
                    })
                );
        }
        // 新規取得
        else {
            return api
                .fetchLibs(moduleName, version)
                .then(
                    (response: {
                        moduleName: string;
                        version: string;
                        vfs: Map<string, string>;
                    }) => ({
                        moduleName: response.moduleName,
                        version: response.version,
                        vfs: Array.from(response.vfs.entries()),
                        devDependency,
                    })
                );
        }
    }
);

/***
 * Remove module's dependencies from monaco extraLibs as if uninstall the module.
 *
 * Retrieves the set of dependencies corresponding to the module name
 * from the cache and passes the path of the set to removeExtraLibs.
 *
 * @param {Array<ModuleAndVersion>} deletionModules - Modules requested to be deleted.
 * @returns {Array<string>} - Deleted module's dependencies path.
 *
 * */
export const removeModules = createAsyncThunk(
    'typingLibs/removeModules',
    async (deletionModules: ModuleAndVersion[], thunkAPI) => {
        let deletedDependencies: string[] = [];
        return (
            Promise.all([
                // 削除リクエストのモジュールの依存関係をmonaco extraLibsから削除
                ...deletionModules.map((d) =>
                    api
                        .getModuleDependenciesPath(d.moduleName, d.version)
                        .then((paths: string[]) => {
                            deletedDependencies = [
                                ...deletedDependencies,
                                ...paths,
                            ];
                            paths.forEach((path) => removeExtraLibs(path));
                        })
                ),
            ])
                // 残ったdependenciesの依存関係ファイルの再取得し...
                .then(() => {
                    const { typingLibs } = thunkAPI.getState() as RootState;
                    const deletionModulesName = deletionModules.map(
                        (dm) => dm.moduleName
                    );
                    const updatedDeps = typingLibs.dependencies.filter(
                        (dep) => !deletionModulesName.includes(dep.moduleName)
                    );
                    return fetchCurrentDependencies(updatedDeps);
                })
                // monaco extraLibsを更新する
                // 削除したモジュールの依存関係のパスを返す
                .then((vfss) => {
                    vfss.forEach((v) => {
                        for (const [path, code] of v.vfs.entries()) {
                            addExtraLibs(code, path);
                        }
                    });
                    return deletedDependencies;
                })
        );
    }
);

const typingLibsSlice = createSlice({
    name: 'typingLibs',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchModule.pending, (state, action) => {
                const { moduleName, version, devDependency } = action.meta.arg;
                const exist = state.dependencies.find(
                    (d) => d.moduleName === moduleName
                );
                if (exist !== undefined) {
                    exist.state = LoadingStatus.LOADING;
                } else {
                    state.dependencies.push({
                        moduleName,
                        version,
                        state: LoadingStatus.LOADING,
                        devDependency,
                    });
                }
            })
            .addCase(fetchModule.fulfilled, (state, action) => {
                const { moduleName, version, vfs } = action.payload;
                const isAlreadyExist =
                    state.dependencies.find(
                        (dep) => dep.moduleName === moduleName
                    ) === undefined
                        ? false
                        : true;
                // 既存モジュール別バージョンなら既存バージョンを上書き
                if (isAlreadyExist) {
                    state.dependencies = state.dependencies.filter(
                        (d) => d.moduleName !== moduleName
                    );
                }
                state.dependencies.push({
                    moduleName,
                    version,
                    state: LoadingStatus.LOADED,
                    devDependency: action.meta.arg.devDependency,
                });
                vfs.forEach(([path, code]) => {
                    addExtraLibs(code, path);
                });
            })
            .addCase(fetchModule.rejected, (state, action) => {
                const module = state.dependencies.find(
                    (d) => d.moduleName === action.meta.arg.moduleName
                );
                if (module !== undefined) {
                    module.state = LoadingStatus.FAILED;
                }
            });
        builder
            // .addCase(removeModules.pending, () => {
            //     console.log('[typingLibsSlice] deleting modules...');
            // })
            .addCase(removeModules.fulfilled, (state, action) => {
                const deletionFiles = action.meta.arg.map((d) => d.moduleName);
                // Delete deletion modules from state.dependencies.
                // https://stackoverflow.com/a/33034768/22007575
                state.dependencies = state.dependencies.filter(
                    (dep) => !deletionFiles.includes(dep.moduleName)
                );
            })
            .addCase(removeModules.rejected, (state, action) => {
                // errorが起こりえない気がする
                console.error(action.error);
            });
    },
});

export const typingLibsActions = typingLibsSlice.actions;
export const selectTypingLibs = (state: RootState) => state.typingLibs;
export default typingLibsSlice.reducer;
