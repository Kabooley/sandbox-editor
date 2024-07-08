// /*****************************************
//  * MonacoEdotor.tsxと他の機能の間の連携機能をもたらすクラス。
//  *
//  * - MonacoEditorの現在のモデルのonDidChangeModelContentから値を取得してbundleワーカへ渡す
//  * - onDidChangeModelContentのたびに値をFilesContextへdispatch()する
//  *
//  * TODO:
//  * ***************************************/
// import React from 'react';
// import * as monaco from 'monaco-editor';
// import type { iFile } from '../data/types';

// import MonacoEditor from './Monaco/MonacoEditor';
// import debounce from 'lodash.debounce';
// import type * as lodash from 'lodash';
// import { generateTreeForBundler, getFilenameFromPath } from '../utils';
// import TabsAndActionsContainer from './TabsAndActions';
// import EditorNoSelectedFile from './NoSelectedEditor';

// import { connect } from 'react-redux';
// import { filesActions } from '../slices/filesSlice';
// import { bundler } from '../slices/bundlerSlice';
// import type { RootState } from '../store';
// import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
// import {
//     updatePackageJson,
//     reflectDependenciesToPackageJson,
// } from '../slices/packageJsonSlice';
// import type { SerializedError } from '@reduxjs/toolkit';

// interface iDefaultProps {
//     width: number;
//     dispatch: ThunkDispatch<RootState, undefined, UnknownAction>;
// }

// type iProps = ReturnType<typeof mapState> & typeof mapDispatch & iDefaultProps;

// interface iState {
//     currentFilePath: string;
// }

// const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions =
//     {
//         language: 'typescript',
//         lineNumbers: 'off',
//         roundedSelection: false,
//         scrollBeyondLastLine: false,
//         readOnly: false,
//         theme: 'vs-dark',
//         dragAndDrop: false,
//         automaticLayout: true, // これ設定しておかないとリサイズ時に壊れる
//     };

// const delay = 500;
// const $FiveSec = 5000;

// // Store details about typings we have loaded.
// const extraLibs = new Map<
//     string,
//     { js: monaco.IDisposable; ts: monaco.IDisposable }
// >();

// class EditorContainer extends React.Component<iProps, iState> {
//     _debouncedAddTypings: lodash.DebouncedFunc<
//         (code: string, path?: string) => void
//     >;
//     _debouncedBundle: lodash.DebouncedFunc<() => void>;
//     _debouncedUpdatingPackageJson: lodash.DebouncedFunc<(code: string) => void>;

//     constructor(props: iProps) {
//         super(props);
//         this._onEditorContentChange = this._onEditorContentChange.bind(this);
//         this._onBundle = this._onBundle.bind(this);
//         this._onChangeSelectedTab = this._onChangeSelectedTab.bind(this);
//         this._addTypings = this._addTypings.bind(this);
//         this._onDidChangeModel = this._onDidChangeModel.bind(this);
//         this._debouncedAddTypings = debounce(this._addTypings, delay);
//         this._debouncedBundle = debounce(this._onBundle, delay);
//         this.addExtraLibs = this.addExtraLibs.bind(this);
//         this._removeFileFromExtraLibs =
//             this._removeFileFromExtraLibs.bind(this);
//         this._debouncedUpdatingPackageJson = debounce(
//             this._updatePackageJson,
//             $FiveSec
//         );
//     }

//     componentDidMount() {
//         const { files } = this.props;

//         files.forEach((f) => {
//             this.addExtraLibs(f.value, f.path);
//         });
//         const packageJson = files.find((f) => f.path === 'package.json');
//         if (packageJson !== undefined) {
//             this._updatePackageJson(packageJson.value);
//         }
//     }

//     /***
//      * File may changes its properties or added, and deleted.
//      *
//      * This function handles when file has been...
//      * added, deleted, changed file.path.
//      *
//      * Not handles when file has been...
//      * changed file.selected, file.isOpened, file.value
//      *
//      * NOTE: renameされたfileのリネーム前の該当ファイルはextraLibsから削除されていない。
//      * どのデータが該当のファイルか特定できないからである。
//      * すべてthis.props.filesに基づいて毎度まるっとextralibsをすべて更新した方がいいのかも
//      * */
//     componentDidUpdate(prevProp: iProps, prevState: iState) {
//         // // DEBUG: ----
//         // console.log('[EditorContainer] did update');
//         // // monaco.languages.typescript.IExtraLibs:
//         // // [path: string]: {
//         // //      content: string; version: number;
//         // // }
//         // const currentJSLibs =
//         //     monaco.languages.typescript.javascriptDefaults.getExtraLibs();
//         // const currentTSLibs =
//         //     monaco.languages.typescript.typescriptDefaults.getExtraLibs();
//         // console.log(currentTSLibs);
//         // console.dir(this.props.files);
//         // console.dir(prevProp.files);

