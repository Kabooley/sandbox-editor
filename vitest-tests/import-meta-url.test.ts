import { describe, test, expect, assert } from 'vitest';

describe('Make sure how to use import.meta.url()', () => {
  test('resolve babel-loader', () => {
    const babelLoader = import.meta.resolve('babel-loader');
    console.log(babelLoader);
    assert.fail();
  });
});
