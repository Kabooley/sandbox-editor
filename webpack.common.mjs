import path from 'path';
import { createRequire } from 'node:module';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  entry: {
    index: './src/index.tsx',
    'fetchLibs.worker': './src/worker/fetchLibs.worker.ts',
    'bundle.worker': './src/worker/bundle.worker.ts',

    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
    'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
    'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
  resolve: {
    extensions: ['.*', '.js', '.jsx', '.tsx', '.ts'],
  },
  output: {
    globalObject: 'self',
    filename: '[name].bundle.js',
    path: path.resolve(import.meta.dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            // to convert require.resolve() in esm,
            // should use import.meta.resolve()
            // https://nodejs.org/api/esm.html#no-requireresolve
            // loader: require.resolve('babel-loader'),
            // loader: import.meta.resolve('babel-loader'),
            // loader: 'babel-loader',
            loader: createRequire(import.meta.url).resolve('babel-loader'),
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
                '@babel/preset-react',
              ],
              plugins: [
                isDevelopment &&
                  createRequire(import.meta.url).resolve('react-refresh/babel'),
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