//         const didFileDelete = prevProp.files.length > this.props.files.length;

//         // this.props.filesが更新されたら
//         if (prevProp.files !== this.props.files) {
//             for (const file of this.props.files) {
//                 if (
//                     prevProp.files.find((f) => f.path === file.path) ===
//                     undefined
//                 ) {
//                     // New File has added, or file's path changed.
//                     // いずれの場合も結局`this.addExtraLibs`へ渡すだけ
//                     // rename前のpathに該当するextralibsファイルは削除できない
//                     // どれか判別できないけど、extralibsに残っていても問題ないから
//                     this.addExtraLibs(file.value, file.path);
//                 }
//             }
//             if (didFileDelete) {
//                 const prevFilesPath = prevProp.files.map((pf) => pf.path);
//                 const currentFilesPath = this.props.files.map((pf) => pf.path);
//                 // deletedFile: prevFilesPathには存在してcurrentFilesPathには存在しない要素駆らなる配列
//                 const deletedFiles = prevFilesPath.filter(
//                     (pf) => currentFilesPath.indexOf(pf) === -1
//                 );
//                 deletedFiles.forEach((df) => this._removeFileFromExtraLibs(df));
//             }
//         }
//     }

//     componentWillUnmount() {};

//     /**
//      * Dispatches code to FilesContext to update file's value.
//      * Set timer to dispatch bundle action.
//      * Set timer to dispatch updatePackageJson action.
//      *
//      * @param {string} code - current model code onDidChangeModelContent.
//      * @param {string} path - File path of current model.
//      *
//      *
//      * このdebounces使用方法はそもそも正しいのか？副作用はrender語かイベントハンドラの中でならアリのはずなのでOK
//      * TODO: debouncedした関数はcancelを呼び出さなくていいのか？あとで検証
//      * TODO: lodash.debounce vs lodash-esどうする？
//      * */
//     _onEditorContentChange(code: string, path: string) {
//         // DEBUG:
//         console.log('[EditorContainer] on editor content change');

//         this.props.changeFile({
//             targetFilePath: path,
//             changeProp: {
//                 newValue: code,
//             },
//         });
//         this._debouncedBundle();
//         this._debouncedAddTypings(code, path);
//         if (this.props.files.find((f) => f.selected)?.path === 'package.json') {
//             this._debouncedUpdatingPackageJson.cancel();
//             this._debouncedUpdatingPackageJson(code);
//         }
//     }

//     /***
//      * Send all files to bundle.worker to bundle them.
//      * */
//     _onBundle() {
//         // DEBUG:
//         console.log('[EditorContainer] on bundle');

//         this.props.dispatch(
//             bundler({
//                 entryPoint: getFilenameFromPath('src/index.tsx'),
//                 tree: generateTreeForBundler(this.props.files),
//             })
//         );
//     }

//     /***
//      * @param {string} oldModelpath -
//      * @param {string} newModelpath -
//      * @param {string} oldModelpath -
//      *
//      * oldModelPathのfileのvalueを保存する
//      * NOTE: この処理要らないかも。
//      * */
//     _onDidChangeModel(oldModelPath: string, newModelPath: string) {
//         console.log(
//             `[EditorContainer][_onDidChangeModel] old model path: ${oldModelPath}`
//         );
//         // this.props.dispatchFiles({
//         //     type: filesContextTypes.Change,
//         //     payload: {
//         //         targetFilePath: oldModelPath,
//         //         changeValue:
//         //     }
//         // });
//     }

//     _onChangeSelectedTab(selected: string) {
//         this.props.changeSelectedFile({ selectedFilePath: selected });
//     }

//     /***
//      *
//      * */
//     _addTypings(code: string, path: string) {
//         this.addExtraLibs(code, path);
//     }

//     /***
//      * this.props.filesから`selected: true`のファイルを取り出して
//      * `tabIndex`順に並び変えた配列にして返す。
//      *
//      * https://stackoverflow.com/a/1129270/22007575
//      * */
//     getFilesOpening(files: iFile[]) {
//         return files
//             .filter((f) => f.opening)
//             .sort((a: iFile, b: iFile): number => {
//                 if (a.tabIndex! < b.tabIndex!) {
//                     return -1;
//                 }
//                 if (a.tabIndex! > b.tabIndex!) {
//                     return 1;
//                 }
//                 return 0;
//             });
//     }

