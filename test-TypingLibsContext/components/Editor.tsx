import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
    useContext,
} from 'react';
import * as monaco from 'monaco-editor';
import ts from 'typescript';
// import * as ATA from '@typescript/ata';
// import * as tsvfs from '@typescript/vfs';
import type { iFile } from '../data/files';
import { getFilenameFromPath, getModelByPath } from '../utils';
import { TypingLibsContext } from '../context/TypingLibsContext';

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
    resolveJsonModule: true,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    // noEmit: true,        // To avoid `emitSkipped` be true when TypeScriptWorker..client.getEmitOutput
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
);

interface iProps {
    files: iFile[];
};

const isJSLang = false;

// https://microsoft.github.io/monaco-editor/docs.html#functions/languages.typescript.getTypeScriptWorker.html
// https://microsoft.github.io/monaco-editor/docs.html#interfaces/languages.typescript.TypeScriptWorker.html
//
// `getTypeScriptWorker` returns Promise<TypeScriptWorker>
// const getWorker = isJSLang
//     ? monaco.languages.typescript.getJavaScriptWorker
//     : monaco.languages.typescript.getTypeScriptWorker;

// DO NOT "TypeScript". Always lower case
const defaultLanguage = 'typescript';
const defaultPath = 'src/index.tsx';

/***
 *
 *
 * Uriの生成は`monaco.from({ scheme: 'file', path: YOURPATH })`で統一する
 * */
export const Editor: React.FC<iProps> = ({ files }) => {
    const [compiled, setCompiled] = useState<string>(
        'Compiled code will be here!'
    );
    const divEl = useRef<HTMLDivElement>(null);
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const disposable = useRef<monaco.IDisposable[]>([]);
    const addTypings = useContext(TypingLibsContext);

    useEffect(() => {
        console.log('on did mount');
        if (divEl.current) {
            const selectedFile = files.find((f) => f.path === defaultPath);
            editor.current = monaco.editor.create(divEl.current);

            disposable.current.push(
                editor.current.onDidChangeModelContent(onDidChangeContent)
            );

            // DEBUG:
            console.log('[Editor] addTypings');
            console.log(addTypings);

            openFile(selectedFile!);
            files.forEach((f) => {
                if (f.isFolder) return;
                initializeFile(f);
                addTypings(
                    f.value,
                    monaco.Uri.from({ scheme: 'file', path: f.path }).toString()
                );
            });
            sendTsCompiler();
        }

        return () => {
            // DEBUG:
            console.log('[Editor][Will unmount]');

            monaco.editor.getModels().forEach((m) => m.dispose());
            editor.current && editor.current.dispose();
            disposable.current &&
                disposable.current.forEach((d) => d.dispose());
        };
    }, []);

    useEffect(() => {});

    const onClick = async () => {
        // DEBUG:
        console.log('[Editor] onClick COMPILE');
        sendTsCompiler();
    };

    const onDidChangeContent = (e: monaco.editor.IModelContentChangedEvent) => {
        const model = editor.current?.getModel();
        if (model) {
            addTypings(model.getValue(), model.uri.toString());
            handleMarkers();
        }
    };

    const handleMarkers = () => {
        const model = editor.current?.getModel();
        if (model) {
            const marker = monaco.editor.getModelMarkers({
                resource: model.uri,
            });
            if (!marker.length) {
                console.log('No errors');
            }
            console.log('marker:');
            console.log(marker);
        }
    };

    const sendTsCompiler = () => {
        const model = editor.current!.getModel();

        if (!model) {
            return;
        }

        monaco.languages.typescript
            .getTypeScriptWorker()
            .then(
                (
                    worker: (
                        ...uris: monaco.Uri[]
                    ) => Promise<monaco.languages.typescript.TypeScriptWorker>
                ) => {
                    console.log(worker);
                    return worker(editor.current!.getModel()!.uri);
                }
            )
            .then((client: monaco.languages.typescript.TypeScriptWorker) => {
                console.log('client:');
                console.log(client);
                return client.getEmitOutput(model.uri.toString());
            })
            .then((result: ts.EmitOutput) => {
                console.log('result:');
                console.log(result);
                return result.outputFiles.find(
                    (o: any) =>
                        o.name.endsWith('.js') || o.name.endsWith('.jsx')
                );
            })
            .then((firstJs: ts.OutputFile | undefined) => {
                setCompiled((firstJs && firstJs.text) || '');
            })
            .catch((e) => console.error(e));
    };

    // monaco-editor model generate.
    const initializeFile = (file: iFile) => {
        let model = getModelByPath(file.path);

        if (model && !model.isDisposed()) {
            // @ts-ignore
            model.pushEditOperations(
                [],
                [
                    {
                        range: model.getFullModelRange(),
                        text: file.value,
                    },
                ]
            );
        } else {
            model = monaco.editor.createModel(
                file.value,
                file.language,
                new monaco.Uri().with({ scheme: 'file', path: file.path })
            );
            model.updateOptions({
                tabSize: 2,
                insertSpaces: true,
            });
        }
    };

    // set model
    const openFile = (file: iFile, focus?: boolean) => {
        initializeFile(file);

        const model = getModelByPath(file.path);

        if (editor.current && model) {
            editor.current.setModel(model);
            // ...
        }
    };

    return (
        <div>
            <div className="Editor" ref={divEl}></div>
            {compiled}
            <button onClick={onClick}>COMPILE</button>
        </div>
    );
};
