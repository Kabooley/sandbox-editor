/*******************************************************************************
 * Component that links monaco-editor wrapper class with application functions.
 *
 * Features:
 *
 * - Dispatch changeFile action when editor content changed.
 * - Dispatch bundle action when editor content changed.
 * - Dispatch updatePackageJson action if change content is value of package.json file.
 * - Registers latest files to monaco-editor's extraLibs.
 *
 *******************************************************************************/
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type { SerializedError } from '@reduxjs/toolkit';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import type { iFile } from '../data/types';

import MonacoEditor from './Monaco/MonacoEditor';
import TabsAndActionsContainer from './TabsAndActions';
import EditorNoSelectedFile from './NoSelectedEditor';
import { selectFiles, filesActions } from '../slices/filesSlice';
import { bundler } from '../slices/bundlerSlice';
import {
    updatePackageJson,
    reflectDependenciesToPackageJson,
} from '../slices/packageJsonSlice';
import { generateTreeForBundler, getFilenameFromPath } from '../utils';
import { usePrevious } from '../hooks/usePrevious';

const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions =
    {
        language: 'typescript',
        lineNumbers: 'off',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        theme: 'vs-dark',
        dragAndDrop: false,
        automaticLayout: true, // NOTE: これ設定しておかないとリサイズ時に壊れる
    };

const delay = 500;
const $FiveSec = 5000;

// Store details about typings we have loaded.
const extraLibs = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();

interface iProps {
    width: number;
}

