/***********************************************************
 *
 * Props:
 * - files: addExtraLib、createModelするため常に全てのファイルが必要
 * - path: 現在開いているファイルのpath。このpathを基にsetModel()する。
 *
 * *********************************************************/
import React from 'react';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import { getModelByPath, removeFirstSlash } from '../../utils';
import type { File } from '../../data/files';

// import viewStateFiles from '../../data/viewStates';

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: any, label: string) {
        if (label === 'json') {
            return './json.worker.bundle.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.bundle.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.bundle.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.bundle.js';
        }
        return './editor.worker.bundle.js';
    },
};

/**
 * Disable typescript's diagnostics for JavaScript files.
 * This suppresses errors when using Flow syntax.
 * It's also unnecessary since we use ESLint for error checking.
 */
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
});

/**
 * Use prettier to format code.
 * This will replace the default formatter.
 */
const documentFormattingProvider: monaco.languages.DocumentFormattingEditProvider =
    {
        async provideDocumentFormattingEdits(model) {
            const text = await prettier
                .format(model.getValue(), {
                    parser: 'babel',
                    plugins: [parser],
                    useTabs: false,
                    semi: true,
                    singleQuote: true,
                    tabWidth: 2,
                })
                .replace(/\n$/, '');

            return [
                {
                    range: model.getFullModelRange(),
                    text,
                },
            ];
        },
    };

monaco.languages.registerDocumentFormattingEditProvider(
    'javascript',
    documentFormattingProvider
);
monaco.languages.registerDocumentFormattingEditProvider(
    'typescript',
    documentFormattingProvider
);
monaco.languages.registerDocumentFormattingEditProvider(
    'markdown',
    documentFormattingProvider
);

/**
 * Sync all the models to the worker eagerly.
 * This enables intelliSense for all files without needing an `addExtraLib` call.
 */
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

/**
 * Configure the typescript compiler to detect JSX and load type definitions
 */
const compilerOptions: monaco.languages.typescript.CompilerOptions = {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    alwaysStrict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    isolatedModules: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    resolveJsonModule: true,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
);

/**
 * - file information
 * - Monaco.editor.IStandaloneEditorConstructionOptions
 * - handlers from parent
 *
 * */
interface iProps extends Monaco.editor.IStandaloneEditorConstructionOptions {
    files: File[];
    path: string;
    onEditorContentChange: (code: string, path: string) => void;
    onDidChangeModel: (path: string, value: string) => void;
}

interface iState {}

const defaultTheme = 'vs-dark';
monaco.editor.setTheme(defaultTheme);

// Store editor states such as cursor position, selection and scroll position for each model
const editorStates = new Map<
    string,
    monaco.editor.ICodeEditorViewState | undefined | null
>();

export default class MonacoEditor extends React.Component<iProps, iState> {
    _refEditorNode = React.createRef<HTMLDivElement>();
    _refEditor: Monaco.editor.IStandaloneCodeEditor | null = null;
    _disposables: monaco.IDisposable[] = [];

    constructor(props: iProps) {
        super(props);
        this._handleEditFile = this._handleEditFile.bind(this);
        this._handleChangeModel = this._handleChangeModel.bind(this);
        this._handleChangeMarkers = this._handleChangeMarkers.bind(this);
    }

    /***
     *
     * Create monaco editor instance.
     * Create models according to props.files.
     * Set model to editor which is specified as props.path.
     * Set this._handleEditFile as listener of monaco.editor.onDidChangeModelContent
     *
     * TODO: this.props.pathが空文字列の場合もあるのでその対応
     * */
    componentDidMount() {
        const { files, path, onEditorContentChange, ...options } = this.props;

        // Generate Editor instance.
        const editor = monaco.editor.create(
            this._refEditorNode.current as HTMLDivElement,
            options
        );
        this._refEditor = editor;

        this._disposables = [editor];
        // Subscribe onChange handler for current model content.
        // NOTE: This subscription service does not need to be cancelled if the model is changed.
        // Because `onDidChangeModelContent` always listens to current model.
        this._disposables.push(
            editor.onDidChangeModelContent(this._handleEditFile)
        );
        this._disposables.push(
            editor.onDidChangeModel(this._handleChangeModel)
        );
        this._disposables.push(
            monaco.editor.onDidChangeMarkers(this._handleChangeMarkers)
        );

        // Set current path's model to editor.
        const currentFile = files.find((f) => f.getPath() === path);
        if (currentFile) {
            // Set specified model to editor.
            this._openFile(currentFile!, true);
        }

        // Load all the files  so the editor can provide proper intelliscense
        files.forEach((f) => this._initializeFile(f));

        this._refEditorNode.current &&
            this._refEditorNode.current.addEventListener(
                'resize',
                this._handleResize
            );
    }

