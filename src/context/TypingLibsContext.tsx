/******************************************************************
 * TypingLibsContext.tsx
 *
 * `dependencies`と`requestFetchTypings`の２つを提供するcontext。
 * reducerは使わない。
 *
 * - TODO: typingLibsの更新は再レンダリングを起こすか？typingLIbsの最新情報を常に提供できるか？
 * - TODO: キャッシュ機能の見直し。
 * - TODO: requestFetchTypings()は毎度新規に生成されている（再レンダリングをひきおこしている）か確認。useCallbackで出力した方がいいか。
 * - TODO: DependencyListとの連携として、DependencyListでリスト一覧からモジュールを削除できる機能を実装したいので、それをどうやって連携させるか。
 * - TODO: DependencyListとの連携として、インストール済のライブラリをリクエストされたときにDependencyList側に「インストール済」であるメッセージを表示させたいので、それをどうやって実現させるか。
 *
 * - NOTE: window eventが発生してもReactは更新が起こらない。そのため`message`イベントハンドラはReactの更新のたびに「付け替え」なくてはならない。
 *      https://stackoverflow.com/questions/60540985/react-usestate-doesnt-update-in-window-events
 * ****************************************************************/
import * as monaco from 'monaco-editor';
import React, {
    createContext,
    useState,
    useEffect,
    useRef,
    useContext,
} from 'react';
import {
    isSameShallowObject,
    getDiffOfTwoShallowObjects,
    sortPropertiesByKey,
    getValidSemver,
} from '../utils';
import {
    useFiles,
    useFilesDispatch,
    Types as FilesActionTypes,
} from './FilesContext';
import type { iRequestFetchLibs, iResponseFetchLibs } from '../worker/types';

type iTypingLibsContext = iDependencyState[];
type iCommandContext = (
    order: 'request' | 'remove',
    moduleName: string,
    version: string
) => void;

type iTypingLibs = Map<
    string,
    {
        js: monaco.IDisposable;
        ts: monaco.IDisposable;
    }
>;

interface iProps {
    // Set `any` instead `React.ReactChildren`
    // according to https://github.com/microsoft/TypeScript/issues/6471
    children: any;
}

interface iDependencyState {
    moduleName: string;
    version: string;
    state: 'loading' | 'loaded';
}
interface iRequestingDependency extends iDependencyState {
    existVersion?: string;
}

const $FiveSec = 5000;
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
const TypingLibsDependenciesContext = createContext<iTypingLibsContext>([]);
const TypingLibsCommandContext = createContext<iCommandContext>(() => null);

