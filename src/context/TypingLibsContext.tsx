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
    const relatedLibs = useRef<Map<string, string[]>>(
        new Map<string, string[]>()
    );
    /***
     * worker instance.
     * */
    const agent = useRef<Worker>();

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

    // Update worker to synchronous updated Reactives.
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
    }, [dependencies]);

    // DEBUG:
    useEffect(() => {
        if (relatedLibs.current.size) {
            // DEBUG:
            console.log('[TypingLibsContext] did update. current relatedLibs:');
            for (const [key, value] of relatedLibs.current.entries()) {
                console.log(`${key}:`);
                console.log(value);
            }
        }

        console.log(
            // {[path: string]: { content: string }}
            monaco.languages.typescript.typescriptDefaults.getExtraLibs()
        );
    });

    /**
     * Callback of onmessage event with agent worker.
     * */
    const handleWorkerMessage = (e: MessageEvent<iResponseFetchLibs>) => {
        const { error } = e.data;
        if (error) {
            console.error(error);
            // ひとまず
            return;
        }
        const { depsMap, moduleName, version } = e.data.payload;
        const moduleLists = dependencies.map((deps) => deps.moduleName);
        const index = moduleLists.indexOf(moduleName);

        if (index > -1) {
            const updatedDeps = dependencies.filter(
                (deps: iDependencyState, _index: number) => _index !== index
            );
            setDependencies([
                ...updatedDeps,
                {
                    moduleName: moduleName,
                    version: version,
                    state: 'loaded',
                },
            ]);
        } else {
            setDependencies([
                ...dependencies,
                {
                    moduleName: moduleName,
                    version: version,
                    state: 'loaded',
                },
            ]);
        }

        // Register type def files to monaco addXtraLibs
        // key: /node_modules/typescript/lib/lib.webworker.iterable.d.ts
        // value: its file's code
        const paths: string[] = [];
        depsMap.forEach((value, key) => {
            addExtraLibs(value, key);
            paths.push(key);
        });
        // Save depsMap paths with the moduleName.
        if (relatedLibs.current !== undefined) {
            relatedLibs.current.set(`${moduleName}@${version}`, paths);
        }
    };

    /**
     * ProviderProps value of iCommandContext.
     *
     * @param {string} moduleName -
     * @param {string} version -
     *
     * */
    const requestFetchTypings = (moduleName: string, version: string) => {
        const isCached = dependencies.find((deps) => {
            const operand1 = (deps.moduleName + deps.version).toLowerCase();
            const operand2 = (moduleName + version).toLowerCase();

            if (operand1.localeCompare(operand2) === 0) return true;
            else return false;
        });

        if (isCached !== undefined) {
            console.log(
                `Requested module ${moduleName}@${version} is already installed`
            );
            return;
        }

        const updatedDeps: iDependencyState[] = [
            ...dependencies,
            {
                moduleName: moduleName,
                version: version,
                state: 'loading',
            },
        ];
        setDependencies(updatedDeps);

        if (agent.current !== undefined) {
            agent.current!.postMessage({
                order: 'RESOLVE_DEPENDENCY',
                payload: {
                    moduleName,
                    version,
                },
            } as iRequestFetchLibs);
        }
    };

    /***
     * Register path and code to monaco.language.[type|java]script addExtraLibs.
     * Reset code if passed path has already been registered.
     * */
    const addExtraLibs = (code: string, path: string) => {
        // DEBUG:
        console.log(`[TypingLibsContext] Add extra Library: ${path}`);

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
        if (relatedLibs.current.has(`${moduleName}@${version}`)) {
            // DEBUG:
            console.log(
                `[TypingLibsContext] delete ${moduleName}@${version} related libraries`
            );

            const paths = relatedLibs.current.get(`${moduleName}@${version}`);
            paths?.forEach((path) => {
                const cachedLib = typingLibs.current.get(path);
                if (cachedLib) {
                    cachedLib.js.dispose();
                    cachedLib.ts.dispose();
                }
            });
            relatedLibs.current.delete(`${moduleName}@${version}`);
        }
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
