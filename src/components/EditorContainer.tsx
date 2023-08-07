/*****************************************
 * 選択ファイルの同期の実装：選択ファイルが切り替わったら、
 * state.currentFilePathとstate.currentCodeを選択中ファイルのものに切り替える。
 *
 *
 * fileが切り替わったことを知る手段：files.find(f => f.isSelected())
 *
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
import debounce from 'lodash/debounce';

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
    currentDependencies: { [moduleName: string]: string };
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
        currentDependencies: {},
    };
    _bundleWorker: Worker | undefined;
    _fetchLibsWorker: Worker | undefined;

    constructor(props: iProps) {
        super(props);

        // Bind methods which will be sent as props.
        this._onEditorContentChange = this._onEditorContentChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onChangeSelectedTab = this._onChangeSelectedTab.bind(this);
        this._onBundled = this._onBundled.bind(this);
        this._onDidChangeModel = this._onDidChangeModel.bind(this);
        this._onMessageOfTypings = this._onMessageOfTypings.bind(this);
        this._addTypings = this._addTypings.bind(this);
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

        const dependencies = this._getDependencies(files);

        if (window.Worker) {
            this._bundleWorker = new Worker(
                new URL('/src/worker/bundle.worker.ts', import.meta.url),
                { type: 'module' }
            );
            this._fetchLibsWorker = new Worker(
                new URL('/src/worker/fetchLibs.worker.ts', import.meta.url)
                // {type: 'module' }
            );
            this._bundleWorker.addEventListener(
                'message',
                this._onBundled,
                false
            );
            this._fetchLibsWorker.addEventListener(
                'message',
                this._onMessageOfTypings,
                false
            );

            this._fetchTyping(dependencies);
        }
    }

    componentDidUpdate(prevProp: iProps, prevState: iState) {
        // DEBUG:
        console.log("[EditorContainer][componentDidUpdate]");

        const { files, dependencies } = this.props;

        const selectedFile = files.find((f) => f.isSelected());

        // When selected file was changed
        if (prevState.currentFilePath !== selectedFile?.getPath()) {
            selectedFile &&
                this.setState({
                    currentFilePath: selectedFile.getPath(),
                    currentCode: selectedFile.getValue(),
                });
        }
        if(/^package\.json$/.test(getFilenameFromPath(this.state.currentFilePath))) {
            debounce

        }
    }

    _checkModifiedDependencies(files: File[], previousDependencies: iDependency) {
        const packagejson = files.find(f => /^package\.json$/.test(f.getPath()) )?.getValue();
        packagejson && console.log(isJsonValid(packagejson));
        if(!isJsonValid(packagejson!)) { return; }
        // DEBUG:
        console.log("[EditorContainer][checkModifiedDependencies] is package.json valid?");
        const { dependencies, devDependencies } = JSON.parse(packagejson!);
        
        // TODO: 検討：ここで差分を探し出すのか、それともdependenciesに送信して差分を探す仕事を別に任せるのか
        // 少なくともsnackではどうしているのか調査してみる。

        // sortの仕事もcontextの方でやってもらえばええねん
        // const latesDependencies = sortObjectByKeys({...dependencies, ...devDependencies});

        // 多分このままdispatchすることにした方がシンプルでいいよね
        // this.props.dispatchDependencies({
        //     type: dependenciesContextTypes.updateDependencies,
        //     payload: {
        //         dependencies: {...dependencies, ...devDependencies}
        //     }
        // });
        
    }

    componentWillUnmount() {
        this._bundleWorker &&
            this._bundleWorker.removeEventListener(
                'message',
                this._onBundled,
                false
            );
        this._bundleWorker && this._bundleWorker.terminate();
        this._fetchLibsWorker &&
            this._fetchLibsWorker.removeEventListener(
                'message',
                this._onMessageOfTypings,
                false
            );
        this._fetchLibsWorker && this._fetchLibsWorker.terminate();
    }

    // Mainly runs when editor value has changed.
    _onEditorContentChange(code: string, path: string) {
        // DEBUG:
        console.log('[EditorContainer] _onEditorcontentChange:');
        console.log(this.state.currentCode);
        console.log(code);

        this.setState({ currentCode: code });
        this.props.dispatchFiles({
            type: filesContextTypes.Change,
            payload: {
                // targetFilePath: this.state.currentFilePath,
                targetFilePath: path,
                changeProp: {
                    newValue: code,
                },
            },
        });


        /**
         * JSONファイルの編集が入力中か入力完了なのかは、
         * JSON.parseでエラーがあるかどうかで判断ができrる
         * 
         * なのでカレントモデルがpackage.jsonの場合は
         * つどJSON.parseして依存関係などが変更されていないかチェックする
         * 
         * 
         * ただし、入力一文字ごとに反応させると大変なので
         * componentDidUpdateでdebounceさせる
         * */ 
        if(/^package\.json$/.test(path)) {
            // DEBUG: 
            console.log("[EditorContainer][onEditorContentChange] package.json changed.");
            // この時点のdependenciesを記録しておくとか？
        }
    }

    // NOTE: Temporary method.
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
    }

    // Callback for 'message' event of fetchLibs.worker
    _onMessageOfTypings(e: MessageEvent<iFetchResponse>) {
        const { name, version, typings, err } = e.data;
        if (err) throw err;

        // DEBUG:
        console.log('[EditorContainer][_onMessageOfTypings] typings:');
        console.log(typings);

        typings && this._addTypings(typings);
    }

    // Register typing data to monaco-editor library.
    _addTypings = (typings: { [key: string]: string }) => {
        Object.keys(typings).forEach((path) => {
            const extraLib = extraLibs.get(path);

            if (extraLib) {
                extraLib.js.dispose();
                extraLib.ts.dispose();
            }

            // Monaco Uri parsing contains a bug which escapes characters unwantedly.
            // This causes package-names such as `@expo/vector-icons` to not work.
            // https://github.com/Microsoft/monaco-editor/issues/1375
            let uri = monaco.Uri.from({ scheme: 'file', path }).toString();
            if (path.includes('@')) {
                uri = uri.replace('%40', '@');
            }

            const js =
                monaco.languages.typescript.javascriptDefaults.addExtraLib(
                    typings[path],
                    uri
                );
            const ts =
                monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    typings[path],
                    uri
                );

            extraLibs.set(path, { js, ts });
        });
    };

    // Request fetchLibs.worker to fetch typing data.
    _fetchTyping(dependencies: { [key: string]: string }) {
        Object.keys(dependencies).forEach((key) => {
            // DEBUG:
            console.log(
                `[EditorContainer][_fetchTyping] sent dependency: ${key}@${dependencies[key]}`
            );

            this._fetchLibsWorker &&
                this._fetchLibsWorker.postMessage({
                    order: 'fetch-libs',
                    name: key,
                    version: dependencies[key],
                });
        });
    }

    // Save previous model value
    /**
     * Detect if it's package.json
     * 
     * 
     * */ 
    _onDidChangeModel(oldModelPath: string, newModelPath: string) {
        // this.props.dispatchFiles({
        //     type: filesContextTypes.Change,
        //     payload: {
        //         targetFilePath: path,
        //         changeProp: {
        //             newValue: value,
        //         },
        //     },
        // });

        // Set parser if current module is package.json
        if(/^package\.json$/.test(newModelPath)) {
            // DEBUG: 
            console.log("[EditorContainer][onDidChangeModle] now model is package.json.");
            // この時点のdependenciesを記録しておくとか？
        }
        if(/^package\.json$/.test(oldModelPath)) {
            // DEBUG: 
            console.log("[EditorContainer][onDidChangeModle] now model is NOT package.json.");
            // この時点のdependenciesを記録しておくとか？
        }
    }

    _onChangeSelectedTab(selected: string) {
        this.props.dispatchFiles({
            type: filesContextTypes.ChangeSelectedFile,
            payload: { selectedFilePath: selected },
        });
    }

    _getDependencies(files: File[]) {
        const packageJson = files
            .find((f) => getFilenameFromPath(f.getPath()) === 'package.json')!
            .getValue();
        const { dependencies, devDependencies } = JSON.parse(packageJson) as iPackagejson;

        return { ...dependencies, ...devDependencies };
    }

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
