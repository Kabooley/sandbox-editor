/*****************************************
 * 何をするクラスなの？
 * MonacoEdotor.tsxと他の機能の間の連携機能をもたらすクラス。
 * 
 * - MonacoEditorの現在のモデルのonDidChangeModelContentから値を取得してbundleワーカへ渡す
 * - onDidChangeModelContentのたびに値をFilesContextへdispatch()する
 * 
 * 
 * TODO:
 * - extraLibs: Mapはここで保持するべきなのか？contextに移すべきか？
 * - @typescript/ataを導入の検討。
 * - fetchLibsWorkerは@typescripit/ataへ置き換える。すくなくともここでやらなくてようなるかと。
 * ***************************************/
import React from 'react';
import * as monaco from 'monaco-editor';
import Tabs from './Tabs';
import type { iOrderBundleResult } from '../worker/types';
import type { File } from '../data/files';
import type { iFilesActions } from '../context/FilesContext';
import type { iBundledCodeActions } from '../context/BundleContext';
import type {
    iDependency,
    iDependencyActions,
} from '../context/DependecyContext';
import { Types as bundledContextTypes } from '../context/BundleContext';
import { Types as filesContextTypes } from '../context/FilesContext';
import { Types as dependenciesContextTypes } from '../context/DependecyContext';
import { OrderTypes, iFetchResponse } from '../worker/types';

// import MonacoEditor from './Monaco/MonacoEditor';
import MonacoEditor from './Monaco/MonacoEditor';
import { getFilenameFromPath, isJsonValid, sortObjectByKeys } from '../utils';

interface iProps {
    files: File[];
    dependencies: iDependency;
    dispatchFiles: React.Dispatch<iFilesActions>;
    dispatchBundledCode: React.Dispatch<iBundledCodeActions>;
    dispatchDependencies: React.Dispatch<iDependencyActions>;
}

interface iState {
    currentFilePath: string;
    currentCode: string;
    // currentDependencies: { [moduleName: string]: string };
}

interface iPackagejson {
    dependencies: { [moduleName: string]: string };
    devDependencies: { [moduleName: string]: string };
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

const extraLibs = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();

class EditorContainer extends React.Component<iProps, iState> {
    state = {
        currentFilePath: '',
        // NOTE: temporary
        currentCode: '',
        // currentDependencies: {},
    };
    _bundleWorker: Worker | undefined;

    constructor(props: iProps) {
        super(props);

        // Bind methods which will be sent as props.
        this._onEditorContentChange = this._onEditorContentChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onChangeSelectedTab = this._onChangeSelectedTab.bind(this);
        this._onBundled = this._onBundled.bind(this);
        this._onDidChangeModel = this._onDidChangeModel.bind(this);
    }

    componentDidMount() {
        // DEBUG:
        console.log('[EditorContainer] did mount');

        const { files } = this.props;

        const selectedFile = files.find((f) => f.isSelected());
        selectedFile &&
            this.setState({
                currentFilePath: selectedFile.getPath(),
                currentCode: selectedFile.getValue(),
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
        console.log("[EditorContainer][componentDidUpdate]");
        console.log(this.state.currentFilePath);

        const { files, dependencies, dispatchDependencies } = this.props;

        const selectedFile = files.find((f) => f.isSelected());

        // When selected file was changed
        if (prevState.currentFilePath !== selectedFile?.getPath()) {
            selectedFile &&
                this.setState({
                    currentFilePath: selectedFile.getPath(),
                    currentCode: selectedFile.getValue(),
                });
        }
    };


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

        this.setState({ currentCode: code });
        this.props.dispatchFiles({
            type: filesContextTypes.Change,
            payload: {
                targetFilePath: path,
                changeProp: {
                    newValue: code,
                },
            },
        });
    }

    // NOTE: Temporary method.
    // send current model code to bundle worker.
    _onSubmit() {
        this._bundleWorker &&
            this._bundleWorker.postMessage({
                order: OrderTypes.Bundle,
                rawCode: this.state.currentCode,
            });
    }

    // Callback for 'message' event of bundle.worker
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
    };

    _onDidChangeModel(oldModelPath: string, newModelPath: string) {};

    _onChangeSelectedTab(selected: string) {
        this.props.dispatchFiles({
            type: filesContextTypes.ChangeSelectedFile,
            payload: { selectedFilePath: selected },
        });
    };

    render() {
        return (
            // TODO: Rename "monaco-container" to "editor-container"
            <div className="monaco-container">
                <Tabs
                    path={this.state.currentFilePath}
                    onChangeSelectedTab={this._onChangeSelectedTab}
                />
                <MonacoEditor
                    files={this.props.files}
                    path={this.state.currentFilePath!}
                    onEditorContentChange={this._onEditorContentChange}
                    onDidChangeModel={this._onDidChangeModel}
                    {...editorConstructOptions}
                />
                <button onClick={this._onSubmit}>submit</button>
            </div>
        );
    }
}

export default EditorContainer;
