// /***
//  * DependencyListと連携するためにTypingLibsContext.tsxをcontext+reducerに変更する
//  *
//  * TODO:
//  * - workerをどうやって管理するか
//  *
//  * Q:どうしてdependecylistが直接workerを使って依存関係を呼出して管理するのではいけないの？
//  * A: DependencyListはpaneの子コンポーネントで場合によってはトグルされてレンダリングされないときがあり、そうなると頻繁にworkerが作られ消されが繰り返されるから、
//  * 消える心配のないコンポーネントに移す必要が出てきたから
//  * */
// /****
//  * TypingLibsContext2.tsxの問題点：
//  *
//  * reducerへ送られたアクションを処理するときに、workerがpostMessageしたらworkerの返事待ちになるだけで結局stateを更新できない点である。
//  *
//  * actionは一旦そのままstateを返すことになり、
//  * addEventListenerが返事を受け取った時にコールバックがstateを更新するほかないはずだが
//  * この更新は再レンダリングを起こさない可能性がある
//  * (そもそもreducer以外がstateを更新していいのかという問題もある)
//  *
//  * */
// import React, {
//     useEffect,
//     useRef,
//     createContext,
//     useContext,
//     useReducer,
//     Dispatch,
// } from 'react';
// import * as monaco from 'monaco-editor';
// import { iRequestFetchLibs, iResponseFetchLibs } from '../worker/types';

// // --- Types ---

// enum Types {
//     FetchLibrary = 'FETCH_LIBRARY',
// }

// type ActionMap<M extends { [index: string]: any }> = {
//     [Key in keyof M]: M[Key] extends undefined
//         ? {
//               type: Key;
//           }
//         : {
//               type: Key;
//               payload: M[Key];
//           };
// };

// type iFetchLibraryActionPayload = {
//     [Types.FetchLibrary]: {
//         moduleName: string;
//         version: string;
//     };
// };

// type iFetchLibraryActions =
//     ActionMap<iFetchLibraryActionPayload>[keyof ActionMap<iFetchLibraryActionPayload>];

// // --- Definitions ---

// const TypingLibsContext = createContext<Map<string, string>>(
//     new Map<string, string>()
// );
// const TypingLibsDispatchContext = createContext<Dispatch<iFetchLibraryActions>>(
//     () => null
// );

// /***
//  * Initialize State:
//  * */

// const _typingLibsMap = new Map<string, string>();

// // https://stackoverflow.com/a/57253387/22007575
// const TypingLibsProvider = ({ children }: { children: React.ReactNode }) => {
//     const [typingLibsMap, dispatch] = useReducer(
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         typingLibsReducer,
//         _typingLibsMap
//     );

//     const agent = useRef<Worker>();

//     useEffect(() => {
//         // DEBUG:
//         console.log('[TypingLibsContext] did mount');
//         console.log(`[TypingLibsContext] worker: ${agent.current}`);

//         if (window.Worker && agent.current === undefined) {
//             // DEBUG:
//             console.log('[TypingLibsContext] Generate worker');

//             agent.current = new Worker(
//                 new URL('/src/worker/fetchLibs.worker.ts', import.meta.url),
//                 { type: 'module' }
//             );
//             agent.current.addEventListener('message', handleWorkerMessage);

//             // DEBUG:
//             console.log(agent.current);

//             // DEBUG: ひとまず動作確認のため
//             const dummyDependencies = [
//                 { name: 'react', version: '18.2.0' },
//                 { name: 'react-dom/client', version: '18.2.0' },
//                 { name: 'react-refresh', version: '0.11.0' },
//                 { name: '@types/react', version: 'latest' },
//                 { name: '@types/react-dom', version: 'latest' },
//                 { name: 'typescript', version: '5.0.2' },
//             ];
//             dummyDependencies.forEach((d) => {
//                 console.log(
//                     `[TypingLibsContext] Requesting ${d.name}@${d.version}...`
//                 );
//                 console.log(agent.current);