    /***
     *
     *
     * */
    componentDidUpdate(prevProps: iProps, prevState: iState) {
        const { files, path, onEditorContentChange, ...options } = this.props;

        const selectedFile = files.find((f) => f.getPath() === path);
        // const previousFile = prevProps.files.find(f => f.getPath() === prevProps.path);

        if (this._refEditor) {
            console.log(`[MonacoEditor][did update] Selecting ${path}`);

            this._refEditor.updateOptions(options);

            const model = this._refEditor.getModel();
            const value = selectedFile?.getValue();

            // Change model and save view state if path is changed
            // if (path === prevProps.path) {
            if (path !== prevProps.path) {
                console.log(
                    `[MonacoEditor][did update] ${path} !== ${prevProps.path}`
                );

                // Save the editor state for the previous file so we can restore it when it's re-opened
                editorStates.set(
                    prevProps.path,
                    this._refEditor.saveViewState()
                );

                selectedFile && this._openFile(selectedFile, true);
            } else if (model && value !== model.getValue()) {
                console.log(`[MonacoEditor][did update] excuteEdits ${path}`);

                // @ts-ignore
                this._refEditor.executeEdits(null, [
                    {
                        range: model.getFullModelRange(),
                        text: value!,
                    },
                ]);
            }
        }
    }

    componentWillUnmount() {
        this._refEditorNode.current &&
            this._refEditorNode.current.removeEventListener(
                'resize',
                this._handleResize
            );
        this._disposables.forEach((d) => d.dispose());
        monaco.editor.getModels().forEach((m) => m.dispose());
    }

    /***
     * 渡されたfileをmonaco-editorのmodelとして登録する。
     *
     * @param {File} file - model登録するFile.
     *
     * 引数のfileの`monaco.editor.ITextModel`を生成する。
     * modelが生成済の場合、modelの変更内容をmodelに反映させる。
     * monaco-editorはmodelを生成すれば内部的にmodelを保存してくれて、
     * あとでmonaco.editor.getModels()などから取り出すことができる。
     *
     * */
    _initializeFile = (file: File) => {
        const path = file.getPath();
        const language = file.getLanguage();
        const value = file.getValue();

        let model = getModelByPath(path);

        if (model && !model.isDisposed()) {
            // @ts-ignore
            model.pushEditOperations(
                [],
                [
                    {
                        range: model.getFullModelRange(),
                        text: value,
                    },
                ]
            );
        } else {
            model = monaco.editor.createModel(
                value,
                language,
                // new monaco.Uri().with({ path })
                monaco.Uri.from({ scheme: 'file', path })
            );
            model.updateOptions({
                tabSize: 2,
                insertSpaces: true,
            });
        }
    };

    // _openFile = (path: string, value: string, focus?: boolean) => {
    _openFile = (file: File, focus?: boolean) => {
        this._initializeFile(file);

        const model = getModelByPath(file.getPath());

        if (this._refEditor && model) {
            this._refEditor.setModel(model);

            // Restore the editor state for the file
            const editorState = editorStates.get(file.getPath());

            if (editorState) {
                this._refEditor.restoreViewState(editorState);
            }

            if (focus) {
                this._refEditor.focus();
            }
        }
    };

    // onChange handler for current model content.
    _handleEditFile(e: monaco.editor.IModelContentChangedEvent): void {
        const model = this._refEditor?.getModel();
        if (model) {
            const value = model.getValue();
            const path = removeFirstSlash(model.uri.path);
            if (
                value !==
                this.props.files
                    .find((f) => f.getPath() === this.props.path)
                    ?.getValue()
            ) {
                this.props.onEditorContentChange(value, path);
            }
        }
    }

    // Save old model value to file.
    _handleChangeModel(e: monaco.editor.IModelChangedEvent) {
        const { oldModelUrl, newModelUrl } = e;

        // DEBUG:
        console.log(
            `[MonacoEditor][_handleChangeModel] old model url: ${oldModelUrl}`
        );
        console.log(
            `[MonacoEditor][_handleChangeModel] new model url: ${newModelUrl}`
        );

        if (oldModelUrl) {
            const model = monaco.editor
                .getModels()
                .find((m) => m.uri === oldModelUrl);

            // DEBUG:
            console.log(
                `[MonacoEditor][_handleChangeModel] old model url: ${oldModelUrl}`
            );

            model &&
                this.props.onDidChangeModel(
                    removeFirstSlash(oldModelUrl.path),
                    model.getValue()
                );
        }
    }

    _handleResize = () => {
        return this._refEditor && this._refEditor.layout();
    };

    _handleChangeMarkers() {
        const model = this._refEditor && this._refEditor.getModel();
        if (model === null) return;
        const uri = model.uri;
        const markers = monaco.editor.getModelMarkers({ resource: uri });

        // DEBUG:
        console.log(`[MonacoEditor][_handleChangeMarkers] ${uri}`);
        console.log(markers);
    }

    render() {
        return (
            <>
                <div className="monaco-editor" ref={this._refEditorNode}></div>
            </>
        );
    }
}