//     /***
//      * Register path and code to monaco.language.[type|java]script addExtraLibs.
//      * Reset code if passed path has already been registered.
//      * */
//     addExtraLibs(code: string, path: string) {
//         const cachedLib = extraLibs.get(path);
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
//         extraLibs.set(path, { js, ts });
//     }

//     /***
//      * Dispose monaco-editor IExtraLibs.
//      *
//      * */
//     _removeFileFromExtraLibs(path: string) {
//         const cachedLib = extraLibs.get(path);
//         if (cachedLib) {
//             cachedLib.js.dispose();
//             cachedLib.ts.dispose();
//             extraLibs.delete(path);
//         }
//     }

//     _updatePackageJson(code: string) {
//         this.props
//             .dispatch(updatePackageJson(code))
//             .unwrap()
//             // 問題なかった場合だけpackage.jsonを更新させる
//             .then(() => this.props.dispatch(reflectDependenciesToPackageJson()))
//             .catch((rejectedValue: SerializedError) => {
//                 this.props.dispatch(reflectDependenciesToPackageJson());
//                 console.error('[TestPackageJsonManagement] there was an error');
//                 console.error(rejectedValue.name + ' ' + rejectedValue.message);
//                 console.error(rejectedValue.stack);
//             });
//     }

//     render() {
//         const selectedFilePath = this.props.files.find((f) => f.selected);
//         const filesOpening = this.getFilesOpening(this.props.files);

//         if (filesOpening.length) {
//             return (
//                 <>
//                     <TabsAndActionsContainer
//                         selectedFile={selectedFilePath}
//                         onChangeSelectedTab={this._onChangeSelectedTab}
//                         width={this.props.width}
//                         filesOpening={filesOpening}
//                     />
//                     <MonacoEditor
//                         files={this.props.files}
//                         selectedFile={selectedFilePath}
//                         onEditorContentChange={this._onEditorContentChange}
//                         onDidChangeModel={this._onDidChangeModel}
//                         {...editorConstructOptions}
//                     />
//                 </>
//             );
//         } else {
//             return (
//                 <>
//                     <TabsAndActionsContainer
//                         selectedFile={selectedFilePath}
//                         onChangeSelectedTab={this._onChangeSelectedTab}
//                         width={this.props.width}
//                         filesOpening={filesOpening}
//                     />
//                     <EditorNoSelectedFile />
//                 </>
//             );
//         }
//     }
// }

// const mapState = (state: RootState) => {
//     return {
//         files: state.files.files,
//     };
// };

// // // TODO: convert thunk action creator to () => dispatch(thunkactioncreator())
// // //
// // // とにかくtypescriptが面倒くさいから下の記事が役に立つかも？
// // // https://react-redux.js.org/api/connect#object-shorthand-form
// // const mapDispatchToPops = (dispatch: ThunkDispatch<RootState, undefined, UnknownAction>) => ({
// //     addFile: () => dispatch(filesActions.addFile),
// //     changeFile: () => dispatch(filesActions.changeFile),
// //     changeMultipleFiles: () => dispatch(filesActions.changeMultipleFiles),
// //     changeSelectedFile: () => dispatch(filesActions.changeSelectedFile),
// //     closeFile: () => dispatch(filesActions.closeFile),
// //     closeAllFiles: () => dispatch(filesActions.closeAllFiles),
// //     deleteFile: () => dispatch(filesActions.deleteFile),
// //     deleteMultipleFiles: () => dispatch(filesActions.deleteMultipleFiles),
// //     openFile: () => dispatch(filesActions.openFile),
// // });

// // export default connect<ReturnType<typeof mapState>, ReturnType<typeof mapDispatchToPops>, iDefaultProps>(mapState, mapDispatchToPops)(EditorContainer);

// // 公式によれば、下記のように渡したら自動的に各アクションはdispatchとバインドされる
// // ので呼び出し側はdispatch(this.props.addFile)ヲする必要がない
// //
// // https://react-redux.js.org/api/connect#object-shorthand-form
// const mapDispatch = {
//     updatePackageJson: updatePackageJson,
//     reflectDependenciesToPackageJson: reflectDependenciesToPackageJson,
//     bundler: bundler,
//     changeFile: filesActions.changeFile,
//     changeSelectedFile: filesActions.changeSelectedFile,
// };

// export default connect(mapState, mapDispatch)(EditorContainer);
