const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: 'development',
    entry: {
        index: './src/index.tsx',
        asshole: './src/worker/fetchLibsARRR.worker.ts',
        'bundle.worker': './src/worker/bundle.worker.ts',

        'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
        'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
        'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
        'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
        'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
    },
    devServer: {
        static: './dist',
        hot: true,
        port: 8080,
        allowedHosts: 'auto',
        // DEBUG:
        // Only for development mode
        headers: {
            'Access-Control-Allow-Origin': '*', // unpkg.com
            // 'Access-Control-Allow-Origin': 'unpkg.com',		// unpkg.com
            'Access-Control-Allow-Headers': '*', // GET
            'Access-Control-Allow-Methods': '*',
        },
        client: {
            overlay: false,
        },
    },
    resolve: {
        extensions: ['.*', '.js', '.jsx', '.tsx', '.ts'],
    },
    output: {
        // globalObject: 'self',
        globalObject: 'this',
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
                test: /\.(sa|sc|c)ss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
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
