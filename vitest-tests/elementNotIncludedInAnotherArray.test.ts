import { describe, test, expect, assert, beforeAll } from 'vitest';
import { globSync } from 'glob';
import path from 'path';

const elementsNotIncludedInAnotherArray = <T>(arr: T[], compareWith: T[]) => {
  return arr.filter((element) => !compareWith.includes(element));
};

const basicUsageCases: {
  arr: string[];
  compareWith: string[];
  expect: string[];
}[] = [
  {
    arr: ['apple', 'pine', 'grape', 'watermelon'],
    compareWith: ['apple', 'grape'],
    expect: ['pine', 'watermelon'],
  },
];

describe('Test elementsNotIncludedInAnotherArray()', () => {
  let filePaths: string[] = [];
  beforeAll(() => {
      filePaths = globSync(path.resolve('./browser-test/*.test.ts'));
      console.log(filePaths);
  });
  test('Basic usage', () => {
    basicUsageCases.forEach((c) => {
      const results = elementsNotIncludedInAnotherArray<string>(
        c.arr,
        c.compareWith
      );
      expect(results).toEqual(c.expect);
    });
  });

  test('Should exclude `browserTest.test.ts` from results', () => {
    const results = elementsNotIncludedInAnotherArray(filePaths, [
      '/home/teddy/sandbox-editor/browser-test/browserTest.test.ts',
    ]);
    const isFileIncluded = results.every(
      (r) =>
        !r.includes(
          '/home/teddy/sandbox-editor/browser-test/browserTest.test.ts'
        )
    );
      console.log(filePaths);
      console.log(results);
    expect(isFileIncluded).toBe(true);
  });

    test('temporary', () => {
          const files = globSync(path.resolve('./browser-test/**/*.test.ts'))
            .map((file) => file)
            .filter(
              (file) =>
                ![
                  '/home/teddy/sandbox-editor/browser-test/browserTest.test.ts',
                ].includes(file)
          );
        
        console.log(files);
        console.log(path.resolve('./browser-test/browserTest.test.ts'));

        expect(files).toEqual([
          '/home/teddy/sandbox-editor/browser-test/virtualTreePlugin.test.ts',
          '/home/teddy/sandbox-editor/browser-test/indexeddb.test.ts',
          '/home/teddy/sandbox-editor/browser-test/idb-keyval.test.ts',
          '/home/teddy/sandbox-editor/browser-test/fetchLibs_worker.test.ts',
          '/home/teddy/sandbox-editor/browser-test/bundle.worker.test.ts',
        ]);
    })
  
  test('temporary2 ', () => {
    const excludeFiles = [path.resolve('./browser-test/browserTest.test.ts')];
    const results = Object.fromEntries(
      globSync(path.resolve('./browser-test/**/*.test.ts'))
        .filter((file) => !excludeFiles.includes(file))
        .map((file) => [
          path.relative(
            'browser-test',
            file.slice(0, file.length - path.extname(file).length)
          ),
          file
        ])
    );

    console.log(results);
    expect(true).toBe(true);


  });
});