//                 agent.current!.postMessage({
//                     order: 'RESOLVE_DEPENDENCY',
//                     payload: {
//                         moduleName: d.name,
//                         version: d.version,
//                     },
//                 } as iRequestFetchLibs);
//             });
//         }

//         return () => {
//             // DEBUG:
//             console.log('[TypingLibsContext] clean up...');

//             if (window.Worker && agent.current) {
//                 // DEBUG:
//                 console.log('[TypingLibsContext] Termintate worker');

//                 agent.current.removeEventListener(
//                     'message',
//                     handleWorkerMessage
//                 );
//                 agent.current.terminate();
//                 agent.current = undefined;
//             }
//         };
//     }, []);

//     const typingLibsReducer: React.Reducer<
//         Map<string, string>,
//         iFetchLibraryActions
//     > = (typingLibsMap: Map<string, string>, action: iFetchLibraryActions) => {
//         switch (action.type) {
//             case Types.FetchLibrary: {
//                 const { moduleName, version } = action.payload;

//                 // TODO: Check if moduleName@version is already downloaded
//                 // request時のmoudlename + versionでは
//                 // typingLibsMapの登録情報と簡単に比較できない

//                 // DEBUG:
//                 console.log(
//                     `[TypingLibsContext] ${action.type}: ${moduleName}@${version}`
//                 );

//                 if (agent.current !== undefined) {
//                     agent.current.postMessage({
//                         order: 'RESOLVE_DEPENDENCY',
//                         payload: {
//                             moduleName,
//                             version,
//                         },
//                     } as iRequestFetchLibs);
//                 }

//                 return typingLibsMap;
//             }
//             default: {
//                 throw Error('Unknown action: ' + action.type);
//             }
//         }
//     };

//     const handleWorkerMessage = (e: MessageEvent<iResponseFetchLibs>) => {
//         const { error } = e.data;
//         if (error) {
//             console.error(error);
//             // ひとまず
//             return;
//         }
//         const { depsMap } = e.data.payload;

//         // DEBUG:
//         console.log('[TypingLibsContext] Got dependencies:');

//         // key: /node_modules/typescript/lib/lib.webworker.iterable.d.ts
//         // value: its file's code
//         depsMap.forEach((value, key, _map) => {
//             addExtraLibs(value, key);
//         });
//     };

//     const addExtraLibs = (code: string, path: string) => {
//         // DEBUG:
//         console.log(`[TypingLibsContext] Add extra Library: ${path}`);

//         const cachedLib = typingLibs.current.get(path);
//         if (cachedLib) {
//             cachedLib.js.dispose();
//             cachedLib.ts.dispose();
//         }
//         // Monaco Uri parsing contains a bug which escapes characters unwantedly.
//         // This causes package-names such as `@expo/vector-icons` to not work.
//         // https://github.com/Microsoft/monaco-editor/issues/1375
//         let uri = monaco.Uri.from({
//             scheme: 'file',
//             path: path,
//         }).toString();
//         if (path.includes('@')) {
//             uri = uri.replace('%40', '@');
//         }

//         const js = monaco.languages.typescript.javascriptDefaults.addExtraLib(
//             code,
//             uri
//         );
//         const ts = monaco.languages.typescript.typescriptDefaults.addExtraLib(
//             code,
//             uri
//         );
//         typingLibs.current.set(path, { js, ts });
//     };

//     return (
//         <TypingLibsContext.Provider value={typingLibsMap}>
//             <TypingLibsDispatchContext.Provider value={dispatch}>
//                 {children}
//             </TypingLibsDispatchContext.Provider>
//         </TypingLibsContext.Provider>
//     );
// };

// // --- Hooks ---

// function useTypingLibsContext() {
//     return useContext(TypingLibsContext);
// }

// function useTypingLibsDispatch() {
//     return useContext(TypingLibsDispatchContext);
// }

// export {
//     useTypingLibsContext,
//     useTypingLibsDispatch,
//     TypingLibsProvider,
//     // Types
//     Types,
// };
