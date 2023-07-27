import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
// import { TypeScriptWorker } from '../tsWorker';
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
const defaultCode = `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`;
const defaultPath = 'src/index.tsx';

export const Editor: React.FC = () => {
    const [compiled, setCompiled] = useState<string>(
        'Compiled code will be here!'
    );
    const divEl = useRef<HTMLDivElement>(null);
    let editor: monaco.editor.IStandaloneCodeEditor;
    let model: monaco.editor.ITextModel;
    useEffect(() => {
        console.log('on did mount');
        if (divEl.current) {
            editor = monaco.editor.create(divEl.current);
            model = monaco.editor.createModel(
                defaultCode,
                defaultLanguage,
                new monaco.Uri().with({ path: defaultPath })
            );
            editor.setModel(model);

            monaco.languages.typescript
                .getTypeScriptWorker()
                .then(
                    (
                        worker: (
                            ...uris: monaco.Uri[]
                        ) => Promise<monaco.languages.typescript.TypeScriptWorker>
                    ) => {
                        console.log(worker);
                        console.log(editor.getModel()!.uri);
                        return worker(editor.getModel()!.uri);
                    }
                )
                .then(
                    (client: monaco.languages.typescript.TypeScriptWorker) => {
                        console.log('client:');
                        console.log(client);
                        return client.getEmitOutput(model.uri.toString());
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
                .then((firstJs: ts.OutputFile | undefined) =>
                    setCompiled((firstJs && firstJs.text) || '')
                )
                .catch((e) => console.error(e));
        }
        return () => {
            console.log('on will unmount');
            model.dispose();
            editor.dispose();
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
                    return worker(editor.getModel()!.uri);
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
            .then((firstJs: ts.OutputFile | undefined) =>
                setCompiled((firstJs && firstJs.text) || '')
            )
            .catch((e) => console.error(e));
    };

    return (
        <div>
            <div className="Editor" ref={divEl}></div>
            {compiled}
            <button onClick={onClick}>COMPILE</button>
        </div>
    );
};