const EditorContainer = ({ width }: iProps) => {
    const { files } = useAppSelector(selectFiles);
    const dispatch = useAppDispatch();
    const { changeSelectedFile, changeFile } = filesActions;
    const previousFiles = usePrevious<iFile[]>(files);
    const refDebounceAddTypingTimer = useRef<
        ReturnType<typeof setTimeout> | undefined
    >();
    const refDebounceBundleTimer = useRef<
        ReturnType<typeof setTimeout> | undefined
    >();
    const refDebounceUpdatePackageJsonTimer = useRef<
        ReturnType<typeof setTimeout> | undefined
    >();

    /***
     * - Registeres all files to monaco-editor extraLibs.
     * - Requests all dependencies in package.json.
     *
     * */
    useEffect(() => {
        files.forEach((f) => {
            addExtraLibs(f.value, f.path);
        });

        const packageJson = files.find((f) => f.path === 'package.json');
        if (packageJson !== undefined) {
            _updatePackageJson(packageJson.value);
        }
    }, []);

    /***
     * File may changes its properties or added, and deleted.
     *
     * This function handles when file has been...
     * added, deleted, changed file.path.
     *
     * Not handles when file has been...
     * changed file.selected, file.isOpened, file.value
     *
     * NOTE: renameされたfileのリネーム前の該当ファイルはextraLibsから削除されていない。
     * どのデータが該当のファイルか特定できないからである。
     * すべてfilesに基づいて毎度まるっとextralibsをすべて更新した方がいいのかも
     * */
    useEffect(() => {
        if (previousFiles !== undefined) {
            const didFileDelete = previousFiles.length > files.length;

            for (const file of files) {
                if (
                    previousFiles.find((f) => f.path === file.path) ===
                    undefined
                ) {
                    // New File has added, or file's path changed.
                    // いずれの場合も結局`addExtraLibs`へ渡すだけ
                    // rename前のpathに該当するextralibsファイルは削除できない
                    // どれか判別できないけど、extralibsに残っていても問題ないから
                    addExtraLibs(file.value, file.path);
                }
            }
            if (didFileDelete) {
                const prevFilesPath = previousFiles.map((pf) => pf.path);
                const currentFilesPath = files.map((pf) => pf.path);
                // deletedFile: prevFilesPathには存在してcurrentFilesPathには存在しない要素駆らなる配列
                const deletedFiles = prevFilesPath.filter(
                    (pf) => currentFilesPath.indexOf(pf) === -1
                );
                deletedFiles.forEach((df) => _removeFileFromExtraLibs(df));
            }
        }
    }, [files]);

    /**
     * Dispatches code to filesSlice to update file's value.
     * Debounces dispatching bundle action.
     * Debounces dispatching updatePackageJson action.
     * Debounces updating package.json dependencies if selected file is package.json.
     *
     * @param {string} code - current model code onDidChangeModelContent.
     * @param {string} path - File path of current model.
     * */
    const _onEditorContentChange = (code: string, path: string) => {
        dispatch(
            changeFile({
                targetFilePath: path,
                changeProp: {
                    newValue: code,
                },
            })
        );
        // Debouncing adding code typings.
        if (refDebounceAddTypingTimer.current !== undefined) {
            clearTimeout(refDebounceAddTypingTimer.current);
        }
        refDebounceAddTypingTimer.current = setTimeout(
            () => _addTypings(code, path),
            delay
        );
        // Debouncing bundling
        if (refDebounceBundleTimer.current !== undefined) {
            clearTimeout(refDebounceBundleTimer.current);
        }
        refDebounceBundleTimer.current = setTimeout(() => _onBundle(), delay);
        // Debouncing updating package.json file dependencies
        if (path === 'package.json') {
            if (refDebounceUpdatePackageJsonTimer.current !== undefined) {
                clearTimeout(refDebounceUpdatePackageJsonTimer.current);
            }
            refDebounceUpdatePackageJsonTimer.current = setTimeout(() => {
                _updatePackageJson(code);
            }, $FiveSec);
        }
    };

    /***
     * Send all files to bundle.worker to bundle them.
     * */
    const _onBundle = () => {
        dispatch(
            bundler({
                entryPoint: getFilenameFromPath('src/index.tsx'),
                tree: generateTreeForBundler(files),
            })
        );
    };

    /***
     * @param {string} oldModelpath -
     * @param {string} newModelpath -
     * @param {string} oldModelpath -
     *
     * oldModelPathのfileのvalueを保存する
     * NOTE: この処理要らないかも。
     * */
    const _onDidChangeModel = (oldModelPath: string, newModelPath: string) => {
        console.log(
            `[EditorContainer][_onDidChangeModel] old model path: ${oldModelPath}`
        );
    };

    const _onChangeSelectedTab = (selected: string) => {
        dispatch(changeSelectedFile({ selectedFilePath: selected }));
    };

    /***
     *
     * */
    const _addTypings = (code: string, path: string) => {
        addExtraLibs(code, path);
    };

    /***
     * filesから`selected: true`のファイルを取り出して
     * `tabIndex`順に並び変えた配列にして返す。
     *
     * https://stackoverflow.com/a/1129270/22007575
     * */
    const getFilesOpening = (files: iFile[]) => {
        return files
            .filter((f) => f.opening)
            .sort((a: iFile, b: iFile): number => {
                if (a.tabIndex! < b.tabIndex!) {
                    return -1;
                }
                if (a.tabIndex! > b.tabIndex!) {
                    return 1;
                }
                return 0;
            });
    };

    /***
     * NOTE: THIS METHOD IS ONLY FOR files NOT FOR DEPENDENCIES.
     * Managing extraLibs is seperating.
     * ExtraLibs for dependencies is typingLibsSlice.ts's responsiblity.
     *
     * Register path and code to monaco.language.[type|java]script addExtraLibs.
     * Reset code if passed path has already been registered.
     * */
    const addExtraLibs = (code: string, path: string) => {
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
    };

    /***
     * Dispose monaco-editor IExtraLibs.
     *
     * */
    const _removeFileFromExtraLibs = (path: string) => {
        const cachedLib = extraLibs.get(path);
        if (cachedLib) {
            cachedLib.js.dispose();
            cachedLib.ts.dispose();
            extraLibs.delete(path);
        }
    };

    const _updatePackageJson = (code: string) => {
        dispatch(updatePackageJson(code))
            .unwrap()
            // 問題なかった場合だけpackage.jsonを更新させる
            .then(() => dispatch(reflectDependenciesToPackageJson()))
            .catch((rejectedValue: SerializedError) => {
                dispatch(reflectDependenciesToPackageJson());
                console.error('[TestPackageJsonManagement] there was an error');
                console.error(rejectedValue.name + ' ' + rejectedValue.message);
                console.error(rejectedValue.stack);
            });
    };

    const selectedFilePath = files.find((f) => f.selected);
    const filesOpening = getFilesOpening(files);

    if (filesOpening.length) {
        return (
            <>
                <TabsAndActionsContainer
                    selectedFile={selectedFilePath}
                    onChangeSelectedTab={_onChangeSelectedTab}
                    width={width}
                    filesOpening={filesOpening}
                />
                <MonacoEditor
                    files={files}
                    selectedFile={selectedFilePath}
                    onEditorContentChange={_onEditorContentChange}
                    onDidChangeModel={_onDidChangeModel}
                    {...editorConstructOptions}
                />
            </>
        );
    } else {
        return (
            <>
                <TabsAndActionsContainer
                    selectedFile={selectedFilePath}
                    onChangeSelectedTab={_onChangeSelectedTab}
                    width={width}
                    filesOpening={filesOpening}
                />
                <EditorNoSelectedFile />
            </>
        );
    }
};

export default EditorContainer;
