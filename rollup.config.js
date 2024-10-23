import ts from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import OMT from '@surma/rollup-plugin-off-main-thread';
// import html from '@rollup/plugin-html';

const generateHtmlPlugin = () => {
  return {
    generateBundle(options, bundle) {
      const scriptTags = [];
      for (const filename in bundle) {
        const file = bundle[filename];
        if (
          file.isAsset ||
          (file.fileName.endsWith('.js') && !file.fileName.includes('.worker'))
        ) {
          scriptTags.push(
            `<script src="${file.fileName}" type="module"></script>`
          );
        }
      }
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
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
      tsconfig: './browser-test/tsconfig.browser-test.json',
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
