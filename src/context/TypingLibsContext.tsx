/******************************************************************
 *
 * TODO: Dependencies listと連動させること。つまりこのcontextをreducer月にスケールアップしてdependencieslistからdispatchを受け取ること
 * ****************************************************************/
import * as monaco from 'monaco-editor';
import React, { createContext, useCallback, useEffect, useRef } from 'react';
import type { iRequestFetchLibs, iResponseFetchLibs } from '../worker/types';

export type iTypingLibsContext = (code: string, path?: string) => void;

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

export const TypingLibsContext = createContext<iTypingLibsContext>(() => null);

/***
 * Provider of method that resolves and loads dependencies and store them
 * using monaco.languages.[type|java]script.addExtraLibs.
 * You can pass file value then ATA parse them to find dependency to load.
 * Loaded typing file will be stored to monaco-editor library object.
 *
 * You can grab addTypings from anywhere under this provider.
 *
 * The method generated by useCallback not to occure rerender component.
 * */
export const TypingLibsProvider = ({ children }: iProps) => {
    /**
     * Map of typing Libraries
     *
     * */
    const typingLibs = useRef<iTypingLibs>(
        new Map<string, { js: monaco.IDisposable; ts: monaco.IDisposable }>()
    );
    const agent = useRef<Worker>();

    useEffect(() => {
        // DEBUG:
        console.log('[TypingLibsContext] did mount');
        console.log(`[TypingLibsContext] worker: ${agent.current}`);

        if (window.Worker && agent.current === undefined) {
            // DEBUG:
            console.log('[TypingLibsContext] Generate worker');

            agent.current = new Worker(
                new URL('/src/worker/fetchLibs.worker.ts', import.meta.url),
                { type: 'module' }
            );
            agent.current.addEventListener('message', handleWorkerMessage);

            // DEBUG:
            console.log(agent.current);

            // DEBUG: ひとまず動作確認のため
            const dummyDependencies = [
                { name: 'react', version: '18.2.0' },
                { name: 'react-dom/client', version: '18.2.0' },
                { name: 'react-refresh', version: '0.11.0' },
                { name: '@types/react', version: 'latest' },
                { name: '@types/react-dom', version: 'latest' },
                { name: 'typescript', version: '5.0.2' },
            ];
            dummyDependencies.forEach((d) => {
                console.log(
                    `[TypingLibsContext] Requesting ${d.name}@${d.version}...`
                );
                console.log(agent.current);

                agent.current!.postMessage({
                    order: 'RESOLVE_DEPENDENCY',
                    payload: {
                        moduleName: d.name,
                        version: d.version,
                    },
                } as iRequestFetchLibs);
            });
        }

        return () => {
            // DEBUG:
            console.log('[TypingLibsContext] clean up...');

            if (window.Worker && agent.current) {
                // DEBUG:
                console.log('[TypingLibsContext] Termintate worker');

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
     *
     * @param {string} code - Code that you want ata to parse.
     * @param {string} path - Path of file that the code is belongs to.
     *
     * Not to re-render, generated by useCallback.
     * */
    const addTypings: iTypingLibsContext = useCallback(
        (code: string, path?: string): void => {
            if (path) {
                // save latest files value
                addExtraLibs(code, path);
            }
        },
        []
    );

    // Callback of onmessage event with agent worker.
    const handleWorkerMessage = (e: MessageEvent<iResponseFetchLibs>) => {
        const { error } = e.data;
        if (error) {
            console.error(error);
            // ひとまず
            return;
        }
        const { depsMap } = e.data.payload;

        // DEBUG:
        console.log('[TypingLibsContext] Got dependencies:');

        // key: /node_modules/typescript/lib/lib.webworker.iterable.d.ts
        // value: its file's code
        depsMap.forEach((value, key, _map) => {
            addExtraLibs(value, key);
        });
    };

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

    return (
        <TypingLibsContext.Provider value={addTypings}>
            {children}
        </TypingLibsContext.Provider>
    );
};
