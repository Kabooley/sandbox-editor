# 依存関係管理の改善

このブランチは`feat_footer`から派生した。

`src/worker/fetchLibs.worker.ts`の機能を`@typescript/ata`の機能のように改善して、

`react-dom/client`の型情報ファイルが取得できない問題を解決する。

codesandbox

## summary

## 変更内容

- `src/worker/fetchLibs.worker.ts`の内容を改善した。

- `@typescript/ata`の使用を停止して`src/worker/fetchLibs.worker.ts`を再び使うようにしたので`TypingLibsContext.tsx`の内容を変更した

-   `Object.entries()`を使うために、`tsconfig.json`の`lib`に`ES2017.Object`を追加した。

```diff
{
    "compilerOptions": {
        "sourceMap": true,
        "module": "ES2020",
        "moduleResolution": "node",
        "strict": true,
        "target": "ES6",
        "outDir": "./dist",
        "lib": [
            "dom",
            "es5",
            "es6",
            "ES2016",
            "es2015.collection",
            "es2015.promise",
+           "ES2017.Object",
            "WebWorker"
        ],
        "types": [],
        "baseUrl": "./node_modules",
        "jsx": "preserve",
        "esModuleInterop": true,
        "typeRoots": ["node_modules/@types"]
    },
    "include": ["./src/**/*"],
    "exclude": ["node_modules"]
}

```


## TypingLibsContext.tsx

おさらい

そもそもなぜcontextを使っているのか。

dependency installer --> value(module, version) --> fetchLibs.worker --> type files --> monaco.addExtraLibs(type files) & dependency list

ということでアプリケーションを大きくまたがる（dependency instalerからmonacoへ）必要があるから

Layout/index.tsx 
```TypeScript
const Layout = (): JSX.Element => {
    return (
        <>
            <LayoutStateProvider>
                <Header />
                <MainContainer>
                    <NavigationSection />
                    <SplitPane>
                        <FilesProvider>
                            <BundledCodeProvider>
                                <TypingLibsProvider>
                                    // <DependenciesProvider>
                                        <PaneSection />
                                        <EditorSection />
                                        <PreviewSection />
                                    // </DependenciesProvider>
                                </TypingLibsProvider>
                            </BundledCodeProvider>
                        </FilesProvider>
                    </SplitPane>
                </MainContainer>
                <FooterSection />
            </LayoutStateProvider>
        </>
    );
};

```
```TypeScript
// EditorContext.tsx
import { TypingLibsContext } from './TypingLibsContext';

const EditorContext = ({ width }: iProps) => {

    const addTypings = React.useContext(TypingLibsContext);
    // ...

    return (
        // ...
    );
};
```

ということで`addTypings`へインストールさせたいライブラリ名を渡せばcontextでやってくれるということらしい。

contextでworkerは管理できるか？

## TypingLibsContext.tsxでworkerを扱う

とにかくわけわからんが次のエラーが出る。workerでmonacoを呼び出していないだろーが！

```bash
error
: 
ReferenceError: window is not defined at eval (webpack://sandbox-editor/./node_modules/monaco-editor/esm/vs/base/browser/browser.js?:117:22) at ./node_modules/monaco-editor/esm/vs/base/browser/browser.js (http://localhost:8080/vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:832:1) at options.factory (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:790:31) at __webpack_require__ (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:208:33) at fn (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:429:21) at eval (webpack://sandbox-editor/./node_modules/monaco-editor/esm/vs/editor/browser/config/fontMeasurements.js?:5:82) at ./node_modules/monaco-editor/esm/vs/editor/browser/config/fontMeasurements.js (http://localhost:8080/vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:3153:1) at options.factory (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:790:31) at __webpack_require__ (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:208:33) at fn (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:429:21)
message
: 
"window is not defined"
stack
: 
"ReferenceError: window is not defined\n    at eval (webpack://sandbox-editor/./node_modules/monaco-editor/esm/vs/base/browser/browser.js?:117:22)\n    at ./node_modules/monaco-editor/esm/vs/base/browser/browser.js (http://localhost:8080/vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:832:1)\n    at options.factory (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:790:31)\n    at __webpack_require__ (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:208:33)\n    at fn (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:429:21)\n    at eval (webpack://sandbox-editor/./node_modules/monaco-editor/esm/vs/editor/browser/config/fontMeasurements.js?:5:82)\n    at ./node_modules/monaco-editor/esm/vs/editor/browser/config/fontMeasurements.js (http://localhost:8080/vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:3153:1)\n    at options.factory (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:790:31)\n    at __webpack_require__ (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:208:33)\n    at fn (http://localhost:8080/src_worker_fetchLibs_worker_ts.bundle.js:429:21)"
[[Prototype]]

```

```bash
eval (browser.js:117:22)
    at ./node_modules/monaco-editor/esm/vs/base/browser/browser.js (vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:832:1)
    at options.factory (src_worker_fetchLibs_worker_ts.bundle.js:790:31)
    at __webpack_require__ (src_worker_fetchLibs_worker_ts.bundle.js:208:33)
    at fn (src_worker_fetchLibs_worker_ts.bundle.js:429:21)
    at eval (fontMeasurements.js:5:82)
    at ./node_modules/monaco-editor/esm/vs/editor/browser/config/fontMeasurements.js (vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:3153:1)
    at options.factory (src_worker_fetchLibs_worker_ts.bundle.js:790:31)
    at __webpack_require__ (src_worker_fetchLibs_worker_ts.bundle.js:208:33)
    at fn (src_worker_fetchLibs_worker_ts.bundle.js:429:21)
eval @ browser.js:117
./node_modules/monaco-editor/esm/vs/base/browser/browser.js @ vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:832
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ fontMeasurements.js:5
./node_modules/monaco-editor/esm/vs/editor/browser/config/fontMeasurements.js @ vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:3153
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ standaloneEditor.js:30
./node_modules/monaco-editor/esm/vs/editor/standalone/browser/standaloneEditor.js @ vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:7124
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ editor.api.js:20
./node_modules/monaco-editor/esm/vs/editor/editor.api.js @ vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:6970
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ monaco.contribution.js:2
./node_modules/monaco-editor/esm/vs/basic-languages/monaco.contribution.js @ vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:2647
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ editor.main.js:18
./node_modules/monaco-editor/esm/vs/editor/editor.main.js @ vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_semver_index_js--b00080.bundle.js:6981
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ getModelByPath.ts:5
./src/utils/getModelByPath.ts @ src_worker_fetchLibs_worker_ts.bundle.js:59
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ index.ts:17
./src/utils/index.ts @ src_worker_fetchLibs_worker_ts.bundle.js:69
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
fn @ src_worker_fetchLibs_worker_ts.bundle.js:429
eval @ fetchLibs.worker.ts:11
./src/worker/fetchLibs.worker.ts @ src_worker_fetchLibs_worker_ts.bundle.js:169
options.factory @ src_worker_fetchLibs_worker_ts.bundle.js:790
__webpack_require__ @ src_worker_fetchLibs_worker_ts.bundle.js:208
(anonymous) @ src_worker_fetchLibs_worker_ts.bundle.js:230
__webpack_require__.O @ src_worker_fetchLibs_worker_ts.bundle.js:265
__webpack_require__.x @ src_worker_fetchLibs_worker_ts.bundle.js:231
Promise.then (async)
__webpack_require__.x @ src_worker_fetchLibs_worker_ts.bundle.js:1363
(anonymous) @ src_worker_fetchLibs_worker_ts.bundle.js:1371
(anonymous) @ src_worker_fetchLibs_worker_ts.bundle.js:1373
```