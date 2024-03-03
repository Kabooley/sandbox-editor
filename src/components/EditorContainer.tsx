/*****************************************
 * MonacoEdotor.tsxと他の機能の間の連携機能をもたらすクラス。
 *
 * - MonacoEditorの現在のモデルのonDidChangeModelContentから値を取得してbundleワーカへ渡す
 * - onDidChangeModelContentのたびに値をFilesContextへdispatch()する
 *
 *
 * NOTE: 一時的にaddTypingsをクラスメソッドとする(TypingLibsContext.tsxのテストの為)
 * TODO: 仮想explorer上のファイルの中身が更新されたときに、addExtraLibsを適切に更新させる方法の追究。どうやって更新させるのが適切か、キャッシュできるのかなど
 * TODO: lodashの使用を避ける。debounceはclassコンポーネントでも使えるものを１から作れないか?
 * ***************************************/
import React from 'react';
import * as monaco from 'monaco-editor';
import type { iOrderBundleResult } from '../worker/types';
import type { File } from '../data/files';
import type { iFilesActions } from '../context/FilesContext';
import type { iBundledCodeActions } from '../context/BundleContext';
import type { iOrderBundle } from '../worker/types';
import { Types as bundledContextTypes } from '../context/BundleContext';
import { Types as filesContextTypes } from '../context/FilesContext';
import {
    OrderTypes,
    // iFetchResponse
} from '../worker/types';
import MonacoEditor from './Monaco/MonacoEditor';
import debounce from 'lodash.debounce';
// TODO: 以下の全部取得は避けた方がいいかも。lodashは巨大なライブラリである
import type * as lodash from 'lodash';
import { generateTreeForBundler, getFilenameFromPath } from '../utils';
import TabsAndActionsContainer from './TabsAndActions';
import EditorNoSelectedFile from './NoSelectedEditor';

interface iProps {
    files: File[];
    // addTypings: iTypingLibsContext;
    dispatchFiles: React.Dispatch<iFilesActions>;
    dispatchBundledCode: React.Dispatch<iBundledCodeActions>;
    width: number;
}

interface iState {
    currentFilePath: string;
}

const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions =
    {
        language: 'typescript',
        lineNumbers: 'off',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        theme: 'vs-dark',
        dragAndDrop: false,
        automaticLayout: true, // これ設定しておかないとリサイズ時に壊れる
    };

const delay = 500;

// Store details about typings we have loaded.
const extraLibs = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();

class EditorContainer extends React.Component<iProps, iState> {
    // state = { currentFilePath: '' };
    _bundleWorker: Worker | undefined;
    _debouncedAddTypings: lodash.DebouncedFunc<
        (code: string, path?: string) => void
    >;
    _debouncedBundle: lodash.DebouncedFunc<() => void>;

    _fetchLibsWorker: Worker | undefined;

    constructor(props: iProps) {
        super(props);
        this._onEditorContentChange = this._onEditorContentChange.bind(this);
        this._onBundle = this._onBundle.bind(this);
        this._onChangeSelectedTab = this._onChangeSelectedTab.bind(this);
        this._onBundled = this._onBundled.bind(this);
        this._addTypings = this._addTypings.bind(this);
        this._onDidChangeModel = this._onDidChangeModel.bind(this);
        this._debouncedAddTypings = debounce(this._addTypings, delay);
        this._debouncedBundle = debounce(this._onBundle, delay);
        this.addExtraLibs = this.addExtraLibs.bind(this);
    }

    componentDidMount() {
        const { files } = this.props;

        files.forEach((f) => {
            this.addExtraLibs(f.getValue(), f.getPath());
        });

        if (window.Worker) {
            this._bundleWorker = new Worker(
                new URL('/src/worker/bundle.worker.ts', import.meta.url),
                { type: 'module' }
            );
            this._bundleWorker.addEventListener(
                'message',
                this._onBundled,
                false
            );
        }
    }

    // TODO: ファイルの内容更新のたびにaddExtraLibsで更新した方がいい気がする
    //
    // なんでかしらんが更新はできている...なぜ？
    componentDidUpdate(prevProp: iProps, prevState: iState) {
        console.log('[EditorContainer] did update');

        // monaco.languages.typescript.IExtraLibs:
        // [path: string]: {
        //      content: string; version: number;
        // }
        const currentJSLibs =
            monaco.languages.typescript.javascriptDefaults.getExtraLibs();
        const currentTSLibs =
            monaco.languages.typescript.typescriptDefaults.getExtraLibs();

        console.log(currentTSLibs);
    }

