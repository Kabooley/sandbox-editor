# Tips of React.js

## summary

- [公式：advanced-guides](#公式：advanced-guides)

## How to type React childern

結論：`any`

https://github.com/microsoft/TypeScript/issues/6471#issuecomment-171456118

typescriptコミュニティメンバー曰く、

React childrenはReact特化のめんどくさい代物だからanyでいいとのこと。

## Reactコンポーネントじゃないモジュールは状態を持つことはできるのか

結論:できる。

EcmaScriptのモジュールなので、そこはReactとか関係ない。

そのモジュールはReactのシステムの外になるので、その状態がReactコンポーネントの再レンダリングを起こすべきものならば`useEffect`で使うことになる。

理由：

モジュールの状態の変化は再レンダリングを起こさないから。当然だけどReactの外部なのでReactはそれ等に関知しないから。


```TypeScript
// AtaProvider.ts (NOT REACT CMPONENT)
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import ts from 'typescript';
import * as ATA from '@typescript/ata';
import * as monaco from 'monaco-editor';

type iExtraLibsMap = Map<
    string,
    {
        js: monaco.IDisposable;
        ts: monaco.IDisposable;
    }
>;

const extraLibs: iExtraLibsMap = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();

const ataConfig: ATA.ATABootstrapConfig = {
  // ...
};

export const ata = ATA.setupTypeAcquisition(ataConfig);

export const getExtraLibs = () => {
    return extraLibs;
};

console.log('[ataProvider] is this refreshed every render?');
```
```TypeScript
// React component
import { ata, getExtraLibs } from './AtaProvider';

// ...
useEffect(() => {
  console.log(getExtraLibs);
});
```

上記を実行すると毎レンダリング時にextraLibsを更新してもextraLibsは以前の値を覚えているので状態を保っているのがわかる。

この辺はReactあるなし関係なくモジュールを使う場合と同じ。


注意：

確認していないからわからんけど、この外部モジュールを複数のReactコンポーネントから呼出した場合、すべて同じ状態を返してくれるのかはわからない。

これを知ってどうするのか？:

`React.creactContext`と外部モジュールの使い分けがわかる。

`React.createContext`はReactシステムなので便利である一方、制約が多い。

外部モジュールに頼りすぎるとReactシステム外部の処理の依存度が高まってコードが複雑になる。

## Scailing up with reducer and contextの制約

https://react.dev/learn/scaling-up-with-reducer-and-context

**React.useReducerは、`useState`の別バージョンなので、一つのstateとそのstateのreducerしか持つことはできない。**

つまり、`Reducer + Context`は拡張された`useState`と捉えることができる。

```TypeScript
// 例：
export const FilesProvider = ({ children }: { children: React.ReactNode }) => {
    const [files, dispatch] = useReducer(filesReducer, initialFiles);

    return (
        <FilesContext.Provider value={files}>
            <FilesDispatchContext.Provider value={dispatch}>
                {children}
            </FilesDispatchContext.Provider>
        </FilesContext.Provider>
    );
};

export function useFiles() {
    return useContext(FilesContext);
}

export function useFilesDispatch() {
    return useContext(FilesDispatchContext);
}
```

なので`FilesProvider`の関心事は`files`と`dispatch`のみである。

通常`useState`を使うときに出来ないようなことを`Reducer + Context`に求めてはならない。

#### `Reducer + Context`は巨大なオブジェクトを状態管理しても大丈夫なのか？

別に巨大なオブジェクトであってもいいと思うけど、

`useState`でも同様に扱うかという観点で見ると、分離するべき関心事は分離して別の`Reducer + Context`で扱うべきかと。

問題はオブジェクトのディープコピーを毎度行わないといけないとかのパフォーマンスの問題かと。

#### 多すぎる`Reducer +　Context`は問題か？

別に問題はない。

なぜなら`Reducer +　Context`は`useState`の拡張版だから。

すっきりさせたいなら次の方法を試せばいいとのこと。

https://stackoverflow.com/questions/51504506/too-many-react-context-providers

## Hooks は ReactComponent のなかからしか呼び出せないよ

なので例えば custom context のなかで、

```TypeScript
import usePackage from '../hooks/usePackage';

// outside of React component...
const package = usePackage();       // ERROR!
```

```
Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
const packageJson = usePackageJson();
const packageJsonCode = JSON.parse(packageJson.getValue());
```

## context関係

#### context provider以下のコンポーネントはcontextのstateが更新されるたびにすべて再レンダリングされる

> React は、異なる値を受け取るプロバイダーから開始して、**特定のコンテキストを使用するすべての子を自動的に再レン​​ダリングします。**前の値と次の値は Object.is 比較で比較されます。**`React.memo`を使用して再レンダリングをスキップしても、子が新しいコンテキスト値を受け取ることは妨げられません。** 

ということでuseMemo()を使った工夫を見かけるけれど、それは再レンダリングを制御できないということが分かった。

#### contextは工夫すれば関数を渡せる

https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions

contextが渡せる値は、簡潔な値だけではなくオブジェクトも関数も渡すことができる。

関数を渡す場合の注意点：

- 渡したい関数は、Providerを返すコンポーネントが更新されるたびに「新しい関数」になり、再レンダリングが起こる。

関数が新しくなったとしてもそれで再レンダリングが起こってほしくはない場合がほとんどだと思うので、

contextが関数を扱ってもやたら再レンダリングが起こらないようにしたいとき。


```JavaScript
function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);

  // 通常の関数を渡すだけだと、毎呼出でloginは新しく生成される
  function login(response) {
    storeCredentials(response.credentials);
    setCurrentUser(response.user);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      <Page />
    </AuthContext.Provider>
  );
}
```

そのためuseCallbackとuseMemoを使って再レンダリングを制御できる。

```diff
import { useCallback, useMemo } from 'react';

function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);

-  function login(response) {
-    storeCredentials(response.credentials);
-    setCurrentUser(response.user);
-  }

+  const login = useCallback((response) => {
+    storeCredentials(response.credentials);
+    setCurrentUser(response.user);
+  }, []);

+  const contextValue = useMemo(() => ({
+    currentUser,
+    login
+  }), [currentUser, login]);

  return (
    <AuthContext.Provider value={contextValue}>
      <Page />
    </AuthContext.Provider>
  );
}
```

同じことは関数だけではなくてオブジェクトでも通用するかも？

## 公式：advanced-guides

- [code splitting](#code-splitting)
- [context](#context)

#### code splitting

https://legacy.reactjs.org/docs/code-splitting.html

バンドリングのパフォーマンスの話。

webpack等を使ってコードをバンドルすると、アプリケーションの成長に従ってバンドルサイズも肥大化してくる。

とくにサードパーティライブラリを含めるととくに顕著である。

> 大量のバンドルが必要になることを避けるには、問題を先取りしてバンドルを「分割」し始めることをお勧めします。コード分​​割は、Webpack、Rollup、Browserify (factor-bundle 経由) などのバンドラーでサポートされる機能で、実行時に動的にロードできる複数のバンドルを作成できます。

> アプリをコード分割すると、ユーザーが現在必要としているものだけを「遅延読み込み」することができ、アプリのパフォーマンスを大幅に向上させることができます。アプリ内のコード全体の量は減っていませんが、ユーザーが必要としないコードの読み込みを避け、初期読み込み時に必要なコードの量を減らしました。


ということで適切に`lazy-load`を使って必要な時に必要なものをロードするようにすれば、初期読み込み時に必要なコード量を減らすことができるのでアプリケーションが「速くなる」。

- `import()`:

呼び出されたときに動的に指定のものを読み込む。

webpackは`import()`に遭遇すると自動的にバンドル時にコード・スプリッティングしてくれる。

- `React.lazy`:

> Lazy を使用すると、初めてレンダリングされるまでコンポーネントのコードの読み込みを延期できます。

`React.lazy`は動的importを通常のコンポーネントのように扱う。

lazyには通常`import()`を渡す。

lazyはコンポーネントを返す。このコンポーネントは、それをレンダリングするときに初めて読み込まれる。

`Suspense`の`fallback`プロパティには、lazyのコンポーネントが読み込まれている最中表示されるコンポーネントを渡す。コンポーネントがロード完了したら消える。

注意：lazyを他のコンポーネント内部で宣言しないこと。必ず外で宣言すること。

```JavaScript
import { useState, Suspense, lazy } from 'react';
import Loading from './Loading.js';

const MarkdownPreview = lazy(
    // Thenableを返す関数をここに渡す
    () => delayForDemo(import('./MarkdownPreview.js'))
);

export default function MarkdownEditor() {
  const [showPreview, setShowPreview] = useState(false);
  const [markdown, setMarkdown] = useState('Hello, **world**!');
  return (
    <>
      <textarea value={markdown} onChange={e => setMarkdown(e.target.value)} />
      <label>
        <input type="checkbox" checked={showPreview} onChange={e => setShowPreview(e.target.checked)} />
        Show preview
      </label>
      <hr />
      {showPreview && (
        {/* fallbackに渡しているコンポーネントが、読み込み中に表示されるコンポーネント */}
        <Suspense fallback={<Loading />}>
          <h2>Preview</h2>
          {/*(suspense以下が)レンダリングされるときに読み込まれるコンポーネント */}
          <MarkdownPreview markdown={markdown} />
        </Suspense>
      )}
    </>
  );
}

// Add a fixed delay so you can see the loading state
function delayForDemo(promise) {
  return new Promise(resolve => {
    setTimeout(resolve, 2000);
  }).then(() => promise);
}

```

- `lazy + Suspense` 使いどころ：

https://react.dev/reference/react/Suspense#usage

- コンテンツを読み込んでいる間にフォールバックを表示させたいとき。
- 複数のコンテンツを同時に表示させたいとき。
- ネストされたsuspenseを用意することで、コンテンツがロードされていくにしたがって表示されるフォールバックを変更できる。
- 新しいコンテンツの読み込み中に古いコンテンツを表示する
などなど。


## context

https://legacy.reactjs.org/docs/context.html

props経由で手動でバケツリレーする必要なく、どのレベルにもデータを渡すことができる

when to use context?

NOTE:多くのコンポーネントを経由してpropsを渡すのを避けたいだけならば、`component composition`はシンプルな解決策になりえますとのこと。

バケツリレーの解決策（contextなしの方法）：

上位コンポーネントだけがバケツリレーの到達地点を知っている場合に使うといい。上位コンポーネントは複雑になりがち。

`SomeContext.Consumer`はいつ使うの？

`SomeContext.Provier`はコンポーネントへ値を提供する、`SomeContext.Consumer`は違った方法でcontextの値を読み取る。今は`useContext`が代わる。




以前学習した内容より新しいものはなし。

## compositon vs inheritance

https://legacy.reactjs.org/docs/composition-vs-inheritance.html

Containment:

コンポーネントを返す関数を使って`children`の代わりに`props`にコンポーネントを返す関数を使う手段を使った工夫の話。

Specialization:

classの派生をReactでやる方法みたいな話。

WelcomDialogはDialogの派生というか特別版。

```TypeScript
function Dialog(props) {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">
        {props.title}
      </h1>
      <p className="Dialog-message">
        {props.message}
      </p>
    </FancyBorder>
  );
}

function WelcomeDialog() {
  return (
    <Dialog
      title="Welcome"
      message="Thank you for visiting our spacecraft!" />
  );
}
```

## Error Boundaries

かねてよりReactではJavaSCriptエラーはアプリケーションのクラッシュの原因となっていたが、

React16より、そのエラーが発生したコンポーネントでエラーをキャッチして内容を出力しfallbackＵＩを出力させて、アプリケーションがクラッシュするのを防げるようになった。

エラー・バウンダリーはライフサイクルメソッドやレンダリング中に取得できる。

class component: `getDerivedStateFromError()`, `componentDidCatch`

詳しくは公式のコードを見ると早い。

NOTE: エラー・バウンダリーは子コンポーネントで発生したエラーのみcatchできる。

関数コンポーネントでは？

https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

> 現在、エラー境界を関数コンポーネントとして記述する方法はありません。ただし、エラー境界クラスを自分で記述する必要はありません。たとえば、代わりに、react-error-boundary (サードパーティ製npmパッケージ)を使用できます。

https://github.com/bvaughn/react-error-boundary

``

## `<React.Fragment>`

```TypeScript
<>  // <--これ
  <OneChild />
  <AnotherChild />
</>
```

Reactではrender()が返すコンポーネントは一つのJSXに囲われていないが、

fragmentを使えば結果レンダリングされるときに`<>...</>`はDOM生成されないので

`OneChild`と`AnotherChild`はグループ化されずに済む。

使いどころ：

- 変数にコンポーネントを渡したいときに
- elementをテキストとグループ化したいときに

## High Order Component

省略


## Integrate with Other Libraries

NOTE: React18なので省略

https://legacy.reactjs.org/docs/integrating-with-other-libraries.html

https://react.dev/reference/react/useSyncExternalStore#subscribing-to-an-external-store

> `useSyncExternalStore`は外部のストアにサブスクライブするフックスである。

