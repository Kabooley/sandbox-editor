import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import type * as ts from 'typescript';

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

interface iProps {
    onTranspile: (param: string) => void;
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
const defaultCode = `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = (): JSX.Element => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`;
const defaultPath = 'src/index.tsx';

export const Editor: React.FC<iProps> = ({ onTranspile }) => {
    const [compiled, setCompiled] = useState<string>(
        'Compiled code will be here!'
    );
    const divEl = useRef<HTMLDivElement>(null);
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const model = useRef<monaco.editor.ITextModel>();
    const disposable = useRef<monaco.IDisposable[]>([]);

    // let editor: monaco.editor.IStandaloneCodeEditor;
    // let model: monaco.editor.ITextModel;
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

            disposable.current.push(editor.current.onDidChangeModelContent(onDidChangeContent));

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
                    // onTranspile((firstJs && firstJs.text) || '');
                })
                .catch((e) => console.error(e));
        }
        return () => {
            console.log('on will unmount');
            model.current!.dispose();
            editor.current!.dispose();
        };
    }, []);

    const onClick = async () => {
        // DEBUG:
        console.log('[Editor] onClick');

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
                // onTranspile((firstJs && firstJs.text) || '');
            })
            .catch((e) => console.error(e));
    };

    const onDidChangeContent = (e: monaco.editor.IModelContentChangedEvent) => {
        const model = editor.current?.getModel();
        if(model) {
            console.log(model.getValue());
            handleMarkers();
        }
    };

    const handleMarkers = () => {
        const model = editor.current?.getModel();
        if(model) {
            const marker = monaco.editor.getModelMarkers({ resource: model.uri });
            if(!marker.length) { console.log('No errors'); }
            console.log("marker:");
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
