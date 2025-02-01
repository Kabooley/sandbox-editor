import ts from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import OMT from '@surma/rollup-plugin-off-main-thread';
import path from 'node:path';
// import html from '@rollup/plugin-html';

const generateHtmlPlugin = () => {
  return {
    /**
     * @param {import('rollup').OutputOptions} options
     * @param {{[fileName: string]: import('rollup').OutputAsset | import('rollup').OutputChunk }} bundle
     */
    generateBundle(options, bundle) {
      const scriptTags = [];
      let inputFilename = '';
      for (const filename in bundle) {
        const file = bundle[filename];
        if (
          file.isAsset ||
          (file.fileName.endsWith('.js') && !file.fileName.includes('.worker-'))
        ) {
          scriptTags.push(
            `<script src="${file.fileName}" type="module"></script>`
          );
          inputFilename = file.fileName;
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
        <link href="../../node_modules/mocha/mocha.css" rel="stylesheet" />
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

export default {
  input: '-',
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
