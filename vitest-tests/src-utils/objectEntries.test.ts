import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { objectEntries } from '../../src/utils/objectEntries';

const object1 = {
  a: 'somestring',
  b: 42,
};

describe('Test objectEntires()', () => {
  test('Should retrieve from basic object', () => {
    expect(objectEntries<string | number>(object1)).toEqual([
      ['a', 'somestring'],
      ['b', 42],
    ]);
  });
});
