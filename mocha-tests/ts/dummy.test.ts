import { equal } from 'node:assert';
import { describe, test } from 'mocha';
import { dummy } from './dummy.js';

describe('test dummy', () => {
  test('test 1', () => {
    equal(dummy(), true);
  });
});
