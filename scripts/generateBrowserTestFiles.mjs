/*********************************************************
 * /browser-test/*.test.tsファイルをrollupでバンドルして
 * /output/へ出力する
 * 出力されたファイルはブラウザテストファイルである
 * *******************************************************/
import { exec } from 'node:child_process';
import { globSync } from 'glob';
import path from 'node:path';

const browserTestFilesPattern = path.resolve('./browser-test/*.test.ts');

/**
 * /browser-test/*.test.tsの内、
 * バンドルに含めないファイルのpathをここへ追加する。
 * pathはbrowser-test/以下のpathを登録する
 * e.g. /browser-test/browserTest.test.ts
 * --> browserTest.test.ts
 */
const excludeFiles = [path.resolve('./browser-test/browserTest.test.ts')];

/**
 * @param {string} pattern
 * @returns {Array<string>}
 */
const getTestFilePaths = (pattern) =>
  globSync(pattern).filter((file) => !excludeFiles.includes(file));

/**
 * @param {string} filePath - test file path.
 * @returns {Promise<void>}
 */
const generateBrowserTestFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Generating test file: ${filePath}`);

    const cp = exec(
      `npx rollup --config=rollup.config.mjs --input=${filePath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          reject(
            `Error while running command: "npx rollup --config=rollup.config.mjs --input=${filePath}"`
          );
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      }
    );
    cp.on('close', () => {
      console.log(`Closing exec rollup ${filePath}`);
      resolve();
    });
  });
};

const handleSignal = (s) => {
  process.exit(0);
};

(async () => {
  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);

  const testFilePaths = getTestFilePaths(browserTestFilesPattern);

  console.log(testFilePaths);

  for (const path of testFilePaths) {
    await generateBrowserTestFile(path);
  }
})();
