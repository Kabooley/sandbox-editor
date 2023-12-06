// /******************************************************************
//  * TypingLibsContext3.tsx
//  *
//  * typingLibsとrequestFetch(仮)の２つを提供するcontextとする
//  * reducerは使わない
//  *
//  * TODO: 要確認)
//  * - typingLibsの更新は再レンダリングを起こすか？typingLIbsの最新情報を常に提供できるか？
//  * - キャッシュ機能の見直しも。同じ名前のモジュールのリクエストは再取得させるのかとか。
//  * - requestFetchTypings()は毎度新規に生成されている（再レンダリングをひきおこしている）か確認。useCallbackで出力した方がいいか。
//  * - dependenciesの更新がうまくいっていないかも。一番最後に追加したモジュールしか保存されていないっぽい？
//  * ****************************************************************/
// /***
//  * TODO: このことはノートにまとめること
//  * NOTE: # React useState does not updates itself in window events.
//  * 調べてみたところ、
//  * addEventListenerのコールバックの中からでは常にaddEventListenerをアタッチした時点のstateの値しか参照できないみたい。
//  *
//  * そのため
//  * - 毎useEffectでイベントリスナを再度アタッチする(検証済、さほど影響はなさそう)
//  * - useStateをあきらめてuseRefを呼出す（強制的に再レンダリングする方法を見出さなくてはならない）
//  *
//  *
//  * https://stackoverflow.com/questions/60540985/react-usestate-doesnt-update-in-window-events
//  * */
// import * as monaco from 'monaco-editor';
// import React, {
//     createContext,
//     useState,
//     useEffect,
//     useRef,
//     useContext,
// } from 'react';
// import type { iRequestFetchLibs, iResponseFetchLibs } from '../worker/types';

// // DEBUG:
// import { logArrayData } from '../utils';
// import { useFetchLibsWorker } from '../hooks/useFetchLibsWorker';

// type iTypingLibsContext = iDependencyState[];
// type iRequestFetchContext = (moduleName: string, version: string) => void;

// type iTypingLibs = Map<
//     string,
//     {
//         js: monaco.IDisposable;
//         ts: monaco.IDisposable;
//     }
// >;

// interface iProps {
//     // Set `any` instead `React.ReactChildren`
//     // according to https://github.com/microsoft/TypeScript/issues/6471
//     children: any;
// }

// interface iDependencyState {
//     moduleName: string;
//     version: string;
//     state: 'loading' | 'loaded';
// }

// const TypingLibsContext = createContext<iTypingLibsContext>([]);
// const RequestFetchContext = createContext<iRequestFetchContext>(() => null);

// const TypingLibsProvider: React.FC<iProps> = ({ children }) => {
//     /***
//      * Map of typing Libraries
//      * */
//     const typingLibs = useRef<iTypingLibs>(
//         new Map<string, { js: monaco.IDisposable; ts: monaco.IDisposable }>()
//     );
//     const [dependencies, requestFetchTypings] =
//         // @ts-ignore
//         useFetchLibsWorker(addExtraLibs);

//     /***
//      * Register path and code to monaco.language.[type|java]script addExtraLibs.
//      * Reset code if passed path has already been registered.
//      * */
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
//         <TypingLibsContext.Provider value={dependencies}>
//             <RequestFetchContext.Provider value={requestFetchTypings}>
//                 {children}
//             </RequestFetchContext.Provider>
//         </TypingLibsContext.Provider>
//     );
// };

// // --- Hooks ---
// function useDependencies() {
//     return useContext(TypingLibsContext);
// }

// function useRequestFetch() {
//     return useContext(RequestFetchContext);
// }

// export {
//     TypingLibsProvider,
//     useDependencies,
//     useRequestFetch,
//     // types
//     iDependencyState,
// };
