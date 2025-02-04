/*****************************************************************
 *
 * ```bash
 * $ node /browser-test/server.mjs
 * ```
 * 
 * - TODO: rollup.config.mjsのhtml生成を修正する必要がある。
 * 今のところ*.worker.tsのテストファイルに対してhtmlファイルを出力していない
 * ***************************************************************/
import express from 'express';
import path from 'path';
import { globSync } from 'glob';

const mimeTypes = new Map(
    Object.entries({
        '.css': 'text/css',
        '.html': 'text/html',
        '.jpg': 'image/jpeg',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
    })
);

const app = express();
const port = 3000;
const testFilePathPattern = path.resolve('./output/*');

/**
 * テストファイルのpath配列
 */
let testFilePaths = globSync(testFilePathPattern);


app.use(express.static(import.meta.dirname));
app.use(express.static(path.resolve('./output/')));
app.use(express.static(path.resolve('./browser-test/')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(import.meta.dirname, 'index.html'));
});

/**
 * テストファイル要求リクエスト対応
 *
 * /output/*.test.htmlまたは/output/*.test.jsを提供する
 */
app.get('/:name', (req, res) => {
    const parsedURL = new URL(req.url, 'https://localhost');
    const pathName = parsedURL.pathname;

    // :nameが/output/の実在のファイル名と一致することの確認
    const existFile = testFilePaths.find((testFilePath) =>
        testFilePath.includes(pathName)
    );

    if (existFile) {
        const contentType =
            mimeTypes.get(path.extname(existFile)) || 'text/plain';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).end(existFile, 'utf8');
    } else {
        res.status(404).end('Not found');
    }
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

/**
 * ブラウザテストの結果出力
 *
 * クライアントのブラウザテストファイルから
 * テスト経過と結果がPOSTされてくるので
 * ここでターミナルに出力させる。
 */

app.post('/suite-root-end', (req, res) => {
    console.log('SUITE ROOT END');
    res.status(200).end();
});
app.post('/suite-root', (req, res) => {
    console.log('START');
    res.status(200).end();
});
app.post('/suite-end', (req, res) => {
    if (req.headers['content-type'] === 'application/json') {
        const { title, status } = req.body;
        if (title && status) {
            switch (status) {
                case 'failed': {
                    console.log('Failed: ', title);
                    break;
                }
                case 'passed': {
                    console.log('Passed: ', title);
                    break;
                }
                default:
                    break;
            }
        }
    }
    res.status(200).end();
});
app.post('/suite', (req, res) => {
    if (req.headers['content-type'] === 'application/json') {
        const { title } = req.body;
        if (title !== undefined) {
            console.log('suite: ', title);
        }
    }
    res.status(200).end();
});
app.post('/test-end', (req, res) => {
    if (req.headers['content-type'] === 'application/json') {
        const { title, status } = req.body;
        if (title && status) {
            switch (status) {
                case 'failed': {
                    console.log('Failed: ', title);
                    break;
                }
                case 'passed': {
                    console.log('Passed: ', title);
                    break;
                }
                default:
                    break;
            }
        }
    }
    res.status(200).end();
});
app.post('/test', (req, res) => {
    if (req.headers['content-type'] === 'application/json') {
        const { title } = req.body;
        if (title !== undefined) {
            console.log('test: ', title);
        }
    }
    res.status(200).end();
});
app.post('/fail', (req, res) => {
    console.error('fail:');
    res.status(200).end();
});
app.post('/end', (req, res) => {
    console.error('END');
    res.status(200).end();
});
