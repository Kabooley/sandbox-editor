import ts from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import OMT from '@surma/rollup-plugin-off-main-thread';
import path from 'node:path';
import { globSync } from 'glob';
// import html from '@rollup/plugin-html';


/**
 * /browser-test/*.test.tsの内、
 * バンドルに含めないファイルのpathをここへ追加する。
 * pathはbrowser-test/以下のpathを登録する
 * e.g. /browser-test/browserTest.test.ts
 * --> browserTest.test.ts
 */ 
const excludeFiles = [path.resolve('./browser-test/browserTest.test.ts')];


const generateHtmlPlugin = () => {

  return {
    /**
     * @param {import('rollup').OutputOptions} options
     * @param {{[fileName: string]: import('rollup').OutputAsset | import('rollup').OutputChunk }} bundle
     *
     * TODO: inputファイル名でのみhtmlファイルを生成する。
     * comlinkを呼出すtestファイルからテストファイルを生成しようとすると、なぜかcomlinkの名称でhtmlファイルが生成される
     *
     * --> 多分bundle引数の一番初めのfileがinputファイルに該当するので、それを必ず渡すようにする
     */
    generateBundle(options, bundle) {
      const scriptTags = [];
      // let inputFilename = '';
      let inputFilename = bundle[Object.keys(bundle)[0]].fileName;
      for (const filename in bundle) {
        const file = bundle[filename];
        console.log(file.fileName);
        console.log(inputFilename);
        if (
          file.isAsset ||
          (file.fileName.endsWith('.js') && !file.fileName.includes('.worker-'))
        ) {
          scriptTags.push(
            `<script src="${file.fileName}" type="module"></script>`
          );
          // inputFilename = file.fileName;
        }
      }
      this.emitFile({
        type: 'asset',
        fileName: path.parse(inputFilename).name + '.html',
        source: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://unpkg.com/mocha/mocha.css" rel="stylesheet" />
        <title>Title</title>
       </head>
      <body>
        <div id="mocha"></div>
        ${scriptTags.join('\n')}
      </body>
      </html>`,
      });
    },
  };
};




/**
 * ボツ案１：
 * この方法だと結局一番初めにcustom pluginへ渡されinputファイルに対してのみhtmlファイルが生成される
 */ 
export default {
  input: Object.fromEntries(
    globSync(path.resolve('./browser-test/**/*.test.ts'))
      .filter((file) => !excludeFiles.includes(file))
      .map((file) => [
        path.relative(
          'browser-test',
          file.slice(0, file.length - path.extname(file).length)
        ),
        file
      ])
  ),
  cache: false,
  output: {
    dir: 'output',
    format: 'es',
  },
  plugins: [
    ts({
      tsconfig: './browser-test/tsconfig.json',
    }),
    commonjs(),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    OMT(),
    generateHtmlPlugin(),
  ],
};



/***
 * ボツ案２：
 * そもそも配列を返してはならないみたい
 */ 
// export default Object.fromEntries(
//     globSync(path.resolve('./browser-test/**/*.test.ts'))
//       .filter((file) => !excludeFiles.includes(file))
//       .map((file) => [
//         path.relative(
//           'browser-test',
//           file.slice(0, file.length - path.extname(file).length)
//         ),
//         file
//       ])
//   ).map(file => ({
//   input: file,
//   cache: false,
//   output: {
//     dir: 'output',
//     format: 'es',
//   },
//   plugins: [
//     ts({
//       tsconfig: './browser-test/tsconfig.json',
//     }),
//     commonjs(),
//     resolve({
//       browser: true,
//       preferBuiltins: false,
//     }),
//     OMT(),
//     generateHtmlPlugin(),
//   ],
// }));