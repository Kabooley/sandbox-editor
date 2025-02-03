/********************************************************************
 *
 * ******************************************************************/
import { describe, test, expect, afterAll, beforeAll, assert } from 'vitest';
import puppeteer from 'puppeteer';
import path from 'node:path';
import { globSync } from 'glob';
import type { iSuite, iTest } from './utils/reportBrowserTest';
import type { Page } from 'puppeteer';


/**
 * Get test report sent from browser.
 */ 
const getReportBrowserTest = (page: Page) => {
    return new Promise<iSuite[]>((resolve, reject) => {
        page
        .on('request', (req) => {
            // req.method()でPOSTリクエストを見分けられる
            // req.fetchPostData()で多分POSTリクエストのデータを取得できる
            if (req.method() === 'POST') {
                req.fetchPostData().then((r) => {
                    if (r !== undefined) {
                        try {
                            const report: iSuite[] = JSON.parse(r);
                            resolve(report)
                        }
                        catch(e) {
                            reject(e);
                        }
                    }
                });
            }
        });
    })
}

/**
 * test用サーバを起動し
 * test()毎puppeteerを使って各testページへアクセスし
 * サーバから返されたテストファイルをブラウザで実行させ、
 * 実行結果のレポートをテストする。
 *
 * PREREQUISITIES:
 * - /test/browser/server.mjsがテストサーバであり、このサーバが事前に起動していること
 * - /test/browser/server.mjsのサーバＵＲＬがlocalhost:3000であること
 * - /test/browser/utils/postTestStatus.tsがテストレポートをテストサーバへ向けてPOSTしていること。
 * - ブラウザテストファイルは/output/へ出力されている
 */
describe('Browser test', () => {
    const browserTestFilePathsPattern = path.resolve('./output/*');
    const port = 3000;
    const paths = globSync(browserTestFilePathsPattern).filter(
        (p) => path.extname(p) === '.html'
    );
    let browser: import('puppeteer').Browser | null = null;

    beforeAll(async () => {
        browser = await puppeteer.launch();
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
            browser = null;
        }
    });

    test(`Test server should be running.`, async () => {
        if (!browser) {
            assert.fail('browser instance is not defined');
        }

        const page = await browser.newPage();
        await page.goto('http://localhost:' + port);
        expect(await page.title()).toBe('--- Browser Test ---');
    });

    /**
     * ブラウザテストをひとつずつ実行して
     * 各テストのtest()がすべてpassしたことを確認する
     */
    test.each(paths)('Test %s should be all passed', async (p) => {
        if (!browser) {
            assert.fail('Error: browser instance is not defined');
        }

        const page = await browser.newPage();
        await page.goto(
            'http://localhost:' + port + '/' + path.parse(p).base
        );

        return getReportBrowserTest(page)
        .then((report: iSuite[]) => {
            // pageはテストページにアクセスしている
            // expect(await page.title()).toBe('Title');
            // reportは定義されている
            assert.isDefined(report);
            for (const suite of report) {
                console.log(suite.title);
                for (const test of suite.tests) {
                    console.log(test.title, test.state);
                    assert.strictEqual(
                        test.state,
                        'passed'
                    );
                }
            }
        })
        .catch(e => {
            console.error(e);
            assert.fail();
        });
    });
});
