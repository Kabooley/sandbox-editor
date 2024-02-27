// /**************************************************************************
//  * Custom hooks that manages `fetchLibs.worker.ts`.
//  *
//  * NOTE: もし実際にこのフックを利用する場合、引数として関数を取得することができない(undefinedになる)ため`typingLibs`をこのフック内で管理するところまでやらないといかん。
//  *
//  **************************************************************************/
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import type { iRequestFetchLibs, iResponseFetchLibs } from '../worker/types';
// // DEBUG:
// import { logArrayData } from '../utils';

// interface iDependencyState {
//     moduleName: string;
//     version: string;
//     state: 'loading' | 'loaded';
// }

// // TODO: Error: cb is not function
// export function useFetchLibsWorker(
//     cb: (code: string, path: string) => void
// ): [iDependencyState[], (moduleName: string, version: string) => void] {
//     const [dependencies, setDependencies] = useState<iDependencyState[]>([]);
//     const agent = useRef<Worker>();
//     const refCallback = useCallback(cb, [cb]);

//     useEffect(() => {
//         // DEBUG:
//         console.log('[useFetchLibsWorker] did mount');
//         console.log(`[useFetchLibsWorker] worker: ${agent.current}`);

//         if (window.Worker && agent.current === undefined) {
//             // DEBUG:
//             console.log('[useFetchLibsWorker] Generate worker');

//             agent.current = new Worker(
//                 new URL('/src/worker/fetchLibs.worker.ts', import.meta.url),
//                 { type: 'module' }
//             );
//             agent.current.addEventListener('message', handleWorkerMessage);
//         }

//         return () => {
//             if (window.Worker && agent.current) {
//                 // DEBUG:
//                 console.log('[useFetchLibsWorker] Termintate worker');

//                 agent.current.removeEventListener(
//                     'message',
//                     handleWorkerMessage
//                 );
//                 agent.current.terminate();
//                 agent.current = undefined;
//             }
//         };
//     }, []);

//     useEffect(() => {
//         if (window.Worker && agent.current !== undefined) {
//             agent.current.addEventListener('message', handleWorkerMessage);
//         }
//         return () => {
//             if (window.Worker && agent.current !== undefined) {
//                 agent.current.removeEventListener(
//                     'message',
//                     handleWorkerMessage
//                 );
//             }
//         };
//     }, [dependencies]);

//     useEffect(() => {
//         console.log('[useFetchLibsWorker] did update');
//         console.log(cb);
//         console.log(refCallback);
//     });

//     /**
//      * Callback of onmessage event with agent worker.
//      * */
//     const handleWorkerMessage = (e: MessageEvent<iResponseFetchLibs>) => {
//         const { error } = e.data;
//         if (error) {
//             console.error(error);
//             // ひとまず
//             return;
//             // TODO: DependencyListのところに取得失敗しましたを表示させないといかん
//         }
//         const { depsMap, moduleName, version } = e.data.payload;

//         // DEBUG:
//         console.log(
//             `[useFetchLibsWorker] Got dependencies of ${moduleName}@${version}`
//         );

//         const moduleLists = dependencies.map((deps) => deps.moduleName);
//         const index = moduleLists.indexOf(moduleName);

//         if (index > -1) {
//             const updatedDeps = dependencies.filter(
//                 (deps: iDependencyState, _index: number) => _index !== index
//             );

//             // DEBUG:
//             console.log('[useFetchLibsWorker] updatedDeps: ');
//             console.log(updatedDeps);

//             setDependencies([
//                 ...updatedDeps,
//                 {
//                     moduleName: moduleName,
//                     version: version,
//                     state: 'loaded',
//                 },
//             ]);
//         } else {
//             setDependencies([
//                 ...dependencies,
//                 {
//                     moduleName: moduleName,
//                     version: version,
//                     state: 'loaded',
//                 },
//             ]);
//         }

//         // Register type def files to monaco addXtraLibs
//         // key: /node_modules/typescript/lib/lib.webworker.iterable.d.ts
//         // value: its file's code
//         depsMap.forEach((value, key, _map) => {
//             refCallback(value, key);
//         });
//     };

//     /**
//      * ProviderProps value of iRequestFetchContext.
//      *
//      * @param {string} moduleName -
//      * @param {string} version -
//      *
//      * */
//     const requestFetchTypings = (moduleName: string, version: string) => {
//         // DEBUG:
//         console.log(`[TypingLibsContext] Requested: ${moduleName}@${version}`);

//         const isCached = dependencies.find((deps) => {
//             const operand1 = (deps.moduleName + deps.version).toLowerCase();
//             const operand2 = (moduleName + version).toLowerCase();

//             if (operand1.localeCompare(operand2) === 0) return true;
//             else return false;
//         });

//         if (isCached !== undefined) {
//             // TODO: dependencylistのところに「インストール済です」の表示を出させたいのでどうやってインタラクティブにするべきか
//             console.log(
//                 `Requested module ${moduleName}@${version} is already installed`
//             );
//             return;
//         }

//         const updatedDeps: iDependencyState[] = [
//             ...dependencies,
//             {
//                 moduleName: moduleName,
//                 version: version,
//                 state: 'loading',
//             },
//         ];
//         setDependencies(updatedDeps);

//         // DEBUG:
//         console.log(
//             '[TypingLibsContext] requestFetchTypings current dependenccies'
//         );
//         console.log(updatedDeps);

//         if (agent.current !== undefined) {
//             agent.current!.postMessage({
//                 order: 'RESOLVE_DEPENDENCY',
//                 payload: {
//                     moduleName,
//                     version,
//                 },
//             } as iRequestFetchLibs);
//         }
//     };

//     return [dependencies, requestFetchTypings];
// }