const TypingLibsProvider: React.FC<iProps> = ({ children }) => {
    const [dependencies, setDependencies] = useState<iDependencyState[]>([]);
    /***
     * Map of typing Libraries.
     * Manually synchronize registered libraries with monaco extraLibs.
     * */
    const typingLibs = useRef<iTypingLibs>(
        new Map<string, { js: monaco.IDisposable; ts: monaco.IDisposable }>()
    );
    /***
     * Library paths related to requested module and
     * requested module name pair will be registered.
     * */
    const setOfDependency = useRef<Map<string, string[]>>(
        new Map<string, string[]>()
    );
    /***
     * worker instance.
     * */
    const agent = useRef<Worker>();

    const files = useFiles();
    const dispatchFilesAction = useFilesDispatch();
    const _packageJson = files.find((f) => f.getPath() === 'package.json');
    const packageJson =
        _packageJson !== undefined
            ? _packageJson.getValue()
            : packageJsonNecessary;
    // Saves previous packageJson string
    const [snapshot, setSnapshot] = useState<string>(packageJsonNecessary);
    // Dependency requested to be fetched will be added.
    const [requestingDependencies, setRequestingDependencies] = useState<
        iRequestingDependency[]
    >([]);

    // Activate worker.
    useEffect(() => {
        if (window.Worker && agent.current === undefined) {
            agent.current = new Worker(
                new URL('/src/worker/fetchLibs.worker.ts', import.meta.url),
                { type: 'module' }
            );
            agent.current.addEventListener('message', handleWorkerMessage);
        }

        return () => {
            if (window.Worker && agent.current) {
                agent.current.removeEventListener(
                    'message',
                    handleWorkerMessage
                );
                agent.current.terminate();
                agent.current = undefined;
            }
        };
    }, []);

    /***
     * NOTE: SUPER IMPORTANT to reattatch event listener
     * for referencing latest reactives.
     * Not doing this, worker always references stale state.
     *
     * https://www.reddit.com/r/reactjs/comments/v9csv5/react_usestate_hooks_state_not_ready_after/
     * */
    useEffect(() => {
        if (window.Worker && agent.current !== undefined) {
            agent.current.addEventListener('message', handleWorkerMessage);
        }
        return () => {
            if (window.Worker && agent.current !== undefined) {
                agent.current.removeEventListener(
                    'message',
                    handleWorkerMessage
                );
            }
        };
        // NOTE: 依存関係にはhandleWorkerMessageで参照するすべてのReactiveな値を含める
    }, [
        dependencies,
        requestingDependencies,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        reflectToPackageJson,
    ]);

    /***
     * package.jsonファイルの変更内容を読取り、変更内容に応じて依存関係を更新する。
     *
     *
     * */
    useEffect(() => {
        // console.log('[TypingLibsContext] Updated packageJson');
        // console.log(packageJson);

        const timer = setTimeout(() => {
            const { deleted, created, modifiedVal } = getDiffOfPackageJson();
            if (deleted.length) {
                deleted.forEach((d) => {
                    const key = Object.keys(d)[0];

                    // console.log(`[TypingLibsContext] Delete ${key}@${d[key]}`);

                    removeLibrary(key, d[key]);
                });
            }
            if (created.length) {
                created.forEach((d) => {
                    const key = Object.keys(d)[0];

                    // console.log(`[TypingLibsContext] Fetch ${key}@${d[key]}`);

                    requestFetchTypings(key, d[key]);
                });
            }
            if (modifiedVal.length) {
                modifiedVal.forEach((d) => {
                    const key = Object.keys(d)[0];
                    const { prev, current } = d[key];

                    // console.log(
                    //     `[TypingLibsContext] modified. ${key}@${prev} --> ${key}@${current}`
                    // );

                    requestFetchTypings(key, current);
                });
            }
            // NOTE: 必ずsnapshotをとること
            setSnapshot(packageJson);
        }, $FiveSec);

        return () => clearTimeout(timer);
    }, [packageJson]);

    // // DEBUG:
    // useEffect(() => {
    //     console.log('[TypingLibsContext] did update.');
    //     console.log(dependencies);
    //     console.log(requestingDependencies);
    //     console.log(setOfDependency);
    //     console.log(
    //         monaco.languages.typescript.typescriptDefaults.getExtraLibs()
    //     );
    // });

    /**
     * Callback of onmessage event with agent worker.
     *
     * NOTE: 既存依存関係が存在するが別バージョンをリクエストされていた時、そのリクエストが失敗した場合に備えて既存依存関係を再度リクエストする処理を行う。
     * */
    const handleWorkerMessage = (e: MessageEvent<iResponseFetchLibs>) => {
        const { payload, error } = e.data;
        const { moduleName, version, depsMap } = payload;
        const isFailed = error !== undefined;
        const isAlreadyExists = dependencies.find(
            (dep) => dep.moduleName === moduleName
        );
        // const requestedDependency = requestingDependencies.find(
        //     (rd) => rd.moduleName === moduleName
        // );

        // console.log(
        //     `[TypingLibsContext][handleWorkerMessage] Response of ${moduleName}@${version}`
        // );
        // console.log(requestingDependencies);

        // // 依存関係取得失敗したけど、既存バージョンが存在する場合：
        // // 既存バージョンの再取得をリクエストする
        // if (isFailed && requestedDependency?.existVersion !== undefined) {
        //     console.log(
        //         `[TypingLibsContext][handleWorkerMessage] Failed to fetch ${moduleName}@${version}. Re request ${moduleName}@${requestedDependency?.existVersion}.`
        //     );

        //     setRequestingDependencies(
        //         requestingDependencies.filter(
        //             (d) => d.moduleName !== moduleName
        //         )
        //     );
        //     requestFetchTypings(
        //         moduleName,
        //         requestedDependency?.existVersion,
        //         true
        //     );
        //     return;
        // }
        // // 新規取得が失敗した場合：
        // else if (isFailed && requestedDependency === undefined) {
        //     console.log(
        //         `[TypingLibsContext][handleWorkerMessage] Failed to fetch ${moduleName}@${version}.`
        //     );
        //     setRequestingDependencies(
        //         requestingDependencies.filter(
        //             (d) => d.moduleName !== moduleName
        //         )
        //     );
        //     return;
        // }

        if (isFailed) {
            // console.log(
            //     `[TypingLibsContext][handleWorkerMessage] Failed to install ${moduleName}@${version}`
            // );

            setRequestingDependencies(
                requestingDependencies.filter(
                    (d) => d.moduleName !== moduleName
                )
            );
            reflectToPackageJson(dependencies);
            return;
        }
        // 取得成功の場合:
        else {
            // console.log(
            //     `[TypingLibsContext][handleWorkerMessage] Succeeded to install ${moduleName}@${version}`
            // );

            let updatedDependencies: iDependencyState[] = [];
            // 同名別バージョンがインストールされた場合
            // 上書きする
            if (isAlreadyExists) {
                const d = dependencies.filter(
                    (dep) => dep.moduleName !== moduleName
                );
                updatedDependencies = [
                    ...d,
                    {
                        moduleName: moduleName,
                        version: version,
                        state: 'loaded',
                    },
                ];
            }
            // 新規がインストールされた場合
            // 追加する
            else {
                updatedDependencies = [
                    ...dependencies,
                    {
                        moduleName: moduleName,
                        version: version,
                        state: 'loaded',
                    },
                ];
            }
            setRequestingDependencies(
                requestingDependencies.filter(
                    (d) => d.moduleName !== moduleName
                )
            );
            setDependencies([...updatedDependencies]);
            // NOTE: この呼出時点でまだsetDependencies()の反映が完了していない
            // そのため更新されたdependenciesを必ず渡すこと
            reflectToPackageJson(updatedDependencies);

            // --- update monaco-editor addExtraLibs, TypingLibs ---
            // Register type def files to monaco addXtraLibs
            // key: /node_modules/typescript/lib/lib.webworker.iterable.d.ts
            // value: its file's code
            const paths: string[] = [];
            depsMap.forEach((value, key) => {
                addExtraLibs(value, key);
                paths.push(key);
            });
            // --- update setOfDependencies ---
            // Save depsMap paths with the moduleName.
            if (setOfDependency.current !== undefined) {
                setOfDependency.current.set(`${moduleName}@${version}`, paths);
            }
        }
    };

    /**
     * ProviderProps value of iCommandContext.
     *
     * @param {string} moduleName - Dependency name for which downloads are requested.
     * @param {string} version - Dependency version for which downloads are requested
     *
     * `moduleName`@`version`がキャッシュ済ではないかthis.dependenciesを確認する。
     * キャッシュ済、かつstate: 'loaded'である場合はそのままreturnする。
     * キャッシュされていない、または同名別バージョンモジュールでもstate: 'failed`ならば新規取得する。
     *
     * TODO: キャッシュは実際には`fetchDependency`が管理するIndexedDBの方で行っているのでこちらでキャッシュ済判断すべきでないかも
     * TODO: `forced`が機能しているか検証。forcedが指定された場合必ずリクエストする
     * */
    const requestFetchTypings = (moduleName: string, version: string) => {
        if (agent.current !== undefined) {
            let validVersion = getValidSemver(version);
            if (!validVersion) validVersion = 'latest';

            const cachedSameNameSameVersion = dependencies.find((deps) => {
                const operand1 = (deps.moduleName + deps.version).toLowerCase();
                const operand2 = (moduleName + validVersion).toLowerCase();

                if (operand1.localeCompare(operand2) === 0) return true;
                else return false;
            });

            const isLoading = requestingDependencies.find((deps) => {
                const operand1 = (deps.moduleName + deps.version).toLowerCase();
                const operand2 = (moduleName + validVersion).toLowerCase();

                if (operand1.localeCompare(operand2) === 0) return true;
                else return false;
            });

            const existAnotherVersion = dependencies.find((dep) => {
                return dep.moduleName === moduleName && dep.version !== version;
            });

            // console.log(
            //     `[TypingLibsContext][requestFetchTypings] requested ${moduleName}@${validVersion}.`
            // );

            // 同名同バージョンがローディング中の場合戻る
            if (isLoading !== undefined) {
                // console.log(
                //     `[TypingLibsContext][requestFetchTypings] ${moduleName}@${validVersion} is now loading.`
                // );
                return;
            }
            // 同名同バージョンがキャッシュされていた場合戻る
            if (
                cachedSameNameSameVersion !== undefined &&
                cachedSameNameSameVersion.state === 'loaded'
            ) {
                // console.log(
                //     `[TypingLibsContext][requestFetchTypings] ${moduleName}@${validVersion} is already exist.`
                // );
                return;
            }

            // - 同名同バージョンが`failed`だった場合改めて取得
            // - 同名別バージョンがキャッシュされていた場合改めて取得
            // - 新規リクエストの場合取得
            setRequestingDependencies([
                ...requestingDependencies,
                {
                    moduleName: moduleName,
                    version: validVersion,
                    state: 'loading',
                    existVersion:
                        existAnotherVersion !== undefined
                            ? existAnotherVersion.version
                            : undefined,
                },
            ]);

            agent.current!.postMessage({
                order: 'RESOLVE_DEPENDENCY',
                payload: {
                    moduleName: moduleName,
                    version: validVersion,
                },
            } as iRequestFetchLibs);
        }
    };

    /***
     * Register path and code to monaco.language.[type|java]script addExtraLibs.
     * Reset code if passed path has already been registered.
     * */
    const addExtraLibs = (code: string, path: string) => {
        // console.log(`[TypingLibsContext] Add extra Library: ${path}`);

        const cachedLib = typingLibs.current.get(path);
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
        typingLibs.current.set(path, { js, ts });
    };

    /***
     * Remove all libraries from monaco language service defaults.
     * */
    const removeLibrary = (moduleName: string, version: string) => {
        if (setOfDependency.current.has(`${moduleName}@${version}`)) {
            // console.log(
            //     `[TypingLibsContext] delete ${moduleName}@${version} related libraries`
            // );

            const paths = setOfDependency.current.get(
                `${moduleName}@${version}`
            );
            paths?.forEach((path) => {
                const cachedLib = typingLibs.current.get(path);
                if (cachedLib) {
                    cachedLib.js.dispose();
                    cachedLib.ts.dispose();
                }
            });
            setOfDependency.current.delete(`${moduleName}@${version}`);
        }
        setDependencies([
            ...dependencies.filter((dep) => dep.moduleName !== moduleName),
        ]);
    };

    /***
     * Reducerのdispatchのようなもの。
     * 複数メソッドをproviderのvalueとして渡したいけれど
     * やたらcontextを作成するのは嫌、
     * 関数をプロパティとしたオブジェクトを渡すのも嫌なので
     * かわりにコマンドを受け付けてコマンドに応じた関数を呼び出す関数を渡すことにする
     * */
    const command = (
        order: 'request' | 'remove',
        moduleName: string,
        version: string
    ) => {
        switch (order) {
            case 'request': {
                return requestFetchTypings(moduleName, version);
            }
            case 'remove':
                {
                    return removeLibrary(moduleName, version);
                }
                defualt: {
                    return;
                }
        }
    };

    /***
     * `packageJson`と`snapshot`の`dependencies`と`devDependencies`の差分内容を返す。
     *
     * JSONファイルを編集中の内容を常に監視する必要があるため、
     * 編集途中の状況を想定してJSONとしてinvalidな状態のままの値を受け取ることを念頭に置かなくてはならない
     *
     * そのため、
     * - JSON.parseがエラーを返す場合はreturnする。
     * - 依存関係のバージョン、名前がおかしい場合はチェックしない（できない）。
     *   この場合については実際にfetchする段階でエラーが発生するはずなのでその時点でユーザが気づけばよいとする。
     * */
    const getDiffOfPackageJson = () => {
        try {
            // console.log(
            //     '[TypingLibsContext][getDiffOfPackageJson] Getting diffs of package.json...'
            // );

            // JSON構文エラーだとこのままcatchブロックへ移動する。
            const { dependencies, devDependencies } = JSON.parse(packageJson);
            const previous = JSON.parse(snapshot);

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

                // console.log(dependenciesDiff);
                // console.log(devDependenciesDiff);

                return {
                    deleted: dependenciesDiff.deleted.concat(
                        devDependenciesDiff.deleted
                    ),
                    created: dependenciesDiff.created.concat(
                        devDependenciesDiff.created
                    ),
                    modifiedVal: dependenciesDiff.modifiedVal.concat(
                        devDependenciesDiff.modifiedVal
                    ),
                };
            } else {
                return {
                    deleted: [],
                    created: [],
                    modifiedVal: [],
                };
            }
        } catch (e) {
            console.error(e);
            return {
                deleted: [],
                created: [],
                modifiedVal: [],
            };
        }
    };

    /***
     * 引数`_dependencies`の通りにpackage.jsonを更新する
     *
     * TODO: `dependencies`と`devDependencies`の区別がついていないからdevDependenciesのものが更新後にpackage.jsonのdependenciesに入る。どうする?
     * */
    const reflectToPackageJson = (_dependencies: iDependencyState[]) => {
        try {
            // console.log(
            //     '[TypingLibsContext][reflectToPackageJson] reflecting...'
            // );
            // console.log(_dependencies);
            // console.log(dependencies);

            const currentPackageJson = JSON.parse(packageJson);

            const __dependencies: Record<string, string> = {};
            _dependencies.forEach((rd) => {
                __dependencies[rd.moduleName] = rd.version;
            });

            const devDependencies: Record<string, string> = {};

            const updatedPackageJson = {
                ...currentPackageJson,
                dependencies: sortPropertiesByKey(__dependencies),
                devDependencies: sortPropertiesByKey(devDependencies),
            };

            // setPackageJson(JSON.stringify(updatedPackageJson, null, 2));
            const packageJsonString = JSON.stringify(
                updatedPackageJson,
                null,
                2
            );

            // console.log('[TypingLibsContext][reflectToPackageJson] reflect:');
            // console.log(packageJsonString);

            dispatchFilesAction({
                type: FilesActionTypes.Change,
                payload: {
                    targetFilePath: 'package.json',
                    changeProp: {
                        newValue: packageJsonString,
                    },
                },
            });
            setSnapshot(packageJsonString);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <TypingLibsDependenciesContext.Provider value={dependencies}>
            <TypingLibsCommandContext.Provider value={command}>
                {children}
            </TypingLibsCommandContext.Provider>
        </TypingLibsDependenciesContext.Provider>
    );
};

// --- Hooks ---
function useDependencies() {
    return useContext(TypingLibsDependenciesContext);
}

function useCommand() {
    return useContext(TypingLibsCommandContext);
}

export {
    TypingLibsProvider,
    useDependencies,
    useCommand,
    // types
    iDependencyState,
};
