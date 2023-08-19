import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react';
import * as monaco from 'monaco-editor';
import ts from 'typescript';
import * as ATA from '@typescript/ata';
import * as tsvfs from '@typescript/vfs';
import type { iFile } from '../data/files';
import { getFilenameFromPath, getModelByPath } from '../utils';

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

interface iProps {
    files: iFile[];
}

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
// const defaultCode = `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = (): JSX.Element => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`;
// const defaultPath = 'src/index.tsx';

const extraLibs = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();

const ataConfig: ATA.ATABootstrapConfig = {
    projectName: 'My ATA Project',
    typescript: ts,
    logger: console,
    delegate: {
        receivedFile: (code: string, path: string) => {
            // Add code to your runtime at the path...
            console.log('[ata][recievedFile] path:');
            console.log(path);
        },
        started: () => {
            console.log('ATA start');
        },
        progress: (downloaded: number, total: number) => {
            console.log(`Got ${downloaded} out of ${total}`);
        },
        finished: (vfs) => {
            console.log('ATA done', vfs);
            for (const [key, value] of vfs.entries()) {
                const cachedLib = extraLibs.get(key);
                if (cachedLib) {
                    cachedLib.js.dispose();
                    cachedLib.ts.dispose();
                }
                // Monaco Uri parsing contains a bug which escapes characters unwantedly.
                // This causes package-names such as `@expo/vector-icons` to not work.
                // https://github.com/Microsoft/monaco-editor/issues/1375
                let uri = monaco.Uri.from({
                    scheme: 'file',
                    path: key,
                }).toString();
                if (key.includes('@')) {
                    uri = uri.replace('%40', '@');
                }

                const js =
                    monaco.languages.typescript.javascriptDefaults.addExtraLib(
                        value,
                        uri
                    );
                const ts =
                    monaco.languages.typescript.typescriptDefaults.addExtraLib(
                        value,
                        uri
                    );

                extraLibs.set(key, { js, ts });
            }
        },
    },
};

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
    // const model = useRef<monaco.editor.ITextModel>();
    const disposable = useRef<monaco.IDisposable[]>([]);
    const ata = useCallback(ATA.setupTypeAcquisition(ataConfig), []);
    const vfsenv = useMemo(() => {
        const customTransformers = {
            /* わからんからから */
        };
        const vfs = new Map<string, string>();
        const system = tsvfs.createSystem(vfs);
        return tsvfs.createVirtualTypeScriptEnvironment(
            system,
            [],
            ts,
            compilerOptions,
            customTransformers
        );
    }, []);

    useEffect(() => {
        console.log('on did mount');
        if (divEl.current) {
            const selectedFile = files.find((f) => f.path === 'src/index.tsx');
            editor.current = monaco.editor.create(divEl.current);
            // model.current = monaco.editor.createModel(
            //     selectedFile!.value,
            //     defaultLanguage,
            //     new monaco.Uri().with({ path: selectedFile!.path })
            // );
            // editor.current.setModel(model.current);

            disposable.current.push(
                editor.current.onDidChangeModelContent(onDidChangeContent)
            );

            openFile(selectedFile!);
            files.forEach((f) => {
                if (f.isFolder) return;
                initializeFile(f);
                addVfsAsLib(f);
            });
            generateVFS(files);
            sendTsCompiler();
            ata(editor.current.getModel()!.getValue());
        }

        return () => {
            // DEBUG:
            console.log('on will unmount');

            monaco.editor.getModels().forEach((m) => m.dispose());
            editor.current && editor.current.dispose();
            disposable.current &&
                disposable.current.forEach((d) => d.dispose());
        };
    }, []);

    useEffect(() => {
        console.log('[Editor][Did update]');

        console.log(
            monaco.languages.typescript.typescriptDefaults.getExtraLibs()
        );
        console.log(monaco.editor.getModels());
    });

    const onClick = async () => {
        // DEBUG:
        console.log('[Editor] onClick COMPILE');
        sendTsCompiler();
    };

    const onDidChangeContent = (e: monaco.editor.IModelContentChangedEvent) => {
        const model = editor.current?.getModel();
        if (model) {
            ata(model.getValue());
            handleMarkers();
            console.log(vfsenv.getSourceFile(getFilenameFromPath('index.tsx')));
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

    const generateVFS = (files: iFile[]) => {
        // Send files to tsvfs
        files.forEach((f) => {
            if (!f.isFolder) {
                vfsenv.createFile(
                    (
                        monaco.Uri.from({
                            scheme: 'file',
                            path: getFilenameFromPath(f.path),
                        }) as monaco.Uri
                    ).toString(),
                    f.value
                );
            }
        });
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

    const addVfsAsLib = (file: iFile) => {
        const cachedLib = extraLibs.get(file.path);
        if (cachedLib) {
            cachedLib.js.dispose();
            cachedLib.ts.dispose();
        }
        // Monaco Uri parsing contains a bug which escapes characters unwantedly.
        // This causes package-names such as `@expo/vector-icons` to not work.
        // https://github.com/Microsoft/monaco-editor/issues/1375
        let uri = monaco.Uri.from({
            scheme: 'file',
            path: file.path,
        }).toString();
        if (file.path.includes('@')) {
            uri = uri.replace('%40', '@');
        }

        const js = monaco.languages.typescript.javascriptDefaults.addExtraLib(
            file.value,
            uri
        );
        const ts = monaco.languages.typescript.typescriptDefaults.addExtraLib(
            file.value,
            uri
        );

        extraLibs.set(file.path, { js, ts });
    };

    return (
        <div>
            <div className="Editor" ref={divEl}></div>
            {compiled}
            <button onClick={onClick}>COMPILE</button>
        </div>
    );
};
