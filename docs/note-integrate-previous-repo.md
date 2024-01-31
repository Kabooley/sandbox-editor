# Integrate previous repositpry project

## Copy previous repository

`webpack5-react18`の`feat_integrate_filedata`ブランチのsrc/をコピーして、react18からreact17にしたのでそれを反映させた。

現状prettierが読み取れないことを抜かすと前のリポジトリ通りの動きをしている。

## tsconfig.json: Change "module": "commonjs" to "module": "es2020"

commonjsのままだとうまくいかないところあり。

例：

```TypeScript
// Error `import.meta.url`
this._bundleWorker = new Worker(
    new URL('/src/worker/bundle.worker.ts', import.meta.url),
    { type: 'module' }
);
```

`The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.ts(1343`

```diff
{
    "compilerOptions": {
        "sourceMap": true,
-        "module": "commonjs",
+        "module": "es2020",
        "moduleResolution": "node",
        "strict": true,
        "target": "ES6",
        "outDir": "./dist",
        "lib": ["dom", "es5", "es6", "es2015.collection", "es2015.promise"],
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

この変化は問題をもたらすか？

大丈夫っぽい。

