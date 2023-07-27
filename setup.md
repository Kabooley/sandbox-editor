# Set up environment

This repository is for project "sandbox-editor" that is portfolio for my recruite.

To develop, application is based on monaco-editor samples/browser-esm-webpack-typescript-react on github.

So to create this environment, begin with that repo.

```bash
cd sandbox-editor
touch package.json .gitignore
echo "node_modules/" >> .gitignore
cp ../monaco-editor-samples/samples/package.json ./package.json
# 同様に`../monaco-editor-samples/samples/browser-esm-webpack-typescript-react/package.json`のdevdependenciesもコピペ
# いらなそうなので`electron`のみ依存関係から削除
yarn
cp ../monaco-editor-samples/samples/browser-esm-webpack-typescript-react/src ./src
cp ../monaco-editor-samples/samples/browser-esm-webpack-typescript-react/webpack.config.js ./webpack.config.js
cp ../monaco-editor-samples/samples/browser-esm-webpack-typescript-react/tsconfig.json ./tsconfig.json


# 実行
npm run start
```

```JSON
{
    "name": "sandbox-editor",
    "scripts": {
        "start": "node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js",
        "build": "NODE_ENV='production' node ./node_modules/webpack/bin/webpack.js --progress"
    },
    "dependencies": {},
    "devDependencies": {
        "@babel/core": "^7.17.0",
        "@babel/preset-env": "^7.16.11",
        "@babel/preset-react": "^7.16.7",
        "@babel/preset-typescript": "^7.16.7",
        "@pmmmwh/react-refresh-webpack-plugin": "^0.5.4",
        "@types/react": "^17.0.39",
        "@types/react-dom": "^17.0.11",
        "babel-loader": "^8.2.3",
        "react": "^17.0.2",
        "react-dom": "^17.0.2",
        "react-refresh": "^0.11.0",
        "css-loader": "^5.2.7",
        "style-loader": "^3.3.1",
        "html-webpack-plugin": "^5.5.0",
        "file-loader": "^6.2.0",
        "glob": "^7.2.0",
        "monaco-editor-webpack-plugin": "^7.0.1",
        "monaco-editor": "^0.32.1",
        "terser-webpack-plugin": "^5.3.1",
        "ts-loader": "^9.2.6",
        "typescript": "^5.0.2",
        "webpack-cli": "^4.9.2",
        "webpack-dev-server": "^4.7.4",
        "webpack": "^5.76.0"
    }
}
```

webpack.config.json

```JavaScript
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: 'development',
    entry: {
        app: './src/index.tsx',
        'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
        'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
        'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
        'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
        'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
    },
    devServer: {
        hot: true,
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
    },
    output: {
        globalObject: 'self',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-typescript',
                                '@babel/preset-react',
                            ],
                            plugins: [
                                isDevelopment &&
                                    require.resolve('react-refresh/babel'),
                            ].filter(Boolean),
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: 'src/index.html',
        }),
        isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
};

```

tsconfig.json

```JSON
{
    "compilerOptions": {
        "sourceMap": true,
        "module": "commonjs",
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
