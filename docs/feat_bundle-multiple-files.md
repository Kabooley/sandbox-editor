# esbuild のマルチ・ファイル・バンドリングの実現について

今のところ npm パッケージを unpkg から拾ってくる機能はついてる。

本アプリケーションはマルチファイルを編集可能なのでマルチファイルをすべ一つにバンドリングするようにする機能を実装する。

TODO: 何を実現しているのか初めて見る人にわかるようにまとめること

TODO: ノートの転記。必要な情報なのか検証していないので要検証

## esbuild でマルチファイルをバンドルする方法

codesandbox の draft

https://codesandbox.io/s/esbuild-wasm-bundle-multil-files

-   esbuild の基礎の復習
-   esbuild api の学習
-   仮想ファイルの内容をバンドルする方法の模索

```bash
false
initializing...
initialized
[unpkgPathPlugins] onResolve:`filter: /(^index.js$)/`
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react-dom/client", importer: "index.js", namespace: "a", resolveDir: "", kind: "import-statement"…}
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react", importer: "index.js", namespace: "a", resolveDir: "", kind: "import-statement"…}
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "bulma/css/bulma.css", importer: "index.js", namespace: "a", resolveDir: "", kind: "import-statement"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react-dom/client
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react
[unpkgPathPlugin] onLoad packages :https://unpkg.com/bulma/css/bulma.css
[unpkgPathPlugin] onResolve `filter: /^.+//`
{path: "./cjs/react.development.js", importer: "https://unpkg.com/react", namespace: "a", resolveDir: "/react@18.2.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react@18.2.0/cjs/react.development.js
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react-dom", importer: "https://unpkg.com/react-dom/client", namespace: "a", resolveDir: "/react-dom@18.2.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react-dom
[unpkgPathPlugin] onResolve `filter: /^.+//`
{path: "./cjs/react-dom.development.js", importer: "https://unpkg.com/react-dom", namespace: "a", resolveDir: "/react-dom@18.2.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react-dom@18.2.0/cjs/react-dom.development.js
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react", importer: "https://unpkg.com/react-dom@18.2.0/cjs/react-dom.development.js", namespace: "a", resolveDir: "/react-dom@18.2.0/cjs", kind: "require-call"…}
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "scheduler", importer: "https://unpkg.com/react-dom@18.2.0/cjs/react-dom.development.js", namespace: "a", resolveDir: "/react-dom@18.2.0/cjs", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/scheduler
[unpkgPathPlugin] onResolve `filter: /^.+//`
{path: "./cjs/scheduler.development.js", importer: "https://unpkg.com/scheduler", namespace: "a", resolveDir: "/scheduler@0.23.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/scheduler@0.23.0/cjs/scheduler.development.js
{errors: Array(0), warnings: Array(0), outputFiles: Array(1), metafile: undefined, mangleCache: undefined}
​
```

```TypeScript
import * as esbuild from "esbuild-wasm";

export const unpkgPathPlugin = (): esbuild.Plugin => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {

      // 例：
      build.onResolve(
        //
        // `index.js`というpathに出くわした場合...
        //
        { filter: /(^index\.js$)/ },
        (args: esbuild.OnResolveArgs) => {

          if (args.path === "index.js") {
            return { path: args.path, namespace: "a" };
          }
        }
      );

      // Solves related path
      build.onResolve({ filter: /^\.+\// }, (args: esbuild.OnResolveArgs) => {

        return {
          namespace: "a",
          path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
            .href
        };
      });

      // Solves other path
      build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {

        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`
        };
      });
    }
  };
};
```

```TypeScript
// ...

export const fetchPlugins = (inputCode: string): esbuild.Plugin => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // Fetches modules on entry point file
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: "jsx",
          contents: inputCode
        };
      });

      // Check cached module
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        // Anyway load cached data.
        const cachedResult = await cacheDB.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (!cachedResult) {
          return;
        }
        return cachedResult;
      });

      // CSS Modules will be embeded to HTML as style tag
      build.onLoad(
        { filter: /\S+\.css$/ },
        async (args: esbuild.OnLoadArgs) => {
          // DEBUG:
          console.log("[unpkgPathPlugin] onLoad packages :" + args.path);

          let result: esbuild.OnLoadResult = {};
          const { data, request } = await axios.get(args.path);

          const escaped = data
            .replace(/\n/g, "")
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
          const content = `
                    const style = document.createElement("style");
                    style.innerText = '${escaped}';
                    document.head.appendChild(style);
                `;

          result = {
            loader: "jsx",
            contents: content,
            resolveDir: new URL("./", request.responseURL).pathname
          };
          cacheDB.setItem<esbuild.OnLoadResult>(args.path, result);
          return result;
        }
      );

      // `/.*/`: すべての文字列に一致する
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        // DEBUG:
        console.log("[unpkgPathPlugin] onLoad packages :" + args.path);

        let result: esbuild.OnLoadResult = {};

        const { data, request } = await axios.get(args.path);

        result = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname
        };
        cacheDB.setItem<esbuild.OnLoadResult>(args.path, result);
        return result;
      });
    }
  };
};


```

-   esbuild が entry ポイントのファイルを走査し、`import/require`を見つける
-   import/require で指定されている path を解決するために onResolve へ送信する
-

onResolveArgs:

importer:

> これは、解決されるこのインポートを含むモジュールのパスです。このパスは、名前空間が file の場合にのみファイルシステムパスであることが保証されることに注意してください。インポーター モジュールを含むディレクトリに対する相対パスを解決したい場合は、仮想モジュールでも機能するため、代わりに solveDir を使用する必要があります。

resolveDir:

> これは、インポート パスをファイル システム上の実際のパスに解決するときに使用するファイル システム ディレクトリです。モジュールが`file` namespace 内のモジュールの場合、この値はデフォルトでモジュール パスのディレクトリ部分になります。仮想モジュールの場合、この値はデフォルトで空ですが、`onLoad Callback`はオプションで仮想モジュールに解決ディレクトリを与えることもできます。その場合、そのファイル内の未解決のパスのコールバックを解決するために提供されます。

onResolveResults:

-   path:

> インポートを特定のパスに解決するには、これを空ではない文字列に設定します。これが設定されている場合、このモジュールのこのインポート パスに対して onResolve callback は実行されなくなります。これが設定されていない場合、esbuild は現在のコールバックの後に登録された on-resolve コールバックを引き続き実行します。その後、パスがまだ解決されない場合、esbuild はデフォルトで、現在のモジュールの解決ディレクトリに相対的なパスを解決します。

-   external:

> このプロパティを true にするとそのモジュールはバンドルに含まれずに、代わりに実行時に import されることになる

-   namespace:

> 設定しないとデフォルトで`file`になる

つまり filesystem が前提になるので、ブラウザでは常にデフォルト以外を設定しないといけない

> ファイル システム パスではないパスに解決したい場合は、名前空間をファイルまたは空の文字列以外の値に設定する必要があります。これにより、パスがファイル システム上の何かを指すものとして扱われないように esbuild に指示されます。

-   errors and warnings

> path 解決中に発生したエラーをログに記録したいときに使う

#### esbuild.buildoptions

参考

https://github.com/evanw/esbuild/issues/1952

#### loader

https://esbuild.github.io/api/#loader

たとえば typescript + react なら、

`tsx`, `ts`, `js`, `jsx`, 他アセットの拡張子などを扱う。

予め扱うファイルの種類を想定できれば適切にバンドルできるけど、

想定外のファイルを扱うことにした場合、バンドル出来ないということかしら？

#### 予め仮想ファイルの tree オブジェクトを渡して解決しておくプラグイン検証

https://github.com/evanw/esbuild/issues/1952#issuecomment-1020006960

検証中。
