/******************************************************************
 * Vitest というか js-domはWorkerをサポートしていないので、Workerのインスタンスを生成してテストすることはできない!
 *
 * ただし、workerをモジュールとしてならテストはできる
 * つまりメッセージのやり取りはテストできない。
 *
 ******************************************************************/
import { describe, test, expect, it } from 'vitest';
import type { iFetchLibsApi } from '../../src/worker/fetchLibs.worker';
import { iFetchLibsApi } from '../../src/worker/fetchLibs.worker';

describe('Test fetchLibs.worker.ts', () => {
  beforeEach(() => {});

  test('Check vitest works with WebWorker', async () => {
    const deps = await api.getModuleDependenciesPath('react', '18.2.0');
    //
    console.log(deps);
    expect(deps).not.toHaveLength(0);
  });
});

/*
貴方はwebworkerのテストとECMAScriptのモジュールについて詳しいです。以下の制約条件に従って回答してほしいです

# 制約条件

- webworkerはworkerインスタンスを生成してテストしません
- webworkerファイル（e.g. expensiveCalcurator.worker.ts）はモジュールとしてテストしたいです

テスト対象のwebworkerファイルをモジュールとしてテストしたいです。ただしwebworkerモジュールは何もexportしていません。テストの時だけテスト対象のファイルにテストの都合だけでファイルの中身をexportしてもよいのでしょうか？


Yes, you can modify your Web Worker file to export the necessary content when testing. A common approach is to conditionally export your Web Worker code when in a test environment. This can be achieved by checking for a specific environment variable or flag that you set only during testing. Here’s an example:

In your `expensiveCalculator.worker.ts` file:

```ts
// Example worker code
self.onmessage = function (event) {
  const result = expensiveCalculation(event.data);
  self.postMessage(result);
};

function expensiveCalculation(input: number): number {
  return input * input; // Example function
}

// Conditionally export for testing
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  export { expensiveCalculation };
}
```

When you run your tests, you can set `process.env.NODE_ENV` to `"test"`, which will allow the worker file to export its content. This keeps the exports limited to your test environment while the Web Worker behavior remains the same in production. You can then import and test the `expensiveCalculation` function in your test file without altering the Web Worker behavior outside of testing.
 */