    componentWillUnmount() {
        // TODO: workerフィールドにはundefinedを渡した方がいいかも
        this._bundleWorker &&
            this._bundleWorker.removeEventListener(
                'message',
                this._onBundled,
                false
            );
        this._bundleWorker && this._bundleWorker.terminate();
    }

    /**
     * Dispatches code to FilesContext to update file's value.
     *
     * @param {string} code - current model code onDidChangeModelContent.
     * @param {string} path - File path of current model.
     *
     * */
    _onEditorContentChange(code: string, path: string) {
        this.props.dispatchFiles({
            type: filesContextTypes.Change,
            payload: {
                targetFilePath: path,
                changeProp: {
                    newValue: code,
                },
            },
        });
        this._debouncedBundle();
        this._debouncedAddTypings(code, path);
    }

    /***
     * Send all files to bundle.worker to bundle them.
     * */
    _onBundle() {
        // console.log('[EditorContainer][on bundle]');

        this._bundleWorker &&
            this._bundleWorker.postMessage({
                order: OrderTypes.Bundle,
                entryPoint: getFilenameFromPath('src/index.tsx'),
                tree: generateTreeForBundler(this.props.files),
            } as iOrderBundle);
    }

    /**
     * Recieve bundled code message and send them to BundledContext.
     * */
    _onBundled(e: MessageEvent<iOrderBundleResult>) {
        const { bundledCode, error } = e.data;

        bundledCode &&
            this.props.dispatchBundledCode({
                type: bundledContextTypes.Update,
                payload: {
                    bundledCode: bundledCode,
                    error: error,
                },
            });
    }

    /***
     * @param {string} oldModelpath -
     * @param {string} newModelpath -
     * @param {string} oldModelpath -
     *
     * oldModelPathのfileのvalueを保存する
     * NOTE: この処理要らないかも。
     * */
    _onDidChangeModel(oldModelPath: string, newModelPath: string) {
        console.log(
            `[EditorContainer][_onDidChangeModel] old model path: ${oldModelPath}`
        );
        // this.props.dispatchFiles({
        //     type: filesContextTypes.Change,
        //     payload: {
        //         targetFilePath: oldModelPath,
        //         changeValue:
        //     }
        // });
    }

    _onChangeSelectedTab(selected: string) {
        this.props.dispatchFiles({
            type: filesContextTypes.ChangeSelectedFile,
            payload: { selectedFilePath: selected },
        });
    }

    /***
     *
     * */
    _addTypings(code: string, path: string) {
        this.addExtraLibs(code, path);
    }

    /***
     * this.props.filesから`selected: true`のファイルを取り出して
     * `tabIndex`順に並び変えた配列にして返す。
     *
     * https://stackoverflow.com/a/1129270/22007575
     * */
    getFilesOpening(files: File[]) {
        return files
            .filter((f) => f.isOpening())
            .sort((a: File, b: File): number => {
                if (a.getTabIndex()! < b.getTabIndex()!) {
                    return -1;
                }
                if (a.getTabIndex()! > b.getTabIndex()!) {
                    return 1;
                }
                return 0;
            });
    }

    /***
     * Register path and code to monaco.language.[type|java]script addExtraLibs.
     * Reset code if passed path has already been registered.
     * */
    addExtraLibs(code: string, path: string) {
        console.log(`[EditorContainer] Add extra Library: ${path}`);

        const cachedLib = extraLibs.get(path);
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
        extraLibs.set(path, { js, ts });
    }

    render() {
        const selectedFilePath = this.props.files.find((f) => f.isSelected());
        const filesOpening = this.getFilesOpening(this.props.files);

        if (filesOpening.length) {
            return (
                <div className="editor-container">
                    <TabsAndActionsContainer
                        selectedFile={selectedFilePath}
                        onChangeSelectedTab={this._onChangeSelectedTab}
                        width={this.props.width}
                        filesOpening={filesOpening}
                    />
                    <MonacoEditor
                        files={this.props.files}
                        selectedFile={selectedFilePath}
                        onEditorContentChange={this._onEditorContentChange}
                        onDidChangeModel={this._onDidChangeModel}
                        {...editorConstructOptions}
                    />
                </div>
            );
        } else {
            return (
                <div className="editor-container">
                    <TabsAndActionsContainer
                        selectedFile={selectedFilePath}
                        onChangeSelectedTab={this._onChangeSelectedTab}
                        width={this.props.width}
                        filesOpening={filesOpening}
                    />
                    <EditorNoSelectedFile />
                </div>
            );
        }
    }
}

export default EditorContainer;
