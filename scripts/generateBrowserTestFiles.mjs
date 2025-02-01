/*********************************************************
 * /browser-test/*.test.tsファイルをrollupでバンドルして
 * /output/へ出力する
 * 出力されたファイルはブラウザテストファイルである
 * *******************************************************/
import { exec } from 'node:child_process';
import { glob } from 'glob';
import path from 'node:path';

const browserTestFilesPattern = path.resolve('./browser-test/*.test.ts');

/**
 * @param {string} pattern
 * @returns {Promise<Array<string>>}
 */
const getTestFilePaths = (pattern) => glob(pattern);

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

  const testFilePaths = await getTestFilePaths(browserTestFilesPattern);

  for (const path of testFilePaths) {
    await generateBrowserTestFile(path);
  }
})();
