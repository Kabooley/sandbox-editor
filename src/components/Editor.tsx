import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import ts from 'typescript';
import * as ATA from '@typescript/ata';
import tsvfs from '@typescript/vfs';

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
    //   paths: {
    //     '*': ['*', '*.native', '*.ios', '*.android'],
    //   },
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
);

interface iProps {}

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
const defaultCode = `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = (): JSX.Element => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`;
const defaultPath = 'src/index.tsx';

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
            console.log('[ata][recievedFile] code:');
            console.log(code);
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

export const Editor: React.FC<iProps> = () => {
    const [compiled, setCompiled] = useState<string>(
        'Compiled code will be here!'
    );
    const divEl = useRef<HTMLDivElement>(null);
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const model = useRef<monaco.editor.ITextModel>();
    const disposable = useRef<monaco.IDisposable[]>([]);
    const ata = useCallback(ATA.setupTypeAcquisition(ataConfig), []);

    useEffect(() => {
        console.log('on did mount');
        if (divEl.current) {
            editor.current = monaco.editor.create(divEl.current);
            model.current = monaco.editor.createModel(
                defaultCode,
                defaultLanguage,
                new monaco.Uri().with({ path: defaultPath })
            );
            editor.current.setModel(model.current);

            disposable.current.push(
                editor.current.onDidChangeModelContent(onDidChangeContent)
            );

            monaco.languages.typescript
                .getTypeScriptWorker()
                .then(
                    (
                        worker: (
                            ...uris: monaco.Uri[]
                        ) => Promise<monaco.languages.typescript.TypeScriptWorker>
                    ) => {
                        console.log(worker);
                        console.log(editor.current!.getModel()!.uri);
                        return worker(editor.current!.getModel()!.uri);
                    }
                )
                .then(
                    (client: monaco.languages.typescript.TypeScriptWorker) => {
                        console.log('client:');
                        console.log(client);
                        return client.getEmitOutput(
                            model.current!.uri.toString()
                        );
                    }
                )
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
        }
        return () => {
            // DEBUG:
            console.log('on will unmount');

            model.current && model.current.dispose();
            editor.current && editor.current.dispose();
            disposable.current &&
                disposable.current.forEach((d) => d.dispose());
        };
    }, []);

    const onClick = async () => {
        // DEBUG:
        console.log('[Editor] onClick COMPILE');

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
                return client.getEmitOutput(model.current!.uri.toString());
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

    const onDidChangeContent = (e: monaco.editor.IModelContentChangedEvent) => {
        const model = editor.current?.getModel();
        if (model) {
            ata(model.getValue());
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

    return (
        <div>
            <div className="Editor" ref={divEl}></div>
            {compiled}
            <button onClick={onClick}>COMPILE</button>
        </div>
    );
};
