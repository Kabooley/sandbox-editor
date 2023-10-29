/*****************************************
 * MonacoEdotor.tsxと他の機能の間の連携機能をもたらすクラス。
 *
 * - MonacoEditorの現在のモデルのonDidChangeModelContentから値を取得してbundleワーカへ渡す
 * - onDidChangeModelContentのたびに値をFilesContextへdispatch()する
 *
 * ***************************************/
import React from 'react';
import * as monaco from 'monaco-editor';
import type { iOrderBundleResult } from '../worker/types';
import type { File } from '../data/files';
import type { iFilesActions } from '../context/FilesContext';
import type { iBundledCodeActions } from '../context/BundleContext';
import type { iTypingLibsContext } from '../context/TypingLibsContext';
import type { iOrderBundle } from '../worker/types';
import { Types as bundledContextTypes } from '../context/BundleContext';
import { Types as filesContextTypes } from '../context/FilesContext';
import { OrderTypes, iFetchResponse } from '../worker/types';
import MonacoEditor from './Monaco/MonacoEditor';
import debounce from 'lodash.debounce';
// NOTE: 以下の全部取得は避けた方がいいかも。lodashは巨大なライブラリである
import type * as lodash from 'lodash';
import { generateTreeForBundler, getFilenameFromPath } from '../utils';
import ScrollableTabs from './ScrollableTabs';

interface iProps {
    files: File[];
    addTypings: iTypingLibsContext;
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

class EditorContainer extends React.Component<iProps, iState> {
    state = { currentFilePath: '' };
    _bundleWorker: Worker | undefined;
    _debouncedAddTypings: lodash.DebouncedFunc<
        (code: string, path?: string) => void
    >;
    _debouncedBundle: lodash.DebouncedFunc<() => void>;

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
    }

    componentDidMount() {
        // DEBUG:
        console.log('[EditorContainer] did mount');

        const { files, addTypings } = this.props;

        const selectedFile = files.find((f) => f.isSelected());
        selectedFile &&
            this.setState({
                currentFilePath: selectedFile.getPath(),
            });

        // Register all files to monaco addExtraLibs
        files.forEach((f) => {
            addTypings(f.getValue(), f.getPath());
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

    componentDidUpdate(prevProp: iProps, prevState: iState) {
        // DEBUG:
        console.log('[EditorContainer][componentDidUpdate]');

        const { files } = this.props;

        const selectedFile = files.find((f) => f.isSelected());

        // When selected file was changed
        if (prevState.currentFilePath !== selectedFile?.getPath()) {
            selectedFile &&
                this.setState({
                    currentFilePath: selectedFile.getPath(),
                });
        }
    }

    componentWillUnmount() {
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
        // DEBUG:
        console.log('[EditorContainer][on bundle]');

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
        const { bundledCode, err } = e.data;

        bundledCode &&
            this.props.dispatchBundledCode({
                type: bundledContextTypes.Update,
                payload: {
                    bundledCode: bundledCode,
                    error: err,
                },
            });
    }

    _onDidChangeModel(oldModelPath: string, newModelPath: string) {}

    _onChangeSelectedTab(selected: string) {
        console.log(`[EditorContainer] on change selected tab: ${selected}`);
        this.props.dispatchFiles({
            type: filesContextTypes.ChangeSelectedFile,
            payload: { selectedFilePath: selected },
        });
    }

    _addTypings(code: string, path?: string) {
        // DEBUG:
        console.log('[EditorContainer][_addTypings]');

        this.props.addTypings(code, path);
    }

    // https://stackoverflow.com/a/1129270/22007575
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
    render() {
        return (
            <div className="editor-container">
                <ScrollableTabs
                    path={this.state.currentFilePath}
                    onChangeSelectedTab={this._onChangeSelectedTab}
                    width={this.props.width}
                    filesOpening={this.getFilesOpening(this.props.files)}
                />
                <MonacoEditor
                    files={this.props.files}
                    path={this.state.currentFilePath!}
                    onEditorContentChange={this._onEditorContentChange}
                    onDidChangeModel={this._onDidChangeModel}
                    {...editorConstructOptions}
                />
            </div>
        );
    }
}

export default EditorContainer;
